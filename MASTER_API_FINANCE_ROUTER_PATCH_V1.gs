/* ============================================================
 * DJ FAMILY KOST — MASTER ROUTER PATCH KEUANGAN V1
 * ============================================================
 * Tambahkan dua blok ini di dalam djApiMasterRouterV5_(),
 * setelah validasi session Master dan SEBELUM MASTER LOGOUT.
 * ============================================================ */


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
