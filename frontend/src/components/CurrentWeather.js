export default {
  props: ["data", "isCurrent", "location", "darkMode"],
  data() {
    return {
      parameterTranslations: {
        temperature_2m: "Temperatur (2m)",
        apparent_temperature: "Gefühlte Temp.",
        relative_humidity_2m: "Luftfeuchte (2m)",
        wind_speed_10m: "Windgeschwindigkeit",
        wind_gusts_10m: "Windböen",
        wind_direction_10m: "Windrichtung",
        pressure_msl: "Luftdruck (MSL)",
        precipitation: "Niederschlag",
        cloud_cover: "Bewölkung",
      },
      parameterUnits: {
        temperature_2m: "°C",
        apparent_temperature: "°C",
        relative_humidity_2m: "%",
        wind_speed_10m: "km/h",
        wind_gusts_10m: "km/h",
        wind_direction_10m: "°",
        pressure_msl: "hPa",
        precipitation: "mm",
        cloud_cover: "%",
      },
    };
  },
  computed: {
    ready() {
      return (
        this.data &&
        !this.data.error &&
        (this.data.current || this.data.current_weather)
      );
    },
    currentData() {
      return this.data && (this.data.current || this.data.current_weather);
    },
    temp() {
      const d = this.currentData;
      return d ? Math.round(d.temperature_2m ?? d.temperature) : "--";
    },
    feels() {
      const d = this.currentData;
      return d && d.apparent_temperature != null
        ? Math.round(d.apparent_temperature)
        : "--";
    },
    city() {
      return this.location || "Standort";
    },
    condition() {
      if (!this.ready) return "Lade...";
      const code =
        this.currentData.weather_code ?? this.currentData.weathercode;
      const icons = {
        0: "☀️", // Clear sky
        1: "🌤️", // Mainly clear
        2: "⛅", // Partly cloudy
        3: "☁️", // Overcast
        45: "🌫️", // Fog
        48: "🌫️", // Depositing rime fog
        51: "🌦️", // Drizzle light
        53: "🌦️", // Drizzle moderate
        55: "🌦️", // Drizzle dense
        56: "🌨️", // Freezing drizzle light
        57: "🌨️", // Freezing drizzle dense
        61: "🌧️", // Rain slight
        63: "🌧️", // Rain moderate
        65: "🌧️", // Rain heavy
        66: "🌨️", // Freezing rain light
        67: "🌨️", // Freezing rain heavy
        71: "❄️", // Snow slight
        73: "❄️", // Snow moderate
        75: "❄️", // Snow heavy
        77: "❄️", // Snow grains
        80: "🌦️", // Rain showers slight
        81: "🌦️", // Rain showers moderate
        82: "🌦️", // Rain showers violent
        85: "❄️", // Snow showers slight
        86: "❄️", // Snow showers heavy
        95: "⛈️", // Thunderstorm slight/moderate
        96: "⛈️", // Thunderstorm with hail slight
        99: "⛈️", // Thunderstorm with hail heavy
      };
      return icons[code] || "🌤️";
    },
  },
  methods: {
    getTranslation(key) {
      return this.parameterTranslations[key] || key;
    },
    getUnit(key) {
      return this.parameterUnits[key] || "";
    },
    formatValue(value, key) {
      if (value === null || value === undefined) return "-";
      if (typeof value === "number") {
        return value.toFixed(2);
      }
      return value;
    },
    formatTime(timeStr) {
      if (!timeStr) return "";
      const date = new Date(timeStr);
      return date.toLocaleString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  template: `
    <div>
      <!-- Measurement Time -->
      <div v-if="data && data.current && data.current.time" class="text-xs text-gray-400 mb-2">Messzeitpunkt: {{ formatTime(data.current.time) }}</div>
      
      <!-- Main Temperature Box -->
      <div class="flex items-center gap-4 mb-3 p-3 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900 dark:to-violet-900 rounded-lg">
        <div class="text-6xl font-bold text-gray-900 dark:text-white">{{ temp }}°C</div>
        <div class="flex-1">
          <div class="text-xl font-semibold flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
            <span>{{ city }}</span>
            <svg v-if="isCurrent" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a8 8 0 10-14.8 0L12 21z"></path></svg>
          </div>
          <div class="text-gray-600 dark:text-gray-400">{{ condition }} — gefühlt {{ feels }}°C</div>
        </div>
      </div>

      <!-- Current Values Grid -->
      <div v-if="data && data.current" class="grid grid-cols-5 gap-2">
        <template v-for="key in Object.keys(parameterTranslations)" :key="key">
          <div v-if="data.current[key] !== undefined" class="p-2 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 rounded text-center">
            <div class="text-xs text-gray-600 dark:text-gray-400 mb-1 leading-tight">{{ getTranslation(key) }}</div>
            <div class="text-sm font-bold text-blue-600 dark:text-blue-400">{{ formatValue(data.current[key], key) }}<span v-if="getUnit(key)" class="text-xs font-normal ml-0.5 opacity-80">{{ getUnit(key) }}</span></div>
          </div>
        </template>
      </div>
    </div>
  `,
};
