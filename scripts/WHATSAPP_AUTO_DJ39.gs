/**

 * ============================================================

 * DJ FAMILY KOST

 * WHATSAPP_AUTO_DJ39.gs

 * ============================================================

 *

 * MODUL TERPISAH — TIDAK MENGUBAH FILE LAMA

 *

 * TUJUAN:

 * 1. Menyiapkan automation WhatsApp berbasis kalender:

 *

 *    Tanggal 28

 *      -> reminder pra-tagihan untuk tenant aktif

 *

 *    Tanggal 1

 *      -> reminder jatuh tempo untuk tenant aktif

 *

 *    Tanggal 2

 *      -> reminder tenant yang BELUM BAYAR,

 *         KURANG BAYAR, atau DITOLAK

 *         + denda sesuai aturan

 *

 *    Tanggal 5

 *      -> peringatan terakhir untuk tenant yang

 *         masih BELUM BAYAR / KURANG BAYAR / DITOLAK

 *         + denda maksimum sesuai aturan

 *

 * 2. Menyiapkan mode DRY RUN sebelum WhatsApp eksternal

 *    benar-benar tersambung.

 *

 * 3. Menyediakan satu kali TEST BROADCAST ke semua tenant

 *    aktif setelah koneksi WhatsApp eksternal sudah siap.

 *

 * 4. Mencegah pengiriman ganda pada campaign + tenant + periode

 *    dengan log terpisah.

 *

 * CATATAN PENTING:

 * - File ini berdiri sendiri.

 * - Tidak mengganti TENANT_API_V2.gs.

 * - Tidak mengganti MASTER_ENGINE_V2.gs.

 * - Tidak mengganti PAYMENT_ENGINE_DJ39_V2.gs.

 * - Tidak menulis perubahan ke sheet Tenant/Kontrak/Pembayaran

 *   pada versi struktur ini.

 * - Sebelum koneksi WhatsApp eksternal diberikan, MODE harus

 *   tetap DRY_RUN.

 *

 * ============================================================

 */





const WAUTO39 = {



  CONFIG: {



    /*

     * --------------------------------------------------------

     * MODE

     * --------------------------------------------------------

     *

     * DRY_RUN:

     *   hanya membuat preview + log.

     *

     * LIVE:

     *   memanggil connector WhatsApp eksternal.

     *

     * Jangan ubah ke LIVE sebelum data eksternal dan connector

     * benar-benar sudah dipasang.

     */



    MODE:

      'DRY_RUN',





    /*

     * --------------------------------------------------------

     * NAMA SHEET

     * --------------------------------------------------------

     *

     * Hanya dibaca.

     */



    TENANT_SHEET:

      'Tenant',



    CONTRACT_SHEET:

      'Kontrak',



    PAYMENT_SHEET:

      'Pembayaran',



    LOG_SHEET:

      'WhatsApp_Auto_Log_DJ39',





    /*

     * --------------------------------------------------------

     * ATURAN TANGGAL

     * --------------------------------------------------------

     */



    REMINDER_DAY_28:

      28,



    REMINDER_DAY_1:

      1,



    REMINDER_DAY_2:

      2,



    REMINDER_DAY_5:

      5,





    /*

     * --------------------------------------------------------

     * DENDA

     * --------------------------------------------------------

     *

     * Denda dihitung oleh modul WhatsApp sebagai informasi

     * reminder saja.

     *

     * Modul ini TIDAK menulis denda ke Pembayaran.

     *

     * Billing pertama selalu tanpa denda.

     */



    FIRST_BILLING_FINE:

      0,



    FINE_DAY_2:

      25000,



    FINE_DAY_5:

      50000,





    /*

     * --------------------------------------------------------

     * TEST BROADCAST

     * --------------------------------------------------------

     *

     * Harus sengaja diaktifkan.

     *

     * Nilai tetap false agar tidak ada accidental broadcast.

     */



    TEST_BROADCAST_ENABLED:

      false,



    TEST_BROADCAST_LABEL:

      'TEST-ALL-TENANTS-DJ39'





  },





  /*

   * ----------------------------------------------------------

   * STATUS YANG MASUK AUTOMATION

   * ----------------------------------------------------------

   */



  STATUS: {



    LUNAS:

      'LUNAS',



    KURANG_BAYAR:

      'KURANG BAYAR',



    MENUNGGU_VERIFIKASI:

      'MENUNGGU VERIFIKASI',



    BELUM_BAYAR:

      'BELUM BAYAR',



    TERLAMBAT:

      'TERLAMBAT',



    DITOLAK:

      'DITOLAK',



    AKTIF:

      'AKTIF',



    NONAKTIF:

      'NONAKTIF'



  }



};





/* ============================================================

 * 1. DAILY ENTRY POINT

 * ============================================================

 *

 * Pasang satu time-driven trigger ke fungsi ini.

 *

 * Fungsi hanya berjalan pada tanggal:

 * 28, 1, 2, 5

 *

 * ============================================================

 */



function runWhatsAppAutomationDJ39() {



  const day =

    new Date().getDate();





  if (

    day !== WAUTO39.CONFIG.REMINDER_DAY_28 &&

    day !== WAUTO39.CONFIG.REMINDER_DAY_1 &&

    day !== WAUTO39.CONFIG.REMINDER_DAY_2 &&

    day !== WAUTO39.CONFIG.REMINDER_DAY_5

  ) {



    Logger.log(

      'Hari ini bukan hari campaign WhatsApp.'

    );



    return {



      ok:

        true,



      skipped:

        true,



      day:

        day,



      message:

        'Tidak ada campaign WhatsApp untuk hari ini.'



    };



  }





  return runWhatsAppCampaignDJ39_(

    day,

    new Date()

  );



}





/* ============================================================

 * 2. MANUAL PREVIEW / DRY RUN

 * ============================================================

 *

 * Dipakai sekarang untuk memastikan struktur membaca data

 * dengan benar tanpa mengirim WhatsApp.

 * ============================================================

 */



function previewWhatsAppAutomationDJ39() {



  const now =

    new Date();





  const day =

    now\.getDate();





  const supportedDay =

    (

      day ===

      WAUTO39.CONFIG.REMINDER_DAY_28

    ) ||

    (

      day ===

      WAUTO39.CONFIG.REMINDER_DAY_1

    ) ||

    (

      day ===

      WAUTO39.CONFIG.REMINDER_DAY_2

    ) ||

    (

      day ===

      WAUTO39.CONFIG.REMINDER_DAY_5

    );





  const campaignDay =

    supportedDay

      ? day

      : WAUTO39.CONFIG.REMINDER_DAY_1;





  return runWhatsAppCampaignDJ39_(

    campaignDay,

    now,

    true

  );



}





/* ============================================================

 * 3. TEST BROADCAST — SEMUA TENANT AKTIF

 * ============================================================

 *

 * Fungsi ini DISENGAJA dibuat terpisah dari daily automation.

 *

 * Tujuan:

 *   setelah koneksi WhatsApp eksternal lengkap, lakukan

 *   satu kali test ke semua tenant aktif.

 *

 * Guard:

 *   TEST_BROADCAST_ENABLED harus true.

 *

 * Tanpa itu fungsi tidak akan mengirim apa pun.

 * ============================================================

 */



function sendWhatsAppTestBroadcastAllTenantsDJ39() {



  if (

    WAUTO39.CONFIG

      .TEST_BROADCAST_ENABLED !==

    true

  ) {



    throw new Error(

      'Test broadcast belum diaktifkan. Set TEST_BROADCAST_ENABLED = true setelah connector WhatsApp siap.'

    );



  }





  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const tenants =

    waAutoReadTableDJ39_(

      ss,

      WAUTO39.CONFIG.TENANT_SHEET,

      [

        'Tenant_ID'

      ]

    );





  if (!tenants) {



    throw new Error(

      'Sheet Tenant tidak dapat dibaca.'

    );



  }





  const logSheet =

    waAutoGetLogSheetDJ39_(

      ss

    );





  const items =

    [];





  tenants.rows.forEach(

    function(row, index) {



      const tenant =

        waAutoBuildTenantDJ39_(

          row,

          tenants.headers

        );





      if (!tenant.id) {



        return;



      }





      if (

        tenant.status ===

        WAUTO39.STATUS.NONAKTIF

      ) {



        return;



      }





      if (

        !tenant.phone

      ) {



        waAutoLogDJ39_(

          logSheet,

          {

            timestamp:

              new Date(),



            campaign:

              WAUTO39.CONFIG

                .TEST_BROADCAST_LABEL,



            tenantId:

              tenant.id,



            period:

              '',



            status:

              'SKIPPED',



            deliveryStatus:

              'NO_PHONE',



            message:

              'Nomor WhatsApp tenant kosong.'



          }

        );



        return;



      }





      const message =

        waAutoBuildTestBroadcastMessageDJ39_(

          tenant

        );





      const result =

        waAutoSendWhatsAppDJ39_(

          tenant.phone,

          {

            type:

              'TEXT',



            campaign:

              WAUTO39.CONFIG

                .TEST_BROADCAST_LABEL,



            tenantId:

              tenant.id,



            message:

              message,



            templateKey:

              'test_broadcast'



          }

        );





      waAutoLogDJ39_(

        logSheet,

        {

          timestamp:

            new Date(),



          campaign:

            WAUTO39.CONFIG

              .TEST_BROADCAST_LABEL,



          tenantId:

            tenant.id,



          period:

            '',



          status:

            'ACTIVE',



          deliveryStatus:

            result.status,



          message:

            message,



          providerMessageId:

            result.messageId ||

            '',



          error:

            result.error ||

            ''



        }

      );





      items.push({



        tenantId:

          tenant.id,



        name:

          tenant.name,



        phone:

          tenant.phone,



        status:

          result.status,



        message:

          message



      });



    }

  );





  return {



    ok:

      true,



    mode:

      WAUTO39.CONFIG.MODE,



    count:

      items.length,



    items:

      items



  };



}





/* ============================================================

 * 4. INSTALL DAILY TRIGGER

 * ============================================================

 *

 * Hanya mengelola trigger milik file ini.

 *

 * Trigger lain di project TIDAK disentuh.

 *

 * ============================================================

 */



function installWhatsAppAutomationTriggerDJ39() {



  const handler =

    'runWhatsAppAutomationDJ39';





  const triggers =

    ScriptApp.getProjectTriggers();





  triggers.forEach(

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





  ScriptApp.newTrigger(

    handler

  )

  .timeBased()

  .everyDays(

    1

  )

  .atHour(

    9

  )

  .create();





  Logger.log(

    'Trigger WhatsApp Automation DJ39 terpasang. Handler: ' +

    handler

  );



}





/* ============================================================

 * 5. REMOVE DAILY TRIGGER MILIK MODUL INI SAJA

 * ============================================================

 */



function removeWhatsAppAutomationTriggerDJ39() {



  const handler =

    'runWhatsAppAutomationDJ39';





  ScriptApp.getProjectTriggers()

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





  Logger.log(

    'Trigger WhatsApp Automation DJ39 dihapus.'

  );



}





/* ============================================================

 * 6. CAMPAIGN ENGINE

 * ============================================================

 */



function runWhatsAppCampaignDJ39_(

  campaignDay,

  runDate,

  forcePreview

) {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const tenants =

    waAutoReadTableDJ39_(

      ss,

      WAUTO39.CONFIG.TENANT_SHEET,

      [

        'Tenant_ID'

      ]

    );





  const contracts =

    waAutoReadTableDJ39_(

      ss,

      WAUTO39.CONFIG.CONTRACT_SHEET,

      [

        'Tenant_ID'

      ]

    );





  const payments =

    waAutoReadTableDJ39_(

      ss,

      WAUTO39.CONFIG.PAYMENT_SHEET,

      [

        'Tenant_ID'

      ]

    );





  if (!tenants) {



    throw new Error(

      'Sheet Tenant tidak dapat dibaca.'

    );



  }





  if (!contracts) {



    throw new Error(

      'Sheet Kontrak tidak dapat dibaca.'

    );



  }





  const logSheet =

    waAutoGetLogSheetDJ39_(

      ss

    );





  const tenantMap =

    {};





  tenants.rows.forEach(

    function(row) {



      const tenant =

        waAutoBuildTenantDJ39_(

          row,

          tenants.headers

        );





      if (

        !tenant.id

      ) {



        return;



      }





      tenantMap[

        tenant.id

      ] =

        tenant;



    }

  );





  const contractMap =

    waAutoBuildContractMapDJ39_(

      contracts

    );





  const paymentMap =

    payments

      ? waAutoBuildCurrentPaymentMapDJ39_(

          payments

        )

      : {};





  const periodDate =

    waAutoCampaignPeriodDJ39_(

      campaignDay,

      runDate

    );





  const periodKey =

    waAutoPeriodKeyDJ39_(

      periodDate

    );





  const campaign =

    waAutoCampaignNameDJ39_(

      campaignDay

    );





  const candidates =

    [];





  Object.keys(

    tenantMap

  ).forEach(

    function(tenantId) {



      const tenant =

        tenantMap[

          tenantId

        ];





      if (

        tenant.status ===

        WAUTO39.STATUS.NONAKTIF

      ) {



        return;



      }





      const contract =

        contractMap[

          tenantId

        ];





      if (

        !contract ||

        contract.status &&

        contract.status !==

          WAUTO39.STATUS.AKTIF

      ) {



        return;



      }





      if (

        !tenant.phone

      ) {



        waAutoLogDJ39_(

          logSheet,

          {

            timestamp:

              new Date(),



            campaign:

              campaign,



            tenantId:

              tenantId,



            period:

              periodKey,



            status:

              'SKIPPED',



            deliveryStatus:

              'NO_PHONE',



            message:

              'Nomor WhatsApp tenant kosong.'



          }

        );



        return;



      }





      const payment =

        paymentMap[

          tenantId +

          '|' +

          periodKey

        ] ||

        null;





      const state =

        waAutoResolvePaymentStateDJ39_(

          payment,

          contract,

          campaignDay,

          runDate

        );





      /*

       * Tanggal 28:

       * semua tenant aktif yang punya kontrak.

       */



      if (

        campaignDay ===

        WAUTO39.CONFIG.REMINDER_DAY_28

      ) {



        candidates.push(

          waAutoBuildCandidateDJ39_(

            tenant,

            contract,

            payment,

            state,

            campaign,

            periodKey

          )

        );



        return;



      }





      /*

       * Tanggal 1:

       * tenant aktif yang belum LUNAS.

       * Jika pembayaran penuh masih menunggu verifikasi,

       * gunakan pesan waiting verification, bukan penagihan.

       */



      if (

        campaignDay ===

        WAUTO39.CONFIG.REMINDER_DAY_1

      ) {



        if (

          state.status ===

          WAUTO39.STATUS.LUNAS

        ) {



          return;



        }





        candidates.push(

          waAutoBuildCandidateDJ39_(

            tenant,

            contract,

            payment,

            state,

            campaign,

            periodKey

          )

        );



        return;



      }





      /*

       * Tanggal 2 dan 5:

       * hanya yang masih memiliki kewajiban.

       */



      if (

        campaignDay ===

          WAUTO39.CONFIG.REMINDER_DAY_2 ||

        campaignDay ===

          WAUTO39.CONFIG.REMINDER_DAY_5

      ) {



        if (

          state.status ===

            WAUTO39.STATUS.LUNAS ||

          state.status ===

            WAUTO39.STATUS.MENUNGGU_VERIFIKASI

        ) {



          return;



        }





        candidates.push(

          waAutoBuildCandidateDJ39_(

            tenant,

            contract,

            payment,

            state,

            campaign,

            periodKey

          )

        );



      }



    }

  );





  const sent =

    [];





  candidates.forEach(

    function(candidate) {



      const duplicate =

        waAutoHasAlreadySentDJ39_(

          logSheet,

          candidate.campaign,

          candidate.tenantId,

          candidate.period

        );





      if (

        duplicate

      ) {



        sent.push({



          tenantId:

            candidate.tenantId,



          status:

            'SKIPPED_DUPLICATE'



        });



        return;



      }





      const sendResult =

        waAutoSendWhatsAppDJ39_(

          candidate.phone,

          {

            type:

              'CAMPAIGN',



            campaign:

              candidate.campaign,



            tenantId:

              candidate.tenantId,



            period:

              candidate.period,



            status:

              candidate.status,



            total:

              candidate.total,



            paid:

              candidate.paid,



            fine:

              candidate.fine,



            outstanding:

              candidate.outstanding,



            message:

              candidate.message,



            templateKey:

              candidate.templateKey,



            templateParams:

              candidate.templateParams



          },

          forcePreview === true

        );





      waAutoLogDJ39_(

        logSheet,

        {

          timestamp:

            new Date(),



          campaign:

            candidate.campaign,



          tenantId:

            candidate.tenantId,



          period:

            candidate.period,



          status:

            candidate.status,



          deliveryStatus:

            sendResult.status,



          message:

            candidate.message,



          providerMessageId:

            sendResult.messageId ||

            '',



          error:

            sendResult.error ||

            ''



        }

      );





      sent.push({



        tenantId:

          candidate.tenantId,



        name:

          candidate.name,



        period:

          candidate.period,



        status:

          candidate.status,



        total:

          candidate.total,



        paid:

          candidate.paid,



        fine:

          candidate.fine,



        outstanding:

          candidate.outstanding,



        deliveryStatus:

          sendResult.status,



        message:

          candidate.message



      });



    }

  );





  return {



    ok:

      true,



    mode:

      WAUTO39.CONFIG.MODE,



    campaign:

      campaign,



    period:

      periodKey,



    candidates:

      candidates.length,



    processed:

      sent.length,



    items:

      sent



  };



}





/* ============================================================

 * 7. BUILD TENANT

 * ============================================================

 */



function waAutoBuildTenantDJ39_(

  row,

  headers

) {



  return {



    id:

      String(

        waAutoValueDJ39_(

          row,

          headers,

          [

            'Tenant_ID'

          ]

        ) ||

        ''

      )

      .trim()

      .toUpperCase(),



    name:

      String(

        waAutoValueDJ39_(

          row,

          headers,

          [

            'Nama_Lengkap',

            'Nama_Tenant'

          ]

        ) ||

        ''

      )

      .trim(),



    phone:

      waAutoNormalizePhoneDJ39_(

        waAutoValueDJ39_(

          row,

          headers,

          [

            'No_HP',

            'No_Hp',

            'WhatsApp'

          ]

        )

      ),



    room:

      String(

        waAutoValueDJ39_(

          row,

          headers,

          [

            'No_Kamar',

            'Kamar'

          ]

        ) ||

        ''

      )

      .trim(),



    status:

      String(

        waAutoValueDJ39_(

          row,

          headers,

          [

            'Status_Tenant',

            'Status'

          ]

        ) ||

        WAUTO39.STATUS.AKTIF

      )

      .trim()

      .toUpperCase()



  };



}





/* ============================================================

 * 8. BUILD CONTRACT MAP

 * ============================================================

 */



function waAutoBuildContractMapDJ39_(

  table

) {



  const map =

    {};





  table.rows.forEach(

    function(row) {



      const tenantId =

        String(

          waAutoValueDJ39_(

            row,

            table.headers,

            [

              'Tenant_ID'

            ]

          ) ||

          ''

        )

        .trim()

        .toUpperCase();





      if (!tenantId) {



        return;



      }





      const status =

        String(

          waAutoValueDJ39_(

            row,

            table.headers,

            [

              'Status_Kontrak',

              'Status'

            ]

          ) ||

          ''

        )

        .trim()

        .toUpperCase();





      /*

       * Pilih kontrak AKTIF.

       * Jika tidak ada status, tetap boleh digunakan

       * sebagai fallback untuk data test lama.

       */



      const current =

        map[

          tenantId

        ];





      if (

        !current

      ) {



        map[

          tenantId

        ] = {



          id:

            waAutoValueDJ39_(

              row,

              table.headers,

              [

                'Kontrak_ID'

              ]

            ),



          room:

            waAutoValueDJ39_(

              row,

              table.headers,

              [

                'No_Kamar'

              ]

            ),



          rent:

            waAutoNumberDJ39_(

              waAutoValueDJ39_(

                row,

                table.headers,

                [

                  'Harga_Sewa',

                  'Harga_Bulan',

                  'Tarif_Kamar'

                ]

              )

            ),



          deposit:

            waAutoNumberDJ39_(

              waAutoValueDJ39_(

                row,

                table.headers,

                [

                  'Deposit'

                ]

              )

            ),



          startDate:

            waAutoDateDJ39_(

              waAutoValueDJ39_(

                row,

                table.headers,

                [

                  'Tanggal_Mulai'

                ]

              )

            ),



          endDate:

            waAutoDateDJ39_(

              waAutoValueDJ39_(

                row,

                table.headers,

                [

                  'Tanggal_Berakhir'

                ]

              )

            ),



          status:

            status



        };



        return;



      }





      if (

        status ===

        WAUTO39.STATUS.AKTIF

      ) {



        map[

          tenantId

        ] = {



          id:

            waAutoValueDJ39_(

              row,

              table.headers,

              [

                'Kontrak_ID'

              ]

            ),



          room:

            waAutoValueDJ39_(

              row,

              table.headers,

              [

                'No_Kamar'

              ]

            ),



          rent:

            waAutoNumberDJ39_(

              waAutoValueDJ39_(

                row,

                table.headers,

                [

                  'Harga_Sewa',

                  'Harga_Bulan',

                  'Tarif_Kamar'

                ]

              )

            ),



          deposit:

            waAutoNumberDJ39_(

              waAutoValueDJ39_(

                row,

                table.headers,

                [

                  'Deposit'

                ]

              )

            ),



          startDate:

            waAutoDateDJ39_(

              waAutoValueDJ39_(

                row,

                table.headers,

                [

                  'Tanggal_Mulai'

                ]

              )

            ),



          endDate:

            waAutoDateDJ39_(

              waAutoValueDJ39_(

                row,

                table.headers,

                [

                  'Tanggal_Berakhir'

                ]

              )

            ),



          status:

            status



        };



      }



    }

  );





  return map;



}





/* ============================================================

 * 9. BUILD CURRENT PAYMENT MAP

 * ============================================================

 */



function waAutoBuildCurrentPaymentMapDJ39_(

  table

) {



  const grouped =

    {};





  table.rows.forEach(

    function(row, index) {



      const tenantId =

        String(

          waAutoValueDJ39_(

            row,

            table.headers,

            [

              'Tenant_ID'

            ]

          ) ||

          ''

        )

        .trim()

        .toUpperCase();





      if (!tenantId) {



        return;



      }





      const periodDate =

        waAutoDateDJ39_(

          waAutoValueDJ39_(

            row,

            table.headers,

            [

              'Periode',

              'Periode_Pembayaran'

            ]

          )

        );





      if (!periodDate) {



        return;



      }





      const period =

        waAutoPeriodKeyDJ39_(

          periodDate

        );





      const key =

        tenantId +

        '|' +

        period;





      if (

        !grouped[key]

      ) {



        grouped[key] =

          [];



      }





      const verification =

        String(

          waAutoValueDJ39_(

            row,

            table.headers,

            [

              'Status_Verifikasi'

            ]

          ) ||

          ''

        )

        .trim()

        .toUpperCase();





      const activity =

        waAutoDateDJ39_(

          waAutoValueDJ39_(

            row,

            table.headers,

            [

              'Tanggal_Verifikasi',

              'Tanggal_Pembayaran',

              'Tanggal_Bayar',

              'Timestamp_Submit',

              'Last_Sync',

              'Updated_At'

            ]

          )

        ) ||

        new Date(0);





      grouped[key].push({



        row:

          row,



        rowIndex:

          index,



        periodDate:

          periodDate,



        verification:

          verification,



        activity:

          activity,



        totalStored:

          waAutoNumberDJ39_(

            waAutoValueDJ39_(

              row,

              table.headers,

              [

                'Total_Tagihan'

              ]

            )

          ),



        paid:

          waAutoNumberDJ39_(

            waAutoValueDJ39_(

              row,

              table.headers,

              [

                'Nominal_Dibayar'

              ]

            )

          ),



        fineStored:

          waAutoNumberDJ39_(

            waAutoValueDJ39_(

              row,

              table.headers,

              [

                'Denda_Terhitung',

                'Denda'

              ]

            )

          ),



        statusStored:

          String(

            waAutoValueDJ39_(

              row,

              table.headers,

              [

                'Status_Pembayaran'

              ]

            ) ||

            ''

          )

          .trim()

          .toUpperCase(),



        dueDate:

          waAutoDateDJ39_(

            waAutoValueDJ39_(

              row,

              table.headers,

              [

                'Tanggal_Jatuh_Tempo',

                'Jatuh_Tempo'

              ]

            )

          )



      });



    }

  );





  const map =

    {};





  Object.keys(

    grouped

  ).forEach(

    function(key) {



      grouped[key].sort(

        function(a, b) {



          if (

            a.verification ===

              'TERVERIFIKASI' &&

            b.verification !==

              'TERVERIFIKASI'

          ) {



            return -1;



          }





          if (

            a.verification !==

              'TERVERIFIKASI' &&

            b.verification ===

              'TERVERIFIKASI'

          ) {



            return 1;



          }





          const at =

            a.activity.getTime();





          const bt =

            b.activity.getTime();





          if (

            bt !== at

          ) {



            return bt - at;



          }





          return b.rowIndex -

                 a.rowIndex;



        }

      );





      map[key] =

        grouped[key][0];



    }

  );





  return map;



}





/* ============================================================

 * 10. RESOLVE PAYMENT STATE

 * ============================================================

 */



function waAutoResolvePaymentStateDJ39_(

  payment,

  contract,

  campaignDay,

  runDate

) {



  const rent =

    waAutoNumberDJ39_(

      contract &&

      contract.rent

    );





  let paid =

    payment

      ? waAutoNumberDJ39_(

          payment.paid

        )

      : 0;





  let fine =

    payment

      ? waAutoNumberDJ39_(

          payment.fineStored

        )

      : 0;





  let storedTotal =

    payment

      ? waAutoNumberDJ39_(

          payment.totalStored

        )

      : 0;





  const periodDate =

    payment

      ? payment.periodDate

      : waAutoCampaignPeriodDJ39_(

          campaignDay,

          runDate

        );





  const firstBilling =

    waAutoIsFirstBillingDJ39_(

      contract,

      periodDate

    );





  if (

    firstBilling

  ) {



    fine =

      WAUTO39.CONFIG

        .FIRST_BILLING_FINE;



  } else if (

    campaignDay ===

      WAUTO39.CONFIG.REMINDER_DAY_2

  ) {



    fine =

      Math.max(

        fine,

        WAUTO39.CONFIG.FINE_DAY_2

      );



  } else if (

    campaignDay ===

      WAUTO39.CONFIG.REMINDER_DAY_5

  ) {



    fine =

      Math.max(

        fine,

        WAUTO39.CONFIG.FINE_DAY_5

      );



  }





  let total =

    rent +

    fine;





  if (

    total <= 0 &&

    storedTotal > 0

  ) {



    total =

      storedTotal;



  }





  if (

    total < 0

  ) {



    total =

      0;



  }





  let verification =

    payment

      ? payment.verification

      : '';





  let status =

    payment

      ? payment.statusStored

      : '';





  if (

    verification ===

    'DITOLAK'

  ) {



    status =

      WAUTO39.STATUS.DITOLAK;



  } else if (

    verification ===

    'TERVERIFIKASI'

  ) {



    if (

      total > 0 &&

      paid >= total

    ) {



      status =

        WAUTO39.STATUS.LUNAS;



    } else if (

      paid > 0

    ) {



      status =

        WAUTO39.STATUS.KURANG_BAYAR;



    } else {



      status =

        WAUTO39.STATUS.BELUM_BAYAR;



    }



  } else if (

    paid > 0 &&

    total > 0 &&

    paid < total

  ) {



    status =

      WAUTO39.STATUS.KURANG_BAYAR;



  } else if (

    paid >= total &&

    total > 0

  ) {



    status =

      WAUTO39.STATUS.MENUNGGU_VERIFIKASI;



  } else {



    const dueDate =

      payment &&

      payment.dueDate

        ? payment.dueDate

        : waAutoFallbackDueDateDJ39_(

            periodDate

          );





    const nowStart =

      new Date(

        runDate.getFullYear(),

        runDate.getMonth(),

        runDate.getDate()

      );





    const dueStart =

      dueDate

        ? new Date(

            dueDate.getFullYear(),

            dueDate.getMonth(),

            dueDate.getDate()

          )

        : null;





    if (

      dueStart &&

      nowStart.getTime() >

      dueStart.getTime()

    ) {



      status =

        WAUTO39.STATUS.TERLAMBAT;



    } else {



      status =

        WAUTO39.STATUS.BELUM_BAYAR;



    }



  }





  let outstanding =

    total -

    paid;





  if (

    status ===

    WAUTO39.STATUS.DITOLAK

  ) {



    outstanding =

      total;



  }





  if (

    outstanding <

    0

  ) {



    outstanding =

      0;



  }





  if (

    status ===

    WAUTO39.STATUS.LUNAS

  ) {



    outstanding =

      0;



  }





  return {



    status:

      status,



    verification:

      verification,



    total:

      total,



    paid:

      paid,



    fine:

      fine,



    outstanding:

      outstanding,



    firstBilling:

      firstBilling,



    dueDate:

      payment &&

      payment.dueDate

        ? payment.dueDate

        : waAutoFallbackDueDateDJ39_(

            periodDate

          )



  };



}





/* ============================================================

 * 11. BUILD CANDIDATE

 * ============================================================

 */



function waAutoBuildCandidateDJ39_(

  tenant,

  contract,

  payment,

  state,

  campaign,

  period

) {



  const messagePack =

    waAutoBuildMessageDJ39_(

      tenant,

      contract,

      payment,

      state,

      campaign,

      period

    );





  return {



    tenantId:

      tenant.id,



    name:

      tenant.name,



    phone:

      tenant.phone,



    room:

      tenant.room ||

      (

        contract &&

        contract.room

          ? contract.room

          : ''

      ),



    period:

      period,



    campaign:

      campaign,



    status:

      state.status,



    total:

      state.total,



    paid:

      state.paid,



    fine:

      state.fine,



    outstanding:

      state.outstanding,



    message:

      messagePack.message,



    templateKey:

      messagePack.templateKey,



    templateParams:

      messagePack.templateParams



  };



}





/* ============================================================

 * 12. MESSAGE TEMPLATES

 * ============================================================

 */



function waAutoBuildMessageDJ39_(

  tenant,

  contract,

  payment,

  state,

  campaign,

  period

) {



  const nl =

    String.fromCharCode(

      10

    );





  const name =

    tenant.name ||

    'Tenant';





  const room =

    tenant.room ||

    (

      contract &&

      contract.room

        ? contract.room

        : '-'

    );





  const totalText =

    waAutoMoneyDJ39_(

      state.total

    );





  const paidText =

    waAutoMoneyDJ39_(

      state.paid

    );





  const fineText =

    waAutoMoneyDJ39_(

      state.fine

    );





  const outstandingText =

    waAutoMoneyDJ39_(

      state.outstanding

    );





  let message =

    '';





  let templateKey =

    '';





  /*

   * ----------------------------------------------------------

   * TANGGAL 28 — PRE-REMINDER

   * ----------------------------------------------------------

   */



  if (

    campaign ===

    'REMINDER_28'

  ) {



    message =

      'Halo ' +

      name +

      ',' +

      nl +

      nl +

      'Ini pengingat pembayaran DJ Family Kost untuk periode ' +

      period +

      ' kamar ' +

      room +

      '.' +

      nl +

      nl +

      'Tagihan sewa bulanan: ' +

      totalText +

      '.' +

      nl +

      nl +

      'Jatuh tempo pembayaran adalah tanggal 1.' +

      nl +

      nl +

      'Mohon menyiapkan pembayaran tepat waktu.' +

      nl +

      nl +

      'Terima kasih.' +

      nl +

      'DJ Family Kost';





    templateKey =

      'reminder_28';





    return {



      message:

        message,



      templateKey:

        templateKey,



      templateParams: [



        name,

        period,

        room,

        totalText



      ]



    };



  }





  /*

   * ----------------------------------------------------------

   * DITOLAK

   * ----------------------------------------------------------

   */



  if (

    state.status ===

    WAUTO39.STATUS.DITOLAK

  ) {



    message =

      'Halo ' +

      name +

      ',' +

      nl +

      nl +

      'Pembayaran DJ Family Kost untuk periode ' +

      period +

      ' kamar ' +

      room +

      ' belum dapat kami terima karena bukti pembayaran ditolak.' +

      nl +

      nl +

      'Total tagihan: ' +

      totalText +

      nl +

      'Sisa yang perlu diselesaikan: ' +

      outstandingText +

      nl +

      'Status: DITOLAK.' +

      nl +

      nl +

      'Silakan melakukan pembayaran kembali dan mengirimkan bukti pembayaran yang sesuai.' +

      nl +

      nl +

      'Terima kasih.' +

      nl +

      'DJ Family Kost';





    templateKey =

      'payment_rejected';





    return {



      message:

        message,



      templateKey:

        templateKey,



      templateParams: [



        name,

        period,

        room,

        totalText,

        outstandingText



      ]



    };



  }





  /*

   * ----------------------------------------------------------

   * KURANG BAYAR

   * ----------------------------------------------------------

   */



  if (

    state.status ===

    WAUTO39.STATUS.KURANG_BAYAR

  ) {



    message =

      'Halo ' +

      name +

      ',' +

      nl +

      nl +

      'Pembayaran DJ Family Kost untuk periode ' +

      period +

      ' kamar ' +

      room +

      ' telah kami terima sebesar ' +

      paidText +

      '.' +

      nl +

      nl +

      'Total tagihan: ' +

      totalText +

      nl +

      'Pembayaran diterima: ' +

      paidText +

      nl +

      'Denda: ' +

      fineText +

      nl +

      'Sisa pembayaran: ' +

      outstandingText +

      nl +

      'Status: KURANG BAYAR.' +

      nl +

      nl +

      (

        state.verification ===

        'MENUNGGU VERIFIKASI'



          ? (

              'Pembayaran yang sudah kami terima masih menunggu verifikasi Master.' +

              nl

            )



          : ''

      ) +

      'Mohon menyelesaikan sisa pembayaran sebesar ' +

      outstandingText +

      '.' +

      nl +

      nl +

      'Terima kasih.' +

      nl +

      'DJ Family Kost';





    templateKey =

      'payment_underpaid';





    return {



      message:

        message,



      templateKey:

        templateKey,



      templateParams: [



        name,

        period,

        room,

        totalText,

        paidText,

        fineText,

        outstandingText



      ]



    };



  }





  /*

   * ----------------------------------------------------------

   * MENUNGGU VERIFIKASI

   * ----------------------------------------------------------

   */



  if (

    state.status ===

    WAUTO39.STATUS.MENUNGGU_VERIFIKASI

  ) {



    message =

      'Halo ' +

      name +

      ',' +

      nl +

      nl +

      'Terima kasih. Pembayaran DJ Family Kost untuk periode ' +

      period +

      ' kamar ' +

      room +

      ' sebesar ' +

      paidText +

      ' telah kami terima.' +

      nl +

      nl +

      'Status pembayaran: MENUNGGU VERIFIKASI.' +

      nl +

      'Pembayaran sedang diproses oleh Master.' +

      nl +

      nl +

      'Tidak ada pembayaran tambahan yang diminta saat ini.' +

      nl +

      nl +

      'Terima kasih.' +

      nl +

      'DJ Family Kost';





    templateKey =

      'payment_pending_verification';





    return {



      message:

        message,



      templateKey:

        templateKey,



      templateParams: [



        name,

        period,

        room,

        paidText



      ]



    };



  }





  /*

   * ----------------------------------------------------------

   * TERLAMBAT

   * ----------------------------------------------------------

   */



  if (

    state.status ===

    WAUTO39.STATUS.TERLAMBAT

  ) {



    message =

      'Halo ' +

      name +

      ',' +

      nl +

      nl +

      'Pembayaran DJ Family Kost untuk periode ' +

      period +

      ' kamar ' +

      room +

      ' belum kami terima.' +

      nl +

      nl +

      'Total tagihan: ' +

      totalText +

      nl +

      'Denda: ' +

      fineText +

      nl +

      'Total yang perlu diselesaikan: ' +

      totalText +

      nl +

      'Status: TERLAMBAT.' +

      nl +

      nl +

      'Mohon segera melakukan pembayaran.' +

      nl +

      nl +

      'Terima kasih.' +

      nl +

      'DJ Family Kost';





    templateKey =

      campaign ===

        'REMINDER_5'

        ? 'final_warning_overdue'

        : 'payment_overdue';





    return {



      message:

        message,



      templateKey:

        templateKey,



      templateParams: [



        name,

        period,

        room,

        totalText,

        fineText



      ]



    };



  }





  /*

   * ----------------------------------------------------------

   * BELUM BAYAR

   * ----------------------------------------------------------

   */



  message =

    'Halo ' +

    name +

    ',' +

    nl +

    nl +

    'Ini pengingat pembayaran DJ Family Kost untuk periode ' +

    period +

    ' kamar ' +

    room +

    '.' +

    nl +

    nl +

    'Total tagihan: ' +

    totalText +

    nl +

    'Denda: ' +

    fineText +

    nl +

    'Total yang perlu diselesaikan: ' +

    totalText +

    nl +

    'Status: BELUM BAYAR.' +

    nl +

    nl +

    'Mohon melakukan pembayaran sebesar ' +

    totalText +

    '.' +

    nl +

    nl +

    'Terima kasih.' +

    nl +

    'DJ Family Kost';





  templateKey =

    campaign ===

      'REMINDER_5'

      ? 'final_warning_unpaid'

      : 'payment_reminder';





  return {



    message:

      message,



    templateKey:

      templateKey,



    templateParams: [



      name,

      period,

      room,

      totalText,

      fineText



    ]



  };



}





/* ============================================================

 * 13. TEST BROADCAST MESSAGE

 * ============================================================

 */



function waAutoBuildTestBroadcastMessageDJ39_(

  tenant

) {



  const nl =

    String.fromCharCode(

      10

    );





  return (

    'Halo ' +

    (tenant.name || 'Tenant') +

    ',' +

    nl +

    nl +

    'Ini adalah pesan TEST dari sistem otomatis DJ Family Kost.' +

    nl +

    nl +

    'Nomor Anda terdaftar sebagai kontak WhatsApp tenant aktif.' +

    nl +

    nl +

    'Pesan ini hanya digunakan untuk pengujian sistem dan tidak merupakan tagihan.' +

    nl +

    nl +

    'Terima kasih.' +

    nl +

    'DJ Family Kost'

  );



}





/* ============================================================

 * 14. WHATSAPP CONNECTOR ABSTRACTION

 * ============================================================

 *

 * Saat ini belum mengirim keluar jika:

 *

 *   MODE = DRY_RUN

 *

 * Saat external WA sudah lengkap:

 *

 *   MODE = LIVE

 *

 * fungsi ini menjadi satu-satunya titik yang perlu

 * disambungkan ke provider WhatsApp eksternal.

 *

 * ============================================================

 */



function waAutoSendWhatsAppDJ39_(

  phone,

  payload,

  forcePreview

) {



  if (

    forcePreview ===

    true

  ) {



    return {



      status:

        'PREVIEW_ONLY',



      messageId:

        '',



      error:

        ''



    };



  }





  if (

    WAUTO39.CONFIG.MODE !==

    'LIVE'

  ) {



    return {



      status:

        'DRY_RUN',



      messageId:

        '',



      error:

        ''



    };



  }





  /*

   * ==========================================================

   * EXTERNAL WHATSAPP CONNECTOR — BELUM DIISI

   * ==========================================================

   *

   * NANTI KITA SAMBUNGKAN DI SINI setelah user memberikan:

   *

   * - provider/API

   * - access token

   * - phone number ID

   * - business account ID bila diperlukan

   * - nama template yang disetujui

   * - mapping variable template

   *

   * Jangan memasukkan token asli ke source code.

   * Gunakan Script Properties.

   *

   * ==========================================================

   */



  const properties =

    PropertiesService

      .getScriptProperties();





  const provider =

    String(

      properties.getProperty(

        'WA_PROVIDER'

      ) ||

      ''

    )

    .trim();





  const phoneNumberId =

    String(

      properties.getProperty(

        'WA_PHONE_NUMBER_ID'

      ) ||

      ''

    )

    .trim();





  const accessToken =

    String(

      properties.getProperty(

        'WA_ACCESS_TOKEN'

      ) ||

      ''

    )

    .trim();





  if (

    !provider ||

    !phoneNumberId ||

    !accessToken

  ) {



    return {



      status:

        'NOT_CONFIGURED',



      messageId:

        '',



      error:

        'WhatsApp external connector belum dikonfigurasi.'



    };



  }





  /*

   * Placeholder aman.

   *

   * Tidak melakukan fetch secara sengaja sampai detail

   * provider/API diberikan.

   */



  return {



    status:

      'CONNECTOR_READY_BUT_NOT_WIRED',



    messageId:

      '',



    error:

      'Connector WhatsApp belum dihubungkan ke endpoint provider.'



  };



}





/* ============================================================

 * 15. DUPLICATE CHECK

 * ============================================================

 */



function waAutoHasAlreadySentDJ39_(

  sheet,

  campaign,

  tenantId,

  period

) {



  if (

    !sheet ||

    sheet.getLastRow() < 2

  ) {



    return false;



  }





  const data =

    sheet.getDataRange()

      .getValues();





  const campaignCol = 1;

  const tenantCol = 2;

  const periodCol = 3;

  const statusCol = 6;





  for (

    let i = 1;

    i < data.length;

    i++

  ) {



    const sameCampaign =

      String(

        data[i][campaignCol] ||

        ''

      )

      .trim() ===

      String(

        campaign ||

        ''

      )

      .trim();





    const sameTenant =

      String(

        data[i][tenantCol] ||

        ''

      )

      .trim()

      .toUpperCase() ===

      String(

        tenantId ||

        ''

      )

      .trim()

      .toUpperCase();





    const samePeriod =

      String(

        data[i][periodCol] ||

        ''

      )

      .trim() ===

      String(

        period ||

        ''

      )

      .trim();





    const delivery =

      String(

        data[i][statusCol] ||

        ''

      )

      .trim()

      .toUpperCase();





    if (

      sameCampaign &&

      sameTenant &&

      samePeriod &&

      (

        delivery === 'DRY_RUN' ||

        delivery === 'SENT' ||

        delivery === 'PREVIEW_ONLY'

      )

    ) {



      return true;



    }



  }





  return false;



}





/* ============================================================

 * 16. LOG SHEET

 * ============================================================

 */



function waAutoGetLogSheetDJ39_(

  ss

) {



  let sheet =

    ss.getSheetByName(

      WAUTO39.CONFIG.LOG_SHEET

    );





  if (!sheet) {



    sheet =

      ss.insertSheet(

        WAUTO39.CONFIG.LOG_SHEET

      );



  }





  if (

    sheet.getLastRow() ===

    0

  ) {



    sheet

      .getRange(

        1,

        1,

        1,

        10

      )

      .setValues(

        [[



          'Timestamp',

          'Campaign',

          'Tenant_ID',

          'Periode',

          'Status',

          'Delivery_Status',

          'Message',

          'Provider_Message_ID',

          'Error',

          'Created_By'



        ]]

      );



  }





  return sheet;



}





function waAutoLogDJ39_(

  sheet,

  entry

) {



  sheet

    .appendRow(

      [



        entry.timestamp ||

          new Date(),



        entry.campaign ||

          '',



        entry.tenantId ||

          '',



        entry.period ||

          '',



        entry.status ||

          '',



        entry.deliveryStatus ||

          '',



        entry.message ||

          '',



        entry.providerMessageId ||

          '',



        entry.error ||

          '',



        'WHATSAPP_AUTO_DJ39'



      ]

    );



}





/* ============================================================

 * 17. TABLE READER

 * ============================================================

 */



function waAutoReadTableDJ39_(

  ss,

  sheetName,

  requiredHeaders

) {



  const sheet =

    ss.getSheetByName(

      sheetName

    );





  if (!sheet) {



    return null;



  }





  if (

    sheet.getLastRow() < 1 ||

    sheet.getLastColumn() < 1

  ) {



    return null;



  }





  const lastRow =

    sheet.getLastRow();





  const lastColumn =

    sheet.getLastColumn();





  const maxRows =

    Math.min(

      lastRow,

      20

    );





  const required =

    requiredHeaders.map(

      function(value) {



        return waAutoCanonDJ39_(

          value

        );



      }

    );





  let headerRow =

    -1;





  let scoreBest =

    -1;





  for (

    let r = 1;

    r <= maxRows;

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

      row\.map(

        waAutoCanonDJ39_

      );





    let score =

      0;





    required.forEach(

      function(needle) {



        if (

          normalized.indexOf(

            needle

          ) >= 0

        ) {



          score++;



        }



      }

    );





    if (

      score >

      scoreBest

    ) {



      scoreBest =

        score;



      headerRow =

        r;



    }



  }





  if (

    headerRow < 0 ||

    scoreBest !==

      required.length

  ) {



    return null;



  }





  const headers =

    sheet

      .getRange(

        headerRow,

        1,

        1,

        lastColumn

      )

      .getValues()[0]

      .map(

        function(value) {



          return String(

            value ||

            ''

          )

          .trim();



        }

      );





  const rows =

    (

      lastRow >

      headerRow

    )



      ? sheet

          .getRange(

            headerRow + 1,

            1,

            lastRow -

              headerRow,

            lastColumn

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

 * 18. VALUE / NUMBER / DATE HELPERS

 * ============================================================

 */



function waAutoValueDJ39_(

  row,

  headers,

  aliases

) {



  const normalized =

    headers.map(

      waAutoCanonDJ39_

    );





  for (

    let i = 0;

    i < aliases.length;

    i++

  ) {



    const target =

      waAutoCanonDJ39_(

        aliases[i]

      );





    const index =

      normalized.indexOf(

        target

      );





    if (

      index >= 0

    ) {



      return row[

        index

      ];



    }



  }





  return '';



}





function waAutoCanonDJ39_(

  value

) {



  return String(

    value ||

    ''

  )

  .trim()

  .toLowerCase()

  .replace(

    /[^a-z0-9]/g,

    ''

  );



}





function waAutoNumberDJ39_(

  value

) {



  if (

    typeof value ===

    'number'

  ) {



    return isFinite(value)

      ? value

      : 0;



  }





  let text =

    String(

      value ||

      ''

    )

    .trim();





  if (!text) {



    return 0;



  }





  text =

    text

      .replace(

        /rp/gi,

        ''

      )

      .replace(

        /\s/g,

        ''

      );





  /*

   * Indonesia:

   * 1.600.000

   */



  if (

    text.indexOf('.') >= 0

  ) {



    text =

      text.replace(

        /\\./g,

        ''

      );



  }





  text =

    text.replace(

      /,/g,

      '.'

    );





  const number =

    Number(

      text

    );





  return isFinite(number)

    ? number

    : 0;



}





function waAutoDateDJ39_(

  value

) {



  if (!value) {



    return null;



  }





  if (

    value instanceof Date

  ) {



    return new Date(

      value.getTime()

    );



  }





  const text =

    String(

      value

    )

    .trim();





  if (!text) {



    return null;



  }





  const direct =

    new Date(

      text

    );





  if (

    !isNaN(

      direct.getTime()

    )

  ) {



    return direct;



  }





  const match =

    text.match(

      /^(\d{2})\\/(\d{2})\\/(\d{4})$/

    );





  if (

    match

  ) {



    return new Date(

      Number(

        match[3]

      ),

      Number(

        match[2]

      ) - 1,

      Number(

        match[1]

      )

    );



  }





  return null;



}





/* ============================================================

 * 19. PERIOD / DATE LOGIC

 * ============================================================

 */



function waAutoCampaignPeriodDJ39_(

  campaignDay,

  runDate

) {



  const year =

    runDate.getFullYear();





  const month =

    runDate.getMonth();





  if (

    campaignDay ===

    WAUTO39.CONFIG.REMINDER_DAY_28

  ) {



    /*

     * Tanggal 28:

     * reminder untuk bulan berikutnya.

     */



    return new Date(

      month === 11

        ? year + 1

        : year,

      month === 11

        ? 0

        : month + 1,

      1

    );



  }





  /*

   * Tanggal 1 / 2 / 5:

   * reminder untuk bulan berjalan.

   */



  return new Date(

    year,

    month,

    1

  );



}





function waAutoPeriodKeyDJ39_(

  date

) {



  if (!date) {



    return '';



  }





  return (

    date.getFullYear() +

    '-' +

    String(

      date.getMonth() + 1

    )

    .padStart(

      2,

      '0'

    )

  );



}





function waAutoPeriodLabelDJ39_(

  date

) {



  if (!date) {



    return '';



  }





  const months = [



    'Januari',

    'Februari',

    'Maret',

    'April',

    'Mei',

    'Juni',

    'Juli',

    'Agustus',

    'September',

    'Oktober',

    'November',

    'Desember'



  ];





  return (

    months[

      date.getMonth()

    ] +

    ' ' +

    date.getFullYear()

  );



}





function waAutoFallbackDueDateDJ39_(

  periodDate

) {



  if (!periodDate) {



    return null;



  }





  return new Date(

    periodDate.getFullYear(),

    periodDate.getMonth(),

    1

  );



}





function waAutoIsFirstBillingDJ39_(

  contract,

  periodDate

) {



  if (

    !contract ||

    !contract.startDate ||

    !periodDate

  ) {



    return false;



  }





  const start =

    waAutoDateDJ39_(

      contract.startDate

    );





  if (!start) {



    return false;



  }





  return (

    start.getFullYear() ===

      periodDate.getFullYear() &&

    start.getMonth() ===

      periodDate.getMonth()

  );



}





/* ============================================================

 * 20. CAMPAIGN NAME

 * ============================================================

 */



function waAutoCampaignNameDJ39_(

  campaignDay

) {



  if (

    campaignDay ===

    WAUTO39.CONFIG.REMINDER_DAY_28

  ) {



    return 'REMINDER_28';



  }





  if (

    campaignDay ===

    WAUTO39.CONFIG.REMINDER_DAY_1

  ) {



    return 'REMINDER_1';



  }





  if (

    campaignDay ===

    WAUTO39.CONFIG.REMINDER_DAY_2

  ) {



    return 'REMINDER_2';



  }





  if (

    campaignDay ===

    WAUTO39.CONFIG.REMINDER_DAY_5

  ) {



    return 'REMINDER_5';



  }





  return 'MANUAL';



}





/* ============================================================

 * 21. PHONE / MONEY

 * ============================================================

 */



function waAutoNormalizePhoneDJ39_(

  value

) {



  let text =

    String(

      value ||

      ''

    )

    .trim()

    .replace(

      /[^\d+]/g,

      ''

    );





  if (!text) {



    return '';



  }





  if (

    text.indexOf('+') ===

    0

  ) {



    text =

      text.substring(

        1

      );



  }





  if (

    text.indexOf('62') ===

    0

  ) {



    return text;



  }





  if (

    text.indexOf('0') ===

    0

  ) {



    return (

      '62' +

      text.substring(

        1

      )

    );



  }





  return text;



}





function waAutoMoneyDJ39_(

  value

) {



  const number =

    waAutoNumberDJ39_(

      value

    );





  return (

    'Rp' +

    number.toLocaleString(

      'id-ID'

    )

  );



}





/* ============================================================

 * 22. PUBLIC DIAGNOSTIC — V2

 * ============================================================

 *

 * TIDAK MENGIRIM WHATSAPP.

 *

 * Hanya memeriksa:

 * - sheet dasar

 * - mode

 * - konfigurasi connector

 *

 * Token TIDAK pernah ditampilkan.

 *

 * ============================================================

 */



function auditWhatsAppAutomationDJ39() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  if (!ss) {



    throw new Error(

      'Spreadsheet DJ Family Kost tidak ditemukan.'

    );



  }





  const properties =

    PropertiesService

      .getScriptProperties();





  const provider =

    String(

      properties.getProperty(

        'WA_PROVIDER'

      ) || ''

    )

    .trim();





  const phoneNumberId =

    String(

      properties.getProperty(

        'WA_PHONE_NUMBER_ID'

      ) || ''

    )

    .trim();





  const accessToken =

    String(

      properties.getProperty(

        'WA_ACCESS_TOKEN'

      ) || ''

    )

    .trim();





  const checks = [



    {

      item:

        'Sheet Tenant',



      status:

        ss.getSheetByName(

          WAUTO39.CONFIG.TENANT_SHEET

        )

          ? 'OK'

          : 'GAGAL'

    },



    {

      item:

        'Sheet Kontrak',



      status:

        ss.getSheetByName(

          WAUTO39.CONFIG.CONTRACT_SHEET

        )

          ? 'OK'

          : 'GAGAL'

    },



    {

      item:

        'Sheet Pembayaran',



      status:

        ss.getSheetByName(

          WAUTO39.CONFIG.PAYMENT_SHEET

        )

          ? 'OK'

          : 'GAGAL'

    },



    {

      item:

        'Sheet WhatsApp Log',



      status:

        ss.getSheetByName(

          WAUTO39.CONFIG.LOG_SHEET

        )

          ? 'OK'

          : 'GAGAL'

    },



    {

      item:

        'WhatsApp Mode',



      status:

        WAUTO39.CONFIG.MODE,



      value:

        WAUTO39.CONFIG.MODE

    },



    {

      item:

        'WA_PROVIDER',



      status:

        provider

          ? 'TERISI'

          : 'KOSONG'

    },



    {

      item:

        'WA_PHONE_NUMBER_ID',



      status:

        phoneNumberId

          ? 'TERISI'

          : 'KOSONG'

    },



    {

      item:

        'WA_ACCESS_TOKEN',



      status:

        accessToken

          ? 'TERISI'

          : 'KOSONG'

    },



    {

      item:

        'Test Broadcast',



      status:

        WAUTO39.CONFIG

          .TEST_BROADCAST_ENABLED === true

          ? 'AKTIF'

          : 'NONAKTIF'

    }



  ];





  const connectorReady =

    !!provider &&

    !!phoneNumberId &&

    !!accessToken;





  const result = {



    ok:

      checks.every(

        function(check) {



          return (

            check.status === 'OK' ||

            check.status === 'DRY_RUN' ||

            check.status === 'TERISI' ||

            check.status === 'NONAKTIF'

          );



        }

      ),



    mode:

      WAUTO39.CONFIG.MODE,



    connectorReady:

      connectorReady,



    testBroadcastEnabled:

      WAUTO39.CONFIG

        .TEST_BROADCAST_ENABLED,



    checks:

      checks



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