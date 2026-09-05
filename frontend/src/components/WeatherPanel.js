import { weatherIcon, weatherLabel } from "../weatherCodes.js";

/*
  Die Wetterkarte im Google-Zuschnitt (4. September 2026).

  Ersetzt CurrentWeather.js, HourlyTimeline.js, WeeklyList.js und MapPreview.js.
  Aufbau von oben nach unten wie bei Google:

    Ort · Region auswählen
    Symbol  31 °C|°F   Niederschlag/Luftfeuchte/Wind      Wetter/Freitag/Sonnig
    Temperatur | Niederschlag | Wind | Wochentemperatur
    Diagramm über acht Zeitpunkte (in der Wochenansicht über alle Tage)
    08:00  11:00  14:00 …  bzw.  Fr. Sa. So. …
    Fr. Sa. So. Mo. Di. Mi. Do. Fr.   (anklickbar)

  Der Dreistundenraster ist Googles: die Zeitpunkte liegen auf 02, 05, 08, 11,
  14, 17, 20, 23 Uhr. Für heute beginnt die Reihe beim nächsten Rasterpunkt und
  läuft über Mitternacht hinaus — deshalb steht dort 08:00 … 05:00. Für jeden
  anderen Tag zeigt sie den ganzen Tag von 02:00 bis 23:00.
*/

const GRID_OFFSET = 2; // Rasterstunden sind 2, 5, 8, … — Rest 2 bei Teilung durch 3
const POINTS = 8;

/*
  Das Tagessymbol wird nicht einfach aus daily.weathercode übernommen.

  Open-Meteo bildet den Tagescode als *schlimmste Stunde des Tages* aus dem
  deterministischen Lauf, während precipitation_probability aus dem Ensemble
  kommt. Am 10. September 2026 ergab das drei Stunden Code 61 bei 4-5 %
  Wahrscheinlichkeit und 0,0 mm — und damit ein Regensymbol über einem Tag,
  dessen Balken daneben durchweg unter 10 % standen. Die Kachel behauptete
  etwas, das die Kurve daneben widerlegte.

  Deshalb: ein Niederschlagssymbol nur, wenn der Tag es auch hergibt. Sonst das
  häufigste Symbol der Tagstunden.

  Die Regenmenge taugt bewusst *nicht* als zweites Kriterium. Sie stammt aus
  demselben Lauf wie der Code und kann ihn deshalb nicht bestätigen; am
  7. September hätte sie mit 0,5 mm den Schauer bei 3 % Wahrscheinlichkeit
  gerettet. Nur die Wahrscheinlichkeit ist unabhängige Evidenz.
*/
const PRECIP_CODE = 51; // ab hier Niesel, Regen, Schnee, Schauer, Gewitter
const WET_PROBABILITY = 30; // Prozent, ab denen der Niederschlagscode zählt
const DAY_START = 6; // Tagstunden, aus denen das Ersatzsymbol kommt
const DAY_END = 20;

/*
  Chart.js bringt keine Beschriftung an den Datenpunkten mit, und für ein
  einziges Zahlenband lohnt kein weiteres Skript vom CDN. Das Plugin schreibt
  die Werte direkt über die Punkte, so wie Googles Temperaturkurve.
*/
const pointLabels = {
  id: "pointLabels",
  afterDatasetsDraw(chart) {
    const ctx = chart.ctx;
    ctx.save();
    ctx.font = '500 13px "Google Sans", Roboto, arial, sans-serif';
    ctx.textAlign = "center";
    chart.data.datasets.forEach((dataset, di) => {
      if (!dataset.pointLabel) return;
      const meta = chart.getDatasetMeta(di);
      if (!meta || !meta.data) return;
      const below = dataset.pointLabelBelow === true;
      ctx.fillStyle = dataset.pointLabelColor || dataset.borderColor;
      ctx.textBaseline = below ? "top" : "bottom";
      meta.data.forEach((point, i) => {
        const value = dataset.data[i];
        if (value === null || value === undefined) return;
        ctx.fillText(String(value), point.x, point.y + (below ? 8 : -8));
      });
    });
    ctx.restore();
  },
};

export default {
  props: ["data", "location", "isCurrent", "darkMode"],
  emits: ["open-location"],
  data() {
    return {
      metric: "temperature",
      unit: "C",
      selectedDay: 0,
      metrics: [
        { id: "temperature", label: "Temperatur" },
        { id: "precipitation", label: "Niederschlag" },
        { id: "wind", label: "Wind" },
        { id: "week", label: "Wochentemperatur" },
      ],
    };
  },
  computed: {
    ready() {
      return !!(this.data && !this.data.error && this.data.hourly && this.data.daily);
    },
    hourly() {
      return (this.ready && this.data.hourly) || {};
    },
    daily() {
      return (this.ready && this.data.daily) || {};
    },
    current() {
      return (this.data && (this.data.current || this.data.current_weather)) || {};
    },
    days() {
      const times = this.daily.time || [];
      return times.map((t, i) => ({
        date: t,
        name: this.weekdayShort(t),
        icon: weatherIcon(this.dayCode(i)),
        hi: this.temp((this.daily.temperature_2m_max || [])[i]),
        lo: this.temp((this.daily.temperature_2m_min || [])[i]),
      }));
    },
    /*
      Die Wochenansicht zeigt nicht acht Stunden, sondern alle Vorhersagetage
      mit ihrem Höchst- und Tiefstwert — zwei Kurven statt einer.
    */
    isWeek() {
      return this.metric === "week";
    },
    weekHighs() {
      return this.days.map((d) => d.hi);
    },
    weekLows() {
      return this.days.map((d) => d.lo);
    },
    /*
      Die Beschriftung der x-Achse. In der Wochenansicht sind es Wochentage, aber
      nur für das Diagramm selbst — die Zeile darunter entfällt dort, weil die
      Tageskacheln dieselben Kürzel in derselben Spaltenbreite schon tragen und
      sonst zweimal untereinander stünden.
    */
    axisLabels() {
      return this.isWeek ? this.days.map((d) => d.name) : this.hourLabels;
    },
    /* Positionen im Stundenarray, die auf dem Dreistundenraster liegen. */
    gridIndexes() {
      const times = this.hourly.time || [];
      const grid = [];
      for (let i = 0; i < times.length; i++) {
        if (this.hourOf(times[i]) % 3 === GRID_OFFSET % 3) grid.push(i);
      }
      return grid;
    },
    /* Die acht Stundenindizes, die gerade gezeigt werden. */
    slotIndexes() {
      const grid = this.gridIndexes;
      if (!grid.length) return [];
      const times = this.hourly.time || [];
      let startAt = 0;
      if (this.selectedDay === 0) {
        const now = this.current.time || times[0];
        startAt = grid.findIndex((idx) => times[idx] >= now);
        if (startAt < 0) startAt = 0;
      } else {
        const date = (this.daily.time || [])[this.selectedDay];
        startAt = grid.findIndex((idx) => times[idx].startsWith(date));
        if (startAt < 0) startAt = 0;
      }
      // Am Ende der Vorhersage reicht das Fenster nicht mehr — dann zurückrücken.
      startAt = Math.min(startAt, Math.max(0, grid.length - POINTS));
      return grid.slice(startAt, startAt + POINTS);
    },
    hourLabels() {
      const times = this.hourly.time || [];
      return this.slotIndexes.map((i) => times[i].slice(11, 16));
    },
    temperatures() {
      return this.slotIndexes.map((i) =>
        this.temp((this.hourly.temperature_2m || [])[i]),
      );
    },
    precipProbabilities() {
      return this.slotIndexes.map((i) =>
        Math.round((this.hourly.precipitation_probability || [])[i] ?? 0),
      );
    },
    winds() {
      return this.slotIndexes.map((i) => ({
        speed: Math.round((this.hourly.wind_speed_10m || [])[i] ?? 0),
        direction: Math.round((this.hourly.wind_direction_10m || [])[i] ?? 0),
      }));
    },
    /* Die Zahlen neben dem großen Symbol — heute aus Messwerten, sonst aus dem Tag. */
    headline() {
      if (!this.ready) return null;
      const i = this.selectedDay;
      if (i === 0) {
        const nowIdx = this.nearestHourIndex;
        return {
          temp: this.temp(this.current.temperature_2m ?? this.current.temperature),
          code: this.current.weather_code ?? this.current.weathercode,
          precipitation: Math.round(
            (this.hourly.precipitation_probability || [])[nowIdx] ?? 0,
          ),
          humidity: Math.round(this.current.relative_humidity_2m ?? 0),
          wind: Math.round(this.current.wind_speed_10m ?? 0),
        };
      }
      const dayIdxs = this.hourIndexesOfDay(i);
      return {
        temp: this.temp((this.daily.temperature_2m_max || [])[i]),
        code: this.dayCode(i),
        precipitation: Math.round(
          (this.daily.precipitation_probability_max || [])[i] ?? 0,
        ),
        humidity: this.meanOf(this.hourly.relative_humidity_2m, dayIdxs),
        wind: this.meanOf(this.hourly.wind_speed_10m, dayIdxs),
      };
    },
    /* Für nicht-heutige Tage sind die Werte Tagesmittel, das sagen wir auch. */
    statsPrefix() {
      return this.selectedDay === 0 ? "" : "Ø ";
    },
    nearestHourIndex() {
      const times = this.hourly.time || [];
      const now = this.current.time || times[0];
      const idx = times.findIndex((t) => t >= now);
      return idx < 0 ? 0 : idx;
    },
    weekdayLong() {
      const date = (this.daily.time || [])[this.selectedDay];
      if (!date) return "";
      return new Date(date + "T00:00:00").toLocaleDateString("de-DE", {
        weekday: "long",
      });
    },
  },
  methods: {
    hourOf(timeStr) {
      return parseInt(timeStr.slice(11, 13), 10);
    },
    hourIndexesOfDay(dayIndex) {
      const date = (this.daily.time || [])[dayIndex];
      const times = this.hourly.time || [];
      const out = [];
      for (let i = 0; i < times.length; i++) {
        if (times[i].startsWith(date)) out.push(i);
      }
      return out;
    },
    /* Das Symbol eines Tages — siehe Kommentar oben. */
    dayCode(dayIndex) {
      const code = (this.daily.weathercode || [])[dayIndex];
      if (code == null || code < PRECIP_CODE) return code;
      const probability =
        (this.daily.precipitation_probability_max || [])[dayIndex] ?? 0;
      if (probability >= WET_PROBABILITY) return code;
      return this.dominantDayCode(dayIndex, code);
    },
    /* Der häufigste trockene Code der Tagstunden, sonst der Ausgangscode. */
    dominantDayCode(dayIndex, fallback) {
      const times = this.hourly.time || [];
      const codes = this.hourly.weathercode || [];
      const date = (this.daily.time || [])[dayIndex];
      if (!date) return fallback;
      const counts = new Map();
      for (let i = 0; i < times.length; i++) {
        if (!times[i].startsWith(date)) continue;
        const hour = this.hourOf(times[i]);
        if (hour < DAY_START || hour > DAY_END) continue;
        const code = codes[i];
        if (code == null || code >= PRECIP_CODE) continue;
        counts.set(code, (counts.get(code) || 0) + 1);
      }
      let best = fallback;
      let bestCount = 0;
      for (const [code, count] of counts) {
        // Gleichstand geht an den bewölkteren Code — lieber eine Wolke zu viel
        // als eine Sonne zu viel versprochen.
        if (count > bestCount || (count === bestCount && code > best)) {
          best = code;
          bestCount = count;
        }
      }
      return best;
    },
    meanOf(series, indexes) {
      if (!series || !indexes.length) return 0;
      const values = indexes.map((i) => series[i]).filter((v) => v != null);
      if (!values.length) return 0;
      return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    },
    /* Rechnet °C in die gewählte Einheit um. Wind bleibt km/h, wie in der API. */
    temp(celsius) {
      if (celsius == null) return null;
      return Math.round(this.unit === "F" ? celsius * 1.8 + 32 : celsius);
    },
    weekdayShort(dateStr) {
      return new Date(dateStr + "T00:00:00").toLocaleDateString("de-DE", {
        weekday: "short",
      });
    },
    icon(code) {
      return weatherIcon(code);
    },
    label(code) {
      return weatherLabel(code);
    },
    setUnit(unit) {
      this.unit = unit;
      localStorage.setItem("tempUnit", unit);
    },
    renderChart() {
      if (this.metric === "wind") {
        this.destroyChart();
        return;
      }
      const canvas = this.$refs.chart;
      if (!canvas || !this.ready) return;
      this.destroyChart();

      const isWeek = this.isWeek;
      const isTemperature = this.metric === "temperature" || isWeek;
      const styles = getComputedStyle(document.body);
      const prop = (name) => styles.getPropertyValue(name).trim();
      const line = prop(isTemperature ? "--g-accent" : "--g-blue");
      const fill = prop(isTemperature ? "--g-accent-fill" : "--g-blue-fill");
      const cool = prop("--g-blue");
      const values = isTemperature ? this.temperatures : this.precipProbabilities;

      // In der Woche liegen zwei Kurven übereinander: oben die Höchst-, unten
      // die Tiefstwerte. Die Fläche dazwischen füllt die obere Kurve.
      const weekDatasets = [
        {
          data: this.weekHighs,
          borderColor: line,
          backgroundColor: fill,
          borderWidth: 2,
          fill: 1,
          pointRadius: 3,
          pointBackgroundColor: line,
          pointBorderWidth: 0,
          tension: 0.35,
          pointLabel: true,
        },
        {
          data: this.weekLows,
          borderColor: cool,
          borderWidth: 2,
          fill: false,
          pointRadius: 3,
          pointBackgroundColor: cool,
          pointBorderWidth: 0,
          tension: 0.35,
          pointLabel: true,
          pointLabelBelow: true,
        },
      ];

      this._chart = new Chart(canvas.getContext("2d"), {
        type: "line",
        data: {
          labels: this.axisLabels,
          datasets: isWeek ? weekDatasets : [
            {
              data: values,
              borderColor: line,
              backgroundColor: fill,
              borderWidth: 2,
              fill: true,
              pointRadius: 0,
              // Die Temperaturkurve ist bei Google weich, der Niederschlag
              // eine Treppe — jeder Balken gilt für seine drei Stunden.
              tension: isTemperature ? 0.4 : 0,
              stepped: isTemperature ? false : "middle",
              pointLabel: isTemperature,
              pointLabelColor: line,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          // Platz oben für die Zahlen, die das Plugin über die Punkte schreibt.
          layout: {
            padding: {
              top: isTemperature ? 26 : 2,
              // Die Tiefstwerte stehen unter ihrer Kurve und brauchen Luft.
              bottom: isWeek ? 24 : 2,
            },
          },
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
          scales: {
            x: { display: false, offset: true },
            y: {
              display: false,
              // Niederschlag immer gegen die volle Skala, sonst sehen 2 %
              // aus wie Dauerregen.
              min: isTemperature ? undefined : 0,
              max: isTemperature ? undefined : 100,
              grace: isWeek ? "18%" : isTemperature ? "25%" : undefined,
            },
          },
        },
        plugins: [pointLabels],
      });
    },
    destroyChart() {
      if (this._chart) {
        this._chart.destroy();
        this._chart = null;
      }
    },
    scheduleRender() {
      this.$nextTick(() => this.renderChart());
    },
  },
  mounted() {
    const saved = localStorage.getItem("tempUnit");
    if (saved === "F" || saved === "C") this.unit = saved;
    this.scheduleRender();
  },
  beforeUnmount() {
    this.destroyChart();
  },
  watch: {
    data: "scheduleRender",
    metric: "scheduleRender",
    selectedDay: "scheduleRender",
    unit: "scheduleRender",
    darkMode: "scheduleRender",
  },
  template: `
    <div class="g-weather" v-if="ready">
      <div class="g-loc">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="10" r="3"></circle>
          <path d="M19.4 13a8 8 0 10-14.8 0L12 21z"></path>
        </svg>
        <strong>{{ location || 'Standort' }}</strong>
        <span>·</span>
        <button @click="$emit('open-location')">Region auswählen</button>
      </div>

      <div class="g-top">
        <div class="g-top-left">
          <span class="g-bigicon">{{ icon(headline.code) }}</span>
          <span class="g-temp">{{ headline.temp }}</span>
          <span class="g-units">
            <button :class="{ 'is-active': unit === 'C' }" @click="setUnit('C')">°C</button>
            <span>|</span>
            <button :class="{ 'is-active': unit === 'F' }" @click="setUnit('F')">°F</button>
          </span>
          <div class="g-stats">
            <div>Niederschlag: {{ headline.precipitation }}%</div>
            <div>Luftfeuchte: {{ statsPrefix }}{{ headline.humidity }}%</div>
            <div>Wind: {{ statsPrefix }}{{ headline.wind }} km/h</div>
          </div>
        </div>
        <div class="g-cond">
          <div class="g-cond-title">Wetter</div>
          <div>{{ weekdayLong }}</div>
          <div>{{ label(headline.code) }}</div>
        </div>
      </div>

      <div class="g-metrics">
        <button
          v-for="m in metrics"
          :key="m.id"
          class="g-metric"
          :class="{ 'is-active': metric === m.id }"
          @click="metric = m.id"
        >{{ m.label }}</button>
      </div>

      <div v-if="metric === 'precipitation'" class="g-grid8 g-values">
        <div v-for="(p, i) in precipProbabilities" :key="i">{{ p }}%</div>
      </div>
      <div v-if="isWeek" class="g-legend">
        <span class="g-legend-hi">Höchstwert</span>
        <span class="g-legend-lo">Tiefstwert</span>
      </div>
      <div v-if="metric !== 'wind'" class="g-chartwrap" :class="{ 'is-short': metric === 'precipitation' }">
        <canvas ref="chart"></canvas>
      </div>
      <div v-else class="g-grid8 g-windrow">
        <div v-for="(w, i) in winds" :key="i">
          <div class="g-windspeed">{{ w.speed }} km/h</div>
          <svg class="g-arrow" width="26" height="26" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
               :style="{ transform: 'rotate(' + (w.direction + 180) + 'deg)' }">
            <path d="M12 20V4"></path>
            <path d="m6 10 6-6 6 6"></path>
          </svg>
        </div>
      </div>

      <div v-if="!isWeek" class="g-grid8 g-hours">
        <div v-for="(l, i) in axisLabels" :key="i">{{ l }}</div>
      </div>

      <div class="g-days">
        <button
          v-for="(d, i) in days"
          :key="d.date"
          class="g-day"
          :class="{ 'is-active': selectedDay === i }"
          @click="selectedDay = i"
        >
          <div class="g-day-name">{{ d.name }}</div>
          <div class="g-day-icon">{{ d.icon }}</div>
          <div class="g-day-temp"><span class="hi">{{ d.hi }}°</span><span class="lo">{{ d.lo }}°</span></div>
        </button>
      </div>

      <div class="g-cardfoot">
        <a href="https://open-meteo.com/" target="_blank" rel="noopener">Wetterdaten</a>
      </div>
    </div>
    <div v-else-if="data && data.error" class="g-error">{{ data.message }}</div>
  `,
};
