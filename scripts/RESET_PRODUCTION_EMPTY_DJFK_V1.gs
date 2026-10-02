/**

 * ============================================================

 * DJ FAMILY KOST

 * PRODUCTION EMPTY RESET V1

 * ============================================================

 *

 * FUNGSI:

 * 1. Menghapus DATA TEST/OPERASIONAL lama dari sheet:

 *      Tenant

 *      Kontrak

 *      Pembayaran

 *      Maintenance

 *      CheckInOut

 *      Pelanggaran

 *      Akun_Tenant

 *      Pendaftaran

 *      Kunjungan

 *

 * 2. Mengembalikan seluruh 39 kamar menjadi KOSONG.

 *

 * 3. TIDAK mengubah Harga_Bulan pada sheet Kamar.

 *

 * 4. TIDAK menghapus sheet.

 *

 * 5. TIDAK menghapus kolom/header.

 *

 * 6. TIDAK menghapus akun Master.

 *

 * 7. TIDAK menghapus Pengaturan.

 *

 * 8. TIDAK menghapus System_Log.

 *

 * 9. TIDAK menghapus file Google Drive.

 *

 * 10. TIDAK membuat pendaftaran tenant fiktif.

 * 11. Mengosongkan log WhatsApp automation test jika sheet tersebut ada.

 *

 * ============================================================

 * ALUR PRODUKSI SETELAH SCRIPT INI:

 *

 * Pendaftaran

 *      ↓

 * Approval Master

 *      ↓

 * Tenant + Kontrak

 *      ↓

 * Aktivasi Akun

 *      ↓

 * Login Tenant

 *      ↓

 * Bayar

 *      ↓

 * Maintenance

 *      ↓

 * Check-in / Check-out

 *      ↓

 * Akun NONAKTIF

 *      ↓

 * Kamar KOSONG

 *

 * ============================================================

 *

 * CATATAN PENTING:

 *

 * Script ini adalah TOOL TEST TERPISAH.

 *

 * Script ini TIDAK mengganti fungsi lama.

 * Script ini TIDAK mengubah fungsi API lama.

 * Script ini TIDAK mengubah fungsi login lama.

 * Script ini TIDAK membuat akun tenant langsung.

 *

 * Untuk memulai database produksi dari kondisi kosong, jalankan:

 *

 *   resetProductionEmptyDJFKV1()

 *

 * ============================================================

 */





/* ============================================================

 * KONFIGURASI TEST

 * ============================================================

 */



const DJFK_PRODUCTION_EMPTY_V1 = {



  ROOM_LIST: [



    101,

    102,

    103,

    104,

    105,

    106,

    107,

    108,

    109,



    201,

    202,

    203,

    204,

    205,

    206,

    207,

    208,

    209,

    210,



    301,

    302,

    303,

    304,

    305,

    306,

    307,

    308,

    309,

    310,



    401,

    402,

    403,

    404,

    405,

    406,

    407,

    408,

    409,

    410



  ],



  DATA_SHEETS: [



    'Tenant',

    'Kontrak',

    'Pembayaran',

    'Maintenance',

    'CheckInOut',

    'Pelanggaran',

    'Akun_Tenant',

    'Pendaftaran',

    'Kunjungan'



  ],



  OPTIONAL_TEST_SHEETS: [



    'WhatsApp_Auto_Log_DJ39'



  ]



};





/* ============================================================

 * FUNGSI UTAMA

 * ============================================================

 */



function resetProductionEmptyDJFKV1() {



  const ui =

    SpreadsheetApp.getUi();





  const confirmation =

    ui.alert(



      'RESET DATABASE PRODUKSI',



      'PERINGATAN!\\\n\\\n' +



      'Semua data operasional yang sekarang ada akan dikosongkan dari:\\\n' +



      'Tenant\\\n' +

      'Kontrak\\\n' +

      'Pembayaran\\\n' +

      'Maintenance\\\n' +

      'CheckInOut\\\n' +

      'Pelanggaran\\\n' +

      'Akun_Tenant\\\n' +

      'Pendaftaran\\\n' +

      'Kunjungan\\\n\\\n' +



      'Semua 39 kamar akan dikembalikan menjadi KOSONG.\\\n' +

      'Harga kamar TIDAK diubah.\\\n\\\n' +



      'Log WhatsApp automation test akan dikosongkan jika tersedia.\\\n\\\n' +



      'TIDAK ada tenant fiktif atau pendaftaran test yang akan dibuat.\\\n\\\n' +



      'Akun Master, Pengaturan, System_Log, sheet, kolom/header,\\\n' +

      'dan file Google Drive TIDAK dihapus.\\\n\\\n' +



      'Setelah selesai, tenant baru hanya masuk melalui website Pendaftaran.\\\n\\\n' +



      'Lanjutkan reset database produksi?',



      ui.ButtonSet.YES_NO



    );





  if (

    confirmation !==

    ui.Button.YES

  ) {



    return;



  }





  const ss =

    SpreadsheetApp.getActiveSpreadsheet();





  if (!ss) {



    throw new Error(

      'Spreadsheet aktif tidak ditemukan.'

    );



  }





  /*

   * ----------------------------------------------------------

   * VALIDASI SEMUA SHEET UTAMA SEBELUM ADA PERUBAHAN

   * ----------------------------------------------------------

   */



  const requiredSheets =

    DJFK_PRODUCTION_EMPTY_V1

      .DATA_SHEETS

      .concat([

        'Kamar'

      ]);





  const missingSheets =

    requiredSheets.filter(

      function(sheetName) {



        return !ss.getSheetByName(

          sheetName

        );



      }

    );





  if (

    missingSheets.length

  ) {



    throw new Error(



      'RESET DIBATALKAN.\\\n\\\n' +



      'Sheet berikut tidak ditemukan:\\\n\\\n' +



      missingSheets.join('\\\n') +



      '\\\n\\\nTidak ada data yang diubah.'



    );



  }





  const lock =

    LockService.getDocumentLock();





  lock.waitLock(

    30000

  );





  try {



    /*

     * --------------------------------------------------------

     * 1. RESET DATA OPERASIONAL

     * --------------------------------------------------------

     */



    DJFK_PRODUCTION_EMPTY_V1

      .DATA_SHEETS

      .forEach(

        function(sheetName) {



          const sheet =

            ss.getSheetByName(

              sheetName

            );





          djfkProductionResetSheetV1_(

            sheet

          );



        }

      );





    /*

     * --------------------------------------------------------

     * 2. RESET LOG WHATSAPP AUTOMATION TEST

     *

     * Hanya jika sheet tersebut memang sudah ada.

     * Jika belum ada, tidak dibuat.

     * --------------------------------------------------------

     */



    DJFK_PRODUCTION_EMPTY_V1

      .OPTIONAL_TEST_SHEETS

      .forEach(

        function(sheetName) {



          const sheet =

            ss.getSheetByName(

              sheetName

            );





          if (

            sheet

          ) {



            djfkProductionClearLogRowsV1_(

              sheet

            );



          }



        }

      );





    /*

     * --------------------------------------------------------

     * 3. RESET 39 KAMAR

     *

     * Hanya:

     *   Status

     *   Tenant_ID

     *   Nama_Tenant

     *

     * Harga kamar dan identitas kamar tetap.

     * --------------------------------------------------------

     */



    djfkProductionResetRoomsV1_(

      ss

    );





    /*

     * --------------------------------------------------------

     * 4. REFRESH ENGINE TURUNAN

     *

     * Hanya memanggil fungsi yang memang sudah ada.

     * Tidak membuat fungsi engine baru.

     * --------------------------------------------------------

     */



    djfkProductionRefreshIfAvailableV1_(

      ss

    );





    /*

     * --------------------------------------------------------

     * 5. CATAT LOG RESET

     *

     * System_Log tidak dikosongkan.

     * Hanya ditambahkan satu catatan audit.

     * --------------------------------------------------------

     */



    djfkProductionWriteLogV1_(

      ss,

      'PRODUCTION_EMPTY_RESET',



      'Database produksi dikosongkan tanpa seed tenant test. ' +

      '39 kamar dikembalikan menjadi KOSONG dan harga kamar dipertahankan.'



    );





    SpreadsheetApp.flush();





    ui.alert(



      'RESET PRODUKSI SELESAI',



      'Database produksi sekarang dalam kondisi kosong.\\\n\\\n' +



      'Data operasional kosong:\\\n' +



      'Tenant\\\n' +

      'Kontrak\\\n' +

      'Pembayaran\\\n' +

      'Maintenance\\\n' +

      'CheckInOut\\\n' +

      'Pelanggaran\\\n' +

      'Akun_Tenant\\\n' +

      'Pendaftaran\\\n' +

      'Kunjungan\\\n\\\n' +



      '39 kamar tetap tersedia dan harga kamar dipertahankan.\\\n\\\n' +



      'Tidak ada tenant fiktif yang dibuat.\\\n' +

      'Tenant berikutnya akan masuk melalui website Pendaftaran.',



      ui.ButtonSet.OK



    );





  } finally {



    lock.releaseLock();



  }



}



/* ============================================================

 * RESET DATA PADA SHEET

 * ============================================================

 *

 * ATURAN:

 * - Tidak delete row.

 * - Tidak delete sheet.

 * - Tidak delete column.

 * - Tidak delete header.

 *

 * Header row dicari dari ID/header resmi.

 *

 * Untuk sheet yang memiliki header legacy tambahan,

 * baris header tersebut juga dipertahankan.

 * ============================================================

 */



function djfkProductionResetSheetV1_(

  sheet

) {



  if (!sheet) {



    return;



  }





  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  if (

    lastRow < 1 ||

    lastColumn < 1

  ) {



    return;



  }





  const headerRow =

    djfkProductionFindHeaderRowV1_(

      sheet

    );





  if (

    headerRow < 1

  ) {



    throw new Error(



      'Header resmi tidak ditemukan pada sheet "' +

      sheet.getName() +

      '".\n' +

      'RESET DIBATALKAN untuk sheet tersebut.'



    );



  }





  if (

    lastRow <= headerRow

  ) {



    return;



  }





  /*

   * Hanya clear CONTENT.

   * Tidak menghapus row.

   * Tidak menghapus formatting.

   * Tidak menghapus kolom.

   */



  sheet

    .getRange(



      headerRow + 1,

      1,

      lastRow - headerRow,

      lastColumn



    )

    .clearContent();



}





/* ============================================================

 * FIND LAST HEADER ROW

 * ============================================================

 */



function djfkProductionFindHeaderRowV1_(

  sheet

) {



  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  if (

    lastRow < 1 ||

    lastColumn < 1

  ) {



    return -1;



  }





  const maxRows =

    Math.min(

      lastRow,

      15

    );





  const sheetName =

    sheet.getName();





  const headerCandidates = {



    Tenant: [

      'Tenant_ID'

    ],



    Kontrak: [

      'Kontrak_ID'

    ],



    Pembayaran: [

      'Pembayaran_ID',

      'Payment_ID'

    ],



    Maintenance: [

      'Maintenance_ID'

    ],



    CheckInOut: [

      'CheckInOut_ID'

    ],



    Pelanggaran: [

      'Pelanggaran_ID'

    ],



    Akun_Tenant: [

      'Tenant_ID',

      'Status_Akun'

    ],



    Pendaftaran: [

      'Pendaftaran_ID'

    ],



    Kunjungan: [

      'Kunjungan_ID'

    ],



    Kamar: [

      'No_Kamar',

      'Status'

    ]



  };





  const required =

    headerCandidates[

      sheetName

    ];





  if (!required) {



    return -1;



  }





  let bestRow =

    -1;





  let bestScore =

    -1;





  for (

    let rowNumber = 1;

    rowNumber <= maxRows;

    rowNumber++

  ) {



    const row =

      sheet

        .getRange(

          rowNumber,

          1,

          1,

          lastColumn

        )

        .getValues()[0];





    const normalized =

      row\.map(

        djfkProductionCanonV1_

      );





    let score =

      0;





    required.forEach(

      function(header) {



        const target =

          djfkProductionCanonV1_(

            header

          );





        if (

          normalized.indexOf(

            target

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

        rowNumber;



    }



  }





  if (

    bestScore < required.length

  ) {



    return -1;



  }





  return bestRow;



}





/* ============================================================

 * RESET ROOMS

 * ============================================================

 *

 * Hanya 39 kamar resmi.

 *

 * DIUBAH:

 *   Status -> KOSONG

 *   Tenant_ID -> kosong

 *   Nama_Tenant -> kosong

 *

 * TIDAK DIUBAH:

 *   Room_ID

 *   No_Kamar

 *   Lantai

 *   Harga_Bulan

 *   kolom lain

 * ============================================================

 */



function djfkProductionResetRoomsV1_(

  ss

) {



  const sheet =

    ss.getSheetByName(

      'Kamar'

    );





  if (!sheet) {



    throw new Error(

      'Sheet Kamar tidak ditemukan.'

    );



  }





  const headerRow =

    djfkProductionFindHeaderRowV1_(

      sheet

    );





  if (

    headerRow < 1

  ) {



    throw new Error(

      'Header Kamar tidak ditemukan.'

    );



  }





  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  if (

    lastRow <= headerRow

  ) {



    return;



  }





  const headers =

    sheet

      .getRange(

        headerRow,

        1,

        1,

        lastColumn

      )

      .getValues()[0];





  const roomCol =

    djfkProductionFindColumnV1_(

      headers,

      [

        'No_Kamar',

        'No Kamar',

        'Nomor Kamar'

      ]

    );





  const statusCol =

    djfkProductionFindColumnV1_(

      headers,

      [

        'Status'

      ]

    );





  const tenantCol =

    djfkProductionFindColumnV1_(

      headers,

      [

        'Tenant_ID',

        'Tenant ID'

      ]

    );





  const nameCol =

    djfkProductionFindColumnV1_(

      headers,

      [

        'Nama_Tenant',

        'Nama Tenant'

      ]

    );





  if (

    roomCol < 0

  ) {



    throw new Error(

      'Kolom No_Kamar pada sheet Kamar tidak ditemukan.'

    );



  }





  if (

    statusCol < 0

  ) {



    throw new Error(

      'Kolom Status pada sheet Kamar tidak ditemukan.'

    );



  }





  const rows =

    sheet

      .getRange(

        headerRow + 1,

        1,

        lastRow - headerRow,

        lastColumn

      )

      .getValues();





  rows.forEach(

    function(row, index) {



      const room =

        String(

          row[roomCol] || ''

        )

        .trim();





      if (

        DJFK_PRODUCTION_EMPTY_V1.ROOM_LIST

          .indexOf(

            Number(room)

          ) < 0

      ) {



        return;



      }





      const actualRow =

        headerRow +

        1 +

        index;





      sheet

        .getRange(

          actualRow,

          statusCol + 1

        )

        .setValue(

          'KOSONG'

        );





      if (

        tenantCol >= 0

      ) {



        sheet

          .getRange(

            actualRow,

            tenantCol + 1

          )

          .clearContent();



      }





      if (

        nameCol >= 0

      ) {



        sheet

          .getRange(

            actualRow,

            nameCol + 1

          )

          .clearContent();



      }



    }

  );



}





/* ============================================================

 * CLEAR WHATSAPP AUTOMATION TEST LOG

 * ============================================================

 *

 * Hanya clear data di bawah header.

 * Header dan format sheet tetap dipertahankan.

 * ============================================================

 */



function djfkProductionClearLogRowsV1_(

  sheet

) {



  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  if (

    lastRow < 2 ||

    lastColumn < 1

  ) {



    return;



  }





  const headerRow =

    djfkProductionFindHeaderRowGenericV1_(

      sheet

    );





  if (

    headerRow < 1 ||

    lastRow <= headerRow

  ) {



    return;



  }





  sheet

    .getRange(

      headerRow + 1,

      1,

      lastRow - headerRow,

      lastColumn

    )

    .clearContent();



}





/* ============================================================

 * FIND HEADER GENERIC

 * ============================================================

 *

 * Dipakai hanya untuk sheet log opsional yang sudah memiliki

 * header. Tidak membuat header baru.

 * ============================================================

 */



function djfkProductionFindHeaderRowGenericV1_(

  sheet

) {



  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  if (

    lastRow < 1 ||

    lastColumn < 1

  ) {



    return -1;



  }





  const maxRows =

    Math.min(

      lastRow,

      15

    );





  let bestRow =

    -1;





  let bestScore =

    -1;





  const requiredGroups = [



    [

      'timestamp',

      'createdat'

    ],



    [

      'campaign',

      'type'

    ],



    [

      'tenantid'

    ]



  ];





  for (

    let rowNumber = 1;

    rowNumber <= maxRows;

    rowNumber++

  ) {



    const values =

      sheet

        .getRange(

          rowNumber,

          1,

          1,

          lastColumn

        )

        .getValues()[0];





    const normalized =

      values.map(

        djfkProductionCanonV1_

      );





    let score =

      0;





    requiredGroups.forEach(

      function(group) {



        const found =

          group.some(

            function(candidate) {



              return normalized.indexOf(

                candidate

              ) >= 0;



            }

          );





        if (

          found

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

        rowNumber;



    }



  }





  if (

    bestScore <

    2

  ) {



    return -1;



  }





  return bestRow;



}





/* ============================================================

 * REFRESH DATA TURUNAN JIKA TERSEDIA

 * ============================================================

 *

 * Tidak membuat fungsi baru.

 * Hanya memanggil engine yang SUDAH ADA.

 *

 * Urutan:

 *   1. runRoomOccupancyDJFK_ jika tersedia

 *   2. refreshDashboardDJ_V5 jika tersedia

 *   3. refreshDashboardDJFK jika tersedia

 *   4. writeApiDataDJFK jika tersedia

 *

 * Semua dipanggil dalam try/catch agar reset tidak dibatalkan

 * hanya karena salah satu engine optional gagal.

 * ============================================================

 */



function djfkProductionRefreshIfAvailableV1_(

  ss

) {



  try {



    if (

      typeof runRoomOccupancyDJFK_ ===

      'function'

    ) {



      runRoomOccupancyDJFK_(

        ss

      );



    }



  } catch (error) {



    djfkProductionWriteLogV1_(

      ss,

      'TEST_RESET_REFRESH_WARNING',

      'runRoomOccupancyDJFK_ gagal: ' +

      String(

        error &&

        error.message

          ? error.message

          : error

      )

    );



  }





  try {



    if (

      typeof refreshDashboardDJ_V5 ===

      'function'

    ) {



      refreshDashboardDJ_V5();



    }



  } catch (error) {



    djfkProductionWriteLogV1_(

      ss,

      'TEST_RESET_REFRESH_WARNING',

      'refreshDashboardDJ_V5 gagal: ' +

      String(

        error &&

        error.message

          ? error.message

          : error

      )

    );



  }





  try {



    if (

      typeof refreshDashboardDJFK ===

      'function'

    ) {



      refreshDashboardDJFK();



    }



  } catch (error) {



    djfkProductionWriteLogV1_(

      ss,

      'TEST_RESET_REFRESH_WARNING',

      'refreshDashboardDJFK gagal: ' +

      String(

        error &&

        error.message

          ? error.message

          : error

      )

    );



  }





  try {



    if (

      typeof writeApiDataDJFK ===

      'function'

    ) {



      writeApiDataDJFK(

        ss

      );



    }



  } catch (error) {



    djfkProductionWriteLogV1_(

      ss,

      'TEST_RESET_REFRESH_WARNING',

      'writeApiDataDJFK gagal: ' +

      String(

        error &&

        error.message

          ? error.message

          : error

      )

    );



  }



}





/* ============================================================

 * LOG HELPER

 * ============================================================

 *

 * Tidak membuat sheet.

 * Tidak membuat kolom.

 *

 * Hanya menulis jika System_Log sudah tersedia dan header dapat

 * ditemukan.

 * ============================================================

 */



function djfkProductionWriteLogV1_(

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





    const lastColumn =

      sheet.getLastColumn();





    const lastRow =

      sheet.getLastRow();





    if (

      lastColumn < 1 ||

      lastRow < 1

    ) {



      return;



    }





    const headerRow =

      djfkProductionFindLogHeaderRowV1_(

        sheet

      );





    if (

      headerRow < 1

    ) {



      return;



    }





    const headers =

      sheet

        .getRange(

          headerRow,

          1,

          1,

          lastColumn

        )

        .getValues()[0];





    const values =

      headers.map(

        function(header) {



          const key =

            djfkProductionCanonV1_(

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

        values.length

      )

      .setValues(

        [values]

      );





  } catch (error) {



    /*

     * Log bersifat optional.

     * Kegagalan log tidak menggagalkan reset.

     */



  }



}





/* ============================================================

 * FIND SYSTEM LOG HEADER

 * ============================================================

 */



function djfkProductionFindLogHeaderRowV1_(

  sheet

) {



  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  const maxRows =

    Math.min(

      lastRow,

      15

    );





  let bestRow =

    -1;





  let bestScore =

    -1;





  for (

    let rowNumber = 1;

    rowNumber <= maxRows;

    rowNumber++

  ) {



    const values =

      sheet

        .getRange(

          rowNumber,

          1,

          1,

          lastColumn

        )

        .getValues()[0];





    const normalized =

      values.map(

        djfkProductionCanonV1_

      );





    let score =

      0;





    [

      'timestamp',

      'type',

      'message'

    ]

    .forEach(

      function(header) {



        if (

          normalized.indexOf(

            header

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

        rowNumber;



    }



  }





  if (

    bestScore < 1

  ) {



    return -1;



  }





  return bestRow;



}





/* ============================================================

 * FIND COLUMN

 * ============================================================

 */



function djfkProductionFindColumnV1_(

  headers,

  aliases

) {



  const normalized =

    headers.map(

      djfkProductionCanonV1_

    );





  for (

    let i = 0;

    i < aliases.length;

    i++

  ) {



    const target =

      djfkProductionCanonV1_(

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





/* ============================================================

 * CANONICAL HEADER

 * ============================================================

 */



function djfkProductionCanonV1_(

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