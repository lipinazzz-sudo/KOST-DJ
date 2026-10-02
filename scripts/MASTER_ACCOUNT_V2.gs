/**

 * ============================================================

 * DJ FAMILY KOST

 * MASTER ACCOUNT V2

 * ============================================================

 *

 * Database:

 *   Akun_Master

 *

 * Password:

 *   Tidak disimpan dalam bentuk asli.

 *

 * Session:

 *   Signed / hashed dengan secret Script Properties.

 *

 * ============================================================

 */





const DJ_MASTER_ACCOUNT_V2 = {



  SHEET:

    'Akun_Master',



  SECRET_PROPERTY:

    'MASTER_AUTH_SECRET',



  SESSION_HOURS:

    12



};





/**

 * ============================================================

 * SETUP AKUN MASTER

 * ============================================================

 *

 * Jalankan SATU KALI untuk membuat akun Master pertama.

 */

function setupMasterAccountV2() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  if (!ss) {



    throw new Error(

      'Buka Apps Script dari Google Sheets DJ Family Kost.'

    );



  }





  const ui =

    SpreadsheetApp.getUi();





  let sheet =

    ss.getSheetByName(

      DJ_MASTER_ACCOUNT_V2.SHEET

    );





  if (!sheet) {



    sheet =

      ss.insertSheet(

        DJ_MASTER_ACCOUNT_V2.SHEET

      );



  }





  const headers = [



    'Master_ID',



    'Nama_Master',



    'Password_Salt',



    'Password_Hash',



    'Status_Akun',



    'Last_Login',



    'Session_Token_Hash',



    'Session_Expires',



    'Created_At',



    'Updated_At'



  ];





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





  sheet

    .getRange(

      1,

      1,

      1,

      headers.length

    )

    .setFontWeight(

      'bold'

    );





  /*

   * ----------------------------------------------------------

   * Master ID

   * ----------------------------------------------------------

   */



  const idPrompt =

    ui.prompt(

      'SETUP MASTER ACCOUNT',

      'Masukkan Master ID.\nContoh: MASTER-001',

      ui.ButtonSet.OK_CANCEL

    );





  if (

    idPrompt.getSelectedButton() !==

    ui.Button.OK

  ) {



    return;



  }





  const masterId =

    String(

      idPrompt.getResponseText() || ''

    )

    .trim()

    .toUpperCase();





  if (!masterId) {



    throw new Error(

      'Master ID tidak boleh kosong.'

    );



  }





  /*

   * ----------------------------------------------------------

   * Nama

   * ----------------------------------------------------------

   */



  const namePrompt =

    ui.prompt(

      'SETUP MASTER ACCOUNT',

      'Nama pengelola / Master:',

      ui.ButtonSet.OK_CANCEL

    );





  if (

    namePrompt.getSelectedButton() !==

    ui.Button.OK

  ) {



    return;



  }





  const masterName =

    String(

      namePrompt.getResponseText() || ''

    )

    .trim();





  if (!masterName) {



    throw new Error(

      'Nama Master tidak boleh kosong.'

    );



  }





  /*

   * ----------------------------------------------------------

   * Password

   * ----------------------------------------------------------

   */



  const passwordPrompt =

    ui.prompt(

      'SETUP MASTER ACCOUNT',

      'Masukkan password Master.\nMinimal 10 karakter, mengandung huruf dan angka.',

      ui.ButtonSet.OK_CANCEL

    );





  if (

    passwordPrompt.getSelectedButton() !==

    ui.Button.OK

  ) {



    return;



  }





  const password =

    String(

      passwordPrompt.getResponseText() || ''

    );





  if (

    password.length < 10

  ) {



    throw new Error(

      'Password Master minimal 10 karakter.'

    );



  }





  if (

    !/[A-Za-z]/.test(

      password

    ) ||

    !/[0-9]/.test(

      password

    )

  ) {



    throw new Error(

      'Password Master harus mengandung huruf dan angka.'

    );



  }





  /*

   * ----------------------------------------------------------

   * Secret

   * ----------------------------------------------------------

   */



  let secret =

    PropertiesService

      .getScriptProperties()

      .getProperty(

        DJ_MASTER_ACCOUNT_V2.SECRET_PROPERTY

      );





  if (!secret) {



    secret =

      Utilities.getUuid() +

      '-' +

      Utilities.getUuid() +

      '-' +

      Utilities.getUuid();





    PropertiesService

      .getScriptProperties()

      .setProperty(

        DJ_MASTER_ACCOUNT_V2.SECRET_PROPERTY,

        secret

      );



  }





  /*

   * ----------------------------------------------------------

   * Salt + hash

   * ----------------------------------------------------------

   */



  const salt =

    Utilities

      .getUuid()

      .replace(

        /-/g,

        ''

      );





  const hash =

    djMasterPasswordHashV2_(

      password,

      salt

    );





  const now =

    new Date();





  /*

   * ----------------------------------------------------------

   * Cek akun existing

   * ----------------------------------------------------------

   */



  const existingRow =

    djMasterFindAccountRowV2_(

      sheet,

      masterId

    );





  const values = {



    Master_ID:

      masterId,



    Nama_Master:

      masterName,



    Password_Salt:

      salt,



    Password_Hash:

      hash,



    Status_Akun:

      'AKTIF',



    Last_Login:

      '',



    Session_Token_Hash:

      '',



    Session_Expires:

      '',



    Created_At:

      now,



    Updated_At:

      now



  };





  if (

    existingRow > 0

  ) {



    djMasterUpdateFieldsV2_(

      sheet,

      existingRow,

      values

    );



  } else {



    const row =

      headers.map(

        function(header) {



          return values[header] !== undefined

            ? values[header]

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

      .setValues(

        [row]

      );



  }





  SpreadsheetApp.flush();





  ui.alert(



    'AKUN MASTER BERHASIL DIBUAT\n\n' +



    'Master ID:\n' +

    masterId +



    '\n\nPassword telah tersimpan dalam bentuk hash.'



  );





  return {



    ok:

      true,



    masterId:

      masterId,



    nama:

      masterName



  };



}





/**

 * ============================================================

 * TAMBAH MASTER ACCOUNT

 * ============================================================

 *

 * Membuat akun Master baru tanpa menimpa akun yang sudah ada.

 * Jalankan melalui menu Spreadsheet:

 * DJ FAMILY KOST → Akun Master → Tambah Master Account

 */

function addMasterAccountV2() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();



  if (!ss) {



    throw new Error(

      'Buka Apps Script dari Google Sheets DJ Family Kost.'

    );



  }



  const ui =

    SpreadsheetApp.getUi();



  const lock =

    LockService.getScriptLock();



  lock.waitLock(15000);



  try {



    let sheet =

      ss.getSheetByName(

        DJ_MASTER_ACCOUNT_V2.SHEET

      );



    const headers = [



      'Master_ID',

      'Nama_Master',

      'Password_Salt',

      'Password_Hash',

      'Status_Akun',

      'Last_Login',

      'Session_Token_Hash',

      'Session_Expires',

      'Created_At',

      'Updated_At'



    ];



    if (!sheet) {



      sheet =

        ss.insertSheet(

          DJ_MASTER_ACCOUNT_V2.SHEET

        );



      sheet

        .getRange(

          1,

          1,

          1,

          headers.length

        )

        .setValues([

          headers

        ]);



      sheet

        .getRange(

          1,

          1,

          1,

          headers.length

        )

        .setFontWeight(

          'bold'

        );



    } else {



      const currentHeaders =

        djMasterGetHeadersV2_(

          sheet

        );



      const missing =

        headers.filter(

          function(header) {



            return currentHeaders.indexOf(

              header

            ) < 0;



          }

        );



      if (missing.length) {



        throw new Error(

          'Sheet Akun_Master belum memiliki kolom yang diperlukan: ' +

          missing.join(', ') +

          '. Jalankan setupMasterAccountV2() sekali melalui menu Spreadsheet terlebih dahulu.'

        );



      }



    }



    const idPrompt =

      ui.prompt(

        'TAMBAH MASTER ACCOUNT',

        'Masukkan Master ID baru.\nContoh: MASTER-002',

        ui.ButtonSet.OK_CANCEL

      );



    if (

      idPrompt.getSelectedButton() !==

      ui.Button.OK

    ) {



      return;



    }



    const masterId =

      String(

        idPrompt.getResponseText() || ''

      )

      .trim()

      .toUpperCase();



    if (!masterId) {



      throw new Error(

        'Master ID tidak boleh kosong.'

      );



    }



    if (!/^[A-Z0-9_-]{3,50}$/.test(masterId)) {



      throw new Error(

        'Master ID hanya boleh berisi huruf, angka, tanda hubung (-), atau garis bawah (_), minimal 3 karakter.'

      );



    }



    const existingRow =

      djMasterFindAccountRowV2_(

        sheet,

        masterId

      );



    if (existingRow >= 0) {



      throw new Error(

        'Master ID ' +

        masterId +

        ' sudah terdaftar. Gunakan Master ID yang berbeda.'

      );



    }



    const namePrompt =

      ui.prompt(

        'TAMBAH MASTER ACCOUNT',

        'Masukkan nama pengelola / Master:',

        ui.ButtonSet.OK_CANCEL

      );



    if (

      namePrompt.getSelectedButton() !==

      ui.Button.OK

    ) {



      return;



    }



    const masterName =

      String(

        namePrompt.getResponseText() || ''

      )

      .trim();



    if (!masterName) {



      throw new Error(

        'Nama Master tidak boleh kosong.'

      );



    }



    const passwordPrompt =

      ui.prompt(

        'TAMBAH MASTER ACCOUNT',

        'Masukkan password Master baru.\nMinimal 10 karakter, mengandung huruf dan angka.',

        ui.ButtonSet.OK_CANCEL

      );



    if (

      passwordPrompt.getSelectedButton() !==

      ui.Button.OK

    ) {



      return;



    }



    const password =

      String(

        passwordPrompt.getResponseText() || ''

      );



    if (password.length < 10) {



      throw new Error(

        'Password Master minimal 10 karakter.'

      );



    }



    if (

      !/[A-Za-z]/.test(password) ||

      !/[0-9]/.test(password)

    ) {



      throw new Error(

        'Password Master harus mengandung huruf dan angka.'

      );



    }



    const confirmPrompt =

      ui.prompt(

        'TAMBAH MASTER ACCOUNT',

        'Ulangi password Master baru untuk konfirmasi:',

        ui.ButtonSet.OK_CANCEL

      );



    if (

      confirmPrompt.getSelectedButton() !==

      ui.Button.OK

    ) {



      return;



    }



    const confirmPassword =

      String(

        confirmPrompt.getResponseText() || ''

      );



    if (password !== confirmPassword) {



      throw new Error(

        'Konfirmasi password tidak sama.'

      );



    }



    let secret =

      PropertiesService

        .getScriptProperties()

        .getProperty(

          DJ_MASTER_ACCOUNT_V2.SECRET_PROPERTY

        );



    if (!secret) {



      secret =

        Utilities.getUuid() +

        '-' +

        Utilities.getUuid() +

        '-' +

        Utilities.getUuid();



      PropertiesService

        .getScriptProperties()

        .setProperty(

          DJ_MASTER_ACCOUNT_V2.SECRET_PROPERTY,

          secret

        );



    }



    const salt =

      Utilities

        .getUuid()

        .replace(

          /-/g,

          ''

        );



    const hash =

      djMasterPasswordHashV2_(

        password,

        salt

      );



    const now =

      new Date();



    sheet

      .getRange(

        sheet.getLastRow() + 1,

        1,

        1,

        headers.length

      )

      .setValues([

        [

          masterId,

          masterName,

          salt,

          hash,

          'AKTIF',

          '',

          '',

          '',

          now,

          now

        ]

      ]);



    SpreadsheetApp.flush();



    ui.alert(

      'MASTER ACCOUNT BERHASIL DITAMBAHKAN\n\n' +

      'Master ID:\n' +

      masterId +

      '\n\nNama:\n' +

      masterName +

      '\n\nAkun siap digunakan untuk login Master.'

    );



    return {



      ok:

        true,



      masterId:

        masterId,



      nama:

        masterName



    };



  } finally {



    lock.releaseLock();



  }



}





/**

 * ============================================================

 * GANTI PASSWORD MASTER

 * ============================================================

 *

 * Memverifikasi password lama sebelum membuat hash password baru.

 * Session Master pada akun tersebut langsung dibatalkan setelah

 * password berhasil diganti.

 */

function changeMasterPasswordV2() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();



  if (!ss) {



    throw new Error(

      'Buka Apps Script dari Google Sheets DJ Family Kost.'

    );



  }



  const ui =

    SpreadsheetApp.getUi();



  const sheet =

    ss.getSheetByName(

      DJ_MASTER_ACCOUNT_V2.SHEET

    );



  if (!sheet) {



    throw new Error(

      'Sheet Akun_Master belum tersedia.'

    );



  }



  const idPrompt =

    ui.prompt(

      'GANTI PASSWORD MASTER',

      'Masukkan Master ID yang passwordnya akan diganti:',

      ui.ButtonSet.OK_CANCEL

    );



  if (

    idPrompt.getSelectedButton() !==

    ui.Button.OK

  ) {



    return;



  }



  const masterId =

    String(

      idPrompt.getResponseText() || ''

    )

    .trim()

    .toUpperCase();



  if (!masterId) {



    throw new Error(

      'Master ID tidak boleh kosong.'

    );



  }



  const row =

    djMasterFindAccountRowV2_(

      sheet,

      masterId

    );



  if (row < 0) {



    throw new Error(

      'Master ID tidak ditemukan: ' +

      masterId

    );



  }



  const headers =

    djMasterGetHeadersV2_(

      sheet

    );



  const status =

    String(

      djMasterGetCellV2_(

        sheet,

        row,

        headers,

        'Status_Akun'

      ) || ''

    )

    .trim()

    .toUpperCase();



  if (

    status !==

    'AKTIF'

  ) {



    throw new Error(

      'Akun Master tidak aktif.'

    );



  }



  const oldPasswordPrompt =

    ui.prompt(

      'GANTI PASSWORD MASTER',

      'Masukkan password Master saat ini:',

      ui.ButtonSet.OK_CANCEL

    );



  if (

    oldPasswordPrompt.getSelectedButton() !==

    ui.Button.OK

  ) {



    return;



  }



  const oldPassword =

    String(

      oldPasswordPrompt.getResponseText() || ''

    );



  if (!oldPassword) {



    throw new Error(

      'Password Master saat ini wajib diisi.'

    );



  }



  const salt =

    String(

      djMasterGetCellV2_(

        sheet,

        row,

        headers,

        'Password_Salt'

      ) || ''

    );



  const storedHash =

    String(

      djMasterGetCellV2_(

        sheet,

        row,

        headers,

        'Password_Hash'

      ) || ''

    );



  const calculatedOldHash =

    djMasterPasswordHashV2_(

      oldPassword,

      salt

    );



  if (

    calculatedOldHash !==

    storedHash

  ) {



    throw new Error(

      'Password Master saat ini salah.'

    );



  }



  const newPasswordPrompt =

    ui.prompt(

      'GANTI PASSWORD MASTER',

      'Masukkan password Master baru.\nMinimal 10 karakter, mengandung huruf dan angka.',

      ui.ButtonSet.OK_CANCEL

    );



  if (

    newPasswordPrompt.getSelectedButton() !==

    ui.Button.OK

  ) {



    return;



  }



  const newPassword =

    String(

      newPasswordPrompt.getResponseText() || ''

    );



  if (newPassword.length < 10) {



    throw new Error(

      'Password Master minimal 10 karakter.'

    );



  }



  if (

    !/[A-Za-z]/.test(newPassword) ||

    !/[0-9]/.test(newPassword)

  ) {



    throw new Error(

      'Password Master harus mengandung huruf dan angka.'

    );



  }



  if (newPassword === oldPassword) {



    throw new Error(

      'Password baru harus berbeda dari password lama.'

    );



  }



  const confirmNewPasswordPrompt =

    ui.prompt(

      'GANTI PASSWORD MASTER',

      'Ulangi password Master baru untuk konfirmasi:',

      ui.ButtonSet.OK_CANCEL

    );



  if (

    confirmNewPasswordPrompt.getSelectedButton() !==

    ui.Button.OK

  ) {



    return;



  }



  const confirmNewPassword =

    String(

      confirmNewPasswordPrompt.getResponseText() || ''

    );



  if (

    newPassword !==

    confirmNewPassword

  ) {



    throw new Error(

      'Konfirmasi password baru tidak sama.'

    );



  }



  const newSalt =

    Utilities

      .getUuid()

      .replace(

        /-/g,

        ''

      );



  const newHash =

    djMasterPasswordHashV2_(

      newPassword,

      newSalt

    );



  djMasterUpdateFieldsV2_(

    sheet,

    row,

    {



      Password_Salt:

        newSalt,



      Password_Hash:

        newHash,



      Session_Token_Hash:

        '',



      Session_Expires:

        '',



      Updated_At:

        new Date()



    }

  );



  SpreadsheetApp.flush();



  ui.alert(

    'PASSWORD MASTER BERHASIL DIGANTI\n\n' +

    'Master ID:\n' +

    masterId +

    '\n\nSession Master lama telah ditutup.\nSilakan login kembali menggunakan password baru.'

  );



  return {



    ok:

      true,



    masterId:

      masterId



  };



}





/**

 * ============================================================

 * MASTER LOGIN

 * ============================================================

 */

function masterLoginV2_(

  masterId,

  password

) {



  masterId =

    String(

      masterId || ''

    )

    .trim()

    .toUpperCase();





  password =

    String(

      password || ''

    );





  if (

    !masterId ||

    !password

  ) {



    return {



      ok: false,



      error:

        'Master ID dan password wajib diisi.'



    };



  }





  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const sheet =

    ss.getSheetByName(

      DJ_MASTER_ACCOUNT_V2.SHEET

    );





  if (!sheet) {



    return {



      ok: false,



      error:

        'Akun Master belum disiapkan.'



    };



  }





  const row =

    djMasterFindAccountRowV2_(

      sheet,

      masterId

    );





  if (

    row < 0

  ) {



    return {



      ok: false,



      error:

        'Master ID atau password salah.'



    };



  }





  const headers =

    djMasterGetHeadersV2_(

      sheet

    );





  const status =

    String(

      djMasterGetCellV2_(

        sheet,

        row,

        headers,

        'Status_Akun'

      ) || ''

    )

    .trim()

    .toUpperCase();





  if (

    status !==

    'AKTIF'

  ) {



    return {



      ok: false,



      error:

        'Akun Master tidak aktif.'



    };



  }





  const salt =

    String(

      djMasterGetCellV2_(

        sheet,

        row,

        headers,

        'Password_Salt'

      ) || ''

    );





  const storedHash =

    String(

      djMasterGetCellV2_(

        sheet,

        row,

        headers,

        'Password_Hash'

      ) || ''

    );





  const calculatedHash =

    djMasterPasswordHashV2_(

      password,

      salt

    );





  if (

    calculatedHash !==

    storedHash

  ) {



    return {



      ok: false,



      error:

        'Master ID atau password salah.'



    };



  }





  /*

   * ----------------------------------------------------------

   * Session

   * ----------------------------------------------------------

   */



  const sessionToken =

    djMasterCreateSessionV2_(

      masterId

    );





  const sessionHash =

    djMasterSessionHashV2_(

      sessionToken

    );





  const expires =

    new Date(

      Date.now() +

      DJ_MASTER_ACCOUNT_V2.SESSION_HOURS *

      60 *

      60 *

      1000

    );





  djMasterUpdateFieldsV2_(

    sheet,

    row,

    {



      Last_Login:

        new Date(),



      Session_Token_Hash:

        sessionHash,



      Session_Expires:

        expires,



      Updated_At:

        new Date()



    }

  );





  SpreadsheetApp.flush();





  return {



    ok:

      true,



    masterId:

      masterId,



    nama:

      djMasterGetCellV2_(

        sheet,

        row,

        headers,

        'Nama_Master'

      ),



    sessionToken:

      sessionToken,



    sessionExpires:

      expires.toISOString()



  };



}





/**

 * ============================================================

 * VALIDATE MASTER SESSION

 * ============================================================

 */

function validateMasterSessionV2_(

  masterId,

  sessionToken

) {



  masterId =

    String(

      masterId || ''

    )

    .trim()

    .toUpperCase();





  sessionToken =

    String(

      sessionToken || ''

    )

    .trim();





  if (

    !masterId ||

    !sessionToken

  ) {



    return null;



  }





  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const sheet =

    ss.getSheetByName(

      DJ_MASTER_ACCOUNT_V2.SHEET

    );





  if (!sheet) {



    return null;



  }





  const row =

    djMasterFindAccountRowV2_(

      sheet,

      masterId

    );





  if (

    row < 0

  ) {



    return null;



  }





  const headers =

    djMasterGetHeadersV2_(

      sheet

    );





  const status =

    String(

      djMasterGetCellV2_(

        sheet,

        row,

        headers,

        'Status_Akun'

      ) || ''

    )

    .trim()

    .toUpperCase();





  if (

    status !==

    'AKTIF'

  ) {



    return null;



  }





  const storedHash =

    String(

      djMasterGetCellV2_(

        sheet,

        row,

        headers,

        'Session_Token_Hash'

      ) || ''

    );





  const expiresValue =

    djMasterGetCellV2_(

      sheet,

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

    djMasterSessionHashV2_(

      sessionToken

    );





  if (

    incomingHash !==

    storedHash

  ) {



    return null;



  }





  return {



    row:

      row,



    masterId:

      masterId,



    nama:

      djMasterGetCellV2_(

        sheet,

        row,

        headers,

        'Nama_Master'

      )



  };



}





/**

 * ============================================================

 * CLEAR MASTER SESSION

 * ============================================================

 */

function clearMasterSessionV2_(

  masterId

) {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const sheet =

    ss.getSheetByName(

      DJ_MASTER_ACCOUNT_V2.SHEET

    );





  if (!sheet) {



    return;



  }





  const row =

    djMasterFindAccountRowV2_(

      sheet,

      masterId

    );





  if (

    row < 0

  ) {



    return;



  }





  const headers =

    djMasterGetHeadersV2_(

      sheet

    );





  djMasterUpdateFieldsV2_(

    sheet,

    row,

    {



      Session_Token_Hash:

        '',



      Session_Expires:

        '',



      Updated_At:

        new Date()



    }

  );



}





/**

 * ============================================================

 * PASSWORD HASH

 * ============================================================

 */

function djMasterPasswordHashV2_(

  password,

  salt

) {



  const secret =

    PropertiesService

      .getScriptProperties()

      .getProperty(

        DJ_MASTER_ACCOUNT_V2.SECRET_PROPERTY

      );





  if (!secret) {



    throw new Error(

      'MASTER_AUTH_SECRET belum tersedia.'

    );



  }





  const bytes =

    Utilities

      .computeHmacSha256Signature(

        String(password),

        secret +

        '|' +

        String(salt)

      );





  return bytes

    .map(

      function(byte) {



        return (

          (

            byte < 0

              ? byte + 256

              : byte

          )

          .toString(16)

          .padStart(

            2,

            '0'

          )

        );



      }

    )

    .join('');



}





/**

 * ============================================================

 * SESSION HASH

 * ============================================================

 */

function djMasterSessionHashV2_(

  token

) {



  const secret =

    PropertiesService

      .getScriptProperties()

      .getProperty(

        DJ_MASTER_ACCOUNT_V2.SECRET_PROPERTY

      );





  const bytes =

    Utilities

      .computeHmacSha256Signature(

        String(token),

        secret

      );





  return bytes

    .map(

      function(byte) {



        return (

          (

            byte < 0

              ? byte + 256

              : byte

          )

          .toString(16)

          .padStart(

            2,

            '0'

          )

        );



      }

    )

    .join('');



}





/**

 * ============================================================

 * SESSION TOKEN

 * ============================================================

 */

function djMasterCreateSessionV2_(

  masterId

) {



  return (



    Utilities.getUuid() +

    '-' +

    Utilities.getUuid() +

    '-' +

    String(

      masterId

    )



  );



}





/**

 * ============================================================

 * SHEET HELPERS

 * ============================================================

 */

function djMasterGetHeadersV2_(

  sheet

) {



  if (

    !sheet ||

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

    .map(

      function(value) {



        return String(

          value || ''

        ).trim();



      }

    );



}





function djMasterFindAccountRowV2_(

  sheet,

  masterId

) {



  if (

    !sheet ||

    sheet.getLastRow() <

    2

  ) {



    return -1;



  }





  const headers =

    djMasterGetHeadersV2_(

      sheet

    );





  const col =

    headers.indexOf(

      'Master_ID'

    );





  if (

    col < 0

  ) {



    return -1;



  }





  const rows =

    sheet

      .getRange(

        2,

        col + 1,

        sheet.getLastRow() - 1,

        1

      )

      .getValues();





  for (

    let i = 0;

    i < rows.length;

    i++

  ) {



    if (

      String(

        rows[i][0] || ''

      )

      .trim()

      .toUpperCase()

      ===

      String(

        masterId

      )

      .trim()

      .toUpperCase()

    ) {



      return i + 2;



    }



  }





  return -1;



}





function djMasterGetCellV2_(

  sheet,

  row,

  headers,

  field

) {



  const col =

    headers.indexOf(

      field

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





function djMasterUpdateFieldsV2_(

  sheet,

  row,

  data

) {



  const headers =

    djMasterGetHeadersV2_(

      sheet

    );





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



      const index =

        headers.indexOf(

          field

        );





      if (

        index >= 0

      ) {



        values[index] =

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
}