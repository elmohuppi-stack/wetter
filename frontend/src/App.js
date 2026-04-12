import CurrentWeather from "./components/CurrentWeather.js";
import HourlyTimeline from "./components/HourlyTimeline.js";
import WeeklyList from "./components/WeeklyList.js";
import MapPreview from "./components/MapPreview.js";

export default {
  components: { CurrentWeather, HourlyTimeline, WeeklyList, MapPreview },
  data() {
    return {
      weatherData: null,
      loading: true,
      locationName: "",
      isCurrentLocation: false,
      currentTab: "forecast",
      historicalData: null,
      historicalLoading: false,
      startDate: "",
      endDate: "",
      seasonalData: null,
      seasonalLoading: false,
      climateData: null,
      climateLoading: false,
      dashboardData: null,
      darkMode: false,
    };
  },
  template: `
    <div :style="{background: darkMode ? '#1a1a1a' : '#f8f9fa', color: darkMode ? '#e0e0e0' : '#333', minHeight: '100vh', transition: 'background 0.3s ease'}">
      <div style="max-width:1200px;margin:0 auto;padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
          <h1 style="margin:0;font-size:2rem;font-weight:600">Wetter-Enthusiasten Plattform</h1>
          <button @click="toggleDarkMode" style="padding:10px;border-radius:50%;border:none;background:darkMode?'#333':'#fff';cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path v-if="darkMode" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              <circle v-else cx="12" cy="12" r="5"></circle>
              <line v-else x1="12" y1="1" x2="12" y2="3"></line>
              <line v-else x1="12" y1="21" x2="12" y2="23"></line>
              <line v-else x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line v-else x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line v-else x1="1" y1="12" x2="3" y2="12"></line>
              <line v-else x1="21" y1="12" x2="23" y2="12"></line>
              <line v-else x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line v-else x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </button>
        </div>
      <div style="margin-bottom:20px;display:flex;gap:12px;align-items:center;background:rgba(255,255,255,0.9);padding:16px;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);backdrop-filter:blur(10px)">
        <input v-model="locationName" @keyup.enter="searchLocation" placeholder="Ort (z.B. Berlin)" :style="{flex:1,padding:'12px 16px',border:'2px solid ' + (darkMode ? '#555' : '#e1e5e9'),borderRadius:'8px',fontSize:'16px',outline:'none',transition:'border-color 0.2s ease',background:darkMode?'#333':'#fff',color:darkMode?'#e0e0e0':'#333'}" />
        <button @click="useGeolocation" title="Aktuellen Standort verwenden" style="border:none;background:#f8f9fa;padding:10px;border-radius:8px;cursor:pointer;transition:background 0.2s ease">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a8 8 0 10-14.8 0L12 21z"></path></svg>
        </button>
      </div>

      <div style="margin-bottom:20px;display:flex;gap:0;border-bottom:1px solid #e1e5e9">
        <button @click="currentTab='forecast'" :style="{padding:'12px 20px',border:'none',background:currentTab==='forecast'?'#667eea':'transparent',color:currentTab==='forecast'?'#fff':'#666',cursor:'pointer',borderRadius:'8px 8px 0 0'}">Forecast</button>
        <button @click="currentTab='historical'" :style="{padding:'12px 20px',border:'none',background:currentTab==='historical'?'#667eea':'transparent',color:currentTab==='historical'?'#fff':'#666',cursor:'pointer',borderRadius:'8px 8px 0 0'}">Historical</button>
        <button @click="currentTab='seasonal'" :style="{padding:'12px 20px',border:'none',background:currentTab==='seasonal'?'#667eea':'transparent',color:currentTab==='seasonal'?'#fff':'#666',cursor:'pointer',borderRadius:'8px 8px 0 0'}">Seasonal</button>
        <button @click="currentTab='climate'" :style="{padding:'12px 20px',border:'none',background:currentTab==='climate'?'#667eea':'transparent',color:currentTab==='climate'?'#fff':'#666',cursor:'pointer',borderRadius:'8px 8px 0 0'}">Climate</button>
        <button @click="currentTab='dashboard'" :style="{padding:'12px 20px',border:'none',background:currentTab==='dashboard'?'#667eea':'transparent',color:currentTab==='dashboard'?'#fff':'#666',cursor:'pointer',borderRadius:'8px 8px 0 0'}">Dashboard</button>
      </div>

      <div v-if="currentTab === 'forecast'">
        <div class="row">
          <section class="card large">
            <CurrentWeather :data="weatherData" :is-current="isCurrentLocation" :location="locationName" />
            <HourlyTimeline :data="weatherData" />
          </section>
          <aside class="card side">
            <WeeklyList :data="weatherData" />
            <MapPreview :data="weatherData" />
          </aside>
        </div>
      </div>

      <div v-if="currentTab === 'historical'">
        <div style="margin-bottom:20px;display:flex;gap:12px;align-items:center">
          <input v-model="startDate" type="date" :style="{padding:'12px',border:'2px solid ' + (darkMode ? '#555' : '#e1e5e9'),borderRadius:'8px',background:darkMode?'#333':'#fff',color:darkMode?'#e0e0e0':'#333'}" />
          <input v-model="endDate" type="date" :style="{padding:'12px',border:'2px solid ' + (darkMode ? '#555' : '#e1e5e9'),borderRadius:'8px',background:darkMode?'#333':'#fff',color:darkMode?'#e0e0e0':'#333'}" />
          <button @click="fetchHistorical" style="padding:12px 20px;border-radius:8px;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-weight:500;cursor:pointer">Laden</button>
        </div>
        <div v-if="historicalLoading" style="text-align:center;color:#666;margin-top:20px;font-size:18px;font-weight:500">Historische Daten werden geladen…</div>
        <div v-else-if="historicalData && !historicalData.error">
          <h3>Historische Temperaturen</h3>
          <canvas ref="historicalChart" style="max-height:400px"></canvas>
        </div>
        <div v-else-if="historicalData && historicalData.error" style="text-align:center;color:#dc3545;margin-top:20px;font-size:16px">{{ historicalData.message }}</div>
      </div>

      <div v-if="currentTab === 'seasonal'">
        <div style="margin-bottom:20px">
          <button @click="fetchSeasonal" style="padding:12px 20px;border-radius:8px;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-weight:500;cursor:pointer">Saisonale Vorhersagen laden</button>
        </div>
        <div v-if="seasonalLoading" style="text-align:center;color:#666;margin-top:20px;font-size:18px;font-weight:500">Saisonale Daten werden geladen…</div>
        <div v-else-if="seasonalData && !seasonalData.error">
          <h3>Saisonale Temperatur-Abweichungen</h3>
          <canvas ref="seasonalTempChart" style="max-height:400px"></canvas>
          <h3>Saisonale Niederschlags-Abweichungen</h3>
          <canvas ref="seasonalPrecipChart" style="max-height:400px"></canvas>
        </div>
        <div v-else-if="seasonalData && seasonalData.error" style="text-align:center;color:#dc3545;margin-top:20px;font-size:16px">{{ seasonalData.message }}</div>
      </div>

      <div v-if="currentTab === 'climate'">
        <div style="margin-bottom:20px">
          <button @click="fetchClimate" style="padding:12px 20px;border-radius:8px;border:none;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;font-weight:500;cursor:pointer">Klimaprojektionen laden</button>
        </div>
        <div v-if="climateLoading" style="text-align:center;color:#666;margin-top:20px;font-size:18px;font-weight:500">Klimadaten werden geladen…</div>
        <div v-else-if="climateData && !climateData.error">
          <h3>Klimaprojektionen: Temperaturänderungen</h3>
          <canvas ref="climateChart" style="max-height:400px"></canvas>
        </div>
        <div v-else-if="climateData && climateData.error" style="text-align:center;color:#dc3545;margin-top:20px;font-size:16px">{{ climateData.message }}</div>
      </div>

      <div v-if="currentTab === 'dashboard'">
        <h3>API-Monitoring Dashboard</h3>
        <div style="display:flex;gap:20px;margin-bottom:20px">
          <div :style="{background:darkMode?'rgba(33,33,33,0.9)':'rgba(255,255,255,0.9)',padding:'16px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',flex:1,backdropFilter:'blur(10px)'}">
            <h4>API-Calls heute</h4>
            <p style="font-size:24px;font-weight:bold;color:#667eea">{{ dashboardData ? dashboardData.callsToday : 'Lade...' }}</p>
          </div>
          <div :style="{background:darkMode?'rgba(33,33,33,0.9)':'rgba(255,255,255,0.9)',padding:'16px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',flex:1,backdropFilter:'blur(10px)'}">
            <h4>Cache-Hits</h4>
            <p style="font-size:24px;font-weight:bold;color:#28a745">{{ dashboardData ? dashboardData.cacheHits : 'Lade...' }}</p>
          </div>
          <div :style="{background:darkMode?'rgba(33,33,33,0.9)':'rgba(255,255,255,0.9)',padding:'16px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',flex:1,backdropFilter:'blur(10px)'}">
            <h4>Rate-Limit Warnungen</h4>
            <p style="font-size:24px;font-weight:bold;color:#ffc107">{{ dashboardData ? dashboardData.rateLimitWarnings : 'Lade...' }}</p>
          </div>
        </div>
        <h3>Daten-Export</h3>
        <div style="display:flex;gap:12px;margin-bottom:20px">
          <button @click="exportData('forecast')" style="padding:12px 20px;border-radius:8px;border:none;background:#28a745;color:#fff;font-weight:500;cursor:pointer">Forecast als CSV</button>
          <button @click="exportData('historical')" style="padding:12px 20px;border-radius:8px;border:none;background:#28a745;color:#fff;font-weight:500;cursor:pointer">Historical als CSV</button>
          <button @click="exportData('seasonal')" style="padding:12px 20px;border-radius:8px;border:none;background:#28a745;color:#fff;font-weight:500;cursor:pointer">Seasonal als CSV</button>
          <button @click="exportData('climate')" style="padding:12px 20px;border-radius:8px;border:none;background:#28a745;color:#fff;font-weight:500;cursor:pointer">Climate als CSV</button>
        </div>
      </div>

      <div v-if="loading && currentTab === 'forecast'" style="text-align:center;color:#666;margin-top:20px;font-size:18px;font-weight:500">Wetterdaten werden geladen…</div>
      </div>
    </div>
  `,
  methods: {
    fetchWeather(lat, lon, markAsCurrent = false) {
      this.loading = true;
      this.isCurrentLocation = !!markAsCurrent;
      fetch(
        `/backend/proxy.php?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
      )
        .then((r) => r.json())
        .then((json) => {
          this.weatherData = json;
        })
        .catch((e) => {
          console.error("Fetch weather failed", e);
          this.weatherData = {
            error: true,
            message: "Daten konnten nicht geladen werden",
          };
        })
        .finally(() => (this.loading = false));
    },
    searchLocation() {
      const q = (this.locationName || "").trim();
      if (!q) {
        alert("Bitte einen Ort eingeben.");
        return;
      }
      // Use Nominatim for geocoding (OpenStreetMap)
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      fetch(url, { headers: { "Accept-Language": "de" } })
        .then((r) => r.json())
        .then((res) => {
          if (!res || res.length === 0) {
            alert("Ort nicht gefunden.");
            return;
          }
          const first = res[0];
          this.locationName = (first.display_name || "").split(",")[0] || q;
          this.fetchWeather(first.lat, first.lon, false);
        })
        .catch((e) => {
          console.error("Geocode error", e);
          alert("Fehler bei Ortssuche.");
        });
    },
    reverseGeocode(lat, lon) {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
      fetch(url, { headers: { "Accept-Language": "de" } })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.display_name) {
            const address = res.address || {};
            const city =
              address.city ||
              address.town ||
              address.village ||
              res.display_name.split(",")[0];
            this.locationName = city;
          }
        })
        .catch((e) => console.error("Reverse geocode error", e));
    },
    useGeolocation() {
      if (!navigator.geolocation) {
        alert("Geolocation wird im Browser nicht unterstützt.");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lon = pos.coords.longitude.toFixed(5);
          this.fetchWeather(lat, lon, true);
          this.reverseGeocode(lat, lon);
        },
        (err) => {
          alert("Standort konnte nicht ermittelt werden: " + err.message);
        },
        { enableHighAccuracy: false, timeout: 8000 },
      );
    },
    fetchHistorical() {
      if (!this.startDate || !this.endDate) {
        alert("Bitte Start- und Enddatum auswählen.");
        return;
      }
      this.historicalLoading = true;
      const lat = 49.05; // Use current location or default
      const lon = 8.2667;
      fetch(
        `/backend/proxy.php?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&api=historical&start_date=${this.startDate}&end_date=${this.endDate}`,
      )
        .then((r) => r.json())
        .then((json) => {
          this.historicalData = json;
        })
        .catch((e) => {
          console.error("Fetch historical failed", e);
          this.historicalData = {
            error: true,
            message: "Historische Daten konnten nicht geladen werden",
          };
        })
        .finally(() => (this.historicalLoading = false));
    },
    fetchSeasonal() {
      this.seasonalLoading = true;
      const lat = 49.05;
      const lon = 8.2667;
      fetch(
        `/backend/proxy.php?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&api=seasonal`,
      )
        .then((r) => r.json())
        .then((json) => {
          this.seasonalData = json;
        })
        .catch((e) => {
          console.error("Fetch seasonal failed", e);
          this.seasonalData = {
            error: true,
            message: "Saisonale Daten konnten nicht geladen werden",
          };
        })
        .finally(() => (this.seasonalLoading = false));
    },
    fetchClimate() {
      this.climateLoading = true;
      const lat = 49.05;
      const lon = 8.2667;
      fetch(
        `/backend/proxy.php?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&api=climate`,
      )
        .then((r) => r.json())
        .then((json) => {
          this.climateData = json;
        })
        .catch((e) => {
          console.error("Fetch climate failed", e);
          this.climateData = {
            error: true,
            message: "Klimadaten konnten nicht geladen werden",
          };
        })
        .finally(() => (this.climateLoading = false));
    },
    fetchDashboard() {
      fetch("/backend/proxy.php?api=dashboard")
        .then((r) => r.json())
        .then((json) => {
          this.dashboardData = json;
        })
        .catch((e) => {
          console.error("Fetch dashboard failed", e);
          this.dashboardData = {
            callsToday: 0,
            cacheHits: 0,
            rateLimitWarnings: 0,
          };
        });
    },
    exportData(type) {
      let data = null;
      let filename = `${type}_data.csv`;
      if (type === "forecast" && this.weatherData) {
        data = this.weatherData;
      } else if (type === "historical" && this.historicalData) {
        data = this.historicalData;
      } else if (type === "seasonal" && this.seasonalData) {
        data = this.seasonalData;
      } else if (type === "climate" && this.climateData) {
        data = this.climateData;
      }
      if (!data) {
        alert(`Keine ${type}-Daten verfügbar. Bitte zuerst laden.`);
        return;
      }
      // Simple CSV export for daily data
      if (data.daily) {
        const csv = this.convertToCSV(data.daily);
        this.downloadCSV(csv, filename);
      } else if (data.monthly) {
        const csv = this.convertToCSV(data.monthly);
        this.downloadCSV(csv, filename);
      } else {
        alert("Datenformat nicht unterstützt für Export.");
      }
    },
    convertToCSV(objArray) {
      const array =
        typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
      let str = "";
      for (let i = 0; i < array.length; i++) {
        let line = "";
        for (let index in array[i]) {
          if (line !== "") line += ",";
          line += array[i][index];
        }
        str += line + "\r\n";
      }
      return str;
    },
    downloadCSV(csv, filename) {
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem('darkMode', this.darkMode);
    },  },
  mounted() {
    // initial fetch from default location (Wörth am Rhein)
    this.fetchWeather(49.05, 8.2667, false);
    this.reverseGeocode(49.05, 8.2667);
    this.fetchDashboard();
    this.darkMode = localStorage.getItem('darkMode') === 'true';
  },
  watch: {
    historicalData() {
      this.$nextTick(() => {
        if (
          this.historicalData &&
          this.historicalData.daily &&
          this.$refs.historicalChart
        ) {
          const ctx = this.$refs.historicalChart.getContext("2d");
          new Chart(ctx, {
            type: "line",
            data: {
              labels: this.historicalData.daily.time,
              datasets: [
                {
                  label: "Max Temperatur (°C)",
                  data: this.historicalData.daily.temperature_2m_max,
                  borderColor: "#ff6384",
                  backgroundColor: "rgba(255,99,132,0.2)",
                  fill: false,
                },
                {
                  label: "Min Temperatur (°C)",
                  data: this.historicalData.daily.temperature_2m_min,
                  borderColor: "#36a2eb",
                  backgroundColor: "rgba(54,162,235,0.2)",
                  fill: false,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  display: true,
                  title: {
                    display: true,
                    text: "Datum",
                  },
                },
                y: {
                  display: true,
                  title: {
                    display: true,
                    text: "Temperatur (°C)",
                  },
                },
              },
            },
          });
        }
      });
    },
    seasonalData() {
      this.$nextTick(() => {
        if (
          this.seasonalData &&
          this.seasonalData.monthly &&
          this.$refs.seasonalTempChart
        ) {
          const ctxTemp = this.$refs.seasonalTempChart.getContext("2d");
          new Chart(ctxTemp, {
            type: "line",
            data: {
              labels: this.seasonalData.monthly.time,
              datasets: [
                {
                  label: "Temperatur-Abweichung (°C)",
                  data: this.seasonalData.monthly.temperature_2m_mean,
                  borderColor: "#ff6384",
                  backgroundColor: "rgba(255,99,132,0.2)",
                  fill: false,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { title: { display: true, text: "Monat" } },
                y: { title: { display: true, text: "Abweichung (°C)" } },
              },
            },
          });
          const ctxPrecip = this.$refs.seasonalPrecipChart.getContext("2d");
          new Chart(ctxPrecip, {
            type: "line",
            data: {
              labels: this.seasonalData.monthly.time,
              datasets: [
                {
                  label: "Niederschlags-Abweichung (mm)",
                  data: this.seasonalData.monthly.precipitation_sum,
                  borderColor: "#36a2eb",
                  backgroundColor: "rgba(54,162,235,0.2)",
                  fill: false,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { title: { display: true, text: "Monat" } },
                y: { title: { display: true, text: "Abweichung (mm)" } },
              },
            },
          });
        }
      });
    },
    climateData() {
      this.$nextTick(() => {
        if (
          this.climateData &&
          this.climateData.monthly &&
          this.$refs.climateChart
        ) {
          const ctx = this.$refs.climateChart.getContext("2d");
          new Chart(ctx, {
            type: "line",
            data: {
              labels: this.climateData.monthly.time,
              datasets: [
                {
                  label: "Temperaturänderung (°C)",
                  data: this.climateData.monthly.temperature_2m_mean,
                  borderColor: "#ff6384",
                  backgroundColor: "rgba(255,99,132,0.2)",
                  fill: false,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { title: { display: true, text: "Jahr" } },
                y: { title: { display: true, text: "Änderung (°C)" } },
              },
            },
          });
        }
      });
    },
  },
};
