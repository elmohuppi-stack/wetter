# Wetter-Enthusiasten Plattform

Eine umfassende Wetter-App für Meteorologie-Interessierte, gebaut mit Vue.js, Chart.js und Open-Meteo APIs.

## ⭐ Features

### Wetter-Daten

- **Forecast**: Aktuelle Wettervorhersagen mit stündlichen und täglichen Daten
- **Historical**: Historische Wetterdaten für Vergleiche (seit 1940)
- **Seasonal**: Saisonale Vorhersagen mit Wahrscheinlichkeiten
- **Climate**: Klimaprojektionen bis 2100 basierend auf CMIP6-Modellen
- **Expert-Tab**: Freie Parameterauswahl für Open-Meteo API (Aktuelle, Tägliche, Stündliche Daten)

### System

- **Dashboard**: Live API-Monitoring mit Rate-Limit-Überwachung
- **Caching**: 15-Minuten-Caching für optimierte Bandnutzung
- **Dark Mode**: Für lange Sessions
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Standort-Management**: Ortssuche und GPS-Lokalisierung
- **Deutsche Lokalisierung**: Alle Parameter übersetzt

## 🛠 Technologie-Stack

- **Frontend**: Vue.js 3 (CDN), Chart.js, Leaflet
- **Styling**: Tailwind CSS v3.4.0 (produktiv)
- **Backend**: PHP Proxy mit 4-tier Rate Limiting und Caching
- **APIs**: Open-Meteo (kostenlos, keine Authentifizierung erforderlich)
- **Build**: Makefile mit npm-Integration

## 📦 Installation

```bash
# Abhängigkeiten installieren
make install

# CSS produktiv bauen
make build

# Entwicklungs-Überwachung (neue Terminal)
make watch

# Server starten (neue Terminal)
make start

# Browser öffnen
make open
```

Dann öffne http://127.0.0.1:8000 im Browser

## 📊 API Rate Limits

Open-Meteo Limits (konservativ bei 90% implementiert):

| Limit          | API     | Implementiert | Status      |
| -------------- | ------- | ------------- | ----------- |
| **Pro Minute** | 600     | 540           | ⚠️ Kritisch |
| **Pro Stunde** | 5.000   | 4.500         | Überwacht   |
| **Pro Tag**    | 10.000  | 9.000         | Überwacht   |
| **Pro Monat**  | 300.000 | 270.000       | Überwacht   |

**Dashboard**: Zeigt aktuelle Nutzung mit Live-Progress-Balken

## 🚀 Entwicklung

### Makefile Targets

```bash
make help           # Zeige alle Befehle
make install        # npm install
make build          # Tailwind CSS bauen
make watch          # CSS bei Änderungen bauen (watch-Modus)
make dev            # Start + Watch (Anleitung zeigen)
make start          # PHP-Server starten
make stop           # Server stoppen
make restart        # Server neu starten
make status         # Status prüfen
make open           # Im Browser öffnen (macOS)
make clean          # node_modules aufräumen
```

### Caching-System

- **Forecast**: 15 Minuten Cache
- **Expert**: 15 Minuten Cache
- **Historical**: 1 Stunde Cache
- **Seasonal**: 6 Stunden Cache
- **Climate**: 24 Stunden Cache

### Dashboard-Metriken

Das Dashboard zeigt:

- **API-Calls heute**: Alle Anfragen (Cache + Real)
- **Cache-Hits**: Anfragen aus dem Cache
- **Minute/Stunde**: Aktuelle Nutzung mit Warnung bei 90%

## 📁 Projektstruktur

```
.
├── frontend/
│   ├── index.html
│   ├── style.css          (generiert von Tailwind)
│   └── src/
│       ├── main.js
│       ├── App.js
│       └── components/
├── backend/
│   └── proxy.php          (Rate Limiting + Caching)
├── src/
│   └── tailwind.css       (Input für Build)
├── package.json
├── tailwind.config.js
├── Makefile
└── README.md
```

## 🔄 Workflow

### Development

```bash
# Terminal 1
make start   # PHP Server starten

# Terminal 2
make watch   # Tailwind CSS beobachten
```

### Production

```bash
make build   # CSS minified bauen
make start   # Server starten
```

## 📝 Lizenz

Free for non-commercial use. Respektiere Open-Meteo Limits.

---

**Ursprünglich**: 11. April 2026  
**Zuletzt aktualisiert**: 17. April 2026 (Rate Limiting, Dashboard, Tailwind CSS)  
**Version**: 1.0.0
