/**

 * ============================================================

 * DJ FAMILY KOST

 * LAUNDRY + MASTER HISTORY ENGINE V1

 * ============================================================

 *

 * Fungsi:

 *

 * TENANT

 * - submitLaundryOrder

 *

 * MASTER

 * - masterLaundry

 * - masterCompleteLaundry

 * - masterHistory

 *

 * Sheet baru:

 * - Laundry

 *

 * History:

 * - menggunakan System_Log yang sudah ada

 * - tidak membuat sheet History baru

 *

 * Status Laundry:

 * - TERKIRIM

 * - SELESAI

 *

 * Tidak menghapus atau mengubah data lama.

 * ============================================================

 */





/* ============================================================

 * CONFIG

 * ============================================================

 */



const DJ_LAUNDRY_HISTORY_V1_ = {



  SHEET:

    'Laundry',



  HEADERS: [



    'Laundry_ID',



    'Tenant_ID',



    'Nama_Tenant',



    'No_Kamar',



    'Layanan',



    'Harga_Per_KG',



    'Lokasi_Pickup',



    'Catatan',



    'Status',



    'Dibuat_At',



    'Selesai_At',



    'Selesai_Oleh',



    'Last_Sync'



  ],



  SERVICES: [



    'Cuci',



    'Cuci + Setrika',



    'Setrika'



  ]



};





/* ============================================================

 * SETUP

 * ============================================================

 *

 * Jalankan SATU KALI.

 *

 * Tidak menghapus data lama.

 * ============================================================

 */



function setupLaundryHistoryV1() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  let sheet =

    ss.getSheetByName(

      DJ_LAUNDRY_HISTORY_V1_.SHEET

    );





  if (!sheet) {



    sheet =

      ss.insertSheet(

        DJ_LAUNDRY_HISTORY_V1_.SHEET

      );





    sheet

      .getRange(

        1,

        1,

        1,

        DJ_LAUNDRY_HISTORY_V1_.HEADERS.length

      )

      .setValues(

        [

          DJ_LAUNDRY_HISTORY_V1_.HEADERS

        ]

      );





    sheet.setFrozenRows(1);



  } else {



    if (

      sheet.getLastRow() === 0

    ) {



      sheet

        .getRange(

          1,

          1,

          1,

          DJ_LAUNDRY_HISTORY_V1_.HEADERS.length

        )

        .setValues(

          [

            DJ_LAUNDRY_HISTORY_V1_.HEADERS

          ]

        );



      sheet.setFrozenRows(1);



    } else {



      djApiEnsureSheetFieldsV5_(

        sheet,

        DJ_LAUNDRY_HISTORY_V1_.HEADERS

      );



    }



  }





  SpreadsheetApp.flush();





  return {



    ok:

      true,



    sheet:

      DJ_LAUNDRY_HISTORY_V1_.SHEET,



    message:

      'Sheet Laundry siap digunakan.'



  };



}





/* ============================================================

 * GET SHEET

 * ============================================================

 */



function djLaundryGetSheetV1_() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const sheet =

    ss.getSheetByName(

      DJ_LAUNDRY_HISTORY_V1_.SHEET

    );





  if (!sheet) {



    throw new Error(

      'Sheet Laundry belum dibuat. Jalankan setupLaundryHistoryV1() satu kali.'

    );



  }





  return sheet;



}





/* ============================================================

 * DATE FORMAT

 * ============================================================

 */



function djLaundryFormatDateV1_(

  value

) {



  if (!value) {

    return '';

  }





  const date =

    new Date(value);





  if (

    isNaN(

      date.getTime()

    )

  ) {



    return String(

      value

    );



  }





  return Utilities.formatDate(

    date,

    Session.getScriptTimeZone() ||

    'Asia/Jakarta',

    'dd/MM/yyyy HH:mm'

  );



}





/* ============================================================

 * TENANT SUBMIT

 * ============================================================

 */



function djApiSubmitLaundryOrderV1_(

  tenant,

  body

) {



  const lock =

    LockService.getDocumentLock();





  lock.waitLock(

    30000

  );





  try {



    const sheet =

      djLaundryGetSheetV1_();





    const tenantId =

      String(

        tenant &&

        tenant.tenantId ||

        ''

      )

      .trim()

      .toUpperCase();





    const tenantName =

      String(

        tenant &&

        (

          tenant.name ||

          tenant.nama

        ) ||

        ''

      )

      .trim();





    const room =

      String(

        tenant &&

        (

          tenant.room ||

          tenant.kamar

        ) ||

        ''

      )

      .trim();





    if (!tenantId) {



      return {



        ok:

          false,



        error:

          'Tenant ID tidak ditemukan dari session.'



      };



    }





    if (!tenantName) {



      return {



        ok:

          false,



        error:

          'Nama tenant tidak ditemukan dari session.'



      };



    }





    if (!room) {



      return {



        ok:

          false,



        error:

          'Nomor kamar tidak ditemukan dari session.'



      };



    }





    const service =

      String(

        body &&

        body.service ||

        ''

      )

      .trim();





    if (

      DJ_LAUNDRY_HISTORY_V1_

        .SERVICES

        .indexOf(

          service

        ) < 0

    ) {



      return {



        ok:

          false,



        error:

          'Layanan laundry tidak valid.'



      };



    }





    const pickupLocation =

      String(

        body &&

        body.pickupLocation ||

        ''

      )

      .trim()

      .slice(

        0,

        500

      );





    const note =

      String(

        body &&

        body.note ||

        ''

      )

      .trim()

      .slice(

        0,

        1000

      );





    if (!pickupLocation) {



      return {



        ok:

          false,



        error:

          'Lokasi penjemputan wajib diisi.'



      };



    }





    const table =

      djApiReadTableV5_(

        sheet,

        [

          'Laundry_ID'

        ]

      );





    if (!table) {



      return {



        ok:

          false,



        error:

          'Struktur Sheet Laundry tidak dapat dibaca.'



      };



    }





    const laundryId =

      djApiNextPrefixedIdV1_(

        table,

        'Laundry_ID',

        'LDR-'

      );





    const now =

      new Date();





    djApiAppendRowV5_(

      sheet,

      table.headers,

      {



        Laundry_ID:

          laundryId,



        Tenant_ID:

          tenantId,



        Nama_Tenant:

          tenantName,



        No_Kamar:

          room,



        Layanan:

          service,



        Harga_Per_KG:

          '',



        Lokasi_Pickup:

          pickupLocation,



        Catatan:

          note,



        Status:

          'TERKIRIM',



        Dibuat_At:

          now,



        Selesai_At:

          '',



        Selesai_Oleh:

          '',



        Last_Sync:

          now



      }

    );





    SpreadsheetApp.flush();





    return {



      ok:

        true,



      laundryId:

        laundryId,



      status:

        'TERKIRIM',



      message:

        'Pesanan laundry berhasil dikirim ke Master.'



    };



  } finally {



    lock.releaseLock();



  }



}





/* ============================================================

 * MASTER LAUNDRY

 * ============================================================

 */



function djApiMasterLaundryV1_() {



  const sheet =

    djLaundryGetSheetV1_();





  const table =

    djApiReadTableV5_(

      sheet,

      [

        'Laundry_ID'

      ]

    );





  if (!table) {



    return {



      items:

        []



    };



  }





  const items =

    table.rows

      .map(

        function(row) {



          const id =

            String(

              djApiValueV5_(

                row,

                table.headers,

                [

                  'Laundry_ID'

                ]

              ) || ''

            )

            .trim();





          if (!/^LDR-/i.test(id)) {



            return null;



          }





          const status =

            String(

              djApiValueV5_(

                row,

                table.headers,

                [

                  'Status'

                ]

              ) || 'TERKIRIM'

            )

            .trim()

            .toUpperCase();





          if (

            status ===

            'SELESAI'

          ) {



            return null;



          }





          return {



            id:

              id,



            tenantId:

              djApiValueV5_(

                row,

                table.headers,

                [

                  'Tenant_ID'

                ]

              ),



            name:

              djApiValueV5_(

                row,

                table.headers,

                [

                  'Nama_Tenant'

                ]

              ),



            room:

              djApiValueV5_(

                row,

                table.headers,

                [

                  'No_Kamar'

                ]

              ),



            service:

              djApiValueV5_(

                row,

                table.headers,

                [

                  'Layanan'

                ]

              ),



            pricePerKg:

              djApiValueV5_(

                row,

                table.headers,

                [

                  'Harga_Per_KG'

                ]

              ),



            pickupLocation:

              djApiValueV5_(

                row,

                table.headers,

                [

                  'Lokasi_Pickup'

                ]

              ),



            note:

              djApiValueV5_(

                row,

                table.headers,

                [

                  'Catatan'

                ]

              ),



            status:

              status,



            orderedAt:

              djLaundryFormatDateV1_(

                djApiValueV5_(

                  row,

                  table.headers,

                  [

                    'Dibuat_At'

                  ]

                )

              )



          };



        }

      )

      .filter(

        function(item) {



          return !!item;



        }

      )

      .reverse();





  return {



    items:

      items



  };



}





/* ============================================================

 * MASTER COMPLETE LAUNDRY

 * ============================================================

 */



function djApiMasterCompleteLaundryV1_(

  laundryId,

  masterId

) {



  laundryId =

    String(

      laundryId ||

      ''

    )

    .trim();





  masterId =

    String(

      masterId ||

      ''

    )

    .trim()

    .toUpperCase();





  if (!laundryId) {



    return {



      ok:

        false,



      error:

        'Laundry ID wajib diisi.'



    };



  }





  const lock =

    LockService.getDocumentLock();





  lock.waitLock(

    30000

  );





  try {



    const sheet =

      djLaundryGetSheetV1_();





    const table =

      djApiReadTableV5_(

        sheet,

        [

          'Laundry_ID'

        ]

      );





    if (!table) {



      return {



        ok:

          false,



        error:

          'Struktur Sheet Laundry tidak dapat dibaca.'



      };



    }





    const rowNumber =

      djApiFindRowV5_(

        table,

        [

          'Laundry_ID'

        ],

        laundryId

      );





    if (

      rowNumber < 0

    ) {



      return {



        ok:

          false,



        error:

          'Laundry ID tidak ditemukan.'



      };



    }





    const currentStatus =

      String(

        djApiValueV5_(

          table.rows[

            rowNumber -

            table.headerRow -

            1

          ],

          table.headers,

          [

            'Status'

          ]

        ) || ''

      )

      .trim()

      .toUpperCase();





    if (

      currentStatus ===

      'SELESAI'

    ) {



      return {



        ok:

          true,



        laundryId:

          laundryId,



        status:

          'SELESAI',



        message:

          'Order laundry sudah berstatus SELESAI.'



      };



    }





    const now =

      new Date();





    djApiUpdateRowV5_(

      sheet,

      rowNumber,

      table.headers,

      {



        Status:

          'SELESAI',



        Selesai_At:

          now,



        Selesai_Oleh:

          masterId,



        Last_Sync:

          now



      }

    );





    const tenantName =

      djApiValueV5_(

        table.rows[

          rowNumber -

          table.headerRow -

          1

        ],

        table.headers,

        [

          'Nama_Tenant'

        ]

      );





    const room =

      djApiValueV5_(

        table.rows[

          rowNumber -

          table.headerRow -

          1

        ],

        table.headers,

        [

          'No_Kamar'

        ]

      );





    const service =

      djApiValueV5_(

        table.rows[

          rowNumber -

          table.headerRow -

          1

        ],

        table.headers,

        [

          'Layanan'

        ]

      );





    /*

     * Masuk ke System_Log supaya juga terlihat

     * di History Master.

     *

     * Kegagalan log tidak boleh menggagalkan

     * perubahan status Laundry.

     */



    try {



      djApiLogV5_(

        SpreadsheetApp.getActiveSpreadsheet(),

        'LAUNDRY_SELESAI',

        'Order ' +

        laundryId +

        ' selesai. Kamar ' +

        room +

        ' · ' +

        tenantName +

        ' · ' +

        service +

        '. Diselesaikan oleh ' +

        masterId +

        '.'

      );



    } catch (logError) {}





    SpreadsheetApp.flush();





    return {



      ok:

        true,



      laundryId:

        laundryId,



      status:

        'SELESAI',



      message:

        'Order laundry berhasil ditandai SELESAI dan dipindahkan dari daftar aktif ke History.'



    };



  } finally {



    lock.releaseLock();



  }



}





/* ============================================================

 * MASTER HISTORY

 * ============================================================

 *

 * Menggunakan System_Log yang sudah ada.

 *

 * LOGIN / LOGOUT sengaja tidak ditampilkan.

 * ============================================================

 */



function djApiMasterHistoryV1_() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const sheet =

    ss.getSheetByName(

      'System_Log'

    );





  if (!sheet) {



    return {



      items:

        []



    };



  }





  const table =

    djApiReadTableV5_(

      sheet,

      [

        'Timestamp'

      ]

    );





  if (!table) {



    return {



      items:

        []



    };



  }





  const items =

    table.rows

      .map(

        function(row) {



          const type =

            String(

              djApiValueV5_(

                row,

                table.headers,

                [

                  'Type'

                ]

              ) || ''

            )

            .trim();





          const message =

            String(

              djApiValueV5_(

                row,

                table.headers,

                [

                  'Message'

                ]

              ) || ''

            )

            .trim();





          const normalizedType =

            type.toUpperCase();





          /*

           * Login / logout tidak masuk History.

           */



          if (

            normalizedType.indexOf(

              'LOGIN'

            ) >= 0

          ) {



            return null;



          }





          if (

            normalizedType.indexOf(

              'LOGOUT'

            ) >= 0

          ) {



            return null;



          }





          if (

            !type &&

            !message

          ) {



            return null;



          }





          return {



            timestamp:

              djLaundryFormatDateV1_(

                djApiValueV5_(

                  row,

                  table.headers,

                  [

                    'Timestamp'

                  ]

                )

              ),



            type:

              type ||

              'SYSTEM',



            message:

              message ||

              'Aktivitas tercatat.'



          };



        }

      )

      .filter(

        function(item) {



          return !!item;



        }

      )

      .reverse();





  return {



    items:

      items



  };



}