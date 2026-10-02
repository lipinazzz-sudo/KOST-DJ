/**

 * ============================================================

 * DJ FAMILY KOST

 * PAYMENT ENGINE DJ39 V2 — RESTORED + VERIFIED PAYMENT LOGIC

 * ============================================================

 *

 * FILE TERPISAH.

 *

 * TUJUAN:

 * 1. Memulihkan generateMonthlyPaymentsDJ39()

 * 2. Memulihkan updatePaymentStatusDJ39()

 * 3. Memastikan pembayaran MENUNGGU VERIFIKASI tidak berubah

 *    menjadi TERLAMBAT sebelum diverifikasi.

 * 4. Memastikan pembayaran TERVERIFIKASI dihitung:

 *      paid >= total  -> LUNAS

 *      paid < total   -> KURANG BAYAR

 * 5. Billing pertama tenant -> denda Rp0.

 * 6. Memperbaiki record pembayaran yang sudah ada tanpa

 *    menghapus row, sheet, atau file bukti.

 *

 * CATATAN:

 * - Tidak mendefinisikan const DJ agar tidak bentrok dengan

 *   MASTER_ENGINE_V2.gs.

 * - Helper diberi prefix DJ39PAY2_ agar tidak bentrok dengan

 *   helper pada file lain.

 * - Automation yang sudah ada di TENANT_API_V2.gs akan otomatis

 *   menemukan generateMonthlyPaymentsDJ39() setelah file ini

 *   ditambahkan ke project.

 * ============================================================

 */



const DJ39PAY2 = {



  PAYMENT_SHEET:

    'Pembayaran',



  CONTRACT_SHEET:

    'Kontrak',



  TENANT_SHEET:

    'Tenant',



  ROOM_SHEET:

    'Kamar',



  DEFAULT_FIRST_BILLING_FINE:

    0,



  DEFAULT_FINE_DAY3:

    25000,



  DEFAULT_FINE_DAY5:

    25000,



  DEFAULT_MAX_FINE:

    50000



};





/**

 * ============================================================

 * PUBLIC — GENERATE MONTHLY PAYMENTS

 * ============================================================

 *

 * Fungsi ini dipanggil oleh Automation yang sudah ada:

 *

 * generateMonthlyPaymentsDJ39()

 *

 * Tidak membuat duplikat jika tenant + periode sudah ada.

 * ============================================================

 */

function generateMonthlyPaymentsDJ39() {



  const lock =

    LockService.getDocumentLock();



  lock.waitLock(30000);



  try {



    const ss =

      SpreadsheetApp.getActiveSpreadsheet();



    if (!ss) {



      throw new Error(

        'Spreadsheet aktif tidak ditemukan.'

      );



    }



    const paymentSheet =

      ss.getSheetByName(

        DJ39PAY2.PAYMENT_SHEET

      );



    const contractSheet =

      ss.getSheetByName(

        DJ39PAY2.CONTRACT_SHEET

      );



    const tenantSheet =

      ss.getSheetByName(

        DJ39PAY2.TENANT_SHEET

      );



    if (!paymentSheet) {



      throw new Error(

        'Sheet Pembayaran tidak ditemukan.'

      );



    }



    if (!contractSheet) {



      throw new Error(

        'Sheet Kontrak tidak ditemukan.'

      );



    }



    const paymentTable =

      dj39pay2ReadTable_(

        paymentSheet,

        [

          'Tenant_ID'

        ]

      );



    const contractTable =

      dj39pay2ReadTable_(

        contractSheet,

        [

          'Tenant_ID'

        ]

      );



    const tenantTable =

      tenantSheet

        ? dj39pay2ReadTable_(

            tenantSheet,

            [

              'Tenant_ID'

            ]

          )

        : null;



    if (!paymentTable) {



      throw new Error(

        'Header sheet Pembayaran tidak ditemukan.'

      );



    }



    if (!contractTable) {



      throw new Error(

        'Header sheet Kontrak tidak ditemukan.'

      );



    }



    const periodDate =

      new Date();



    const periodLabel =

      dj39pay2PeriodLabel_(

        periodDate

      );



    const paymentKeys =

      {};



    paymentTable.rows.forEach(

      function(row) {



        const tenantId =

          dj39pay2String_(

            dj39pay2Value_(

              row,

              paymentTable.headers,

              [

                'Tenant_ID'

              ]

            )

          );



        const period =

          dj39pay2Value_(

            row,

            paymentTable.headers,

            [

              'Periode_Pembayaran',

              'Periode'

            ]

          );



        const key =

          dj39pay2PaymentKey_(

            tenantId,

            period

          );



        if (key) {



          paymentKeys[key] =

            true;



        }



      }

    );



    const tenantMap =

      {};



    if (tenantTable) {



      tenantTable.rows.forEach(

        function(row) {



          const tenantId =

            dj39pay2String_(

              dj39pay2Value_(

                row,

                tenantTable.headers,

                [

                  'Tenant_ID'

                ]

              )

            );



          if (!tenantId) {

            return;

          }



          tenantMap[tenantId] = {



            status:

              dj39pay2String_(

                dj39pay2Value_(

                  row,

                  tenantTable.headers,

                  [

                    'Status_Tenant'

                  ]

                )

              )

              .toUpperCase(),



            name:

              dj39pay2Value_(

                row,

                tenantTable.headers,

                [

                  'Nama_Lengkap',

                  'Nama_Tenant'

                ]

              ),



            phone:

              dj39pay2Value_(

                row,

                tenantTable.headers,

                [

                  'No_HP'

                ]

              ),



            room:

              dj39pay2Value_(

                row,

                tenantTable.headers,

                [

                  'No_Kamar'

                ]

              )



          };



        }

      );



    }



    let nextNumber =

      dj39pay2NextPaymentNumber_(

        paymentTable,

        paymentSheet

      );



    let created =

      0;



    let skipped =

      0;



    let inactive =

      0;



    contractTable.rows.forEach(

      function(row) {



        const contractStatus =

          dj39pay2String_(

            dj39pay2Value_(

              row,

              contractTable.headers,

              [

                'Status_Kontrak'

              ]

            )

          )

          .toUpperCase();



        if (

          contractStatus &&

          contractStatus !== 'AKTIF'

        ) {



          inactive++;

          return;



        }



        const tenantId =

          dj39pay2String_(

            dj39pay2Value_(

              row,

              contractTable.headers,

              [

                'Tenant_ID'

              ]

            )

          );



        if (!tenantId) {

          return;

        }



        const tenant =

          tenantMap[tenantId] ||

          null;



        if (

          tenant &&

          tenant.status &&

          tenant.status !== 'AKTIF'

        ) {



          inactive++;

          return;



        }



        const contractStartDate =

          dj39pay2ToDate_(

            dj39pay2Value_(

              row,

              contractTable.headers,

              [

                'Tanggal_Mulai',

                'Tanggal_Mulai_Tinggal'

              ]

            )

          );



        if (

          contractStartDate &&

          dj39pay2MonthKey_(

            contractStartDate

          ) >

          dj39pay2MonthKey_(

            periodDate

          )

        ) {



          return;



        }



        const key =

          dj39pay2PaymentKey_(

            tenantId,

            periodLabel

          );



        if (paymentKeys[key]) {



          skipped++;

          return;



        }



        const room =

          dj39pay2String_(

            dj39pay2Value_(

              row,

              contractTable.headers,

              [

                'No_Kamar'

              ]

            )

          ) ||

          dj39pay2String_(

            tenant &&

            tenant.room

          );



        const name =

          dj39pay2Value_(

            row,

            contractTable.headers,

            [

              'Nama_Tenant',

              'Nama_Lengkap'

            ]

          ) ||

          (

            tenant

              ? tenant.name

              : ''

          );



        const phone =

          dj39pay2Value_(

            row,

            contractTable.headers,

            [

              'No_HP'

            ]

          ) ||

          (

            tenant

              ? tenant.phone

              : ''

          );



        const rent =

          dj39pay2Number_(

            dj39pay2Value_(

              row,

              contractTable.headers,

              [

                'Harga_Sewa',

                'Harga_Bulan',

                'Tarif_Kamar'

              ]

            )

          ) ||

          dj39pay2RoomPrice_(

            ss,

            room

          );



        if (rent <= 0) {



          Logger.log(

            'Tagihan dilewati — tarif kamar tidak ditemukan: ' +

            room

          );



          return;



        }



        const dueDate =

          new Date(

            periodDate.getFullYear(),

            periodDate.getMonth(),

            1

          );



        /*

         * Billing pertama tenant:

         * denda selalu Rp0.

         */

        const fine =

          (

            contractStartDate &&

            dj39pay2IsFirstBilling_(

              contractStartDate,

              dueDate

            )

          )

            ? 0

            : 0;



        const paymentId =

          'PWEB-' +

          String(

            nextNumber

          ).padStart(

            3,

            '0'

          );


