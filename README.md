# Wetter-Enthusiasten Plattform

Eine umfassende Wetter-App für Meteorologie-Interessierte, gebaut mit Vue.js, Chart.js und Open-Meteo APIs.

## Features

- **Forecast**: Aktuelle Wettervorhersagen mit stündlichen und täglichen Daten
- **Historical**: Historische Wetterdaten für Vergleiche (seit 1940)
- **Seasonal**: Saisonale Vorhersagen mit Wahrscheinlichkeiten
- **Climate**: Klimaprojektionen bis 2100 basierend auf CMIP6-Modellen
- **Expert-Tab**: Freie Parameterauswahl für Open-Meteo API (Aktuelle, Tägliche, Stündliche Daten)
- **Dashboard**: API-Monitoring und Daten-Export
- **Dark Mode**: Für lange Sessions
- **Responsive Design**: Optimiert für Desktop und Mobile
- **Header Integration**: Expandierbares Suchfeld mit Geolocation-Button direkt im Header
- **Standort-Management**: Einfache Ortssuche und GPS-Lokalisierung
- **Deutsche Lokalisierung**: Alle Parameter übersetzt, Datumsformate, Einheiten, Himmelsrichtungen und Windstärken auf Deutsch

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
- UI-Verbesserungen Phase 1: Header-Integration, expandierbares Suchfeld, optimierte Darstellung
- Expert-Tab: Freie API-Parameterauswahl mit Accordion-UI, Buttons (Start/Default/Alle), automatisches Laden
- Expert-Ergebnisse: Deutsche Übersetzungen, Einheiten, Wettercodes als Text, Himmelsrichtungen, Windstärken (Beaufort)
- Caching: 10min–24h je nach Datenfrische, Parameter-Hash für Expert-Mode
- Export: CSV für alle Datenarten
- Lokalisierung: Deutsche Datumsformate, Uhrzeiten, Wetterbeschreibungen und Windbezeichnungen

## Lizenz

Free for non-commercial use. Respektiere Open-Meteo Limits.

---

Ursprünglich erstellt am: 11. April 2026
Zuletzt aktualisiert: 17. April 2026 (Expert-Tab, deutsche Lokalisierung)
