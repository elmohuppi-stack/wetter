export default {
  props: {
    darkMode: Boolean,
    isLoading: Boolean,
    location: String,
  },
  emits: ["refresh-expert-data"],
  data() {
    return {
      expandedCurrent: false,
      expandedDaily: false,
      expandedHourly: false,
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
      expandedCurrent: false,
      expandedDaily: false,
      expandedHourly: false,
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
  mounted() {
    this.handleRefresh();
  },
  methods: {
    getTranslation(key) {
      return this.parameterTranslations[key] || key;
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
      this.expandedCurrent = false;
      this.expandedDaily = false;
      this.expandedHourly = false;
      this.$emit("refresh-expert-data", selectedParameters);
    },
  },
  template: `
    <div style="padding: 0">
      <!-- Header and Info Row -->
      <div style="display: flex; gap: 20px; align-items: flex-start; margin-bottom: 24px">
        <h2 class="mt-6 text-2xl font-bold" :style="{ marginBottom: '0', color: darkMode ? '#e0e0e0' : '#333', whiteSpace: 'nowrap' }">Open Meteo Forecast API Daten{{ location ? ' für ' + location : '' }}</h2>
        <!-- Action Buttons -->
        <div style="display: flex; flex-direction: row; gap: 8px; align-self: flex-start; flex-shrink: 0; margin-left: auto; margin-top: 16px">
          <button @click="handleRefresh" :disabled="isLoading"
            style="padding: 8px 12px; border: none; border-radius: 8px; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-weight: 600; cursor: pointer; font-size: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); white-space: nowrap"
            @mouseenter="e => { if (!isLoading) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)' } }"
            @mouseleave="e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)' }">
            {{ isLoading ? 'Lädt...' : 'Start' }}
          </button>
        </div>
      </div>
      
      <!-- Accordions Row -->
      <div style="display: flex; gap: 16px">
        <!-- Accordions Container (3 columns, responsive) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; flex: 1; minWidth: 0">
          <!-- Current Parameters Accordion -->
          <div style="border-radius: 8px; overflow: hidden" :style="{ background: darkMode ? '#2a2a2a' : '#f5f5f5' }">
            <div @click="expandedCurrent = !expandedCurrent" :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', padding: '16px', borderRadius: expandedCurrent ? '8px 8px 0 0' : '8px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))', border: '1px solid rgba(102, 126, 234, 0.2)', transition: 'all 0.2s ease', color: darkMode ? '#e0e0e0' : '#333' }">
              <span style="font-weight: 600; font-size: 16px">📊 {{ getTranslation('current') }} ({{ Object.values(currentParameters).filter(v => v).length }})</span>
              <span style="font-size: 20px; transition: transform 0.3s ease" :style="{ transform: expandedCurrent ? 'rotateZ(180deg)' : 'rotateZ(0deg)' }">▼</span>
            </div>
            <div v-if="expandedCurrent" :style="{ background: darkMode ? '#1a1a1a' : '#fff', borderTop: '1px solid ' + (darkMode ? '#555' : '#e0e0e0'), display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', maxHeight: '400px', overflowY: 'auto' }">
              <label v-for="(value, key) in currentParameters" :key="'current-' + key" :style="{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', color: darkMode ? '#e0e0e0' : '#333', fontSize: '12px' }">
                <input type="checkbox" v-model="currentParameters[key]" style="width: 16px; height: 16px; cursor: pointer; accentColor: #667eea; flexShrink: 0" />
                <span>{{ getTranslation(key) }}</span>
              </label>
            </div>
          </div>

          <!-- Daily Parameters Accordion -->
          <div style="border-radius: 8px; overflow: hidden" :style="{ background: darkMode ? '#2a2a2a' : '#f5f5f5' }">
            <div @click="expandedDaily = !expandedDaily" :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', padding: '16px', borderRadius: expandedDaily ? '8px 8px 0 0' : '8px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))', border: '1px solid rgba(102, 126, 234, 0.2)', transition: 'all 0.2s ease', color: darkMode ? '#e0e0e0' : '#333' }">
              <span style="font-weight: 600; font-size: 16px">📅 {{ getTranslation('daily') }} ({{ Object.values(dailyParameters).filter(v => v).length }})</span>
              <span style="font-size: 20px; transition: transform 0.3s ease" :style="{ transform: expandedDaily ? 'rotateZ(180deg)' : 'rotateZ(0deg)' }">▼</span>
            </div>
            <div v-if="expandedDaily" :style="{ background: darkMode ? '#1a1a1a' : '#fff', borderTop: '1px solid ' + (darkMode ? '#555' : '#e0e0e0'), display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', maxHeight: '400px', overflowY: 'auto' }">
              <label v-for="(value, key) in dailyParameters" :key="'daily-' + key" :style="{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', color: darkMode ? '#e0e0e0' : '#333', fontSize: '12px' }">
                <input type="checkbox" v-model="dailyParameters[key]" style="width: 16px; height: 16px; cursor: pointer; accentColor: #667eea; flexShrink: 0" />
                <span>{{ getTranslation(key) }}</span>
              </label>
            </div>
          </div>

          <!-- Hourly Parameters Accordion -->
          <div style="border-radius: 8px; overflow: hidden" :style="{ background: darkMode ? '#2a2a2a' : '#f5f5f5' }">
            <div @click="expandedHourly = !expandedHourly" :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none', padding: '16px', borderRadius: expandedHourly ? '8px 8px 0 0' : '8px', background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))', border: '1px solid rgba(102, 126, 234, 0.2)', transition: 'all 0.2s ease', color: darkMode ? '#e0e0e0' : '#333' }">
              <span style="font-weight: 600; font-size: 16px">⏰ {{ getTranslation('hourly') }} ({{ Object.values(hourlyParameters).filter(v => v).length }})</span>
              <span style="font-size: 20px; transition: transform 0.3s ease" :style="{ transform: expandedHourly ? 'rotateZ(180deg)' : 'rotateZ(0deg)' }">▼</span>
            </div>
            <div v-if="expandedHourly" :style="{ background: darkMode ? '#1a1a1a' : '#fff', borderTop: '1px solid ' + (darkMode ? '#555' : '#e0e0e0'), display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', maxHeight: '400px', overflowY: 'auto' }">
              <label v-for="(value, key) in hourlyParameters" :key="'hourly-' + key" :style="{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', color: darkMode ? '#e0e0e0' : '#333', fontSize: '12px' }">
                <input type="checkbox" v-model="hourlyParameters[key]" style="width: 16px; height: 16px; cursor: pointer; accentColor: #667eea; flexShrink: 0" />
                <span>{{ getTranslation(key) }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
};
