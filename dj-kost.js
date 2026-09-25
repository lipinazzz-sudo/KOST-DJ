/* ============================================================
   DJ FAMILY KOST — FRONTEND ENGINE
   ============================================================

   Satu file untuk seluruh frontend:

   index.html
   login.html
   portal.html
   pembayaran.html
   maintenance.html
   checkinout.html
   pendaftaran.html
   kunjungan.html
   cafe.html
   laundry.html

   API:
   Cloudflare Worker
   ↓
   Google Apps Script V2
   ↓
   Google Sheets

   ============================================================ */


const DJ_KOST_API =
  'https://dj-family-kost.mahjongjong.workers.dev';


const DJ_SESSION_KEY =
  'djTenantSession';


const DJ_TENANT_KEY =
  'djTenantData';


console.log(
  '[DJ KOST] Frontend engine loaded.'
);


/* ============================================================
   BASIC HELPERS
   ============================================================ */


function getSessionToken() {

  return (
    sessionStorage.getItem(
      DJ_SESSION_KEY
    ) || ''
  );

}


function getTenantData() {

  try {

    return JSON.parse(
      sessionStorage.getItem(
        DJ_TENANT_KEY
      ) || 'null'
    );

  } catch (_) {

    return null;

  }

}


function saveLoginSession(
  result
) {

  if (
    !result ||
    !result.token ||
    !result.data
  ) {

    throw new Error(
      'Respons login tidak lengkap.'
    );

  }


  sessionStorage.setItem(
    DJ_SESSION_KEY,
    result.token
  );


  sessionStorage.setItem(
    DJ_TENANT_KEY,
    JSON.stringify(
      result.data
    )
  );

}


function clearLoginSession() {

  sessionStorage.removeItem(
    DJ_SESSION_KEY
  );


  sessionStorage.removeItem(
    DJ_TENANT_KEY
  );

}


function requestId() {

  if (
    window.crypto &&
    typeof window.crypto.randomUUID ===
      'function'
  ) {

    return window.crypto.randomUUID();

  }


  return (
    Date.now() +
    '-' +
    Math.random()
      .toString(16)
      .slice(2)
  );

}


function today() {

  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );

}


function currentMonth() {

  return new Date()
    .toISOString()
    .slice(
      0,
      7
    );

}


function rupiah(
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
      value || 0
    )
  );

}


function escapeHtml(
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

      const map = {

        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'

      };


      return map[char];

    }
  );

}


function showMessage(
  id,
  message,
  type = 'ok'
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


function setBusy(
  button,
  busy,
  text
) {

  if (
    !button
  ) {

    return;

  }


  if (
    busy
  ) {

    if (
      !button.dataset.oldText
    ) {

      button.dataset.oldText =
        button.textContent;

    }


    button.disabled =
      true;


    button.textContent =
      text ||
      'Memproses...';

  } else {

    button.disabled =
      false;


    button.textContent =
      button.dataset.oldText ||
      button.textContent;

  }

}


/* ============================================================
   API
   ============================================================ */


async function apiGet(
  action,
  params = {}
) {

  const query =
    new URLSearchParams();


  query.set(
    'action',
    action
  );


  Object.keys(
    params
  ).forEach(
    function(key) {

      if (
        params[key] !==
        undefined &&
        params[key] !==
        null
      ) {

        query.set(
          key,
          String(
            params[key]
          )
        );

      }

    }
  );


  const url =
    DJ_KOST_API +
    '?' +
    query.toString();


  console.log(
    '[DJ KOST] GET',
    url
  );


  const response =
    await fetch(
      url,
      {

        method:
          'GET',

        cache:
          'no-store'

      }
    );


  const text =
    await response.text();


  console.log(
    '[DJ KOST] RESPONSE',
    text
  );


  let result;


  try {

    result =
      JSON.parse(
        text
      );

  } catch (_) {

    throw new Error(
      'Respons API bukan JSON.'
    );

  }


  if (
    !result.ok
  ) {

    throw new Error(
      result.error ||
      'Permintaan API gagal.'
    );

  }


  return result;

}


async function apiPost(
  action,
  data = {}
) {

  const body = {

    action,

    ...data

  };


  console.log(
    '[DJ KOST] POST',
    action,
    body
  );


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
            body
          )

      }
    );


  const text =
    await response.text();


  console.log(
    '[DJ KOST] POST RESPONSE',
    text
  );


  let result;


  try {

    result =
      JSON.parse(
        text
      );

  } catch (_) {

    throw new Error(
      'Respons API bukan JSON.'
    );

  }


  if (
    !result.ok
  ) {

    throw new Error(
      result.error ||
      'Permintaan API gagal.'
    );

  }


  return result;

}


/* ============================================================
   AUTH
   ============================================================ */


function redirectLogin() {

  const current =
    location.pathname
      .split('/')
      .pop();


  const redirect =
    current &&
    current !==
      'login.html'

      ? encodeURIComponent(
          current +
          location.search
        )

      : '';


  location.href =
    './login.html' +
    (
      redirect
        ? '?redirect=' +
          redirect
        : ''
    );

}


function requireLogin() {

  if (
    !getSessionToken()
  ) {

    redirectLogin();

    return false;

  }


  return true;

}


function logout() {

  clearLoginSession();

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


/* ============================================================
   ROOMS
   ============================================================ */


async function loadRooms() {

  const result =
    await apiGet(
      'rooms'
    );


  return result.data ||
    [];

}


function roomStatusClass(
  status
) {

  if (
    status ===
    'TERISI'
  ) {

    return 'status-terisi';

  }


  if (
    status ===
    'SEGERA'
  ) {

    return 'status-segera';

  }


  return 'status-kosong';

}


function roomOptionLabel(
  room
) {

  let label =
    String(
      room.no_kamar
    ) +
    ' — ' +
    String(
      room.status
    );


  if (
    Number(
      room.harga_bulan
    ) > 0
  ) {

    label +=
      ' — ' +
      rupiah(
        room.harga_bulan
      ) +
      '/bulan';

  } else {

    label +=
      ' — Belum dibuka';

  }


  return label;

}


/* ============================================================
   FILL ROOM SELECT
   ============================================================ */


async function fillRoomSelect(
  selectId,
  mode = 'available'
) {

  const select =
    document.getElementById(
      selectId
    );


  if (
    !select
  ) {

    console.warn(
      '[DJ KOST] Select tidak ditemukan:',
      selectId
    );

    return;

  }


  select.innerHTML =
    '<option value="">Memuat kamar...</option>';


  try {

    const rooms =
      await loadRooms();


    select.innerHTML =
      '<option value="">Pilih kamar</option>';


    rooms.forEach(
      function(room) {

        /*
         * Mode available:
         * hanya kamar KOSONG.
         */

        if (
          mode ===
            'available' &&
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
          roomOptionLabel(
            room
          );


        /*
         * Mode all:
         * kamar tetap ditampilkan,
         * tapi kamar non-kosong
         * tidak bisa dipilih.
         */

        if (
          mode !==
            'available' &&
          room.status !==
            'KOSONG'
        ) {

          option.disabled =
            true;

        }


        select.appendChild(
          option
        );

      }
    );


    if (
      !select.options.length
    ) {

      select.innerHTML =
        '<option value="">Tidak ada kamar tersedia</option>';

    }


    console.log(
      '[DJ KOST] Room select ready:',
      selectId,
      rooms.length
    );


  } catch (error) {

    console.error(
      '[DJ KOST] Room select error:',
      error
    );


    select.innerHTML =
      '<option value="">Gagal memuat kamar</option>';

  }

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


  if (
    !total ||
    !empty ||
    !occupied ||
    !catalog
  ) {

    console.warn(
      '[DJ KOST] Index elements tidak lengkap.'
    );


    return;

  }


  try {

    const rooms =
      await loadRooms();


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

        const roomsInFloor =
          floors[floor];


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
                  ${roomsInFloor.length}
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


        roomsInFloor.forEach(
          function(room) {

            const link =
              document.createElement(
                'a'
              );


            const statusClass =
              roomStatusClass(
                room.status
              );


            link.className =
              'room-card ' +
              (
                room.status ===
                  'KOSONG'
                  ? 'is-kosong'
                  : room.status ===
                      'TERISI'
                    ? 'is-terisi'
                    : 'is-segera'
              );


            if (
              room.status ===
              'KOSONG'
            ) {

              link.href =
                './pendaftaran.html?room=' +
                encodeURIComponent(
                  room.no_kamar
                );

            } else {

              link.href =
                'javascript:void(0)';

            }


            link.innerHTML =
              `
                <div class="room-number">
                  ${escapeHtml(
                    room.no_kamar
                  )}
                </div>

                <span class="status ${statusClass}">
                  ${escapeHtml(
                    room.status
                  )}
                </span>

                <div class="room-price">
                  ${
                    Number(
                      room.harga_bulan
                    ) > 0

                      ? rupiah(
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


  } catch (error) {

    catalog.innerHTML =
      `
        <div class="card note">

          <strong>
            Koneksi API gagal
          </strong>

          <div style="margin-top:8px">
            ${escapeHtml(
              error.message
            )}
          </div>

        </div>
      `;

    console.error(
      '[DJ KOST] Index error:',
      error
    );

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


      setBusy(
        button,
        true,
        'Memeriksa akun...'
      );


      showMessage(
        'loginMessage',
        'Menghubungkan ke sistem...',
        'ok'
      );


      try {

        const result =
          await apiPost(
            'login',
            {

              tenantId:
                document.getElementById(
                  'tenantId'
                ).value.trim(),

              password:
                document.getElementById(
                  'password'
                ).value

            }
          );


        saveLoginSession(
          result
        );


        const params =
          new URLSearchParams(
            location.search
          );


        const redirect =
          params.get(
            'redirect'
          );


        location.href =
          redirect ||
          './portal.html';


      } catch (error) {

        showMessage(
          'loginMessage',
          error.message,
          'error'
        );

      } finally {

        setBusy(
          button,
          false
        );

      }

    }
  );

}


/* ============================================================
   TENANT DATA
   ============================================================ */


function renderTenantIdentity(
  tenant
) {

  if (
    !tenant
  ) {

    return;

  }


  const textFields = {

    tenantName:
      tenant.nama_lengkap,

    tenantId:
      tenant.tenant_id,

    tenantRoom:
      tenant.no_kamar

  };


  Object.keys(
    textFields
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
          textFields[id] ||
          '-';

      }

    }
  );


  const valueFields = {

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
    valueFields
  ).forEach(
    function(id) {

      const element =
        document.getElementById(
          id
        );


      if (
        element
      ) {

        element.value =
          valueFields[id] ||
          '';

      }

    }
  );

}


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
      await apiGet(
        'tenantDashboard',
        {

          token:
            getSessionToken()

        }
      );


    const data =
      result.data ||
      {};


    const tenant =
      data.tenant;


    renderTenantIdentity(
      tenant
    );


    const welcome =
      document.getElementById(
        'welcome'
      );


    if (
      welcome &&
      tenant
    ) {

      welcome.innerHTML =
        `
          Selamat datang,
          <strong>
            ${escapeHtml(
              tenant.nama_lengkap
            )}
          </strong>.

          Tenant ID:
          <strong>
            ${escapeHtml(
              tenant.tenant_id
            )}
          </strong>

          · Kamar:
          <strong>
            ${escapeHtml(
              tenant.no_kamar
            )}
          </strong>.
        `;

    }


    const currentBill =
      document.getElementById(
        'currentBill'
      );


    const payment =
      data.payment;


    if (
      currentBill
    ) {

      if (
        payment
      ) {

        currentBill.innerHTML =
          `
            <div class="kpi-label">
              ${escapeHtml(
                payment.Periode_Pembayaran ||
                ''
              )}
            </div>

            <div class="kpi-value">
              ${rupiah(
                payment.Total_Tagihan
              )}
            </div>

            <span class="status ${
              payment.Status_Pembayaran ===
              'LUNAS'
                ? 'status-kosong'
                : 'status-segera'
            }">
              ${escapeHtml(
                payment.Status_Pembayaran ||
                ''
              )}
            </span>
          `;

      } else {

        currentBill.innerHTML =
          `
            <div class="kpi-label">
              Tagihan saat ini
            </div>

            <div class="kpi-value">
              Belum tersedia
            </div>
          `;

      }

    }


    const history =
      document.getElementById(
        'paymentHistory'
      );


    if (
      history
    ) {

      const rows =
        data.payments ||
        [];


      if (
        !rows.length
      ) {

        history.innerHTML =
          `
            <tr>

              <td colspan="6">
                Belum ada riwayat pembayaran.
              </td>

            </tr>
          `;

      } else {

        history.innerHTML =
          rows
            .map(
              function(item) {

                return `
                  <tr>

                    <td>
                      ${escapeHtml(
                        item.period
                      )}
                    </td>

                    <td>
                      ${rupiah(
                        item.nominal
                      )}
                    </td>

                    <td>
                      ${rupiah(
                        item.denda
                      )}
                    </td>

                    <td>
                      ${rupiah(
                        item.total
                      )}
                    </td>

                    <td>
                      ${escapeHtml(
                        item.status ||
                        ''
                      )}
                    </td>

                    <td>
                      ${escapeHtml(
                        item.verifikasi ||
                        ''
                      )}
                    </td>

                  </tr>
                `;

              }
            )
            .join('');

      }

    }


    const maintenanceList =
      document.getElementById(
        'maintenanceList'
      );


    if (
      maintenanceList
    ) {

      const rows =
        data.maintenance ||
        [];


      maintenanceList.innerHTML =
        rows.length

          ? rows
              .map(
                function(item) {

                  return `
                    <div class="card"
                         style="padding:18px">

                      <strong>
                        ${escapeHtml(
                          item.jenis ||
                          'Maintenance'
                        )}
                      </strong>

                      <div
                        style="margin-top:5px"
                      >
                        ${escapeHtml(
                          item.lokasi ||
                          '-'
                        )}
                      </div>

                      <div
                        style="
                          margin-top:7px;
                          color:#667085
                        "
                      >
                        ${escapeHtml(
                          item.deskripsi ||
                          ''
                        )}
                      </div>

                      <div
                        style="margin-top:10px"
                      >

                        <span
                          class="status status-segera"
                        >
                          ${escapeHtml(
                            item.status ||
                            ''
                          )}
                        </span>

                      </div>

                    </div>
                  `;

                }
              )
              .join('')

          : `
              <div class="note">
                Tidak ada laporan maintenance aktif.
              </div>
            `;


  } catch (error) {

    console.error(
      '[DJ KOST] Portal error:',
      error
    );


    if (
      error.message
        .toLowerCase()
        .includes(
          'sesi'
        )
    ) {

      clearLoginSession();

      redirectLogin();

      return;

    }


    showMessage(
      'portalMessage',
      error.message,
      'error'
    );

  }

}


/* ============================================================
   PENDAFTARAN
   ============================================================ */


async function initRegistration() {

  /*
   * INI YANG MEMPERBAIKI DROPDOWN KAMAR.
   */

  await fillRoomSelect(
    'regRoom',
    'available'
  );


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

    const select =
      document.getElementById(
        'regRoom'
      );


    if (
      select
    ) {

      const option =
        Array.from(
          select.options
        )
        .find(
          function(item) {

            return (
              item.value ===
              String(
                roomFromUrl
              )
            );

          }
        );


      if (
        option
      ) {

        select.value =
          String(
            roomFromUrl
          );

      }

    }

  }


  const form =
    document.getElementById(
      'registrationForm'
    );


  if (
    !form
  ) {

    console.error(
      '[DJ KOST] registrationForm tidak ditemukan.'
    );


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


      setBusy(
        button,
        true,
        'Mengirim pendaftaran...'
      );


      try {

        const result =
          await apiPost(
            'registration',
            {

              requestId:
                requestId(),

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

            }
          );


        showMessage(
          'registrationMessage',
          (
            result.message ||
            'Pendaftaran berhasil dikirim.'
          ) +
          (
            result.pendaftaran_id
              ? ' Pendaftaran ID: ' +
                result.pendaftaran_id
              : ''
          ),
          'ok'
        );


        form.reset();


      } catch (error) {

        showMessage(
          'registrationMessage',
          error.message,
          'error'
        );

      } finally {

        setBusy(
          button,
          false
        );

      }

    }
  );

}


/* ============================================================
   KUNJUNGAN
   ============================================================ */


async function initVisit() {

  await fillRoomSelect(
    'visitRoom',
    'all'
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


      setBusy(
        button,
        true,
        'Mengirim pengajuan...'
      );


      try {

        const result =
          await apiPost(
            'visit',
            {

              requestId:
                requestId(),

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

            }
          );


        showMessage(
          'visitMessage',
          (
            result.message ||
            'Pengajuan kunjungan berhasil.'
          ) +
          (
            result.kunjungan_id
              ? ' Kunjungan ID: ' +
                result.kunjungan_id
              : ''
          ),
          'ok'
        );


        form.reset();


      } catch (error) {

        showMessage(
          'visitMessage',
          error.message,
          'error'
        );

      } finally {

        setBusy(
          button,
          false
        );

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


  try {

    const tenant =
      getTenantData();


    renderTenantIdentity(
      tenant
    );


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
        currentMonth();

    }


    if (
      date
    ) {

      date.value =
        today();

    }


    const result =
      await apiGet(
        'tenantDashboard',
        {

          token:
            getSessionToken()

        }
      );


    const payment =
      result.data &&
      result.data.payment;


    const summary =
      document.getElementById(
        'paymentSummary'
      );


    if (
      summary
    ) {

      summary.innerHTML =
        payment

          ? `
              <div class="kpi-label">
                Tagihan
                ${escapeHtml(
                  payment.Periode_Pembayaran ||
                  ''
                )}
              </div>

              <div class="kpi-value">
                ${rupiah(
                  payment.Total_Tagihan
                )}
              </div>

              <div style="margin-top:8px">
                Status:
                <strong>
                  ${escapeHtml(
                    payment.Status_Pembayaran ||
                    ''
                  )}
                </strong>
              </div>
            `

          : `
              <div class="note">
                Tagihan bulan berjalan
                belum tersedia.
              </div>
            `;

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


        setBusy(
          button,
          true,
          'Menyimpan pembayaran...'
        );


        try {

          const result =
            await apiPost(
              'payment',
              {

                token:
                  getSessionToken(),

                period:
                  document.getElementById(
                    'paymentPeriod'
                  ).value,

                paymentDate:
                  document.getElementById(
                    'paymentDate'
                  ).value,

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

              }
            );


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

          setBusy(
            button,
            false
          );

        }

      }
    );


  } catch (error) {

    console.error(
      '[DJ KOST] Payment init error:',
      error
    );

  }

}


/* ============================================================
   FILE HELPERS
   ============================================================ */


async function collectImages(
  input,
  maximum = 4
) {

  const files =
    Array.from(
      input &&
      input.files ||
      []
    )
    .slice(
      0,
      maximum
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
                  'Gagal membaca file ' +
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
   MAINTENANCE
   ============================================================ */


async function initMaintenance() {

  if (
    !requireLogin()
  ) {

    return;

  }


  bindLogout();


  renderTenantIdentity(
    getTenantData()
  );


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


      setBusy(
        button,
        true,
        'Mengirim laporan...'
      );


      try {

        const files =
          await collectImages(
            document.getElementById(
              'maintenanceFiles'
            ),
            4
          );


        const result =
          await apiPost(
            'maintenance',
            {

              token:
                getSessionToken(),

              requestId:
                requestId(),

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

            }
          );


        showMessage(
          'maintenanceMessage',
          result.message ||
          'Laporan maintenance berhasil dikirim.',
          'ok'
        );


        form.reset();


        renderTenantIdentity(
          getTenantData()
        );


      } catch (error) {

        showMessage(
          'maintenanceMessage',
          error.message,
          'error'
        );

      } finally {

        setBusy(
          button,
          false
        );

      }

    }
  );

}


/* ============================================================
   CHECK IN / CHECK OUT
   ============================================================ */


async function initCheckInOut() {

  if (
    !requireLogin()
  ) {

    return;

  }


  bindLogout();


  renderTenantIdentity(
    getTenantData()
  );


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


      setBusy(
        button,
        true,
        'Menyimpan data...'
      );


      try {

        const files =
          await collectImages(
            document.getElementById(
              'cioFiles'
            ),
            4
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
          await apiPost(
            'checkinout',
            {

              token:
                getSessionToken(),

              requestId:
                requestId(),

              process:
                process,

              date:
                date
                  ? date.value
                  : today(),

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

            }
          );


        showMessage(
          'cioMessage',
          result.message ||
          'Data berhasil disimpan.',
          'ok'
        );


        /*
         * Setelah CHECK-OUT,
         * session tenant diakhiri.
         */

        if (
          process ===
          'CHECK-OUT'
        ) {

          setTimeout(
            function() {

              logout();

            },
            1400
          );

        }


      } catch (error) {

        showMessage(
          'cioMessage',
          error.message,
          'error'
        );

      } finally {

        setBusy(
          button,
          false
        );

      }

    }
  );

}


/* ============================================================
   PAGE INITIALIZER
   ============================================================ */


document.addEventListener(
  'DOMContentLoaded',
  async function() {

    console.log(
      '[DJ KOST] DOM ready:',
      location.pathname
    );


    const path =
      location.pathname
        .split('/')
        .pop()
        .toLowerCase();


    try {

      if (
        path ===
        'index.html' ||
        path ===
        ''
      ) {

        await initIndex();

        return;

      }


      if (
        path ===
        'login.html'
      ) {

        initLogin();

        return;

      }


      if (
        path ===
        'portal.html'
      ) {

        await initPortal();

        return;

      }


      if (
        path ===
        'pendaftaran.html'
      ) {

        await initRegistration();

        return;

      }


      if (
        path ===
        'kunjungan.html'
      ) {

        await initVisit();

        return;

      }


      if (
        path ===
        'pembayaran.html'
      ) {

        await initPayment();

        return;

      }


      if (
        path ===
        'maintenance.html'
      ) {

        await initMaintenance();

        return;

      }


      if (
        path ===
        'checkinout.html'
      ) {

        await initCheckInOut();

        return;

      }


      if (
        path ===
        'cafe.html' ||
        path ===
        'laundry.html'
      ) {

        if (
          requireLogin()
        ) {

          bindLogout();

          renderTenantIdentity(
            getTenantData()
          );

        }

        return;

      }


      /*
       * aturan.html / hubungi.html
       * tidak memerlukan JS khusus.
       */

    } catch (error) {

      console.error(
        '[DJ KOST] Fatal frontend error:',
        error
      );

    }

  }
);
