# Deploying to Oracle Cloud (Always Free)

Runs the whole stack — Postgres, the FastAPI model service, this web app, and
Caddy for HTTPS — on one Always Free ARM VM with Docker Compose. Always on, no
cold starts.

## 1. Account

1. Sign up at <https://www.oracle.com/cloud/free/>. Oracle asks for a card to
   verify identity; Always Free resources are not charged.
2. Pick the **home region** carefully — it can't be changed later and Always
   Free VMs can only be created there. Singapore (`ap-singapore-1`) is the
   closest to the Philippines; if it reports "Out of capacity" for the ARM
   shape, try again later or choose another region at signup.
3. **Recommended: upgrade to Pay As You Go** (Billing → Upgrade). Always Free
   resources stay free, but Oracle can reclaim Always Free VMs it considers
   idle for 7 days on free-only accounts, and this app is light enough to look
   idle. Set a budget alert (Billing → Budgets) at, say, $1 so any accidental
   paid resource is flagged immediately.

## 2. Create the VM

Compute → Instances → **Create instance**:

| Setting | Value |
|---|---|
| Image | Canonical Ubuntu 24.04 (the **aarch64** build) |
| Shape | `VM.Standard.A1.Flex` — 2 OCPU, 12 GB memory |
| Networking | Create a new VCN with a **public subnet**; assign a public IPv4 address |
| SSH key | Paste your public key (see below) |

Stay within the Always Free A1 allowance shown on Oracle's
[Always Free Resources](https://docs.oracle.com/iaas/Content/FreeTier/resourceref.htm)
page — Oracle reduced it in 2026, and exceeding it disables the instances.
2 OCPU / 12 GB is far more than this app needs.

Make an SSH key for the server on your own machine first:

```bash
ssh-keygen -t ed25519 -f ~/.ssh/oracle_handa
```

Paste the contents of `~/.ssh/oracle_handa.pub` into the SSH key field. Note
the instance's **public IP** once it's running.

## 3. Open ports 80 and 443

Two firewalls need it.

**Oracle's network firewall** — Networking → Virtual Cloud Networks → your VCN
→ Security Lists → Default Security List → **Add Ingress Rules**: source
`0.0.0.0/0`, TCP, destination port `80`; and a second rule for port `443`.

**The VM's own firewall** — Oracle's Ubuntu images ship iptables rules that
block everything except SSH. Connect and allow the web ports:

```bash
ssh -i ~/.ssh/oracle_handa ubuntu@<PUBLIC_IP>
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## 4. Install Docker

On the VM:

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git
sudo usermod -aG docker ubuntu
exit   # log out and back in so the docker group applies
```

## 5. Get the code

Both repos go side by side — `docker-compose.yml` builds the backend from
`../project-handa-backend`.

```bash
git clone https://github.com/dardeejay/fuck-ass-thesis-frontend.git project-handa
git clone https://github.com/dardeejay/fuck-ass-thesis-backend.git project-handa-backend
```

Add `-b <branch>` to both if deploying something other than `main`.

## 6. Configure

```bash
cd project-handa
cp .env.production.example .env
nano .env
```

- `DOMAIN` — with no domain of your own, use the public IP with dashes on
  sslip.io: IP `129.213.10.42` → `129-213-10-42.sslip.io`. Caddy gets a real
  HTTPS certificate for it automatically.
- `AUTH_SECRET`, `POSTGRES_PASSWORD`, `SEED_ADMIN_PASSWORD` — generate each with
  `openssl rand -base64 32` (pick something memorable for the admin password;
  it's what you sign in with).
- `OPENWEATHER_API_KEY` — your OpenWeatherMap key.

## 7. Start

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

The first build takes several minutes. Then:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml ps
```

`postgres`, `handa-api`, `web` and `caddy` should be running, and `migrate`
should have exited with code 0 (it creates the tables and the admin account).
Open `https://<DOMAIN>` and sign in with `SEED_ADMIN_EMAIL` /
`SEED_ADMIN_PASSWORD`.

Everything restarts on its own after a reboot (`restart: unless-stopped`).

## Updating

```bash
cd ~/project-handa-backend && git pull
cd ~/project-handa && git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Re-running the seed on each deploy never resets an existing admin's password.

## Backups

```bash
docker compose exec postgres pg_dump -U postgres project_handa > handa-$(date +%F).sql
```

## Troubleshooting

- **Site doesn't load / certificate errors** — port 80 or 443 is still blocked
  (step 3), or `DOMAIN` doesn't point at this VM's IP. Check
  `docker compose -f docker-compose.yml -f docker-compose.prod.yml logs caddy`.
- **Container won't start, "set X in .env"** — a required value in `.env` is
  empty.
- **Dashboard shows "fallback" data-source badges** — an upstream (PAGASA,
  OpenWeatherMap, Open-Meteo) was unreachable from the VM. Some government
  sites block cloud IP ranges; the app keeps working on fallbacks and says so.
- **Logs** — `docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f web handa-api`.
