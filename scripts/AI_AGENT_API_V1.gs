/* ============================================================
 * DJ FAMILY KOST — AI AGENT MASTER API V1
 * ============================================================
 * Bridge khusus Master Dashboard ↔ AI_AGENT_CORE_V1.gs.
 *
 * Endpoint yang diekspos melalui TENANT_API_V2.doPost:
 *   masterAIInbox
 *   masterAIAction
 *
 * Tidak menulis business sheet secara langsung.
 * Semua aksi bisnis diteruskan ke executor AI Agent,
 * yang kemudian memanggil existing business function.
 * ============================================================
 */

function aiAgentMasterApiV1_(action, body) {

  action =
    String(
      action || ''
    )
    .trim()
    .toLowerCase();

  body =
    body || {};

  const master =
    validateMasterSessionV2_(
      body.masterId,
      body.sessionToken
    );

  if (!master) {

    return {

      ok: false,

      error:
        'Session Master tidak valid atau sudah kedaluwarsa.'

    };

  }

  if (
    action === 'masteraiinbox'
  ) {

    return {

      ok: true,

      data:
        getAIMasterActionsV1_(
          master.masterId
        )

    };

  }

  if (
    action === 'masteraiaction'
  ) {

    const actionId =
      String(
        body.actionId || ''
      )
      .trim();

    const command =
      String(
        body.command || ''
      )
      .trim()
      .toUpperCase();

    if (!actionId) {

      return {

        ok: false,

        error:
          'Action_ID wajib diisi.'

      };

    }

    if (!command) {

      return {

        ok: false,

        error:
          'Command AI wajib diisi.'

      };

    }

    let options =
      body.options || {};

    if (
      typeof options ===
      'string'
    ) {

      try {

        options =
          JSON.parse(
            options
          );

      } catch (error) {

        options = {};

      }

    }

    return {

      ok: true,

      data:
        processAIMasterActionV1(
          actionId,
          command,
          master.masterId,
          options
        )

    };

  }

  return {

    ok: false,

    error:
      'Action AI Master tidak dikenal: ' +
      action

  };

}
