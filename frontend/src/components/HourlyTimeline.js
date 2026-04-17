export default {
  props: ["data"],
  template: `
    <div>
      <h3>Stundenübersicht</h3>
      <div style="height: 200px;">
        <canvas ref="hourChart"></canvas>
      </div>
    </div>
  `,
  methods: {
    renderChart(labels, data) {
      const ctx = this.$refs.hourChart.getContext("2d");
      if (this._chart) this._chart.destroy();
      this._chart = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "°C",
              data,
              borderColor: "#1976d2",
              backgroundColor: "rgba(25,118,210,0.1)",
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
        },
      });
    },
  },
  watch: {
    data: {
      immediate: true,
      handler(val) {
        if (!val || val.error) return;
        const hourly = val.hourly || {};
        const times = hourly.time || [];
        const temps = hourly.temperature_2m || [];
        const sliceCount = Math.min(12, temps.length);
        const labels = times
          .slice(0, sliceCount)
          .map((t) => t.split("T")[1] || t);
        const data = temps.slice(0, sliceCount);
        if (data.length) {
          this.$nextTick(() => {
            if (this.$refs.hourChart) this.renderChart(labels, data);
          });
        }
      },
    },
  },
};
