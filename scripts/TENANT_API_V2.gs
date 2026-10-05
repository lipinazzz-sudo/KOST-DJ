/**
 * ============================================================
 * DJ FAMILY KOST
 * TENANT_API_V2 ‚Äî CONSOLIDATED MASTER BASELINE V1
 * ============================================================
 *
 * SINGLE SOURCE OF TRUTH ‚Äî 2026-09-25
 *
 * BASELINE FITUR:
 * TENANT:
 *   login, dashboard, payment, maintenance, check-in/out,
 *   history, media, password, logout, lifecycle access control.
 *
 * MASTER:
 *   login/session, dashboard, pendaftaran, approval + kamar
 *   final, tenant, reset password, pembayaran/verifikasi,
 *   media, maintenance, check-in/out, aktivasi akun, announcement,
 *   WhatsApp, automation, logout.
 *
 * ATURAN:
 *   1. Jangan menghapus fungsi lama saat menambah fitur.
 *   2. Jangan menempel HTML ke file .gs.
 *   3. Semua perubahan API berikutnya dimulai dari baseline ini.
 *   4. Setelah instalasi jalankan auditDJFamilyKostApiV2Final().
 *
 * ============================================================
 */

/* ============================================================
 * MAIN POST ROUTER
 * ============================================================
 */
function doPost(e) {

  try {

    const body =
      djApiParseRequestV5_(e);
    /*
     * ========================================================
     * WHATSAPP MASTER WEBHOOK
     * ========================================================
     */

    if (
      body &&
      String(
        body.object || ''
      )
      .trim()
      .toLowerCase() ===
      'whatsapp_business_account'
    ) {

      return waMasterWebhookPostV1_(
        body
      );

    }

    const action =
      String(
        body.action || ''
      )
      .trim()
      .toLowerCase();


    if (!action) {

      return djApiJsonV5_({

        ok: false,

        error:
          'Action API kosong.'

      });

    }
/* ========================================================
 * AI AGENT MASTER ROUTES
 * ========================================================
 */

if (
  action === 'masteraiinbox' ||
  action === 'masteraiaction'
) {

  const aiResult =
    aiAgentMasterApiV1_(
      action,
      body
    );

  return djApiJsonV5_(
    aiResult
  );

}
    /* ========================================================
     * PUBLIC CONTACT
     * ========================================================
     * Nomor WhatsApp publik membaca sumber yang sama dengan
     * nomor yang diberi hak action.
     * ========================================================
     */

    if (
      action === 'publiccontact'
    ) {

      return djApiJsonV5_({

        ok: true,

        data:
          djApiPublicContactV1_()

      });

    }

    /* ========================================================
     * MASTER ROUTES
     * ========================================================
     */

    if (
      action.indexOf('master') === 0
    ) {

      return djApiMasterRouterV5_(
        action,
        body
      );

    }



    /* ========================================================
     * PUBLIC REGISTRATION
     * ========================================================
     */

    if (
      action === 'registration'
    ) {

      const result =
        djApiSubmitRegistrationV6_(
          body
        );

      return djApiJsonV5_(
        result.ok
          ? {
              ok: true,
              data: result
            }
          : {
              ok: false,
              error: result.error
            }
      );

    }

    /* ========================================================
     * STEP 3 ‚Äî PUBLIC ACCOUNT ACTIVATION
     * ========================================================
     */

    if (
      action === 'activationinfo'
    ) {

      const result =
        djApiActivationInfoV1_(
          body.registrationId,
          body.noHP
        );

      return djApiJsonV5_(
        result.ok
          ? {
              ok: true,
              data: result
            }
          : {
              ok: false,
              error: result.error
            }
      );

    }


    if (
      action === 'submitactivation'
    ) {

      const result =
        djApiSubmitActivationV1_(
          body
        );

      return djApiJsonV5_(
        result.ok
          ? {
              ok: true,
              data: result
            }
          : {
              ok: false,
              error: result.error
            }
      );

    }


   /* ========================================================
 * TENANT LOGIN
 * ========================================================
 */

if (
  action === 'login'
) {

  const tenantId =
    String(
      body.tenantId || ''
    )
    .trim()
    .toUpperCase();


  const accountState =
    djApiGetTenantAccountStateV1_(
      tenantId
    );


  if (
    accountState.blocked === true
  ) {

    return djApiJsonV5_({

      ok: false,

      error:
        'Akun tenant sudah nonaktif karena masa sewa telah selesai. Silakan hubungi pengelola DJ Family Kost.'

    });

  }


  const password =
    String(
      body.password || ''
    );


  const result =
    loginTenantV2_(
      tenantId,
      password
    );


  if (
    !result ||
    !result.ok
  ) {

    return djApiJsonV5_({

      ok: false,

      error:
        result &&
        result.error
          ? result.error
          : 'Login gagal.'

    });

  }


  return djApiJsonV5_({

    ok: true,

    data: {

      tenantId:
        result.tenantId,

      nama:
        result.nama,

      kamar:
        result.kamar,

      email:
        result.email,

      phone:
        result.phone,

      status:
        result.status,

      sessionToken:
        result.sessionToken,

      sessionExpires:
        result.sessionExpires,

      mustChangePassword:
        djApiMustChangePasswordV1_(
          result.tenantId
        ),

      wajibGantiPassword:
        djApiMustChangePasswordV1_(
          result.tenantId
        )

    }

  });

}


    /* ========================================================
     * TENANT ACCESS GUARD
     * ========================================================
     *
     * Seluruh layanan privat tenant diblokir ketika akun sudah
     * NONAKTIF. Guard ini berada di router agar tidak bergantung
     * pada perilaku halaman frontend.
     * ========================================================
     */

const tenantProtectedActions = [

  'tenantdashboard',
  'payment',
  'additionalcharges',
  'submitadditionalchargepayment',
  'additionalchargeproofopen',
  'maintenance',
  'submitlaundryorder',
  'maintenancehistory',
  'checkinout',
  'checkinouthistory',
  'checkinoutmediaopen',
  'changepassword'

];


    if (
      tenantProtectedActions.indexOf(action) >= 0
    ) {

      const accountState =
        djApiGetTenantAccountStateV1_(
          body.tenantId
        );


      if (
        accountState.blocked === true
      ) {

        return djApiJsonV5_({

          ok: false,

          error:
            'Akun tenant sudah nonaktif. Akses layanan tenant telah ditutup.'

        });

      }

    }


    /* ========================================================
     * TENANT DASHBOARD
     * ========================================================
     */

    if (
      action === 'tenantdashboard'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (!tenant) {

        return djApiSessionErrorV5_();

      }


      return djApiJsonV5_({

        ok: true,

        data:
          djApiTenantDashboardV5_(
            tenant
          )

      });

    }
/* ========================================================
 * TENANT DATA REVISION
 * ========================================================
 */

if (
  action === 'submittenantrevision'
) {

  const tenant =
    validateTenantSessionV2_(
      body.tenantId,
      body.sessionToken
    );


  if (!tenant) {

    return djApiSessionErrorV5_();

  }


  const result =
    djApiSubmitTenantRevisionV1_(
      tenant,
      body
    );


  return djApiJsonV5_(
    result.ok

      ? {
          ok: true,
          data: result
        }

      : {
          ok: false,
          error: result.error
        }
  );

}

    /* ========================================================
     * PAYMENT
     * ========================================================
     */

    if (
      action === 'payment'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (!tenant) {

        return djApiSessionErrorV5_();

      }


      const result =
        djApiSubmitPaymentV5_(
          tenant,
          body
        );


      return djApiJsonV5_(
        result.ok

          ? {

              ok: true,

              data:
                result

            }

          : {

              ok: false,

              error:
                result.error

            }
      );

    }


    /* ========================================================
     * TAGIHAN TAMBAHAN — TENANT
     * ======================================================== */

    if (
      action === 'additionalcharges'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (!tenant) {

        return djApiSessionErrorV5_();

      }


      return djApiJsonV5_({

        ok: true,

        data:
          djApiTenantAdditionalChargesV1_(
            tenant.tenantId
          )

      });

    }


    if (
      action === 'submitadditionalchargepayment'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (!tenant) {

        return djApiSessionErrorV5_();

      }


      const result =
        djApiSubmitAdditionalChargePaymentV1_(
          tenant,
          body
        );


      return djApiJsonV5_(
        result.ok
          ? {
              ok: true,
              data: result
            }
          : {
              ok: false,
              error: result.error
            }
      );

    }


    if (
      action === 'additionalchargeproofopen'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (!tenant) {

        return djApiSessionErrorV5_();

      }


      const result =
        djApiAdditionalChargeProofV1_(
          tenant.tenantId,
          body.chargeId
        );


      return djApiJsonV5_(
        result.ok
          ? {
              ok: true,
              data: result
            }
          : {
              ok: false,
              error: result.error
            }
      );

    }


    /* ========================================================
     * MAINTENANCE ‚Äî SUBMIT
     * ========================================================
     */

    if (
      action === 'maintenance'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (!tenant) {

        return djApiSessionErrorV5_();

      }


      const result =
        djApiSubmitMaintenanceV5_(
          tenant,
          body
        );


      return djApiJsonV5_(
        result.ok

          ? {

              ok: true,

              data:
                result

            }

          : {

              ok: false,

              error:
                result.error

            }
      );

    }
/* ========================================================
 * LAUNDRY — SUBMIT ORDER
 * ========================================================
 */

if (
  action === 'submitlaundryorder'
) {

  const tenant =
    validateTenantSessionV2_(
      body.tenantId,
      body.sessionToken
    );


  if (!tenant) {

    return djApiSessionErrorV5_();

  }


  const result =
    djApiSubmitLaundryOrderV1_(
      tenant,
      body
    );


  return djApiJsonV5_(
    result.ok

      ? {

          ok: true,

          data:
            result

        }

      : {

          ok: false,

          error:
            result.error

        }
  );

}

    /* ========================================================
     * MAINTENANCE ‚Äî HISTORY
     * ========================================================
     */

    if (
      action === 'maintenancehistory'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (!tenant) {

        return djApiSessionErrorV5_();

      }


      const result =
        djApiMaintenanceHistoryV5_(
          tenant
        );


      return djApiJsonV5_({

        ok: true,

        data:
          result

      });

    }


    /* ========================================================
     * CHECK IN / OUT ‚Äî SUBMIT
     * ========================================================
     */

    if (
      action === 'checkinout'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (!tenant) {

        return djApiSessionErrorV5_();

      }


      const result =
        djApiSubmitCheckInOutV7_(
          tenant,
          body
        );


      return djApiJsonV5_(
        result.ok

          ? {

              ok: true,

              data:
                result

            }

          : {

              ok: false,

              error:
                result.error

            }
      );

    }


    /* ========================================================
     * CHECK IN / OUT ‚Äî HISTORY
     * ========================================================
     */

    if (
      action === 'checkinouthistory'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (!tenant) {

        return djApiSessionErrorV5_();

      }


      return djApiJsonV5_({

        ok: true,

        data:
          djApiCheckInOutHistoryV7_(
            tenant
          )

      });

    }


    /* ========================================================
     * CHECK IN / OUT ‚Äî OPEN MEDIA
     * ========================================================
     */

    if (
      action === 'checkinoutmediaopen'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );

      if (!tenant) {
        return djApiSessionErrorV5_();
      }

      const result =
        djApiOpenCheckInOutMediaV7_(
          tenant,
          body.fileId,
          body.url
        );

      return djApiJsonV5_(
        result.ok
          ? { ok: true, data: result }
          : { ok: false, error: result.error }
      );

    }


    /* ========================================================
     * CHANGE PASSWORD
     * ========================================================
     */

    if (
      action === 'changepassword'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (!tenant) {

        return djApiSessionErrorV5_();

      }


      const result =
        changeTenantPasswordV2_(
          body.tenantId,
          body.currentPassword,
          body.newPassword
        );


      return djApiJsonV5_(
        result.ok

          ? {

              ok: true,

              data:
                result

            }

          : {

              ok: false,

              error:
                result.error

            }
      );

    }


    /* ========================================================
     * TENANT LOGOUT
     * ========================================================
     */

    if (
      action === 'logout'
    ) {

      const tenant =
        validateTenantSessionV2_(
          body.tenantId,
          body.sessionToken
        );


      if (tenant) {

        clearTenantSessionV2_(
          body.tenantId
        );

      }


      return djApiJsonV5_({

        ok: true

      });

    }


    return djApiJsonV5_({

      ok: false,

      error:
        'Action tidak dikenal: ' +
        action

    });


  } catch (err) {

    return djApiJsonV5_({

      ok: false,

      error:
        String(
          err &&
          err.message
            ? err.message
            : err
        )

    });

  }

}


/* ============================================================
 * MASTER ROUTER
 * ============================================================
 */
function djApiMasterRouterV5_(
  action,
  body
) {

  /* ----------------------------------------------------------
   * MASTER LOGIN
   * ----------------------------------------------------------
   */

  if (
    action === 'masterlogin'
  ) {

    const result =
      masterLoginV2_(
        body.masterId,
        body.password
      );


    return djApiJsonV5_(
      result.ok

        ? {

            ok: true,

            data:
              result

          }

        : {

            ok: false,

            error:
              result.error

          }
    );

  }


  /* ----------------------------------------------------------
   * VALIDATE MASTER SESSION
   * ----------------------------------------------------------
   */

  const master =
    validateMasterSessionV2_(
      body.masterId,
      body.sessionToken
    );


  if (!master) {

    return djApiJsonV5_({

      ok: false,

      error:
        'Session Master tidak valid atau sudah kedaluwarsa.'

    });

  }


  /* ----------------------------------------------------------
   * DASHBOARD
   * ----------------------------------------------------------
   */

  if (
    action === 'masterdashboard'
  ) {

    return djApiJsonV5_({

      ok: true,

      data:
        djApiMasterDashboardV5_()

    });

  }


  /* ----------------------------------------------------------
   * PENDAFTARAN
   * ----------------------------------------------------------
   */

  if (
    action === 'masterregistrations'
  ) {

    return djApiJsonV5_({

      ok: true,

      data:
        djApiMasterRegistrationsV5_()

    });

  }


  if (
    action === 'masterapproveregistration'
  ) {

    try {

      const result =
        djApiMasterApproveRegistrationV6_(
          body.registrationId,
          body.finalRoom,
          master.masterId
        );

      return djApiJsonV5_({
        ok: true,
        data: result
      });

    } catch (err) {

      return djApiJsonV5_({
        ok: false,
        error:
          String(
            err && err.message
              ? err.message
              : err
          )
      });

    }

  }


  if (
    action === 'masterrejectregistration'
  ) {

    try {

      const result =
        djApiRejectRegistrationV5_(
          body.registrationId,
          body.reason,
          master.masterId
        );


      return djApiJsonV5_({

        ok: true,

        data:
          result

      });

    } catch (err) {

      return djApiJsonV5_({

        ok: false,

        error:
          String(
            err &&
            err.message
              ? err.message
              : err
          )

      });

    }

  }


  /* ----------------------------------------------------------
   * TENANT
   * ----------------------------------------------------------
   */

  if (
    action === 'mastertenants'
  ) {

    return djApiJsonV5_({

      ok: true,

      data:
        djApiMasterTenantsV5_()

    });

  }


  if (
    action === 'masterresetpassword'
  ) {

    const result =
      djApiMasterResetPasswordV5_(
        body.tenantId
      );


    return djApiJsonV5_(
      result.ok

        ? {

            ok: true,

            data:
              result

          }

        : {

            ok: false,

            error:
              result.error

          }
    );

  }

/* ----------------------------------------------------------
 * TENANT DATA REVISION
 * ----------------------------------------------------------
 */

if (
  action === 'mastertenantdetail'
) {

  return djApiJsonV5_({

    ok:
      true,

    data:
      djApiMasterTenantDetailRevisionV1_(
        body.tenantId
      )

  });

}


if (
  action === 'masterrequestrevision'
) {

  const result =
    djApiMasterRequestRevisionV1_(
      body.tenantId,
      body.field,
      body.reason
    );


  return djApiJsonV5_(
    result.ok

      ? {
          ok: true,
          data: result
        }

      : {
          ok: false,
          error: result.error
        }
  );

}


if (
  action === 'mastertenantrevisiondetail'
) {

  return djApiJsonV5_({

    ok:
      true,

    data:
      djApiMasterTenantRevisionDetailV1_(
        body.revisionId
      )

  });

}


if (
  action === 'masterreviewrevision'
) {

  const result =
    djApiMasterReviewRevisionV1_(
      body.revisionId,
      body.decision,
      body.reason,
      master.masterId
    );


  return djApiJsonV5_(
    result.ok

      ? {
          ok: true,
          data: result
        }

      : {
          ok: false,
          error: result.error
        }
  );

}

  /* ----------------------------------------------------------
   * PAYMENT
   * ----------------------------------------------------------
   */

  if (
    action === 'masterpayments'
  ) {

    return djApiJsonV5_({

      ok: true,

      data:
        djApiMasterPaymentsV5_()

    });

  }


  /* ----------------------------------------------------------
   * TAGIHAN TAMBAHAN
   * ----------------------------------------------------------
   */

  if (
    action === 'masteradditionalcharges'
  ) {

    return djApiJsonV5_({

      ok: true,

      data:
        djApiMasterAdditionalChargesV1_()

    });

  }


  if (
    action === 'mastercreateadditionalcharge'
  ) {

    const result =
      djApiCreateAdditionalChargeV1_(
        body,
        master.masterId
      );


    return djApiJsonV5_(
      result.ok
        ? { ok: true, data: result }
        : { ok: false, error: result.error }
    );

  }


  if (
    action === 'masterupdateadditionalcharge'
  ) {

    const result =
      djApiUpdateAdditionalChargeV1_(
        body,
        master.masterId
      );


    return djApiJsonV5_(
      result.ok
        ? { ok: true, data: result }
        : { ok: false, error: result.error }
    );

  }


  if (
    action === 'mastercanceladditionalcharge'
  ) {

    const result =
      djApiCancelAdditionalChargeV1_(
        body.chargeId,
        master.masterId
      );


    return djApiJsonV5_(
      result.ok
        ? { ok: true, data: result }
        : { ok: false, error: result.error }
    );

  }


  if (
    action === 'masterverifyadditionalcharge'
  ) {

    const result =
      djApiVerifyAdditionalChargeV1_(
        body.chargeId,
        body.decision,
        body.reason,
        master.masterId
      );


    return djApiJsonV5_(
      result.ok
        ? { ok: true, data: result }
        : { ok: false, error: result.error }
    );

  }


  if (
    action === 'masteradditionalchargeproof'
  ) {

    const result =
      djApiAdditionalChargeProofV1_(
        body.chargeId
      );


    return djApiJsonV5_(
      result.ok
        ? { ok: true, data: result }
        : { ok: false, error: result.error }
    );

  }


  if (
    action === 'masterverifypayment'
  ) {

    const result =
      djApiVerifyPaymentV5_(
        body.paymentId,
        body.decision,
        body.reason,
        master.masterId
      );


    return djApiJsonV5_(
      result.ok

        ? {

            ok: true,

            data:
              result

          }

        : {

            ok: false,

            error:
              result.error

          }
    );

  }


  if (
    action === 'masterpaymentproof'
  ) {

    const result =
      djApiPaymentProofV5_(
        body.paymentId
      );


    return djApiJsonV5_(
      result.ok

        ? {

            ok: true,

            data:
              result

          }

        : {

            ok: false,

            error:
              result.error

          }
    );

  }


  /* ----------------------------------------------------------
   * MEDIA
   * ----------------------------------------------------------
   */

  if (
    action === 'mastermedia'
  ) {

    return djApiJsonV5_({

      ok: true,

      data:
        djApiMasterMediaV5_()

    });

  }


  if (
    action === 'mastermediaopen'
  ) {

    const result =
      djApiMasterMediaOpenV5_(
        body.fileId,
        body.url
      );


    return djApiJsonV5_(
      result.ok

        ? {

            ok: true,

            data:
              result

          }

        : {

            ok: false,

            error:
              result.error

          }
    );

  }


  /* ----------------------------------------------------------
   * MAINTENANCE
   * ----------------------------------------------------------
   */

  if (
    action === 'mastermaintenance'
  ) {

    return djApiJsonV5_({

      ok: true,

      data:
        djApiMasterMaintenanceV5_()

    });

  }


  if (
    action === 'masterupdatemaintenance'
  ) {

    const result =
      djApiUpdateMaintenanceV5_(
        body,
        master.masterId
      );


    return djApiJsonV5_(
      result.ok

        ? {

            ok: true,

            data:
              result

          }

        : {

            ok: false,

            error:
              result.error

          }
    );

  }
/* ----------------------------------------------------------
 * LAUNDRY
 * ----------------------------------------------------------
 */

if (
  action === 'masterlaundry'
) {

  return djApiJsonV5_({

    ok: true,

    data:
      djApiMasterLaundryV1_()

  });

}


if (
  action === 'mastercompletelaundry'
) {

  const result =
    djApiMasterCompleteLaundryV1_(
      body.laundryId,
      master.masterId
    );


  return djApiJsonV5_(
    result.ok

      ? {

          ok: true,

          data:
            result

        }

      : {

          ok: false,

          error:
            result.error

        }
  );

}


if (
  action === 'masterhistory'
) {

  return djApiJsonV5_({

    ok: true,

    data:
      djApiMasterHistoryV1_()

  });

}

  /* ----------------------------------------------------------
   * CHECK IN / OUT
   * ----------------------------------------------------------
   */

  if (
    action === 'mastercheckinout'
  ) {

    return djApiJsonV5_({

      ok: true,

      data:
        djApiMasterCheckInOutV7_()

    });

  }


  /* ----------------------------------------------------------
   * ANNOUNCEMENTS
   * ----------------------------------------------------------
   */

  if (
    action === 'masterannouncements'
  ) {

    return djApiJsonV5_({

      ok: true,

      data:
        djApiMasterAnnouncementsV5_()

    });

  }


  if (
    action === 'mastersaveannouncement'
  ) {

    const result =
      djApiSaveAnnouncementV5_(
        body,
        master.masterId
      );


    return djApiJsonV5_(
      result.ok

        ? {

            ok: true,

            data:
              result

          }

        : {

            ok: false,

            error:
              result.error

          }
    );

  }


  if (
    action === 'masterupdateannouncement'
  ) {

    const result =
      djApiUpdateAnnouncementV5_(
        body,
        master.masterId
      );


    return djApiJsonV5_(
      result.ok

        ? {

            ok: true,

            data:
              result

          }

        : {

            ok: false,

            error:
              result.error

          }
    );

  }


  /* ----------------------------------------------------------
   * WHATSAPP
   * ----------------------------------------------------------
   */

  if (
    action === 'masterwhatsapp'
  ) {

    return djApiJsonV5_({

      ok: true,

      data:
        djApiMasterWhatsAppV5_()

    });

  }


  /* ----------------------------------------------------------
   * AUTOMATION
   * ----------------------------------------------------------
   */

  if (
    action === 'masterrunautomation'
  ) {

    const result =
      djApiRunAutomationV5_();


    return djApiJsonV5_(
      result.ok

        ? {

            ok: true,

            data:
              result

          }

        : {

            ok: false,

            error:
              result.error

          }
    );

  }
/* ----------------------------------------------------------
 * KEUANGAN
 * ----------------------------------------------------------
 */

if (
  action === 'masterfinance'
) {

  return djApiJsonV5_({

    ok: true,

    data:
      djApiMasterFinanceV1_(
        body.year,
        body.month
      )

  });

}


if (
  action === 'mastersaveexpense'
) {

  const result =
    djApiMasterSaveExpenseV1_(
      body,
      master.masterId
    );


  return djApiJsonV5_(
    result.ok

      ? {

          ok: true,

          data:
            result

        }

      : {

          ok: false,

          error:
            result.error

        }
  );

}

  /* ----------------------------------------------------------
   * MASTER LOGOUT
   * ----------------------------------------------------------
   */

  if (
    action === 'masterlogout'
  ) {

    clearMasterSessionV2_(
      master.masterId
    );


    return djApiJsonV5_({

      ok: true

    });

  }


  return djApiJsonV5_({

    ok: false,

    error:
      'Master action tidak dikenal: ' +
      action

  });

}


/* ============================================================
 * TENANT DASHBOARD
 * ============================================================
 */
function djApiTenantDashboardV5_(
  tenant
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  /*
   * ----------------------------------------------------------
   * DATA KAMAR
   * ----------------------------------------------------------
   */

  const room =
    djApiFindRoomV5_(
      ss,
      tenant.room
    );


  /*
   * ----------------------------------------------------------
   * DATA KONTRAK
   * ----------------------------------------------------------
   */

  const contract =
    djApiFindContractV5_(
      ss,
      tenant.tenantId
    );


  /*
   * ----------------------------------------------------------
   * DATA TAGIHAN
   * ----------------------------------------------------------
   */

  const billing =
    djApiFindBillingV5_(
      ss,
      tenant.tenantId,
      contract
    );


  /*
   * ----------------------------------------------------------
   * NOMOR WHATSAPP / HP
   * ----------------------------------------------------------
   */

  const tenantPhone =
    djApiFindPhoneV5_(
      ss,
      tenant.tenantId
    );


  /*
   * ----------------------------------------------------------
   * RESPONSE DASHBOARD
   * ----------------------------------------------------------
   */

  return {

    tenant: {

      tenantId:
        tenant.tenantId,

      name:
        tenant.name ||
        tenant.nama ||
        '',

      email:
        tenant.email ||
        '',

      phone:
        tenantPhone ||
        '',

      room:
        tenant.room ||
        tenant.kamar ||
        '',

      status:
        tenant.status ||
        'AKTIF'

    },


    room:
      room,


    contract:
      contract || {

        id:
          '',

        room:
          tenant.room,

        amount:
          room.price,

        deposit:
          300000,

        status:
          'AKTIF'

      },


    billing:
      billing,

    additionalCharges:
      djApiTenantAdditionalChargesV1_(
        tenant.tenantId
      ),


    /*
     * --------------------------------------------------------
     * PENGUMUMAN
     * --------------------------------------------------------
     *
     * JANGAN DIHAPUS.
     * Data ini dibaca oleh portal.html.
     */

    announcements:
      djApiTenantAnnouncementsV5_(
        ss
      ),

profileFields:
  djRevisionBuildTenantFieldsV1_(
    tenant.tenantId
  ),

    generatedAt:
      new Date()
        .toISOString()

  };

}


/* ============================================================
 * TENANT ANNOUNCEMENTS
 * ============================================================
 */
function djApiTenantAnnouncementsV5_(
  ss
) {

  const sheet =
    ss.getSheetByName(
      'Pengumuman'
    );

  if(!sheet){

    return {
      items: []
    };

  }

  const table =
    djApiReadTableV5_(
      sheet,
      ['Pengumuman_ID']
    );

  if(!table){

    return {
      items: []
    };

  }

  return {

    items:
      table.rows
        .map(function(row){

          return {

            id:
              djApiValueV5_(
                row,
                table.headers,
                ['Pengumuman_ID']
              ),

            title:
              djApiValueV5_(
                row,
                table.headers,
                ['Judul']
              ),

            message:
              djApiValueV5_(
                row,
                table.headers,
                ['Isi', 'Pesan']
              ),

            priority:
              djApiValueV5_(
                row,
                table.headers,
                ['Prioritas']
              ),

            status:
              djApiValueV5_(
                row,
                table.headers,
                ['Status']
              ),

            publishedAt:
              djApiValueV5_(
                row,
                table.headers,
                ['Tanggal_Terbit']
              )

          };

        })
        .filter(function(item){

          return String(
            item.status || ''
          ).trim().toUpperCase() === 'AKTIF';

        })
        .reverse()
        .slice(0, 20)

  };

}


/* ============================================================
 * ROOM LOOKUP
 * ============================================================
 */
function djApiSubmitRegistrationV6_(body) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pendaftaran'
    );


  if (!sheet) {

    return {

      ok: false,

      error: 'Sheet Pendaftaran tidak ditemukan.'

    };

  }


  const name =
    String(
      body.namaLengkap ||
      body.name ||
      body.nama ||
      body.nama_lengkap ||
      ''
    ).trim();


  const nickname =
    String(
      body.namaPanggilan ||
      body.nickname ||
      body.nama_panggilan ||
      ''
    ).trim();


  const phone =
    String(
      body.noHP ||
      body.noHp ||
      body.phone ||
      body.whatsapp ||
      body.noWhatsapp ||
      body.no_whatsapp ||
      ''
    ).trim();


  const email =
    String(
      body.email ||
      ''
    ).trim();


  const nik =
    String(
      body.nik ||
      body.nikKtp ||
      body.nik_ktp ||
      ''
    ).trim();


  const occupation =
    String(
      body.pekerjaan ||
      body.job ||
      ''
    ).trim();


  const company =
    String(
      body.perusahaan ||
      body.company ||
      body.instansi ||
      body.perusahaanInstansi ||
      ''
    ).trim();


  const gender =
    String(
      body.jenisKelamin ||
      body.gender ||
      ''
    ).trim();


  const address =
    String(
      body.alamat ||
      body.address ||
      ''
    ).trim();


  const room =
    String(
      body.kamar ||
      body.room ||
      body.noKamar ||
      body.no_kamar ||
      ''
    ).trim();


  const startDate =
    body.rencanaMulaiSewa ||
    body.startDate ||
    body.tanggalMulai ||
    body.tanggal_mulai ||
    '';


  const notes =
    String(
      body.catatan ||
      body.notes ||
      ''
    ).trim();


  /* ----------------------------------------------------------
   * REQUIRED FIELDS
   * ----------------------------------------------------------
   */

  if (!name) {

    return {
      ok: false,
      error: 'Nama lengkap wajib diisi.'
    };

  }


  if (!phone) {

    return {
      ok: false,
      error: 'Nomor WhatsApp wajib diisi.'
    };

  }
  if (!email) {

    return {
      ok: false,

      error:
        'Email wajib diisi karena digunakan untuk mengirim instruksi aktivasi setelah pendaftaran disetujui.'
    };

  }

  if (!nik) {

    return {
      ok: false,
      error: 'NIK KTP wajib diisi.'
    };

  }


  if (!address) {

    return {
      ok: false,
      error: 'Alamat wajib diisi.'
    };

  }


  if (!room) {

    return {
      ok: false,
      error: 'Kamar yang dipilih wajib diisi.'
    };

  }


  if (!startDate) {

    return {
      ok: false,
      error: 'Rencana mulai sewa wajib diisi.'
    };

  }


  /* ----------------------------------------------------------
   * VALIDASI KAMAR
   * ----------------------------------------------------------
   */

  const roomInfo =
    djApiFindRoomV5_(
      ss,
      room
    );


  const roomStatus =
    String(
      roomInfo.status ||
      ''
    )
    .trim()
    .toUpperCase();


  if (
    roomStatus === 'TERISI'
  ) {

    return {
      ok: false,
      error:
        'Kamar ' +
        room +
        ' sudah terisi.'
    };

  }


  if (
    Number(
      roomInfo.price ||
      0
    ) <= 0
  ) {

    return {
      ok: false,
      error:
        'Kamar ' +
        room +
        ' belum tersedia untuk disewa.'
    };

  }


  /* ----------------------------------------------------------
   * CEGAH DUPLIKAT PENDAFTARAN KAMAR YANG SAMA
   * ----------------------------------------------------------
   */

  const existing =
    djApiReadSafeV5_(
      ss,
      'Pendaftaran',
      [
        'Pendaftaran_ID'
      ]
    );


  if (existing) {

    for (
      let i = 0;
      i < existing.rows.length;
      i++
    ) {

      const row =
        existing.rows[i];


      const existingStatus =
        String(
          djApiValueV5_(
            row,
            existing.headers,
            [
              'Status_Pendaftaran'
            ]
          ) ||
          ''
        )
        .trim()
        .toUpperCase();


      const existingRoom =
        String(
          djApiValueV5_(
            row,
            existing.headers,
            [
              'No_Kamar'
            ]
          ) ||
          ''
        ).trim();


      if (
        existingRoom === room &&
        (
          existingStatus ===
          'MENUNGGU VERIFIKASI' ||
          existingStatus ===
          'DISETUJUI' ||
          existingStatus ===
          'AKTIF'
        )
      ) {

        return {

          ok: false,

          error:
            'Kamar ' +
            room +
            ' sedang diproses atau sudah memiliki pendaftaran aktif.'

        };

      }

    }

  }


  /* ----------------------------------------------------------
   * SIAPKAN FIELD TAMBAHAN
   * ----------------------------------------------------------
   */

  djApiEnsureSheetFieldsV5_(
    sheet,
    [
      'Pendaftaran_ID',
      'Timestamp',
      'Nama_Lengkap',
      'Nama_Panggilan',
      'No_HP',
      'Email',
      'NIK_KTP',
      'Pekerjaan',
      'Perusahaan_Instansi',
      'Jenis_Kelamin',
      'Alamat',
      'No_Kamar',
      'Tanggal_Mulai',
      'Tanggal_Mulai_Tinggal',
      'Rencana_Mulai_Sewa',
      'Catatan',
      'Status_Pendaftaran',
      'Tenant_ID',
      'Kontrak_ID',
      'Sumber',
      'Created_At'
    ]
  );


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Pendaftaran_ID'
      ]
    );


  if (!table) {

    return {
      ok: false,
      error:
        'Struktur sheet Pendaftaran tidak dapat dibaca.'
    };

  }


  /* ----------------------------------------------------------
   * GENERATE PENDAFTARAN ID
   * ----------------------------------------------------------
   */

  const registrationId =
    djApiNextRegistrationIdV6_(
      sheet,
      table.headers
    );


  const now =
    new Date();


  const registrationData = {

    Pendaftaran_ID:
      registrationId,

    Timestamp:
      now,

    Nama_Lengkap:
      name,

    Nama_Panggilan:
      nickname,

    No_HP:
      phone,

    Email:
      email,

    NIK_KTP:
      nik,

    Pekerjaan:
      occupation,

    Perusahaan_Instansi:
      company,

    Jenis_Kelamin:
      gender,

    Alamat:
      address,

    No_Kamar:
      room,

    Tanggal_Mulai:
      startDate,

    Tanggal_Mulai_Tinggal:
      startDate,

    Rencana_Mulai_Sewa:
      startDate,

    Catatan:
      notes,

    Status_Pendaftaran:
      'MENUNGGU VERIFIKASI',

    Tenant_ID:
      '',

    Kontrak_ID:
      '',

    Sumber:
      'WEB',

    Created_At:
      now

  };


  djApiAppendRegistrationV6_(
    sheet,
    table.headers,
    registrationData
  );


  SpreadsheetApp.flush();


  return {

    ok:
      true,

    pendaftaranId:
      registrationId,

    id:
      registrationId,

    status:
      'MENUNGGU VERIFIKASI',

    nama:
      name,

    kamar:
      room,

    message:
      'Pendaftaran berhasil dikirim dan menunggu verifikasi Master.'

  };

}


/* ============================================================
 * NEXT REGISTRATION ID
 * ============================================================
 */

function djApiNextRegistrationIdV6_(
  sheet,
  headers
) {

  const col =
    djApiFindColumnV5_(
      headers,
      [
        'Pendaftaran_ID'
      ]
    );


  let max =
    0;


  if (
    col >= 0 &&
    sheet.getLastRow() >= 1
  ) {

    const values =
      sheet
        .getRange(
          1,
          col + 1,
          sheet.getLastRow(),
          1
        )
        .getValues();


    values.forEach(
      function(row) {

        const match =
          String(
            row[0] ||
            ''
          )
          .match(
            /^(?:REG-)?(\d+)$/i
          );


        if (match) {

          max =
            Math.max(
              max,
              Number(
                match[1]
              )
            );

        }

      }
    );

  }


  /*
   * Untuk kompatibilitas dengan ID lama seperti
   * REG-QPE_YHPNHOAGHEBNBX, gunakan format random
   * bila belum ada ID numerik.
   */

  let id =
    '';


  if (
    max > 0
  ) {

    id =
      'REG-' +
      String(
        max + 1
      ).padStart(
        3,
        '0'
      );

  } else {

    id =
      'REG-' +
      Utilities.getUuid()
        .replace(
          /-/g,
          ''
        )
        .slice(
          0,
          18
        )
        .toUpperCase();

  }


  return id;

}


/* ============================================================
 * APPEND REGISTRATION ROW
 * ============================================================
 */

function djApiAppendRegistrationV6_(
  sheet,
  headers,
  data
) {

  const row =
    headers.map(
      function(header) {

        const key =
          djApiCanonV5_(
            header
          );


        if (
          key === 'pendaftaranid'
        ) {
          return data.Pendaftaran_ID || '';
        }

        if (
          key === 'timestamp' ||
          key === 'timestampsubmit'
        ) {
          return data.Timestamp || '';
        }

        if (
          key === 'namalengkap'
        ) {
          return data.Nama_Lengkap || '';
        }

        if (
          key === 'namapanggilan'
        ) {
          return data.Nama_Panggilan || '';
        }

        if (
          key === 'nohp'
        ) {
          return data.No_HP || '';
        }

        if (
          key === 'email'
        ) {
          return data.Email || '';
        }

        if (
          key === 'niktkp' ||
          key === 'nikkpt' ||
          key === 'niktp'
        ) {
          return data.NIK_KTP || '';
        }

        if (
          key === 'nikktp'
        ) {
          return data.NIK_KTP || '';
        }

        if (
          key === 'pekerjaan'
        ) {
          return data.Pekerjaan || '';
        }

        if (
          key === 'perusahaaninstansi' ||
          key === 'perusahaan' ||
          key === 'perusahaaninst'
        ) {
          return data.Perusahaan_Instansi || '';
        }

        if (
          key === 'jeniskelamin'
        ) {
          return data.Jenis_Kelamin || '';
        }

        if (
          key === 'alamat'
        ) {
          return data.Alamat || '';
        }

        if (
          key === 'nokamar'
        ) {
          return data.No_Kamar || '';
        }

        if (
          key === 'tanggalmulai' ||
          key === 'tanggalmulaitinggal' ||
          key === 'rencanamulaisewa' ||
          key === 'tanggalsubmitted'
        ) {
          return data.Tanggal_Mulai || '';
        }

        if (
          key === 'catatan'
        ) {
          return data.Catatan || '';
        }

        if (
          key === 'statuspendaftaran'
        ) {
          return data.Status_Pendaftaran || '';
        }

        if (
          key === 'tenantid'
        ) {
          return data.Tenant_ID || '';
        }

        if (
          key === 'kontrakid'
        ) {
          return data.Kontrak_ID || '';
        }

        if (
          key === 'sumber' ||
          key === 'source'
        ) {
          return data.Sumber || '';
        }

        if (
          key === 'createdat'
        ) {
          return data.Created_At || '';
        }

        return '';

      }
    );


  sheet
    .getRange(
      sheet.getLastRow() + 1,
      1,
      1,
      row.length
    )
    .setValues(
      [row]
    );

}


/* ============================================================
 * ROOM LOOKUP
 * ============================================================
 */

function djApiMasterApproveRegistrationV6_(
  registrationId,
  finalRoom,
  masterId
) {

  const lock =
    LockService.getScriptLock();


  lock.waitLock(15000);


  try {

    const ss =
      SpreadsheetApp
        .getActiveSpreadsheet();


    const cleanRegistrationId =
      String(
        registrationId || ''
      )
      .trim();


    const cleanFinalRoom =
      String(
        finalRoom || ''
      )
      .trim();


    if (!cleanRegistrationId) {

      throw new Error(
        'Pendaftaran_ID wajib diisi.'
      );

    }


    if (!/^\d{3,4}$/.test(cleanFinalRoom)) {

      throw new Error(
        'Kamar final tidak valid.'
      );

    }


    const registrationSheet =
      ss.getSheetByName(
        'Pendaftaran'
      );


    const roomSheet =
      ss.getSheetByName(
        'Kamar'
      );


    if (!registrationSheet) {

      throw new Error(
        'Sheet Pendaftaran tidak ditemukan.'
      );

    }


    if (!roomSheet) {

      throw new Error(
        'Sheet Kamar tidak ditemukan.'
      );

    }


    /* --------------------------------------------------------
     * REGISTER FIELDS
     * --------------------------------------------------------
     */

    djApiEnsureSheetFieldsV5_(
      registrationSheet,
      [
        'Kamar_Diminati',
        'Kamar_Final',
        'Harga_Final',
        'Status_Akun',
        'Disetujui_Oleh',
        'Tanggal_Persetujuan',
        'Catatan_Verifikasi',
        'Email_Persetujuan_Status',
        'Email_Persetujuan_Tanggal'
      ]
    );


    const registrationTable =
      djApiReadTableV5_(
        registrationSheet,
        [
          'Pendaftaran_ID'
        ]
      );


    const registrationRow =
      djApiFindRowV5_(
        registrationTable,
        [
          'Pendaftaran_ID'
        ],
        cleanRegistrationId
      );


    if (
      registrationRow < 0
    ) {

      throw new Error(
        'Pendaftaran tidak ditemukan: ' +
        cleanRegistrationId
      );

    }


    const registrationHeaders =
      djApiFindHeadersV5_(
        registrationSheet
      );


    const registrationDataRow =
      registrationSheet
        .getRange(
          registrationRow,
          1,
          1,
          registrationHeaders.length
        )
        .getValues()[0];


    const currentStatus =
      String(
        registrationDataRow[
          djApiFindColumnV5_(
            registrationHeaders,
            [
              'Status_Pendaftaran'
            ]
          )
        ] || ''
      )
      .trim()
      .toUpperCase();


    if (
      currentStatus !==
      'MENUNGGU VERIFIKASI'
    ) {

      throw new Error(
        'Pendaftaran sudah diproses. Status saat ini: ' +
        (currentStatus || 'KOSONG')
      );

    }


    const name =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Nama_Lengkap'
          ]
        ) || ''
      ).trim();


    const requestedRoom =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'No_Kamar'
          ]
        ) || ''
      ).trim();
    const phone =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'No_HP'
          ]
        ) || ''
      ).trim();


    const email =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Email'
          ]
        ) || ''
      ).trim();

    /* --------------------------------------------------------
     * ROOM VALIDATION
     * --------------------------------------------------------
     */

    const roomTable =
      djApiReadTableV5_(
        roomSheet,
        [
          'No_Kamar',
          'Status'
        ]
      );


    if (!roomTable) {

      throw new Error(
        'Struktur sheet Kamar tidak dapat dibaca.'
      );

    }


    const roomCol =
      djApiFindColumnV5_(
        roomTable.headers,
        [
          'No_Kamar'
        ]
      );


    const roomStatusCol =
      djApiFindColumnV5_(
        roomTable.headers,
        [
          'Status'
        ]
      );


    const roomPriceCol =
      djApiFindColumnV5_(
        roomTable.headers,
        [
          'Harga_Bulan',
          'Harga_Sewa',
          'Harga'
        ]
      );


    const roomTenantCol =
      djApiFindColumnV5_(
        roomTable.headers,
        [
          'Tenant_ID'
        ]
      );


    const roomNameCol =
      djApiFindColumnV5_(
        roomTable.headers,
        [
          'Nama_Tenant'
        ]
      );


    let roomRowNumber =
      -1;

    let roomStatus =
      '';

    let roomPrice =
      0;


    for (
      let i = 0;
      i < roomTable.rows.length;
      i++
    ) {

      const row =
        roomTable.rows[i];

      const roomNumber =
        String(
          row[roomCol] || ''
        ).trim();


      if (
        roomNumber !==
        cleanFinalRoom
      ) {

        continue;

      }


      roomRowNumber =
        roomTable.headerRow +
        1 +
        i;

      roomStatus =
        String(
          row[roomStatusCol] || ''
        )
        .trim()
        .toUpperCase();

      roomPrice =
        roomPriceCol >= 0
          ? djApiNumberV5_(
              row[roomPriceCol]
            )
          : 0;

      break;

    }


    if (
      roomRowNumber < 0
    ) {

      throw new Error(
        'Kamar final tidak ditemukan: ' +
        cleanFinalRoom
      );

    }


    if (
      roomStatus !==
      'KOSONG'
    ) {

      throw new Error(
        'Kamar ' +
        cleanFinalRoom +
        ' tidak dapat dipilih. Status saat ini: ' +
        roomStatus
      );

    }


    if (
      roomPrice <= 0
    ) {

      throw new Error(
        'Kamar ' +
        cleanFinalRoom +
        ' belum memiliki harga sewa.'
      );

    }


    /* --------------------------------------------------------
     * CEK RESERVASI LAIN
     * --------------------------------------------------------
     */

    for (
      let i = 0;
      i < registrationTable.rows.length;
      i++
    ) {

      const otherRow =
        registrationTable.rows[i];


      const otherId =
        String(
          djApiValueV5_(
            otherRow,
            registrationTable.headers,
            [
              'Pendaftaran_ID'
            ]
          ) || ''
        ).trim();


      if (
        otherId ===
        cleanRegistrationId
      ) {

        continue;

      }


      const otherStatus =
        String(
          djApiValueV5_(
            otherRow,
            registrationTable.headers,
            [
              'Status_Pendaftaran'
            ]
          ) || ''
        )
        .trim()
        .toUpperCase();


      if (
        otherStatus !==
        'MENUNGGU AKTIVASI AKUN'
      ) {

        continue;

      }


      const otherFinalRoom =
        String(
          djApiValueV5_(
            otherRow,
            registrationTable.headers,
            [
              'Kamar_Final'
            ]
          ) || ''
        ).trim();


      if (
        otherFinalRoom ===
        cleanFinalRoom
      ) {

        throw new Error(
          'Kamar ' +
          cleanFinalRoom +
          ' sudah dipesan untuk calon tenant lain.'
        );

      }

    }


    /* --------------------------------------------------------
     * SAVE REGISTRATION
     * --------------------------------------------------------
     */

    const oldRequestedRoom =
      requestedRoom ||
      cleanFinalRoom;


    djApiUpdateRowV5_(
      registrationSheet,
      registrationRow,
      registrationHeaders,
      {

        Kamar_Diminati:
          oldRequestedRoom,

        Kamar_Final:
          cleanFinalRoom,

        No_Kamar:
          cleanFinalRoom,

        Harga_Final:
          roomPrice,

        Status_Pendaftaran:
          'MENUNGGU AKTIVASI AKUN',

        Tenant_ID:
          '',

        Kontrak_ID:
          '',

        Status_Akun:
          'MENUNGGU AKTIVASI',

        Disetujui_Oleh:
          masterId || '',

        Tanggal_Persetujuan:
          new Date(),

        Catatan_Verifikasi:
          'Pendaftaran disetujui. Menunggu aktivasi akun tenant.'

      }
    );


    /* --------------------------------------------------------
     * RESERVE ROOM
     * --------------------------------------------------------
     */

    const roomHeaders =
      djApiFindHeadersV5_(
        roomSheet
      );


    const roomData = {};


    roomData.Status =
      'DIPESAN';


    if (
      roomTenantCol >= 0
    ) {

      roomData.Tenant_ID =
        '';

    }


    if (
      roomNameCol >= 0
    ) {

      roomData.Nama_Tenant =
        name;

    }


    djApiUpdateRowV5_(
      roomSheet,
      roomRowNumber,
      roomHeaders,
      roomData
    );


    let emailStatus =
      'GAGAL';

    let emailError =
      '';


    if (
      email
    ) {

      try {

        djApiSendApprovalEmailV1_(
          email,
          name,
          cleanRegistrationId,
          phone,
          cleanFinalRoom,
          roomPrice
        );

        emailStatus =
          'TERKIRIM';

      } catch (err) {

        emailStatus =
          'GAGAL';

        emailError =
          String(
            err &&
            err.message
              ? err.message
              : err
          )
          .slice(
            0,
            250
          );

      }

    } else {

      emailStatus =
        'GAGAL';

      emailError =
        'Email tenant kosong.';

    }


    djApiUpdateRowV5_(
      registrationSheet,
      registrationRow,
      registrationHeaders,
      {
        Email_Persetujuan_Status:
          emailStatus,

        Email_Persetujuan_Tanggal:
          emailStatus ===
          'TERKIRIM'
            ? new Date()
            : ''
      }
    );


    SpreadsheetApp.flush();


    return {

      ok:
        true,

      pendaftaranId:
        cleanRegistrationId,

      nama:
        name,

      requestedRoom:
        oldRequestedRoom,

      finalRoom:
        cleanFinalRoom,

      room:
        cleanFinalRoom,

      price:
        roomPrice,

      emailSent:
        emailStatus ===
        'TERKIRIM',

      emailStatus:
        emailStatus,

      emailError:
        emailError,

      status:
        'MENUNGGU AKTIVASI AKUN',

      accountStatus:
        'MENUNGGU AKTIVASI',

      message:

        emailStatus ===
        'TERKIRIM'

          ? (
              'Pendaftaran disetujui dan kamar final berhasil ditetapkan. Instruksi aktivasi akun telah dikirim ke email tenant.'
            )

          : (
              'Pendaftaran disetujui dan kamar final berhasil ditetapkan, tetapi email aktivasi gagal terkirim: ' +
              emailError
            )

    };

  } finally {

    lock.releaseLock();

  }

}

/* ============================================================
 * MASTER REJECT REGISTRATION
 * ============================================================
 */


function djApiFindRoomV5_(
  ss,
  roomNumber
) {

  const result = {

    number:
      String(
        roomNumber || ''
      ),

    status:
      '‚Äî',

    price:
      0,

    facilities:
      ''

  };


  const sheet =
    ss.getSheetByName(
      'Kamar'
    );


  if (!sheet) {

    return result;

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'No_Kamar',
        'Status'
      ]
    );


  if (!table) {

    return result;

  }


  const roomCol =
    djApiFindColumnV5_(
      table.headers,
      [
        'No_Kamar',
        'Nomor Kamar',
        'No Kamar'
      ]
    );


  const statusCol =
    djApiFindColumnV5_(
      table.headers,
      [
        'Status'
      ]
    );


  const priceCol =
    djApiFindColumnV5_(
      table.headers,
      [
        'Harga_Bulan',
        'Harga_Sewa',
        'Harga'
      ]
    );


  const facilitiesCol =
    djApiFindColumnV5_(
      table.headers,
      [
        'Fasilitas'
      ]
    );


  for (
    let i = 0;
    i < table.rows.length;
    i++
  ) {

    if (
      String(
        table.rows[i][roomCol] || ''
      ).trim()
      !==
      String(
        roomNumber || ''
      ).trim()
    ) {

      continue;

    }


    result.number =
      String(
        table.rows[i][roomCol] || ''
      ).trim();


    if (
      statusCol >= 0
    ) {

      result.status =
        String(
          table.rows[i][statusCol] || ''
        ).trim();

    }


    if (
      priceCol >= 0
    ) {

      result.price =
        djApiNumberV5_(
          table.rows[i][priceCol]
        );

    }


    if (
      facilitiesCol >= 0
    ) {

      result.facilities =
        String(
          table.rows[i][facilitiesCol] || ''
        ).trim();

    }


    break;

  }


  return result;

}


/* ============================================================
 * CONTRACT
 * ============================================================
 */
function djApiFindContractV5_(
  ss,
  tenantId
) {

  const sheet =
    ss.getSheetByName(
      'Kontrak'
    );


  if (!sheet) {

    return null;

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Tenant_ID'
      ]
    );


  if (!table) {

    return null;

  }


  const tenantCol =
    djApiFindColumnV5_(
      table.headers,
      [
        'Tenant_ID'
      ]
    );


  if (
    tenantCol < 0
  ) {

    return null;

  }


  for (
    let i = 0;
    i < table.rows.length;
    i++
  ) {

    if (
      String(
        table.rows[i][tenantCol] || ''
      ).trim()
      !==
      String(
        tenantId || ''
      ).trim()
    ) {

      continue;

    }


    const status =
      String(
        djApiValueV5_(
          table.rows[i],
          table.headers,
          [
            'Status_Kontrak'
          ]
        ) || ''
      )
      .trim()
      .toUpperCase();


    if (
      status &&
      status !== 'AKTIF'
    ) {

      continue;

    }


    return {

      id:
        djApiValueV5_(
          table.rows[i],
          table.headers,
          [
            'Kontrak_ID'
          ]
        ),

      room:
        djApiValueV5_(
          table.rows[i],
          table.headers,
          [
            'No_Kamar'
          ]
        ),

      amount:
        djApiNumberV5_(
          djApiValueV5_(
            table.rows[i],
            table.headers,
            [
              'Harga_Sewa',
              'Harga_Bulan'
            ]
          )
        ),

      deposit:
        djApiNumberV5_(
          djApiValueV5_(
            table.rows[i],
            table.headers,
            [
              'Deposit'
            ]
          )
        ),

      startDate:
        djApiValueV5_(
          table.rows[i],
          table.headers,
          [
            'Tanggal_Mulai'
          ]
        ),

      endDate:
        djApiValueV5_(
          table.rows[i],
          table.headers,
          [
            'Tanggal_Berakhir'
          ]
        ),

      status:
        status

    };

  }


  return null;

}


/* ============================================================
 * BILLING
 * ============================================================
 */
function djApiFindBillingV5_(
  ss,
  tenantId,
  contract
) {

  const now =
    new Date();


  const period =
    djApiPeriodLabelV5_(
      now
    );


  const due =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );


  const rent =
    Number(
      contract &&
      contract.amount || 0
    );


  const sheet =
    ss.getSheetByName(
      'Pembayaran'
    );


  let payment =
    null;


  if (sheet) {

    const table =
      djApiReadTableV5_(
        sheet,
        [
          'Tenant_ID'
        ]
      );


    if (table) {

      const tenantCol =
        djApiFindColumnV5_(
          table.headers,
          [
            'Tenant_ID'
          ]
        );


      for (
        let i = 0;
        i < table.rows.length;
        i++
      ) {

        if (
          String(
            table.rows[i][tenantCol] || ''
          ).trim()
          !==
          String(
            tenantId
          ).trim()
        ) {

          continue;

        }


        const rowPeriod =
          djApiValueV5_(
            table.rows[i],
            table.headers,
            [
              'Periode',
              'Periode_Pembayaran'
            ]
          );


        if (
          !djApiPeriodMatchesV5_(
            rowPeriod,
            now
          )
        ) {

          continue;

        }


        payment = {

          id:
            djApiValueV5_(
              table.rows[i],
              table.headers,
              [
                'Payment_ID',
                'Pembayaran_ID'
              ]
            ),

          amount:
            djApiNumberV5_(
              djApiValueV5_(
                table.rows[i],
                table.headers,
                [
                  'Nominal_Sewa',
                  'Tarif_Kamar'
                ]
              )
            ),

          paid:
            djApiNumberV5_(
              djApiValueV5_(
                table.rows[i],
                table.headers,
                [
                  'Nominal_Dibayar'
                ]
              )
            ),

          fine:
            djApiNumberV5_(
              djApiValueV5_(
                table.rows[i],
                table.headers,
                [
                  'Denda',
                  'Denda_Terhitung'
                ]
              )
            ),

          paidDate:
            djApiValueV5_(
              table.rows[i],
              table.headers,
              [
                'Tanggal_Pembayaran',
                'Tanggal_Bayar'
              ]
            ),

          status:
            djApiValueV5_(
              table.rows[i],
              table.headers,
              [
                'Status_Pembayaran'
              ]
            ) ||
            'BELUM BAYAR',

          verification:
            djApiValueV5_(
              table.rows[i],
              table.headers,
              [
                'Status_Verifikasi'
              ]
            ) ||
            ''

        };


        break;

      }

    }

  }


  const actualRent =
    payment &&
    payment.amount > 0
      ? payment.amount
      : rent;


  /*
   * ----------------------------------------------------------
   * ATURAN BILLING PERTAMA
   * ----------------------------------------------------------
   * Tenant baru tidak dikenakan denda pada bulan pertama
   * sejak tanggal mulai kontrak.
   * ----------------------------------------------------------
   */
  const firstBillingPeriod =
    djApiIsFirstBillingPeriodV5_(
      contract &&
      contract.startDate,
      due
    );


  /*
   * ----------------------------------------------------------
   * DENDA DINAMIS SESUAI PAYMENT ENGINE DJ39 V2
   * ----------------------------------------------------------
   * Jatuh tempo setiap tanggal 1.
   * Hari 2-4  : Rp25.000
   * Hari 5+   : Rp50.000
   * Maksimum  : Rp50.000
   *
   * Untuk pembayaran yang sudah dikirim, tanggal pembayaran
   * menjadi reference date. Jika belum ada pembayaran,
   * gunakan tanggal hari ini. Billing pertama tetap Rp0.
   * ----------------------------------------------------------
   */
  const billingReferenceDate =
    payment &&
    payment.paidDate
      ? djApiParseDateV7_(
          payment.paidDate
        )
      : now;

  let calculatedFine =
    0;

  if (
    !firstBillingPeriod &&
    billingReferenceDate &&
    due
  ) {

    const lateDays =
      Math.max(
        0,
        Math.floor(
          (
            new Date(
              billingReferenceDate.getFullYear(),
              billingReferenceDate.getMonth(),
              billingReferenceDate.getDate()
            ).getTime() -
            new Date(
              due.getFullYear(),
              due.getMonth(),
              due.getDate()
            ).getTime()
          ) /
          86400000
        )
      );

    if (
      lateDays >= 4
    ) {

      calculatedFine =
        50000;

    } else if (
      lateDays >= 1
    ) {

      calculatedFine =
        25000;

    }

  }

  const displayedFine =
    calculatedFine;


  const displayedTotal =
    actualRent +
    displayedFine;


  let displayedStatus =
    payment
      ? payment.status
      : 'BELUM BAYAR';


  const verification =
    String(
      payment &&
      payment.verification ||
      ''
    )
    .trim()
    .toUpperCase();


  if (
    verification ===
    'TERVERIFIKASI'
  ) {

    if (
      displayedTotal > 0 &&
      payment.paid >= displayedTotal
    ) {

      displayedStatus =
        'LUNAS';

    } else if (
      payment.paid > 0 &&
      displayedTotal > 0
    ) {

      displayedStatus =
        'KURANG BAYAR';

    }

  }


  return {

    period:
      period,

    dueDate:
      Utilities.formatDate(
        due,
        Session.getScriptTimeZone() ||
        'Asia/Jakarta',
        'dd/MM/yyyy'
      ),

    amount:
      actualRent,

    paidAmount:
      payment
        ? payment.paid
        : 0,

    fine:
      displayedFine,

    total:
      displayedTotal,

    status:
      displayedStatus,

    verification:
      verification

  };

}

/* ============================================================
 * PAYMENT SUBMIT
 * ============================================================
 */
function djApiSubmitPaymentV5_(
  tenant,
  body
) {

  const lock =
    LockService
      .getDocumentLock();


  lock.waitLock(
    30000
  );


  try {

    const ss =
      SpreadsheetApp
        .getActiveSpreadsheet();


    const sheet =
      ss.getSheetByName(
        'Pembayaran'
      );


    if (!sheet) {

      return {

        ok: false,

        error:
          'Sheet Pembayaran tidak ditemukan.'

      };

    }


    const periodInput =
      String(
        body.period || ''
      ).trim();


    const paymentDateInput =
      String(
        body.paymentDate || ''
      ).trim();


    const amount =
      djApiNumberV5_(
        body.amount
      );


    const method =
      String(
        body.method || ''
      ).trim();


    const proofBase64 =
      String(
        body.proofBase64 || ''
      ).trim();


    const proofMimeType =
      String(
        body.proofMimeType || ''
      ).trim();


    const proofOriginalName =
      String(
        body.proofOriginalName || ''
      ).trim();


    const note =
      String(
        body.note || ''
      )
      .trim()
      .slice(
        0,
        500
      );


    if (
      !/^\d{4}-\d{2}$/.test(
        periodInput
      )
    ) {

      return {

        ok: false,

        error:
          'Periode pembayaran tidak valid.'

      };

    }


    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(
        paymentDateInput
      )
    ) {

      return {

        ok: false,

        error:
          'Tanggal pembayaran tidak valid.'

      };

    }


    if (!method) {

      return {

        ok: false,

        error:
          'Metode pembayaran wajib dipilih.'

      };

    }


    if (
      amount <= 0
    ) {

      return {

        ok: false,

        error:
          'Nominal pembayaran tidak valid.'

      };

    }


    if (!proofBase64) {

      return {

        ok: false,

        error:
          'Foto bukti pembayaran wajib diupload.'

      };

    }


    const year =
      Number(
        periodInput.substring(
          0,
          4
        )
      );


    const month =
      Number(
        periodInput.substring(
          5,
          7
        )
      );


    const periodDate =
      new Date(
        year,
        month - 1,
        1
      );


    const currentMonth =
      new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );


    if (
      periodDate >
      currentMonth
    ) {

      return {

        ok: false,

        error:
          'Pembayaran bulan yang belum berjalan tidak diperbolehkan.'

      };

    }


    const paymentDate =
      new Date(
        paymentDateInput +
        'T00:00:00'
      );


    const today =
      new Date();


    today.setHours(
      23,
      59,
      59,
      999
    );


    if (
      paymentDate >
      today
    ) {

      return {

        ok: false,

        error:
          'Tanggal pembayaran tidak boleh melebihi hari ini.'

      };

    }


    const contract =
      djApiFindContractV5_(
        ss,
        tenant.tenantId
      );


    if (!contract) {

      return {

        ok: false,

        error:
          'Kontrak aktif tenant tidak ditemukan.'

      };

    }


    const rent =
      Number(
        contract.amount || 0
      );


    if (
      rent <= 0
    ) {

      return {

        ok: false,

        error:
          'Harga sewa kontrak tidak valid.'

      };

    }


    const due =
      new Date(
        year,
        month - 1,
        1
      );


    const firstBillingPeriod =
      djApiIsFirstBillingPeriodV5_(
        contract.startDate,
        due
      );


    const daysLate =
      Math.max(
        0,
        Math.floor(
          (
            paymentDate.getTime() -
            due.getTime()
          ) /
          86400000
        )
      );


    let fine =
      0;


    if (
      !firstBillingPeriod
    ) {

      if (
        daysLate >= 4
      ) {

        fine =
          50000;

      } else if (
        daysLate >= 1
      ) {

        fine =
          25000;

      }

    }


    const total =
      rent +
      fine;


    const headers =
      djApiEnsurePaymentColumnsV5_(
        sheet
      );


    const table =
      djApiReadTableV5_(
        sheet,
        [
          'Tenant_ID'
        ]
      );


    let existingRow =
      -1;


    if (table) {

      const tenantCol =
        djApiFindColumnV5_(
          table.headers,
          [
            'Tenant_ID'
          ]
        );


      for (
        let i = 0;
        i < table.rows.length;
        i++
      ) {

        if (
          String(
            table.rows[i][tenantCol] || ''
          ).trim()
          !==
          String(
            tenant.tenantId
          ).trim()
        ) {

          continue;

        }


        const rowPeriod =
          djApiValueV5_(
            table.rows[i],
            table.headers,
            [
              'Periode',
              'Periode_Pembayaran'
            ]
          );


        if (
          djApiPeriodMatchesValuesV5_(
            rowPeriod,
            year,
            month
          )
        ) {

          existingRow =
            table.headerRow +
            1 +
            i;

          break;

        }

      }

    }


    let paymentId =
      '';


    if (
      existingRow > 0
    ) {

      paymentId =
        String(
          djApiCellV5_(
            sheet,
            existingRow,
            headers,
            [
              'Payment_ID',
              'Pembayaran_ID'
            ]
          ) || ''
        ).trim();

    }


    if (!paymentId) {

      paymentId =
        djApiNextPaymentIdV5_(
          sheet,
          headers
        );

    }


    if (
      existingRow > 0
    ) {

      const existingVerify =
        String(
          djApiCellV5_(
            sheet,
            existingRow,
            headers,
            [
              'Status_Verifikasi'
            ]
          ) || ''
        )
        .trim()
        .toUpperCase();


      if (
        existingVerify ===
        'TERVERIFIKASI'
      ) {

        return {

          ok: false,

          error:
            'Pembayaran untuk periode tersebut sudah terverifikasi.'

        };

      }

    }


    const proof =
      djApiSavePaymentProofV5_(
        proofBase64,
        proofMimeType,
        proofOriginalName,
        tenant.tenantId,
        paymentId
      );


    if (
      !proof ||
      !proof.ok
    ) {

      return {

        ok: false,

        error:
          proof &&
          proof.error
            ? proof.error
            : 'Foto bukti gagal disimpan.'

      };

    }


    const data = {

      Payment_ID:
        paymentId,

      Pembayaran_ID:
        paymentId,

      Source_Key:
        'WEB#' +
        tenant.tenantId +
        '#' +
        periodInput,

      Tenant_ID:
        tenant.tenantId,

      No_Kamar:
        tenant.room,

      Nama_Tenant:
        tenant.name ||
        tenant.nama ||
        '',

      No_HP:
        djApiFindPhoneV5_(
          ss,
          tenant.tenantId
        ),

      Periode:
        djApiPeriodLabelV5_(
          periodDate
        ),

      Periode_Pembayaran:
        djApiPeriodLabelV5_(
          periodDate
        ),

      Timestamp_Submit:
        new Date(),

      Tanggal_Pembayaran:
        paymentDate,

      Tanggal_Bayar:
        paymentDate,

      Jatuh_Tempo:
        due,

      Tanggal_Jatuh_Tempo:
        due,

      Tarif_Kamar:
        rent,

      Nominal_Sewa:
        rent,

      Nominal_Dibayar:
        amount,

      Denda:
        fine,

      Denda_Terhitung:
        fine,

      Total_Tagihan:
        total,

      Selisih:
        amount -
        total,

      Status_Pembayaran:
        amount > 0 &&
        amount < total
          ? 'KURANG BAYAR'
          : 'MENUNGGU VERIFIKASI',

      Status_Verifikasi:
        'MENUNGGU VERIFIKASI',

      Metode_Pembayaran:
        method,

      Bukti_Pembayaran_URL:
        proof.fileUrl,

      Bukti_Pembayaran_Foto:
        proof.fileUrl,

      Bukti_File_ID:
        proof.fileId,

      Keterangan:
        note,

      Last_Sync:
        new Date()

    };


    if (
      existingRow > 0
    ) {

      djApiUpdateRowV5_(
        sheet,
        existingRow,
        headers,
        data
      );

    } else {

      djApiAppendRowV5_(
        sheet,
        headers,
        data
      );

    }


    SpreadsheetApp.flush();


    return {

      ok:
        true,

      paymentId:
        paymentId,

      total:
        total,

      paidAmount:
        amount,

      status:
        amount > 0 &&
        amount < total
          ? 'KURANG BAYAR'
          : 'MENUNGGU VERIFIKASI',

      verification:
        'MENUNGGU VERIFIKASI',

      message:
        'Pembayaran berhasil dikirim dan menunggu verifikasi Master.'

    };

  } finally {

    lock.releaseLock();

  }

}


/* ============================================================
 * PAYMENT PROOF SAVE
 * ============================================================
 */
function djApiSavePaymentProofV5_(
  base64,
  mimeType,
  originalName,
  tenantId,
  paymentId
) {

  try {

    if (!base64) {

      return {

        ok: false,

        error:
          'Foto bukti kosong.'

      };

    }


    base64 =
      String(
        base64
      )
      .replace(
        /^data:[^;]+;base64,/,
        ''
      )
      .replace(
        /\s/g,
        ''
      );


    const bytes =
      Utilities.base64Decode(
        base64
      );


    if (
      bytes.length >
      8 * 1024 * 1024
    ) {

      return {

        ok: false,

        error:
          'Ukuran foto terlalu besar. Maksimal 8 MB.'

      };

    }


    let safeMime =
      String(
        mimeType ||
        'image/jpeg'
      )
      .toLowerCase();


    if (
      safeMime !== 'image/jpeg' &&
      safeMime !== 'image/png' &&
      safeMime !== 'image/webp'
    ) {

      safeMime =
        'image/jpeg';

    }


    let extension =
      '.jpg';


    if (
      safeMime ===
      'image/png'
    ) {

      extension =
        '.png';

    } else if (
      safeMime ===
      'image/webp'
    ) {

      extension =
        '.webp';

    }


    const safeOriginal =
      String(
        originalName || ''
      )
      .replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );


    const fileName =
      'BUKTI-' +
      paymentId +
      '-' +
      tenantId +
      '-' +
      Date.now() +
      '-' +
      (
        safeOriginal ||
        'transfer' +
        extension
      );


    const blob =
      Utilities.newBlob(
        bytes,
        safeMime,
        fileName
      );


    const rootFolder =
      djApiGetOrCreateFolderV5_(
        null,
        'DJ Family Kost'
      );


    const paymentFolder =
      djApiGetOrCreateFolderV5_(
        rootFolder,
        'Pembayaran'
      );


    const tenantFolder =
      djApiGetOrCreateFolderV5_(
        paymentFolder,
        String(
          tenantId
        )
      );


    const file =
      tenantFolder.createFile(
        blob
      );


    return {

      ok:
        true,

      fileId:
        file.getId(),

      fileUrl:
        file.getUrl(),

      fileName:
        file.getName()

    };

  } catch (err) {

    return {

      ok: false,

      error:
        'Gagal menyimpan foto bukti pembayaran: ' +
        (
          err &&
          err.message
            ? err.message
            : err
        )

    };

  }

}


/* ============================================================
 * MAINTENANCE SUBMIT
 * ============================================================
 */
function djApiSubmitMaintenanceV5_(
  tenant,
  body
) {

  const lock =
    LockService.getDocumentLock();


  lock.waitLock(
    30000
  );


  try {

    const ss =
      SpreadsheetApp
        .getActiveSpreadsheet();


    const sheet =
      ss.getSheetByName(
        'Maintenance'
      );


    if (!sheet) {

      return {

        ok: false,

        error:
          'Sheet Maintenance tidak ditemukan.'

      };

    }


    const tenantId =
      String(
        tenant.tenantId || ''
      )
      .trim()
      .toUpperCase();


    const tenantName =
      String(
        tenant.name ||
        tenant.nama ||
        ''
      ).trim();


    const room =
      String(
        tenant.room ||
        tenant.kamar ||
        ''
      ).trim();


    if (!tenantId) {

      return {

        ok: false,

        error:
          'Tenant ID tidak ditemukan.'

      };

    }


    if (!room) {

      return {

        ok: false,

        error:
          'Nomor kamar tidak ditemukan dari akun tenant.'

      };

    }


    const location =
      String(
        body.location || ''
      ).trim();


    const problemType =
      String(
        body.problemType || ''
      ).trim();


    const urgency =
      String(
        body.urgency || ''
      ).trim();


    const allowEntry =
      String(
        body.allowEntry || ''
      ).trim();


    const comfortableTime =
      String(
        body.comfortableTime || ''
      ).trim();


    const description =
      String(
        body.description || ''
      ).trim();


    const photoBase64 =
      String(
        body.photoBase64 || ''
      ).trim();


    const photoMimeType =
      String(
        body.photoMimeType ||
        'image/jpeg'
      ).trim();


    const photoOriginalName =
      String(
        body.photoOriginalName ||
        ''
      ).trim();


    if (!location) {

      return {

        ok: false,

        error:
          'Lokasi masalah wajib diisi.'

      };

    }


    if (!problemType) {

      return {

        ok: false,

        error:
          'Jenis masalah wajib dipilih.'

      };

    }


    if (!urgency) {

      return {

        ok: false,

        error:
          'Urgensi wajib dipilih.'

      };

    }


    if (!description) {

      return {

        ok: false,

        error:
          'Deskripsi masalah wajib diisi.'

      };

    }


    if (!photoBase64) {

      return {

        ok: false,

        error:
          'Foto kerusakan wajib diupload.'

      };

    }


    const info =
      djApiReadTableV5_(
        sheet,
        [
          'Maintenance_ID'
        ]
      );


    if (!info) {

      return {

        ok: false,

        error:
          'Header sheet Maintenance tidak ditemukan.'

      };

    }


    let headers =
      info.headers.slice();


    headers =
      djApiEnsureFieldsV5_(
        sheet,
        info.headerRow,
        headers,
        [

          'Maintenance_ID',

          'Source_Key',

          'Timestamp_Submit',

          'No_Kamar',

          'Nama_Tenant',

          'No_HP',

          'Lokasi_Masalah',

          'Jenis_Masalah',

          'Deskripsi',

          'Urgensi',

          'Foto_Kerusakan_URL',

          'Izin_Masuk',

          'Waktu_Nyaman',

          'Status',

          'PIC',

          'Tanggal_Tindak_Lanjut',

          'Foto_Sesudah_URL',

          'Biaya',

          'Catatan_Penyelesaian',

          'Last_Sync',

          'Foto_Kerusakan_File_ID',

          'Foto_Kerusakan_File_Name'

        ]
      );


    const maintenanceId =
      djApiNextMaintenanceIdV5_(
        sheet,
        headers
      );


    const photo =
      djApiSaveMaintenancePhotoV5_(
        photoBase64,
        photoMimeType,
        photoOriginalName,
        tenantId,
        maintenanceId
      );


    if (
      !photo ||
      !photo.ok
    ) {

      return {

        ok: false,

        error:
          photo &&
          photo.error
            ? photo.error
            : 'Foto kerusakan gagal disimpan.'

      };

    }


    const phone =
      djApiFindPhoneV5_(
        ss,
        tenantId
      );


    const data = {

      Maintenance_ID:
        maintenanceId,

      Source_Key:
        'WEB#' +
        tenantId +
        '#' +
        Date.now(),

      Timestamp_Submit:
        new Date(),

      No_Kamar:
        room,

      Nama_Tenant:
        tenantName,

      No_HP:
        phone,

      Lokasi_Masalah:
        location,

      Jenis_Masalah:
        problemType,

      Deskripsi:
        description,

      Urgensi:
        urgency,

      Foto_Kerusakan_URL:
        photo.fileUrl,

      Izin_Masuk:
        allowEntry,

      Waktu_Nyaman:
        comfortableTime,

      Status:
        'OPEN',

      PIC:
        '',

      Tanggal_Tindak_Lanjut:
        '',

      Foto_Sesudah_URL:
        '',

      Biaya:
        0,

      Catatan_Penyelesaian:
        '',

      Last_Sync:
        new Date(),

      Foto_Kerusakan_File_ID:
        photo.fileId,

      Foto_Kerusakan_File_Name:
        photo.fileName

    };


    djApiAppendRowV5_(
      sheet,
      headers,
      data
    );


    SpreadsheetApp.flush();


    try {

      djApiLogV5_(
        ss,
        'MAINTENANCE_SUBMIT',
        'Tenant ' +
        tenantId +
        ' membuat laporan ' +
        maintenanceId +
        ' kamar ' +
        room
      );

    } catch (logError) {}
    /* ========================================================
     * EMAIL OTOMATIS — MAINTENANCE DITERIMA
     * ========================================================
     *
     * Email gagal TIDAK boleh membuat submit maintenance gagal.
     * Data maintenance sudah tersimpan terlebih dahulu.
     * ========================================================
     */

    try {

      const maintenanceEmailResult =
        dj39EmailSendMaintenanceReceivedOnceV1_(
          tenantId,
          {

            maintenanceId:
              maintenanceId,

            name:
              tenantName,

            room:
              room,

            problem:
              problemType +
              (
                location
                  ? ' - ' +
                    location
                  : ''
              )

          }
        );

      Logger.log(
        'EMAIL MAINTENANCE RECEIVED | ' +
        maintenanceId +
        ' | ' +
        maintenanceEmailResult.status +
        (
          maintenanceEmailResult.error
            ? ' | ' +
              maintenanceEmailResult.error
            : ''
        )
      );

    } catch (emailError) {

      Logger.log(
        'EMAIL MAINTENANCE RECEIVED GAGAL | ' +
        maintenanceId +
        ' | ' +
        String(
          emailError &&
          emailError.message
            ? emailError.message
            : emailError
        )
      );

    }

    return {

      ok:
        true,

      maintenanceId:
        maintenanceId,

      status:
        'OPEN',

      message:
        'Laporan maintenance berhasil dikirim. Status: OPEN.'

    };

  } finally {

    lock.releaseLock();

  }

}


/* ============================================================
 * MAINTENANCE HISTORY
 * ============================================================
 */
function djApiMaintenanceHistoryV5_(
  tenant
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Maintenance'
    );


  if (!sheet) {

    return {

      items: []

    };

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Maintenance_ID'
      ]
    );


  if (!table) {

    return {

      items: []

    };

  }


  const tenantId =
    String(
      tenant.tenantId || ''
    )
    .trim()
    .toUpperCase();


  const items =
    [];


  table.rows.forEach(
    function(row) {

      const rowTenantId =
        String(
          djApiValueV5_(
            row,
            table.headers,
            [
              'Tenant_ID'
            ]
          ) || ''
        )
        .trim()
        .toUpperCase();


      /*
       * Beberapa database Maintenance lama
       * mungkin belum memiliki Tenant_ID.
       *
       * Dalam kondisi itu kita cocokkan
       * nama/kamar.
       */

      let belongs =
        rowTenantId ===
        tenantId;


      if (!belongs) {

        const rowName =
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Nama_Tenant'
              ]
            ) || ''
          )
          .trim()
          .toLowerCase();


        const tenantName =
          String(
            tenant.name ||
            tenant.nama ||
            ''
          )
          .trim()
          .toLowerCase();


        const rowRoom =
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'No_Kamar'
              ]
            ) || ''
          ).trim();


        const tenantRoom =
          String(
            tenant.room ||
            tenant.kamar ||
            ''
          ).trim();


        if (
          !rowTenantId &&
          rowName &&
          tenantName &&
          rowName === tenantName &&
          rowRoom === tenantRoom
        ) {

          belongs =
            true;

        }

      }


      if (!belongs) {

        return;

      }


      items.push({

        id:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Maintenance_ID'
            ]
          ),

        tenantId:
          tenantId,

        room:
          djApiValueV5_(
            row,
            table.headers,
            [
              'No_Kamar'
            ]
          ),

        name:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Nama_Tenant'
            ]
          ),

        location:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Lokasi_Masalah'
            ]
          ),

        problem:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Jenis_Masalah'
            ]
          ),

        description:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Deskripsi'
            ]
          ),

        urgency:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Urgensi'
            ]
          ),

        allowEntry:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Izin_Masuk'
            ]
          ),

        comfortableTime:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Waktu_Nyaman'
            ]
          ),

        status:
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Status'
              ]
            ) ||
            'OPEN'
          )
          .trim()
          .toUpperCase(),

        pic:
          djApiValueV5_(
            row,
            table.headers,
            [
              'PIC'
            ]
          ),

        cost:
          djApiNumberV5_(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Biaya'
              ]
            )
          ),

        note:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Catatan_Penyelesaian'
            ]
          ),

        reportedAt:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Timestamp_Submit'
            ]
          ),

        followUpAt:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Tanggal_Tindak_Lanjut'
            ]
          ),

        completedAt:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Tanggal_Selesai'
            ]
          ),

        damagePhotoUrl:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Foto_Kerusakan_URL'
            ]
          ),

        afterPhotoUrl:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Foto_Sesudah_URL'
            ]
          )

      });

    }
  );


  items.reverse();


  return {

    items:
      items.slice(
        0,
        100
      )

  };

}


/* ============================================================
 * MAINTENANCE PHOTO
 * ============================================================
 */
function djApiSaveMaintenancePhotoV5_(
  base64,
  mimeType,
  originalName,
  tenantId,
  maintenanceId
) {

  try {

    if (!base64) {

      return {

        ok: false,

        error:
          'Data foto kosong.'

      };

    }


    base64 =
      String(
        base64
      )
      .replace(
        /^data:[^;]+;base64,/,
        ''
      )
      .replace(
        /\s/g,
        ''
      );


    const bytes =
      Utilities.base64Decode(
        base64
      );


    if (
      bytes.length >
      8 * 1024 * 1024
    ) {

      return {

        ok: false,

        error:
          'Ukuran foto terlalu besar. Maksimal 8 MB.'

      };

    }


    let safeMime =
      String(
        mimeType ||
        'image/jpeg'
      )
      .toLowerCase();


    if (
      safeMime !== 'image/jpeg' &&
      safeMime !== 'image/png' &&
      safeMime !== 'image/webp'
    ) {

      safeMime =
        'image/jpeg';

    }


    let extension =
      '.jpg';


    if (
      safeMime ===
      'image/png'
    ) {

      extension =
        '.png';

    } else if (
      safeMime ===
      'image/webp'
    ) {

      extension =
        '.webp';

    }


    const safeOriginal =
      String(
        originalName || ''
      )
      .replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );


    const fileName =
      'FOTO-' +
      maintenanceId +
      '-' +
      tenantId +
      '-' +
      Date.now() +
      '-' +
      (
        safeOriginal ||
        'kerusakan' +
        extension
      );


    const blob =
      Utilities.newBlob(
        bytes,
        safeMime,
        fileName
      );


    const rootFolder =
      djApiGetOrCreateFolderV5_(
        null,
        'DJ Family Kost'
      );


    const maintenanceFolder =
      djApiGetOrCreateFolderV5_(
        rootFolder,
        'Maintenance'
      );


    const tenantFolder =
      djApiGetOrCreateFolderV5_(
        maintenanceFolder,
        String(
          tenantId
        )
      );


    const file =
      tenantFolder.createFile(
        blob
      );


    return {

      ok:
        true,

      fileId:
        file.getId(),

      fileUrl:
        file.getUrl(),

      fileName:
        file.getName()

    };

  } catch (err) {

    return {

      ok: false,

      error:
        'Gagal menyimpan foto maintenance: ' +
        (
          err &&
          err.message
            ? err.message
            : err
        )

    };

  }

}


/* ============================================================
 * FOLDER HELPER
 * ============================================================
 */
function djApiGetOrCreateFolderV5_(
  parent,
  name
) {

  let iterator;


  if (parent) {

    iterator =
      parent.getFoldersByName(
        name
      );

  } else {

    iterator =
      DriveApp.getFoldersByName(
        name
      );

  }


  if (
    iterator.hasNext()
  ) {

    return iterator.next();

  }


  if (parent) {

    return parent.createFolder(
      name
    );

  }


  return DriveApp.createFolder(
    name
  );

}


/* ============================================================
 * PASSWORD CHANGE
 * ============================================================
 */
function changeTenantPasswordV2_(
  tenantId,
  currentPassword,
  newPassword
) {

  tenantId =
    String(
      tenantId || ''
    )
    .trim()
    .toUpperCase();


  currentPassword =
    String(
      currentPassword || ''
    );


  newPassword =
    String(
      newPassword || ''
    );


  if (!tenantId) {

    return {

      ok: false,

      error:
        'Tenant ID tidak ditemukan.'

    };

  }


  if (!currentPassword) {

    return {

      ok: false,

      error:
        'Password saat ini wajib diisi.'

    };

  }


  if (!newPassword) {

    return {

      ok: false,

      error:
        'Password baru wajib diisi.'

    };

  }


  if (
    newPassword.length < 8
  ) {

    return {

      ok: false,

      error:
        'Password baru minimal 8 karakter.'

    };

  }


  if (
    currentPassword ===
    newPassword
  ) {

    return {

      ok: false,

      error:
        'Password baru harus berbeda dari password saat ini.'

    };

  }


  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Akun_Tenant'
    );


  if (!sheet) {

    return {

      ok: false,

      error:
        'Sheet Akun_Tenant tidak ditemukan.'

    };

  }


  const row =
    djAcctFindAccountRowV2_(
      sheet,
      tenantId
    );


  if (
    !row ||
    row < 1
  ) {

    return {

      ok: false,

      error:
        'Akun tenant tidak ditemukan.'

    };

  }


  const headers =
    djAcctGetHeadersV2_(
      sheet
    );


  if (
    !headers ||
    !headers.length
  ) {

    return {

      ok: false,

      error:
        'Header Akun_Tenant tidak ditemukan.'

    };

  }


  const normalized =
    headers.map(
      function(value) {

        return String(
          value || ''
        )
        .trim()
        .toLowerCase();

      }
    );


  function readField(
    field
  ) {

    const index =
      normalized.indexOf(
        String(
          field
        )
        .trim()
        .toLowerCase()
      );


    if (
      index < 0
    ) {

      return '';

    }


    return sheet
      .getRange(
        row,
        index + 1
      )
      .getValue();

  }


  const oldSalt =
    String(
      readField(
        'Password_Salt'
      ) || ''
    ).trim();


  const oldHash =
    String(
      readField(
        'Password_Hash'
      ) || ''
    ).trim();


  if (
    !oldSalt ||
    !oldHash
  ) {

    return {

      ok: false,

      error:
        'Data password tenant belum lengkap.'

    };

  }


  const currentHash =
    djAcctHashPasswordV2_(
      currentPassword,
      oldSalt
    );


  if (
    String(
      currentHash
    ).trim()
    !==
    oldHash
  ) {

    return {

      ok: false,

      error:
        'Password saat ini salah.'

    };

  }


  const newSalt =
    Utilities
      .getUuid()
      .replace(
        /-/g,
        ''
      );


  const newHash =
    djAcctHashPasswordV2_(
      newPassword,
      newSalt
    );


  djAcctSetFieldsV2_(
    sheet,
    row,
    headers,
    {

      Password_Salt:
        newSalt,

      Password_Hash:
        newHash,

      Status_Akun:
        'AKTIF',

      Wajib_Ganti_Password:
        'TIDAK',

      Session_Token_Hash:
        '',

      Session_Expires:
        '',

      Failed_Attempts:
        0,

      Locked_Until:
        '',

      Updated_At:
        new Date()

    }
  );


  SpreadsheetApp.flush();


  try {

    djApiLogV5_(
      ss,
      'PASSWORD_CHANGE',
      'Tenant ' +
      tenantId +
      ' berhasil mengganti password.'
    );

  } catch (err) {}


  return {

    ok:
      true,

    tenantId:
      tenantId,

    message:
      'Password berhasil diganti. Silakan login kembali menggunakan password baru.'

  };

}



/* ============================================================
 * STEP 4 ‚Äî STATUS WAJIB GANTI PASSWORD
 * ============================================================
 */
function djApiMustChangePasswordV1_(
  tenantId
) {

  tenantId =
    String(
      tenantId || ''
    )
    .trim()
    .toUpperCase();

  if (!tenantId) {
    return false;
  }

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName(
      'Akun_Tenant'
    );

  if (!sheet) {
    return false;
  }

  const row =
    djAcctFindAccountRowV2_(
      sheet,
      tenantId
    );

  if (!row || row < 1) {
    return false;
  }

  const headers =
    djAcctGetHeadersV2_(
      sheet
    );

  if (!headers || !headers.length) {
    return false;
  }

  const normalized =
    headers.map(
      function(value) {
        return String(
          value || ''
        )
        .trim()
        .toLowerCase();
      }
    );

  const index =
    normalized.indexOf(
      'wajib_ganti_password'
    );

  if (index < 0) {
    return false;
  }

  const value =
    String(
      sheet
        .getRange(
          row,
          index + 1
        )
        .getValue() || ''
    )
    .trim()
    .toUpperCase();

  return (
    value === 'YA' ||
    value === 'TRUE' ||
    value === '1'
  );

}


/* ============================================================
 * CHECK IN / OUT V7 ‚Äî WEB API
 * ============================================================
 */

function djApiSubmitCheckInOutV7_(
  tenant,
  body
) {

  const lock =
    LockService.getDocumentLock();


  lock.waitLock(30000);


  try {

    const ss =
      SpreadsheetApp
        .getActiveSpreadsheet();


    const sheet =
      ss.getSheetByName(
        'CheckInOut'
      );


    if (!sheet) {

      return {

        ok: false,

        error:
          'Sheet CheckInOut tidak ditemukan.'

      };

    }


    const tenantId =
      String(
        tenant.tenantId || ''
      )
      .trim()
      .toUpperCase();


    const tenantName =
      String(
        tenant.name ||
        tenant.nama ||
        ''
      )
      .trim();


    const room =
      djApiNormalizeRoomV7_(
        tenant.room ||
        tenant.kamar ||
        ''
      );


    if (!tenantId || !tenantName || !room) {

      return {

        ok: false,

        error:
          'Identitas tenant/kamar tidak lengkap.'

      };

    }


    const process =
      djApiNormalizeCheckInOutProcessV7_(
        body.process
      );


    if (!process) {

      return {

        ok: false,

        error:
          'Jenis proses harus CHECK-IN atau CHECK-OUT.'

      };

    }


    const dateValue =
      djApiParseDateV7_(
        body.processDate
      ) ||
      new Date();


    const condition =
      String(
        body.condition || ''
      ).trim();


    if (!condition) {

      return {

        ok: false,

        error:
          'Kondisi kamar wajib diisi.'

      };

    }


    if (
      String(
        body.agreement || ''
      ).toUpperCase() !== 'YA'
    ) {

      return {

        ok: false,

        error:
          'Persetujuan serah-terima wajib dicentang.'

      };

    }


    const table =
      djApiReadTableV5_(
        sheet,
        [
          'CheckInOut_ID',
          'No_Kamar'
        ]
      );


    if (!table) {

      return {

        ok: false,

        error:
          'Struktur Sheet CheckInOut tidak dapat dibaca.'

      };

    }


    const activeRows =
      table.rows.filter(
        function(row) {

          const rowRoom =
            djApiNormalizeRoomV7_(
              djApiValueV5_(
                row,
                table.headers,
                [
                  'No_Kamar'
                ]
              )
            );


          const rowName =
            String(
              djApiValueV5_(
                row,
                table.headers,
                [
                  'Nama_Tenant'
                ]
              ) || ''
            ).trim();


          return (
            rowRoom === room &&
            rowName.toLowerCase() ===
              tenantName.toLowerCase()
          );

        }
      );


    const completedCheckIn =
      activeRows.some(
        function(row) {

          return (
            djApiNormalizeCheckInOutProcessV7_(
              djApiValueV5_(
                row,
                table.headers,
                [
                  'Jenis_Proses'
                ]
              )
            ) === 'CHECK-IN'
          );

        }
      );


    const completedCheckOut =
      activeRows.some(
        function(row) {

          return (
            djApiNormalizeCheckInOutProcessV7_(
              djApiValueV5_(
                row,
                table.headers,
                [
                  'Jenis_Proses'
                ]
              )
            ) === 'CHECK-OUT'
          );

        }
      );


    if (
      process === 'CHECK-IN' &&
      completedCheckIn &&
      !completedCheckOut
    ) {

      return {

        ok: false,

        error:
          'Tenant ini sudah memiliki Check-in yang aktif.'

      };

    }


    if (
      process === 'CHECK-OUT' &&
      !completedCheckIn
    ) {

      return {

        ok: false,

        error:
          'Check-out belum dapat dilakukan karena Check-in belum tercatat.'

      };

    }


    if (
      process === 'CHECK-OUT' &&
      completedCheckOut
    ) {

      return {

        ok: false,

        error:
          'Tenant ini sudah memiliki Check-out.'

      };

    }


    const damage =
      String(
        body.hasDamage || 'TIDAK'
      )
      .trim()
      .toUpperCase();


    const keyReturned =
      String(
        body.keyReturned || ''
      )
      .trim()
      .toUpperCase();


    const keyCount =
      Math.max(
        0,
        Number(
          body.keyCount || 0
        )
      );


    if (
      process === 'CHECK-OUT' &&
      !keyReturned
    ) {

      return {

        ok: false,

        error:
          'Status pengembalian kunci wajib dipilih saat Check-out.'

      };

    }


    if (
      process === 'CHECK-OUT' &&
      damage === 'YA' &&
      !String(
        body.damageDetail || ''
      ).trim()
    ) {

      return {

        ok: false,

        error:
          'Detail kerusakan/kehilangan wajib diisi.'

      };

    }


    const conditionPhoto =
      body.conditionPhotoBase64
        ? djApiSaveCheckInOutFileV7_(
            body.conditionPhotoBase64,
            body.conditionPhotoMimeType,
            body.conditionPhotoOriginalName,
            tenantId,
            process,
            'KONDISI'
          )
        : null;


    if (
      body.conditionPhotoBase64 &&
      (!conditionPhoto || !conditionPhoto.ok)
    ) {

      return {

        ok: false,

        error:
          conditionPhoto &&
          conditionPhoto.error
            ? conditionPhoto.error
            : 'Foto kondisi gagal disimpan.'

      };

    }


    const meterPhoto =
      body.meterPhotoBase64
        ? djApiSaveCheckInOutFileV7_(
            body.meterPhotoBase64,
            body.meterPhotoMimeType,
            body.meterPhotoOriginalName,
            tenantId,
            process,
            'METER'
          )
        : null;


    if (
      body.meterPhotoBase64 &&
      (!meterPhoto || !meterPhoto.ok)
    ) {

      return {

        ok: false,

        error:
          meterPhoto &&
          meterPhoto.error
            ? meterPhoto.error
            : 'Foto meter gagal disimpan.'

      };

    }


    let deduction =
      Math.max(
        0,
        Number(
          body.depositDeduction || 0
        )
      );


    if (
      process === 'CHECK-IN'
    ) {

      deduction = 0;

    }


    const deposit = 300000;


    if (
      deduction > deposit
    ) {

      deduction = deposit;

    }


    const id =
      djApiGenerateCheckInOutIdV7_(
        sheet,
        table.headers
      );


    const data = {

      CheckInOut_ID:
        id,

      Source_Key:
        'WEB-CIO-' +
        tenantId +
        '-' +
        Date.now(),

      Timestamp_Submit:
        new Date(),

      Jenis_Proses:
        process,

      No_Kamar:
        room,

      Nama_Tenant:
        tenantName,

      No_HP:
        tenant.phone ||
        tenant.noHp ||
        '',

      Tanggal_Proses:
        dateValue,

      Kondisi_Kamar:
        condition,

      Catatan_Kondisi:
        String(
          body.conditionNote || ''
        ).trim(),

      Foto_Kondisi_URL:
        conditionPhoto
          ? conditionPhoto.fileUrl
          : '',

      Foto_Meter_Listrik_URL:
        meterPhoto
          ? meterPhoto.fileUrl
          : '',

      Kondisi_Fasilitas:
        String(
          body.facilities || ''
        ).trim(),

      Jumlah_Kunci_Akses:
        keyCount,

      Kunci_Dikembalikan:
        process === 'CHECK-OUT'
          ? keyReturned
          : '',

      Ada_Kerusakan_Kehilangan:
        damage,

      Detail_Kerusakan_Kehilangan:
        String(
          body.damageDetail || ''
        ).trim(),

      Perkiraan_Pengurangan_Deposit:
        deduction,

      Pernyataan:
        process === 'CHECK-IN'
          ? 'YA ‚Äî TENANT MENYATAKAN KONDISI AWAL KAMAR BENAR.'
          : 'YA ‚Äî TENANT MENYATAKAN KONDISI AKHIR KAMAR BENAR.',

      Last_Sync:
        new Date()

    };


    djApiAppendRowV5_(
      sheet,
      table.headers,
      data
    );


    if (
      process === 'CHECK-OUT'
    ) {

      djApiFinalizeCheckOutV7_(
        ss,
        tenantId,
        tenantName,
        room,
        deduction
      );

    } else {

      djApiSyncCheckInV7_(
        ss,
        tenantId,
        tenantName,
        room
      );

    }


    SpreadsheetApp.flush();


    try {

      djApiLogV5_(
        ss,
        'CHECKINOUT',
        tenantId +
        ' ' +
        process +
        ' melalui website.'
      );

    } catch (err) {}


    return {

      ok:
        true,

      checkInOutId:
        id,

      process:
        process,

      tenantId:
        tenantId,

      room:
        room,

      deduction:
        deduction,

      refund:
        deposit - deduction,

      message:
        process === 'CHECK-IN'
          ? 'Check-in berhasil disimpan.'
          : 'Check-out berhasil disimpan. Tenant dan kamar telah diperbarui.'

    };

  } finally {

    lock.releaseLock();

  }

}


function djApiCheckInOutHistoryV7_(
  tenant
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'CheckInOut'
    );


  if (!sheet) {

    return {items: []};

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'CheckInOut_ID'
      ]
    );


  if (!table) {

    return {items: []};

  }


  const tenantId =
    String(
      tenant.tenantId || ''
    ).trim().toUpperCase();

  const tenantName =
    String(
      tenant.name ||
      tenant.nama ||
      ''
    ).trim().toLowerCase();

  const room =
    djApiNormalizeRoomV7_(
      tenant.room ||
      tenant.kamar ||
      ''
    );


  const items = [];


  table.rows.forEach(
    function(row) {

      const rowRoom =
        djApiNormalizeRoomV7_(
          djApiValueV5_(
            row,
            table.headers,
            ['No_Kamar']
          )
        );

      const rowName =
        String(
          djApiValueV5_(
            row,
            table.headers,
            ['Nama_Tenant']
          ) || ''
        ).trim().toLowerCase();

      const rowSource =
        String(
          djApiValueV5_(
            row,
            table.headers,
            ['Source_Key']
          ) || ''
        ).toUpperCase();

      const rowTenantId =
        String(
          djApiValueV5_(
            row,
            table.headers,
            ['Tenant_ID']
          ) || ''
        ).trim().toUpperCase();


      const match =
        (
          rowTenantId &&
          rowTenantId === tenantId
        ) ||
        (
          rowRoom === room &&
          rowName === tenantName
        ) ||
        (
          rowSource.indexOf(
            'WEB-CIO-' + tenantId + '-'
          ) === 0
        );


      if (!match) {

        return;

      }


      const process =
        djApiNormalizeCheckInOutProcessV7_(
          djApiValueV5_(
            row,
            table.headers,
            ['Jenis_Proses']
          )
        );


      items.push({

        id:
          djApiValueV5_(
            row,
            table.headers,
            ['CheckInOut_ID']
          ),

        process:
          process,

        room:
          rowRoom,

        date:
          djApiValueV5_(
            row,
            table.headers,
            ['Tanggal_Proses']
          ),

        condition:
          djApiValueV5_(
            row,
            table.headers,
            ['Kondisi_Kamar']
          ),

        note:
          djApiValueV5_(
            row,
            table.headers,
            ['Catatan_Kondisi']
          ),

        conditionPhotoUrl:
          djApiValueV5_(
            row,
            table.headers,
            ['Foto_Kondisi_URL']
          ),

        meterPhotoUrl:
          djApiValueV5_(
            row,
            table.headers,
            ['Foto_Meter_Listrik_URL']
          ),

        facilities:
          djApiValueV5_(
            row,
            table.headers,
            ['Kondisi_Fasilitas']
          ),

        keyCount:
          djApiValueV5_(
            row,
            table.headers,
            ['Jumlah_Kunci_Akses']
          ),

        keyReturned:
          djApiValueV5_(
            row,
            table.headers,
            ['Kunci_Dikembalikan']
          ),

        damage:
          djApiValueV5_(
            row,
            table.headers,
            ['Ada_Kerusakan_Kehilangan']
          ),

        damageDetail:
          djApiValueV5_(
            row,
            table.headers,
            ['Detail_Kerusakan_Kehilangan']
          ),

        depositDeduction:
          djApiNumberV5_(
            djApiValueV5_(
              row,
              table.headers,
              ['Perkiraan_Pengurangan_Deposit']
            )
          )

      });

    }
  );


  items.sort(
    function(a,b) {

      const aa =
        new Date(a.date || 0).getTime();

      const bb =
        new Date(b.date || 0).getTime();

      return bb - aa;

    }
  );


  return {

    items:
      items

  };

}


function djApiOpenCheckInOutMediaV7_(
  tenant,
  fileId,
  url
) {

  const tenantId =
    String(
      tenant.tenantId || ''
    )
    .trim()
    .toUpperCase();

  const suppliedFileId =
    String(
      fileId || ''
    ).trim();

  const suppliedUrl =
    String(
      url || ''
    ).trim();

  let targetFileId = suppliedFileId;

  if (!targetFileId && suppliedUrl) {
    targetFileId = djApiExtractDriveIdV5_(suppliedUrl);
  }

  if (!tenantId || !targetFileId) {
    return {
      ok: false,
      error: 'Media Check-in / Check-out tidak ditemukan.'
    };
  }

  /*
   * Keamanan: file hanya boleh dibuka jika file tersebut memang
   * tercatat pada record CheckInOut milik tenant yang sedang login.
   */
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('CheckInOut');

  if (!sheet) {
    return {
      ok: false,
      error: 'Sheet CheckInOut tidak ditemukan.'
    };
  }

  const table = djApiReadTableV5_(
    sheet,
    ['CheckInOut_ID']
  );

  if (!table) {
    return {
      ok: false,
      error: 'Data CheckInOut tidak dapat dibaca.'
    };
  }

  let owned = false;
  let matchedUrl = '';

  table.rows.forEach(function(row) {

    if (owned) return;

    const rowTenantId =
      String(
        djApiValueV5_(
          row,
          table.headers,
          ['Tenant_ID']
        ) || ''
      )
      .trim()
      .toUpperCase();

    const rowName =
      String(
        djApiValueV5_(
          row,
          table.headers,
          ['Nama_Tenant']
        ) || ''
      )
      .trim()
      .toLowerCase();

    const rowRoom =
      djApiNormalizeRoomV7_(
        djApiValueV5_(
          row,
          table.headers,
          ['No_Kamar']
        )
      );

    const tenantRoom = djApiNormalizeRoomV7_(
      tenant.room || tenant.kamar || ''
    );

    const tenantName =
      String(tenant.name || tenant.nama || '')
      .trim()
      .toLowerCase();

    const ownerMatch =
      (rowTenantId && rowTenantId === tenantId) ||
      (rowTenantId === '' && rowName === tenantName && rowRoom === tenantRoom);

    if (!ownerMatch) return;

    const urls = [
      djApiValueV5_(row, table.headers, ['Foto_Kondisi_URL']) || '',
      djApiValueV5_(row, table.headers, ['Foto_Meter_Listrik_URL']) || ''
    ];

    for (let i = 0; i < urls.length; i++) {
      const rowFileId = djApiExtractDriveIdV5_(urls[i]);
      if (rowFileId && rowFileId === targetFileId) {
        owned = true;
        matchedUrl = urls[i];
        break;
      }
    }

  });

  if (!owned) {
    return {
      ok: false,
      error: 'Media tidak terkait dengan akun tenant ini.'
    };
  }

  try {

    const file = DriveApp.getFileById(targetFileId);
    const blob = file.getBlob();
    const bytes = blob.getBytes();
    const mimeType =
      String(blob.getContentType() || 'image/jpeg').toLowerCase();

    if (bytes.length <= 8 * 1024 * 1024) {
      return {
        ok: true,
        fileId: file.getId(),
        fileName: file.getName(),
        mimeType: mimeType,
        dataUrl:
          'data:' +
          mimeType +
          ';base64,' +
          Utilities.base64Encode(bytes),
        url: matchedUrl || file.getUrl()
      };
    }

    return {
      ok: true,
      fileId: file.getId(),
      fileName: file.getName(),
      mimeType: mimeType,
      url: matchedUrl || file.getUrl(),
      message: 'File terlalu besar untuk ditampilkan langsung.'
    };

  } catch (err) {

    return {
      ok: false,
      error:
        'Foto tersimpan tetapi tidak dapat dibaca: ' +
        (err && err.message ? err.message : err)
    };

  }

}


function djApiMasterCheckInOutV7_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'CheckInOut'
    );


  if (!sheet) {

    return {items: []};

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'CheckInOut_ID'
      ]
    );


  if (!table) {

    return {items: []};

  }


  const items =
    table.rows.map(
      function(row) {

        return {

          id:
            djApiValueV5_(
              row,
              table.headers,
              ['CheckInOut_ID']
            ),

          process:
            djApiNormalizeCheckInOutProcessV7_(
              djApiValueV5_(
                row,
                table.headers,
                ['Jenis_Proses']
              )
            ),

          room:
            djApiValueV5_(
              row,
              table.headers,
              ['No_Kamar']
            ),

          name:
            djApiValueV5_(
              row,
              table.headers,
              ['Nama_Tenant']
            ),

          phone:
            djApiValueV5_(
              row,
              table.headers,
              ['No_HP']
            ),

          date:
            djApiValueV5_(
              row,
              table.headers,
              ['Tanggal_Proses']
            ),

          condition:
            djApiValueV5_(
              row,
              table.headers,
              ['Kondisi_Kamar']
            ),

          conditionPhotoUrl:
            djApiValueV5_(
              row,
              table.headers,
              ['Foto_Kondisi_URL']
            ),

          meterPhotoUrl:
            djApiValueV5_(
              row,
              table.headers,
              ['Foto_Meter_Listrik_URL']
            ),

          damage:
            djApiValueV5_(
              row,
              table.headers,
              ['Ada_Kerusakan_Kehilangan']
            ),

          damageDetail:
            djApiValueV5_(
              row,
              table.headers,
              ['Detail_Kerusakan_Kehilangan']
            ),

          deduction:
            djApiNumberV5_(
              djApiValueV5_(
                row,
                table.headers,
                ['Perkiraan_Pengurangan_Deposit']
              )
            )

        };

      }
    );


  return {

    items:
      items.filter(
        function(item) {

          return !!String(
            item.id || ''
          ).trim();

        }
      )

  };

}


function djApiNormalizeCheckInOutProcessV7_(
  value
) {

  const text =
    String(
      value || ''
    )
    .trim()
    .toUpperCase()
    .replace(
      /\s+/g,
      ' '
    );


  if (
    text === 'CHECK-IN' ||
    text === 'CHECK IN' ||
    text === 'CHECKIN'
  ) {

    return 'CHECK-IN';

  }


  if (
    text === 'CHECK-OUT' ||
    text === 'CHECK OUT' ||
    text === 'CHECKOUT'
  ) {

    return 'CHECK-OUT';

  }


  return '';

}


function djApiNormalizeRoomV7_(
  value
) {

  const text =
    String(
      value == null
        ? ''
        : value
    )
    .trim();


  if (!text) {

    return '';

  }


  const number =
    Number(
      text
    );


  return Number.isFinite(number)
    ? String(
        Math.trunc(number)
      )
    : text;

}


function djApiParseDateV7_(
  value
) {

  if (!value) {

    return null;

  }


  if (value instanceof Date) {

    return new Date(value.getTime());

  }


  const text =
    String(value).trim();


  if (!text) {

    return null;

  }


  const direct =
    new Date(text);


  if (!isNaN(direct.getTime())) {

    return direct;

  }


  const match =
    text.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );


  if (match) {

    return new Date(
      Number(match[3]),
      Number(match[2]) - 1,
      Number(match[1])
    );

  }


  return null;

}


function djApiGenerateCheckInOutIdV7_(
  sheet,
  headers
) {

  const table =
    djApiReadTableV5_(
      sheet,
      [
        'CheckInOut_ID'
      ]
    );


  let max = 0;


  if (table) {

    table.rows.forEach(
      function(row) {

        const id =
          String(
            djApiValueV5_(
              row,
              table.headers,
              ['CheckInOut_ID']
            ) || ''
          ).trim().toUpperCase();


        const match =
          id.match(
            /^CIO-(\d+)$/
          );


        if (match) {

          max = Math.max(
            max,
            Number(match[1])
          );

        }

      }
    );

  }


  return 'CIO-' +
    String(
      max + 1
    ).padStart(
      4,
      '0'
    );

}


function djApiSaveCheckInOutFileV7_(
  base64,
  mimeType,
  originalName,
  tenantId,
  process,
  kind
) {

  try {

    if (!base64) {

      return {

        ok: false,

        error:
          'Foto kosong.'

      };

    }


    const cleanBase64 =
      String(
        base64
      )
      .replace(
        /^data:[^;]+;base64,/,
        ''
      )
      .replace(
        /\s/g,
        ''
      );


    const bytes =
      Utilities.base64Decode(
        cleanBase64
      );


    if (
      bytes.length >
      8 * 1024 * 1024
    ) {

      return {

        ok: false,

        error:
          'Ukuran foto terlalu besar. Maksimal 8 MB.'

      };

    }


    let safeMime =
      String(
        mimeType ||
        'image/jpeg'
      )
      .toLowerCase();


    if (
      safeMime !== 'image/jpeg' &&
      safeMime !== 'image/png' &&
      safeMime !== 'image/webp'
    ) {

      safeMime = 'image/jpeg';

    }


    let ext = '.jpg';

    if (safeMime === 'image/png') {
      ext = '.png';
    } else if (safeMime === 'image/webp') {
      ext = '.webp';
    }


    const original =
      String(
        originalName || ''
      )
      .replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );


    const fileName =
      'CIO-' +
      tenantId +
      '-' +
      process +
      '-' +
      kind +
      '-' +
      Date.now() +
      '-' +
      (original || 'foto' + ext);


    const blob =
      Utilities.newBlob(
        bytes,
        safeMime,
        fileName
      );


    const root =
      djApiGetOrCreateFolderV5_(
        null,
        'DJ Family Kost'
      );


    const rootFolder =
      djApiGetOrCreateFolderV5_(
        root,
        'CheckInOut'
      );


    const tenantFolder =
      djApiGetOrCreateFolderV5_(
        rootFolder,
        tenantId
      );


    const file =
      tenantFolder.createFile(
        blob
      );


    return {

      ok: true,

      fileId:
        file.getId(),

      fileUrl:
        file.getUrl(),

      fileName:
        file.getName()

    };

  } catch (err) {

    return {

      ok: false,

      error:
        'Gagal menyimpan foto Check-in/Check-out: ' +
        (
          err && err.message
            ? err.message
            : err
        )

    };

  }

}


function djApiFindRowByFieldV7_(
  ss,
  sheetName,
  aliases,
  value
) {

  const sheet =
    ss.getSheetByName(
      sheetName
    );


  if (!sheet) {

    return -1;

  }


  const table =
    djApiReadTableV5_(
      sheet,
      aliases
    );


  if (!table) {

    return -1;

  }


  return djApiFindRowV5_(
    table,
    aliases,
    value
  );

}


function djApiSyncCheckInV7_(
  ss,
  tenantId,
  tenantName,
  room
) {

  /* Tenant AKTIF */

  const tenantSheet =
    ss.getSheetByName(
      'Tenant'
    );


  if (tenantSheet) {

    const table =
      djApiReadTableV5_(
        tenantSheet,
        ['Tenant_ID']
      );


    const row =
      table
        ? djApiFindRowV5_(
            table,
            ['Tenant_ID'],
            tenantId
          )
        : -1;


    if (row > 0) {

      djApiUpdateRowV5_(
        tenantSheet,
        row,
        table.headers,
        {
          Status_Tenant: 'AKTIF',
          No_Kamar: room,
          Last_Sync: new Date()
        }
      );

    }

  }


  /* Kamar TERISI */

  const roomSheet =
    ss.getSheetByName(
      'Kamar'
    );


  if (roomSheet) {

    const table =
      djApiReadTableV5_(
        roomSheet,
        ['No_Kamar']
      );


    const row =
      table
        ? djApiFindRowV5_(
            table,
            ['No_Kamar'],
            room
          )
        : -1;


    if (row > 0) {

      djApiUpdateRowV5_(
        roomSheet,
        row,
        table.headers,
        {
          Status: 'TERISI',
          Tenant_ID: tenantId,
          Nama_Tenant: tenantName
        }
      );

    }

  }

}


function djApiFinalizeCheckOutV7_(
  ss,
  tenantId,
  tenantName,
  room,
  deduction
) {

  /* ========================================================
   * TENANT -> NONAKTIF
   * ========================================================
   */

  const tenantSheet =
    ss.getSheetByName(
      'Tenant'
    );


  if (tenantSheet) {

    const table =
      djApiReadTableV5_(
        tenantSheet,
        ['Tenant_ID']
      );


    const row =
      table
        ? djApiFindRowV5_(
            table,
            ['Tenant_ID'],
            tenantId
          )
        : -1;


    if (row > 0) {

      djApiUpdateRowV5_(
        tenantSheet,
        row,
        table.headers,
        {
          Status_Tenant:
            'NONAKTIF',
          Last_Sync:
            new Date()
        }
      );

    }

  }


  /* ========================================================
   * AKUN -> NONAKTIF + CABUT SELURUH SESSION
   * ========================================================
   *
   * Password tetap disimpan sebagai histori akun.
   * Yang dinonaktifkan adalah hak akses login/session.
   */

  const accountSheet =
    ss.getSheetByName(
      'Akun_Tenant'
    );


  if (accountSheet) {

    djApiEnsureSheetFieldsV5_(
      accountSheet,
      [
        'Status_Akun',
        'Wajib_Ganti_Password',
        'Session_Token_Hash',
        'Session_Expires',
        'Failed_Attempts',
        'Locked_Until',
        'Updated_At'
      ]
    );


    const table =
      djApiReadTableV5_(
        accountSheet,
        ['Tenant_ID']
      );


    const row =
      table
        ? djApiFindRowV5_(
            table,
            ['Tenant_ID'],
            tenantId
          )
        : -1;


    if (row > 0) {

      djApiUpdateRowV5_(
        accountSheet,
        row,
        table.headers,
        {
          Status_Akun:
            'NONAKTIF',
          Wajib_Ganti_Password:
            'TIDAK',
          Session_Token_Hash:
            '',
          Session_Expires:
            '',
          Failed_Attempts:
            0,
          Locked_Until:
            '',
          Updated_At:
            new Date()
        }
      );

    }

  }


  /* ========================================================
   * KONTRAK AKTIF -> SELESAI
   * ========================================================
   *
   * Kontrak historis yang sudah SELESAI tidak disentuh.
   */

  const contractSheet =
    ss.getSheetByName(
      'Kontrak'
    );


  if (contractSheet) {

    const table =
      djApiReadTableV5_(
        contractSheet,
        ['Kontrak_ID']
      );


    if (table) {

      for (
        let i = 0;
        i < table.rows.length;
        i++
      ) {

        const rowTenant =
          String(
            djApiValueV5_(
              table.rows[i],
              table.headers,
              ['Tenant_ID']
            ) || ''
          )
          .trim()
          .toUpperCase();


        if (
          rowTenant !==
          tenantId
        ) {
          continue;
        }


        const status =
          String(
            djApiValueV5_(
              table.rows[i],
              table.headers,
              [
                'Status_Kontrak'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase();


        if (
          status !== 'AKTIF'
        ) {
          continue;
        }


        const rowNumber =
          table.headerRow +
          1 +
          i;


        djApiUpdateRowV5_(
          contractSheet,
          rowNumber,
          table.headers,
          {
            Status_Kontrak:
              'SELESAI',
            Catatan:
              'Check-out melalui website. Pengurangan deposit: Rp' +
              Number(
                deduction || 0
              ).toLocaleString(
                'id-ID'
              ),
            Last_Sync:
              new Date()
          }
        );

      }

    }

  }


  /* ========================================================
   * KAMAR -> KOSONG
   * ========================================================
   *
   * Hanya kosongkan kamar bila kamar memang masih menunjuk
   * ke Tenant_ID yang melakukan check-out. Ini mencegah akun
   * lama mengosongkan kamar yang sudah ditempati tenant lain.
   */

  const roomSheet =
    ss.getSheetByName(
      'Kamar'
    );


  if (roomSheet) {

    const table =
      djApiReadTableV5_(
        roomSheet,
        ['No_Kamar']
      );


    const row =
      table
        ? djApiFindRowV5_(
            table,
            ['No_Kamar'],
            room
          )
        : -1;


    if (row > 0) {

      const currentTenantId =
        String(
          djApiValueV5_(
            table.rows[
              row -
              table.headerRow -
              1
            ] || [],
            table.headers,
            ['Tenant_ID']
          ) || ''
        )
        .trim()
        .toUpperCase();


      if (
        !currentTenantId ||
        currentTenantId ===
        tenantId
      ) {

        djApiUpdateRowV5_(
          roomSheet,
          row,
          table.headers,
          {
            Status:
              'KOSONG',
            Tenant_ID:
              '',
            Nama_Tenant:
              ''
          }
        );

      }

    }

  }

}


/* ============================================================
 * STEP 3 ‚Äî AKTIVASI AKUN TENANT
 * ============================================================
 *
 * Pendaftaran publik:
 *   MENUNGGU VERIFIKASI
 *
 * Setelah Master menyetujui + menetapkan kamar:
 *   MENUNGGU AKTIVASI AKUN
 *
 * Tenant kemudian:
 *   1. Membuka aktivasi dengan Pendaftaran_ID + No. WhatsApp.
 *   2. Melihat kamar final + harga + deposit.
 *   3. Melengkapi data identitas + kontak darurat.
 *   4. Upload KTP.
 *   5. Membaca aturan.
 *   6. Menyetujui aturan.
 *   7. Membuat tanda tangan.
 *   8. Sistem membuat Tenant ID + Kontrak ID + password sementara.
 *
 * ============================================================
 */

function djApiActivationInfoV1_(
  registrationId,
  noHP
) {

  registrationId =
    String(
      registrationId || ''
    ).trim();

  noHP =
    djApiNormalizePhoneV1_(
      noHP
    );

  if (!registrationId) {
    return {
      ok: false,
      error: 'Pendaftaran ID wajib diisi.'
    };
  }

  if (!noHP) {
    return {
      ok: false,
      error: 'Nomor WhatsApp wajib diisi.'
    };
  }

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName(
      'Pendaftaran'
    );

  if (!sheet) {
    return {
      ok: false,
      error: 'Sheet Pendaftaran tidak ditemukan.'
    };
  }

  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Pendaftaran_ID'
      ]
    );

  if (!table) {
    return {
      ok: false,
      error: 'Struktur sheet Pendaftaran tidak dapat dibaca.'
    };
  }

  const rowNumber =
    djApiFindRowV5_(
      table,
      [
        'Pendaftaran_ID'
      ],
      registrationId
    );

  if (rowNumber < 0) {
    return {
      ok: false,
      error: 'Pendaftaran tidak ditemukan.'
    };
  }

  const headers =
    djApiFindHeadersV5_(
      sheet
    );

  const row =
    sheet
      .getRange(
        rowNumber,
        1,
        1,
        headers.length
      )
      .getValues()[0];

  const status =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Status_Pendaftaran'
        ]
      ) || ''
    )
    .trim()
    .toUpperCase();

  if (
    status === 'SELESAI'
  ) {
    return {
      ok: false,
      error: 'Akun untuk pendaftaran ini sudah dibuat.'
    };
  }

  if (
    status !== 'MENUNGGU AKTIVASI AKUN'
  ) {
    return {
      ok: false,
      error:
        'Pendaftaran belum siap diaktivasi. Status saat ini: ' +
        (status || 'KOSONG')
    };
  }

  const storedPhone =
    djApiNormalizePhoneV1_(
      djApiValueV5_(
        row,
        headers,
        [
          'No_HP'
        ]
      )
    );

  if (
    storedPhone !== noHP
  ) {
    return {
      ok: false,
      error: 'Nomor WhatsApp tidak cocok dengan data pendaftaran.'
    };
  }

  const name =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Nama_Lengkap'
        ]
      ) || ''
    ).trim();

  const nickname =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Nama_Panggilan'
        ]
      ) || ''
    ).trim();

  const email =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Email'
        ]
      ) || ''
    ).trim();

  const nik =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'NIK_KTP'
        ]
      ) || ''
    ).trim();

  const occupation =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Pekerjaan'
        ]
      ) || ''
    ).trim();

  const company =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Perusahaan_Instansi',
          'Perusahaan'
        ]
      ) || ''
    ).trim();

  const gender =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Jenis_Kelamin'
        ]
      ) || ''
    ).trim();

  const address =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Alamat'
        ]
      ) || ''
    ).trim();

  const requestedRoom =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Kamar_Diminati'
        ]
      ) || ''
    ).trim();

  const finalRoom =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Kamar_Final',
          'No_Kamar'
        ]
      ) || ''
    ).trim();

  if (!finalRoom) {
    return {
      ok: false,
      error:
        'Kamar final belum ditetapkan oleh Master.'
    };
  }

  const roomInfo =
    djApiFindRoomV5_(
      ss,
      finalRoom
    );

  const storedFinalPrice =
    djApiNumberV5_(
      djApiValueV5_(
        row,
        headers,
        [
          'Harga_Final'
        ]
      )
    );

  const finalPrice =
    storedFinalPrice ||
    Number(
      roomInfo.price || 0
    );

  if (
    finalPrice <= 0
  ) {
    return {
      ok: false,
      error:
        'Harga final kamar belum tersedia.'
    };
  }

  const startDate =
    djApiValueV5_(
      row,
      headers,
      [
        'Rencana_Mulai_Sewa',
        'Tanggal_Mulai',
        'Tanggal_Mulai_Tinggal'
      ]
    );

  djApiEnsureSheetFieldsV5_(
    sheet,
    [
      'Kamar_Diminati',
      'Kamar_Final',
      'Harga_Final',
      'Status_Akun',
      'Aktivasi_Token_Hash',
      'Aktivasi_Token_Expires',
      'Aktivasi_Dibuat_At',
      'Aktivasi_Selesai_At'
    ]
  );

  const token =
    djApiRandomTokenV1_(
      32
    );

  const tokenHash =
    djApiTokenHashV1_(
      token
    );

  const tokenExpires =
    new Date(
      Date.now() +
      15 * 60 * 1000
    );

  const latestHeaders =
    djApiFindHeadersV5_(
      sheet
    );

  djApiUpdateRowV5_(
    sheet,
    rowNumber,
    latestHeaders,
    {
      Aktivasi_Token_Hash:
        tokenHash,
      Aktivasi_Token_Expires:
        tokenExpires,
      Aktivasi_Dibuat_At:
        new Date(),
      Kamar_Diminati:
        requestedRoom,
      Kamar_Final:
        finalRoom,
      Harga_Final:
        finalPrice,
      Status_Akun:
        'MENUNGGU AKTIVASI'
    }
  );

  SpreadsheetApp.flush();

  return {
    ok: true,
    registrationId:
      registrationId,
    activationToken:
      token,
    activationExpires:
      tokenExpires.toISOString(),
    nama:
      name,
    namaPanggilan:
      nickname,
    noHP:
      storedPhone,
    email:
      email,
    nik:
      nik,
    pekerjaan:
      occupation,
    perusahaan:
      company,
    jenisKelamin:
      gender,
    alamat:
      address,
    kamarDiminati:
      requestedRoom,
    kamarFinal:
      finalRoom,
    hargaFinal:
      finalPrice,
    deposit:
      300000,
    tanggalMulai:
      startDate,
    aturanVersi:
      'ATURAN-2026-V1',
    perjanjianVersi:
      'PERJANJIAN-SEWA-2026-V1.0',
    status:
      'MENUNGGU AKTIVASI AKUN'
  };

}


function djApiSubmitActivationV1_(
  body
) {

  const lock =
    LockService.getScriptLock();

  lock.waitLock(
    30000
  );

  try {

    const registrationId =
      String(
        body.registrationId || ''
      ).trim();

    const noHP =
      djApiNormalizePhoneV1_(
        body.noHP
      );

    const activationToken =
      String(
        body.activationToken || ''
      ).trim();

    if (!registrationId) {
      throw new Error(
        'Pendaftaran ID wajib diisi.'
      );
    }

    if (!noHP) {
      throw new Error(
        'Nomor WhatsApp wajib diisi.'
      );
    }

    if (!activationToken) {
      throw new Error(
        'Sesi aktivasi tidak ditemukan.'
      );
    }

    const agreeRead =
      body.agreeRead === true ||
      String(
        body.agreeRead || ''
      ).toLowerCase() === 'true';

    const agreeRules =
      body.agreeRules === true ||
      String(
        body.agreeRules || ''
      ).toLowerCase() === 'true';

    const agreeAgreementRead =
      body.agreeAgreementRead === true ||
      String(
        body.agreeAgreementRead || ''
      ).toLowerCase() === 'true';

    const agreeAgreement =
      body.agreeAgreement === true ||
      String(
        body.agreeAgreement || ''
      ).toLowerCase() === 'true';

    const agreementVersion =
      String(
        body.agreementVersion || ''
      ).trim();

    const expectedAgreementVersion =
      'PERJANJIAN-SEWA-2026-V1.0';

    if (!agreeRead) {
      throw new Error(
        'Anda harus menyatakan bahwa aturan sudah dibaca dan dipahami.'
      );
    }

    if (!agreeRules) {
      throw new Error(
        'Anda harus menyetujui aturan DJ Family Kost.'
      );
    }

    if (!agreeAgreementRead) {
      throw new Error(
        'Anda harus menyatakan bahwa Perjanjian Sewa Kamar sudah dibaca dan dipahami.'
      );
    }

    if (!agreeAgreement) {
      throw new Error(
        'Anda harus menyetujui Perjanjian Sewa Kamar.'
      );
    }

    if (
      agreementVersion !==
      expectedAgreementVersion
    ) {
      throw new Error(
        'Versi Perjanjian Sewa tidak sesuai.'
      );
    }

    const signatureBase64 =
      String(
        body.signatureBase64 || ''
      ).trim();

    if (!signatureBase64) {
      throw new Error(
        'Tanda tangan wajib diisi.'
      );
    }

    const ktpBase64 =
      String(
        body.ktpBase64 || ''
      ).trim();

    if (!ktpBase64) {
      throw new Error(
        'Foto KTP wajib diunggah.'
      );
    }

    const agreementBase64 =
      String(
        body.agreementBase64 || ''
      ).trim();

    if (!agreementBase64) {
      throw new Error(
        'Perjanjian sewa yang sudah ditandatangani wajib diunggah.'
      );
    }
        const agreementHtml =
      String(
        body.agreementHtml || ''
      ).trim();

    if (!agreementHtml) {
      throw new Error(
        'Isi Perjanjian Sewa untuk arsip digital tidak tersedia.'
      );
    }

    const emergencyName =
      String(
        body.kontakDarurat || ''
      ).trim();

    const emergencyRelation =
      String(
        body.hubunganKontakDarurat || ''
      ).trim();

    const emergencyPhone =
      djApiNormalizePhoneV1_(
        body.noHPKontakDarurat
      );

    if (!emergencyName) {
      throw new Error(
        'Nama kontak darurat wajib diisi.'
      );
    }

    if (!emergencyRelation) {
      throw new Error(
        'Hubungan kontak darurat wajib diisi.'
      );
    }

    if (!emergencyPhone) {
      throw new Error(
        'Nomor kontak darurat wajib diisi.'
      );
    }

    const ss =
      SpreadsheetApp
        .getActiveSpreadsheet();

    const registrationSheet =
      ss.getSheetByName(
        'Pendaftaran'
      );

    if (!registrationSheet) {
      throw new Error(
        'Sheet Pendaftaran tidak ditemukan.'
      );
    }

    const registrationTable =
      djApiReadTableV5_(
        registrationSheet,
        [
          'Pendaftaran_ID'
        ]
      );

    if (!registrationTable) {
      throw new Error(
        'Struktur sheet Pendaftaran tidak dapat dibaca.'
      );
    }

    const registrationRow =
      djApiFindRowV5_(
        registrationTable,
        [
          'Pendaftaran_ID'
        ],
        registrationId
      );

    if (registrationRow < 0) {
      throw new Error(
        'Pendaftaran tidak ditemukan.'
      );
    }

    const registrationHeaders =
      djApiFindHeadersV5_(
        registrationSheet
      );

    const registrationDataRow =
      registrationSheet
        .getRange(
          registrationRow,
          1,
          1,
          registrationHeaders.length
        )
        .getValues()[0];

    const status =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Status_Pendaftaran'
          ]
        ) || ''
      )
      .trim()
      .toUpperCase();

    if (
      status === 'SELESAI'
    ) {
      throw new Error(
        'Akun untuk pendaftaran ini sudah dibuat.'
      );
    }

    if (
      status !== 'MENUNGGU AKTIVASI AKUN'
    ) {
      throw new Error(
        'Pendaftaran belum siap diaktivasi. Status saat ini: ' +
        (status || 'KOSONG')
      );
    }

    const storedPhone =
      djApiNormalizePhoneV1_(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'No_HP'
          ]
        )
      );

    if (
      storedPhone !== noHP
    ) {
      throw new Error(
        'Nomor WhatsApp tidak cocok dengan data pendaftaran.'
      );
    }

    const tokenHash =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Aktivasi_Token_Hash'
          ]
        ) || ''
      ).trim();

    const tokenExpiryRaw =
      djApiValueV5_(
        registrationDataRow,
        registrationHeaders,
        [
          'Aktivasi_Token_Expires'
        ]
      );

    const tokenExpiry =
      tokenExpiryRaw
        ? new Date(tokenExpiryRaw)
        : null;

    if (
      !tokenHash ||
      tokenHash !==
      djApiTokenHashV1_(
        activationToken
      )
    ) {
      throw new Error(
        'Sesi aktivasi tidak valid. Silakan mulai aktivasi kembali.'
      );
    }

    if (
      !tokenExpiry ||
      Number.isNaN(
        tokenExpiry.getTime()
      ) ||
      tokenExpiry.getTime() <
      Date.now()
    ) {
      throw new Error(
        'Sesi aktivasi sudah kedaluwarsa. Silakan mulai aktivasi kembali.'
      );
    }

    const name =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Nama_Lengkap'
          ]
        ) || ''
      ).trim();

    const nickname =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Nama_Panggilan'
          ]
        ) || ''
      ).trim();

    const email =
      String(
        body.email ||
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Email'
          ]
        ) || ''
      ).trim();

    const nik =
      String(
        body.nik ||
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'NIK_KTP'
          ]
        ) || ''
      ).trim();

    const occupation =
      String(
        body.pekerjaan ||
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Pekerjaan'
          ]
        ) || ''
      ).trim();

    const company =
      String(
        body.perusahaan ||
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Perusahaan_Instansi',
            'Perusahaan'
          ]
        ) || ''
      ).trim();

    const gender =
      String(
        body.jenisKelamin ||
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Jenis_Kelamin'
          ]
        ) || ''
      ).trim();

    const address =
      String(
        body.alamat ||
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Alamat'
          ]
        ) || ''
      ).trim();

    const requestedRoom =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Kamar_Diminati'
          ]
        ) || ''
      ).trim();

    const finalRoom =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Kamar_Final',
            'No_Kamar'
          ]
        ) || ''
      ).trim();

    const finalPrice =
      djApiNumberV5_(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Harga_Final'
          ]
        )
      ) ||
      djApiFindRoomV5_(
        ss,
        finalRoom
      ).price;

    if (
      !finalRoom ||
      finalPrice <= 0
    ) {
      throw new Error(
        'Kamar final atau harga sewa belum tersedia.'
      );
    }

    const roomInfo =
      djApiFindRoomV5_(
        ss,
        finalRoom
      );

    const roomStatus =
      String(
        roomInfo.status || ''
      )
      .trim()
      .toUpperCase();

    if (
      roomStatus !== 'DIPESAN' &&
      roomStatus !== 'KOSONG'
    ) {
      throw new Error(
        'Kamar ' +
        finalRoom +
        ' tidak dapat diaktivasi. Status saat ini: ' +
        roomStatus
      );
    }

    const tenantSheet =
      ss.getSheetByName(
        'Tenant'
      );

    const contractSheet =
      ss.getSheetByName(
        'Kontrak'
      );

    const accountSheet =
      ss.getSheetByName(
        'Akun_Tenant'
      );

    if (!tenantSheet) {
      throw new Error(
        'Sheet Tenant tidak ditemukan.'
      );
    }

    if (!contractSheet) {
      throw new Error(
        'Sheet Kontrak tidak ditemukan.'
      );
    }

    if (!accountSheet) {
      throw new Error(
        'Sheet Akun_Tenant tidak ditemukan.'
      );
    }

    djApiEnsureSheetFieldsV5_(
      tenantSheet,
      [
        'Tenant_ID',
        'Source_Key',
        'Tanggal_Sumber',
        'Nama_Lengkap',
        'Nama_Panggilan',
        'No_HP',
        'Email',
        'NIK_KTP',
        'Pekerjaan',
        'Perusahaan_Instansi',
        'Jenis_Kelamin',
        'Kontak_Darurat',
        'Hubungan_Kontak_Darurat',
        'No_HP_Kontak_Darurat',
        'No_Kamar',
        'Tanggal_Mulai',
        'Rencana_Mulai_Sewa',
        'KTP_File_URL',
        'KTP_File_ID',
        'KTP_File_Name',
        'Tanda_Tangan_File_URL',
        'Tanda_Tangan_File_ID',
        'Tanda_Tangan_File_Name',
        'Surat_Perjanjian_File_URL',
        'Surat_Perjanjian_File_ID',
        'Surat_Perjanjian_File_Name',
        'Kontrak_Digital_File_URL',
        'Kontrak_Digital_File_ID',
        'Kontrak_Digital_File_Name',
        'Tanggal_Generate_Digital',
        'Persetujuan_Aturan',
        'Versi_Aturan',
        'Tanggal_Persetujuan_Aturan',
        'Persetujuan_Perjanjian',
        'Versi_Perjanjian',
        'Tanggal_Persetujuan_Perjanjian',
        'Status_Tenant',
        'Catatan',
        'Created_At',
        'Updated_At'
      ]
    );

    djApiEnsureSheetFieldsV5_(
      contractSheet,
      [
        'Kontrak_ID',
        'Tenant_ID',
        'No_Kamar',
        'Tanggal_Mulai',
        'Tanggal_Berakhir',
        'Harga_Sewa',
        'Deposit',
        'Surat_Perjanjian_File_URL',
        'Surat_Perjanjian_File_ID',
        'Surat_Perjanjian_File_Name',
        'Versi_Perjanjian',
        'Status_Kontrak',
        'Catatan',
        'Created_At',
        'Updated_At'
      ]
    );

    djApiEnsureSheetFieldsV5_(
      accountSheet,
      [
        'Tenant_ID',
        'Status_Akun',
        'Password_Salt',
        'Password_Hash',
        'Wajib_Ganti_Password',
        'Session_Token_Hash',
        'Session_Expires',
        'Failed_Attempts',
        'Locked_Until',
        'Created_At',
        'Updated_At'
      ]
    );

    djApiEnsureSheetFieldsV5_(
      registrationSheet,
      [
        'Persetujuan_Perjanjian',
        'Versi_Perjanjian',
        'Tanggal_Persetujuan_Perjanjian',
        'Surat_Perjanjian_File_URL',
        'Surat_Perjanjian_File_ID',
        'Surat_Perjanjian_File_Name'
      ]
    );

    const existingTenantId =
      String(
        djApiValueV5_(
          registrationDataRow,
          registrationHeaders,
          [
            'Tenant_ID'
          ]
        ) || ''
      ).trim();

    if (existingTenantId) {
      throw new Error(
        'Tenant ID untuk pendaftaran ini sudah dibuat: ' +
        existingTenantId
      );
    }

    const tenantTable =
      djApiReadTableV5_(
        tenantSheet,
        [
          'Tenant_ID'
        ]
      );

    const contractTable =
      djApiReadTableV5_(
        contractSheet,
        [
          'Kontrak_ID'
        ]
      );

    const tenantId =
      djApiNextPrefixedIdV1_(
        tenantTable,
        'Tenant_ID',
        'TEN-'
      );

    const contractId =
      djApiNextPrefixedIdV1_(
        contractTable,
        'Kontrak_ID',
        'KTR-'
      );

    const ktpFile =
      djApiSaveActivationFileV1_(
        ss,
        'Data Diri',
        tenantId,
        ktpBase64,
        body.ktpMimeType,
        body.ktpOriginalName,
        'KTP'
      );

    if (!ktpFile.ok) {
      throw new Error(
        ktpFile.error
      );
    }

    const agreementFile =
      djApiSaveActivationFileV1_(
        ss,
        'Perjanjian Sewa',
        tenantId,
        agreementBase64,
        body.agreementMimeType,
        body.agreementOriginalName,
        'PERJANJIAN-SEWA'
      );

    if (!agreementFile.ok) {
      throw new Error(
        agreementFile.error
      );
    }

    const signatureFile =
      djApiSaveActivationFileV1_(
        ss,
        'Data Diri',
        tenantId,
        signatureBase64,
        'image/png',
        'tanda-tangan.png',
        'TANDA-TANGAN'
      );

    if (!signatureFile.ok) {
      throw new Error(
        signatureFile.error
      );
    }

    const temporaryPassword =
      djAcctGeneratePasswordV2_();

    const passwordSalt =
      Utilities
        .getUuid()
        .replace(
          /-/g,
          ''
        );

    const passwordHash =
      djAcctHashPasswordV2_(
        temporaryPassword,
        passwordSalt
      );

    const now =
      new Date();

    const startDate =
      djApiValueV5_(
        registrationDataRow,
        registrationHeaders,
        [
          'Rencana_Mulai_Sewa',
          'Tanggal_Mulai',
          'Tanggal_Mulai_Tinggal'
        ]
      ) ||
      now;


    const digitalContract =
      djApiGenerateDigitalContractArchiveV1_({

        tenantId:
          tenantId,

        contractId:
          contractId,

        agreementVersion:
          expectedAgreementVersion,

        agreementHtml:
          agreementHtml,

        signatureBase64:
          signatureBase64,

        name:
          name,

        nickname:
          nickname,

        phone:
          storedPhone,

        email:
          email,

        nik:
          nik,

        occupation:
          occupation,

        company:
          company,

        gender:
          gender,

        address:
          address,

        emergencyName:
          emergencyName,

        emergencyRelation:
          emergencyRelation,

        emergencyPhone:
          emergencyPhone,

        room:
          finalRoom,

        startDate:
          startDate,

        endDate:
          '',

        rent:
          finalPrice,

        deposit:
          300000,

        activationDate:
          now

      });


    if (
      !digitalContract ||
      !digitalContract.ok
    ) {

      throw new Error(

        digitalContract &&
        digitalContract.error

          ? digitalContract.error

          : 'Kontrak Digital Arsip gagal dibuat.'

      );

    }


    const contractHeaders =
      djApiFindHeadersV5_(
        contractSheet
      );

    djApiAppendRowV5_(
      contractSheet,
      contractHeaders,
      {
        Kontrak_ID:
          contractId,
        Tenant_ID:
          tenantId,
        No_Kamar:
          finalRoom,
        Tanggal_Mulai:
          startDate,
        Tanggal_Berakhir:
          '',
        Harga_Sewa:
          finalPrice,
        Deposit:
          300000,
        Surat_Perjanjian_File_URL:
          agreementFile.fileUrl,
        Surat_Perjanjian_File_ID:
          agreementFile.fileId,
        Surat_Perjanjian_File_Name:
          agreementFile.fileName,

        Kontrak_Digital_File_URL:
          digitalContract.fileUrl,

        Kontrak_Digital_File_ID:
          digitalContract.fileId,

        Kontrak_Digital_File_Name:
          digitalContract.fileName,

        Tanggal_Generate_Digital:
          digitalContract.generatedAt,

        Versi_Perjanjian:
          expectedAgreementVersion,
        Status_Kontrak:
          'AKTIF',
        Catatan:
          'Dibuat otomatis setelah aktivasi akun tenant dan arsip perjanjian tersedia.',
        Created_At:
          now,
        Updated_At:
          now
      }
    );

    const tenantHeaders =
      djApiFindHeadersV5_(
        tenantSheet
      );

    djApiAppendRowV5_(
      tenantSheet,
      tenantHeaders,
      {
        Tenant_ID:
          tenantId,
        Source_Key:
          'PENDAFTARAN#' + registrationId,
        Tanggal_Sumber:
          now,
        Nama_Lengkap:
          name,
        Nama_Panggilan:
          nickname,
        No_HP:
          storedPhone,
        Email:
          email,
        NIK_KTP:
          nik,
        Pekerjaan:
          occupation,
        Perusahaan_Instansi:
          company,
        Jenis_Kelamin:
          gender,
        Kontak_Darurat:
          emergencyName,
        Hubungan_Kontak_Darurat:
          emergencyRelation,
        No_HP_Kontak_Darurat:
          emergencyPhone,
        No_Kamar:
          finalRoom,
        Tanggal_Mulai:
          startDate,
        Rencana_Mulai_Sewa:
          startDate,
        KTP_File_URL:
          ktpFile.fileUrl,
        KTP_File_ID:
          ktpFile.fileId,
        KTP_File_Name:
          ktpFile.fileName,
        Tanda_Tangan_File_URL:
          signatureFile.fileUrl,
        Tanda_Tangan_File_ID:
          signatureFile.fileId,
        Tanda_Tangan_File_Name:
          signatureFile.fileName,
        Surat_Perjanjian_File_URL:
          agreementFile.fileUrl,
        Surat_Perjanjian_File_ID:
          agreementFile.fileId,
        Surat_Perjanjian_File_Name:
          agreementFile.fileName,
        Persetujuan_Aturan:
          'YA',
        Versi_Aturan:
          'ATURAN-2026-V1',
        Tanggal_Persetujuan_Aturan:
          now,
        Persetujuan_Perjanjian:
          'YA',
        Versi_Perjanjian:
          expectedAgreementVersion,
        Tanggal_Persetujuan_Perjanjian:
          now,
        Status_Tenant:
          'AKTIF',
        Catatan:
          'Aktivasi akun berhasil melalui website setelah KTP dan perjanjian sewa bertanda tangan diarsipkan.',
        Created_At:
          now,
        Updated_At:
          now
      }
    );

    const accountHeaders =
      djAcctGetHeadersV2_(
        accountSheet
      );

    const accountRow =
      accountSheet.getLastRow() +
      1;

    djAcctSetFieldsV2_(
      accountSheet,
      accountRow,
      accountHeaders,
      {
        Tenant_ID:
          tenantId,
        Status_Akun:
          'AKTIF',
        Password_Salt:
          passwordSalt,
        Password_Hash:
          passwordHash,
        Wajib_Ganti_Password:
          'YA',
        Session_Token_Hash:
          '',
        Session_Expires:
          '',
        Failed_Attempts:
          0,
        Locked_Until:
          '',
        Created_At:
          now,
        Updated_At:
          now
      }
    );

    const roomSheet =
      ss.getSheetByName(
        'Kamar'
      );

    if (!roomSheet) {
      throw new Error(
        'Sheet Kamar tidak ditemukan.'
      );
    }

    const roomTable =
      djApiReadTableV5_(
        roomSheet,
        [
          'No_Kamar'
        ]
      );

    const roomRow =
      djApiFindRowV5_(
        roomTable,
        [
          'No_Kamar'
        ],
        finalRoom
      );

    if (
      roomRow < 0
    ) {
      throw new Error(
        'Kamar final tidak ditemukan: ' +
        finalRoom
      );
    }

    const roomHeaders =
      djApiFindHeadersV5_(
        roomSheet
      );

    djApiUpdateRowV5_(
      roomSheet,
      roomRow,
      roomHeaders,
      {
        Status:
          'TERISI',
        Tenant_ID:
          tenantId,
        Nama_Tenant:
          name
      }
    );

    const latestRegistrationHeaders =
      djApiFindHeadersV5_(
        registrationSheet
      );

    djApiUpdateRowV5_(
      registrationSheet,
      registrationRow,
      latestRegistrationHeaders,
      {
        Kamar_Diminati:
          requestedRoom,
        Kamar_Final:
          finalRoom,
        No_Kamar:
          finalRoom,
        Harga_Final:
          finalPrice,
        Status_Pendaftaran:
          'SELESAI',
        Status_Akun:
          'AKTIF',
        Tenant_ID:
          tenantId,
        Kontrak_ID:
          contractId,
        Aktivasi_Token_Hash:
          '',
        Aktivasi_Token_Expires:
          '',
        Aktivasi_Selesai_At:
          now,
        Persetujuan_Aturan:
          'YA',
        Versi_Aturan:
          'ATURAN-2026-V1',
        Tanggal_Persetujuan_Aturan:
          now,
        Persetujuan_Perjanjian:
          'YA',
        Versi_Perjanjian:
          expectedAgreementVersion,
        Tanggal_Persetujuan_Perjanjian:
          now,
        Surat_Perjanjian_File_URL:
          agreementFile.fileUrl,
        Surat_Perjanjian_File_ID:
          agreementFile.fileId,
        Surat_Perjanjian_File_Name:
          agreementFile.fileName,
        Catatan_Verifikasi:
          'Aktivasi akun selesai. Tenant, kontrak, KTP, dan arsip perjanjian bertanda tangan tersedia.'
      }
    );

    SpreadsheetApp.flush();

    try {
      djApiLogV5_(
        ss,
        'TENANT_ACTIVATION',
        tenantId +
        ' berhasil diaktivasi dari ' +
        registrationId
      );
    } catch (err) {}

    return {
      ok:
        true,
      registrationId:
        registrationId,
      tenantId:
        tenantId,
      kontrakId:
        contractId,
      nama:
        name,
      kamar:
        finalRoom,
      hargaSewa:
        finalPrice,
      deposit:
        300000,
      temporaryPassword:
        temporaryPassword,
      mustChangePassword:
        true,
      agreementVersion:
        expectedAgreementVersion,
      agreementFileUrl:
        agreementFile.fileUrl,

      digitalContractFileUrl:
        digitalContract.fileUrl,

      digitalContractFileId:
        digitalContract.fileId,

      digitalContractFileName:
        digitalContract.fileName,

      message:
        'Aktivasi akun selesai. Tenant ID dan password sementara telah dibuat setelah KTP, perjanjian sewa bertanda tangan, persetujuan perjanjian, persetujuan aturan, dan tanda tangan lengkap.'
    };

  } finally {

    lock.releaseLock();

  }

}


function djApiNormalizePhoneV1_(
  value
) {

  return String(
    value || ''
  )
  .replace(
    /[^0-9+]/g,
    ''
  )
  .replace(
    /^\+62/,
    '0'
  )
  .trim();

}


function djApiRandomTokenV1_(
  length
) {

  const alphabet =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

  let result =
    '';

  for (
    let i = 0;
    i < Number(
      length || 32
    );
    i++
  ) {

    const index =
      Math.floor(
        Math.random() *
        alphabet.length
      );

    result +=
      alphabet[index];

  }

  return result;

}


function djApiTokenHashV1_(
  token
) {

  const bytes =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(
        token || ''
      )
    );

  return bytes
    .map(
      function(byte) {

        const n =
          byte < 0
            ? byte + 256
            : byte;

        return (
          n.toString(16)
        )
        .padStart(
          2,
          '0'
        );

      }
    )
    .join('');

}


function djApiNextPrefixedIdV1_(
  table,
  header,
  prefix
) {

  let max =
    0;

  if (
    table &&
    Array.isArray(
      table.rows
    )
  ) {

    const col =
      djApiFindColumnV5_(
        table.headers,
        [
          header
        ]
      );

    if (
      col >= 0
    ) {

      table.rows.forEach(
        function(row) {

          const value =
            String(
              row[col] || ''
            ).trim().toUpperCase();

          const match =
            value.match(
              new RegExp(
                '^' +
                prefix +
                '(\\d+)$'
              )
            );

          if (match) {

            max =
              Math.max(
                max,
                Number(
                  match[1]
                )
              );

          }

        }
      );

    }

  }

  return (
    prefix +
    String(
      max + 1
    ).padStart(
      3,
      '0'
    )
  );

}


function djApiSaveActivationFileV1_(
  ss,
  category,
  tenantId,
  base64,
  mimeType,
  originalName,
  prefix
) {

  try {

    const clean =
      String(
        base64 || ''
      )
      .replace(
        /^data:[^;]+;base64,/,
        ''
      )
      .replace(
        /\s/g,
        ''
      );

    if (!clean) {
      return {
        ok: false,
        error:
          'File ' +
          prefix +
          ' kosong.'
      };
    }

    const bytes =
      Utilities
        .base64Decode(
          clean
        );

    if (
      bytes.length >
      8 * 1024 * 1024
    ) {
      return {
        ok: false,
        error:
          'File ' +
          prefix +
          ' terlalu besar. Maksimal 8 MB.'
      };
    }

    let safeMime =
      String(
        mimeType ||
        'image/jpeg'
      )
      .toLowerCase();

    const allowedMimeTypes = [

      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf'

    ];

    if (
      allowedMimeTypes.indexOf(
        safeMime
      ) < 0
    ) {
      safeMime =
        'image/jpeg';
    }

    let ext =
      '.jpg';

    if (
      safeMime ===
      'image/png'
    ) {
      ext =
        '.png';

    } else if (
      safeMime ===
      'image/webp'
    ) {
      ext =
        '.webp';

    } else if (
      safeMime ===
      'application/pdf'
    ) {
      ext =
        '.pdf';
    }

    const safeOriginal =
      String(
        originalName || ''
      )
      .replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );

    const fileName =
      prefix +
      '-' +
      tenantId +
      '-' +
      Date.now() +
      '-' +
      (
        safeOriginal ||
        ('dokumen' + ext)
      );

    const blob =
      Utilities.newBlob(
        bytes,
        safeMime,
        fileName
      );

    const root =
      djApiGetOrCreateFolderV5_(
        null,
        'DJ Family Kost'
      );

    const categoryFolder =
      djApiGetOrCreateFolderV5_(
        root,
        category
      );

    const tenantFolder =
      djApiGetOrCreateFolderV5_(
        categoryFolder,
        tenantId
      );

    const file =
      tenantFolder.createFile(
        blob
      );

    return {
      ok:
        true,
      fileId:
        file.getId(),
      fileUrl:
        file.getUrl(),
      fileName:
        file.getName()
    };

  } catch (err) {

    return {
      ok:
        false,
      error:
        'Gagal menyimpan file ' +
        prefix +
        ': ' +
        (
          err.message ||
          'unknown error'
        )
    };

  }

}


function djApiBuildRegistrationsV5_(
  table
) {

  if (!table) {

    return [];

  }


  return table.rows.map(
    function(row) {

      return {

        id:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Pendaftaran_ID'
            ]
          ),

        name:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Nama_Lengkap'
            ]
          ),

        phone:
          djApiValueV5_(
            row,
            table.headers,
            [
              'No_HP'
            ]
          ),

        room:
          djApiValueV5_(
            row,
            table.headers,
            [
              'No_Kamar'
            ]
          ),

        status:
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Status_Pendaftaran'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase(),

        tenantId:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Tenant_ID'
            ]
          )

      };

    }
  );

}


/* ============================================================
 * MASTER REJECT REGISTRATION
 * ============================================================
 */
function djApiRejectRegistrationV5_(
  registrationId,
  reason,
  masterId
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pendaftaran'
    );


  if (!sheet) {

    throw new Error(
      'Sheet Pendaftaran tidak ditemukan.'
    );

  }


  djApiEnsureSheetFieldsV5_(
    sheet,
    [
      'Status_Pendaftaran',
      'Catatan_Verifikasi',
      'Diverifikasi_Oleh',
      'Tanggal_Verifikasi'
    ]
  );


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Pendaftaran_ID'
      ]
    );


  const row =
    djApiFindRowV5_(
      table,
      [
        'Pendaftaran_ID'
      ],
      registrationId
    );


  if (
    row < 0
  ) {

    throw new Error(
      'Pendaftaran tidak ditemukan.'
    );

  }


  const headers =
    djApiFindHeadersV5_(
      sheet
    );


  djApiUpdateRowV5_(
    sheet,
    row,
    headers,
    {

      Status_Pendaftaran:
        'DITOLAK',

      Catatan_Verifikasi:
        reason ||
        'Ditolak oleh Master.',

      Diverifikasi_Oleh:
        masterId,

      Tanggal_Verifikasi:
        new Date()

    }
  );


  SpreadsheetApp.flush();


  return {

    ok:
      true,

    message:
      'Pendaftaran ditolak.'

  };

}


/* ============================================================
 * MASTER TENANTS
 * ============================================================
 */
function djApiMasterTenantsV5_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const tenantTable =
    djApiReadSafeV5_(
      ss,
      'Tenant',
      [
        'Tenant_ID'
      ]
    );


  const contractTable =
    djApiReadSafeV5_(
      ss,
      'Kontrak',
      [
        'Kontrak_ID'
      ]
    );


  return {

    items:
      djApiBuildTenantsV5_(
        tenantTable,
        contractTable
      )

  };

}


function djApiBuildTenantsV5_(
  table,
  contractTable
) {

  if (!table) {

    return [];

  }
    const digitalContractByTenantId = {};


  if (
    contractTable &&
    Array.isArray(
      contractTable.rows
    )
  ) {

    contractTable.rows.forEach(
      function(row) {

        const id =
          String(
            djApiValueV5_(
              row,
              contractTable.headers,
              [
                'Tenant_ID'
              ]
            ) || ''
          ).trim();


        if (!id) {
          return;
        }


        digitalContractByTenantId[id] =
          djApiValueV5_(
            row,
            contractTable.headers,
            [
              'Kontrak_Digital_File_URL'
            ]
          ) || '';

      }
    );

  }


  return table.rows.map(
    function(row) {

      return {

        tenantId:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Tenant_ID'
            ]
          ),

        name:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Nama_Lengkap'
            ]
          ),

        phone:
          djApiValueV5_(
            row,
            table.headers,
            [
              'No_HP'
            ]
          ),

        email:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Email'
            ]
          ),

        room:
          djApiValueV5_(
            row,
            table.headers,
            [
              'No_Kamar'
            ]
          ),

        status:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Status_Tenant'
            ]
          ),

        ktp:
          djApiValueV5_(
            row,
            table.headers,
            [
              'KTP_File_URL'
            ]
          ),

        surat:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Surat_Pernyataan_File_URL'
            ]
          ),

        contractFile:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Surat_Perjanjian_File_URL',
              'Kontrak_File_URL',
              'Perjanjian_File_URL'
            ]
          ),

        digitalContract:
          digitalContractByTenantId[
            String(
              djApiValueV5_(
                row,
                table.headers,
                [
                  'Tenant_ID'
                ]
              ) || ''
            ).trim()
          ] || ''

      };

    }
  );

}


/* ============================================================
 * MASTER RESET PASSWORD
 * ============================================================
 */
function djApiMasterResetPasswordV5_(
  tenantId
) {

  tenantId =
    String(
      tenantId || ''
    )
    .trim()
    .toUpperCase();


  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Akun_Tenant'
    );


  if (!sheet) {

    return {

      ok: false,

      error:
        'Sheet Akun_Tenant tidak ditemukan.'

    };

  }


  const row =
    djAcctFindAccountRowV2_(
      sheet,
      tenantId
    );


  if (
    !row ||
    row < 1
  ) {

    return {

      ok: false,

      error:
        'Akun tenant tidak ditemukan.'

    };

  }


  const accountHeaders =
    djAcctGetHeadersV2_(
      sheet
    );

  const accountValues =
    sheet
      .getRange(
        row,
        1,
        1,
        accountHeaders.length
      )
      .getValues()[0];

  const accountStatus =
    String(
      djApiValueV5_(
        accountValues,
        accountHeaders,
        [
          'Status_Akun'
        ]
      ) || ''
    )
    .trim()
    .toUpperCase();

  if (
    accountStatus === 'NONAKTIF' ||
    accountStatus === 'NON-AKTIF'
  ) {

    return {

      ok: false,

      error:
        'Akun tenant sudah nonaktif. Reset password tidak mengaktifkan kembali akun tenant lama.'

    };

  }


  const tenantSheetForReset =
    ss.getSheetByName(
      'Tenant'
    );

  if (tenantSheetForReset) {

    const tenantTableForReset =
      djApiReadTableV5_(
        tenantSheetForReset,
        ['Tenant_ID']
      );

    if (tenantTableForReset) {

      const tenantRowForReset =
        djApiFindRowV5_(
          tenantTableForReset,
          ['Tenant_ID'],
          tenantId
        );

      if (tenantRowForReset > 0) {

        const tenantDataRowForReset =
          tenantTableForReset.rows[
            tenantRowForReset -
            tenantTableForReset.headerRow -
            1
          ];

        const tenantStatusForReset =
          String(
            djApiValueV5_(
              tenantDataRowForReset,
              tenantTableForReset.headers,
              [
                'Status_Tenant',
                'Status'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase();

        if (
          tenantStatusForReset === 'NONAKTIF' ||
          tenantStatusForReset === 'NON-AKTIF'
        ) {

          return {

            ok: false,

            error:
              'Tenant sudah nonaktif. Reset password tidak mengaktifkan kembali tenant yang sudah checkout.'

          };

        }

      }

    }

  }


  const password =
    djAcctGeneratePasswordV2_();


  const salt =
    Utilities
      .getUuid()
      .replace(
        /-/g,
        ''
      );


  const hash =
    djAcctHashPasswordV2_(
      password,
      salt
    );


  const headers =
    djAcctGetHeadersV2_(
      sheet
    );


  djAcctSetFieldsV2_(
    sheet,
    row,
    headers,
    {

      Password_Salt:
        salt,

      Password_Hash:
        hash,

      Status_Akun:
        'AKTIF',

      Wajib_Ganti_Password:
        'YA',

      Session_Token_Hash:
        '',

      Session_Expires:
        '',

      Failed_Attempts:
        0,

      Locked_Until:
        '',

      Updated_At:
        new Date()

    }
  );


  SpreadsheetApp.flush();


  return {

    ok:
      true,

    tenantId:
      tenantId,

    temporaryPassword:
      password

  };

}


/* ============================================================
 * MASTER PAYMENTS
 * ============================================================
 */
function djApiMasterPaymentsV5_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pembayaran'
    );


  if (!sheet) {

    return {

      items: []

    };

  }


  djApiEnsurePaymentColumnsV5_(
    sheet
  );


  return {

    items:
      djApiBuildPaymentsV5_(
        djApiReadTableV5_(
          sheet,
          [
            'Tenant_ID'
          ]
        )
      )

  };

}


/* ============================================================
 * TAGIHAN TAMBAHAN — MASTER
 * ============================================================
 */

const DJ39_ADDITIONAL_CHARGE_SHEET =
  'Tagihan_Tambahan';

const DJ39_ADDITIONAL_CHARGE_HEADERS = [
  'Tagihan_Tambahan_ID',
  'Tenant_ID',
  'No_Kamar',
  'Nama_Tenant',
  'Jenis',
  'Deskripsi',
  'Nominal',
  'Tanggal_Dibuat',
  'Jatuh_Tempo',
  'Status',
  'Bukti_URL',
  'Dibuat_Oleh',
  'Nominal_Dibayar',
  'Tanggal_Pembayaran',
  'Metode_Pembayaran',
  'Status_Verifikasi',
  'Bukti_Pembayaran_URL',
  'Bukti_Pembayaran_File_ID',
  'Tanggal_Verifikasi',
  'Diverifikasi_Oleh',
  'Catatan_Verifikasi',
  'Tanggal_Dibayar',
  'Tanggal_Dibatalkan',
  'Dibatalkan_Oleh',
  'Catatan'
];


function djApiEnsureAdditionalChargeSheetV1_(
  ss
) {

  let sheet =
    ss.getSheetByName(
      DJ39_ADDITIONAL_CHARGE_SHEET
    );


  if (
    !sheet
  ) {

    sheet =
      ss.insertSheet(
        DJ39_ADDITIONAL_CHARGE_SHEET
      );

    sheet
      .getRange(
        1,
        1,
        1,
        DJ39_ADDITIONAL_CHARGE_HEADERS.length
      )
      .setValues(
        [
          DJ39_ADDITIONAL_CHARGE_HEADERS
        ]
      );

    return sheet;

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Tagihan_Tambahan_ID'
      ]
    );


  if (
    !table
  ) {

    sheet
      .getRange(
        1,
        1,
        1,
        DJ39_ADDITIONAL_CHARGE_HEADERS.length
      )
      .setValues(
        [
          DJ39_ADDITIONAL_CHARGE_HEADERS
        ]
      );

  } else {

    djApiEnsureFieldsV5_(
      sheet,
      table.headerRow,
      table.headers,
      DJ39_ADDITIONAL_CHARGE_HEADERS
    );

  }


  return sheet;

}


function djApiGetAdditionalChargeTenantV1_(
  ss,
  tenantId
) {

  const table =
    djApiReadSafeV5_(
      ss,
      'Tenant',
      [
        'Tenant_ID'
      ]
    );


  if (
    !table
  ) {

    return null;

  }


  for (
    let i = 0;
    i < table.rows.length;
    i++
  ) {

    const id =
      String(
        djApiValueV5_(
          table.rows[i],
          table.headers,
          [
            'Tenant_ID'
          ]
        ) || ''
      )
      .trim()
      .toUpperCase();


    if (
      id !==
      String(
        tenantId || ''
      )
      .trim()
      .toUpperCase()
    ) {

      continue;

    }


    return {

      tenantId:
        id,

      name:
        djApiValueV5_(
          table.rows[i],
          table.headers,
          [
            'Nama_Lengkap',
            'Nama_Tenant'
          ]
        ) || '',

      room:
        djApiValueV5_(
          table.rows[i],
          table.headers,
          [
            'No_Kamar'
          ]
        ) || '',

      email:
        djApiValueV5_(
          table.rows[i],
          table.headers,
          [
            'Email'
          ]
        ) || '',

      phone:
        djApiValueV5_(
          table.rows[i],
          table.headers,
          [
            'No_HP'
          ]
        ) || ''

    };

  }


  return null;

}


function djApiNextAdditionalChargeIdV1_(
  sheet
) {

  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Tagihan_Tambahan_ID'
      ]
    );


  let max =
    0;


  if (
    table
  ) {

    table.rows.forEach(
      function(row) {

        const id =
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Tagihan_Tambahan_ID'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase();


        const match =
          id.match(
            /^TAM-(\d+)$/
          );


        if (
          match
        ) {

          max =
            Math.max(
              max,
              Number(
                match[1]
              )
            );

        }

      }
    );

  }


  return 'TAM-' +
    String(
      max + 1
    ).padStart(
      4,
      '0'
    );

}


function djApiBuildAdditionalChargesV1_(
  table
) {

  if (!table) return [];

  return table.rows
    .map(
      function(row) {

        const id =
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Tagihan_Tambahan_ID'
              ]
            ) || ''
          ).trim();


        const tenantId =
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Tenant_ID'
              ]
            ) || ''
          ).trim();


        if (!id && !tenantId) return null;


        return {

          id:
            id,

          tenantId:
            tenantId,

          room:
            djApiValueV5_(
              row,
              table.headers,
              [
                'No_Kamar'
              ]
            ) || '',

          name:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Nama_Tenant'
              ]
            ) || '',

          type:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Jenis'
              ]
            ) || 'Lainnya',

          description:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Deskripsi'
              ]
            ) || '',

          amount:
            djApiNumberV5_(
              djApiValueV5_(
                row,
                table.headers,
                [
                  'Nominal'
                ]
              )
            ),

          createdAt:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Tanggal_Dibuat'
              ]
            ) || '',

          dueDate:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Jatuh_Tempo'
              ]
            ) || '',

          status:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Status'
              ]
            ) || 'BELUM DIBAYAR',

          proofUrl:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Bukti_URL'
              ]
            ) || '',

          createdBy:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Dibuat_Oleh'
              ]
            ) || '',

          paidAmount:
            djApiNumberV5_(
              djApiValueV5_(
                row,
                table.headers,
                [
                  'Nominal_Dibayar'
                ]
              )
            ),

          paymentDate:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Tanggal_Pembayaran'
              ]
            ) || '',

          paymentMethod:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Metode_Pembayaran'
              ]
            ) || '',

          verification:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Status_Verifikasi'
              ]
            ) || '',

          verifiedDate:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Tanggal_Verifikasi'
              ]
            ) || '',

          proofUrl:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Bukti_Pembayaran_URL'
              ]
            ) || '',

          proofFileId:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Bukti_Pembayaran_File_ID'
              ]
            ) || '',

          paidDate:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Tanggal_Dibayar'
              ]
            ) || '',

          cancelledDate:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Tanggal_Dibatalkan'
              ]
            ) || '',

          cancelledBy:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Dibatalkan_Oleh'
              ]
            ) || '',

          note:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Catatan'
              ]
            ) || ''

        };

      }
    )
    .filter(Boolean);

}


function djApiTenantAdditionalChargesV1_(
  tenantId
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    djApiEnsureAdditionalChargeSheetV1_(
      ss
    );

  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Tagihan_Tambahan_ID'
      ]
    );

  const items =
    djApiBuildAdditionalChargesV1_(
      table
    )
    .filter(
      function(item) {
        return (
          String(
            item.tenantId || ''
          ).trim().toUpperCase() ===
          String(
            tenantId || ''
          ).trim().toUpperCase()
        );
      }
    );

  return {
    items: items
  };

}


function djApiFindAdditionalChargeForTenantV1_(
  ss,
  tenantId,
  chargeId
) {

  const sheet =
    djApiEnsureAdditionalChargeSheetV1_(
      ss
    );

  const found =
    djApiFindAdditionalChargeRowV1_(
      sheet,
      chargeId
    );

  if (
    found.rowNumber < 0
  ) {
    return null;
  }

  const index =
    found.rowNumber -
    found.table.headerRow -
    1;

  const rowTenantId =
    String(
      djApiValueV5_(
        found.table.rows[index],
        found.table.headers,
        [
          'Tenant_ID'
        ]
      ) || ''
    ).trim().toUpperCase();

  if (
    rowTenantId !==
    String(
      tenantId || ''
    ).trim().toUpperCase()
  ) {
    return null;
  }

  return {
    sheet: sheet,
    table: found.table,
    rowNumber: found.rowNumber,
    row: found.table.rows[index]
  };

}


function djApiSaveAdditionalChargeProofV1_(
  base64,
  mimeType,
  originalName,
  tenantId,
  chargeId
) {

  try {

    if (!base64) {
      return {
        ok: false,
        error: 'Foto bukti kosong.'
      };
    }

    const cleanBase64 =
      String(
        base64
      )
      .replace(
        /^data:[^;]+;base64,/,
        ''
      )
      .replace(
        /\s/g,
        ''
      );

    const bytes =
      Utilities.base64Decode(
        cleanBase64
      );

    if (
      bytes.length >
      8 * 1024 * 1024
    ) {
      return {
        ok: false,
        error: 'Ukuran foto terlalu besar. Maksimal 8 MB.'
      };
    }

    let safeMime =
      String(
        mimeType ||
        'image/jpeg'
      ).toLowerCase();

    if (
      safeMime !== 'image/jpeg' &&
      safeMime !== 'image/png' &&
      safeMime !== 'image/webp'
    ) {
      safeMime =
        'image/jpeg';
    }

    let extension =
      '.jpg';

    if (
      safeMime === 'image/png'
    ) {
      extension = '.png';
    } else if (
      safeMime === 'image/webp'
    ) {
      extension = '.webp';
    }

    const safeOriginal =
      String(
        originalName || ''
      )
      .replace(
        /[^a-zA-Z0-9._-]/g,
        '_'
      );

    const fileName =
      'BUKTI-TAMBAHAN-' +
      chargeId +
      '-' +
      tenantId +
      '-' +
      Date.now() +
      '-' +
      (
        safeOriginal ||
        'transfer' +
        extension
      );

    const blob =
      Utilities.newBlob(
        bytes,
        safeMime,
        fileName
      );

    const rootFolder =
      djApiGetOrCreateFolderV5_(
        null,
        'DJ Family Kost'
      );

    const additionalFolder =
      djApiGetOrCreateFolderV5_(
        rootFolder,
        'Tagihan Tambahan'
      );

    const file =
      additionalFolder.createFile(
        blob
      );

    return {
      ok: true,
      fileId: file.getId(),
      fileUrl: file.getUrl(),
      fileName: file.getName()
    };

  } catch (error) {

    return {
      ok: false,
      error:
        error &&
        error.message
          ? error.message
          : String(error)
    };

  }

}


function djApiSubmitAdditionalChargePaymentV1_(
  tenant,
  body
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const chargeId =
    String(
      body.chargeId || ''
    ).trim();

  const amount =
    djApiNumberV5_(
      body.amount
    );

  const paymentDateInput =
    String(
      body.paymentDate || ''
    ).trim();

  const method =
    String(
      body.method || ''
    ).trim();

  const proofBase64 =
    String(
      body.proofBase64 || ''
    ).trim();

  if (!chargeId) {
    return {
      ok: false,
      error: 'Tagihan tambahan tidak ditemukan.'
    };
  }

  if (amount <= 0) {
    return {
      ok: false,
      error: 'Nominal pembayaran tidak valid.'
    };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(paymentDateInput)) {
    return {
      ok: false,
      error: 'Tanggal pembayaran tidak valid.'
    };
  }

  if (!method) {
    return {
      ok: false,
      error: 'Metode pembayaran wajib dipilih.'
    };
  }

  if (!proofBase64) {
    return {
      ok: false,
      error: 'Foto bukti pembayaran wajib diupload.'
    };
  }

  const paymentDate =
    new Date(
      paymentDateInput +
      'T00:00:00'
    );

  if (paymentDate > new Date()) {
    return {
      ok: false,
      error: 'Tanggal pembayaran tidak boleh melebihi hari ini.'
    };
  }

  const found =
    djApiFindAdditionalChargeForTenantV1_(
      ss,
      tenant.tenantId,
      chargeId
    );

  if (!found) {
    return {
      ok: false,
      error: 'Tagihan tambahan tidak ditemukan atau bukan milik tenant ini.'
    };
  }

  const row =
    found.row;

  const status =
    String(
      djApiValueV5_(
        row,
        found.table.headers,
        [
          'Status'
        ]
      ) || ''
    ).trim().toUpperCase();

  const verification =
    String(
      djApiValueV5_(
        row,
        found.table.headers,
        [
          'Status_Verifikasi'
        ]
      ) || ''
    ).trim().toUpperCase();

  if (
    status === 'LUNAS' ||
    status === 'DIBATALKAN'
  ) {
    return {
      ok: false,
      error: 'Tagihan ini sudah tidak dapat dibayar.'
    };
  }

  if (
    verification === 'MENUNGGU VERIFIKASI'
  ) {
    return {
      ok: false,
      error: 'Pembayaran tagihan tambahan ini masih menunggu verifikasi Master.'
    };
  }

  const nominalTagihan =
    djApiNumberV5_(
      djApiValueV5_(
        row,
        found.table.headers,
        [
          'Nominal'
        ]
      )
    );

  if (
    amount <
    nominalTagihan
  ) {
    return {
      ok: false,
      error:
        'Pembayaran harus melunasi seluruh tagihan tambahan (' +
        'Rp' +
        nominalTagihan.toLocaleString('id-ID') +
        ').'
    };
  }

  const proof =
    djApiSaveAdditionalChargeProofV1_(
      proofBase64,
      body.proofMimeType,
      body.proofOriginalName,
      tenant.tenantId,
      chargeId
    );

  if (
    !proof ||
    !proof.ok
  ) {
    return {
      ok: false,
      error:
        proof &&
        proof.error
          ? proof.error
          : 'Foto bukti pembayaran gagal disimpan.'
    };
  }

  djApiUpdateRowV5_(
    found.sheet,
    found.rowNumber,
    found.table.headers,
    {

      Nominal_Dibayar:
        amount,

      Tanggal_Pembayaran:
        paymentDate,

      Metode_Pembayaran:
        method,

      Status:
        'MENUNGGU VERIFIKASI',

      Status_Verifikasi:
        'MENUNGGU VERIFIKASI',

      Bukti_Pembayaran_URL:
        proof.fileUrl,

      Bukti_Pembayaran_File_ID:
        proof.fileId,

      Tanggal_Verifikasi:
        '',

      Diverifikasi_Oleh:
        '',

      Catatan_Verifikasi:
        '',

      Tanggal_Dibayar:
        '',

      Catatan:
        String(
          body.note || ''
        ).trim()

    }
  );

  SpreadsheetApp.flush();

  return {
    ok: true,
    chargeId: chargeId,
    paidAmount: amount,
    status: 'MENUNGGU VERIFIKASI',
    verification: 'MENUNGGU VERIFIKASI',
    message:
      'Pembayaran tagihan tambahan berhasil dikirim dan menunggu verifikasi Master.'
  };

}


function djApiVerifyAdditionalChargeV1_(
  chargeId,
  decision,
  reason,
  masterId
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    djApiEnsureAdditionalChargeSheetV1_(
      ss
    );

  const found =
    djApiFindAdditionalChargeRowV1_(
      sheet,
      chargeId
    );

  if (
    found.rowNumber < 0
  ) {
    return {
      ok: false,
      error: 'Tagihan tambahan tidak ditemukan.'
    };
  }

  const rowIndex =
    found.rowNumber -
    found.table.headerRow -
    1;

  const row =
    found.table.rows[rowIndex];

  const status =
    String(
      djApiValueV5_(
        row,
        found.table.headers,
        [
          'Status'
        ]
      ) || ''
    ).trim().toUpperCase();

  const verification =
    String(
      djApiValueV5_(
        row,
        found.table.headers,
        [
          'Status_Verifikasi'
        ]
      ) || ''
    ).trim().toUpperCase();

  const paidAmount =
    djApiNumberV5_(
      djApiValueV5_(
        row,
        found.table.headers,
        [
          'Nominal_Dibayar'
        ]
      )
    );

  const nominal =
    djApiNumberV5_(
      djApiValueV5_(
        row,
        found.table.headers,
        [
          'Nominal'
        ]
      )
    );

  const approve =
    String(
      decision || ''
    ).trim().toLowerCase() ===
    'approve';

  if (
    approve
  ) {

    if (
      verification !==
      'MENUNGGU VERIFIKASI'
    ) {
      return {
        ok: false,
        error:
          'Tagihan tambahan belum berada pada status Menunggu Verifikasi.'
      };
    }

    if (
      paidAmount <
      nominal
    ) {
      return {
        ok: false,
        error:
          'Nominal pembayaran masih kurang dari tagihan.'
      };
    }

    djApiUpdateRowV5_(
      sheet,
      found.rowNumber,
      found.table.headers,
      {

        Status:
          'LUNAS',

        Status_Verifikasi:
          'TERVERIFIKASI',

        Tanggal_Dibayar:
          djApiValueV5_(
            row,
            found.table.headers,
            [
              'Tanggal_Pembayaran'
            ]
          ) ||
          new Date(),

        Tanggal_Verifikasi:
          new Date(),

        Diverifikasi_Oleh:
          String(
            masterId || ''
          ).trim(),

        Catatan_Verifikasi:
          String(
            reason || ''
          ).trim()

      }
    );

    SpreadsheetApp.flush();

    return {
      ok: true,
      chargeId: chargeId,
      status: 'LUNAS',
      verification: 'TERVERIFIKASI',
      message:
        'Tagihan tambahan berhasil diverifikasi dan dinyatakan LUNAS.'
    };

  }

  if (
    decision ===
    'reject'
  ) {

    djApiUpdateRowV5_(
      sheet,
      found.rowNumber,
      found.table.headers,
      {

        Status:
          'DITOLAK',

        Status_Verifikasi:
          'DITOLAK',

        Tanggal_Verifikasi:
          new Date(),

        Diverifikasi_Oleh:
          String(
            masterId || ''
          ).trim(),

        Catatan_Verifikasi:
          String(
            reason || ''
          ).trim()

      }
    );

    SpreadsheetApp.flush();

    return {
      ok: true,
      chargeId: chargeId,
      status: 'DITOLAK',
      verification: 'DITOLAK',
      message:
        'Pembayaran tagihan tambahan ditolak.'
    };

  }

  return {
    ok: false,
    error: 'Keputusan verifikasi tidak valid.'
  };

}


function djApiAdditionalChargeProofV1_(
  chargeId
) {

  return djApiAdditionalChargeProofByTenantV1_(
    '',
    chargeId,
    true
  );

}


function djApiAdditionalChargeProofByTenantV1_(
  tenantId,
  chargeId,
  masterMode
) {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();

  const sheet =
    djApiEnsureAdditionalChargeSheetV1_(
      ss
    );

  const found =
    djApiFindAdditionalChargeRowV1_(
      sheet,
      chargeId
    );

  if (
    found.rowNumber < 0
  ) {
    return {
      ok: false,
      error: 'Tagihan tambahan tidak ditemukan.'
    };
  }

  const index =
    found.rowNumber -
    found.table.headerRow -
    1;

  const row =
    found.table.rows[index];

  const rowTenantId =
    String(
      djApiValueV5_(
        row,
        found.table.headers,
        [
          'Tenant_ID'
        ]
      ) || ''
    ).trim().toUpperCase();

  if (
    !masterMode &&
    rowTenantId !==
    String(
      tenantId || ''
    ).trim().toUpperCase()
  ) {
    return {
      ok: false,
      error: 'Akses tagihan tidak diizinkan.'
    };
  }

  let fileId =
    String(
      djApiValueV5_(
        row,
        found.table.headers,
        [
          'Bukti_Pembayaran_File_ID'
        ]
      ) || ''
    ).trim();

  const url =
    String(
      djApiValueV5_(
        row,
        found.table.headers,
        [
          'Bukti_Pembayaran_URL'
        ]
      ) || ''
    ).trim();

  if (
    !fileId &&
    url
  ) {
    fileId =
      djApiExtractDriveIdV5_(
        url
      );
  }

  if (!fileId) {

    if (url) {
      return {
        ok: true,
        external: true,
        url: url
      };
    }

    return {
      ok: false,
      error: 'Bukti pembayaran tagihan tambahan belum tersedia.'
    };

  }

  return djApiMasterMediaOpenV5_(
    fileId,
    url
  );

}


function djApiAdditionalChargeProofV1_(
  chargeId
) {

  return djApiAdditionalChargeProofByTenantV1_(
    '',
    chargeId,
    true
  );

}


function djApiMasterAdditionalChargesV1_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheet =
    djApiEnsureAdditionalChargeSheetV1_(
      ss
    );

  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Tagihan_Tambahan_ID'
      ]
    );

  const items =
    djApiBuildAdditionalChargesV1_(
      table
    );

  return {

    items:
      items,

    summary: {

      total:
        items.length,

      unpaid:
        items.filter(
          function(item) {
            return (
              String(
                item.status || ''
              ).toUpperCase() ===
              'BELUM DIBAYAR'
            );
          }
        ).length,

      paid:
        items.filter(
          function(item) {
            return (
              String(
                item.status || ''
              ).toUpperCase() ===
              'LUNAS'
            );
          }
        ).length,

      cancelled:
        items.filter(
          function(item) {
            return (
              String(
                item.status || ''
              ).toUpperCase() ===
              'DIBATALKAN'
            );
          }
        ).length,

      nominal:
        items.reduce(
          function(sum,item) {
            return (
              sum +
              Number(
                item.amount || 0
              )
            );
          },
          0
        )

    }

  };

}


function djApiCreateAdditionalChargeV1_(
  body,
  masterId
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const lock =
    LockService.getDocumentLock();

  lock.waitLock(30000);

  try {

    const tenantId =
      String(
        body.tenantId || ''
      ).trim().toUpperCase();

    const type =
      String(
        body.type || ''
      ).trim();

    const description =
      String(
        body.description || ''
      ).trim();

    const amount =
      djApiNumberV5_(
        body.amount
      );

    if (!tenantId) return { ok:false, error:'Tenant wajib dipilih.' };
    if (!type) return { ok:false, error:'Jenis tagihan wajib dipilih.' };
    if (!description) return { ok:false, error:'Deskripsi tagihan wajib diisi.' };
    if (amount <= 0) return { ok:false, error:'Nominal tagihan harus lebih dari Rp0.' };

    const tenant =
      djApiGetAdditionalChargeTenantV1_(
        ss,
        tenantId
      );

    if (!tenant) return { ok:false, error:'Tenant tidak ditemukan.' };

    const dueDate =
      body.dueDate
        ? djApiParseDateV7_(body.dueDate)
        : null;

    if (body.dueDate && !dueDate) {
      return { ok:false, error:'Tanggal jatuh tempo tidak valid.' };
    }

    const sheet =
      djApiEnsureAdditionalChargeSheetV1_(
        ss
      );

    const table =
      djApiReadTableV5_(
        sheet,
        [
          'Tagihan_Tambahan_ID'
        ]
      );

    const chargeId =
      djApiNextAdditionalChargeIdV1_(
        sheet
      );

    const data = {

      Tagihan_Tambahan_ID:
        chargeId,

      Tenant_ID:
        tenant.tenantId,

      No_Kamar:
        tenant.room,

      Nama_Tenant:
        tenant.name,

      Jenis:
        type,

      Deskripsi:
        description,

      Nominal:
        amount,

      Tanggal_Dibuat:
        new Date(),

      Jatuh_Tempo:
        dueDate || '',

      Status:
        'BELUM DIBAYAR',

      Nominal_Dibayar:
        0,

      Tanggal_Pembayaran:
        '',

      Metode_Pembayaran:
        '',

      Status_Verifikasi:
        '',

      Bukti_Pembayaran_URL:
        '',

      Bukti_Pembayaran_File_ID:
        '',

      Tanggal_Verifikasi:
        '',

      Diverifikasi_Oleh:
        '',

      Catatan_Verifikasi:
        '',

      Bukti_URL:
        String(
          body.proofUrl || ''
        ).trim(),

      Dibuat_Oleh:
        String(
          masterId || ''
        ).trim(),

      Tanggal_Dibayar:
        '',

      Tanggal_Dibatalkan:
        '',

      Dibatalkan_Oleh:
        '',

      Catatan:
        String(
          body.note || ''
        ).trim()

    };

    djApiAppendRowV5_(
      sheet,
      table.headers,
      data
    );

    SpreadsheetApp.flush();

    return {
      ok:true,
      chargeId:chargeId,
      message:'Tagihan tambahan berhasil dibuat.'
    };

  } finally {

    lock.releaseLock();

  }

}


function djApiFindAdditionalChargeRowV1_(
  sheet,
  chargeId
) {

  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Tagihan_Tambahan_ID'
      ]
    );

  if (!table) {
    return { table:null, rowNumber:-1 };
  }

  const col =
    djApiFindColumnV5_(
      table.headers,
      [
        'Tagihan_Tambahan_ID'
      ]
    );

  const target =
    String(
      chargeId || ''
    ).trim().toUpperCase();

  for (
    let i = 0;
    i < table.rows.length;
    i++
  ) {

    if (
      String(
        table.rows[i][col] || ''
      ).trim().toUpperCase() ===
      target
    ) {

      return {
        table:table,
        rowNumber:
          table.headerRow + 1 + i
      };

    }

  }

  return {
    table:table,
    rowNumber:-1
  };

}


function djApiUpdateAdditionalChargeV1_(
  body,
  masterId
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const lock =
    LockService.getDocumentLock();

  lock.waitLock(30000);

  try {

    const chargeId =
      String(
        body.chargeId || ''
      ).trim();

    if (!chargeId) {
      return { ok:false, error:'ID tagihan tambahan tidak ditemukan.' };
    }

    const sheet =
      djApiEnsureAdditionalChargeSheetV1_(
        ss
      );

    const found =
      djApiFindAdditionalChargeRowV1_(
        sheet,
        chargeId
      );

    if (found.rowNumber < 0) {
      return { ok:false, error:'Tagihan tambahan tidak ditemukan.' };
    }

    const rowIndex =
      found.rowNumber -
      found.table.headerRow -
      1;

    const status =
      String(
        djApiValueV5_(
          found.table.rows[rowIndex],
          found.table.headers,
          ['Status']
        ) || ''
      ).trim().toUpperCase();

    if (status === 'LUNAS' || status === 'DIBATALKAN') {
      return {
        ok:false,
        error:'Tagihan dengan status ' + status + ' tidak dapat diedit.'
      };
    }

    const tenantId =
      String(
        body.tenantId || ''
      ).trim().toUpperCase();

    const type =
      String(
        body.type || ''
      ).trim();

    const description =
      String(
        body.description || ''
      ).trim();

    const amount =
      djApiNumberV5_(
        body.amount
      );

    if (!tenantId || !type || !description || amount <= 0) {
      return {
        ok:false,
        error:'Tenant, jenis, deskripsi, dan nominal wajib diisi.'
      };
    }

    const tenant =
      djApiGetAdditionalChargeTenantV1_(
        ss,
        tenantId
      );

    if (!tenant) {
      return { ok:false, error:'Tenant tidak ditemukan.' };
    }

    const dueDate =
      body.dueDate
        ? djApiParseDateV7_(body.dueDate)
        : null;

    if (body.dueDate && !dueDate) {
      return { ok:false, error:'Tanggal jatuh tempo tidak valid.' };
    }

    djApiUpdateRowV5_(
      sheet,
      found.rowNumber,
      found.table.headers,
      {
        Tenant_ID:
          tenant.tenantId,
        No_Kamar:
          tenant.room,
        Nama_Tenant:
          tenant.name,
        Jenis:
          type,
        Deskripsi:
          description,
        Nominal:
          amount,
        Jatuh_Tempo:
          dueDate || '',
        Bukti_URL:
          String(
            body.proofUrl || ''
          ).trim(),
        Catatan:
          String(
            body.note || ''
          ).trim()
      }
    );

    SpreadsheetApp.flush();

    return {
      ok:true,
      message:'Tagihan tambahan berhasil diperbarui.'
    };

  } finally {

    lock.releaseLock();

  }

}


function djApiCancelAdditionalChargeV1_(
  chargeId,
  masterId
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const lock =
    LockService.getDocumentLock();

  lock.waitLock(30000);

  try {

    const sheet =
      djApiEnsureAdditionalChargeSheetV1_(
        ss
      );

    const found =
      djApiFindAdditionalChargeRowV1_(
        sheet,
        chargeId
      );

    if (found.rowNumber < 0) {
      return { ok:false, error:'Tagihan tambahan tidak ditemukan.' };
    }

    const rowIndex =
      found.rowNumber -
      found.table.headerRow -
      1;

    const status =
      String(
        djApiValueV5_(
          found.table.rows[rowIndex],
          found.table.headers,
          ['Status']
        ) || ''
      ).trim().toUpperCase();

    if (status === 'LUNAS') {
      return {
        ok:false,
        error:'Tagihan yang sudah LUNAS tidak dapat dibatalkan.'
      };
    }

    if (status === 'DIBATALKAN') {
      return {
        ok:true,
        message:'Tagihan sudah berstatus DIBATALKAN.'
      };
    }

    djApiUpdateRowV5_(
      sheet,
      found.rowNumber,
      found.table.headers,
      {
        Status:
          'DIBATALKAN',
        Tanggal_Dibatalkan:
          new Date(),
        Dibatalkan_Oleh:
          String(
            masterId || ''
          ).trim()
      }
    );

    SpreadsheetApp.flush();

    return {
      ok:true,
      message:'Tagihan tambahan dibatalkan.'
    };

  } finally {

    lock.releaseLock();

  }

}


function djApiBuildPaymentsV5_(
  table
) {

  if (!table) {

    return [];

  }


  return table.rows
    .map(
      function(row) {

        const id =
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Payment_ID',
                'Pembayaran_ID'
              ]
            ) || ''
          ).trim();


        const tenantId =
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Tenant_ID'
              ]
            ) || ''
          ).trim();


        /*
         * Jangan tampilkan baris kosong/placeholder dari sheet.
         * Kita hanya memfilter hasil API; data di sheet tidak dihapus.
         */
        if (
          !id &&
          !tenantId
        ) {

          return null;

        }


        const name =
          djApiValueV5_(
            row,
            table.headers,
            [
              'Nama_Tenant',
              'Nama_Lengkap'
            ]
          );


        const room =
          djApiValueV5_(
            row,
            table.headers,
            [
              'No_Kamar'
            ]
          );


        const period =
          djApiValueV5_(
            row,
            table.headers,
            [
              'Periode',
              'Periode_Pembayaran'
            ]
          );


        const dueDate =
          djApiValueV5_(
            row,
            table.headers,
            [
              'Tanggal_Jatuh_Tempo',
              'Jatuh_Tempo'
            ]
          );


        const rent =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Nominal_Sewa',
                'Tarif_Kamar'
              ]
            )
          );


        const paid =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Nominal_Dibayar'
              ]
            )
          );


        const fine =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Denda',
                'Denda_Terhitung'
              ]
            )
          );


        const storedTotal =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Total_Tagihan'
              ]
            )
          );


        const contract =
          tenantId
            ? djApiFindContractV5_(
                SpreadsheetApp.getActiveSpreadsheet(),
                tenantId
              )
            : null;


        const paymentPeriodDate =
          djApiCoerceDateMonthV5_(
            period
          );


        const firstBillingPeriod =
          djApiIsFirstBillingPeriodV5_(
            contract &&
            contract.startDate,
            paymentPeriodDate
          );


        const effectiveFine =
          firstBillingPeriod
            ? 0
            : fine;


        const total =
          firstBillingPeriod
            ? rent + effectiveFine
            : (
                storedTotal > 0
                  ? storedTotal
                  : rent + effectiveFine
              );


        const verification =
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Status_Verifikasi'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase();


        const storedStatus =
          String(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Status_Pembayaran'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase();


        let status =
          storedStatus;


        /*
         * Untuk pembayaran yang sudah diverifikasi, status harus
         * konsisten dengan nominal aktual terhadap Total_Tagihan.
         * Ini memperbaiki kasus pembayaran penuh yang masih terbaca
         * sebagai TERLAMBAT dan memastikan KURANG BAYAR terlihat
         * ketika nominal memang belum memenuhi total, termasuk saat
         * bukti pembayaran masih menunggu verifikasi.
         */
        if (
          verification === 'TERVERIFIKASI'
        ) {

          if (
            total > 0 &&
            paid >= total
          ) {

            status =
              'LUNAS';

          } else if (
            paid > 0 &&
            total > 0
          ) {

            status =
              'KURANG BAYAR';

          } else if (
            total > 0
          ) {

            status =
              'BELUM BAYAR';

          }

        } else if (
          verification === 'MENUNGGU VERIFIKASI'
        ) {

          /*
           * Status verifikasi dan status kecukupan pembayaran
           * adalah dua informasi yang terpisah.
           * Jika tenant sudah membayar tetapi nominal masih kurang,
           * Master harus melihat KURANG BAYAR walaupun bukti belum
           * diverifikasi.
           */
          if (
            paid > 0 &&
            total > 0 &&
            paid < total
          ) {

            status =
              'KURANG BAYAR';

          } else {

            status =
              'MENUNGGU VERIFIKASI';

          }

        } else if (
          verification === 'DITOLAK'
        ) {

          status =
            'DITOLAK';

        }


        return {

          id:
            id,

          tenantId:
            tenantId,

          name:
            name,

          room:
            room,

          period:
            period,

          dueDate:
            dueDate,

          rent:
            rent,

          paid:
            paid,

          fine:
            effectiveFine,

          total:
            total,

          status:
            status,

          verification:
            verification,

          proofUrl:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Bukti_Pembayaran_Foto',
                'Bukti_Pembayaran_URL'
              ]
            ),

          proofFileId:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Bukti_File_ID'
              ]
            ),

          method:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Metode_Pembayaran'
              ]
            ),

          verifiedBy:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Diverifikasi_Oleh'
              ]
            ),

          verificationDate:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Tanggal_Verifikasi'
              ]
            ),

          note:
            djApiValueV5_(
              row,
              table.headers,
              [
                'Keterangan',
                'Catatan'
              ]
            )

        };

      }
    )
    .filter(
      function(item) {

        return !!item;

      }
    )
    .reverse();

}



/* ============================================================
 * PAYMENT COLUMNS
 * ============================================================
 */
function djApiEnsurePaymentColumnsV5_(
  sheet
) {

  let table =
    djApiReadTableV5_(
      sheet,
      [
        'Tenant_ID'
      ]
    );


  if (!table) {

    throw new Error(
      'Header sheet Pembayaran tidak ditemukan.'
    );

  }


  let headers =
    table.headers.slice();


  [

    'Nominal_Dibayar',

    'Hari_Terlambat',

    'Status_Verifikasi',

    'Metode_Pembayaran',

    'Bukti_Pembayaran_Foto',

    'Bukti_File_ID',

    'Catatan_Verifikasi',

    'Diverifikasi_Oleh',

    'Tanggal_Verifikasi'

  ].forEach(
    function(field) {

      if (
        djApiFindColumnV5_(
          headers,
          [field]
        ) >= 0
      ) {

        return;

      }


      const col =
        sheet.getLastColumn() + 1;


      sheet
        .getRange(
          table.headerRow,
          col
        )
        .setValue(
          field
        );


      headers.push(
        field
      );

    }
  );


  return headers;

}


/* ============================================================
 * VERIFY PAYMENT
 * ============================================================
 */
function djApiVerifyPaymentV5_(
  paymentId,
  decision,
  reason,
  masterId
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pembayaran'
    );


  if (!sheet) {

    return {

      ok: false,

      error:
        'Sheet Pembayaran tidak ditemukan.'

    };

  }


  const headers =
    djApiEnsurePaymentColumnsV5_(
      sheet
    );


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Tenant_ID'
      ]
    );


  const row =
    djApiFindRowV5_(
      table,
      [
        'Payment_ID',
        'Pembayaran_ID'
      ],
      paymentId
    );


  if (
    row < 0
  ) {

    return {

      ok: false,

      error:
        'Payment ID tidak ditemukan.'

    };

  }


  const approve =
    String(
      decision || ''
    )
    .trim()
    .toLowerCase()
    ===
    'approve';


  const paid =
    djApiNumberV5_(
      djApiCellV5_(
        sheet,
        row,
        headers,
        [
          'Nominal_Dibayar'
        ]
      )
    );


  const rent =
    djApiNumberV5_(
      djApiCellV5_(
        sheet,
        row,
        headers,
        [
          'Nominal_Sewa',
          'Tarif_Kamar'
        ]
      )
    );


  const fine =
    djApiNumberV5_(
      djApiCellV5_(
        sheet,
        row,
        headers,
        [
          'Denda',
          'Denda_Terhitung'
        ]
      )
    );


  const total =
    djApiNumberV5_(
      djApiCellV5_(
        sheet,
        row,
        headers,
        [
          'Total_Tagihan'
        ]
      )
    )
    ||
    (
      rent +
      fine
    );


  const verification =
    approve
      ? 'TERVERIFIKASI'
      : 'DITOLAK';


  const paymentStatus =
    approve

      ? (
          paid >= total
            ? 'LUNAS'
            : 'KURANG BAYAR'
        )

      : 'DITOLAK';


  djApiUpdateRowV5_(
    sheet,
    row,
    headers,
    {

      Status_Verifikasi:
        verification,

      Status_Pembayaran:
        paymentStatus,

      Diverifikasi_Oleh:
        masterId,

      Tanggal_Verifikasi:
        new Date(),

      Catatan_Verifikasi:
        reason ||
        (
          approve
            ? 'Pembayaran diverifikasi Master.'
            : 'Pembayaran ditolak Master.'
        ),

      Last_Sync:
        new Date()

    }
  );


  SpreadsheetApp.flush();
  /* ========================================================
   * HISTORY — PEMBAYARAN
   * ========================================================
   *
   * Catat hanya jika status pembayaran/verifikasi berubah.
   * Tidak membuat History baru bila Master mengulang aksi
   * dengan hasil status yang sama.
   * ========================================================
   */

  try {

    const previousVerification =
      String(
        djApiCellV5_(
          sheet,
          row,
          headers,
          [
            'Status_Verifikasi'
          ]
        ) || ''
      )
      .trim()
      .toUpperCase();

    const previousPaymentStatus =
      String(
        djApiCellV5_(
          sheet,
          row,
          headers,
          [
            'Status_Pembayaran'
          ]
        ) || ''
      )
      .trim()
      .toUpperCase();

    const paymentTenantId =
      String(
        djApiCellV5_(
          sheet,
          row,
          headers,
          [
            'Tenant_ID'
          ]
        ) || ''
      ).trim();

    const paymentRoom =
      String(
        djApiCellV5_(
          sheet,
          row,
          headers,
          [
            'No_Kamar'
          ]
        ) || ''
      ).trim();

    const paymentPeriod =
      String(
        djApiCellV5_(
          sheet,
          row,
          headers,
          [
            'Periode',
            'Periode_Pembayaran'
          ]
        ) || ''
      ).trim();

    const statusChanged =
      previousVerification !== verification ||
      previousPaymentStatus !== paymentStatus;

    if (statusChanged) {

      const historyType =
        paymentStatus === 'LUNAS'
          ? 'PEMBAYARAN_LUNAS'
          : 'PEMBAYARAN_VERIFIKASI';

      djApiLogV5_(
        ss,
        historyType,
        'Pembayaran ' +
        paymentId +
        ' · Tenant ' +
        paymentTenantId +
        ' · Kamar ' +
        paymentRoom +
        ' · Periode ' +
        paymentPeriod +
        ' · Dibayar ' +
        paid +
        ' dari total ' +
        total +
        ' · Status ' +
        paymentStatus +
        ' · Verifikasi ' +
        verification +
        ' · Oleh ' +
        masterId +
        '.'
      );

    }

  } catch (historyError) {

    Logger.log(
      'HISTORY PAYMENT GAGAL | ' +
      paymentId +
      ' | ' +
      (
        historyError &&
        historyError.message
          ? historyError.message
          : historyError
      )
    );

  }


  /* ========================================================
   * EMAIL OTOMATIS PEMBAYARAN LUNAS
   * ========================================================
   *
   * Hanya berjalan ketika status akhir benar-benar LUNAS.
   *
   * Tidak dikirim untuk:
   * - MENUNGGU VERIFIKASI
   * - KURANG BAYAR
   * - DITOLAK
   *
   * Anti-duplikat ditangani oleh helper baru.
   * ========================================================
   */

  if (
    paymentStatus ===
    'LUNAS'
  ) {

    const emailTenantId =
      String(
        djApiCellV5_(
          sheet,
          row,
          headers,
          [
            'Tenant_ID'
          ]
        ) || ''
      ).trim();

    const emailRoom =
      String(
        djApiCellV5_(
          sheet,
          row,
          headers,
          [
            'No_Kamar'
          ]
        ) || ''
      ).trim();

    const emailPeriod =
      String(
        djApiCellV5_(
          sheet,
          row,
          headers,
          [
            'Periode',
            'Periode_Pembayaran'
          ]
        ) || ''
      ).trim();

    const emailPaid =
      djApiNumberV5_(
        djApiCellV5_(
          sheet,
          row,
          headers,
          [
            'Nominal_Dibayar'
          ]
        )
      );

    const emailTotal =
      djApiNumberV5_(
        djApiCellV5_(
          sheet,
          row,
          headers,
          [
            'Total_Tagihan'
          ]
        )
      )
      ||
      (
        rent +
        fine
      );

    const emailResult =
      djApiSendPaymentVerifiedEmailOnceV1_(
        paymentId,
        emailTenantId,
        emailRoom,
        emailPeriod,
        emailPaid,
        emailTotal
      );

    Logger.log(
      'EMAIL PAYMENT VERIFIED | ' +
      paymentId +
      ' | ' +
      emailResult.status +
      (
        emailResult.error
          ? ' | ' + emailResult.error
          : ''
      )
    );

  }


  return {

    ok:
      true,

    paymentId:
      paymentId,

    verification:
      verification,

    paymentStatus:
      paymentStatus,

    message:
      approve

        ? (

            paymentStatus ===
            'LUNAS'

              ? 'Pembayaran berhasil diverifikasi dan dinyatakan LUNAS.'

              : 'Pembayaran diverifikasi tetapi nominal masih kurang.'
          )

        : 'Pembayaran ditolak.'
  };
}

/* ============================================================
 * PAYMENT PROOF
 * ============================================================
 */
function djApiPaymentProofV5_(
  paymentId
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pembayaran'
    );


  if (!sheet) {

    return {

      ok: false,

      error:
        'Sheet Pembayaran tidak ditemukan.'

    };

  }


  const headers =
    djApiEnsurePaymentColumnsV5_(
      sheet
    );


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Tenant_ID'
      ]
    );


  const row =
    djApiFindRowV5_(
      table,
      [
        'Payment_ID',
        'Pembayaran_ID'
      ],
      paymentId
    );


  if (
    row < 0
  ) {

    return {

      ok: false,

      error:
        'Pembayaran tidak ditemukan.'

    };

  }


  let fileId =
    String(
      djApiCellV5_(
        sheet,
        row,
        headers,
        [
          'Bukti_File_ID'
        ]
      ) || ''
    ).trim();


  const url =
    String(
      djApiCellV5_(
        sheet,
        row,
        headers,
        [
          'Bukti_Pembayaran_Foto',
          'Bukti_Pembayaran_URL'
        ]
      ) || ''
    ).trim();


  if (
    !fileId &&
    url
  ) {

    fileId =
      djApiExtractDriveIdV5_(
        url
      );

  }


  if (!fileId) {

    if (url) {

      return {

        ok: true,

        external:
          true,

        url:
          url

      };

    }


    return {

      ok: false,

      error:
        'Foto bukti pembayaran tidak ditemukan.'

    };

  }


  return djApiMasterMediaOpenV5_(
    fileId,
    url
  );

}


/* ============================================================
 * MASTER MEDIA
 * ============================================================
 */
function djApiMasterMediaV5_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const items =
    [];


  /* ----------------------------------------------------------
   * TENANT DOCUMENTS
   * ----------------------------------------------------------
   */

  const tenantTable =
    djApiReadSafeV5_(
      ss,
      'Tenant',
      [
        'Tenant_ID'
      ]
    );


  if (tenantTable) {

    tenantTable.rows.forEach(
      function(row) {

        const tenantId =
          djApiValueV5_(
            row,
            tenantTable.headers,
            [
              'Tenant_ID'
            ]
          );


        const name =
          djApiValueV5_(
            row,
            tenantTable.headers,
            [
              'Nama_Lengkap'
            ]
          );


        const room =
          djApiValueV5_(
            row,
            tenantTable.headers,
            [
              'No_Kamar'
            ]
          );


        [

          [
            'KTP',
            [
              'KTP_File_URL'
            ]
          ],

          [
            'Surat Pernyataan',
            [
              'Surat_Pernyataan_File_URL'
            ]
          ],

          [
            'Surat Perjanjian',
            [
              'Surat_Perjanjian_File_URL',
              'Kontrak_File_URL',
              'Perjanjian_File_URL'
            ]
          ],

          [
            'Tanda Tangan & Persetujuan',
            [
              'Tanda_Tangan_File_URL',
              'Tanda_Tangan_URL'
            ]
          ]

        ].forEach(
          function(media) {

            const url =
              String(
                djApiValueV5_(
                  row,
                  tenantTable.headers,
                  media[1]
                ) || ''
              ).trim();


            if (!url) {

              return;

            }


            items.push({

              category:
                'Data Diri',

              type:
                media[0],

              title:
                media[0] +
                ' ‚Äî ' +
                name,

              tenantId:
                tenantId,

              name:
                name,

              room:
                room,

              url:
                url,

              fileId:
                djApiExtractDriveIdV5_(
                  url
                )

            });

          }
        );

      }
    );

  }


  /* ----------------------------------------------------------
   * PAYMENT
   * ----------------------------------------------------------
   */

  const paymentTable =
    djApiReadSafeV5_(
      ss,
      'Pembayaran',
      [
        'Tenant_ID'
      ]
    );


  if (paymentTable) {

    paymentTable.rows.forEach(
      function(row) {

        const url =
          String(
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Bukti_Pembayaran_Foto',
                'Bukti_Pembayaran_URL'
              ]
            ) || ''
          ).trim();


        if (!url) {

          return;

        }


        items.push({

          category:
            'Bukti Pembayaran',

          type:
            'Pembayaran',

          title:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Periode',
                'Periode_Pembayaran'
              ]
            ) ||
            'Pembayaran',

          tenantId:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Tenant_ID'
              ]
            ),

          name:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Nama_Tenant',
                'Nama_Lengkap'
              ]
            ),

          room:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'No_Kamar'
              ]
            ),

          status:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Status_Pembayaran'
              ]
            ),

          verification:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Status_Verifikasi'
              ]
            ),

          amount:
            djApiNumberV5_(
              djApiValueV5_(
                row,
                paymentTable.headers,
                [
                  'Nominal_Dibayar'
                ]
              )
            ),

          url:
            url,

          fileId:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Bukti_File_ID'
              ]
            ) ||
            djApiExtractDriveIdV5_(
              url
            )

        });

      }
    );

  }


  /* ----------------------------------------------------------
   * MAINTENANCE
   * ----------------------------------------------------------
   */

  const maintenanceTable =
    djApiReadSafeV5_(
      ss,
      'Maintenance',
      [
        'Maintenance_ID'
      ]
    );


  if (maintenanceTable) {

    maintenanceTable.rows.forEach(
      function(row) {

        const tenantId =
          djApiValueV5_(
            row,
            maintenanceTable.headers,
            [
              'Tenant_ID'
            ]
          );


        const name =
          djApiValueV5_(
            row,
            maintenanceTable.headers,
            [
              'Nama_Tenant'
            ]
          );


        const room =
          djApiValueV5_(
            row,
            maintenanceTable.headers,
            [
              'No_Kamar'
            ]
          );


        const before =
          String(
            djApiValueV5_(
              row,
              maintenanceTable.headers,
              [
                'Foto_Kerusakan_URL'
              ]
            ) || ''
          ).trim();


        if (before) {

          items.push({

            category:
              'Maintenance',

            type:
              'Foto Kerusakan',

            title:
              'Sebelum Perbaikan',

            tenantId:
              tenantId,

            name:
              name,

            room:
              room,

            url:
              before,

            fileId:
              djApiExtractDriveIdV5_(
                before
              )

          });

        }


        const after =
          String(
            djApiValueV5_(
              row,
              maintenanceTable.headers,
              [
                'Foto_Sesudah_URL'
              ]
            ) || ''
          ).trim();


        if (after) {

          items.push({

            category:
              'Maintenance',

            type:
              'Foto Sesudah',

            title:
              'Sesudah Perbaikan',

            tenantId:
              tenantId,

            name:
              name,

            room:
              room,

            url:
              after,

            fileId:
              djApiExtractDriveIdV5_(
                after
              )

          });

        }

      }
    );

  }


  /* ----------------------------------------------------------
   * CHECK IN / OUT
   * ----------------------------------------------------------
   */

  const cioTable =
    djApiReadSafeV5_(
      ss,
      'CheckInOut',
      [
        'CheckInOut_ID'
      ]
    );


  if (cioTable) {

    cioTable.rows.forEach(
      function(row) {

        const tenantId =
          djApiValueV5_(
            row,
            cioTable.headers,
            [
              'Tenant_ID'
            ]
          );


        const name =
          djApiValueV5_(
            row,
            cioTable.headers,
            [
              'Nama_Tenant'
            ]
          );


        const room =
          djApiValueV5_(
            row,
            cioTable.headers,
            [
              'No_Kamar'
            ]
          );


        const condition =
          String(
            djApiValueV5_(
              row,
              cioTable.headers,
              [
                'Foto_Kondisi_URL'
              ]
            ) || ''
          ).trim();


        if (condition) {

          items.push({

            category:
              'Check-in / Check-out',

            type:
              'Foto Kondisi',

            title:
              'Foto Kondisi Kamar',

            tenantId:
              tenantId,

            name:
              name,

            room:
              room,

            url:
              condition,

            fileId:
              djApiExtractDriveIdV5_(
                condition
              )

          });

        }


        const meter =
          String(
            djApiValueV5_(
              row,
              cioTable.headers,
              [
                'Foto_Meter_Listrik_URL'
              ]
            ) || ''
          ).trim();


        if (meter) {

          items.push({

            category:
              'Check-in / Check-out',

            type:
              'Foto Meter',

            title:
              'Foto Meter Listrik',

            tenantId:
              tenantId,

            name:
              name,

            room:
              room,

            url:
              meter,

            fileId:
              djApiExtractDriveIdV5_(
                meter
              )

          });

        }

      }
    );

  }


  /* ----------------------------------------------------------
   * PELANGGARAN
   * ----------------------------------------------------------
   */

  const violationTable =
    djApiReadSafeV5_(
      ss,
      'Pelanggaran',
      [
        'Pelanggaran_ID'
      ]
    );


  if (violationTable) {

    violationTable.rows.forEach(
      function(row) {

        const url =
          String(
            djApiValueV5_(
              row,
              violationTable.headers,
              [
                'Bukti_URL'
              ]
            ) || ''
          ).trim();


        if (!url) {

          return;

        }


        items.push({

          category:
            'Pelanggaran',

          type:
            'Bukti Pelanggaran',

          title:
            djApiValueV5_(
              row,
              violationTable.headers,
              [
                'Jenis_Pelanggaran'
              ]
            ) ||
            'Bukti Pelanggaran',

          tenantId:
            djApiValueV5_(
              row,
              violationTable.headers,
              [
                'Tenant_ID'
              ]
            ),

          name:
            djApiValueV5_(
              row,
              violationTable.headers,
              [
                'Nama_Tenant'
              ]
            ),

          room:
            djApiValueV5_(
              row,
              violationTable.headers,
              [
                'No_Kamar'
              ]
            ),

          url:
            url,

          fileId:
            djApiExtractDriveIdV5_(
              url
            )

        });

      }
    );

  }


  return {

    total:
      items.length,

    data:
      items.slice(
        0,
        500
      )

  };

}


/* ============================================================
 * OPEN MEDIA
 * ============================================================
 */
function djApiMasterMediaOpenV5_(
  fileId,
  url
) {

  fileId =
    String(
      fileId || ''
    ).trim();


  url =
    String(
      url || ''
    ).trim();


  if (
    !fileId &&
    url
  ) {

    fileId =
      djApiExtractDriveIdV5_(
        url
      );

  }


  if (!fileId) {

    if (url) {

      return {

        ok: true,

        external:
          true,

        url:
          url

      };

    }


    return {

      ok: false,

      error:
        'Media tidak ditemukan.'

    };

  }


  try {

    const file =
      DriveApp.getFileById(
        fileId
      );


    const blob =
      file.getBlob();


    const bytes =
      blob.getBytes();


    if (
      bytes.length >
      8 * 1024 * 1024
    ) {

      return {

        ok: true,

        external:
          true,

        fileName:
          file.getName(),

        url:
          file.getUrl()

      };

    }


    return {

      ok:
        true,

      fileName:
        file.getName(),

      mimeType:
        blob.getContentType(),

      dataUrl:
        'data:' +
        blob.getContentType() +
        ';base64,' +
        Utilities.base64Encode(
          bytes
        ),

      url:
        file.getUrl()

    };

  } catch (err) {

    if (url) {

      return {

        ok:
          true,

        external:
          true,

        url:
          url

      };

    }


    return {

      ok: false,

      error:
        'Media tidak dapat dibuka.'

    };

  }

}


/* ============================================================
 * MASTER MAINTENANCE
 * ============================================================
 */


function djApiMasterMaintenanceV5_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName('Maintenance');

  const table =
    djApiMaintenanceReadTableV6_(
      sheet
    );

  return {
    items:
      djApiBuildMaintenanceV5_(
        table
      )
  };
}


function djApiBuildMaintenanceV5_(
  table
) {

  if (!table) {
    return [];
  }

  return table.rows
    .map(function(row) {

      const id = String(
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Maintenance_ID']
        ) || ''
      ).trim();

      if (!id || !/^MNT-/i.test(id)) {
        return null;
      }

      const statusValue =
        djApiMaintenanceStatusV6_(
          row,
          table.headers
        );

      return {

        id: id,

        tenantId:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['Tenant_ID']
          ),

        name:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['Nama_Tenant', 'Nama Lengkap']
          ),

        room:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['No_Kamar', 'No Kamar', 'Nomor Kamar']
          ),

        problem:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['Lokasi_Masalah', 'Masalah', 'Jenis_Masalah']
          ),

        description:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['Deskripsi', 'Deskripsi Masalah']
          ),

        status:
          statusValue,

        urgency:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['Urgensi', 'Tingkat Urgensi']
          ),

        pic:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['PIC']
          ),

        cost:
          djApiNumberV5_(
            djApiMaintenanceReadFieldV6_(
              row,
              table.headers,
              ['Biaya']
            )
          ),

        note:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['Catatan_Penyelesaian', 'Catatan Penyelesaian']
          ),

        damagePhotoUrl:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['Foto_Kerusakan_URL', 'Foto Kerusakan']
          ),

        afterPhotoUrl:
          djApiMaintenanceReadPhotoV6_(
            row,
            table.headers,
            ['Foto_Sesudah_URL', 'Foto Sesudah']
          ),

        afterPhotoFileId:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['Foto_Sesudah_File_ID']
          ),

        afterPhotoFileName:
          djApiMaintenanceReadFieldV6_(
            row,
            table.headers,
            ['Foto_Sesudah_File_Name']
          )
      };

    })
    .filter(function(item) {
      return item !== null;
    });
}


/* ============================================================
 * MASTER UPDATE MAINTENANCE ‚Äî FIX DUPLICATE FIELDS
 * ============================================================
 */


function djApiUpdateMaintenanceV5_(
  body,
  masterId
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName('Maintenance');

  if (!sheet) {
    return {
      ok: false,
      error: 'Sheet Maintenance tidak ditemukan.'
    };
  }

  const table =
    djApiMaintenanceReadTableV6_(
      sheet
    );

  if (!table) {
    return {
      ok: false,
      error: 'Header Maintenance tidak ditemukan.'
    };
  }

  const row =
    djApiMaintenanceRowByIdV6_(
      table,
      body.maintenanceId
    );

  if (row < 0) {
    return {
      ok: false,
      error: 'Maintenance ID tidak ditemukan.'
    };
  }

  const status = String(
    body.status || ''
  )
    .trim()
    .toUpperCase();

  if (
    !['OPEN', 'PROSES', 'SELESAI', 'BATAL']
      .includes(status)
  ) {
    return {
      ok: false,
      error: 'Status Maintenance tidak valid.'
    };
  }

  const data = {
    Status: status,
    PIC: String(body.pic || '').trim(),
    Biaya: djApiNumberV5_(body.cost),
    Catatan_Penyelesaian:
      String(body.note || '')
        .trim()
        .slice(0, 1000),
    Updated_By: masterId,
    Last_Sync: new Date()
  };

  /* Foto sesudah */
  if (body.afterPhotoBase64) {

    const afterPhoto =
      djApiSaveAfterMaintenancePhotoV5_(
        body.afterPhotoBase64,
        body.afterPhotoMimeType,
        body.afterPhotoOriginalName,
        body.maintenanceId
      );

    if (!afterPhoto.ok) {
      return {
        ok: false,
        error: afterPhoto.error
      };
    }

    data.Foto_Sesudah_URL =
      afterPhoto.fileUrl;

    data.Foto_Sesudah_File_ID =
      afterPhoto.fileId;

    data.Foto_Sesudah_File_Name =
      afterPhoto.fileName;
  }

  if (status === 'PROSES') {
    data.Tanggal_Tindak_Lanjut =
      new Date();
  }

  if (status === 'SELESAI') {
    data.Tanggal_Tindak_Lanjut =
      new Date();
    data.Tanggal_Selesai =
      new Date();
  }

  /*
   * Tulis secara eksplisit ke SEMUA header duplikat.
   * Tidak menggunakan djApiFindHeadersV5_ lagi.
   */

  const fieldAliases = {

    Status: [
      'Status'
    ],

    PIC: [
      'PIC'
    ],

    Biaya: [
      'Biaya'
    ],

    Catatan_Penyelesaian: [
      'Catatan_Penyelesaian',
      'Catatan Penyelesaian'
    ],

    Tanggal_Tindak_Lanjut: [
      'Tanggal_Tindak_Lanjut',
      'Tanggal Tindak Lanjut'
    ],

    Tanggal_Selesai: [
      'Tanggal_Selesai',
      'Tanggal Selesai'
    ],

    Foto_Sesudah_URL: [
      'Foto_Sesudah_URL',
      'Foto Sesudah'
    ],

    Foto_Sesudah_File_ID: [
      'Foto_Sesudah_File_ID'
    ],

    Foto_Sesudah_File_Name: [
      'Foto_Sesudah_File_Name'
    ],

    Updated_By: [
      'Updated_By'
    ],

    Last_Sync: [
      'Last_Sync'
    ]
  };

  Object.keys(data).forEach(function(key) {

    const aliases =
      fieldAliases[key] || [key];

    djApiMaintenanceWriteFieldV6_(
      sheet,
      table.headerRow,
      table.headers,
      row,
      aliases,
      data[key]
    );

  });

  SpreadsheetApp.flush();
  /* ========================================================
   * HISTORY — MAINTENANCE SELESAI
   * ========================================================
   *
   * Hanya dicatat ketika status benar-benar berubah
   * menjadi SELESAI.
   * ========================================================
   */

  if (
    status ===
    'SELESAI'
  ) {

    try {

      const maintenanceRowData =
        table.rows[
          row -
          table.headerRow -
          1
        ];

      const previousMaintenanceStatus =
        String(
          djApiValueV5_(
            maintenanceRowData,
            table.headers,
            [
              'Status'
            ]
          ) || ''
        )
        .trim()
        .toUpperCase();

      /*
       * Hindari History ganda jika aksi SELESAI
       * dijalankan kembali pada data yang sudah SELESAI.
       */
      if (
        previousMaintenanceStatus !==
        'SELESAI'
      ) {

        const maintenanceTenantId =
          String(
            djApiValueV5_(
              maintenanceRowData,
              table.headers,
              [
                'Tenant_ID'
              ]
            ) || ''
          ).trim();

        const maintenanceName =
          String(
            djApiValueV5_(
              maintenanceRowData,
              table.headers,
              [
                'Nama_Tenant'
              ]
            ) || ''
          ).trim();

        const maintenanceRoom =
          String(
            djApiValueV5_(
              maintenanceRowData,
              table.headers,
              [
                'No_Kamar'
              ]
            ) || ''
          ).trim();

        const maintenanceProblem =
          String(
            djApiValueV5_(
              maintenanceRowData,
              table.headers,
              [
                'Jenis_Masalah',
                'Masalah',
                'Lokasi_Masalah'
              ]
            ) || ''
          ).trim();

        const maintenancePic =
          String(
            body.pic || ''
          ).trim();

        const maintenanceCost =
          djApiNumberV5_(
            body.cost
          );

        djApiLogV5_(
          ss,
          'MAINTENANCE_SELESAI',
          'Maintenance ' +
          String(
            body.maintenanceId || ''
          ).trim() +
          ' selesai · Tenant ' +
          maintenanceTenantId +
          ' · ' +
          maintenanceName +
          ' · Kamar ' +
          maintenanceRoom +
          ' · Masalah ' +
          (
            maintenanceProblem ||
            '—'
          ) +
          ' · PIC ' +
          (
            maintenancePic ||
            '—'
          ) +
          ' · Biaya ' +
          maintenanceCost +
          ' · Diselesaikan oleh ' +
          masterId +
          '.'
        );

      }

    } catch (historyError) {

      Logger.log(
        'HISTORY MAINTENANCE GAGAL | ' +
        String(
          body.maintenanceId || ''
        ).trim() +
        ' | ' +
        (
          historyError &&
          historyError.message
            ? historyError.message
            : historyError
        )
      );

    }

  }


  /* ========================================================
   * EMAIL OTOMATIS — MAINTENANCE SELESAI
   * ========================================================
   *
   * Hanya dikirim ketika status akhir = SELESAI.
   *
   * Email gagal TIDAK membatalkan update maintenance.
   *
   * Anti-duplikat ditangani oleh:
   * dj39EmailSendMaintenanceCompletedOnceV1_()
   * ========================================================
   */

  if (
    status ===
    'SELESAI'
  ) {

    try {

      const maintenanceEmailName =
        String(
          djApiValueV5_(
            table.rows[
              row -
              table.headerRow -
              1
            ],
            table.headers,
            [
              'Nama_Tenant'
            ]
          ) || ''
        ).trim();

      const maintenanceEmailRoom =
        String(
          djApiValueV5_(
            table.rows[
              row -
              table.headerRow -
              1
            ],
            table.headers,
            [
              'No_Kamar'
            ]
          ) || ''
        ).trim();

      const maintenanceEmailProblem =
        String(
          djApiValueV5_(
            table.rows[
              row -
              table.headerRow -
              1
            ],
            table.headers,
            [
              'Jenis_Masalah',
              'Masalah',
              'Lokasi_Masalah'
            ]
          ) || ''
        ).trim();

      const maintenanceEmailDescription =
        String(
          djApiValueV5_(
            table.rows[
              row -
              table.headerRow -
              1
            ],
            table.headers,
            [
              'Deskripsi'
            ]
          ) || ''
        ).trim();

      const maintenanceEmailNote =
        String(
          body.note || ''
        ).trim();

      const maintenanceEmailResult =
        dj39EmailSendMaintenanceCompletedOnceV1_(
          String(
            djApiValueV5_(
              table.rows[
                row -
                table.headerRow -
                1
              ],
              table.headers,
              [
                'Tenant_ID'
              ]
            ) || ''
          ).trim(),
          {

            maintenanceId:
              String(
                body.maintenanceId ||
                ''
              ).trim(),

            name:
              maintenanceEmailName,

            room:
              maintenanceEmailRoom,

            problem:
              maintenanceEmailProblem ||
              maintenanceEmailDescription,

            note:
              maintenanceEmailNote

          }
        );

      Logger.log(
        'EMAIL MAINTENANCE COMPLETED | ' +
        String(
          body.maintenanceId ||
          ''
        ).trim() +
        ' | ' +
        maintenanceEmailResult.status +
        (
          maintenanceEmailResult.error
            ? ' | ' +
              maintenanceEmailResult.error
            : ''
        )
      );

    } catch (emailError) {

      Logger.log(
        'EMAIL MAINTENANCE COMPLETED GAGAL | ' +
        String(
          body.maintenanceId ||
          ''
        ).trim() +
        ' | ' +
        String(
          emailError &&
          emailError.message
            ? emailError.message
            : emailError
        )
      );

    }

  }
  return {
    ok: true,
    maintenanceId:
      String(body.maintenanceId || '').trim(),
    status: status,
    message:
      'Maintenance berhasil diperbarui dan disinkronkan.'
  };
}


/* ============================================================
 * REPAIR DATA LAMA ‚Äî JALANKAN SEKALI
 * ============================================================
 *
 * Fungsi ini mengambil nilai TERBARU dari kolom duplikat
 * kemudian menyalinnya kembali ke semua kolom sejenis.
 *
 * Contoh kasus Anda:
 *   Status lama     = OPEN
 *   Status terbaru  = SELESAI
 *
 * Setelah repair, keduanya akan = SELESAI.
 *
 * Fungsi TIDAK menghapus baris atau data.
 * ============================================================
 */


function djApiSaveAfterMaintenancePhotoV5_(
  base64,
  mimeType,
  originalName,
  maintenanceId
) {

  try {

    base64 =
      String(
        base64 || ''
      )
      .replace(
        /^data:[^;]+;base64,/,
        ''
      )
      .replace(
        /\s/g,
        ''
      );


    if (!base64) {

      return {

        ok: false,

        error:
          'Foto sesudah kosong.'

      };

    }


    const bytes =
      Utilities.base64Decode(
        base64
      );


    if (
      bytes.length >
      8 * 1024 * 1024
    ) {

      return {

        ok: false,

        error:
          'Ukuran foto terlalu besar. Maksimal 8 MB.'

      };

    }


    let safeMime =
      String(
        mimeType ||
        'image/jpeg'
      )
      .toLowerCase();


    if (
      safeMime !== 'image/jpeg' &&
      safeMime !== 'image/png' &&
      safeMime !== 'image/webp'
    ) {

      safeMime =
        'image/jpeg';

    }


    let extension =
      '.jpg';


    if (
      safeMime ===
      'image/png'
    ) {

      extension =
        '.png';

    } else if (
      safeMime ===
      'image/webp'
    ) {

      extension =
        '.webp';

    }


    const fileName =
      'SELESAI-' +
      String(
        maintenanceId
      ) +
      '-' +
      Date.now() +
      extension;


    const blob =
      Utilities.newBlob(
        bytes,
        safeMime,
        fileName
      );


    const rootFolder =
      djApiGetOrCreateFolderV5_(
        null,
        'DJ Family Kost'
      );


    const maintenanceFolder =
      djApiGetOrCreateFolderV5_(
        rootFolder,
        'Maintenance'
      );


    const completedFolder =
      djApiGetOrCreateFolderV5_(
        maintenanceFolder,
        'Selesai'
      );


    const file =
      completedFolder.createFile(
        blob
      );


    return {

      ok:
        true,

      fileId:
        file.getId(),

      fileUrl:
        file.getUrl(),

      fileName:
        file.getName()

    };

  } catch (err) {

    return {

      ok: false,

      error:
        'Gagal menyimpan foto sesudah perbaikan: ' +
        (
          err &&
          err.message
            ? err.message
            : err
        )

    };

  }

}


/* ============================================================
 * ANNOUNCEMENTS
 * ============================================================
 */
function djApiMaintenanceReadTableV6_(sheet) {

  if (!sheet) {
    return null;
  }

  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow < 1 || lastColumn < 1) {
    return null;
  }

  const maxRows = Math.min(lastRow, 15);
  let bestRow = -1;
  let bestScore = -1;

  const required = [
    'Maintenance_ID'
  ].map(djApiCanonV5_);

  for (let r = 1; r <= maxRows; r++) {

    const row = sheet
      .getRange(r, 1, 1, lastColumn)
      .getValues()[0];

    const normalized = row.map(djApiCanonV5_);

    let score = 0;

    required.forEach(function(needle) {
      if (normalized.indexOf(needle) >= 0) {
        score++;
      }
    });

    /* Pilih header row yang paling lengkap. */
    if (score > bestScore) {
      bestScore = score;
      bestRow = r;
    }
  }

  if (bestRow < 0 || bestScore < required.length) {
    return null;
  }

  const headers = sheet
    .getRange(bestRow, 1, 1, lastColumn)
    .getValues()[0]
    .map(function(v) {
      return String(v || '').trim();
    });

  const rows = lastRow > bestRow
    ? sheet
        .getRange(
          bestRow + 1,
          1,
          lastRow - bestRow,
          lastColumn
        )
        .getValues()
    : [];

  return {
    sheet: sheet,
    headerRow: bestRow,
    headers: headers,
    rows: rows
  };
}



function djApiMaintenanceColumnsV6_(headers, aliases) {

  const targets = aliases.map(djApiCanonV5_);
  const columns = [];

  headers.forEach(function(header, index) {

    const normalized = djApiCanonV5_(header);

    if (targets.indexOf(normalized) >= 0) {
      columns.push(index);
    }

  });

  return columns;
}



function djApiMaintenanceReadFieldV6_(row, headers, aliases) {

  const columns =
    djApiMaintenanceColumnsV6_(
      headers,
      aliases
    );

  if (!columns.length) {
    return '';
  }

  /*
   * Ambil nilai TERAKHIR yang terisi.
   * Ini penting karena percobaan sebelumnya sempat membuat
   * nilai terbaru berada di kolom duplikat paling kanan.
   */
  for (let i = columns.length - 1; i >= 0; i--) {

    const value = row[columns[i]];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ''
    ) {
      return value;
    }
  }

  return '';
}



function djApiMaintenanceWriteFieldV6_(
  sheet,
  headerRow,
  headers,
  rowNumber,
  aliases,
  value
) {

  let columns =
    djApiMaintenanceColumnsV6_(
      headers,
      aliases
    );

  /* Bila field belum ada, buat satu kali di paling kanan. */
  if (!columns.length) {

    const newColumn =
      sheet.getLastColumn() + 1;

    sheet
      .getRange(headerRow, newColumn)
      .setValue(aliases[0]);

    headers.push(aliases[0]);
    columns = [newColumn - 1];
  }

  /* Sinkronkan SEMUA kolom duplikat. */
  columns.forEach(function(columnIndex) {

    sheet
      .getRange(
        rowNumber,
        columnIndex + 1
      )
      .setValue(value);

  });
}



function djApiMaintenanceRowByIdV6_(
  table,
  maintenanceId
) {

  if (!table) {
    return -1;
  }

  const target = String(
    maintenanceId || ''
  ).trim();

  const idColumns =
    djApiMaintenanceColumnsV6_(
      table.headers,
      [
        'Maintenance_ID'
      ]
    );

  if (!idColumns.length) {
    return -1;
  }

  for (let i = 0; i < table.rows.length; i++) {

    const row = table.rows[i];

    for (let c = 0; c < idColumns.length; c++) {

      const value = String(
        row[idColumns[c]] || ''
      ).trim();

      if (value === target) {
        return table.headerRow + 1 + i;
      }
    }
  }

  return -1;
}


/* ============================================================
 * LEGACY VALUE FALLBACKS
 * ============================================================
 */



function djApiMaintenanceStatusV6_(row, headers) {

  const valid = {
    OPEN: true,
    PROSES: true,
    SELESAI: true,
    BATAL: true
  };

  let lastHeaderColumn = -1;

  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i] == null ? '' : headers[i]).trim() !== '') {
      lastHeaderColumn = i;
    }
  }

  for (let i = row.length - 1; i > lastHeaderColumn; i--) {
    const value = String(row[i] == null ? '' : row[i])
      .trim().toUpperCase();
    if (valid[value]) return value;
  }

  const direct = String(
    djApiMaintenanceReadFieldV6_(row, headers, ['Status']) || ''
  ).trim().toUpperCase();

  if (valid[direct]) return direct;

  for (let i = row.length - 1; i >= 0; i--) {
    const value = String(row[i] == null ? '' : row[i])
      .trim().toUpperCase();
    if (valid[value]) return value;
  }

  return 'OPEN';
}


function djApiMaintenanceLatestDriveUrlV6_(row) {

  for (let i = row.length - 1; i >= 0; i--) {

    const value = String(
      row[i] == null ? '' : row[i]
    ).trim();

    if (
      /https?:\/\/(?:drive|docs)\.google\.com\//i.test(value) ||
      /https?:\/\/drive\.usercontent\.google\.com\//i.test(value)
    ) {
      return value;
    }
  }

  return '';
}



function djApiMaintenanceReadPhotoV6_(
  row,
  headers,
  aliases
) {

  const direct = String(
    djApiMaintenanceReadFieldV6_(
      row,
      headers,
      aliases
    ) || ''
  ).trim();

  if (direct) {
    return direct;
  }

  return djApiMaintenanceLatestDriveUrlV6_(row);
}


/* ============================================================
 * MASTER MAINTENANCE
 * ============================================================
 */



function repairMaintenanceDataV6() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const sheet =
    ss.getSheetByName('Maintenance');

  if (!sheet) {
    throw new Error(
      'Sheet Maintenance tidak ditemukan.'
    );
  }

  const table =
    djApiMaintenanceReadTableV6_(
      sheet
    );

  if (!table) {
    throw new Error(
      'Header Maintenance tidak ditemukan.'
    );
  }

  let repaired = 0;

  table.rows.forEach(function(row, index) {

    const id = String(
      djApiMaintenanceReadFieldV6_(
        row,
        table.headers,
        ['Maintenance_ID']
      ) || ''
    ).trim();

    if (!id || !/^MNT-/i.test(id)) {
      return;
    }

    const rowNumber =
      table.headerRow + 1 + index;

    const fields = {

      Status:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Status']
        ) || 'OPEN',

      PIC:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['PIC']
        ),

      Biaya:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Biaya']
        ),

      Catatan_Penyelesaian:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Catatan_Penyelesaian', 'Catatan Penyelesaian']
        ),

      Tanggal_Tindak_Lanjut:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Tanggal_Tindak_Lanjut', 'Tanggal Tindak Lanjut']
        ),

      Tanggal_Selesai:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Tanggal_Selesai', 'Tanggal Selesai']
        ),

      Foto_Sesudah_URL:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Foto_Sesudah_URL', 'Foto Sesudah']
        ),

      Foto_Sesudah_File_ID:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Foto_Sesudah_File_ID']
        ),

      Foto_Sesudah_File_Name:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Foto_Sesudah_File_Name']
        ),

      Updated_By:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Updated_By']
        ),

      Last_Sync:
        djApiMaintenanceReadFieldV6_(
          row,
          table.headers,
          ['Last_Sync']
        )
    };

    const aliases = {

      Status: ['Status'],
      PIC: ['PIC'],
      Biaya: ['Biaya'],
      Catatan_Penyelesaian:
        ['Catatan_Penyelesaian', 'Catatan Penyelesaian'],
      Tanggal_Tindak_Lanjut:
        ['Tanggal_Tindak_Lanjut', 'Tanggal Tindak Lanjut'],
      Tanggal_Selesai:
        ['Tanggal_Selesai', 'Tanggal Selesai'],
      Foto_Sesudah_URL:
        ['Foto_Sesudah_URL', 'Foto Sesudah'],
      Foto_Sesudah_File_ID:
        ['Foto_Sesudah_File_ID'],
      Foto_Sesudah_File_Name:
        ['Foto_Sesudah_File_Name'],
      Updated_By: ['Updated_By'],
      Last_Sync: ['Last_Sync']
    };

    Object.keys(fields).forEach(function(key) {

      const value = fields[key];

      if (
        value === '' ||
        value === null ||
        value === undefined
      ) {
        return;
      }

      djApiMaintenanceWriteFieldV6_(
        sheet,
        table.headerRow,
        table.headers,
        rowNumber,
        aliases[key] || [key],
        value
      );

    });

    repaired++;
  });

  SpreadsheetApp.flush();

  Logger.log(
    'Repair Maintenance selesai. Record valid disinkronkan: ' +
    repaired
  );

  return {
    ok: true,
    repaired: repaired
  };
}


/* ============================================================
 * ONE-TIME REPAIR CURRENT MAINTENANCE
 * ============================================================
 *
 * Pulihkan MNT-WEB-0001 dari data hasil percobaan sebelumnya.
 * Tidak menghapus row atau file.
 * ============================================================
 */



function repairCurrentMaintenanceV6() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Maintenance');

  if (!sheet) {
    throw new Error('Sheet Maintenance tidak ditemukan.');
  }

  const table = djApiMaintenanceReadTableV6_(sheet);

  if (!table) {
    throw new Error('Header Maintenance_ID tidak ditemukan.');
  }

  const targetId = 'MNT-WEB-0001';
  const rowNumber = djApiMaintenanceRowByIdV6_(
    table,
    targetId
  );

  if (rowNumber < 0) {
    throw new Error(
      'Maintenance ID tidak ditemukan: ' + targetId
    );
  }

  const index = rowNumber - table.headerRow - 1;
  const row = table.rows[index];
  const headers = table.headers;

  const status = djApiMaintenanceStatusV6_(row, headers);
  const afterPhoto = djApiMaintenanceReadPhotoV6_(
    row,
    headers,
    ['Foto_Sesudah_URL', 'Foto Sesudah']
  );

  /* Sinkronkan field penting ke kolom canonical. */
  djApiMaintenanceWriteFieldV6_(
    sheet,
    table.headerRow,
    headers,
    rowNumber,
    ['Status'],
    status
  );

  if (afterPhoto) {
    djApiMaintenanceWriteFieldV6_(
      sheet,
      table.headerRow,
      headers,
      rowNumber,
      ['Foto_Sesudah_URL', 'Foto Sesudah'],
      afterPhoto
    );

    const fileId = djApiExtractDriveIdV5_(afterPhoto);

    if (fileId) {
      djApiMaintenanceWriteFieldV6_(
        sheet,
        table.headerRow,
        headers,
        rowNumber,
        ['Foto_Sesudah_File_ID'],
        fileId
      );
    }
  }

  if (status === 'SELESAI') {

    const now = new Date();

    djApiMaintenanceWriteFieldV6_(
      sheet,
      table.headerRow,
      headers,
      rowNumber,
      ['Tanggal_Tindak_Lanjut', 'Tanggal Tindak Lanjut'],
      now
    );

    djApiMaintenanceWriteFieldV6_(
      sheet,
      table.headerRow,
      headers,
      rowNumber,
      ['Tanggal_Selesai', 'Tanggal Selesai'],
      now
    );
  }

  SpreadsheetApp.flush();

  return {
    ok: true,
    maintenanceId: targetId,
    status: status,
    afterPhotoUrl: afterPhoto || '',
    message:
      'MNT-WEB-0001 berhasil dipulihkan dan disinkronkan.'
  };
}


/* ============================================================
 * AFTER MAINTENANCE PHOTO
 * ============================================================
 */



function djApiMasterAnnouncementsV5_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pengumuman'
    );


  if (!sheet) {

    return {

      items: []

    };

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Pengumuman_ID'
      ]
    );


  if (!table) {

    return {

      items: []

    };

  }


  return {

    items:
      table.rows
        .map(
          function(row) {

            return {

              id:
                djApiValueV5_(
                  row,
                  table.headers,
                  [
                    'Pengumuman_ID'
                  ]
                ),

              title:
                djApiValueV5_(
                  row,
                  table.headers,
                  [
                    'Judul'
                  ]
                ),

              message:
                djApiValueV5_(
                  row,
                  table.headers,
                  [
                    'Isi',
                    'Pesan'
                  ]
                ),

              priority:
                djApiValueV5_(
                  row,
                  table.headers,
                  [
                    'Prioritas'
                  ]
                ),

              status:
                djApiValueV5_(
                  row,
                  table.headers,
                  [
                    'Status'
                  ]
                ),

              publishedAt:
                djApiValueV5_(
                  row,
                  table.headers,
                  [
                    'Tanggal_Terbit'
                  ]
                ),

              createdBy:
                djApiValueV5_(
                  row,
                  table.headers,
                  [
                    'Created_By'
                  ]
                ),

              createdAt:
                djApiValueV5_(
                  row,
                  table.headers,
                  [
                    'Created_At'
                  ]
                )

            };

          }
        )
        .reverse()
        .slice(
          0,
          50
        )

  };

}


/* ============================================================
 * SAVE ANNOUNCEMENT
 * ============================================================
 */
function djApiSaveAnnouncementV5_(
  body,
  masterId
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  let sheet =
    ss.getSheetByName(
      'Pengumuman'
    );


  const announcementFields = [

    'Pengumuman_ID',
    'Judul',
    'Isi',
    'Prioritas',
    'Status',
    'Tanggal_Terbit',
    'Created_By',
    'Created_At'

  ];


  if (!sheet) {

    sheet =
      ss.insertSheet(
        'Pengumuman'
      );


    /*
     * Sheet Pengumuman baru masih kosong.
     * Karena helper generic membutuhkan header yang sudah ada,
     * inisialisasi header dilakukan langsung di sini.
     */

    sheet
      .getRange(
        1,
        1,
        1,
        announcementFields.length
      )
      .setValues(
        [announcementFields]
      );

  } else if (
    sheet.getLastRow() < 1 ||
    sheet.getLastColumn() < 1
  ) {

    /*
     * Sheet sudah ada tetapi masih kosong.
     * Jangan membuat sheet baru; cukup siapkan header.
     */

    sheet
      .getRange(
        1,
        1,
        1,
        announcementFields.length
      )
      .setValues(
        [announcementFields]
      );

  } else {

    /*
     * Sheet sudah berisi struktur.
     * Gunakan helper existing untuk menambahkan field yang memang
     * belum tersedia tanpa menyentuh data lain.
     */

    djApiEnsureSheetFieldsV5_(
      sheet,
      announcementFields
    );

  }


  const headers =
    djApiFindHeadersV5_(
      sheet
    );


  const title =
    String(
      body.title || ''
    ).trim();


  const message =
    String(
      body.message || ''
    ).trim();


  if (
    !title ||
    !message
  ) {

    return {

      ok: false,

      error:
        'Judul dan isi wajib diisi.'

    };

  }


  const id =
    'ANN-' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() ||
      'Asia/Jakarta',
      'yyyyMMddHHmmss'
    );


  djApiAppendRowV5_(
    sheet,
    headers,
    {

      Pengumuman_ID:
        id,

      Judul:
        title,

      Isi:
        message,

      Prioritas:
        body.priority ||
        'NORMAL',

      Status:
        'AKTIF',

      Tanggal_Terbit:
        new Date(),

      Created_By:
        masterId,

      Created_At:
        new Date()

    }
  );


  SpreadsheetApp.flush();


  return {

    ok:
      true,

    id:
      id,

    message:
      'Pengumuman berhasil diterbitkan.'

  };

}



/* ============================================================
 * UPDATE ANNOUNCEMENT
 * ============================================================
 *
 * Operasi yang didukung:
 *   EDIT
 *   ACTIVATE
 *   DEACTIVATE
 *
 * Tidak ada DELETE permanen.
 * Record tetap dipertahankan sebagai arsip.
 * ============================================================
 */
function djApiUpdateAnnouncementV5_(
  body,
  masterId
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pengumuman'
    );


  if (!sheet) {

    return {

      ok: false,

      error:
        'Sheet Pengumuman tidak ditemukan.'

    };

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Pengumuman_ID'
      ]
    );


  if (!table) {

    return {

      ok: false,

      error:
        'Header Pengumuman tidak ditemukan.'

    };

  }


  const announcementId =
    String(
      body.announcementId ||
      body.id ||
      ''
    )
    .trim();


  if (!announcementId) {

    return {

      ok: false,

      error:
        'Pengumuman_ID wajib diisi.'

    };

  }


  const rowNumber =
    djApiFindRowV5_(
      table,
      [
        'Pengumuman_ID'
      ],
      announcementId
    );


  if (
    rowNumber < 0
  ) {

    return {

      ok: false,

      error:
        'Pengumuman tidak ditemukan.'

    };

  }


  const operation =
    String(
      body.operation ||
      ''
    )
    .trim()
    .toUpperCase();


  if (
    operation !== 'EDIT' &&
    operation !== 'ACTIVATE' &&
    operation !== 'DEACTIVATE'
  ) {

    return {

      ok: false,

      error:
        'Operasi pengumuman tidak didukung.'

    };

  }


  const currentValues =
    sheet
      .getRange(
        rowNumber,
        1,
        1,
        table.headers.length
      )
      .getValues()[0];


  const currentStatus =
    String(
      djApiValueV5_(
        currentValues,
        table.headers,
        [
          'Status'
        ]
      ) || ''
    )
    .trim()
    .toUpperCase();


  if (
    operation === 'EDIT'
  ) {

    const title =
      String(
        body.title ||
        ''
      )
      .trim();


    const message =
      String(
        body.message ||
        ''
      )
      .trim();


    const priority =
      String(
        body.priority ||
        'NORMAL'
      )
      .trim()
      .toUpperCase();


    if (
      !title ||
      !message
    ) {

      return {

        ok: false,

        error:
          'Judul dan isi wajib diisi.'

      };

    }


    const allowedPriority = [

      'NORMAL',
      'PENTING',
      'DARURAT'

    ];


    if (
      allowedPriority.indexOf(
        priority
      ) < 0
    ) {

      return {

        ok: false,

        error:
          'Prioritas pengumuman tidak valid.'

      };

    }


    djApiUpdateRowV5_(
      sheet,
      rowNumber,
      table.headers,
      {

        Judul:
          title,

        Isi:
          message,

        Prioritas:
          priority

      }
    );


    SpreadsheetApp.flush();


    try {

      djApiLogV5_(
        ss,
        'ANNOUNCEMENT_EDIT',
        announcementId +
        ' diedit oleh ' +
        masterId +
        '. Status tetap ' +
        (
          currentStatus ||
          '‚Äî'
        ) +
        '.'
      );

    } catch (err) {}


    return {

      ok:
        true,

      id:
        announcementId,

      operation:
        'EDIT',

      message:
        'Pengumuman berhasil diperbarui.'

    };

  }


  const newStatus =
    operation === 'ACTIVATE'
      ? 'AKTIF'
      : 'NONAKTIF';


  djApiUpdateRowV5_(
    sheet,
    rowNumber,
    table.headers,
    {

      Status:
        newStatus

    }
  );


  SpreadsheetApp.flush();


  try {

    djApiLogV5_(
      ss,
      'ANNOUNCEMENT_STATUS',
      announcementId +
      ' diubah dari ' +
      (
        currentStatus ||
        '‚Äî'
      ) +
      ' menjadi ' +
      newStatus +
      ' oleh ' +
      masterId +
      '.'
    );

  } catch (err) {}


  return {

    ok:
      true,

    id:
      announcementId,

    operation:
      operation,

    status:
      newStatus,

    message:
      newStatus === 'AKTIF'
        ? 'Pengumuman berhasil diaktifkan.'
        : 'Pengumuman berhasil dinonaktifkan.'

  };

}


/* ============================================================
 * MASTER DASHBOARD ‚Äî RESTORED
 * ============================================================
 */
function djApiMasterDashboardV5_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const rooms =
    djApiReadSafeV5_(
      ss,
      'Kamar',
      [
        'No_Kamar'
      ]
    );


  const tenants =
    djApiReadSafeV5_(
      ss,
      'Tenant',
      [
        'Tenant_ID'
      ]
    );


  const payments =
    djApiReadSafeV5_(
      ss,
      'Pembayaran',
      [
        'Tenant_ID'
      ]
    );


  const registrations =
    djApiReadSafeV5_(
      ss,
      'Pendaftaran',
      [
        'Pendaftaran_ID'
      ]
    );


  const maintenance =
    djApiReadSafeV5_(
      ss,
      'Maintenance',
      [
        'Maintenance_ID'
      ]
    );


  const roomItems =
    djApiBuildRoomsV5_(
      rooms
    );


  const tenantItems =
    djApiBuildTenantsV5_(
      tenants
    );


  const paymentItems =
    djApiBuildPaymentsV5_(
      payments
    );


  const registrationItems =
    djApiBuildRegistrationsV5_(
      registrations
    );


  /*
   * Gunakan satu builder Maintenance global yang didefinisikan
   * di bawah file. Versi lama mendefinisikan builder di dalam
   * fungsi dashboard, tetapi lupa membuat variable
   * maintenanceItems sehingga dashboard melempar:
   *
   *   maintenanceItems is not defined
   *
   * Sekarang variable dibuat eksplisit dan builder tidak lagi
   * diduplikasi.
   */
  const maintenanceItems =
    djApiBuildMaintenanceV5_(
      maintenance
    );


  const summary = {

    totalRooms:
      roomItems.length,

    occupied:
      roomItems.filter(
        function(item) {

          return (
            String(
              item.status ||
              ''
            )
            .toUpperCase() ===
            'TERISI'
          );

        }
      ).length,

    vacant:
      roomItems.filter(
        function(item) {

          return (
            String(
              item.status ||
              ''
            )
            .toUpperCase() ===
            'KOSONG'
          );

        }
      ).length,

    soon:
      roomItems.filter(
        function(item) {

          return Number(
            item.price ||
            0
          ) <= 0;

        }
      ).length,

    activeTenants:
      tenantItems.filter(
        function(item) {

          return (
            String(
              item.status ||
              ''
            )
            .toUpperCase() ===
            'AKTIF'
          );

        }
      ).length,

    pendingRegistrations:
      registrationItems.filter(
        function(item) {

          return (
            item.status ===
            'MENUNGGU VERIFIKASI'
          );

        }
      ).length,

    pendingPayment:
      paymentItems.filter(
        function(item) {

          return (
            item.verification ===
            'MENUNGGU VERIFIKASI'
          );

        }
      ).length,

    paidPayment:
      paymentItems.filter(
        function(item) {

          return (
            item.verification ===
            'TERVERIFIKASI'
          );

        }
      ).length,

    unpaid:
      paymentItems.filter(
        function(item) {

          return (
            item.verification !==
            'TERVERIFIKASI'
            &&
            Number(
              item.paid ||
              0
            ) <
            Number(
              item.total ||
              0
            )
          );

        }
      ).length,

    openMaintenance:
      maintenanceItems.filter(
        function(item) {

          const status =
            String(
              item.status ||
              ''
            )
            .toUpperCase();


          return (
            status === 'OPEN' ||
            status === 'PROSES'
          );

        }
      ).length

  };


  return {

    summary:
      summary,

    rooms:
      roomItems,

    registrations:
      registrationItems
        .filter(
          function(item) {

            return (
              item.status ===
              'MENUNGGU VERIFIKASI'
            );

          }
        )
        .slice(
          0,
          20
        ),

    payments:
      paymentItems
        .filter(
          function(item) {

            return (
              item.verification ===
              'MENUNGGU VERIFIKASI'
            );

          }
        )
        .slice(
          0,
          20
        ),

    maintenance:
      maintenanceItems
        .filter(
          function(item) {

            return (
              item.status === 'OPEN' ||
              item.status === 'PROSES'
            );

          }
        )
        .slice(
          0,
          20
        ),

    media:
      djApiMasterMediaV5_(),

    generatedAt:
      new Date().toISOString()

  };

}

/* ============================================================
 * MASTER REGISTRATIONS ‚Äî RESTORED
 * ============================================================
 */
function djApiMasterRegistrationsV5_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const registrationTable =
    djApiReadSafeV5_(
      ss,
      'Pendaftaran',
      [
        'Pendaftaran_ID'
      ]
    );


  const roomTable =
    djApiReadSafeV5_(
      ss,
      'Kamar',
      [
        'No_Kamar'
      ]
    );


  const registrationItems =
    djApiBuildRegistrationsV5_(
      registrationTable
    );


  const roomItems =
    djApiBuildRoomsV5_(
      roomTable
    );


  /*
   * Master membutuhkan daftar kamar yang benar-benar dapat
   * dipilih pada saat approval. Daftar ini berasal langsung
   * dari sheet Kamar sehingga harga/status selalu mengikuti
   * database yang sama dengan Dashboard.
   *
   * Hanya kamar KOSONG dengan harga > 0 yang ditawarkan.
   * Kamar TERISI, DIPESAN, atau belum memiliki harga tidak
   * boleh dipilih sebagai kamar final.
   */

  const availableRooms =
    roomItems
      .filter(
        function(room) {

          return (
            String(
              room.status ||
              ''
            )
            .trim()
            .toUpperCase() ===
            'KOSONG'

            &&

            Number(
              room.price ||
              0
            ) > 0
          );

        }
      )
      .sort(
        function(a, b) {

          return Number(
            a.number ||
            0
          ) - Number(
            b.number ||
            0
          );

        }
      );


  return {

    items:
      registrationItems,

    availableRooms:
      availableRooms

  };

}

/* ============================================================
 * WHATSAPP DATA
 * ============================================================
 */
function djApiMasterWhatsAppV5_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const tenants =
    djApiReadSafeV5_(
      ss,
      'Tenant',
      [
        'Tenant_ID'
      ]
    );


  const payments =
    djApiReadSafeV5_(
      ss,
      'Pembayaran',
      [
        'Tenant_ID'
      ]
    );


  if (
    !tenants ||
    !payments
  ) {

    return {

      items: []

    };

  }


  const tenantMap =
    {};


  tenants.rows.forEach(
    function(row) {

      const id =
        String(
          djApiValueV5_(
            row,
            tenants.headers,
            [
              'Tenant_ID'
            ]
          ) || ''
        )
        .trim()
        .toUpperCase();


      if (!id) {

        return;

      }


      const tenantStatus =
        String(
          djApiValueV5_(
            row,
            tenants.headers,
            [
              'Status_Tenant',
              'Status'
            ]
          ) || ''
        )
        .trim()
        .toUpperCase();


      tenantMap[id] = {

        name:
          djApiValueV5_(
            row,
            tenants.headers,
            [
              'Nama_Lengkap',
              'Nama_Tenant'
            ]
          ),

        phone:
          djApiValueV5_(
            row,
            tenants.headers,
            [
              'No_HP'
            ]
          ),

        room:
          djApiValueV5_(
            row,
            tenants.headers,
            [
              'No_Kamar'
            ]
          ),

        status:
          tenantStatus

      };

    }
  );


  /*
   * ==========================================================
   * BENTUK CALON RECORD PEMBAYARAN
   * ==========================================================
   *
   * Satu tenant dapat memiliki lebih dari satu baris lama
   * untuk periode yang sama. WhatsApp harus menggunakan satu
   * kondisi pembayaran yang paling relevan, bukan mengirim
   * semua row mentah.
   */

  const candidates =
    [];


  payments.rows.forEach(
    function(row, index) {

      const tenantId =
        String(
          djApiValueV5_(
            row,
            payments.headers,
            [
              'Tenant_ID'
            ]
          ) || ''
        )
        .trim()
        .toUpperCase();


      if (!tenantId) {

        return;

      }


      const tenant =
        tenantMap[
          tenantId
        ];


      if (!tenant) {

        return;

      }


      /*
       * Tenant nonaktif tidak perlu dimasukkan ke daftar
       * komunikasi operasional.
       */

      if (
        tenant.status ===
        'NONAKTIF'
      ) {

        return;

      }


      const verification =
        String(
          djApiValueV5_(
            row,
            payments.headers,
            [
              'Status_Verifikasi'
            ]
          ) || ''
        )
        .trim()
        .toUpperCase();


      const periodRaw =
        djApiValueV5_(
          row,
          payments.headers,
          [
            'Periode',
            'Periode_Pembayaran'
          ]
        );


      const periodDate =
        djApiParseDateV7_(
          periodRaw
        );


      const period =
        periodDate
          ? djApiPeriodLabelV5_(
              periodDate
            )
          : (
              String(
                periodRaw || ''
              )
              .trim()
            );


      const paidDate =
        djApiParseDateV7_(
          djApiValueV5_(
            row,
            payments.headers,
            [
              'Tanggal_Pembayaran',
              'Tanggal_Bayar'
            ]
          )
        );


      const submitDate =
        djApiParseDateV7_(
          djApiValueV5_(
            row,
            payments.headers,
            [
              'Timestamp_Submit',
              'Last_Sync'
            ]
          )
        );


      const verificationDate =
        djApiParseDateV7_(
          djApiValueV5_(
            row,
            payments.headers,
            [
              'Tanggal_Verifikasi'
            ]
          )
        );


      const activityDate =
        verificationDate ||
        paidDate ||
        submitDate ||
        new Date(0);


      const totalStored =
        djApiNumberV5_(
          djApiValueV5_(
            row,
            payments.headers,
            [
              'Total_Tagihan'
            ]
          )
        );


      const paid =
        djApiNumberV5_(
          djApiValueV5_(
            row,
            payments.headers,
            [
              'Nominal_Dibayar'
            ]
          )
        );


      const rentFromPayment =
        djApiNumberV5_(
          djApiValueV5_(
            row,
            payments.headers,
            [
              'Tarif_Kamar',
              'Nominal_Sewa'
            ]
          )
        );


      /*
       * Contract menjadi sumber tarif yang lebih stabil
       * daripada Total_Tagihan lama.
       */

      const contract =
        djApiFindContractV5_(
          ss,
          tenantId
        );


      const rent =
        contract &&
        djApiNumberV5_(
          contract.amount
        ) > 0

          ? djApiNumberV5_(
              contract.amount
            )

          : rentFromPayment;


      const fineStored =
        djApiNumberV5_(
          djApiValueV5_(
            row,
            payments.headers,
            [
              'Denda_Terhitung',
              'Denda'
            ]
          )
        );


      /*
       * Billing pertama selalu tanpa denda.
       */

      let fine =
        fineStored;


      if (
        contract &&
        contract.startDate &&
        periodDate
      ) {

        const startDate =
          djApiParseDateV7_(
            contract.startDate
          );


        if (
          startDate &&
          startDate.getFullYear() ===
            periodDate.getFullYear() &&
          startDate.getMonth() ===
            periodDate.getMonth()
        ) {

          fine =
            0;

        }

      }


      /*
       * Total aktual untuk WhatsApp tidak mengambil
       * Total_Tagihan lama secara buta.
       *
       * Untuk billing pertama:
       *   total = tarif + 0
       *
       * Untuk periode lainnya:
       *   total = tarif + denda tersimpan
       *
       * Fallback ke Total_Tagihan hanya jika tarif memang
       * tidak tersedia.
       */

      let total =
        rent +
        fine;


      if (
        total <= 0
      ) {

        total =
          totalStored;

      }


      if (
        total < 0
      ) {

        total =
          0;

      }


      const dueRaw =
        djApiValueV5_(
          row,
          payments.headers,
          [
            'Tanggal_Jatuh_Tempo',
            'Jatuh_Tempo'
          ]
        );


      const dueDate =
        djApiParseDateV7_(
          dueRaw
        );


      candidates.push({

        tenantId:
          tenantId,

        tenant:
          tenant,

        row:
          row,

        rowIndex:
          index,

        verification:
          verification,

        period:
          period,

        periodDate:
          periodDate,

        dueDate:
          dueDate,

        paid:
          paid,

        total:
          total,

        fine:
          fine,

        activityDate:
          activityDate,

        storedStatus:
          String(
            djApiValueV5_(
              row,
              payments.headers,
              [
                'Status_Pembayaran'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase()

      });

    }
  );


  /*
   * ==========================================================
   * PILIH RECORD TERBAIK PER TENANT
   * ==========================================================
   *
   * Prioritas:
   * 1. Periode pembayaran paling baru.
   * 2. Jika periode sama dan ada record TERVERIFIKASI,
   *    gunakan record terverifikasi terbaru.
   * 3. Jika tidak ada yang terverifikasi, gunakan record
   *    dengan aktivitas paling baru.
   *
   * Ini mencegah row lama seperti Bima yang masih memiliki
   * sisa Rp50.000 ikut mengalahkan record yang sudah LUNAS.
   */

  const grouped =
    {};


  candidates.forEach(
    function(item) {

      const key =
        item.tenantId +
        '|' +
        (
          item.periodDate
            ? (
                item.periodDate.getFullYear() +
                '-' +
                String(
                  item.periodDate.getMonth() + 1
                )
                .padStart(
                  2,
                  '0'
                )
              )
            : item.period
        );


      if (
        !grouped[key]
      ) {

        grouped[key] = [];

      }


      grouped[key].push(
        item
      );

    }
  );


  const currentByTenant =
    {};


  Object.keys(
    grouped
  ).forEach(
    function(key) {

      const group =
        grouped[key];


      group.sort(
        function(a, b) {

          if (
            a.verification ===
            'TERVERIFIKASI' &&
            b.verification !==
            'TERVERIFIKASI'
          ) {

            return -1;

          }


          if (
            a.verification !==
            'TERVERIFIKASI' &&
            b.verification ===
            'TERVERIFIKASI'
          ) {

            return 1;

          }


          const aTime =
            a.activityDate
              ? a.activityDate.getTime()
              : 0;


          const bTime =
            b.activityDate
              ? b.activityDate.getTime()
              : 0;


          if (
            bTime !==
            aTime
          ) {

            return bTime -
                   aTime;

          }


          return b.rowIndex -
                 a.rowIndex;

        }
      );


      const selected =
        group[0];


      const existing =
        currentByTenant[
          selected.tenantId
        ];


      if (
        !existing
      ) {

        currentByTenant[
          selected.tenantId
        ] =
          selected;

        return;

      }


      const existingPeriod =
        existing.periodDate
          ? existing.periodDate.getTime()
          : -Infinity;


      const selectedPeriod =
        selected.periodDate
          ? selected.periodDate.getTime()
          : -Infinity;


      if (
        selectedPeriod >
        existingPeriod
      ) {

        currentByTenant[
          selected.tenantId
        ] =
          selected;

      } else if (
        selectedPeriod ===
        existingPeriod
      ) {

        if (
          selected.verification ===
          'TERVERIFIKASI' &&
          existing.verification !==
          'TERVERIFIKASI'
        ) {

          currentByTenant[
            selected.tenantId
          ] =
            selected;

        } else if (
          selected.activityDate.getTime() >
          existing.activityDate.getTime()
        ) {

          currentByTenant[
            selected.tenantId
          ] =
            selected;

        }

      }

    }
  );


  const items =
    [];


  Object.keys(
    currentByTenant
  ).forEach(
    function(tenantId) {

      const item =
        currentByTenant[
          tenantId
        ];


      const tenant =
        item.tenant;


      let status =
        item.storedStatus;


      const verification =
        item.verification;


      let outstanding =
        item.total -
        item.paid;


      if (
        outstanding <
        0
      ) {

        outstanding =
          0;

      }


      /*
       * Status final yang digunakan semua pesan WhatsApp.
       */

      if (
        verification ===
        'TERVERIFIKASI'
      ) {

        if (
          item.total > 0 &&
          item.paid >= item.total
        ) {

          status =
            'LUNAS';

          outstanding =
            0;

        } else if (
          item.total > 0 &&
          item.paid > 0
        ) {

          status =
            'KURANG BAYAR';

        } else {

          status =
            'BELUM BAYAR';

        }

      } else if (
        verification ===
        'DITOLAK'
      ) {

        status =
          'DITOLAK';

        outstanding =
          item.total;

      } else if (
        item.paid > 0 &&
        item.total > 0 &&
        item.paid < item.total
      ) {

        status =
          'KURANG BAYAR';

      } else if (
        item.paid >= item.total &&
        item.total > 0
      ) {

        status =
          'MENUNGGU VERIFIKASI';

        outstanding =
          0;

      } else {

        const now =
          new Date();

        const nowStart =
          new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );


        const dueStart =
          item.dueDate

            ? new Date(
                item.dueDate.getFullYear(),
                item.dueDate.getMonth(),
                item.dueDate.getDate()
              )

            : null;


        if (
          item.paid <= 0 &&
          dueStart &&
          nowStart.getTime() >
          dueStart.getTime()
        ) {

          status =
            'TERLAMBAT';

        } else {

          status =
            'BELUM BAYAR';

        }

      }


      const phone =
        djApiNormalizeWAV5_(
          tenant.phone
        );


      if (!phone) {

        return;

      }


      const nl =
        String.fromCharCode(
          10
        );


      const period =
        item.period ||
        '-';


      const name =
        tenant.name ||
        'Tenant';


      const room =
        tenant.room ||
        '-';


      const paid =
        item.paid;


      const total =
        item.total;


      const remaining =
        outstanding;


      let dueLabel =
        '';


      if (
        item.dueDate
      ) {

        dueLabel =
          Utilities.formatDate(
            item.dueDate,
            Session.getScriptTimeZone() ||
            'Asia/Jakarta',
            'dd/MM/yyyy'
          );

      }


      let message =
        '';


      /*
       * ========================================================
       * PESAN LUNAS
       * ========================================================
       */

      if (
        status ===
        'LUNAS'
      ) {

        message =
          'Halo ' +
          name +
          ',' +
          nl +
          nl +
          'Terima kasih. Pembayaran DJ Family Kost untuk periode ' +
          period +
          ' kamar ' +
          room +
          ' sebesar Rp' +
          paid.toLocaleString(
            'id-ID'
          ) +
          ' telah kami terima dan diverifikasi.' +
          nl +
          nl +
          'Status: LUNAS.' +
          nl +
          nl +
          'Terima kasih telah menyelesaikan pembayaran Anda.' +
          nl +
          'DJ Family Kost';

      /*
       * ========================================================
       * PESAN KURANG BAYAR
       * ========================================================
       */

      } else if (
        status ===
        'KURANG BAYAR'
      ) {

        message =
          'Halo ' +
          name +
          ',' +
          nl +
          nl +
          'Pembayaran DJ Family Kost untuk periode ' +
          period +
          ' kamar ' +
          room +
          ' telah kami terima sebesar Rp' +
          paid.toLocaleString(
            'id-ID'
          ) +
          '.' +
          nl +
          nl +
          'Total tagihan: Rp' +
          total.toLocaleString(
            'id-ID'
          ) +
          nl +
          'Sisa pembayaran: Rp' +
          remaining.toLocaleString(
            'id-ID'
          ) +
          nl +
          'Status: KURANG BAYAR.' +
          nl +
          nl +
          (
            verification ===
            'MENUNGGU VERIFIKASI'

              ? (
                  'Pembayaran saat ini masih menunggu verifikasi Master.' +
                  nl +
                  'Mohon melakukan pelunasan sisa pembayaran sebesar Rp' +
                  remaining.toLocaleString(
                    'id-ID'
                  ) +
                  '.'
                )

              : (
                  'Mohon melakukan pelunasan sisa pembayaran sebesar Rp' +
                  remaining.toLocaleString(
                    'id-ID'
                  ) +
                  '.'
                )
          ) +
          nl +
          nl +
          'Terima kasih.' +
          nl +
          'DJ Family Kost';

      /*
       * ========================================================
       * PESAN MENUNGGU VERIFIKASI
       * ========================================================
       */

      } else if (
        status ===
        'MENUNGGU VERIFIKASI'
      ) {

        message =
          'Halo ' +
          name +
          ',' +
          nl +
          nl +
          'Terima kasih. Pembayaran DJ Family Kost untuk periode ' +
          period +
          ' kamar ' +
          room +
          ' sebesar Rp' +
          paid.toLocaleString(
            'id-ID'
          ) +
          ' telah kami terima.' +
          nl +
          nl +
          'Status pembayaran: MENUNGGU VERIFIKASI.' +
          nl +
          'Pembayaran sedang diproses oleh Master.' +
          nl +
          nl +
          'Tidak ada pembayaran tambahan yang diminta saat ini.' +
          nl +
          nl +
          'Terima kasih.' +
          nl +
          'DJ Family Kost';

      /*
       * ========================================================
       * PESAN DITOLAK
       * ========================================================
       */

      } else if (
        status ===
        'DITOLAK'
      ) {

        const reason =
          String(
            djApiValueV5_(
              item.row,
              payments.headers,
              [
                'Catatan_Verifikasi',
                'Keterangan'
              ]
            ) || ''
          )
          .trim();


        message =
          'Halo ' +
          name +
          ',' +
          nl +
          nl +
          'Pembayaran DJ Family Kost untuk periode ' +
          period +
          ' kamar ' +
          room +
          ' belum dapat kami terima karena bukti pembayaran ditolak.' +
          nl +
          nl +
          (
            reason
              ? (
                  'Catatan: ' +
                  reason +
                  nl +
                  nl
                )
              : ''
          ) +
          'Total tagihan yang perlu diselesaikan: Rp' +
          total.toLocaleString(
            'id-ID'
          ) +
          '.' +
          nl +
          nl +
          'Silakan melakukan pembayaran kembali dan mengirimkan bukti pembayaran yang sesuai.' +
          nl +
          nl +
          'Terima kasih.' +
          nl +
          'DJ Family Kost';

      /*
       * ========================================================
       * PESAN TERLAMBAT
       * ========================================================
       */

      } else if (
        status ===
        'TERLAMBAT'
      ) {

        message =
          'Halo ' +
          name +
          ',' +
          nl +
          nl +
          'Pembayaran DJ Family Kost untuk periode ' +
          period +
          ' kamar ' +
          room +
          ' belum kami terima.' +
          nl +
          nl +
          'Total tagihan: Rp' +
          total.toLocaleString(
            'id-ID'
          ) +
          (
            dueLabel
              ? (
                  nl +
                  'Jatuh tempo: ' +
                  dueLabel
                )
              : ''
          ) +
          nl +
          'Status: TERLAMBAT.' +
          nl +
          nl +
          'Mohon segera melakukan pembayaran sebesar Rp' +
          remaining.toLocaleString(
            'id-ID'
          ) +
          '.' +
          nl +
          nl +
          'Terima kasih.' +
          nl +
          'DJ Family Kost';

      /*
       * ========================================================
       * PESAN BELUM BAYAR
       * ========================================================
       */

      } else {

        message =
          'Halo ' +
          name +
          ',' +
          nl +
          nl +
          'Ini pengingat pembayaran DJ Family Kost untuk periode ' +
          period +
          ' kamar ' +
          room +
          '.' +
          nl +
          nl +
          'Total tagihan: Rp' +
          total.toLocaleString(
            'id-ID'
          ) +
          nl +
          'Status: BELUM BAYAR.' +
          nl +
          nl +
          'Mohon melakukan pembayaran sebesar Rp' +
          remaining.toLocaleString(
            'id-ID'
          ) +
          '.' +
          nl +
          nl +
          'Terima kasih.' +
          nl +
          'DJ Family Kost';

      }


      items.push({

        tenantId:
          tenantId,

        name:
          name,

        room:
          room,

        phone:
          phone,

        period:
          period,

        dueDate:
          dueLabel,

        amount:
          remaining,

        paid:
          paid,

        total:
          total,

        status:
          status,

        verification:
          verification,

        message:
          message,

        waLink:
          'https://wa.me/' +
          phone +
          '?text=' +
          encodeURIComponent(
            message
          )

      });

    }
  );


  /*
   * LUNAS tetap ditampilkan agar Master dapat mengirim
   * ucapan terima kasih.
   */

  items.sort(
    function(a, b) {

      const order = {

        'TERLAMBAT':
          1,

        'KURANG BAYAR':
          2,

        'DITOLAK':
          3,

        'BELUM BAYAR':
          4,

        'MENUNGGU VERIFIKASI':
          5,

        'LUNAS':
          6

      };


      const ao =
        order[
          a.status
        ] || 99;


      const bo =
        order[
          b.status
        ] || 99;


      if (
        ao !==
        bo
      ) {

        return ao -
               bo;

      }


      return String(
        a.name || ''
      ).localeCompare(
        String(
          b.name || ''
        ),
        'id'
      );

    }
  );


  return {

    items:
      items

  };

}


/* ============================================================
 * AUTOMATION
 * ============================================================
 */
function djApiRunAutomationV5_() {

  const executed =
    [];


  try {

    if (
      typeof runDJFamilyKostHourly ===
      'function'
    ) {

      runDJFamilyKostHourly();

      executed.push(
        'runDJFamilyKostHourly'
      );

    }

  } catch (err) {}


  try {

    if (
      typeof refreshDashboardDJ_V5 ===
      'function'
    ) {

      refreshDashboardDJ_V5();

      executed.push(
        'refreshDashboardDJ_V5'
      );

    }

  } catch (err) {}


  try {

    if (
      typeof generateMonthlyPaymentsDJ39 ===
      'function'
    ) {

      generateMonthlyPaymentsDJ39();

      executed.push(
        'generateMonthlyPaymentsDJ39'
      );

    }

  } catch (err) {}


  SpreadsheetApp.flush();


  return {

    ok:
      true,

    executed:
      executed,

    message:
      executed.length

        ? 'Otomasi berhasil dijalankan.'

        : 'Tidak ada engine otomasi tambahan yang tersedia.'

  };

}


/* ============================================================
 * GENERIC TABLE HELPERS
 * ============================================================
 */
function djApiReadSafeV5_(
  ss,
  sheetName,
  required
) {

  const sheet =
    ss.getSheetByName(
      sheetName
    );


  if (!sheet) {

    return null;

  }


  return djApiReadTableV5_(
    sheet,
    required
  );

}


function djApiReadTableV5_(
  sheet,
  requiredHeaders
) {

  if (
    !sheet ||
    sheet.getLastRow() <
    1 ||
    sheet.getLastColumn() <
    1
  ) {

    return null;

  }


  const lastColumn =
    sheet.getLastColumn();


  const maxRows =
    Math.min(
      sheet.getLastRow(),
      15
    );


  const required =
    requiredHeaders.map(
      djApiCanonV5_
    );


  let bestRow =
    -1;


  let bestScore =
    -1;


  for (
    let r = 1;
    r <= maxRows;
    r++
  ) {

    const row =
      sheet
        .getRange(
          r,
          1,
          1,
          lastColumn
        )
        .getValues()[0];


    const normalized =
      row.map(
        djApiCanonV5_
      );


    let score =
      0;


    required.forEach(
      function(needle) {

        if (
          normalized.indexOf(
            needle
          ) >= 0
        ) {

          score++;

        }

      }
    );


    if (
      score >
      bestScore
    ) {

      bestScore =
        score;

      bestRow =
        r;

    }

  }


  if (
    bestRow < 0 ||
    bestScore !==
    required.length
  ) {

    return null;

  }


  const headers =
    sheet
      .getRange(
        bestRow,
        1,
        1,
        lastColumn
      )
      .getValues()[0]
      .map(
        function(value) {

          return String(
            value || ''
          ).trim();

        }
      );


  const rows =
    sheet.getLastRow() >
    bestRow

      ? sheet
          .getRange(
            bestRow + 1,
            1,
            sheet.getLastRow() -
              bestRow,
            lastColumn
          )
          .getValues()

      : [];


  return {

    sheet:
      sheet,

    headerRow:
      bestRow,

    headers:
      headers,

    rows:
      rows

  };

}


/* ============================================================
 * HEADERS
 * ============================================================
 */
function djApiFindHeadersV5_(
  sheet
) {

  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Tenant_ID'
      ]
    );


  if (table) {

    return table.headers;

  }


  return sheet
    .getRange(
      1,
      1,
      1,
      sheet.getLastColumn()
    )
    .getValues()[0]
    .map(
      function(value) {

        return String(
          value || ''
        ).trim();

      }
    );

}


function djApiFindColumnV5_(
  headers,
  aliases
) {

  const normalized =
    headers.map(
      djApiCanonV5_
    );


  for (
    let i = 0;
    i < aliases.length;
    i++
  ) {

    const needle =
      djApiCanonV5_(
        aliases[i]
      );


    const exact =
      normalized.indexOf(
        needle
      );


    if (
      exact >= 0
    ) {

      return exact;

    }

  }


  return -1;

}


function djApiCanonV5_(
  value
) {

  return String(
    value || ''
  )
  .trim()
  .toLowerCase()
  .replace(
    /[^a-z0-9]/g,
    ''
  );

}


/* ============================================================
 * VALUE
 * ============================================================
 */
function djApiValueV5_(
  row,
  headers,
  aliases
) {

  const col =
    djApiFindColumnV5_(
      headers,
      aliases
    );


  return (
    col >= 0
      ? row[col]
      : ''
  );

}


function djApiCellV5_(
  sheet,
  row,
  headers,
  aliases
) {

  const col =
    djApiFindColumnV5_(
      headers,
      aliases
    );


  return (
    col >= 0

      ? sheet
          .getRange(
            row,
            col + 1
          )
          .getValue()

      : ''
  );

}


/* ============================================================
 * ROW HELPERS
 * ============================================================
 */
function djApiFindRowV5_(
  table,
  aliases,
  value
) {

  if (!table) {

    return -1;

  }


  const col =
    djApiFindColumnV5_(
      table.headers,
      aliases
    );


  if (
    col < 0
  ) {

    return -1;

  }


  const target =
    String(
      value || ''
    ).trim();


  for (
    let i = 0;
    i < table.rows.length;
    i++
  ) {

    if (
      String(
        table.rows[i][col] || ''
      ).trim()
      ===
      target
    ) {

      return (
        table.headerRow +
        1 +
        i
      );

    }

  }


  return -1;

}


function djApiUpdateRowV5_(
  sheet,
  rowNumber,
  headers,
  data
) {

  const values =
    sheet
      .getRange(
        rowNumber,
        1,
        1,
        headers.length
      )
      .getValues()[0];


  headers.forEach(
    function(header,index) {

      const key =
        djApiResolveKeyV5_(
          header,
          data
        );


      if (
        key !== null
      ) {

        values[index] =
          data[key];

      }

    }
  );


  sheet
    .getRange(
      rowNumber,
      1,
      1,
      values.length
    )
    .setValues(
      [values]
    );

}


function djApiAppendRowV5_(
  sheet,
  headers,
  data
) {

  const row =
    headers.map(
      function(header) {

        const key =
          djApiResolveKeyV5_(
            header,
            data
          );


        return key !== null
          ? data[key]
          : '';

      }
    );


  const targetRow =
    sheet.getLastRow() + 1;


  sheet
    .getRange(
      targetRow,
      1,
      1,
      row.length
    )
    .setValues(
      [row]
    );

}


/* ============================================================
 * HEADER FIELD CREATION
 * ============================================================
 */
function djApiEnsureFieldsV5_(
  sheet,
  headerRow,
  headers,
  fields
) {

  let current =
    headers.slice();


  fields.forEach(
    function(field) {

      if (
        djApiFindColumnV5_(
          current,
          [
            field
          ]
        ) >= 0
      ) {

        return;

      }


      const col =
        sheet.getLastColumn() + 1;


      sheet
        .getRange(
          headerRow,
          col
        )
        .setValue(
          field
        );


      current.push(
        field
      );

    }
  );


  return current;

}


function djApiEnsureSheetFieldsV5_(
  sheet,
  fields
) {

  if (!sheet) {

    throw new Error(
      'Sheet tidak ditemukan.'
    );

  }


  const cleanFields =
    Array.isArray(fields)
      ? fields
          .map(function(field) {
            return String(field || '').trim();
          })
          .filter(Boolean)
      : [];


  if (!cleanFields.length) {

    return;

  }


  /*
   * BUG LAMA:
   * fungsi sebelumnya memakai fields[0] sebagai header wajib.
   * Pada STEP 2 kita menambahkan Kamar_Diminati, tetapi kolom itu
   * memang belum ada pada sheet Pendaftaran. Akibatnya fungsi
   * berhenti dengan:
   *
   *   Header sheet tidak ditemukan.
   *
   * Sekarang header dicari memakai salah satu field yang SUDAH
   * ada terlebih dahulu. Field baru kemudian ditambahkan.
   */

  const lookupCandidates =
    cleanFields.concat([
      'Pendaftaran_ID',
      'Tenant_ID',
      'Maintenance_ID',
      'Payment_ID',
      'Pembayaran_ID',
      'CheckInOut_ID',
      'Pelanggaran_ID',
      'No_Kamar'
    ]);


  let table =
    null;


  for (
    let i = 0;
    i < lookupCandidates.length;
    i++
  ) {

    const candidate =
      lookupCandidates[i];

    if (!candidate) {
      continue;
    }

    table =
      djApiReadTableV5_(
        sheet,
        [candidate]
      );

    if (table) {
      break;
    }

  }


  if (!table) {

    throw new Error(
      'Header sheet tidak ditemukan. Pastikan sheet memiliki minimal satu header resmi seperti Pendaftaran_ID, Tenant_ID, Maintenance_ID, Payment_ID, Pembayaran_ID, CheckInOut_ID, Pelanggaran_ID, atau No_Kamar.'
    );

  }


  djApiEnsureFieldsV5_(
    sheet,
    table.headerRow,
    table.headers,
    cleanFields
  );

}


/* ============================================================
 * RESOLVE DATA KEY
 * ============================================================
 */


function djApiResolveKeyV5_(
  header,
  data
) {

  const normalized =
    djApiCanonV5_(
      header
    );


  const aliases = {

    paymentid:
      'Payment_ID',

    pembayaranid:
      'Payment_ID',

    sourcekey:
      'Source_Key',

    timestampsubmit:
      'Timestamp_Submit',

    tenantid:
      'Tenant_ID',

    nokamar:
      'No_Kamar',

    namatenant:
      'Nama_Tenant',

    namalengkap:
      'Nama_Tenant',

    nohp:
      'No_HP',

    periode:
      'Periode',

    periodepembayaran:
      'Periode',

    tanggalbayar:
      'Tanggal_Bayar',

    tanggalpembayaran:
      'Tanggal_Pembayaran',

    tanggaljatuhtempo:
      'Tanggal_Jatuh_Tempo',

    jatuhtempo:
      'Jatuh_Tempo',

    nominalsewa:
      'Nominal_Sewa',

    tarifkamar:
      'Tarif_Kamar',

    nominaldibayar:
      'Nominal_Dibayar',

    hariterlambat:
      'Hari_Terlambat',

    denda:
      'Denda',

    dendaterhitung:
      'Denda_Terhitung',

    totalkagihan:
      'Total_Tagihan',

    selisih:
      'Selisih',

    statuspembayaran:
      'Status_Pembayaran',

    statusverifikasi:
      'Status_Verifikasi',

    metodepembayaran:
      'Metode_Pembayaran',

    buktipembayaranurl:
      'Bukti_Pembayaran_URL',

    buktipembayaranfoto:
      'Bukti_Pembayaran_Foto',

    buktifileid:
      'Bukti_File_ID',

    keterangan:
      'Keterangan',

    catatan:
      'Keterangan',

    catatanverifikasi:
      'Catatan_Verifikasi',

    diverifikasioleh:
      'Diverifikasi_Oleh',

    tanggalverifikasi:
      'Tanggal_Verifikasi',

    maintenanceid:
      'Maintenance_ID',

    lokasimasalah:
      'Lokasi_Masalah',

    jenismasalah:
      'Jenis_Masalah',

    deskripsi:
      'Deskripsi',

    urgensi:
      'Urgensi',

    fotokerusakanurl:
      'Foto_Kerusakan_URL',

    fotokerusakanfileid:
      'Foto_Kerusakan_File_ID',

    fotokerusakanfilename:
      'Foto_Kerusakan_File_Name',

    izinnasuk:
      'Izin_Masuk',

    waktunyaman:
      'Waktu_Nyaman',

    status:
      'Status',

    pic:
      'PIC',

    tanggaltindaklanjut:
      'Tanggal_Tindak_Lanjut',

    fotosesudahurl:
      'Foto_Sesudah_URL',

    fotosesudahfileid:
      'Foto_Sesudah_File_ID',

    fotosesudahfilename:
      'Foto_Sesudah_File_Name',

    biaya:
      'Biaya',

    catatanpenyelesaian:
      'Catatan_Penyelesaian',

    tanggalselesai:
      'Tanggal_Selesai',

    updatedby:
      'Updated_By',

    lastsync:
      'Last_Sync',

    statuspendaftaran:
      'Status_Pendaftaran',

    namapanggilan:
      'Nama_Panggilan',

    tanggalmulai:
      'Tanggal_Mulai',

    tanggalmulaitinggal:
      'Tanggal_Mulai_Tinggal',

    rencanamulaisewa:
      'Rencana_Mulai_Sewa',

    sumber:
      'Sumber',

    kamardiminati:
      'Kamar_Diminati',

    kamarfinal:
      'Kamar_Final',

    hargafinal:
      'Harga_Final',

    statusakun:
      'Status_Akun',

    disetujuioleh:
      'Disetujui_Oleh',

    tanggalpersetujuan:
      'Tanggal_Persetujuan',

    pengumumanid:
      'Pengumuman_ID',

    judul:
      'Judul',

    isi:
      'Isi',

    pesan:
      'Isi',

    prioritas:
      'Prioritas',

    tanggalterbit:
      'Tanggal_Terbit',

    createdby:
      'Created_By',

    createdat:
      'Created_At'

  };


  const key =
    aliases[
      normalized
    ];


  if (
    key &&
    data[key] !== undefined
  ) {

    return key;

  }


  if (
    data[header] !== undefined
  ) {

    return header;

  }


  return null;

}


/* ============================================================
 * NUMBER
 * ============================================================
 */
function djApiNumberV5_(
  value
) {

  if (
    typeof value ===
    'number'
  ) {

    return value;

  }


  const text =
    String(
      value == null
        ? ''
        : value
    )
    .replace(
      /[^0-9-]/g,
      ''
    );


  const number =
    Number(
      text
    );


  return isNaN(
    number
  )
    ? 0
    : number;

}


/* ============================================================
 * PAYMENT ID
 * ============================================================
 */
function djApiNextPaymentIdV5_(
  sheet,
  headers
) {

  const col =
    djApiFindColumnV5_(
      headers,
      [
        'Payment_ID',
        'Pembayaran_ID'
      ]
    );


  let max =
    0;


  if (
    col >= 0 &&
    sheet.getLastRow() >= 1
  ) {

    const values =
      sheet
        .getRange(
          1,
          col + 1,
          sheet.getLastRow(),
          1
        )
        .getValues();


    values.forEach(
      function(row) {

        const match =
          String(
            row[0] || ''
          )
          .match(
            /(\d+)$/
          );


        if (match) {

          max =
            Math.max(
              max,
              Number(
                match[1]
              )
            );

        }

      }
    );

  }


  return (
    'PWEB-' +
    String(
      max + 1
    ).padStart(
      3,
      '0'
    )
  );

}


/* ============================================================
 * MAINTENANCE ID
 * ============================================================
 */
function djApiNextMaintenanceIdV5_(
  sheet,
  headers
) {

  const col =
    djApiFindColumnV5_(
      headers,
      [
        'Maintenance_ID'
      ]
    );


  let max =
    0;


  if (
    col >= 0 &&
    sheet.getLastRow() >= 1
  ) {

    const values =
      sheet
        .getRange(
          1,
          col + 1,
          sheet.getLastRow(),
          1
        )
        .getValues();


    values.forEach(
      function(row) {

        const match =
          String(
            row[0] || ''
          )
          .match(
            /(\d+)$/
          );


        if (match) {

          max =
            Math.max(
              max,
              Number(
                match[1]
              )
            );

        }

      }
    );

  }


  return (
    'MNT-WEB-' +
    String(
      max + 1
    ).padStart(
      4,
      '0'
    )
  );

}


/* ============================================================
 * PERIOD
 * ============================================================
 */
function djApiPeriodLabelV5_(
  date
) {

  const months = [

    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'

  ];


  return (

    months[
      date.getMonth()
    ] +
    ' ' +
    date.getFullYear()

  );

}


function djApiPeriodMatchesValuesV5_(
  value,
  year,
  month
) {

  const text =
    String(
      value || ''
    )
    .trim()
    .toLowerCase();


  const months = {

    januari: 1,
    februari: 2,
    maret: 3,
    april: 4,
    mei: 5,
    juni: 6,
    juli: 7,
    agustus: 8,
    september: 9,
    oktober: 10,
    november: 11,
    desember: 12

  };


  for (
    const name in months
  ) {

    if (
      text.indexOf(
        name
      ) >= 0
    ) {

      const y =
        text.match(
          /20\d{2}/
        );


      return (
        !!y &&
        Number(
          y[0]
        ) ===
        year &&
        months[name] ===
        month
      );

    }

  }


  const iso =
    text.match(
      /^(20\d{2})[-\/](\d{1,2})/
    );


  if (iso) {

    return (
      Number(
        iso[1]
      ) ===
      year
      &&
      Number(
        iso[2]
      ) ===
      month
    );

  }


  return false;

}


function djApiPeriodMatchesV5_(
  value,
  date
) {

  return djApiPeriodMatchesValuesV5_(
    value,
    date.getFullYear(),
    date.getMonth() + 1
  );

}


/* ============================================================
 * BILLING PERIOD HELPERS
 * ============================================================
 *
 * Tenant baru tidak dikenakan denda pada bulan pertama
 * berdasarkan bulan Tanggal_Mulai / startDate kontrak.
 * Helper ini sengaja dibuat terpusat agar Tenant dan Master
 * memakai aturan yang sama.
 * ============================================================
 */
function djApiCoerceDateMonthV5_(
  value
) {

  if (
    value instanceof Date &&
    !isNaN(
      value.getTime()
    )
  ) {

    return new Date(
      value.getFullYear(),
      value.getMonth(),
      1
    );

  }


  const text =
    String(
      value == null
        ? ''
        : value
    )
    .trim();


  if (!text) {

    return null;

  }


  const iso =
    text.match(
      /^(20\d{2})[-\/](\d{1,2})(?:[-\/](\d{1,2}))?/
    );


  if (iso) {

    return new Date(
      Number(
        iso[1]
      ),
      Number(
        iso[2]
      ) - 1,
      1
    );

  }


  const dmy =
    text.match(
      /^(\d{1,2})[-\/](\d{1,2})[-\/](20\d{2})/
    );


  if (dmy) {

    return new Date(
      Number(
        dmy[3]
      ),
      Number(
        dmy[2]
      ) - 1,
      1
    );

  }


  const parsed =
    new Date(
      text
    );


  if (
    !isNaN(
      parsed.getTime()
    )
  ) {

    return new Date(
      parsed.getFullYear(),
      parsed.getMonth(),
      1
    );

  }


  return null;

}


function djApiIsFirstBillingPeriodV5_(
  contractStartDate,
  billingPeriodDate
) {

  const start =
    djApiCoerceDateMonthV5_(
      contractStartDate
    );


  const period =
    djApiCoerceDateMonthV5_(
      billingPeriodDate
    );


  if (
    !start ||
    !period
  ) {

    return false;

  }


  return (
    start.getFullYear() ===
    period.getFullYear()

    &&

    start.getMonth() ===
    period.getMonth()
  );

}


/* ============================================================
 * PHONE
 * ============================================================
 */
function djApiFindPhoneV5_(
  ss,
  tenantId
) {

  const table =
    djApiReadSafeV5_(
      ss,
      'Tenant',
      [
        'Tenant_ID'
      ]
    );


  if (!table) {

    return '';

  }


  const tenantCol =
    djApiFindColumnV5_(
      table.headers,
      [
        'Tenant_ID'
      ]
    );


  for (
    let i = 0;
    i < table.rows.length;
    i++
  ) {

    if (
      String(
        table.rows[i][tenantCol] || ''
      ).trim()
      !==
      String(
        tenantId
      ).trim()
    ) {

      continue;

    }


    return String(
      djApiValueV5_(
        table.rows[i],
        table.headers,
        [
          'No_HP'
        ]
      ) || ''
    ).trim();

  }


  return '';

}


/* ============================================================
 * WHATSAPP NUMBER
 * ============================================================
 */
function djApiNormalizeWAV5_(
  value
) {

  let phone =
    String(
      value || ''
    )
    .replace(
      /[^0-9]/g,
      ''
    );


  if (
    phone.indexOf('62') ===
    0
  ) {

    return phone;

  }


  if (
    phone.indexOf('0') ===
    0
  ) {

    return (
      '62' +
      phone.substring(
        1
      )
    );

  }


  return phone;

}


/* ============================================================
 * MEDIA URL ‚Üí DRIVE ID
 * ============================================================
 */
function djApiExtractDriveIdV5_(
  url
) {

  const text =
    String(
      url || ''
    ).trim();


  if (!text) {

    return '';

  }


  const patterns = [

    /\/d\/([a-zA-Z0-9_-]+)/,

    /[?&]id=([a-zA-Z0-9_-]+)/,

    /\/file\/d\/([a-zA-Z0-9_-]+)/

  ];


  for (
    let i = 0;
    i < patterns.length;
    i++
  ) {

    const match =
      text.match(
        patterns[i]
      );


    if (match) {

      return match[1];

    }

  }


  return '';

}


/* ============================================================
 * MASTER ROOMS
 * ============================================================
 */
function djApiBuildRoomsV5_(
  table
) {

  if (!table) {

    return [];

  }


  return table.rows.map(
    function(row) {

      return {

        number:
          djApiValueV5_(
            row,
            table.headers,
            [
              'No_Kamar'
            ]
          ),

        status:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Status'
            ]
          ),

        price:
          djApiNumberV5_(
            djApiValueV5_(
              row,
              table.headers,
              [
                'Harga_Bulan',
                'Harga_Sewa',
                'Harga'
              ]
            )
          ),

        tenantId:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Tenant_ID'
            ]
          ),

        tenantName:
          djApiValueV5_(
            row,
            table.headers,
            [
              'Nama_Tenant'
            ]
          )

      };

    }
  );

}


/* ============================================================
 * SESSION ERROR
 * ============================================================
 */
/* ============================================================
 * STEP 5 ‚Äî TENANT ACCOUNT STATUS
 * ============================================================
 * Hanya membaca status akun. Tidak mengubah data.
 * ============================================================
 */
function djApiGetTenantAccountStateV1_(
  tenantId
) {

  tenantId =
    String(
      tenantId || ''
    )
    .trim()
    .toUpperCase();

  if (!tenantId) {
    return {
      status: '',
      tenantStatus: '',
      exists: false,
      blocked: false
    };
  }

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  /* ========================================================
   * SUMBER 1 ‚Äî AKUN_TENANT
   * ========================================================
   */
  let accountStatus = '';

  const accountSheet =
    ss.getSheetByName(
      'Akun_Tenant'
    );

  if (accountSheet) {

    const accountTable =
      djApiReadTableV5_(
        accountSheet,
        ['Tenant_ID']
      );

    if (accountTable) {

      const accountRow =
        djApiFindRowV5_(
          accountTable,
          ['Tenant_ID'],
          tenantId
        );

      if (accountRow > 0) {

        const accountDataRow =
          accountTable.rows[
            accountRow -
            accountTable.headerRow -
            1
          ];

        accountStatus =
          String(
            djApiValueV5_(
              accountDataRow,
              accountTable.headers,
              [
                'Status_Akun',
                'Status Account'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase();

      }

    }

  }


  /* ========================================================
   * SUMBER 2 ‚Äî TENANT
   * ========================================================
   * Ini penting untuk akun lama yang sudah checkout sebelum
   * penguncian akun STEP 5 dipasang.
   */
  let tenantStatus = '';

  const tenantSheet =
    ss.getSheetByName(
      'Tenant'
    );

  if (tenantSheet) {

    const tenantTable =
      djApiReadTableV5_(
        tenantSheet,
        ['Tenant_ID']
      );

    if (tenantTable) {

      const tenantRow =
        djApiFindRowV5_(
          tenantTable,
          ['Tenant_ID'],
          tenantId
        );

      if (tenantRow > 0) {

        const tenantDataRow =
          tenantTable.rows[
            tenantRow -
            tenantTable.headerRow -
            1
          ];

        tenantStatus =
          String(
            djApiValueV5_(
              tenantDataRow,
              tenantTable.headers,
              [
                'Status_Tenant',
                'Status'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase();

      }

    }

  }


  const blockedStatuses = [
    'NONAKTIF',
    'NON-AKTIF',
    'BLOKIR',
    'BLOCKED',
    'DISABLED',
    'INACTIVE'
  ];


  const blocked =
    blockedStatuses.indexOf(
      accountStatus
    ) >= 0
    ||
    blockedStatuses.indexOf(
      tenantStatus
    ) >= 0;


  return {
    status:
      accountStatus,
    tenantStatus:
      tenantStatus,
    exists:
      !!accountStatus || !!tenantStatus,
    blocked:
      blocked
  };

}


function djApiSessionErrorV5_() {

  return djApiJsonV5_({

    ok: false,

    error:
      'Session tenant tidak valid atau sudah kedaluwarsa.'

  });

}


/* ============================================================
 * JSON RESPONSE
 * ============================================================
 */
function djApiJsonV5_(
  data
) {

  return ContentService
    .createTextOutput(
      JSON.stringify(
        data
      )
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}


/* ============================================================
 * REQUEST PARSER
 * ============================================================
 */
function djApiParseRequestV5_(
  e
) {

  if (!e) {

    return {};

  }


  if (
    e.postData &&
    e.postData.contents
  ) {

    const text =
      String(
        e.postData.contents || ''
      ).trim();


    if (text) {

      try {

        const parsed =
          JSON.parse(
            text
          );


        if (
          parsed &&
          typeof parsed ===
          'object'
        ) {

          return parsed;

        }

      } catch (err) {}

    }

  }


  return e.parameter || {};

}


/* ============================================================
 * LOG
 * ============================================================
 */
function djApiLogV5_(
  ss,
  type,
  message
) {

  try {

    const sheet =
      ss.getSheetByName(
        'System_Log'
      );


    if (!sheet) {

      return;

    }


    const table =
      djApiReadTableV5_(
        sheet,
        [
          'Timestamp'
        ]
      );


    if (!table) {

      return;

    }


    const headers =
      table.headers;


    const row =
      headers.map(
        function(header) {

          const key =
            djApiCanonV5_(
              header
            );


          if (
            key ===
            'timestamp'
          ) {

            return new Date();

          }


          if (
            key ===
            'type'
          ) {

            return type;

          }


          if (
            key ===
            'message'
          ) {

            return message;

          }


          return '';

        }
      );


    sheet
      .getRange(
        sheet.getLastRow() + 1,
        1,
        1,
        row.length
      )
      .setValues(
        [row]
      );

  } catch (err) {}

}

/* ============================================================
 * ONE-TIME PAYMENT REPAIR
 * ============================================================
 *
 * Membetulkan record pembayaran yang sudah telanjur tersimpan
 * sebelum aturan billing pertama diterapkan.
 *
 * Yang diubah hanya record Tenant + periode yang merupakan
 * bulan pertama kontrak:
 *   Denda = 0
 *   Total_Tagihan = Tarif_Kamar
 *   Selisih disesuaikan
 *   Status terverifikasi dihitung ulang terhadap total baru
 *
 * Tidak menghapus baris, sheet, kolom, file, atau bukti foto.
 * Aman dijalankan satu kali setelah update API.
 * ============================================================
 */
function repairFirstBillingPaymentRecordsV1() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pembayaran'
    );


  if (!sheet) {

    throw new Error(
      'Sheet Pembayaran tidak ditemukan.'
    );

  }


  const headers =
    djApiEnsurePaymentColumnsV5_(
      sheet
    );


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Tenant_ID'
      ]
    );


  if (!table) {

    throw new Error(
      'Header sheet Pembayaran tidak ditemukan.'
    );

  }


  let repaired =
    0;


  table.rows.forEach(
    function(row, index) {

      const paymentId =
        String(
          djApiValueV5_(
            row,
            table.headers,
            [
              'Payment_ID',
              'Pembayaran_ID'
            ]
          ) || ''
        ).trim();


      const tenantId =
        String(
          djApiValueV5_(
            row,
            table.headers,
            [
              'Tenant_ID'
            ]
          ) || ''
        ).trim();


      if (
        !paymentId ||
        !tenantId
      ) {

        return;

      }


      const contract =
        djApiFindContractV5_(
          ss,
          tenantId
        );


      if (!contract) {

        return;

      }


      const period =
        djApiValueV5_(
          row,
          table.headers,
          [
            'Periode',
            'Periode_Pembayaran'
          ]
        );


      const periodDate =
        djApiCoerceDateMonthV5_(
          period
        );


      if (
        !djApiIsFirstBillingPeriodV5_(
          contract.startDate,
          periodDate
        )
      ) {

        return;

      }


      const rent =
        djApiNumberV5_(
          djApiValueV5_(
            row,
            table.headers,
            [
              'Nominal_Sewa',
              'Tarif_Kamar'
            ]
          )
        );


      const paid =
        djApiNumberV5_(
          djApiValueV5_(
            row,
            table.headers,
            [
              'Nominal_Dibayar'
            ]
          )
        );


      const verification =
        String(
          djApiValueV5_(
            row,
            table.headers,
            [
              'Status_Verifikasi'
            ]
          ) || ''
        )
        .trim()
        .toUpperCase();


      const total =
        rent;


      let status =
        String(
          djApiValueV5_(
            row,
            table.headers,
            [
              'Status_Pembayaran'
            ]
          ) || ''
        )
        .trim()
        .toUpperCase();


      if (
        verification ===
        'TERVERIFIKASI'
      ) {

        status =
          paid >= total
            ? 'LUNAS'
            : (
                paid > 0
                  ? 'KURANG BAYAR'
                  : 'BELUM BAYAR'
              );

      }


      const spreadsheetRow =
        table.headerRow +
        1 +
        index;


      djApiUpdateRowV5_(
        sheet,
        spreadsheetRow,
        headers,
        {

          Denda:
            0,

          Denda_Terhitung:
            0,

          Total_Tagihan:
            total,

          Selisih:
            paid -
            total,

          Status_Pembayaran:
            status,

          Last_Sync:
            new Date()

        }
      );


      repaired++;

    }
  );


  SpreadsheetApp.flush();


  Logger.log(
    'Perbaikan pembayaran selesai. Record billing pertama yang diperbaiki: ' +
    repaired
  );

  return {

    ok:
      true,

    repaired:
      repaired

  };

}


/* ============================================================
 * DJ FAMILY KOST ‚Äî CONSOLIDATED API SELF AUDIT V1
 * ============================================================
 * Fungsi ini hanya membaca; tidak mengubah data.
 * ============================================================
 */
function auditDJFamilyKostApiV2Final() {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const requiredSheets = [
    'Kamar',
    'Tenant',
    'Kontrak',
    'Pembayaran',
    'Maintenance',
    'CheckInOut',
    'Pelanggaran',
    'Pendaftaran',
    'Akun_Tenant',
    'Kunjungan',
    'API_Data',
    'Pengaturan'
  ];

  const requiredFunctions = [
    'doPost',
    'djApiSubmitRegistrationV6_',
    'djApiMasterRegistrationsV5_',
    'djApiMasterApproveRegistrationV6_',
    'djApiRejectRegistrationV5_',
    'loginTenantV2_',
    'validateTenantSessionV2_',
    'changeTenantPasswordV2_',
    'djApiSubmitPaymentV5_',
    'djApiVerifyPaymentV5_',
    'djApiSubmitMaintenanceV5_',
    'djApiMaintenanceHistoryV5_',
    'djApiMasterMaintenanceV5_',
    'djApiUpdateMaintenanceV5_',
    'djApiMasterMediaV5_',
    'djApiMasterMediaOpenV5_',
    'djApiSubmitCheckInOutV7_',
    'djApiCheckInOutHistoryV7_',
    'djApiOpenCheckInOutMediaV7_',
    'djApiMasterCheckInOutV7_',
    'djApiMasterDashboardV5_',
    'djApiActivationInfoV1_',
    'djApiSubmitActivationV1_',
    'djApiSaveActivationFileV1_',
    'masterLoginV2_',
    'validateMasterSessionV2_'
  ];

  const missingSheets = requiredSheets.filter(function(name) {
    return !ss.getSheetByName(name);
  });

  const missingFunctions = requiredFunctions.filter(function(name) {
    return typeof globalThis[name] !== 'function';
  });

  const result = {
    ok:
      missingSheets.length === 0 &&
      missingFunctions.length === 0,
    missingSheets: missingSheets,
    missingFunctions: missingFunctions,
    totalSheetsChecked: requiredSheets.length,
    totalFunctionsChecked: requiredFunctions.length,
    checkedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result, null, 2));
  return result;
}

/* ============================================================
 * STEP 5 ‚Äî READ ONLY ACCOUNT/LIFECYCLE AUDIT
 * ============================================================
 */
function auditTenantLifecycleV1(
  tenantId
) {

  tenantId =
    String(
      tenantId || ''
    )
    .trim()
    .toUpperCase();

  if (!tenantId) {
    throw new Error(
      'Tenant ID wajib diisi.'
    );
  }

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  const accountState =
    djApiGetTenantAccountStateV1_(
      tenantId
    );

  let tenantStatus = '';
  let tenantRoom = '';
  let contractStatuses = [];

  const tenantSheet =
    ss.getSheetByName('Tenant');

  if (tenantSheet) {
    const table =
      djApiReadTableV5_(
        tenantSheet,
        ['Tenant_ID']
      );
    const row =
      table
        ? djApiFindRowV5_(
            table,
            ['Tenant_ID'],
            tenantId
          )
        : -1;
    if (row > 0) {
      const values =
        table.rows[
          row - table.headerRow - 1
        ];
      tenantStatus =
        String(
          djApiValueV5_(
            values,
            table.headers,
            ['Status_Tenant']
          ) || ''
        ).trim();
      tenantRoom =
        String(
          djApiValueV5_(
            values,
            table.headers,
            ['No_Kamar']
          ) || ''
        ).trim();
    }
  }

  const contractSheet =
    ss.getSheetByName('Kontrak');

  if (contractSheet) {
    const table =
      djApiReadTableV5_(
        contractSheet,
        ['Kontrak_ID']
      );
    if (table) {
      table.rows.forEach(function(row) {
        const rowTenant =
          String(
            djApiValueV5_(
              row,
              table.headers,
              ['Tenant_ID']
            ) || ''
          ).trim().toUpperCase();
        if (rowTenant === tenantId) {
          contractStatuses.push(
            String(
              djApiValueV5_(
                row,
                table.headers,
                ['Status_Kontrak']
              ) || ''
            ).trim()
          );
        }
      });
    }
  }

  const result = {
    tenantId: tenantId,
    akunDitemukan: accountState.exists,
    statusAkun: accountState.status,
    statusTenant: tenantStatus,
    kamar: tenantRoom,
    statusKontrak: contractStatuses,
    checkedAt: new Date().toISOString()
  };

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

  return result;

}
/* ============================================================
 * APPROVAL EMAIL ‚Äî TENANT ACTIVATION
 * ============================================================
 */

function djApiSendApprovalEmailV1_(
  email,
  name,
  registrationId,
  phone,
  finalRoom,
  roomPrice
) {

  const activationUrl =
    'https://lipinazzz-sudo.github.io/KOST-DJ/aktivasi.html';


  const subject =
    'DJ Family Kost ‚Äî Pendaftaran Anda Disetujui';


  const body = [

    'Yth. ' +
      String(
        name || ''
      ).trim() +
      ',',


    '',


    'Pendaftaran Anda di DJ Family Kost telah disetujui oleh pengelola.',


    '',


    'Pendaftaran ID: ' +
      registrationId,


    'Nomor WhatsApp terdaftar: ' +
      phone,


    'Kamar final: ' +
      finalRoom,


    'Harga sewa: Rp' +
      Number(
        roomPrice || 0
      )
      .toLocaleString(
        'id-ID'
      ) +
      ' / bulan',


    '',


    'Untuk melanjutkan proses aktivasi akun tenant, buka:',


    activationUrl,


    '',


    'Pada halaman aktivasi, masukkan:',


    '1. Pendaftaran ID',


    '2. Nomor WhatsApp yang digunakan saat mendaftar',


    '',


    'Setelah identitas, KTP, persetujuan aturan, dan tanda tangan selesai, sistem akan membuat Tenant ID, Kontrak ID, dan password sementara.',


    '',


    'Simpan email ini sampai proses aktivasi selesai.',


    '',


    'DJ Family Kost'

  ].join(
    '\n'
  );


  if (
    !String(
      email || ''
    ).trim()
  ) {

    throw new Error(
      'Email tenant kosong.'
    );

  }


  MailApp.sendEmail({

    to:
      String(
        email
      ).trim(),

    subject:
      subject,

    body:
      body

  });

}
function authorizeDjFamilyKostEmailV1() {

  const quota =
    MailApp.getRemainingDailyQuota();


  Logger.log(
    'Sisa kuota email: ' +
    quota
  );


  return quota;

}
/* ============================================================
 * TEST EMAIL DJ FAMILY KOST
 * ============================================================
 */

function testEmailDjFamilyKostV1() {

  const emailTujuan =
    'antshoes77@gmail.com';


  MailApp.sendEmail({

    to:
      emailTujuan,

    subject:
      'DJ Family Kost ‚Äî Test Email',

    body:
      [
        'Ini adalah test email dari sistem DJ Family Kost.',

        '',

        'Email ini digunakan untuk memastikan layanan email Google Apps Script berjalan dengan normal.',

        '',

        'Jika Anda menerima email ini, koneksi email sudah berhasil.',

        '',

        'DJ Family Kost'
      ].join(
        '\n'
      )

  });


  Logger.log(
    'Test email dikirim ke: ' +
    emailTujuan
  );

}
/* ============================================================
 * TEST / RESEND APPROVAL EMAIL
 * TIDAK MENGUBAH DATA OPERASIONAL
 * ============================================================
 */

function testResendLatestApprovalEmailV1() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pendaftaran'
    );


  if (!sheet) {

    throw new Error(
      'Sheet Pendaftaran tidak ditemukan.'
    );

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Pendaftaran_ID'
      ]
    );


  if (!table) {

    throw new Error(
      'Struktur sheet Pendaftaran tidak dapat dibaca.'
    );

  }


  let selectedRow =
    null;


  let selectedRowNumber =
    -1;


  /*
   * Cari pendaftaran TERAKHIR
   * yang sudah disetujui dan
   * menunggu aktivasi akun.
   */

  for (
    let i = table.rows.length - 1;
    i >= 0;
    i--
  ) {

    const row =
      table.rows[i];


    const status =
      String(
        djApiValueV5_(
          row,
          table.headers,
          [
            'Status_Pendaftaran'
          ]
        ) || ''
      )
      .trim()
      .toUpperCase();


    if (
      status ===
      'MENUNGGU AKTIVASI AKUN'
    ) {

      selectedRow =
        row;


      selectedRowNumber =
        table.headerRow +
        1 +
        i;


      break;

    }

  }


  if (
    !selectedRow
  ) {

    throw new Error(
      'Tidak ditemukan pendaftaran dengan status MENUNGGU AKTIVASI AKUN.'
    );

  }


  const registrationId =
    String(
      djApiValueV5_(
        selectedRow,
        table.headers,
        [
          'Pendaftaran_ID'
        ]
      ) || ''
    ).trim();


  const name =
    String(
      djApiValueV5_(
        selectedRow,
        table.headers,
        [
          'Nama_Lengkap'
        ]
      ) || ''
    ).trim();


  const phone =
    String(
      djApiValueV5_(
        selectedRow,
        table.headers,
        [
          'No_HP'
        ]
      ) || ''
    ).trim();


  const email =
    String(
      djApiValueV5_(
        selectedRow,
        table.headers,
        [
          'Email'
        ]
      ) || ''
    ).trim();


  const finalRoom =
    String(
      djApiValueV5_(
        selectedRow,
        table.headers,
        [
          'Kamar_Final',
          'No_Kamar'
        ]
      ) || ''
    ).trim();


  const roomPrice =
    djApiNumberV5_(
      djApiValueV5_(
        selectedRow,
        table.headers,
        [
          'Harga_Final'
        ]
      ) || 0
    );


  if (!email) {

    throw new Error(
      'Email pada pendaftaran ' +
      registrationId +
      ' kosong.'
    );

  }


  if (!registrationId) {

    throw new Error(
      'Pendaftaran ID tidak ditemukan.'
    );

  }


  if (!phone) {

    throw new Error(
      'Nomor WhatsApp tidak ditemukan.'
    );

  }


  Logger.log(
    '===================================='
  );


  Logger.log(
    'TEST RESEND APPROVAL EMAIL'
  );


  Logger.log(
    'Baris: ' +
    selectedRowNumber
  );


  Logger.log(
    'Pendaftaran ID: ' +
    registrationId
  );


  Logger.log(
    'Nama: ' +
    name
  );


  Logger.log(
    'Email: ' +
    email
  );


  Logger.log(
    'No HP: ' +
    phone
  );


  Logger.log(
    'Kamar: ' +
    finalRoom
  );


  Logger.log(
    'Harga: ' +
    roomPrice
  );


  Logger.log(
    '===================================='
  );


  /*
   * Kirim email menggunakan helper
   * produksi yang sama dengan approval.
   */

  djApiSendApprovalEmailV1_(
    email,
    name,
    registrationId,
    phone,
    finalRoom,
    roomPrice
  );


  Logger.log(
    'EMAIL BERHASIL DIPERINTAHKAN UNTUK DIKIRIM.'
  );


  return {

    ok:
      true,

    registrationId:
      registrationId,

    name:
      name,

    email:
      email,

    phone:
      phone,

    room:
      finalRoom,

    message:
      'Email approval berhasil dikirim ulang ke alamat email pendaftaran.'

  };


}
/* ============================================================
 * DIAGNOSTIC EMAIL — TANPA MENGUBAH DATA PENDAFTARAN
 * ============================================================
 */

function diagnosticApprovalEmailV2() {

  const ss =
    SpreadsheetApp.getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pendaftaran'
    );


  if (!sheet) {

    throw new Error(
      'Sheet Pendaftaran tidak ditemukan.'
    );

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Pendaftaran_ID'
      ]
    );


  if (!table) {

    throw new Error(
      'Struktur sheet Pendaftaran tidak dapat dibaca.'
    );

  }


  let row =
    null;


  for (
    let i = table.rows.length - 1;
    i >= 0;
    i--
  ) {

    const candidate =
      table.rows[i];


    const status =
      String(
        djApiValueV5_(
          candidate,
          table.headers,
          [
            'Status_Pendaftaran'
          ]
        ) || ''
      )
      .trim()
      .toUpperCase();


    if (
      status ===
      'MENUNGGU AKTIVASI AKUN'
    ) {

      row =
        candidate;

      break;

    }

  }


  if (!row) {

    throw new Error(
      'Tidak ditemukan pendaftaran dummy yang masih MENUNGGU AKTIVASI AKUN.'
    );

  }


  const registrationId =
    String(
      djApiValueV5_(
        row,
        table.headers,
        [
          'Pendaftaran_ID'
        ]
      ) || ''
    ).trim();


  const name =
    String(
      djApiValueV5_(
        row,
        table.headers,
        [
          'Nama_Lengkap'
        ]
      ) || ''
    ).trim();


  const emailTarget =
    String(
      djApiValueV5_(
        row,
        table.headers,
        [
          'Email'
        ]
      ) || ''
    ).trim();


  const phone =
    String(
      djApiValueV5_(
        row,
        table.headers,
        [
          'No_HP'
        ]
      ) || ''
    ).trim();


  const finalRoom =
    String(
      djApiValueV5_(
        row,
        table.headers,
        [
          'Kamar_Final',
          'No_Kamar'
        ]
      ) || ''
    ).trim();


  const roomPrice =
    djApiNumberV5_(
      djApiValueV5_(
        row,
        table.headers,
        [
          'Harga_Final'
        ]
      ) || 0
    );


  if (!emailTarget) {

    throw new Error(
      'Email pendaftar kosong.'
    );

  }


  const sender =
    Session
      .getEffectiveUser()
      .getEmail();


  const quota =
    MailApp
      .getRemainingDailyQuota();


  Logger.log(
    '========================================'
  );

  Logger.log(
    'DIAGNOSTIC EMAIL DJ FAMILY KOST'
  );

  Logger.log(
    'Pengirim efektif: ' +
    sender
  );

  Logger.log(
    'Kuota email tersisa: ' +
    quota
  );

  Logger.log(
    'Pendaftaran ID: ' +
    registrationId
  );

  Logger.log(
    'Nama: ' +
    name
  );

  Logger.log(
    'Target asli: ' +
    emailTarget
  );

  Logger.log(
    '========================================'
  );


  /*
   * TES 1
   * Kirim ke alamat dummy yang sedang bermasalah.
   */

  MailApp.sendEmail({

    to:
      emailTarget,

    subject:
      'DJ Family Kost — Diagnostic Test',

    body:
      [
        'Ini adalah email diagnostic dari sistem DJ Family Kost.',
        '',
        'Pendaftaran ID: ' + registrationId,
        'Nama: ' + name,
        '',
        'Email ini dikirim untuk pengujian pengiriman email otomatis.',
        '',
        'DJ Family Kost'
      ].join(
        '\n'
      )

  });


  Logger.log(
    'TES 1 selesai → ' +
    emailTarget
  );


  /*
   * TES 2
   * Kirim email yang sama ke alamat Anda
   * yang sebelumnya sudah terbukti menerima email.
   */

  MailApp.sendEmail({

    to:
      'antshoes77@gmail.com',

    subject:
      'DJ Family Kost — Diagnostic Copy',

    body:
      [
        'Ini adalah salinan diagnostic email DJ Family Kost.',
        '',
        'Target asli: ' + emailTarget,
        'Pendaftaran ID: ' + registrationId,
        'Nama: ' + name,
        '',
        'Email ini digunakan untuk membandingkan pengiriman ke dua alamat.',
        '',
        'DJ Family Kost'
      ].join(
        '\n'
      )

  });


  Logger.log(
    'TES 2 selesai → antshoes77@gmail.com'
  );


  /*
   * Panggil helper produksi juga.
   * TIDAK mengubah data.
   */

  djApiSendApprovalEmailV1_(
    emailTarget,
    name,
    registrationId,
    phone,
    finalRoom,
    roomPrice
  );


  Logger.log(
    'TES 3 selesai → helper approval produksi'
  );


  Logger.log(
    '========================================'
  );

  Logger.log(
    'SEMUA PERINTAH EMAIL SELESAI TANPA ERROR'
  );

  Logger.log(
    '========================================'
  );


  return {

    ok:
      true,

    sender:
      sender,

    quota:
      quota,

    target:
      emailTarget,

    registrationId:
      registrationId,

    message:
      'Diagnostic email selesai. Periksa target dan antshoes77@gmail.com.'

  };

}
/* ============================================================
 * KIRIM ULANG EMAIL AKTIVASI TENANT
 * TIDAK MENGUBAH STATUS TENANT / KAMAR / KONTRAK
 * ============================================================
 */

function kirimEmailAktivasiTenantV1() {

  const ui =
    SpreadsheetApp.getUi();


  const response =
    ui.prompt(
      'Kirim Email Aktivasi Tenant',
      'Masukkan Pendaftaran ID tenant yang sudah disetujui:',
      ui.ButtonSet.OK_CANCEL
    );


  if (
    response.getSelectedButton() !==
    ui.Button.OK
  ) {

    return;

  }


  const registrationId =
    String(
      response.getResponseText() ||
      ''
    ).trim();


  if (!registrationId) {

    throw new Error(
      'Pendaftaran ID wajib diisi.'
    );

  }


  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Pendaftaran'
    );


  if (!sheet) {

    throw new Error(
      'Sheet Pendaftaran tidak ditemukan.'
    );

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Pendaftaran_ID'
      ]
    );


  if (!table) {

    throw new Error(
      'Struktur sheet Pendaftaran tidak dapat dibaca.'
    );

  }


  const rowIndex =
    djApiFindRowV5_(
      table,
      [
        'Pendaftaran_ID'
      ],
      registrationId
    );


  if (
    rowIndex < 0
  ) {

    throw new Error(
      'Pendaftaran tidak ditemukan: ' +
      registrationId
    );

  }


  const headers =
    djApiFindHeadersV5_(
      sheet
    );


  const row =
    sheet
      .getRange(
        rowIndex,
        1,
        1,
        headers.length
      )
      .getValues()[0];


  const status =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Status_Pendaftaran'
        ]
      ) || ''
    )
    .trim()
    .toUpperCase();


  if (
    status !==
    'MENUNGGU AKTIVASI AKUN'
  ) {

    throw new Error(
      'Tenant belum berada pada status MENUNGGU AKTIVASI AKUN. Status saat ini: ' +
      (status || 'KOSONG')
    );

  }


  const name =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Nama_Lengkap'
        ]
      ) || ''
    ).trim();


  const email =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Email'
        ]
      ) || ''
    ).trim();


  const phone =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'No_HP'
        ]
      ) || ''
    ).trim();


  const finalRoom =
    String(
      djApiValueV5_(
        row,
        headers,
        [
          'Kamar_Final',
          'No_Kamar'
        ]
      ) || ''
    ).trim();


  const roomPrice =
    djApiNumberV5_(
      djApiValueV5_(
        row,
        headers,
        [
          'Harga_Final'
        ]
      ) || 0
    );


  if (!email) {

    throw new Error(
      'Email tenant kosong.'
    );

  }


  if (!phone) {

    throw new Error(
      'Nomor WhatsApp tenant kosong.'
    );

  }


  djApiSendApprovalEmailV1_(
    email,
    name,
    registrationId,
    phone,
    finalRoom,
    roomPrice
  );


  djApiEnsureSheetFieldsV5_(
    sheet,
    [
      'Email_Persetujuan_Status',
      'Email_Persetujuan_Tanggal'
    ]
  );


  const latestHeaders =
    djApiFindHeadersV5_(
      sheet
    );


  djApiUpdateRowV5_(
    sheet,
    rowIndex,
    latestHeaders,
    {

      Email_Persetujuan_Status:
        'TERKIRIM',

      Email_Persetujuan_Tanggal:
        new Date()

    }
  );


  SpreadsheetApp.flush();


  ui.alert(

    'EMAIL AKTIVASI TERKIRIM\n\n' +

    'Pendaftaran ID: ' +
    registrationId +

    '\n' +

    'Nama: ' +
    name +

    '\n' +

    'Email: ' +
    email +

    '\n' +

    'No. WhatsApp: ' +
    phone +

    '\n' +

    'Kamar: ' +
    finalRoom

  );

}
/* ============================================================
 * EMAIL PAYMENT VERIFIED — SEND ONCE
 * ============================================================
 *
 * Fungsi baru.
 *
 * TUJUAN:
 * - Mengirim email hanya ketika pembayaran benar-benar LUNAS.
 * - Mencegah email LUNAS terkirim dua kali untuk Payment_ID
 *   yang sama.
 * - Tidak mengubah sheet Pembayaran.
 *
 * ============================================================
 */
function djApiSendPaymentVerifiedEmailOnceV1_(
  paymentId,
  tenantId,
  room,
  period,
  paid,
  total
) {

  const cleanPaymentId =
    String(
      paymentId || ''
    ).trim();

  const cleanTenantId =
    String(
      tenantId || ''
    ).trim();

  if (!cleanPaymentId) {

    return {

      ok: false,

      status: 'GAGAL',

      error:
        'Payment ID kosong.'

    };

  }

  if (!cleanTenantId) {

    return {

      ok: false,

      status: 'GAGAL',

      error:
        'Tenant ID kosong.'

    };

  }

  const lock =
    LockService.getScriptLock();

  lock.waitLock(10000);

  try {

    const props =
      PropertiesService
        .getScriptProperties();

    const propertyKey =
      'DJ39_EMAIL_LUNAS_SENT_' +
      cleanPaymentId;

    const alreadySent =
      props.getProperty(
        propertyKey
      );

    if (alreadySent) {

      return {

        ok: true,

        status:
          'SUDAH TERKIRIM',

        duplicate:
          true,

        paymentId:
          cleanPaymentId

      };

    }

    const emailResult =
      sendPaymentVerifiedEmailDJ39(

        cleanTenantId,

        {

          room:
            String(
              room || ''
            ).trim(),

          period:
            String(
              period || ''
            ).trim(),

          paid:
            Number(
              paid || 0
            ),

          total:
            Number(
              total || 0
            )

        }

      );

    props.setProperty(
      propertyKey,
      new Date().toISOString()
    );

    return {

      ok: true,

      status:
        'TERKIRIM',

      duplicate:
        false,

      paymentId:
        cleanPaymentId,

      notificationId:
        emailResult &&
        emailResult.notificationId
          ? emailResult.notificationId
          : ''

    };

  } catch (err) {

    return {

      ok: false,

      status:
        'GAGAL',

      paymentId:
        cleanPaymentId,

      error:
        String(
          err &&
          err.message
            ? err.message
            : err
        ).slice(
          0,
          500
        )

    };

  } finally {

    lock.releaseLock();

  }

}
/* ============================================================
 * AI AGENT EXECUTOR COMPATIBILITY BRIDGE V1
 * ============================================================
 * Fungsi ini hanya menjembatani perbedaan nama executor:
 *
 *   aiAgentExecuteV1_()
 *              ↓
 *   aiAgentExecuteV1()
 *
 * Tidak membuat business logic baru.
 * Tidak menulis langsung ke sheet bisnis.
 * ============================================================
 */

function aiAgentExecuteV1_(
  item,
  command,
  masterId,
  options
) {

  if (
    typeof aiAgentExecuteV1 === 'function'
  ) {

    return aiAgentExecuteV1(
      item,
      command,
      masterId,
      options
    );

  }

  throw new Error(
    'Executor AI Agent tidak tersedia: aiAgentExecuteV1(). Pastikan AI_AGENT_CORE_V1.gs sudah terpasang pada project Apps Script yang sama.'
  );

}
/* ============================================================
 * AI REGISTRATION EXECUTOR COMPATIBILITY BRIDGE V1
 * ============================================================
 * Menjembatani:
 *
 *   aiAgentRegistrationApproveV1_()
 *                 ↓
 *   aiAgentRegistrationApproveV1()
 *
 * Tidak membuat business logic baru.
 * Approval tetap dijalankan oleh existing Registration Engine.
 * ============================================================
 */

function aiAgentRegistrationApproveV1_(
  item,
  masterId,
  options
) {

  if (
    typeof aiAgentRegistrationApproveV1 === 'function'
  ) {

    return aiAgentRegistrationApproveV1(
      item,
      masterId,
      options
    );

  }

  throw new Error(
    'Executor registration AI tidak tersedia: aiAgentRegistrationApproveV1(). Pastikan AI_AGENT_CORE_V1.gs sudah terpasang pada project Apps Script yang sama.'
  );

}