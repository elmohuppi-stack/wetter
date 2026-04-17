export default {
  props: {
    data: Object,
    darkMode: Boolean,
  },
  data() {
    return {
      currentExpanded: true,
      tableExpanded: false,
      chartTab: "hourly",
      chartType: "line",
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
  watch: {
    data: {
      handler() {
        this.initSelectedParams();
        this.$nextTick(() => this.renderChart());
      },
      deep: true,
    },
    chartTab() {
      this.$nextTick(() => this.renderChart());
    },
    chartType() {
      this.$nextTick(() => this.renderChart());
    },
    selectedDailyParams: {
      handler() {
        if (this.chartTab === "daily") {
          this.$nextTick(() => this.renderChart());
        }
      },
      deep: true,
    },
    selectedHourlyParams: {
      handler() {
        if (this.chartTab === "hourly") {
          this.$nextTick(() => this.renderChart());
        }
      },
      deep: true,
    },
  },
  mounted() {
    this.initSelectedParams();
    if (this.data && this.$refs.chart) {
      this.$nextTick(() => this.renderChart());
    }
  },
  updated() {
    if (this.data && this.$refs.chart) {
      this.$nextTick(() => {
        this.renderChart();
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

      // Daily params
      const dailyKeys = this.chartableKeys(this.data.daily);
      if (
        this.selectedDailyParams.length === 0 ||
        this.selectedDailyParams.some((k) => !dailyKeys.includes(k))
      ) {
        this.selectedDailyParams = dailyKeys.slice(0, 2);
      }

      // Hourly params
      const hourlyKeys = this.chartableKeys(this.data.hourly);
      if (
        this.selectedHourlyParams.length === 0 ||
        this.selectedHourlyParams.some((k) => !hourlyKeys.includes(k))
      ) {
        this.selectedHourlyParams = hourlyKeys.slice(0, 2);
      }
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
    renderChart() {
      const dataSource =
        this.chartTab === "daily" ? this.data?.daily : this.data?.hourly;
      if (!dataSource || !dataSource.time || dataSource.time.length === 0)
        return;

      const selectedParams =
        this.chartTab === "daily"
          ? this.selectedDailyParams
          : this.selectedHourlyParams;
      if (selectedParams.length === 0) return;

      const canvas = this.$refs.chart;
      if (!canvas) return;

      // Build datasets for each selected parameter
      const datasets = selectedParams.map((paramKey, idx) => {
        const values = dataSource[paramKey];
        const unit = this.getUnit(paramKey);
        const yAxisID = this.getYAxisID(selectedParams, paramKey);
        const chartTypeActual =
          this.chartType === "area" ? "line" : this.chartType;
        const fill = this.chartType === "area";

        return {
          label: `${this.getTranslation(paramKey)} ${unit}`.trim(),
          data: values,
          borderColor: this.chartColors[idx % this.chartColors.length],
          backgroundColor: `${this.chartColors[idx % this.chartColors.length]}20`,
          fill: fill,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4,
          yAxisID: yAxisID,
          type: chartTypeActual,
        };
      });

      const labels = dataSource.time.map((t, i) => {
        if (this.chartTab === "daily") {
          return this.formatDate(t);
        } else {
          // Show date label every 24 hours, otherwise time
          if (i % 24 === 0) {
            return this.formatDate(t);
          }
          return this.formatTime(t);
        }
      });

      // Build Y-axes configuration
      const yAxes = this.buildYAxes(selectedParams);

      if (this._chart) this._chart.destroy();

      this._chart = new Chart(canvas.getContext("2d"), {
        type: this.chartType === "bar" ? "bar" : "line",
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              display: true,
              labels: { color: this.darkMode ? "#e0e0e0" : "#333" },
            },
          },
          scales: {
            x: {
              ticks: { color: this.darkMode ? "#e0e0e0" : "#333" },
              grid: { color: this.darkMode ? "#333" : "#eee" },
            },
            ...yAxes,
          },
        },
      });
    },
    getYAxisID(selectedParams, paramKey) {
      const uniqueUnits = [
        ...new Set(selectedParams.map((k) => this.getUnit(k))),
      ];
      const paramUnit = this.getUnit(paramKey);
      const unitIndex = uniqueUnits.indexOf(paramUnit);
      return unitIndex === 0 ? "y" : unitIndex === 1 ? "y1" : "y";
    },
    buildYAxes(selectedParams) {
      const unitMap = {};
      selectedParams.forEach((param) => {
        const unit = this.getUnit(param);
        if (!unitMap[unit]) {
          unitMap[unit] = [];
        }
        unitMap[unit].push(param);
      });

      const uniqueUnits = Object.keys(unitMap);
      const axes = {};

      uniqueUnits.forEach((unit, idx) => {
        const axisID = idx === 0 ? "y" : idx === 1 ? "y1" : "y";
        axes[axisID] = {
          type: "linear",
          display: true,
          position: idx === 0 ? "left" : "right",
          ticks: { color: this.darkMode ? "#e0e0e0" : "#333" },
          grid: {
            color: this.darkMode ? "#333" : "#eee",
            drawOnChartArea: idx === 0,
          },
          title: {
            display: true,
            text: unit || "Wert",
            color: this.darkMode ? "#e0e0e0" : "#333",
          },
        };
      });

      return axes;
    },
  },
  template: `
    <div :style="{ color: darkMode ? '#e0e0e0' : '#333' }">
      <!-- Accordion: Aktuelle Werte -->
      <div :style="{ marginBottom: '24px', padding: '16px', background: darkMode ? 'rgba(33,33,33,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: '8px' }">
        <div :style="{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: currentExpanded ? '16px' : '0' }" @click="currentExpanded = !currentExpanded">
          <h3 style="margin: 0; flex: 1">Aktuelle Werte</h3>
          <span :style="{ fontSize: '18px', transform: currentExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }">▼</span>
        </div>
        <div v-show="currentExpanded">
          <div v-if="data && data.current" :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }">
            <template v-for="(value, key) in data.current" :key="key">
              <div v-if="key !== 'interval'" :style="{ padding: '12px', background: darkMode ? '#222' : '#f8f9fa', borderRadius: '4px' }">
                <div :style="{ fontSize: '12px', opacity: 0.7, marginBottom: '4px' }">{{ getTranslation(key) }}</div>
                <div :style="{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }">{{ formatValue(value, key) }}<span v-if="getUnit(key) && key !== 'weather_code'" :style="{ fontSize: '13px', fontWeight: 'normal', marginLeft: '3px', opacity: 0.8 }">{{ getUnit(key) }}</span></div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Tabs: Tägliche | Stündliche -->
      <div :style="{ marginBottom: '16px', display: 'flex', gap: '8px' }">
        <button
          :style="{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            background: chartTab === 'daily' ? '#667eea' : (darkMode ? '#333' : '#f8f9fa'),
            color: chartTab === 'daily' ? '#fff' : (darkMode ? '#e0e0e0' : '#333'),
            fontWeight: chartTab === 'daily' ? 'bold' : 'normal'
          }"
          @click="chartTab = 'daily'"
        >
          Tägliche Vorhersage
        </button>
        <button
          :style="{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            background: chartTab === 'hourly' ? '#667eea' : (darkMode ? '#333' : '#f8f9fa'),
            color: chartTab === 'hourly' ? '#fff' : (darkMode ? '#e0e0e0' : '#333'),
            fontWeight: chartTab === 'hourly' ? 'bold' : 'normal'
          }"
          @click="chartTab = 'hourly'"
        >
          Stündliche Vorhersage
        </button>
      </div>

      <!-- Parameter-Checkboxen -->
      <div :style="{ marginBottom: '16px', padding: '12px', background: darkMode ? 'rgba(33,33,33,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: '8px' }">
        <div :style="{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }">Parameter auswählen:</div>
        <div :style="{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }">
          <label v-for="param in chartableKeys(chartTab === 'daily' ? data?.daily : data?.hourly)" :key="param" :style="{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }">
            <input
              type="checkbox"
              :value="param"
              v-model="chartTab === 'daily' ? selectedDailyParams : selectedHourlyParams"
              :style="{ margin: 0 }"
            />
            <span>{{ getTranslation(param) }}</span>
          </label>
        </div>
      </div>

      <!-- Chart-Typ-Buttons -->
      <div :style="{ marginBottom: '16px', display: 'flex', gap: '8px' }">
        <button
          :style="{
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            background: chartType === 'line' ? '#667eea' : (darkMode ? '#333' : '#f8f9fa'),
            color: chartType === 'line' ? '#fff' : (darkMode ? '#e0e0e0' : '#333'),
            fontSize: '12px'
          }"
          @click="chartType = 'line'"
        >
          Linie
        </button>
        <button
          :style="{
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            background: chartType === 'area' ? '#667eea' : (darkMode ? '#333' : '#f8f9fa'),
            color: chartType === 'area' ? '#fff' : (darkMode ? '#e0e0e0' : '#333'),
            fontSize: '12px'
          }"
          @click="chartType = 'area'"
        >
          Fläche
        </button>
        <button
          :style="{
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            background: chartType === 'bar' ? '#667eea' : (darkMode ? '#333' : '#f8f9fa'),
            color: chartType === 'bar' ? '#fff' : (darkMode ? '#e0e0e0' : '#333'),
            fontSize: '12px'
          }"
          @click="chartType = 'bar'"
        >
          Balken
        </button>
      </div>

      <!-- Chart Canvas -->
      <div :style="{ marginBottom: '24px', padding: '16px', background: darkMode ? 'rgba(33,33,33,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: '8px' }">
        <div v-if="(chartTab === 'daily' ? selectedDailyParams : selectedHourlyParams).length === 0" :style="{ textAlign: 'center', padding: '40px', color: darkMode ? '#666' : '#999' }">
          Wähle mindestens einen Parameter aus, um die Grafik anzuzeigen.
        </div>
        <canvas v-else ref="chart" :style="{ maxHeight: '400px' }"></canvas>
      </div>

      <!-- Accordion: Detail-Tabelle -->
      <div :style="{ padding: '16px', background: darkMode ? 'rgba(33,33,33,0.9)' : 'rgba(255,255,255,0.9)', borderRadius: '8px' }">
        <div :style="{ display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: tableExpanded ? '16px' : '0' }" @click="tableExpanded = !tableExpanded">
          <h3 style="margin: 0; flex: 1">Detail-Tabelle</h3>
          <span :style="{ fontSize: '18px', transform: tableExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }">▼</span>
        </div>
        <div v-show="tableExpanded">
          <!-- Tägliche Tabelle -->
          <div v-if="chartTab === 'daily' && data && data.daily && data.daily.time && data.daily.time.length > 0">
            <h4 style="margin-top: 0">Tägliche Vorhersage</h4>
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

          <!-- Stündliche Tabelle (48h) -->
          <div v-if="chartTab === 'hourly' && data && data.hourly && data.hourly.time && data.hourly.time.length > 0">
            <h4 style="margin-top: 0">Stündliche Details (nächste 48h)</h4>
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
      </div>
    </div>
  `,
};
