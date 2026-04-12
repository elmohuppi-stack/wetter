# Wetter-Enthusiasten Plattform

Eine umfassende Wetter-App für Meteorologie-Interessierte, gebaut mit Vue.js, Chart.js und Open-Meteo APIs.

## Features

- **Forecast**: Aktuelle Wettervorhersagen mit stündlichen und täglichen Daten
- **Historical**: Historische Wetterdaten für Vergleiche (seit 1940)
- **Seasonal**: Saisonale Vorhersagen mit Wahrscheinlichkeiten
- **Climate**: Klimaprojektionen bis 2100 basierend auf CMIP6-Modellen
- **Dashboard**: API-Monitoring und Daten-Export
- **Dark Mode**: Für lange Sessions
- **Responsive Design**: Optimiert für Desktop und Mobile

## Technologie-Stack

- **Frontend**: Vue.js 3 (CDN), Chart.js, Leaflet
- **Backend**: PHP Proxy mit Caching und Rate-Limiting
- **APIs**: Open-Meteo (kostenlos, 10k Calls/Tag)

## Installation

1. Klone das Repository
2. Starte den PHP-Server: `make start`
3. Öffne http://127.0.0.1:8000 im Browser

## API-Limits

- 10.000 Calls/Tag gesamt
- 600 Calls/Minute
- Rate-Limiting: 100 Calls/Tag pro IP

## Entwicklung

- Phase 1-4 implementiert: Grundlagen, historische Daten, saisonale Daten, Monitoring
- Caching: 10min-24h je nach Datenfrische
- Export: CSV für alle Datenarten

## Lizenz

Free for non-commercial use. Respektiere Open-Meteo Limits.

---

Ursprünglich erstellt am: 11. April 2026
