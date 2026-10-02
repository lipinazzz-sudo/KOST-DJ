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


  const expenseTable =
    expenseSheet
      ? djApiReadTableV5_(
          expenseSheet,
          ['Pengeluaran_ID']
        )
      : null;


  const payments = [];


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


        if (
          verification !==
          'TERVERIFIKASI'
        ) {

          return;

        }


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


        const total =
          paidField > 0
            ? paidField
            : rent + fine;


        payments.push({

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
            total,

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

    maintenance:
      maintenance,

    generalExpenses:
      generalExpenses,

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


  const outstanding =
    Math.max(
      0,
      expectedRevenue -
      revenue
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


  const date =
    djFinanceDateV1_(
      body.date ||
      body.tanggal
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


  djFinanceSetValueV1_(
    row,
    headers,
    'Tanggal',
    date
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
