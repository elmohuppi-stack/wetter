export default {
  props: {
    darkMode: Boolean,
    location: String,
  },
  emits: ["toggle-dark-mode"],
  template: `
    <header :style="{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      padding: '12px 24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      zIndex: '1000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '60px',
      boxSizing: 'border-box',
    }">
      <div style="display: flex; alignItems: 'center'; gap: '12px'; flex: 1">
        <div style="fontSize: '28px'; fontWeight: 'bold'">🌤️</div>
        <h1 style="margin: 0; fontSize: '1.3rem'; fontWeight: '600'; letterSpacing: '-0.01em'">
          {{ location ? 'Wetter in ' + location : 'Wetter' }}
        </h1>
      </div>
      
      <button
        @click="$emit('toggle-dark-mode')"
        title="Dark Mode umschalten"
        :style="{
          padding: '8px 12px',
          borderRadius: '8px',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.2)',
          color: '#fff',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
        }"
        @mouseenter="e => e.target.style.background = 'rgba(255, 255, 255, 0.3)'"
        @mouseleave="e => e.target.style.background = 'rgba(255, 255, 255, 0.2)'"
      >
        <svg
          v-if="darkMode"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <svg
          v-else
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>
    </header>
  `,
};
