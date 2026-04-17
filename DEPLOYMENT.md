# Wetter-App Deployment auf Hetzner

Deployment-Konfiguration für die Wetter-App auf dem zentralen Hetzner-Multi-App-Server.

## Konfiguration

| Variable | Wert |
|----------|------|
| `APP_SLUG` | `wetter` |
| `FRONTEND_DOMAIN` | `wetter.elmarhepp.de` |
| `WEB_PORT` | `3031` |
| `DEPLOY_PATH` | `/var/www/wetter` |
| `Docker Container` | `wetter-app` |

## Stack

- **PHP**: 8.2 CLI mit Built-in Server
- **Frontend**: Vue.js 3 (CDN) + Tailwind CSS (generiert)
- **Backend**: PHP 8+ Proxy mit Rate Limiting & Caching
- **Reverse Proxy**: Nginx (Host)
- **HTTPS**: Let's Encrypt / Certbot

## Automatisches Deployment

```bash
# Auf dem Hetzner-Server ausführen:
ssh elmarhepp "cd /var/www/wetter && bash deploy-hetzner.sh"
```

Oder manuell:

```bash
# 1. Repository klonen
cd /var/www
git clone https://github.com/elmohuppi-stack/wetter.git wetter
cd wetter

# 2. .env vorbereiten
cat > .env.production << EOF
APP_DOMAIN=wetter.elmarhepp.de
WEB_PORT=3031
EOF

# 3. Docker Compose starten
docker compose up -d --build

# 4. Nginx konfigurieren
sudo cp wetter-nginx.conf /etc/nginx/sites-available/wetter.conf
sudo ln -sf /etc/nginx/sites-available/wetter.conf /etc/nginx/sites-enabled/wetter.conf
sudo nginx -t
sudo systemctl reload nginx

# 5. SSL-Zertifikat
sudo certbot --nginx -d wetter.elmarhepp.de

# 6. Verifikation
docker compose ps
sudo nginx -t
curl -I https://wetter.elmarhepp.de/
```

## Monitoring

```bash
# Logs anschauen
docker compose logs -f app

# Status prüfen
docker compose ps

# Neu starten
docker compose restart app

# Stoppen
docker compose down

# Update (git pull + rebuild)
git pull origin master
docker compose up -d --build
```

## API Health-Checks

```bash
# Forecast API
curl -s https://wetter.elmarhepp.de/backend/proxy.php?api=forecast\&lat=49.05\&lon=8.2667 | head -20

# Dashboard
curl -s https://wetter.elmarhepp.de/backend/proxy.php?api=dashboard

# Aktuelle Seite
curl -I https://wetter.elmarhepp.de/
```

## Rate Limits (Dashboard)

Das Dashboard zeigt Live-Metriken:
- Minute: `used/540` (600 - 10% safety margin)
- Hour: `used/4500` (5000 - 10% safety margin)
- Day: `used/9000` (10000 - 10% safety margin)
- Month: `used/270000` (300000 - 10% safety margin)

Überwachung: https://wetter.elmarhepp.de/#dashboard

## Troubleshooting

### Container startet nicht
```bash
docker compose logs app
docker compose up --build  # Rebuild versuchen
```

### Nginx-Error
```bash
sudo nginx -t  # Syntax prüfen
sudo systemctl status nginx
sudo systemctl restart nginx
```

### SSL-Fehler
```bash
sudo certbot renew --dry-run
sudo certbot certificates
```

### Rate Limiting ausgelöst
- Cache-Hit prüfen: `/backend/proxy.php?api=dashboard`
- Warten oder Server neustarten: `docker compose restart app`

## Logs

```bash
# PHP Error Log
docker compose exec app cat /var/log/php-errors.log

# Nginx Access Log
sudo tail -f /var/log/nginx/access.log | grep wetter

# Nginx Error Log
sudo tail -f /var/log/nginx/error.log
```

---

**Zuletzt aktualisiert**: 17. April 2026  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
