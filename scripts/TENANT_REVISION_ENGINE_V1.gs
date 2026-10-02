/* ============================================================

 * DJ FAMILY KOST

 * TENANT_REVISION_ENGINE_V1

 * ============================================================

 *

 * Fungsi:

 * - Tenant dapat mengajukan perubahan data tertentu.

 * - Master dapat meminta field tertentu diperbaiki.

 * - Semua perubahan masuk ke sheet Tenant_Data_Revision.

 * - Data aktif Tenant TIDAK berubah sebelum Master menyetujui.

 * - Tenant ID, kamar, harga sewa, status tenant, dll tidak dapat

 *   diedit melalui engine ini.

 *

 * ============================================================

 */





/* ============================================================

 * CONFIG

 * ============================================================

 */



const DJ_REVISION_SHEET_V1_ =

  'Tenant_Data_Revision';





const DJ_REVISION_HEADERS_V1_ = [



  'Revision_ID',



  'Tenant_ID',



  'Field',



  'Field_Type',



  'Data_Lama',



  'Data_Baru',



  'File_Lama_ID',



  'File_Lama_URL',



  'File_Baru_ID',



  'File_Baru_URL',



  'File_Baru_Name',



  'Alasan_Master',



  'Keterangan_Tenant',



  'Status',



  'Diajukan_At',



  'Diverifikasi_At',



  'Verified_By',



  'Catatan_Master'



];





/* ============================================================

 * FIELD YANG BOLEH DIAJUKAN PERUBAHAN

 * ============================================================

 *

 * Field dikendalikan SERVER.

 *

 * Field yang tidak tercantum di sini tidak boleh dimodifikasi

 * melalui workflow revisi.

 *

 * ============================================================

 */



function djRevisionFieldConfigV1_() {



  return {



    Nama_Lengkap: {



      key:

        'Nama_Lengkap',



      label:

        'Nama Lengkap',



      inputLabel:

        'Nama Lengkap Baru',



      type:

        'text',



      headers:

        [

          'Nama_Lengkap'

        ]



    },





    Nama_Panggilan: {



      key:

        'Nama_Panggilan',



      label:

        'Nama Panggilan',



      inputLabel:

        'Nama Panggilan Baru',



      type:

        'text',



      headers:

        [

          'Nama_Panggilan'

        ]



    },





    No_HP: {



      key:

        'No_HP',



      label:

        'No. WhatsApp',



      inputLabel:

        'No. WhatsApp Baru',



      type:

        'phone',



      headers:

        [

          'No_HP'

        ]



    },





    Email: {



      key:

        'Email',



      label:

        'Email',



      inputLabel:

        'Email Baru',



      type:

        'email',



      headers:

        [

          'Email'

        ]



    },





    Pekerjaan: {



      key:

        'Pekerjaan',



      label:

        'Pekerjaan',



      inputLabel:

        'Pekerjaan Baru',



      type:

        'text',



      headers:

        [

          'Pekerjaan'

        ]



    },





    Perusahaan_Instansi: {



      key:

        'Perusahaan_Instansi',



      label:

        'Perusahaan / Instansi',



      inputLabel:

        'Perusahaan / Instansi Baru',



      type:

        'text',



      headers:

        [

          'Perusahaan_Instansi'

        ]



    },





    Kontak_Darurat: {



      key:

        'Kontak_Darurat',



      label:

        'Kontak Darurat',



      inputLabel:

        'Nama Kontak Darurat',



      type:

        'text',



      headers:

        [

          'Kontak_Darurat'

        ]



    },





    Hubungan_Kontak_Darurat: {



      key:

        'Hubungan_Kontak_Darurat',



      label:

        'Hubungan Kontak Darurat',



      inputLabel:

        'Hubungan Baru',



      type:

        'text',



      headers:

        [

          'Hubungan_Kontak_Darurat'

        ]



    },





    No_HP_Kontak_Darurat: {



      key:

        'No_HP_Kontak_Darurat',



      label:

        'No. HP Kontak Darurat',



      inputLabel:

        'No. HP Baru',



      type:

        'phone',



      headers:

        [

          'No_HP_Kontak_Darurat'

        ]



    },





  KTP: {



    key:

      'KTP',



    label:

      'Foto KTP',



    inputLabel:

      'Foto KTP Baru',



    type:

      'file',



    urlHeaders:

      [

        'KTP_File_URL'

      ],



    idHeaders:

      [

        'KTP_File_ID'

      ],



    nameHeaders:

      [

        'KTP_File_Name'

      ],



    category:

      'Data Diri',



    prefix:

      'REV-KTP'



  },





  Surat_Perjanjian: {



    key:

      'Surat_Perjanjian',



    label:

      'Foto Surat Perjanjian',



    inputLabel:

      'Foto Surat Perjanjian Baru',



    type:

      'file',



    urlHeaders:

      [

        'Surat_Perjanjian_File_URL'

      ],



    idHeaders:

      [

        'Surat_Perjanjian_File_ID'

      ],



    nameHeaders:

      [

        'Surat_Perjanjian_File_Name'

      ],



    category:

      'Perjanjian Sewa',



    prefix:

      'REV-PERJANJIAN-SEWA'



  }



  };



}





/* ============================================================

 * SETUP SHEET

 * ============================================================

 *

 * Jalankan SATU KALI secara manual.

 *

 * Tidak menghapus sheet/data lama.

 *

 * ============================================================

 */



function setupTenantDataRevisionV1() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  let sheet =

    ss.getSheetByName(

      DJ_REVISION_SHEET_V1_

    );





  if (!sheet) {



    sheet =

      ss.insertSheet(

        DJ_REVISION_SHEET_V1_

      );



    sheet

      .getRange(

        1,

        1,

        1,

        DJ_REVISION_HEADERS_V1_.length

      )

      .setValues(

        [

          DJ_REVISION_HEADERS_V1_

        ]

      );



    sheet

      .setFrozenRows(

        1

      );



  } else {



    if (

      sheet.getLastRow() ===

      0

    ) {



      sheet

        .getRange(

          1,

          1,

          1,

          DJ_REVISION_HEADERS_V1_.length

        )

        .setValues(

          [

            DJ_REVISION_HEADERS_V1_

          ]

        );



    } else {



      djApiEnsureSheetFieldsV5_(

        sheet,

        DJ_REVISION_HEADERS_V1_

      );



    }



  }





  SpreadsheetApp.flush();





  return {



    ok:

      true,



    sheet:

      DJ_REVISION_SHEET_V1_,



    message:

      'Sheet Tenant_Data_Revision siap digunakan.'



  };



}





/* ============================================================

 * SHEET

 * ============================================================

 */



function djRevisionGetSheetV1_() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const sheet =

    ss.getSheetByName(

      DJ_REVISION_SHEET_V1_

    );





  if (!sheet) {



    throw new Error(

      'Sheet Tenant_Data_Revision belum dibuat. Jalankan setupTenantDataRevisionV1() satu kali.'

    );



  }





  return sheet;



}





/* ============================================================

 * CONFIG LOOKUP

 * ============================================================

 */



function djRevisionGetConfigV1_(

  field

) {



  const config =

    djRevisionFieldConfigV1_();





  return (

    config[

      String(

        field ||

        ''

      ).trim()

    ] ||

    null

  );



}





/* ============================================================

 * TENANT CONTEXT

 * ============================================================

 */



function djRevisionGetTenantContextV1_(

  tenantId

) {



  tenantId =

    String(

      tenantId ||

      ''

    )

    .trim()

    .toUpperCase();





  if (!tenantId) {



    throw new Error(

      'Tenant ID wajib diisi.'

    );



  }





  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();





  const sheet =

    ss.getSheetByName(

      'Tenant'

    );





  if (!sheet) {



    throw new Error(

      'Sheet Tenant tidak ditemukan.'

    );



  }





  const table =

    djApiReadTableV5_(

      sheet,

      [

        'Tenant_ID'

      ]

    );





  if (!table) {



    throw new Error(

      'Data Tenant tidak dapat dibaca.'

    );



  }





  const rowNumber =

    djApiFindRowV5_(

      table,

      [

        'Tenant_ID'

      ],

      tenantId

    );





  if (

    rowNumber <

    0

  ) {



    throw new Error(

      'Tenant tidak ditemukan: ' +

      tenantId

    );



  }





  const headers =

    djApiFindHeadersV5_(

      sheet

    );





  const values =

    sheet

      .getRange(

        rowNumber,

        1,

        1,

        headers.length

      )

      .getValues()[0];





  return {



    ss:

      ss,



    sheet:

      sheet,



    table:

      table,



    rowNumber:

      rowNumber,



    headers:

      headers,



    values:

      values,



    tenantId:

      tenantId



  };



}





/* ============================================================

 * FIELD EXISTS

 * ============================================================

 */



function djRevisionFieldExistsV1_(

  headers,

  aliases

) {



  return (

    djApiFindColumnV5_(

      headers,

      aliases

    ) >=

    0

  );



}





/* ============================================================

 * CURRENT FIELD VALUE

 * ============================================================

 */



function djRevisionCurrentFieldV1_(

  context,

  config

) {



  if (

    config.type ===

    'file'

  ) {



    const url =

      String(

        djApiValueV5_(

          context.values,

          context.headers,

          config.urlHeaders

        ) ||

        ''

      ).trim();





    const id =

      String(

        djApiValueV5_(

          context.values,

          context.headers,

          config.idHeaders

        ) ||

        ''

      ).trim();





    const name =

      String(

        djApiValueV5_(

          context.values,

          context.headers,

          config.nameHeaders

        ) ||

        ''

      ).trim();





    return {



      value:

        url,



      displayValue:

        name ||

        (

          url

            ? 'Dokumen tersimpan'

            : ''

        ),



      fileId:

        id,



      fileUrl:

        url,



      fileName:

        name



    };



  }





  const value =

    djApiValueV5_(

      context.values,

      context.headers,

      config.headers

    );





  return {



    value:

      String(

        value == null

          ? ''

          : value

      ).trim(),



    displayValue:

      String(

        value == null

          ? ''

          : value

      ).trim(),



    fileId:

      '',



    fileUrl:

      '',



    fileName:

      ''



  };



}





/* ============================================================

 * REVISION TABLE

 * ============================================================

 */



function djRevisionReadTableV1_() {



  const sheet =

    djRevisionGetSheetV1_();





  return djApiReadTableV5_(

    sheet,

    [

      'Revision_ID',

      'Tenant_ID',

      'Field',

      'Status'

    ]

  );



}





/* ============================================================

 * ROW -> OBJECT

 * ============================================================

 */



function djRevisionRowObjectV1_(

  row,

  headers

) {



  return {



    revisionId:

      djApiValueV5_(

        row,

        headers,

        [

          'Revision_ID'

        ]

      ),



    tenantId:

      djApiValueV5_(

        row,

        headers,

        [

          'Tenant_ID'

        ]

      ),



    field:

      djApiValueV5_(

        row,

        headers,

        [

          'Field'

        ]

      ),



    fieldType:

      djApiValueV5_(

        row,

        headers,

        [

          'Field_Type'

        ]

      ),



    oldValue:

      djApiValueV5_(

        row,

        headers,

        [

          'Data_Lama'

        ]

      ),



    newValue:

      djApiValueV5_(

        row,

        headers,

        [

          'Data_Baru'

        ]

      ),



    oldFileId:

      djApiValueV5_(

        row,

        headers,

        [

          'File_Lama_ID'

        ]

      ),



    oldFileUrl:

      djApiValueV5_(

        row,

        headers,

        [

          'File_Lama_URL'

        ]

      ),



    newFileId:

      djApiValueV5_(

        row,

        headers,

        [

          'File_Baru_ID'

        ]

      ),



    newFileUrl:

      djApiValueV5_(

        row,

        headers,

        [

          'File_Baru_URL'

        ]

      ),



    newFileName:

      djApiValueV5_(

        row,

        headers,

        [

          'File_Baru_Name'

        ]

      ),



    masterReason:

      djApiValueV5_(

        row,

        headers,

        [

          'Alasan_Master'

        ]

      ),



    tenantNote:

      djApiValueV5_(

        row,

        headers,

        [

          'Keterangan_Tenant'

        ]

      ),



    status:

      String(

        djApiValueV5_(

          row,

          headers,

          [

            'Status'

          ]

        ) ||

        ''

      )

      .trim()

      .toUpperCase(),



    submittedAt:

      djApiValueV5_(

        row,

        headers,

        [

          'Diajukan_At'

        ]

      ),



    verifiedAt:

      djApiValueV5_(

        row,

        headers,

        [

          'Diverifikasi_At'

        ]

      ),



    verifiedBy:

      djApiValueV5_(

        row,

        headers,

        [

          'Verified_By'

        ]

      ),



    masterNote:

      djApiValueV5_(

        row,

        headers,

        [

          'Catatan_Master'

        ]

      )



  };



}





/* ============================================================

 * LATEST PENDING REVISION

 * ============================================================

 */



function djRevisionLatestPendingV1_(

  table,

  tenantId,

  field

) {



  if (!table) {



    return null;



  }





  let latest =

    null;





  const targetTenant =

    String(

      tenantId ||

      ''

    ).trim().toUpperCase();





  const targetField =

    String(

      field ||

      ''

    ).trim();





  table.rows.forEach(

    function(row) {



      const item =

        djRevisionRowObjectV1_(

          row,

          table.headers

        );





      if (

        String(

          item.tenantId ||

          ''

        ).trim().toUpperCase()

        !==

        targetTenant

      ) {



        return;



      }





      if (

        String(

          item.field ||

          ''

        ).trim()

        !==

        targetField

      ) {



        return;



      }





      if (

        item.status !==

          'PERLU DIPERBAIKI' &&

        item.status !==

          'MENUNGGU VERIFIKASI'

      ) {



        return;



      }





      latest =

        item;



    }

  );





  return latest;



}





/* ============================================================

 * TENANT FIELD BUILD

 * ============================================================

 */



function djRevisionBuildTenantFieldsV1_(

  tenantId

) {



  const context =

    djRevisionGetTenantContextV1_(

      tenantId

    );





  const revisionTable =

    djRevisionReadTableV1_();





  const config =

    djRevisionFieldConfigV1_();





  const fields =

    [];





  Object.keys(

    config

  )

  .forEach(

    function(key) {



      const item =

        config[key];





      const exists =

        item.type ===

          'file'



          ? (

              djRevisionFieldExistsV1_(

                context.headers,

                item.urlHeaders

              ) ||

              djRevisionFieldExistsV1_(

                context.headers,

                item.idHeaders

              ) ||

              djRevisionFieldExistsV1_(

                context.headers,

                item.nameHeaders

              )

            )



          : djRevisionFieldExistsV1_(

              context.headers,

              item.headers

            );





      if (!exists) {



        return;



      }





      const current =

        djRevisionCurrentFieldV1_(

          context,

          item

        );





      const revision =

        djRevisionLatestPendingV1_(

          revisionTable,

          tenantId,

          key

        );





      let status =

        current.displayValue

          ? 'LENGKAP'

          : 'BELUM LENGKAP';





      let reason =

        '';





      if (revision) {



        status =

          revision.status;



        reason =

          revision.masterReason ||

          '';



      }





      fields.push({



        key:

          key,



        label:

          item.label,



        inputLabel:

          item.inputLabel,



        type:

          item.type,



        value:

          current.value,



        displayValue:

          current.displayValue,



        status:

          status,



        reason:

          reason,



        editable:

          true,



        revisionId:

          revision

            ? revision.revisionId

            : '',



        pendingRevision:

          revision

            ? {

                revisionId:

                  revision.revisionId,



                status:

                  revision.status

              }

            : null



      });



    }

  );





  return fields;



}





/* ============================================================

 * MASTER TENANT DETAIL

 * ============================================================

 */



function djApiMasterTenantDetailRevisionV1_(

  tenantId

) {



  const context =

    djRevisionGetTenantContextV1_(

      tenantId

    );





  const fields =

    djRevisionBuildTenantFieldsV1_(

      tenantId

    );





  return {



    tenant: {



      tenantId:

        tenantId,



      name:

        String(

          djApiValueV5_(

            context.values,

            context.headers,

            [

              'Nama_Lengkap'

            ]

          ) ||

          ''

        ),



      room:

        String(

          djApiValueV5_(

            context.values,

            context.headers,

            [

              'No_Kamar'

            ]

          ) ||

          ''

        ),



      phone:

        String(

          djApiValueV5_(

            context.values,

            context.headers,

            [

              'No_HP'

            ]

          ) ||

          ''

        ),



      email:

        String(

          djApiValueV5_(

            context.values,

            context.headers,

            [

              'Email'

            ]

          ) ||

          ''

        )



    },



    fields:

      fields



  };



}





/* ============================================================

 * MASTER REQUEST REVISION

 * ============================================================

 */



function djApiMasterRequestRevisionV1_(

  tenantId,

  field,

  reason

) {



  tenantId =

    String(

      tenantId ||

      ''

    ).trim().toUpperCase();





  field =

    String(

      field ||

      ''

    ).trim();





  reason =

    String(

      reason ||

      ''

    ).trim();





  if (!reason) {



    return {



      ok:

        false,



      error:

        'Alasan perbaikan wajib diisi.'



    };



  }





  const config =

    djRevisionGetConfigV1_(

      field

    );





  if (!config) {



    return {



      ok:

        false,



      error:

        'Field tersebut tidak dapat diperbaiki melalui sistem.'



    };



  }





  const context =

    djRevisionGetTenantContextV1_(

      tenantId

    );





  const revisionSheet =

    djRevisionGetSheetV1_();





  const revisionTable =

    djRevisionReadTableV1_();





  const existing =

    djRevisionLatestPendingV1_(

      revisionTable,

      tenantId,

      field

    );





  if (

    existing &&

    existing.status ===

      'MENUNGGU VERIFIKASI'

  ) {



    return {



      ok:

        false,



      error:

        'Perubahan field tersebut masih menunggu verifikasi Master.'



    };



  }





  const current =

    djRevisionCurrentFieldV1_(

      context,

      config

    );





  const now =

    new Date();





  if (

    existing &&

    existing.status ===

      'PERLU DIPERBAIKI'

  ) {



    const rowNumber =

      djApiFindRowV5_(

        revisionTable,

        [

          'Revision_ID'

        ],

        existing.revisionId

      );





    if (

      rowNumber <

      0

    ) {



      throw new Error(

        'Revision lama tidak ditemukan.'

      );



    }





    const headers =

      djApiFindHeadersV5_(

        revisionSheet

      );





    djApiUpdateRowV5_(

      revisionSheet,

      rowNumber,

      headers,

      {



        Alasan_Master:

          reason,



        Status:

          'PERLU DIPERBAIKI',



        Diajukan_At:

          now



      }

    );





    SpreadsheetApp.flush();





    return {



      ok:

        true,



      revisionId:

        existing.revisionId,



      message:

        'Permintaan perbaikan diperbarui.'



    };



  }





  const revisionId =

    djApiNextPrefixedIdV1_(

      revisionTable,

      'Revision_ID',

      'REV-'

    );





  const dataLama =

    String(

      current.displayValue ||

      ''

    );





  const dataBaru =

    '';





  djApiAppendRowV5_(

    revisionSheet,

    djApiFindHeadersV5_(

      revisionSheet

    ),

    {



      Revision_ID:

        revisionId,



      Tenant_ID:

        tenantId,



      Field:

        field,



      Field_Type:

        config.type,



      Data_Lama:

        dataLama,



      Data_Baru:

        dataBaru,



      File_Lama_ID:

        current.fileId,



      File_Lama_URL:

        current.fileUrl,



      File_Baru_ID:

        '',



      File_Baru_URL:

        '',



      File_Baru_Name:

        '',



      Alasan_Master:

        reason,



      Keterangan_Tenant:

        '',



      Status:

        'PERLU DIPERBAIKI',



      Diajukan_At:

        now,



      Diverifikasi_At:

        '',



      Verified_By:

        '',



      Catatan_Master:

        ''



    }

  );





  SpreadsheetApp.flush();





  return {



    ok:

      true,



    revisionId:

      revisionId,



    message:

      'Permintaan perbaikan berhasil dibuat.'



  };



}





/* ============================================================

 * TENANT SUBMIT REVISION

 * ============================================================

 */



function djApiSubmitTenantRevisionV1_(

  tenant,

  body

) {



  const tenantId =

    String(

      tenant &&

      tenant.tenantId ||

      ''

    ).trim().toUpperCase();





  const field =

    String(

      body &&

      body.field ||

      ''

    ).trim();





  const config =

    djRevisionGetConfigV1_(

      field

    );





  if (!config) {



    return {



      ok:

        false,



      error:

        'Field tidak dapat diubah melalui portal tenant.'



    };



  }





  const context =

    djRevisionGetTenantContextV1_(

      tenantId

    );





  const revisionSheet =

    djRevisionGetSheetV1_();





  const revisionTable =

    djRevisionReadTableV1_();





  const currentRevision =

    djRevisionLatestPendingV1_(

      revisionTable,

      tenantId,

      field

    );





  if (

    currentRevision &&

    currentRevision.status ===

      'MENUNGGU VERIFIKASI'

  ) {



    return {



      ok:

        false,



      error:

        'Perubahan untuk data ini masih menunggu verifikasi Master.'



    };



  }





  const current =

    djRevisionCurrentFieldV1_(

      context,

      config

    );





  const lock =

    LockService

      .getScriptLock();





  lock.waitLock(

    30000

  );





  try {



    let newValue =

      '';



    let newFile =

      null;





    if (

      config.type ===

      'file'

    ) {



      const mimeType =

        String(

          body.fileMimeType ||

          ''

        ).toLowerCase();





      const allowedMime =

        [



          'image/jpeg',

          'image/png',

          'image/webp',

          'application/pdf'



        ];





      if (

        allowedMime.indexOf(

          mimeType

        ) <

        0

      ) {



        return {



          ok:

            false,



          error:

            'Format file tidak didukung.'



        };



      }





      const base64 =

        String(

          body.fileBase64 ||

          ''

        )

        .trim();





      if (!base64) {



        return {



          ok:

            false,



          error:

            'File baru wajib dipilih.'



        };



      }





      newFile =

        djApiSaveActivationFileV1_(

          context.ss,

          config.category,

          tenantId,

          base64,

          mimeType,

          String(

            body.fileOriginalName ||

            ''

          ).trim(),

          config.prefix

        );





      if (

        !newFile ||

        !newFile.ok

      ) {



        return {



          ok:

            false,



          error:

            newFile &&

            newFile.error

              ? newFile.error

              : 'File gagal disimpan.'



        };



      }



    } else {



      newValue =

        String(

          body.newValue ||

          ''

        ).trim();





      if (!newValue) {



        return {



          ok:

            false,



          error:

            'Data baru wajib diisi.'



        };



      }





      if (

        config.type ===

        'email'

      ) {



        if (

          !/^[^\s@]+@[^\s@]+\\.[^\s@]+$/

            .test(

              newValue

            )

        ) {



          return {



            ok:

              false,



            error:

              'Format email tidak valid.'



          };



        }



      }





      if (

        config.type ===

        'phone'

      ) {



        newValue =

          djApiNormalizePhoneV1_(

            newValue

          );





        if (

          !/^0\d{8,15}$/.test(

            newValue

          )

        ) {



          return {



            ok:

              false,



            error:

              'Nomor WhatsApp/telepon tidak valid.'



          };



        }



      }





      if (

        String(

          current.value ||

          ''

        ).trim()

        \===

        newValue

      ) {



        return {



          ok:

            false,



          error:

            'Data baru sama dengan data saat ini.'



        };



      }



    }





    const now =

      new Date();





    /*

     * Kalau sebelumnya Master meminta perbaikan,

     * revision lama tidak ditimpa.

     *

     * Revision lama tetap tersimpan sebagai histori.

     * Revision baru menjadi revision aktif.

     */



    if (

      currentRevision &&

      currentRevision.status ===

        'PERLU DIPERBAIKI'

    ) {



      const oldRow =

        djApiFindRowV5_(

          revisionTable,

          [

            'Revision_ID'

          ],

          currentRevision.revisionId

        );





      if (

        oldRow >=

        0

      ) {



        const revisionHeaders =

          djApiFindHeadersV5_(

            revisionSheet

          );





        djApiUpdateRowV5_(

          revisionSheet,

          oldRow,

          revisionHeaders,

          {



            Status:

              'DIGANTI',



            Catatan_Master:

              'Digantikan oleh pengajuan revisi baru.'



          }

        );



      }



    }





    const freshRevisionTable =

      djRevisionReadTableV1_();





    const revisionId =

      djApiNextPrefixedIdV1_(

        freshRevisionTable,

        'Revision_ID',

        'REV-'

      );





    const masterReason =

      currentRevision &&

      currentRevision.status ===

        'PERLU DIPERBAIKI'



        ? (

            currentRevision.masterReason ||

            ''

          )



        : '';





    djApiAppendRowV5_(

      revisionSheet,

      djApiFindHeadersV5_(

        revisionSheet

      ),

      {



        Revision_ID:

          revisionId,



        Tenant_ID:

          tenantId,



        Field:

          field,



        Field_Type:

          config.type,



        Data_Lama:

          String(

            current.displayValue ||

            ''

          ),



        Data_Baru:

          config.type ===

            'file'

              ? (

                  newFile.fileName ||

                  ''

                )

              : newValue,



        File_Lama_ID:

          current.fileId,



        File_Lama_URL:

          current.fileUrl,



        File_Baru_ID:

          newFile

            ? newFile.fileId

            : '',



        File_Baru_URL:

          newFile

            ? newFile.fileUrl

            : '',



        File_Baru_Name:

          newFile

            ? newFile.fileName

            : '',



        Alasan_Master:

          masterReason,



        Keterangan_Tenant:

          String(

            body.note ||

            ''

          ).trim(),



        Status:

          'MENUNGGU VERIFIKASI',



        Diajukan_At:

          now,



        Diverifikasi_At:

          '',



        Verified_By:

          '',



        Catatan_Master:

          ''



      }

    );





    SpreadsheetApp.flush();





    try {



      djApiLogV5_(

        context.ss,

        'TENANT_DATA_REVISION',

        tenantId +

        ' mengajukan perubahan ' +

        field +

        ' dengan revision ' +

        revisionId

      );



    } catch (

      err

    ) {}





    return {



      ok:

        true,



      revisionId:

        revisionId,



      message:

        'Perubahan berhasil diajukan dan sekarang menunggu verifikasi Master.'



    };



  } finally {



    lock.releaseLock();



  }



}





/* ============================================================

 * MASTER REVISION DETAIL

 * ============================================================

 */



function djApiMasterTenantRevisionDetailV1_(

  revisionId

) {



  revisionId =

    String(

      revisionId ||

      ''

    ).trim();





  const table =

    djRevisionReadTableV1_();





  const rowNumber =

    djApiFindRowV5_(

      table,

      [

        'Revision_ID'

      ],

      revisionId

    );





  if (

    rowNumber <

    0

  ) {



    throw new Error(

      'Revision tidak ditemukan.'

    );



  }





  const index =

    rowNumber -

    table.headerRow -

    1;





  const revision =

    djRevisionRowObjectV1_(

      table.rows[index],

      table.headers

    );





  const config =

    djRevisionGetConfigV1_(

      revision.field

    );





  if (!config) {



    throw new Error(

      'Konfigurasi field revision tidak ditemukan.'

    );



  }





  const context =

    djRevisionGetTenantContextV1_(

      revision.tenantId

    );





  const tenantName =

    String(

      djApiValueV5_(

        context.values,

        context.headers,

        [

          'Nama_Lengkap'

        ]

      ) ||

      ''

    );





  return {



    revision: {



      revisionId:

        revision.revisionId,



      tenantId:

        revision.tenantId,



      tenantName:

        tenantName,



      field:

        revision.field,



      label:

        config.label,



      type:

        config.type,



      status:

        revision.status,



      oldValue:

        revision.oldValue,



      oldDisplay:

        revision.oldValue,



      newValue:

        revision.newValue,



      newDisplay:

        config.type ===

          'file'



          ? (

              revision.newFileName ||

              'File baru'

            )



          : (

              revision.newValue ||

              ''

            ),



      oldFileUrl:

        revision.oldFileUrl,



      newFileUrl:

        revision.newFileUrl,



      newFileName:

        revision.newFileName,



      note:

        revision.tenantNote,



      masterReason:

        revision.masterReason



    }



  };



}





/* ============================================================

 * MASTER REVIEW REVISION

 * ============================================================

 */



function djApiMasterReviewRevisionV1_(

  revisionId,

  decision,

  reason,

  masterId

) {



  revisionId =

    String(

      revisionId ||

      ''

    ).trim();





  decision =

    String(

      decision ||

      ''

    ).trim().toUpperCase();





  reason =

    String(

      reason ||

      ''

    ).trim();





  if (

    [

      'DISETUJUI',

      'PERLU DIPERBAIKI'

    ].indexOf(

      decision

    ) <

    0

  ) {



    return {



      ok:

        false,



      error:

        'Keputusan Master tidak valid.'



    };



  }





  if (

    decision ===

      'PERLU DIPERBAIKI' &&

    !reason

  ) {



    return {



      ok:

        false,



      error:

        'Alasan perbaikan wajib diisi.'



    };



  }





  const lock =

    LockService

      .getScriptLock();





  lock.waitLock(

    30000

  );





  try {



    const revisionSheet =

      djRevisionGetSheetV1_();





    const revisionTable =

      djRevisionReadTableV1_();





    const rowNumber =

      djApiFindRowV5_(

        revisionTable,

        [

          'Revision_ID'

        ],

        revisionId

      );





    if (

      rowNumber <

      0

    ) {



      return {



        ok:

          false,



        error:

          'Revision tidak ditemukan.'



      };



    }





    const index =

      rowNumber -

      revisionTable.headerRow -

      1;





    const revision =

      djRevisionRowObjectV1_(

        revisionTable.rows[index],

        revisionTable.headers

      );





    if (

      revision.status !==

      'MENUNGGU VERIFIKASI'

    ) {



      return {



        ok:

          false,



        error:

          'Revision ini tidak sedang menunggu verifikasi.'



      };



    }





    const config =

      djRevisionGetConfigV1_(

        revision.field

      );





    if (!config) {



      return {



        ok:

          false,



        error:

          'Field revision tidak diizinkan.'



      };



    }





    const tenantContext =

      djRevisionGetTenantContextV1_(

        revision.tenantId

      );





    const tenantHeaders =

      djApiFindHeadersV5_(

        tenantContext.sheet

      );





    const now =

      new Date();





    if (

      decision ===

      'PERLU DIPERBAIKI'

    ) {



      djApiUpdateRowV5_(

        revisionSheet,

        rowNumber,

        djApiFindHeadersV5_(

          revisionSheet

        ),

        {



          Status:

            'PERLU DIPERBAIKI',



          Alasan_Master:

            reason,



          Diverifikasi_At:

            now,



          Verified_By:

            masterId,



          Catatan_Master:

            reason



        }

      );





      SpreadsheetApp.flush();





      return {



        ok:

          true,



        message:

          'Perubahan dikembalikan kepada tenant untuk diperbaiki.'



      };



    }





    /*

     * APPROVE

     */



    const updateData =

      {};





    if (

      config.type ===

      'file'

    ) {



      if (

        !revision.newFileId &&

        !revision.newFileUrl

      ) {



        return {



          ok:

            false,



          error:

            'File baru tidak tersedia.'



        };



      }





      if (

        djRevisionFieldExistsV1_(

          tenantHeaders,

          config.urlHeaders

        )

      ) {



        updateData[

          config.urlHeaders[0]

        ] =

          revision.newFileUrl;



      }





      if (

        djRevisionFieldExistsV1_(

          tenantHeaders,

          config.idHeaders

        )

      ) {



        updateData[

          config.idHeaders[0]

        ] =

          revision.newFileId;



      }





      if (

        djRevisionFieldExistsV1_(

          tenantHeaders,

          config.nameHeaders

        )

      ) {



        updateData[

          config.nameHeaders[0]

        ] =

          revision.newFileName;



      }



    } else {



      if (

        !revision.newValue

      ) {



        return {



          ok:

            false,



          error:

            'Data baru kosong.'



        };



      }





      const header =

        config.headers[0];





      if (

        djRevisionFieldExistsV1_(

          tenantHeaders,

          config.headers

        )

      ) {



        updateData[

          header

        ] =

          revision.newValue;



      }



    }





    if (

      djRevisionFieldExistsV1_(

        tenantHeaders,

        [

          'Updated_At'

        ]

      )

    ) {



      updateData.Updated_At =

        now;



    }





    djApiUpdateRowV5_(

      tenantContext.sheet,

      tenantContext.rowNumber,

      tenantHeaders,

      updateData

    );





    djApiUpdateRowV5_(

      revisionSheet,

      rowNumber,

      djApiFindHeadersV5_(

        revisionSheet

      ),

      {



        Status:

          'DISETUJUI',



        Diverifikasi_At:

          now,



        Verified_By:

          masterId,



        Catatan_Master:

          'Disetujui oleh Master.'



      }

    );





    SpreadsheetApp.flush();





    try {



      djApiLogV5_(

        tenantContext.ss,

        'TENANT_DATA_REVISION_APPROVED',

        revision.tenantId +

        ' revision ' +

        revision.revisionId +

        ' disetujui oleh ' +

        masterId

      );



    } catch (

      err

    ) {}





    return {



      ok:

        true,



      message:

        'Perubahan data berhasil disetujui dan data Tenant sudah diperbarui.'



    };



  } finally {



    lock.releaseLock();



  }



}