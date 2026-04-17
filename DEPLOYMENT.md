# Wetter-App Deployment auf Hetzner

Deployment-Konfiguration für die Wetter-App auf dem zentralen Hetzner-Multi-App-Server.

## Konfiguration

| Variable           | Wert                  |
| ------------------ | --------------------- |
| `APP_SLUG`         | `wetter`              |
| `FRONTEND_DOMAIN`  | `wetter.elmarhepp.de` |
| `WEB_PORT`         | `3031`                |
| `DEPLOY_PATH`      | `/var/www/wetter`     |
| `Docker Container` | `wetter-app`          |

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

Oder manuell (wichtig: 2-Schritt Prozess für SSL!):

```bash
# 1. Repository klonen
cd /var/www
git clone https://github.com/elmohuppi-stack/wetter.git wetter
cd wetter

# 2. .env vorbereiten
cat > .env.production << EOF
APP_DOMAIN=wetter.elmarhepp.de
WEB_PORT=3031
DEPLOY_PATH=/var/www/wetter
EOF

# 3. Docker Network erstellen (einmalig pro Server)
docker network create hetzner-network || true

# 4. Docker Compose starten
docker compose up -d --build

# 5. Nginx HTTP-only Config (Certbot braucht HTTP!)
sudo tee /etc/nginx/sites-available/wetter.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name wetter.elmarhepp.de;

    location / {
        proxy_pass http://127.0.0.1:3031;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/wetter.conf /etc/nginx/sites-enabled/wetter.conf
sudo nginx -t
sudo systemctl reload nginx

# 6. SSL-Zertifikat (certbot ändert Config zu HTTPS automatisch)
sudo certbot --nginx -d wetter.elmarhepp.de --non-interactive --agree-tos -m admin@elmarhepp.de

# 7. Verifikation
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

### Asset 404 Fehler (CSS, JS nicht gefunden)

**Problem**: Browser zeigt `Failed to load resource: the server responded with a status of 404`

**Ursache**: Falsche Pfade in `frontend/index.html` oder Router normalisiert nicht

**Lösung prüfen**:
1. `frontend/index.html` muss absolute Pfade haben:
   ```html
   <link rel="stylesheet" href="/frontend/style.css" />
   <script src="/frontend/src/main.js"></script>
   ```

2. `index.php` muss `/frontend/` Prefix normalisieren (verhindert Verdopplung):
   ```php
   if (strpos($path, '/frontend/') === 0) {
       $normalized_path = substr($path, strlen('/frontend'));
   }
   ```

3. Browser-Cache leeren: `Cmd+Shift+R` (macOS) oder `Ctrl+Shift+R`

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

### SSL-Fehler beim Deploy

**Problem**: `cannot load certificate... No such file or directory`

**Ursache**: Nginx Config hat SSL Paths, aber Cert existiert noch nicht

**Lösung**: Erst HTTP-only Config, dann Certbot, dann Nginx reload:
```bash
# HTTP-only Nginx Config
sudo tee /etc/nginx/sites-available/wetter.conf > /dev/null << 'EOF'
server {
    listen 80;
    server_name wetter.elmarhepp.de;
    location / {
        proxy_pass http://127.0.0.1:3031;
        # ... headers ...
    }
}
EOF

# Dann SSL mit Certbot
sudo certbot --nginx -d wetter.elmarhepp.de --non-interactive --agree-tos -m admin@elmarhepp.de
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
