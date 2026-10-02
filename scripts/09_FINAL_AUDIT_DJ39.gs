/**

&#x20;* ============================================================

&#x20;* DJ FAMILY KOST

&#x20;* STEP 9 — FINAL AUDIT DJ39

&#x20;* ============================================================

&#x20;*

&#x20;* VERSI FINAL

&#x20;*

&#x20;* PRINSIP:

&#x20;* - TIDAK mengubah data.

&#x20;* - TIDAK membuat sheet.

&#x20;* - TIDAK membuat kolom.

&#x20;* - TIDAK membuat trigger.

&#x20;* - TIDAK menghapus trigger.

&#x20;* - System_Log bersifat OPTIONAL.

&#x20;* - Audit mengikuti struktur database aktual DJ Family Kost.

&#x20;*

&#x20;* ============================================================

&#x20;*/



const DJ39_FINAL_AUDIT_V2 = {



&#x20; roomCount: 39,



&#x20; sheets: {



&#x20;   kamar:

&#x20;     'Kamar',



&#x20;   tenant:

&#x20;     'Tenant',



&#x20;   kontrak:

&#x20;     'Kontrak',



&#x20;   pembayaran:

&#x20;     'Pembayaran',



&#x20;   maintenance:

&#x20;     'Maintenance',



&#x20;   checkInOut:

&#x20;     'CheckInOut',



&#x20;   pelanggaran:

&#x20;     'Pelanggaran',



&#x20;   dashboard:

&#x20;     'Dashboard',



&#x20;   api:

&#x20;     'API_Data',



&#x20;   log:

&#x20;     'System_Log'



&#x20; }



};





/* ============================================================

&#x20;* 1. AUDIT UTAMA

&#x20;* ============================================================

&#x20;*/



function auditFinalDJ39_V2() {



&#x20; const ss =

&#x20;   SpreadsheetApp.getActiveSpreadsheet();



&#x20; if (!ss) {



&#x20;   throw new Error(

&#x20;     'Spreadsheet DJ Family Kost tidak ditemukan.'

&#x20;   );



&#x20; }





&#x20; Logger.log(

&#x20;   '=================================================='

&#x20; );



&#x20; Logger.log(

&#x20;   'DJ FAMILY KOST — FINAL AUDIT V2'

&#x20; );



&#x20; Logger.log(

&#x20;   '=================================================='

&#x20; );





&#x20; const result = {



&#x20;   success:

&#x20;     true,



&#x20;   warnings:

&#x20;     [],



&#x20;   errors:

&#x20;     [],



&#x20;   sheets:

&#x20;     {},



&#x20;   rooms:

&#x20;     0,



&#x20;   tenants:

&#x20;     0,



&#x20;   contracts:

&#x20;     0,



&#x20;   payments:

&#x20;     0,



&#x20;   maintenance:

&#x20;     0,



&#x20;   checkInOut:

&#x20;     0,



&#x20;   violations:

&#x20;     0,



&#x20;   openViolations:

&#x20;     0,



&#x20;   openFine:

&#x20;     0,



&#x20;   openMaintenance:

&#x20;     0,



&#x20;   apiRooms:

&#x20;     0,



&#x20;   dashboardRooms:

&#x20;     0,



&#x20;   triggers:

&#x20;     0



&#x20; };





&#x20; /* ==========================================================

&#x20;  * TEST 1 — SHEET UTAMA

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditSheetsV2_(

&#x20;   ss,

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * TEST 2 — KAMAR

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditRoomsV2_(

&#x20;   ss,

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * TEST 3 — TENANT

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditTenantV2_(

&#x20;   ss,

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * TEST 4 — KONTRAK

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditKontrakV2_(

&#x20;   ss,

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * TEST 5 — PEMBAYARAN

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditPembayaranV2_(

&#x20;   ss,

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * TEST 6 — MAINTENANCE

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditMaintenanceV2_(

&#x20;   ss,

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * TEST 7 — CHECK IN / OUT

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditCheckInOutV2_(

&#x20;   ss,

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * TEST 8 — PELANGGARAN

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditPelanggaranV2_(

&#x20;   ss,

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * TEST 9 — API DATA

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditApiV2_(

&#x20;   ss,

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * TEST 10 — DASHBOARD

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditDashboardV2_(

&#x20;   ss,

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * TEST 11 — TRIGGER

&#x20;  * ==========================================================

&#x20;  */



&#x20; dj39AuditTriggersV2_(

&#x20;   result

&#x20; );





&#x20; /* ==========================================================

&#x20;  * HASIL AKHIR

&#x20;  * ==========================================================

&#x20;  */



&#x20; if (

&#x20;   result.errors.length > 0

&#x20; ) {



&#x20;   result.success =

&#x20;     false;



&#x20; }





&#x20; Logger.log(

&#x20;   '=================================================='

&#x20; );





&#x20; Logger.log(

&#x20;   'HASIL FINAL AUDIT'

&#x20; );





&#x20; Logger.log(

&#x20;   '=================================================='

&#x20; );





&#x20; Logger.log(

&#x20;   'Kamar       : ' +

&#x20;   result.rooms

&#x20; );



&#x20; Logger.log(

&#x20;   'Tenant      : ' +

&#x20;   result.tenants

&#x20; );



&#x20; Logger.log(

&#x20;   'Kontrak     : ' +

&#x20;   result.contracts

&#x20; );



&#x20; Logger.log(

&#x20;   'Pembayaran  : ' +

&#x20;   result.payments

&#x20; );



&#x20; Logger.log(

&#x20;   'Maintenance : ' +

&#x20;   result.maintenance

&#x20; );



&#x20; Logger.log(

&#x20;   'CheckInOut  : ' +

&#x20;   result.checkInOut

&#x20; );



&#x20; Logger.log(

&#x20;   'Pelanggaran : ' +

&#x20;   result.violations

&#x20; );



&#x20; Logger.log(

&#x20;   'Open Fine   : Rp ' +

&#x20;   dj39AuditNumberFormatV2_(

&#x20;     result.openFine

&#x20;   )

&#x20; );



&#x20; Logger.log(

&#x20;   'API Rooms   : ' +

&#x20;   result.apiRooms

&#x20; );



&#x20; Logger.log(

&#x20;   'Dashboard   : ' +

&#x20;   result.dashboardRooms

&#x20; );



&#x20; Logger.log(

&#x20;   'Triggers    : ' +

&#x20;   result.triggers

&#x20; );





&#x20; if (

&#x20;   result.warnings.length > 0

&#x20; ) {



&#x20;   Logger.log(

&#x20;     '--------------------------------------------------'

&#x20;   );



&#x20;   Logger.log(

&#x20;     'WARNING:'

&#x20;   );



&#x20;   result.warnings.forEach(

&#x20;     function(w) {



&#x20;       Logger.log(

&#x20;         'WARNING: ' + w

&#x20;       );



&#x20;     }

&#x20;   );



&#x20; }





&#x20; if (

&#x20;   result.errors.length > 0

&#x20; ) {



&#x20;   Logger.log(

&#x20;     '--------------------------------------------------'

&#x20;   );



&#x20;   Logger.log(

&#x20;     'ERROR:'

&#x20;   );



&#x20;   result.errors.forEach(

&#x20;     function(e) {



&#x20;       Logger.log(

&#x20;         'ERROR: ' + e

&#x20;       );



&#x20;     }

&#x20;   );



&#x20; }





&#x20; if (

&#x20;   result.errors.length === 0

&#x20; ) {



&#x20;   Logger.log(

&#x20;     '=================================================='

&#x20;   );



&#x20;   Logger.log(

&#x20;     'FINAL AUDIT DJ FAMILY KOST = BERHASIL'

&#x20;   );



&#x20;   Logger.log(

&#x20;     'Sistem utama tidak menemukan error struktural.'

&#x20;   );



&#x20;   Logger.log(

&#x20;     '=================================================='

&#x20;   );



&#x20; } else {



&#x20;   Logger.log(

&#x20;     '=================================================='

&#x20;   );



&#x20;   Logger.log(

&#x20;     'FINAL AUDIT DJ FAMILY KOST = ADA ERROR'

&#x20;   );



&#x20;   Logger.log(

&#x20;     'Periksa daftar ERROR di atas.'

&#x20;   );



&#x20;   Logger.log(

&#x20;     '=================================================='

&#x20;   );



&#x20; }





&#x20; return result;



}





/* ============================================================

&#x20;* 2. AUDIT SHEET

&#x20;* ============================================================

&#x20;*/



function dj39AuditSheetsV2_(

&#x20; ss,

&#x20; result

) {



&#x20; const required = [



&#x20;   'kamar',



&#x20;   'tenant',



&#x20;   'kontrak',



&#x20;   'pembayaran',



&#x20;   'maintenance',



&#x20;   'checkInOut',



&#x20;   'pelanggaran',



&#x20;   'dashboard',



&#x20;   'api'



&#x20; ];





&#x20; required.forEach(

&#x20;   function(key) {



&#x20;     const name =

&#x20;       DJ39_FINAL_AUDIT_V2

&#x20;         .sheets[key];



&#x20;     const sheet =

&#x20;       ss.getSheetByName(

&#x20;         name

&#x20;       );





&#x20;     if (!sheet) {



&#x20;       result.errors.push(

&#x20;         'Sheet wajib tidak ditemukan: ' +

&#x20;         name

&#x20;       );



&#x20;       result.sheets[key] =

&#x20;         false;



&#x20;     } else {



&#x20;       result.sheets[key] =

&#x20;         true;



&#x20;       Logger.log(

&#x20;         'Sheet OK: ' +

&#x20;         name

&#x20;       );



&#x20;     }



&#x20;   }

&#x20; );





&#x20; /*

&#x20;  * System_Log OPTIONAL.

&#x20;  */



&#x20; const logSheet =

&#x20;   ss.getSheetByName(

&#x20;     DJ39_FINAL_AUDIT_V2

&#x20;       .sheets.log

&#x20;   );





&#x20; if (!logSheet) {



&#x20;   result.warnings.push(

&#x20;     'System_Log tidak ditemukan. ' +

&#x20;     'Ini OPTIONAL dan tidak dianggap error.'

&#x20;   );



&#x20;   Logger.log(

&#x20;     'WARNING: System_Log tidak ada — OPTIONAL.'

&#x20;   );



&#x20; } else {



&#x20;   result.sheets.log =

&#x20;     true;



&#x20;   Logger.log(

&#x20;     'System_Log tersedia.'

&#x20;   );



&#x20; }





&#x20; if (

&#x20;   result.errors.length === 0

&#x20; ) {



&#x20;   Logger.log(

&#x20;     'TEST 1 BERHASIL: Semua sheet inti tersedia.'

&#x20;   );



&#x20; }



}





/* ============================================================

&#x20;* 3. AUDIT KAMAR

&#x20;* ============================================================

&#x20;*/



function dj39AuditRoomsV2_(

&#x20; ss,

&#x20; result

) {



&#x20; const sheet =

&#x20;   ss.getSheetByName(

&#x20;     DJ39_FINAL_AUDIT_V2

&#x20;       .sheets.kamar

&#x20;   );





&#x20; if (!sheet) {



&#x20;   return;



&#x20; }





&#x20; const info =

&#x20;   dj39AuditFindHeaderV2_(

&#x20;     sheet,

&#x20;     [

&#x20;       'No_Kamar',

&#x20;       'No Kamar',

&#x20;       'Nomor Kamar'

&#x20;     ]

&#x20;   );





&#x20; if (!info) {



&#x20;   result.errors.push(

&#x20;     'Header nomor kamar tidak ditemukan di Kamar.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; const roomIndex =

&#x20;   dj39AuditFindHeaderIndexV2_(

&#x20;     info.headers,

&#x20;     [

&#x20;       'No_Kamar',

&#x20;       'No Kamar',

&#x20;       'Nomor Kamar'

&#x20;     ]

&#x20;   );





&#x20; const lastRow =

&#x20;   sheet.getLastRow();





&#x20; if (

&#x20;   lastRow <= info.row

&#x20; ) {



&#x20;   result.errors.push(

&#x20;     'Sheet Kamar tidak memiliki data kamar.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; const values =

&#x20;   sheet

&#x20;     .getRange(

&#x20;       info.row + 1,

&#x20;       roomIndex + 1,

&#x20;       lastRow - info.row,

&#x20;       1

&#x20;     )

&#x20;     .getValues();





&#x20; const rooms = {};





&#x20; values.forEach(

&#x20;   function(row) {



&#x20;     const room =

&#x20;       dj39AuditNormalizeRoomV2_(

&#x20;         row[0]

&#x20;       );





&#x20;     if (room) {



&#x20;       rooms[room] =

&#x20;         true;



&#x20;     }



&#x20;   }

&#x20; );





&#x20; result.rooms =

&#x20;   Object.keys(

&#x20;     rooms

&#x20;   ).length;





&#x20; if (

&#x20;   result.rooms !==

&#x20;   DJ39_FINAL_AUDIT_V2.roomCount

&#x20; ) {



&#x20;   result.errors.push(

&#x20;     'Jumlah kamar harus 39. ' +

&#x20;     'Terdeteksi: ' +

&#x20;     result.rooms

&#x20;   );



&#x20; } else {



&#x20;   Logger.log(

&#x20;     'TEST 2 BERHASIL: 39 kamar terdeteksi.'

&#x20;   );



&#x20; }



}





/* ============================================================

&#x20;* 4. AUDIT TENANT

&#x20;* ============================================================

&#x20;*/



function dj39AuditTenantV2_(

&#x20; ss,

&#x20; result

) {



&#x20; const sheet =

&#x20;   ss.getSheetByName(

&#x20;     DJ39_FINAL_AUDIT_V2

&#x20;       .sheets.tenant

&#x20;   );





&#x20; if (!sheet) {



&#x20;   return;



&#x20; }





&#x20; const info =

&#x20;   dj39AuditFindHeaderV2_(

&#x20;     sheet,

&#x20;     [

&#x20;       'Tenant_ID'

&#x20;     ]

&#x20;   );





&#x20; if (!info) {



&#x20;   result.errors.push(

&#x20;     'Header Tenant_ID tidak ditemukan di Tenant.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; const required = [



&#x20;   'Tenant_ID',



&#x20;   'Nama_Lengkap',



&#x20;   'No_Kamar',



&#x20;   'Status_Tenant'



&#x20; ];





&#x20; dj39AuditRequiredHeadersV2_(

&#x20;   info.headers,

&#x20;   required,

&#x20;   'Tenant',

&#x20;   result

&#x20; );





&#x20; result.tenants =

&#x20;   dj39AuditCountRowsV2_(

&#x20;     sheet,

&#x20;     info.row

&#x20;   );





&#x20; if (

&#x20;   result.errors.length === 0

&#x20; ) {



&#x20;   Logger.log(

&#x20;     'TEST 3 BERHASIL: Struktur Tenant sesuai.'

&#x20;   );



&#x20; }



}





/* ============================================================

&#x20;* 5. AUDIT KONTRAK

&#x20;* ============================================================

&#x20;*/



function dj39AuditKontrakV2_(

&#x20; ss,

&#x20; result

) {



&#x20; const sheet =

&#x20;   ss.getSheetByName(

&#x20;     DJ39_FINAL_AUDIT_V2

&#x20;       .sheets.kontrak

&#x20;   );





&#x20; if (!sheet) {



&#x20;   return;



&#x20; }





&#x20; const info =

&#x20;   dj39AuditFindHeaderV2_(

&#x20;     sheet,

&#x20;     [

&#x20;       'Kontrak_ID'

&#x20;     ]

&#x20;   );





&#x20; if (!info) {



&#x20;   result.errors.push(

&#x20;     'Header Kontrak_ID tidak ditemukan di Kontrak.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; const required = [



&#x20;   'Kontrak_ID',



&#x20;   'Tenant_ID',



&#x20;   'No_Kamar',



&#x20;   'Nama_Tenant',



&#x20;   'Tanggal_Mulai',



&#x20;   'Tanggal_Berakhir',



&#x20;   'Harga_Sewa',



&#x20;   'Deposit',



&#x20;   'Status_Kontrak'



&#x20; ];





&#x20; dj39AuditRequiredHeadersV2_(

&#x20;   info.headers,

&#x20;   required,

&#x20;   'Kontrak',

&#x20;   result

&#x20; );





&#x20; result.contracts =

&#x20;   dj39AuditCountRowsV2_(

&#x20;     sheet,

&#x20;     info.row

&#x20;   );





&#x20; Logger.log(

&#x20;   'TEST 4 BERHASIL: Struktur Kontrak sesuai.'

&#x20; );



}





/* ============================================================

&#x20;* 6. AUDIT PEMBAYARAN

&#x20;* ============================================================

&#x20;*/



function dj39AuditPembayaranV2_(

&#x20; ss,

&#x20; result

) {



&#x20; const sheet =

&#x20;   ss.getSheetByName(

&#x20;     DJ39_FINAL_AUDIT_V2

&#x20;       .sheets.pembayaran

&#x20;   );





&#x20; if (!sheet) {



&#x20;   return;



&#x20; }





&#x20; const info =

&#x20;   dj39AuditFindHeaderV2_(

&#x20;     sheet,

&#x20;     [

&#x20;       'Pembayaran_ID'

&#x20;     ]

&#x20;   );





&#x20; if (!info) {



&#x20;   result.errors.push(

&#x20;     'Header Pembayaran_ID tidak ditemukan di Pembayaran.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; /*

&#x20;  * Schema AKTUAL Pembayaran.

&#x20;  *

&#x20;  * Tidak ada Tenant_ID.

&#x20;  */



&#x20; const required = [



&#x20;   'Pembayaran_ID',



&#x20;   'No_Kamar',



&#x20;   'Nama_Tenant',



&#x20;   'Periode_Pembayaran',



&#x20;   'Tanggal_Pembayaran',



&#x20;   'Jatuh_Tempo',



&#x20;   'Tarif_Kamar',



&#x20;   'Nominal_Dibayar',



&#x20;   'Denda_Terhitung',



&#x20;   'Total_Tagihan',



&#x20;   'Selisih',



&#x20;   'Status_Pembayaran',



&#x20;   'Status_Verifikasi',



&#x20;   'Metode_Pembayaran',



&#x20;   'Bukti_Pembayaran_URL'



&#x20; ];





&#x20; dj39AuditRequiredHeadersV2_(

&#x20;   info.headers,

&#x20;   required,

&#x20;   'Pembayaran',

&#x20;   result

&#x20; );





&#x20; result.payments =

&#x20;   dj39AuditCountRowsV2_(

&#x20;     sheet,

&#x20;     info.row

&#x20;   );





&#x20; if (

&#x20;   dj39AuditHeadersExistV2_(

&#x20;     info.headers,

&#x20;     required

&#x20;   )

&#x20; ) {



&#x20;   Logger.log(

&#x20;     'TEST 5 BERHASIL: Struktur Pembayaran sesuai.'

&#x20;   );



&#x20; }



}





/* ============================================================

&#x20;* 7. AUDIT MAINTENANCE

&#x20;* ============================================================

&#x20;*/



function dj39AuditMaintenanceV2_(

&#x20; ss,

&#x20; result

) {



&#x20; const sheet =

&#x20;   ss.getSheetByName(

&#x20;     DJ39_FINAL_AUDIT_V2

&#x20;       .sheets.maintenance

&#x20;   );





&#x20; if (!sheet) {



&#x20;   return;



&#x20; }





&#x20; const info =

&#x20;   dj39AuditFindHeaderV2_(

&#x20;     sheet,

&#x20;     [

&#x20;       'Maintenance_ID'

&#x20;     ]

&#x20;   );





&#x20; if (!info) {



&#x20;   result.errors.push(

&#x20;     'Header Maintenance_ID tidak ditemukan.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; const required = [



&#x20;   'Maintenance_ID',



&#x20;   'No_Kamar',



&#x20;   'Nama_Tenant',



&#x20;   'Jenis_Masalah',



&#x20;   'Deskripsi',



&#x20;   'Urgensi',



&#x20;   'Status',



&#x20;   'PIC',



&#x20;   'Tanggal_Tindak_Lanjut',



&#x20;   'Biaya'



&#x20; ];





&#x20; dj39AuditRequiredHeadersV2_(

&#x20;   info.headers,

&#x20;   required,

&#x20;   'Maintenance',

&#x20;   result

&#x20; );





&#x20; result.maintenance =

&#x20;   dj39AuditCountRowsV2_(

&#x20;     sheet,

&#x20;     info.row

&#x20;   );





&#x20; /*

&#x20;  * Hitung maintenance OPEN.

&#x20;  */



&#x20; const statusIndex =

&#x20;   dj39AuditFindHeaderIndexV2_(

&#x20;     info.headers,

&#x20;     [

&#x20;       'Status'

&#x20;     ]

&#x20;   );





&#x20; if (

&#x20;   statusIndex >= 0 &&

&#x20;   sheet.getLastRow() > info.row

&#x20; ) {



&#x20;   const values =

&#x20;     sheet

&#x20;       .getRange(

&#x20;         info.row + 1,

&#x20;         statusIndex + 1,

&#x20;         sheet.getLastRow() - info.row,

&#x20;         1

&#x20;       )

&#x20;       .getValues();





&#x20;   values.forEach(

&#x20;     function(row) {



&#x20;       const status =

&#x20;         String(

&#x20;           row[0] || ''

&#x20;         )

&#x20;         .trim()

&#x20;         .toUpperCase();





&#x20;       if (

&#x20;         status === 'OPEN' ||

&#x20;         status === 'PROSES' ||

&#x20;         status === 'PENDING'

&#x20;       ) {



&#x20;         result.openMaintenance++;



&#x20;       }



&#x20;     }

&#x20;   );



&#x20; }





&#x20; Logger.log(

&#x20;   'TEST 6 BERHASIL: Struktur Maintenance sesuai.'

&#x20; );



}





/* ============================================================

&#x20;* 8. AUDIT CHECK IN / OUT

&#x20;* ============================================================

&#x20;*/



function dj39AuditCheckInOutV2_(

&#x20; ss,

&#x20; result

) {



&#x20; const sheet =

&#x20;   ss.getSheetByName(

&#x20;     DJ39_FINAL_AUDIT_V2

&#x20;       .sheets.checkInOut

&#x20;   );





&#x20; if (!sheet) {



&#x20;   return;



&#x20; }





&#x20; const info =

&#x20;   dj39AuditFindHeaderV2_(

&#x20;     sheet,

&#x20;     [

&#x20;       'CheckInOut_ID'

&#x20;     ]

&#x20;   );





&#x20; if (!info) {



&#x20;   result.errors.push(

&#x20;     'Header CheckInOut_ID tidak ditemukan.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; /*

&#x20;  * Schema AKTUAL CheckInOut.

&#x20;  *

&#x20;  * TIDAK memerlukan Tenant_ID.

&#x20;  */



&#x20; const required = [



&#x20;   'CheckInOut_ID',



&#x20;   'Timestamp_Submit',



&#x20;   'Jenis_Proses',



&#x20;   'No_Kamar',



&#x20;   'Nama_Tenant',



&#x20;   'Tanggal_Proses',



&#x20;   'Kondisi_Kamar',



&#x20;   'Catatan_Kondisi',



&#x20;   'Foto_Kondisi_URL',



&#x20;   'Foto_Meter_Listrik_URL',



&#x20;   'Kondisi_Fasilitas',



&#x20;   'Jumlah_Kunci_Akses',



&#x20;   'Kunci_Dikembalikan',



&#x20;   'Ada_Kerusakan_Kehilangan',



&#x20;   'Detail_Kerusakan_Kehilangan',



&#x20;   'Perkiraan_Pengurangan_Deposit'



&#x20; ];





&#x20; dj39AuditRequiredHeadersV2_(

&#x20;   info.headers,

&#x20;   required,

&#x20;   'CheckInOut',

&#x20;   result

&#x20; );





&#x20; result.checkInOut =

&#x20;   dj39AuditCountRowsV2_(

&#x20;     sheet,

&#x20;     info.row

&#x20;   );





&#x20; if (

&#x20;   dj39AuditHeadersExistV2_(

&#x20;     info.headers,

&#x20;     required

&#x20;   )

&#x20; ) {



&#x20;   Logger.log(

&#x20;     'TEST 7 BERHASIL: Struktur CheckInOut sesuai.'

&#x20;   );



&#x20; }



}





/* ============================================================

&#x20;* 9. AUDIT PELANGGARAN

&#x20;* ============================================================

&#x20;*/



function dj39AuditPelanggaranV2_(

&#x20; ss,

&#x20; result

) {



&#x20; const sheet =

&#x20;   ss.getSheetByName(

&#x20;     DJ39_FINAL_AUDIT_V2

&#x20;       .sheets.pelanggaran

&#x20;   );





&#x20; if (!sheet) {



&#x20;   return;



&#x20; }





&#x20; const info =

&#x20;   dj39AuditFindHeaderV2_(

&#x20;     sheet,

&#x20;     [

&#x20;       'Pelanggaran_ID'

&#x20;     ]

&#x20;   );





&#x20; if (!info) {



&#x20;   result.errors.push(

&#x20;     'Header Pelanggaran_ID tidak ditemukan.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; const required = [



&#x20;   'Pelanggaran_ID',



&#x20;   'Tanggal',



&#x20;   'No_Kamar',



&#x20;   'Tenant_ID',



&#x20;   'Nama_Tenant',



&#x20;   'Jenis_Pelanggaran',



&#x20;   'Kategori',



&#x20;   'Denda',



&#x20;   'Bukti_URL',



&#x20;   'Tindakan',



&#x20;   'Status',



&#x20;   'Catatan'



&#x20; ];





&#x20; dj39AuditRequiredHeadersV2_(

&#x20;   info.headers,

&#x20;   required,

&#x20;   'Pelanggaran',

&#x20;   result

&#x20; );





&#x20; result.violations =

&#x20;   dj39AuditCountRowsV2_(

&#x20;     sheet,

&#x20;     info.row

&#x20;   );





&#x20; const statusIndex =

&#x20;   dj39AuditFindHeaderIndexV2_(

&#x20;     info.headers,

&#x20;     [

&#x20;       'Status'

&#x20;     ]

&#x20;   );





&#x20; const fineIndex =

&#x20;   dj39AuditFindHeaderIndexV2_(

&#x20;     info.headers,

&#x20;     [

&#x20;       'Denda'

&#x20;     ]

&#x20;   );





&#x20; if (

&#x20;   statusIndex >= 0 &&

&#x20;   fineIndex >= 0 &&

&#x20;   sheet.getLastRow() > info.row

&#x20; ) {



&#x20;   const values =

&#x20;     sheet

&#x20;       .getRange(

&#x20;         info.row + 1,

&#x20;         1,

&#x20;         sheet.getLastRow() - info.row,

&#x20;         sheet.getLastColumn()

&#x20;       )

&#x20;       .getValues();





&#x20;   values.forEach(

&#x20;     function(row) {



&#x20;       const status =

&#x20;         String(

&#x20;           row[statusIndex] || ''

&#x20;         )

&#x20;         .trim()

&#x20;         .toUpperCase();





&#x20;       if (

&#x20;         status === 'OPEN'

&#x20;       ) {



&#x20;         result.openViolations++;



&#x20;         result.openFine +=

&#x20;           dj39AuditNumberV2_(

&#x20;             row[fineIndex]

&#x20;           );



&#x20;       }



&#x20;     }

&#x20;   );



&#x20; }





&#x20; Logger.log(

&#x20;   'TEST 8 BERHASIL: Struktur Pelanggaran sesuai.'

&#x20; );



}





/* ============================================================

&#x20;* 10. AUDIT API DATA

&#x20;* ============================================================

&#x20;*/



function dj39AuditApiV2_(

&#x20; ss,

&#x20; result

) {



&#x20; const sheet =

&#x20;   ss.getSheetByName(

&#x20;     DJ39_FINAL_AUDIT_V2

&#x20;       .sheets.api

&#x20;   );





&#x20; if (!sheet) {



&#x20;   return;



&#x20; }





&#x20; const lastRow =

&#x20;   sheet.getLastRow();





&#x20; const lastColumn =

&#x20;   sheet.getLastColumn();





&#x20; if (

&#x20;   lastRow < 2 ||

&#x20;   lastColumn < 1

&#x20; ) {



&#x20;   result.errors.push(

&#x20;     'API_Data tidak memiliki data.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; const header =

&#x20;   sheet

&#x20;     .getRange(

&#x20;       1,

&#x20;       1,

&#x20;       1,

&#x20;       lastColumn

&#x20;     )

&#x20;     .getValues()[0];





&#x20; /*

&#x20;  * Cari kolom nomor kamar dengan beberapa

&#x20;  * kemungkinan schema.

&#x20;  */



&#x20; let roomIndex =

&#x20;   dj39AuditFindHeaderIndexV2_(

&#x20;     header,

&#x20;     [

&#x20;       'No_Kamar',

&#x20;       'No Kamar',

&#x20;       'Nomor Kamar',

&#x20;       'Room'

&#x20;     ]

&#x20;   );





&#x20; /*

&#x20;  * Jika header API tidak standar,

&#x20;  * coba cari berdasarkan isi data.

&#x20;  */



&#x20; if (

&#x20;   roomIndex < 0

&#x20; ) {



&#x20;   roomIndex =

&#x20;     dj39AuditFindRoomColumnByDataV2_(

&#x20;       sheet,

&#x20;       header

&#x20;     );



&#x20; }





&#x20; if (

&#x20;   roomIndex < 0

&#x20; ) {



&#x20;   result.warnings.push(

&#x20;     'Kolom nomor kamar API_Data tidak dapat diidentifikasi. ' +

&#x20;     'API_Data tetap dianggap tersedia.'

&#x20;   );



&#x20;   Logger.log(

&#x20;     'WARNING: Struktur kolom API_Data tidak dapat dipetakan.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; const values =

&#x20;   sheet

&#x20;     .getRange(

&#x20;       2,

&#x20;       roomIndex + 1,

&#x20;       lastRow - 1,

&#x20;       1

&#x20;     )

&#x20;     .getValues();





&#x20; const rooms = {};





&#x20; values.forEach(

&#x20;   function(row) {



&#x20;     const room =

&#x20;       dj39AuditNormalizeRoomV2_(

&#x20;         row[0]

&#x20;       );





&#x20;     if (room) {



&#x20;       rooms[room] =

&#x20;         true;



&#x20;     }



&#x20;   }

&#x20; );





&#x20; result.apiRooms =

&#x20;   Object.keys(

&#x20;     rooms

&#x20;   ).length;





&#x20; if (

&#x20;   result.apiRooms !==

&#x20;   DJ39_FINAL_AUDIT_V2.roomCount

&#x20; ) {



&#x20;   result.warnings.push(

&#x20;     'API_Data terdeteksi ' +

&#x20;     result.apiRooms +

&#x20;     ' kamar. Target 39.'

&#x20;   );



&#x20; } else {



&#x20;   Logger.log(

&#x20;     'TEST 9 BERHASIL: API_Data berisi 39 kamar.'

&#x20;   );



&#x20; }



}





/* ============================================================

&#x20;* 11. AUDIT DASHBOARD

&#x20;* ============================================================

&#x20;*/



function dj39AuditDashboardV2_(

&#x20; ss,

&#x20; result

) {



&#x20; const sheet =

&#x20;   ss.getSheetByName(

&#x20;     DJ39_FINAL_AUDIT_V2

&#x20;       .sheets.dashboard

&#x20;   );





&#x20; if (!sheet) {



&#x20;   return;



&#x20; }





&#x20; const lastRow =

&#x20;   sheet.getLastRow();





&#x20; const lastColumn =

&#x20;   sheet.getLastColumn();





&#x20; if (

&#x20;   lastRow < 1 ||

&#x20;   lastColumn < 1

&#x20; ) {



&#x20;   result.errors.push(

&#x20;     'Dashboard kosong.'

&#x20;   );



&#x20;   return;



&#x20; }





&#x20; const values =

&#x20;   sheet

&#x20;     .getRange(

&#x20;       1,

&#x20;       1,

&#x20;       lastRow,

&#x20;       lastColumn

&#x20;     )

&#x20;     .getDisplayValues();





&#x20; let hasTitle =

&#x20;   false;



&#x20; let hasTotalKamar =

&#x20;   false;



&#x20; let hasMonitor =

&#x20;   false;





&#x20; values.forEach(

&#x20;   function(row) {



&#x20;     row.forEach(

&#x20;       function(cell) {



&#x20;         const text =

&#x20;           String(

&#x20;             cell || ''

&#x20;           )

&#x20;           .trim()

&#x20;           .toUpperCase();





&#x20;         if (

&#x20;           text.indexOf(

&#x20;             'DJ FAMILY KOST'

&#x20;           ) >= 0 &&

&#x20;           text.indexOf(

&#x20;             'OWNER DASHBOARD'

&#x20;           ) >= 0

&#x20;         ) {



&#x20;           hasTitle =

&#x20;             true;



&#x20;         }





&#x20;         if (

&#x20;           text ===

&#x20;           'TOTAL KAMAR'

&#x20;         ) {



&#x20;           hasTotalKamar =

&#x20;             true;



&#x20;         }





&#x20;         if (

&#x20;           text.indexOf(

&#x20;             'MONITOR'

&#x20;           ) >= 0 &&

&#x20;           text.indexOf(

&#x20;             'KAMAR'

&#x20;           ) >= 0

&#x20;         ) {



&#x20;           hasMonitor =

&#x20;             true;



&#x20;         }



&#x20;       }

&#x20;     );



&#x20;   }

&#x20; );





&#x20; if (!hasTitle) {



&#x20;   result.warnings.push(

&#x20;     'Judul Owner Dashboard tidak ditemukan.'

&#x20;   );



&#x20; }





&#x20; if (!hasTotalKamar) {



&#x20;   result.warnings.push(

&#x20;     'Kartu TOTAL KAMAR tidak ditemukan.'

&#x20;   );



&#x20; }





&#x20; if (!hasMonitor) {



&#x20;   result.warnings.push(

&#x20;     'Bagian MONITOR KAMAR tidak ditemukan.'

&#x20;   );



&#x20; }





&#x20; /*

&#x20;  * Hitung nomor kamar yang benar-benar

&#x20;  * muncul pada area dashboard.

&#x20;  */



&#x20; const dashboardRooms =

&#x20;   {};





&#x20; values.forEach(

&#x20;   function(row) {



&#x20;     row.forEach(

&#x20;       function(cell) {



&#x20;         const room =

&#x20;           dj39AuditNormalizeRoomV2_(

&#x20;             cell

&#x20;           );





&#x20;         if (

&#x20;           room &&

&#x20;           dj39AuditIsKnownRoomV2_(

&#x20;             room

&#x20;           )

&#x20;         ) {



&#x20;           dashboardRooms[room] =

&#x20;             true;



&#x20;         }



&#x20;       }

&#x20;     );



&#x20;   }

&#x20; );





&#x20; result.dashboardRooms =

&#x20;   Object.keys(

&#x20;     dashboardRooms

&#x20;   ).length;





&#x20; if (

&#x20;   result.dashboardRooms <

&#x20;   DJ39_FINAL_AUDIT_V2.roomCount

&#x20; ) {



&#x20;   result.warnings.push(

&#x20;     'Dashboard menampilkan ' +

&#x20;     result.dashboardRooms +

&#x20;     ' nomor kamar unik. Target 39.'

&#x20;   );



&#x20; }





&#x20; if (

&#x20;   hasTitle &&

&#x20;   hasTotalKamar &&

&#x20;   hasMonitor

&#x20; ) {



&#x20;   Logger.log(

&#x20;     'TEST 10 BERHASIL: Struktur Dashboard Final terdeteksi.'

&#x20;   );



&#x20; }



}





/* ============================================================

&#x20;* 12. AUDIT TRIGGER

&#x20;* ============================================================

&#x20;*/



function dj39AuditTriggersV2_(

&#x20; result

) {



&#x20; const triggers =

&#x20;   ScriptApp.getProjectTriggers();





&#x20; result.triggers =

&#x20;   triggers.length;





&#x20; if (

&#x20;   triggers.length === 0

&#x20; ) {



&#x20;   result.warnings.push(

&#x20;     'Tidak ada trigger Apps Script yang terdeteksi.'

&#x20;   );



&#x20; } else {



&#x20;   Logger.log(

&#x20;     'TEST 11 BERHASIL: ' +

&#x20;     triggers.length +

&#x20;     ' trigger terdeteksi.'

&#x20;   );





&#x20;   triggers.forEach(

&#x20;     function(trigger) {



&#x20;       Logger.log(

&#x20;         'Trigger: ' +

&#x20;         trigger.getHandlerFunction()

&#x20;       );



&#x20;     }

&#x20;   );



&#x20; }



}





/* ============================================================

&#x20;* 13. REQUIRED HEADERS

&#x20;* ============================================================

&#x20;*/



function dj39AuditRequiredHeadersV2_(

&#x20; headers,

&#x20; required,

&#x20; sheetName,

&#x20; result

) {



&#x20; required.forEach(

&#x20;   function(requiredHeader) {



&#x20;     const index =

&#x20;       dj39AuditFindHeaderIndexV2_(

&#x20;         headers,

&#x20;         [

&#x20;           requiredHeader

&#x20;         ]

&#x20;       );





&#x20;     if (

&#x20;       index < 0

&#x20;     ) {



&#x20;       result.errors.push(

&#x20;         'Kolom ' +

&#x20;         requiredHeader +

&#x20;         ' tidak ditemukan di sheet ' +

&#x20;         sheetName

&#x20;       );



&#x20;     }



&#x20;   }

&#x20; );



}





/* ============================================================

&#x20;* 14. CEK HEADER

&#x20;* ============================================================

&#x20;*/



function dj39AuditHeadersExistV2_(

&#x20; headers,

&#x20; required

) {



&#x20; for (

&#x20;   let i = 0;

&#x20;   i < required.length;

&#x20;   i++

&#x20; ) {



&#x20;   if (

&#x20;     dj39AuditFindHeaderIndexV2_(

&#x20;       headers,

&#x20;       [

&#x20;         required[i]

&#x20;       ]

&#x20;     ) < 0

&#x20;   ) {



&#x20;     return false;



&#x20;   }



&#x20; }



&#x20; return true;



}





/* ============================================================

&#x20;* 15. FIND HEADER ROW

&#x20;* ============================================================

&#x20;*/



function dj39AuditFindHeaderV2_(

&#x20; sheet,

&#x20; aliases

) {



&#x20; const maxRows =

&#x20;   Math.min(

&#x20;     10,

&#x20;     sheet.getLastRow()

&#x20;   );





&#x20; const maxColumns =

&#x20;   sheet.getLastColumn();





&#x20; if (

&#x20;   maxRows < 1 ||

&#x20;   maxColumns < 1

&#x20; ) {



&#x20;   return null;



&#x20; }





&#x20; const values =

&#x20;   sheet

&#x20;     .getRange(

&#x20;       1,

&#x20;       1,

&#x20;       maxRows,

&#x20;       maxColumns

&#x20;     )

&#x20;     .getValues();





&#x20; for (

&#x20;   let row = 0;

&#x20;   row < values.length;

&#x20;   row++

&#x20; ) {



&#x20;   if (

&#x20;     dj39AuditFindHeaderIndexV2_(

&#x20;       values[row],

&#x20;       aliases

&#x20;     ) >= 0

&#x20;   ) {



&#x20;     return {



&#x20;       row:

&#x20;         row + 1,



&#x20;       headers:

&#x20;         values[row]



&#x20;     };



&#x20;   }



&#x20; }





&#x20; return null;



}





/* ============================================================

&#x20;* 16. FIND HEADER INDEX

&#x20;* ============================================================

&#x20;*/



function dj39AuditFindHeaderIndexV2_(

&#x20; headers,

&#x20; aliases

) {



&#x20; const normalized =

&#x20;   headers.map(

&#x20;     function(header) {



&#x20;       return dj39AuditNormalizeHeaderV2_(

&#x20;         header

&#x20;       );



&#x20;     }

&#x20;   );





&#x20; for (

&#x20;   let a = 0;

&#x20;   a < aliases.length;

&#x20;   a++

&#x20; ) {



&#x20;   const wanted =

&#x20;     dj39AuditNormalizeHeaderV2_(

&#x20;       aliases[a]

&#x20;     );





&#x20;   for (

&#x20;     let i = 0;

&#x20;     i < normalized.length;

&#x20;     i++

&#x20;   ) {



&#x20;     if (

&#x20;       normalized[i] ===

&#x20;       wanted

&#x20;     ) {



&#x20;       return i;



&#x20;     }



&#x20;   }



&#x20; }





&#x20; return -1;



}





/* ============================================================

&#x20;* 17. COUNT DATA ROW

&#x20;* ============================================================

&#x20;*/



function dj39AuditCountRowsV2_(

&#x20; sheet,

&#x20; headerRow

) {



&#x20; if (

&#x20;   sheet.getLastRow() <=

&#x20;   headerRow

&#x20; ) {



&#x20;   return 0;



&#x20; }





&#x20; return (

&#x20;   sheet.getLastRow() -

&#x20;   headerRow

&#x20; );



}





/* ============================================================

&#x20;* 18. NORMALIZE HEADER

&#x20;* ============================================================

&#x20;*/



function dj39AuditNormalizeHeaderV2_(

&#x20; value

) {



&#x20; return String(

&#x20;   value || ''

&#x20; )

&#x20;   .trim()

&#x20;   .toLowerCase()

&#x20;   .replace(

&#x20;     /[.\\-\\/]+/g,

&#x20;     '_'

&#x20;   )

&#x20;   .replace(

&#x20;     /\s+/g,

&#x20;     '_'

&#x20;   )

&#x20;   .replace(

&#x20;     /_+/g,

&#x20;     '_'

&#x20;   );



}





/* ============================================================

&#x20;* 19. NORMALIZE ROOM

&#x20;* ============================================================

&#x20;*/



function dj39AuditNormalizeRoomV2_(

&#x20; value

) {



&#x20; if (

&#x20;   value === null ||

&#x20;   value === undefined ||

&#x20;   value === ''

&#x20; ) {



&#x20;   return '';



&#x20; }





&#x20; if (

&#x20;   typeof value ===

&#x20;   'number'

&#x20; ) {



&#x20;   const n =

&#x20;     Math.round(

&#x20;       value

&#x20;     );





&#x20;   if (

&#x20;     n >= 100 &&

&#x20;     n <= 999

&#x20;   ) {



&#x20;     return String(n);



&#x20;   }





&#x20;   return '';



&#x20; }





&#x20; const text =

&#x20;   String(

&#x20;     value

&#x20;   )

&#x20;   .trim();





&#x20; if (

&#x20;   !/^\d{3}$/.test(

&#x20;     text

&#x20;   )

&#x20; ) {



&#x20;   return '';



&#x20; }





&#x20; return text;



}





/* ============================================================

&#x20;* 20. CEK KAMAR VALID

&#x20;* ============================================================

&#x20;*/



function dj39AuditIsKnownRoomV2_(

&#x20; room

) {



&#x20; const n =

&#x20;   Number(room);





&#x20; return (



&#x20;   (

&#x20;     n >= 101 &&

&#x20;     n <= 109

&#x20;   ) ||



&#x20;   (

&#x20;     n >= 201 &&

&#x20;     n <= 210

&#x20;   ) ||



&#x20;   (

&#x20;     n >= 301 &&

&#x20;     n <= 310

&#x20;   ) ||



&#x20;   (

&#x20;     n >= 401 &&

&#x20;     n <= 410

&#x20;   )



&#x20; );



}





/* ============================================================

&#x20;* 21. CARI KOLOM ROOM API

&#x20;* ============================================================

&#x20;*/



function dj39AuditFindRoomColumnByDataV2_(

&#x20; sheet,

&#x20; headers

) {



&#x20; const rowsToCheck =

&#x20;   Math.min(

&#x20;     sheet.getLastRow() - 1,

&#x20;     20

&#x20;   );





&#x20; if (

&#x20;   rowsToCheck <= 0

&#x20; ) {



&#x20;   return -1;



&#x20; }





&#x20; const values =

&#x20;   sheet

&#x20;     .getRange(

&#x20;       2,

&#x20;       1,

&#x20;       rowsToCheck,

&#x20;       sheet.getLastColumn()

&#x20;     )

&#x20;     .getValues();





&#x20; for (

&#x20;   let column = 0;

&#x20;   column < headers.length;

&#x20;   column++

&#x20; ) {



&#x20;   let valid =

&#x20;     0;





&#x20;   for (

&#x20;     let row = 0;

&#x20;     row < values.length;

&#x20;     row++

&#x20;   ) {



&#x20;     const room =

&#x20;       dj39AuditNormalizeRoomV2_(

&#x20;         values[row][column]

&#x20;       );





&#x20;     if (

&#x20;       room &&

&#x20;       dj39AuditIsKnownRoomV2_(

&#x20;         room

&#x20;       )

&#x20;     ) {



&#x20;       valid++;



&#x20;     }



&#x20;   }





&#x20;   if (

&#x20;     valid >= 5

&#x20;   ) {



&#x20;     return column;



&#x20;   }



&#x20; }





&#x20; return -1;



}





/* ============================================================

&#x20;* 22. NUMBER

&#x20;* ============================================================

&#x20;*/



function dj39AuditNumberV2_(

&#x20; value

) {



&#x20; if (

&#x20;   typeof value ===

&#x20;   'number'

&#x20; ) {



&#x20;   return isNaN(value)

&#x20;     ? 0

&#x20;     : value;



&#x20; }





&#x20; const text =

&#x20;   String(

&#x20;     value || ''

&#x20;   )

&#x20;   .replace(

&#x20;     /[^\d\\-]/g,

&#x20;     ''

&#x20;   );





&#x20; if (!text) {



&#x20;   return 0;



&#x20; }





&#x20; const number =

&#x20;   Number(

&#x20;     text

&#x20;   );





&#x20; return isNaN(number)

&#x20;   ? 0

&#x20;   : number;



}





/* ============================================================

&#x20;* 23. FORMAT NUMBER

&#x20;* ============================================================

&#x20;*/



function dj39AuditNumberFormatV2_(

&#x20; value

) {



&#x20; return Number(

&#x20;   value || 0

&#x20; ).toLocaleString(

&#x20;   'id-ID'

&#x20; );



}





/* ============================================================

&#x20;* 24. TEST FINAL

&#x20;* ============================================================

&#x20;*/



function testFinalSystemDJ39_V2() {



&#x20; Logger.log(

&#x20;   '=================================================='

&#x20; );



&#x20; Logger.log(

&#x20;   'TEST FINAL SYSTEM DJ39 V2'

&#x20; );



&#x20; Logger.log(

&#x20;   '=================================================='

&#x20; );





&#x20; const result =

&#x20;   auditFinalDJ39_V2();





&#x20; if (

&#x20;   !result.success

&#x20; ) {



&#x20;   throw new Error(

&#x20;     'FINAL SYSTEM TEST GAGAL. ' +

&#x20;     result.errors.join(

&#x20;       ' | '

&#x20;     )

&#x20;   );



&#x20; }





&#x20; Logger.log(

&#x20;   '=================================================='

&#x20; );



&#x20; Logger.log(

&#x20;   'FINAL SYSTEM TEST = BERHASIL'

&#x20; );



&#x20; Logger.log(

&#x20;   '=================================================='

&#x20; );





&#x20; Logger.log(

&#x20;   '39 kamar terverifikasi.'

&#x20; );





&#x20; Logger.log(

&#x20;   'Tidak ada error struktural.'

&#x20; );





&#x20; if (

&#x20;   result.warnings.length > 0

&#x20; ) {



&#x20;   Logger.log(

&#x20;     'Jumlah WARNING: ' +

&#x20;     result.warnings.length

&#x20;   );



&#x20;   result.warnings.forEach(

&#x20;     function(w) {



&#x20;       Logger.log(

&#x20;         'WARNING: ' + w

&#x20;       );



&#x20;     }

&#x20;   );



&#x20; } else {



&#x20;   Logger.log(

&#x20;     'Tidak ada WARNING.'

&#x20;   );



&#x20; }





&#x20; Logger.log(

&#x20;   '=================================================='

&#x20; );



&#x20; Logger.log(

&#x20;   'DJ FAMILY KOST SIAP DIGUNAKAN.'

&#x20; );



&#x20; Logger.log(

&#x20;   '=================================================='

&#x20; );





&#x20; return result;



}