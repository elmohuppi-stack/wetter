export default {
  props: {
    data: Object,
    darkMode: Boolean,
    apiUrl: String,
  },
  data() {
    return {
      currentExpanded: true,
      tableExpanded: false,
      apiCallExpanded: false,
      chartTab: "hourly",
      _charts: {},
      selectedDailyParams: [],
      selectedHourlyParams: [],
      parameterTranslations: {
        temperature_2m: "Temperatur (2m)",
        apparent_temperature: "Gefühlte Temperatur",
        weather_code: "Wetterkode",
        relative_humidity_2m: "Relative Luftfeuchte (2m)",
        wind_speed_10m: "Windgeschwindigkeit (10m)",
        wind_gusts_10m: "Windböen (10m)",
        wind_direction_10m: "Windrichtung (10m)",
        pressure_msl: "Luftdruck (MSL)",
        precipitation: "Niederschlag",
        cloud_cover: "Bewölkung",
        temperature_2m_max: "Max. Temperatur",
        temperature_2m_min: "Min. Temperatur",
        apparent_temperature_max: "Max. Gefühlte Temperatur",
        apparent_temperature_min: "Min. Gefühlte Temperatur",
        sunrise: "Sonnenaufgang",
        sunset: "Sonnenuntergang",
        daylight_duration: "Tageslicht-Dauer",
        sunshine_duration: "Sonnenschein-Dauer",
        uv_index_max: "Max. UV-Index",
        precipitation_probability_max: "Max. Niederschlagswahrscheinlichkeit",
        precipitation_sum: "Gesamtniederschlag",
        rain_sum: "Gesamtregen",
        snowfall_sum: "Gesamtschneefall",
        wind_speed_10m_max: "Max. Windgeschwindigkeit",
        wind_gusts_10m_max: "Max. Windböen",
        wind_direction_10m_dominant: "Dominante Windrichtung",
        precipitation_probability: "Niederschlagswahrscheinlichkeit",
        rain: "Regen",
        visibility: "Sichtweite",
        time: "Messzeitpunkt",
        interval: "Messintervall",
      },
      parameterUnits: {
        temperature_2m: "°C",
        apparent_temperature: "°C",
        temperature_2m_max: "°C",
        temperature_2m_min: "°C",
        apparent_temperature_max: "°C",
        apparent_temperature_min: "°C",
        relative_humidity_2m: "%",
        wind_speed_10m: "km/h",
        wind_gusts_10m: "km/h",
        wind_speed_10m_max: "km/h",
        wind_gusts_10m_max: "km/h",
        wind_direction_10m: "°",
        wind_direction_10m_dominant: "°",
        pressure_msl: "hPa",
        precipitation: "mm",
        precipitation_sum: "mm",
        rain: "mm",
        rain_sum: "mm",
        snowfall_sum: "cm",
        cloud_cover: "%",
        precipitation_probability: "%",
        precipitation_probability_max: "%",
        visibility: "m",
        daylight_duration: "s",
        sunshine_duration: "s",
      },
    };
  },
  computed: {
    currentSelectedParams: {
      get() {
        return this.chartTab === "daily"
          ? this.selectedDailyParams
          : this.selectedHourlyParams;
      },
      set(value) {
        if (this.chartTab === "daily") {
          this.selectedDailyParams = value;
        } else {
          this.selectedHourlyParams = value;
        }
      },
    },
  },
  watch: {
    data: {
      handler() {
        this.initSelectedParams();
        this.$nextTick(() => this.renderCharts());
      },
      deep: true,
    },
    chartTab() {
      this.$nextTick(() => this.renderCharts());
    },
    selectedDailyParams: {
      handler() {
        if (this.chartTab === "daily") {
          this.$nextTick(() => this.renderCharts());
        }
      },
      deep: true,
    },
    selectedHourlyParams: {
      handler() {
        if (this.chartTab === "hourly") {
          this.$nextTick(() => this.renderCharts());
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.initSelectedParams();
    if (this.data) {
      this.$nextTick(() => this.renderCharts());
    }
  },
  beforeUnmount() {
    Object.values(this._charts || {}).forEach((chart) => {
      try {
        chart?.destroy?.();
      } catch (e) {
        console.warn("Error destroying chart:", e);
      }
    });
    this._charts = {};
  },
  methods: {
    getTranslation(key) {
      return this.parameterTranslations[key] || key;
    },
    getUnit(key) {
      return this.parameterUnits[key] || "";
    },
    formatJson(data) {
      try {
        return JSON.stringify(data, null, 2);
      } catch {
        return "{}";
      }
    },
    chartableKeys(dataObj) {
      if (!dataObj) return [];
      const excluded = [
        "time",
        "interval",
        "sunrise",
        "sunset",
        "weather_code",
      ];
      return Object.keys(dataObj).filter((k) => !excluded.includes(k));
    },
    initSelectedParams() {
      if (!this.data) return;

      const dailyKeys = this.chartableKeys(this.data.daily);
      const hourlyKeys = this.chartableKeys(this.data.hourly);

      this.selectedDailyParams = dailyKeys;
      this.selectedHourlyParams = hourlyKeys;
    },
    formatWeatherCode(code) {
      const descriptions = {
        0: "☀️ Klarer Himmel",
        1: "🌤️ Überwiegend klar",
        2: "⛅ Teilweise bewölkt",
        3: "☁️ Bedeckt",
        45: "🌫️ Nebel",
        48: "🌫️ Reifnebel",
        51: "🌦️ Leichter Nieselregen",
        53: "🌦️ Mäßiger Nieselregen",
        55: "🌦️ Starker Nieselregen",
        56: "🌨️ Leichter gefrierender Nieselregen",
        57: "🌨️ Starker gefrierender Nieselregen",
        61: "🌧️ Leichter Regen",
        63: "🌧️ Mäßiger Regen",
        65: "🌧️ Starker Regen",
        66: "🌨️ Leichter gefrierender Regen",
        67: "🌨️ Starker gefrierender Regen",
        71: "❄️ Leichter Schneefall",
        73: "❄️ Mäßiger Schneefall",
        75: "❄️ Starker Schneefall",
        77: "❄️ Schneekörner",
        80: "🌦️ Leichte Regenschauer",
        81: "🌦️ Mäßige Regenschauer",
        82: "🌦️ Starke Regenschauer",
        85: "❄️ Leichte Schneeschauer",
        86: "❄️ Starke Schneeschauer",
        95: "⛈️ Gewitter",
        96: "⛈️ Gewitter mit leichtem Hagel",
        99: "⛈️ Gewitter mit starkem Hagel",
      };
      return descriptions[code] ?? `Code ${code}`;
    },
    formatValue(value, key) {
      if (value === null || value === undefined) return "-";
      if (key === "weather_code") return this.formatWeatherCode(value);
      if (key === "time") {
        const date = new Date(value);
        return date.toLocaleString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      if (key === "interval") return `${value} s`;
      if (
        key === "wind_speed_10m" ||
        key === "wind_speed_10m_max" ||
        key === "windspeed_10m" ||
        key === "windspeed_10m_max" ||
        key === "wind_gusts_10m" ||
        key === "wind_gusts_10m_max" ||
        key === "windgusts_10m" ||
        key === "windgusts_10m_max"
      ) {
        const kmh = Math.round(value);
        let label;
        if (kmh < 1) label = "Windstille";
        else if (kmh < 6) label = "Stille";
        else if (kmh < 12) label = "Leiser Zug";
        else if (kmh < 20) label = "Schwach";
        else if (kmh < 29) label = "Mäßig";
        else if (kmh < 39) label = "Frisch";
        else if (kmh < 50) label = "Stark";
        else if (kmh < 62) label = "Steif";
        else if (kmh < 75) label = "Stürmisch";
        else if (kmh < 89) label = "Sturm";
        else if (kmh < 103) label = "Schwerer Sturm";
        else if (kmh < 117) label = "Orkanartiger Sturm";
        else label = "Orkan";
        return `${label} (${kmh} km/h)`;
      }
      if (
        key === "wind_direction_10m" ||
        key === "wind_direction_10m_dominant"
      ) {
        const dirs = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];
        const idx = Math.round(value / 45) % 8;
        return `${dirs[idx]} (${Math.round(value)}°)`;
      }
      if (typeof value === "number") {
        return value.toFixed(2);
      }
      return value;
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    formatTime(timeStr) {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    renderCharts() {
      const dataSource =
        this.chartTab === "daily" ? this.data?.daily : this.data?.hourly;
      if (!dataSource || !dataSource.time || dataSource.time.length === 0) {
        return;
      }

      const selectedParams =
        this.chartTab === "daily"
          ? this.selectedDailyParams
          : this.selectedHourlyParams;
      if (selectedParams.length === 0) {
        Object.values(this._charts || {}).forEach((chart) => {
          try {
            chart?.destroy?.();
          } catch {}
        });
        this._charts = {};
        return;
      }

      Object.values(this._charts || {}).forEach((chart) => {
        try {
          chart?.destroy?.();
        } catch {}
      });
      this._charts = {};

      this.$nextTick(() => {
        const canvases = this.$el?.querySelectorAll("canvas[data-param]") || [];

        canvases.forEach((canvas) => {
          const paramKey = canvas.getAttribute("data-param");
          if (!selectedParams.includes(paramKey)) return;

          const values = dataSource[paramKey];
          const ctx = canvas.getContext("2d");
          if (!values || !ctx) return;

          // Destroy any existing Chart instance on this specific canvas
          try {
            // Check all Chart instances and destroy those on this canvas
            if (window.Chart && window.Chart.helpers) {
              const toDestroy = [];
              for (let key in this._charts) {
                if (this._charts[key]?.canvas === canvas) {
                  toDestroy.push(key);
                }
              }
              toDestroy.forEach((key) => {
                this._charts[key]?.destroy?.();
                delete this._charts[key];
              });
            }
          } catch {}

          const unit = this.getUnit(paramKey);
          const chartType = this.chartTab === "daily" ? "bar" : "line";
          // Farbe aus dem Design statt festem Lila — der Rest der App kennt
          // kein Lila mehr, und im dunklen Modus wechselt der Ton mit.
          const chartColor = getComputedStyle(document.body)
            .getPropertyValue("--g-link")
            .trim();

          const labels = dataSource.time.map((t, i) => {
            const date = new Date(t);
            if (this.chartTab === "daily") {
              // Format: DD.MM. (ohne Wochentag und Jahr)
              return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.`;
            }
            // Für stündliche Daten: zeige Datum DD.MM. bei Datumswechsel
            if (
              i === 0 ||
              new Date(dataSource.time[i - 1]).toDateString() !==
                date.toDateString()
            ) {
              return `${date.getDate().toString().padStart(2, "0")}.${(date.getMonth() + 1).toString().padStart(2, "0")}.`;
            }
            return "";
          });

          this._charts[paramKey] = new Chart(ctx, {
            type: chartType,
            data: {
              labels,
              datasets: [
                {
                  label: `${this.getTranslation(paramKey)} ${unit}`.trim(),
                  data: values,
                  borderColor: chartColor,
                  backgroundColor: `${chartColor}${chartType === "bar" ? "cc" : "30"}`,
                  fill: chartType === "line",
                  borderWidth: chartType === "line" ? 2 : 0,
                  pointRadius: chartType === "line" ? 0 : undefined,
                  tension: chartType === "line" ? 0.4 : undefined,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: false,
              interaction: { mode: "index", intersect: false },
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  backgroundColor: this.darkMode
                    ? "rgba(0,0,0,0.8)"
                    : "rgba(0,0,0,0.7)",
                  titleColor: "#fff",
                  bodyColor: "#fff",
                  borderColor: chartColor,
                  borderWidth: 2,
                  padding: 12,
                  displayColors: true,
                  callbacks: {
                    title: (context) => {
                      if (this.chartTab === "hourly" && context[0]) {
                        const timeStr = dataSource.time[context[0].dataIndex];
                        const date = new Date(timeStr);
                        return date.toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                      }
                      return "";
                    },
                  },
                },
              },
              scales: {
                x: {
                  ticks: {
                    color: this.darkMode ? "#9aa0a6" : "#5f6368",
                    autoSkip: this.chartTab === "daily",
                    maxTicksLimit: this.chartTab === "daily" ? 7 : undefined,
                    maxRotation: 0,
                    minRotation: 0,
                    callback: (value, index) => labels[index] || "",
                  },
                  grid: { color: this.darkMode ? "#3c4043" : "#dadce0" },
                },
                y: {
                  type: "linear",
                  display: true,
                  position: "left",
                  ticks: { color: this.darkMode ? "#9aa0a6" : "#5f6368" },
                  grid: { color: this.darkMode ? "#3c4043" : "#dadce0" },
                  title: {
                    display: true,
                    text: unit || "Wert",
                    color: this.darkMode ? "#9aa0a6" : "#5f6368",
                  },
                },
              },
            },
          });
        });
      });
    },
  },
  template: `
    <div>
      <!-- Aktuelle Werte -->
      <section class="g-section">
        <button class="g-acc-head" @click="currentExpanded = !currentExpanded">
          <span>Aktuelle Werte</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" :style="{ transform: currentExpanded ? 'rotate(180deg)' : 'none' }">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div v-show="currentExpanded" class="g-acc-body">
          <div v-if="data && data.current" class="g-tiles">
            <template v-for="(value, key) in data.current" :key="key">
              <div v-if="key !== 'interval'" class="g-tile">
                <h4>{{ getTranslation(key) }}</h4>
                <div class="g-tile-value">{{ formatValue(value, key) }}<span v-if="getUnit(key) && key !== 'weather_code'" style="font-size:13px;margin-left:3px" class="g-muted">{{ getUnit(key) }}</span></div>
              </div>
            </template>
          </div>
        </div>
      </section>

      <!-- Tägliche | Stündliche -->
      <div v-if="data" class="g-metrics" style="margin-bottom:20px">
        <button class="g-metric" :class="{ 'is-active': chartTab === 'daily' }" @click="chartTab = 'daily'">Tägliche Vorhersage</button>
        <button class="g-metric" :class="{ 'is-active': chartTab === 'hourly' }" @click="chartTab = 'hourly'">Stündliche Vorhersage</button>
      </div>

      <!-- Diagramme -->
      <div v-if="data">
        <div v-if="currentSelectedParams.length === 0" class="g-muted" style="padding:32px 0">
          Wähle mindestens einen Parameter aus, um die Grafiken anzuzeigen.
        </div>
        <div v-else class="g-chartgrid">
          <div v-for="param in currentSelectedParams" :key="param" class="g-tile">
            <h4>{{ getTranslation(param) }}</h4>
            <div style="height:190px"><canvas :data-param="param"></canvas></div>
          </div>
        </div>
      </div>

      <!-- Detail-Tabelle -->
      <section class="g-section">
        <button class="g-acc-head" @click="tableExpanded = !tableExpanded">
          <span>Detail-Tabelle</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" :style="{ transform: tableExpanded ? 'rotate(180deg)' : 'none' }">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div v-show="tableExpanded" class="g-acc-body">
          <div v-if="chartTab === 'daily' && data && data.daily && data.daily.time && data.daily.time.length" style="overflow-x:auto">
            <table class="g-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th v-for="key in Object.keys(data.daily).filter(k => k !== 'time')" :key="key" style="text-align:right">{{ getTranslation(key) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(date, index) in data.daily.time" :key="index">
                  <td>{{ formatDate(date) }}</td>
                  <td v-for="key in Object.keys(data.daily).filter(k => k !== 'time')" :key="key" style="text-align:right">{{ formatValue(data.daily[key][index], key) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="chartTab === 'hourly' && data && data.hourly && data.hourly.time && data.hourly.time.length" style="overflow-x:auto">
            <p class="g-sub">Nächste 48 Stunden</p>
            <table class="g-table">
              <thead>
                <tr>
                  <th>Zeit</th>
                  <th v-for="key in Object.keys(data.hourly).filter(k => k !== 'time')" :key="key" style="text-align:right">{{ getTranslation(key) }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(time, index) in data.hourly.time.slice(0, 48)" :key="index">
                  <td>{{ formatTime(time) }}</td>
                  <td v-for="key in Object.keys(data.hourly).filter(k => k !== 'time')" :key="key" style="text-align:right">{{ formatValue(data.hourly[key][index], key) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- API Call -->
      <section class="g-section">
        <button class="g-acc-head" @click="apiCallExpanded = !apiCallExpanded">
          <span>API-Aufruf</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round" :style="{ transform: apiCallExpanded ? 'rotate(180deg)' : 'none' }">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
        <div v-show="apiCallExpanded" class="g-acc-body">
          <h4 class="g-label">URL</h4>
          <div class="g-code" style="word-break:break-all">{{ apiUrl || 'Keine URL verfügbar' }}</div>
          <h4 class="g-label" style="margin-top:16px">JSON-Ergebnis</h4>
          <pre class="g-code">{{ formatJson(data) }}</pre>
        </div>
      </section>
    </div>
  `,
};
