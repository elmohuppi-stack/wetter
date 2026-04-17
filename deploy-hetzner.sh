#!/bin/bash
set -e

APP_SLUG="wetter"
DEPLOY_PATH="/var/www/wetter"
FRONTEND_DOMAIN="wetter.elmarhepp.de"
WEB_PORT="3031"

echo "=== Wetter App Deployment auf Hetzner ==="

# 1. Clone/update repository
echo "1. Repository prüfen..."
if [ ! -d "$DEPLOY_PATH" ]; then
    echo "   → Klone Repository nach $DEPLOY_PATH"
    cd /var/www
    git clone https://github.com/elmohuppi-stack/wetter.git wetter
else
    echo "   → Update Repository"
    cd "$DEPLOY_PATH"
    git pull origin master
fi

# 2. .env prüfen
echo "2. .env-Datei prüfen..."
if [ ! -f "$DEPLOY_PATH/.env.production" ]; then
    echo "   → Erstelle .env.production"
    cat > "$DEPLOY_PATH/.env.production" << EOF
APP_DOMAIN=wetter.elmarhepp.de
WEB_PORT=3031
DEPLOY_PATH=$DEPLOY_PATH
EOF
else
    echo "   → .env.production existiert bereits"
fi

# 3. Docker network erstellen (falls nicht vorhanden)
echo "3. Docker network prüfen..."
docker network create hetzner-network 2>/dev/null || echo "   → Network existiert bereits"

# 4. Docker Compose bauen und starten
echo "4. Docker Compose bauen und starten..."
cd "$DEPLOY_PATH"
docker compose up -d --build

# 5. Nginx-Konfiguration einrichten
echo "5. Nginx konfigurieren..."
sudo cp "$DEPLOY_PATH/wetter-nginx.conf" "/etc/nginx/sites-available/$APP_SLUG.conf"
sudo ln -sf "/etc/nginx/sites-available/$APP_SLUG.conf" "/etc/nginx/sites-enabled/$APP_SLUG.conf"

# 6. Nginx testen und reloaden
echo "6. Nginx validieren und reloaden..."
sudo nginx -t
sudo systemctl reload nginx

# 7. SSL via Certbot einrichten
echo "7. SSL-Zertifikat einrichten (falls nicht vorhanden)..."
sudo certbot --nginx -d "$FRONTEND_DOMAIN" --non-interactive --agree-tos -m admin@elmarhepp.de || echo "   → Certbot Fehler oder Zertifikat existiert bereits"

# 8. Verifikation
echo ""
echo "=== Verifikation ==="
echo "   → Docker Status:"
docker compose ps -a
echo ""
echo "   → Nginx Test:"
sudo nginx -t
echo ""
echo "   → App erreichbar unter: https://$FRONTEND_DOMAIN"
echo "   → Health-Check: curl -I https://$FRONTEND_DOMAIN/"
echo ""
echo "✅ Deployment abgeschlossen!"
