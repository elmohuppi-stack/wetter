export default {
  props: ["data"],
  computed: {
    weatherIcon() {
      if (!this.data || !this.data.current_weather) return "🌤️"; // default
      const code = this.data.current_weather.weathercode;
      // Map Open-Meteo weathercodes to icons
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
    <div class="mt-3">
      <h4 class="text-lg font-semibold mb-3">Karte</h4>
      <div id="map" class="h-60 rounded-lg"></div>
    </div>
  `,
  mounted() {
    // wait for Leaflet global `L` from CDN
    const init = () => {
      if (!window.L) {
        setTimeout(init, 1000);
        return;
      }
      this.map = L.map("map", {
        center: [52.52, 13.405],
        zoom: 10,
        dragging: false,
        scrollWheelZoom: false,
        touchZoom: false,
        doubleClickZoom: false,
        zoomControl: false,
      });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);
      this.marker = L.marker([52.52, 13.405]).addTo(this.map);
      this.map.invalidateSize();
      if (this.data && this.data.latitude && this.data.longitude)
        this.updateFromData(this.data);
    };
    init();
  },
  methods: {
    updateFromData(d) {
      const lat = parseFloat(d.latitude);
      const lon = parseFloat(d.longitude);
      if (isNaN(lat) || isNaN(lon)) return;
      this.map.setView([lat, lon], 10);
      this.map.invalidateSize();
      if (this.marker) this.map.removeLayer(this.marker);
      try {
        const icon = L.divIcon({
          html: this.weatherIcon,
          className: "weather-marker-icon",
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });
        this.marker = L.marker([lat, lon], { icon }).addTo(this.map);
      } catch (e) {
        console.error("Icon error", e);
        this.marker = L.marker([lat, lon]).addTo(this.map);
      }
      // Add popup with temperature
      const temp = d.current_weather
        ? Math.round(d.current_weather.temperature) + "°C"
        : "";
      this.marker
        .bindPopup(`<b>${temp}</b><br>${this.weatherIcon}`)
        .openPopup();
    },
  },
  watch: {
    data: {
      immediate: true,
      handler(val) {
        if (val && !val.error && val.latitude && val.longitude && this.map)
          this.updateFromData(val);
      },
    },
  },
};
