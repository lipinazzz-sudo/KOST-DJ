/**

 * ============================================================

 * DJ FAMILY KOST

 * TENANT ACCOUNT ENGINE V2

 * ============================================================

 *

 * TUJUAN:

 * 1. Membuat database Akun_Tenant

 * 2. Membuat password hash

 * 3. Membuat session token

 * 4. Validasi login tenant

 * 5. Menyiapkan akun tenant yang sudah DISETUJUI

 *

 * DATABASE UTAMA:

 *   Tenant

 *

 * AKUN:

 *   Akun_Tenant

 *

 * ============================================================

 */





const DJ_ACCOUNT_V2 = {



  TENANT_SHEET:

    'Tenant',



  ACCOUNT_SHEET:

    'Akun_Tenant',



  LOG_SHEET:

    'System_Log',



  SESSION_HOURS:

    12,



  PASSWORD_LENGTH:

    12,



  SECRET_PROPERTY:

    'TENANT_AUTH_SECRET'



};





/**

 * ============================================================

 * SETUP ACCOUNT ENGINE

 * ============================================================

 *

 * Jalankan SATU KALI.

 */

function setupTenantAccountEngineV2() {



  const ss =

    SpreadsheetApp.getActiveSpreadsheet();





  if (!ss) {



    throw new Error(

      'Buka Apps Script dari Google Sheets DJ Family Kost.'

    );



  }





  /*

   * ----------------------------------------------------------

   * Pastikan secret tersedia.

   * ----------------------------------------------------------

   */



  let secret =

    PropertiesService

      .getScriptProperties()

      .getProperty(

        DJ_ACCOUNT_V2.SECRET_PROPERTY

      );





  if (!secret) {



    secret =

      Utilities.getUuid() +

      '-' +

      Utilities.getUuid();





    PropertiesService

      .getScriptProperties()

      .setProperty(

        DJ_ACCOUNT_V2.SECRET_PROPERTY,

        secret

      );



  }





  /*

   * ----------------------------------------------------------

   * Buat sheet akun jika belum ada.

   * ----------------------------------------------------------

   */



  let sheet =

    ss.getSheetByName(

      DJ_ACCOUNT_V2.ACCOUNT_SHEET

    );





  if (!sheet) {



    sheet =

      ss.insertSheet(

        DJ_ACCOUNT_V2.ACCOUNT_SHEET

      );



  }





  const headers = [



    'Tenant_ID',



    'Nama_Tenant',



    'Email',



    'Password_Salt',



    'Password_Hash',



    'Status_Akun',



    'Last_Login',



    'Session_Token_Hash',



    'Session_Expires',



    'Failed_Attempts',



    'Locked_Until',



    'Created_At',



    'Updated_At'



  ];





  const existingHeaders =

    sheet

      .getRange(

        1,

        1,

        1,

        Math.max(

          sheet.getLastColumn(),

          headers.length

        )

      )

      .getValues()[0]

      .map(function(value) {



        return String(

          value || ''

        ).trim();



      });





  /*

   * Jika sheet kosong, tulis header.

   */



  if (

    !existingHeaders.some(

      function(value) {

        return value === 'Tenant_ID';

      }

    )

  ) {



    sheet

      .getRange(

        1,

        1,

        1,

        headers.length

      )

      .setValues(

        [headers]

      );



  } else {



    /*

     * Tambahkan header yang belum ada.

     */



    const current =

      sheet

        .getRange(

          1,

          1,

          1,

          sheet.getLastColumn()

        )

        .getValues()[0];





    const normalized =

      current.map(

        function(value) {



          return String(

            value || ''

          ).trim();



        }

      );





    headers.forEach(

      function(header) {



        if (

          normalized.indexOf(

            header

          ) < 0

        ) {



          sheet

            .getRange(

              1,

              sheet.getLastColumn() + 1

            )

            .setValue(

              header

            );



        }



      }

    );



  }





  /*

   * Format header.

   */



  sheet

    .getRange(

      1,

      1,

      1,

      sheet.getLastColumn()

    )

    .setFontWeight(

      'bold'

    );





  SpreadsheetApp

    .getUi()

    .alert(

      'TENANT ACCOUNT ENGINE V2 SIAP\n\n' +

      'Sheet Akun_Tenant sudah siap.\n' +

      'Secret autentikasi tersimpan di Script Properties.'

    );



}





/**

 * ============================================================

 * BUAT AKUN FATMA — KHUSUS TEST

 * ============================================================

 *

 * Tenant:

 * TEN-001

 *

 * Sistem membuat password sementara otomatis.

 *

 * Password asli TIDAK disimpan di spreadsheet.

 */

function siapkanAkunFatmaTestV2() {



  const result =

    buatAkunTenantV2_(

      'TEN-001'

    );





  SpreadsheetApp

    .getUi()

    .alert(



      'AKUN TENANT BERHASIL DIBUAT\n\n' +



      'Nama: ' +

      result.nama +



      '\nTenant ID: ' +

      result.tenantId +



      '\n\nPASSWORD SEMENTARA:\n' +

      result.temporaryPassword +



      '\n\nSimpan password ini untuk test login.' +



      '\nPassword tidak disimpan dalam bentuk asli di database.'



    );





  return result;



}





/**

 * ============================================================

 * BUAT AKUN TENANT

 * ============================================================

 */

function buatAkunTenantV2_(

  tenantId

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





    const tenantSheet =

      ss.getSheetByName(

        DJ_ACCOUNT_V2.TENANT_SHEET

      );





    if (!tenantSheet) {



      throw new Error(

        'Sheet Tenant tidak ditemukan.'

      );



    }





    const accountSheet =

      ss.getSheetByName(

        DJ_ACCOUNT_V2.ACCOUNT_SHEET

      );





    if (!accountSheet) {



      throw new Error(

        'Sheet Akun_Tenant belum dibuat. ' +

        'Jalankan setupTenantAccountEngineV2() terlebih dahulu.'

      );



    }





    /*

     * --------------------------------------------------------

     * Cari tenant

     * --------------------------------------------------------

     */



    const tenant =

      djAcctFindTenantV2_(

        tenantSheet,

        tenantId

      );





    if (!tenant) {



      throw new Error(

        'Tenant_ID tidak ditemukan: ' +

        tenantId

      );



    }





    const tenantStatus =

      String(

        tenant.status || ''

      )

      .trim()

      .toUpperCase();





    if (

      tenantStatus !== 'AKTIF'

    ) {



      throw new Error(

        'Tenant ' +

        tenantId +

        ' belum AKTIF.'

      );



    }





    /*

     * --------------------------------------------------------

     * Cek apakah akun sudah ada

     * --------------------------------------------------------

     */



    const existingRow =

      djAcctFindAccountRowV2_(

        accountSheet,

        tenantId

      );





    if (

      existingRow > 0

    ) {



      /*

       * Jangan membuat akun ganda.

       */



      const headers =

        djAcctGetHeadersV2_(

          accountSheet

        );





      const status =

        djAcctGetCellV2_(

          accountSheet,

          existingRow,

          headers,

          'Status_Akun'

        );





      if (

        String(

          status || ''

        )

        .toUpperCase() ===

        'AKTIF'

      ) {



        throw new Error(

          'Akun ' +

          tenantId +

          ' sudah aktif. ' +

          'Tidak dibuat ulang.'

        );



      }



    }





    /*

     * --------------------------------------------------------

     * Generate password sementara

     * --------------------------------------------------------

     */



    const temporaryPassword =

      djAcctGeneratePasswordV2_();





    /*

     * --------------------------------------------------------

     * Generate salt

     * --------------------------------------------------------

     */



    const salt =

      Utilities

        .getUuid()

        .replace(

          /-/g,

          ''

        );





    /*

     * --------------------------------------------------------

     * Hash password

     * --------------------------------------------------------

     */



    const hash =

      djAcctHashPasswordV2_(

        temporaryPassword,

        salt

      );





    const now =

      new Date();





    const headers =

      djAcctGetHeadersV2_(

        accountSheet

      );





    const email =

      tenant.email ||

      '';





    const nama =

      tenant.name ||

      '';





    /*

     * --------------------------------------------------------

     * Buat / update akun

     * --------------------------------------------------------

     */



    if (

      existingRow > 0

    ) {



      djAcctSetFieldsV2_(

        accountSheet,

        existingRow,

        headers,

        {



          Tenant_ID:

            tenantId,



          Nama_Tenant:

            nama,



          Email:

            email,



          Password_Salt:

            salt,



          Password_Hash:

            hash,



          Status_Akun:

            'AKTIF',



          Failed_Attempts:

            0,



          Locked_Until:

            '',



          Updated_At:

            now



        }

      );



    } else {



      const row =

        new Array(

          headers.length

        )

        .fill('');





      djAcctSetArrayValueV2_(

        row,

        headers,

        'Tenant_ID',

        tenantId

      );





      djAcctSetArrayValueV2_(

        row,

        headers,

        'Nama_Tenant',

        nama

      );





      djAcctSetArrayValueV2_(

        row,

        headers,

        'Email',

        email

      );





      djAcctSetArrayValueV2_(

        row,

        headers,

        'Password_Salt',

        salt

      );





      djAcctSetArrayValueV2_(

        row,

        headers,

        'Password_Hash',

        hash

      );





      djAcctSetArrayValueV2_(

        row,

        headers,

        'Status_Akun',

        'AKTIF'

      );





      djAcctSetArrayValueV2_(

        row,

        headers,

        'Failed_Attempts',

        0

      );





      djAcctSetArrayValueV2_(

        row,

        headers,

        'Created_At',

        now

      );





      djAcctSetArrayValueV2_(

        row,

        headers,

        'Updated_At',

        now

      );





      accountSheet

        .getRange(

          accountSheet.getLastRow() + 1,

          1,

          1,

          row.length

        )

        .setValues(

          [row]

        );



    }





    /*

     * --------------------------------------------------------

     * Log

     * --------------------------------------------------------

     */



    djAcctLogV2_(

      ss,

      'CREATE_ACCOUNT',

      tenantId +

      ' akun tenant dibuat.'

    );





    SpreadsheetApp.flush();





    return {



      ok:

        true,



      tenantId:

        tenantId,



      nama:

        nama,



      email:

        email,



      temporaryPassword:

        temporaryPassword



    };





  } finally {



    lock.releaseLock();



  }



}





/**

 * ============================================================

 * TEST HASH / LOGIN LOKAL

 * ============================================================

 *

 * Fungsi ini belum digunakan website.

 * Hanya untuk memastikan akun dan password benar.

 */

function testLoginFatmaLokalV2() {



  const ui =

    SpreadsheetApp.getUi();





  const response =

    ui.prompt(



      'TEST LOGIN TEN-001',



      'Masukkan password sementara Fatma:',



      ui.ButtonSet.OK_CANCEL



    );





  if (

    response.getSelectedButton() !==

    ui.Button.OK

  ) {



    return;



  }





  const password =

    String(

      response.getResponseText() || ''

    );





  const result =

    loginTenantV2_(

      'TEN-001',

      password

    );





  if (!result.ok) {



    ui.alert(

      'LOGIN GAGAL\n\n' +

      result.error

    );



    return result;



  }





  ui.alert(



    'LOGIN BERHASIL\n\n' +



    'Tenant ID: ' +

    result.tenantId +



    '\nNama: ' +

    result.nama +



    '\nKamar: ' +

    result.kamar +



    '\nStatus: ' +

    result.status



  );





  return result;



}





/**

 * ============================================================

 * LOGIN TENANT

 * ============================================================

 */

function loginTenantV2_(

  tenantId,

  password

) {



  tenantId =

    String(

      tenantId || ''

    ).trim();





  password =

    String(

      password || ''

    );





  if (!tenantId) {



    return {



      ok: false,



      error:

        'Tenant ID kosong.'



    };



  }





  if (!password) {



    return {



      ok: false,



      error:

        'Password kosong.'



    };



  }





  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const accountSheet =

    ss.getSheetByName(

      DJ_ACCOUNT_V2.ACCOUNT_SHEET

    );





  const tenantSheet =

    ss.getSheetByName(

      DJ_ACCOUNT_V2.TENANT_SHEET

    );





  if (

    !accountSheet ||

    !tenantSheet

  ) {



    return {



      ok: false,



      error:

        'Database akun belum siap.'



    };



  }





  const row =

    djAcctFindAccountRowV2_(

      accountSheet,

      tenantId

    );





  if (

    row < 0

  ) {



    return {



      ok: false,



      error:

        'Tenant ID atau password salah.'



    };



  }





  const headers =

    djAcctGetHeadersV2_(

      accountSheet

    );





  const status =

    String(

      djAcctGetCellV2_(

        accountSheet,

        row,

        headers,

        'Status_Akun'

      ) || ''

    )

    .trim()

    .toUpperCase();





  if (

    status !== 'AKTIF'

  ) {



    return {



      ok: false,



      error:

        'Akun tenant tidak aktif.'



    };



  }





  const lockedUntil =

    djAcctGetCellV2_(

      accountSheet,

      row,

      headers,

      'Locked_Until'

    );





  if (

    lockedUntil &&

    new Date(

      lockedUntil

    ).getTime() >

    Date.now()

  ) {



    return {



      ok: false,



      error:

        'Akun sementara dikunci. Coba lagi nanti.'



    };



  }





  const salt =

    String(

      djAcctGetCellV2_(

        accountSheet,

        row,

        headers,

        'Password_Salt'

      ) || ''

    );





  const storedHash =

    String(

      djAcctGetCellV2_(

        accountSheet,

        row,

        headers,

        'Password_Hash'

      ) || ''

    );





  const calculatedHash =

    djAcctHashPasswordV2_(

      password,

      salt

    );





  if (

    calculatedHash !==

    storedHash

  ) {



    let failed =

      Number(

        djAcctGetCellV2_(

          accountSheet,

          row,

          headers,

          'Failed_Attempts'

        ) || 0

      );





    failed++;





    const update = {



      Failed_Attempts:

        failed,



      Updated_At:

        new Date()



    };





    /*

     * 5 kali salah ->

     * kunci 15 menit.

     */



    if (

      failed >= 5

    ) {



      const lockDate =

        new Date(

          Date.now() +

          15 * 60 * 1000

        );





      update

        .Locked_Until =

        lockDate;





      update

        .Failed_Attempts =

        0;



    }





    djAcctSetFieldsV2_(

      accountSheet,

      row,

      headers,

      update

    );





    return {



      ok: false,



      error:

        'Tenant ID atau password salah.'



    };



  }





  /*

   * --------------------------------------------------------

   * Login benar

   * --------------------------------------------------------

   */



  const tenant =

    djAcctFindTenantV2_(

      tenantSheet,

      tenantId

    );





  if (!tenant) {



    return {



      ok: false,



      error:

        'Data tenant tidak ditemukan.'



    };



  }





  const sessionToken =

    djAcctCreateSessionV2_(

      tenantId

    );





  const sessionHash =

    djAcctHashSessionV2_(

      sessionToken

    );





  const expires =

    new Date(

      Date.now() +

      DJ_ACCOUNT_V2.SESSION_HOURS *

      60 *

      60 *

      1000

    );





  djAcctSetFieldsV2_(

    accountSheet,

    row,

    headers,

    {



      Last_Login:

        new Date(),



      Session_Token_Hash:

        sessionHash,



      Session_Expires:

        expires,



      Failed_Attempts:

        0,



      Locked_Until:

        '',



      Updated_At:

        new Date()



    }

  );





  return {



    ok:

      true,



    tenantId:

      tenantId,



    nama:

      tenant.name,



    kamar:

      tenant.room,



    email:

      tenant.email,



    phone:

      tenant.phone,



    status:

      tenant.status,



    sessionToken:

      sessionToken,



    sessionExpires:

      expires.toISOString()



  };



}





/**

 * ============================================================

 * VALIDASI SESSION

 * ============================================================

 */

function validateTenantSessionV2_(

  tenantId,

  sessionToken

) {



  tenantId =

    String(

      tenantId || ''

    ).trim();





  sessionToken =

    String(

      sessionToken || ''

    ).trim();





  if (

    !tenantId ||

    !sessionToken

  ) {



    return null;



  }





  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const accountSheet =

    ss.getSheetByName(

      DJ_ACCOUNT_V2.ACCOUNT_SHEET

    );





  const tenantSheet =

    ss.getSheetByName(

      DJ_ACCOUNT_V2.TENANT_SHEET

    );





  if (

    !accountSheet ||

    !tenantSheet

  ) {



    return null;



  }





  const row =

    djAcctFindAccountRowV2_(

      accountSheet,

      tenantId

    );





  if (

    row < 0

  ) {



    return null;



  }





  const headers =

    djAcctGetHeadersV2_(

      accountSheet

    );





  const status =

    String(

      djAcctGetCellV2_(

        accountSheet,

        row,

        headers,

        'Status_Akun'

      ) || ''

    )

    .trim()

    .toUpperCase();





  if (

    status !== 'AKTIF'

  ) {



    return null;



  }





  const storedHash =

    String(

      djAcctGetCellV2_(

        accountSheet,

        row,

        headers,

        'Session_Token_Hash'

      ) || ''

    );





  const expiresValue =

    djAcctGetCellV2_(

      accountSheet,

      row,

      headers,

      'Session_Expires'

    );





  const expires =

    new Date(

      expiresValue

    );





  if (

    isNaN(

      expires.getTime()

    ) ||

    expires.getTime() <=

    Date.now()

  ) {



    return null;



  }





  const incomingHash =

    djAcctHashSessionV2_(

      sessionToken

    );





  if (

    incomingHash !==

    storedHash

  ) {



    return null;



  }





  return djAcctFindTenantV2_(

    tenantSheet,

    tenantId

  );



}





/**

 * ============================================================

 * GENERATE PASSWORD

 * ============================================================

 */

function djAcctGeneratePasswordV2_() {



  const chars =

    'ABCDEFGHJKLMNPQRSTUVWXYZ' +

    'abcdefghijkmnopqrstuvwxyz' +

    '23456789';





  let result = '';





  for (

    let i = 0;

    i < DJ_ACCOUNT_V2.PASSWORD_LENGTH;

    i++

  ) {



    const index =

      Math.floor(

        Math.random() *

        chars.length

      );





    result +=

      chars.charAt(

        index

      );



  }





  return (

    'DJ-' +

    result

  );



}





/**

 * ============================================================

 * HASH PASSWORD

 * ============================================================

 */

function djAcctHashPasswordV2_(

  password,

  salt

) {



  const secret =

    PropertiesService

      .getScriptProperties()

      .getProperty(

        DJ_ACCOUNT_V2.SECRET_PROPERTY

      );





  if (!secret) {



    throw new Error(

      'TENANT_AUTH_SECRET belum tersedia.'

    );



  }





  const bytes =

    Utilities

      .computeHmacSha256Signature(

        String(password),

        secret + '|' + String(salt)

      );





  return bytes

    .map(function(byte) {



      return (

        (byte < 0 ? byte + 256 : byte)

          .toString(16)

          .padStart(2, '0')

      );



    })

    .join('');



}





/**

 * ============================================================

 * HASH SESSION

 * ============================================================

 */

function djAcctHashSessionV2_(

  token

) {



  const secret =

    PropertiesService

      .getScriptProperties()

      .getProperty(

        DJ_ACCOUNT_V2.SECRET_PROPERTY

      );





  if (!secret) {



    throw new Error(

      'TENANT_AUTH_SECRET belum tersedia.'

    );



  }





  const bytes =

    Utilities

      .computeHmacSha256Signature(

        String(token),

        secret

      );





  return bytes

    .map(function(byte) {



      return (

        (byte < 0 ? byte + 256 : byte)

          .toString(16)

          .padStart(2, '0')

      );



    })

    .join('');



}





/**

 * ============================================================

 * CREATE SESSION TOKEN

 * ============================================================

 */

function djAcctCreateSessionV2_(

  tenantId

) {



  return (

    Utilities.getUuid() +

    '-' +

    Utilities.getUuid() +

    '-' +

    String(tenantId)

  );



}





/**

 * ============================================================

 * FIND TENANT — V2 FIX

 * ============================================================

 *

 * Header Tenant tidak harus berada di baris 1.

 * Sistem mencari baris header secara otomatis.

 *

 * Data yang dikembalikan:

 * - Tenant_ID

 * - Nama_Lengkap

 * - No_Kamar

 * - Email

 * - No_HP

 * - Status_Tenant

 *

 * ============================================================

 */

function djAcctFindTenantV2_(

  sheet,

  tenantId

) {



  if (!sheet) {



    return null;



  }





  tenantId =

    String(

      tenantId || ''

    )

    .trim();





  if (!tenantId) {



    return null;



  }





  /*

   * ----------------------------------------------------------

   * Cari baris header

   * ----------------------------------------------------------

   */



  const maxHeaderRows =

    Math.min(

      Math.max(

        sheet.getLastRow(),

        1

      ),

      10

    );





  const lastColumn =

    Math.max(

      sheet.getLastColumn(),

      1

    );





  let headerRow =

    -1;





  let headers =

    [];





  for (

    let r = 1;

    r <= maxHeaderRows;

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



          return String(

            value || ''

          )

          .trim()

          .toLowerCase()

          .replace(

            /[^a-z0-9]+/g,

            '_'

          )

          .replace(

            /^_+|_+$/g,

            ''

          );



        }

      );





    const hasTenantId =

      normalized.some(

        function(value) {



          return (

            value === 'tenant_id' ||

            value === 'tenantid'

          );



        }

      );





    if (hasTenantId) {



      headerRow =

        r;





      headers =

        row.map(

          function(value) {



            return String(

              value || ''

            ).trim();



          }

        );





      break;



    }



  }





  if (

    headerRow < 0

  ) {



    return null;



  }





  /*

   * ----------------------------------------------------------

   * Cari kolom Tenant_ID

   * ----------------------------------------------------------

   */



  let tenantColumn =

    -1;





  for (

    let c = 0;

    c < headers.length;

    c++

  ) {



    const normalized =

      String(

        headers[c] || ''

      )

      .trim()

      .toLowerCase()

      .replace(

        /[^a-z0-9]+/g,

        '_'

      )

      .replace(

        /^_+|_+$/g,

        ''

      );





    if (

      normalized === 'tenant_id' ||

      normalized === 'tenantid'

    ) {



      tenantColumn =

        c;





      break;



    }



  }





  if (

    tenantColumn < 0

  ) {



    return null;



  }





  /*

   * ----------------------------------------------------------

   * Data mulai setelah header

   * ----------------------------------------------------------

   */



  const firstDataRow =

    headerRow + 1;





  if (

    sheet.getLastRow() <

    firstDataRow

  ) {



    return null;



  }





  const dataCount =

    sheet.getLastRow() -

    headerRow;





  const values =

    sheet

      .getRange(

        firstDataRow,

        1,

        dataCount,

        lastColumn

      )

      .getValues();





  /*

   * ----------------------------------------------------------

   * Cari Tenant_ID

   * ----------------------------------------------------------

   */



  for (

    let i = 0;

    i < values.length;

    i++

  ) {



    const currentTenantId =

      String(

        values[i][

          tenantColumn

        ] || ''

      ).trim();





    if (

      currentTenantId !==

      tenantId

    ) {



      continue;



    }





    /*

     * --------------------------------------------------------

     * Ambil field tenant

     * --------------------------------------------------------

     */



    return {



      row:

        firstDataRow + i,



      tenantId:

        tenantId,



      name:

        djAcctGetArrayValueV2_(

          values[i],

          headers,

          [

            'Nama_Lengkap'

          ]

        ),



      room:

        djAcctGetArrayValueV2_(

          values[i],

          headers,

          [

            'No_Kamar'

          ]

        ),



      email:

        djAcctGetArrayValueV2_(

          values[i],

          headers,

          [

            'Email'

          ]

        ),



      phone:

        djAcctGetArrayValueV2_(

          values[i],

          headers,

          [

            'No_HP'

          ]

        ),



      status:

        djAcctGetArrayValueV2_(

          values[i],

          headers,

          [

            'Status_Tenant'

          ]

        ) || 'AKTIF'



    };



  }





  return null;



}

/**

 * ============================================================

 * FIND ACCOUNT ROW

 * ============================================================

 */

function djAcctFindAccountRowV2_(

  sheet,

  tenantId

) {



  if (

    sheet.getLastRow() < 2

  ) {



    return -1;



  }





  const headers =

    djAcctGetHeadersV2_(

      sheet

    );





  const col =

    djAcctFindColumnV2_(

      headers,

      'Tenant_ID'

    );





  if (

    col < 0

  ) {



    return -1;



  }





  const values =

    sheet

      .getRange(

        2,

        col + 1,

        sheet.getLastRow() - 1,

        1

      )

      .getValues();





  const needle =

    String(

      tenantId || ''

    ).trim();





  for (

    let i = 0;

    i < values.length;

    i++

  ) {



    if (

      String(

        values[i][0] || ''

      ).trim() ===

      needle

    ) {



      return i + 2;



    }



  }





  return -1;



}





/**

 * ============================================================

 * HEADERS

 * ============================================================

 */

function djAcctGetHeadersV2_(

  sheet

) {



  if (

    sheet.getLastColumn() <

    1

  ) {



    return [];



  }





  return sheet

    .getRange(

      1,

      1,

      1,

      sheet.getLastColumn()

    )

    .getValues()[0]

    .map(function(value) {



      return String(

        value || ''

      ).trim();



    });



}





/**

 * ============================================================

 * FIND COLUMN

 * ============================================================

 */

function djAcctFindColumnV2_(

  headers,

  name

) {



  const needle =

    String(

      name || ''

    ).trim()

    .toLowerCase();





  for (

    let i = 0;

    i < headers.length;

    i++

  ) {



    if (

      String(

        headers[i] || ''

      )

      .trim()

      .toLowerCase() ===

      needle

    ) {



      return i;



    }



  }





  return -1;



}





/**

 * ============================================================

 * GET CELL

 * ============================================================

 */

function djAcctGetCellV2_(

  sheet,

  row,

  headers,

  name

) {



  const col =

    djAcctFindColumnV2_(

      headers,

      name

    );





  if (

    col < 0

  ) {



    return '';



  }





  return sheet

    .getRange(

      row,

      col + 1

    )

    .getValue();



}





/**

 * ============================================================

 * GET ARRAY VALUE

 * ============================================================

 */

function djAcctGetArrayValueV2_(

  row,

  headers,

  aliases

) {



  for (

    let i = 0;

    i < aliases.length;

    i++

  ) {



    const col =

      djAcctFindColumnV2_(

        headers,

        aliases[i]

      );





    if (

      col >= 0

    ) {



      return row[col];



    }



  }





  return '';



}





/**

 * ============================================================

 * SET ARRAY VALUE

 * ============================================================

 */

function djAcctSetArrayValueV2_(

  row,

  headers,

  field,

  value

) {



  const col =

    djAcctFindColumnV2_(

      headers,

      field

    );





  if (

    col >= 0

  ) {



    row[col] =

      value;



  }



}





/**

 * ============================================================

 * SET FIELDS

 * ============================================================

 */

function djAcctSetFieldsV2_(

  sheet,

  row,

  headers,

  data

) {



  const values =

    sheet

      .getRange(

        row,

        1,

        1,

        headers.length

      )

      .getValues()[0];





  Object.keys(

    data

  ).forEach(

    function(field) {



      const col =

        djAcctFindColumnV2_(

          headers,

          field

        );





      if (

        col >= 0

      ) {



        values[col] =

          data[field];



      }



    }

  );





  sheet

    .getRange(

      row,

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

 * LOG

 * ============================================================

 */

function djAcctLogV2_(

  ss,

  type,

  message

) {



  let sheet =

    ss.getSheetByName(

      DJ_ACCOUNT_V2.LOG_SHEET

    );





  if (!sheet) {



    return;



  }





  const headers =

    djAcctGetHeadersV2_(

      sheet

    );





  /*

   * Cocok dengan System_Log:

   * Timestamp / Type / Message

   */



  const row =

    new Array(

      Math.max(

        headers.length,

        3

      )

    )

    .fill('');





  const timestampCol =

    djAcctFindColumnV2_(

      headers,

      'Timestamp'

    );





  const typeCol =

    djAcctFindColumnV2_(

      headers,

      'Type'

    );





  const messageCol =

    djAcctFindColumnV2_(

      headers,

      'Message'

    );





  if (

    timestampCol >= 0

  ) {



    row[timestampCol] =

      new Date();



  }





  if (

    typeCol >= 0

  ) {



    row[typeCol] =

      type;



  }





  if (

    messageCol >= 0

  ) {



    row[messageCol] =

      message;



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
}