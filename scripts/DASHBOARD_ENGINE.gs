const DJD5 = {

  sheets: {

    rooms: 'Kamar',

    tenants: 'Tenant',

    payments: 'Pembayaran',

    maintenance: 'Maintenance',

    contracts: 'Kontrak',

    dashboard: 'Dashboard',

    api: 'API_Data',

    log: 'System_Log'

  },



  roomCount: 39,



  dashboardHandler:

    'refreshDashboardDJ_V5'

};





/* ============================================================

   SETUP DASHBOARD

   \============================================================ */



function setupDashboardDJ_V5() {



  const ss =

    SpreadsheetApp

      .getActiveSpreadsheet();



  if (!ss) {



    throw new Error(

      'Spreadsheet aktif tidak ditemukan.'

    );



  }



  refreshDashboardDJ_V5();



  Logger.log(

    'Dashboard Engine V5 aktif. ' +

    'Trigger dikendalikan oleh MASTER_ENGINE_V2.'

  );



}





/* ============================================================

   REFRESH

   \============================================================ */



function refreshDashboardDJ_V5() {



  const ss =

    SpreadsheetApp.getActiveSpreadsheet();





  if (!ss) {



    throw new Error(

      'Google Sheets DJ Family Kost tidak ditemukan.'

    );



  }





  const model =

    d5BuildModel_(

      ss

    );





  d5BuildDashboard_(

    ss,

    model

  );





  d5BuildApi_(

    ss,

    model

  );





  d5Log_(

    ss,

    'REFRESH',

    'Dashboard dan API_Data diperbarui.'

  );



}





/* ============================================================

   BUILD MODEL

   \============================================================ */



function d5BuildModel_(

  ss

) {



  const roomTable =

    d5LoadTable_(

      ss.getSheetByName(

        DJD5.sheets.rooms

      ),

      true

    );





  if (!roomTable) {



    throw new Error(

      'Sheet Kamar tidak ditemukan.'

    );



  }





  const tenantTable =

    d5LoadTable_(

      ss.getSheetByName(

        DJD5.sheets.tenants

      ),

      false

    );





  const paymentTable =

    d5LoadTable_(

      ss.getSheetByName(

        DJD5.sheets.payments

      ),

      false

    );





  const maintenanceTable =

    d5LoadTable_(

      ss.getSheetByName(

        DJD5.sheets.maintenance

      ),

      false

    );





  const contractTable =

    d5LoadTable_(

      ss.getSheetByName(

        DJD5.sheets.contracts

      ),

      false

    );





  const period =

    d5CurrentPeriod_();





  const tenantsByRoom =

    d5IndexTenant_(

      tenantTable

    );





  const paymentsByRoom =

    d5IndexPayment_(

      paymentTable,

      period.key

    );





  const maintenanceByRoom =

    d5IndexLatest_(

      maintenanceTable,

      [

        'Timestamp_Submit',

        'Timestamp',

        'Tanggal',

        'Tanggal_Tindak_Lanjut'

      ]

    );





  const contractsByRoom =

    d5IndexLatest_(

      contractTable,

      [

        'Tanggal_Berakhir',

        'Tanggal Berakhir',

        'Tanggal Keluar Rencana',

        'Tanggal_Mulai'

      ]

    );





  const rooms = [];





  roomTable.rows.forEach(

    function(roomRow) {



      const room =

        d5Clean_(

          d5Value_(

            roomRow,

            [

              'No_Kamar',

              'No Kamar',

              'Nomor Kamar'

            ]

          )

        );





      /*

       * Hanya nomor kamar 3 digit.

       */



      if (

        !/^\d{3}$/.test(

          room

        )

      ) {



        return;



      }





      const tenant =

        tenantsByRoom[

          room

        ] ||

        {};





      const payment =

        paymentsByRoom[

          room

        ] ||

        null;





      const maintenance =

        maintenanceByRoom[

          room

        ] ||

        null;





      const contract =

        contractsByRoom[

          room

        ] ||

        {};





      /* ======================================================

         TENANT

         \====================================================== */



      const tenantName =

        d5Clean_(

          d5Value_(

            tenant,

            [

              'Nama_Lengkap',

              'Nama Lengkap',

              'Nama_Tenant',

              'Nama Tenant'

            ]

          )

        );





      const roomTenantName =

        d5Clean_(

          d5Value_(

            roomRow,

            [

              'Nama_Tenant',

              'Nama Tenant'

            ]

          )

        );





      const finalTenantName =

        tenantName ||

        roomTenantName;





      const tenantId =

        d5Clean_(

          d5Value_(

            tenant,

            [

              'Tenant_ID',

              'Tenant ID'

            ]

          )

        ) ||

        d5Clean_(

          d5Value_(

            roomRow,

            [

              'Tenant_ID',

              'Tenant ID'

            ]

          )

        );





      const tenantStatus =

        d5Clean_(

          d5Value_(

            tenant,

            [

              'Status_Tenant',

              'Status Tenant'

            ]

          )

        )

          .toUpperCase();





      /* ======================================================

         STATUS KAMAR

         \====================================================== */



      const masterStatus =

        d5Clean_(

          d5Value_(

            roomRow,

            [

              'Status'

            ]

          )

        )

          .toUpperCase();





      const occupied =

        masterStatus === 'TERISI' ||

        tenantStatus === 'AKTIF' ||

        finalTenantName !== '';





      /* ======================================================

         HARGA

         \====================================================== */



      const rent =

        d5Number_(

          d5Value_(

            roomRow,

            [

              'Harga_Bulan',

              'Harga Bulan',

              'Harga Sewa',

              'Harga_Sewa',

              'Tarif',

              'Harga'

            ]

          )

        );





      /* ======================================================

         PEMBAYARAN

         \====================================================== */



      let paymentStatus =

        'BELUM BAYAR';



      let paid =

        0;



      let fine =

        0;



      let lateDays =

        0;



      let dueDate =

        '';



      let paidDate =

        '';



      let proof =

        '';



      let verifier =

        '';



      let verificationDate =

        '';





      if (payment) {



        paymentStatus =

          d5Clean_(

            d5Value_(

              payment,

              [

                'Status_Pembayaran',

                'Status Pembayaran'

              ]

            )

          ) ||

          'BELUM BAYAR';





        /*

         * Pada struktur Payment Anda,

         * Nominal_Sewa adalah nominal pembayaran.

         */



        paid =

          d5Number_(

            d5Value_(

              payment,

              [

                'Nominal_Sewa',

                'Nominal Sewa',

                'Nominal_Dibayar',

                'Nominal Dibayar'

              ]

            )

          );





        fine =

          d5Number_(

            d5Value_(

              payment,

              [

                'Denda',

                'Denda_Terhitung'

              ]

            )

          );





        lateDays =

          d5Number_(

            d5Value_(

              payment,

              [

                'Hari_Terlambat',

                'Hari Terlambat'

              ]

            )

          );





        dueDate =

          d5Value_(

            payment,

            [

              'Tanggal_Jatuh_Tempo',

              'Tanggal Jatuh Tempo'

            ]

          );





        paidDate =

          d5Value_(

            payment,

            [

              'Tanggal_Bayar',

              'Tanggal Bayar',

              'Tanggal Pembayaran',

              'Tanggal_Pembayaran'

            ]

          );





        proof =

          d5Value_(

            payment,

            [

              'Bukti_Pembayaran_URL',

              'Bukti Pembayaran URL',

              'Bukti Pembayaran'

            ]

          );





        verifier =

          d5Value_(

            payment,

            [

              'Diverifikasi_Oleh',

              'Diverifikasi Oleh'

            ]

          );





        verificationDate =

          d5Value_(

            payment,

            [

              'Tanggal_Verifikasi',

              'Tanggal Verifikasi'

            ]

          );



      }





      const paidStatus =

        d5IsPaid_(

          paymentStatus,

          paid

        );





      /* ======================================================

         MAINTENANCE

         \====================================================== */



      const maintenanceStatus =

        maintenance

          ? (

              d5Clean_(

                d5Value_(

                  maintenance,

                  [

                    'Status'

                  ]

                )

              ) ||

              'OPEN'

            )

          : '—';





      const maintenanceOpen =

        d5IsMaintenanceOpen_(

          maintenanceStatus

        );





      const maintenanceType =

        maintenance

          ? d5Clean_(

              d5Value_(

                maintenance,

                [

                  'Jenis_Masalah',

                  'Jenis Masalah'

                ]

              )

            )

          : '';





      const maintenanceDescription =

        maintenance

          ? d5Clean_(

              d5Value_(

                maintenance,

                [

                  'Deskripsi',

                  'Jelaskan Masalah',

                  'Keterangan Masalah'

                ]

              )

            )

          : '';





      const maintenanceDate =

        maintenance

          ? d5Value_(

              maintenance,

              [

                'Timestamp_Submit',

                'Timestamp',

                'Tanggal'

              ]

            )

          : '';





      const maintenancePhoto =

        maintenance

          ? d5Value_(

              maintenance,

              [

                'Foto_Kerusakan_URL',

                'Upload Foto Kerusakan',

                'Foto Kerusakan'

              ]

            )

          : '';





      /* ======================================================

         KONTRAK

         \====================================================== */



      const contractEnd =

        d5Value_(

          contract,

          [

            'Tanggal_Berakhir',

            'Tanggal Berakhir',

            'Tanggal Keluar Rencana'

          ]

        ) ||

        d5Value_(

          tenant,

          [

            'Tanggal_Keluar_Rencana',

            'Tanggal Keluar Rencana'

          ]

        );





      const contractSoon =

        d5Expiring_(

          contractEnd,

          30

        );





      const paymentAlert =

        occupied &&

        !paidStatus;





      rooms.push({



        roomId:

          d5Value_(

            roomRow,

            [

              'Room_ID',

              'Room ID'

            ]

          ),



        room:

          room,



        floor:

          d5Value_(

            roomRow,

            [

              'Lantai',

              'Floor'

            ]

          ),



        status:

          occupied

            ? 'TERISI'

            : 'KOSONG',



        tenantId:

          tenantId,



        tenantName:

          finalTenantName,



        tenantStatus:

          tenantStatus,



        rent:

          rent,



        listrik:

          d5Value_(

            roomRow,

            [

              'Listrik'

            ]

          ),



        fasilitas:

          d5Value_(

            roomRow,

            [

              'Fasilitas'

            ]

          ),



        paymentStatus:

          paymentStatus,



        paid:

          paid,



        fine:

          fine,



        lateDays:

          lateDays,



        dueDate:

          dueDate,



        paidDate:

          paidDate,



        proof:

          proof,



        verifier:

          verifier,



        verificationDate:

          verificationDate,



        maintenanceStatus:

          maintenanceStatus,



        maintenanceOpen:

          maintenanceOpen,



        maintenanceType:

          maintenanceType,



        maintenanceDescription:

          maintenanceDescription,



        maintenanceDate:

          maintenanceDate,



        maintenancePhoto:

          maintenancePhoto,



        contractEnd:

          contractEnd,



        contractSoon:

          contractSoon,



        paymentAlert:

          paymentAlert,



        paidStatus:

          paidStatus



      });



    }

  );





  /*

   * Urutkan kamar numerik.

   */



  rooms.sort(

    function(a, b) {



      return (

        Number(a.room) -

        Number(b.room)

      );



    }

  );





  /*

   * Validasi 39 kamar.

   */



  if (

    rooms.length !==

    DJD5.roomCount

  ) {



    throw new Error(

      'Dashboard menemukan ' +

      rooms.length +

      ' kamar. Seharusnya 39 kamar.'

    );



  }





  /*

   * KPI.

   */



  const occupied =

    rooms.filter(

      function(room) {



        return (

          room.status ===

          'TERISI'

        );



      }

    );





  const targetRent =

    occupied.reduce(

      function(total, room) {



        return (

          total +

          room.rent

        );



      },

      0

    );





  const collected =

    occupied.reduce(

      function(total, room) {



        return (

          total +

          (

            room.paidStatus

              ? room.paid

              : 0

          )

        );



      },

      0

    );





  const unpaid =

    occupied.filter(

      function(room) {



        return !room.paidStatus;



      }

    );





  const attention =

    rooms.filter(

      function(room) {



        return (

          room.paymentAlert ||

          room.maintenanceOpen ||

          room.contractSoon

        );



      }

    );





  const fineTotal =

    rooms.reduce(

      function(total, room) {



        return (

          total +

          room.fine

        );



      },

      0

    );





  return {



    period:

      period,



    rooms:

      rooms,



    total:

      rooms.length,



    occupied:

      occupied.length,



    vacant:

      rooms.length -

      occupied.length,



    occupancy:

      rooms.length

        ? occupied.length /

          rooms.length

        : 0,



    targetRent:

      targetRent,



    collected:

      collected,



    unpaid:

      unpaid,



    attention:

      attention,



    fineTotal:

      fineTotal



  };



}





/* ============================================================

   LOAD TABLE

   \============================================================ */



function d5LoadTable_(

  sheet,

  required

) {



  if (!sheet) {



    if (required) {



      throw new Error(

        'Sheet wajib tidak ditemukan.'

      );



    }



    return null;



  }





  const headerInfo =

    d5FindHeaderRow_(

      sheet

    );





  if (!headerInfo) {



    if (required) {



      throw new Error(

        'Header sheet ' +

        sheet.getName() +

        ' tidak ditemukan.'

      );



    }



    return null;



  }





  const firstDataRow =

    headerInfo.row + 1;





  const lastRow =

    sheet.getLastRow();





  const rows = [];





  if (

    lastRow >=

    firstDataRow

  ) {



    const values =

      sheet

        .getRange(

          firstDataRow,

          1,

          lastRow -

          firstDataRow +

          1,

          sheet.getLastColumn()

        )

        .getValues();





    values.forEach(

      function(row) {



        const object = {};





        headerInfo.headers

          .forEach(

            function(

              header,

              index

            ) {



              object[

                d5Norm_(

                  header

                )

              ] =

                row[

                  index

                ];



            }

          );





        rows.push(

          object

        );



      }

    );



  }





  return {



    row:

      headerInfo.row,



    headers:

      headerInfo.headers,



    rows:

      rows



  };



}





/* ============================================================

   FIND HEADER ROW

   \============================================================ */



function d5FindHeaderRow_(

  sheet

) {



  const maxRows =

    Math.min(

      10,

      sheet.getLastRow()

    );





  const maxCols =

    sheet.getLastColumn();





  if (

    !maxRows ||

    !maxCols

  ) {



    return null;



  }





  const grid =

    sheet

      .getRange(

        1,

        1,

        maxRows,

        maxCols

      )

      .getValues();





  for (

    let r = 0;

    r < grid.length;

    r++

  ) {



    const headers =

      grid[

        r

      ];





    if (

      d5FindColumn_(

        headers,

        [

          'No_Kamar',

          'No Kamar',

          'Nomor Kamar'

        ]

      ) >= 0

    ) {



      return {



        row:

          r + 1,



        headers:

          headers



      };



    }



  }





  return null;



}





/* ============================================================

   FIND COLUMN

   \============================================================ */



function d5FindColumn_(

  headers,

  aliases

) {



  const normalized =

    headers.map(

      d5Norm_

    );





  for (

    let i = 0;

    i < aliases.length;

    i++

  ) {



    const wanted =

      d5Norm_(

        aliases[i]

      );





    const index =

      normalized.indexOf(

        wanted

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

   VALUE

   \============================================================ */



function d5Value_(

  object,

  aliases

) {



  if (!object) {



    return '';



  }





  for (

    let i = 0;

    i < aliases.length;

    i++

  ) {



    const key =

      d5Norm_(

        aliases[i]

      );





    if (

      Object.prototype.hasOwnProperty.call(

        object,

        key

      )

    ) {



      return object[

        key

      ];



    }



  }





  return '';



}





/* ============================================================

   INDEX TENANT

   \============================================================ */



function d5IndexTenant_(

  table

) {



  const result = {};





  if (!table) {



    return result;



  }





  table.rows.forEach(

    function(row) {



      const room =

        d5Clean_(

          d5Value_(

            row,

            [

              'No_Kamar',

              'No Kamar',

              'Nomor Kamar'

            ]

          )

        );





      if (

        !/^\d{3}$/.test(

          room

        )

      ) {



        return;



      }





      const name =

        d5Clean_(

          d5Value_(

            row,

            [

              'Nama_Lengkap',

              'Nama Lengkap',

              'Nama_Tenant',

              'Nama Tenant'

            ]

          )

        );





      const status =

        d5Clean_(

          d5Value_(

            row,

            [

              'Status_Tenant',

              'Status Tenant'

            ]

          )

        )

          .toUpperCase();





      const tenantId =

        d5Clean_(

          d5Value_(

            row,

            [

              'Tenant_ID',

              'Tenant ID'

            ]

          )

        );





      /*

       * Prioritas:

       * AKTIF + nama + ID.

       */



      const score =

        (

          status ===

          'AKTIF'

            ? 10

            : 0

        ) +

        (

          name

            ? 5

            : 0

        ) +

        (

          tenantId

            ? 2

            : 0

        );





      if (

        !result[

          room

        ]

      ) {



        result[

          room

        ] =

          row;



        return;



      }





      const existingStatus =

        d5Clean_(

          d5Value_(

            result[

              room

            ],

            [

              'Status_Tenant',

              'Status Tenant'

            ]

          )

        )

          .toUpperCase();





      const existingName =

        d5Clean_(

          d5Value_(

            result[

              room

            ],

            [

              'Nama_Lengkap',

              'Nama Lengkap',

              'Nama_Tenant',

              'Nama Tenant'

            ]

          )

        );





      const existingId =

        d5Clean_(

          d5Value_(

            result[

              room

            ],

            [

              'Tenant_ID',

              'Tenant ID'

            ]

          )

        );





      const existingScore =

        (

          existingStatus ===

          'AKTIF'

            ? 10

            : 0

        ) +

        (

          existingName

            ? 5

            : 0

        ) +

        (

          existingId

            ? 2

            : 0

        );





      if (

        score >

        existingScore

      ) {



        result[

          room

        ] =

          row;



      }



    }

  );





  return result;



}





/* ============================================================

   INDEX PAYMENT

   \============================================================ */



function d5IndexPayment_(

  table,

  currentPeriodKey

) {



  const current = {};

  const fallback = {};





  if (!table) {



    return current;



  }





  table.rows.forEach(

    function(row) {



      const room =

        d5Clean_(

          d5Value_(

            row,

            [

              'No_Kamar',

              'No Kamar',

              'Nomor Kamar'

            ]

          )

        );





      if (

        !/^\d{3}$/.test(

          room

        )

      ) {



        return;



      }





      const period =

        d5Value_(

          row,

          [

            'Periode',

            'Periode Pembayaran'

          ]

        );





      const isCurrent =

        d5PeriodKey_(

          period

        ) ===

        currentPeriodKey;





      const target =

        isCurrent

          ? current

          : fallback;





      if (

        !target[

          room

        ]

      ) {



        target[

          room

        ] =

          row;



        return;



      }





      const currentDate =

        d5Date_(

          d5Value_(

            row,

            [

              'Tanggal_Bayar',

              'Tanggal Bayar',

              'Tanggal Pembayaran',

              'Timestamp'

            ]

          )

        );





      const previousDate =

        d5Date_(

          d5Value_(

            target[

              room

            ],

            [

              'Tanggal_Bayar',

              'Tanggal Bayar',

              'Tanggal Pembayaran',

              'Timestamp'

            ]

          )

        );





      if (

        currentDate &&

        (

          !previousDate ||

          currentDate.getTime() >

          previousDate.getTime()

        )

      ) {



        target[

          room

        ] =

          row;



      }



    }

  );





  /*

   * Jika bulan berjalan kosong,

   * pakai pembayaran terbaru.

   */



  Object.keys(

    fallback

  ).forEach(

    function(room) {



      if (

        !current[

          room

        ]

      ) {



        current[

          room

        ] =

          fallback[

            room

          ];



      }



    }

  );





  return current;



}





/* ============================================================

   INDEX TERBARU PER KAMAR

   \============================================================ */



function d5IndexLatest_(

  table,

  dateAliases

) {



  const result = {};





  if (!table) {



    return result;



  }





  table.rows.forEach(

    function(row) {



      const room =

        d5Clean_(

          d5Value_(

            row,

            [

              'No_Kamar',

              'No Kamar',

              'Nomor Kamar'

            ]

          )

        );





      if (

        !/^\d{3}$/.test(

          room

        )

      ) {



        return;



      }





      if (

        !result[

          room

        ]

      ) {



        result[

          room

        ] =

          row;



        return;



      }





      const current =

        d5Date_(

          d5Value_(

            row,

            dateAliases

          )

        );





      const previous =

        d5Date_(

          d5Value_(

            result[

              room

            ],

            dateAliases

          )

        );





      if (

        current &&

        (

          !previous ||

          current.getTime() >

          previous.getTime()

        )

      ) {



        result[

          room

        ] =

          row;



      }



    }

  );





  return result;



}





/* ============================================================

   IS PAID

   \============================================================ */



function d5IsPaid_(

  status,

  paid

) {



  const s =

    d5Clean_(

      status

    )

      .toUpperCase();





  if (

    paid <= 0

  ) {



    return false;



  }





  if (

    s === 'LUNAS'

  ) {



    return true;



  }





  if (

    s.indexOf(

      'TERLAMBAT'

    ) >= 0

  ) {



    return true;



  }





  if (

    s === 'KURANG BAYAR' ||

    s === 'BELUM BAYAR' ||

    s === 'BELUM LUNAS'

  ) {



    return false;



  }





  return (

    paid > 0

  );



}





/* ============================================================

   MAINTENANCE

   \============================================================ */



function d5IsMaintenanceOpen_(

  status

) {



  const s =

    d5Clean_(

      status

    )

      .toUpperCase();





  if (

    !s ||

    s === '—'

  ) {



    return false;



  }





  const closed = [



    'SELESAI',

    'DONE',

    'CLOSED',

    'CLOSE'



  ];





  for (

    let i = 0;

    i < closed.length;

    i++

  ) {



    if (

      s.indexOf(

        closed[i]

      ) >= 0

    ) {



      return false;



    }



  }





  return true;



}





/* ============================================================

   CURRENT PERIOD

   \============================================================ */



function d5CurrentPeriod_() {



  const date =

    new Date();





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





  return {



    key:

      date.getFullYear() +

      '-' +

      String(

        date.getMonth() + 1

      ).padStart(

        2,

        '0'

      ),



    label:

      months[

        date.getMonth()

      ] +

      ' ' +

      date.getFullYear()



  };



}





/* ============================================================

   PERIOD KEY

   \============================================================ */



function d5PeriodKey_(

  value

) {



  if (!value) {



    return '';



  }





  if (

    value instanceof Date

  ) {



    return (

      value.getFullYear() +

      '-' +

      String(

        value.getMonth() + 1

      ).padStart(

        2,

        '0'

      )

    );



  }





  const text =

    d5Clean_(

      value

    )

      .toLowerCase();





  const months = {



    januari: 1,

    februari: 2,

    maret: 3,

    april: 4,

    mei: 5,

    juni: 6,

    juli: 7,

    agustus: 8,

    september: 9,

    oktober: 10,

    november: 11,

    desember: 12



  };





  let month =

    0;





  Object.keys(

    months

  ).some(

    function(name) {



      if (

        text.indexOf(

          name

        ) >= 0

      ) {



        month =

          months[

            name

          ];



        return true;



      }



      return false;



    }

  );





  const year =

    text.match(

      /20\d{2}/

    );





  if (

    !month ||

    !year

  ) {



    return '';



  }





  return (

    year[0] +

    '-' +

    String(

      month

    ).padStart(

      2,

      '0'

    )

  );



}





/* ============================================================

   DATE

   \============================================================ */



function d5Date_(

  value

) {



  if (!value) {



    return null;



  }





  if (

    value instanceof Date

  ) {



    const copy =

      new Date(

        value

      );





    return isNaN(

      copy.getTime()

    )

      ? null

      : copy;



  }





  const date =

    new Date(

      value

    );





  return isNaN(

    date.getTime()

  )

    ? null

    : date;



}





/* ============================================================

   CONTRACT EXPIRING

   \============================================================ */



function d5Expiring_(

  value,

  days

) {



  const date =

    d5Date_(

      value

    );





  if (!date) {



    return false;



  }





  date.setHours(

    0,

    0,

    0,

    0

  );





  const now =

    new Date();





  now.setHours(

    0,

    0,

    0,

    0

  );





  const max =

    new Date(

      now

    );





  max.setDate(

    max.getDate() +

    days

  );





  return (

    date.getTime() >=

    now.getTime() &&

    date.getTime() <=

    max.getTime()

  );



}





/* ============================================================

   BUILD DASHBOARD

   \============================================================ */



function d5BuildDashboard_(

  ss,

  model

) {



  let sh =

    ss.getSheetByName(

      DJD5.sheets.dashboard

    );





  if (!sh) {



    sh =

      ss.insertSheet(

        DJD5.sheets.dashboard

      );



  }





  /*

   * HAPUS CHART LAMA.

   */



  sh

    .getCharts()

    .forEach(

      function(chart) {



        sh.removeChart(

          chart

        );



      }

    );





  /*

   * HAPUS FILTER LAMA.

   */



  const filter =

    sh.getFilter();





  if (filter) {



    filter.remove();



  }





  /*

   * Reset layout.

   */



  sh

    .getRange(

      1,

      1,

      sh.getMaxRows(),

      sh.getMaxColumns()

    )

    .breakApart();





  sh.clear();





  sh.setHiddenGridlines(

    true

  );





  const widths = [



    90,

    190,

    120,

    145,

    145,

    145,

    155,

    190



  ];





  widths.forEach(

    function(width, i) {



      sh.setColumnWidth(

        i + 1,

        width

      );



    }

  );





  /*

   * TITLE

   */



  sh

    .getRange(

      'A1:H2'

    )

    .merge()

    .setValue(

      'DJ FAMILY KOST — OWNER DASHBOARD'

    )

    .setBackground(

      '#17365D'

    )

    .setFontColor(

      '#FFFFFF'

    )

    .setFontSize(

      18

    )

    .setFontWeight(

      'bold'

    )

    .setHorizontalAlignment(

      'center'

    )

    .setVerticalAlignment(

      'middle'

    );





  sh

    .getRange(

      'A3:H3'

    )

    .merge()

    .setValue(

      'Periode: ' +

      model.period.label +

      ' • Update: ' +

      Utilities.formatDate(

        new Date(),

        Session.getScriptTimeZone(),

        'dd/MM/yyyy HH:mm'

      )

    )

    .setFontColor(

      '#666666'

    )

    .setHorizontalAlignment(

      'center'

    );





  /*

   * ========================================================

   * KPI BARIS 1

   * ========================================================

   */



  d5Card_(

    sh,

    'A5:B5',

    'A6:B7',

    'TOTAL KAMAR',

    model.total,

    '0',

    '#D9EAF7'

  );





  d5Card_(

    sh,

    'C5:D5',

    'C6:D7',

    'TERISI',

    model.occupied,

    '0',

    '#E2F0D9'

  );





  d5Card_(

    sh,

    'E5:F5',

    'E6:F7',

    'KOSONG',

    model.vacant,

    '0',

    '#FCE4D6'

  );





  d5Card_(

    sh,

    'G5:H5',

    'G6:H7',

    'OKUPANSI',

    model.occupancy,

    '0.0%',

    '#EDE7F6'

  );





  /*

   * ========================================================

   * KPI BARIS 2

   * ========================================================

   */



  d5Card_(

    sh,

    'A9:B9',

    'A10:B11',

    'TARGET SEWA',

    model.targetRent,

    'Rp #,##0',

    '#F2F2F2'

  );





  d5Card_(

    sh,

    'C9:D9',

    'C10:D11',

    'TERKUMPUL',

    model.collected,

    'Rp #,##0',

    '#E2F0D9'

  );





  d5Card_(

    sh,

    'E9:F9',

    'E10:F11',

    'BELUM LUNAS',

    model.unpaid.length,

    '0',

    '#FCE4D6'

  );





  d5Card_(

    sh,

    'G9:H9',

    'G10:H11',

    'DENDA',

    model.fineTotal,

    'Rp #,##0',

    '#FFF2CC'

  );





  /*

   * ========================================================

   * PERLU PERHATIAN

   * ========================================================

   */



  sh

    .getRange(

      'A13:H13'

    )

    .merge()

    .setValue(

      'PERLU PERHATIAN'

    )

    .setBackground(

      '#C00000'

    )

    .setFontColor(

      '#FFFFFF'

    )

    .setFontWeight(

      'bold'

    );





  const attentionRows = [];





  model.rooms.forEach(

    function(room) {



      if (

        room.paymentAlert

      ) {



        attentionRows.push([



          room.room,



          room.tenantName ||

            '—',



          'PEMBAYARAN',



          room.paymentStatus,



          room.dueDate ||

            '',



          room.paid,



          room.lateDays > 0

            ? 'Catat keterlambatan'

            : 'Periksa pembayaran',



          room.lateDays > 0

            ? room.lateDays +

              ' hari terlambat'

            : 'Belum ada pembayaran'



        ]);



      }





      if (

        room.maintenanceOpen

      ) {



        attentionRows.push([



          room.room,



          room.tenantName ||

            '—',



          'MAINTENANCE',



          room.maintenanceStatus,



          room.maintenanceDate ||

            '',



          '',



          'Tindak lanjuti',



          room.maintenanceType ||

            room.maintenanceDescription ||

            'Ada laporan maintenance'



        ]);



      }





      if (

        room.contractSoon

      ) {



        attentionRows.push([



          room.room,



          room.tenantName ||

            '—',



          'KONTRAK',



          'SEGERA BERAKHIR',



          room.contractEnd ||

            '',



          '',



          'Hubungi tenant',



          'Kontrak ≤ 30 hari'



        ]);



      }



    }

  );





  let monitorStart;





  if (

    attentionRows.length ===

    0

  ) {



    sh

      .getRange(

        'A14:H15'

      )

      .merge()

      .setValue(

        '✓ Tidak ada item yang memerlukan perhatian saat ini.'

      )

      .setBackground(

        '#E2F0D9'

      );





    monitorStart =

      17;





  } else {



    sh

      .getRange(

        14,

        1,

        1,

        8

      )

      .setValues([

        [

          'Kamar',

          'Tenant',

          'Kategori',

          'Status',

          'Tanggal',

          'Nilai',

          'Tindakan',

          'Keterangan'

        ]

      ])

      .setBackground(

        '#FCE4D6'

      )

      .setFontWeight(

        'bold'

      );





    const rows =

      attentionRows.slice(

        0,

        20

      );





    sh

      .getRange(

        15,

        1,

        rows.length,

        8

      )

      .setValues(

        rows

      );





    sh

      .getRange(

        15,

        5,

        rows.length,

        1

      )

      .setNumberFormat(

        'dd/mm/yyyy'

      );





    sh

      .getRange(

        15,

        6,

        rows.length,

        1

      )

      .setNumberFormat(

        'Rp #,##0'

      );





    monitorStart =

      17 +

      rows.length;



  }





  /*

   * ========================================================

   * MONITOR KAMAR

   * ========================================================

   */



  sh

    .getRange(

      monitorStart,

      1,

      1,

      8

    )

    .merge()

    .setValue(

      'MONITOR 39 KAMAR'

    )

    .setBackground(

      '#17365D'

    )

    .setFontColor(

      '#FFFFFF'

    )

    .setFontWeight(

      'bold'

    );





  sh

    .getRange(

      monitorStart + 1,

      1,

      1,

      8

    )

    .setValues([

      [

        'Kamar',

        'Tenant',

        'Status',

        'Harga',

        'Pembayaran',

        'Jatuh Tempo',

        'Maintenance',

        'Kontrak Berakhir'

      ]

    ])

    .setBackground(

      '#D9EAF7'

    )

    .setFontWeight(

      'bold'

    );





  const roomRows =

    model.rooms.map(

      function(room) {



        return [



          room.room,



          room.tenantName ||

            '—',



          room.status,



          room.rent,



          room.paymentStatus,



          room.dueDate ||

            '',



          room.maintenanceStatus ||

            '—',



          room.contractEnd ||

            ''



        ];



      }

    );





  sh

    .getRange(

      monitorStart + 2,

      1,

      roomRows.length,

      8

    )

    .setValues(

      roomRows

    );





  sh

    .getRange(

      monitorStart + 2,

      4,

      roomRows.length,

      1

    )

    .setNumberFormat(

      'Rp #,##0'

    );





  sh

    .getRange(

      monitorStart + 2,

      6,

      roomRows.length,

      1

    )

    .setNumberFormat(

      'dd/mm/yyyy'

    );





  sh

    .getRange(

      monitorStart + 2,

      8,

      roomRows.length,

      1

    )

    .setNumberFormat(

      'dd/mm/yyyy'

    );





  sh

    .getRange(

      monitorStart + 1,

      1,

      roomRows.length + 1,

      8

    )

    .setBorder(

      true,

      true,

      true,

      true,

      true,

      true

    );





  sh.setFrozenRows(

    3

  );



}





/* ============================================================

   CARD

   \============================================================ */



function d5Card_(

  sh,

  titleRange,

  valueRange,

  title,

  value,

  format,

  background

) {



  sh

    .getRange(

      titleRange

    )

    .merge()

    .setValue(

      title

    )

    .setBackground(

      background

    )

    .setFontWeight(

      'bold'

    )

    .setHorizontalAlignment(

      'center'

    );





  sh

    .getRange(

      valueRange

    )

    .merge()

    .setValue(

      value

    )

    .setFontSize(

      20

    )

    .setFontWeight(

      'bold'

    )

    .setHorizontalAlignment(

      'center'

    )

    .setVerticalAlignment(

      'middle'

    )

    .setNumberFormat(

      format

    );



}





/* ============================================================

   BUILD API_DATA

   \============================================================ */



function d5BuildApi_(

  ss,

  model

) {



  let sh =

    ss.getSheetByName(

      DJD5.sheets.api

    );





  if (!sh) {



    sh =

      ss.insertSheet(

        DJD5.sheets.api

      );



  }





  const filter =

    sh.getFilter();





  if (filter) {



    filter.remove();



  }





  sh

    .getRange(

      1,

      1,

      sh.getMaxRows(),

      sh.getMaxColumns()

    )

    .breakApart();





  sh.clear();





  sh.setHiddenGridlines(

    true

  );





  const headers = [



    'Generated_At',



    'Periode',



    'Room_ID',



    'No_Kamar',



    'Lantai',



    'Status_Kamar',



    'Tenant_ID',



    'Nama_Tenant',



    'Status_Tenant',



    'Harga_Bulan',



    'Listrik',



    'Fasilitas',



    'Status_Pembayaran',



    'Jatuh_Tempo',



    'Tanggal_Bayar',



    'Nominal_Sewa',



    'Denda',



    'Hari_Terlambat',



    'Bukti_Pembayaran_URL',



    'Maintenance_Status',



    'Maintenance_Jenis',



    'Maintenance_Deskripsi',



    'Maintenance_Tanggal',



    'Maintenance_Foto_URL',



    'Kontrak_Berakhir'



  ];





  sh

    .getRange(

      1,

      1,

      1,

      headers.length

    )

    .setValues([

      headers

    ])

    .setBackground(

      '#17365D'

    )

    .setFontColor(

      '#FFFFFF'

    )

    .setFontWeight(

      'bold'

    );





  const generated =

    new Date();





  const rows =

    model.rooms.map(

      function(room) {



        return [



          generated,



          model.period.label,



          room.roomId,



          room.room,



          room.floor,



          room.status,



          room.tenantId,



          room.tenantName,



          room.tenantStatus,



          room.rent,



          room.listrik,



          room.fasilitas,



          room.paymentStatus,



          room.dueDate,



          room.paidDate,



          room.paid,



          room.fine,



          room.lateDays,



          room.proof,



          room.maintenanceStatus,



          room.maintenanceType,



          room.maintenanceDescription,



          room.maintenanceDate,



          room.maintenancePhoto,



          room.contractEnd



        ];



      }

    );





  if (

    rows.length

  ) {



    sh

      .getRange(

        2,

        1,

        rows.length,

        headers.length

      )

      .setValues(

        rows

      );





    sh

      .getRange(

        2,

        1,

        rows.length,

        1

      )

      .setNumberFormat(

        'dd/mm/yyyy hh:mm'

      );





    sh

      .getRange(

        2,

        10,

        rows.length,

        1

      )

      .setNumberFormat(

        'Rp #,##0'

      );





    sh

      .getRange(

        2,

        14,

        rows.length,

        2

      )

      .setNumberFormat(

        'dd/mm/yyyy'

      );





    sh

      .getRange(

        2,

        16,

        rows.length,

        2

      )

      .setNumberFormat(

        'Rp #,##0'

      );





    sh

      .getRange(

        2,

        23,

        rows.length,

        1

      )

      .setNumberFormat(

        'dd/mm/yyyy'

      );





    sh

      .getRange(

        2,

        25,

        rows.length,

        1

      )

      .setNumberFormat(

        'dd/mm/yyyy'

      );





    sh

      .getRange(

        1,

        1,

        rows.length + 1,

        headers.length

      )

      .createFilter();



  }





  for (

    let i = 1;

    i <= headers.length;

    i++

  ) {



    sh.autoResizeColumn(

      i

    );



  }





  sh.setFrozenRows(

    1

  );



}





/* ============================================================

   NORMALIZE HEADER

   \============================================================ */



function d5Norm_(

  value

) {



  return d5Clean_(

    value

  )

    .toLowerCase()

    .replace(

      /[^a-z0-9]+/g,

      ' '

    )

    .trim()

    .replace(

      /\s+/g,

      ' '

    );



}





/* ============================================================

   CLEAN

   \============================================================ */



function d5Clean_(

  value

) {



  if (

    value === null ||

    value === undefined

  ) {



    return '';



  }





  return String(

    value

  ).trim();



}





/* ============================================================

   NUMBER

   \============================================================ */



function d5Number_(

  value

) {



  if (

    typeof value ===

    'number'

  ) {



    return value;



  }





  const cleaned =

    d5Clean_(

      value

    )

      .replace(

        /[^0-9-]/g,

        ''

      );





  const result =

    Number(

      cleaned

    );





  return isNaN(

    result

  )

    ? 0

    : result;



}





/* ============================================================

   LOG

   \============================================================ */



function d5Log_(

  ss,

  type,

  message

) {



  let sheet =

    ss.getSheetByName(

      DJD5.sheets.log

    );





  if (!sheet) {



    sheet =

      ss.insertSheet(

        DJD5.sheets.log

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

        3

      )

      .setValues([

        [

          'Timestamp',

          'Type',

          'Message'

        ]

      ]);



  }





  sheet.appendRow([

    new Date(),

    type,

    message

  ]);



}