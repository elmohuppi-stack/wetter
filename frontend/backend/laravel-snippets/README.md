Laravel backend snippets

This folder contains ready-to-copy snippets to integrate into a Laravel project. The goal: backend performs all weather API calls and caches results; frontend only calls the backend.

Files included:

- `WeatherController.php` (app/Http/Controllers/Api/WeatherController.php)
- `WeatherService.php` (app/Services/WeatherService.php)
- `routes-api-snippet.php` (routes/api.php snippet)
- `services.php` snippet (to extend config/services.php)
- `.env.example` (Open-Meteo settings)

Quick setup (in repo root):

```bash
# 1) create laravel project in backend/
composer create-project laravel/laravel backend

cd backend

# 2) install HTTP client if needed (Laravel uses Http facade by default)
composer require guzzlehttp/guzzle

# 3) copy snippets into the Laravel project:
# - app/Http/Controllers/Api/WeatherController.php
# - app/Services/WeatherService.php
# - add route to routes/api.php
# - add open_meteo block to config/services.php
# - copy .env values from .env.example

# 4) run migrations (if any) and start dev server
php artisan serve

# Example request (frontend should call this endpoint):
# GET http://127.0.0.1:8000/api/weather?lat=52.52&lon=13.405
```

Notes:

- The `WeatherService` uses Laravel's `Http` facade and `Cache` for simple caching.
- Adjust cache duration in the service if needed.
- Add monitoring or circuit-breaker logic in production if API reliability matters.

## Quick local testing without a full Laravel install

If you want to test frontend + backend quickly without installing Laravel, a tiny PHP proxy is included at `/backend/proxy.php`.

Run this from the repo root to serve both frontend and backend:

```bash
php -S 127.0.0.1:8000 -t .
```

Then open the frontend at `http://127.0.0.1:8000/frontend/index.html` and the proxy endpoint is available at `http://127.0.0.1:8000/backend/proxy.php?lat=52.52&lon=13.405`.

This proxy caches responses for 10 minutes and is meant for local development only. Replace with the Laravel snippets above for production-ready usage.
