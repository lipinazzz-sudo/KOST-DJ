/* ============================================================
 * DJ FAMILY KOST — KEUANGAN / FINANCIAL V1
 * ============================================================
 * Tujuan:
 * - Laporan keuangan mulai 2027-01-01.
 * - Pendapatan diakui dari pembayaran yang sudah TERVERIFIKASI,
 *   berdasarkan Periode pembayaran.
 * - Uang masuk dihitung terpisah berdasarkan Tanggal_Bayar.
 * - Pengeluaran umum dicatat di sheet "Pengeluaran".
 * - Biaya Maintenance dibaca otomatis dari sheet "Maintenance".
 * - Deposit tidak dihitung sebagai pendapatan.
 *
 * ROUTES:
 *   masterfinance
 *   mastersaveexpense
 *
 * SETUP:
 *   Jalankan setupFinanceSheetV1() sekali untuk membuat sheet.
 * ============================================================ */


/* ============================================================
 * CONFIG
 * ============================================================ */

const DJ_FINANCE_START_YEAR_V1_ = 2027;


/* ============================================================
 * MASTER FINANCE
 * ============================================================ */

function djApiMasterFinanceV1_(
  year,
  month
) {

  const targetYear =
    Number(year) || 2027;

  const targetMonth =
    Number(month) || 1;

  if (
    targetYear <
    DJ_FINANCE_START_YEAR_V1_
  ) {

    throw new Error(
      'Laporan keuangan baru dimulai 1 Januari 2027.'
    );

  }

  if (
    targetMonth < 1 ||
    targetMonth > 12
  ) {

    throw new Error(
      'Bulan laporan tidak valid.'
    );

  }


  const dataset =
    djFinanceBuildDatasetV1_(
      targetYear,
      targetMonth
    );


  const summary =
    djFinanceComputeMonthSummaryV1_(
      dataset,
      targetYear,
      targetMonth
    );


  const monthly = [];

  for (
    let m = 1;
    m <= 12;
    m++
  ) {

    monthly.push(
      djFinanceComputeMonthSummaryV1_(
        dataset,
        targetYear,
        m
      )
    );

  }


  const annual =
    djFinanceAnnualSummaryV1_(
      monthly,
      targetYear
    );


  const floorAnalysis =
    djFinanceFloorAnalysisV1_(
      dataset,
      targetYear
    );


  const roomAnalysis =
    djFinanceRoomAnalysisV1_(
      dataset,
      targetYear
    );


  return {

    period: {

      year:
        targetYear,

      month:
        targetMonth,

      label:
        djFinanceMonthLabelV1_(
          targetYear,
          targetMonth
        ),

      start:
        Utilities.formatDate(
          new Date(
            targetYear,
            targetMonth - 1,
            1
          ),
          Session.getScriptTimeZone(),
          'yyyy-MM-dd'
        ),

      end:
        Utilities.formatDate(
          new Date(
            targetYear,
            targetMonth,
            0
          ),
          Session.getScriptTimeZone(),
          'yyyy-MM-dd'
        )

    },

    summary:
      summary,

    monthly:
      monthly,

    annual:
      annual,

    floorAnalysis:
      floorAnalysis,

    roomAnalysis:
      roomAnalysis,

    expenseBreakdown:
      summary.expenseBreakdown,

    recent:
      summary.recent,

    generatedAt:
      new Date().toISOString()

  };

}


/* ============================================================
 * DATASET
 * ============================================================ */

function djFinanceBuildDatasetV1_(
  targetYear,
  targetMonth
) {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const paymentSheet =
    ss.getSheetByName(
      'Pembayaran'
    );

  if (paymentSheet) {

    djApiEnsurePaymentColumnsV5_(
      paymentSheet
    );

  }

  const maintenanceSheet =
    ss.getSheetByName(
      'Maintenance'
    );

  const contractSheet =
    ss.getSheetByName(
      'Kontrak'
    );

  const roomSheet =
    ss.getSheetByName(
      'Kamar'
    );

  const tenantSheet =
    ss.getSheetByName(
      'Tenant'
    );

  const expenseSheet =
    djFinanceEnsureExpenseSheetV1_();


  const paymentTable =
    paymentSheet
      ? djApiReadTableV5_(
          paymentSheet,
          ['Tenant_ID']
        )
      : null;


  const maintenanceTable =
    maintenanceSheet
      ? djApiReadTableV5_(
          maintenanceSheet,
          ['Maintenance_ID']
        )
      : null;


  const contractTable =
    contractSheet
      ? djApiReadTableV5_(
          contractSheet,
          ['Tenant_ID']
        )
      : null;


  const roomTable =
    roomSheet
      ? djApiReadTableV5_(
          roomSheet,
          ['No_Kamar']
        )
      : null;


  const tenantTable =
    tenantSheet
      ? djApiReadTableV5_(
          tenantSheet,
          ['Tenant_ID']
        )
      : null;


  const expenseTable =
    expenseSheet
      ? djApiReadTableV5_(
          expenseSheet,
          ['Pengeluaran_ID']
        )
      : null;


  const payments = [];

  const allPayments = [];


  if (paymentTable) {

    paymentTable.rows.forEach(
      function(row) {

        const verification =
          String(
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Status_Verifikasi'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase();


        const rent =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Nominal_Sewa',
                'Tarif_Kamar'
              ]
            )
          );


        const fine =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Denda',
                'Denda_Terhitung'
              ]
            )
          );


        const paidField =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Nominal_Dibayar'
              ]
            )
          );


        const storedTotal =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Total_Tagihan'
              ]
            )
          );


        const total =
          storedTotal > 0
            ? storedTotal
            : rent + fine;


        const paid =
          paidField > 0
            ? paidField
            : (
                verification ===
                'TERVERIFIKASI'
                  ? total
                  : 0
              );


        const payment = {

          paymentId:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Payment_ID',
                'Pembayaran_ID'
              ]
            ),

          tenantId:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Tenant_ID'
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

          period:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Periode',
                'Periode_Pembayaran'
              ]
            ),

          dueDate:
            djFinanceDateV1_(
              djApiValueV5_(
                row,
                paymentTable.headers,
                [
                  'Tanggal_Jatuh_Tempo',
                  'Jatuh_Tempo'
                ]
              )
            ),

          paidDate:
            djFinanceDateV1_(
              djApiValueV5_(
                row,
                paymentTable.headers,
                [
                  'Tanggal_Bayar'
                ]
              )
            ),

          verifiedDate:
            djFinanceDateV1_(
              djApiValueV5_(
                row,
                paymentTable.headers,
                [
                  'Tanggal_Verifikasi'
                ]
              )
            ),

          rent:
            rent,

          fine:
            fine,

          paid:
            paid,

          total:
            total,

          status:
            String(
              djApiValueV5_(
                row,
                paymentTable.headers,
                [
                  'Status_Pembayaran'
                ]
              ) || ''
            )
            .trim()
            .toUpperCase(),

          verification:
            verification,

          name:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Nama_Tenant',
                'Nama_Lengkap'
              ]
            ),

          note:
            djApiValueV5_(
              row,
              paymentTable.headers,
              [
                'Catatan',
                'Keterangan'
              ]
            )

        };


        /*
         * Semua record pembayaran disimpan untuk analisis
         * status tagihan. Pendapatan tetap hanya menggunakan
         * pembayaran yang sudah TERVERIFIKASI.
         */

        allPayments.push(
          payment
        );


        if (
          verification !==
          'TERVERIFIKASI'
        ) {

          return;

        }


        payments.push(
          payment
        );

      }
    );

  }


  const tenants = [];


  if (tenantTable) {

    tenantTable.rows.forEach(
      function(row) {

        const tenantId =
          String(
            djApiValueV5_(
              row,
              tenantTable.headers,
              [
                'Tenant_ID'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase();


        const room =
          String(
            djApiValueV5_(
              row,
              tenantTable.headers,
              [
                'No_Kamar'
              ]
            ) || ''
          )
          .trim();


        if (
          !tenantId ||
          !room
        ) {

          return;

        }


        tenants.push({

          tenantId:
            tenantId,

          name:
            String(
              djApiValueV5_(
                row,
                tenantTable.headers,
                [
                  'Nama_Lengkap',
                  'Nama_Tenant'
                ]
              ) || ''
            )
            .trim(),

          room:
            room,

          status:
            String(
              djApiValueV5_(
                row,
                tenantTable.headers,
                [
                  'Status_Tenant',
                  'Status'
                ]
              ) || ''
            )
            .trim()
            .toUpperCase()

        });

      }
    );

  }


  const maintenance = [];


  if (maintenanceTable) {

    maintenanceTable.rows.forEach(
      function(row) {

        const cost =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              maintenanceTable.headers,
              [
                'Biaya'
              ]
            )
          );


        if (
          cost <= 0
        ) {

          return;

        }


        const completedDate =
          djFinanceDateV1_(
            djApiValueV5_(
              row,
              maintenanceTable.headers,
              [
                'Tanggal_Selesai'
              ]
            )
          );


        const reportedDate =
          djFinanceDateV1_(
            djApiValueV5_(
              row,
              maintenanceTable.headers,
              [
                'Tanggal_Lapor'
              ]
            )
          );


        maintenance.push({

          id:
            djApiValueV5_(
              row,
              maintenanceTable.headers,
              [
                'Maintenance_ID'
              ]
            ),

          date:
            completedDate ||
            reportedDate,

          room:
            djApiValueV5_(
              row,
              maintenanceTable.headers,
              [
                'No_Kamar'
              ]
            ),

          category:
            djApiValueV5_(
              row,
              maintenanceTable.headers,
              [
                'Kategori'
              ]
            ),

          description:
            djApiValueV5_(
              row,
              maintenanceTable.headers,
              [
                'Masalah',
                'Deskripsi'
              ]
            ),

          cost:
            cost

        });

      }
    );

  }


  const generalExpenses = [];


  if (expenseTable) {

    expenseTable.rows.forEach(
      function(row) {

        const amount =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              expenseTable.headers,
              [
                'Nominal',
                'Jumlah',
                'Amount'
              ]
            )
          );


        if (
          amount <= 0
        ) {

          return;

        }


        generalExpenses.push({

          id:
            djApiValueV5_(
              row,
              expenseTable.headers,
              [
                'Pengeluaran_ID'
              ]
            ),

          date:
            djFinanceDateV1_(
              djApiValueV5_(
                row,
                expenseTable.headers,
                [
                  'Tanggal'
                ]
              )
            ),

          category:
            djApiValueV5_(
              row,
              expenseTable.headers,
              [
                'Kategori'
              ]
            ),

          description:
            djApiValueV5_(
              row,
              expenseTable.headers,
              [
                'Keterangan',
                'Deskripsi'
              ]
            ),

          room:
            djApiValueV5_(
              row,
              expenseTable.headers,
              [
                'No_Kamar'
              ]
            ),

          vendor:
            djApiValueV5_(
              row,
              expenseTable.headers,
              [
                'Vendor'
              ]
            ),

          amount:
            amount,

          method:
            djApiValueV5_(
              row,
              expenseTable.headers,
              [
                'Metode_Pembayaran'
              ]
            )

        });

      }
    );

  }


  const contracts = [];


  if (contractTable) {

    contractTable.rows.forEach(
      function(row) {

        const status =
          String(
            djApiValueV5_(
              row,
              contractTable.headers,
              [
                'Status_Kontrak'
              ]
            ) || ''
          )
          .trim()
          .toUpperCase();


        if (
          status ===
          'BATAL'
        ) {

          return;

        }


        contracts.push({

          tenantId:
            djApiValueV5_(
              row,
              contractTable.headers,
              [
                'Tenant_ID'
              ]
            ),

          room:
            djApiValueV5_(
              row,
              contractTable.headers,
              [
                'No_Kamar'
              ]
            ),

          startDate:
            djFinanceDateV1_(
              djApiValueV5_(
                row,
                contractTable.headers,
                [
                  'Tanggal_Mulai'
                ]
              )
            ),

          endDate:
            djFinanceDateV1_(
              djApiValueV5_(
                row,
                contractTable.headers,
                [
                  'Tanggal_Berakhir'
                ]
              )
            ),

          monthlyRent:
            djApiNumberV5_(
              djApiValueV5_(
                row,
                contractTable.headers,
                [
                  'Harga_Bulan',
                  'Nominal_Sewa',
                  'Tarif_Kamar'
                ]
              )
            )

        });

      }
    );

  }


  const rooms = [];


  if (roomTable) {

    roomTable.rows.forEach(
      function(row) {

        const price =
          djApiNumberV5_(
            djApiValueV5_(
              row,
              roomTable.headers,
              [
                'Harga_Bulan',
                'Harga'
              ]
            )
          );


        rooms.push({

          number:
            djApiValueV5_(
              row,
              roomTable.headers,
              [
                'No_Kamar'
              ]
            ),

          status:
            String(
              djApiValueV5_(
                row,
                roomTable.headers,
                [
                  'Status'
                ]
              ) || ''
            )
            .trim()
            .toUpperCase(),

          price:
            price

        });

      }
    );

  }


  return {

    payments:
      payments,

    allPayments:
      allPayments,

    maintenance:
      maintenance,

    generalExpenses:
      generalExpenses,

    tenants:
      tenants,

    contracts:
      contracts,

    rooms:
      rooms

  };

}


/* ============================================================
 * MONTH SUMMARY
 * ============================================================ */

function djFinanceComputeMonthSummaryV1_(
  dataset,
  year,
  month
) {

  const periodStart =
    new Date(
      year,
      month - 1,
      1
    );


  const periodEnd =
    new Date(
      year,
      month,
      0
    );


  const revenueRows = [];


  let revenue =
    0;

  let rentRevenue =
    0;

  let fineRevenue =
    0;

  let cashIn =
    0;


  dataset.payments.forEach(
    function(item) {

      const recognizedKey =
        djFinancePeriodKeyV1_(
          item.period
        );


      const fallbackKey =
        item.dueDate
          ? djFinanceMonthKeyDateV1_(
              item.dueDate
            )
          : '';


      const periodKey =
        recognizedKey ||
        fallbackKey;


      if (
        periodKey ===
        djFinanceMonthKeyV1_(
          year,
          month
        )
      ) {

        revenue +=
          Number(
            item.paid ||
            0
          );


        const rentPart =
          Math.min(
            Number(
              item.rent ||
              0
            ),
            Number(
              item.paid ||
              0
            )
          );


        rentRevenue +=
          rentPart;


        fineRevenue +=
          Math.max(
            0,
            Number(
              item.paid ||
              0
            ) -
            rentPart
          );


        revenueRows.push({
          date:
            item.paidDate ||
            item.verifiedDate ||
            item.dueDate ||
            periodStart,

          type:
            'INCOME',

          category:
            Number(item.fine || 0) > 0
              ? 'Sewa + Denda'
              : 'Sewa',

          description:
            (
              item.name ||
              item.tenantId ||
              'Pembayaran tenant'
            ) +
            (
              item.room
                ? ' · Kamar ' +
                  item.room
                : ''
            ) +
            ' · ' +
            String(
              item.period ||
              ''
            ),

          room:
            item.room ||
            '',

          amount:
            item.paid

        });

      }


      const cashDate =
        item.paidDate ||
        item.verifiedDate;

      if (
        cashDate &&
        djFinanceDateInMonthV1_(
          cashDate,
          year,
          month
        )
      ) {

        cashIn +=
          Number(
            item.paid ||
            0
          );

      }

    }
  );


  let maintenanceExpense =
    0;

  let generalExpense =
    0;


  const expenseRows = [];


  dataset.maintenance.forEach(
    function(item) {

      if (
        !item.date ||
        !djFinanceDateInMonthV1_(
          item.date,
          year,
          month
        )
      ) {

        return;

      }


      maintenanceExpense +=
        Number(
          item.cost ||
          0
        );


      expenseRows.push({

        date:
          item.date,

        type:
          'EXPENSE',

        category:
          'Maintenance · ' +
          (
            item.category ||
            'Umum'
          ),

        description:
          item.description ||
          'Maintenance',

        room:
          item.room ||
          '',

        amount:
          item.cost

      });

    }
  );


  dataset.generalExpenses.forEach(
    function(item) {

      if (
        !item.date ||
        !djFinanceDateInMonthV1_(
          item.date,
          year,
          month
        )
      ) {

        return;

      }


      generalExpense +=
        Number(
          item.amount ||
          0
        );


      expenseRows.push({

        date:
          item.date,

        type:
          'EXPENSE',

        category:
          item.category ||
          'Lainnya',

        description:
          item.description ||
          'Pengeluaran',

        room:
          item.room ||
          '',

        amount:
          item.amount

      });

    }
  );


  const expense =
    maintenanceExpense +
    generalExpense;


  const expectedRevenue =
    djFinanceExpectedRevenueV1_(
      dataset,
      periodStart,
      periodEnd
    );


  const billingStatus =
    djFinanceBuildBillingStatusV1_(
      dataset,
      year,
      month,
      periodStart,
      periodEnd,
      expectedRevenue
    );


  const outstanding =
    billingStatus.outstanding;


  const netProfit =
    revenue -
    expense;


  const netMargin =
    revenue > 0
      ? (
          netProfit /
          revenue
        ) *
        100
      : 0;


  const rentableRooms =
    dataset.rooms.filter(
      function(room) {

        return (
          Number(
            room.price ||
            0
          ) > 0
        );

      }
    ).length;


  const occupiedRooms =
    dataset.rooms.filter(
      function(room) {

        return (
          Number(
            room.price ||
            0
          ) > 0 &&
          room.status ===
          'TERISI'
        );

      }
    ).length;


  const occupancyRate =
    rentableRooms > 0
      ? (
          occupiedRooms /
          rentableRooms
        ) *
        100
      : 0;


  const combined =
    revenueRows
      .concat(
        expenseRows
      )
      .sort(
        function(a,b){

          return (
            djFinanceTimeV1_(
              b.date
            ) -
            djFinanceTimeV1_(
              a.date
            )
          );

        }
      );


  const breakdown = {};


  expenseRows.forEach(
    function(item){

      const key =
        String(
          item.category ||
          'Lainnya'
        )
        .trim();


      breakdown[key] =
        (
          breakdown[key] ||
          0
        ) +
        Number(
          item.amount ||
          0
        );

    }
  );


  const expenseBreakdown =
    Object.keys(
      breakdown
    )
    .map(
      function(category){

        return {

          category:
            category,

          amount:
            breakdown[category]

        };

      }
    )
    .sort(
      function(a,b){

        return (
          b.amount -
          a.amount
        );

      }
    );


  return {

    year:
      year,

    month:
      month,

    label:
      djFinanceMonthLabelV1_(
        year,
        month
      ),

    revenue:
      revenue,

    rentRevenue:
      rentRevenue,

    fineRevenue:
      fineRevenue,

    cashIn:
      cashIn,

    expense:
      expense,

    maintenanceExpense:
      maintenanceExpense,

    generalExpense:
      generalExpense,

    netProfit:
      netProfit,

    netMargin:
      netMargin,

    expectedRevenue:
      expectedRevenue,

    outstanding:
      outstanding,

    rentableRooms:
      rentableRooms,

    occupiedRooms:
      occupiedRooms,

    occupancyRate:
      occupancyRate,

    arusKasBersih:
      cashIn -
      expense,

    collectionRate:
      billingStatus.collectionRate,

    billingStatus:
      billingStatus,

    expenseBreakdown:
      expenseBreakdown,

    recent:
      combined
        .slice(
          0,
          20
        )

  };

}


/* ============================================================
 * EXPECTED REVENUE
 * ============================================================ */

function djFinanceExpectedRevenueV1_(
  dataset,
  periodStart,
  periodEnd
) {

  const byTenant = {};


  dataset.contracts.forEach(
    function(item) {

      const startsBeforeEnd =
        !item.startDate ||
        item.startDate <=
        periodEnd;


      const endsAfterStart =
        !item.endDate ||
        item.endDate >=
        periodStart;


      if (
        !startsBeforeEnd ||
        !endsAfterStart
      ) {

        return;

      }


      const tenantKey =
        String(
          item.tenantId ||
          item.room ||
          ''
        )
        .trim();


      if (
        !tenantKey
      ) {

        return;

      }


      const current =
        byTenant[
          tenantKey
        ];


      if (
        !current ||
        (
          item.startDate &&
          current.startDate &&
          item.startDate >
          current.startDate
        )
      ) {

        byTenant[
          tenantKey
        ] =
          item;

      }

    }
  );


  let total =
    Object.keys(
      byTenant
    )
    .reduce(
      function(sum,key){

        return (
          sum +
          Number(
            byTenant[key].monthlyRent ||
            0
          )
        );

      },
      0
    );


  /*
   * Fallback jika sheet Kontrak belum punya baris.
   * Hanya kamar dengan harga > 0 yang dianggap rentable.
   */

  if (
    total <= 0
  ) {

    total =
      dataset.rooms
        .filter(
          function(room){

            return (
              Number(
                room.price ||
                0
              ) > 0 &&
              room.status !==
              'KOSONG'
            );

          }
        )
        .reduce(
          function(sum,room){

            return (
              sum +
              Number(
                room.price ||
                0
              )
            );

          },
          0
        );

  }


  return total;

}


/* ============================================================
 * DATE + PERIOD HELPERS
 * ============================================================ */

function djFinanceDateV1_(
  value
) {

  if (
    value instanceof Date &&
    !isNaN(
      value.getTime()
    )
  ) {

    return new Date(
      value.getTime()
    );

  }


  if (
    typeof value ===
    'number' &&
    value > 20000 &&
    value < 70000
  ) {

    return new Date(
      new Date(
        1899,
        11,
        30
      ).getTime() +
      value *
      86400000
    );

  }


  const text =
    String(
      value == null
        ? ''
        : value
    )
    .trim();


  if (
    !text
  ) {

    return null;

  }


  let m =
    text.match(
      /^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})/
    );


  if (
    m
  ) {

    const date =
      new Date(
        Number(m[1]),
        Number(m[2]) - 1,
        Number(m[3])
      );


    return isNaN(
      date.getTime()
    )
      ? null
      : date;

  }


  m =
    text.match(
      /^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})/
    );


  if (
    m
  ) {

    const date =
      new Date(
        Number(m[3]),
        Number(m[2]) - 1,
        Number(m[1])
      );


    return isNaN(
      date.getTime()
    )
      ? null
      : date;

  }


  const parsed =
    new Date(
      text
    );


  return isNaN(
    parsed.getTime()
  )
    ? null
    : parsed;

}


function djFinanceTimeV1_(
  date
) {

  return date instanceof Date
    ? date.getTime()
    : 0;

}


function djFinanceMonthKeyDateV1_(
  date
) {

  if (
    !date
  ) {

    return '';

  }


  return (
    String(
      date.getFullYear()
    ) +
    '-' +
    String(
      date.getMonth() + 1
    )
    .padStart(
      2,
      '0'
    )
  );

}


function djFinanceMonthKeyV1_(
  year,
  month
) {

  return (
    String(
      year
    ) +
    '-' +
    String(
      month
    )
    .padStart(
      2,
      '0'
    )
  );

}


function djFinanceDateInMonthV1_(
  date,
  year,
  month
) {

  if (
    !date
  ) {

    return false;

  }


  return (
    date.getFullYear() ===
    year &&
    date.getMonth() ===
    month - 1
  );

}


function djFinancePeriodKeyV1_(
  value
) {

  const text =
    String(
      value == null
        ? ''
        : value
    )
    .trim()
    .toLowerCase();


  if (
    !text
  ) {

    return '';

  }


  let m =
    text.match(
      /^(\d{4})[-\/.](\d{1,2})$/
    );


  if (
    m
  ) {

    return djFinanceMonthKeyV1_(
      Number(m[1]),
      Number(m[2])
    );

  }


  const months = {

    januari:1,
    jan:1,

    februari:2,
    feb:2,

    maret:3,
    mar:3,

    april:4,
    apr:4,

    mei:5,

    juni:6,
    jun:6,

    juli:7,
    jul:7,

    agustus:8,
    agu:8,
    agt:8,
    aug:8,

    september:9,
    sep:9,

    oktober:10,
    okt:10,
    oct:10,

    november:11,
    nov:11,

    desember:12,
    des:12,
    dec:12

  };


  m =
    text.match(
      /^([a-z]+)[\s\-\/]+(\d{4})$/
    );


  if (
    m &&
    months[m[1]]
  ) {

    return djFinanceMonthKeyV1_(
      Number(m[2]),
      months[m[1]]
    );

  }


  const parsed =
    djFinanceDateV1_(
      value
    );


  return parsed
    ? djFinanceMonthKeyDateV1_(
        parsed
      )
    : '';

}


function djFinanceMonthLabelV1_(
  year,
  month
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
      month - 1
    ] +
    ' ' +
    year
  );

}


/* ============================================================
 * EXPENSE SHEET
 * ============================================================ */

function djFinanceEnsureExpenseSheetV1_() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  let sheet =
    ss.getSheetByName(
      'Pengeluaran'
    );


  if (
    !sheet
  ) {

    sheet =
      ss.insertSheet(
        'Pengeluaran'
      );


    sheet.getRange(
      'A1:K1'
    )
    .merge()
    .setValue(
      'DJ FAMILY KOST — PENGELUARAN UMUM'
    );


    sheet.getRange(
      'A3:K3'
    )
    .setValues([
      [
        'Pengeluaran_ID',
        'Tanggal',
        'Kategori',
        'Keterangan',
        'No_Kamar',
        'Vendor',
        'Nominal',
        'Metode_Pembayaran',
        'Bukti_URL',
        'Dicatat_Oleh',
        'Timestamp'
      ]
    ]);


    sheet
      .getRange(
        'A1:K1'
      )
      .setFontWeight(
        'bold'
      );


    sheet
      .getRange(
        'A3:K3'
      )
      .setFontWeight(
        'bold'
      );


    sheet
      .setFrozenRows(
        3
      );


    sheet
      .getRange(
        'B:B'
      )
      .setNumberFormat(
        'dd/mm/yyyy'
      );


    sheet
      .getRange(
        'G:G'
      )
      .setNumberFormat(
        '#,##0'
      );


    sheet
      .getRange(
        'K:K'
      )
      .setNumberFormat(
        'dd/mm/yyyy hh:mm:ss'
      );


    sheet
      .autoResizeColumns(
        1,
        11
      );

  }


  const table =
    djApiReadTableV5_(
      sheet,
      [
        'Pengeluaran_ID'
      ]
    );


  if (
    !table
  ) {

    throw new Error(
      'Sheet Pengeluaran ditemukan tetapi header tidak dikenali. Gunakan kolom Pengeluaran_ID sebagai header.'
    );

  }


  const requiredHeaders = [

    'Pengeluaran_ID',
    'Tanggal',
    'Kategori',
    'Keterangan',
    'No_Kamar',
    'Vendor',
    'Nominal',
    'Metode_Pembayaran',
    'Bukti_URL',
    'Dicatat_Oleh',
    'Timestamp'

  ];


  let headers =
    table.headers.slice();


  requiredHeaders.forEach(
    function(header) {

      if (
        djApiFindColumnV5_(
          headers,
          [header]
        ) >= 0
      ) {

        return;

      }


      const col =
        sheet.getLastColumn() +
        1;


      sheet
        .getRange(
          table.headerRow,
          col
        )
        .setValue(
          header
        );


      headers.push(
        header
      );

    }
  );


  return sheet;

}


/* ============================================================
 * BILLING STATUS ANALYSIS
 * ============================================================ */

function djFinanceBuildBillingStatusV1_(
  dataset,
  year,
  month,
  periodStart,
  periodEnd,
  expectedRevenue
) {

  const now =
    new Date();


  const selectedStart =
    new Date(
      year,
      month - 1,
      1
    );


  const currentStart =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );


  let asOfDate;


  if (
    selectedStart >
    currentStart
  ) {

    asOfDate =
      new Date(
        selectedStart.getTime() -
        86400000
      );

  } else if (
    selectedStart.getTime() ===
    currentStart.getTime()
  ) {

    asOfDate =
      now;

  } else {

    asOfDate =
      periodEnd;

  }


  const asOfDay =
    new Date(
      asOfDate.getFullYear(),
      asOfDate.getMonth(),
      asOfDate.getDate()
    );


  const paymentMap = {};


  (dataset.allPayments || [])
    .forEach(
      function(item) {

        const periodKey =
          djFinancePeriodKeyV1_(
            item.period
          );


        if (
          periodKey !==
          djFinanceMonthKeyV1_(
            year,
            month
          )
        ) {

          return;

        }


        const key =
          String(
            item.tenantId ||
            ''
          )
          .trim()
          .toUpperCase();


        if(!key){

          return;

        }


        const current =
          paymentMap[key];


        /*
         * Prioritaskan record terverifikasi.
         * Jika level verifikasi sama, gunakan record yang
         * paling baru berdasarkan tanggal pembayaran/verifikasi.
         */

        const currentRank =
          current
            ? djFinancePaymentRankV1_(
                current
              )
            : -1;


        const nextRank =
          djFinancePaymentRankV1_(
            item
          );


        if (
          !current ||
          nextRank >= currentRank
        ) {

          paymentMap[key] =
            item;

        }

      }
    );


  const statusAmount = {

    'BELUM JATUH TEMPO':0,
    'JATUH TEMPO':0,
    'TERLAMBAT':0,
    'KURANG BAYAR':0,
    'MENUNGGU VERIFIKASI':0,
    'DITOLAK':0,
    'LUNAS':0

  };


  const statusCount = {

    'BELUM JATUH TEMPO':0,
    'JATUH TEMPO':0,
    'TERLAMBAT':0,
    'KURANG BAYAR':0,
    'MENUNGGU VERIFIKASI':0,
    'DITOLAK':0,
    'LUNAS':0

  };


  let verifiedRent = 0;
  let verifiedFine = 0;
  let pendingAmount = 0;
  let notDueAmount = 0;
  let dueAmount = 0;
  let overdueAmount = 0;
  let shortfallAmount = 0;
  let rejectedAmount = 0;


  let billCount = 0;
  let paidBillCount = 0;
  let notDueCount = 0;
  let dueCount = 0;
  let overdueCount = 0;
  let shortPaidCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;


  const detailRows = [];


  const tenantByRoom = {};


  (dataset.tenants || [])
    .forEach(
      function(tenant) {

        tenantByRoom[
          String(
            tenant.room ||
            ''
          ).trim()
        ] =
          tenant;

      }
    );


  const billingSources = [];


  let hasUsableContracts =
    false;


  (dataset.contracts || [])
    .forEach(
      function(contract) {

        const startsBeforeEnd =
          !contract.startDate ||
          contract.startDate <=
          periodEnd;


        const endsAfterStart =
          !contract.endDate ||
          contract.endDate >=
          periodStart;


        const hasRent =
          Number(
            contract.monthlyRent ||
            0
          ) > 0;


        if (
          startsBeforeEnd &&
          endsAfterStart &&
          hasRent
        ) {

          hasUsableContracts =
            true;

        }

      }
    );


  if (
    hasUsableContracts
  ) {

    (dataset.contracts || [])
      .forEach(
        function(contract) {

          billingSources.push(
            contract
          );

        }
      );

  } else {

    (dataset.rooms || [])
      .forEach(
        function(room) {

          const roomNumber =
            String(
              room.number ||
              ''
            ).trim();


          if (
            !roomNumber ||
            Number(
              room.price ||
              0
            ) <= 0 ||
            String(
              room.status ||
              ''
            )
            .trim()
            .toUpperCase() ===
            'KOSONG'
          ) {

            return;

          }


          const tenant =
            tenantByRoom[
              roomNumber
            ] ||
            null;


          billingSources.push({

            tenantId:
              tenant
                ? tenant.tenantId
                : '',

            name:
              tenant
                ? tenant.name
                : '',

            room:
              roomNumber,

            startDate:
              null,

            endDate:
              null,

            monthlyRent:
              Number(
                room.price ||
                0
              )

          });

        }
      );

  }


  billingSources
    .forEach(
      function(contract) {

        if (
          contract.startDate &&
          contract.startDate >
          periodEnd
        ) {

          return;

        }


        if (
          contract.endDate &&
          contract.endDate <
          periodStart
        ) {

          return;

        }


        const tenantId =
          String(
            contract.tenantId ||
            ''
          )
          .trim()
          .toUpperCase();


        const tenant =
          tenantId
            ? null
            : (
                tenantByRoom[
                  String(
                    contract.room ||
                    ''
                  ).trim()
                ] ||
                null
              );


        const resolvedTenantId =
          tenantId ||
          (
            tenant
              ? tenant.tenantId
              : ''
          );


        const resolvedName =
          tenant
            ? tenant.name
            : (
                contract.name ||
                ''
              );


        const rent =
          Number(
            contract.monthlyRent ||
            0
          );


        if (
          rent <= 0
        ) {

          return;

        }


        billCount++;


        const dueDate =
          new Date(
            year,
            month - 1,
            1
          );


        const payment =
          resolvedTenantId
            ? (
                paymentMap[
                  resolvedTenantId
                ] ||
                null
              )
            : null;


        const paymentPaid =
          payment
            ? Number(
                payment.paid ||
                0
              )
            : 0;


        const paymentTotal =
          payment &&
          Number(
            payment.total ||
            0
          ) > 0
            ? Number(
                payment.total
              )
            : rent;


        let status =
          'BELUM JATUH TEMPO';


        let outstandingForBill = 0;


        if (
          payment &&
          payment.verification ===
          'TERVERIFIKASI'
        ) {

          verifiedRent +=
            Math.min(
              rent,
              paymentPaid
            );


          verifiedFine +=
            Math.max(
              0,
              paymentPaid -
              Math.min(
                rent,
                paymentPaid
              )
            );


          if (
            paymentPaid >=
            paymentTotal
          ) {

            status =
              'LUNAS';

            paidBillCount++;

          } else if (
            paymentPaid > 0
          ) {

            status =
              'KURANG BAYAR';

            shortPaidCount++;

            outstandingForBill =
              paymentTotal -
              paymentPaid;

            shortfallAmount +=
              outstandingForBill;

          }

        } else if (
          payment &&
          payment.verification ===
          'MENUNGGU VERIFIKASI'
        ) {

          pendingCount++;

          pendingAmount +=
            paymentPaid;


          if (
            paymentPaid >=
            paymentTotal &&
            paymentTotal > 0
          ) {

            status =
              'MENUNGGU VERIFIKASI';

          } else if (
            paymentPaid > 0
          ) {

            status =
              'KURANG BAYAR';

            shortPaidCount++;

            outstandingForBill =
              Math.max(
                0,
                paymentTotal -
                paymentPaid
              );

            shortfallAmount +=
              outstandingForBill;

          } else {

            status =
              'JATUH TEMPO';

          }

        } else if (
          payment &&
          payment.verification ===
          'DITOLAK'
        ) {

          status =
            'DITOLAK';

          rejectedCount++;

          rejectedAmount +=
            paymentTotal;

          outstandingForBill =
            paymentTotal;

        } else if (
          asOfDay <
          dueDate
        ) {

          status =
            'BELUM JATUH TEMPO';

          notDueCount++;

          notDueAmount +=
            rent;

        } else if (
          asOfDay.getTime() ===
          dueDate.getTime()
        ) {

          status =
            'JATUH TEMPO';

          dueCount++;

          dueAmount +=
            rent;

          outstandingForBill =
            rent;

        } else {

          status =
            'TERLAMBAT';

          overdueCount++;

          overdueAmount +=
            rent;

          outstandingForBill =
            rent;

        }


        if (
          status ===
          'LUNAS'
        ) {

          statusCount[status]++;
          statusAmount[status] +=
            paymentTotal;

        } else {

          statusCount[status]++;
          statusAmount[status] +=
            outstandingForBill;

        }


        detailRows.push({

          tenantId:
            resolvedTenantId,

          name:
            (
              payment &&
              payment.name
            ) ||
            resolvedName ||
            '',

          room:
            (
              payment &&
              payment.room
            ) ||
            contract.room ||
            (
              tenant &&
              tenant.room
            ) ||
            '',

          dueDate:
            dueDate,

          status:
            status,

          verification:
            payment &&
            payment.verification ||
            '',

          expected:
            paymentTotal,

          paid:
            paymentPaid,

          outstanding:
            Math.max(
              0,
              outstandingForBill
            )

        });

      }
    );


  const collectionRate =
    expectedRevenue > 0
      ? (
          verifiedRent /
          expectedRevenue
        ) *
        100
      : 0;


  /*
   * Untuk laporan keuangan, uang yang sudah disetor tetapi
   * belum diverifikasi dipisahkan dari pendapatan. Dengan
   * demikian Master tidak salah menganggapnya sebagai revenue.
   *
   * Outstanding hanya memasukkan tagihan yang sudah jatuh
   * tempo, terlambat, ditolak, atau masih kurang bayar.
   * Tagihan yang belum jatuh tempo tidak dianggap tunggakan.
   */

  const outstanding =
    dueAmount +
    overdueAmount +
    shortfallAmount +
    rejectedAmount;


  return {

    asOf:
      Utilities.formatDate(
        asOfDate,
        Session.getScriptTimeZone() ||
        'Asia/Jakarta',
        'dd/MM/yyyy HH:mm'
      ),

    expected:
      expectedRevenue,

    verifiedRent:
      verifiedRent,

    verifiedFine:
      verifiedFine,

    pendingVerification:
      pendingAmount,

    notDue:
      notDueAmount,

    due:
      dueAmount,

    overdue:
      overdueAmount,

    shortfall:
      shortfallAmount,

    rejected:
      rejectedAmount,

    outstanding:
      outstanding,

    collectionRate:
      collectionRate,

    billCount:
      billCount,

    paidBillCount:
      paidBillCount,

    notDueCount:
      notDueCount,

    dueCount:
      dueCount,

    overdueCount:
      overdueCount,

    shortPaidCount:
      shortPaidCount,

    pendingCount:
      pendingCount,

    rejectedCount:
      rejectedCount,

    statusAmount:
      statusAmount,

    statusCount:
      statusCount,

    details:
      detailRows

  };

}


function djFinancePaymentRankV1_(
  item
) {

  const verification =
    String(
      item &&
      item.verification ||
      ''
    )
    .trim()
    .toUpperCase();


  const verificationRank =

    verification === 'TERVERIFIKASI'
      ? 3
      : (
          verification === 'MENUNGGU VERIFIKASI'
            ? 2
            : (
                verification === 'DITOLAK'
                  ? 1
                  : 0
              )
        );


  const date =
    item &&
    (
      item.paidDate ||
      item.verifiedDate
    );


  return (
    verificationRank * 1000000000000
  ) +
  (
    date instanceof Date
      ? date.getTime()
      : 0
  );

}


/* ============================================================
 * ROOM ANALYSIS
 * ============================================================ */

function djFinanceRoomAnalysisV1_(
  dataset,
  year
) {

  const rooms = {};


  (dataset.rooms || [])
    .forEach(
      function(room) {

        const number =
          String(
            room.number ||
            ''
          ).trim();


        const price =
          Number(
            room.price ||
            0
          );


        if (
          !number ||
          price <= 0
        ) {

          return;

        }


        const floorMatch =
          number.match(
            /^(\d)/
          );


        rooms[number] = {

          room:
            number,

          floor:
            floorMatch
              ? Number(
                  floorMatch[1]
                )
              : 0,

          status:
            String(
              room.status ||
              ''
            )
            .trim()
            .toUpperCase(),

          monthlyRent:
            price,

          revenue:
            0,

          expense:
            0,

          occupancyMonths:
            0

        };

      }
    );


  const occupancyMonthsByRoom = {};


  (dataset.contracts || [])
    .forEach(
      function(contract) {

        const room =
          String(
            contract.room ||
            ''
          ).trim();


        if (
          !room ||
          !rooms[room]
        ) {

          return;

        }


        const start =
          contract.startDate ||
          new Date(
            year,
            0,
            1
          );


        const end =
          contract.endDate ||
          new Date(
            year,
            11,
            31
          );


        let cursor =
          new Date(
            Math.max(
              start.getTime(),
              new Date(
                year,
                0,
                1
              ).getTime()
            )
          );


        const last =
          new Date(
            Math.min(
              end.getTime(),
              new Date(
                year,
                11,
                31
              ).getTime()
            )
          );


        while (
          cursor <=
          last
        ) {

          const key =
            String(
              cursor.getFullYear()
            ) +
            '-' +
            String(
              cursor.getMonth() + 1
            )
            .padStart(
              2,
              '0'
            );


          if(
            !occupancyMonthsByRoom[room]
          ){

            occupancyMonthsByRoom[room] = {};

          }


          occupancyMonthsByRoom[room][key] = true;


          cursor =
            new Date(
              cursor.getFullYear(),
              cursor.getMonth() + 1,
              1
            );

        }

      }
    );


  Object.keys(
    occupancyMonthsByRoom
  )
  .forEach(
    function(room) {

      rooms[room].occupancyMonths =
        Math.min(
          12,
          Object.keys(
            occupancyMonthsByRoom[room]
          ).length
        );

    }
  );


  (dataset.payments || [])
    .forEach(
      function(item) {

        const room =
          String(
            item.room ||
            ''
          ).trim();


        const periodKey =
          djFinancePeriodKeyV1_(
            item.period
          );


        if (
          !room ||
          !rooms[room] ||
          !periodKey
        ) {

          return;

        }


        if (
          Number(
            periodKey.slice(0,4)
          ) !==
          Number(year)
        ) {

          return;

        }


        rooms[room].revenue +=
          Number(
            item.paid ||
            0
          );

      }
    );


  (dataset.maintenance || [])
    .forEach(
      function(item) {

        const room =
          String(
            item.room ||
            ''
          ).trim();


        if(
          !room ||
          !rooms[room] ||
          !item.date ||
          item.date.getFullYear() !==
          Number(year)
        ){

          return;

        }


        rooms[room].expense +=
          Number(
            item.cost ||
            0
          );

      }
    );


  (dataset.generalExpenses || [])
    .forEach(
      function(item) {

        const room =
          String(
            item.room ||
            ''
          ).trim();


        if(
          !room ||
          !rooms[room] ||
          !item.date ||
          item.date.getFullYear() !==
          Number(year)
        ){

          return;

        }


        rooms[room].expense +=
          Number(
            item.amount ||
            0
          );

      }
    );


  const tenantByRoom = {};


  (dataset.tenants || [])
    .forEach(
      function(tenant) {

        const room =
          String(
            tenant.room ||
            ''
          ).trim();


        if(
          !room
        ){

          return;

        }


        tenantByRoom[room] =
          tenant.name ||
          '';

      }
    );


  return Object.keys(
    rooms
  )
  .map(
    function(roomNumber) {

      const item =
        rooms[roomNumber];


      return {

        room:
          item.room,

        floor:
          item.floor,

        tenant:
          tenantByRoom[
            item.room
          ] ||
          '',

        status:
          item.status,

        monthlyRent:
          item.monthlyRent,

        occupancyMonths:
          item.occupancyMonths,

        revenue:
          item.revenue,

        expense:
          item.expense,

        netProfit:
          item.revenue -
          item.expense

      };

    }
  )
  .sort(
    function(a,b) {

      return (
        Number(
          a.room ||
          0
        ) -
        Number(
          b.room ||
          0
        )
      );

    }
  );

}


/* ============================================================
 * ANNUAL SUMMARY
 * ============================================================ */

function djFinanceAnnualSummaryV1_(
  monthly,
  year
) {

  let revenue = 0;
  let rentRevenue = 0;
  let expense = 0;
  let expectedRevenue = 0;
  let cashIn = 0;
  let occupiedRoomMonths = 0;
  let rentableRoomMonths = 0;


  const expenseMap = {};


  (monthly || [])
    .forEach(
      function(item) {

        revenue +=
          Number(
            item.revenue ||
            0
          );

        rentRevenue +=
          Number(
            item.rentRevenue ||
            0
          );

        expense +=
          Number(
            item.expense ||
            0
          );

        expectedRevenue +=
          Number(
            item.expectedRevenue ||
            0
          );

        cashIn +=
          Number(
            item.cashIn ||
            0
          );

        occupiedRoomMonths +=
          Number(
            item.occupiedRooms ||
            0
          );

        rentableRoomMonths +=
          Number(
            item.rentableRooms ||
            0
          );


        (
          item.expenseBreakdown ||
          []
        )
        .forEach(
          function(row) {

            const key =
              String(
                row.category ||
                'Lainnya'
              )
              .trim() ||
              'Lainnya';


            expenseMap[key] =
              (
                expenseMap[key] ||
                0
              ) +
              Number(
                row.amount ||
                0
              );

          }
        );

      }
    );


  const netProfit =
    revenue -
    expense;


  const netMargin =
    revenue > 0
      ? (
          netProfit /
          revenue
        ) *
        100
      : 0;


  const realizationRate =
    expectedRevenue > 0
      ? (
          rentRevenue /
          expectedRevenue
        ) *
        100
      : 0;


  const averageOccupancy =
    rentableRoomMonths > 0
      ? (
          occupiedRoomMonths /
          rentableRoomMonths
        ) *
        100
      : 0;


  const expenseBreakdown =
    Object.keys(
      expenseMap
    )
    .map(
      function(category) {

        return {

          category:
            category,

          amount:
            expenseMap[category]

        };

      }
    )
    .sort(
      function(a,b) {

        return (
          b.amount -
          a.amount
        );

      }
    );


  return {

    year:
      year,

    revenue:
      revenue,

    expense:
      expense,

    netProfit:
      netProfit,

    netMargin:
      netMargin,

    expectedRevenue:
      expectedRevenue,

    realizationRate:
      realizationRate,

    cashIn:
      cashIn,

    averageOccupancy:
      averageOccupancy,

    expenseBreakdown:
      expenseBreakdown

  };

}


/* ============================================================
 * FLOOR ANALYSIS
 * ============================================================ */

function djFinanceFloorAnalysisV1_(
  dataset,
  year
) {

  const floors = {
    '1': {
      floor:1,
      revenue:0,
      expense:0
    },
    '2': {
      floor:2,
      revenue:0,
      expense:0
    },
    '3': {
      floor:3,
      revenue:0,
      expense:0
    },
    '4': {
      floor:4,
      revenue:0,
      expense:0
    }
  };


  function getFloor(
    room
  ) {

    const text =
      String(
        room == null
          ? ''
          : room
      )
      .trim();


    const match =
      text.match(
        /^(\\d)/
      );


    return (
      match &&
      floors[match[1]]
    )
      ? floors[match[1]]
      : null;

  }


  (dataset.payments || [])
    .forEach(
      function(item) {

        const periodKey =
          djFinancePeriodKeyV1_(
            item.period
          );


        if(
          !periodKey ||
          Number(
            periodKey.slice(0,4)
          ) !==
          Number(year)
        ){

          return;

        }


        const floor =
          getFloor(
            item.room
          );


        if(!floor){

          return;

        }


        floor.revenue +=
          Number(
            item.paid ||
            0
          );

      }
    );


  (dataset.maintenance || [])
    .forEach(
      function(item) {

        if(
          !item.date ||
          item.date.getFullYear() !==
          Number(year)
        ){

          return;

        }


        const floor =
          getFloor(
            item.room
          );


        if(!floor){

          return;

        }


        floor.expense +=
          Number(
            item.cost ||
            0
          );

      }
    );


  (dataset.generalExpenses || [])
    .forEach(
      function(item) {

        if(
          !item.date ||
          item.date.getFullYear() !==
          Number(year)
        ){

          return;

        }


        const floor =
          getFloor(
            item.room
          );


        if(!floor){

          return;

        }


        floor.expense +=
          Number(
            item.amount ||
            0
          );

      }
    );


  return Object.keys(
    floors
  )
  .map(
    function(key) {

      const item =
        floors[key];


      return {

        floor:
          item.floor,

        revenue:
          item.revenue,

        expense:
          item.expense,

        netProfit:
          item.revenue -
          item.expense

      };

    }
  );

}


/* ============================================================
 * SAVE EXPENSE
 * ============================================================ */

function djApiMasterSaveExpenseV1_(
  body,
  masterId
) {

  const sheet =
    djFinanceEnsureExpenseSheetV1_();


  const category =
    String(
      body.category ||
      ''
    )
    .trim();


  const description =
    String(
      body.description ||
      body.keterangan ||
      ''
    )
    .trim();


  const dateInput =
    String(
      body.date ||
      body.tanggal ||
      ''
    ).trim();


  const date =
    djFinanceDateV1_(
      dateInput
    );


  const amount =
    djApiNumberV5_(
      body.amount ||
      body.nominal
    );


  const room =
    String(
      body.room ||
      body.noKamar ||
      ''
    )
    .trim();


  const vendor =
    String(
      body.vendor ||
      ''
    )
    .trim();


  const method =
    String(
      body.method ||
      body.metodePembayaran ||
      ''
    )
    .trim();


  const proofUrl =
    String(
      body.proofUrl ||
      body.buktiUrl ||
      ''
    )
    .trim();


  if (
    !date
  ) {

    return {

      ok:false,

      error:
        'Tanggal pengeluaran wajib diisi.'

    };

  }


  if (
    !category
  ) {

    return {

      ok:false,

      error:
        'Kategori pengeluaran wajib diisi.'

    };

  }


  const financeStartDate =
    new Date(
      2027,
      0,
      1
    );


  if (
    date < financeStartDate
  ) {

    return {

      ok:false,

      error:
        'Tanggal pengeluaran untuk modul Keuangan minimal 1 Januari 2027.'

    };

  }


  if (
    /^maintenance$/i.test(
      category
    )
  ) {

    return {

      ok:false,

      error:
        'Biaya Maintenance dicatat otomatis dari sheet Maintenance. Jangan dicatat ulang di Pengeluaran.'

    };

  }


  if (
    !description
  ) {

    return {

      ok:false,

      error:
        'Keterangan pengeluaran wajib diisi.'

    };

  }


  if (
    amount <= 0
  ) {

    return {

      ok:false,

      error:
        'Nominal pengeluaran harus lebih besar dari 0.'

    };

  }


  const expenseTable =
    djApiReadTableV5_(
      sheet,
      [
        'Pengeluaran_ID'
      ]
    );


  if (
    !expenseTable
  ) {

    throw new Error(
      'Struktur sheet Pengeluaran tidak dapat dibaca.'
    );

  }


  const headers =
    expenseTable.headers;


  const id =
    'EXP-' +
    Utilities
      .getUuid()
      .replace(
        /-/g,
        ''
      )
      .slice(
        0,
        12
      )
      .toUpperCase();


  const row =
    new Array(
      Math.max(
        headers.length,
        11
      )
    )
    .fill('');


  djFinanceSetValueV1_(
    row,
    headers,
    'Pengeluaran_ID',
    id
  );


  const sheetDateText =
    String(
      date.getDate()
    ).padStart(
      2,
      '0'
    ) +
    '/' +
    String(
      date.getMonth() + 1
    ).padStart(
      2,
      '0'
    ) +
    '/' +
    String(
      date.getFullYear()
    );


  djFinanceSetValueV1_(
    row,
    headers,
    'Tanggal',
    sheetDateText
  );


  djFinanceSetValueV1_(
    row,
    headers,
    'Kategori',
    category
  );


  djFinanceSetValueV1_(
    row,
    headers,
    'Keterangan',
    description
  );


  djFinanceSetValueV1_(
    row,
    headers,
    'No_Kamar',
    room
  );


  djFinanceSetValueV1_(
    row,
    headers,
    'Vendor',
    vendor
  );


  djFinanceSetValueV1_(
    row,
    headers,
    'Nominal',
    amount
  );


  djFinanceSetValueV1_(
    row,
    headers,
    'Metode_Pembayaran',
    method
  );


  djFinanceSetValueV1_(
    row,
    headers,
    'Bukti_URL',
    proofUrl
  );


  djFinanceSetValueV1_(
    row,
    headers,
    'Dicatat_Oleh',
    masterId
  );


  djFinanceSetValueV1_(
    row,
    headers,
    'Timestamp',
    new Date()
  );


  sheet
    .getRange(
      sheet.getLastRow() + 1,
      1,
      1,
      row.length
    )
    .setValues([
      row
    ]);


  return {

    ok:true,

    id:
      id

  };

}


/* ============================================================
 * SET VALUE
 * ============================================================ */

function djFinanceSetValueV1_(
  row,
  headers,
  header,
  value
) {

  const col =
    djApiFindColumnV5_(
      headers,
      [header]
    );


  if (
    col >= 0
  ) {

    row[col] =
      value;

  }

}


/* ============================================================
 * SHEET SETUP
 * ============================================================ */

function setupFinanceSheetV1() {

  djFinanceEnsureExpenseSheetV1_();

  return {

    ok:true,

    sheet:
      'Pengeluaran',

    startDate:
      '2027-01-01',

    message:
      'Sheet Pengeluaran siap digunakan. Biaya Maintenance tetap dibaca otomatis dari sheet Maintenance.'

  };

}
