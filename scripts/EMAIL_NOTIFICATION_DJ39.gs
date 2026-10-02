/**

 * ============================================================

 * DJ FAMILY KOST

 * EMAIL NOTIFICATION ENGINE — V1

 * ============================================================

 *

 * TUJUAN:

 *

 * 1. Menjadi mesin email terpusat DJ Family Kost.

 * 2. Menyediakan template email.

 * 3. Menyediakan log pengiriman.

 * 4. Menyediakan fungsi test email.

 *

 * PENTING:

 * - MODUL TERPISAH.

 * - Belum mengubah event Pembayaran.

 * - Belum mengubah event Maintenance.

 * - Belum membuat trigger otomatis.

 * - Belum mengubah dashboard.

 * - Belum mengubah WhatsApp.

 *

 * ============================================================

 */





const DJ39_EMAIL = {



  LOG_SHEET:

    'Email_Notification_Log',



  APP_NAME:

    'DJ Family Kost',



  MAX_MESSAGE_LENGTH:

    10000



};





/* ============================================================

 * 1. SETUP LOG

 * ============================================================

 */



function setupEmailNotificationDJ39() {



  const ss =

    SpreadsheetApp.getActiveSpreadsheet();



  if (!ss) {



    throw new Error(

      'Spreadsheet DJ Family Kost tidak ditemukan.'

    );



  }



  let sheet =

    ss.getSheetByName(

      DJ39_EMAIL.LOG_SHEET

    );



  if (!sheet) {



    sheet =

      ss.insertSheet(

        DJ39_EMAIL.LOG_SHEET

      );



  }



  const headers = [



    'Notification_ID',



    'Timestamp',



    'Channel',



    'Jenis_Notifikasi',



    'Tenant_ID',



    'Nama_Tenant',



    'No_Kamar',



    'Email',



    'Subjek',



    'Status',



    'Keterangan'



  ];



  const lastColumn =

    Math.max(

      sheet.getLastColumn(),

      headers.length

    );



  const currentHeaders =

    sheet

      .getRange(

        1,

        1,

        1,

        lastColumn

      )

      .getValues()[0]

      .map(function(value) {



        return String(

          value || ''

        ).trim();



      });



  const hasTenantId =

    currentHeaders.indexOf(

      'Tenant_ID'

    ) >= 0;



  if (!hasTenantId) {



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



  } else {



    headers.forEach(function(header) {



      if (

        currentHeaders.indexOf(

          header

        ) >= 0

      ) {



        return;



      }



      const col =

        sheet.getLastColumn() + 1;



      sheet

        .getRange(

          1,

          col

        )

        .setValue(

          header

        );



    });



  }



  SpreadsheetApp.flush();



  Logger.log(

    'Email notification log siap.'

  );



  return {

    ok: true,

    sheet: DJ39_EMAIL.LOG_SHEET

  };



}





/* ============================================================

 * 2. HEADER HELPER

 * ============================================================

 */



function dj39EmailGetHeaders_(sheet) {



  const lastColumn =

    sheet.getLastColumn();



  if (

    lastColumn < 1

  ) {



    return [];



  }



  return sheet

    .getRange(

      1,

      1,

      1,

      lastColumn

    )

    .getValues()[0]

    .map(function(value) {



      return String(

        value || ''

      ).trim();



    });



}





/* ============================================================

 * 3. COLUMN HELPER

 * ============================================================

 */



function dj39EmailFindColumn_(

  headers,

  candidates

) {



  for (

    let i = 0;

    i < candidates.length;

    i++

  ) {



    const index =

      headers.indexOf(

        candidates[i]

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

 * 4. READ TENANT

 * ============================================================

 */



function dj39EmailFindTenant_(

  tenantId

) {



  const ss =

    SpreadsheetApp.getActiveSpreadsheet();



  const sheet =

    ss.getSheetByName(

      'Tenant'

    );



  if (!sheet) {



    throw new Error(

      'Sheet Tenant tidak ditemukan.'

    );



  }



  const headers =

    dj39EmailGetHeaders_(

      sheet

    );



  const tenantIdCol =

    dj39EmailFindColumn_(

      headers,

      [

        'Tenant_ID'

      ]

    );



  if (

    tenantIdCol < 0

  ) {



    throw new Error(

      'Kolom Tenant_ID tidak ditemukan di sheet Tenant.'

    );



  }



  const values =

    sheet.getDataRange()

      .getValues();



  for (

    let i = 1;

    i < values.length;

    i++

  ) {



    const row =

      values[i];



    const currentTenantId =

      String(

        row[tenantIdCol] || ''

      )

      .trim();



    if (

      currentTenantId !==

      String(

        tenantId

      )

      .trim()

    ) {



      continue;



    }



    const nameCol =

      dj39EmailFindColumn_(

        headers,

        [

          'Nama_Lengkap',

          'Nama_Tenant'

        ]

      );



    const emailCol =

      dj39EmailFindColumn_(

        headers,

        [

          'Email'

        ]

      );



    const roomCol =

      dj39EmailFindColumn_(

        headers,

        [

          'No_Kamar'

        ]

      );



    const statusCol =

      dj39EmailFindColumn_(

        headers,

        [

          'Status_Tenant'

        ]

      );



    return {



      tenantId:

        currentTenantId,



      name:

        nameCol >= 0

          ? String(

              row[nameCol] || ''

            ).trim()

          : '',



      email:

        emailCol >= 0

          ? String(

              row[emailCol] || ''

            ).trim()

          : '',



      room:

        roomCol >= 0

          ? String(

              row[roomCol] || ''

            ).trim()

          : '',



      status:

        statusCol >= 0

          ? String(

              row[statusCol] || ''

            ).trim()

          : ''



    };



  }



  return null;



}





/* ============================================================

 * 5. LOGGING

 * ============================================================

 */



function dj39EmailLog_(

  data

) {



  const ss =

    SpreadsheetApp.getActiveSpreadsheet();



  let sheet =

    ss.getSheetByName(

      DJ39_EMAIL.LOG_SHEET

    );



  if (!sheet) {



    setupEmailNotificationDJ39();



    sheet =

      ss.getSheetByName(

        DJ39_EMAIL.LOG_SHEET

      );



  }



  const headers =

    dj39EmailGetHeaders_(

      sheet

    );



  const row =

    headers.map(

      function(header) {



        return (

          data[

            header

          ] !== undefined

        )

          ? data[

              header

            ]

          : '';



      }

    );



  sheet

    .appendRow(

      row

    );



}





/* ============================================================

 * 6. GENERATE NOTIFICATION ID

 * ============================================================

 */



function dj39EmailNotificationId_() {



  return (

    'EMAIL-' +

    Utilities.getUuid()

  );



}





/* ============================================================

 * 7. EMAIL SENDER

 * ============================================================

 */



function dj39EmailSend_(

  options

) {



  const tenant =

    options.tenant || {};



  const to =

    String(

      options.to ||

      tenant.email ||

      ''

    ).trim();



  const subject =

    String(

      options.subject ||

      ''

    ).trim();



  const body =

    String(

      options.body ||

      ''

    );



  const type =

    String(

      options.type ||

      'GENERAL'

    ).trim();



  if (!to) {



    throw new Error(

      'Alamat email tenant kosong.'

    );



  }



  if (!subject) {



    throw new Error(

      'Subjek email kosong.'

    );



  }



  if (!body) {



    throw new Error(

      'Isi email kosong.'

    );



  }



  if (

    body.length >

    DJ39_EMAIL.MAX_MESSAGE_LENGTH

  ) {



    throw new Error(

      'Isi email terlalu panjang.'

    );



  }



  const notificationId =

    dj39EmailNotificationId_();



  try {



    MailApp.sendEmail({



      to:

        to,



      subject:

        subject,



      body:

        body,



      name:

        DJ39_EMAIL.APP_NAME



    });



    dj39EmailLog_({



      Notification_ID:

        notificationId,



      Timestamp:

        new Date(),



      Channel:

        'EMAIL',



      Jenis_Notifikasi:

        type,



      Tenant_ID:

        tenant.tenantId || '',



      Nama_Tenant:

        tenant.name || '',



      No_Kamar:

        tenant.room || '',



      Email:

        to,



      Subjek:

        subject,



      Status:

        'TERKIRIM',



      Keterangan:

        'Email berhasil dikirim.'



    });



    return {



      ok: true,



      notificationId:

        notificationId,



      status:

        'TERKIRIM'



    };



  } catch (error) {



    dj39EmailLog_({



      Notification_ID:

        notificationId,



      Timestamp:

        new Date(),



      Channel:

        'EMAIL',



      Jenis_Notifikasi:

        type,



      Tenant_ID:

        tenant.tenantId || '',



      Nama_Tenant:

        tenant.name || '',



      No_Kamar:

        tenant.room || '',



      Email:

        to,



      Subjek:

        subject,



      Status:

        'GAGAL',



      Keterangan:

        String(

          error &&

          error.message

            ? error.message

            : error

        )



    });



    throw error;



  }



}





/* ============================================================

 * 8. TEMPLATE — GENERAL

 * ============================================================

 */



function dj39EmailBuildGeneral_(

  name,

  message

) {



  return (



    'Halo ' +

    name +

    ',' +

    '\n\n' +



    message +

    '\n\n' +



    'Terima kasih.' +

    '\n' +



    'DJ Family Kost'



  );



}





/* ============================================================

 * 9. TEMPLATE — PAYMENT VERIFIED

 * ============================================================

 */



function dj39EmailPaymentVerifiedBody_(

  data

) {



  return (



    'Halo ' +

    data.name +

    ',' +

    '\n\n' +



    'Terima kasih. Pembayaran DJ Family Kost ' +

    'untuk periode ' +

    data.period +

    ' kamar ' +

    data.room +

    ' telah kami verifikasi dan dinyatakan LUNAS.' +

    '\n\n' +



    'Rincian pembayaran:' +

    '\n' +

    'Kamar: ' +

    data.room +

    '\n' +

    'Periode: ' +

    data.period +

    '\n' +

    'Nominal dibayar: Rp' +

    Number(

      data.paid || 0

    ).toLocaleString(

      'id-ID'

    ) +

    '\n' +



    'Total tagihan: Rp' +

    Number(

      data.total || 0

    ).toLocaleString(

      'id-ID'

    ) +



    '\n\n' +



    'Status pembayaran: LUNAS.' +



    '\n\n' +



    'Terima kasih atas pembayarannya.' +

    '\n' +



    'DJ Family Kost'



  );



}





/* ============================================================

 * 10. TEMPLATE — MAINTENANCE RECEIVED

 * ============================================================

 */



function dj39EmailMaintenanceReceivedBody_(

  data

) {



  return (



    'Halo ' +

    data.name +

    ',' +

    '\n\n' +



    'Laporan maintenance Anda telah kami terima.' +

    '\n\n' +



    'Rincian laporan:' +

    '\n' +

    'Kamar: ' +

    data.room +

    '\n' +

    'Maintenance ID: ' +

    data.maintenanceId +

    '\n' +

    'Masalah: ' +

    data.problem +



    '\n\n' +



    'Laporan sedang menunggu tindak lanjut dari pengelola.' +



    '\n\n' +



    'Terima kasih.' +

    '\n' +



    'DJ Family Kost'



  );



}





/* ============================================================

 * 11. TEMPLATE — MAINTENANCE COMPLETED

 * ============================================================

 */



function dj39EmailMaintenanceCompletedBody_(

  data

) {



  return (



    'Halo ' +

    data.name +

    ',' +

    '\n\n' +



    'Laporan maintenance Anda telah selesai ditangani.' +

    '\n\n' +



    'Rincian:' +

    '\n' +

    'Kamar: ' +

    data.room +

    '\n' +

    'Maintenance ID: ' +

    data.maintenanceId +

    '\n' +

    'Masalah: ' +

    data.problem +



    '\n\n' +



    'Status: SELESAI / SUDAH DIPERBAIKI.' +



    (

      data.note

        ? (

            '\n' +

            'Catatan: ' +

            data.note

          )

        : ''

    ) +



    '\n\n' +



    'Terima kasih.' +

    '\n' +



    'DJ Family Kost'



  );



}





/* ============================================================

 * 12. SEND PAYMENT VERIFIED

 * ============================================================

 *

 * BELUM DIPANGGIL OTOMATIS.

 * Nanti akan dipanggil saat Master benar-benar

 * memverifikasi pembayaran menjadi LUNAS.

 *

 * ============================================================

 */



function sendPaymentVerifiedEmailDJ39(

  tenantId,

  paymentData

) {



  const tenant =

    dj39EmailFindTenant_(

      tenantId

    );



  if (!tenant) {



    throw new Error(

      'Tenant tidak ditemukan: ' +

      tenantId

    );



  }



  if (!tenant.email) {



    throw new Error(

      'Email tenant kosong: ' +

      tenantId

    );



  }



  const data = {



    name:

      paymentData.name ||

      tenant.name,



    room:

      paymentData.room ||

      tenant.room,



    period:

      paymentData.period ||

      '',



    paid:

      Number(

        paymentData.paid ||

        0

      ),



    total:

      Number(

        paymentData.total ||

        0

      )



  };



  return dj39EmailSend_({



    tenant:

      tenant,



    type:

      'PAYMENT_VERIFIED',



    subject:

      'Pembayaran DJ Family Kost Telah Diverifikasi - Kamar ' +

      data.room,



    body:

      dj39EmailPaymentVerifiedBody_(

        data

      )



  });



}





/* ============================================================

 * 13. SEND MAINTENANCE RECEIVED

 * ============================================================

 */



function sendMaintenanceReceivedEmailDJ39(

  tenantId,

  maintenanceData

) {



  const tenant =

    dj39EmailFindTenant_(

      tenantId

    );



  if (!tenant) {



    throw new Error(

      'Tenant tidak ditemukan: ' +

      tenantId

    );



  }



  if (!tenant.email) {



    throw new Error(

      'Email tenant kosong: ' +

      tenantId

    );



  }



  const data = {



    name:

      maintenanceData.name ||

      tenant.name,



    room:

      maintenanceData.room ||

      tenant.room,



    maintenanceId:

      maintenanceData.maintenanceId ||

      '',



    problem:

      maintenanceData.problem ||

      ''



  };



  return dj39EmailSend_({



    tenant:

      tenant,



    type:

      'MAINTENANCE_RECEIVED',



    subject:

      'Laporan Maintenance Telah Diterima - Kamar ' +

      data.room,



    body:

      dj39EmailMaintenanceReceivedBody_(

        data

      )



  });



}





/* ============================================================

 * 14. SEND MAINTENANCE COMPLETED

 * ============================================================

 */



function sendMaintenanceCompletedEmailDJ39(

  tenantId,

  maintenanceData

) {



  const tenant =

    dj39EmailFindTenant_(

      tenantId

    );



  if (!tenant) {



    throw new Error(

      'Tenant tidak ditemukan: ' +

      tenantId

    );



  }



  if (!tenant.email) {



    throw new Error(

      'Email tenant kosong: ' +

      tenantId

    );



  }



  const data = {



    name:

      maintenanceData.name ||

      tenant.name,



    room:

      maintenanceData.room ||

      tenant.room,



    maintenanceId:

      maintenanceData.maintenanceId ||

      '',



    problem:

      maintenanceData.problem ||

      '',



    note:

      maintenanceData.note ||

      ''



  };



  return dj39EmailSend_({



    tenant:

      tenant,



    type:

      'MAINTENANCE_COMPLETED',



    subject:

      'Maintenance Telah Selesai - Kamar ' +

      data.room,



    body:

      dj39EmailMaintenanceCompletedBody_(

        data

      )



  });



}





/* ============================================================

 * 15. TEST EMAIL

 * ============================================================

 *

 * TEST INI TIDAK MENGUBAH DATA PRODUKSI.

 *

 * Isi alamat email tujuan di bawah.

 * ============================================================

 */



function testEmailNotificationDJ39() {



  const testEmail =

    Browser.inputBox(

      'TEST EMAIL DJ FAMILY KOST',

      'Masukkan alamat email untuk menerima email test:',

      Browser.Buttons.OK_CANCEL

    );



  if (

    testEmail ===

    'cancel'

  ) {



    return;



  }



  const email =

    String(

      testEmail || ''

    ).trim();



  if (!email) {



    throw new Error(

      'Alamat email test kosong.'

    );



  }



  const tenant =

    {



      tenantId:

        'TEST',



      name:

        'Tenant Test',



      room:

        'TEST',



      email:

        email



    };



  const result =

    dj39EmailSend_({



      tenant:

        tenant,



      type:

        'TEST_EMAIL',



      subject:

        'Test Email DJ Family Kost',



      body:

        dj39EmailBuildGeneral_(

          'Tenant Test',

          'Ini adalah email test dari sistem notifikasi DJ Family Kost.\n\nSistem email berhasil terhubung dan siap untuk tahap integrasi.'



        )



    });



  SpreadsheetApp.getUi().alert(



    'TEST EMAIL SELESAI\n\n' +



    'Status: ' +

    result.status +

    '\n' +



    'Notification ID:\n' +

    result.notificationId



  );



  return result;



}





/* ============================================================

 * 16. AUDIT MODULE

 * ============================================================

 */



function auditEmailNotificationDJ39() {



  const result = {



    ok:

      true,



    checks:

      []



  };



  const ss =

    SpreadsheetApp.getActiveSpreadsheet();



  if (!ss) {



    throw new Error(

      'Spreadsheet tidak ditemukan.'

    );



  }



  result.checks.push({



    item:

      'Spreadsheet',



    status:

      'OK'



  });



  const tenantSheet =

    ss.getSheetByName(

      'Tenant'

    );



  result.checks.push({



    item:

      'Sheet Tenant',



    status:

      tenantSheet

        ? 'OK'

        : 'GAGAL'



  });



  setupEmailNotificationDJ39();



  const logSheet =

    ss.getSheetByName(

      DJ39_EMAIL.LOG_SHEET

    );



  result.checks.push({



    item:

      'Email Notification Log',



    status:

      logSheet

        ? 'OK'

        : 'GAGAL'



  });



  result.checks.push({



    item:

      'MailApp',



    status:

      'READY'



  });



  Logger.log(

    JSON.stringify(

      result,

      null,

      2

    )

  );



  return result;



}

/* ============================================================

 * MAINTENANCE EMAIL — SEND ONCE

 * ============================================================

 *

 * Fungsi tambahan.

 *

 * Tidak mengubah data Maintenance.

 * Hanya mencegah email ganda berdasarkan Maintenance_ID.

 *

 * ============================================================

 */





/* ============================================================

 * 1. MAINTENANCE RECEIVED — SEND ONCE

 * ============================================================

 */



function dj39EmailSendMaintenanceReceivedOnceV1_(

  tenantId,

  maintenanceData

) {



  const maintenanceId =

    String(

      maintenanceData &&

      maintenanceData.maintenanceId

        ? maintenanceData.maintenanceId

        : ''

    ).trim();



  if (!maintenanceId) {



    return {



      ok: false,



      status: 'GAGAL',



      error:

        'Maintenance ID kosong.'



    };



  }



  const cleanTenantId =

    String(

      tenantId || ''

    ).trim();



  if (!cleanTenantId) {



    return {



      ok: false,



      status: 'GAGAL',



      error:

        'Tenant ID kosong.'



    };



  }



  const lock =

    LockService.getScriptLock();



  lock.waitLock(10000);



  try {



    const props =

      PropertiesService

        .getScriptProperties();



    const key =

      'DJ39_EMAIL_MAINT_RECEIVED_' +

      maintenanceId;



    const alreadySent =

      props.getProperty(

        key

      );



    if (alreadySent) {



      return {



        ok: true,



        status:

          'SUDAH TERKIRIM',



        duplicate:

          true,



        maintenanceId:

          maintenanceId



      };



    }



    const result =

      sendMaintenanceReceivedEmailDJ39(

        cleanTenantId,

        maintenanceData

      );



    props.setProperty(

      key,

      new Date().toISOString()

    );



    return {



      ok: true,



      status:

        'TERKIRIM',



      duplicate:

        false,



      maintenanceId:

        maintenanceId,



      notificationId:

        result &&

        result.notificationId

          ? result.notificationId

          : ''



    };



  } catch (err) {



    return {



      ok: false,



      status:

        'GAGAL',



      maintenanceId:

        maintenanceId,



      error:

        String(

          err &&

          err.message

            ? err.message

            : err

        ).slice(

          0,

          500

        )



    };



  } finally {



    lock.releaseLock();



  }



}





/* ============================================================

 * 2. MAINTENANCE COMPLETED — SEND ONCE

 * ============================================================

 */



function dj39EmailSendMaintenanceCompletedOnceV1_(

  tenantId,

  maintenanceData

) {



  const maintenanceId =

    String(

      maintenanceData &&

      maintenanceData.maintenanceId

        ? maintenanceData.maintenanceId

        : ''

    ).trim();



  if (!maintenanceId) {



    return {



      ok: false,



      status: 'GAGAL',



      error:

        'Maintenance ID kosong.'



    };



  }



  const cleanTenantId =

    String(

      tenantId || ''

    ).trim();



  if (!cleanTenantId) {



    return {



      ok: false,



      status: 'GAGAL',



      error:

        'Tenant ID kosong.'



    };



  }



  const lock =

    LockService.getScriptLock();



  lock.waitLock(10000);



  try {



    const props =

      PropertiesService

        .getScriptProperties();



    const key =

      'DJ39_EMAIL_MAINT_COMPLETED_' +

      maintenanceId;



    const alreadySent =

      props.getProperty(

        key

      );



    if (alreadySent) {



      return {



        ok: true,



        status:

          'SUDAH TERKIRIM',



        duplicate:

          true,



        maintenanceId:

          maintenanceId



      };



    }



    const result =

      sendMaintenanceCompletedEmailDJ39(

        cleanTenantId,

        maintenanceData

      );



    props.setProperty(

      key,

      new Date().toISOString()

    );



    return {



      ok: true,



      status:

        'TERKIRIM',



      duplicate:

        false,



      maintenanceId:

        maintenanceId,



      notificationId:

        result &&

        result.notificationId

          ? result.notificationId

          : ''



    };



  } catch (err) {



    return {



      ok: false,



      status:

        'GAGAL',



      maintenanceId:

        maintenanceId,



      error:

        String(

          err &&

          err.message

            ? err.message

            : err

        ).slice(

          0,

          500

        )



    };



  } finally {



    lock.releaseLock();



  }



}