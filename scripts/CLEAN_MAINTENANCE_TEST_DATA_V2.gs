/**
 * ============================================================
 * DJ FAMILY KOST
 * CLEAN MAINTENANCE TEST DATA V2
 * ============================================================
 *
 * AMAN UNTUK GOOGLE SHEETS TABLE
 *
 * Script ini TIDAK menghapus baris.
 * Script hanya mengosongkan isi baris sampah.
 *
 * Data valid seperti:
 *
 * MNT-WEB-0001
 *
 * TIDAK akan disentuh.
 *
 * Jalankan:
 *
 * cleanupMaintenanceTestDataV2()
 *
 * ============================================================
 */

function cleanupMaintenanceTestDataV2() {

  const ss =
    SpreadsheetApp
      .getActiveSpreadsheet();


  const sheet =
    ss.getSheetByName(
      'Maintenance'
    );


  if (!sheet) {

    throw new Error(
      'Sheet Maintenance tidak ditemukan.'
    );

  }


  const lastRow =
    sheet.getLastRow();


  const lastColumn =
    sheet.getLastColumn();


  if (
    lastRow < 1 ||
    lastColumn < 1
  ) {

    Logger.log(
      'Sheet Maintenance kosong.'
    );

    return;

  }


  /* ==========================================================
     CARI HEADER YANG BENAR
     ========================================================== */

  const headerInfo =
    findMaintenanceHeaderV2_(
      sheet
    );


  if (!headerInfo) {

    throw new Error(
      'Header Maintenance tidak ditemukan.'
    );

  }


  const headerRow =
    headerInfo.row;


  const headers =
    headerInfo.headers;


  const idColumn =
    findColumnMaintenanceV2_(
      headers,
      [
        'Maintenance_ID'
      ]
    );


  if (
    idColumn < 0
  ) {

    throw new Error(
      'Kolom Maintenance_ID tidak ditemukan.'
    );

  }


  /* ==========================================================
     AMBIL DATA SETELAH HEADER
     ========================================================== */

  if (
    lastRow <= headerRow
  ) {

    Logger.log(
      'Tidak ada data Maintenance.'
    );

    return;

  }


  const dataStartRow =
    headerRow + 1;


  const dataCount =
    lastRow -
    headerRow;


  const values =
    sheet
      .getRange(
        dataStartRow,
        1,
        dataCount,
        lastColumn
      )
      .getValues();


  let cleaned =
    0;


  const rowsToClear =
    [];


  /* ==========================================================
     IDENTIFIKASI DATA SAMPAH
     ========================================================== */

  values.forEach(
    function(row, index) {

      const actualRow =
        dataStartRow +
        index;


      const id =
        String(
          row[idColumn] || ''
        )
        .trim();


      /*
       * --------------------------------------------------------
       * BARIS BENAR-BENAR KOSONG
       * --------------------------------------------------------
       */

      const hasAnyValue =
        row.some(
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
        !hasAnyValue
      ) {

        return;

      }


      /*
       * --------------------------------------------------------
       * ID VALID
       * --------------------------------------------------------
       *
       * Semua ID maintenance valid dari sistem kita
       * diawali MNT-
       */

      if (
        /^MNT-/i.test(
          id
        )
      ) {

        return;

      }


      /*
       * --------------------------------------------------------
       * ID COLUMN PALSU
       * --------------------------------------------------------
       */

      if (
        /^Column\s+\d+$/i.test(
          id
        )
      ) {

        rowsToClear.push(
          actualRow
        );

        return;

      }


      /*
       * --------------------------------------------------------
       * ID KOSONG TETAPI BARIS BERISI DATA
       * --------------------------------------------------------
       *
       * Ini juga merupakan data sampah dari
       * percobaan sistem lama.
       */

      if (!id) {

        rowsToClear.push(
          actualRow
        );

      }

    }
  );


  /* ==========================================================
     CLEAR CONTENT — BUKAN DELETE ROW
     ========================================================== */

  rowsToClear.forEach(
    function(rowNumber) {

      sheet
        .getRange(
          rowNumber,
          1,
          1,
          lastColumn
        )
        .clearContent();


      cleaned++;

    }
  );


  SpreadsheetApp.flush();


  Logger.log(
    'Baris Maintenance yang dibersihkan: ' +
    cleaned
  );


  Logger.log(
    'Data valid tidak dihapus.'
  );

}


/* ============================================================
 * FIND HEADER
 * ============================================================
 */

function findMaintenanceHeaderV2_(
  sheet
) {

  const lastRow =
    sheet.getLastRow();


  const lastColumn =
    sheet.getLastColumn();


  const maxRows =
    Math.min(
      lastRow,
      12
    );


  let bestRow =
    -1;


  let bestScore =
    -1;


  const required = [

    'Maintenance_ID',
    'Status'

  ];


  for (
    let rowNumber = 1;
    rowNumber <= maxRows;
    rowNumber++
  ) {

    const values =
      sheet
        .getRange(
          rowNumber,
          1,
          1,
          lastColumn
        )
        .getValues()[0];


    let score =
      0;


    required.forEach(
      function(requiredHeader) {

        const target =
          canonMaintenanceV2_(
            requiredHeader
          );


        const found =
          values.some(
            function(value) {

              return (

                canonMaintenanceV2_(
                  value
                ) ===
                target

              );

            }
          );


        if (found) {

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

      bestRow =
        rowNumber;

    }

  }


  if (
    bestRow < 0 ||
    bestScore <
    required.length
  ) {

    return null;

  }


  const headers =
    sheet
      .getRange(
        bestRow,
        1,
        1,
        lastColumn
      )
      .getValues()[0]
      .map(
        function(value) {

          return String(
            value || ''
          ).trim();

        }
      );


  return {

    row:
      bestRow,

    headers:
      headers

  };

}


/* ============================================================
 * FIND COLUMN
 * ============================================================
 */

function findColumnMaintenanceV2_(
  headers,
  aliases
) {

  const normalized =
    headers.map(
      canonMaintenanceV2_
    );


  for (
    let i = 0;
    i < aliases.length;
    i++
  ) {

    const target =
      canonMaintenanceV2_(
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
 * NORMALIZE HEADER
 * ============================================================
 */

function canonMaintenanceV2_(
  value
) {

  return String(
    value || ''
  )
  .trim()
  .toLowerCase()
  .replace(
    /[^a-z0-9]/g,
    ''
  );

}