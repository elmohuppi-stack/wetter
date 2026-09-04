/*
  Waagerechte Reiterleiste statt linker Sidebar (4. September 2026).

  Ersetzt Sidebar.js. Google stellt seine Bereiche als schmale Zeile unter die
  Suche — das gibt der Wetterkarte die volle Breite und spart die 128 Pixel,
  die die Sidebar links belegt hat. Die Beschriftungen sind bei der Gelegenheit
  eingedeutscht; "Forecast/Historical/Seasonal" war Denglisch in einer sonst
  deutschen Oberfläche.

  Am 4. September 2026 sind Rückblick, Saison und Klima entfallen. Drei Reiter,
  die je einen Knopf und ein Liniendiagramm zeigten, standen gleichberechtigt
  neben der eigentlichen Wettervorhersage.

  Am selben Tag ist die Kopfzeile darüber weggefallen. Die beiden Knöpfe, die
  sie noch trug — Ortswahl und dunkles Design — sitzen jetzt rechts in dieser
  Zeile und kosten keine zusätzliche Höhe.
*/
export default {
  props: {
    currentTab: String,
    darkMode: Boolean,
  },
  emits: ["tab-change", "open-location", "toggle-dark-mode"],
  data() {
    return {
      tabs: [
        { id: "forecast", label: "Wetter" },
        { id: "dashboard", label: "Monitoring" },
        { id: "expert", label: "Experte" },
      ],
    };
  },
  template: `
    <nav class="g-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="g-tab"
        :class="{ 'is-active': currentTab === tab.id }"
        @click="$emit('tab-change', tab.id)"
      >{{ tab.label }}</button>

      <div class="g-tabs-actions">
        <button class="g-iconbtn" @click="$emit('open-location')" title="Region auswählen" aria-label="Region auswählen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="10" r="3"></circle>
            <path d="M19.4 13a8 8 0 10-14.8 0L12 21z"></path>
          </svg>
        </button>
        <button class="g-iconbtn" @click="$emit('toggle-dark-mode')" title="Dunkles Design umschalten" aria-label="Dunkles Design umschalten">
          <svg v-if="darkMode" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="5"></circle>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </button>
      </div>
    </nav>
  `,
};
