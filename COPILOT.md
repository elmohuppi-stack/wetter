# Copilot-Kontext: Wetter-App

Dieses Dokument beschreibt Architektur, Konventionen und bekannte Eigenheiten des Projekts.

---

## 📐 Architektur

### Frontend

- **Framework**: Vue.js 3 (CDN-geladen, keine Build-Step für App)
- **Styling**: Tailwind CSS v3.4.0 (produktiv, generiert via CLI)
- **Einstiegspunkt**: `frontend/index.html` → `frontend/src/main.js` → `frontend/src/App.js`
- **Komponenten**: `frontend/src/components/*.js` (defineComponent mit Template-Strings)
- **Routing**: Tab-basiert in `App.js` (`currentTab`), kein Vue Router

### Backend

- **Language**: PHP 8+
- **Proxy**: `backend/proxy.php` — Open-Meteo API-Proxy
- **Features**:
  - 4-tier Rate Limiting (600/min, 5000/h, 10000/day, 300000/month)
  - Intelligentes Caching (15min Forecast, 1h Historical, 6h Seasonal, 24h Climate)
  - Dashboard API für Live-Metriken
  - JSON-Response mit Fehlerbehandlung

### Server

- **PHP Built-in**: `php -S 127.0.0.1:8000 -t . -r index.php`
- **Router**: `index.php` (leitet `/backend/*` durch, `/` zu `frontend/index.html`)
- **PID-Datei**: `.devserver.pid` (für make stop/restart)

---

## 🛠 Build-System

### Makefile

```bash
make install    # npm install
make build      # Tailwind CSS produktiv bauen (minified)
make watch      # Tailwind CSS Überwachung (Development)
make start      # PHP-Server starten
make stop       # Server stoppen
make restart    # Server neu starten
make status     # Status anzeigen
make open       # Im Browser öffnen (macOS)
make clean      # Aufräumen (node_modules)
```

### npm Scripts

```bash
npm install           # Dependencies
npm run build:css     # Tailwind CLI → frontend/style.css (minified)
npm run watch:css     # Tailwind CLI mit --watch
```

---

## 📝 Komponenten

| Datei               | Zweck                                                       |
| ------------------- | ----------------------------------------------------------- |
| `App.js`            | Root, Tab-Routing, Standort, API-Calls, State Management    |
| `Header.js`         | Suchfeld, Geolocation, Dark Mode Toggle                     |
| `Sidebar.js`        | Tab-Navigation                                              |
| `CurrentWeather.js` | Aktuelle Daten (Fallback: `current_weather` oder `current`) |
| `HourlyTimeline.js` | Stündliche Vorhersage + Chart.js                            |
| `WeeklyList.js`     | 7-Tage-Übersicht                                            |
| `MapPreview.js`     | Leaflet-Kartenvorschau                                      |
| `Expert.js`         | Parameter-Auswahl (Accordions, Buttons)                     |
| `ExpertResults.js`  | Ergebnisse (Grid, Tabellen, Charts)                         |

---

## 💾 Rate Limiting & Caching

### Rate Limit Tracking

```php
// backend/proxy.php: 4-tier System
$stats = [
    'minute' => ['count' => X, 'timestamp' => 'Y-m-d H:i'],
    'hour'   => ['count' => X, 'timestamp' => 'Y-m-d H'],
    'day'    => ['count' => X, 'timestamp' => 'Y-m-d'],
    'month'  => ['count' => X, 'timestamp' => 'Y-m'],
];

// Grenzen (90% des API-Limits)
$limits = [
    'minute' => 540,    // of 600
    'hour'   => 4500,   // of 5000
    'day'    => 9000,   // of 10000
    'month'  => 270000, // of 300000
];
```

### Cache TTLs

- **Forecast**: 900s (15 min)
- **Expert**: 900s (15 min)
- **Historical**: 3600s (1 h)
- **Seasonal**: 21600s (6 h)
- **Climate**: 86400s (24 h)

### Cache-Key Generierung

```php
$cacheKey = $api . '_' . str_replace(/[^a-z0-9._-]/i, '_', $lat . '_' . $lon);
// Expert: + '_' . md5(serialize($params))
```

### Dashboard API

```
GET /backend/proxy.php?api=dashboard

{
    "calls_today": int,
    "cache_hits": int,
    "minute_used": int,
    "minute_limit": 540,
    "hour_used": int,
    "hour_limit": 4500,
    "day_limit": 9000,
    "month_limit": 270000
}
```

---

## 🎨 Styling

### Tailwind CSS Setup

- **Version**: 3.4.0 (stabil mit CLI)
- **Config**: `tailwind.config.js`
- **Input**: `src/tailwind.css`
- **Output**: `frontend/style.css` (produktiv, 15KB minified)
- **Build**: `npm run build:css` (minify + purge)
- **Watch**: `npm run watch:css` (for development)

### CSS-Migration

- Alte Datei (`frontend/style.css`) wurde von `cdn.tailwindcss.com` auf lokale Generierung migriert
- Keine CDN-Warnung mehr im Browser ✓

---

## 🌍 Lokalisierung

Alle Texte auf Deutsch:

| Typ                 | Verarbeitung                         |
| ------------------- | ------------------------------------ |
| Datum/Uhrzeit       | `toLocaleString("de-DE", ...)`       |
| Wettercodes         | WMO-Codes → deutsche Emoji-Texte     |
| Windrichtung        | Grad → N, NO, O, SO, S, SW, W, NW    |
| Windgeschwindigkeit | km/h → Beaufort-Bezeichnungen        |
| Parameter-Namen     | `parameterTranslations` in Expert.js |
| Einheiten           | `parameterUnits` in ExpertResults.js |

---

## 🔗 API Endpoints

```
GET /backend/proxy.php?api=forecast&lat=X&lon=Y
  → Aktuelle, stündliche, tägliche Daten

GET /backend/proxy.php?api=expert&lat=X&lon=Y&current=...&daily=...&hourly=...
  → Benutzerdefinierte Parameter

GET /backend/proxy.php?api=historical&lat=X&lon=Y&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
  → Historische Daten

GET /backend/proxy.php?api=seasonal&lat=X&lon=Y
  → Saisonale Vorhersagen

GET /backend/proxy.php?api=climate&lat=X&lon=Y
  → Klimaprojektionen

GET /backend/proxy.php?api=dashboard
  → Monitoring & Metriken
```

---

## ⚠️ Bekannte Eigenheiten

### Vue 3 ohne Build-Step

- Keine `.vue`-Dateien — Template ist JavaScript-String
- `v-for` + `v-if` **nicht** auf demselben Element — `<template v-for>` + inner `<div v-if>`
- Alle Template-Ausdrücke enden mit `"`, nicht `}}`

### Expert-Mode Hard-Coded Koordinaten

- `App.js` → `handleRefreshExpert()` nutzt Fallback `49.05, 8.2667` (Karlsruhe)
- Sollte durch echte `location`-State ersetzt werden (TODO)

### Stats-Datei Format

```json
// weather_stats_{ip_safe}.json
{
  "calls_today": 42,
  "cache_hits": 15,
  "minute_used": 10,
  "hour_used": 120,
  "date": "2026-04-17"
}
```

---

## 🚨 Häufige Fehler

| Problem                          | Lösung                                            |
| -------------------------------- | ------------------------------------------------- |
| `tailwindcss: command not found` | `npm install` + `npm run build:css`               |
| CSS nicht aktualisiert           | `make clean && npm install && make build`         |
| Server läuft bereits             | `make restart`                                    |
| Rate Limit Error (429)           | Cache wird geladen, warten oder Server neustarten |
| Browser-Cache                    | Hard-Refresh: `Cmd+Shift+R` (macOS)               |

---

**Version**: 1.0.0  
**Last Updated**: 17. April 2026

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
