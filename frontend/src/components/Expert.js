export default {
  props: {
    darkMode: Boolean,
  },
  emits: ['refresh-expert-data'],
  data() {
    return {
      expertLoading: false,
      currentParameters: {
        temperature_2m: true,
        apparent_temperature: false,
        weather_code: true,
        relative_humidity_2m: false,
        wind_speed_10m: true,
        wind_gusts_10m: false,
        wind_direction_10m: false,
        pressure_msl: false,
        precipitation: true,
        cloud_cover: false,
      },
      dailyParameters: {
        weather_code: true,
        temperature_2m_max: true,
        temperature_2m_min: true,
        apparent_temperature_max: false,
        apparent_temperature_min: false,
        sunrise: true,
        sunset: true,
        daylight_duration: false,
        sunshine_duration: false,
        uv_index_max: true,
        precipitation_probability_max: false,
        precipitation_sum: false,
        rain_sum: false,
        snowfall_sum: false,
        wind_speed_10m_max: true,
        wind_gusts_10m_max: false,
        wind_direction_10m_dominant: false,
      },
      hourlyParameters: {
        temperature_2m: true,
        apparent_temperature: false,
        relative_humidity_2m: true,
        precipitation_probability: true,
        precipitation: false,
        rain: false,
        cloud_cover: true,
        wind_speed_10m: true,
        pressure_msl: false,
        visibility: false,
        weather_code: false,
      },
    };
  },
  template: `
    <div style="padding: 0">
      <h2 style="margin-top: 0; color: ${darkMode => darkMode ? '#e0e0e0' : '#333'}">Expert Parameter</h2>
      
      <!-- Current Parameters Section -->
      <div style="margin-bottom: 30px; padding: 16px; background: ${darkMode ? '#2a2a2a' : '#f5f5f5'}; border-radius: 8px">
        <h3 style="margin-top: 0; color: ${darkMode ? '#e0e0e0' : '#333'}; font-size: 16px; font-weight: 600">Aktuelle Parameter</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px">
          <label v-for="(value, key) in currentParameters" :key="'current-' + key"
            style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; color: ${darkMode ? '#e0e0e0' : '#333'}">
            <input type="checkbox" v-model="currentParameters[key]" 
              style="width: 18px; height: 18px; cursor: pointer; accentColor: #667eea" />
            <span style="font-size: 13px">{{ key }}</span>
          </label>
        </div>
      </div>

      <!-- Daily Parameters Section -->
      <div style="margin-bottom: 30px; padding: 16px; background: ${darkMode ? '#2a2a2a' : '#f5f5f5'}; border-radius: 8px">
        <h3 style="margin-top: 0; color: ${darkMode ? '#e0e0e0' : '#333'}; font-size: 16px; font-weight: 600">Tägliche Parameter</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px">
          <label v-for="(value, key) in dailyParameters" :key="'daily-' + key"
            style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; color: ${darkMode ? '#e0e0e0' : '#333'}">
            <input type="checkbox" v-model="dailyParameters[key]" 
              style="width: 18px; height: 18px; cursor: pointer; accentColor: #667eea" />
            <span style="font-size: 13px">{{ key }}</span>
          </label>
        </div>
      </div>

      <!-- Hourly Parameters Section -->
      <div style="margin-bottom: 30px; padding: 16px; background: ${darkMode ? '#2a2a2a' : '#f5f5f5'}; border-radius: 8px">
        <h3 style="margin-top: 0; color: ${darkMode ? '#e0e0e0' : '#333'}; font-size: 16px; font-weight: 600">Stündliche Parameter</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px">
          <label v-for="(value, key) in hourlyParameters" :key="'hourly-' + key"
            style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; color: ${darkMode ? '#e0e0e0' : '#333'}">
            <input type="checkbox" v-model="hourlyParameters[key]" 
              style="width: 18px; height: 18px; cursor: pointer; accentColor: #667eea" />
            <span style="font-size: 13px">{{ key }}</span>
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap">
        <button @click="handleRefresh"
          style="padding: 12px 24px; border: none; border-radius: 8px; background: linear-gradient(135deg, #667eea, #764ba2); color: #fff; font-weight: 600; cursor: pointer; font-size: 14px; transition: transform 0.2s ease, box-shadow 0.2s ease; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3)"
          @mouseenter="e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)' }"
          @mouseleave="e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)' }">
          {{ expertLoading ? 'Wird geladen...' : '[Refresh]' }}
        </button>
        <button @click="handleReset"
          style="padding: 12px 24px; border: 2px solid #667eea; border-radius: 8px; background: transparent; color: #667eea; font-weight: 600; cursor: pointer; font-size: 14px; transition: all 0.2s ease"
          @mouseenter="e => { e.target.style.background = 'rgba(102, 126, 234, 0.1)' }"
          @mouseleave="e => { e.target.style.background = 'transparent' }">
          [Reset to Default]
        </button>
      </div>

      <!-- Info Text -->
      <div style="padding: 12px; background: ${darkMode ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)'}; border-left: 4px solid #667eea; border-radius: 4px; color: ${darkMode ? '#b0b0ff' : '#667eea'}; font-size: 12px; line-height: 1.5">
        <strong>Info:</strong> Wählen Sie die Parameter aus, die Sie abrufen möchten. Klicken Sie auf [Refresh], um die Wetterdaten mit den ausgewählten Parametern zu laden.
      </div>
    </div>
  `,
  methods: {
    handleRefresh() {
      this.expertLoading = true;
      const selectedParameters = {
        current: Object.keys(this.currentParameters).filter(key => this.currentParameters[key]),
        daily: Object.keys(this.dailyParameters).filter(key => this.dailyParameters[key]),
        hourly: Object.keys(this.hourlyParameters).filter(key => this.hourlyParameters[key]),
      };
      this.$emit('refresh-expert-data', selectedParameters);
      setTimeout(() => {
        this.expertLoading = false;
      }, 1000);
    },
    handleReset() {
      this.currentParameters = {
        temperature_2m: true,
        apparent_temperature: false,
        weather_code: true,
        relative_humidity_2m: false,
        wind_speed_10m: true,
        wind_gusts_10m: false,
        wind_direction_10m: false,
        pressure_msl: false,
        precipitation: true,
        cloud_cover: false,
      };
      this.dailyParameters = {
        weather_code: true,
        temperature_2m_max: true,
        temperature_2m_min: true,
        apparent_temperature_max: false,
        apparent_temperature_min: false,
        sunrise: true,
        sunset: true,
        daylight_duration: false,
        sunshine_duration: false,
        uv_index_max: true,
        precipitation_probability_max: false,
        precipitation_sum: false,
        rain_sum: false,
        snowfall_sum: false,
        wind_speed_10m_max: true,
        wind_gusts_10m_max: false,
        wind_direction_10m_dominant: false,
      };
      this.hourlyParameters = {
        temperature_2m: true,
        apparent_temperature: false,
        relative_humidity_2m: true,
        precipitation_probability: true,
        precipitation: false,
        rain: false,
        cloud_cover: true,
        wind_speed_10m: true,
        pressure_msl: false,
        visibility: false,
        weather_code: false,
      };
    },
  },
};
