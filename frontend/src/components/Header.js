export default {
  props: {
    darkMode: Boolean,
    location: String,
  },
  emits: ["toggle-dark-mode", "search-location", "use-geolocation", "go-home"],
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
    goHome() {
      this.$emit("go-home");
    },
  },
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 h-15 bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg flex items-center justify-between px-6 py-3">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <div class="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity" @click="goHome">🌤️</div>
        <h1 class="text-xl font-semibold truncate cursor-pointer hover:opacity-80 transition-opacity" @click="goHome">{{ location ? 'Wetter in ' + location : 'Wetter' }}</h1>
      </div>

      <!-- Location Search Section -->
      <div class="flex items-center gap-3 mr-3">
        <transition name="slide">
          <input
            v-if="searchExpanded"
            v-model="searchInput"
            @keyup.enter="handleSearch"
            @blur="handleSearchBlur"
            placeholder="Ort eingeben..."
            ref="searchField"
            class="px-3 py-2 border-2 border-white/50 rounded-lg bg-white/20 text-white placeholder-white/70 text-sm outline-none w-52 transition-all focus:bg-white/30"
          />
        </transition>
        
        <button
          @click="toggleSearchExpanded"
          title="Ort suchen"
          class="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center w-10 h-10 mr-3"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>

        <button
          @click="handleGeolocation"
          title="Aktuellen Standort verwenden"
          class="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center w-10 h-10 mr-3"
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
        class="p-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center w-10 h-10"
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
