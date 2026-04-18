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
      chartColors: [
        "#667eea",
        "#f093fb",
        "#4facfe",
        "#00f2fe",
        "#43e97b",
        "#fa709a",
        "#feca57",
        "#ff9ff3",
        "#54a0ff",
        "#48dbfb",
        "#1dd1a1",
        "#ee5a6f",
        "#f8b500",
        "#ff6348",
        "#9b59b6",
        "#3498db",
        "#e74c3c",
      ],
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
          const chartColor = "#7c3aed";

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
                    color: this.darkMode ? "#e0e0e0" : "#333",
                    autoSkip: this.chartTab === "daily",
                    maxTicksLimit: this.chartTab === "daily" ? 7 : undefined,
                    maxRotation: 0,
                    minRotation: 0,
                    callback: (value, index) => labels[index] || "",
                  },
                  grid: { color: this.darkMode ? "#333" : "#eee" },
                },
                y: {
                  type: "linear",
                  display: true,
                  position: "left",
                  ticks: { color: this.darkMode ? "#e0e0e0" : "#333" },
                  grid: { color: this.darkMode ? "#333" : "#eee" },
                  title: {
                    display: true,
                    text: unit || "Wert",
                    color: this.darkMode ? "#e0e0e0" : "#333",
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
    <div :class="['text-sm', darkMode ? 'text-gray-300' : 'text-gray-900']">
      <!-- Accordion: Aktuelle Werte -->
      <div :class="['mb-6 p-4 rounded-lg', darkMode ? 'bg-slate-800' : 'bg-white']">
        <div class="flex items-center cursor-pointer mb-4" @click="currentExpanded = !currentExpanded">
          <h3 class="m-0 flex-1 text-lg font-semibold">Aktuelle Werte</h3>
          <span :class="['text-lg transition-transform', currentExpanded ? 'rotate-0' : '-rotate-90']">▼</span>
        </div>
        <div v-show="currentExpanded">
          <div v-if="data && data.current" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <template v-for="(value, key) in data.current" :key="key">
              <div v-if="key !== 'interval'" :class="['p-3 rounded', darkMode ? 'bg-slate-700' : 'bg-gray-50']">
                <div :class="['text-xs opacity-70 mb-1', darkMode ? 'text-gray-400' : 'text-gray-600']">{{ getTranslation(key) }}</div>
                <div class="text-base font-bold text-purple-600">{{ formatValue(value, key) }}<span v-if="getUnit(key) && key !== 'weather_code'" class="text-xs font-normal ml-0.5 opacity-80">{{ getUnit(key) }}</span></div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Tabs: Tägliche | Stündliche -->
      <div v-if="data" class="mb-4 flex gap-2">
        <button
          :class="['px-4 py-2 rounded border-none cursor-pointer font-medium transition-colors', chartTab === 'daily' ? 'bg-purple-600 text-white' : (darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-900')]"
          @click="chartTab = 'daily'"
        >
          Tägliche Vorhersage
        </button>
        <button
          :class="['px-4 py-2 rounded border-none cursor-pointer font-medium transition-colors', chartTab === 'hourly' ? 'bg-purple-600 text-white' : (darkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-900')]"
          @click="chartTab = 'hourly'"
        >
          Stündliche Vorhersage
        </button>
      </div>

      <!-- Charts Grid -->
      <div v-if="data" :class="['mb-6 p-4 rounded-lg', darkMode ? 'bg-slate-800' : 'bg-white']">
        <div v-if="currentSelectedParams.length === 0" :class="['text-center py-10', darkMode ? 'text-gray-600' : 'text-gray-400']">
          Wähle mindestens einen Parameter aus, um die Grafiken anzuzeigen.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(param, idx) in currentSelectedParams" :key="param" :class="['p-3 rounded', darkMode ? 'bg-slate-700' : 'bg-gray-50']">
            <div class="text-sm font-semibold mb-2" :style="{ color: darkMode ? '#e0e0e0' : '#333' }">{{ getTranslation(param) }}</div>
            <div class="h-48">
              <canvas :data-param="param"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Accordion: Detail-Tabelle -->
      <div :class="['p-4 rounded-lg', darkMode ? 'bg-slate-800' : 'bg-white']">
        <div class="flex items-center cursor-pointer mb-4" @click="tableExpanded = !tableExpanded">
          <h3 class="m-0 flex-1 text-lg font-semibold">Detail-Tabelle</h3>
          <span :class="['text-lg transition-transform', tableExpanded ? 'rotate-0' : '-rotate-90']">▼</span>
        </div>
        <div v-show="tableExpanded">
          <!-- Tägliche Tabelle -->
          <div v-if="chartTab === 'daily' && data && data.daily && data.daily.time && data.daily.time.length > 0">
            <h4 class="mt-0 text-base font-semibold mb-3">Tägliche Vorhersage</h4>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr :class="['border-b-2', darkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-300 bg-gray-100']">
                    <th class="px-2 py-2 text-left font-bold">Datum</th>
                    <th v-for="key in Object.keys(data.daily).filter(k => k !== 'time')" :key="key" class="px-2 py-2 text-right font-bold">{{ getTranslation(key) }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(date, index) in data.daily.time" :key="index" :class="['border-b', darkMode ? (index % 2 === 0 ? 'bg-slate-800 border-slate-700' : 'bg-slate-700 border-slate-700') : (index % 2 === 0 ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200')]">
                    <td class="px-2 py-2 text-left">{{ formatDate(date) }}</td>
                    <td v-for="key in Object.keys(data.daily).filter(k => k !== 'time')" :key="key" class="px-2 py-2 text-right">{{ formatValue(data.daily[key][index], key) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Stündliche Tabelle (48h) -->
          <div v-if="chartTab === 'hourly' && data && data.hourly && data.hourly.time && data.hourly.time.length > 0" class="mt-6">
            <h4 class="mt-0 text-base font-semibold mb-3">Stündliche Details (nächste 48h)</h4>
            <div class="overflow-x-auto">
              <table class="w-full border-collapse text-xs">
                <thead>
                  <tr :class="['border-b-2', darkMode ? 'border-slate-600 bg-slate-700' : 'border-gray-300 bg-gray-100']">
                    <th class="px-2 py-2 text-left font-bold">Zeit</th>
                    <th v-for="key in Object.keys(data.hourly).filter(k => k !== 'time')" :key="key" class="px-2 py-2 text-right font-bold">{{ getTranslation(key) }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(time, index) in data.hourly.time.slice(0, 48)" :key="index" :class="['border-b', darkMode ? (index % 2 === 0 ? 'bg-slate-800 border-slate-700' : 'bg-slate-700 border-slate-700') : (index % 2 === 0 ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200')]">
                    <td class="px-2 py-2 text-left font-semibold">{{ formatTime(time) }}</td>
                    <td v-for="key in Object.keys(data.hourly).filter(k => k !== 'time')" :key="key" class="px-2 py-2 text-right">{{ formatValue(data.hourly[key][index], key) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Accordion: API Call -->
      <div :class="['mt-6 p-4 rounded-lg', darkMode ? 'bg-slate-800' : 'bg-white']">
        <div class="flex items-center cursor-pointer mb-4" @click="apiCallExpanded = !apiCallExpanded">
          <h3 class="m-0 flex-1 text-lg font-semibold">API Call</h3>
          <span :class="['text-lg transition-transform', apiCallExpanded ? 'rotate-0' : '-rotate-90']">▼</span>
        </div>
        <div v-show="apiCallExpanded" class="space-y-4">
          <div>
            <div :class="['text-xs opacity-70 mb-1', darkMode ? 'text-gray-400' : 'text-gray-600']">URL</div>
            <div :class="['text-xs break-all p-3 rounded', darkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-50 text-gray-800']">{{ apiUrl || 'Keine URL verfügbar' }}</div>
          </div>
          <div>
            <div :class="['text-xs opacity-70 mb-1', darkMode ? 'text-gray-400' : 'text-gray-600']">JSON Ergebnis</div>
            <pre :class="['text-xs p-3 rounded overflow-x-auto whitespace-pre-wrap', darkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-50 text-gray-800']">{{ formatJson(data) }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
};
