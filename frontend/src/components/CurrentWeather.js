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
      return this.isCurrent
        ? "Aktueller Standort"
        : this.location || "Standort";
    },
    condition() {
      return this.ready
        ? this.data.current_weather.weathercode || "—"
        : "Lade...";
    },
  },
  template: `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
      <div style="font-size:56px;font-weight:600">{{ temp }}°C</div>
      <div style="flex:1">
        <div style="font-size:18px;font-weight:600;display:flex;align-items:center;gap:8px">
          <span>{{ city }}</span>
          <svg v-if="isCurrent" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1976d2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a8 8 0 10-14.8 0L12 21z"></path></svg>
        </div>
        <div style="color:#555">{{ condition }} — gefühlt {{ feels }}°C</div>
      </div>
    </div>
  `,
};
