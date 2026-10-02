/**
 * ============================================================
 * DJ FAMILY KOST
 * PAYMENT PROOF STORAGE V2
 * ============================================================
 *
 * Tenant mengupload FOTO langsung dari website.
 *
 * Sistem otomatis:
 * 1. menerima base64 gambar
 * 2. membuat file gambar
 * 3. menyimpan file ke folder internal
 * 4. menyimpan File ID + URL ke database pembayaran
 *
 * Tenant TIDAK perlu menggunakan Google Drive.
 *
 * ============================================================
 */


const PAYMENT_PROOF_V2 = {

  FOLDER_NAME:
    'DJ Family Kost - Bukti Pembayaran',

  FOLDER_PROPERTY:
    'PAYMENT_PROOF_FOLDER_ID',

  MAX_BASE64_LENGTH:
    8 * 1024 * 1024

};


/**
 * ============================================================
 * SIMPAN FOTO BUKTI
 * ============================================================
 */
function saveTenantPaymentProofV2_(
  base64,
  mimeType,
  originalName,
  tenantId,
  paymentId
) {

  base64 =
    String(
      base64 || ''
    ).trim();


  mimeType =
    String(
      mimeType || ''
    ).trim()
    .toLowerCase();


  originalName =
    String(
      originalName || ''
    ).trim();


  tenantId =
    String(
      tenantId || ''
    ).trim()
    .toUpperCase();


  paymentId =
    String(
      paymentId || ''
    ).trim();


  if (!base64) {

    return {

      ok: false,

      error:
        'Foto bukti pembayaran belum dipilih.'

    };

  }


  if (
    base64.length >
    PAYMENT_PROOF_V2.MAX_BASE64_LENGTH
  ) {

    return {

      ok: false,

      error:
        'Ukuran foto terlalu besar. Gunakan foto yang lebih kecil.'

    };

  }


  const allowedTypes = [

    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'

  ];


  if (
    allowedTypes.indexOf(
      mimeType
    ) < 0
  ) {

    return {

      ok: false,

      error:
        'Format foto tidak didukung. Gunakan JPG, PNG, atau WEBP.'

    };

  }


  /*
   * ----------------------------------------------------------
   * Bersihkan prefix data URL jika masih ada.
   * ----------------------------------------------------------
   */

  if (
    base64.indexOf(
      'base64,'
    ) >= 0
  ) {

    base64 =
      base64.split(
        'base64,'
      )[1];

  }


  let bytes;


  try {

    bytes =
      Utilities.base64Decode(
        base64
      );

  } catch (err) {

    return {

      ok: false,

      error:
        'Foto gagal diproses oleh server.'

    };

  }


  if (
    !bytes ||
    !bytes.length
  ) {

    return {

      ok: false,

      error:
        'Foto kosong atau rusak.'

    };

  }


  /*
   * ----------------------------------------------------------
   * Dapatkan folder internal.
   * ----------------------------------------------------------
   */

  const folder =
    getPaymentProofFolderV2_();


  /*
   * ----------------------------------------------------------
   * Nama file.
   * ----------------------------------------------------------
   */

  const extension =
    mimeType === 'image/png'
      ? 'png'
      : 'jpg';


  const safeTenant =
    tenantId
      .replace(
        /[^A-Za-z0-9_-]/g,
        ''
      );


  const safePayment =
    paymentId
      .replace(
        /[^A-Za-z0-9_-]/g,
        ''
      );


  const timestamp =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() ||
      'Asia/Jakarta',
      'yyyyMMdd-HHmmss'
    );


  const fileName =
    'BUKTI-' +
    safePayment +
    '-' +
    safeTenant +
    '-' +
    timestamp +
    '.' +
    extension;


  const blob =
    Utilities
      .newBlob(
        bytes,
        mimeType,
        fileName
      );


  const file =
    folder.createFile(
      blob
    );


  return {

    ok:
      true,

    fileId:
      file.getId(),

    fileName:
      file.getName(),

    fileUrl:
      file.getUrl(),

    mimeType:
      mimeType,

    originalName:
      originalName

  };

}


/**
 * ============================================================
 * GET / CREATE FOLDER
 * ============================================================
 */
function getPaymentProofFolderV2_() {

  const properties =
    PropertiesService
      .getScriptProperties();


  const savedId =
    properties.getProperty(
      PAYMENT_PROOF_V2.FOLDER_PROPERTY
    );


  /*
   * ----------------------------------------------------------
   * Jika folder ID sudah tersimpan,
   * gunakan folder tersebut.
   * ----------------------------------------------------------
   */

  if (savedId) {

    try {

      return DriveApp.getFolderById(
        savedId
      );

    } catch (err) {

      /*
       * Folder sudah tidak tersedia.
       * Lanjut membuat folder baru.
       */

    }

  }


  /*
   * ----------------------------------------------------------
   * Cari folder berdasarkan nama.
   * ----------------------------------------------------------
   */

  const folders =
    DriveApp.getFoldersByName(
      PAYMENT_PROOF_V2.FOLDER_NAME
    );


  if (
    folders.hasNext()
  ) {

    const folder =
      folders.next();


    properties.setProperty(
      PAYMENT_PROOF_V2.FOLDER_PROPERTY,
      folder.getId()
    );


    return folder;

  }


  /*
   * ----------------------------------------------------------
   * Folder belum ada → buat otomatis.
   * ----------------------------------------------------------
 */

  const folder =
    DriveApp.createFolder(
      PAYMENT_PROOF_V2.FOLDER_NAME
    );


  properties.setProperty(
    PAYMENT_PROOF_V2.FOLDER_PROPERTY,
    folder.getId()
  );


  return folder;

}