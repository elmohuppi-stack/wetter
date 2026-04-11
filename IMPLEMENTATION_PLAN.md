# Implementierungsplan — Wetter-App

## Ziel

Einfache, übersichtliche Wetter-Website für einen Ort; schnell erfassbar: "Was ist jetzt?", "Wie wird es heute?", "Wie wird die Woche?". Rechtlich sauber: Impressum und Datenschutzerklärung von Anfang an.

---

## Versionen und Inhalte

### V1.0 — MVP (Grundversion)

Ziel: Kernnutzen in einer schlanken Oberfläche.

- Aktuelles Wetter (Temperatur, gefühlte Temperatur, Wettersymbol, kurze Text-Zusammenfassung)
- Stundenübersicht (12–24 Stunden): Temperatur, Niederschlagswahrscheinlichkeit, Wind
- 7-Tage-Vorhersage (Tageshoch/-tief, Regenwahrscheinlichkeit)
- Basiswerte: Luftfeuchtigkeit, Sonnenaufgang/-untergang
- Footer: Links zu Impressum und Datenschutzerklärung
- Eine übersichtliche Karte als unterstützendes Element (Standort)

### V1.1 — Visuelle Aufwertung

Ziel: bessere Lesbarkeit und Grafik.

- Wetterkarte mit Temperatursymbolen und Werten
- Grafischer Temperaturverlauf (Stundenlinie)
- Optional: einfacher Regen-/Windverlauf als Balken/Layer

### V1.2 — Komfortfunktionen

Ziel: Alltagshilfen, ohne die App zu überfrachten.

- Kurze Alltagshinweise (z. B. "Regen ab 16 Uhr")
- Einfache Warnhinweise (Gewitter, Sturm, Frost, Hitze)

### V2.0 — Erweiterungen (optional)

- Mehrere Orte / Favoriten
- Luftqualität / Pollen / UV-Details
- Benachrichtigungen / Widgets
- Radar- und Niederschlagslayer

---

## Technische Randbedingungen (empfohlen, nicht verbindlich)

- Backend: `Laravel` (API, Caching, rechtliche Seiten)
- Frontend: `Vue.js` (interaktive Komponenten, Charts)
- Wetter-API: `Open-Meteo` als Standard (kostenlos, ausreichend)
- Kartenbasis: `OpenStreetMap` (Tile-Provider wie MapTiler/OSM-tiles)
- Diagramme: `Chart.js` für Temperatur- und Regenverläufe

---

## Rechtliches (Deutschland)

- **Impressum**: Name/Anschrift des Betreibers, Kontaktmöglichkeit
- **Datenschutzerklärung**: Angaben zu personenbezogenen Daten, Standortverarbeitung, externe Dienste (Wetter-API, Karten), ggf. Cookie-Hinweise
- Footer: dauerhafte Links zu beiden Seiten
- Cookie-Banner nur, falls Tracking/Analytics/Cookies eingesetzt werden

Tipp: Datenschutzerklärung aufsetzen, die explizit nennt: Open-Meteo, OpenStreetMap/MapTiler/Mapbox (je nach Auswahl) und die IP-/Standortverarbeitung.

---

## UI / Seitenstruktur (V1.0)

- Startseite
  - Header (App-Name)
  - Hauptbereich: aktuelles Wetter (groß)
  - Sekundär: Stundenübersicht (horizontale Timeline)
  - Wochenübersicht (Liste oder Karten-Kacheln)
  - Karte (klein, unterstützend)
  - Footer: Impressum | Datenschutz
- Impressum
- Datenschutzerklärung

---

## Umsetzungsschritte (konkrete To‑Dos für V1.0)

1. Projekt initialisieren (Laravel + Vue) oder statische Single-Page-Ordnerstruktur anlegen
2. Backend: einfache API-Route, die Wetterdaten von Open-Meteo abruft und cached
3. Frontend: Startseite mit Komponenten
   - `CurrentWeather` (große Anzeige)
   - `HourlyTimeline` (Chart/Timeline)
   - `WeeklyList` (7-Tage-Übersicht)
   - `MapPreview` (kleine Karte mit Standort)
4. Rechtliche Seiten: `impressum` und `datenschutz` statisch anlegen und im Footer verlinken
5. Tests: manuelle Prüfung, ob Startseite in <5s Kerninfos liefert

---

## Offene Fragen (vor Implementationsstart klären)

- Sollen Nutzer-Standorte per Browser-Location automatisch vorgeschlagen werden, oder nur manuelle Eingabe?
- Cookie-/Analytics-Strategie: sofort verzichten oder später hinzufügen?
- Sollen Warnhinweise von offizieller Quelle (z. B. DWD) eingebunden werden oder reine Komforthinweise verwendet werden?

---

## Nächste Schritte (kurz)

- Review dieses Plans zusammen mit dir
- Entscheiden: `Laravel`-Starter vs. leichtgewichtige SPA
- Repo initialisieren und V1.0-Tasks abarbeiten

---

_Erstellt am:_ 11. April 2026
