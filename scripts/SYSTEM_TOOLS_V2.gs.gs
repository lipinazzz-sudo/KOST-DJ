/**
 * ============================================================
 * DJ FAMILY KOST — SYSTEM TOOLS V2
 * ============================================================
 *
 * RESET DATA DUMMY SAJA
 *
 * YANG DIKOSONGKAN:
 * Tenant
 * Kontrak
 * Pembayaran
 * Maintenance
 * CheckInOut
 * Pelanggaran
 * Akun_Tenant
 * Pendaftaran
 * Kunjungan
 *
 * YANG TIDAK DIHAPUS:
 * Kamar
 * harga kamar
 * Google Form Response
 * Dashboard structure
 *
 * ============================================================
 */

function resetDummyDataDJFK() {

  const ui =
    SpreadsheetApp.getUi();

  const confirm =
    ui.alert(
      'RESET DATA DUMMY',
      'Semua data tenant dan transaksi operasional yang sekarang ada akan dikosongkan.\n\nHarga dan daftar 39 kamar tetap dipertahankan.\n\nLanjutkan?',
      ui.ButtonSet.YES_NO
    );

  if (
    confirm !==
    ui.Button.YES
  ) {
    return;
  }


  const ss =
    getSpreadsheetDJFK_();


  const sheets = [

    DJFK.SHEETS.TENANT,
    DJFK.SHEETS.KONTRAK,
    DJFK.SHEETS.PEMBAYARAN,
    DJFK.SHEETS.MAINTENANCE,
    DJFK.SHEETS.CHECKINOUT,
    DJFK.SHEETS.PELANGGARAN,
    DJFK.SHEETS.AKUN,
    DJFK.SHEETS.PENDAFTARAN,
    DJFK.SHEETS.KUNJUNGAN

  ];


  sheets.forEach(
    function(name) {

      const sh =
        ss.getSheetByName(
          name
        );


      if (!sh) {
        return;
      }


      const lastRow =
        sh.getLastRow();


      if (
        lastRow >
        DJFK.HEADER_ROW
      ) {

        sh
          .getRange(
            DJFK.HEADER_ROW + 1,
            1,
            lastRow -
              DJFK.HEADER_ROW,
            sh.getLastColumn()
          )
          .clearContent();

      }

    }
  );


  /*
   * Kembalikan seluruh kamar
   * menjadi KOSONG tanpa mengubah harga.
   */

  const kamar =
    ss.getSheetByName(
      DJFK.SHEETS.KAMAR
    );


  if (kamar) {

    const records =
      readRecordsDJFK_(
        kamar
      );


    const headers =
      records.headers;


    const noCol =
      findColDJFK_(
        headers,
        ['No_Kamar']
      );


    const statusCol =
      findColDJFK_(
        headers,
        ['Status']
      );


    const tenantCol =
      findColDJFK_(
        headers,
        ['Tenant_ID']
      );


    const nameCol =
      findColDJFK_(
        headers,
        ['Nama_Tenant']
      );


    records.rows.forEach(
      function(row,index) {

        const room =
          String(
            row[noCol] || ''
          ).trim();


        if (
          !DJFK.ROOMS.includes(
            Number(room)
          )
        ) {
          return;
        }


        const spreadsheetRow =
          DJFK.DATA_START_ROW +
          index;


        if (
          statusCol >= 0
        ) {

          kamar
            .getRange(
              spreadsheetRow,
              statusCol + 1
            )
            .setValue(
              'KOSONG'
            );

        }


        if (
          tenantCol >= 0
        ) {

          kamar
            .getRange(
              spreadsheetRow,
              tenantCol + 1
            )
            .clearContent();

        }


        if (
          nameCol >= 0
        ) {

          kamar
            .getRange(
              spreadsheetRow,
              nameCol + 1
            )
            .clearContent();

        }

      }
    );

  }


  /*
   * Refresh data setelah reset.
   */

  writeApiDataDJFK_(
    ss
  );


  refreshDashboardDJ_V5();


  logDJFK_(
    ss,
    'RESET_DUMMY',
    'Seluruh data dummy tenant dan transaksi berhasil dikosongkan.'
  );


  ui.alert(
    'Selesai.\n\nDatabase tenant dan transaksi sekarang kosong.\n39 kamar dan harga tetap dipertahankan.'
  );

}