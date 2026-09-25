const DJ_KOST_API =
  'https://dj-family-kost.mahjongjong.workers.dev';


console.log(
  '[DJ KOST] JS AKTIF'
);


/* ============================================================
   API GET
============================================================ */

async function djGet(
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
        cache:
          'no-store'
      }
    );


  const text =
    await response.text();


  console.log(
    '[DJ KOST] RESPONSE:',
    text
  );


  if (
    !response.ok
  ) {

    throw new Error(
      'HTTP ' +
      response.status
    );

  }


  let result;


  try {

    result =
      JSON.parse(
        text
      );

  } catch (_) {

    throw new Error(
      'API tidak mengembalikan JSON.'
    );

  }


  if (
    !result.ok
  ) {

    throw new Error(
      result.error ||
      'API error.'
    );

  }


  return result;

}


/* ============================================================
   API POST
============================================================ */

async function djPost(
  data
) {

  const response =
    await fetch(
      DJ_KOST_API,
      {
        method:
          'POST',

        headers: {
          'Content-Type':
            'text/plain;charset=utf-8'
        },

        body:
          JSON.stringify(
            data
          )
      }
    );


  const text =
    await response.text();


  let result;


  try {

    result =
      JSON.parse(
        text
      );

  } catch (_) {

    throw new Error(
      'API tidak mengembalikan JSON.'
    );

  }


  if (
    !result.ok
  ) {

    throw new Error(
      result.error ||
      'API error.'
    );

  }


  return result;

}


/* ============================================================
   FORMAT
============================================================ */

function djRupiah(
  value
) {

  return new Intl.NumberFormat(
    'id-ID',
    {
      style:
        'currency',

      currency:
        'IDR',

      maximumFractionDigits:
        0
    }
  )
  .format(
    Number(
      value ||
      0
    )
  );

}


function djEscape(
  value
) {

  return String(
    value == null
      ? ''
      : value
  )
  .replace(
    /[&<>"']/g,
    function(char) {

      return {
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'
      }[char];

    }
  );

}


/* ============================================================
   INDEX
============================================================ */

async function initIndex() {

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


  console.log(
    '[DJ KOST] INDEX INIT'
  );


  if (
    !total ||
    !empty ||
    !occupied ||
    !catalog
  ) {

    console.error(
      '[DJ KOST] Elemen index tidak lengkap.'
    );

    return;

  }


  try {

    const result =
      await djGet(
        'rooms'
      );


    const rooms =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];


    total.textContent =
      rooms.length;


    empty.textContent =
      rooms.filter(
        function(room) {

          return (
            room.status ===
            'KOSONG'
          );

        }
      ).length;


    occupied.textContent =
      rooms.filter(
        function(room) {

          return (
            room.status ===
            'TERISI'
          );

        }
      ).length;


    const floors =
      {};


    rooms.forEach(
      function(room) {

        const floor =
          Number(
            room.lantai
          );


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
                  ${floors[floor].length} kamar
                </div>

              </div>

            </div>

            <div class="floor-rooms"></div>
          `;


        const roomArea =
          card.querySelector(
            '.floor-rooms'
          );


        floors[floor].forEach(
          function(room) {

            const item =
              document.createElement(
                'a'
              );


            let className =
              'room-card ';


            if (
              room.status ===
              'KOSONG'
            ) {

              className +=
                'is-kosong';

              item.href =
                './pendaftaran.html?room=' +
                encodeURIComponent(
                  room.no_kamar
                );

            }

            else if (
              room.status ===
              'TERISI'
            ) {

              className +=
                'is-terisi';

              item.href =
                'javascript:void(0)';

            }

            else {

              className +=
                'is-segera';

              item.href =
                'javascript:void(0)';

            }


            item.className =
              className;


            item.innerHTML =
              `
                <div class="room-number">
                  ${djEscape(
                    room.no_kamar
                  )}
                </div>

                <span class="status ${
                  room.status === 'TERISI'
                    ? 'status-terisi'
                    : room.status === 'SEGERA'
                      ? 'status-segera'
                      : 'status-kosong'
                }">

                  ${djEscape(
                    room.status
                  )}

                </span>

                <div class="room-price">

                  ${
                    Number(
                      room.harga_bulan
                    ) > 0

                      ? djRupiah(
                          room.harga_bulan
                        )

                      : 'Belum dibuka'
                  }

                </div>
              `;


            roomArea.appendChild(
              item
            );

          }
        );


        catalog.appendChild(
          card
        );

      }
    );


    console.log(
      '[DJ KOST] INDEX OK —',
      rooms.length,
      'rooms'
    );


  } catch (error) {

    console.error(
      '[DJ KOST] INDEX ERROR',
      error
    );


    catalog.innerHTML =
      `
        <div class="card note">

          <strong>
            Gagal memuat data kamar.
          </strong>

          <div style="margin-top:8px">
            ${djEscape(
              error.message
            )}
          </div>

        </div>
      `;

  }

}


/* ============================================================
   ROOM SELECT
============================================================ */

async function fillRoomSelect(
  id
) {

  const select =
    document.getElementById(
      id
    );


  if (
    !select
  ) {

    console.warn(
      '[DJ KOST] Select tidak ditemukan:',
      id
    );

    return;

  }


  select.innerHTML =
    `
      <option value="">
        Memuat kamar...
      </option>
    `;


  try {

    const result =
      await djGet(
        'rooms'
      );


    const rooms =
      Array.isArray(
        result.data
      )
        ? result.data
        : [];


    select.innerHTML =
      `
        <option value="">
          Pilih kamar
        </option>
      `;


    let count =
      0;


    rooms.forEach(
      function(room) {

        /*
         * Hanya kamar KOSONG
         * yang bisa dipilih.
         */

        if (
          room.status !==
          'KOSONG'
        ) {

          return;

        }


        const option =
          document.createElement(
            'option'
          );


        option.value =
          String(
            room.no_kamar
          );


        option.textContent =
          String(
            room.no_kamar
          ) +
          ' — ' +
          djRupiah(
            room.harga_bulan
          ) +
          '/bulan';


        select.appendChild(
          option
        );


        count++;

      }
    );


    if (
      count ===
      0
    ) {

      select.innerHTML =
        `
          <option value="">
            Tidak ada kamar tersedia
          </option>
        `;

    }


    /*
     * Jika URL punya ?room=101,
     * otomatis pilih kamar tersebut.
     */

    const params =
      new URLSearchParams(
        location.search
      );


    const roomFromUrl =
      params.get(
        'room'
      );


    if (
      roomFromUrl
    ) {

      select.value =
        roomFromUrl;

    }


    console.log(
      '[DJ KOST] ROOM SELECT OK:',
      id,
      count
    );


  } catch (error) {

    console.error(
      '[DJ KOST] ROOM SELECT ERROR:',
      error
    );


    select.innerHTML =
      `
        <option value="">
          Gagal memuat kamar
        </option>
      `;

  }

}


/* ============================================================
   LOGIN
============================================================ */

function initLogin() {

  const form =
    document.getElementById(
      'loginForm'
    );


  if (
    !form
  ) {

    return;

  }


  form.addEventListener(
    'submit',
    async function(event) {

      event.preventDefault();


      const button =
        document.getElementById(
          'loginButton'
        );


      const message =
        document.getElementById(
          'loginMessage'
        );


      button.disabled =
        true;


      if (
        message
      ) {

        message.textContent =
          'Memeriksa akun...';

        message.className =
          'message show';

      }


      try {

        const result =
          await djPost({
            action:
              'login',

            tenantId:
              document.getElementById(
                'tenantId'
              ).value.trim(),

            password:
              document.getElementById(
                'password'
              ).value
          });


        sessionStorage.setItem(
          'djTenantSession',
          result.token
        );


        sessionStorage.setItem(
          'djTenantData',
          JSON.stringify(
            result.data
          )
        );


        const params =
          new URLSearchParams(
            location.search
          );


        location.href =
          params.get(
            'redirect'
          ) ||
          './portal.html';


      } catch (error) {

        if (
          message
        ) {

          message.textContent =
            error.message;

          message.className =
            'message show error';

        }

      } finally {

        button.disabled =
          false;

      }

    }
  );

}


/* ============================================================
   AUTH
============================================================ */

function requireLogin() {

  const token =
    sessionStorage.getItem(
      'djTenantSession'
    );


  if (
    !token
  ) {

    const page =
      location.pathname
        .split('/')
        .pop();


    location.href =
      './login.html?redirect=' +
      encodeURIComponent(
        page
      );


    return false;

  }


  return true;

}


function logout() {

  sessionStorage.removeItem(
    'djTenantSession'
  );


  sessionStorage.removeItem(
    'djTenantData'
  );


  location.href =
    './login.html';

}


function bindLogout() {

  const button =
    document.getElementById(
      'logoutTop'
    );


  if (
    button
  ) {

    button.addEventListener(
      'click',
      function(event) {

        event.preventDefault();

        logout();

      }
    );

  }

}


function tenantData() {

  try {

    return JSON.parse(
      sessionStorage.getItem(
        'djTenantData'
      ) ||
      'null'
    );

  } catch (_) {

    return null;

  }

}


function renderTenantData() {

  const tenant =
    tenantData();


  if (
    !tenant
  ) {

    return;

  }


  const mapping = {

    tenantName:
      tenant.nama_lengkap,

    tenantId:
      tenant.tenant_id,

    tenantRoom:
      tenant.no_kamar,

    paymentTenant:
      tenant.nama_lengkap,

    paymentRoom:
      tenant.no_kamar,

    maintenanceTenant:
      tenant.nama_lengkap,

    maintenanceRoom:
      tenant.no_kamar,

    cioTenant:
      tenant.nama_lengkap,

    cioRoom:
      tenant.no_kamar

  };


  Object.keys(
    mapping
  ).forEach(
    function(id) {

      const element =
        document.getElementById(
          id
        );


      if (
        element
      ) {

        element.textContent =
          mapping[id] ||
          '-';


        if (
          'value' in
          element
        ) {

          element.value =
            mapping[id] ||
            '';

        }

      }

    }
  );

}


/* ============================================================
   PENDAFTARAN
============================================================ */

async function initRegistration() {

  await fillRoomSelect(
    'regRoom'
  );


  const form =
    document.getElementById(
      'registrationForm'
    );


  if (
    !form
  ) {

    return;

  }


  const button =
    document.getElementById(
      'registrationButton'
    );


  form.addEventListener(
    'submit',
    async function(event) {

      event.preventDefault();


      button.disabled =
        true;


      try {

        const result =
          await djPost({

            action:
              'registration',

            requestId:
              (
                window.crypto &&
                window.crypto.randomUUID
              )
                ? window.crypto.randomUUID()
                : String(
                    Date.now()
                  ),

            name:
              document.getElementById(
                'regName'
              ).value.trim(),

            nickname:
              document.getElementById(
                'regNickname'
              ).value.trim(),

            phone:
              document.getElementById(
                'regPhone'
              ).value.trim(),

            email:
              document.getElementById(
                'regEmail'
              ).value.trim(),

            nik:
              document.getElementById(
                'regNik'
              ).value.trim(),

            job:
              document.getElementById(
                'regJob'
              ).value.trim(),

            company:
              document.getElementById(
                'regCompany'
              ).value.trim(),

            gender:
              document.getElementById(
                'regGender'
              ).value,

            address:
              document.getElementById(
                'regAddress'
              ).value.trim(),

            room:
              document.getElementById(
                'regRoom'
              ).value,

            startDate:
              document.getElementById(
                'regStartDate'
              ).value,

            note:
              document.getElementById(
                'regNote'
              ).value.trim()

          });


        showMessage(
          'registrationMessage',
          (
            result.message ||
            'Pendaftaran berhasil.'
          ) +
          (
            result.pendaftaran_id
              ? ' ID: ' +
                result.pendaftaran_id
              : ''
          ),
          'ok'
        );


        form.reset();


        await fillRoomSelect(
          'regRoom'
        );


      } catch (error) {

        showMessage(
          'registrationMessage',
          error.message,
          'error'
        );

      } finally {

        button.disabled =
          false;

      }

    }
  );

}


/* ============================================================
   KUNJUNGAN
============================================================ */

async function initVisit() {

  await fillRoomSelect(
    'visitRoom'
  );


  const form =
    document.getElementById(
      'visitForm'
    );


  if (
    !form
  ) {

    return;

  }


  const button =
    document.getElementById(
      'visitButton'
    );


  form.addEventListener(
    'submit',
    async function(event) {

      event.preventDefault();


      button.disabled =
        true;


      try {

        const result =
          await djPost({

            action:
              'visit',

            requestId:
              String(
                Date.now()
              ) +
              '-' +
              Math.random()
                .toString(16)
                .slice(2),

            name:
              document.getElementById(
                'visitName'
              ).value.trim(),

            phone:
              document.getElementById(
                'visitPhone'
              ).value.trim(),

            email:
              document.getElementById(
                'visitEmail'
              ).value.trim(),

            room:
              document.getElementById(
                'visitRoom'
              ).value,

            date:
              document.getElementById(
                'visitDate'
              ).value,

            time:
              document.getElementById(
                'visitTime'
              ).value,

            note:
              document.getElementById(
                'visitNote'
              ).value.trim()

          });


        showMessage(
          'visitMessage',
          (
            result.message ||
            'Pengajuan berhasil.'
          ) +
          (
            result.kunjungan_id
              ? ' ID: ' +
                result.kunjungan_id
              : ''
          ),
          'ok'
        );


        form.reset();


        await fillRoomSelect(
          'visitRoom'
        );


      } catch (error) {

        showMessage(
          'visitMessage',
          error.message,
          'error'
        );

      } finally {

        button.disabled =
          false;

      }

    }
  );

}


/* ============================================================
   PAYMENT
============================================================ */

async function initPayment() {

  if (
    !requireLogin()
  ) {

    return;

  }


  bindLogout();

  renderTenantData();


  const period =
    document.getElementById(
      'paymentPeriod'
    );


  const date =
    document.getElementById(
      'paymentDate'
    );


  if (
    period
  ) {

    period.value =
      new Date()
        .toISOString()
        .slice(
          0,
          7
        );

  }


  if (
    date
  ) {

    date.value =
      today();

  }


  const form =
    document.getElementById(
      'paymentForm'
    );


  if (
    !form
  ) {

    return;

  }


  const button =
    document.getElementById(
      'paymentButton'
    );


  form.addEventListener(
    'submit',
    async function(event) {

      event.preventDefault();


      button.disabled =
        true;


      try {

        const result =
          await djPost({

            action:
              'payment',

            token:
              getSessionToken(),

            period:
              period.value,

            paymentDate:
              date.value,

            amount:
              document.getElementById(
                'paymentAmount'
              ).value,

            method:
              document.getElementById(
                'paymentMethod'
              ).value,

            proofUrl:
              document.getElementById(
                'paymentProof'
              ).value.trim(),

            note:
              document.getElementById(
                'paymentNote'
              ).value.trim()

          });


        showMessage(
          'paymentMessage',
          result.message ||
          'Pembayaran berhasil dicatat.',
          'ok'
        );


      } catch (error) {

        showMessage(
          'paymentMessage',
          error.message,
          'error'
        );

      } finally {

        button.disabled =
          false;

      }

    }
  );

}


/* ============================================================
   MAINTENANCE
============================================================ */

async function initMaintenance() {

  if (
    !requireLogin()
  ) {

    return;

  }


  bindLogout();

  renderTenantData();


  const form =
    document.getElementById(
      'maintenanceForm'
    );


  if (
    !form
  ) {

    return;

  }


  const button =
    document.getElementById(
      'maintenanceButton'
    );


  form.addEventListener(
    'submit',
    async function(event) {

      event.preventDefault();


      button.disabled =
        true;


      try {

        const files =
          await collectImages(
            document.getElementById(
              'maintenanceFiles'
            )
          );


        const result =
          await djPost({

            action:
              'maintenance',

            token:
              getSessionToken(),

            requestId:
              String(
                Date.now()
              ) +
              '-' +
              Math.random()
                .toString(16)
                .slice(2),

            location:
              document.getElementById(
                'maintenanceLocation'
              ).value.trim(),

            type:
              document.getElementById(
                'maintenanceType'
              ).value,

            urgency:
              document.getElementById(
                'maintenanceUrgency'
              ).value,

            access:
              document.getElementById(
                'maintenanceAccess'
              ).value,

            preferredTime:
              document.getElementById(
                'maintenanceTime'
              ).value,

            description:
              document.getElementById(
                'maintenanceDescription'
              ).value.trim(),

            files:
              files

          });


        showMessage(
          'maintenanceMessage',
          result.message ||
          'Laporan berhasil dikirim.',
          'ok'
        );


        form.reset();


        renderTenantData();


      } catch (error) {

        showMessage(
          'maintenanceMessage',
          error.message,
          'error'
        );

      } finally {

        button.disabled =
          false;

      }

    }
  );

}


/* ============================================================
   CHECK-IN / CHECK-OUT
============================================================ */

async function initCheckInOut() {

  if (
    !requireLogin()
  ) {

    return;

  }


  bindLogout();

  renderTenantData();


  const date =
    document.getElementById(
      'cioDate'
    );


  if (
    date
  ) {

    date.value =
      today();

  }


  const form =
    document.getElementById(
      'checkinoutForm'
    );


  if (
    !form
  ) {

    return;

  }


  const button =
    document.getElementById(
      'cioButton'
    );


  form.addEventListener(
    'submit',
    async function(event) {

      event.preventDefault();


      button.disabled =
        true;


      try {

        const files =
          await collectImages(
            document.getElementById(
              'cioFiles'
            )
          );


        const meterFiles =
          await collectImages(
            document.getElementById(
              'cioMeterFiles'
            ),
            2
          );


        const process =
          document.getElementById(
            'cioProcess'
          ).value;


        const result =
          await djPost({

            action:
              'checkinout',

            token:
              getSessionToken(),

            requestId:
              String(
                Date.now()
              ) +
              '-' +
              Math.random()
                .toString(16)
                .slice(2),

            process:
              process,

            date:
              date.value,

            keys:
              document.getElementById(
                'cioKeys'
              ).value,

            keysReturned:
              document.getElementById(
                'cioKeysReturned'
              ).value,

            roomCondition:
              document.getElementById(
                'cioRoomCondition'
              ).value.trim(),

            note:
              document.getElementById(
                'cioNote'
              ).value.trim(),

            files:
              files,

            meterFiles:
              meterFiles,

            damage:
              document.getElementById(
                'cioDamage'
              ).value,

            damageDetail:
              document.getElementById(
                'cioDamageDetail'
              ).value.trim(),

            facility:
              document.getElementById(
                'cioFacility'
              ).value.trim(),

            depositReduction:
              document.getElementById(
                'cioDepositReduction'
              ).value,

            statement:
              document.getElementById(
                'cioStatement'
              ).value.trim()

          });


        showMessage(
          'cioMessage',
          result.message ||
          'Data berhasil disimpan.',
          'ok'
        );


        if (
          process ===
          'CHECK-OUT'
        ) {

          setTimeout(
            logout,
            1500
          );

        }


      } catch (error) {

        showMessage(
          'cioMessage',
          error.message,
          'error'
        );

      } finally {

        button.disabled =
          false;

      }

    }
  );

}


/* ============================================================
   UTIL FILE
============================================================ */

async function collectImages(
  input,
  maxFiles = 4
) {

  const files =
    Array.from(
      input &&
      input.files ||
      []
    )
    .slice(
      0,
      maxFiles
    );


  const result =
    [];


  for (
    const file of files
  ) {

    const dataUrl =
      await new Promise(
        function(resolve,reject) {

          const reader =
            new FileReader();


          reader.onload =
            function() {

              resolve(
                reader.result
              );

            };


          reader.onerror =
            function() {

              reject(
                new Error(
                  'Gagal membaca ' +
                  file.name
                )
              );

            };


          reader.readAsDataURL(
            file
          );

        }
      );


    result.push({

      name:
        file.name,

      dataUrl:
        dataUrl

    });

  }


  return result;

}


/* ============================================================
   MESSAGE
============================================================ */

function showMessage(
  id,
  message,
  type
) {

  const element =
    document.getElementById(
      id
    );


  if (
    !element
  ) {

    return;

  }


  element.textContent =
    message;


  element.className =
    'message show ' +
    (
      type === 'error'
        ? 'error'
        : 'ok'
    );

}


/* ============================================================
   TOKEN HELPER
============================================================ */

function getSessionToken() {

  return (
    sessionStorage.getItem(
      'djTenantSession'
    ) ||
    ''
  );

}


/* ============================================================
   TODAY
============================================================ */

function today() {

  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );

}


/* ============================================================
   PAGE ROUTER
============================================================ */

document.addEventListener(
  'DOMContentLoaded',
  async function() {

    console.log(
      '[DJ KOST] DOM READY:',
      location.pathname
    );


    const page =
      location.pathname
        .split('/')
        .pop()
        .toLowerCase();


    try {

      if (
        page ===
        'index.html' ||
        page ===
        ''
      ) {

        await initIndex();

        return;

      }


      if (
        page ===
        'pendaftaran.html'
      ) {

        await initRegistration();

        return;

      }


      if (
        page ===
        'kunjungan.html'
      ) {

        await initVisit();

        return;

      }


      if (
        page ===
        'login.html'
      ) {

        initLogin();

        return;

      }


      if (
        page ===
        'portal.html'
      ) {

        await initPortal();

        return;

      }


      if (
        page ===
        'pembayaran.html'
      ) {

        await initPayment();

        return;

      }


      if (
        page ===
        'maintenance.html'
      ) {

        await initMaintenance();

        return;

      }


      if (
        page ===
        'checkinout.html'
      ) {

        await initCheckInOut();

        return;

      }


      if (
        page ===
        'cafe.html' ||
        page ===
        'laundry.html'
      ) {

        if (
          requireLogin()
        ) {

          bindLogout();

          renderTenantData();

        }

        return;

      }

    } catch (error) {

      console.error(
        '[DJ KOST] FATAL:',
        error
      );

    }

  }
);


/* ============================================================
   PORTAL
============================================================ */

async function initPortal() {

  if (
    !requireLogin()
  ) {

    return;

  }


  bindLogout();


  try {

    const result =
      await djGet(
        'tenantDashboard'
      );


    /*
     * Endpoint tenant membutuhkan token.
     * Untuk itu panggil ulang dengan query.
     */

    const token =
      getSessionToken();


    const response =
      await fetch(
        DJ_KOST_API +
        '?action=tenantDashboard&token=' +
        encodeURIComponent(
          token
        ),
        {
          cache:
            'no-store'
        }
      );


    const text =
      await response.text();


    const data =
      JSON.parse(
        text
      );


    if (
      !data.ok
    ) {

      throw new Error(
        data.error ||
        'Gagal memuat portal.'
      );

    }


    const portal =
      data.data ||
      {};


    if (
      portal.tenant
    ) {

      renderTenantData(
        portal.tenant
      );

    }


    const welcome =
      document.getElementById(
        'welcome'
      );


    const tenant =
      portal.tenant;


    if (
      welcome &&
      tenant
    ) {

      welcome.innerHTML =
        `
          Selamat datang,
          <strong>
            ${djEscape(
              tenant.nama_lengkap
            )}
          </strong>.
          Tenant ID:
          <strong>
            ${djEscape(
              tenant.tenant_id
            )}
          </strong>
          · Kamar:
          <strong>
            ${djEscape(
              tenant.no_kamar
            )}
          </strong>.
        `;

    }


    const payment =
      portal.payment;


    const bill =
      document.getElementById(
        'currentBill'
      );


    if (
      bill
    ) {

      bill.innerHTML =
        payment

          ? `
              <div class="kpi-label">
                ${djEscape(
                  payment.Periode_Pembayaran ||
                  ''
                )}
              </div>

              <div class="kpi-value">
                ${djRupiah(
                  payment.Total_Tagihan
                )}
              </div>

              <span class="status status-segera">
                ${djEscape(
                  payment.Status_Pembayaran ||
                  ''
                )}
              </span>
            `

          : `
              <div class="kpi-label">
                Tagihan saat ini
              </div>

              <div class="kpi-value">
                Belum tersedia
              </div>
            `;

    }


  } catch (error) {

    console.error(
      '[DJ KOST] PORTAL ERROR:',
      error
    );


    if (
      String(
        error.message
      )
      .toLowerCase()
      .includes(
        'sesi'
      )
    ) {

      logout();

      return;

    }


    showMessage(
      'portalMessage',
      error.message,
      'error'
    );

  }

}
