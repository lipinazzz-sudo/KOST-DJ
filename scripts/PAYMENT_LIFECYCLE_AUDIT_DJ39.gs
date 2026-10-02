/**

 * ============================================================

 * DJ FAMILY KOST

 * PAYMENT LIFECYCLE DIAGNOSTIC — DJ39 V2

 * ============================================================

 *

 * STEP 6B

 *

 * DIAGNOSTIC READ-ONLY.

 *

 * FUNGSI INI TIDAK:

 * - mengubah Pembayaran

 * - mengubah Tenant

 * - mengubah Kontrak

 * - memperbaiki status

 * - menghitung ulang ke sheet

 * - mengirim email

 * - membuat trigger

 * - menghapus trigger

 *

 * TUJUAN:

 * Menampilkan kondisi aktual setiap record Pembayaran

 * dan membandingkannya dengan aturan PAYMENT_ENGINE_DJ39_V2.

 *

 * ============================================================

 *

 * ATURAN STATUS MENGIKUTI PAYMENT ENGINE AKTIF:

 *

 * 1. MENUNGGU VERIFIKASI

 *    -> tetap MENUNGGU VERIFIKASI

 *

 * 2. TERVERIFIKASI

 *    -> paid >= total : LUNAS

 *    -> paid > 0      : KURANG BAYAR

 *    -> paid = 0      : BELUM BAYAR

 *

 * 3. DITOLAK

 *    -> DITOLAK

 *

 * 4. Belum ada pembayaran:

 *    -> TERLAMBAT / BELUM BAYAR

 *

 * ============================================================

 */





/* ============================================================

 * MAIN DIAGNOSTIC

 * ============================================================

 */



function auditPaymentLifecycleDJ39V2() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  if (!ss) {



    throw new Error(

      'Spreadsheet DJ Family Kost tidak ditemukan.'

    );



  }





  const paymentSheet =

    ss.getSheetByName(

      'Pembayaran'

    );



  const tenantSheet =

    ss.getSheetByName(

      'Tenant'

    );



  const contractSheet =

    ss.getSheetByName(

      'Kontrak'

    );





  if (!paymentSheet) {



    throw new Error(

      'Sheet Pembayaran tidak ditemukan.'

    );



  }





  const result = {



    ok:

      true,



    generatedAt:

      new Date()

        .toISOString(),



    engineRule:

      'PAYMENT_ENGINE_DJ39_V2',



    summary: {



      totalRows:

        0,



      validRows:

        0,



      errorRows:

        0,



      warningRows:

        0,



      lunas:

        0,



      kurangBayar:

        0,



      menungguVerifikasi:

        0,



      belumBayar:

        0,



      terlambat:

        0,



      ditolak:

        0



    },



    sheets: {



      payment:

        !!paymentSheet,



      tenant:

        !!tenantSheet,



      contract:

        !!contractSheet



    },



    records:

      [],



    errors:

      [],



    warnings:

      [],



    duplicates: {



      paymentId:

        [],



      tenantPeriod:

        []



    }



  };





  /*

   * ----------------------------------------------------------

   * READ TABLES

   * ----------------------------------------------------------

   */



  const paymentTable =

    dj39AuditV2ReadTable_(

      paymentSheet,

      [

        'Tenant_ID'

      ]

    );





  if (!paymentTable) {



    throw new Error(

      'Header sheet Pembayaran tidak ditemukan.'

    );



  }





  const tenantTable =

    tenantSheet

      ? dj39AuditV2ReadTable_(

          tenantSheet,

          [

            'Tenant_ID'

          ]

        )

      : null;





  const contractTable =

    contractSheet

      ? dj39AuditV2ReadTable_(

          contractSheet,

          [

            'Tenant_ID'

          ]

        )

      : null;





  /*

   * ----------------------------------------------------------

   * TENANT MAP

   * ----------------------------------------------------------

   */



  const tenantMap =

    {};





  if (

    tenantTable

  ) {



    const tenantIdCol =

      dj39AuditV2FindColumn_(

        tenantTable.headers,

        [

          'Tenant_ID'

        ]

      );





    if (

      tenantIdCol >= 0

    ) {



      tenantTable.rows.forEach(

        function(row) {



          const id =

            dj39AuditV2String_(

              row[

                tenantIdCol

              ]

            );





          if (

            id

          ) {



            tenantMap[

              id.toUpperCase()

            ] = {



              tenantId:

                id



            };



          }



        }

      );



    }



  }





  /*

   * ----------------------------------------------------------

   * CONTRACT MAP

   * ----------------------------------------------------------

   */



  const contractMap =

    {};





  if (

    contractTable

  ) {



    const tenantIdCol =

      dj39AuditV2FindColumn_(

        contractTable.headers,

        [

          'Tenant_ID'

        ]

      );



    const roomCol =

      dj39AuditV2FindColumn_(

        contractTable.headers,

        [

          'No_Kamar'

        ]

      );



    const startCol =

      dj39AuditV2FindColumn_(

        contractTable.headers,

        [

          'Tanggal_Mulai',

          'Tanggal_Mulai_Sewa',

          'Start_Date'

        ]

      );



    const amountCol =

      dj39AuditV2FindColumn_(

        contractTable.headers,

        [

          'Harga_Sewa',

          'Harga_Bulan'

        ]

      );



    const statusCol =

      dj39AuditV2FindColumn_(

        contractTable.headers,

        [

          'Status_Kontrak'

        ]

      );





    if (

      tenantIdCol >= 0

    ) {



      contractTable.rows.forEach(

        function(row) {



          const tenantId =

            dj39AuditV2String_(

              row[

                tenantIdCol

              ]

            );





          if (

            !tenantId

          ) {



            return;



          }





          const status =

            statusCol >= 0



              ? dj39AuditV2String_(

                  row[

                    statusCol

                  ]

                )

                .toUpperCase()



              : '';





          if (

            status &&

            status !==

            'AKTIF'

          ) {



            return;



          }





          contractMap[

            tenantId.toUpperCase()

          ] = {



            room:

              roomCol >= 0

                ? dj39AuditV2String_(

                    row[

                      roomCol

                    ]

                  )

                : '',



            startDate:

              startCol >= 0

                ? row[

                    startCol

                  ]

                : '',



            amount:

              amountCol >= 0

                ? dj39AuditV2Number_(

                    row[

                      amountCol

                    ]

                  )

                : 0,



            status:

              status



          };



        }

      );



    }



  }





  /*

   * ----------------------------------------------------------

   * PAYMENT COLUMNS

   * ----------------------------------------------------------

   */



  const col = {



    paymentId:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Payment_ID',

          'Pembayaran_ID'

        ]

      ),



    tenantId:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Tenant_ID'

        ]

      ),



    room:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'No_Kamar'

        ]

      ),



    period:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Periode_Pembayaran',

          'Periode'

        ]

      ),



    due:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Jatuh_Tempo',

          'Tanggal_Jatuh_Tempo'

        ]

      ),



    rent:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Nominal_Sewa',

          'Tarif_Kamar'

        ]

      ),



    paid:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Nominal_Dibayar'

        ]

      ),



    paidDate:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Tanggal_Pembayaran',

          'Tanggal_Bayar'

        ]

      ),



    fine:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Denda',

          'Denda_Terhitung'

        ]

      ),



    total:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Total_Tagihan'

        ]

      ),



    difference:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Selisih'

        ]

      ),



    status:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Status_Pembayaran'

        ]

      ),



    verification:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Status_Verifikasi'

        ]

      ),



    proof:

      dj39AuditV2FindColumn_(

        paymentTable.headers,

        [

          'Bukti_Pembayaran_Foto',

          'Bukti_Pembayaran_URL'

        ]

      )



  };





  /*

   * ----------------------------------------------------------

   * REQUIRED COLUMNS

   * ----------------------------------------------------------

   */



  const requiredColumns = [



    [

      'Payment_ID',

      col.paymentId

    ],



    [

      'Tenant_ID',

      col.tenantId

    ],



    [

      'Periode',

      col.period

    ],



    [

      'Nominal_Sewa',

      col.rent

    ],



    [

      'Nominal_Dibayar',

      col.paid

    ],



    [

      'Denda',

      col.fine

    ],



    [

      'Total_Tagihan',

      col.total

    ],



    [

      'Status_Pembayaran',

      col.status

    ],



    [

      'Status_Verifikasi',

      col.verification

    ]



  ];





  requiredColumns.forEach(

    function(item) {



      if (

        item[1] < 0

      ) {



        result.errors.push(



          'Kolom wajib tidak ditemukan: ' +

          item[0]



        );



      }



    }

  );





  /*

   * ----------------------------------------------------------

   * DUPLICATE MAP

   * ----------------------------------------------------------

   */



  const paymentIdMap =

    {};



  const tenantPeriodMap =

    {};





  /*

   * ----------------------------------------------------------

   * TODAY

   * ----------------------------------------------------------

   */



  const today =

    dj39AuditV2StartOfDay_(

      new Date()

    );





  /*

   * ----------------------------------------------------------

   * READ EVERY PAYMENT ROW

   * ----------------------------------------------------------

   */



  paymentTable.rows.forEach(

    function(row, index) {



      const spreadsheetRow =

        paymentTable.headerRow +

        1 +

        index;





      const hasData =

        row\.some(

          function(value) {



            return (

              String(

                value == null

                  ? ''

                  : value

              ).trim() !== ''

            );



          }

        );





      if (

        !hasData

      ) {



        return;



      }





      result.summary.totalRows++;





      const paymentId =

        dj39AuditV2String_(

          row[

            col.paymentId

          ]

        );





      const tenantId =

        dj39AuditV2String_(

          row[

            col.tenantId

          ]

        );





      const room =

        dj39AuditV2String_(

          row[

            col.room

          ]

        );





      const periodRaw =

        row[

          col.period

        ];





      const period =

        dj39AuditV2String_(

          periodRaw

        );





      const rent =

        dj39AuditV2Number_(

          row[

            col.rent

          ]

        );





      const paid =

        dj39AuditV2Number_(

          row[

            col.paid

          ]

        );





      const paidDate =

        col.paidDate >= 0



          ? dj39AuditV2ToDate_(

              row[

                col.paidDate

              ]

            )



          : null;





      const dueDate =

        col.due >= 0



          ? dj39AuditV2ToDate_(

              row[

                col.due

              ]

            )



          : null;





      const fine =

        dj39AuditV2Number_(

          row[

            col.fine

          ]

        );





      const total =

        dj39AuditV2Number_(

          row[

            col.total

          ]

        );





      const difference =

        col.difference >= 0



          ? dj39AuditV2Number_(

              row[

                col.difference

              ]

            )



          : (

              paid -

              total

            );





      const status =

        dj39AuditV2String_(

          row[

            col.status

          ]

        )

        .toUpperCase();





      const verification =

        dj39AuditV2String_(

          row[

            col.verification

          ]

        )

        .toUpperCase();





      const tenantExists =

        tenantId

          ? !!tenantMap[

              tenantId.toUpperCase()

            ]

          : false;





      const contract =

        tenantId

          ? (

              contractMap[

                tenantId.toUpperCase()

              ] ||

              null

            )

          : null;





      /*

       * ------------------------------------------------------

       * PERIOD DATE

       * ------------------------------------------------------

       */



      const periodDate =

        dj39AuditV2ToMonthDate_(

          periodRaw

        );





      /*

       * ------------------------------------------------------

       * FIRST BILLING

       * ------------------------------------------------------

       */



      let firstBilling =

        false;





      if (

        contract &&

        contract.startDate &&

        periodDate

      ) {



        const startDate =

          dj39AuditV2ToDate_(

            contract.startDate

          );





        if (

          startDate

        ) {



          firstBilling = (



            startDate.getFullYear() ===

            periodDate.getFullYear()



            &&



            startDate.getMonth() ===

            periodDate.getMonth()



          );



        }



      }





      /*

       * ------------------------------------------------------

       * ENGINE EXPECTED FINE

       * ------------------------------------------------------

       *

       * Mengikuti PAYMENT_ENGINE_DJ39_V2.

       *

       * Jangan mengubah sheet.

       */



      let expectedFine =

        fine;





      if (

        firstBilling

      ) {



        expectedFine =

          0;



      } else if (

        verification ===

        'TERVERIFIKASI' ||



        verification ===

        'DITOLAK'

      ) {



        /*

         * Engine mempertahankan denda

         * yang sudah tersimpan.

         */



        expectedFine =

          fine;



      } else {



        const referenceDate =

          paidDate ||

          today;





        if (

          typeof dj39pay2CalculateFine_ ===

          'function'

        ) {



          try {



            const dendaHari3 =

              typeof dj39pay2GetSettingNumber_ ===

              'function'



                ? dj39pay2GetSettingNumber_(

                    ss,

                    'Denda_Terlambat_Hari_Ke3',

                    25000

                  )



                : 25000;





            const dendaHari5 =

              typeof dj39pay2GetSettingNumber_ ===

              'function'



                ? dj39pay2GetSettingNumber_(

                    ss,

                    'Denda_Terlambat_Hari_Ke5',

                    25000

                  )



                : 25000;





            const maxDenda =

              typeof dj39pay2GetSettingNumber_ ===

              'function'



                ? dj39pay2GetSettingNumber_(

                    ss,

                    'Maks_Denda_Keterlambatan',

                    50000

                  )



                : 50000;





            expectedFine =

              dj39pay2CalculateFine_(



                referenceDate,



                dueDate ||



                (

                  periodDate

                    ? new Date(

                        periodDate.getFullYear(),

                        periodDate.getMonth(),

                        1

                      )

                    : null

                ),



                dendaHari3,



                dendaHari5,



                maxDenda



              );



          } catch (err) {



            expectedFine =

              fine;



          }



        }



      }





      /*

       * ------------------------------------------------------

       * EXPECTED TOTAL

       * ------------------------------------------------------

       */



      let expectedRent =

        rent;





      if (

        expectedRent <=

        0 &&

        contract &&

        contract.amount > 0

      ) {



        expectedRent =

          contract.amount;



      }





      const expectedTotal =

        expectedRent +

        expectedFine;





      /*

       * ------------------------------------------------------

       * EXPECTED STATUS

       * ------------------------------------------------------

       *

       * INI MENGIKUTI PAYMENT ENGINE V2.

       */



      let expectedStatus =

        '';





      if (

        verification ===

        'MENUNGGU VERIFIKASI'

      ) {



        expectedStatus =

          'MENUNGGU VERIFIKASI';



      } else if (

        verification ===

        'TERVERIFIKASI'

      ) {



        if (

          paid >=

          expectedTotal &&



          expectedTotal > 0

        ) {



          expectedStatus =

            'LUNAS';



        } else if (

          paid > 0 &&



          expectedTotal > 0

        ) {



          expectedStatus =

            'KURANG BAYAR';



        } else {



          expectedStatus =

            'BELUM BAYAR';



        }



      } else if (

        verification ===

        'DITOLAK'

      ) {



        expectedStatus =

          'DITOLAK';



      } else {



        /*

         * Belum ada verifikasi.

         *

         * Payment Engine menganggap pembayaran yang

         * sudah memiliki nominal bayar + tanggal bayar

         * sebagai menunggu verifikasi.

         */



        if (

          paid > 0 &&

          paidDate

        ) {



          expectedStatus =

            'MENUNGGU VERIFIKASI';



        } else {



          const effectiveDue =

            dueDate ||



            (

              periodDate

                ? new Date(

                    periodDate.getFullYear(),

                    periodDate.getMonth(),

                    1

                  )

                : null

            );





          if (

            effectiveDue &&

            today.getTime() >

            dj39AuditV2StartOfDay_(

              effectiveDue

            ).getTime()

          ) {



            expectedStatus =

              'TERLAMBAT';



          } else {



            expectedStatus =

              'BELUM BAYAR';



          }



        }



      }





      /*

       * ------------------------------------------------------

       * TOTAL MISMATCH

       * ------------------------------------------------------

       */



      const totalMismatch =

        Math.abs(

          total -

          expectedTotal

        ) > 1;





      /*

       * ------------------------------------------------------

       * STATUS MISMATCH

       * ------------------------------------------------------

       */



      const statusMismatch =

        !!expectedStatus &&

        status !==

        expectedStatus;





      /*

       * ------------------------------------------------------

       * DIFFERENCE MISMATCH

       * ------------------------------------------------------

       */



      const expectedDifference =

        paid -

        expectedTotal;





      const differenceMismatch =

        Math.abs(

          difference -

          expectedDifference

        ) > 1;





      /*

       * ------------------------------------------------------

       * GENERAL ROW ERRORS

       * ------------------------------------------------------

       */



      const rowErrors =

        [];





      const rowWarnings =

        [];





      if (

        !paymentId

      ) {



        rowErrors.push(

          'Payment_ID kosong.'

        );



      }





      if (

        !tenantId

      ) {



        rowErrors.push(

          'Tenant_ID kosong.'

        );



      } else if (

        tenantSheet &&

        !tenantExists

      ) {



        rowErrors.push(

          'Tenant_ID tidak ditemukan di sheet Tenant.'

        );



      }





      if (

        !period

      ) {



        rowErrors.push(

          'Periode kosong.'

        );



      }





      if (

        totalMismatch

      ) {



        rowErrors.push(



          'Total_Tagihan tidak sesuai dengan ' +

          'perhitungan Payment Engine V2.'



        );



      }





      if (

        statusMismatch

      ) {



        rowErrors.push(



          'Status tidak sesuai dengan aturan ' +

          'Payment Engine V2.'



        );



      }





      if (

        differenceMismatch

      ) {



        rowWarnings.push(



          'Selisih tidak sama dengan Nominal_Dibayar - expected Total_Tagihan.'



        );



      }





      /*

       * ------------------------------------------------------

       * WARNING CONTRACT

       * ------------------------------------------------------

       */



      if (

        tenantId &&

        !contract

      ) {



        rowWarnings.push(

          'Kontrak aktif tenant tidak ditemukan.'

        );



      }





      if (

        contract &&

        expectedRent <= 0

      ) {



        rowWarnings.push(

          'Harga sewa efektif tidak tersedia.'

        );



      }





      /*

       * ------------------------------------------------------

       * DUPLICATE PAYMENT ID

       * ------------------------------------------------------

       */



      if (

        paymentId

      ) {



        const key =

          paymentId.toUpperCase();





        if (

          paymentIdMap[key]

        ) {



          paymentIdMap[key].push(

            spreadsheetRow

          );



        } else {



          paymentIdMap[key] = [



            spreadsheetRow



          ];



        }



      }





      /*

       * ------------------------------------------------------

       * DUPLICATE TENANT + PERIOD

       * ------------------------------------------------------

       */



      if (

        tenantId &&

        period

      ) {



        const key =



          tenantId.toUpperCase() +

          '|' +

          period.toUpperCase();





        if (

          tenantPeriodMap[key]

        ) {



          tenantPeriodMap[key].push(

            spreadsheetRow

          );



        } else {



          tenantPeriodMap[key] = [



            spreadsheetRow



          ];



        }



      }





      /*

       * ------------------------------------------------------

       * STATUS SUMMARY

       * ------------------------------------------------------

       */



      switch (

        status

      ) {



        case 'LUNAS':

          result.summary.lunas++;

          break;



        case 'KURANG BAYAR':

          result.summary.kurangBayar++;

          break;



        case 'MENUNGGU VERIFIKASI':

          result.summary.menungguVerifikasi++;

          break;



        case 'BELUM BAYAR':

          result.summary.belumBayar++;

          break;



        case 'TERLAMBAT':

          result.summary.terlambat++;

          break;



        case 'DITOLAK':

          result.summary.ditolak++;

          break;



      }





      /*

       * ------------------------------------------------------

       * RECORD DETAIL

       * ------------------------------------------------------

       */



      const record = {



        row:

          spreadsheetRow,



        paymentId:

          paymentId,



        tenantId:

          tenantId,



        room:

          room,



        period:

          period,



        periodDate:

          dj39AuditV2FormatDate_(

            periodDate

          ),



        dueDate:

          dj39AuditV2FormatDate_(

            dueDate

          ),



        paymentDate:

          dj39AuditV2FormatDate_(

            paidDate

          ),



        tenantExists:

          tenantExists,



        contractFound:

          !!contract,



        contractStartDate:

          contract



            ? dj39AuditV2FormatDate_(

                dj39AuditV2ToDate_(

                  contract.startDate

                )

              )



            : '',



        firstBilling:

          firstBilling,



        nominalSewa:

          rent,



        nominalDibayar:

          paid,



        dendaAktual:

          fine,



        totalAktual:

          total,



        selisihAktual:

          difference,



        statusVerifikasi:

          verification,



        statusAktual:

          status,



        expectedFine:

          expectedFine,



        expectedTotal:

          expectedTotal,



        expectedDifference:

          expectedDifference,



        expectedStatus:

          expectedStatus,



        totalMismatch:

          totalMismatch,



        statusMismatch:

          statusMismatch,



        differenceMismatch:

          differenceMismatch,



        proofPresent:

          col.proof >= 0

            ? !!dj39AuditV2String_(

                row[

                  col.proof

                ]

              )

            : false



      };





      result.records.push(

        record

      );





      /*

       * ------------------------------------------------------

       * ERROR/WARNING STORAGE

       * ------------------------------------------------------

       */



      if (

        rowErrors.length

      ) {



        result.summary.errorRows++;



        result.errors.push({



          row:

            spreadsheetRow,



          paymentId:

            paymentId,



          tenantId:

            tenantId,



          room:

            room,



          period:

            period,



          errors:

            rowErrors,



          actual: {



            rent:

              rent,



            paid:

              paid,



            fine:

              fine,



            total:

              total,



            status:

              status,



            verification:

              verification



          },



          expected: {



            fine:

              expectedFine,



            total:

              expectedTotal,



            status:

              expectedStatus



          }



        });



      } else {



        result.summary.validRows++;



      }





      if (

        rowWarnings.length

      ) {



        result.summary.warningRows++;



        result.warnings.push({



          row:

            spreadsheetRow,



          paymentId:

            paymentId,



          tenantId:

            tenantId,



          warnings:

            rowWarnings



        });



      }



    }

  );





  /*

   * ----------------------------------------------------------

   * DUPLICATE PAYMENT ID

   * ----------------------------------------------------------

   */



  Object.keys(

    paymentIdMap

  ).forEach(

    function(key) {



      const rows =

        paymentIdMap[key];





      if (

        rows.length > 1

      ) {



        result.duplicates

          .paymentId

          .push({



            paymentId:

              key,



            rows:

              rows



          });





        result.errors.push({



          type:

            'DUPLICATE_PAYMENT_ID',



          paymentId:

            key,



          rows:

            rows,



          errors: [



            'Payment_ID muncul lebih dari satu kali.'



          ]



        });



      }



    }

  );





  /*

   * ----------------------------------------------------------

   * DUPLICATE TENANT + PERIOD

   * ----------------------------------------------------------

   */



  Object.keys(

    tenantPeriodMap

  ).forEach(

    function(key) {



      const rows =

        tenantPeriodMap[key];





      if (

        rows.length > 1

      ) {



        result.duplicates

          .tenantPeriod

          .push({



            tenantPeriod:

              key,



            rows:

              rows



          });





        result.errors.push({



          type:

            'DUPLICATE_TENANT_PERIOD',



          tenantPeriod:

            key,



          rows:

            rows,



          errors: [



            'Tenant_ID + Periode muncul lebih dari satu kali.'



          ]



        });



      }



    }

  );





  /*

   * ----------------------------------------------------------

   * FINAL RESULT

   * ----------------------------------------------------------

   */



  result.ok =

    result.errors.length ===

    0;





  Logger.log(



    '=============================='



  );





  Logger.log(

    'PAYMENT LIFECYCLE DIAGNOSTIC'

  );





  Logger.log(

    'OK = ' +

    result.ok

  );





  Logger.log(

    'Total row = ' +

    result.summary.totalRows

  );





  Logger.log(

    'Error row = ' +

    result.summary.errorRows

  );





  Logger.log(

    'Warning row = ' +

    result.summary.warningRows

  );





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

 * READ TABLE

 * ============================================================

 */



function dj39AuditV2ReadTable_(

  sheet,

  required

) {



  if (

    !sheet ||

    sheet.getLastRow() < 1 ||

    sheet.getLastColumn() < 1

  ) {



    return null;



  }





  const lastColumn =

    sheet.getLastColumn();





  const maxRows =

    Math.min(

      sheet.getLastRow(),

      15

    );





  const requiredNormalized =

    required.map(

      function(value) {



        return dj39AuditV2Canon_(

          value

        );



      }

    );





  let headerRow =

    -1;





  let bestScore =

    -1;





  for (

    let r = 1;

    r <= maxRows;

    r++

  ) {



    const values =

      sheet

        .getRange(

          r,

          1,

          1,

          lastColumn

        )

        .getValues()[0];





    const normalized =

      values.map(

        function(value) {



          return dj39AuditV2Canon_(

            value

          );



        }

      );





    let score =

      0;





    requiredNormalized.forEach(

      function(needle) {



        if (

          normalized.includes(

            needle

          )

        ) {



          score++;



        }



      }

    );





    if (

      score >

      bestScore

    ) {



      bestScore =

        score;



      headerRow =

        r;



    }



  }





  if (

    headerRow < 0 ||

    bestScore <

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



          return dj39AuditV2String_(

            value

          );



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

 * FIND COLUMN

 * ============================================================

 */



function dj39AuditV2FindColumn_(

  headers,

  aliases

) {



  const normalized =

    headers.map(

      function(value) {



        return dj39AuditV2Canon_(

          value

        );



      }

    );





  for (

    let i = 0;

    i < aliases.length;

    i++

  ) {



    const target =

      dj39AuditV2Canon_(

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





/* ============================================================

 * CANON

 * ============================================================

 */



function dj39AuditV2Canon_(

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

    /[^a-z0-9]/g,

    ''

  );



}





/* ============================================================

 * STRING

 * ============================================================

 */



function dj39AuditV2String_(

  value

) {



  return String(

    value == null

      ? ''

      : value

  ).trim();



}





/* ============================================================

 * NUMBER

 * ============================================================

 */



function dj39AuditV2Number_(

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

      )

      .replace(

        /[^\d.-]/g,

        ''

      )

    ) ||



    0



  );



}





/* ============================================================

 * DATE

 * ============================================================

 */



function dj39AuditV2ToDate_(

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





  const text =

    dj39AuditV2String_(

      value

    );





  if (

    !text

  ) {



    return null;



  }





  const date =

    new Date(

      text

    );





  if (

    !isNaN(

      date.getTime()

    )

  ) {



    return date;



  }





  return null;



}





/* ============================================================

 * MONTH DATE

 * ============================================================

 */



function dj39AuditV2ToMonthDate_(

  value

) {



  if (

    value instanceof Date &&

    !isNaN(

      value.getTime()

    )

  ) {



    return new Date(



      value.getFullYear(),



      value.getMonth(),



      1



    );



  }





  const text =

    dj39AuditV2String_(

      value

    );





  if (

    !text

  ) {



    return null;



  }





  /*

   * YYYY-MM

   */



  const match =

    text.match(

      /^(\d{4})-(\d{1,2})$/

    );





  if (

    match

  ) {



    return new Date(



      Number(

        match[1]

      ),



      Number(

        match[2]

      ) - 1,



      1



    );



  }





  const date =

    new Date(

      text

    );





  if (

    !isNaN(

      date.getTime()

    )

  ) {



    return new Date(



      date.getFullYear(),



      date.getMonth(),



      1



    );



  }





  return null;



}





/* ============================================================

 * START OF DAY

 * ============================================================

 */



function dj39AuditV2StartOfDay_(

  date

) {



  if (

    !date

  ) {



    return null;



  }





  const result =

    new Date(

      date

    );





  result.setHours(

    0,

    0,

    0,

    0

  );





  return result;



}





/* ============================================================

 * FORMAT DATE

 * ============================================================

 */



function dj39AuditV2FormatDate_(

  date

) {



  if (

    !date

  ) {



    return '';



  }





  return Utilities.formatDate(



    date,



    Session.getScriptTimeZone() ||

    'Asia/Jakarta',



    'yyyy-MM-dd'



  );



}