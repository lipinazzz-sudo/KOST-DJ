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

          paidDate:
            djApiParseDateV7_(
              djApiValueV5_(
                table.rows[i],
                table.headers,
                [
                  'Tanggal_Pembayaran',
                  'Tanggal_Bayar'
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
   * Denda Tenant mengikuti aturan pusat:
   * - tanggal 2 relatif terhadap jatuh tempo tanggal 1 = Rp25.000
   * - tanggal 5+ = total Rp50.000
   *
   * Untuk pembayaran parsial/belum lunas, referensi adalah hari ini.
   * Untuk pembayaran yang sudah menutup sewa, referensi memakai
   * tanggal pembayaran agar denda tidak berubah hanya karena
   * Master membuka dashboard beberapa hari kemudian.
   */
  let fineReferenceDate =
    new Date();

  if (
    payment &&
    payment.paid >= actualRent &&
    payment.paidDate
  ) {
    fineReferenceDate =
      payment.paidDate;
  }

  const displayedFine =
    firstBillingPeriod
      ? 0
      : djApiCalculateTenantFineV1_(
          fineReferenceDate,
          due
        );


  const displayedTotal =
    actualRent +
    displayedFine;


  const displayedShortfall =
    Math.max(
      0,
      displayedTotal -
      (
        payment
          ? payment.paid
          : 0
      )
    );


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

    shortfall:
      displayedShortfall,

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
        daysLate >= 5
      ) {

        fine =
          50000;

      } else if (
        daysLate >= 3
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

/* ============================================================
 * TENANT BILLING — CURRENT LATE FEE
 * ============================================================
 * Aturan tetap:
 *   tanggal 2  = Rp25.000
 *   tanggal 5+ = Rp50.000 total
 *   setelah tanggal 5 tidak bertambah.
 * ============================================================
 */
function djApiCalculateTenantFineV1_(
  referenceDate,
  dueDate
) {

  const reference =
    djApiParseDateV7_(referenceDate) ||
    new Date();

  const due =
    djApiParseDateV7_(dueDate);

  if (!due) {
    return 0;
  }

  const referenceDay =
    new Date(
      reference.getFullYear(),
      reference.getMonth(),
      reference.getDate()
    );

  const dueDay =
    new Date(
      due.getFullYear(),
      due.getMonth(),
      due.getDate()
    );

  const lateDays =
    Math.floor(
      (
        referenceDay.getTime() -
        dueDay.getTime()
      ) /
      86400000
    );

  if (lateDays < 1) {
    return 0;
  }

  return lateDays >= 4
    ? 50000
    : 25000;
}
