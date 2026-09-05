# Deployment der Wetter-App

Die App läuft auf **nuernberg-16gb bei netcup**, zusammen mit zwölf anderen. Der
gemeinsame Unterbau — Server, nginx, Zertifikate, Sicherungen, Regeln — ist im
Repo `platform` beschrieben und wird hier **nicht wiederholt**, sondern verlinkt:

- `platform/DEPLOYMENT.md` — Nachschlagewerk pro App, Prüfschritte, Störungen
- `platform/ARCHITEKTUR.md` — warum die Regeln gelten, Compose-Skelett, Anti-Patterns
- `platform/NEUE-APP.md` — der Weg von der Idee bis zur Live-Schaltung

Was hier steht, ist das, was nur wetter betrifft.

## Eckdaten

| Was                | Wert                                        |
| ------------------ | ------------------------------------------- |
| Domain             | `wetter.elmarhepp.de`                       |
| Port               | `3031` (nur `127.0.0.1`)                    |
| Verzeichnis        | `/var/www/wetter`                           |
| Container          | `wetter-app` (Compose-Service `wetter`)     |
| Branch             | `main`                                      |
| Persistenz         | Dateien im Arbeitsverzeichnis (Cache, Zähler) |
| Datenbank          | keine — **nicht** an `pg-shared`            |

## Stack

- **PHP 8.2 CLI** mit Built-in Server, Router `index.php`
- **Frontend**: Vue 3 und Chart.js vom CDN, Tailwind-CSS im Repo gebaut
- **Backend**: `backend/proxy.php` — Open-Meteo-Proxy mit Rate-Limiting und Cache
- **Reverse Proxy**: Host-nginx, TLS über certbot

Das Frontend wird **nicht** im Container gebaut. Der Container bindet das
Arbeitsverzeichnis ein (`.:/app`) und PHP liefert die Dateien direkt aus — ein
`git pull` genügt für Frontend-Änderungen. Neu gebaut werden muss nur, wenn sich
`Dockerfile` oder `docker-compose.yml` ändern.

**Ausnahme, die man leicht übersieht:** `frontend/style.css` ist ein Build-Ergebnis
von Tailwind und liegt im Repo. Wer `src/tailwind.css` ändert, baut lokal mit
`make build` und committet das Ergebnis mit — auf dem Server läuft kein npm.

## Deploy

```sh
ssh elmarhepp 'cd /var/www/wetter && ./deploy.sh'
```

Das Skript zieht `git pull origin main`, legt bei Bedarf `.env.production` an,
baut und startet den Container und prüft am Ende, ob die Seite antwortet.

> **Es hieß bis zum 5. September 2026 `deploy-hetzner.sh`.** Der Name nannte einen
> Anbieter, den es hier seit dem Umzug am 15. August nicht mehr gibt. Wer auf einem
> alten Server-Stand steht, ruft einmalig noch den alten Namen auf; danach ist die
> Datei umbenannt.

**Der nginx-Vhost gehört nicht ins Repo.** Er liegt unter
`/etc/nginx/sites-available/wetter.conf` und wird von certbot gepflegt. Bis zum
5. September kopierte das Deploy-Skript eine Repo-Fassung darüber und nahm damit
jede certbot-Änderung beim nächsten Deploy stillschweigend zurück. Ein neuer Vhost
wird nach `platform/NEUE-APP.md` angelegt, nicht aus diesem Repo.

## Nach dem Deploy prüfen

```sh
ssh elmarhepp 'cd /var/www/wetter && docker compose ps'   # Up, healthy
curl -sI https://wetter.elmarhepp.de/ | head -1           # 200
curl -s 'https://wetter.elmarhepp.de/backend/proxy.php?api=dashboard' | head -c 200
```

UptimeRobot prüft `/` auf das Schlüsselwort `Wetter`
(`platform/deploy/uptimerobot/README.md`). Wer die Startseite umbaut, lässt das
Wort stehen — sonst meldet der Prüfer einen Ausfall, den es nicht gibt.

## Rate Limits

Der Proxy zählt gegen vier Grenzen, je 10 % unter dem Limit von Open-Meteo:
540/Minute, 4500/Stunde, 9000/Tag, 270000/Monat. Der Live-Stand steht im Reiter
**Monitoring** und unter `?api=dashboard`.

## Störungen

| Symptom | Ursache | Prüfen |
|---|---|---|
| 502 im Browser | Container unten | `docker compose ps`, `docker compose logs wetter` |
| CSS oder JS als 404 | Pfade in `frontend/index.html` müssen absolut sein (`/frontend/…`), `index.php` normalisiert das Präfix | `curl -I https://wetter.elmarhepp.de/frontend/style.css` |
| Styling fehlt nach Änderung | `frontend/style.css` nicht neu gebaut oder nicht committet | lokal `make build`, committen |
| Rate Limit ausgelöst | Cache greift nicht | `?api=dashboard`, dann `docker compose restart wetter` |
| Zertifikat abgelaufen | certbot-Timer | `platform/DEPLOYMENT.md` 5 |

```sh
# Logs
ssh elmarhepp 'cd /var/www/wetter && docker compose logs -f wetter'
```

---

**Zuletzt geprüft**: 5. September 2026 — gegen den Stand des Repos `platform`.
