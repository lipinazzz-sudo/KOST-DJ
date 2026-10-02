/**
 * ============================================================
 * DJ FAMILY KOST — MASTER ENGINE V2
 * ============================================================
 *
 * SATU PINTU:
 * - Database
 * - API
 * - Login Tenant
 * - Pendaftaran
 * - Kunjungan
 * - Pembayaran
 * - Maintenance
 * - Check-in / Check-out
 * - Pelanggaran
 * - Sinkronisasi Form
 * - Automation
 *
 * PRODUCTION TRIGGER:
 * 1. onFormSubmitDJV2
 * 2. runDJFamilyKostHourly
 *
 * ============================================================
 */

const DJFK = {

  VERSION: '2.0',

  HEADER_ROW: 3,

  DATA_START_ROW: 4,

  FORM_HEADER_ROW: 1,

  ROOM_COUNT: 39,

  DEPOSIT: 300000,

  DUE_DAY: 1,

  FINE_DAY_3: 25000,

  FINE_DAY_5: 50000,

  SESSION_HOURS: 24,

  TIMEZONE:
    Session.getScriptTimeZone() ||
    'Asia/Jakarta',

  ROOMS: [

    101,102,103,104,105,106,107,108,109,

    201,202,203,204,205,
    206,207,208,209,210,

    301,302,303,304,305,
    306,307,308,309,310,

    401,402,403,404,405,
    406,407,408,409,410

  ],

  SHEETS: {

    KAMAR:
      'Kamar',

    TENANT:
      'Tenant',

    KONTRAK:
      'Kontrak',

    PEMBAYARAN:
      'Pembayaran',

    MAINTENANCE:
      'Maintenance',

    CHECKINOUT:
      'CheckInOut',

    PELANGGARAN:
      'Pelanggaran',

    LOG:
      'System_Log',

    DASHBOARD:
      'Dashboard',

    API:
      'API_Data',

    PENGATURAN:
      'Pengaturan',

    AKUN:
      'Akun_Tenant',

    PENDAFTARAN:
      'Pendaftaran',

    KUNJUNGAN:
      'Kunjungan'

  },

  FORM_MAP: {

    'DATA TENANT':
      'TENANT',

    'Perbaikan':
      'MAINTENANCE',

    'Check IN or OUT':
      'CHECKINOUT',

    'Bukti Ttf':
      'PEMBAYARAN'

  },

  HEADERS: {

    KAMAR: [
      'Room_ID',
      'No_Kamar',
      'Lantai',
      'Status',
      'Tenant_ID',
      'Nama_Tenant',
      'Harga_Bulan'
    ],

    TENANT: [

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
      'Status_Pernikahan',
      'Kontak_Darurat',
      'Hubungan_Kontak_Darurat',
      'No_HP_Kontak_Darurat',
      'No_Kamar',
      'Tanggal_Mulai_Tinggal',
      'Rencana_Lama_Tinggal',
      'KTP_File_URL',
      'Surat_Pernyataan_File_URL',
      'Kendaraan',
      'No_Plat',
      'Status_Tenant',
      'Catatan',
      'Last_Sync'

    ],

    KONTRAK: [

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

    ],

    PEMBAYARAN: [

      'Pembayaran_ID',
      'Source_Key',
      'Timestamp_Submit',
      'Tenant_ID',
      'Kontrak_ID',
      'No_Kamar',
      'Nama_Tenant',
      'No_HP',
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
      'Bukti_Pembayaran_URL',
      'Keterangan',
      'Last_Sync'

    ],

    MAINTENANCE: [

      'Maintenance_ID',
      'Source_Key',
      'Timestamp_Submit',
      'Tenant_ID',
      'No_Kamar',
      'Nama_Tenant',
      'No_HP',
      'Lokasi_Masalah',
      'Jenis_Masalah',
      'Deskripsi',
      'Urgensi',
      'Foto_Kerusakan_URL',
      'Izin_Masuk',
      'Waktu_Nyaman',
      'Status',
      'PIC',
      'Tanggal_Tindak_Lanjut',
      'Foto_Sesudah_URL',
      'Biaya',
      'Catatan_Penyelesaian',
      'Last_Sync'

    ],

    CHECKINOUT: [

      'CheckInOut_ID',
      'Source_Key',
      'Timestamp_Submit',
      'Tenant_ID',
      'Jenis_Proses',
      'No_Kamar',
      'Nama_Tenant',
      'No_HP',
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
      'Perkiraan_Pengurangan_Deposit',
      'Pernyataan',
      'Last_Sync'

    ],

    PELANGGARAN: [

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

    ],

    LOG: [

      'Timestamp',
      'Type',
      'Message'

    ],

    AKUN: [

      'Akun_ID',
      'Tenant_ID',
      'Salt',
      'Password_Hash',
      'Status_Akun',
      'Created_At',
      'Last_Login'

    ],

    PENDAFTARAN: [

      'Pendaftaran_ID',
      'Timestamp',
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
      'Catatan',
      'Status_Pendaftaran',
      'Tenant_ID',
      'Kontrak_ID',
      'Last_Update'

    ],

    KUNJUNGAN: [

      'Kunjungan_ID',
      'Timestamp',
      'Nama_Lengkap',
      'No_HP',
      'Email',
      'No_Kamar',
      'Tanggal_Kunjungan',
      'Waktu_Kunjungan',
      'Catatan',
      'Status_Kunjungan',
      'Last_Update'

    ]

  }

};


/* ============================================================
 * ATURAN DENDA
 * ============================================================
 */

const DJFK_FINE_RULES = [

  {
    keys: [
      'MEROKOK DI DALAM KAMAR'
    ],
    kategori:
      'SEDANG',
    denda:
      200000,
    tindakan:
      'Denda Rp200.000 + teguran tertulis'
  },

  {
    keys: [
      'MENGULANGI MEROKOK SETELAH PERINGATAN TERTULIS'
    ],
    kategori:
      'BERAT',
    denda:
      300000,
    tindakan:
      'Denda Rp300.000 + tindakan sesuai ketentuan'
  },

  {
    keys: [
      'TAMU MELEWATI JAM BERTAMU'
    ],
    kategori:
      'SEDANG',
    denda:
      100000,
    tindakan:
      'Denda Rp100.000'
  },

  {
    keys: [
      'KEBISINGAN MENGGANGGU',
      'KEBISINGAN MENGGANGGU SETELAH TEGURAN',
      'KEBISINGAN MENGGANGGU — SETELAH TEGURAN'
    ],
    kategori:
      'SEDANG',
    denda:
      100000,
    tindakan:
      'Denda Rp100.000'
  },

  {
    keys: [
      'AREA BERSAMA TIDAK TERTIB',
      'AREA BERSAMA TIDAK TERTIB SETELAH TEGURAN',
      'AREA BERSAMA TIDAK TERTIB — SETELAH TEGURAN'
    ],
    kategori:
      'SEDANG',
    denda:
      50000,
    tindakan:
      'Denda Rp50.000'
  },

  {
    keys: [
      'TAMU MENGINAP'
    ],
    kategori:
      'SEDANG',
    denda:
      150000,
    tindakan:
      'Denda Rp150.000'
  },

  {
    keys: [
      'MENGINAPKAN ORANG LAIN SECARA BERULANG'
    ],
    kategori:
      'BERAT',
    denda:
      300000,
    tindakan:
      'Denda Rp300.000 + tindakan sesuai ketentuan'
  },

  {
    keys: [
      'MEMBERIKAN AKSES/KUNCI TANPA IZIN',
      'MEMBERIKAN AKSES KUNCI TANPA IZIN'
    ],
    kategori:
      'BERAT',
    denda:
      300000,
    tindakan:
      'Denda Rp300.000 + tindakan sesuai ketentuan'
  },

  {
    keys: [
      'MENYALAHGUNAKAN FASILITAS KOS'
    ],
    kategori:
      'BERAT',
    denda:
      300000,
    tindakan:
      'Denda Rp300.000 + tindakan sesuai ketentuan'
  },

  {
    keys: [
      'PELANGGARAN BERAT LAIN SESUAI KETETAPAN'
    ],
    kategori:
      'BERAT',
    denda:
      300000,
    tindakan:
      'Denda Rp300.000 + tindakan sesuai ketentuan'
  }

];


/* ============================================================
 * MENU
 * ============================================================
 */

function onOpen() {

  SpreadsheetApp
    .getUi()

    .createMenu(
      'DJ FAMILY KOST'
    )

    .addItem(
      'Setup / Perbaiki Sistem',
      'setupDJFamilyKost'
    )

    .addItem(
      'Sinkronkan Semua Form Lama',
      'syncExistingFormsDJV2'
    )

    .addItem(
      'Refresh Dashboard',
      'refreshDashboardDJFK'
    )

    .addItem(
      'Audit Sistem',
      'auditDJFamilyKost'
    )

    .addSeparator()

    .addSubMenu(
      SpreadsheetApp
        .getUi()
        .createMenu(
          'Akun Master'
        )
        .addItem(
          'Tambah Master Account',
          'addMasterAccountV2'
        )
        .addItem(
          'Ganti Password Master',
          'changeMasterPasswordV2'
        )
    )

    .addSeparator()

    .addItem(
      'Atur Password Tenant',
      'setTenantPasswordDJFK'
    )

    .addItem(
      'Setujui Pendaftaran',
      'approveRegistrationDJFK'
    )

    .addToUi();

}


/* ============================================================
 * SETUP UTAMA
 * ============================================================
 */

function setupDJFamilyKost() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();

  if (!ss) {
    throw new Error(
      'Spreadsheet aktif tidak ditemukan.'
    );
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(
      'DJFK_SPREADSHEET_ID',
      ss.getId()
    );

  ensureDatabaseDJFK_(
    ss
  );

  validateRoomsDJFK_(
    ss
  );

  ensureApiSecretDJFK_();

  repairRelationshipsDJFK_(
    ss
  );

  removeAllProjectTriggersDJFK_();

  ScriptApp
    .newTrigger(
      'onFormSubmitDJV2'
    )
    .forSpreadsheet(
      ss
    )
    .onFormSubmit()
    .create();

  ScriptApp
    .newTrigger(
      'runDJFamilyKostHourly'
    )
    .timeBased()
    .everyHours(1)
    .create();

  runDJFamilyKostHourly();

  SpreadsheetApp
    .getUi()
    .alert(
      'Setup selesai.\n\n' +
      'Trigger production:\n' +
      '1. onFormSubmitDJV2\n' +
      '2. runDJFamilyKostHourly'
    );

}


/* ============================================================
 * DATABASE
 * ============================================================
 */

function ensureDatabaseDJFK_(ss) {

  Object
    .keys(
      DJFK.HEADERS
    )
    .forEach(
      function(key) {

        ensureSheetColumnsDJFK_(
          ss,
          DJFK.SHEETS[key],
          DJFK.HEADERS[key]
        );

      }
    );


  let pengaturan =
    ss.getSheetByName(
      DJFK.SHEETS.PENGATURAN
    );


  if (!pengaturan) {

    pengaturan =
      ss.insertSheet(
        DJFK.SHEETS.PENGATURAN
      );

  }


  ensureRowOneHeadersDJFK_(
    pengaturan,
    [
      'Parameter',
      'Nilai'
    ]
  );


  if (
    !ss.getSheetByName(
      DJFK.SHEETS.DASHBOARD
    )
  ) {

    ss.insertSheet(
      DJFK.SHEETS.DASHBOARD
    );

  }


  if (
    !ss.getSheetByName(
      DJFK.SHEETS.API
    )
  ) {

    ss.insertSheet(
      DJFK.SHEETS.API
    );

  }


  const kamar =
    ss.getSheetByName(
      DJFK.SHEETS.KAMAR
    );


  const headers =
    getHeadersDJFK_(
      kamar
    );


  [
    'No_Kamar',
    'Status',
    'Harga_Bulan'
  ].forEach(
    function(requiredHeader) {

      if (
        findColDJFK_(
          headers,
          [requiredHeader]
        ) < 0
      ) {

        throw new Error(
          'Sheet Kamar harus memiliki kolom ' +
          requiredHeader +
          '.'
        );

      }

    }
  );

}


function ensureSheetColumnsDJFK_(
  ss,
  name,
  headers
) {

  if (!name) {
    return null;
  }


  let sh =
    ss.getSheetByName(
      name
    );


  if (!sh) {

    sh =
      ss.insertSheet(
        name
      );

  }


  if (
    sh.getMaxColumns() <
    headers.length
  ) {

    sh.insertColumnsAfter(
      sh.getMaxColumns(),
      headers.length -
      sh.getMaxColumns()
    );

  }


  const row =
    DJFK.HEADER_ROW;


  const current =
    sh
      .getRange(
        row,
        1,
        1,
        Math.max(
          sh.getLastColumn(),
          headers.length
        )
      )
      .getValues()[0]
      .map(
        cleanDJFK_
      );


  if (
    current.every(
      function(v) {
        return !v;
      }
    )
  ) {

    sh
      .getRange(
        row,
        1,
        1,
        headers.length
      )
      .setValues([
        headers
      ]);

  } else {

    ensureColumnsIfNeededDJFK_(
      sh,
      headers
    );

  }


  sh.setFrozenRows(
    row
  );


  return sh;

}


function ensureColumnsIfNeededDJFK_(
  sheet,
  headers
) {

  let current =
    getHeadersDJFK_(
      sheet
    );


  headers.forEach(
    function(header) {

      if (
        findColDJFK_(
          current,
          [header]
        ) < 0
      ) {

        sheet.insertColumnAfter(
          Math.max(
            sheet.getLastColumn(),
            1
          )
        );

        sheet
          .getRange(
            DJFK.HEADER_ROW,
            sheet.getLastColumn()
          )
          .setValue(
            header
          );

        current =
          getHeadersDJFK_(
            sheet
          );

      }

    }
  );

}


function ensureRowOneHeadersDJFK_(
  sheet,
  headers
) {

  const current =
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
      .map(
        cleanDJFK_
      );


  if (
    current.every(
      function(v) {
        return !v;
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
      .setValues([
        headers
      ]);

  }

}


/* ============================================================
 * DATABASE HELPERS
 * ============================================================
 */

function getHeadersDJFK_(
  sheet
) {

  return sheet
    .getRange(
      DJFK.HEADER_ROW,
      1,
      1,
      Math.max(
        sheet.getLastColumn(),
        1
      )
    )
    .getValues()[0]
    .map(
      cleanDJFK_
    );

}


function findColDJFK_(
  headers,
  aliases
) {

  const normalized =
    headers.map(
      normalizeDJFK_
    );


  for (
    let i = 0;
    i < aliases.length;
    i++
  ) {

    const target =
      normalizeDJFK_(
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


function normalizeDJFK_(
  value
) {

  return String(
    value == null
      ? ''
      : value
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9_]+/g,
      '_'
    )
    .replace(
      /_+/g,
      '_'
    )
    .replace(
      /^_|_$/g,
      ''
    );

}


function cleanDJFK_(
  value
) {

  return value == null
    ? ''
    : String(value).trim();

}


function readRecordsDJFK_(
  sheet
) {

  const headers =
    getHeadersDJFK_(
      sheet
    );


  if (
    sheet.getLastRow() <
    DJFK.DATA_START_ROW
  ) {

    return {
      headers: headers,
      rows: []
    };

  }


  const values =
    sheet
      .getRange(
        DJFK.DATA_START_ROW,
        1,
        sheet.getLastRow() -
          DJFK.HEADER_ROW,
        sheet.getLastColumn()
      )
      .getValues();


  return {

    headers: headers,

    rows:
      values.filter(
        function(row) {

          return row.some(
            function(value) {

              return (
                value !== '' &&
                value !== null &&
                value !== undefined
              );

            }
          );

        }
      )

  };

}


function rowToObjectDJFK_(
  headers,
  row,
  rowNumber
) {

  const object = {
    _row: rowNumber
  };


  headers.forEach(
    function(header, index) {

      if (header) {

        object[header] =
          row[index];

      }

    }
  );


  return object;

}


function findByValueDJFK_(
  sheet,
  headerName,
  value
) {

  const rec =
    readRecordsDJFK_(
      sheet
    );


  const col =
    findColDJFK_(
      rec.headers,
      [headerName]
    );


  if (
    col < 0
  ) {

    return null;

  }


  for (
    let i = 0;
    i < rec.rows.length;
    i++
  ) {

    if (
      cleanDJFK_(
        rec.rows[i][col]
      ) ===
      cleanDJFK_(
        value
      )
    ) {

      return rowToObjectDJFK_(
        rec.headers,
        rec.rows[i],
        DJFK.DATA_START_ROW + i
      );

    }

  }


  return null;

}


function upsertDJFK_(
  sheet,
  data,
  keyHeader
) {

  const headers =
    getHeadersDJFK_(
      sheet
    );


  const keyCol =
    findColDJFK_(
      headers,
      [keyHeader]
    );


  if (
    keyCol < 0
  ) {

    throw new Error(
      'Kolom ' +
      keyHeader +
      ' tidak ditemukan di ' +
      sheet.getName()
    );

  }


  const key =
    cleanDJFK_(
      data[keyHeader]
    );


  let targetRow =
    -1;


  if (
    key &&
    sheet.getLastRow() >=
    DJFK.DATA_START_ROW
  ) {

    const values =
      sheet
        .getRange(
          DJFK.DATA_START_ROW,
          keyCol + 1,
          sheet.getLastRow() -
            DJFK.HEADER_ROW,
          1
        )
        .getValues();


    for (
      let i = 0;
      i < values.length;
      i++
    ) {

      if (
        cleanDJFK_(
          values[i][0]
        ) === key
      ) {

        targetRow =
          DJFK.DATA_START_ROW + i;

        break;

      }

    }

  }


  const output =
    headers.map(
      function(header) {

        return Object.prototype
          .hasOwnProperty
          .call(
            data,
            header
          )
          ? data[header]
          : '';

      }
    );


  if (
    targetRow < 0
  ) {

    sheet.appendRow(
      output
    );

    return sheet.getLastRow();

  }


  const old =
    sheet
      .getRange(
        targetRow,
        1,
        1,
        headers.length
      )
      .getValues()[0];


  headers.forEach(
    function(header, index) {

      if (
        !Object.prototype
          .hasOwnProperty
          .call(
            data,
            header
          )
      ) {

        output[index] =
          old[index];

      }

    }
  );


  sheet
    .getRange(
      targetRow,
      1,
      1,
      headers.length
    )
    .setValues([
      output
    ]);


  return targetRow;

}


/* ============================================================
 * SPREADSHEET / SECURITY
 * ============================================================
 */

function getSpreadsheetDJFK_() {

  const props =
    PropertiesService
      .getScriptProperties();


  const id =
    props.getProperty(
      'DJFK_SPREADSHEET_ID'
    );


  if (id) {

    try {

      return SpreadsheetApp
        .openById(
          id
        );

    } catch (_) {}

  }


  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  if (ss) {

    props
      .setProperty(
        'DJFK_SPREADSHEET_ID',
        ss.getId()
      );


    return ss;

  }


  throw new Error(
    'Spreadsheet belum terdaftar. Jalankan setupDJFamilyKost().'
  );

}


function ensureApiSecretDJFK_() {

  const props =
    PropertiesService
      .getScriptProperties();


  if (
    !props.getProperty(
      'DJFK_API_SECRET'
    )
  ) {

    props.setProperty(
      'DJFK_API_SECRET',
      Utilities.getUuid() +
      '-' +
      Utilities.getUuid()
    );

  }

}


function tokenHashDJFK_(
  password,
  salt
) {

  const bytes =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(password) +
      '|' +
      String(salt),
      Utilities.Charset.UTF_8
    );


  return Utilities
    .base64EncodeWebSafe(
      bytes
    );

}


function hashIdDJFK_(
  text
) {

  const bytes =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      String(text),
      Utilities.Charset.UTF_8
    );


  return Utilities
    .base64EncodeWebSafe(
      bytes
    )
    .replace(
      /=+$/,
      ''
    )
    .slice(
      0,
      18
    )
    .toUpperCase();

}


function signDJFK_(
  payload
) {

  const secret =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        'DJFK_API_SECRET'
      );


  const raw =
    Utilities
      .base64EncodeWebSafe(
        Utilities
          .newBlob(
            JSON.stringify(payload)
          )
          .getBytes()
      )
      .replace(
        /=+$/,
        ''
      );


  const signature =
    Utilities
      .computeHmacSha256Signature(
        raw,
        secret
      );


  return (
    raw +
    '.' +
    Utilities
      .base64EncodeWebSafe(
        signature
      )
      .replace(
        /=+$/,
        ''
      )
  );

}


function verifyTokenDJFK_(
  token
) {

  const parts =
    String(
      token || ''
    )
    .split('.');


  if (
    parts.length !== 2
  ) {

    throw new Error(
      'Sesi login tidak valid.'
    );

  }


  const secret =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        'DJFK_API_SECRET'
      );


  if (!secret) {

    throw new Error(
      'API secret belum dibuat.'
    );

  }


  const expected =
    Utilities
      .base64EncodeWebSafe(
        Utilities
          .computeHmacSha256Signature(
            parts[0],
            secret
          )
      )
      .replace(
        /=+$/,
        ''
      );


  if (
    expected !== parts[1]
  ) {

    throw new Error(
      'Sesi login tidak valid.'
    );

  }


  const payload =
    JSON.parse(
      Utilities
        .newBlob(
          Utilities
            .base64DecodeWebSafe(
              parts[0]
            )
        )
        .getDataAsString()
    );


  if (
    Number(
      payload.exp || 0
    ) <
    Date.now()
  ) {

    throw new Error(
      'Sesi login sudah kedaluwarsa. Silakan login kembali.'
    );

  }


  return payload;

}


function createSessionDJFK_(
  tenantId
) {

  const now =
    Date.now();


  return signDJFK_({
    v: 1,
    tenantId:
      String(tenantId),
    iat:
      now,
    exp:
      now +
      DJFK.SESSION_HOURS *
      3600000
  });

}


/* ============================================================
 * TENANT / CONTRACT / ROOM
 * ============================================================
 */

function findTenantDJFK_(
  tenantId
) {

  const rec =
    readRecordsDJFK_(
      getSpreadsheetDJFK_()
        .getSheetByName(
          DJFK.SHEETS.TENANT
        )
    );


  const col =
    findColDJFK_(
      rec.headers,
      ['Tenant_ID']
    );


  for (
    let i = 0;
    i < rec.rows.length;
    i++
  ) {

    if (
      cleanDJFK_(
        rec.rows[i][col]
      ) ===
      cleanDJFK_(
        tenantId
      )
    ) {

      return rowToObjectDJFK_(
        rec.headers,
        rec.rows[i],
        DJFK.DATA_START_ROW + i
      );

    }

  }


  return null;

}


function getAccountDJFK_(
  tenantId
) {

  const rec =
    readRecordsDJFK_(
      getSpreadsheetDJFK_()
        .getSheetByName(
          DJFK.SHEETS.AKUN
        )
    );


  const col =
    findColDJFK_(
      rec.headers,
      ['Tenant_ID']
    );


  for (
    let i = 0;
    i < rec.rows.length;
    i++
  ) {

    if (
      cleanDJFK_(
        rec.rows[i][col]
      ) ===
      cleanDJFK_(
        tenantId
      )
    ) {

      return rowToObjectDJFK_(
        rec.headers,
        rec.rows[i],
        DJFK.DATA_START_ROW + i
      );

    }

  }


  return null;

}


function findActiveTenantByRoomDJFK_(
  room
) {

  const rec =
    readRecordsDJFK_(
      getSpreadsheetDJFK_()
        .getSheetByName(
          DJFK.SHEETS.TENANT
        )
    );


  const roomCol =
    findColDJFK_(
      rec.headers,
      ['No_Kamar']
    );


  const statusCol =
    findColDJFK_(
      rec.headers,
      ['Status_Tenant']
    );


  for (
    let i = 0;
    i < rec.rows.length;
    i++
  ) {

    if (
      cleanDJFK_(
        rec.rows[i][roomCol]
      ) ===
      cleanDJFK_(
        room
      ) &&
      [
        'aktif',
        'active'
      ].includes(
        normalizeDJFK_(
          rec.rows[i][statusCol]
        )
      )
    ) {

      return rowToObjectDJFK_(
        rec.headers,
        rec.rows[i],
        DJFK.DATA_START_ROW + i
      );

    }

  }


  return null;

}


function findActiveContractDJFK_(
  tenantId
) {

  const rec =
    readRecordsDJFK_(
      getSpreadsheetDJFK_()
        .getSheetByName(
          DJFK.SHEETS.KONTRAK
        )
    );


  const tenantCol =
    findColDJFK_(
      rec.headers,
      ['Tenant_ID']
    );


  const statusCol =
    findColDJFK_(
      rec.headers,
      ['Status_Kontrak']
    );


  for (
    let i = 0;
    i < rec.rows.length;
    i++
  ) {

    if (
      cleanDJFK_(
        rec.rows[i][tenantCol]
      ) ===
      cleanDJFK_(
        tenantId
      ) &&
      [
        'aktif',
        'active'
      ].includes(
        normalizeDJFK_(
          rec.rows[i][statusCol]
        )
      )
    ) {

      return rowToObjectDJFK_(
        rec.headers,
        rec.rows[i],
        DJFK.DATA_START_ROW + i
      );

    }

  }


  return null;

}


function getRoomDJFK_(
  room
) {

  const rec =
    readRecordsDJFK_(
      getSpreadsheetDJFK_()
        .getSheetByName(
          DJFK.SHEETS.KAMAR
        )
    );


  const col =
    findColDJFK_(
      rec.headers,
      ['No_Kamar']
    );


  for (
    let i = 0;
    i < rec.rows.length;
    i++
  ) {

    if (
      cleanDJFK_(
        rec.rows[i][col]
      ) ===
      cleanDJFK_(
        room
      )
    ) {

      return rowToObjectDJFK_(
        rec.headers,
        rec.rows[i],
        DJFK.DATA_START_ROW + i
      );

    }

  }


  return null;

}


function roomPriceDJFK_(
  room
) {

  const roomData =
    getRoomDJFK_(
      room
    );


  if (!roomData) {
    return 0;
  }


  const value =
    roomData.Harga_Bulan;


  if (
    typeof value ===
    'number'
  ) {

    return value;

  }


  const number =
    Number(
      String(
        value || ''
      )
      .replace(
        /rp/ig,
        ''
      )
      .replace(
        /./g,
        ''
      )
      .replace(
        /,/g,
        ''
      )
      .trim()
    );


  return isNaN(
    number
  )
    ? 0
    : number;

}


function validateRoomsDJFK_(
  ss
) {

  const rec =
    readRecordsDJFK_(
      ss.getSheetByName(
        DJFK.SHEETS.KAMAR
      )
    );


  const col =
    findColDJFK_(
      rec.headers,
      ['No_Kamar']
    );


  const seen = {};


  rec.rows.forEach(
    function(row) {

      const room =
        cleanDJFK_(
          row[col]
        );


      if (room) {
        seen[room] =
          (seen[room] || 0) + 1;
      }

    }
  );


  const missing =
    DJFK.ROOMS.filter(
      function(room) {

        return !seen[
          String(room)
        ];

      }
    );


  const duplicates =
    Object.keys(
      seen
    ).filter(
      function(room) {

        return (
          DJFK.ROOMS
            .includes(
              Number(room)
            ) &&
          seen[room] > 1
        );

      }
    );


  if (
    missing.length > 0
  ) {

    throw new Error(
      'Kamar resmi belum lengkap: ' +
      missing.join(', ')
    );

  }


  if (
    duplicates.length > 0
  ) {

    throw new Error(
      'Nomor kamar duplikat: ' +
      duplicates.join(', ')
    );

  }

}


function DJ39RoomUnavailableDJFK_(
  room
) {

  if (
    !DJFK.ROOMS.includes(
      Number(room)
    )
  ) {

    throw new Error(
      'Nomor kamar tidak valid.'
    );

  }


  const roomData =
    getRoomDJFK_(
      room
    );


  if (!roomData) {

    throw new Error(
      'Nomor kamar tidak ditemukan.'
    );

  }


  return (
    normalizeDJFK_(
      roomData.Status
    ) ===
    'terisi' ||
    !!findActiveTenantByRoomDJFK_(
      room
    )
  );

}


function updateRoomDJFK_(
  room,
  status,
  tenantId,
  name
) {

  const sh =
    getSpreadsheetDJFK_()
      .getSheetByName(
        DJFK.SHEETS.KAMAR
      );


  const roomData =
    getRoomDJFK_(
      room
    );


  if (!roomData) {
    return false;
  }


  const headers =
    getHeadersDJFK_(
      sh
    );


  const set =
    function(
      aliases,
      value
    ) {

      const col =
        findColDJFK_(
          headers,
          aliases
        );


      if (
        col >= 0
      ) {

        sh
          .getRange(
            roomData._row,
            col + 1
          )
          .setValue(
            value
          );

      }

    };


  set(
    ['Status'],
    status
  );

  set(
    ['Tenant_ID'],
    tenantId || ''
  );

  set(
    ['Nama_Tenant'],
    name || ''
  );

  set(
    ['Room_ID'],
    'ROOM-' + room
  );

  set(
    ['Lantai'],
    Math.floor(
      Number(room) / 100
    )
  );


  return true;

}


/* ============================================================
 * PUBLIC ROOM API
 * ============================================================
 */

function publicRoomsDJFK_() {

  const rec =
    readRecordsDJFK_(
      getSpreadsheetDJFK_()
        .getSheetByName(
          DJFK.SHEETS.KAMAR
        )
    );


  const noCol =
    findColDJFK_(
      rec.headers,
      ['No_Kamar']
    );


  const statusCol =
    findColDJFK_(
      rec.headers,
      ['Status']
    );


  const priceCol =
    findColDJFK_(
      rec.headers,
      ['Harga_Bulan']
    );


  const floorCol =
    findColDJFK_(
      rec.headers,
      ['Lantai']
    );


  const result = [];


  rec.rows.forEach(
    function(row) {

      const room =
        Number(
          cleanDJFK_(
            row[noCol]
          )
        );


      if (
        !DJFK.ROOMS.includes(
          room
        )
      ) {

        return;

      }


      const price =
        typeof row[priceCol] ===
        'number'
          ? row[priceCol]
          : roomPriceDJFK_(
              room
            );


      const occupied =
        normalizeDJFK_(
          row[statusCol]
        ) ===
        'terisi';


      result.push({

        no_kamar:
          room,

        lantai:
          Number(
            row[floorCol] ||
            Math.floor(
              room / 100
            )
          ),

        status:
          occupied
            ? 'TERISI'
            : price > 0
              ? 'KOSONG'
              : 'SEGERA',

        harga_bulan:
          price

      });

    }
  );


  return result.sort(
    function(a,b) {

      return (
        a.no_kamar -
        b.no_kamar
      );

    }
  );

}


/* ============================================================
 * API WEB
 * ============================================================
 */

function jsonDJFK_(
  payload
) {

  return ContentService
    .createTextOutput(
      JSON.stringify(
        payload
      )
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}


function doGet(
  e
) {

  try {

    const action =
      cleanDJFK_(
        e &&
        e.parameter &&
        e.parameter.action ||
        'rooms'
      )
      .toLowerCase();


    if (
      action ===
      'rooms'
    ) {

      const rooms =
        publicRoomsDJFK_();


      return jsonDJFK_({

        ok: true,

        version:
          DJFK.VERSION,

        count:
          rooms.length,

        data:
          rooms

      });

    }


    if (
      action ===
      'health'
    ) {

      return jsonDJFK_({

        ok: true,

        version:
          DJFK.VERSION,

        rooms:
          publicRoomsDJFK_()
            .length

      });

    }


    if (
      action ===
      'tenant' ||
      action ===
      'tenantdashboard'
    ) {

      const session =
        verifyTokenDJFK_(
          e.parameter.token
        );


      return jsonDJFK_({

        ok: true,

        data:
          tenantDashboardDJFK_(
            session.tenantId
          )

      });

    }


    return jsonDJFK_({

      ok: false,

      error:
        'Action GET tidak dikenal.'

    });

  } catch (error) {

    return jsonDJFK_({

      ok: false,

      error:
        error.message

    });

  }

}


function doPost(
  e
) {

  try {

    const body =
      parsePostDJFK_(
        e
      );


    const action =
      cleanDJFK_(
        body.action
      )
      .toLowerCase();


    if (
      action ===
      'login'
    ) {

      return jsonDJFK_(
        loginDJFK_(
          body
        )
      );

    }


    if (
      action ===
      'registration'
    ) {

      return jsonDJFK_(
        registrationDJFK_(
          body
        )
      );

    }


    if (
      action ===
      'visit'
    ) {

      return jsonDJFK_(
        visitDJFK_(
          body
        )
      );

    }


    const session =
      verifyTokenDJFK_(
        body.token
      );


    if (
      action ===
      'payment'
    ) {

      return jsonDJFK_(
        paymentDJFK_(
          body,
          session.tenantId
        )
      );

    }


    if (
      action ===
      'maintenance'
    ) {

      return jsonDJFK_(
        maintenanceDJFK_(
          body,
          session.tenantId
        )
      );

    }


    if (
      action ===
      'checkinout'
    ) {

      return jsonDJFK_(
        checkinoutDJFK_(
          body,
          session.tenantId
        )
      );

    }


    if (
      action ===
      'profile'
    ) {

      return jsonDJFK_({

        ok: true,

        data:
          tenantDashboardDJFK_(
            session.tenantId
          )

      });

    }


    throw new Error(
      'Action POST tidak dikenal.'
    );

  } catch (error) {

    return jsonDJFK_({

      ok: false,

      error:
        error.message

    });

  }

}


function parsePostDJFK_(
  e
) {

  const raw =
    e &&
    e.postData &&
    e.postData.contents ||
    '{}';


  try {

    return JSON.parse(
      raw
    );

  } catch (_) {

    return (
      e &&
      e.parameter ||
      {}
    );

  }

}


/* ============================================================
 * LOGIN
 * ============================================================
 */

function loginDJFK_(
  body
) {

  const tenantId =
    cleanDJFK_(
      body.tenantId ||
      body.tenant_id
    );


  const password =
    String(
      body.password ||
      ''
    );


  if (
    !tenantId ||
    !password
  ) {

    throw new Error(
      'Tenant ID dan password wajib diisi.'
    );

  }


  const tenant =
    findTenantDJFK_(
      tenantId
    );


  if (!tenant) {

    throw new Error(
      'Tenant ID tidak ditemukan.'
    );

  }


  if (
    ![
      'aktif',
      'active'
    ].includes(
      normalizeDJFK_(
        tenant.Status_Tenant
      )
    )
  ) {

    throw new Error(
      'Tenant tidak aktif.'
    );

  }


  const account =
    getAccountDJFK_(
      tenantId
    );


  if (!account) {

    throw new Error(
      'Akun login belum dibuat. Hubungi pengelola.'
    );

  }


  if (
    normalizeDJFK_(
      account.Status_Akun
    ) !==
    'aktif'
  ) {

    throw new Error(
      'Akun login dinonaktifkan.'
    );

  }


  if (
    tokenHashDJFK_(
      password,
      account.Salt
    ) !==
    cleanDJFK_(
      account.Password_Hash
    )
  ) {

    throw new Error(
      'Password salah.'
    );

  }


  const sh =
    getSpreadsheetDJFK_()
      .getSheetByName(
        DJFK.SHEETS.AKUN
      );


  const headers =
    getHeadersDJFK_(
      sh
    );


  const lastLoginCol =
    findColDJFK_(
      headers,
      ['Last_Login']
    );


  if (
    lastLoginCol >= 0
  ) {

    sh
      .getRange(
        account._row,
        lastLoginCol + 1
      )
      .setValue(
        new Date()
      );

  }


  return {

    ok: true,

    token:
      createSessionDJFK_(
        tenantId
      ),

    data:
      safeTenantDJFK_(
        tenantId
      )

  };

}


function safeTenantDJFK_(
  tenantId
) {

  const tenant =
    findTenantDJFK_(
      tenantId
    );


  if (!tenant) {
    throw new Error(
      'Tenant tidak ditemukan.'
    );
  }


  const contract =
    findActiveContractDJFK_(
      tenantId
    );


  return {

    tenant_id:
      cleanDJFK_(
        tenant.Tenant_ID
      ),

    nama_lengkap:
      cleanDJFK_(
        tenant.Nama_Lengkap
      ),

    nama_panggilan:
      cleanDJFK_(
        tenant.Nama_Panggilan
      ),

    no_hp:
      cleanDJFK_(
        tenant.No_HP
      ),

    email:
      cleanDJFK_(
        tenant.Email
      ),

    no_kamar:
      cleanDJFK_(
        tenant.No_Kamar
      ),

    status_tenant:
      cleanDJFK_(
        tenant.Status_Tenant
      ),

    kontrak:
      contract
        ? {

            kontrak_id:
              cleanDJFK_(
                contract.Kontrak_ID
              ),

            tanggal_mulai:
              formatDateDJFK_(
                contract.Tanggal_Mulai
              ),

            tanggal_berakhir:
              formatDateDJFK_(
                contract.Tanggal_Berakhir
              ),

            harga_sewa:
              Number(
                contract.Harga_Sewa ||
                0
              ),

            deposit:
              Number(
                contract.Deposit ||
                0
              ),

            status_kontrak:
              cleanDJFK_(
                contract.Status_Kontrak
              )

          }

        : null

  };

}


/* ============================================================
 * TENANT DASHBOARD
 * ============================================================
 */

function tenantDashboardDJFK_(
  tenantId
) {

  const tenant =
    findTenantDJFK_(
      tenantId
    );


  if (!tenant) {

    throw new Error(
      'Tenant tidak ditemukan.'
    );

  }


  return {

    tenant:
      safeTenantDJFK_(
        tenantId
      ),

    payment:
      currentPaymentDJFK_(
        tenantId
      ),

    payments:
      paymentHistoryDJFK_(
        tenantId
      ),

    maintenance:
      openMaintenanceDJFK_(
        tenantId
      )

  };

}


/* ============================================================
 * DATE / PAYMENT
 * ============================================================
 */

function currentPeriodDJFK_() {

  return Utilities
    .formatDate(
      new Date(),
      DJFK.TIMEZONE,
      'yyyy-MM'
    );

}


function parseDateDJFK_(
  value
) {

  if (
    value instanceof Date &&
    !isNaN(
      value.getTime()
    )
  ) {

    return new Date(
      value
    );

  }


  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {

    return null;

  }


  const text =
    String(value).trim();


  const match =
    text.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/
    );


  if (match) {

    return new Date(

      Number(
        match[1]
      ),

      Number(
        match[2]
      ) - 1,

      Number(
        match[3]
      ),

      Number(
        match[4] || 0
      ),

      Number(
        match[5] || 0
      ),

      0,

      0

    );

  }


  const date =
    new Date(
      text
    );


  return isNaN(
    date.getTime()
  )
    ? null
    : date;

}


function formatDateDJFK_(
  value
) {

  const date =
    parseDateDJFK_(
      value
    );


  return date

    ? Utilities.formatDate(
        date,
        DJFK.TIMEZONE,
        'yyyy-MM-dd'
      )

    : '';

}


function dateOnlyDJFK_(
  value
) {

  const date =
    parseDateDJFK_(
      value
    );


  return date
    ? new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
    : null;

}


function daysAfterDueDJFK_(
  date,
  due
) {

  const a =
    dateOnlyDJFK_(
      date
    );


  const b =
    dateOnlyDJFK_(
      due
    );


  if (!a || !b) {
    return 0;
  }


  return Math.floor(
    (
      a.getTime() -
      b.getTime()
    ) /
    86400000
  );

}


function fineDJFK_(
  date,
  due
) {

  const days =
    daysAfterDueDJFK_(
      date,
      due
    );


  if (
    days <= 1
  ) {

    return 0;

  }


  if (
    days <= 3
  ) {

    return DJFK.FINE_DAY_3;

  }


  return DJFK.FINE_DAY_5;

}


function paymentStatusDJFK_(
  paid,
  total,
  due
) {

  const amount =
    Number(
      paid || 0
    );


  const totalValue =
    Number(
      total || 0
    );


  if (
    amount >= totalValue &&
    totalValue > 0
  ) {

    return 'LUNAS';

  }


  const late =
    daysAfterDueDJFK_(
      new Date(),
      due
    ) > 1;


  if (
    amount > 0
  ) {

    return late
      ? 'TERLAMBAT'
      : 'SEBAGIAN';

  }


  return late
    ? 'TERLAMBAT'
    : 'BELUM BAYAR';

}


function dueDateFromPeriodDJFK_(
  period
) {

  const match =
    String(
      period || ''
    )
    .match(
      /^(\d{4})-(\d{2})$/
    );


  if (!match) {

    throw new Error(
      'Periode pembayaran harus YYYY-MM.'
    );

  }


  return new Date(

    Number(
      match[1]
    ),

    Number(
      match[2]
    ) - 1,

    DJFK.DUE_DAY

  );

}


function findPaymentDJFK_(
  tenantId,
  period
) {

  const rec =
    readRecordsDJFK_(
      getSpreadsheetDJFK_()
        .getSheetByName(
          DJFK.SHEETS.PEMBAYARAN
        )
    );


  const tenantCol =
    findColDJFK_(
      rec.headers,
      ['Tenant_ID']
    );


  const periodCol =
    findColDJFK_(
      rec.headers,
      ['Periode_Pembayaran']
    );


  for (
    let i = 0;
    i < rec.rows.length;
    i++
  ) {

    if (
      cleanDJFK_(
        rec.rows[i][tenantCol]
      ) ===
      cleanDJFK_(
        tenantId
      ) &&
      String(
        rec.rows[i][periodCol] ||
        ''
      )
      .slice(0,7) ===
      String(
        period
      )
      .slice(0,7)
    ) {

      return rowToObjectDJFK_(
        rec.headers,
        rec.rows[i],
        DJFK.DATA_START_ROW + i
      );

    }

  }


  return null;

}


function currentPaymentDJFK_(
  tenantId
) {

  return findPaymentDJFK_(
    tenantId,
    currentPeriodDJFK_()
  );

}


function paymentHistoryDJFK_(
  tenantId
) {

  const rec =
    readRecordsDJFK_(
      getSpreadsheetDJFK_()
        .getSheetByName(
          DJFK.SHEETS.PEMBAYARAN
        )
    );


  const tenantCol =
    findColDJFK_(
      rec.headers,
      ['Tenant_ID']
    );


  const result = [];


  rec.rows.forEach(
    function(row, index) {

      if (
        cleanDJFK_(
          row[tenantCol]
        ) !==
        cleanDJFK_(
          tenantId
        )
      ) {

        return;

      }


      const item =
        rowToObjectDJFK_(
          rec.headers,
          row,
          DJFK.DATA_START_ROW + index
        );


      result.push({

        id:
          item.Pembayaran_ID,

        period:
          String(
            item.Periode_Pembayaran ||
            ''
          ).slice(0,7),

        tanggal:
          formatDateDJFK_(
            item.Tanggal_Pembayaran
          ),

        nominal:
          Number(
            item.Nominal_Dibayar ||
            0
          ),

        denda:
          Number(
            item.Denda_Terhitung ||
            0
          ),

        total:
          Number(
            item.Total_Tagihan ||
            0
          ),

        selisih:
          Number(
            item.Selisih ||
            0
          ),

        status:
          item.Status_Pembayaran,

        verifikasi:
          item.Status_Verifikasi

      });

    }
  );


  return result
    .sort(
      function(a,b) {

        return String(
          b.period
        )
        .localeCompare(
          String(a.period)
        );

      }
    )
    .slice(
      0,
      12
    );

}


/* ============================================================
 * GENERATE TAGIHAN
 * ============================================================
 */

function generateMonthlyPaymentsDJFK_() {

  const ss =
    getSpreadsheetDJFK_();


  const rec =
    readRecordsDJFK_(
      ss.getSheetByName(
        DJFK.SHEETS.KONTRAK
      )
    );


  const tenantCol =
    findColDJFK_(
      rec.headers,
      ['Tenant_ID']
    );


  const statusCol =
    findColDJFK_(
      rec.headers,
      ['Status_Kontrak']
    );


  const roomCol =
    findColDJFK_(
      rec.headers,
      ['No_Kamar']
    );


  const rateCol =
    findColDJFK_(
      rec.headers,
      ['Harga_Sewa']
    );


  const contractCol =
    findColDJFK_(
      rec.headers,
      ['Kontrak_ID']
    );


  const period =
    currentPeriodDJFK_();


  const due =
    dueDateFromPeriodDJFK_(
      period
    );


  let created =
    0;


  for (
    let i = 0;
    i < rec.rows.length;
    i++
  ) {

    if (
      ![
        'aktif',
        'active'
      ].includes(
        normalizeDJFK_(
          rec.rows[i][statusCol]
        )
      )
    ) {

      continue;

    }


    const tenantId =
      cleanDJFK_(
        rec.rows[i][tenantCol]
      );


    if (
      !tenantId ||
      findPaymentDJFK_(
        tenantId,
        period
      )
    ) {

      continue;

    }


    const tenant =
      findTenantDJFK_(
        tenantId
      );


    if (!tenant) {
      continue;
    }


    const room =
      cleanDJFK_(
        rec.rows[i][roomCol]
      );


    const rate =
      Number(
        rec.rows[i][rateCol] ||
        roomPriceDJFK_(
          room
        )
      );


    const paymentData = {

      Pembayaran_ID:
        'PAY-' +
        hashIdDJFK_(
          tenantId +
          '|' +
          period
        ),

      Source_Key:
        'AUTO|' +
        tenantId +
        '|' +
        period,

      Timestamp_Submit:
        new Date(),

      Tenant_ID:
        tenantId,

      Kontrak_ID:
        cleanDJFK_(
          rec.rows[i][contractCol]
        ),

      No_Kamar:
        room,

      Nama_Tenant:
        tenant.Nama_Lengkap,

      No_HP:
        tenant.No_HP,

      Periode_Pembayaran:
        period,

      Tanggal_Pembayaran:
        '',

      Jatuh_Tempo:
        due,

      Tarif_Kamar:
        rate,

      Nominal_Dibayar:
        0,

      Denda_Terhitung:
        0,

      Total_Tagihan:
        rate,

      Selisih:
        -rate,

      Status_Pembayaran:
        'BELUM BAYAR',

      Status_Verifikasi:
        'BELUM ADA PEMBAYARAN',

      Metode_Pembayaran:
        '',

      Bukti_Pembayaran_URL:
        '',

      Keterangan:
        'Tagihan otomatis',

      Last_Sync:
        new Date()

    };


    upsertDJFK_(
      ss.getSheetByName(
        DJFK.SHEETS.PEMBAYARAN
      ),
      paymentData,
      'Pembayaran_ID'
    );


    created++;

  }


  return created;

}


/* ============================================================
 * PEMBAYARAN WEB
 * ============================================================
 */

function paymentDJFK_(
  body,
  tenantId
) {

  const tenant =
    findTenantDJFK_(
      tenantId
    );


  if (!tenant) {

    throw new Error(
      'Tenant tidak ditemukan.'
    );

  }


  const contract =
    findActiveContractDJFK_(
      tenantId
    );


  if (!contract) {

    throw new Error(
      'Kontrak aktif tidak ditemukan.'
    );

  }


  const period =
    String(
      body.period ||
      body.periode ||
      currentPeriodDJFK_()
    )
    .slice(0,7);


  const due =
    dueDateFromPeriodDJFK_(
      period
    );


  const date =
    parseDateDJFK_(
      body.paymentDate ||
      body.tanggal_pembayaran ||
      new Date()
    );


  if (!date) {

    throw new Error(
      'Tanggal pembayaran tidak valid.'
    );

  }


  const amount =
    Number(
      body.amount ||
      body.nominal ||
      0
    );


  if (
    !isFinite(amount) ||
    amount <= 0
  ) {

    throw new Error(
      'Nominal pembayaran harus lebih dari 0.'
    );

  }


  const rate =
    Number(
      contract.Harga_Sewa ||
      roomPriceDJFK_(
        tenant.No_Kamar
      )
    );


  const old =
    findPaymentDJFK_(
      tenantId,
      period
    );


  const fine =
    fineDJFK_(
      date,
      due
    );


  const total =
    rate +
    fine;


  const statusVerifikasi =
    (
      old &&
      [
        'diverifikasi',
        'verified',
        'disetujui',
        'approved'
      ].includes(
        normalizeDJFK_(
          old.Status_Verifikasi
        )
      )
    )
      ? cleanDJFK_(
          old.Status_Verifikasi
        )
      : 'MENUNGGU VERIFIKASI';


  const data = {

    Pembayaran_ID:
      old
        ? old.Pembayaran_ID
        : 'PAY-' +
          hashIdDJFK_(
            tenantId +
            '|' +
            period
          ),

    Source_Key:
      old
        ? old.Source_Key
        : 'WEB|PAY|' +
          tenantId +
          '|' +
          period,

    Timestamp_Submit:
      old &&
      old.Timestamp_Submit
        ? old.Timestamp_Submit
        : new Date(),

    Tenant_ID:
      tenantId,

    Kontrak_ID:
      contract.Kontrak_ID,

    No_Kamar:
      tenant.No_Kamar,

    Nama_Tenant:
      tenant.Nama_Lengkap,

    No_HP:
      tenant.No_HP,

    Periode_Pembayaran:
      period,

    Tanggal_Pembayaran:
      date,

    Jatuh_Tempo:
      due,

    Tarif_Kamar:
      rate,

    Nominal_Dibayar:
      amount,

    Denda_Terhitung:
      fine,

    Total_Tagihan:
      total,

    Selisih:
      amount -
      total,

    Status_Pembayaran:
      paymentStatusDJFK_(
        amount,
        total,
        due
      ),

    Status_Verifikasi:
      statusVerifikasi,

    Metode_Pembayaran:
      cleanDJFK_(
        body.method ||
        body.metode ||
        ''
      ),

    Bukti_Pembayaran_URL:
      cleanDJFK_(
        body.proofUrl ||
        body.bukti ||
        ''
      ),

    Keterangan:
      cleanDJFK_(
        body.note ||
        body.keterangan ||
        ''
      ),

    Last_Sync:
      new Date()

  };


  upsertDJFK_(
    getSpreadsheetDJFK_()
      .getSheetByName(
        DJFK.SHEETS.PEMBAYARAN
      ),
    data,
    'Pembayaran_ID'
  );


  return {

    ok: true,

    message:
      'Pembayaran berhasil dicatat.',

    data:
      currentPaymentDJFK_(
        tenantId
      )

  };

}


/* ============================================================
 * MAINTENANCE
 * ============================================================
 */

function openMaintenanceDJFK_(
  tenantId
) {

  const rec =
    readRecordsDJFK_(
      getSpreadsheetDJFK_()
        .getSheetByName(
          DJFK.SHEETS.MAINTENANCE
        )
    );


  const tenantCol =
    findColDJFK_(
      rec.headers,
      ['Tenant_ID']
    );


  const result = [];


  rec.rows.forEach(
    function(row, index) {

      const item =
        rowToObjectDJFK_(
          rec.headers,
          row,
          DJFK.DATA_START_ROW + index
        );


      if (
        cleanDJFK_(
          item.Tenant_ID
        ) !==
        cleanDJFK_(
          tenantId
        )
      ) {

        return;

      }


      if (
        ![
          'open',
          'proses'
        ].includes(
          normalizeDJFK_(
            item.Status
          )
        )
      ) {

        return;

      }


      result.push({

        id:
          item.Maintenance_ID,

        jenis:
          item.Jenis_Masalah,

        lokasi:
          item.Lokasi_Masalah,

        status:
          item.Status,

        urgensi:
          item.Urgensi,

        deskripsi:
          item.Deskripsi,

        tanggal:
          formatDateDJFK_(
            item.Timestamp_Submit
          )

      });

    }
  );


  return result;

}


function maintenanceDJFK_(
  body,
  tenantId
) {

  const tenant =
    findTenantDJFK_(
      tenantId
    );


  if (!tenant) {

    throw new Error(
      'Tenant tidak ditemukan.'
    );

  }


  if (
    !cleanDJFK_(
      body.description ||
      body.deskripsi
    )
  ) {

    throw new Error(
      'Deskripsi maintenance wajib diisi.'
    );

  }


  const requestId =
    cleanDJFK_(
      body.requestId ||
      Utilities.getUuid()
    );


  const sh =
    getSpreadsheetDJFK_()
      .getSheetByName(
        DJFK.SHEETS.MAINTENANCE
      );


  const id =
    'MNT-' +
    hashIdDJFK_(
      requestId
    );


  if (
    findByValueDJFK_(
      sh,
      'Maintenance_ID',
      id
    )
  ) {

    throw new Error(
      'Laporan maintenance ini sudah tercatat.'
    );

  }


  const files =
    Array.isArray(
      body.files
    )
      ? saveUploadsDJFK_(
          body.files
        )
      : [];


  const data = {

    Maintenance_ID:
      id,

    Source_Key:
      'WEB|MNT|' +
      requestId,

    Timestamp_Submit:
      new Date(),

    Tenant_ID:
      tenantId,

    No_Kamar:
      tenant.No_Kamar,

    Nama_Tenant:
      tenant.Nama_Lengkap,

    No_HP:
      tenant.No_HP,

    Lokasi_Masalah:
      cleanDJFK_(
        body.location ||
        ''
      ),

    Jenis_Masalah:
      cleanDJFK_(
        body.type ||
        body.jenis ||
        ''
      ),

    Deskripsi:
      cleanDJFK_(
        body.description ||
        body.deskripsi ||
        ''
      ),

    Urgensi:
      cleanDJFK_(
        body.urgency ||
        body.urgensi ||
        ''
      ),

    Foto_Kerusakan_URL:
      files.join(
        ' | '
      ),

    Izin_Masuk:
      cleanDJFK_(
        body.access ||
        ''
      ),

    Waktu_Nyaman:
      cleanDJFK_(
        body.preferredTime ||
        ''
      ),

    Status:
      'OPEN',

    PIC:
      '',

    Tanggal_Tindak_Lanjut:
      '',

    Foto_Sesudah_URL:
      '',

    Biaya:
      '',

    Catatan_Penyelesaian:
      '',

    Last_Sync:
      new Date()

  };


  upsertDJFK_(
    sh,
    data,
    'Maintenance_ID'
  );


  return {

    ok: true,

    message:
      'Laporan maintenance berhasil dikirim.',

    maintenance_id:
      id

  };

}


/* ============================================================
 * CHECK IN / CHECK OUT
 * ============================================================
 */

function checkinoutDJFK_(
  body,
  tenantId
) {

  const tenant =
    findTenantDJFK_(
      tenantId
    );


  if (!tenant) {

    throw new Error(
      'Tenant tidak ditemukan.'
    );

  }


  const process =
    normalizeDJFK_(
      body.process ||
      body.jenisProses ||
      ''
    );


  const isOut =
    process.indexOf(
      'check_out'
    ) >= 0 ||
    process.indexOf(
      'keluar'
    ) >= 0;


  if (
    !isOut &&
    process.indexOf(
      'check_in'
    ) < 0 &&
    process.indexOf(
      'masuk'
    ) < 0
  ) {

    throw new Error(
      'Jenis proses tidak valid.'
    );

  }


  const requestId =
    cleanDJFK_(
      body.requestId ||
      Utilities.getUuid()
    );


  const sh =
    getSpreadsheetDJFK_()
      .getSheetByName(
        DJFK.SHEETS.CHECKINOUT
      );


  const id =
    'CIO-' +
    hashIdDJFK_(
      requestId
    );


  if (
    findByValueDJFK_(
      sh,
      'CheckInOut_ID',
      id
    )
  ) {

    throw new Error(
      'Data check-in/out ini sudah tercatat.'
    );

  }


  const processDate =
    parseDateDJFK_(
      body.date ||
      body.tanggal ||
      new Date()
    );


  if (!processDate) {

    throw new Error(
      'Tanggal proses tidak valid.'
    );

  }


  const files =
    Array.isArray(
      body.files
    )
      ? saveUploadsDJFK_(
          body.files
        )
      : [];


  const meterFiles =
    Array.isArray(
      body.meterFiles
    )
      ? saveUploadsDJFK_(
          body.meterFiles
        )
      : [];


  const data = {

    CheckInOut_ID:
      id,

    Source_Key:
      'WEB|CIO|' +
      requestId,

    Timestamp_Submit:
      new Date(),

    Tenant_ID:
      tenantId,

    Jenis_Proses:
      isOut
        ? 'CHECK-OUT'
        : 'CHECK-IN',

    No_Kamar:
      tenant.No_Kamar,

    Nama_Tenant:
      tenant.Nama_Lengkap,

    No_HP:
      tenant.No_HP,

    Tanggal_Proses:
      processDate,

    Kondisi_Kamar:
      cleanDJFK_(
        body.roomCondition ||
        body.kondisiKamar ||
        ''
      ),

    Catatan_Kondisi:
      cleanDJFK_(
        body.note ||
        body.catatan ||
        ''
      ),

    Foto_Kondisi_URL:
      files.join(
        ' | '
      ),

    Foto_Meter_Listrik_URL:
      meterFiles.join(
        ' | '
      ),

    Kondisi_Fasilitas:
      cleanDJFK_(
        body.facility ||
        ''
      ),

    Jumlah_Kunci_Akses:
      Number(
        body.keys ||
        body.jumlahKunci ||
        0
      ),

    Kunci_Dikembalikan:
      cleanDJFK_(
        body.keysReturned ||
        ''
      ),

    Ada_Kerusakan_Kehilangan:
      cleanDJFK_(
        body.damage ||
        ''
      ),

    Detail_Kerusakan_Kehilangan:
      cleanDJFK_(
        body.damageDetail ||
        ''
      ),

    Perkiraan_Pengurangan_Deposit:
      Number(
        body.depositReduction ||
        0
      ),

    Pernyataan:
      cleanDJFK_(
        body.statement ||
        ''
      ),

    Last_Sync:
      new Date()

  };


  upsertDJFK_(
    sh,
    data,
    'CheckInOut_ID'
  );


  if (isOut) {

    finalizeCheckoutDJFK_(
      tenantId
    );

  } else {

    updateRoomDJFK_(
      tenant.No_Kamar,
      'TERISI',
      tenantId,
      tenant.Nama_Lengkap
    );

  }


  return {

    ok: true,

    message:
      'Check-in/out berhasil dicatat.',

    checkinout_id:
      id

  };

}


function finalizeCheckoutDJFK_(
  tenantId
) {

  const ss =
    getSpreadsheetDJFK_();


  const tenant =
    findTenantDJFK_(
      tenantId
    );


  const contract =
    findActiveContractDJFK_(
      tenantId
    );


  if (tenant) {

    const sh =
      ss.getSheetByName(
        DJFK.SHEETS.TENANT
      );


    const headers =
      getHeadersDJFK_(
        sh
      );


    const col =
      findColDJFK_(
        headers,
        ['Status_Tenant']
      );


    if (
      col >= 0
    ) {

      sh
        .getRange(
          tenant._row,
          col + 1
        )
        .setValue(
          'NONAKTIF'
        );

    }

  }


  if (contract) {

    const sh =
      ss.getSheetByName(
        DJFK.SHEETS.KONTRAK
      );


    const headers =
      getHeadersDJFK_(
        sh
      );


    const col =
      findColDJFK_(
        headers,
        ['Status_Kontrak']
      );


    if (
      col >= 0
    ) {

      sh
        .getRange(
          contract._row,
          col + 1
        )
        .setValue(
          'SELESAI'
        );

    }


    updateRoomDJFK_(
      contract.No_Kamar,
      'KOSONG',
      '',
      ''
    );

  }

}


/* ============================================================
 * PENDAFTARAN
 * ============================================================
 */

function registrationDJFK_(
  body
) {

  const name =
    cleanDJFK_(
      body.name ||
      body.nama ||
      ''
    );


  const phone =
    cleanDJFK_(
      body.phone ||
      body.whatsapp ||
      ''
    );


  const room =
    cleanDJFK_(
      body.room ||
      body.noKamar ||
      ''
    );


  if (
    !name ||
    !phone ||
    !room
  ) {

    throw new Error(
      'Nama, WhatsApp, dan kamar wajib diisi.'
    );

  }


  if (
    !DJFK.ROOMS.includes(
      Number(room)
    )
  ) {

    throw new Error(
      'Nomor kamar tidak valid.'
    );

  }


  if (
    roomPriceDJFK_(
      room
    ) <= 0
  ) {

    throw new Error(
      'Kamar ' +
      room +
      ' belum dibuka untuk pendaftaran.'
    );

  }


  if (
    DJ39RoomUnavailableDJFK_(
      room
    )
  ) {

    throw new Error(
      'Kamar ' +
      room +
      ' sedang terisi.'
    );

  }


  const startDate =
    cleanDJFK_(
      body.startDate ||
      ''
    );


  if (
    startDate &&
    !parseDateDJFK_(
      startDate
    )
  ) {

    throw new Error(
      'Tanggal mulai sewa tidak valid.'
    );

  }


  const requestId =
    cleanDJFK_(
      body.requestId ||
      Utilities.getUuid()
    );


  const id =
    'REG-' +
    hashIdDJFK_(
      requestId
    );


  const sh =
    getSpreadsheetDJFK_()
      .getSheetByName(
        DJFK.SHEETS.PENDAFTARAN
      );


  if (
    findByValueDJFK_(
      sh,
      'Pendaftaran_ID',
      id
    )
  ) {

    throw new Error(
      'Pendaftaran sudah tercatat.'
    );

  }


  const data = {

    Pendaftaran_ID:
      id,

    Timestamp:
      new Date(),

    Nama_Lengkap:
      name,

    Nama_Panggilan:
      cleanDJFK_(
        body.nickname ||
        ''
      ),

    No_HP:
      phone,

    Email:
      cleanDJFK_(
        body.email ||
        ''
      ),

    NIK_KTP:
      cleanDJFK_(
        body.nik ||
        ''
      ),

    Pekerjaan:
      cleanDJFK_(
        body.job ||
        ''
      ),

    Perusahaan_Instansi:
      cleanDJFK_(
        body.company ||
        ''
      ),

    Jenis_Kelamin:
      cleanDJFK_(
        body.gender ||
        ''
      ),

    Alamat:
      cleanDJFK_(
        body.address ||
        ''
      ),

    No_Kamar:
      room,

    Tanggal_Mulai_Tinggal:
      startDate
        ? parseDateDJFK_(
            startDate
          )
        : '',

    Catatan:
      cleanDJFK_(
        body.note ||
        ''
      ),

    Status_Pendaftaran:
      'MENUNGGU VERIFIKASI',

    Tenant_ID:
      '',

    Kontrak_ID:
      '',

    Last_Update:
      new Date()

  };


  upsertDJFK_(
    sh,
    data,
    'Pendaftaran_ID'
  );


  return {

    ok: true,

    message:
      'Pendaftaran berhasil dikirim. Menunggu verifikasi pengelola.',

    pendaftaran_id:
      id

  };

}


/* ============================================================
 * KUNJUNGAN
 * ============================================================
 */

function visitDJFK_(
  body
) {

  const name =
    cleanDJFK_(
      body.name ||
      body.nama ||
      ''
    );


  const room =
    cleanDJFK_(
      body.room ||
      body.noKamar ||
      ''
    );


  if (!name) {

    throw new Error(
      'Nama wajib diisi.'
    );

  }


  if (
    !DJFK.ROOMS.includes(
      Number(room)
    )
  ) {

    throw new Error(
      'Nomor kamar tidak valid.'
    );

  }


  if (
    !parseDateDJFK_(
      body.date ||
      ''
    )
  ) {

    throw new Error(
      'Tanggal kunjungan wajib diisi.'
    );

  }


  if (
    !cleanDJFK_(
      body.time ||
      ''
    )
  ) {

    throw new Error(
      'Waktu kunjungan wajib diisi.'
    );

  }


  const requestId =
    cleanDJFK_(
      body.requestId ||
      Utilities.getUuid()
    );


  const id =
    'VIS-' +
    hashIdDJFK_(
      requestId
    );


  const sh =
    getSpreadsheetDJFK_()
      .getSheetByName(
        DJFK.SHEETS.KUNJUNGAN
      );


  if (
    findByValueDJFK_(
      sh,
      'Kunjungan_ID',
      id
    )
  ) {

    throw new Error(
      'Pengajuan kunjungan sudah tercatat.'
    );

  }


  const data = {

    Kunjungan_ID:
      id,

    Timestamp:
      new Date(),

    Nama_Lengkap:
      name,

    No_HP:
      cleanDJFK_(
        body.phone ||
        ''
      ),

    Email:
      cleanDJFK_(
        body.email ||
        ''
      ),

    No_Kamar:
      room,

    Tanggal_Kunjungan:
      parseDateDJFK_(
        body.date
      ),

    Waktu_Kunjungan:
      cleanDJFK_(
        body.time
      ),

    Catatan:
      cleanDJFK_(
        body.note ||
        ''
      ),

    Status_Kunjungan:
      'MENUNGGU KONFIRMASI',

    Last_Update:
      new Date()

  };


  upsertDJFK_(
    sh,
    data,
    'Kunjungan_ID'
  );


  return {

    ok: true,

    message:
      'Pengajuan kunjungan berhasil dikirim.',

    kunjungan_id:
      id

  };

}


/* ============================================================
 * FORM RESPONSE SYNC
 * ============================================================
 */

function syncFormRowDJFK_(
  ss,
  source,
  row,
  type
) {

  const raw =
    readFormDJFK_(
      source,
      row
    );


  if (
    type ===
    'TENANT'
  ) {

    return syncTenantFormDJFK_(
      ss,
      source,
      row,
      raw
    );

  }


  if (
    type ===
    'MAINTENANCE'
  ) {

    return syncMaintenanceFormDJFK_(
      ss,
      source,
      row,
      raw
    );

  }


  if (
    type ===
    'CHECKINOUT'
  ) {

    return syncCheckinoutFormDJFK_(
      ss,
      source,
      row,
      raw
    );

  }


  if (
    type ===
    'PEMBAYARAN'
  ) {

    return syncPaymentFormDJFK_(
      ss,
      source,
      row,
      raw
    );

  }


  throw new Error(
    'Tipe form tidak dikenal: ' +
    type
  );

}


function readFormDJFK_(
  source,
  row
) {

  const headers =
    source
      .getRange(
        DJFK.FORM_HEADER_ROW,
        1,
        1,
        source.getLastColumn()
      )
      .getValues()[0]
      .map(
        cleanDJFK_
      );


  const values =
    source
      .getRange(
        row,
        1,
        1,
        source.getLastColumn()
      )
      .getValues()[0];


  const object = {};


  headers.forEach(
    function(header,index) {

      if (header) {

        object[
          normalizeDJFK_(
            header
          )
        ] =
          values[index];

      }

    }
  );


  return object;

}


function formValueDJFK_(
  raw,
  aliases
) {

  for (
    let i = 0;
    i < aliases.length;
    i++
  ) {

    const key =
      normalizeDJFK_(
        aliases[i]
      );


    if (
      Object.prototype
        .hasOwnProperty
        .call(
          raw,
          key
        )
    ) {

      return raw[key];

    }

  }


  return '';

}


/* ============================================================
 * SYNC TENANT
 * ============================================================
 */

function syncTenantFormDJFK_(
  ss,
  source,
  row,
  raw
) {

  const sourceKey =
    source.getName() +
    '#' +
    row;


  const room =
    cleanDJFK_(
      formValueDJFK_(
        raw,
        [
          'Nomor Kamar',
          'No Kamar',
          'No_Kamar'
        ]
      )
    );


  if (!room) {

    throw new Error(
      'Nomor kamar kosong pada form tenant.'
    );

  }


  if (
    !DJFK.ROOMS.includes(
      Number(room)
    )
  ) {

    throw new Error(
      'Nomor kamar tidak valid.'
    );

  }


  const existing =
    findActiveTenantByRoomDJFK_(
      room
    );


  if (
    existing &&
    existing.Source_Key !==
    sourceKey
  ) {

    throw new Error(
      'Kamar ' +
      room +
      ' sudah terisi tenant lain.'
    );

  }


  const tenantId =
    existing
      ? existing.Tenant_ID
      : 'TEN-' +
        hashIdDJFK_(
          sourceKey
        );


  const data = {

    Tenant_ID:
      tenantId,

    Source_Key:
      sourceKey,

    Tanggal_Submit:
      formValueDJFK_(
        raw,
        ['Timestamp']
      ),

    Nama_Lengkap:
      formValueDJFK_(
        raw,
        [
          'Nama Lengkap',
          'Nama_Lengkap',
          'Nama Tenant'
        ]
      ),

    Nama_Panggilan:
      formValueDJFK_(
        raw,
        ['Nama Panggilan']
      ),

    No_HP:
      formValueDJFK_(
        raw,
        [
          'Nomor HP',
          'No HP',
          'Nomor WhatsApp',
          'No WhatsApp'
        ]
      ),

    Email:
      formValueDJFK_(
        raw,
        [
          'Email',
          'Alamat Email'
        ]
      ),

    NIK_KTP:
      formValueDJFK_(
        raw,
        [
          'NIK KTP',
          'Nomor Identitas',
          'NIK'
        ]
      ),

    Pekerjaan:
      formValueDJFK_(
        raw,
        ['Pekerjaan']
      ),

    Perusahaan_Instansi:
      formValueDJFK_(
        raw,
        [
          'Nama Perusahaan / Instansi',
          'Perusahaan / Instansi',
          'Nama Perusahaan'
        ]
      ),

    Jenis_Kelamin:
      formValueDJFK_(
        raw,
        ['Jenis Kelamin']
      ),

    Status_Pernikahan:
      formValueDJFK_(
        raw,
        ['Status Pernikahan']
      ),

    Kontak_Darurat:
      formValueDJFK_(
        raw,
        ['Nama Kontak Darurat']
      ),

    Hubungan_Kontak_Darurat:
      formValueDJFK_(
        raw,
        [
          'Hubungan dengan Tenant',
          'Hubungan'
        ]
      ),

    No_HP_Kontak_Darurat:
      formValueDJFK_(
        raw,
        [
          'Nomor HP Kontak Darurat',
          'No HP Kontak Darurat'
        ]
      ),

    No_Kamar:
      room,

    Tanggal_Mulai_Tinggal:
      formValueDJFK_(
        raw,
        [
          'Tanggal Mulai Tinggal',
          'Tanggal Mulai',
          'Tanggal Masuk'
        ]
      ),

    Rencana_Lama_Tinggal:
      formValueDJFK_(
        raw,
        ['Rencana Lama Tinggal']
      ),

    KTP_File_URL:
      formValueDJFK_(
        raw,
        [
          'Upload Foto KTP',
          'Upload KTP',
          'Foto KTP'
        ]
      ),

    Surat_Pernyataan_File_URL:
      formValueDJFK_(
        raw,
        [
          'Upload Foto Surat Pernyataan',
          'Surat Pernyataan'
        ]
      ),

    Kendaraan:
      formValueDJFK_(
        raw,
        [
          'Apakah membawa kendaraan?',
          'Kendaraan'
        ]
      ),

    No_Plat:
      formValueDJFK_(
        raw,
        [
          'Nomor Plat Kendaraan',
          'No Plat'
        ]
      ),

    Status_Tenant:
      'AKTIF',

    Catatan:
      '',

    Last_Sync:
      new Date()

  };


  upsertDJFK_(
    ss.getSheetByName(
      DJFK.SHEETS.TENANT
    ),
    data,
    'Tenant_ID'
  );


  createContractForTenantDJFK_(
    tenantId,
    sourceKey
  );


  updateRoomDJFK_(
    room,
    'TERISI',
    tenantId,
    data.Nama_Lengkap
  );


  return tenantId;

}


/* ============================================================
 * CREATE CONTRACT
 * ============================================================
 */

function createContractForTenantDJFK_(
  tenantId,
  sourceKey
) {

  const ss =
    getSpreadsheetDJFK_();


  const tenant =
    findTenantDJFK_(
      tenantId
    );


  if (!tenant) {
    return null;
  }


  const sh =
    ss.getSheetByName(
      DJFK.SHEETS.KONTRAK
    );


  const existing =
    findActiveContractDJFK_(
      tenantId
    );


  if (existing) {

    return existing.Kontrak_ID;

  }


  const data = {

    Kontrak_ID:
      'KTR-' +
      hashIdDJFK_(
        sourceKey
      ),

    Source_Key:
      sourceKey,

    Tenant_ID:
      tenantId,

    No_Kamar:
      tenant.No_Kamar,

    Nama_Tenant:
      tenant.Nama_Lengkap,

    Tanggal_Mulai:
      tenant.Tanggal_Mulai_Tinggal,

    Tanggal_Berakhir:
      '',

    Harga_Sewa:
      roomPriceDJFK_(
        tenant.No_Kamar
      ),

    Deposit:
      DJFK.DEPOSIT,

    Status_Kontrak:
      'AKTIF',

    Catatan:
      '',

    Last_Sync:
      new Date()

  };


  upsertDJFK_(
    sh,
    data,
    'Kontrak_ID'
  );


  return data.Kontrak_ID;

}


/* ============================================================
 * SYNC MAINTENANCE FORM
 * ============================================================
 */

function syncMaintenanceFormDJFK_(
  ss,
  source,
  row,
  raw
) {

  const sourceKey =
    source.getName() +
    '#' +
    row;


  const room =
    cleanDJFK_(
      formValueDJFK_(
        raw,
        [
          'Nomor Kamar',
          'No Kamar',
          'No_Kamar'
        ]
      )
    );


  const tenant =
    findActiveTenantByRoomDJFK_(
      room
    );


  const data = {

    Maintenance_ID:
      'MNT-' +
      hashIdDJFK_(
        sourceKey
      ),

    Source_Key:
      sourceKey,

    Timestamp_Submit:
      formValueDJFK_(
        raw,
        ['Timestamp']
      ) ||
      new Date(),

    Tenant_ID:
      tenant
        ? tenant.Tenant_ID
        : '',

    No_Kamar:
      room,

    Nama_Tenant:
      tenant
        ? tenant.Nama_Lengkap
        : formValueDJFK_(
            raw,
            [
              'Nama Tenant',
              'Nama Lengkap'
            ]
          ),

    No_HP:
      tenant
        ? tenant.No_HP
        : formValueDJFK_(
            raw,
            [
              'Nomor WhatsApp',
              'No WhatsApp',
              'No HP'
            ]
          ),

    Lokasi_Masalah:
      formValueDJFK_(
        raw,
        ['Lokasi Masalah']
      ),

    Jenis_Masalah:
      formValueDJFK_(
        raw,
        ['Jenis Masalah']
      ),

    Deskripsi:
      formValueDJFK_(
        raw,
        [
          'Jelaskan Masalah',
          'Deskripsi Masalah',
          'Keterangan Masalah'
        ]
      ),

    Urgensi:
      formValueDJFK_(
        raw,
        [
          'Seberapa Mendesak Masalah Ini?',
          'Tingkat Urgensi',
          'Urgensi'
        ]
      ),

    Foto_Kerusakan_URL:
      formValueDJFK_(
        raw,
        [
          'Upload Foto Kerusakan',
          'Foto Kerusakan'
        ]
      ),

    Izin_Masuk:
      formValueDJFK_(
        raw,
        [
          'Izin Masuk Kamar',
          'Izin Masuk'
        ]
      ),

    Waktu_Nyaman:
      formValueDJFK_(
        raw,
        [
          'Waktu yang nyaman untuk pemeriksaan/perbaikan',
          'Waktu Pemeriksaan',
          'Waktu Nyaman'
        ]
      ),

    Status:
      'OPEN',

    PIC:
      '',

    Tanggal_Tindak_Lanjut:
      '',

    Foto_Sesudah_URL:
      '',

    Biaya:
      '',

    Catatan_Penyelesaian:
      '',

    Last_Sync:
      new Date()

  };


  upsertDJFK_(
    ss.getSheetByName(
      DJFK.SHEETS.MAINTENANCE
    ),
    data,
    'Maintenance_ID'
  );


  return data.Maintenance_ID;

}


/* ============================================================
 * SYNC CHECKINOUT FORM
 * ============================================================
 */

function syncCheckinoutFormDJFK_(
  ss,
  source,
  row,
  raw
) {

  const sourceKey =
    source.getName() +
    '#' +
    row;


  const process =
    cleanDJFK_(
      formValueDJFK_(
        raw,
        ['Jenis Proses']
      )
    );


  const normalized =
    normalizeDJFK_(
      process
    );


  const isOut =
    normalized.indexOf(
      'check_out'
    ) >= 0 ||
    normalized.indexOf(
      'keluar'
    ) >= 0;


  const room =
    cleanDJFK_(
      formValueDJFK_(
        raw,
        [
          'Nomor Kamar',
          'No Kamar',
          'No_Kamar'
        ]
      )
    );


  const tenant =
    findActiveTenantByRoomDJFK_(
      room
    );


  const data = {

    CheckInOut_ID:
      'CIO-' +
      hashIdDJFK_(
        sourceKey
      ),

    Source_Key:
      sourceKey,

    Timestamp_Submit:
      formValueDJFK_(
        raw,
        ['Timestamp']
      ) ||
      new Date(),

    Tenant_ID:
      tenant
        ? tenant.Tenant_ID
        : '',

    Jenis_Proses:
      isOut
        ? 'CHECK-OUT'
        : 'CHECK-IN',

    No_Kamar:
      room,

    Nama_Tenant:
      tenant
        ? tenant.Nama_Lengkap
        : formValueDJFK_(
            raw,
            [
              'Nama Tenant',
              'Nama Lengkap'
            ]
          ),

    No_HP:
      tenant
        ? tenant.No_HP
        : formValueDJFK_(
            raw,
            [
              'Nomor WhatsApp',
              'No WhatsApp',
              'No HP'
            ]
          ),

    Tanggal_Proses:
      formValueDJFK_(
        raw,
        [
          isOut
            ? 'Tanggal Check-Out'
            : 'Tanggal Check-In',

          'Tanggal Proses'
        ]
      ),

    Kondisi_Kamar:
      formValueDJFK_(
        raw,
        [
          'Kondisi Kamar Saat Masuk',
          'Kondisi Kamar Saat Keluar',
          'Kondisi Kamar'
        ]
      ),

    Catatan_Kondisi:
      formValueDJFK_(
        raw,
        [
          'Catatan Kondisi Kamar',
          'Catatan Kondisi Saat Check-Out',
          'Catatan Kondisi'
        ]
      ),

    Foto_Kondisi_URL:
      formValueDJFK_(
        raw,
        [
          'Foto Kondisi Kamar Saat Check-In',
          'Foto Kondisi Kamar Saat Check-Out',
          'Foto Kondisi Kamar',
          'Foto Kondisi'
        ]
      ),

    Foto_Meter_Listrik_URL:
      formValueDJFK_(
        raw,
        [
          'Foto Meter Listrik Saat Check-In',
          'Foto Meter Listrik Saat Check-Out',
          'Foto Meter Listrik'
        ]
      ),

    Kondisi_Fasilitas:
      formValueDJFK_(
        raw,
        [
          'Kondisi Fasilitas'
        ]
      ),

    Jumlah_Kunci_Akses:
      formValueDJFK_(
        raw,
        [
          'Jumlah Kunci / Access',
          'Jumlah Kunci',
          'Jumlah Kunci Access'
        ]
      ),

    Kunci_Dikembalikan:
      formValueDJFK_(
        raw,
        [
          'Kunci / Access Dikembalikan?',
          'Kunci Dikembalikan'
        ]
      ),

    Ada_Kerusakan_Kehilangan:
      formValueDJFK_(
        raw,
        [
          'Ada Kerusakan atau Kehilangan?',
          'Ada Kerusakan atau Kehilangan'
        ]
      ),

    Detail_Kerusakan_Kehilangan:
      formValueDJFK_(
        raw,
        [
          'Jelaskan Kerusakan / Kehilangan',
          'Detail Kerusakan / Kehilangan'
        ]
      ),

    Perkiraan_Pengurangan_Deposit:
      formValueDJFK_(
        raw,
        [
          'Perkiraan Pengurangan Deposit'
        ]
      ),

    Pernyataan:
      formValueDJFK_(
        raw,
        [
          'Pernyataan Tenant'
        ]
      ),

    Last_Sync:
      new Date()

  };


  upsertDJFK_(
    ss.getSheetByName(
      DJFK.SHEETS.CHECKINOUT
    ),
    data,
    'CheckInOut_ID'
  );


  if (
    isOut &&
    tenant
  ) {

    finalizeCheckoutDJFK_(
      tenant.Tenant_ID
    );

  } else if (tenant) {

    updateRoomDJFK_(
      room,
      'TERISI',
      tenant.Tenant_ID,
      tenant.Nama_Lengkap
    );

  }


  return data.CheckInOut_ID;

}


/* ============================================================
 * SYNC PAYMENT FORM
 * ============================================================
 */

function syncPaymentFormDJFK_(
  ss,
  source,
  row,
  raw
) {

  const sourceKey =
    source.getName() +
    '#' +
    row;


  const room =
    cleanDJFK_(
      formValueDJFK_(
        raw,
        [
          'Nomor Kamar',
          'No Kamar',
          'No_Kamar'
        ]
      )
    );


  const tenant =
    findActiveTenantByRoomDJFK_(
      room
    );


  const tenantId =
    tenant
      ? tenant.Tenant_ID
      : cleanDJFK_(
          formValueDJFK_(
            raw,
            [
              'Tenant ID',
              'Tenant_ID'
            ]
          )
        );


  if (!tenantId) {

    throw new Error(
      'Tenant tidak ditemukan untuk pembayaran ' +
      sourceKey
    );

  }


  const period =
    String(
      formValueDJFK_(
        raw,
        [
          'Periode Pembayaran',
          'Periode'
        ]
      ) ||
      currentPeriodDJFK_()
    )
    .slice(0,7);


  const date =
    parseDateDJFK_(
      formValueDJFK_(
        raw,
        [
          'Tanggal Pembayaran',
          'Tanggal Bayar'
        ]
      ) ||
      new Date()
    );


  const contract =
    findActiveContractDJFK_(
      tenantId
    );


  const rate =
    contract
      ? Number(
          contract.Harga_Sewa ||
          0
        )
      : roomPriceDJFK_(
          room
        );


  const due =
    dueDateFromPeriodDJFK_(
      period
    );


  const paid =
    Number(
      formValueDJFK_(
        raw,
        [
          'Nominal Dibayar',
          'Nominal Pembayaran',
          'Nominal Pembayaran (Rp)'
        ]
      ) ||
      0
    );


  const fine =
    fineDJFK_(
      date,
      due
    );


  const total =
    rate +
    fine;


  const old =
    findPaymentDJFK_(
      tenantId,
      period
    );


  const verified =
    old &&
    [
      'diverifikasi',
      'verified',
      'disetujui',
      'approved'
    ].includes(
      normalizeDJFK_(
        old.Status_Verifikasi
      )
    );


  const data = {

    Pembayaran_ID:
      old
        ? old.Pembayaran_ID
        : 'PAY-' +
          hashIdDJFK_(
            tenantId +
            '|' +
            period
          ),

    Source_Key:
      old
        ? old.Source_Key
        : sourceKey,

    Timestamp_Submit:
      old &&
      old.Timestamp_Submit
        ? old.Timestamp_Submit
        : formValueDJFK_(
            raw,
            ['Timestamp']
          ) ||
          new Date(),

    Tenant_ID:
      tenantId,

    Kontrak_ID:
      contract
        ? contract.Kontrak_ID
        : '',

    No_Kamar:
      room,

    Nama_Tenant:
      tenant
        ? tenant.Nama_Lengkap
        : formValueDJFK_(
            raw,
            [
              'Nama Tenant',
              'Nama Lengkap'
            ]
          ),

    No_HP:
      tenant
        ? tenant.No_HP
        : formValueDJFK_(
            raw,
            [
              'Nomor WhatsApp',
              'No WhatsApp',
              'No HP'
            ]
          ),

    Periode_Pembayaran:
      period,

    Tanggal_Pembayaran:
      date,

    Jatuh_Tempo:
      due,

    Tarif_Kamar:
      rate,

    Nominal_Dibayar:
      paid,

    Denda_Terhitung:
      fine,

    Total_Tagihan:
      total,

    Selisih:
      paid -
      total,

    Status_Pembayaran:
      paymentStatusDJFK_(
        paid,
        total,
        due
      ),

    Status_Verifikasi:
      verified
        ? cleanDJFK_(
            old.Status_Verifikasi
          )
        : 'MENUNGGU VERIFIKASI',

    Metode_Pembayaran:
      formValueDJFK_(
        raw,
        [
          'Metode Pembayaran'
        ]
      ),

    Bukti_Pembayaran_URL:
      formValueDJFK_(
        raw,
        [
          'Upload Bukti Pembayaran',
          'Bukti Pembayaran'
        ]
      ),

    Keterangan:
      formValueDJFK_(
        raw,
        [
          'Keterangan Tambahan',
          'Keterangan'
        ]
      ),

    Last_Sync:
      new Date()

  };


  upsertDJFK_(
    ss.getSheetByName(
      DJFK.SHEETS.PEMBAYARAN
    ),
    data,
    'Pembayaran_ID'
  );


  return data.Pembayaran_ID;

}


/* ============================================================
 * FORM SUBMIT TRIGGER
 * ============================================================
 */

function onFormSubmitDJV2(
  e
) {

  if (
    !e ||
    !e.range
  ) {

    throw new Error(
      'Event Form Submit tidak valid.'
    );

  }


  const lock =
    LockService
      .getDocumentLock();


  lock.waitLock(
    30000
  );


  try {

    const source =
      e.range.getSheet();


    const ss =
      source.getParent();


    const type =
      DJFK.FORM_MAP[
        source.getName()
      ];


    if (!type) {

      return;

    }


    syncFormRowDJFK_(
      ss,
      source,
      e.range.getRow(),
      type
    );


    runRoomOccupancyDJFK_(
      ss
    );


    refreshDashboardDJFK();


    logDJFK_(
      ss,
      'FORM_SUBMIT',
      type +
      ' diproses dari ' +
      source.getName() +
      ' row ' +
      e.range.getRow()
    );

  } catch (error) {

    logDJFK_(
      e.range
        .getSheet()
        .getParent(),
      'ERROR_FORM_SUBMIT',
      error.message
    );


    throw error;

  } finally {

    lock.releaseLock();

  }

}


/* ============================================================
 * SYNC FORM LAMA
 * ============================================================
 */

function syncExistingFormsDJV2() {

  const ss =
    getSpreadsheetDJFK_();


  Object
    .keys(
      DJFK.FORM_MAP
    )
    .forEach(
      function(name) {

        const sh =
          ss.getSheetByName(
            name
          );


        if (!sh) {
          return;
        }


        const type =
          DJFK.FORM_MAP[
            name
          ];


        for (
          let row = 2;
          row <= sh.getLastRow();
          row++
        ) {

          try {

            syncFormRowDJFK_(
              ss,
              sh,
              row,
              type
            );

          } catch (error) {

            logDJFK_(
              ss,
              'ERROR_SYNC',
              name +
              ' row ' +
              row +
              ': ' +
              error.message
            );

          }

        }

      }
    );


  runRoomOccupancyDJFK_(
    ss
  );


  refreshDashboardDJFK();


  SpreadsheetApp
    .getUi()
    .alert(
      'Sinkronisasi form lama selesai.'
    );

}


/* ============================================================
 * ROOM OCCUPANCY
 * ============================================================
 */

function runRoomOccupancyDJFK_(
  ss
) {

  const kamar =
    ss.getSheetByName(
      DJFK.SHEETS.KAMAR
    );


  const tenant =
    ss.getSheetByName(
      DJFK.SHEETS.TENANT
    );


  const roomRecords =
    readRecordsDJFK_(
      kamar
    );


  const tenantRecords =
    readRecordsDJFK_(
      tenant
    );


  const tenantRoomCol =
    findColDJFK_(
      tenantRecords.headers,
      ['No_Kamar']
    );


  const tenantStatusCol =
    findColDJFK_(
      tenantRecords.headers,
      ['Status_Tenant']
    );


  const tenantIdCol =
    findColDJFK_(
      tenantRecords.headers,
      ['Tenant_ID']
    );


  const tenantNameCol =
    findColDJFK_(
      tenantRecords.headers,
      ['Nama_Lengkap']
    );


  const activeMap = {};


  tenantRecords.rows
    .forEach(
      function(row) {

        if (
          ![
            'aktif',
            'active'
          ].includes(
            normalizeDJFK_(
              row[
                tenantStatusCol
              ]
            )
          )
        ) {

          return;

        }


        const room =
          cleanDJFK_(
            row[
              tenantRoomCol
            ]
          );


        if (!room) {
          return;
        }


        activeMap[room] = {

          id:
            cleanDJFK_(
              row[
                tenantIdCol
              ]
            ),

          name:
            cleanDJFK_(
              row[
                tenantNameCol
              ]
            )

        };

      }
    );


  const headers =
    getHeadersDJFK_(
      kamar
    );


  const roomCol =
    findColDJFK_(
      headers,
      ['No_Kamar']
    );


  roomRecords.rows
    .forEach(
      function(row,index) {

        const room =
          cleanDJFK_(
            row[
              roomCol
            ]
          );


        if (
          !DJFK.ROOMS.includes(
            Number(room)
          )
        ) {

          return;

        }


        const active =
          activeMap[
            room
          ];


        const spreadsheetRow =
          DJFK.DATA_START_ROW +
          index;


        const set =
          function(
            aliases,
            value
          ) {

            const col =
              findColDJFK_(
                headers,
                aliases
              );


            if (
              col >= 0
            ) {

              kamar
                .getRange(
                  spreadsheetRow,
                  col + 1
                )
                .setValue(
                  value
                );

            }

          };


        set(
          ['Room_ID'],
          'ROOM-' + room
        );


        set(
          ['Lantai'],
          Math.floor(
            Number(room) / 100
          )
        );


        set(
          ['Status'],
          active
            ? 'TERISI'
            : 'KOSONG'
        );


        set(
          ['Tenant_ID'],
          active
            ? active.id
            : ''
        );


        set(
          ['Nama_Tenant'],
          active
            ? active.name
            : ''
        );

      }
    );

}


/* ============================================================
 * RECALCULATE PAYMENT
 * ============================================================
 */

function recalculatePaymentsDJFK_() {

  const ss =
    getSpreadsheetDJFK_();


  const sh =
    ss.getSheetByName(
      DJFK.SHEETS.PEMBAYARAN
    );


  const rec =
    readRecordsDJFK_(
      sh
    );


  const periodCol =
    findColDJFK_(
      rec.headers,
      ['Periode_Pembayaran']
    );


  const paidCol =
    findColDJFK_(
      rec.headers,
      ['Nominal_Dibayar']
    );


  const dueCol =
    findColDJFK_(
      rec.headers,
      ['Jatuh_Tempo']
    );


  const payDateCol =
    findColDJFK_(
      rec.headers,
      ['Tanggal_Pembayaran']
    );


  const fineCol =
    findColDJFK_(
      rec.headers,
      ['Denda_Terhitung']
    );


  const totalCol =
    findColDJFK_(
      rec.headers,
      ['Total_Tagihan']
    );


  const diffCol =
    findColDJFK_(
      rec.headers,
      ['Selisih']
    );


  const statusCol =
    findColDJFK_(
      rec.headers,
      ['Status_Pembayaran']
    );


  const tenantCol =
    findColDJFK_(
      rec.headers,
      ['Tenant_ID']
    );


  rec.rows
    .forEach(
      function(row,index) {

        const period =
          String(
            row[
              periodCol
            ] ||
            ''
          )
          .slice(
            0,
            7
          );


        if (!period) {
          return;
        }


        const due =
          parseDateDJFK_(
            row[
              dueCol
            ]
          ) ||
          dueDateFromPeriodDJFK_(
            period
          );


        const paymentDate =
          parseDateDJFK_(
            row[
              payDateCol
            ]
          );


        const tenantId =
          cleanDJFK_(
            row[
              tenantCol
            ]
          );


        const contract =
          tenantId
            ? findActiveContractDJFK_(
                tenantId
              )
            : null;


        const rate =
          Number(
            row[
              findColDJFK_(
                rec.headers,
                ['Tarif_Kamar']
              )
            ] ||
            (
              contract &&
              contract.Harga_Sewa
            ) ||
            0
          );


        const fine =
          paymentDate

            ? fineDJFK_(
                paymentDate,
                due
              )

            : daysAfterDueDJFK_(
                new Date(),
                due
              ) > 1

              ? daysAfterDueDJFK_(
                  new Date(),
                  due
                ) <= 3
                  ? DJFK.FINE_DAY_3
                  : DJFK.FINE_DAY_5

              : 0;


        const paidValue =
          Number(
            row[
              paidCol
            ] ||
            0
          );


        const totalValue =
          rate +
          fine;


        const spreadsheetRow =
          DJFK.DATA_START_ROW +
          index;


        sh
          .getRange(
            spreadsheetRow,
            fineCol + 1
          )
          .setValue(
            fine
          );


        sh
          .getRange(
            spreadsheetRow,
            totalCol + 1
          )
          .setValue(
            totalValue
          );


        sh
          .getRange(
            spreadsheetRow,
            diffCol + 1
          )
          .setValue(
            paidValue -
            totalValue
          );


        sh
          .getRange(
            spreadsheetRow,
            statusCol + 1
          )
          .setValue(
            paymentStatusDJFK_(
              paidValue,
              totalValue,
              due
            )
          );

      }
    );

}


/* ============================================================
 * PELANGGARAN
 * ============================================================
 */

function findFineRuleDJFK_(
  type
) {

  const normalized =
    normalizeDJFK_(
      type
    );


  for (
    let i = 0;
    i <
    DJFK_FINE_RULES.length;
    i++
  ) {

    if (
      DJFK_FINE_RULES[i].keys
        .some(
          function(key) {

            return (
              normalizeDJFK_(
                key
              ) ===
              normalized
            );

          }
        )
    ) {

      return DJFK_FINE_RULES[i];

    }

  }


  return null;

}


function processViolationsDJFK_() {

  const sh =
    getSpreadsheetDJFK_()
      .getSheetByName(
        DJFK.SHEETS.PELANGGARAN
      );


  const rec =
    readRecordsDJFK_(
      sh
    );


  const typeCol =
    findColDJFK_(
      rec.headers,
      ['Jenis_Pelanggaran']
    );


  const categoryCol =
    findColDJFK_(
      rec.headers,
      ['Kategori']
    );


  const fineCol =
    findColDJFK_(
      rec.headers,
      ['Denda']
    );


  const actionCol =
    findColDJFK_(
      rec.headers,
      ['Tindakan']
    );


  rec.rows
    .forEach(
      function(row,index) {

        const rule =
          findFineRuleDJFK_(
            row[
              typeCol
            ]
          );


        if (!rule) {
          return;
        }


        const spreadsheetRow =
          DJFK.DATA_START_ROW +
          index;


        if (
          !cleanDJFK_(
            row[
              categoryCol
            ]
          )
        ) {

          sh
            .getRange(
              spreadsheetRow,
              categoryCol + 1
            )
            .setValue(
              rule.kategori
            );

        }


        if (
          !row[
            fineCol
          ]
        ) {

          sh
            .getRange(
              spreadsheetRow,
              fineCol + 1
            )
            .setValue(
              rule.denda
            );

        }


        if (
          !cleanDJFK_(
            row[
              actionCol
            ]
          )
        ) {

          sh
            .getRange(
              spreadsheetRow,
              actionCol + 1
            )
            .setValue(
              rule.tindakan
            );

        }

      }
    );

}


/* ============================================================
 * REPAIR RELATIONSHIP
 * ============================================================
 */

function repairRelationshipsDJFK_(
  ss
) {

  const payment =
    ss.getSheetByName(
      DJFK.SHEETS.PEMBAYARAN
    );


  if (payment) {

    const rec =
      readRecordsDJFK_(
        payment
      );


    const roomCol =
      findColDJFK_(
        rec.headers,
        ['No_Kamar']
      );


    const tenantCol =
      findColDJFK_(
        rec.headers,
        ['Tenant_ID']
      );


    const contractCol =
      findColDJFK_(
        rec.headers,
        ['Kontrak_ID']
      );


    rec.rows
      .forEach(
        function(row,index) {

          let tenantId =
            cleanDJFK_(
              row[
                tenantCol
              ]
            );


          const tenant =
            tenantId
              ? findTenantDJFK_(
                  tenantId
                )
              : findActiveTenantByRoomDJFK_(
                  row[
                    roomCol
                  ]
                );


          if (!tenant) {
            return;
          }


          const spreadsheetRow =
            DJFK.DATA_START_ROW +
            index;


          if (!tenantId) {

            tenantId =
              tenant.Tenant_ID;


            payment
              .getRange(
                spreadsheetRow,
                tenantCol + 1
              )
              .setValue(
                tenantId
              );

          }


          const contract =
            findActiveContractDJFK_(
              tenantId
            );


          if (
            contract &&
            !cleanDJFK_(
              row[
                contractCol
              ]
            )
          ) {

            payment
              .getRange(
                spreadsheetRow,
                contractCol + 1
              )
              .setValue(
                contract.Kontrak_ID
              );

          }

        }
      );

  }


  [
    DJFK.SHEETS.MAINTENANCE,
    DJFK.SHEETS.CHECKINOUT
  ]
  .forEach(
    function(sheetName) {

      const sh =
        ss.getSheetByName(
          sheetName
        );


      if (!sh) {
        return;
      }


      const rec =
        readRecordsDJFK_(
          sh
        );


      const roomCol =
        findColDJFK_(
          rec.headers,
          ['No_Kamar']
        );


      const tenantCol =
        findColDJFK_(
          rec.headers,
          ['Tenant_ID']
        );


      rec.rows
        .forEach(
          function(row,index) {

            if (
              cleanDJFK_(
                row[
                  tenantCol
                ]
              )
            ) {

              return;

            }


            const tenant =
              findActiveTenantByRoomDJFK_(
                row[
                  roomCol
                ]
              );


            if (!tenant) {
              return;
            }


            sh
              .getRange(
                DJFK.DATA_START_ROW +
                  index,
                tenantCol + 1
              )
              .setValue(
                tenant.Tenant_ID
              );

          }
        );

    }
  );


  runRoomOccupancyDJFK_(
    ss
  );

}


/* ============================================================
 * HOURLY MASTER
 * ============================================================
 */

function runDJFamilyKostHourly() {

  const ss =
    getSpreadsheetDJFK_();


  const lock =
    LockService
      .getScriptLock();


  if (
    !lock.tryLock(
      30000
    )
  ) {

    return;

  }


  try {

    ensureDatabaseDJFK_(
      ss
    );


    validateRoomsDJFK_(
      ss
    );


    repairRelationshipsDJFK_(
      ss
    );


    runRoomOccupancyDJFK_(
      ss
    );


    generateMonthlyPaymentsDJFK_();


    recalculatePaymentsDJFK_();


    processViolationsDJFK_();


    refreshDashboardDJFK();


    logDJFK_(
      ss,
      'HOURLY',
      'Hourly engine selesai.'
    );

  } finally {

    lock.releaseLock();

  }

}


/* ============================================================
 * DASHBOARD
 * ============================================================
 */

function refreshDashboardDJFK() {

  const ss =
    getSpreadsheetDJFK_();


  runRoomOccupancyDJFK_(
    ss
  );


  try {

    if (
      typeof refreshDashboardDJ_V5 ===
      'function'
    ) {

      refreshDashboardDJ_V5();

      return;

    }

  } catch (error) {

    logDJFK_(
      ss,
      'DASHBOARD_ERROR',
      error.message
    );

  }


  writeApiDataDJFK_(
    ss
  );

}


function writeApiDataDJFK_(
  ss
) {

  const api =
    ss.getSheetByName(
      DJFK.SHEETS.API
    );


  const rooms =
    publicRoomsDJFK_();


  api.clearContents();


  api
    .getRange(
      1,
      1,
      1,
      5
    )
    .setValues([
      [
        'no_kamar',
        'lantai',
        'status',
        'harga_bulan',
        'updated_at'
      ]
    ]);


  if (
    rooms.length
  ) {

    api
      .getRange(
        2,
        1,
        rooms.length,
        5
      )
      .setValues(
        rooms.map(
          function(room) {

            return [

              room.no_kamar,
              room.lantai,
              room.status,
              room.harga_bulan,
              new Date()

            ];

          }
        )
      );

  }

}


/* ============================================================
 * PASSWORD TENANT
 * ============================================================
 */

function setTenantPasswordDJFK() {

  const ui =
    SpreadsheetApp
      .getUi();


  const tenantId =
    cleanDJFK_(
      ui
        .prompt(
          'Atur Password Tenant',
          'Masukkan Tenant ID:',
          ui.ButtonSet.OK_CANCEL
        )
        .getResponseText()
    );


  if (!tenantId) {
    return;
  }


  const password =
    ui
      .prompt(
        'Password Baru',
        'Minimal 6 karakter:',
        ui.ButtonSet.OK_CANCEL
      )
      .getResponseText();


  if (
    password.length < 6
  ) {

    ui.alert(
      'Password minimal 6 karakter.'
    );


    return;

  }


  const tenant =
    findTenantDJFK_(
      tenantId
    );


  if (!tenant) {

    throw new Error(
      'Tenant tidak ditemukan.'
    );

  }


  const ss =
    getSpreadsheetDJFK_();


  const sh =
    ss.getSheetByName(
      DJFK.SHEETS.AKUN
    );


  const old =
    getAccountDJFK_(
      tenantId
    );


  const salt =
    Utilities.getUuid();


  upsertDJFK_(
    sh,
    {

      Akun_ID:
        old
          ? old.Akun_ID
          : 'ACC-' +
            hashIdDJFK_(
              tenantId
            ),

      Tenant_ID:
        tenantId,

      Salt:
        salt,

      Password_Hash:
        tokenHashDJFK_(
          password,
          salt
        ),

      Status_Akun:
        'AKTIF',

      Created_At:
        old
          ? old.Created_At
          : new Date(),

      Last_Login:
        old
          ? old.Last_Login
          : ''

    },
    'Tenant_ID'
  );


  ui.alert(
    'Password tenant berhasil disimpan.'
  );

}


/* ============================================================
 * APPROVE PENDAFTARAN
 * ============================================================
 */

function approveRegistrationDJFK() {

  const ui =
    SpreadsheetApp
      .getUi();


  const id =
    cleanDJFK_(
      ui
        .prompt(
          'Setujui Pendaftaran',
          'Masukkan Pendaftaran ID:',
          ui.ButtonSet.OK_CANCEL
        )
        .getResponseText()
    );


  if (!id) {
    return;
  }


  const ss =
    getSpreadsheetDJFK_();


  const sh =
    ss.getSheetByName(
      DJFK.SHEETS.PENDAFTARAN
    );


  const app =
    findByValueDJFK_(
      sh,
      'Pendaftaran_ID',
      id
    );


  if (!app) {

    throw new Error(
      'Pendaftaran tidak ditemukan.'
    );

  }


  if (
    normalizeDJFK_(
      app.Status_Pendaftaran
    ) !==
    'menunggu_verifikasi'
  ) {

    throw new Error(
      'Pendaftaran ini sudah diproses.'
    );

  }


  if (
    DJ39RoomUnavailableDJFK_(
      app.No_Kamar
    )
  ) {

    throw new Error(
      'Kamar sudah terisi.'
    );

  }


  const tenantId =
    'TEN-' +
    hashIdDJFK_(
      id +
      '|TENANT'
    );


  const tenant = {

    Tenant_ID:
      tenantId,

    Source_Key:
      'REG|' +
      id,

    Tanggal_Submit:
      app.Timestamp,

    Nama_Lengkap:
      app.Nama_Lengkap,

    Nama_Panggilan:
      app.Nama_Panggilan,

    No_HP:
      app.No_HP,

    Email:
      app.Email,

    NIK_KTP:
      app.NIK_KTP,

    Pekerjaan:
      app.Pekerjaan,

    Perusahaan_Instansi:
      app.Perusahaan_Instansi,

    Jenis_Kelamin:
      app.Jenis_Kelamin,

    Status_Pernikahan:
      '',

    Kontak_Darurat:
      '',

    Hubungan_Kontak_Darurat:
      '',

    No_HP_Kontak_Darurat:
      '',

    No_Kamar:
      app.No_Kamar,

    Tanggal_Mulai_Tinggal:
      app.Tanggal_Mulai_Tinggal,

    Rencana_Lama_Tinggal:
      '',

    KTP_File_URL:
      '',

    Surat_Pernyataan_File_URL:
      '',

    Kendaraan:
      '',

    No_Plat:
      '',

    Status_Tenant:
      'AKTIF',

    Catatan:
      'Dibuat dari ' +
      id,

    Last_Sync:
      new Date()

  };


  upsertDJFK_(
    ss.getSheetByName(
      DJFK.SHEETS.TENANT
    ),
    tenant,
    'Tenant_ID'
  );


  const contractId =
    createContractForTenantDJFK_(
      tenantId,
      'REG|' +
      id
    );


  const headers =
    getHeadersDJFK_(
      sh
    );


  const set =
    function(
      aliases,
      value
    ) {

      const col =
        findColDJFK_(
          headers,
          aliases
        );


      if (
        col >= 0
      ) {

        sh
          .getRange(
            app._row,
            col + 1
          )
          .setValue(
            value
          );

      }

    };


  set(
    ['Status_Pendaftaran'],
    'DISETUJUI'
  );


  set(
    ['Tenant_ID'],
    tenantId
  );


  set(
    ['Kontrak_ID'],
    contractId
  );


  set(
    ['Last_Update'],
    new Date()
  );


  updateRoomDJFK_(
    app.No_Kamar,
    'TERISI',
    tenantId,
    tenant.Nama_Lengkap
  );


  ui.alert(

    'Pendaftaran disetujui.\n\n' +
    'Tenant ID: ' +
    tenantId +
    '\n\n' +
    'Lanjutkan dengan menu "Atur Password Tenant".'

  );

}


/* ============================================================
 * AUDIT V2
 * ============================================================
 */

function auditDJFamilyKost() {

  const ss =
    getSpreadsheetDJFK_();


  ensureDatabaseDJFK_(
    ss
  );


  const problems =
    [];


  const triggers =
    ScriptApp
      .getProjectTriggers()
      .map(
        function(trigger) {

          return trigger
            .getHandlerFunction();

        }
      );


  const expectedTriggers =
    [
      'onFormSubmitDJV2',
      'runDJFamilyKostHourly'
    ];


  if (
    triggers.length !==
    expectedTriggers.length ||
    expectedTriggers.some(
      function(name) {

        return (
          triggers.indexOf(
            name
          ) < 0
        );

      }
    )
  ) {

    problems.push(
      'Trigger belum sesuai. Target tepat 2 trigger: onFormSubmitDJV2 dan runDJFamilyKostHourly.'
    );

  }


  const rooms =
    publicRoomsDJFK_();


  if (
    rooms.length !==
    DJFK.ROOM_COUNT
  ) {

    problems.push(
      'Jumlah kamar API bukan 39.'
    );

  }


  const tenantRecords =
    readRecordsDJFK_(
      ss.getSheetByName(
        DJFK.SHEETS.TENANT
      )
    );


  const roomCol =
    findColDJFK_(
      tenantRecords.headers,
      ['No_Kamar']
    );


  const statusCol =
    findColDJFK_(
      tenantRecords.headers,
      ['Status_Tenant']
    );


  const activeRoomMap =
    {};


  tenantRecords.rows
    .forEach(
      function(row) {

        if (
          ![
            'aktif',
            'active'
          ].includes(
            normalizeDJFK_(
              row[
                statusCol
              ]
            )
          )
        ) {

          return;

        }


        const room =
          cleanDJFK_(
            row[
              roomCol
            ]
          );


        if (
          room
        ) {

          activeRoomMap[room] =
            (
              activeRoomMap[room] ||
              0
            ) +
            1;

        }

      }
    );


  Object
    .keys(
      activeRoomMap
    )
    .forEach(
      function(room) {

        if (
          activeRoomMap[room] >
          1
        ) {

          problems.push(
            'Lebih dari satu tenant aktif pada kamar ' +
            room +
            '.'
          );

        }

      }
    );


  const relations = [

    DJFK.SHEETS.PEMBAYARAN,
    DJFK.SHEETS.MAINTENANCE,
    DJFK.SHEETS.CHECKINOUT

  ];


  relations.forEach(
    function(sheetName) {

      const rec =
        readRecordsDJFK_(
          ss.getSheetByName(
            sheetName
          )
        );


      const tenantCol =
        findColDJFK_(
          rec.headers,
          ['Tenant_ID']
        );


      if (
        tenantCol < 0
      ) {

        return;

      }


      rec.rows.forEach(
        function(row,index) {

          if (
            !cleanDJFK_(
              row[
                tenantCol
              ]
            )
          ) {

            problems.push(
              sheetName +
              ' baris ' +
              (
                DJFK.DATA_START_ROW +
                index
              ) +
              ' belum memiliki Tenant_ID.'
            );

          }

        }
      );

    }
  );


  const message = [

    'DJ FAMILY KOST — AUDIT V2',

    'Kamar: ' +
      rooms.length,

    'Terisi: ' +
      rooms.filter(
        function(r) {
          return r.status === 'TERISI';
        }
      ).length,

    'Tersedia: ' +
      rooms.filter(
        function(r) {
          return r.status === 'KOSONG';
        }
      ).length,

    'Segera: ' +
      rooms.filter(
        function(r) {
          return r.status === 'SEGERA';
        }
      ).length,

    'Tenant: ' +
      tenantRecords.rows.length,

    'Kontrak: ' +
      readRecordsDJFK_(
        ss.getSheetByName(
          DJFK.SHEETS.KONTRAK
        )
      ).rows.length,

    'Pembayaran: ' +
      readRecordsDJFK_(
        ss.getSheetByName(
          DJFK.SHEETS.PEMBAYARAN
        )
      ).rows.length,

    'Maintenance: ' +
      readRecordsDJFK_(
        ss.getSheetByName(
          DJFK.SHEETS.MAINTENANCE
        )
      ).rows.length,

    'CheckInOut: ' +
      readRecordsDJFK_(
        ss.getSheetByName(
          DJFK.SHEETS.CHECKINOUT
        )
      ).rows.length,

    'Pelanggaran: ' +
      readRecordsDJFK_(
        ss.getSheetByName(
          DJFK.SHEETS.PELANGGARAN
        )
      ).rows.length,

    'Trigger: ' +
      triggers.length,

    problems.length
      ? 'STATUS: ADA MASALAH'
      : 'STATUS: SISTEM TERHUBUNG'

  ];


  Logger.log(
    message.join(
      '\n'
    )
  );


  if (
    problems.length
  ) {

    problems.forEach(
      function(problem) {

        Logger.log(
          'PROBLEM: ' +
          problem
        );

      }
    );

  }


  SpreadsheetApp
    .getUi()
    .alert(
      message.join(
        '\n'
      ) +
      (
        problems.length

          ? '\n\n' +
            problems
              .map(
                function(problem) {

                  return (
                    '• ' +
                    problem
                  );

                }
              )
              .join(
                '\n'
              )

          : ''
      )
    );


  return {

    ok:
      problems.length === 0,

    problems:
      problems,

    triggers:
      triggers,

    rooms:
      rooms.length

  };

}


/* ============================================================
 * UPLOAD
 * ============================================================
 */

function saveUploadsDJFK_(
  files
) {

  const folder =
    getUploadFolderDJFK_();


  const urls =
    [];


  files
    .slice(
      0,
      4
    )
    .forEach(
      function(file) {

        if (
          !file ||
          !file.dataUrl
        ) {

          return;

        }


        const match =
          String(
            file.dataUrl
          )
          .match(
            /^data:([^;]+);base64,(.+)$/
          );


        if (!match) {
          return;
        }


        const blob =
          Utilities
            .newBlob(

              Utilities
                .base64Decode(
                  match[2]
                ),

              match[1],

              cleanDJFK_(
                file.name ||
                Utilities.getUuid()
              )

            );


        const driveFile =
          folder.createFile(
            blob
          );


        driveFile.setSharing(
          DriveApp.Access.ANYONE_WITH_LINK,
          DriveApp.Permission.VIEW
        );


        urls.push(
          driveFile.getUrl()
        );

      }
    );


  return urls;

}


function getUploadFolderDJFK_() {

  const props =
    PropertiesService
      .getScriptProperties();


  const id =
    props.getProperty(
      'DJFK_UPLOAD_FOLDER_ID'
    );


  if (id) {

    try {

      return DriveApp
        .getFolderById(
          id
        );

    } catch (_) {}

  }


  const folder =
    DriveApp.createFolder(
      'DJ Family Kost Uploads'
    );


  props.setProperty(
    'DJFK_UPLOAD_FOLDER_ID',
    folder.getId()
  );


  return folder;

}


/* ============================================================
 * TRIGGER / LOG / TIME
 * ============================================================
 */

function removeAllProjectTriggersDJFK_() {

  ScriptApp
    .getProjectTriggers()
    .forEach(
      function(trigger) {

        ScriptApp.deleteTrigger(
          trigger
        );

      }
    );

}


function logDJFK_(
  ss,
  type,
  message
) {

  const sh =
    ss.getSheetByName(
      DJFK.SHEETS.LOG
    );


  if (
    !sh
  ) {

    return;

  }


  sh.appendRow([

    new Date(),
    type,
    message

  ]);

}