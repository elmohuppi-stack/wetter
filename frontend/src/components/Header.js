export default {
  props: {
    darkMode: Boolean,
    location: String,
  },
  emits: ["toggle-dark-mode", "search-location", "use-geolocation"],
  data() {
    return {
      searchExpanded: false,
      searchInput: "",
    };
  },
  methods: {
    toggleSearchExpanded() {
      this.searchExpanded = !this.searchExpanded;
      if (this.searchExpanded) {
        this.$nextTick(() => {
          if (this.$refs.searchField) {
            this.$refs.searchField.focus();
          }
        });
      } else {
        this.searchInput = "";
      }
    },
    handleSearch() {
      if (this.searchInput.trim()) {
        this.$emit("search-location", this.searchInput.trim());
        this.searchInput = "";
        this.searchExpanded = false;
      }
    },
    handleSearchBlur() {
      if (!this.searchInput.trim()) {
        this.searchExpanded = false;
      }
    },
    handleGeolocation() {
      this.$emit("use-geolocation");
    },
  },
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
      <div style="display: flex; alignItems: 'center'; gap: '12px'; flex: 1; minWidth: 0;">
        <div style="fontSize: '28px'; fontWeight: 'bold'">🌤️</div>
        <h1 style="margin: 0; fontSize: '1.3rem'; fontWeight: '600'; letterSpacing: '-0.01em'; overflow: hidden; textOverflow: 'ellipsis'; whiteSpace: 'nowrap'">
          {{ location ? 'Wetter in ' + location : 'Wetter' }}
        </h1>
      </div>

      <!-- Location Search Section -->
      <div style="display: flex; alignItems: 'center'; gap: '12px'; marginRight: '12px'">
        <transition name="slide">
          <input
            v-if="searchExpanded"
            v-model="searchInput"
            @keyup.enter="handleSearch"
            @blur="handleSearchBlur"
            placeholder="Ort eingeben..."
            ref="searchField"
            :style="{
              padding: '8px 12px',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              width: '200px',
              transition: 'all 0.2s ease',
              '::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
              },
            }"
            @focus="e => e.target.style.background = 'rgba(255, 255, 255, 0.3)'"
          />
        </transition>
        
        <button
          @click="toggleSearchExpanded"
          title="Ort suchen"
          :style="{
            padding: '8px 10px',
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
            minWidth: '40px',
            marginRight: '12px',
          }"
          @mouseenter="e => e.target.style.background = 'rgba(255, 255, 255, 0.3)'"
          @mouseleave="e => e.target.style.background = 'rgba(255, 255, 255, 0.2)'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>

        <button
          @click="handleGeolocation"
          title="Aktuellen Standort verwenden"
          :style="{
            padding: '8px 10px',
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
            minWidth: '40px',
            marginRight: '12px',
          }"
          @mouseenter="e => e.target.style.background = 'rgba(255, 255, 255, 0.3)'"
          @mouseleave="e => e.target.style.background = 'rgba(255, 255, 255, 0.2)'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a8 8 0 10-14.8 0L12 21z"></path>
          </svg>
        </button>
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
