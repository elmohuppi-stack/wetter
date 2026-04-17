export default {
  props: ["data", "darkMode"],
  data() {
    return {};
  },
  template: `
    <div>
      <h3 class="mt-6 text-2xl font-bold">Temperaturverlauf</h3>
      <div class="h-36 mb-6">
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
              pointRadius: 0,
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              ticks: {
                maxTicksLimit: 7,
                callback: function (value, index) {
                  return index % 24 === 0 ? labels[index] : "";
                },
              },
              grid: {
                drawTicks: true,
                drawOnChartArea: true,
                callback: function (value) {
                  return value % 24 === 0 ? "#e0e0e0" : "";
                },
              },
            },
          },
        },
      });
    },
    formatTimeLabel(timeStr, index) {
      // Show date only when day changes (every 24 hours)
      if (index % 24 === 0) {
        const date = new Date(timeStr + "Z");
        return date.toLocaleDateString("de-DE", {
          weekday: "short",
          month: "2-digit",
          day: "2-digit",
        });
      }
      return "";
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
        // Show next 7 days = 168 hours
        const sliceCount = Math.min(168, temps.length);
        const labels = times
          .slice(0, sliceCount)
          .map((t, idx) => this.formatTimeLabel(t, idx));
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
