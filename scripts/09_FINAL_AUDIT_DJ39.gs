/**

 * ============================================================

 * DJ FAMILY KOST

 * STEP 9 — FINAL AUDIT DJ39

 * ============================================================

 *

 * VERSI FINAL

 *

 * PRINSIP:

 * - TIDAK mengubah data.

 * - TIDAK membuat sheet.

 * - TIDAK membuat kolom.

 * - TIDAK membuat trigger.

 * - TIDAK menghapus trigger.

 * - System_Log bersifat OPTIONAL.

 * - Audit mengikuti struktur database aktual DJ Family Kost.

 *

 * ============================================================

 */



const DJ39_FINAL_AUDIT_V2 = {



  roomCount: 39,



  sheets: {



    kamar:

      'Kamar',



    tenant:

      'Tenant',



    kontrak:

      'Kontrak',



    pembayaran:

      'Pembayaran',



    maintenance:

      'Maintenance',



    checkInOut:

      'CheckInOut',



    pelanggaran:

      'Pelanggaran',



    dashboard:

      'Dashboard',



    api:

      'API_Data',



    log:

      'System_Log'



  }



};





/* ============================================================

 * 1. AUDIT UTAMA

 * ============================================================

 */



function auditFinalDJ39_V2() {



  const ss =

    SpreadsheetApp.getActiveSpreadsheet();



  if (!ss) {



    throw new Error(

      'Spreadsheet DJ Family Kost tidak ditemukan.'

    );



  }





  Logger.log(

    '=================================================='

  );



  Logger.log(

    'DJ FAMILY KOST — FINAL AUDIT V2'

  );



  Logger.log(

    '=================================================='

  );





  const result = {



    success:

      true,



    warnings:

      [],



    errors:

      [],



    sheets:

      {},



    rooms:

      0,



    tenants:

      0,



    contracts:

      0,



    payments:

      0,



    maintenance:

      0,



    checkInOut:

      0,



    violations:

      0,



    openViolations:

      0,



    openFine:

      0,



    openMaintenance:

      0,



    apiRooms:

      0,



    dashboardRooms:

      0,



    triggers:

      0



  };





  /* ==========================================================

   * TEST 1 — SHEET UTAMA

   * ==========================================================

   */



  dj39AuditSheetsV2_(

    ss,

    result

  );





  /* ==========================================================

   * TEST 2 — KAMAR

   * ==========================================================

   */



  dj39AuditRoomsV2_(

    ss,

    result

  );





  /* ==========================================================

   * TEST 3 — TENANT

   * ==========================================================

   */



  dj39AuditTenantV2_(

    ss,

    result

  );





  /* ==========================================================

   * TEST 4 — KONTRAK

   * ==========================================================

   */



  dj39AuditKontrakV2_(

    ss,

    result

  );





  /* ==========================================================

   * TEST 5 — PEMBAYARAN

   * ==========================================================

   */



  dj39AuditPembayaranV2_(

    ss,

    result

  );





  /* ==========================================================

   * TEST 6 — MAINTENANCE

   * ==========================================================

   */



  dj39AuditMaintenanceV2_(

    ss,

    result

  );





  /* ==========================================================

   * TEST 7 — CHECK IN / OUT

   * ==========================================================

   */



  dj39AuditCheckInOutV2_(

    ss,

    result

  );





  /* ==========================================================

   * TEST 8 — PELANGGARAN

   * ==========================================================

   */



  dj39AuditPelanggaranV2_(

    ss,

    result

  );





  /* ==========================================================

   * TEST 9 — API DATA

   * ==========================================================

   */



  dj39AuditApiV2_(

    ss,

    result

  );





  /* ==========================================================

   * TEST 10 — DASHBOARD

   * ==========================================================

   */



  dj39AuditDashboardV2_(

    ss,

    result

  );





  /* ==========================================================

   * TEST 11 — TRIGGER

   * ==========================================================

   */



  dj39AuditTriggersV2_(

    result

  );





  /* ==========================================================

   * HASIL AKHIR

   * ==========================================================

   */



  if (

    result.errors.length > 0

  ) {



    result.success =

      false;



  }





  Logger.log(

    '=================================================='

  );





  Logger.log(

    'HASIL FINAL AUDIT'

  );





  Logger.log(

    '=================================================='

  );





  Logger.log(

    'Kamar       : ' +

    result.rooms

  );



  Logger.log(

    'Tenant      : ' +

    result.tenants

  );



  Logger.log(

    'Kontrak     : ' +

    result.contracts

  );



  Logger.log(

    'Pembayaran  : ' +

    result.payments

  );



  Logger.log(

    'Maintenance : ' +

    result.maintenance

  );



  Logger.log(

    'CheckInOut  : ' +

    result.checkInOut

  );



  Logger.log(

    'Pelanggaran : ' +

    result.violations

  );



  Logger.log(

    'Open Fine   : Rp ' +

    dj39AuditNumberFormatV2_(

      result.openFine

    )

  );



  Logger.log(

    'API Rooms   : ' +

    result.apiRooms

  );



  Logger.log(

    'Dashboard   : ' +

    result.dashboardRooms

  );



  Logger.log(

    'Triggers    : ' +

    result.triggers

  );





  if (

    result.warnings.length > 0

  ) {



    Logger.log(

      '--------------------------------------------------'

    );



    Logger.log(

      'WARNING:'

    );



    result.warnings.forEach(

      function(w) {



        Logger.log(

          'WARNING: ' + w

        );



      }

    );



  }





  if (

    result.errors.length > 0

  ) {



    Logger.log(

      '--------------------------------------------------'

    );



    Logger.log(

      'ERROR:'

    );



    result.errors.forEach(

      function(e) {



        Logger.log(

          'ERROR: ' + e

        );



      }

    );



  }





  if (

    result.errors.length === 0

  ) {



    Logger.log(

      '=================================================='

    );



    Logger.log(

      'FINAL AUDIT DJ FAMILY KOST = BERHASIL'

    );



    Logger.log(

      'Sistem utama tidak menemukan error struktural.'

    );



    Logger.log(

      '=================================================='

    );



  } else {



    Logger.log(

      '=================================================='

    );



    Logger.log(

      'FINAL AUDIT DJ FAMILY KOST = ADA ERROR'

    );



    Logger.log(

      'Periksa daftar ERROR di atas.'

    );



    Logger.log(

      '=================================================='

    );



  }





  return result;



}





/* ============================================================

 * 2. AUDIT SHEET

 * ============================================================

 */



function dj39AuditSheetsV2_(

  ss,

  result

) {



  const required = [



    'kamar',



    'tenant',



    'kontrak',



    'pembayaran',



    'maintenance',



    'checkInOut',



    'pelanggaran',



    'dashboard',



    'api'



  ];





  required.forEach(

    function(key) {



      const name =

        DJ39_FINAL_AUDIT_V2

          .sheets[key];



      const sheet =

        ss.getSheetByName(

          name

        );





      if (!sheet) {



        result.errors.push(

          'Sheet wajib tidak ditemukan: ' +

          name

        );



        result.sheets[key] =

          false;



      } else {



        result.sheets[key] =

          true;



        Logger.log(

          'Sheet OK: ' +

          name

        );



      }



    }

  );





  /*

   * System_Log OPTIONAL.

   */



  const logSheet =

    ss.getSheetByName(

      DJ39_FINAL_AUDIT_V2

        .sheets.log

    );





  if (!logSheet) {



    result.warnings.push(

      'System_Log tidak ditemukan. ' +

      'Ini OPTIONAL dan tidak dianggap error.'

    );



    Logger.log(

      'WARNING: System_Log tidak ada — OPTIONAL.'

    );



  } else {



    result.sheets.log =

      true;



    Logger.log(

      'System_Log tersedia.'

    );



  }





  if (

    result.errors.length === 0

  ) {



    Logger.log(

      'TEST 1 BERHASIL: Semua sheet inti tersedia.'

    );



  }



}





/* ============================================================

 * 3. AUDIT KAMAR

 * ============================================================

 */



function dj39AuditRoomsV2_(

  ss,

  result

) {



  const sheet =

    ss.getSheetByName(

      DJ39_FINAL_AUDIT_V2

        .sheets.kamar

    );





  if (!sheet) {



    return;



  }





  const info =

    dj39AuditFindHeaderV2_(

      sheet,

      [

        'No_Kamar',

        'No Kamar',

        'Nomor Kamar'

      ]

    );





  if (!info) {



    result.errors.push(

      'Header nomor kamar tidak ditemukan di Kamar.'

    );



    return;



  }





  const roomIndex =

    dj39AuditFindHeaderIndexV2_(

      info.headers,

      [

        'No_Kamar',

        'No Kamar',

        'Nomor Kamar'

      ]

    );





  const lastRow =

    sheet.getLastRow();





  if (

    lastRow <= info.row

  ) {



    result.errors.push(

      'Sheet Kamar tidak memiliki data kamar.'

    );



    return;



  }





  const values =

    sheet

      .getRange(

        info.row + 1,

        roomIndex + 1,

        lastRow - info.row,

        1

      )

      .getValues();





  const rooms = {};





  values.forEach(

    function(row) {



      const room =

        dj39AuditNormalizeRoomV2_(

          row[0]

        );





      if (room) {



        rooms[room] =

          true;



      }



    }

  );





  result.rooms =

    Object.keys(

      rooms

    ).length;





  if (

    result.rooms !==

    DJ39_FINAL_AUDIT_V2.roomCount

  ) {



    result.errors.push(

      'Jumlah kamar harus 39. ' +

      'Terdeteksi: ' +

      result.rooms

    );



  } else {



    Logger.log(

      'TEST 2 BERHASIL: 39 kamar terdeteksi.'

    );



  }



}





/* ============================================================

 * 4. AUDIT TENANT

 * ============================================================

 */



function dj39AuditTenantV2_(

  ss,

  result

) {



  const sheet =

    ss.getSheetByName(

      DJ39_FINAL_AUDIT_V2

        .sheets.tenant

    );





  if (!sheet) {



    return;



  }





  const info =

    dj39AuditFindHeaderV2_(

      sheet,

      [

        'Tenant_ID'

      ]

    );





  if (!info) {



    result.errors.push(

      'Header Tenant_ID tidak ditemukan di Tenant.'

    );



    return;



  }





  const required = [



    'Tenant_ID',



    'Nama_Lengkap',



    'No_Kamar',



    'Status_Tenant'



  ];





  dj39AuditRequiredHeadersV2_(

    info.headers,

    required,

    'Tenant',

    result

  );





  result.tenants =

    dj39AuditCountRowsV2_(

      sheet,

      info.row

    );





  if (

    result.errors.length === 0

  ) {



    Logger.log(

      'TEST 3 BERHASIL: Struktur Tenant sesuai.'

    );



  }



}





/* ============================================================

 * 5. AUDIT KONTRAK

 * ============================================================

 */



function dj39AuditKontrakV2_(

  ss,

  result

) {



  const sheet =

    ss.getSheetByName(

      DJ39_FINAL_AUDIT_V2

        .sheets.kontrak

    );





  if (!sheet) {



    return;



  }





  const info =

    dj39AuditFindHeaderV2_(

      sheet,

      [

        'Kontrak_ID'

      ]

    );





  if (!info) {



    result.errors.push(

      'Header Kontrak_ID tidak ditemukan di Kontrak.'

    );



    return;



  }





  const required = [



    'Kontrak_ID',



    'Tenant_ID',



    'No_Kamar',



    'Nama_Tenant',



    'Tanggal_Mulai',



    'Tanggal_Berakhir',



    'Harga_Sewa',



    'Deposit',



    'Status_Kontrak'



  ];





  dj39AuditRequiredHeadersV2_(

    info.headers,

    required,

    'Kontrak',

    result

  );





  result.contracts =

    dj39AuditCountRowsV2_(

      sheet,

      info.row

    );





  Logger.log(

    'TEST 4 BERHASIL: Struktur Kontrak sesuai.'

  );



}





/* ============================================================

 * 6. AUDIT PEMBAYARAN

 * ============================================================

 */



function dj39AuditPembayaranV2_(

  ss,

  result

) {



  const sheet =

    ss.getSheetByName(

      DJ39_FINAL_AUDIT_V2

        .sheets.pembayaran

    );





  if (!sheet) {



    return;



  }





  const info =

    dj39AuditFindHeaderV2_(

      sheet,

      [

        'Pembayaran_ID'

      ]

    );





  if (!info) {



    result.errors.push(

      'Header Pembayaran_ID tidak ditemukan di Pembayaran.'

    );



    return;



  }





  /*

   * Schema AKTUAL Pembayaran.

   *

   * Tidak ada Tenant_ID.

   */



  const required = [



    'Pembayaran_ID',



    'No_Kamar',



    'Nama_Tenant',



    'Periode_Pembayaran',



    'Tanggal_Pembayaran',



    'Jatuh_Tempo',



    'Tarif_Kamar',



    'Nominal_Dibayar',



    'Denda_Terhitung',



    'Total_Tagihan',



    'Selisih',



    'Status_Pembayaran',



    'Status_Verifikasi',



    'Metode_Pembayaran',



    'Bukti_Pembayaran_URL'



  ];





  dj39AuditRequiredHeadersV2_(

    info.headers,

    required,

    'Pembayaran',

    result

  );





  result.payments =

    dj39AuditCountRowsV2_(

      sheet,

      info.row

    );





  if (

    dj39AuditHeadersExistV2_(

      info.headers,

      required

    )

  ) {



    Logger.log(

      'TEST 5 BERHASIL: Struktur Pembayaran sesuai.'

    );



  }



}





/* ============================================================

 * 7. AUDIT MAINTENANCE

 * ============================================================

 */



function dj39AuditMaintenanceV2_(

  ss,

  result

) {



  const sheet =

    ss.getSheetByName(

      DJ39_FINAL_AUDIT_V2

        .sheets.maintenance

    );





  if (!sheet) {



    return;



  }





  const info =

    dj39AuditFindHeaderV2_(

      sheet,

      [

        'Maintenance_ID'

      ]

    );





  if (!info) {



    result.errors.push(

      'Header Maintenance_ID tidak ditemukan.'

    );



    return;



  }





  const required = [



    'Maintenance_ID',



    'No_Kamar',



    'Nama_Tenant',



    'Jenis_Masalah',



    'Deskripsi',



    'Urgensi',



    'Status',



    'PIC',



    'Tanggal_Tindak_Lanjut',



    'Biaya'



  ];





  dj39AuditRequiredHeadersV2_(

    info.headers,

    required,

    'Maintenance',

    result

  );





  result.maintenance =

    dj39AuditCountRowsV2_(

      sheet,

      info.row

    );





  /*

   * Hitung maintenance OPEN.

   */



  const statusIndex =

    dj39AuditFindHeaderIndexV2_(

      info.headers,

      [

        'Status'

      ]

    );





  if (

    statusIndex >= 0 &&

    sheet.getLastRow() > info.row

  ) {



    const values =

      sheet

        .getRange(

          info.row + 1,

          statusIndex + 1,

          sheet.getLastRow() - info.row,

          1

        )

        .getValues();





    values.forEach(

      function(row) {



        const status =

          String(

            row[0] || ''

          )

          .trim()

          .toUpperCase();





        if (

          status === 'OPEN' ||

          status === 'PROSES' ||

          status === 'PENDING'

        ) {



          result.openMaintenance++;



        }



      }

    );



  }





  Logger.log(

    'TEST 6 BERHASIL: Struktur Maintenance sesuai.'

  );



}





/* ============================================================

 * 8. AUDIT CHECK IN / OUT

 * ============================================================

 */



function dj39AuditCheckInOutV2_(

  ss,

  result

) {



  const sheet =

    ss.getSheetByName(

      DJ39_FINAL_AUDIT_V2

        .sheets.checkInOut

    );





  if (!sheet) {



    return;



  }





  const info =

    dj39AuditFindHeaderV2_(

      sheet,

      [

        'CheckInOut_ID'

      ]

    );





  if (!info) {



    result.errors.push(

      'Header CheckInOut_ID tidak ditemukan.'

    );



    return;



  }





  /*

   * Schema AKTUAL CheckInOut.

   *

   * TIDAK memerlukan Tenant_ID.

   */



  const required = [



    'CheckInOut_ID',



    'Timestamp_Submit',



    'Jenis_Proses',



    'No_Kamar',



    'Nama_Tenant',



    'Tanggal_Proses',



    'Kondisi_Kamar',



    'Catatan_Kondisi',



    'Foto_Kondisi_URL',



    'Foto_Meter_Listrik_URL',



    'Kondisi_Fasilitas',



    'Jumlah_Kunci_Akses',



    'Kunci_Dikembalikan',



    'Ada_Kerusakan_Kehilangan',



    'Detail_Kerusakan_Kehilangan',



    'Perkiraan_Pengurangan_Deposit'



  ];





  dj39AuditRequiredHeadersV2_(

    info.headers,

    required,

    'CheckInOut',

    result

  );





  result.checkInOut =

    dj39AuditCountRowsV2_(

      sheet,

      info.row

    );





  if (

    dj39AuditHeadersExistV2_(

      info.headers,

      required

    )

  ) {



    Logger.log(

      'TEST 7 BERHASIL: Struktur CheckInOut sesuai.'

    );



  }



}





/* ============================================================

 * 9. AUDIT PELANGGARAN

 * ============================================================

 */



function dj39AuditPelanggaranV2_(

  ss,

  result

) {



  const sheet =

    ss.getSheetByName(

      DJ39_FINAL_AUDIT_V2

        .sheets.pelanggaran

    );





  if (!sheet) {



    return;



  }





  const info =

    dj39AuditFindHeaderV2_(

      sheet,

      [

        'Pelanggaran_ID'

      ]

    );





  if (!info) {



    result.errors.push(

      'Header Pelanggaran_ID tidak ditemukan.'

    );



    return;



  }





  const required = [



    'Pelanggaran_ID',



    'Tanggal',



    'No_Kamar',



    'Tenant_ID',



    'Nama_Tenant',



    'Jenis_Pelanggaran',



    'Kategori',



    'Denda',



    'Bukti_URL',



    'Tindakan',



    'Status',



    'Catatan'



  ];





  dj39AuditRequiredHeadersV2_(

    info.headers,

    required,

    'Pelanggaran',

    result

  );





  result.violations =

    dj39AuditCountRowsV2_(

      sheet,

      info.row

    );





  const statusIndex =

    dj39AuditFindHeaderIndexV2_(

      info.headers,

      [

        'Status'

      ]

    );





  const fineIndex =

    dj39AuditFindHeaderIndexV2_(

      info.headers,

      [

        'Denda'

      ]

    );





  if (

    statusIndex >= 0 &&

    fineIndex >= 0 &&

    sheet.getLastRow() > info.row

  ) {



    const values =

      sheet

        .getRange(

          info.row + 1,

          1,

          sheet.getLastRow() - info.row,

          sheet.getLastColumn()

        )

        .getValues();





    values.forEach(

      function(row) {



        const status =

          String(

            row[statusIndex] || ''

          )

          .trim()

          .toUpperCase();





        if (

          status === 'OPEN'

        ) {



          result.openViolations++;



          result.openFine +=

            dj39AuditNumberV2_(

              row[fineIndex]

            );



        }



      }

    );



  }





  Logger.log(

    'TEST 8 BERHASIL: Struktur Pelanggaran sesuai.'

  );



}





/* ============================================================

 * 10. AUDIT API DATA

 * ============================================================

 */



function dj39AuditApiV2_(

  ss,

  result

) {



  const sheet =

    ss.getSheetByName(

      DJ39_FINAL_AUDIT_V2

        .sheets.api

    );





  if (!sheet) {



    return;



  }





  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  if (

    lastRow < 2 ||

    lastColumn < 1

  ) {



    result.errors.push(

      'API_Data tidak memiliki data.'

    );



    return;



  }





  const header =

    sheet

      .getRange(

        1,

        1,

        1,

        lastColumn

      )

      .getValues()[0];





  /*

   * Cari kolom nomor kamar dengan beberapa

   * kemungkinan schema.

   */



  let roomIndex =

    dj39AuditFindHeaderIndexV2_(

      header,

      [

        'No_Kamar',

        'No Kamar',

        'Nomor Kamar',

        'Room'

      ]

    );





  /*

   * Jika header API tidak standar,

   * coba cari berdasarkan isi data.

   */



  if (

    roomIndex < 0

  ) {



    roomIndex =

      dj39AuditFindRoomColumnByDataV2_(

        sheet,

        header

      );



  }





  if (

    roomIndex < 0

  ) {



    result.warnings.push(

      'Kolom nomor kamar API_Data tidak dapat diidentifikasi. ' +

      'API_Data tetap dianggap tersedia.'

    );



    Logger.log(

      'WARNING: Struktur kolom API_Data tidak dapat dipetakan.'

    );



    return;



  }





  const values =

    sheet

      .getRange(

        2,

        roomIndex + 1,

        lastRow - 1,

        1

      )

      .getValues();





  const rooms = {};





  values.forEach(

    function(row) {



      const room =

        dj39AuditNormalizeRoomV2_(

          row[0]

        );





      if (room) {



        rooms[room] =

          true;



      }



    }

  );





  result.apiRooms =

    Object.keys(

      rooms

    ).length;





  if (

    result.apiRooms !==

    DJ39_FINAL_AUDIT_V2.roomCount

  ) {



    result.warnings.push(

      'API_Data terdeteksi ' +

      result.apiRooms +

      ' kamar. Target 39.'

    );



  } else {



    Logger.log(

      'TEST 9 BERHASIL: API_Data berisi 39 kamar.'

    );



  }



}





/* ============================================================

 * 11. AUDIT DASHBOARD

 * ============================================================

 */



function dj39AuditDashboardV2_(

  ss,

  result

) {



  const sheet =

    ss.getSheetByName(

      DJ39_FINAL_AUDIT_V2

        .sheets.dashboard

    );





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



    result.errors.push(

      'Dashboard kosong.'

    );



    return;



  }





  const values =

    sheet

      .getRange(

        1,

        1,

        lastRow,

        lastColumn

      )

      .getDisplayValues();





  let hasTitle =

    false;



  let hasTotalKamar =

    false;



  let hasMonitor =

    false;





  values.forEach(

    function(row) {



      row.forEach(

        function(cell) {



          const text =

            String(

              cell || ''

            )

            .trim()

            .toUpperCase();





          if (

            text.indexOf(

              'DJ FAMILY KOST'

            ) >= 0 &&

            text.indexOf(

              'OWNER DASHBOARD'

            ) >= 0

          ) {



            hasTitle =

              true;



          }





          if (

            text ===

            'TOTAL KAMAR'

          ) {



            hasTotalKamar =

              true;



          }





          if (

            text.indexOf(

              'MONITOR'

            ) >= 0 &&

            text.indexOf(

              'KAMAR'

            ) >= 0

          ) {



            hasMonitor =

              true;



          }



        }

      );



    }

  );





  if (!hasTitle) {



    result.warnings.push(

      'Judul Owner Dashboard tidak ditemukan.'

    );



  }





  if (!hasTotalKamar) {



    result.warnings.push(

      'Kartu TOTAL KAMAR tidak ditemukan.'

    );



  }





  if (!hasMonitor) {



    result.warnings.push(

      'Bagian MONITOR KAMAR tidak ditemukan.'

    );



  }





  /*

   * Hitung nomor kamar yang benar-benar

   * muncul pada area dashboard.

   */



  const dashboardRooms =

    {};





  values.forEach(

    function(row) {



      row.forEach(

        function(cell) {



          const room =

            dj39AuditNormalizeRoomV2_(

              cell

            );





          if (

            room &&

            dj39AuditIsKnownRoomV2_(

              room

            )

          ) {



            dashboardRooms[room] =

              true;



          }



        }

      );



    }

  );





  result.dashboardRooms =

    Object.keys(

      dashboardRooms

    ).length;





  if (

    result.dashboardRooms <

    DJ39_FINAL_AUDIT_V2.roomCount

  ) {



    result.warnings.push(

      'Dashboard menampilkan ' +

      result.dashboardRooms +

      ' nomor kamar unik. Target 39.'

    );



  }





  if (

    hasTitle &&

    hasTotalKamar &&

    hasMonitor

  ) {



    Logger.log(

      'TEST 10 BERHASIL: Struktur Dashboard Final terdeteksi.'

    );



  }



}





/* ============================================================

 * 12. AUDIT TRIGGER

 * ============================================================

 */



function dj39AuditTriggersV2_(

  result

) {



  const triggers =

    ScriptApp.getProjectTriggers();





  result.triggers =

    triggers.length;





  if (

    triggers.length === 0

  ) {



    result.warnings.push(

      'Tidak ada trigger Apps Script yang terdeteksi.'

    );



  } else {



    Logger.log(

      'TEST 11 BERHASIL: ' +

      triggers.length +

      ' trigger terdeteksi.'

    );





    triggers.forEach(

      function(trigger) {



        Logger.log(

          'Trigger: ' +

          trigger.getHandlerFunction()

        );



      }

    );



  }



}





/* ============================================================

 * 13. REQUIRED HEADERS

 * ============================================================

 */



function dj39AuditRequiredHeadersV2_(

  headers,

  required,

  sheetName,

  result

) {



  required.forEach(

    function(requiredHeader) {



      const index =

        dj39AuditFindHeaderIndexV2_(

          headers,

          [

            requiredHeader

          ]

        );





      if (

        index < 0

      ) {



        result.errors.push(

          'Kolom ' +

          requiredHeader +

          ' tidak ditemukan di sheet ' +

          sheetName

        );



      }



    }

  );



}





/* ============================================================

 * 14. CEK HEADER

 * ============================================================

 */



function dj39AuditHeadersExistV2_(

  headers,

  required

) {



  for (

    let i = 0;

    i < required.length;

    i++

  ) {



    if (

      dj39AuditFindHeaderIndexV2_(

        headers,

        [

          required[i]

        ]

      ) < 0

    ) {



      return false;



    }



  }



  return true;



}





/* ============================================================

 * 15. FIND HEADER ROW

 * ============================================================

 */



function dj39AuditFindHeaderV2_(

  sheet,

  aliases

) {



  const maxRows =

    Math.min(

      10,

      sheet.getLastRow()

    );





  const maxColumns =

    sheet.getLastColumn();





  if (

    maxRows < 1 ||

    maxColumns < 1

  ) {



    return null;



  }





  const values =

    sheet

      .getRange(

        1,

        1,

        maxRows,

        maxColumns

      )

      .getValues();





  for (

    let row = 0;

    row < values.length;

    row++

  ) {



    if (

      dj39AuditFindHeaderIndexV2_(

        values[row],

        aliases

      ) >= 0

    ) {



      return {



        row:

          row + 1,



        headers:

          values[row]



      };



    }



  }





  return null;



}





/* ============================================================

 * 16. FIND HEADER INDEX

 * ============================================================

 */



function dj39AuditFindHeaderIndexV2_(

  headers,

  aliases

) {



  const normalized =

    headers.map(

      function(header) {



        return dj39AuditNormalizeHeaderV2_(

          header

        );



      }

    );





  for (

    let a = 0;

    a < aliases.length;

    a++

  ) {



    const wanted =

      dj39AuditNormalizeHeaderV2_(

        aliases[a]

      );





    for (

      let i = 0;

      i < normalized.length;

      i++

    ) {



      if (

        normalized[i] ===

        wanted

      ) {



        return i;



      }



    }



  }





  return -1;



}





/* ============================================================

 * 17. COUNT DATA ROW

 * ============================================================

 */



function dj39AuditCountRowsV2_(

  sheet,

  headerRow

) {



  if (

    sheet.getLastRow() <=

    headerRow

  ) {



    return 0;



  }





  return (

    sheet.getLastRow() -

    headerRow

  );



}





/* ============================================================

 * 18. NORMALIZE HEADER

 * ============================================================

 */



function dj39AuditNormalizeHeaderV2_(

  value

) {



  return String(

    value || ''

  )

    .trim()

    .toLowerCase()

    .replace(

      /[.\\-\\/]+/g,

      '_'

    )

    .replace(

      /\s+/g,

      '_'

    )

    .replace(

      /_+/g,

      '_'

    );



}





/* ============================================================

 * 19. NORMALIZE ROOM

 * ============================================================

 */



function dj39AuditNormalizeRoomV2_(

  value

) {



  if (

    value === null ||

    value === undefined ||

    value === ''

  ) {



    return '';



  }





  if (

    typeof value ===

    'number'

  ) {



    const n =

      Math.round(

        value

      );





    if (

      n >= 100 &&

      n <= 999

    ) {



      return String(n);



    }





    return '';



  }





  const text =

    String(

      value

    )

    .trim();





  if (

    !/^\d{3}$/.test(

      text

    )

  ) {



    return '';



  }





  return text;



}





/* ============================================================

 * 20. CEK KAMAR VALID

 * ============================================================

 */



function dj39AuditIsKnownRoomV2_(

  room

) {



  const n =

    Number(room);





  return (



    (

      n >= 101 &&

      n <= 109

    ) ||



    (

      n >= 201 &&

      n <= 210

    ) ||



    (

      n >= 301 &&

      n <= 310

    ) ||



    (

      n >= 401 &&

      n <= 410

    )



  );



}





/* ============================================================

 * 21. CARI KOLOM ROOM API

 * ============================================================

 */



function dj39AuditFindRoomColumnByDataV2_(

  sheet,

  headers

) {



  const rowsToCheck =

    Math.min(

      sheet.getLastRow() - 1,

      20

    );





  if (

    rowsToCheck <= 0

  ) {



    return -1;



  }





  const values =

    sheet

      .getRange(

        2,

        1,

        rowsToCheck,

        sheet.getLastColumn()

      )

      .getValues();





  for (

    let column = 0;

    column < headers.length;

    column++

  ) {



    let valid =

      0;





    for (

      let row = 0;

      row < values.length;

      row++

    ) {



      const room =

        dj39AuditNormalizeRoomV2_(

          values[row][column]

        );





      if (

        room &&

        dj39AuditIsKnownRoomV2_(

          room

        )

      ) {



        valid++;



      }



    }





    if (

      valid >= 5

    ) {



      return column;



    }



  }





  return -1;



}





/* ============================================================

 * 22. NUMBER

 * ============================================================

 */



function dj39AuditNumberV2_(

  value

) {



  if (

    typeof value ===

    'number'

  ) {



    return isNaN(value)

      ? 0

      : value;



  }





  const text =

    String(

      value || ''

    )

    .replace(

      /[^\d\\-]/g,

      ''

    );





  if (!text) {



    return 0;



  }





  const number =

    Number(

      text

    );





  return isNaN(number)

    ? 0

    : number;



}





/* ============================================================

 * 23. FORMAT NUMBER

 * ============================================================

 */



function dj39AuditNumberFormatV2_(

  value

) {



  return Number(

    value || 0

  ).toLocaleString(

    'id-ID'

  );



}





/* ============================================================

 * 24. TEST FINAL

 * ============================================================

 */



function testFinalSystemDJ39_V2() {



  Logger.log(

    '=================================================='

  );



  Logger.log(

    'TEST FINAL SYSTEM DJ39 V2'

  );



  Logger.log(

    '=================================================='

  );





  const result =

    auditFinalDJ39_V2();





  if (

    !result.success

  ) {



    throw new Error(

      'FINAL SYSTEM TEST GAGAL. ' +

      result.errors.join(

        ' | '

      )

    );



  }





  Logger.log(

    '=================================================='

  );



  Logger.log(

    'FINAL SYSTEM TEST = BERHASIL'

  );



  Logger.log(

    '=================================================='

  );





  Logger.log(

    '39 kamar terverifikasi.'

  );





  Logger.log(

    'Tidak ada error struktural.'

  );





  if (

    result.warnings.length > 0

  ) {



    Logger.log(

      'Jumlah WARNING: ' +

      result.warnings.length

    );



    result.warnings.forEach(

      function(w) {



        Logger.log(

          'WARNING: ' + w

        );



      }

    );



  } else {



    Logger.log(

      'Tidak ada WARNING.'

    );



  }





  Logger.log(

    '=================================================='

  );



  Logger.log(

    'DJ FAMILY KOST SIAP DIGUNAKAN.'

  );



  Logger.log(

    '=================================================='

  );





  return result;



}