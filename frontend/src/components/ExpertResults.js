export default {
  props: {
    data: Object,
    darkMode: Boolean,
  },
  data() {
    return {
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
  mounted() {
    if (this.data && this.data.hourly && this.$refs.hourlyChart) {
      this.renderHourlyChart();
    }
  },
  updated() {
    if (this.data && this.data.hourly && this.$refs.hourlyChart) {
      this.$nextTick(() => {
        this.renderHourlyChart();
      });
    }
  },
  methods: {
    getTranslation(key) {
      return this.parameterTranslations[key] || key;
    },
    getUnit(key) {
      return this.parameterUnits[key] || "";
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
    renderHourlyChart() {
      if (!this.data || !this.data.hourly) return;

      const hourlyData = this.data.hourly;
      if (!hourlyData.time || hourlyData.time.length === 0) return;

      const canvas = this.$refs.hourlyChart;
      if (!canvas) return;

      // Get first available metric for chart
      let chartMetric = null;
      let chartLabel = "";
      const metricKeys = Object.keys(hourlyData).filter((k) => k !== "time");

      if (metricKeys.length > 0) {
        chartMetric = metricKeys[0];
        chartLabel = this.getTranslation(chartMetric);
      } else {
        return; // No data to chart
      }

      if (this._hourlyChart) this._hourlyChart.destroy();

      this._hourlyChart = new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
          labels: hourlyData.time.map((t, i) => {
            // Show date label only once per day
            if (i % 24 === 0) {
              return this.formatDate(t);
            }
            return "";
          }),
          datasets: [
            {
              label: chartLabel,
              data: hourlyData[chartMetric],
              borderColor: "#667eea",
              backgroundColor: "rgba(102, 126, 234, 0.1)",
              fill: true,
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: { color: this.darkMode ? "#e0e0e0" : "#333" },
            },
          },
          scales: {
            x: {
              ticks: { color: this.darkMode ? "#e0e0e0" : "#333" },
              title: {
                display: true,
                text: "Zeit",
                color: this.darkMode ? "#e0e0e0" : "#333",
              },
            },
            y: {
              ticks: { color: this.darkMode ? "#e0e0e0" : "#333" },
              title: {
                display: true,
                text: chartLabel,
                color: this.darkMode ? "#e0e0e0" : "#333",
              },
            },
          },
        },
      });
    },
  },
  template: `
    <div :style="{ color: darkMode ? '#e0e0e0' : '#333' }">
      <!-- Current Data -->
      <div v-if="data && data.current" :style="{ marginBottom: '24px', padding: '16px', background: darkMode ? 'rgba(33,33,33,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: '8px' }">
        <h3 style="margin-top: 0">Aktuelle Werte</h3>
        <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }">
          <template v-for="(value, key) in data.current" :key="key">
            <div v-if="key !== 'interval'" :style="{ padding: '12px', background: darkMode ? '#222' : '#f8f9fa', borderRadius: '4px' }">
              <div :style="{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }">{{ getTranslation(key) }}</div>
              <div :style="{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }">{{ formatValue(value, key) }}<span v-if="getUnit(key) && key !== 'weather_code'" :style="{ fontSize: '13px', fontWeight: 'normal', marginLeft: '3px', opacity: 0.8 }">{{ getUnit(key) }}</span></div>
            </div>
          </template>
        </div>
      </div>

      <!-- Daily Data -->
      <div v-if="data && data.daily && data.daily.time && data.daily.time.length > 0" :style="{ marginBottom: '24px', padding: '16px', background: darkMode ? 'rgba(33,33,33,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: '8px' }">
        <h3 style="margin-top: 0">Tägliche Vorhersage</h3>
        <div :style="{ overflowX: 'auto' }">
          <table :style="{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }">
            <thead>
              <tr :style="{ borderBottom: '2px solid ' + (darkMode ? '#555' : '#ddd'), background: darkMode ? '#222' : '#f8f9fa' }">
                <th style="padding: 8px; text-align: left; font-weight: bold">Datum</th>
                <th v-for="key in Object.keys(data.daily).filter(k => k !== 'time')" :key="key" style="padding: 8px; text-align: right; font-weight: bold">{{ getTranslation(key) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(date, index) in data.daily.time" :key="index" :style="{ borderBottom: '1px solid ' + (darkMode ? '#333' : '#e0e0e0'), background: index % 2 === 0 ? (darkMode ? '#1a1a1a' : '#fff') : (darkMode ? '#222' : '#f8f9fa') }">
                <td style="padding: 8px; text-align: left">{{ formatDate(date) }}</td>
                <td v-for="key in Object.keys(data.daily).filter(k => k !== 'time')" :key="key" style="padding: 8px; text-align: right">{{ formatValue(data.daily[key][index], key) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Hourly Data Chart -->
      <div v-if="data && data.hourly && data.hourly.time && data.hourly.time.length > 0" :style="{ marginBottom: '24px', padding: '16px', background: darkMode ? 'rgba(33,33,33,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: '8px' }">
        <h3 style="margin-top: 0">Stundliche Vorhersage (7 Tage)</h3>
        <canvas ref="hourlyChart" :style="{ maxHeight: '400px' }"></canvas>
      </div>

      <!-- Hourly Data Table (first 48 hours) -->
      <div v-if="data && data.hourly && data.hourly.time && data.hourly.time.length > 0" :style="{ padding: '16px', background: darkMode ? 'rgba(33,33,33,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: '8px' }">
        <h3 style="margin-top: 0">Stundliche Details (nächste 48h)</h3>
        <div :style="{ overflowX: 'auto' }">
          <table :style="{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }">
            <thead>
              <tr :style="{ borderBottom: '2px solid ' + (darkMode ? '#555' : '#ddd'), background: darkMode ? '#222' : '#f8f9fa' }">
                <th style="padding: 8px; text-align: left; font-weight: bold">Zeit</th>
                <th v-for="key in Object.keys(data.hourly).filter(k => k !== 'time')" :key="key" style="padding: 8px; text-align: right; font-weight: bold">{{ getTranslation(key) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(time, index) in data.hourly.time.slice(0, 48)" :key="index" :style="{ borderBottom: '1px solid ' + (darkMode ? '#333' : '#e0e0e0'), background: index % 2 === 0 ? (darkMode ? '#1a1a1a' : '#fff') : (darkMode ? '#222' : '#f8f9fa') }">
                <td style="padding: 8px; text-align: left; fontWeight: 'bold'">{{ formatTime(time) }}</td>
                <td v-for="key in Object.keys(data.hourly).filter(k => k !== 'time')" :key="key" style="padding: 8px; text-align: right">{{ formatValue(data.hourly[key][index], key) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
};
