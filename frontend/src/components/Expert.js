export default {
  props: {
    darkMode: Boolean,
    isLoading: Boolean,
    location: String,
  },
  emits: ["refresh-expert-data"],
  data() {
    return {
      expanded: { current: false, daily: false, hourly: false },
      parameterTranslations: {
        current: "Aktuelle",
        daily: "Tägliche",
        hourly: "Stündliche",
        temperature_2m: "Temperatur (2m)",
        apparent_temperature: "Gefühlte Temperatur",
        weather_code: "Wetterkode",
        relative_humidity_2m: "Relative Luftfeuchte (2m)",
        wind_speed_10m: "Windgeschwindigkeit (10m)",
        wind_gusts_10m: "Windböen (10m)",
        wind_direction_10m: "Windrichtung (10m)",
        pressure_msl: "Luftdruck (MSL)",
        precipitation: "Niederschlag",
        cloud_cover: "Bewölkung",
        temperature_2m_max: "Max. Temperatur",
        temperature_2m_min: "Min. Temperatur",
        apparent_temperature_max: "Max. Gefühlte Temperatur",
        apparent_temperature_min: "Min. Gefühlte Temperatur",
        sunrise: "Sonnenaufgang",
        sunset: "Sonnenuntergang",
        daylight_duration: "Tageslicht-Dauer",
        sunshine_duration: "Sonnenschein-Dauer",
        uv_index_max: "Max. UV-Index",
        precipitation_probability_max: "Max. Niederschlagswahrscheinlichkeit",
        precipitation_sum: "Gesamtniederschlag",
        rain_sum: "Gesamtregen",
        snowfall_sum: "Gesamtschneefall",
        wind_speed_10m_max: "Max. Windgeschwindigkeit",
        wind_gusts_10m_max: "Max. Windböen",
        wind_direction_10m_dominant: "Dominante Windrichtung",
        precipitation_probability: "Niederschlagswahrscheinlichkeit",
        rain: "Regen",
        visibility: "Sichtweite",
      },
      currentParameters: {
        temperature_2m: true,
        apparent_temperature: true,
        weather_code: true,
        relative_humidity_2m: true,
        wind_speed_10m: true,
        wind_gusts_10m: true,
        wind_direction_10m: true,
        pressure_msl: true,
        precipitation: true,
        cloud_cover: true,
      },
      dailyParameters: {
        weather_code: true,
        temperature_2m_max: true,
        temperature_2m_min: true,
        apparent_temperature_max: true,
        apparent_temperature_min: true,
        sunrise: true,
        sunset: true,
        daylight_duration: true,
        sunshine_duration: true,
        uv_index_max: true,
        precipitation_probability_max: true,
        precipitation_sum: true,
        rain_sum: true,
        snowfall_sum: true,
        wind_speed_10m_max: true,
        wind_gusts_10m_max: true,
        wind_direction_10m_dominant: true,
      },
      hourlyParameters: {
        temperature_2m: true,
        apparent_temperature: true,
        relative_humidity_2m: true,
        precipitation_probability: true,
        precipitation: true,
        rain: true,
        cloud_cover: true,
        wind_speed_10m: true,
        pressure_msl: true,
        visibility: true,
        weather_code: true,
      },
    };
  },
  computed: {
    // Die drei Blöcke unterscheiden sich nur in ihrer Parameterliste — einmal
    // beschrieben statt dreimal kopiert wie vorher.
    groups() {
      return [
        { key: "current", model: this.currentParameters },
        { key: "daily", model: this.dailyParameters },
        { key: "hourly", model: this.hourlyParameters },
      ];
    },
  },
  mounted() {
    this.handleRefresh();
  },
  methods: {
    getTranslation(key) {
      return this.parameterTranslations[key] || key;
    },
    toggle(key) {
      this.expanded[key] = !this.expanded[key];
    },
    countSelected(model) {
      return Object.values(model).filter(Boolean).length;
    },
    handleRefresh() {
      const selectedParameters = {
        current: Object.keys(this.currentParameters).filter(
          (key) => this.currentParameters[key],
        ),
        daily: Object.keys(this.dailyParameters).filter(
          (key) => this.dailyParameters[key],
        ),
        hourly: Object.keys(this.hourlyParameters).filter(
          (key) => this.hourlyParameters[key],
        ),
      };
      this.expanded = { current: false, daily: false, hourly: false };
      this.$emit("refresh-expert-data", selectedParameters);
    },
  },
  template: `
    <div>
      <div style="display:flex;align-items:baseline;gap:16px;flex-wrap:wrap">
        <h3 class="g-h">Open-Meteo Forecast API{{ location ? ' — ' + location : '' }}</h3>
        <button class="g-btn g-btn-primary" style="margin-left:auto" @click="handleRefresh" :disabled="isLoading">
          {{ isLoading ? 'Lädt…' : 'Abfragen' }}
        </button>
      </div>
      <p class="g-sub">Parameter auswählen und die Rohantwort der API ansehen.</p>

      <div class="g-accs">
        <div class="g-acc" v-for="group in groups" :key="group.key">
          <button class="g-acc-head" @click="toggle(group.key)">
            <span>{{ getTranslation(group.key) }} ({{ countSelected(group.model) }})</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                 stroke-linecap="round" stroke-linejoin="round"
                 :style="{ transform: expanded[group.key] ? 'rotate(180deg)' : 'none' }">
              <path d="m6 9 6 6 6-6"></path>
            </svg>
          </button>
          <div v-if="expanded[group.key]" class="g-acc-body">
            <label v-for="(value, key) in group.model" :key="group.key + '-' + key" class="g-check">
              <input type="checkbox" v-model="group.model[key]" />
              <span>{{ getTranslation(key) }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
};
