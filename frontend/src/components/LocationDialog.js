/*
  Ortssuche als Dialog (4. September 2026).

  Vorher lag ein Google-artiges Suchfeld in einer eigenen Kopfzeile über der
  ganzen App — rund siebzig Pixel Höhe auf jeder Seite, für eine Eingabe, die
  man selten braucht. Die Suche steckt jetzt hinter „Region auswählen" in der
  Wetterkarte und hinter dem Stecknadel-Knopf in der Reiterleiste.

  Der Dialog schließt bei Klick auf den Hintergrund und mit Escape; beim Öffnen
  bekommt das Feld den Fokus, damit man sofort tippen kann.
*/
export default {
  props: {
    open: Boolean,
    location: String,
  },
  emits: ["close", "search-location", "use-geolocation"],
  data() {
    return {
      query: "",
    };
  },
  watch: {
    open(isOpen) {
      if (!isOpen) return;
      this.query = this.location || "";
      this.$nextTick(() => {
        const field = this.$refs.field;
        if (!field) return;
        field.focus();
        field.select();
      });
    },
  },
  methods: {
    submit() {
      const query = this.query.trim();
      if (!query) return;
      this.$emit("search-location", query);
      this.$emit("close");
    },
    useHere() {
      this.$emit("use-geolocation");
      this.$emit("close");
    },
  },
  template: `
    <div v-if="open" class="g-overlay" @click.self="$emit('close')">
      <div class="g-dialog" role="dialog" aria-modal="true" aria-label="Region auswählen">
        <div class="g-dialog-head">
          <h2>Region auswählen</h2>
          <button class="g-iconbtn" @click="$emit('close')" title="Schließen" aria-label="Schließen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="g-searchbar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="g-searchbar-icon">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            ref="field"
            v-model="query"
            @keyup.enter="submit"
            @keyup.esc="$emit('close')"
            placeholder="Ort eingeben"
            aria-label="Ort eingeben"
          />
        </div>

        <div class="g-dialog-foot">
          <button class="g-btn" @click="useHere">Aktuellen Standort verwenden</button>
          <button class="g-btn g-btn-primary" @click="submit" :disabled="!query.trim()">Suchen</button>
        </div>
      </div>
    </div>
  `,
};
