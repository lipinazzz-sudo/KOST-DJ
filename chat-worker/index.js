import { DurableObject } from "cloudflare:workers";

const ALLOWED_ORIGIN = "https://lipinazzz-sudo.github.io";
const ROOM_NAME = "global";
const MAX_MESSAGE_LENGTH = 500;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const RATE_LIMIT_MS = 800;

function json(data, status = 200, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
      "cache-control": "no-store"
    }
  });
}

function cleanText(value) {
  return String(value == null ? "" : value).trim();
}

function safeOrigin(request) {
  const origin = request.headers.get("Origin") || "";
  return origin === ALLOWED_ORIGIN ? origin : ALLOWED_ORIGIN;
}

async function validateSession(env, auth) {
  const role = cleanText(auth && auth.role).toLowerCase();
  const tenantId = cleanText(auth && auth.tenantId);
  const masterId = cleanText(auth && auth.masterId);
  const sessionToken = cleanText(auth && auth.sessionToken);

  if (!sessionToken) {
    return { ok: false, error: "Session chat tidak valid." };
  }

  let payload;

  if (role === "tenant") {
    if (!tenantId) {
      return { ok: false, error: "Tenant ID tidak ditemukan." };
    }

    payload = {
      action: "tenantdashboard",
      tenantId,
      sessionToken
    };
  } else if (role === "master") {
    if (!masterId) {
      return { ok: false, error: "Master ID tidak ditemukan." };
    }

    payload = {
      action: "masterdashboard",
      masterId,
      sessionToken
    };
  } else {
    return { ok: false, error: "Role chat tidak valid." };
  }

  let response;
  try {
    response = await fetch(env.AUTH_API_URL, {
      method: "POST",
      headers: {
        "content-type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    return { ok: false, error: "Server autentikasi tidak dapat dihubungi." };
  }

  let result;
  try {
    result = await response.json();
  } catch (error) {
    return { ok: false, error: "Respons autentikasi tidak valid." };
  }

  if (!result || result.ok !== true) {
    return {
      ok: false,
      error: cleanText(result && result.error) || "Sesi tidak valid."
    };
  }

  const data = result.data || {};

  if (role === "tenant") {
    const room =
      cleanText(data.kamar) ||
      cleanText(data.kamarFinal) ||
      cleanText(data.room) ||
      cleanText(data.noKamar) ||
      "";

    return {
      ok: true,
      role: "tenant",
      tenantId,
      displayName: room || tenantId,
      room: room || tenantId
    };
  }

  return {
    ok: true,
    role: "master",
    masterId,
    displayName: "Master",
    room: ""
  };
}

export default {
  async fetch(request, env) {
    const origin = safeOrigin(request);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": origin,
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type"
        }
      });
    }

    if (request.headers.get("Origin") !== ALLOWED_ORIGIN) {
      return json(
        { ok: false, error: "Origin tidak diizinkan." },
        403,
        origin
      );
    }

    const upgrade = request.headers.get("Upgrade") || "";

    if (upgrade.toLowerCase() !== "websocket") {
      return json(
        {
          ok: true,
          service: "DJ Family Kost Live Chat",
          websocket: true
        },
        200,
        origin
      );
    }

    const id = env.CHAT_ROOM.idFromName(ROOM_NAME);
    const stub = env.CHAT_ROOM.get(id);

    return stub.fetch(
      new Request(
        "https://chat-room.internal" + new URL(request.url).pathname,
        {
          method: "GET",
          headers: request.headers
        }
      )
    );
  }
};

export class ChatRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.env = env;
    this.sessions = new Map();

    this.ctx.getWebSockets().forEach((ws) => {
      const attachment = ws.deserializeAttachment();
      if (attachment) {
        this.sessions.set(ws, attachment);
      }
    });

    this.ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at INTEGER NOT NULL,
        sender_key TEXT NOT NULL,
        role TEXT NOT NULL,
        display_name TEXT NOT NULL,
        message TEXT NOT NULL,
        deleted INTEGER NOT NULL DEFAULT 0,
        deleted_by TEXT NOT NULL DEFAULT ''
      );

      CREATE INDEX IF NOT EXISTS idx_messages_created
      ON messages(created_at);

      CREATE TABLE IF NOT EXISTS muted_tenants (
        tenant_id TEXT PRIMARY KEY,
        muted INTEGER NOT NULL DEFAULT 1,
        updated_at INTEGER NOT NULL,
        updated_by TEXT NOT NULL
      );
    `);

    this.ctx.storage.setAlarm(
      Date.now() + 24 * 60 * 60 * 1000
    );
  }

  async fetch(request) {
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.ctx.acceptWebSocket(server);

    const pending = {
      authenticated: false,
      role: "",
      tenantId: "",
      masterId: "",
      displayName: ""
    };

    server.serializeAttachment(pending);
    this.sessions.set(server, pending);

    try {
      server.send(
        JSON.stringify({
          type: "hello",
          service: "DJ Family Kost Live Chat"
        })
      );
    } catch (error) {}

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }

  async webSocketMessage(ws, rawMessage) {
    let payload;

    try {
      payload = JSON.parse(
        typeof rawMessage === "string"
          ? rawMessage
          : new TextDecoder().decode(rawMessage)
      );
    } catch (error) {
      this.safeSend(ws, {
        type: "error",
        message: "Format pesan tidak valid."
      });
      return;
    }

    const session =
      this.sessions.get(ws) ||
      ws.deserializeAttachment();

    if (!session) {
      this.closeSocket(ws, 1008, "Session tidak tersedia.");
      return;
    }

    if (!session.authenticated) {
      if (payload.type !== "auth") {
        this.closeSocket(
          ws,
          1008,
          "Autentikasi chat diperlukan."
        );
        return;
      }

      const auth = await validateSession(
        this.env,
        payload
      );

      if (!auth.ok) {
        this.safeSend(ws, {
          type: "auth_error",
          message: auth.error
        });
        this.closeSocket(ws, 1008, "Autentikasi gagal.");
        return;
      }

      const authenticated = {
        authenticated: true,
        role: auth.role,
        tenantId: auth.tenantId || "",
        masterId: auth.masterId || "",
        displayName: auth.displayName,
        room: auth.room || "",
        lastMessageAt: 0
      };

      ws.serializeAttachment(
        authenticated
      );
      this.sessions.set(
        ws,
        authenticated
      );

      this.cleanupOldMessages();
      this.sendSnapshot(ws);
      this.broadcastParticipants();
      return;
    }

    if (payload.type === "send") {
      await this.handleTenantMessage(
        ws,
        session,
        payload
      );
      return;
    }

    if (
      session.role === "master" &&
      payload.type === "delete"
    ) {
      this.handleMasterDelete(
        session,
        payload
      );
      return;
    }

    if (
      session.role === "master" &&
      payload.type === "mute"
    ) {
      this.handleMasterMute(
        session,
        payload,
        true
      );
      return;
    }

    if (
      session.role === "master" &&
      payload.type === "unmute"
    ) {
      this.handleMasterMute(
        session,
        payload,
        false
      );
      return;
    }

    if (payload.type === "refresh") {
      this.cleanupOldMessages();
      this.sendSnapshot(ws);
      return;
    }
  }

  async handleTenantMessage(ws, session, payload) {
    if (session.role !== "tenant") {
      this.safeSend(ws, {
        type: "error",
        message: "Hanya tenant yang dapat mengirim pesan tenant."
      });
      return;
    }

    const muted = this.isMuted(
      session.tenantId
    );

    if (muted) {
      this.safeSend(ws, {
        type: "muted",
        muted: true,
        message:
          "Chat Anda sementara dinonaktifkan oleh Master."
      });
      return;
    }

    const now = Date.now();

    if (
      session.lastMessageAt &&
      now - session.lastMessageAt < RATE_LIMIT_MS
    ) {
      this.safeSend(ws, {
        type: "error",
        message:
          "Tunggu sebentar sebelum mengirim pesan berikutnya."
      });
      return;
    }

    const text = cleanText(payload.message);

    if (!text) {
      return;
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      this.safeSend(ws, {
        type: "error",
        message:
          "Pesan maksimal " +
          MAX_MESSAGE_LENGTH +
          " karakter."
      });
      return;
    }

    session.lastMessageAt = now;

    ws.serializeAttachment(session);
    this.sessions.set(ws, session);

    this.cleanupOldMessages();

    this.ctx.storage.sql.exec(
      `
        INSERT INTO messages
        (
          created_at,
          sender_key,
          role,
          display_name,
          message,
          deleted,
          deleted_by
        )
        VALUES (?, ?, ?, ?, ?, 0, '')
      `,
      now,
      session.tenantId,
      "tenant",
      session.displayName,
      text
    );

    this.broadcastLatestMessage();
  }

  handleMasterDelete(session, payload) {
    const id = Number(payload.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return;
    }

    const row = this.ctx.storage.sql
      .exec(
        `
          SELECT id
          FROM messages
          WHERE id = ?
            AND deleted = 0
          LIMIT 1
        `,
        id
      )
      .toArray()[0];

    if (!row) {
      return;
    }

    this.ctx.storage.sql.exec(
      `
        UPDATE messages
        SET
          message = '',
          deleted = 1,
          deleted_by = 'Master'
        WHERE id = ?
      `,
      id
    );

    this.broadcast({
      type: "message_deleted",
      id,
      message: "Pesan dihapus oleh Master."
    });
  }

  handleMasterMute(session, payload, muted) {
    const tenantId =
      cleanText(payload.tenantId)
        .toUpperCase();

    if (
      !tenantId ||
      !/^TEN-[0-9]+$/.test(tenantId)
    ) {
      return;
    }

    const now = Date.now();

    this.ctx.storage.sql.exec(
      `
        INSERT INTO muted_tenants
        (
          tenant_id,
          muted,
          updated_at,
          updated_by
        )
        VALUES (?, ?, ?, 'Master')
        ON CONFLICT(tenant_id)
        DO UPDATE SET
          muted = excluded.muted,
          updated_at = excluded.updated_at,
          updated_by = excluded.updated_by
      `,
      tenantId,
      muted ? 1 : 0,
      now
    );

    this.broadcast({
      type: "mute_changed",
      tenantId,
      muted,
      message: muted
        ? tenantId +
          " dinonaktifkan dari chat oleh Master."
        : tenantId +
          " diaktifkan kembali untuk chat."
    });
  }

  isMuted(tenantId) {
    const row = this.ctx.storage.sql
      .exec(
        `
          SELECT muted
          FROM muted_tenants
          WHERE tenant_id = ?
          LIMIT 1
        `,
        tenantId
      )
      .toArray()[0];

    return Boolean(
      row &&
      Number(row.muted) === 1
    );
  }

  sendSnapshot(ws) {
    const since =
      Date.now() -
      RETENTION_MS;

    const messages =
      this.ctx.storage.sql
        .exec(
          `
            SELECT
              id,
              created_at AS createdAt,
              sender_key AS senderKey,
              role,
              display_name AS displayName,
              message,
              deleted,
              deleted_by AS deletedBy
            FROM messages
            WHERE created_at >= ?
            ORDER BY id ASC
          `,
          since
        )
        .toArray()
        .map((row) => ({
          id: Number(row.id),
          createdAt: Number(row.createdAt),
          senderKey: row.senderKey,
          role: row.role,
          displayName: row.displayName,
          message: row.deleted
            ? "Pesan dihapus oleh Master."
            : row.message,
          deleted: Number(row.deleted) === 1,
          deletedBy: row.deletedBy || ""
        }));

    const session =
      this.sessions.get(ws) ||
      ws.deserializeAttachment() ||
      {};

    this.safeSend(ws, {
      type: "snapshot",
      messages,
      muted:
        session.role === "tenant"
          ? this.isMuted(session.tenantId)
          : false,
      participants:
        session.role === "master"
          ? this.getParticipants()
          : []
    });
  }

  broadcastLatestMessage() {
    const row =
      this.ctx.storage.sql
        .exec(
          `
            SELECT
              id,
              created_at AS createdAt,
              sender_key AS senderKey,
              role,
              display_name AS displayName,
              message
            FROM messages
            WHERE id = (
              SELECT MAX(id)
              FROM messages
            )
          `
        )
        .toArray()[0];

    if (!row) {
      return;
    }

    this.broadcast({
      type: "message",
      message: {
        id: Number(row.id),
        createdAt: Number(row.createdAt),
        senderKey: row.senderKey,
        role: row.role,
        displayName: row.displayName,
        message: row.message,
        deleted: false
      }
    });
  }

  getParticipants() {
    const seen = {};

    for (const [ws, session] of this.sessions) {
      if (
        !session ||
        !session.authenticated
      ) {
        continue;
      }

      if (session.role === "tenant") {
        seen[session.tenantId] = {
          tenantId: session.tenantId,
          displayName: session.displayName,
          muted: this.isMuted(session.tenantId)
        };
      }
    }

    return Object.values(seen)
      .sort((a, b) =>
        String(a.displayName).localeCompare(
          String(b.displayName),
          "id"
        )
      );
  }

  broadcastParticipants() {
    const participants =
      this.getParticipants();

    for (const [ws, session] of this.sessions) {
      if (
        session &&
        session.authenticated &&
        session.role === "master"
      ) {
        this.safeSend(ws, {
          type: "participants",
          participants
        });
      }
    }
  }

  broadcast(data) {
    for (const ws of this.ctx.getWebSockets()) {
      this.safeSend(ws, data);
    }
  }

  safeSend(ws, data) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
      }
    } catch (error) {}
  }

  closeSocket(ws, code, reason) {
    try {
      ws.close(code, reason);
    } catch (error) {}
  }

  webSocketClose(ws) {
    this.sessions.delete(ws);
    this.broadcastParticipants();
  }

  webSocketError(ws) {
    this.sessions.delete(ws);
    this.broadcastParticipants();
  }

  async alarm() {
    this.cleanupOldMessages();

    this.ctx.storage.setAlarm(
      Date.now() + 24 * 60 * 60 * 1000
    );
  }

  cleanupOldMessages() {
    const cutoff =
      Date.now() -
      RETENTION_MS;

    this.ctx.storage.sql.exec(
      `
        DELETE FROM messages
        WHERE created_at < ?
      `,
      cutoff
    );
  }
}
