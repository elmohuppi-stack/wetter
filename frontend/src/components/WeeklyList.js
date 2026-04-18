export default {
  props: ["data"],
  computed: {
    days() {
      const d = this.data && this.data.daily;
      if (!d) return [];
      const times = d.time || [];
      const hi = d.temperature_2m_max || [];
      const lo = d.temperature_2m_min || [];
      const codes = d.weathercode || [];
      // build array
      return times.map((t, i) => ({
        day: t,
        hi: Math.round(hi[i] || 0),
        lo: Math.round(lo[i] || 0),
        code: codes[i] || 0,
      }));
    },
  },
  methods: {
    formatDate(dateStr) {
      const date = new Date(dateStr + "T00:00:00");
      return date.toLocaleDateString("de-DE", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    getWeatherIcon(code) {
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
        61: "🌧️", // Rain slight
        63: "🌧️", // Rain moderate
        65: "🌧️", // Rain heavy
        71: "❄️", // Snow slight
        73: "❄️", // Snow moderate
        75: "❄️", // Snow heavy
        80: "🌦️", // Rain showers slight
        81: "🌦️", // Rain showers moderate
        82: "🌦️", // Rain showers violent
        85: "❄️", // Snow showers slight
        86: "❄️", // Snow showers heavy
        95: "⛈️", // Thunderstorm
        96: "⛈️", // Thunderstorm with hail
        99: "⛈️", // Thunderstorm with hail
      };
      return icons[code] || "🌤️";
    },
  },
  template: `
      <div>
        <h4 class="text-lg font-semibold mb-3">Nächste Tage</h4>
        <ul class="list-none p-0 m-0">
          <li v-for="d in days" :key="d.day" class="py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <div class="text-slate-900 dark:text-gray-200">{{ formatDate(d.day) }}</div>
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ getWeatherIcon(d.code) }}</span>
              <div class="font-semibold text-slate-900 dark:text-gray-100">{{ d.hi }}° / {{ d.lo }}°</div>
            </div>
          </li>
        </ul>
      </div>
    `,
};
