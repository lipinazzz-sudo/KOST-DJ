const DJ_KOST_API_URL =
  'https://script.google.com/macros/s/AKfycbyZWhxliQiNuRYOjDTfgxcs-6SItWb1m7UD01-cC4E_6sU3p10mNKqmE6y0jPyqISKy_g/exec';

const DJ_SESSION_KEY =
  'djTenantSession';

const DJ_SESSION_DATA_KEY =
  'djTenantData';


function djGetToken() {

  return (
    sessionStorage.getItem(
      DJ_SESSION_KEY
    ) || ''
  );

}


function djGetTenant() {

  try {

    return JSON.parse(
      sessionStorage.getItem(
        DJ_SESSION_DATA_KEY
      ) || 'null'
    );

  } catch (_) {

    return null;

  }

}


function djSetSession(
  payload
) {

  if (
    !payload ||
    !payload.token ||
    !payload.data
  ) {

    throw new Error(
      'Respons login tidak lengkap.'
    );

  }


  sessionStorage.setItem(
    DJ_SESSION_KEY,
    payload.token
  );


  sessionStorage.setItem(
    DJ_SESSION_DATA_KEY,
    JSON.stringify(
      payload.data
    )
  );

}


function djClearSession() {

  sessionStorage.removeItem(
    DJ_SESSION_KEY
  );

  sessionStorage.removeItem(
    DJ_SESSION_DATA_KEY
  );

}


function djRequestId() {

  return (
    crypto &&
    crypto.randomUUID
  )

    ? crypto.randomUUID()

    : String(
        Date.now()
      ) +
      '-' +
      Math.random()
        .toString(16)
        .slice(2);

}


async function djApiGet(
  action,
  params = {}
) {

  const query =
    new URLSearchParams({

      action,
      ...params

    });


  const response =
    await fetch(

      DJ_KOST_API_URL +
      '?' +
      query.toString(),

      {
        method:
          'GET',

        cache:
          'no-store'

      }

    );


  const result =
    await response.json();


  if (
    !result.ok
  ) {

    throw new Error(
      result.error ||
      'Permintaan gagal.'
    );

  }


  return result;

}


async function djApiPost(
  action,
  payload = {}
) {

  const response =
    await fetch(

      DJ_KOST_API_URL,

      {

        method:
          'POST',

        headers: {

          'Content-Type':
            'text/plain;charset=utf-8'

        },

        body:
          JSON.stringify({

            action,
            ...payload

          })

      }

    );


  const result =
    await response.json();


  if (
    !result.ok
  ) {

    throw new Error(
      result.error ||
      'Permintaan gagal.'
    );

  }


  return result;

}


function djRequireLogin() {

  if (
    !djGetToken()
  ) {

    const target =
      encodeURIComponent(
        location.pathname
          .split('/')
          .pop() +
        (
          location.search ||
          ''
        )
      );


    location.href =
      'login.html?redirect=' +
      target;


    return false;

  }


  return true;

}


function djLogout() {

  djClearSession();

  location.href =
    'login.html';

}


function djBindLogout(
  id = 'logoutTop'
) {

  const element =
    document.getElementById(
      id
    );


  if (
    element
  ) {

    element.addEventListener(
      'click',
      function(event) {

        event.preventDefault();

        djLogout();

      }
    );

  }

}


function djFormatRupiah(
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


function djToday() {

  return new Date()
    .toISOString()
    .slice(
      0,
      10
    );

}


function djCurrentMonth() {

  return new Date()
    .toISOString()
    .slice(
      0,
      7
    );

}


function djEscapeHtml(
  value
) {

  return String(
    value == null
      ? ''
      : value
  )
  .replace(
    /[&<>'"]/g,
    function(char) {

      return {

        '&':
          '&amp;',

        '<':
          '&lt;',

        '>':
          '&gt;',

        "'":
          '&#39;',

        '"':
          '&quot;'

      }[char];

    }
  );

}


async function djImageToDataUrl(
  file,
  maxSide = 1600,
  quality = 0.8
) {

  return new Promise(
    function(resolve,reject) {

      const image =
        new Image();

      const reader =
        new FileReader();


      reader.onload =
        function() {

          image.onload =
            function() {

              const scale =
                Math.min(

                  1,

                  maxSide /
                    Math.max(
                      image.width,
                      image.height
                    )

                );


              const canvas =
                document.createElement(
                  'canvas'
                );


              canvas.width =
                Math.max(
                  1,
                  Math.round(
                    image.width *
                    scale
                  )
                );


              canvas.height =
                Math.max(
                  1,
                  Math.round(
                    image.height *
                    scale
                  )
                );


              const context =
                canvas.getContext(
                  '2d'
                );


              context.drawImage(
                image,
                0,
                0,
                canvas.width,
                canvas.height
              );


              resolve({

                name:
                  file.name.replace(
                    /\.[^.]+$/,
                    ''
                  ) +
                  '.jpg',

                dataUrl:
                  canvas.toDataURL(
                    'image/jpeg',
                    quality
                  )

              });

            };


          image.onerror =
            function() {

              reject(
                new Error(
                  'Gagal membaca gambar.'
                )
              );

            };


          image.src =
            reader.result;

        };


      reader.onerror =
        function() {

          reject(
            new Error(
              'Gagal membaca file.'
            )
          );

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


async function djCollectImages(
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

    result.push(
      await djImageToDataUrl(
        file
      )
    );

  }


  return result;

}


async function djFillRoomSelect(
  selectId
) {

  const select =
    document.getElementById(
      selectId
    );


  if (!select) {
    return;
  }


  try {

    const response =
      await djApiGet(
        'rooms'
      );


    select.innerHTML =
      '<option value="">Pilih kamar</option>';


    response.data
      .forEach(
        function(room) {

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
            room.no_kamar +
            ' — ' +
            djFormatRupiah(
              room.harga_bulan
            ) +
            '/bulan';


          select.appendChild(
            option
          );

        }
      );

  } catch (error) {

    select.innerHTML =
      '<option value="">Gagal memuat kamar</option>';


    console.error(
      error
    );

  }

}
