# Copilot-Kontext: Wetter-App

Dieses Dokument beschreibt Architektur, Konventionen und bekannte Eigenheiten des Projekts für den Einsatz durch GitHub Copilot.

---

## Architektur

- **Kein Build-System** — Vue.js 3 wird per CDN geladen. Komponenten sind `.js`-Dateien mit `defineComponent` und Inline-Templates als Template-Strings.
- **Einstiegspunkt Frontend**: `frontend/index.html` → `frontend/src/main.js` → `frontend/src/App.js`
- **Komponenten**: `frontend/src/components/*.js`
- **Backend**: `backend/proxy.php` — PHP-Proxy für Open-Meteo API mit Datei-Caching
- **Routing**: Tab-basiert in `App.js` (`currentTab`), kein Vue Router
- **Server**: PHP Built-in Server, Einstieg über `index.php` (leitet auf `frontend/index.html` weiter)

---

## Entwicklungs-Befehle

```bash
make start     # PHP-Server starten (http://127.0.0.1:8000)
make stop      # Server stoppen
make restart   # Server neu starten
make status    # Status prüfen
make open      # Frontend im Browser öffnen (macOS)
```

---

## Komponenten-Übersicht

| Datei               | Zweck                                                                            |
| ------------------- | -------------------------------------------------------------------------------- |
| `App.js`            | Root-Komponente, Tab-Routing, Standortverwaltung, API-Aufrufe                    |
| `Header.js`         | Expandierbares Suchfeld, Geolocation-Button                                      |
| `Sidebar.js`        | Tab-Navigation                                                                   |
| `CurrentWeather.js` | Aktuelle Wetterdaten (liest aus `data.current`, Fallback `data.current_weather`) |
| `HourlyTimeline.js` | Stündliche Vorhersage mit Chart.js                                               |
| `WeeklyList.js`     | 7-Tage-Übersicht                                                                 |
| `MapPreview.js`     | Kartenvorschau mit Leaflet                                                       |
| `Expert.js`         | Parameterauswahl für Open-Meteo Expert-Modus (Accordions, Buttons)               |
| `ExpertResults.js`  | Ergebnisdarstellung für Expert-Modus (Grid, Tabellen, Charts)                    |

---

## Bekannte Eigenheiten & Fallstricke

### Vue 3 ohne Build-Step

- Keine SFCs (`.vue`-Dateien), Template ist ein JS-String im `template`-Property
- `v-for` und `v-if` **nicht** auf demselben Element — stattdessen `<template v-for>` + inner `<div v-if>` verwenden
- Kein `$options`-Zugriff auf eigene Properties zur Laufzeit — Übersetzungen/Daten immer in `data()` zurückgeben

### Template-Strings

- Doppel-Geschweiftes `}}` in `:style`-Bindings (z.B. `:style="{ color: '#abc' }"`) erzeugt Syntax-Fehler im Template — sorgfältig prüfen
- Alle Template-Ausdrücke enden mit `"` nicht `"}}`

### Proxy-Caching (`backend/proxy.php`)

- Cache-Key für `api=expert` enthält einen MD5-Hash aller Parameter, damit verschiedene Parameterkombinationen nicht denselben Cache treffen
- Cache-Dateien liegen in `backend/cache/`

### Koordinaten

- `App.js` → `handleRefreshExpert()` verwendet aktuell Hard-coded Fallback-Koordinaten (Karlsruhe: `49.05, 8.2667`) — sollte durch den echten `location`-State ersetzt werden

---

## Lokalisierung

Alle sichtbaren Werte sind auf Deutsch:

| Typ                      | Verarbeitung                                                                      |
| ------------------------ | --------------------------------------------------------------------------------- |
| Datum/Uhrzeit            | `toLocaleString("de-DE", ...)`                                                    |
| Wettercodes              | `formatWeatherCode(code)` → WMO-Codes → deutsche Emoji-Texte                      |
| Windrichtung             | Grad → Himmelsrichtung (N, NO, O, SO, S, SW, W, NW)                               |
| Windgeschwindigkeit/Böen | km/h → Beaufort-Bezeichnungen (Windstille bis Orkan)                              |
| Parameter-Namen          | `parameterTranslations`-Objekt in `data()` von `Expert.js` und `ExpertResults.js` |
| Einheiten                | `parameterUnits`-Objekt in `data()` von `ExpertResults.js`                        |

---

## API

Open-Meteo Forecast-Endpoint via `backend/proxy.php`:

```
GET /backend/proxy.php?api=forecast&lat=...&lon=...
GET /backend/proxy.php?api=expert&lat=...&lon=...&current=...&daily=...&hourly=...
```

- Standard-`api=forecast` ruft `current`, `hourly` und `daily` ab
- `api=expert` gibt die vom Nutzer gewählten Parameter frei
