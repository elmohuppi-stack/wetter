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
      currentTime: new Date(),
      timeInterval: null,
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
    maxTemp() {
      if (!this.data || !this.data.daily) return "--";
      const temps = this.data.daily.temperature_2m_max || [];
      return temps.length > 0 ? Math.round(temps[0]) : "--";
    },
    minTemp() {
      if (!this.data || !this.data.daily) return "--";
      const temps = this.data.daily.temperature_2m_min || [];
      return temps.length > 0 ? Math.round(temps[0]) : "--";
    },
    feels() {
      const d = this.currentData;
      return d && d.apparent_temperature != null
        ? Math.round(d.apparent_temperature)
        : "--";
    },
    windSpeed() {
      const d = this.currentData;
      return d && d.wind_speed_10m != null
        ? Math.round(d.wind_speed_10m)
        : "--";
    },
    windDirection() {
      const d = this.currentData;
      return d && d.wind_direction_10m != null
        ? Math.round(d.wind_direction_10m)
        : "--";
    },
    windDirectionLabel() {
      const angle = this.currentData?.wind_direction_10m;
      if (!angle && angle !== 0) return "";
      const directions = ["N", "NO", "O", "SO", "S", "SW", "W", "NW"];
      return directions[Math.round(angle / 45) % 8];
    },
    precipitation() {
      const d = this.currentData;
      return d && d.precipitation != null
        ? Math.round(d.precipitation * 10) / 10
        : "--";
    },
    precipitationProbability() {
      const d = this.currentData;
      if (d && d.precipitation_probability != null) {
        return Math.round(d.precipitation_probability);
      }
      // Fallback: Versuche aus hourly Daten zu ermitteln
      if (
        this.data &&
        this.data.hourly &&
        this.data.hourly.precipitation_probability
      ) {
        const probs = this.data.hourly.precipitation_probability;
        return probs.length > 0 ? Math.round(probs[0]) : "0";
      }
      return "0";
    },
    weatherDescription() {
      const code =
        this.currentData?.weather_code ?? this.currentData?.weathercode;
      const descriptions = {
        0: "Klarer Himmel",
        1: "Überwiegend klar",
        2: "Teilweise bewölkt",
        3: "Bedeckt",
        45: "Neblig",
        48: "Neblig mit Reifansatz",
        51: "Leichter Nieselregen",
        53: "Mäßiger Nieselregen",
        55: "Dichter Nieselregen",
        61: "Leichter Regen",
        63: "Mäßiger Regen",
        65: "Starker Regen",
        71: "Leichter Schneefall",
        73: "Mäßiger Schneefall",
        75: "Starker Schneefall",
        80: "Leichte Regenschauer",
        81: "Mäßige Regenschauer",
        82: "Kräftige Regenschauer",
        85: "Leichte Schneeschauer",
        86: "Kräftige Schneeschauer",
        95: "Gewitter",
        96: "Gewitter mit Hagel",
        99: "Gewitter mit Hagel",
      };
      return descriptions[code] || "Wetter";
    },
    city() {
      return this.location || "Standort";
    },
    condition() {
      if (!this.ready) return "🌤️";
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
    formatTimeOnly(timeStr) {
      if (!timeStr) return "";
      const date = new Date(timeStr);
      return date.toLocaleString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
    formatCurrentTime() {
      return this.currentTime.toLocaleString("de-DE", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
  },
  mounted() {
    this.currentTime = new Date();
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  },
  template: `
    <div>
      <!-- Main Temperature Box -->
      <div class="flex items-center gap-4 mb-3 p-3 rounded-lg" :style="{ background: darkMode ? 'linear-gradient(135deg, #581c87, #2e1065)' : 'linear-gradient(135deg, #d8b4fe, #c4b5fd)' }">
        <div :class="['text-6xl font-bold', darkMode ? 'text-white' : 'text-gray-900']">{{ temp }}°C</div>
        <div class="flex-1">
          <div :class="['text-xl font-semibold flex items-center justify-between mb-1 w-full', darkMode ? 'text-white' : 'text-gray-700']">
            <div class="flex items-center gap-2">
              <span>{{ city }}</span>
              <svg v-if="isCurrent" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a8 8 0 10-14.8 0L12 21z"></path></svg>
            </div>
            <span v-if="data && data.current && data.current.time" class="text-xl" style="font-family: monospace; font-variant-numeric: tabular-nums; min-width: 4rem; display: inline-block;">{{ formatCurrentTime() }}</span>
          </div>
          <div :class="[darkMode ? 'text-gray-300' : 'text-gray-600']">{{ condition }} {{ maxTemp }}° / {{ minTemp }}° - gefühlt {{ feels }}°C</div>
        </div>
      </div>

      <!-- Measurement Time -->
      <div v-if="data && data.current && data.current.time" class="text-xs text-gray-400 dark:text-gray-500 mb-4">Messzeitpunkt: {{ formatTime(data.current.time) }}</div>
      
      <!-- Weather Details -->
      <div v-if="ready" class="space-y-2 mb-4">
        <div class="text-gray-500 dark:text-gray-500">
          <span class="font-medium">Wetter:</span> {{ weatherDescription }}
        </div>
        <div class="text-gray-500 dark:text-gray-500">
          <span class="font-medium">Wind:</span> {{ windSpeed }} km/h {{ windDirectionLabel }}
        </div>
        <div class="text-gray-500 dark:text-gray-500">
          <span class="font-medium">Regenwahrscheinlichkeit:</span> {{ precipitationProbability }}%
        </div>
      </div>
    </div>
  `,
};
