(() => {
  "use strict";

  const CHAT_API_URL =
    "https://dj-family-kost-chat.mahjongjong.workers.dev";

  const CHAT_SOCKET_URL =
    CHAT_API_URL.replace(/^http/, "ws");

  const role =
    document.body.dataset.chatRole === "master"
      ? "master"
      : "tenant";

  let socket = null;
  let connected = false;
  let authenticated = false;
  let muted = false;
  let unread = 0;
  let reconnectTimer = null;
  let manuallyClosed = false;
  let participants = [];
  let messages = [];

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getSession() {
    const raw =
      role === "master"
        ? sessionStorage.getItem("djMasterSession")
        : sessionStorage.getItem("djTenantSession");

    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function addStyles() {
    if (document.getElementById("djChatStyles")) return;

    const style = document.createElement("style");
    style.id = "djChatStyles";
    style.textContent = `
      #djChatBubble{
        position:fixed;
        right:22px;
        bottom:22px;
        width:54px;
        height:54px;
        border:0;
        border-radius:50%;
        background:#10182d;
        color:#fff;
        box-shadow:0 14px 35px rgba(16,24,45,.22);
        cursor:pointer;
        z-index:9998;
        font-size:24px;
      }

      #djChatUnread{
        position:absolute;
        top:-3px;
        right:-3px;
        min-width:20px;
        height:20px;
        padding:0 5px;
        border-radius:999px;
        background:#d92d20;
        color:#fff;
        border:2px solid #fff;
        font-size:10px;
        font-weight:900;
        display:none;
        align-items:center;
        justify-content:center;
      }

      #djChatPanel{
        position:fixed;
        right:22px;
        bottom:88px;
        width:min(440px,calc(100vw - 28px));
        height:min(650px,calc(100vh - 120px));
        background:#fff;
        border:1px solid #e4e7ec;
        border-radius:20px;
        box-shadow:0 24px 70px rgba(16,24,45,.22);
        overflow:hidden;
        display:none;
        flex-direction:column;
        z-index:9999;
      }

      #djChatPanel.open{
        display:flex;
      }

      .dj-chat-head{
        padding:15px 16px;
        background:#10182d;
        color:#fff;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }

      .dj-chat-head-title{
        font-size:15px;
        font-weight:900;
      }

      .dj-chat-head-sub{
        font-size:11px;
        opacity:.78;
        margin-top:3px;
      }

      .dj-chat-close{
        width:34px;
        height:34px;
        border:0;
        border-radius:10px;
        background:rgba(255,255,255,.10);
        color:#fff;
        cursor:pointer;
        font-size:18px;
      }

      .dj-chat-body{
        flex:1;
        min-height:0;
        display:flex;
        flex-direction:column;
      }

      .dj-chat-stream{
        flex:1;
        min-height:0;
        overflow:auto;
        padding:14px;
        background:#f7f8fa;
      }

      .dj-chat-message{
        margin-bottom:10px;
      }

      .dj-chat-meta{
        font-size:10px;
        font-weight:900;
        color:#667085;
        margin-bottom:4px;
      }

      .dj-chat-bubble{
        display:inline-block;
        max-width:92%;
        padding:9px 11px;
        border-radius:12px;
        background:#fff;
        border:1px solid #e4e7ec;
        color:#17213b;
        white-space:pre-wrap;
        word-break:break-word;
        line-height:1.5;
        font-size:13px;
      }

      .dj-chat-message.mine .dj-chat-bubble{
        box-shadow:0 0 0 1px rgba(0,0,0,.02);
      }

      .dj-chat-message.deleted .dj-chat-bubble{
        color:#98a2b3;
        font-style:italic;
        background:#f2f4f7;
      }

      .dj-chat-actions{
        margin-top:5px;
      }

      .dj-chat-delete{
        border:0;
        background:none;
        color:#b42318;
        font-size:10px;
        font-weight:800;
        cursor:pointer;
        padding:0;
      }

      .dj-chat-composer{
        border-top:1px solid #e4e7ec;
        padding:11px;
        display:flex;
        gap:8px;
        background:#fff;
      }

      .dj-chat-input{
        flex:1;
        min-width:0;
        min-height:42px;
        max-height:110px;
        resize:none;
        border:1px solid #d0d5dd;
        border-radius:12px;
        padding:10px 11px;
        font:inherit;
        outline:none;
      }

      .dj-chat-input:focus{
        border-color:#98a2b3;
      }

      .dj-chat-send{
        width:68px;
        border:0;
        border-radius:12px;
        background:#10182d;
        color:#fff;
        font-weight:900;
        cursor:pointer;
      }

      .dj-chat-send:disabled{
        opacity:.45;
        cursor:not-allowed;
      }

      .dj-chat-status{
        padding:8px 12px;
        font-size:11px;
        background:#fff8e8;
        border-bottom:1px solid #f1dfaa;
        color:#7a5d10;
        display:none;
      }

      .dj-chat-status.show{
        display:block;
      }

      .dj-chat-participants{
        padding:8px 12px;
        border-bottom:1px solid #e4e7ec;
        background:#fff;
        display:flex;
        gap:7px;
        flex-wrap:wrap;
      }

      .dj-chat-participant{
        display:inline-flex;
        align-items:center;
        gap:6px;
        padding:5px 8px;
        border-radius:999px;
        background:#f2f4f7;
        color:#344054;
        font-size:10px;
        font-weight:800;
      }

      .dj-chat-participant button{
        border:0;
        padding:0;
        background:none;
        cursor:pointer;
        color:#b42318;
        font-size:9px;
        font-weight:900;
      }

      .dj-chat-empty{
        height:100%;
        display:flex;
        align-items:center;
        justify-content:center;
        text-align:center;
        color:#98a2b3;
        font-size:13px;
      }

      @media(max-width:600px){
        #djChatBubble{
          right:14px;
          bottom:14px;
        }

        #djChatPanel{
          right:10px;
          bottom:78px;
          width:calc(100vw - 20px);
          height:min(70vh,620px);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function buildUi() {
    const bubble =
      document.createElement("button");

    bubble.id = "djChatBubble";
    bubble.type = "button";
    bubble.title = "Live Chat";
    bubble.innerHTML =
      "💬<span id=\"djChatUnread\">0</span>";

    const panel =
      document.createElement("section");

    panel.id = "djChatPanel";
    panel.innerHTML = `
      <div class="dj-chat-head">
        <div>
          <div class="dj-chat-head-title">
            💬 Live Chat DJ Family Kost
          </div>
          <div class="dj-chat-head-sub">
            ${role === "master"
              ? "Master · ruang chat seluruh tenant"
              : "Ruang chat bersama seluruh tenant"}
          </div>
        </div>
        <button
          type="button"
          class="dj-chat-close"
          id="djChatClose"
          aria-label="Tutup chat"
        >×</button>
      </div>

      <div
        id="djChatStatus"
        class="dj-chat-status"
      ></div>

      <div
        id="djChatParticipants"
        class="dj-chat-participants"
        style="display:${role === "master" ? "flex" : "none"};"
      ></div>

      <div
        id="djChatStream"
        class="dj-chat-stream"
      >
        <div class="dj-chat-empty">
          Memuat chat...
        </div>
      </div>

      <div class="dj-chat-composer">
        <textarea
          id="djChatInput"
          class="dj-chat-input"
          maxlength="500"
          rows="1"
          placeholder="Tulis pesan..."
        ></textarea>
        <button
          type="button"
          id="djChatSend"
          class="dj-chat-send"
          disabled
        >Kirim</button>
      </div>
    `;

    document.body.appendChild(bubble);
    document.body.appendChild(panel);

    const close =
      () => panel.classList.remove("open");

    bubble.addEventListener(
      "click",
      () => {
        const open =
          panel.classList.toggle("open");

        if (open) {
          unread = 0;
          updateUnread();
          scrollBottom();
        }
      }
    );

    document
      .getElementById("djChatClose")
      .addEventListener("click", close);

    document
      .getElementById("djChatSend")
      .addEventListener(
        "click",
        sendMessage
      );

    document
      .getElementById("djChatInput")
      .addEventListener(
        "keydown",
        (event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey
          ) {
            event.preventDefault();
            sendMessage();
          }
        }
      );
  }

  function setStatus(text, show = true) {
    const el =
      document.getElementById("djChatStatus");

    if (!el) return;

    el.textContent =
      String(text || "");

    el.classList.toggle("show", show);
  }

  function clearStatus() {
    setStatus("", false);
  }

  function updateUnread() {
    const badge =
      document.getElementById("djChatUnread");

    if (!badge) return;

    if (unread > 0) {
      badge.textContent =
        unread > 99 ? "99+" : String(unread);
      badge.style.display = "flex";
    } else {
      badge.style.display = "none";
    }
  }

  function currentDisplayName(session) {
    if (role === "master") return "Master";

    return (
      session.room ||
      session.kamar ||
      session.tenantId ||
      "Tenant"
    );
  }

  const DJ_CHAT_ROOMS = [
    "101","102","103","104","105","106","107","108","109",
    "201","202","203","204","205","206","207","208","209","210",
    "301","302","303","304","305","306","307","308","309","310",
    "401","402","403","404","405","406","407","408","409","410"
  ];

  function roomIndex(room){
    const value =
      String(room == null ? "" : room)
        .replace(/^KAMAR\\s+/i,"")
        .trim();

    const index =
      DJ_CHAT_ROOMS.indexOf(value);

    return index >= 0 ? index : -1;
  }

  function roomTheme(room){
    const index = roomIndex(room);

    if(index < 0){
      return {
        color:"#344054",
        background:"#ffffff",
        border:"#d0d5dd"
      };
    }

    /*
     * Sebarkan 39 kamar dengan golden-angle agar warna
     * antar-kamar tidak berkumpul pada warna yang berdekatan.
     */
    const hue =
      Math.round(
        (index * 137.508) % 360
      );

    return {
      color:
        "hsl(" + hue + " 68% 39%)",
      background:
        "hsl(" + hue + " 88% 96%)",
      border:
        "hsl(" + hue + " 55% 68%)"
    };
  }

  function chatVisual(item){
    if(
      item &&
      String(item.role || "").toLowerCase() === "master"
    ){
      return {
        color:"#ffffff",
        background:"#0b0b0b",
        border:"#000000"
      };
    }

    return roomTheme(
      item && (
        item.displayName ||
        item.room ||
        item.senderKey ||
        ""
      )
    );
  }

  function chatBubbleStyle(item){
    const theme = chatVisual(item);

    return (
      ' style="' +
      'color:' + esc(theme.color) + ';' +
      'background:' + esc(theme.background) + ';' +
      'border-color:' + esc(theme.border) + ';"'
    );
  }

  function chatMetaStyle(item){
    const theme = chatVisual(item);

    return (
      ' style="color:' +
      esc(theme.color) +
      ';"'
    );
  }

  function renderMessages() {
    const stream =
      document.getElementById("djChatStream");

    if (!stream) return;

    if (!messages.length) {
      stream.innerHTML =
        '<div class="dj-chat-empty">' +
        "Belum ada pesan." +
        "</div>";
      return;
    }

    stream.innerHTML =
      messages
        .map((item) => {
          const session =
            getSession() || {};

          const mine =
            role === item.role &&
            (
              role === "master" ||
              String(item.senderKey || "") ===
              String(session.tenantId || "")
            );

          const sender =
            item.role === "master"
              ? "Master"
              : String(
                  item.displayName ||
                  item.senderKey ||
                  "Tenant"
                );

          return (
            '<div class="dj-chat-message ' +
            (mine ? "mine " : "") +
            (item.deleted ? "deleted" : "") +
            '">' +

            '<div class="dj-chat-meta"' +
            chatMetaStyle(item) +
            '>' +
            esc(sender) +
            " · " +
            formatTime(item.createdAt) +
            "</div>" +

            '<div class="dj-chat-bubble"' +
            chatBubbleStyle(item) +
            '>' +
            esc(item.message || "") +
            "</div>" +

            (
              role === "master" &&
              !item.deleted
                ? (
                  '<div class="dj-chat-actions">' +
                  '<button ' +
                  'type="button" ' +
                  'class="dj-chat-delete" ' +
                  'data-delete-id="' +
                  esc(item.id) +
                  '">' +
                  "Hapus pesan" +
                  "</button>" +
                  "</div>"
                )
                : ""
            ) +

            "</div>"
          );
        })
        .join("");

    stream
      .querySelectorAll("[data-delete-id]")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const id =
              Number(
                button.getAttribute(
                  "data-delete-id"
                )
              );

            deleteMessage(id);
          }
        );
      });

    scrollBottom();
  }

  function renderParticipants() {
    const box =
      document.getElementById(
        "djChatParticipants"
      );

    if (
      role !== "master" ||
      !box
    ) {
      return;
    }

    if (!participants.length) {
      box.innerHTML =
        '<span class="dj-chat-participant">' +
        "Belum ada tenant aktif di chat" +
        "</span>";
      return;
    }

    box.innerHTML =
      participants
        .map((item) => {
          const participantTheme =
            roomTheme(
              item.room ||
              item.displayName ||
              item.tenantId ||
              ""
            );

          return (
            '<span class="dj-chat-participant"' +
            ' style="' +
            'background:' +
            esc(participantTheme.background) +
            ';border:1px solid ' +
            esc(participantTheme.border) +
            ';color:' +
            esc(participantTheme.color) +
            ';">' +
            esc(item.displayName || item.tenantId) +

            (
              item.muted
                ? " · CHAT OFF"
                : ""
            ) +

            '<button ' +
            'type="button" ' +
            'data-mute-id="' +
            esc(item.tenantId) +
            '" ' +
            'data-muted="' +
            (item.muted ? "1" : "0") +
            '">' +
            (
              item.muted
                ? "Aktifkan"
                : "Matikan"
            ) +
            "</button>" +

            "</span>"
          );
        })
        .join("");

    box
      .querySelectorAll("[data-mute-id]")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const tenantId =
              button.getAttribute(
                "data-mute-id"
              );

            const isMuted =
              button.getAttribute(
                "data-muted"
              ) === "1";

            changeMute(
              tenantId,
              !isMuted
            );
          }
        );
      });
  }

  function formatTime(timestamp) {
    const date =
      new Date(Number(timestamp || Date.now()));

    return date.toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  }

  function scrollBottom() {
    const stream =
      document.getElementById("djChatStream");

    if (!stream) return;

    stream.scrollTop =
      stream.scrollHeight;
  }

  function setComposerState() {
    const input =
      document.getElementById("djChatInput");

    const button =
      document.getElementById("djChatSend");

    if (!input || !button) return;

    input.disabled =
      role === "tenant" &&
      (
        !authenticated ||
        muted ||
        !connected
      );

    button.disabled =
      role === "tenant" &&
      (
        !authenticated ||
        muted ||
        !connected ||
        !input.value.trim()
      );

    if (muted) {
      input.placeholder =
        "Chat Anda sedang dinonaktifkan Master.";
    } else if (!connected) {
      input.placeholder =
        "Menghubungkan...";
    } else {
      input.placeholder =
        "Tulis pesan...";
    }

    if (role === "master") {
      input.disabled =
        !authenticated ||
        !connected;

      input.placeholder =
        connected
          ? "Tulis pesan sebagai Master..."
          : "Menghubungkan...";

      button.disabled =
        !authenticated ||
        !connected ||
        !input.value.trim();
    }
  }

  function sendMessage() {
    if (
      !socket ||
      socket.readyState !== WebSocket.OPEN ||
      !authenticated ||
      (
        role === "tenant" &&
        muted
      )
    ) {
      return;
    }

    const input =
      document.getElementById("djChatInput");

    if (!input) return;

    const text =
      input.value.trim();

    if (!text) return;

    socket.send(
      JSON.stringify({
        type: "send",
        message: text
      })
    );

    input.value = "";
    setComposerState();
  }

  function deleteMessage(id) {
    if (
      role !== "master" ||
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    socket.send(
      JSON.stringify({
        type: "delete",
        id
      })
    );
  }

  function changeMute(tenantId, mutedValue) {
    if (
      role !== "master" ||
      !socket ||
      socket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    socket.send(
      JSON.stringify({
        type:
          mutedValue
            ? "mute"
            : "unmute",
        tenantId
      })
    );
  }

  function connect() {
    if (manuallyClosed) return;

    const session =
      getSession();

    if (!session) {
      setStatus(
        role === "master"
          ? "Sesi Master tidak ditemukan."
          : "Sesi tenant tidak ditemukan.",
        true
      );
      return;
    }

    try {
      socket =
        new WebSocket(
          CHAT_SOCKET_URL
        );
    } catch (error) {
      scheduleReconnect();
      return;
    }

    connected = false;
    authenticated = false;
    setComposerState();

    socket.addEventListener(
      "open",
      () => {
        connected = true;

        socket.send(
          JSON.stringify({
            type: "auth",
            role,
            tenantId:
              session.tenantId || "",
            masterId:
              session.masterId || "",
            sessionToken:
              session.sessionToken || ""
          })
        );

        setStatus(
          "Menghubungkan ke Live Chat...",
          true
        );
      }
    );

    socket.addEventListener(
      "message",
      (event) => {
        handleServerMessage(
          event.data
        );
      }
    );

    socket.addEventListener(
      "close",
      () => {
        connected = false;
        authenticated = false;
        muted = false;
        setComposerState();

        if (!manuallyClosed) {
          setStatus(
            "Koneksi chat terputus. Mencoba menghubungkan kembali...",
            true
          );
          scheduleReconnect();
        }
      }
    );

    socket.addEventListener(
      "error",
      () => {}
    );
  }

  function scheduleReconnect() {
    if (reconnectTimer) return;

    reconnectTimer =
      setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, 3000);
  }

  function handleServerMessage(raw) {
    let data;

    try {
      data =
        JSON.parse(raw);
    } catch (error) {
      return;
    }

    if (data.type === "hello") {
      return;
    }

    if (data.type === "auth_error") {
      setStatus(
        data.message ||
        "Autentikasi chat gagal.",
        true
      );
      return;
    }

    if (data.type === "snapshot") {
      authenticated = true;
      muted = Boolean(data.muted);
      messages =
        Array.isArray(data.messages)
          ? data.messages
          : [];

      participants =
        Array.isArray(data.participants)
          ? data.participants
          : [];

      clearStatus();
      renderMessages();
      renderParticipants();
      setComposerState();
      return;
    }

    if (data.type === "message") {
      if (!data.message) return;

      messages.push(
        data.message
      );

      const panel =
        document.getElementById(
          "djChatPanel"
        );

      const senderIsSelf =
        role === data.message.role &&
        role === "tenant" &&
        String(
          data.message.senderKey || ""
        ) ===
        String(
          (getSession() || {}).tenantId || ""
        );

      renderMessages();

      if (
        !senderIsSelf &&
        !(
          panel &&
          panel.classList.contains("open")
        )
      ) {
        unread++;
        updateUnread();
      }

      return;
    }

    if (data.type === "message_deleted") {
      messages =
        messages.map((item) =>
          Number(item.id) ===
          Number(data.id)
            ? {
                ...item,
                message:
                  "Pesan dihapus oleh Master.",
                deleted: true,
                deletedBy: "Master"
              }
            : item
        );

      renderMessages();
      return;
    }

    if (data.type === "participants") {
      participants =
        Array.isArray(data.participants)
          ? data.participants
          : [];

      renderParticipants();
      return;
    }

    if (data.type === "mute_changed") {
      if (
        role === "tenant" &&
        getSession() &&
        String(
          data.tenantId || ""
        ).toUpperCase() ===
        String(
          getSession().tenantId || ""
        ).toUpperCase()
      ) {
        muted =
          Boolean(data.muted);

        setStatus(
          data.message ||
          (
            muted
              ? "Chat Anda dinonaktifkan Master."
              : "Chat Anda kembali aktif."
          ),
          true
        );

        setComposerState();
      }

      if (role === "master") {
        setStatus(
          data.message || "",
          true
        );

        setTimeout(
          clearStatus,
          2500
        );
      }

      participants =
        participants.map((item) =>
          String(item.tenantId)
            .toUpperCase() ===
          String(data.tenantId)
            .toUpperCase()
            ? {
                ...item,
                muted:
                  Boolean(data.muted)
              }
            : item
        );

      renderParticipants();
      return;
    }

    if (data.type === "muted") {
      muted = true;

      setStatus(
        data.message ||
        "Chat Anda dinonaktifkan Master.",
        true
      );

      setComposerState();
      return;
    }

    if (data.type === "error") {
      setStatus(
        data.message ||
        "Terjadi kesalahan chat.",
        true
      );

      setTimeout(
        clearStatus,
        3000
      );
    }
  }

  function init() {
    addStyles();
    buildUi();
    updateUnread();
    setComposerState();

    const session =
      getSession();

    if (!session) {
      setStatus(
        "Silakan login kembali untuk menggunakan Live Chat.",
        true
      );
      return;
    }

    connect();

    document
      .getElementById("djChatInput")
      .addEventListener(
        "input",
        setComposerState
      );
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }
})(); 
