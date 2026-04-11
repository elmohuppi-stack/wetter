import CurrentWeather from "./components/CurrentWeather.js";
import HourlyTimeline from "./components/HourlyTimeline.js";
import WeeklyList from "./components/WeeklyList.js";
import MapPreview from "./components/MapPreview.js";

export default {
  components: { CurrentWeather, HourlyTimeline, WeeklyList, MapPreview },
  data() {
    return {
      weatherData: null,
      loading: true,
      locationName: "",
      isCurrentLocation: false,
    };
  },
  template: `
    <div>
      <div style="margin-bottom:12px;display:flex;gap:8px;align-items:center">
        <input v-model="locationName" placeholder="Ort (z.B. Berlin)" style="flex:1;padding:8px;border:1px solid #ddd;border-radius:6px" />
        <button @click="searchLocation" style="padding:8px 10px;border-radius:6px;border:1px solid #1976d2;background:#1976d2;color:#fff">Suchen</button>
        <button @click="useGeolocation" title="Aktuellen Standort verwenden" style="border:0;background:transparent;padding:6px;cursor:pointer">
          <!-- simple location icon -->
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1976d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a8 8 0 10-14.8 0L12 21z"></path></svg>
        </button>
      </div>

      <div class="row">
        <section class="card large">
          <CurrentWeather :data="weatherData" :is-current="isCurrentLocation" :location="locationName" />
          <HourlyTimeline :data="weatherData" />
        </section>
        <aside class="card side">
          <WeeklyList :data="weatherData" />
          <MapPreview :data="weatherData" />
        </aside>
      </div>
      <div v-if="loading" style="text-align:center;color:#666;margin-top:12px">Lade Wetterdaten…</div>
    </div>
  `,
  methods: {
    fetchWeather(lat, lon, markAsCurrent = false) {
      this.loading = true;
      this.isCurrentLocation = !!markAsCurrent;
      fetch(
        `/backend/proxy.php?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`,
      )
        .then((r) => r.json())
        .then((json) => {
          this.weatherData = json;
        })
        .catch((e) => {
          console.error("Fetch weather failed", e);
          this.weatherData = {
            error: true,
            message: "Daten konnten nicht geladen werden",
          };
        })
        .finally(() => (this.loading = false));
    },
    searchLocation() {
      const q = (this.locationName || "").trim();
      if (!q) {
        alert("Bitte einen Ort eingeben.");
        return;
      }
      // Use Nominatim for geocoding (OpenStreetMap)
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`;
      fetch(url, { headers: { "Accept-Language": "de" } })
        .then((r) => r.json())
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
        .then((r) => r.json())
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
        .catch((e) => console.error("Reverse geocode error", e));
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
  },
  mounted() {
    // initial fetch from default location (Wörth am Rhein)
    this.fetchWeather(49.05, 8.2667, false);
    this.reverseGeocode(49.05, 8.2667);
  },
};
