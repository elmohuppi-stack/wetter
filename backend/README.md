Backend (Laravel) — Hinweise

Empfehlung: für das Backend `Laravel` verwenden, um API-Endpoints, Caching und rechtliche Seiten (Impressum/Datenschutz) zu hosten.

Kurz-Anleitung zum Erstellen eines Laravel-Projekts in diesem Ordner:

1. PHP und Composer müssen installiert sein.
2. Im Repo-Root ausführen:

```bash
composer create-project laravel/laravel backend
```

3. Dann in `backend/` die `.env` konfigurieren und `php artisan serve` starten.

Hinweis: Falls du `Laravel` lokal nicht installieren möchtest, kannst du das Frontend zuerst als statische SPA entwickeln und die Open-Meteo-API direkt anzapfen (CORS beachten).

Für schnelles lokales Testen ohne Laravel ist ein leichter Proxy in `/backend/proxy.php` enthalten.
Du kannst das gesamte Repo lokal per PHP dev-server serven (so sind Frontend und Proxy unter derselben Origin erreichbar):

```bash
php -S 127.0.0.1:8000 -t .
# Frontend: http://127.0.0.1:8000/frontend/index.html
# Proxy:    http://127.0.0.1:8000/backend/proxy.php?lat=52.52&lon=13.405
```

Der Proxy ist für Entwicklung gedacht und cached Ergebnisse 10 Minuten. Für Produktion nutze bitte die Laravel-Snippets weiter oben.
