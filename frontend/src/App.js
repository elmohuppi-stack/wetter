import NavTabs from "./components/NavTabs.js";
import LocationDialog from "./components/LocationDialog.js";
import WeatherPanel from "./components/WeatherPanel.js";
import Expert from "./components/Expert.js";
import ExpertResults from "./components/ExpertResults.js";

export default {
  components: { NavTabs, LocationDialog, WeatherPanel, Expert, ExpertResults },
  data() {
    return {
      weatherData: null,
      loading: true,
      locationName: "",
      isCurrentLocation: false,
      currentTab: "forecast",
      dashboardData: null,
      darkMode: false,
      locationDialogOpen: false,
      expertData: null,
      expertLoading: false,
      expertParameters: null,
      expertApiUrl: "",
      currentLat: null,
      currentLon: null,
    };
  },
  template: `
    <div>
      <NavTabs :currentTab="currentTab" :darkMode="darkMode" @tab-change="currentTab = $event" @open-location="locationDialogOpen = true" @toggle-dark-mode="toggleDarkMode" />

      <LocationDialog
        :open="locationDialogOpen"
        :location="locationName"
        @close="locationDialogOpen = false"
        @search-location="searchLocation"
        @use-geolocation="useGeolocation"
      />

      <main class="g-main">
        <!-- Wetter -->
        <div v-if="currentTab === 'forecast'">
          <div v-if="loading" class="g-muted">Wetterdaten werden geladen…</div>
          <WeatherPanel v-else :data="weatherData" :location="locationName" :is-current="isCurrentLocation" :darkMode="darkMode" @open-location="locationDialogOpen = true" />
        </div>

        <!-- Monitoring -->
        <div v-if="currentTab === 'dashboard'">
          <h3 class="g-h">API-Monitoring</h3>
          <p class="g-sub">Verbrauch gegenüber den Limits von Open-Meteo.</p>
          <div class="g-tiles" style="margin-bottom:32px">
            <div class="g-tile">
              <h4>API-Aufrufe heute</h4>
              <div class="g-tile-value">{{ dashboardData ? dashboardData.calls_today : '…' }}</div>
            </div>
            <div class="g-tile">
              <h4>Cache-Treffer</h4>
              <div class="g-tile-value">{{ dashboardData ? dashboardData.cache_hits : '…' }}</div>
            </div>
            <div class="g-tile">
              <h4>Minute ({{ dashboardData?.minute_used || 0 }} / {{ dashboardData?.minute_limit || 540 }})</h4>
              <div class="g-bar"><div :style="barStyle('minute')"></div></div>
            </div>
            <div class="g-tile">
              <h4>Stunde ({{ dashboardData?.hour_used || 0 }} / {{ dashboardData?.hour_limit || 4500 }})</h4>
              <div class="g-bar"><div :style="barStyle('hour')"></div></div>
            </div>
          </div>

          <h3 class="g-h">Daten-Export</h3>
          <p class="g-sub">Die Tageswerte der aktuellen Vorhersage als CSV.</p>
          <button @click="exportData" class="g-btn">Vorhersage exportieren</button>
        </div>

        <!-- Experte -->
        <div v-if="currentTab === 'expert'">
          <Expert :darkMode="darkMode" :isLoading="expertLoading" :location="locationName" @refresh-expert-data="handleRefreshExpert" />
          <div v-if="expertLoading" class="g-muted">Expert-Daten werden geladen…</div>
          <div v-else-if="expertData && !expertData.error" style="margin-top:24px">
            <ExpertResults :data="expertData" :darkMode="darkMode" :apiUrl="expertApiUrl" />
          </div>
          <div v-else-if="expertData && expertData.error" class="g-error">{{ expertData.message }}</div>
        </div>
      </main>

      <footer class="g-foot">
        <a href="https://elmarhepp.de/impressum">Impressum</a>
        <a href="/datenschutz.html">Datenschutz</a>
      </footer>
    </div>
  `,
  methods: {
    /*
      Die Klasse muss an <html> hängen, nicht an einem div in der App. Die
      Farb-Variablen wirken sonst nur auf Nachfahren dieses divs — body behielt
      seinen hellen Hintergrund, und heller Text stand auf Weiß.
    */
    applyDarkMode() {
      document.documentElement.classList.toggle("dark-mode", this.darkMode);
    },
    barStyle(scope) {
      const used = this.dashboardData?.[scope + "_used"] || 0;
      const limit = this.dashboardData?.[scope + "_limit"] || 1;
      const pct = Math.min(100, (used / limit) * 100);
      return {
        width: pct + "%",
        background: used > limit * 0.9 ? "#d93025" : "",
      };
    },
    fetchWeather(lat, lon, markAsCurrent = false) {
      this.loading = true;
      this.isCurrentLocation = !!markAsCurrent;
      this.currentLat = lat;
      this.currentLon = lon;
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
            calls_today: 0,
            cache_hits: 0,
            minute_used: 0,
            minute_limit: 540,
            hour_used: 0,
            hour_limit: 4500,
          };
        });
    },
    exportData() {
      if (!this.weatherData || !this.weatherData.daily) {
        alert("Keine Vorhersagedaten verfügbar.");
        return;
      }
      this.downloadCSV(this.convertToCSV(this.weatherData.daily), "forecast_data.csv");
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
      this.applyDarkMode();
      // Die Diagramme lesen ihre Farben aus dem CSS und müssen neu gezeichnet
      // werden, sobald die Variablen wechseln.
      this.$nextTick(() => {
        this.renderHistoricalChart();
        this.renderSeasonalChart();
        this.renderClimateChart();
      });
    },
    handleRefreshExpert(selectedParameters) {
      this.expertLoading = true;
      this.expertData = null;
      this.expertParameters = selectedParameters;

      const lat = this.currentLat || 49.05;
      const lon = this.currentLon || 8.2667;

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

      const requestPath = `/backend/proxy.php?${queryParams.toString()}`;
      this.expertApiUrl = `${window.location.origin}${requestPath}`;

      fetch(requestPath)
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((json) => {
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
    this.darkMode = localStorage.getItem("darkMode") === "true";
    this.applyDarkMode();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(5);
          const lon = pos.coords.longitude.toFixed(5);
          this.fetchWeather(lat, lon, true);
          this.reverseGeocode(lat, lon);
        },
        (err) => {
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
      this.fetchWeather(49.4134, 8.7098, false);
      this.reverseGeocode(49.4134, 8.7098);
    }
    this.fetchDashboard();
  },
  beforeUnmount() {
    if (this.dashboardPollInterval) clearInterval(this.dashboardPollInterval);
  },
  watch: {
    currentTab(newTab) {
      if (newTab === "dashboard") {
        this.fetchDashboard();
        if (this.dashboardPollInterval) {
          clearInterval(this.dashboardPollInterval);
        }
        this.dashboardPollInterval = setInterval(() => {
          this.fetchDashboard();
        }, 5000);
      } else if (this.dashboardPollInterval) {
        clearInterval(this.dashboardPollInterval);
        this.dashboardPollInterval = null;
      }

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
  },
};
