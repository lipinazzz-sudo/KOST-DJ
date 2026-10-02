/* ============================================================

 * DJ FAMILY KOST — DIGITAL CONTRACT ARCHIVE V1

 *

 * Membuat 1 PDF kontrak digital arsip setelah aktivasi.

 * Kontrak fisik bertanda tangan tetap disimpan terpisah.

 * ============================================================

 */



function djApiGenerateDigitalContractArchiveV1_(data) {



  data = data || {};



  const tenantId =

    String(data.tenantId || '').trim();



  const contractId =

    String(data.contractId || '').trim();



  const agreementVersion =

    String(data.agreementVersion || '').trim();



  const agreementHtml =

    String(data.agreementHtml || '').trim();



  const signatureBase64 =

    String(data.signatureBase64 || '').trim();





  if (!tenantId) {

    throw new Error(

      'Tenant ID untuk kontrak digital tidak tersedia.'

    );

  }





  if (!contractId) {

    throw new Error(

      'Kontrak ID untuk kontrak digital tidak tersedia.'

    );

  }





  if (!agreementVersion) {

    throw new Error(

      'Versi perjanjian untuk kontrak digital tidak tersedia.'

    );

  }





  if (!agreementHtml) {

    throw new Error(

      'Isi Perjanjian Sewa untuk arsip digital tidak tersedia.'

    );

  }





  if (!signatureBase64) {

    throw new Error(

      'Tanda tangan digital untuk arsip kontrak tidak tersedia.'

    );

  }





  const rootFolder =

    djApiGetOrCreateFolderV5_(

      null,

      'DJ Family Kost'

    );





  const digitalFolder =

    djApiGetOrCreateFolderV5_(

      rootFolder,

      'Kontrak Digital'

    );





  const tenantFolder =

    djApiGetOrCreateFolderV5_(

      digitalFolder,

      tenantId

    );





  const fileNameBase =

    'Kontrak-Digital-' +

    tenantId +

    '-' +

    contractId;





  let tempDocId = '';





  try {



    const doc =

      DocumentApp.create(

        fileNameBase + '-TEMP'

      );



    tempDocId =

      doc.getId();





    const body =

      doc.getBody();





    body.clear();





    const title =

      body.appendParagraph(

        'DJ FAMILY KOST'

      );



    title.setHeading(

      DocumentApp.ParagraphHeading.TITLE

    );



    title.setAlignment(

      DocumentApp.HorizontalAlignment.CENTER

    );





    const subtitle =

      body.appendParagraph(

        'KONTRAK DIGITAL — ARSIP'

      );



    subtitle.setHeading(

      DocumentApp.ParagraphHeading.HEADING1

    );



    subtitle.setAlignment(

      DocumentApp.HorizontalAlignment.CENTER

    );





    const note =

      body.appendParagraph(

        'Dokumen ini dibuat otomatis sebagai arsip digital berdasarkan data aktivasi tenant. ' +

        'Kontrak fisik yang telah ditandatangani disimpan sebagai arsip fisik terpisah.'

      );



    note.setItalic(true);



    note.setAlignment(

      DocumentApp.HorizontalAlignment.CENTER

    );





    body.appendParagraph('');





    const dataHeading =

      body.appendParagraph(

        'DATA PERJANJIAN'

      );



    dataHeading.setHeading(

      DocumentApp.ParagraphHeading.HEADING2

    );





    const dataRows = [



      [

        'Kontrak ID',

        contractId

      ],



      [

        'Tenant ID',

        tenantId

      ],



      [

        'Nama Lengkap',

        data.name

      ],



      [

        'Nama Panggilan',

        data.nickname

      ],



      [

        'No. WhatsApp',

        data.phone

      ],



      [

        'Email',

        data.email

      ],



      [

        'NIK KTP',

        data.nik

      ],



      [

        'Pekerjaan',

        data.occupation

      ],



      [

        'Perusahaan / Instansi',

        data.company

      ],



      [

        'Jenis Kelamin',

        data.gender

      ],



      [

        'Alamat',

        data.address

      ],



      [

        'Kontak Darurat',

        data.emergencyName

      ],



      [

        'Hubungan Kontak Darurat',

        data.emergencyRelation

      ],



      [

        'No. HP Kontak Darurat',

        data.emergencyPhone

      ],



      [

        'No. Kamar',

        data.room

      ],



      [

        'Tanggal Mulai',

        djApiFormatContractDateV1_(

          data.startDate

        )

      ],



      [

        'Tanggal Berakhir',

        djApiFormatContractDateV1_(

          data.endDate

        )

      ],



      [

        'Harga Sewa',

        djApiFormatRupiahV1_(

          data.rent

        )

      ],



      [

        'Deposit',

        djApiFormatRupiahV1_(

          data.deposit

        )

      ],



      [

        'Versi Perjanjian',

        agreementVersion

      ],



      [

        'Tanggal Aktivasi',

        djApiFormatContractDateV1_(

          data.activationDate

        )

      ]



    ];





    const table =

      body.appendTable(



        dataRows.map(

          function(row) {



            return [



              String(

                row[0] || ''

              ),



              String(

                row[1] || '—'

              )



            ];



          }

        )



      );





    for (

      let r = 0;

      r < table.getNumRows();

      r++

    ) {



      table

        .getCell(r, 0)

        .getChild(0)

        .asParagraph()

        .editAsText()

        .setBold(true);



    }





    body.appendParagraph('');





    const agreementHeading =

      body.appendParagraph(

        'ISI PERJANJIAN SEWA'

      );



    agreementHeading.setHeading(

      DocumentApp.ParagraphHeading.HEADING2

    );





    const lines =

      djApiAgreementHtmlToLinesV1_(

        agreementHtml

      );





    lines.forEach(

      function(line) {



        const text =

          String(line || '').trim();





        if (!text) {



          body.appendParagraph('');



          return;



        }





        if (

          /^PASAL\s+\d+/i.test(text)

        ) {



          const p =

            body.appendParagraph(text);



          p.setHeading(

            DocumentApp.ParagraphHeading.HEADING3

          );



          return;



        }





        if (

          /^DJ FAMILY KOST$/i.test(text) ||

          /PERJANJIAN SEWA/i.test(text)

        ) {



          const p =

            body.appendParagraph(text);



          p.setBold(true);



          return;



        }





        body.appendParagraph(

          text

        );



      }

    );





    body.appendParagraph('');





    const signatureHeading =

      body.appendParagraph(

        'TANDA TANGAN DIGITAL TENANT'

      );



    signatureHeading.setHeading(

      DocumentApp.ParagraphHeading.HEADING2

    );





    body.appendParagraph(

      'Tanda tangan digital yang diberikan saat proses aktivasi:'

    );





    const signatureBlob =

      djApiSignatureBlobV1_(

        signatureBase64

      );





    const signatureParagraph =

      body.appendParagraph('');





    const signatureImage =

      signatureParagraph.appendInlineImage(

        signatureBlob

      );





    signatureImage.setWidth(

      220

    );





    body.appendParagraph(

      'Tenant: ' +

      String(

        data.name || '—'

      )

    );





    body.appendParagraph(

      'Tenant ID: ' +

      tenantId

    );





    body.appendParagraph('');





    const archiveNote =

      body.appendParagraph(

        'Referensi arsip fisik: perjanjian fisik bertanda tangan yang diunggah pada saat aktivasi.'

      );



    archiveNote.setItalic(true);





    doc.saveAndClose();





    const tempFile =

      DriveApp.getFileById(

        tempDocId

      );





    const pdfBlob =

      tempFile

        .getAs(

          MimeType.PDF

        )

        .setName(

          fileNameBase + '.pdf'

        );





    const pdfFile =

      tenantFolder.createFile(

        pdfBlob

      );





    tempFile.setTrashed(

      true

    );





    return {



      ok: true,



      fileId:

        pdfFile.getId(),



      fileUrl:

        pdfFile.getUrl(),



      fileName:

        pdfFile.getName(),



      generatedAt:

        new Date()



    };





  } catch (err) {





    if (tempDocId) {



      try {



        DriveApp

          .getFileById(

            tempDocId

          )

          .setTrashed(

            true

          );



      } catch (cleanupError) {}



    }





    throw new Error(



      'Gagal membuat Kontrak Digital Arsip: ' +



      (

        err &&

        err.message

          ? err.message

          : 'unknown error'

      )



    );



  }



}





function djApiAgreementHtmlToLinesV1_(

  html

) {



  let text =

    String(

      html || ''

    );





  text =

    text



      .replace(

        /\<script[\s\S]*?<\\/script>/gi,

        ''

      )



      .replace(

        /\<style[\s\S]*?<\\/style>/gi,

        ''

      )



      .replace(

        /\<br\s*\\/?>/gi,

        '\n'

      )



      .replace(

        /\<li\b[^>]*>/gi,

        '• '

      )



      .replace(

        /<\\/li>/gi,

        '\n'

      )



      .replace(

        /<\\/(p|div|h1|h2|h3|h4|h5|h6)>/gi,

        '\n'

      )



      .replace(

        /<[^>]+>/g,

        ''

      )



      .replace(

        /&nbsp;/gi,

        ' '

      )



      .replace(

        /&amp;/gi,

        '&'

      )



      .replace(

        /&lt;/gi,

        '<'

      )



      .replace(

        /&gt;/gi,

        '>'

      )



      .replace(

        /&quot;/gi,

        '"'

      )



      .replace(

        /&#39;/gi,

        "'"

      );





  return text



    .split(

      /\r?\n+/

    )



    .map(

      function(line) {



        return line

          .replace(

            /[ \t]+/g,

            ' '

          )

          .trim();



      }

    )



    .filter(

      function(line) {



        return Boolean(

          line

        );



      }

    );



}





function djApiSignatureBlobV1_(

  signatureBase64

) {



  let value =

    String(

      signatureBase64 || ''

    ).trim();





  const comma =

    value.indexOf(',');





  if (

    comma >= 0

  ) {



    value =

      value.substring(

        comma + 1

      );



  }





  const bytes =

    Utilities.base64Decode(

      value

    );





  return Utilities.newBlob(



    bytes,



    'image/png',



    'tanda-tangan-digital.png'



  );



}





function djApiFormatContractDateV1_(

  value

) {



  if (!value) {



    return '—';



  }





  const date =

    value instanceof Date

      ? value

      : new Date(value);





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



    Session.getScriptTimeZone(),



    'dd/MM/yyyy HH:mm'



  );



}





function djApiFormatRupiahV1_(

  value

) {



  const amount =

    Number(

      value || 0

    );





  if (

    !isFinite(amount) ||

    amount <= 0

  ) {



    return '—';



  }





  return (

    'Rp ' +

    amount.toLocaleString(

      'id-ID'

    )

  );



}

/* ============================================================

 * DJ FAMILY KOST

 * BACKFILL KONTRAK DIGITAL UNTUK TENANT LAMA

 *

 * Fungsi ini hanya untuk migrasi satu kali.

 *

 * Yang dilakukan:

 * - mencari tenant AKTIF yang belum mempunyai kontrak digital

 * - mencari kontrak aktif tenant tersebut

 * - mengambil TTD digital yang sudah tersimpan

 * - mengambil isi kontrak V1.0 dari aktivasi.html

 * - membuat PDF Kontrak Digital Arsip

 * - menyimpan URL/ID/nama PDF ke Sheet Kontrak

 *

 * Tidak:

 * - membuat akun tenant baru

 * - mengubah Tenant ID

 * - mengubah kamar

 * - mengubah pembayaran

 * - mengubah status tenant

 * - menjalankan proses aktivasi ulang

 * ============================================================

 */



function djApiBackfillDigitalContractsForExistingTenantsV1_() {



  const lock =

    LockService.getScriptLock();





  lock.waitLock(

    30000

  );





  try {



    const ss =

      SpreadsheetApp

        .getActiveSpreadsheet();





    const tenantSheet =

      ss.getSheetByName(

        'Tenant'

      );





    const contractSheet =

      ss.getSheetByName(

        'Kontrak'

      );





    if (!tenantSheet) {

      throw new Error(

        'Sheet Tenant tidak ditemukan.'

      );

    }





    if (!contractSheet) {

      throw new Error(

        'Sheet Kontrak tidak ditemukan.'

      );

    }





    /*

     * Pastikan field arsip digital tersedia.

     */

    djApiEnsureSheetFieldsV5_(

      contractSheet,

      [

        'Kontrak_Digital_File_URL',

        'Kontrak_Digital_File_ID',

        'Kontrak_Digital_File_Name',

        'Tanggal_Generate_Digital'

      ]

    );





    const tenantTable =

      djApiReadTableV5_(

        tenantSheet,

        [

          'Tenant_ID'

        ]

      );





    const contractTable =

      djApiReadTableV5_(

        contractSheet,

        [

          'Kontrak_ID'

        ]

      );





    if (!tenantTable) {

      throw new Error(

        'Data Tenant tidak dapat dibaca.'

      );

    }





    if (!contractTable) {

      throw new Error(

        'Data Kontrak tidak dapat dibaca.'

      );

    }





    /*

     * Ambil isi kontrak yang benar-benar digunakan

     * pada halaman aktivasi saat ini.

     *

     * Tenant lama menggunakan V1.0.

     */

    const agreementHtml =

      djApiFetchActivationAgreementHtmlV1_();





    const results = [];





    let generatedCount = 0;

    let skippedCount = 0;

    let errorCount = 0;





    tenantTable.rows.forEach(

      function(

        tenantRow,

        tenantIndex

      ) {





        const tenantId =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Tenant_ID'

              ]

            ) || ''

          ).trim();





        if (!tenantId) {

          return;

        }





        const tenantStatus =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Status_Tenant',

                'Status'

              ]

            ) || ''

          )

          .trim()

          .toUpperCase();





        /*

         * Hanya tenant aktif.

         */

        if (

          tenantStatus !==

          'AKTIF'

        ) {



          return;



        }





        const existingDigitalUrl =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Kontrak_Digital_File_URL'

              ]

            ) || ''

          ).trim();





        /*

         * Tenant sheet saat ini belum mempunyai

         * field tersebut. Cek juga Sheet Kontrak.

         */





        let matchingContractIndex =

          -1;





        for (

          let i = 0;

          i < contractTable.rows.length;

          i++

        ) {



          const row =

            contractTable.rows[i];





          const rowTenantId =

            String(

              djApiValueV5_(

                row,

                contractTable.headers,

                [

                  'Tenant_ID'

                ]

              ) || ''

            ).trim();





          const rowStatus =

            String(

              djApiValueV5_(

                row,

                contractTable.headers,

                [

                  'Status_Kontrak'

                ]

              ) || ''

            )

            .trim()

            .toUpperCase();





          if (

            rowTenantId ===

              tenantId &&

            (

              rowStatus ===

                'AKTIF' ||

              rowStatus ===

                ''

            )

          ) {



            matchingContractIndex =

              i;



            break;



          }



        }





        if (

          matchingContractIndex <

          0

        ) {



          errorCount++;



          results.push({



            tenantId:

              tenantId,



            status:

              'ERROR',



            message:

              'Kontrak tenant tidak ditemukan.'



          });



          return;



        }





        const contractRow =

          contractTable.rows[

            matchingContractIndex

          ];





        const contractSheetRow =

          contractTable.headerRow +

          matchingContractIndex +

          1;





        const digitalUrl =

          String(

            djApiValueV5_(

              contractRow,

              contractTable.headers,

              [

                'Kontrak_Digital_File_URL'

              ]

            ) || ''

          ).trim();





        if (

          digitalUrl ||

          existingDigitalUrl

        ) {



          skippedCount++;



          results.push({



            tenantId:

              tenantId,



            status:

              'SKIPPED',



            message:

              'Kontrak Digital Arsip sudah tersedia.'



          });



          return;



        }





        /*

         * Ambil seluruh data tenant.

         */



        const name =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Nama_Lengkap'

              ]

            ) || ''

          ).trim();





        const nickname =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Nama_Panggilan'

              ]

            ) || ''

          ).trim();





        const phone =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'No_HP'

              ]

            ) || ''

          ).trim();





        const email =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Email'

              ]

            ) || ''

          ).trim();





        const nik =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'NIK_KTP'

              ]

            ) || ''

          ).trim();





        const occupation =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Pekerjaan'

              ]

            ) || ''

          ).trim();





        const company =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Perusahaan_Instansi'

              ]

            ) || ''

          ).trim();





        const gender =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Jenis_Kelamin'

              ]

            ) || ''

          ).trim();





        const address =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Alamat'

              ]

            ) || ''

          ).trim();





        const emergencyName =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Kontak_Darurat'

              ]

            ) || ''

          ).trim();





        const emergencyRelation =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Hubungan_Kontak_Darurat'

              ]

            ) || ''

          ).trim();





        const emergencyPhone =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'No_HP_Kontak_Darurat'

              ]

            ) || ''

          ).trim();





        const room =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'No_Kamar'

              ]

            ) || ''

          ).trim();





        const startDate =

          djApiValueV5_(

            contractRow,

            contractTable.headers,

            [

              'Tanggal_Mulai'

            ]

          ) ||

          djApiValueV5_(

            tenantRow,

            tenantTable.headers,

            [

              'Tanggal_Mulai',

              'Rencana_Mulai_Sewa'

            ]

          );





        const endDate =

          djApiValueV5_(

            contractRow,

            contractTable.headers,

            [

              'Tanggal_Berakhir'

            ]

          );





        const rent =

          djApiNumberV5_(

            djApiValueV5_(

              contractRow,

              contractTable.headers,

              [

                'Harga_Sewa'

              ]

            )

          );





        const deposit =

          djApiNumberV5_(

            djApiValueV5_(

              contractRow,

              contractTable.headers,

              [

                'Deposit'

              ]

            )

          ) ||

          300000;





        const actualAgreementVersion =

          String(

            djApiValueV5_(

              contractRow,

              contractTable.headers,

              [

                'Versi_Perjanjian'

              ]

            ) ||

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Versi_Perjanjian'

              ]

            ) ||

            'PERJANJIAN-SEWA-2026-V1.0'

          ).trim();





        /*

         * Tenant lama harus memakai V1.0.

         * Jangan membuat arsip versi berbeda untuk

         * kontrak historis.

         */

        if (

          actualAgreementVersion !==

          'PERJANJIAN-SEWA-2026-V1.0'

        ) {



          errorCount++;



          results.push({



            tenantId:

              tenantId,



            status:

              'ERROR',



            message:

              'Versi kontrak tenant bukan V1.0: ' +

              actualAgreementVersion



          });



          return;



        }





        /*

         * Cari file tanda tangan digital.

         */

        let signatureFileId =

          String(

            djApiValueV5_(

              tenantRow,

              tenantTable.headers,

              [

                'Tanda_Tangan_File_ID'

              ]

            ) || ''

          ).trim();





        if (!signatureFileId) {



          const signatureUrl =

            String(

              djApiValueV5_(

                tenantRow,

                tenantTable.headers,

                [

                  'Tanda_Tangan_File_URL',

                  'Tanda_Tangan_URL'

                ]

              ) || ''

            ).trim();





          if (signatureUrl) {



            signatureFileId =

              djApiExtractDriveIdV5_(

                signatureUrl

              );



          }



        }





        if (!signatureFileId) {



          errorCount++;



          results.push({



            tenantId:

              tenantId,



            status:

              'ERROR',



            message:

              'File tanda tangan digital tidak ditemukan.'



          });



          return;



        }





        let signatureBase64 =

          '';





        try {



          const signatureFile =

            DriveApp.getFileById(

              signatureFileId

            );





          signatureBase64 =

            Utilities.base64Encode(

              signatureFile

                .getBlob()

                .getBytes()

            );



        } catch (signatureError) {



          errorCount++;



          results.push({



            tenantId:

              tenantId,



            status:

              'ERROR',



            message:

              'Tanda tangan digital tidak dapat dibaca: ' +

              (

                signatureError.message ||

                'unknown error'

              )



          });



          return;



        }





        /*

         * Buat Kontrak Digital Arsip.

         */

        let digitalContract;





        try {



          digitalContract =

            djApiGenerateDigitalContractArchiveV1_({



              tenantId:

                tenantId,



              contractId:

                djApiValueV5_(

                  contractRow,

                  contractTable.headers,

                  [

                    'Kontrak_ID'

                  ]

                ),



              agreementVersion:

                actualAgreementVersion,



              agreementHtml:

                agreementHtml,



              signatureBase64:

                signatureBase64,



              name:

                name,



              nickname:

                nickname,



              phone:

                phone,



              email:

                email,



              nik:

                nik,



              occupation:

                occupation,



              company:

                company,



              gender:

                gender,



              address:

                address,



              emergencyName:

                emergencyName,



              emergencyRelation:

                emergencyRelation,



              emergencyPhone:

                emergencyPhone,



              room:

                room,



              startDate:

                startDate,



              endDate:

                endDate,



              rent:

                rent,



              deposit:

                deposit,



              activationDate:

                djApiValueV5_(

                  tenantRow,

                  tenantTable.headers,

                  [

                    'Tanggal_Persetujuan_Perjanjian',

                    'Created_At'

                  ]

                )



            });



        } catch (generatorError) {



          errorCount++;



          results.push({



            tenantId:

              tenantId,



            status:

              'ERROR',



            message:

              generatorError.message ||

              'Gagal membuat kontrak digital.'



          });



          return;



        }





        if (

          !digitalContract ||

          !digitalContract.ok

        ) {



          errorCount++;



          results.push({



            tenantId:

              tenantId,



            status:

              'ERROR',



            message:

              'Generator tidak mengembalikan file kontrak digital.'



          });



          return;



        }





        /*

         * Simpan referensi PDF ke Sheet Kontrak.

         */

        const contractHeaders =

          djApiFindHeadersV5_(

            contractSheet

          );





        djApiUpdateRowV5_(

          contractSheet,

          contractSheetRow,

          contractHeaders,

          {



            Kontrak_Digital_File_URL:

              digitalContract.fileUrl,



            Kontrak_Digital_File_ID:

              digitalContract.fileId,



            Kontrak_Digital_File_Name:

              digitalContract.fileName,



            Tanggal_Generate_Digital:

              digitalContract.generatedAt



          }

        );





        generatedCount++;





        results.push({



          tenantId:

            tenantId,



          status:

            'GENERATED',



          fileName:

            digitalContract.fileName,



          fileUrl:

            digitalContract.fileUrl



        });





      }

    );





    SpreadsheetApp.flush();





    Logger.log(

      '========================================'

    );





    Logger.log(

      'BACKFILL KONTRAK DIGITAL DJ FAMILY KOST'

    );





    Logger.log(

      'Generated : ' +

      generatedCount

    );





    Logger.log(

      'Skipped   : ' +

      skippedCount

    );





    Logger.log(

      'Errors    : ' +

      errorCount

    );





    results.forEach(

      function(item) {



        Logger.log(

          JSON.stringify(

            item

          )

        );



      }

    );





    return {



      ok:

        errorCount === 0,



      generated:

        generatedCount,



      skipped:

        skippedCount,



      errors:

        errorCount,



      items:

        results



    };





  } finally {



    lock.releaseLock();



  }



}





/* ============================================================

 * AMBIL ISI PERJANJIAN DARI AKTIVASI.HTML

 *

 * Digunakan khusus untuk backfill tenant lama.

 *

 * ============================================================

 */



function djApiFetchActivationAgreementHtmlV1_() {



  const url =

    'https\://raw\.githubusercontent.com/lipinazzz-sudo/KOST-DJ/main/aktivasi.html';





  const response =

    UrlFetchApp.fetch(

      url,

      {

        muteHttpExceptions:

          true,



        followRedirects:

          true

      }

    );





  const status =

    response.getResponseCode();





  if (

    status !==

    200

  ) {



    throw new Error(

      'aktivasi.html tidak dapat diambil dari repository. HTTP ' +

      status

    );



  }





  const html =

    response.getContentText();





  const startMarker =

    '\<div id="agreementBox"';





  const endMarker =

    '\<div id="agreementEnd"';





  const startIndex =

    html.indexOf(

      startMarker

    );





  const endIndex =

    html.indexOf(

      endMarker

    );





  if (

    startIndex <

    0 ||

    endIndex <

    0 ||

    endIndex <=

    startIndex

  ) {



    throw new Error(

      'Bagian Perjanjian Sewa pada aktivasi.html tidak ditemukan.'

    );



  }





  const startTagEnd =

    html.indexOf(

      '>',

      startIndex

    );





  if (

    startTagEnd <

    0 ||

    startTagEnd >=

    endIndex

  ) {



    throw new Error(

      'Struktur agreementBox pada aktivasi.html tidak valid.'

    );



  }





  const agreementHtml =

    html.substring(

      startTagEnd + 1,

      endIndex

    ).trim();





  if (!agreementHtml) {



    throw new Error(

      'Isi Perjanjian Sewa kosong.'

    );



  }





  return agreementHtml;



}