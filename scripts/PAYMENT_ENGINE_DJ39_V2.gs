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



  DEFAULT_FINE_DAY2:

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



        nextNumber++;



        const total =

          rent +

          fine;



        const data = {



          Pembayaran_ID:

            paymentId,



          Payment_ID:

            paymentId,



          Tenant_ID:

            tenantId,



          Source_Key:

            'AUTO#' +

            tenantId +

            '#' +

            periodLabel,



          Timestamp_Submit:

            new Date(),



          No_Kamar:

            room,



          Nama_Tenant:

            name,



          No_HP:

            phone,



          Periode_Pembayaran:

            periodLabel,



          Periode:

            periodLabel,



          Tanggal_Pembayaran:

            '',



          Tanggal_Bayar:

            '',



          Jatuh_Tempo:

            dueDate,



          Tanggal_Jatuh_Tempo:

            dueDate,



          Tarif_Kamar:

            rent,



          Nominal_Sewa:

            rent,



          Nominal_Dibayar:

            0,



          Denda_Terhitung:

            fine,



          Denda:

            fine,



          Total_Tagihan:

            total,



          Selisih:

            -total,



          Status_Pembayaran:

            'BELUM BAYAR',



          Status_Verifikasi:

            '',



          Metode_Pembayaran:

            '',



          Bukti_Pembayaran_URL:

            '',



          Bukti_Pembayaran_Foto:

            '',



          Bukti_File_ID:

            '',



          Diverifikasi_Oleh:

            '',



          Tanggal_Verifikasi:

            '',



          Catatan_Verifikasi:

            '',



          Keterangan:

            'GENERATED OTOMATIS',



          Last_Sync:

            new Date()



        };



        dj39pay2AppendObject_(

          paymentSheet,

          paymentTable.headers,

          data

        );



        paymentKeys[key] =

          true;



        created++;



        Logger.log(

          'Tagihan dibuat: ' +

          paymentId +

          ' | Tenant ' +

          tenantId +

          ' | Kamar ' +

          room +

          ' | Periode ' +

          periodLabel +

          ' | Rp' +

          rent

        );



      }

    );



    const updated =

      updatePaymentStatusDJ39();



    SpreadsheetApp.flush();



    Logger.log(

      '======================================'

    );



    Logger.log(

      'GENERATE TAGIHAN SELESAI'

    );



    Logger.log(

      'Periode = ' +

      periodLabel

    );



    Logger.log(

      'Tagihan baru = ' +

      created

    );



    Logger.log(

      'Sudah ada = ' +

      skipped

    );



    Logger.log(

      'Tenant/kontrak tidak aktif = ' +

      inactive

    );



    Logger.log(

      'Pembayaran diperbarui = ' +

      updated

    );



    Logger.log(

      '======================================'

    );



    return {



      ok:

        true,



      period:

        periodLabel,



      created:

        created,



      skipped:

        skipped,



      inactive:

        inactive,



      updated:

        updated



    };



  } finally {



    lock.releaseLock();



  }



}





/**

 * ============================================================

 * PUBLIC — UPDATE PAYMENT STATUS

 * ============================================================

 *

 * ATURAN UTAMA:

 *

 * 1. Status verifikasi MENUNGGU VERIFIKASI

 *    -> paid < total : KURANG BAYAR

 *    -> paid >= total: MENUNGGU VERIFIKASI.

 *

 * 2. Status verifikasi TERVERIFIKASI

 *    -> paid >= total : LUNAS

 *    -> paid > 0      : KURANG BAYAR

 *    -> paid = 0      : BELUM BAYAR

 *

 * 3. Status verifikasi DITOLAK

 *    -> DITOLAK

 *

 * 4. Belum ada pembayaran:

 *    -> BELUM BAYAR / TERLAMBAT

 *

 * 5. Billing pertama:

 *    -> denda Rp0.

 * ============================================================

 */

function updatePaymentStatusDJ39() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();



  const sheet =

    ss.getSheetByName(

      DJ39PAY2.PAYMENT_SHEET

    );



  if (!sheet) {



    throw new Error(

      'Sheet Pembayaran tidak ditemukan.'

    );



  }



  const table =

    dj39pay2ReadTable_(

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



  const contractMap =

    dj39pay2BuildContractMap_(

      ss

    );



  const today =

    dj39pay2StartOfDay_(

      new Date()

    );



  const dendaHari2 =

    dj39pay2GetSettingNumber_(

      ss,

      'Denda_Terlambat_Hari_Ke2',

      DJ39PAY2.DEFAULT_FINE_DAY2

    );



  const dendaHari5 =

    dj39pay2GetSettingNumber_(

      ss,

      'Denda_Terlambat_Hari_Ke5',

      DJ39PAY2.DEFAULT_FINE_DAY5

    );



  const maxDenda =

    dj39pay2GetSettingNumber_(

      ss,

      'Maks_Denda_Keterlambatan',

      DJ39PAY2.DEFAULT_MAX_FINE

    );



  const paymentIdCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Pembayaran_ID',

        'Payment_ID'

      ]

    );



  const tenantCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Tenant_ID'

      ]

    );



  const periodCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Periode_Pembayaran',

        'Periode'

      ]

    );



  const dueCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Jatuh_Tempo',

        'Tanggal_Jatuh_Tempo'

      ]

    );



  const paidCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Nominal_Dibayar'

      ]

    );



  const paidDateCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Tanggal_Pembayaran',

        'Tanggal_Bayar'

      ]

    );



  const rentCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Tarif_Kamar',

        'Nominal_Sewa'

      ]

    );



  const fineCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Denda_Terhitung',

        'Denda'

      ]

    );



  const totalCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Total_Tagihan'

      ]

    );



  const differenceCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Selisih'

      ]

    );



  const statusCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Status_Pembayaran'

      ]

    );



  const verificationCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Status_Verifikasi'

      ]

    );



  if (

    paymentIdCol < 0 ||

    tenantCol < 0 ||

    periodCol < 0 ||

    paidCol < 0 ||

    rentCol < 0 ||

    fineCol < 0 ||

    totalCol < 0 ||

    statusCol < 0 ||

    verificationCol < 0

  ) {



    throw new Error(

      'Kolom pembayaran yang diperlukan tidak lengkap.'

    );



  }



  const values =

    table.rows.map(

      function(row) {



        return row.slice();



      }

    );



  let updated =

    0;



  values.forEach(

    function(row) {



      const paymentId =

        dj39pay2String_(

          row[paymentIdCol]

        );



      const tenantId =

        dj39pay2String_(

          row[tenantCol]

        );



      if (

        !paymentId &&

        !tenantId

      ) {



        return;



      }



      if (!tenantId) {



        return;



      }



      const periodRaw =

        row[periodCol];



      const periodDate =

        dj39pay2CoerceDateMonth_(

          periodRaw

        );



      const contract =

        contractMap[

          tenantId

        ] ||

        null;



      const contractStart =

        contract

          ? contract.startDate

          : null;



      const dueDate =

        dueCol >= 0

          ? dj39pay2ToDate_(

              row[dueCol]

            )

          : null;



      const effectiveDueDate =

        dueDate ||

        (

          periodDate

            ? new Date(

                periodDate.getFullYear(),

                periodDate.getMonth(),

                1

              )

            : null

        );



      const firstBilling =

        dj39pay2IsFirstBilling_(

          contractStart,

          periodDate

        );



      let rent =

        dj39pay2Number_(

          row[rentCol]

        );



      if (

        rent <= 0 &&

        contract

      ) {



        rent =

          contract.amount;



      }



      const paid =

        dj39pay2Number_(

          row[paidCol]

        );



      const verification =

        verificationCol >= 0

          ? dj39pay2String_(

              row[verificationCol]

            )

              .toUpperCase()

          : '';



      let fine =

        0;



      const existingFine =

        fineCol >= 0

          ? dj39pay2Number_(

              row[fineCol]

            )

          : 0;



      /*

       * BILLING PERTAMA

       * denda selalu Rp0.

       */

      if (firstBilling) {



        fine =

          DJ39PAY2.DEFAULT_FIRST_BILLING_FINE;



      } else if (

        verification ===

        'TERVERIFIKASI' ||

        verification ===

        'DITOLAK'

      ) {



        /*

         * Setelah keputusan Master,

         * pertahankan denda yang sudah tersimpan

         * kecuali memang belum ada.

         */

        fine =

          existingFine;



      } else {



        /*

         * Pembayaran yang belum diverifikasi:

         * denda dapat dihitung berdasarkan tanggal bayar

         * jika tenant sudah mengirim pembayaran,

         * atau berdasarkan hari ini jika belum bayar.

         */

        const paidDate =

          paidDateCol >= 0

            ? dj39pay2ToDate_(

                row[paidDateCol]

              )

            : null;



        const referenceDate =

          paidDate ||

          today;



        if (

          effectiveDueDate &&

          referenceDate

        ) {



          fine =

            dj39pay2CalculateFine_(

              referenceDate,

              effectiveDueDate,

              dendaHari2,

              dendaHari5,

              maxDenda

            );



        }



      }



      /*

       * Total tagihan dihitung ulang dari tarif + denda.

       * Untuk billing pertama otomatis rent + 0.

       */

      const total =

        rent +

        fine;



      if (fineCol >= 0) {



        row[fineCol] =

          fine;



      }



      if (totalCol >= 0) {



        row[totalCol] =

          total;



      }



      if (differenceCol >= 0) {



        row[differenceCol] =

          paid -

          total;



      }



      if (

        verification ===

        'MENUNGGU VERIFIKASI'

      ) {



        /*

         * Pembayaran sudah dikirim tetapi belum diverifikasi.

         * Status pembayaran tetap menggambarkan kecukupan nominal.

         * Jika nominal masih kurang, tampilkan KURANG BAYAR.

         * Jika nominal sudah cukup, tetap tunggu verifikasi Master.

         */

        if (

          paid > 0 &&

          total > 0 &&

          paid < total

        ) {



          row[statusCol] =

            'KURANG BAYAR';



        } else {



          row[statusCol] =

            'MENUNGGU VERIFIKASI';



        }



      } else if (

        verification ===

        'TERVERIFIKASI'

      ) {



        if (

          paid >= total &&

          total > 0

        ) {



          row[statusCol] =

            'LUNAS';



        } else if (

          paid > 0 &&

          total > 0

        ) {



          row[statusCol] =

            'KURANG BAYAR';



        } else if (

          total > 0

        ) {



          row[statusCol] =

            'BELUM BAYAR';



        } else {



          row[statusCol] =

            'BELUM BAYAR';



        }



      } else if (

        verification ===

        'DITOLAK'

      ) {



        row[statusCol] =

          'DITOLAK';



      } else {



        /*

         * Tidak ada verifikasi.

         * Ini adalah invoice biasa yang belum dibayar.

         */

        if (

          paid > 0 &&

          total > 0 &&

          paid < total

        ) {



          row[statusCol] =

            'KURANG BAYAR';



        } else if (

          paid > 0 &&

          total > 0

        ) {



          row[statusCol] =

            'MENUNGGU VERIFIKASI';



        } else if (

          effectiveDueDate &&

          today.getTime() >

          dj39pay2StartOfDay_(

            effectiveDueDate

          ).getTime()

        ) {



          row[statusCol] =

            'TERLAMBAT';



        } else {



          row[statusCol] =

            'BELUM BAYAR';



        }



      }



      updated++;



    }

  );



  /*

   * Jangan mengubah data di sheet selain kolom pembayaran

   * yang memang menjadi tanggung jawab engine.

   */

  table.rows.forEach(

    function(_row, index) {



      sheet

        .getRange(

          table.headerRow + 1 + index,

          1,

          1,

          table.headers.length

        )

        .setValues([

          values[index]

        ]);



    }

  );



  SpreadsheetApp.flush();



  Logger.log(

    'Status pembayaran diperbarui: ' +

    updated

  );



  return updated;



}





/**

 * ============================================================

 * PUBLIC — REPAIR CURRENT PAYMENT RECORDS

 * ============================================================

 *

 * Jalankan SATU KALI setelah file ini ditambahkan.

 *

 * Fungsi ini TIDAK membuat tagihan baru.

 * Hanya menghitung ulang record pembayaran yang sudah ada.

 * ============================================================

 */

function repairCurrentPaymentStatusesDJ39V2() {



  const result =

    updatePaymentStatusDJ39();



  Logger.log(

    'Repair status pembayaran selesai.'

  );



  Logger.log(

    'Record diperiksa/diperbarui: ' +

    result

  );



  Logger.log(

    'Tidak ada row atau sheet yang dihapus.'

  );



  return {



    ok:

      true,



    updated:

      result



  };



}





/**

 * ============================================================

 * PRIVATE HELPERS

 * ============================================================

 */



function dj39pay2ReadTable_(

  sheet,

  requiredHeaders

) {



  if (

    !sheet ||

    sheet.getLastRow() < 1 ||

    sheet.getLastColumn() < 1

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

      function(header) {



        return dj39pay2Canon_(

          header

        );



      }

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

        function(value) {



          return dj39pay2Canon_(

            value

          );



        }

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



          return dj39pay2String_(

            value

          );



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





function dj39pay2Value_(

  row,

  headers,

  aliases

) {



  const col =

    dj39pay2FindColumn_(

      headers,

      aliases

    );



  return col >= 0

    ? row[col]

    : '';



}





function dj39pay2FindColumn_(

  headers,

  aliases

) {



  const normalized =

    headers.map(

      function(header) {



        return dj39pay2Canon_(

          header

        );



      }

    );



  for (

    let i = 0;

    i < aliases.length;

    i++

  ) {



    const target =

      dj39pay2Canon_(

        aliases[i]

      );



    const index =

      normalized.indexOf(

        target

      );



    if (

      index >= 0

    ) {



      return index;



    }



  }



  return -1;



}





function dj39pay2AppendObject_(

  sheet,

  headers,

  data

) {



  const row =

    headers.map(

      function(header) {



        return data[header] !== undefined

          ? data[header]

          : '';



      }

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



}





function dj39pay2BuildContractMap_(

  ss

) {



  const sheet =

    ss.getSheetByName(

      DJ39PAY2.CONTRACT_SHEET

    );



  if (!sheet) {



    return {};



  }



  const table =

    dj39pay2ReadTable_(

      sheet,

      [

        'Tenant_ID'

      ]

    );



  if (!table) {



    return {};



  }



  const map =

    {};



  table.rows.forEach(

    function(row) {



      const tenantId =

        dj39pay2String_(

          dj39pay2Value_(

            row,

            table.headers,

            [

              'Tenant_ID'

            ]

          )

        );



      if (!tenantId) {

        return;

      }



      const status =

        dj39pay2String_(

          dj39pay2Value_(

            row,

            table.headers,

            [

              'Status_Kontrak'

            ]

          )

        )

        .toUpperCase();



      if (

        status &&

        status !==

        'AKTIF'

      ) {



        return;



      }



      map[tenantId] = {



        amount:

          dj39pay2Number_(

            dj39pay2Value_(

              row,

              table.headers,

              [

                'Harga_Sewa',

                'Harga_Bulan',

                'Tarif_Kamar'

              ]

            )

          ),



        startDate:

          dj39pay2ToDate_(

            dj39pay2Value_(

              row,

              table.headers,

              [

                'Tanggal_Mulai',

                'Tanggal_Mulai_Tinggal'

              ]

            )

          ),



        room:

          dj39pay2Value_(

            row,

            table.headers,

            [

              'No_Kamar'

            ]

          )



      };



    }

  );



  return map;



}





function dj39pay2RoomPrice_(

  ss,

  room

) {



  const key =

    dj39pay2String_(

      room

    );



  if (!key) {

    return 0;

  }



  const sheet =

    ss.getSheetByName(

      DJ39PAY2.ROOM_SHEET

    );



  if (!sheet) {

    return 0;

  }



  const table =

    dj39pay2ReadTable_(

      sheet,

      [

        'No_Kamar'

      ]

    );



  if (!table) {

    return 0;

  }



  const roomCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'No_Kamar',

        'Nomor Kamar',

        'Kamar',

        'Room'

      ]

    );



  const priceCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Harga_Sewa',

        'Harga Sewa',

        'Tarif_Kamar',

        'Harga'

      ]

    );



  if (

    roomCol < 0 ||

    priceCol < 0

  ) {



    return 0;



  }



  for (

    let i = 0;

    i < table.rows.length;

    i++

  ) {



    if (

      dj39pay2String_(

        table.rows[i][roomCol]

      ) ===

      key

    ) {



      return dj39pay2Number_(

        table.rows[i][priceCol]

      );



    }



  }



  return 0;



}





function dj39pay2CalculateFine_(

  referenceDate,

  dueDate,

  dendaHari2,

  dendaHari5,

  maxDenda

) {



  const reference =

    dj39pay2StartOfDay_(

      referenceDate

    );



  const due =

    dj39pay2StartOfDay_(

      dueDate

    );



  if (

    !reference ||

    !due

  ) {



    return 0;



  }



  const lateDays =

    Math.floor(

      (

        reference.getTime() -

        due.getTime()

      ) /

      86400000

    );



  if (

    lateDays < 1

  ) {



    return 0;



  }



  let fine =

    dendaHari2;



  if (

    lateDays >= 4

  ) {



    fine +=

      dendaHari5;



  }



  if (

    fine >

    maxDenda

  ) {



    fine =

      maxDenda;



  }



  return fine;



}





function dj39pay2GetSettingNumber_(

  ss,

  key,

  fallback

) {



  const possibleSheets = [

    'Pengaturan',

    'Settings',

    'Config'

  ];



  for (

    let i = 0;

    i < possibleSheets.length;

    i++

  ) {



    const sheet =

      ss.getSheetByName(

        possibleSheets[i]

      );



    if (!sheet) {

      continue;

    }



    const lastRow =

      sheet.getLastRow();



    const lastColumn =

      sheet.getLastColumn();



    if (

      lastRow < 1 ||

      lastColumn < 1

    ) {

      continue;

    }



    const values =

      sheet

        .getRange(

          1,

          1,

          lastRow,

          lastColumn

        )

        .getValues();



    for (

      let r = 0;

      r < values.length;

      r++

    ) {



      for (

        let c = 0;

        c < values[r].length - 1;

        c++

      ) {



        const label =

          dj39pay2Canon_(

            values[r][c]

          );



        if (

          label ===

          dj39pay2Canon_(

            key

          )

        ) {



          return dj39pay2Number_(

            values[r][c + 1]

          );



        }



      }



    }



  }



  return fallback;



}





function dj39pay2NextPaymentNumber_(

  table,

  sheet

) {



  const idCol =

    dj39pay2FindColumn_(

      table.headers,

      [

        'Pembayaran_ID',

        'Payment_ID'

      ]

    );



  let max =

    0;



  if (

    idCol >= 0 &&

    sheet.getLastRow() >= 1

  ) {



    const values =

      sheet

        .getRange(

          table.headerRow + 1,

          idCol + 1,

          Math.max(

            sheet.getLastRow() -

            table.headerRow,

            0

          ),

          1

        )

        .getValues();



    values.forEach(

      function(row) {



        const match =

          dj39pay2String_(

            row[0]

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



  return max + 1;



}





function dj39pay2PaymentKey_(

  tenantId,

  period

) {



  const id =

    dj39pay2String_(

      tenantId

    );



  const parsed =

    dj39pay2CoerceDateMonth_(

      period

    );



  if (

    !id ||

    !parsed

  ) {



    return '';



  }



  return (

    id +

    '|' +

    dj39pay2MonthKey_(

      parsed

    )

  );



}





function dj39pay2PeriodLabel_(

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





function dj39pay2CoerceDateMonth_(

  value

) {



  if (!value) {

    return null;

  }



  if (

    Object.prototype.toString.call(

      value

    ) ===

    '[object Date]'

  ) {



    const d =

      new Date(

        value

      );



    if (

      isNaN(

        d.getTime()

      )

    ) {



      return null;



    }



    return new Date(

      d.getFullYear(),

      d.getMonth(),

      1

    );



  }



  const text =

    dj39pay2String_(

      value

    )

    .toLowerCase();



  const iso =

    text.match(

      /^(\d{4})-(\d{1,2})/

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



  const ym =

    text.match(

      /^(\d{1,2})[\/-](\d{4})/

    );



  if (ym) {



    return new Date(

      Number(

        ym[2]

      ),

      Number(

        ym[1]

      ) - 1,

      1

    );



  }



  const monthNames = {



    januari: 0,

    februari: 1,

    maret: 2,

    april: 3,

    mei: 4,

    juni: 5,

    juli: 6,

    agustus: 7,

    september: 8,

    oktober: 9,

    november: 10,

    desember: 11



  };



  let foundMonth =

    -1;



  Object.keys(

    monthNames

  ).some(

    function(name) {



      if (

        text.indexOf(

          name

        ) >= 0

      ) {



        foundMonth =

          monthNames[name];



        return true;



      }



      return false;



    }

  );



  const year =

    text.match(

      /20\d{2}/

    );



  if (

    foundMonth >= 0 &&

    year

  ) {



    return new Date(

      Number(

        year[0]

      ),

      foundMonth,

      1

    );



  }



  const parsed =

    new Date(

      value

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





function dj39pay2IsFirstBilling_(

  startDate,

  periodDate

) {



  const start =

    dj39pay2CoerceDateMonth_(

      startDate

    );



  const period =

    dj39pay2CoerceDateMonth_(

      periodDate

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





function dj39pay2MonthKey_(

  value

) {



  const d =

    dj39pay2CoerceDateMonth_(

      value

    );



  if (!d) {

    return '';

  }



  return (

    d.getFullYear() +

    '-' +

    String(

      d.getMonth() + 1

    ).padStart(

      2,

      '0'

    )

  );



}





function dj39pay2ToDate_(

  value

) {



  if (!value) {

    return null;

  }



  if (

    Object.prototype.toString.call(

      value

    ) ===

    '[object Date]'

  ) {



    const d =

      new Date(

        value

      );



    return isNaN(

      d.getTime()

    )

      ? null

      : d;



  }



  const text =

    dj39pay2String_(

      value

    );



  if (

    /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(

      text

    )

  ) {



    const parts =

      text.split(

        '/'

      );



    return new Date(

      Number(

        parts[2]

      ),

      Number(

        parts[1]

      ) - 1,

      Number(

        parts[0]

      )

    );



  }



  const parsed =

    new Date(

      value

    );



  return isNaN(

    parsed.getTime()

  )

    ? null

    : parsed;



}





function dj39pay2StartOfDay_(

  value

) {



  const date =

    dj39pay2ToDate_(

      value

    );



  if (!date) {

    return null;

  }



  date.setHours(

    0,

    0,

    0,

    0

  );



  return date;



}





function dj39pay2Number_(

  value

) {



  if (

    typeof value ===

    'number'

  ) {



    return value;



  }



  const text =

    dj39pay2String_(

      value

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





function dj39pay2String_(

  value

) {



  if (

    value === null ||

    value === undefined

  ) {



    return '';



  }



  return String(

    value

  ).trim();



}





function dj39pay2Canon_(

  value

) {



  return dj39pay2String_(

    value

  )

  .toLowerCase()

  .replace(

    /[^a-z0-9]/g,

    ''

  );



}