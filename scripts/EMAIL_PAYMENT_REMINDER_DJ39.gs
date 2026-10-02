const DJ39_EMAIL_REMINDER = {

  MODE: 'LIVE',

  TENANT_SHEET: 'Tenant',

  CONTRACT_SHEET: 'Kontrak',

  PAYMENT_SHEET: 'Pembayaran',

  RUN_LOG_SHEET: 'Email_Reminder_Run_Log',

  APP_NAME: 'DJ Family Kost',

  REMINDER_DAY_28: 28,

  REMINDER_DAY_1: 1,

  REMINDER_DAY_3: 3,

  REMINDER_DAY_5: 5

};





function setupEmailPaymentReminderDJ39() {



  const ss =

    SpreadsheetApp.getActiveSpreadsheet();



  if (!ss) {

    throw new Error(

      'Spreadsheet DJ Family Kost tidak ditemukan.'

    );

  }



  let sh =

    ss.getSheetByName(

      DJ39_EMAIL_REMINDER.RUN_LOG_SHEET

    );



  if (!sh) {

    sh =

      ss.insertSheet(

        DJ39_EMAIL_REMINDER.RUN_LOG_SHEET

      );

  }



  const headers = [

    'Timestamp',

    'Campaign',

    'Periode',

    'Mode',

    'Tenant_ID',

    'Nama_Tenant',

    'No_Kamar',

    'Email',

    'Status_Pembayaran',

    'Denda',

    'Total_Tagihan',

    'Sisa_Tagihan',

    'Hasil',

    'Keterangan'

  ];



  const cols =

    Math.max(

      sh.getLastColumn(),

      headers.length

    );



  const current =

    sh

      .getRange(

        1,

        1,

        1,

        cols

      )

      .getValues()[0]

      .map(

        function(v) {

          return String(

            v || ''

          ).trim();

        }

      );



  if (

    !current.includes(

      'Timestamp'

    )

  ) {



    sh

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



  SpreadsheetApp.flush();



  Logger.log(

    'Email Payment Reminder DJ39 siap.'

  );



  return {



    ok:

      true,



    mode:

      DJ39_EMAIL_REMINDER.MODE,



    logSheet:

      DJ39_EMAIL_REMINDER.RUN_LOG_SHEET



  };



}





/* ============================================================

 * TABLE READER

 * ============================================================

 */



function dj39RemReadTable_(

  sheet

) {



  if (

    !sheet ||

    sheet.getLastRow() < 1 ||

    sheet.getLastColumn() < 1

  ) {



    return null;



  }



  const lastCol =

    sheet.getLastColumn();



  let headerRow =

    -1;



  for (

    let r = 1;

    r <= Math.min(

      sheet.getLastRow(),

      15

    );

    r++

  ) {



    const row =

      sheet

        .getRange(

          r,

          1,

          1,

          lastCol

        )

        .getValues()[0]

        .map(

          function(v) {

            return String(

              v || ''

            ).trim();

          }

        );



    if (

      row\.includes(

        'Tenant_ID'

      )

    ) {



      headerRow =

        r;



      break;



    }



  }



  if (

    headerRow < 0

  ) {



    return null;



  }



  const headers =

    sheet

      .getRange(

        headerRow,

        1,

        1,

        lastCol

      )

      .getValues()[0]

      .map(

        function(v) {

          return String(

            v || ''

          ).trim();

        }

      );



  const rows =

    sheet.getLastRow() >

    headerRow



      ? sheet

          .getRange(

            headerRow + 1,

            1,

            sheet.getLastRow() -

              headerRow,

            lastCol

          )

          .getValues()



      : [];



  return {



    sheet:

      sheet,



    headerRow:

      headerRow,



    headers:

      headers,



    rows:

      rows



  };



}





/* ============================================================

 * VALUE HELPER

 * ============================================================

 */



function dj39RemValue_(

  row,

  headers,

  names

) {



  for (

    const name of names

  ) {



    const index =

      headers.indexOf(

        name

      );



    if (

      index >= 0

    ) {



      return row[index];



    }



  }



  return '';



}





/* ============================================================

 * STRING HELPER

 * ============================================================

 */



function dj39RemString_(

  value

) {



  return String(

    value == null

      ? ''

      : value

  ).trim();



}





/* ============================================================

 * NUMBER HELPER

 * ============================================================

 */



function dj39RemNumber_(

  value

) {



  if (

    typeof value ===

    'number'

  ) {



    return (

      Number(value) ||

      0

    );



  }



  return (

    Number(

      String(

        value || ''

      ).replace(

        /[^\d.-]/g,

        ''

      )

    ) ||

    0

  );



}





/* ============================================================

 * PERIOD MATCH

 * ============================================================

 */



function dj39RemPeriodMatches_(

  value,

  year,

  month

) {



  const text =

    dj39RemString_(

      value

    );



  if (

    /^\d{4}-\d{1,2}$/.test(

      text

    )

  ) {



    const parts =

      text.split(

        '-'

      );



    return (



      Number(

        parts[0]

      ) ===

      Number(year)



      &&



      Number(

        parts[1]

      ) ===

      Number(month)



    );



  }



  const date =

    value instanceof Date

      ? value

      : (

          text

            ? new Date(text)

            : null

        );



  return !!(

    date &&

    !isNaN(

      date.getTime()

    ) &&



    date.getFullYear() ===

    Number(year) &&



    date.getMonth() + 1 ===

    Number(month)

  );



}





/* ============================================================

 * PERIOD LABEL

 * ============================================================

 */



function dj39RemPeriodLabel_(

  year,

  month

) {



  return Utilities.formatDate(



    new Date(

      Number(year),

      Number(month) - 1,

      1

    ),



    Session.getScriptTimeZone(),



    'MMMM yyyy'



  );



}





/* ============================================================

 * READ ACTIVE TENANTS

 * ============================================================

 */



function dj39RemReadTenants_(

  ss

) {



  const sh =

    ss.getSheetByName(

      DJ39_EMAIL_REMINDER.TENANT_SHEET

    );



  const table =

    dj39RemReadTable_(

      sh

    );



  if (!table) {



    throw new Error(

      'Struktur sheet Tenant tidak ditemukan.'

    );



  }



  const result =

    [];



  table.rows.forEach(

    function(row) {



      const id =

        dj39RemString_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Tenant_ID'

            ]

          )

        );



      const status =

        dj39RemString_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Status_Tenant'

            ]

          )

        ).toUpperCase();



      if (

        !id ||

        status !==

        'AKTIF'

      ) {



        return;



      }



      result.push({



        tenantId:

          id,



        name:

          dj39RemString_(

            dj39RemValue_(

              row,

              table.headers,

              [

                'Nama_Lengkap',

                'Nama_Tenant'

              ]

            )

          ),



        email:

          dj39RemString_(

            dj39RemValue_(

              row,

              table.headers,

              [

                'Email'

              ]

            )

          ),



        room:

          dj39RemString_(

            dj39RemValue_(

              row,

              table.headers,

              [

                'No_Kamar'

              ]

            )

          ),



        status:

          status



      });



    }

  );



  return result;



}





/* ============================================================

 * READ ACTIVE CONTRACTS

 * ============================================================

 */



function dj39RemReadContracts_(

  ss

) {



  const sh =

    ss.getSheetByName(

      DJ39_EMAIL_REMINDER.CONTRACT_SHEET

    );



  const table =

    dj39RemReadTable_(

      sh

    );



  if (!table) {



    throw new Error(

      'Struktur sheet Kontrak tidak ditemukan.'

    );



  }



  const result =

    {};



  table.rows.forEach(

    function(row) {



      const id =

        dj39RemString_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Tenant_ID'

            ]

          )

        );



      const status =

        dj39RemString_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Status_Kontrak'

            ]

          )

        ).toUpperCase();



      if (

        !id ||

        (

          status &&

          status !==

          'AKTIF'

        )

      ) {



        return;



      }



      result[id] = {



        room:

          dj39RemString_(

            dj39RemValue_(

              row,

              table.headers,

              [

                'No_Kamar'

              ]

            )

          ),



        rent:

          dj39RemNumber_(

            dj39RemValue_(

              row,

              table.headers,

              [

                'Harga_Sewa'

              ]

            )

          ),



        status:

          status



      };



    }

  );



  return result;



}





/* ============================================================

 * READ PAYMENTS

 * ============================================================

 */



function dj39RemReadPayments_(

  ss

) {



  const sh =

    ss.getSheetByName(

      DJ39_EMAIL_REMINDER.PAYMENT_SHEET

    );



  const table =

    dj39RemReadTable_(

      sh

    );



  if (!table) {



    throw new Error(

      'Struktur sheet Pembayaran tidak ditemukan.'

    );



  }



  return table;



}





/* ============================================================

 * FIND PAYMENT

 * ============================================================

 */



function dj39RemFindPayment_(

  table,

  tenantId,

  year,

  month

) {



  if (!table) {



    return null;



  }



  for (

    let i = 0;

    i < table.rows.length;

    i++

  ) {



    const row =

      table.rows[i];



    const rowTenantId =

      dj39RemString_(

        dj39RemValue_(

          row,

          table.headers,

          [

            'Tenant_ID'

          ]

        )

      );



    if (

      rowTenantId !==

      tenantId

    ) {



      continue;



    }



    const period =

      dj39RemValue_(

        row,

        table.headers,

        [

          'Periode_Pembayaran',

          'Periode'

        ]

      );



    if (

      !dj39RemPeriodMatches_(

        period,

        year,

        month

      )

    ) {



      continue;



    }



    return {



      index:

        i,



      paymentId:

        dj39RemString_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Payment_ID',

              'Pembayaran_ID'

            ]

          )

        ),



      status:

        dj39RemString_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Status_Pembayaran'

            ]

          )

        ).toUpperCase(),



      verification:

        dj39RemString_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Status_Verifikasi'

            ]

          )

        ).toUpperCase(),



      period:

        dj39RemString_(

          period

        ),



      room:

        dj39RemString_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'No_Kamar'

            ]

          )

        ),



      rent:

        dj39RemNumber_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Nominal_Sewa',

              'Tarif_Kamar'

            ]

          )

        ),



      paid:

        dj39RemNumber_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Nominal_Dibayar'

            ]

          )

        ),



      fine:

        dj39RemNumber_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Denda',

              'Denda_Terhitung'

            ]

          )

        ),



      total:

        dj39RemNumber_(

          dj39RemValue_(

            row,

            table.headers,

            [

              'Total_Tagihan'

            ]

          )

        )



    };



  }



  return null;



}





/* ============================================================

 * PAYMENT FILTER

 * ============================================================

 */



function dj39RemCanSendPaymentReminder_(

  payment,

  campaign

) {



  if (!payment) {



    return {



      ok:

        false,



      reason:

        'Record pembayaran periode tersebut belum ditemukan.'



    };



  }



  if (

    payment.status ===

    'LUNAS'

  ) {



    return {



      ok:

        false,



      reason:

        'Pembayaran sudah LUNAS.'



    };



  }



  if (

    payment.verification ===

    'MENUNGGU VERIFIKASI'

  ) {



    return {



      ok:

        false,



      reason:

        'Pembayaran masih menunggu verifikasi.'



    };



  }



  if (

    campaign ===

    'REMINDER_1'

  ) {



    return {



      ok:

        true,



      reason:

        ''



    };



  }



  const allowed = [



    'BELUM BAYAR',

    'KURANG BAYAR',

    'TERLAMBAT',

    'DITOLAK'



  ];



  if (

    allowed.includes(

      payment.status

    )

  ) {



    return {



      ok:

        true,



      reason:

        ''



    };



  }



  return {



    ok:

      false,



    reason:

      'Status pembayaran tidak termasuk target reminder: ' +

      payment.status



  };



}





/* ============================================================

 * MONEY

 * ============================================================

 */



function dj39RemMoney_(

  value

) {



  return (

    'Rp' +

    Number(

      value || 0

    ).toLocaleString(

      'id-ID'

    )

  );



}





/* ============================================================

 * TEMPLATE DAY 28

 * ============================================================

 */



function dj39RemBuildDay28Body_(

  tenant,

  contract,

  periodLabel

) {



  return (



    'Halo ' +

    tenant.name +

    ',\n\n' +



    'Ini adalah pengingat pembayaran DJ Family Kost untuk periode ' +

    periodLabel +

    ' kamar ' +

    tenant.room +

    '.\n\n' +



    'Tagihan sewa bulanan: ' +

    dj39RemMoney_(

      contract.rent

    ) +

    '.\n\n' +



    'Jatuh tempo pembayaran adalah tanggal 1.\n\n' +



    'Mohon menyiapkan pembayaran tepat waktu.\n\n' +



    'Terima kasih.\n' +



    'DJ Family Kost'



  );



}





/* ============================================================

 * TEMPLATE DAY 1

 * ============================================================

 */



function dj39RemBuildDay1Body_(

  tenant,

  payment

) {



  return (



    'Halo ' +

    tenant.name +

    ',\n\n' +



    'Hari ini adalah tanggal jatuh tempo pembayaran DJ Family Kost untuk periode ' +

    payment.period +

    ' kamar ' +

    payment.room +

    '.\n\n' +



    'Tagihan: ' +

    dj39RemMoney_(

      payment.total

    ) +

    '.\n\n' +



    'Mohon melakukan pembayaran tepat waktu.\n\n' +



    'Terima kasih.\n' +



    'DJ Family Kost'



  );



}





/* ============================================================

 * TEMPLATE DAY 3

 * ============================================================

 */



function dj39RemBuildDay3Body_(

  tenant,

  payment

) {



  const remaining =

    Math.max(

      payment.total -

      payment.paid,

      0

    );



  return (



    'Halo ' +

    tenant.name +

    ',\n\n' +



    'Pembayaran DJ Family Kost untuk periode ' +

    payment.period +

    ' kamar ' +

    payment.room +

    ' belum kami terima secara penuh.\n\n' +



    'Tagihan sewa: ' +

    dj39RemMoney_(

      payment.rent

    ) +

    '\n' +



    'Denda: ' +

    dj39RemMoney_(

      payment.fine

    ) +

    '\n' +



    'Total tagihan: ' +

    dj39RemMoney_(

      payment.total

    ) +

    '\n' +



    'Sudah dibayar: ' +

    dj39RemMoney_(

      payment.paid

    ) +

    '\n' +



    'Sisa yang perlu dibayar: ' +

    dj39RemMoney_(

      remaining

    ) +

    '\n\n' +



    (

      payment.fine > 0



        ? (

            'Denda yang berlaku: ' +

            dj39RemMoney_(

              payment.fine

            ) +

            '.\n\n'

          )



        : ''

    ) +



    'Status pembayaran: TERLAMBAT.\n\n' +



    'Mohon segera menyelesaikan pembayaran.\n\n' +



    'Terima kasih.\n' +



    'DJ Family Kost'



  );



}





/* ============================================================

 * TEMPLATE DAY 5

 * ============================================================

 */



function dj39RemBuildDay5Body_(

  tenant,

  payment

) {



  const remaining =

    Math.max(

      payment.total -

      payment.paid,

      0

    );



  return (



    'Halo ' +

    tenant.name +

    ',\n\n' +



    'Ini adalah pengingat terakhir pembayaran DJ Family Kost untuk periode ' +

    payment.period +

    ' kamar ' +

    payment.room +

    '.\n\n' +



    'Tagihan sewa: ' +

    dj39RemMoney_(

      payment.rent

    ) +

    '\n' +



    'Denda yang berlaku: ' +

    dj39RemMoney_(

      payment.fine

    ) +

    '\n' +



    'Total tagihan: ' +

    dj39RemMoney_(

      payment.total

    ) +

    '\n' +



    'Sudah dibayar: ' +

    dj39RemMoney_(

      payment.paid

    ) +

    '\n' +



    'Sisa yang perlu dibayar: ' +

    dj39RemMoney_(

      remaining

    ) +

    '\n\n' +



    'Mohon segera menyelesaikan pembayaran.\n\n' +



    'Terima kasih.\n' +



    'DJ Family Kost'



  );



}





/* ============================================================

 * ANTI DUPLICATE KEY

 * ============================================================

 */



function dj39RemSentKey_(

  campaign,

  tenantId,

  periodKey

) {



  return (



    'DJ39_EMAIL_REMINDER_SENT|' +

    campaign +

    '|' +

    tenantId +

    '|' +

    periodKey



  );



}





/* ============================================================

 * RUN LOG

 * ============================================================

 */



function dj39RemWriteRunLog_(

  data

) {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();



  let sh =

    ss.getSheetByName(

      DJ39_EMAIL_REMINDER.RUN_LOG_SHEET

    );



  if (!sh) {



    setupEmailPaymentReminderDJ39();



    sh =

      ss.getSheetByName(

        DJ39_EMAIL_REMINDER.RUN_LOG_SHEET

      );



  }



  sh.appendRow([



    new Date(),



    data.campaign || '',



    data.period || '',



    data.mode ||



    (

      data.result ===

      'DRY_RUN'



        ? 'DRY_RUN'



        : DJ39_EMAIL_REMINDER.MODE

    ),



    data.tenantId || '',



    data.name || '',



    data.room || '',



    data.email || '',



    data.paymentStatus || '',



    Number(

      data.fine || 0

    ),



    Number(

      data.total || 0

    ),



    Number(

      data.remaining || 0

    ),



    data.result || '',



    data.note || ''



  ]);



}





/* ============================================================

 * LIVE EMAIL SENDER

 * ============================================================

 *

 * Menggunakan Email Notification Engine pusat:

 *

 *   dj39EmailSend_()

 *

 * Property anti-duplikat hanya disimpan setelah email

 * benar-benar berhasil dikirim.

 *

 * ============================================================

 */



function dj39RemSendLiveOnce_(

  tenant,

  campaign,

  periodKey,

  subject,

  body

) {



  const tenantId =

    dj39RemString_(

      tenant &&

      tenant.tenantId

    );



  const cleanCampaign =

    dj39RemString_(

      campaign

    );



  const cleanPeriod =

    dj39RemString_(

      periodKey

    );



  if (!tenantId) {



    return {



      ok:

        false,



      status:

        'GAGAL',



      error:

        'Tenant ID kosong.'



    };



  }



  if (!cleanCampaign) {



    return {



      ok:

        false,



      status:

        'GAGAL',



      error:

        'Campaign kosong.'



    };



  }



  if (!cleanPeriod) {



    return {



      ok:

        false,



      status:

        'GAGAL',



      error:

        'Period key kosong.'



    };



  }



  if (!tenant.email) {



    return {



      ok:

        false,



      status:

        'GAGAL',



      error:

        'Email tenant kosong.'



    };



  }



  if (!subject) {



    return {



      ok:

        false,



      status:

        'GAGAL',



      error:

        'Subjek email kosong.'



    };



  }



  if (!body) {



    return {



      ok:

        false,



      status:

        'GAGAL',



      error:

        'Isi email kosong.'



    };



  }



  const lock =

    LockService

      .getScriptLock();



  lock.waitLock(

    15000

  );



  try {



    const props =

      PropertiesService

        .getScriptProperties();



    const key =

      dj39RemSentKey_(

        cleanCampaign,

        tenantId,

        cleanPeriod

      );



    if (

      props.getProperty(

        key

      )

    ) {



      return {



        ok:

          true,



        status:

          'SUDAH TERKIRIM',



        duplicate:

          true



      };



    }



    const sendResult =

      dj39EmailSend_({



        tenant:

          tenant,



        type:

          cleanCampaign,



        subject:

          subject,



        body:

          body



      });



    props.setProperty(



      key,



      new Date()

        .toISOString()



    );



    return {



      ok:

        true,



      status:

        'TERKIRIM',



      duplicate:

        false,



      notificationId:

        (

          sendResult &&

          sendResult.notificationId

        ) || ''



    };



  } catch (err) {



    return {



      ok:

        false,



      status:

        'GAGAL',



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

 * DAY 28

 * ============================================================

 */



function dj39RemRunDay28_(

  runDate,

  modeOverride

) {



  const mode =

    modeOverride ||

    DJ39_EMAIL_REMINDER.MODE;



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();



  const tenants =

    dj39RemReadTenants_(

      ss

    );



  const contracts =

    dj39RemReadContracts_(

      ss

    );



  const nextMonth =

    new Date(



      runDate.getFullYear(),



      runDate.getMonth() + 1,



      1



    );



  const year =

    nextMonth.getFullYear();



  const month =

    nextMonth.getMonth() + 1;



  const periodKey =

    year +

    '-' +

    String(

      month

    ).padStart(

      2,

      '0'

    );



  const periodLabel =

    dj39RemPeriodLabel_(

      year,

      month

    );



  let candidates =

    0;



  let skipped =

    0;



  tenants.forEach(

    function(tenant) {



      const contract =

        contracts[

          tenant.tenantId

        ];



      if (

        !contract

      ) {



        skipped++;



        dj39RemWriteRunLog_({



          campaign:

            'REMINDER_28',



          period:

            periodLabel,



          tenantId:

            tenant.tenantId,



          name:

            tenant.name,



          room:

            tenant.room,



          email:

            tenant.email,



          result:

            'SKIP',



          note:

            'Kontrak aktif tidak ditemukan.'



        });



        return;



      }



      if (

        contract.rent <=

        0

      ) {



        skipped++;



        dj39RemWriteRunLog_({



          campaign:

            'REMINDER_28',



          period:

            periodLabel,



          tenantId:

            tenant.tenantId,



          name:

            tenant.name,



          room:

            tenant.room,



          email:

            tenant.email,



          result:

            'SKIP',



          note:

            'Harga sewa kontrak tidak tersedia.'



        });



        return;



      }



      if (

        !tenant.email

      ) {



        skipped++;



        dj39RemWriteRunLog_({



          campaign:

            'REMINDER_28',



          period:

            periodLabel,



          tenantId:

            tenant.tenantId,



          name:

            tenant.name,



          room:

            tenant.room,



          email:

            '',



          result:

            'SKIP',



          note:

            'Email tenant kosong.'



        });



        return;



      }



      candidates++;



      const key =

        dj39RemSentKey_(

          'REMINDER_28',

          tenant.tenantId,

          periodKey

        );



      if (

        PropertiesService

          .getScriptProperties()

          .getProperty(

            key

          )

      ) {



        dj39RemWriteRunLog_({



          campaign:

            'REMINDER_28',



          period:

            periodLabel,



          tenantId:

            tenant.tenantId,



          name:

            tenant.name,



          room:

            tenant.room,



          email:

            tenant.email,



          result:

            'SKIP',



          note:

            'Reminder periode tersebut sudah pernah dikirim.'



        });



        return;



      }



      const body =

        dj39RemBuildDay28Body_(

          tenant,

          contract,

          periodLabel

        );



      if (

        mode ===

        'DRY_RUN'

      ) {



        dj39RemWriteRunLog_({



          mode:

            'DRY_RUN',



          campaign:

            'REMINDER_28',



          period:

            periodLabel,



          tenantId:

            tenant.tenantId,



          name:

            tenant.name,



          room:

            tenant.room,



          email:

            tenant.email,



          result:

            'DRY_RUN',



          note:

            'Tidak mengirim email. Preview:\n' +

            body



        });



        return;



      }



      const send =

        dj39RemSendLiveOnce_(



          tenant,



          'REMINDER_28',



          periodKey,



          'Pengingat Pembayaran DJ Family Kost - ' +

          periodLabel +

          ' - Kamar ' +

          tenant.room,



          body



        );



      dj39RemWriteRunLog_({



        campaign:

          'REMINDER_28',



        period:

          periodLabel,



        tenantId:

          tenant.tenantId,



        name:

          tenant.name,



        room:

          tenant.room,



        email:

          tenant.email,



        result:

          send.status,



        note:

          send.error ||



          (

            send.status ===

            'TERKIRIM'



              ? 'Email berhasil dikirim melalui Email Notification Engine.'



              : (

                  send.status ===

                  'SUDAH TERKIRIM'



                    ? 'Email sebelumnya sudah pernah dikirim.'



                    : ''

                )

          )



      });



    }

  );



  return {



    campaign:

      'REMINDER_28',



    period:

      periodLabel,



    candidates:

      candidates,



    skipped:

      skipped



  };



}





/* ============================================================

 * DAYS 1 / 3 / 5

 * ============================================================

 */



function dj39RemRunPaymentDay_(

  runDate,

  campaign,

  modeOverride

) {



  const mode =

    modeOverride ||

    DJ39_EMAIL_REMINDER.MODE;



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();



  /*

   * generateMonthlyPaymentsDJ39()

   * hanya dijalankan pada mode LIVE.

   *

   * Preview tidak mengubah database.

   */

  if (

    typeof generateMonthlyPaymentsDJ39 ===

    'function' &&



    mode !==

    'DRY_RUN'

  ) {



    try {



      generateMonthlyPaymentsDJ39();



    } catch (err) {



      Logger.log(



        'generateMonthlyPaymentsDJ39 gagal: ' +



        String(

          err &&

          err.message

            ? err.message

            : err

        )



      );



    }



  }



  const tenants =

    dj39RemReadTenants_(

      ss

    );



  const paymentTable =

    dj39RemReadPayments_(

      ss

    );



  const year =

    runDate.getFullYear();



  const month =

    runDate.getMonth() + 1;



  const periodKey =

    year +

    '-' +

    String(

      month

    ).padStart(

      2,

      '0'

    );



  const periodLabel =

    dj39RemPeriodLabel_(

      year,

      month

    );



  let candidates =

    0;



  let skipped =

    0;



  tenants.forEach(

    function(tenant) {



      const payment =

        dj39RemFindPayment_(

          paymentTable,

          tenant.tenantId,

          year,

          month

        );



      if (

        !payment

      ) {



        skipped++;



        dj39RemWriteRunLog_({



          campaign:

            campaign,



          period:

            periodLabel,



          tenantId:

            tenant.tenantId,



          name:

            tenant.name,



          room:

            tenant.room,



          email:

            tenant.email,



          result:

            'SKIP',



          note:

            'Tagihan periode berjalan tidak ditemukan.'



        });



        return;



      }



      const filter =

        dj39RemCanSendPaymentReminder_(

          payment,

          campaign

        );



      if (

        !filter.ok

      ) {



        skipped++;



        dj39RemWriteRunLog_({



          campaign:

            campaign,



          period:

            periodLabel,



          tenantId:

            tenant.tenantId,



          name:

            tenant.name,



          room:

            tenant.room,



          email:

            tenant.email,



          paymentStatus:

            payment.status,



          fine:

            payment.fine,



          total:

            payment.total,



          remaining:

            Math.max(

              payment.total -

              payment.paid,

              0

            ),



          result:

            'SKIP',



          note:

            filter.reason



        });



        return;



      }



      if (

        !tenant.email

      ) {



        skipped++;



        dj39RemWriteRunLog_({



          campaign:

            campaign,



          period:

            periodLabel,



          tenantId:

            tenant.tenantId,



          name:

            tenant.name,



          room:

            tenant.room,



          email:

            '',



          paymentStatus:

            payment.status,



          fine:

            payment.fine,



          total:

            payment.total,



          remaining:

            Math.max(

              payment.total -

              payment.paid,

              0

            ),



          result:

            'SKIP',



          note:

            'Email tenant kosong.'



        });



        return;



      }



      candidates++;



      const key =

        dj39RemSentKey_(

          campaign,

          tenant.tenantId,

          periodKey

        );



      if (

        PropertiesService

          .getScriptProperties()

          .getProperty(

            key

          )

      ) {



        dj39RemWriteRunLog_({



          campaign:

            campaign,



          period:

            periodLabel,



          tenantId:

            tenant.tenantId,



          name:

            tenant.name,



          room:

            tenant.room,



          email:

            tenant.email,



          paymentStatus:

            payment.status,



          fine:

            payment.fine,



          total:

            payment.total,



          remaining:

            Math.max(

              payment.total -

              payment.paid,

              0

            ),



          result:

            'SKIP',



          note:

            'Reminder periode tersebut sudah pernah dikirim.'



        });



        return;



      }



      let body =

        '';



      if (

        campaign ===

        'REMINDER_1'

      ) {



        body =

          dj39RemBuildDay1Body_(

            tenant,

            payment

          );



      } else if (

        campaign ===

        'REMINDER_3'

      ) {



        body =

          dj39RemBuildDay3Body_(

            tenant,

            payment

          );



      } else if (

        campaign ===

        'REMINDER_5'

      ) {



        body =

          dj39RemBuildDay5Body_(

            tenant,

            payment

          );



      }



      if (

        mode ===

        'DRY_RUN'

      ) {



        dj39RemWriteRunLog_({



          mode:

            'DRY_RUN',



          campaign:

            campaign,



          period:

            periodLabel,



          tenantId:

            tenant.tenantId,



          name:

            tenant.name,



          room:

            tenant.room,



          email:

            tenant.email,



          paymentStatus:

            payment.status,



          fine:

            payment.fine,



          total:

            payment.total,



          remaining:

            Math.max(

              payment.total -

              payment.paid,

              0

            ),



          result:

            'DRY_RUN',



          note:

            'Tidak mengirim email. Preview:\n' +

            body



        });



        return;



      }



      let subject =

        'Pengingat Pembayaran DJ Family Kost';



      if (

        campaign ===

        'REMINDER_1'

      ) {



        subject =

          'Jatuh Tempo Pembayaran DJ Family Kost - Kamar ' +

          tenant.room;



      } else if (

        campaign ===

        'REMINDER_3'

      ) {



        subject =

          'Pembayaran Terlambat - DJ Family Kost - Kamar ' +

          tenant.room;



      } else if (

        campaign ===

        'REMINDER_5'

      ) {



        subject =

          'Pengingat Terakhir Pembayaran - DJ Family Kost - Kamar ' +

          tenant.room;



      }



      const send =

        dj39RemSendLiveOnce_(



          tenant,



          campaign,



          periodKey,



          subject,



          body



        );



      dj39RemWriteRunLog_({



        campaign:

          campaign,



        period:

          periodLabel,



        tenantId:

          tenant.tenantId,



        name:

          tenant.name,



        room:

          tenant.room,



        email:

          tenant.email,



        paymentStatus:

          payment.status,



        fine:

          payment.fine,



        total:

          payment.total,



        remaining:

          Math.max(

            payment.total -

            payment.paid,

            0

          ),



        result:

          send.status,



        note:

          send.error ||



          (

            send.status ===

            'TERKIRIM'



              ? 'Email berhasil dikirim melalui Email Notification Engine.'



              : (

                  send.status ===

                  'SUDAH TERKIRIM'



                    ? 'Email sebelumnya sudah pernah dikirim.'



                    : ''

                )

          )



      });



    }

  );



  return {



    campaign:

      campaign,



    period:

      periodLabel,



    candidates:

      candidates,



    skipped:

      skipped



  };



}





/* ============================================================

 * MAIN ENGINE

 * ============================================================

 */



function runEmailPaymentReminderDJ39() {



  return dj39RemRunByDate_(

    new Date()

  );



}





/* ============================================================

 * ROUTER BY DATE

 * ============================================================

 */



function dj39RemRunByDate_(

  runDate,

  modeOverride

) {



  const day =

    runDate.getDate();



  if (

    day ===

    DJ39_EMAIL_REMINDER.REMINDER_DAY_28

  ) {



    return dj39RemRunDay28_(

      runDate,

      modeOverride

    );



  }



  if (

    day ===

    DJ39_EMAIL_REMINDER.REMINDER_DAY_1

  ) {



    return dj39RemRunPaymentDay_(

      runDate,

      'REMINDER_1',

      modeOverride

    );



  }



  if (

    day ===

    DJ39_EMAIL_REMINDER.REMINDER_DAY_3

  ) {



    return dj39RemRunPaymentDay_(

      runDate,

      'REMINDER_3',

      modeOverride

    );



  }



  if (

    day ===

    DJ39_EMAIL_REMINDER.REMINDER_DAY_5

  ) {



    return dj39RemRunPaymentDay_(

      runDate,

      'REMINDER_5',

      modeOverride

    );



  }



  Logger.log(

    'Hari ini bukan tanggal reminder.'

  );



  return {



    ok:

      true,



    campaign:

      'NONE',



    message:

      'Hari ini bukan tanggal reminder.'



  };



}





/* ============================================================

 * PREVIEW

 * ============================================================

 *

 * Preview SELALU menggunakan DRY_RUN.

 *

 * ============================================================

 */



function previewEmailPaymentReminderDJ39() {



  const ui =

    SpreadsheetApp.getUi();



  const response =

    ui.prompt(



      'PREVIEW EMAIL REMINDER DJ FAMILY KOST',



      'Masukkan tanggal simulasi dengan format YYYY-MM-DD:',



      ui.ButtonSet.OK_CANCEL



    );



  if (

    response.getSelectedButton() !==

    ui.Button.OK

  ) {



    return;



  }



  const input =

    dj39RemString_(

      response.getResponseText()

    );



  if (

    !/^\d{4}-\d{2}-\d{2}$/.test(

      input

    )

  ) {



    throw new Error(

      'Format tanggal harus YYYY-MM-DD.'

    );



  }



  const parts =

    input.split(

      '-'

    );



  const year =

    Number(

      parts[0]

    );



  const month =

    Number(

      parts[1]

    );



  const day =

    Number(

      parts[2]

    );



  const date =

    new Date(

      year,

      month - 1,

      day

    );



  if (

    isNaN(

      date.getTime()

    ) ||



    date.getFullYear() !==

    year ||



    date.getMonth() + 1 !==

    month ||



    date.getDate() !==

    day

  ) {



    throw new Error(

      'Tanggal simulasi tidak valid.'

    );



  }



  const result =

    dj39RemRunByDate_(

      date,

      'DRY_RUN'

    );



  ui.alert(



    'PREVIEW SELESAI\n\n' +



    'Tanggal: ' +

    input +

    '\n' +



    'Campaign: ' +

    (

      result.campaign ||

      'NONE'

    ) +

    '\n' +



    'Periode: ' +

    (

      result.period ||

      '-'

    ) +

    '\n\n' +



    'Mode: DRY_RUN\n' +



    'Tidak ada email yang dikirim.'



  );



  return result;



}





/* ============================================================

 * BASIC AUDIT

 * ============================================================

 */



function auditEmailPaymentReminderDJ39() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();



  const result = {



    ok:

      true,



    mode:

      DJ39_EMAIL_REMINDER.MODE,



    checks:

      []



  };



  [



    DJ39_EMAIL_REMINDER.TENANT_SHEET,



    DJ39_EMAIL_REMINDER.CONTRACT_SHEET,



    DJ39_EMAIL_REMINDER.PAYMENT_SHEET



  ].forEach(



    function(name) {



      result.checks.push({



        sheet:

          name,



        status:

          ss.getSheetByName(

            name

          )



            ? 'OK'



            : 'GAGAL'



      });



    }



  );



  setupEmailPaymentReminderDJ39();



  result.checks.push({



    sheet:

      DJ39_EMAIL_REMINDER.RUN_LOG_SHEET,



    status:

      ss.getSheetByName(

        DJ39_EMAIL_REMINDER.RUN_LOG_SHEET

      )



        ? 'OK'



        : 'GAGAL'



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

 * DAILY TRIGGER

 * ============================================================

 *

 * Hanya trigger untuk:

 *

 *   runEmailPaymentReminderDJ39

 *

 * yang disentuh.

 *

 * Trigger lain TIDAK disentuh.

 *

 * ============================================================

 */



function setupEmailPaymentReminderTriggerDJ39() {



  const handler =

    'runEmailPaymentReminderDJ39';



  ScriptApp

    .getProjectTriggers()

    .forEach(



      function(trigger) {



        if (

          trigger.getHandlerFunction() ===

          handler

        ) {



          ScriptApp.deleteTrigger(

            trigger

          );



        }



      }



    );



  ScriptApp

    .newTrigger(

      handler

    )

    .timeBased()

    .everyDays(

      1

    )

    .atHour(

      8

    )

    .create();



  Logger.log(

    'Trigger Email Payment Reminder DJ39 aktif.'

  );



  return {



    ok:

      true,



    function:

      handler,



    schedule:

      'DAILY \~ 08:00',



    mode:

      DJ39_EMAIL_REMINDER.MODE



  };



}





/* ============================================================

 * FINAL LIVE AUDIT

 * ============================================================

 */



function auditEmailPaymentReminderLiveDJ39() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();



  if (!ss) {



    throw new Error(

      'Spreadsheet DJ Family Kost tidak ditemukan.'

    );



  }



  const checks =

    [];



  checks.push({



    item:

      'Payment Reminder Mode',



    status:

      DJ39_EMAIL_REMINDER.MODE ===

      'LIVE'



        ? 'OK'



        : 'GAGAL',



    value:

      DJ39_EMAIL_REMINDER.MODE



  });



  checks.push({



    item:

      'Email Notification Engine',



    status:

      typeof dj39EmailSend_ ===

      'function'



        ? 'OK'



        : 'GAGAL'



  });



  [



    DJ39_EMAIL_REMINDER.TENANT_SHEET,



    DJ39_EMAIL_REMINDER.CONTRACT_SHEET,



    DJ39_EMAIL_REMINDER.PAYMENT_SHEET,



    DJ39_EMAIL_REMINDER.RUN_LOG_SHEET



  ].forEach(



    function(name) {



      checks.push({



        item:

          name,



        status:

          ss.getSheetByName(

            name

          )



            ? 'OK'



            : 'GAGAL'



      });



    }



  );



  const triggerCount =

    ScriptApp

      .getProjectTriggers()

      .filter(



        function(trigger) {



          return (



            trigger.getHandlerFunction() ===

            'runEmailPaymentReminderDJ39'



          );



        }



      )

      .length;



  checks.push({



    item:

      'Daily Reminder Trigger',



    status:



      triggerCount ===

      1



        ? 'OK'



        : (

            triggerCount ===

            0



              ? 'GAGAL'



              : 'WARNING'

          ),



    count:

      triggerCount



  });



  const log =

    ss.getSheetByName(

      DJ39_EMAIL_REMINDER.RUN_LOG_SHEET

    );



  const recentRuns =

    [];



  if (

    log &&

    log.getLastRow() > 1

  ) {



    const startRow =

      Math.max(

        2,

        log.getLastRow() - 9

      );



    const count =

      Math.min(

        10,

        log.getLastRow() - 1

      );



    const values =

      log

        .getRange(

          startRow,

          1,

          count,

          Math.max(

            log.getLastColumn(),

            14

          )

        )

        .getValues();



    values.forEach(



      function(row) {



        recentRuns.push({



          timestamp:

            String(

              row[0] || ''

            ),



          campaign:

            String(

              row[1] || ''

            ),



          period:

            String(

              row[2] || ''

            ),



          mode:

            String(

              row[3] || ''

            ),



          tenantId:

            String(

              row[4] || ''

            ),



          email:

            String(

              row[7] || ''

            ),



          result:

            String(

              row[12] || ''

            ),



          note:

            String(

              row[13] || ''

            )



        });



      }



    );



  }



  const result = {



    ok:

      checks.every(



        function(check) {



          return (

            check.status ===

            'OK'

          );



        }



      ),



    mode:

      DJ39_EMAIL_REMINDER.MODE,



    checks:

      checks,



    recentRuns:

      recentRuns



  };



  Logger.log(



    JSON.stringify(

      result,

      null,

      2

    )



  );



  return result;



}