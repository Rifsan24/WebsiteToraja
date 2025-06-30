(function() {
  "use strict";

  const adm3Default = '73.18.01';

  document.addEventListener("DOMContentLoaded", function () {
    const selectKabupaten = document.querySelector('.pilih-kabupaten');
    const selectKecamatan = document.querySelector('.pilih-kecamatan');
    const cuacaCard = document.querySelector('.cuaca-card');
    const cuacaTabContent = document.querySelector('.cuaca-tab-content');

    selectKabupaten.addEventListener('change', function () {
      const kabupatenId = this.value;
      selectKecamatan.disabled = true; // Nonaktifkan dropdown kecamatan saat menunggu data

      if (kabupatenId) {
        fetch(`/data/kabupaten.json`)
          .then(res => res.json())
          .then(data => {
            const options = data.kabupaten.find(kab => kab.id === kabupatenId).kecamatan.map(kec => `<option value="${kec.id}">${kec.nama}</option>`).join('');
            selectKecamatan.innerHTML = `<option value="">Pilih Kecamatan</option>${options}`;
            selectKecamatan.disabled = false; // Aktifkan dropdown kecamatan
          })
          .catch(err => console.error('Gagal memuat data kecamatan:', err));
      } else {
        selectKecamatan.innerHTML = '<option value="">Pilih Kecamatan</option>';
      }
    });

    function fetchingDataKabupaten() {
      fetch('/data/kabupaten.json')
        .then(res => res.json())
        .then(data => {
          const options = data.kabupaten.map(kab => `<option value="${kab.id}">${kab.nama}</option>`).join('');
          selectKabupaten.innerHTML = `<option value="">Pilih kabupaten</option>${options}`;
        })
        .catch(err => console.error('Gagal memuat data kabupaten:', err));
    }

    fetchingDataKabupaten();

    function formatDate(date) {
      return new Date(date).toLocaleDateString('id-ID', {
        month: 'long',
        day: '2-digit',
      });
    }

    function formatTime(date) {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    }

    function formatDateTime(date) {
      return formatDate(date) + ' ' + formatTime(date);
    }

    function formatArahAngin(wd) {
      const directions = {
        'N': 'Utara',
        'NE': 'Timur Laut',
        'E': 'Timur',
        'SE': 'Tenggara',
        'S': 'Selatan',
        'SW': 'Barat Daya',
        'W': 'Barat',
        'NW': 'Barat Laut'
      };

      return directions[wd];
    }

    function fetchCuacaCard(kodeAdm3) {
      fetch(`https://cuaca.bmkg.go.id/api/df/v1/forecast/adm?adm3=${kodeAdm3}`) // Ganti dengan kode adm yang sesuai
        .then(res => res.json())
        .then(data => {
          let tabContentHtml = '';
          cuacaCard.innerHTML = '';
          const kodeAdm4 = data.data[0].lokasi.adm4;
          fetchWeatherCurrent(kodeAdm4);

          const lat = data.data[0].lokasi.lat;
          const lon = data.data[0].lokasi.lon;
          fetchWeatherWarning(lat, lon);

          data.data[0].cuaca.map(item => {
            const today = formatDate(new Date());
            const tomorrow = formatDate(new Date().getTime() + 24 * 60 * 60 * 1000);
            let tanggal = formatDate(item[0].local_datetime);

            let backgroundColor;
            let selectedTab = 'false';
            if(today == tanggal) {
              selectedTab = 'true';
              tanggal = 'Hari Ini';
            } else if(tomorrow == tanggal) {
              tanggal = 'Besok';
            }

            let tabTarget = tanggal.replace(/\s/g, '');

            const image = item[0].image;
            const temperature = item[0].t;
            const humidity = item[0].hu;

            cuacaCard.innerHTML += `
              <li class="nav-item d-flex flex-row flex-nowrap" role="presentation">
                <div data-bs-toggle="tab" data-bs-target="#${tabTarget}" role="tab" aria-controls="${tabTarget}" aria-selected="${selectedTab}" class="card shadow-sm ${selectedTab === 'true' ? 'active' : ''}">
                  <div class="card-body">
                    <div class="text-center">${tanggal}</div>
                    <div class="d-flex align-items-center justify-content-center gap-2 py-3">
                      <img width="40" height="40" src="${image}" alt="">
                      <span class="fs-5 fw-bold">${temperature}°C</span>
                    </div>
                    <div class="d-flex align-items-center justify-content-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 21" width="24" height="24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-width="1.667" d="M10.583 15.199a1.67 1.67 0 0 1-1.61-1.236"></path>
                        <path stroke="currentColor" stroke-width="1.667" d="M9.27 4.097c.526-.893.789-1.34 1.165-1.408a.8.8 0 0 1 .296 0c.376.068.64.515 1.165 1.408l1.39 2.364a22.7 22.7 0 0 1 2.257 5.263c.855 2.994-1.393 5.975-4.507 5.975h-.906c-3.114 0-5.362-2.981-4.507-5.975A22.7 22.7 0 0 1 7.88 6.46l1.39-2.364z"></path>
                      </svg>
                      <span class="fw-bold">${humidity}%</span>
                    </div>
                  </div>
                </div>
              </li>
            `

            tabContentHtml += `<div class="tab-pane ${selectedTab === 'true' ? 'active' : ''}" id="${tabTarget}" role="tabpanel" aria-labelledby="${tabTarget}-tab">
              <div class="d-flex flex-row flex-nowrap">`

            tabContentHtml += item.map(content => {
              const jam = formatTime(content.local_datetime);
              const contentImage = content.image;
              const contentTemperature = content.t;
              const contentHumidity = content.hu;
              const contentWindSpeed = content.ws;
              const contentWeatherDesc = content.weather_desc;

              return `
                <div class="card shadow-sm" style="min-width: 190px; margin-right: 5px;">
                  <div class="card-body d-flex flex-column align-items-center gap-3">
                    <div>${jam} WIB</div>

                    <img width="40" height="40" src="${contentImage}" alt="">

                    <div>${contentTemperature}°C</div>

                    <div>${contentWeatherDesc}</div>

                    <div class="d-flex gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 21 21" width="24" height="24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-width="1.667" d="M10.583 15.199a1.67 1.67 0 0 1-1.61-1.236"></path>
                        <path stroke="currentColor" stroke-width="1.667" d="M9.27 4.097c.526-.893.789-1.34 1.165-1.408a.8.8 0 0 1 .296 0c.376.068.64.515 1.165 1.408l1.39 2.364a22.7 22.7 0 0 1 2.257 5.263c.855 2.994-1.393 5.975-4.507 5.975h-.906c-3.114 0-5.362-2.981-4.507-5.975A22.7 22.7 0 0 1 7.88 6.46l1.39-2.364z"></path>
                      </svg>

                      <div>${contentHumidity}%</div>
                    </div>

                    <div class="d-flex gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="24" height="24" style="transform: rotate(90deg);">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 19 4 12l16-7-2 7z"></path>
                        <path stroke="currentColor" stroke-linejoin="round" stroke-width="2" d="M10.5 15.5 13 12l-2.5-3.5"></path>
                      </svg>

                      <div>${contentWindSpeed} km/h</div>
                    </div>
                  </div>
                </div>
              `
            }).join('');

            tabContentHtml += `</div></div>`

            cuacaTabContent.innerHTML = tabContentHtml;
          })
        })
        .catch(err => {
          cuacaCard.innerHTML = '<p class="text-danger">Gagal memuat data cuaca.</p>';
        });
    }

    function fetchWeatherCurrent(kodeAdm4) {
      fetch(`https://cuaca.bmkg.go.id/api/presentwx/adm?adm4=${kodeAdm4}`)
        .then(res => res.json())
        .then(data => {
          const currentWeather = data.data.cuaca;

          document.querySelector('.current-local_datetime').textContent = formatDateTime(currentWeather.local_datetime);
          document.querySelector('.current-image').src = currentWeather.image;
          document.querySelector('.current-temperature').textContent = currentWeather.t;
          document.querySelector('.current-weather_desc').textContent = currentWeather.weather_desc;
          document.querySelector('.current-temperature_count').textContent = currentWeather.t + 1;
          document.querySelector('.current-wind_speed').textContent = currentWeather.ws;
          document.querySelector('.current-wind_direction').textContent = formatArahAngin(currentWeather.wd);
          document.querySelector('.current-humidity').textContent = currentWeather.hu;
        });
    }

    function fetchWeatherWarning(lat, lon) {
      fetch(`https://cuaca.bmkg.go.id/api/v1/public/weather/warning?lat=${lat}&long=${lon}`, {
        headers: {
          'x-api-key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjFjNWFkZWUxYzY5MzM0NjY2N2EzZWM0MWRlMjBmZWZhNDcxOTNjYzcyZDgwMGRiN2ZmZmFlMWVhYjcxZGYyYjQiLCJpYXQiOjE3MDE1ODMzNzl9.D1VNpMoTUVFOUuQW0y2vSjttZwj0sKBX33KyrkaRMcQ'
        }
      })
        .then(res => res.json())
        .then(data => {
          const warningData = data.data.today;

          console.log(warningData);
        });
    }

    selectKecamatan.addEventListener('change', function () {
      const kodeAdm3 = this.value;
      fetchCuacaCard(kodeAdm3);
    });

    fetchCuacaCard(adm3Default);
  });
})();
