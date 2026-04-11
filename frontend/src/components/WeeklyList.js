export default {
  data() {
    return {
      days: [
        { day: "Mo", hi: 20, lo: 12, cond: "Sonnig" },
        { day: "Di", hi: 19, lo: 11, cond: "Wolkig" },
        { day: "Mi", hi: 17, lo: 10, cond: "Regen" },
      ],
    };
  },
  props: ["data"],
  computed: {
    days() {
      const d = this.data && this.data.daily;
      if (!d) return [];
      const times = d.time || [];
      const hi = d.temperature_2m_max || [];
      const lo = d.temperature_2m_min || [];
      // build array
      return times.map((t, i) => ({
        day: t,
        hi: Math.round(hi[i] || 0),
        lo: Math.round(lo[i] || 0),
      }));
    },
  },
  template: `
      <div>
        <h4>Nächste Tage</h4>
        <ul style="list-style:none;padding:0;margin:0">
          <li v-for="d in days" :key="d.day" style="padding:8px 0;border-bottom:1px solid #f2f2f2;display:flex;justify-content:space-between">
            <div>{{ d.day }}</div>
            <div>{{ d.hi }}° / {{ d.lo }}°</div>
          </li>
        </ul>
      </div>
    `,
};
