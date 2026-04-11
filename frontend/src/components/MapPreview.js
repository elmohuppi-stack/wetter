export default {
  props: ["data"],
  template: `
    <div style="margin-top:12px">
      <h4>Karte</h4>
      <div id="map" style="height:240px;border-radius:6px"></div>
    </div>
  `,
  mounted() {
    // wait for Leaflet global `L` from CDN
    const init = () => {
      if (!window.L) {
        setTimeout(init, 200);
        return;
      }
      this.map = L.map("map", { center: [52.52, 13.405], zoom: 10 });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.map);
      this.marker = L.marker([52.52, 13.405]).addTo(this.map);
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
      if (this.marker) this.marker.setLatLng([lat, lon]);
      else this.marker = L.marker([lat, lon]).addTo(this.map);
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
