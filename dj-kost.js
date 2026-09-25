const DJ_KOST_API =
  'https://script.google.com/macros/s/AKfycbyZWhxliQiNuRYOjDTfgxcs-6SItWb1m7UD01-cC4E_6sU3p10mNKqmE6y0jPyqISKy_g/exec';

const DJ_SESSION_KEY =
  'djTenantSession';

const DJ_TENANT_KEY =
  'djTenantData';


function getSessionToken(){

  return (
    sessionStorage.getItem(
      DJ_SESSION_KEY
    ) || ''
  );

}


function getTenantData(){

  try{

    return JSON.parse(
      sessionStorage.getItem(
        DJ_TENANT_KEY
      ) || 'null'
    );

  }catch(_){

    return null;

  }

}


function saveLoginSession(
  result
){

  if(
    !result ||
    !result.token ||
    !result.data
  ){

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


function clearLoginSession(){

  sessionStorage.removeItem(
    DJ_SESSION_KEY
  );

  sessionStorage.removeItem(
    DJ_TENANT_KEY
  );

}


function requestId(){

  if(
    window.crypto &&
    window.crypto.randomUUID
  ){

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


function rupiah(
  value
){

  return new Intl.NumberFormat(
    'id-ID',
    {
      style:'currency',
      currency:'IDR',
      maximumFractionDigits:0
    }
  ).format(
    Number(
      value || 0
    )
  );

}


function escapeHtml(
  value
){

  return String(
    value == null
      ? ''
      : value
  )
  .replace(
    /[&<>"']/g,
    function(char){

      const map = {
        '&':'&amp;',
        '<':'&lt;',
        '>':'&gt;',
        '"':'&quot;',
        "'":'&#39;'
      };

      return map[char];

    }
  );

}


function today(){

  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );

}


function currentMonth(){

  return new Date()
    .toISOString()
    .slice(
      0,
      7
    );

}


async function apiGet(
  action,
  params = {}
){

  const query =
    new URLSearchParams({
      action,
      ...params
    });


  const response =
    await fetch(
      DJ_KOST_API +
      '?' +
      query.toString(),
      {
        method:'GET',
        redirect:'follow',
        cache:'no-store'
      }
    );


  const result =
    await response.json();


  if(
    !result.ok
  ){

    throw new Error(
      result.error ||
      'Permintaan gagal.'
    );

  }


  return result;

}


async function apiPost(
  action,
  data = {}
){

  const response =
    await fetch(
      DJ_KOST_API,
      {
        method:'POST',
        redirect:'follow',
        headers:{
          'Content-Type':
            'text/plain;charset=utf-8'
        },
        body:JSON.stringify({
          action,
          ...data
        })
      }
    );


  const result =
    await response.json();


  if(
    !result.ok
  ){

    throw new Error(
      result.error ||
      'Permintaan gagal.'
    );

  }


  return result;

}


function redirectLogin(){

  const current =
    location.pathname
      .split('/')
      .pop();


  const redirect =
    current &&
    current !== 'login.html'
      ? encodeURIComponent(
          current +
          location.search
        )
      : '';


  location.href =
    'login.html' +
    (
      redirect
        ? '?redirect=' +
          redirect
        : ''
    );

}


function requireLogin(){

  if(
    !getSessionToken()
  ){

    redirectLogin();

    return false;

  }

  return true;

}


function logout(){

  clearLoginSession();

  location.href =
    'login.html';

}


function bindLogout(){

  const button =
    document.getElementById(
      'logoutTop'
    );


  if(
    button
  ){

    button.addEventListener(
      'click',
      function(event){

        event.preventDefault();

        logout();

      }
    );

  }

}


function showMessage(
  id,
  message,
  type = 'ok'
){

  const element =
    document.getElementById(
      id
    );


  if(
    !element
  ){
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
){

  if(
    !button
  ){
    return;
  }


  button.disabled =
    busy;


  if(
    busy
  ){

    button.dataset.oldText =
      button.textContent;

    button.textContent =
      text ||
      'Memproses...';

  }else{

    button.textContent =
      button.dataset.oldText ||
      button.textContent;

  }

}


function roomStatusClass(
  status
){

  if(
    status === 'TERISI'
  ){

    return 'status-terisi';

  }


  if(
    status === 'SEGERA'
  ){

    return 'status-segera';

  }


  return 'status-kosong';

}


/* ============================================================
   PUBLIC ROOMS
   ============================================================ */

async function loadRooms(){

  const result =
    await apiGet(
      'rooms'
    );

  return result.data || [];

}


function roomLabel(
  room
){

  return (
    room.no_kamar +
    ' — ' +
    room.status +
    (
      room.harga_bulan > 0
        ? ' — ' +
          rupiah(
            room.harga_bulan
          ) +
          '/bulan'
        : ''
    )
  );

}


async function initIndex(){

  const container =
    document.getElementById(
      'roomCatalog'
    );


  const totalEl =
    document.getElementById(
      'totalRooms'
    );

  const emptyEl =
    document.getElementById(
      'emptyRooms'
    );

  const occupiedEl =
    document.getElementById(
      'occupiedRooms'
    );


  if(
    !container
  ){
    return;
  }


  try{

    const rooms =
      await loadRooms();


    const empty =
      rooms.filter(
        r =>
          r.status === 'KOSONG'
      ).length;


    const occupied =
      rooms.filter(
        r =>
          r.status === 'TERISI'
      ).length;


    totalEl.textContent =
      rooms.length;


    emptyEl.textContent =
      empty;


    occupiedEl.textContent =
      occupied;


    const floors = {};


    rooms.forEach(
      function(room){

        const floor =
          room.lantai;


        if(
          !floors[floor]
        ){

          floors[floor] =
            [];

        }


        floors[floor].push(
          room
        );

      }
    );


    container.innerHTML =
      '';


    Object.keys(
      floors
    )
    .sort(
      (a,b) =>
        Number(a) -
        Number(b)
    )
    .forEach(
      function(floor){

        const card =
          document.createElement(
            'div'
          );


        card.className =
          'card floor-card';


        const roomsHtml =
          floors[floor]
            .map(
              function(room){

                const clickable =
                  room.status ===
                  'KOSONG';


                return `
                  <a
                    class="room-card ${
                      clickable
                        ? 'is-kosong'
                        : room.status === 'TERISI'
                          ? 'is-terisi'
                          : 'is-segera'
                    }"
                    ${
                      clickable
                        ? `href="pendaftaran.html?room=${room.no_kamar}"`
                        : ''
                    }
                  >
                    <div class="room-number">
                      ${room.no_kamar}
                    </div>

                    <span class="status ${roomStatusClass(room.status)}">
                      ${room.status}
                    </span>

                    <div class="room-price">
                      ${
                        room.harga_bulan > 0
                          ? rupiah(room.harga_bulan)
                          : 'Belum dibuka'
                      }
                    </div>
                  </a>
                `;

              }
            )
            .join('');


        card.innerHTML = `
          <div class="floor-head">
            <div>
              <div class="eyebrow">
                LANTAI ${floor}
              </div>

              <h3>
                ${floors[floor][0].no_kamar}
                -
                ${floors[floor][floors[floor].length - 1].no_kamar}
              </h3>

              <div class="floor-meta">
                ${floors[floor].length} kamar
              </div>
            </div>
          </div>

          <div class="floor-rooms">
            ${roomsHtml}
          </div>
        `;


        container.appendChild(
          card
        );

      }
    );


  }catch(error){

    container.innerHTML = `
      <div class="card note">
        Gagal memuat data kamar:
        ${escapeHtml(error.message)}
      </div>
    `;

  }

}


/* ============================================================
   ROOM SELECT
   ============================================================ */

async function fillRoomSelect(
  id,
  mode = 'available'
){

  const select =
    document.getElementById(
      id
    );


  if(
    !select
  ){
    return;
  }


  try{

    const rooms =
      await loadRooms();


    select.innerHTML =
      '<option value="">Pilih kamar</option>';


    rooms.forEach(
      function(room){

        if(
          mode === 'available' &&
          room.status !==
          'KOSONG'
        ){

          return;

        }


        const option =
          document.createElement(
            'option'
          );


        option.value =
          room.no_kamar;


        option.textContent =
          roomLabel(
            room
          );


        if(
          mode !== 'available' &&
          room.status !==
          'KOSONG'
        ){

          option.disabled =
            true;

        }


        select.appendChild(
          option
        );

      }
    );


  }catch(error){

    select.innerHTML =
      '<option value="">Gagal memuat kamar</option>';

  }

}


/* ============================================================
   LOGIN
   ============================================================ */

function initLogin(){

  const form =
    document.getElementById(
      'loginForm'
    );


  if(
    !form
  ){
    return;
  }


  form.addEventListener(
    'submit',
    async function(event){

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


      try{

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
          'portal.html';


      }catch(error){

        showMessage(
          'loginMessage',
          error.message,
          'error'
        );

      }finally{

        setBusy(
          button,
          false
        );

      }

    }
  );

}


/* ============================================================
   TENANT PROFILE
   ============================================================ */

async function loadTenantDashboard(){

  return apiGet(
    'tenantDashboard',
    {
      token:
        getSessionToken()
    }
  );

}


function renderTenantIdentity(
  tenant
){

  const elements = {

    tenantName:
      tenant.nama_lengkap,

    tenantId:
      tenant.tenant_id,

    tenantRoom:
      tenant.no_kamar

  };


  Object.keys(
    elements
  ).forEach(
    function(id){

      const element =
        document.getElementById(
          id
        );


      if(
        element
      ){

        element.textContent =
          elements[id] ||
          '-';

      }

    }
  );


  const fields = {

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
    fields
  ).forEach(
    function(id){

      const element =
        document.getElementById(
          id
        );


      if(
        element
      ){

        element.value =
          fields[id] ||
          '';

      }

    }
  );

}


/* ============================================================
   PORTAL
   ============================================================ */

async function initPortal(){

  if(
    !requireLogin()
  ){
    return;
  }


  bindLogout();


  try{

    const result =
      await loadTenantDashboard();


    const data =
      result.data;


    const tenant =
      data.tenant;


    const profile =
      tenant;


    renderTenantIdentity(
      profile
    );


    const welcome =
      document.getElementById(
        'welcome'
      );


    if(
      welcome
    ){

      welcome.innerHTML =
        `
          Selamat datang,
          <strong>
            ${escapeHtml(profile.nama_lengkap)}
          </strong>.
          Tenant ID:
          <strong>
            ${escapeHtml(profile.tenant_id)}
          </strong>
          · Kamar:
          <strong>
            ${escapeHtml(profile.no_kamar)}
          </strong>.
        `;

    }


    const payment =
      data.payment;


    const billEl =
      document.getElementById(
        'currentBill'
      );


    if(
      billEl
    ){

      if(
        payment
      ){

        billEl.innerHTML =
          `
            <div class="kpi-label">
              ${escapeHtml(payment.Periode_Pembayaran || '')}
            </div>

            <div class="kpi-value">
              ${rupiah(payment.Total_Tagihan)}
            </div>

            <span class="status ${
              payment.Status_Pembayaran === 'LUNAS'
                ? 'status-kosong'
                : 'status-segera'
            }">
              ${escapeHtml(payment.Status_Pembayaran || '')}
            </span>
          `;

      }else{

        billEl.innerHTML =
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


    if(
      history
    ){

      const rows =
        data.payments || [];


      if(
        !rows.length
      ){

        history.innerHTML =
          `
            <tr>
              <td colspan="6">
                Belum ada riwayat pembayaran.
              </td>
            </tr>
          `;

      }else{

        history.innerHTML =
          rows
            .map(
              function(item){

                return `
                  <tr>
                    <td>${escapeHtml(item.period)}</td>
                    <td>${rupiah(item.nominal)}</td>
                    <td>${rupiah(item.denda)}</td>
                    <td>${rupiah(item.total)}</td>
                    <td>${escapeHtml(item.status || '')}</td>
                    <td>${escapeHtml(item.verifikasi || '')}</td>
                  </tr>
                `;

              }
            )
            .join('');

      }

    }


    const maintenance =
      document.getElementById(
        'maintenanceList'
      );


    if(
      maintenance
    ){

      const rows =
        data.maintenance || [];


      maintenance.innerHTML =
        rows.length
          ? rows.map(
              item =>
                `
                  <div class="card" style="padding:18px">
                    <strong>
                      ${escapeHtml(item.jenis || 'Maintenance')}
                    </strong>

                    <div style="margin-top:5px">
                      ${escapeHtml(item.lokasi || '-')}
                    </div>

                    <div style="margin-top:7px;color:#667085">
                      ${escapeHtml(item.deskripsi || '')}
                    </div>

                    <div style="margin-top:10px">
                      <span class="status status-segera">
                        ${escapeHtml(item.status || '')}
                      </span>
                    </div>
                  </div>
                `
            ).join('')
          : `
              <div class="note">
                Tidak ada laporan maintenance aktif.
              </div>
            `;


  }catch(error){

    if(
      error.message
        .toLowerCase()
        .includes(
          'sesi login'
        )
    ){

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
   PAYMENT
   ============================================================ */

async function initPayment(){

  if(
    !requireLogin()
  ){
    return;
  }


  bindLogout();


  const tenant =
    getTenantData();


  if(
    tenant
  ){

    renderTenantIdentity(
      tenant
    );

  }


  const period =
    document.getElementById(
      'paymentPeriod'
    );


  const date =
    document.getElementById(
      'paymentDate'
    );


  if(
    period
  ){

    period.value =
      currentMonth();

  }


  if(
    date
  ){

    date.value =
      today();

  }


  try{

    const dashboard =
      await loadTenantDashboard();


    const payment =
      dashboard.data.payment;


    const summary =
      document.getElementById(
        'paymentSummary'
      );


    if(
      summary
    ){

      summary.innerHTML =
        payment
          ? `
              <div class="kpi-label">
                Tagihan periode
                ${escapeHtml(payment.Periode_Pembayaran || '')}
              </div>

              <div class="kpi-value">
                ${rupiah(payment.Total_Tagihan)}
              </div>

              <div style="margin-top:8px">
                Status:
                <strong>
                  ${escapeHtml(payment.Status_Pembayaran || '')}
                </strong>
              </div>
            `
          : `
              <div class="note">
                Tagihan bulan berjalan belum ditemukan.
              </div>
            `;

    }

  }catch(_){}


  const form =
    document.getElementById(
      'paymentForm'
    );


  if(
    !form
  ){
    return;
  }


  form.addEventListener(
    'submit',
    async function(event){

      event.preventDefault();


      const button =
        document.getElementById(
          'paymentButton'
        );


      setBusy(
        button,
        true,
        'Menyimpan pembayaran...'
      );


      try{

        const result =
          await apiPost(
            'payment',
            {

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
                ).value,

              note:
                document.getElementById(
                  'paymentNote'
                ).value

            }
          );


        showMessage(
          'paymentMessage',
          result.message ||
          'Pembayaran berhasil dicatat.',
          'ok'
        );


      }catch(error){

        showMessage(
          'paymentMessage',
          error.message,
          'error'
        );

      }finally{

        setBusy(
          button,
          false
        );

      }

    }
  );

}


/* ============================================================
   MAINTENANCE
   ============================================================ */

async function collectImages(
  input,
  maxFiles = 4
){

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


  for(
    const file of files
  ){

    const dataUrl =
      await new Promise(
        function(resolve,reject){

          const reader =
            new FileReader();


          reader.onload =
            function(){

              resolve(
                reader.result
              );

            };


          reader.onerror =
            function(){

              reject(
                new Error(
                  'Gagal membaca foto.'
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


async function initMaintenance(){

  if(
    !requireLogin()
  ){
    return;
  }


  bindLogout();


  const tenant =
    getTenantData();


  if(
    tenant
  ){

    renderTenantIdentity(
      tenant
    );

  }


  const form =
    document.getElementById(
      'maintenanceForm'
    );


  if(
    !form
  ){
    return;
  }


  form.addEventListener(
    'submit',
    async function(event){

      event.preventDefault();


      const button =
        document.getElementById(
          'maintenanceButton'
        );


      setBusy(
        button,
        true,
        'Mengirim laporan...'
      );


      try{

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
                ).value,

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
                ).value,

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


      }catch(error){

        showMessage(
          'maintenanceMessage',
          error.message,
          'error'
        );

      }finally{

        setBusy(
          button,
          false
        );

      }

    }
  );

}


/* ============================================================
   CHECK IN / OUT
   ============================================================ */

async function initCheckInOut(){

  if(
    !requireLogin()
  ){
    return;
  }


  bindLogout();


  const tenant =
    getTenantData();


  if(
    tenant
  ){

    renderTenantIdentity(
      tenant
    );

  }


  const date =
    document.getElementById(
      'cioDate'
    );


  if(
    date
  ){

    date.value =
      today();

  }


  const form =
    document.getElementById(
      'checkinoutForm'
    );


  if(
    !form
  ){
    return;
  }


  form.addEventListener(
    'submit',
    async function(event){

      event.preventDefault();


      const button =
        document.getElementById(
          'cioButton'
        );


      setBusy(
        button,
        true,
        'Menyimpan data...'
      );


      try{

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
                ).value,

              note:
                document.getElementById(
                  'cioNote'
                ).value,

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
                ).value,

              facility:
                document.getElementById(
                  'cioFacility'
                ).value,

              depositReduction:
                document.getElementById(
                  'cioDepositReduction'
                ).value,

              statement:
                document.getElementById(
                  'cioStatement'
                ).value

            }
          );


        showMessage(
          'cioMessage',
          result.message ||
          'Data berhasil disimpan.',
          'ok'
        );


        if(
          process ===
          'CHECK-OUT'
        ){

          setTimeout(
            function(){

              logout();

            },
            1400
          );

        }


      }catch(error){

        showMessage(
          'cioMessage',
          error.message,
          'error'
        );

      }finally{

        setBusy(
          button,
          false
        );

      }

    }
  );

}


/* ============================================================
   REGISTRATION
   ============================================================ */

async function initRegistration(){

  await fillRoomSelect(
    'regRoom',
    'available'
  );


  const params =
    new URLSearchParams(
      location.search
    );


  const room =
    params.get(
      'room'
    );


  if(
    room
  ){

    const select =
      document.getElementById(
        'regRoom'
      );


    if(
      select
    ){

      select.value =
        room;

    }

  }


  const form =
    document.getElementById(
      'registrationForm'
    );


  if(
    !form
  ){
    return;
  }


  form.addEventListener(
    'submit',
    async function(event){

      event.preventDefault();


      const button =
        document.getElementById(
          'registrationButton'
        );


      setBusy(
        button,
        true,
        'Mengirim pendaftaran...'
      );


      try{

        const result =
          await apiPost(
            'registration',
            {

              requestId:
                requestId(),

              name:
                document.getElementById(
                  'regName'
                ).value,

              nickname:
                document.getElementById(
                  'regNickname'
                ).value,

              phone:
                document.getElementById(
                  'regPhone'
                ).value,

              email:
                document.getElementById(
                  'regEmail'
                ).value,

              nik:
                document.getElementById(
                  'regNik'
                ).value,

              job:
                document.getElementById(
                  'regJob'
                ).value,

              company:
                document.getElementById(
                  'regCompany'
                ).value,

              gender:
                document.getElementById(
                  'regGender'
                ).value,

              address:
                document.getElementById(
                  'regAddress'
                ).value,

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
                ).value

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
              ? ' ID: ' +
                result.pendaftaran_id
              : ''
          ),
          'ok'
        );


        form.reset();


      }catch(error){

        showMessage(
          'registrationMessage',
          error.message,
          'error'
        );

      }finally{

        setBusy(
          button,
          false
        );

      }

    }
  );

}


/* ============================================================
   VISIT
   ============================================================ */

async function initVisit(){

  await fillRoomSelect(
    'visitRoom',
    'all'
  );


  const form =
    document.getElementById(
      'visitForm'
    );


  if(
    !form
  ){
    return;
  }


  form.addEventListener(
    'submit',
    async function(event){

      event.preventDefault();


      const button =
        document.getElementById(
          'visitButton'
        );


      setBusy(
        button,
        true,
        'Mengirim pengajuan...'
      );


      try{

        const result =
          await apiPost(
            'visit',
            {

              requestId:
                requestId(),

              name:
                document.getElementById(
                  'visitName'
                ).value,

              phone:
                document.getElementById(
                  'visitPhone'
                ).value,

              email:
                document.getElementById(
                  'visitEmail'
                ).value,

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
                ).value

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
              ? ' ID: ' +
                result.kunjungan_id
              : ''
          ),
          'ok'
        );


        form.reset();


      }catch(error){

        showMessage(
          'visitMessage',
          error.message,
          'error'
        );

      }finally{

        setBusy(
          button,
          false
        );

      }

    }
  );

}


/* ============================================================
   GENERIC TENANT PAGE
   ============================================================ */

function initTenantSimple(){

  if(
    !requireLogin()
  ){
    return;
  }


  bindLogout();

  const tenant =
    getTenantData();


  if(
    tenant
  ){

    renderTenantIdentity(
      tenant
    );

  }

}


/* ============================================================
   PAGE ROUTER
   ============================================================ */

document.addEventListener(
  'DOMContentLoaded',
  async function(){

    const page =
      document.body.dataset.page ||
      '';


    try{

      if(
        page === 'index'
      ){

        await initIndex();

      }


      if(
        page === 'login'
      ){

        initLogin();

      }


      if(
        page === 'portal'
      ){

        await initPortal();

      }


      if(
        page === 'payment'
      ){

        await initPayment();

      }


      if(
        page === 'maintenance'
      ){

        await initMaintenance();

      }


      if(
        page === 'checkinout'
      ){

        await initCheckInOut();

      }


      if(
        page === 'registration'
      ){

        await initRegistration();

      }


      if(
        page === 'visit'
      ){

        await initVisit();

      }


      if(
        page === 'tenant-simple'
      ){

        initTenantSimple();

      }

    }catch(error){

      console.error(
        error
      );

    }

  }
);
