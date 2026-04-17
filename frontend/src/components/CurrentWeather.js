export default {
  props: ["data", "isCurrent", "location"],
  computed: {
    ready() {
      return this.data && !this.data.error && this.data.current_weather;
    },
    temp() {
      return this.ready
        ? Math.round(this.data.current_weather.temperature)
        : "--";
    },
    feels() {
      return this.ready && this.data.current_weather.apparent_temperature
        ? Math.round(this.data.current_weather.apparent_temperature)
        : "--";
    },
    city() {
      return this.location || "Standort";
    },
    condition() {
      if (!this.ready) return "Lade...";
      const code = this.data.current_weather.weathercode;
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
  template: `
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;padding:20px;background:linear-gradient(135deg,rgba(102,126,234,0.1),rgba(118,75,162,0.1));border-radius:12px">
      <div style="font-size:64px;font-weight:700;color:#333">{{ temp }}°C</div>
      <div style="flex:1">
        <div style="font-size:20px;font-weight:600;display:flex;align-items:center;gap:10px;color:#555;margin-bottom:4px">
          <span>{{ city }}</span>
          <svg v-if="isCurrent" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a8 8 0 10-14.8 0L12 21z"></path></svg>
        </div>
        <div style="color:#777;font-size:16px">{{ condition }} — gefühlt {{ feels }}°C</div>
      </div>
    </div>
  `,
};
