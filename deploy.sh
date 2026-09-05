#!/bin/bash
set -e

# Deploy der Wetter-App auf nuernberg-16gb (netcup).
#
# Das Skript hieß bis zum 5. September 2026 deploy-hetzner.sh — der Server steht
# seit dem 15. August bei netcup, der Name nannte einen Anbieter, den es hier
# nicht mehr gibt. Jetzt heißt es wie bei knora und mediathek deploy.sh.
#
# Es fasst den nginx-Vhost nicht mehr an. Der lebt unter
# /etc/nginx/sites-available/wetter.conf und wird von certbot gepflegt; das
# frühere Kopieren aus dem Repo hat jede certbot-Änderung beim nächsten Deploy
# stillschweigend zurückgenommen.

APP_SLUG="wetter"
DEPLOY_PATH="/var/www/wetter"
FRONTEND_DOMAIN="wetter.elmarhepp.de"

echo "=== Deploy $APP_SLUG ==="

# 1. Repository aktualisieren
echo "1. Repository aktualisieren..."
if [ ! -d "$DEPLOY_PATH" ]; then
    echo "   → Klone Repository nach $DEPLOY_PATH"
    cd /var/www
    git clone https://github.com/elmohuppi-stack/wetter.git wetter
else
    echo "   → git pull origin main"
    cd "$DEPLOY_PATH"
    git pull origin main
fi

# 2. .env prüfen
echo "2. .env-Datei prüfen..."
if [ ! -f "$DEPLOY_PATH/.env.production" ]; then
    echo "   → Erstelle .env.production"
    cat > "$DEPLOY_PATH/.env.production" << ENVFILE
APP_DOMAIN=$FRONTEND_DOMAIN
WEB_PORT=3031
DEPLOY_PATH=$DEPLOY_PATH
ENVFILE
else
    echo "   → .env.production existiert bereits"
fi

# 3. Container bauen und starten
echo "3. Docker Compose bauen und starten..."
cd "$DEPLOY_PATH"
docker compose up -d --build

# 4. Verifikation
echo ""
echo "=== Verifikation ==="
docker compose ps
echo ""
curl -sI "https://$FRONTEND_DOMAIN/" | head -1
echo ""
echo "✅ Deployment abgeschlossen — https://$FRONTEND_DOMAIN"
