import CurrentWeather from "./components/CurrentWeather.js";
import HourlyTimeline from "./components/HourlyTimeline.js";
import WeeklyList from "./components/WeeklyList.js";
import MapPreview from "./components/MapPreview.js";
import Header from "./components/Header.js";
import Sidebar from "./components/Sidebar.js";
import Expert from "./components/Expert.js";
import ExpertResults from "./components/ExpertResults.js";

export default {
  components: {
    CurrentWeather,
    HourlyTimeline,
    WeeklyList,
    MapPreview,
    Header,
    Sidebar,
    Expert,
    ExpertResults,
  },
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
      sidebarOpen: true,
      expertData: null,
      expertLoading: false,
      expertParameters: null,
    };
  },
  template: `
    <div :class="['min-h-screen transition-colors', darkMode ? 'dark-mode bg-slate-900 text-gray-300' : 'bg-slate-50 text-gray-900']">
      <Header :darkMode="darkMode" :location="locationName" @toggle-dark-mode="toggleDarkMode" @search-location="searchLocation" @use-geolocation="useGeolocation" @go-home="currentTab = 'forecast'" />
      <Sidebar :currentTab="currentTab" :darkMode="darkMode" @tab-change="currentTab = $event" />
      
      <!-- Main Content Area -->
      <main class="ml-32 mt-6 p-4 max-w-full transition-all">
        <!-- Forecast Tab -->
        <div v-if="currentTab === 'forecast'">
          <div class="row">
            <section class="card large">
              <CurrentWeather :data="weatherData" :is-current="isCurrentLocation" :location="locationName" :darkMode="darkMode" />
              <HourlyTimeline :data="weatherData" :darkMode="darkMode" />
            </section>
            <aside class="card side">
              <WeeklyList :data="weatherData" />
              <MapPreview :data="weatherData" />
            </aside>
          </div>
        </div>

        <!-- Historical Tab -->
        <div v-if="currentTab === 'historical'">
          <div class="mb-5 flex gap-3 items-center">
            <input v-model="startDate" type="date" :class="['px-3 py-2 border-2 rounded-lg', darkMode ? 'bg-slate-800 border-slate-600 text-gray-300' : 'bg-white border-slate-300 text-gray-900']" />
            <input v-model="endDate" type="date" :class="['px-3 py-2 border-2 rounded-lg', darkMode ? 'bg-slate-800 border-slate-600 text-gray-300' : 'bg-white border-slate-300 text-gray-900']" />
            <button @click="fetchHistorical" class="px-5 py-2 rounded-lg border-none bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium cursor-pointer hover:shadow-lg">Laden</button>
          </div>
          <div v-if="historicalLoading" class="text-center text-gray-500 mt-5 text-lg font-medium">Historische Daten werden geladen…</div>
          <div v-else-if="historicalData && !historicalData.error">
            <h3 class="text-2xl font-bold mb-4">Historische Temperaturen</h3>
            <canvas ref="historicalChart" class="max-h-96"></canvas>
          </div>
          <div v-else-if="historicalData && historicalData.error" class="text-center text-red-500 mt-5 text-base">{{ historicalData.message }}</div>
        </div>

        <!-- Seasonal Tab -->
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

        <!-- Climate Tab -->
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

        <!-- Dashboard Tab -->
        <div v-if="currentTab === 'dashboard'">
          <h3>API-Monitoring Dashboard</h3>
          <div style="display:flex;gap:20px;margin-bottom:20px;flex-wrap:wrap">
            <div :style="{background:darkMode?'rgba(33,33,33,0.9)':'rgba(255,255,255,0.9)',padding:'16px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',flex:1,backdropFilter:'blur(10px)'}">
              <h4>API-Calls heute</h4>
              <p style="font-size:24px;font-weight:bold;color:#667eea">{{ dashboardData ? dashboardData.calls_today : 'Lade...' }}</p>
            </div>
            <div :style="{background:darkMode?'rgba(33,33,33,0.9)':'rgba(255,255,255,0.9)',padding:'16px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',flex:1,backdropFilter:'blur(10px)'}">
              <h4>Cache-Hits</h4>
              <p style="font-size:24px;font-weight:bold;color:#28a745">{{ dashboardData ? dashboardData.cache_hits : 'Lade...' }}</p>
            </div>
            <div :style="{background:darkMode?'rgba(33,33,33,0.9)':'rgba(255,255,255,0.9)',padding:'16px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',flex:1,backdropFilter:'blur(10px)'}">
              <h4>Minute ({{ dashboardData?.minute_used || 0 }}/{{ dashboardData?.minute_limit || 540 }})</h4>
              <div style="background:rgba(200,200,200,0.2);height:8px;border-radius:4px;overflow:hidden">
                <div :style="{width:(dashboardData ? (dashboardData.minute_used/dashboardData.minute_limit*100) : 0)+'%',height:'100%',background:dashboardData && dashboardData.minute_used > dashboardData.minute_limit * 0.9 ? '#ff6b6b' : '#667eea',transition:'all 0.3s'}"></div>
              </div>
            </div>
            <div :style="{background:darkMode?'rgba(33,33,33,0.9)':'rgba(255,255,255,0.9)',padding:'16px',borderRadius:'12px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',flex:1,backdropFilter:'blur(10px)'}">
              <h4>Stunde ({{ dashboardData?.hour_used || 0 }}/{{ dashboardData?.hour_limit || 4500 }})</h4>
              <div style="background:rgba(200,200,200,0.2);height:8px;border-radius:4px;overflow:hidden">
                <div :style="{width:(dashboardData ? (dashboardData.hour_used/dashboardData.hour_limit*100) : 0)+'%',height:'100%',background:dashboardData && dashboardData.hour_used > dashboardData.hour_limit * 0.9 ? '#ff6b6b' : '#667eea',transition:'all 0.3s'}"></div>
              </div>
            </div>
          </div>
          <h3>Daten-Export</h3>
          <div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap">
            <button @click="exportData('forecast')" style="padding:12px 20px;border-radius:8px;border:none;background:#28a745;color:#fff;font-weight:500;cursor:pointer">Forecast als CSV</button>
            <button @click="exportData('historical')" style="padding:12px 20px;border-radius:8px;border:none;background:#28a745;color:#fff;font-weight:500;cursor:pointer">Historical als CSV</button>
            <button @click="exportData('seasonal')" style="padding:12px 20px;border-radius:8px;border:none;background:#28a745;color:#fff;font-weight:500;cursor:pointer">Seasonal als CSV</button>
            <button @click="exportData('climate')" style="padding:12px 20px;border-radius:8px;border:none;background:#28a745;color:#fff;font-weight:500;cursor:pointer">Climate als CSV</button>
          </div>
        </div>

        <!-- Expert Tab -->
        <div v-if="currentTab === 'expert'">
          <Expert :darkMode="darkMode" :isLoading="expertLoading" @refresh-expert-data="handleRefreshExpert" />
          <div v-if="expertLoading" style="text-align:center;color:#666;margin-top:20px;font-size:18px;font-weight:500">Expert-Daten werden geladen…</div>
          <div v-else-if="expertData && !expertData.error" style="margin-top:20px">
            <ExpertResults :data="expertData" :darkMode="darkMode" />
          </div>
          <div v-else-if="expertData && expertData.error" style="text-align:center;color:#dc3545;margin-top:20px;font-size:16px">{{ expertData.message }}</div>
        </div>

        <div v-if="loading && currentTab === 'forecast'" style="text-align:center;color:#666;margin-top:20px;font-size:18px;font-weight:500">Wetterdaten werden geladen…</div>
      </main>
    </div>
  `,
  methods: {
    fetchWeather(lat, lon, markAsCurrent = false) {
      this.loading = true;
      this.isCurrentLocation = !!markAsCurrent;
      fetch(
        `/backend/proxy.php?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
      )
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((json) => {
          this.weatherData = json;
        })
        .catch((e) => {
          console.error("Fetch weather failed", e);
          this.weatherData = {
            error: true,
            message:
              "Wetterdaten konnten nicht geladen werden. Proxy-Server nicht erreichbar?",
          };
        })
        .finally(() => (this.loading = false));
    },
    searchLocation(q) {
      q = (q || this.locationName || "").trim();
      if (!q) {
        alert("Bitte einen Ort eingeben.");
        return;
      }
      // Use Nominatim for geocoding (OpenStreetMap)
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      fetch(url, { headers: { "Accept-Language": "de" } })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
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
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
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
        .catch((e) => console.warn("Reverse geocode error", e));
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
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
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
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
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
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
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
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((json) => {
          this.dashboardData = json;
        })
        .catch((e) => {
          console.warn("Dashboard nicht verfügbar, lade Default-Werte:", e);
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
    },
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      localStorage.setItem("darkMode", this.darkMode);
    },
    renderHistoricalChart() {
      if (
        !this.historicalData ||
        !this.historicalData.daily ||
        !this.$refs.historicalChart
      )
        return;
      if (this._historicalChart) this._historicalChart.destroy();
      this._historicalChart = new Chart(
        this.$refs.historicalChart.getContext("2d"),
        {
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
              x: { title: { display: true, text: "Datum" } },
              y: { title: { display: true, text: "Temperatur (°C)" } },
            },
          },
        },
      );
    },
    renderSeasonalChart() {
      if (!this.seasonalData || !this.seasonalData.monthly) return;
      if (this.$refs.seasonalTempChart) {
        if (this._seasonalTempChart) this._seasonalTempChart.destroy();
        this._seasonalTempChart = new Chart(
          this.$refs.seasonalTempChart.getContext("2d"),
          {
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
          },
        );
      }
      if (this.$refs.seasonalPrecipChart) {
        if (this._seasonalPrecipChart) this._seasonalPrecipChart.destroy();
        this._seasonalPrecipChart = new Chart(
          this.$refs.seasonalPrecipChart.getContext("2d"),
          {
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
          },
        );
      }
    },
    renderClimateChart() {
      if (
        !this.climateData ||
        !this.climateData.monthly ||
        !this.$refs.climateChart
      )
        return;
      if (this._climateChart) this._climateChart.destroy();
      this._climateChart = new Chart(this.$refs.climateChart.getContext("2d"), {
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
    },
    handleRefreshExpert(selectedParameters) {
      this.expertLoading = true;
      this.expertData = null;
      this.expertParameters = selectedParameters;

      const lat = 49.05;
      const lon = 8.2667;

      const queryParams = new URLSearchParams();
      queryParams.append("lat", lat);
      queryParams.append("lon", lon);
      queryParams.append("api", "expert");

      if (selectedParameters.current && selectedParameters.current.length > 0) {
        queryParams.append("current", selectedParameters.current.join(","));
      }
      if (selectedParameters.daily && selectedParameters.daily.length > 0) {
        queryParams.append("daily", selectedParameters.daily.join(","));
      }
      if (selectedParameters.hourly && selectedParameters.hourly.length > 0) {
        queryParams.append("hourly", selectedParameters.hourly.join(","));
      }

      console.log(
        "Expert API Call:",
        `/backend/proxy.php?${queryParams.toString()}`,
      );
      fetch(`/backend/proxy.php?${queryParams.toString()}`)
        .then((r) => {
          console.log("Response status:", r.status);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((json) => {
          console.log("Expert data received:", json);
          this.expertData = json;
        })
        .catch((e) => {
          console.error("Fetch expert data failed", e);
          this.expertData = {
            error: true,
            message: "Expert-Daten konnten nicht geladen werden: " + e.message,
          };
        })
        .finally(() => (this.expertLoading = false));
    },
  },
  mounted() {
    // Try to use user's geolocation on first load
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lon = pos.coords.longitude.toFixed(5);
          this.fetchWeather(lat, lon, true);
          this.reverseGeocode(lat, lon);
        },
        (err) => {
          // Fallback to Heidelberg
          console.warn(
            "Geolocation failed, using default (Heidelberg):",
            err.message,
          );
          this.fetchWeather(49.4134, 8.7098, false);
          this.reverseGeocode(49.4134, 8.7098);
        },
        { enableHighAccuracy: false, timeout: 8000 },
      );
    } else {
      // Browser doesn't support geolocation, use Heidelberg
      this.fetchWeather(49.4134, 8.7098, false);
      this.reverseGeocode(49.4134, 8.7098);
    }
    this.fetchDashboard();
    this.darkMode = localStorage.getItem("darkMode") === "true";
  },
  watch: {
    currentTab(newTab) {
      // Re-render charts when navigating back to a tab since v-if destroys/recreates canvas
      this.$nextTick(() => {
        if (newTab === "historical") this.renderHistoricalChart();
        if (newTab === "seasonal") this.renderSeasonalChart();
        if (newTab === "climate") this.renderClimateChart();
      });

      // Auto-load and poll dashboard data when switching to dashboard tab
      if (newTab === "dashboard") {
        this.fetchDashboard();
        // Clear any existing poll
        if (this.dashboardPollInterval) {
          clearInterval(this.dashboardPollInterval);
        }
        // Poll dashboard stats every 5 seconds for live updates
        this.dashboardPollInterval = setInterval(() => {
          this.fetchDashboard();
        }, 5000);
      } else {
        // Clear dashboard poll when leaving tab
        if (this.dashboardPollInterval) {
          clearInterval(this.dashboardPollInterval);
          this.dashboardPollInterval = null;
        }
      }

      // Auto-load expert data when switching to expert tab
      if (newTab === "expert") {
        this.handleRefreshExpert({
          current: [
            "temperature_2m",
            "weather_code",
            "wind_speed_10m",
            "precipitation",
          ],
          daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min",
            "sunrise",
            "sunset",
            "uv_index_max",
            "wind_speed_10m_max",
          ],
          hourly: [
            "temperature_2m",
            "relative_humidity_2m",
            "precipitation_probability",
            "cloud_cover",
            "wind_speed_10m",
          ],
        });
      }
    },
    historicalData() {
      this.$nextTick(() => {
        this.renderHistoricalChart();
      });
    },
    seasonalData() {
      this.$nextTick(() => {
        this.renderSeasonalChart();
      });
    },
    climateData() {
      this.$nextTick(() => {
        this.renderClimateChart();
      });
    },
  },
};
