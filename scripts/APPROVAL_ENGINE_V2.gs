/**

 * ============================================================

 * DJ FAMILY KOST

 * APPROVAL ENGINE V2

 * ============================================================

 *

 * FUNGSI:

 * 1. Verifikasi pendaftaran dari sheet Pendaftaran

 * 2. Membuat Tenant_ID

 * 3. Membuat Kontrak_ID

 * 4. Membuat data Tenant

 * 5. Membuat data Kontrak

 * 6. Mengubah status Pendaftaran menjadi DISETUJUI

 * 7. Mengubah kamar menjadi TERISI

 * 8. Mengisi Tenant_ID dan Kontrak_ID kembali ke Pendaftaran

 *

 * AMAN:

 * - Tidak menghapus data

 * - Tidak menjalankan setup engine

 * - Tidak membuat trigger

 * - Tidak mengubah harga kamar

 * - Dapat dijalankan ulang tanpa membuat Tenant ganda

 *

 * ============================================================

 */



var DJ_APPROVAL = {

  SHEETS: {

    PENDAFTARAN: 'Pendaftaran',

    TENANT: 'Tenant',

    KONTRAK: 'Kontrak',

    KAMAR: 'Kamar',

    PENGATURAN: 'Pengaturan',

    LOG: 'System_Log'

  },



  DEFAULT_DEPOSIT: 300000

};





/**

 * ============================================================

 * TEST KHUSUS DATA FATMA

 * ============================================================

 *

 * Pendaftaran_ID:

 * REG-QPE_YHPNHOAGHEBNBX

 *

 * Jalankan fungsi ini untuk memverifikasi data test.

 */

function verifikasiFatmaTestDJ() {



  var result = verifikasiPendaftaranDJ_(

    'REG-QPE_YHPNHOAGHEBNBX'

  );



  SpreadsheetApp.getUi().alert(

    'VERIFIKASI BERHASIL\n\n' +



    'Nama: ' +

    result.nama +



    '\nKamar: ' +

    result.kamar +



    '\nTenant ID: ' +

    result.tenantId +



    '\nKontrak ID: ' +

    result.kontrakId +



    '\nHarga Sewa: Rp' +

    result.hargaSewa.toLocaleString('id-ID') +



    '\nDeposit: Rp' +

    result.deposit.toLocaleString('id-ID')

  );



  return result;

}





/**

 * ============================================================

 * VERIFIKASI UMUM

 * ============================================================

 *

 * Bisa digunakan untuk pendaftaran lain.

 */

function verifikasiPendaftaranDJ() {



  var ui = SpreadsheetApp.getUi();



  var prompt = ui.prompt(

    'Verifikasi Pendaftaran',



    'Masukkan Pendaftaran_ID yang akan diverifikasi:',



    ui.ButtonSet.OK_CANCEL

  );





  if (

    prompt.getSelectedButton() !==

    ui.Button.OK

  ) {



    return {

      ok: false,

      cancelled: true

    };



  }





  var registrationId =

    String(

      prompt.getResponseText() || ''

    ).trim();





  if (!registrationId) {



    ui.alert(

      'Pendaftaran_ID kosong. Tidak ada perubahan.'

    );



    return {

      ok: false

    };



  }





  var result =

    verifikasiPendaftaranDJ_(

      registrationId

    );





  ui.alert(



    'VERIFIKASI BERHASIL\n\n' +



    'Nama: ' +

    result.nama +



    '\nKamar: ' +

    result.kamar +



    '\nTenant ID: ' +

    result.tenantId +



    '\nKontrak ID: ' +

    result.kontrakId +



    '\nStatus Tenant: AKTIF' +



    '\nStatus Kontrak: AKTIF' +



    '\nStatus Kamar: TERISI'



  );





  return result;

}





/**

 * ============================================================

 * MESIN VERIFIKASI UTAMA

 * ============================================================

 */

function verifikasiPendaftaranDJ_(

  registrationId

) {



  var lock =

    LockService.getDocumentLock();





  lock.waitLock(30000);





  try {



    var ss =

      SpreadsheetApp.getActiveSpreadsheet();





    if (!ss) {



      throw new Error(

        'Spreadsheet DJ Family Kost tidak ditemukan.'

      );



    }





    registrationId =

      String(

        registrationId || ''

      ).trim();





    if (!registrationId) {



      throw new Error(

        'Pendaftaran_ID kosong.'

      );



    }





    /* ========================================================

       AMBIL SHEET

       \======================================================== */



    var regSheet =

      ss.getSheetByName(

        DJ_APPROVAL.SHEETS.PENDAFTARAN

      );





    var tenantSheet =

      ss.getSheetByName(

        DJ_APPROVAL.SHEETS.TENANT

      );





    var contractSheet =

      ss.getSheetByName(

        DJ_APPROVAL.SHEETS.KONTRAK

      );





    var roomSheet =

      ss.getSheetByName(

        DJ_APPROVAL.SHEETS.KAMAR

      );





    if (!regSheet) {



      throw new Error(

        'Sheet "Pendaftaran" tidak ditemukan.'

      );



    }





    if (!tenantSheet) {



      throw new Error(

        'Sheet "Tenant" tidak ditemukan.'

      );



    }





    if (!contractSheet) {



      throw new Error(

        'Sheet "Kontrak" tidak ditemukan.'

      );



    }





    if (!roomSheet) {



      throw new Error(

        'Sheet "Kamar" tidak ditemukan.'

      );



    }





    /* ========================================================

       BACA PENDAFTARAN

       \======================================================== */



    var regHeaderRow =

      djApprovalFindHeaderRow_(

        regSheet,

        [

          'Pendaftaran_ID',

          'Status_Pendaftaran'

        ]

      );





    var regHeaders =

      djApprovalHeaders_(

        regSheet,

        regHeaderRow

      );





    var regRow =

      djApprovalFindRow_(

        regSheet,

        regHeaderRow,

        regHeaders,

        [

          'Pendaftaran_ID'

        ],

        registrationId

      );





    if (regRow < 0) {



      throw new Error(

        'Pendaftaran_ID tidak ditemukan: ' +

        registrationId

      );



    }





    var raw =

      djApprovalReadRow_(

        regSheet,

        regHeaderRow,

        regRow

      );





    var status =

      djApprovalClean_(

        djApprovalValue_(

          raw,

          [

            'Status_Pendaftaran',

            'Status Pendaftaran'

          ]

        )

      ).toUpperCase();





    /* ========================================================

       CEGAH DUPLIKASI / INVALID

       \======================================================== */



    if (

      status === 'DITOLAK' ||

      status === 'REJECTED'

    ) {



      throw new Error(

        'Pendaftaran ini sudah berstatus DITOLAK. Tidak dapat diverifikasi.'

      );



    }





    var existingTenantId =

      djApprovalClean_(

        djApprovalValue_(

          raw,

          [

            'Tenant_ID',

            'Tenant ID'

          ]

        )

      );





    var existingContractId =

      djApprovalClean_(

        djApprovalValue_(

          raw,

          [

            'Kontrak_ID',

            'Contract_ID',

            'Kontrak ID'

          ]

        )

      );





    var name =

      djApprovalClean_(

        djApprovalValue_(

          raw,

          [

            'Nama_Lengkap',

            'Nama Lengkap'

          ]

        )

      );





    var registeredRoom =

      djApprovalClean_(

        djApprovalValue_(

          raw,

          [

            'No_Kamar',

            'Nomor Kamar',

            'No Kamar',

            'Kamar'

          ]

        )

      );



    var room =

      djApprovalClean_(

        finalRoom

      ) ||

      registeredRoom;





    if (!name) {



      throw new Error(

        'Nama_Lengkap pada pendaftaran kosong.'

      );



    }





    if (!room) {



      throw new Error(

        'No_Kamar pada pendaftaran kosong.'

      );



    }





    /* ========================================================

       VALIDASI KAMAR

       \======================================================== */



    var roomInfo =

      djApprovalGetRoom_(

        roomSheet,

        room

      );





    if (!roomInfo) {



      throw new Error(

        'Kamar ' +

        room +

        ' tidak ditemukan pada sheet Kamar.'

      );



    }





    var roomStatus =

      String(

        roomInfo.status || ''

      )

      .trim()

      .toUpperCase();





    var roomTenantId =

      djApprovalClean_(

        roomInfo.tenantId

      );





    if (

      !existingTenantId &&

      roomStatus === 'TERISI' &&

      roomTenantId

    ) {



      throw new Error(

        'Kamar ' +

        room +

        ' sudah TERISI oleh Tenant_ID ' +

        roomTenantId +

        '.'

      );



    }





    /* ========================================================

       TENANT

       \======================================================== */



    var tenantHeaderRow =

      djApprovalFindHeaderRow_(

        tenantSheet,

        [

          'Tenant_ID',

          'Nama_Lengkap',

          'No_Kamar'

        ]

      );





    djApprovalEnsureHeaders_(

      tenantSheet,

      tenantHeaderRow,

      [



        'Tenant_ID',



        'Source_Key',



        'Tanggal_Submit',



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



        'Tanggal_Mulai_Tinggal',



        'Status_Tenant',



        'Catatan',



        'Last_Sync'



      ]

    );





    var tenantHeaders =

      djApprovalHeaders_(

        tenantSheet,

        tenantHeaderRow

      );





    var tenantId =

      existingTenantId ||

      djApprovalNextId_(

        tenantSheet,

        tenantHeaderRow,

        tenantHeaders,

        'Tenant_ID',

        'TEN'

      );





    var sourceKey =

      'PENDAFTARAN#' +

      registrationId;





    var tenantRow =

      djApprovalFindRow_(

        tenantSheet,

        tenantHeaderRow,

        tenantHeaders,

        [

          'Tenant_ID'

        ],

        tenantId

      );





    var tenantData = {



      Tenant_ID:

        tenantId,



      Source_Key:

        sourceKey,



      Tanggal_Submit:

        djApprovalValue_(

          raw,

          [

            'Timestamp',

            'Tanggal_Submit'

          ]

        ),



      Nama_Lengkap:

        name,



      Nama_Panggilan:

        djApprovalValue_(

          raw,

          [

            'Nama_Panggilan',

            'Nama Panggilan'

          ]

        ),



      No_HP:

        djApprovalValue_(

          raw,

          [

            'No_HP',

            'No HP',

            'Nomor WhatsApp'

          ]

        ),



      Email:

        djApprovalValue_(

          raw,

          [

            'Email'

          ]

        ),



      NIK_KTP:

        djApprovalValue_(

          raw,

          [

            'NIK_KTP',

            'NIK KTP'

          ]

        ),



      Pekerjaan:

        djApprovalValue_(

          raw,

          [

            'Pekerjaan'

          ]

        ),



      Perusahaan_Instansi:

        djApprovalValue_(

          raw,

          [

            'Perusahaan_Instansi',

            'Perusahaan_Inst',

            'Perusahaan / Instansi'

          ]

        ),



      Jenis_Kelamin:

        djApprovalValue_(

          raw,

          [

            'Jenis_Kelamin',

            'Jenis Kelamin'

          ]

        ),



      Alamat:

        djApprovalValue_(

          raw,

          [

            'Alamat'

          ]

        ),



      No_Kamar:

        room,



      Tanggal_Mulai_Tinggal:

        djApprovalValue_(

          raw,

          [

            'Tanggal_Mulai_Tinggal',

            'Tanggal Mulai Tinggal',

            'Tanggal_Mulai'

          ]

        ),



      Status_Tenant:

        'AKTIF',



      Catatan:

        djApprovalValue_(

          raw,

          [

            'Catatan'

          ]

        ),



      Last_Sync:

        new Date()



    };





    if (tenantRow < 0) {



      djApprovalAppendObject_(

        tenantSheet,

        tenantHeaderRow,

        tenantHeaders,

        tenantData

      );



      tenantRow =

        tenantSheet.getLastRow();



    } else {



      djApprovalUpdateObject_(

        tenantSheet,

        tenantHeaderRow,

        tenantRow,

        tenantHeaderRow,

        tenantData

      );



    }





    /* ========================================================

       CEK HARGA KAMAR

       \======================================================== */



    var price =

      roomInfo.price;





    if (!(price > 0)) {



      throw new Error(

        'Harga kamar ' +

        room +

        ' belum tersedia atau masih Rp0. Isi Harga_Bulan terlebih dahulu.'

      );



    }





    /* ========================================================

       DEPOSIT

       \======================================================== */



    var deposit =

      djApprovalGetDeposit_(

        ss

      );





    /* ========================================================

       KONTRAK

       \======================================================== */



    var contractHeaderRow =

      djApprovalFindHeaderRow_(

        contractSheet,

        [

          'Kontrak_ID',

          'Tenant_ID',

          'No_Kamar'

        ]

      );





    djApprovalEnsureHeaders_(

      contractSheet,

      contractHeaderRow,

      [



        'Kontrak_ID',



        'Source_Key',



        'Tenant_ID',



        'No_Kamar',



        'Nama_Tenant',



        'Tanggal_Mulai',



        'Tanggal_Berakhir',



        'Harga_Sewa',



        'Deposit',



        'Status_Kontrak',



        'Catatan',



        'Last_Sync'



      ]

    );





    var contractHeaders =

      djApprovalHeaders_(

        contractSheet,

        contractHeaderRow

      );





    var contractId =

      existingContractId ||

      djApprovalNextId_(

        contractSheet,

        contractHeaderRow,

        contractHeaders,

        'Kontrak_ID',

        'KTR'

      );





    var contractRow =

      djApprovalFindRow_(

        contractSheet,

        contractHeaderRow,

        contractHeaders,

        [

          'Kontrak_ID'

        ],

        contractId

      );





    var contractData = {



      Kontrak_ID:

        contractId,



      Source_Key:

        sourceKey,



      Tenant_ID:

        tenantId,



      No_Kamar:

        room,



      Nama_Tenant:

        name,



      Tanggal_Mulai:

        tenantData.Tanggal_Mulai_Tinggal,



      Tanggal_Berakhir:

        '',



      Harga_Sewa:

        price,



      Deposit:

        deposit,



      Status_Kontrak:

        'AKTIF',



      Catatan:

        'Disetujui dari Pendaftaran ' +

        registrationId,



      Last_Sync:

        new Date()



    };





    if (contractRow < 0) {



      djApprovalAppendObject_(

        contractSheet,

        contractHeaderRow,

        contractHeaders,

        contractData

      );



    } else {



      djApprovalUpdateObject_(

        contractSheet,

        contractHeaderRow,

        contractRow,

        contractHeaderRow,

        contractData

      );



    }





    /* ========================================================

       UPDATE PENDAFTARAN

       \======================================================== */



    djApprovalEnsureHeaders_(

      regSheet,

      regHeaderRow,

      [

        'Status_Pendaftaran',

        'Tenant_ID',

        'Kontrak_ID'

      ]

    );





    var regHeadersFinal =

      djApprovalHeaders_(

        regSheet,

        regHeaderRow

      );





    djApprovalUpdateFields_(

      regSheet,

      regHeaderRow,

      regRow,

      regHeadersFinal,

      {



        Status_Pendaftaran:

          'DISETUJUI',



        Tenant_ID:

          tenantId,



        Kontrak_ID:

          contractId



      }

    );





    /* ========================================================

       UPDATE KAMAR

       \======================================================== */



    var roomHeaderRow =

      djApprovalFindHeaderRow_(

        roomSheet,

        [

          'No_Kamar',

          'Status'

        ]

      );





    djApprovalEnsureHeaders_(

      roomSheet,

      roomHeaderRow,

      [

        'No_Kamar',

        'Status',

        'Tenant_ID',

        'Nama_Tenant'

      ]

    );





    var roomHeaders =

      djApprovalHeaders_(

        roomSheet,

        roomHeaderRow

      );





    var roomRow =

      djApprovalFindRow_(

        roomSheet,

        roomHeaderRow,

        roomHeaders,

        [

          'No_Kamar',

          'Nomor Kamar'

        ],

        room

      );





    if (roomRow < 0) {



      throw new Error(

        'Baris kamar ' +

        room +

        ' tidak ditemukan.'

      );



    }





    djApprovalUpdateFields_(

      roomSheet,

      roomHeaderRow,

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





    /* ========================================================

       LOG

       \======================================================== */



    djApprovalLog_(

      ss,

      'APPROVAL',



      registrationId +

      ' -> Tenant ' +

      tenantId +

      ' -> Kontrak ' +

      contractId +

      ' -> Kamar ' +

      room

    );





    /* ========================================================

       REFRESH DASHBOARD

       \======================================================== */



    try {



      if (

        typeof refreshDashboardDJ_V5 ===

        'function'

      ) {



        refreshDashboardDJ_V5();



      }



    } catch (dashboardErr) {



      djApprovalLog_(

        ss,

        'DASHBOARD_WARNING',

        String(dashboardErr)

      );



    }





    SpreadsheetApp.flush();





    return {



      ok: true,



      pendaftaranId:

        registrationId,



      nama:

        name,



      kamar:

        room,



      tenantId:

        tenantId,



      kontrakId:

        contractId,



      hargaSewa:

        price,



      deposit:

        deposit,



      statusPendaftaran:

        'DISETUJUI'



    };





  } finally {



    lock.releaseLock();



  }



}





/**

 * ============================================================

 * FIND HEADER ROW

 * ============================================================

 */

function djApprovalFindHeaderRow_(

  sheet,

  candidates

) {



  var maxRows =

    Math.min(

      Math.max(

        sheet.getLastRow(),

        1

      ),

      10

    );





  var lastCol =

    Math.max(

      sheet.getLastColumn(),

      1

    );





  for (

    var r = 1;

    r <= maxRows;

    r++

  ) {



    var headers =

      sheet

        .getRange(

          r,

          1,

          1,

          lastCol

        )

        .getValues()[0];





    var normalized =

      headers.map(

        djApprovalNormalize_

      );





    for (

      var i = 0;

      i < candidates.length;

      i++

    ) {



      if (

        normalized.indexOf(

          djApprovalNormalize_(

            candidates[i]

          )

        ) >= 0

      ) {



        return r;



      }



    }



  }





  return 1;



}





/**

 * ============================================================

 * HEADERS

 * ============================================================

 */

function djApprovalHeaders_(

  sheet,

  headerRow

) {



  var lastCol =

    sheet.getLastColumn();





  if (lastCol === 0) {

    return [];

  }





  return sheet

    .getRange(

      headerRow,

      1,

      1,

      lastCol

    )

    .getValues()[0];



}





/**

 * ============================================================

 * ENSURE HEADERS

 * ============================================================

 */

function djApprovalEnsureHeaders_(

  sheet,

  headerRow,

  required

) {



  var headers =

    djApprovalHeaders_(

      sheet,

      headerRow

    );





  if (headers.length === 0) {



    sheet

      .getRange(

        headerRow,

        1,

        1,

        required.length

      )

      .setValues(

        [required]

      );



    return;



  }





  var normalized =

    headers.map(

      djApprovalNormalize_

    );





  for (

    var i = 0;

    i < required.length;

    i++

  ) {



    if (

      normalized.indexOf(

        djApprovalNormalize_(

          required[i]

        )

      ) < 0

    ) {



      sheet

        .getRange(

          headerRow,

          sheet.getLastColumn() + 1

        )

        .setValue(

          required[i]

        );





      normalized.push(

        djApprovalNormalize_(

          required[i]

        )

      );



    }



  }



}





/**

 * ============================================================

 * READ ROW

 * ============================================================

 */

function djApprovalReadRow_(

  sheet,

  headerRow,

  rowNumber

) {



  var headers =

    djApprovalHeaders_(

      sheet,

      headerRow

    );





  var values =

    sheet

      .getRange(

        rowNumber,

        1,

        1,

        headers.length

      )

      .getValues()[0];





  var obj = {};





  for (

    var i = 0;

    i < headers.length;

    i++

  ) {



    obj[

      djApprovalNormalize_(

        headers[i]

      )

    ] =

      values[i];



  }





  return obj;



}





/**

 * ============================================================

 * FIND ROW

 * ============================================================

 */

function djApprovalFindRow_(

  sheet,

  headerRow,

  headers,

  aliases,

  value

) {



  if (

    !headers.length ||

    sheet.getLastRow() <= headerRow

  ) {



    return -1;



  }





  var col =

    djApprovalFindColumn_(

      headers,

      aliases

    );





  if (col < 0) {

    return -1;

  }





  var count =

    sheet.getLastRow() -

    headerRow;





  var values =

    sheet

      .getRange(

        headerRow + 1,

        col + 1,

        count,

        1

      )

      .getValues();





  var needle =

    djApprovalClean_(

      value

    );





  for (

    var i = 0;

    i < values.length;

    i++

  ) {



    if (

      djApprovalClean_(

        values[i][0]

      ) === needle

    ) {



      return (

        headerRow +

        1 +

        i

      );



    }



  }





  return -1;



}





/**

 * ============================================================

 * FIND COLUMN

 * ============================================================

 */

function djApprovalFindColumn_(

  headers,

  aliases

) {



  var normalized =

    headers.map(

      djApprovalNormalize_

    );





  for (

    var i = 0;

    i < aliases.length;

    i++

  ) {



    var exact =

      normalized.indexOf(

        djApprovalNormalize_(

          aliases[i]

        )

      );





    if (exact >= 0) {

      return exact;

    }



  }





  for (

    var j = 0;

    j < aliases.length;

    j++

  ) {



    var alias =

      djApprovalNormalize_(

        aliases[j]

      );





    for (

      var k = 0;

      k < normalized.length;

      k++

    ) {



      if (

        normalized[k]

          .indexOf(alias) >= 0 ||



        alias

          .indexOf(normalized[k]) >= 0

      ) {



        return k;



      }



    }



  }





  return -1;



}





/**

 * ============================================================

 * VALUE

 * ============================================================

 */

function djApprovalValue_(

  obj,

  aliases

) {



  var keys =

    Object.keys(obj);





  for (

    var i = 0;

    i < aliases.length;

    i++

  ) {



    var exact =

      djApprovalNormalize_(

        aliases[i]

      );





    if (

      Object.prototype.hasOwnProperty

        .call(

          obj,

          exact

        )

    ) {



      return obj[exact];



    }



  }





  for (

    var j = 0;

    j < aliases.length;

    j++

  ) {



    var alias =

      djApprovalNormalize_(

        aliases[j]

      );





    for (

      var k = 0;

      k < keys.length;

      k++

    ) {



      if (

        keys[k].indexOf(alias) >= 0 ||



        alias.indexOf(keys[k]) >= 0

      ) {



        return obj[

          keys[k]

        ];



      }



    }



  }





  return '';



}





/**

 * ============================================================

 * APPEND OBJECT

 * ============================================================

 */

function djApprovalAppendObject_(

  sheet,

  headerRow,

  headers,

  data

) {



  var row = [];





  for (

    var i = 0;

    i < headers.length;

    i++

  ) {



    var key =

      headers[i];





    row.push(

      data[key] !== undefined

        ? data[key]

        : ''

    );



  }





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





/**

 * ============================================================

 * UPDATE OBJECT

 * ============================================================

 */

function djApprovalUpdateObject_(

  sheet,

  headerRow,

  rowNumber,

  unusedHeaderRow,

  data

) {



  var headers =

    djApprovalHeaders_(

      sheet,

      headerRow

    );





  var values =

    sheet

      .getRange(

        rowNumber,

        1,

        1,

        headers.length

      )

      .getValues()[0];





  var index = {};





  for (

    var i = 0;

    i < headers.length;

    i++

  ) {



    index[

      headers[i]

    ] = i;



  }





  Object.keys(

    data

  ).forEach(

    function(key) {



      if (

        index[key] !== undefined

      ) {



        values[

          index[key]

        ] =

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





/**

 * ============================================================

 * UPDATE FIELDS

 * ============================================================

 */

function djApprovalUpdateFields_(

  sheet,

  headerRow,

  rowNumber,

  headers,

  data

) {



  var values =

    sheet

      .getRange(

        rowNumber,

        1,

        1,

        headers.length

      )

      .getValues()[0];





  var index = {};





  for (

    var i = 0;

    i < headers.length;

    i++

  ) {



    index[

      headers[i]

    ] = i;



  }





  Object.keys(

    data

  ).forEach(

    function(key) {



      if (

        index[key] !== undefined

      ) {



        values[

          index[key]

        ] =

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





/**

 * ============================================================

 * AMBIL INFO KAMAR

 * ============================================================

 */

function djApprovalGetRoom_(

  sheet,

  room

) {



  var headerRow =

    djApprovalFindHeaderRow_(

      sheet,

      [

        'No_Kamar',

        'Status'

      ]

    );





  var headers =

    djApprovalHeaders_(

      sheet,

      headerRow

    );





  var row =

    djApprovalFindRow_(

      sheet,

      headerRow,

      headers,

      [

        'No_Kamar',

        'Nomor Kamar',

        'No Kamar',

        'Kamar'

      ],

      room

    );





  if (row < 0) {

    return null;

  }





  var values =

    sheet

      .getRange(

        row,

        1,

        1,

        headers.length

      )

      .getValues()[0];





  var data = {};





  for (

    var i = 0;

    i < headers.length;

    i++

  ) {



    data[

      djApprovalNormalize_(

        headers[i]

      )

    ] =

      values[i];



  }





  return {



    row:

      row,



    status:

      djApprovalValue_(

        data,

        [

          'Status',

          'Status_Kamar'

        ]

      ),



    tenantId:

      djApprovalValue_(

        data,

        [

          'Tenant_ID'

        ]

      ),



    price:

      djApprovalToNumber_(

        djApprovalValue_(

          data,

          [

            'Harga_Bulan',

            'Harga_Sewa',

            'Tarif',

            'Harga'

          ]

        )

      )



  };



}





/**

 * ============================================================

 * DEPOSIT

 * ============================================================

 */

function djApprovalGetDeposit_(

  ss

) {



  var sheet =

    ss.getSheetByName(

      DJ_APPROVAL.SHEETS.PENGATURAN

    );





  if (!sheet) {



    return DJ_APPROVAL.DEFAULT_DEPOSIT;



  }





  var headerRow =

    djApprovalFindHeaderRow_(

      sheet,

      [

        'Parameter',

        'Nilai'

      ]

    );





  var headers =

    djApprovalHeaders_(

      sheet,

      headerRow

    );





  var pCol =

    djApprovalFindColumn_(

      headers,

      [

        'Parameter',

        'Pengaturan'

      ]

    );





  var vCol =

    djApprovalFindColumn_(

      headers,

      [

        'Nilai',

        'Value'

      ]

    );





  if (

    pCol < 0 ||

    vCol < 0 ||

    sheet.getLastRow() <= headerRow

  ) {



    return DJ_APPROVAL.DEFAULT_DEPOSIT;



  }





  var rows =

    sheet

      .getRange(

        headerRow + 1,

        1,

        sheet.getLastRow() -

          headerRow,

        headers.length

      )

      .getValues();





  for (

    var i = 0;

    i < rows.length;

    i++

  ) {



    var parameter =

      djApprovalClean_(

        rows[i][pCol]

      )

      .toLowerCase();





    if (

      parameter

        .indexOf('deposit') >= 0

    ) {



      var value =

        djApprovalToNumber_(

          rows[i][vCol]

        );





      return value > 0

        ? value

        : DJ_APPROVAL.DEFAULT_DEPOSIT;



    }



  }





  return DJ_APPROVAL.DEFAULT_DEPOSIT;



}





/**

 * ============================================================

 * NEXT ID

 * ============================================================

 */

function djApprovalNextId_(

  sheet,

  headerRow,

  headers,

  field,

  prefix

) {



  var col =

    djApprovalFindColumn_(

      headers,

      [

        field

      ]

    );





  var max = 0;





  if (

    col >= 0 &&

    sheet.getLastRow() > headerRow

  ) {



    var values =

      sheet

        .getRange(

          headerRow + 1,

          col + 1,

          sheet.getLastRow() -

            headerRow,

          1

        )

        .getValues();





    var re =

      new RegExp(

        '^' +

        prefix +

        '-(\\\d+)$',

        'i'

      );





    for (

      var i = 0;

      i < values.length;

      i++

    ) {



      var m =

        String(

          values[i][0] || ''

        )

        .trim()

        .match(re);





      if (m) {



        max =

          Math.max(

            max,

            Number(

              m[1]

            )

          );



      }



    }



  }





  return (

    prefix +

    '-' +

    String(

      max + 1

    ).padStart(

      3,

      '0'

    )

  );



}





/**

 * ============================================================

 * LOG

 * ============================================================

 */

function djApprovalLog_(

  ss,

  type,

  message

) {



  var sheet =

    ss.getSheetByName(

      DJ_APPROVAL.SHEETS.LOG

    );





  if (!sheet) {



    sheet =

      ss.insertSheet(

        DJ_APPROVAL.SHEETS.LOG

      );



  }





  var headerRow =

    djApprovalFindHeaderRow_(

      sheet,

      [

        'Timestamp',

        'Type',

        'Message'

      ]

    );





  djApprovalEnsureHeaders_(

    sheet,

    headerRow,

    [

      'Timestamp',

      'Type',

      'Message'

    ]

  );





  sheet

    .getRange(

      sheet.getLastRow() + 1,

      1,

      1,

      3

    )

    .setValues(

      [[

        new Date(),

        type,

        message

      ]]

    );



}





/**

 * ============================================================

 * NORMALIZE

 * ============================================================

 */

function djApprovalNormalize_(

  value

) {



  return djApprovalClean_(

    value

  )



    .toLowerCase()



    .replace(

      /[\r\n]+/g,

      ' '

    )



    .replace(

      /[^a-z0-9]+/g,

      ' '

    )



    .trim()



    .replace(

      /\s+/g,

      ' '

    )



    .replace(

      / /g,

      ''

    );



}





/**

 * ============================================================

 * CLEAN

 * ============================================================

 */

function djApprovalClean_(

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





/**

 * ============================================================

 * NUMBER

 * ============================================================

 */

function djApprovalToNumber_(

  value

) {



  if (

    typeof value ===

    'number'

  ) {



    return value;



  }





  var text =

    djApprovalClean_(

      value

    )

    .replace(

      /[^0-9\\-]/g,

      ''

    );





  var n =

    Number(

      text

    );





  return isNaN(n)

    ? 0

    : n;



}