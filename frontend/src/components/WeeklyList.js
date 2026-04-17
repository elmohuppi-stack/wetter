export default {
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
  },
  template: `
      <div>
        <h4 class="text-lg font-semibold mb-3">Nächste Tage</h4>
        <ul class="list-none p-0 m-0">
          <li v-for="d in days" :key="d.day" class="py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between">
            <div class="text-gray-700 dark:text-gray-300">{{ formatDate(d.day) }}</div>
            <div class="font-semibold text-gray-900 dark:text-white">{{ d.hi }}° / {{ d.lo }}°</div>
          </li>
        </ul>
      </div>
    `,
};
