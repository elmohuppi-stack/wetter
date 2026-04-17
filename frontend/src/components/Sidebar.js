export default {
  props: {
    currentTab: String,
    darkMode: Boolean,
  },
  emits: ["tab-change"],
  data() {
    return {
      tabs: [
        { id: "forecast", label: "Forecast", icon: "📊" },
        { id: "historical", label: "Historical", icon: "📈" },
        { id: "seasonal", label: "Seasonal", icon: "🌡️" },
        { id: "climate", label: "Climate", icon: "🌍" },
        { id: "dashboard", label: "Dashboard", icon: "📱" },
        { id: "expert", label: "Expert", icon: "👨‍🔬" },
      ],
    };
  },
  template: `
    <aside :style="{
      width: '125px',
      background: darkMode ? '#222' : '#f8f9fa',
      borderRight: '1px solid ' + (darkMode ? '#444' : '#e1e5e9'),
      padding: '0',
      minHeight: '100vh',
      position: 'fixed',
      left: '0',
      top: '60px',
      overflowY: 'auto',
      fontSize: '13px',
      transition: 'background 0.3s ease, color 0.3s ease',
      color: darkMode ? '#e0e0e0' : '#333',
    }">
      <nav style="padding: 20px 0">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="$emit('tab-change', tab.id)"
          :style="{
            width: '100%',
            padding: '10px 8px',
            border: 'none',
            background: currentTab === tab.id
              ? (darkMode ? '#667eea' : '#667eea')
              : 'transparent',
            color: currentTab === tab.id ? '#fff' : (darkMode ? '#e0e0e0' : '#333'),
            textAlign: 'center',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: currentTab === tab.id ? '600' : '500',
            transition: 'background 0.2s ease, color 0.2s ease',
            borderLeft: currentTab === tab.id ? '3px solid #764ba2' : 'none',
            paddingLeft: currentTab === tab.id ? '5px' : '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }"
          @mouseenter="e => {
            if (currentTab !== tab.id) {
              e.target.style.background = darkMode ? '#333' : '#f0f1f3';
            }
          }"
          @mouseleave="e => {
            if (currentTab !== tab.id) {
              e.target.style.background = 'transparent';
            }
          }"
        >
          <span style="display: none">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </button>
      </nav>
    </aside>
  `,
};
