const DJ_KOST_API =
  'https://dj-family-kost.mahjongjong.workers.dev';


console.log(
  '[DJ KOST] dj-kost.js berhasil dimuat.'
);


async function apiGet(
  action
) {

  const url =
    DJ_KOST_API +
    '?action=' +
    encodeURIComponent(
      action
    );


  console.log(
    '[DJ KOST] GET:',
    url
  );


  const response =
    await fetch(
      url,
      {
        method: 'GET',
        cache: 'no-store'
      }
    );


  console.log(
    '[DJ KOST] HTTP:',
    response.status
  );


  const text =
    await response.text();


  console.log(
    '[DJ KOST] RESPONSE:',
    text
  );


  let result;


  try {

    result =
      JSON.parse(
        text
      );

  } catch (error) {

    throw new Error(
      'Respons API bukan JSON.'
    );

  }


  if (
    !result.ok
  ) {

    throw new Error(
      result.error ||
      'API mengembalikan error.'
    );

  }


  return result;

}


function renderError(
  message
) {

  const container =
    document.getElementById(
      'roomCatalog'
    );


  if (
    container
  ) {

    container.innerHTML =
      `
        <div class="card note">
          <strong>
            Koneksi API gagal
          </strong>

          <div style="margin-top:8px">
            ${message}
          </div>
        </div>
      `;

  }


  console.error(
    '[DJ KOST] ERROR:',
    message
  );

}


async function loadIndex() {

  console.log(
    '[DJ KOST] initIndex mulai.'
  );


  const total =
    document.getElementById(
      'totalRooms'
    );

  const empty =
    document.getElementById(
      'emptyRooms'
    );

  const occupied =
    document.getElementById(
      'occupiedRooms'
    );

  const catalog =
    document.getElementById(
      'roomCatalog'
    );


  if (
    !total ||
    !empty ||
    !occupied ||
    !catalog
  ) {

    throw new Error(
      'Elemen index.html tidak ditemukan.'
    );

  }


  try {

    const result =
      await apiGet(
        'rooms'
      );


    const rooms =
      result.data || [];


    console.log(
      '[DJ KOST] Jumlah kamar:',
      rooms.length
    );


    const vacant =
      rooms.filter(
        function(room) {

          return (
            room.status ===
            'KOSONG'
          );

        }
      ).length;


    const occupiedCount =
      rooms.filter(
        function(room) {

          return (
            room.status ===
            'TERISI'
          );

        }
      ).length;


    total.textContent =
      rooms.length;


    empty.textContent =
      vacant;


    occupied.textContent =
      occupiedCount;


    const floors =
      {};


    rooms.forEach(
      function(room) {

        const floor =
          room.lantai;


        if (
          !floors[floor]
        ) {

          floors[floor] =
            [];

        }


        floors[floor]
          .push(
            room
          );

      }
    );


    catalog.innerHTML =
      '';


    Object.keys(
      floors
    )
    .sort(
      function(a,b) {

        return (
          Number(a) -
          Number(b)
        );

      }
    )
    .forEach(
      function(floor) {

        const card =
          document.createElement(
            'div'
          );


        card.className =
          'card floor-card';


        card.innerHTML =
          `
            <div class="floor-head">

              <div>

                <div class="eyebrow">
                  LANTAI ${floor}
                </div>

                <h3>
                  Lantai ${floor}
                </h3>

                <div class="floor-meta">
                  ${floors[floor].length}
                  kamar
                </div>

              </div>

            </div>

            <div class="floor-rooms"></div>
          `;


        const roomContainer =
          card.querySelector(
            '.floor-rooms'
          );


        floors[floor].forEach(
          function(room) {

            const link =
              document.createElement(
                'a'
              );


            link.className =
              'room-card ' +
              (
                room.status === 'TERISI'
                  ? 'is-terisi'
                  : room.status === 'SEGERA'
                    ? 'is-segera'
                    : 'is-kosong'
              );


            if (
              room.status ===
              'KOSONG'
            ) {

              link.href =
                'pendaftaran.html?room=' +
                encodeURIComponent(
                  room.no_kamar
                );

            }


            link.innerHTML =
              `
                <div class="room-number">
                  ${room.no_kamar}
                </div>

                <span class="status ${
                  room.status === 'TERISI'
                    ? 'status-terisi'
                    : room.status === 'SEGERA'
                      ? 'status-segera'
                      : 'status-kosong'
                }">
                  ${room.status}
                </span>

                <div class="room-price">
                  ${
                    room.harga_bulan > 0
                      ? new Intl.NumberFormat(
                          'id-ID',
                          {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0
                          }
                        ).format(
                          room.harga_bulan
                        )
                      : 'Belum dibuka'
                  }
                </div>
              `;


            roomContainer.appendChild(
              link
            );

          }
        );


        catalog.appendChild(
          card
        );

      }
    );


    console.log(
      '[DJ KOST] index berhasil dirender.'
    );


  } catch (
    error
  ) {

    renderError(
      error.message
    );

  }

}


document.addEventListener(
  'DOMContentLoaded',
  function() {

    console.log(
      '[DJ KOST] DOMContentLoaded.'
    );


    loadIndex()
      .catch(
        function(error) {

          renderError(
            error.message
          );

        }
      );

  }
);
