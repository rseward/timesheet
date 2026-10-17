# Deploy Timesheet to podman2024.bluestone-consulting.net

**Goal:** Run the timesheet app as a rootless podman container (as rseward) on podman2024 behind the existing Nginx Proxy Manager, with persistent SQLite data at /home/rseward/data/timesheet/. LAN-only deployment for personal use. Dogfooding the CI container image to verify it works.

**Architecture:** Push main to GitHub to trigger CI build on ghcr.io. Pull the image on podman2024 as rseward. Run rootless podman on port 8082. NPM proxies timesheet.bluestone-consulting.net to it. Database copied from existing workstation instance.

**Tech Stack:** Podman 5.8.2 (Fedora 42), Nginx Proxy Manager v2.11.2, multi-stage Dockerfile (Vue.js + FastAPI + nginx), SQLite

**Related tickets:** #282 (copy icon feature, already committed), #283 (patch start.sh for alembic auto-migration)

---

## Current State (verified Oct 2 2026)

- Ticket #282 (copy icon on Description column) is already committed on main (4523551) locally on beleg
- Source repo: /home/mercury/src/github/timesheet on beleg (this workstation, 192.168.1.17)
- Git tags exist: v0.3.2 is the latest. Main has NOT been pushed since the #282 commit.
- CI workflow (.github/workflows/docker-build.yml) pushes to ghcr.io/rseward/timesheet on push to main and on v* tags
- podman2024: Fedora 42 Server (192.168.1.66), podman 5.8.2, 3.8GB RAM (3.3GB used), 57GB free disk
- NPM already running on podman2024 as root podman containers (ports 80/81/443)
- NPM admin user: rseward@bluestone-consulting.com (password needed — not stored here)
- Existing containers on podman2024: nginx-proxy-manager-app-1, searxng, ourwiki, gitlab, prometheus, grafana, prometheus_snmp_exporter, plus others (all root system podman)
- rseward user on podman2024: uid=1000, wheel group, home /home/rseward (exists but empty, no data dir yet, no rootless podman storage yet)
- Existing NPM proxy pattern: ourwiki.bluestone-consulting.net -> MoinMoin on 192.168.1.78:8181

### Ports in use on podman2024
22, 53, 80, 81, 443, 2222, 3000, 3030, 3031, 5080, 5355, 5443, 6379, 8000, 8080, 8088, 8443, 9090, 9116, 9191

### Selected port for timesheet container
8082 (free). Container exposes 80 internally (nginx). Map host 8082 -> container 80.

### DNS
Add OPNsense Unbound host override: timesheet.bluestone-consulting.net -> 192.168.1.66 (same pattern as ourwiki). See "Task 5: Add OPNsense DNS" below.

---

## Decisions (resolved)

- **Domain:** timesheet.bluestone-consulting.net (LAN-only, OPNsense Unbound host override)
- **Podman mode:** Rootless as rseward (uid 1000) on podman2024
- **Container port:** 8082:80
- **Data directory:** /home/rseward/data/timesheet/ (owned by rseward)
- **Database source:** Copy existing SQLite from workstation (beleg), not a fresh DB
- **Image source:** CI build from ghcr.io (dogfooding the artifact). Fallback: local build + scp.
- **NPM admin:** rseward@bluestone-consulting.com (password not stored in this plan)
- **SSL:** Not needed for LAN-only deployment. HTTP through NPM is sufficient. Can add Let's Encrypt later if external access is ever needed (requires public DNS).

---

## Plan

### Task 1: Push main to GitHub (triggers CI image build on ghcr.io)

**Objective:** Get the #282 commit pushed so CI builds the image, and so the repo is current.

**Steps (on beleg):**

```bash
cd /home/mercury/src/github/timesheet
git log --oneline -3
# Verify 4523551 is HEAD with the copy icon commit
git push origin main
```

This triggers the GitHub Actions workflow that builds and pushes to ghcr.io/rseward/timesheet:main. The CI build uses the multi-stage Dockerfile (frontend build with npx vite build, backend deps, nginx runtime).

**Verification:**
- Check GitHub Actions tab for build status
- Image will be at ghcr.io/rseward/timesheet:main once CI completes

---

### Task 2: Pull the ghcr.io image on podman2024 (dogfood the CI artifact)

**Objective:** Pull the pre-built image from GitHub Container Registry as rseward.

**Prerequisite:** Task 1 CI build must complete. The ghcr image is private by default, so rseward on podman2024 needs to authenticate.

**Steps (on podman2024 as rseward):**

```bash
# SSH to podman2024: ssh rseward@192.168.1.66
# Create a GitHub PAT with read:packages scope if not already available
# Login to ghcr.io
podman login ghcr.io -u rseward -p <GITHUB_PAT>

# Pull the image
podman pull ghcr.io/rseward/timesheet:main

# Tag it for convenience
podman tag ghcr.io/rseward/timesheet:main timesheet-app:latest
```

**Fallback (if CI is unavailable or image is private and PAT is problematic):**

Build locally on beleg and transfer:

```bash
# On beleg:
cd /home/mercury/src/github/timesheet
make docker    # Builds timesheet-app:latest
podman save -o /tmp/timesheet-app.tar timesheet-app:latest
scp /tmp/timesheet-app.tar rseward@192.168.1.66:/tmp/timesheet-app.tar

# On podman2024 as rseward:
podman load -i /tmp/timesheet-app.tar
rm /tmp/timesheet-app.tar
```

**Verification:**
```bash
podman images | grep timesheet
# Should show timesheet-app:latest (or ghcr.io/rseward/timesheet:main)
```

---

### Task 3: Create the data directory and copy the database

**Objective:** Set up the persistent SQLite database location and copy the existing data from beleg.

**Steps (on podman2024 as rseward):**

```bash
# SSH: ssh rseward@192.168.1.66
mkdir -p /home/rseward/data/timesheet/
```

**Steps (on beleg — copy the existing database):**

```bash
# Find the current SQLite database location on beleg
# Check the env file for the path:
cat /home/mercury/src/github/timesheet/env 2>/dev/null || cat /home/mercury/src/github/timesheet/.env 2>/dev/null
# Look for TIMESHEET_SQLITE or TIMESHEET_SA_URL

# Copy the database to podman2024
scp <path-to-timesheet.sqlite> rseward@192.168.1.66:/home/rseward/data/timesheet/timesheet.sqlite
```

**Note:** The existing database already has the schema (alembic migrations applied). The start.sh alembic upgrade (ticket #283) will be a no-op on this database. This means the container can start immediately without waiting for the #283 fix.

---

### Task 4: Run the container on podman2024 (rootless as rseward)

**Objective:** Start the timesheet container with persistent storage.

**Steps (on podman2024 as rseward):**

```bash
# SSH: ssh rseward@192.168.1.66
podman run -d \
  --name timesheet-app \
  -p 8082:80 \
  -v /home/rseward/data/timesheet:/data:Z \
  -e TIMESHEET_SQLITE=/data/timesheet.sqlite \
  -e TIMESHEET_SRC_HOME=/app/src \
  -e TIMESHEET_SA_URL=sqlite:////data/timesheet.sqlite \
  --restart unless-stopped \
  timesheet-app:latest
```

The `:Z` suffix on the volume mount is required for SELinux relabeling (Fedora 42 enforces SELinux). Without it, the container cannot write to /data.

**Verification:**
```bash
podman ps | grep timesheet
# Should show running, port 8082->80

# Health check
curl -s http://127.0.0.1:8082/api/health
# Should return JSON health status

# Test the frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/
# Should return 200
```

---

### Task 5: Add OPNsense DNS host override

**Objective:** Add timesheet.bluestone-consulting.net -> 192.168.1.66 to OPNsense Unbound DNS so LAN clients can resolve the hostname.

**Steps (on OPNsense at 192.168.1.1):**

Via OPNsense web UI:
1. Services > Unbound DNS > Overrides > Host Overrides
2. Add a new host override:
   - Host: timesheet
   - Domain: bluestone-consulting.net
   - IP Address: 192.168.1.66
   - Description: Timesheet app on podman2024
3. Save and apply

Via OPNsense SSH (if CLI preferred):
```bash
# SSH: ssh friday@proxmoxve (then access OPNsense VM) or directly to OPNsense
# The Unbound restart command from memory:
cd /var/unbound && killall unbound && sleep 1 && unbound -c /var/unbound/unbound.conf
```

**Verification (from any LAN machine):**
```bash
host timesheet.bluestone-consulting.net
# Should resolve to 192.168.1.66

# Or:
nslookup timesheet.bluestone-consulting.net
```

---

### Task 6: Configure NPM proxy host

**Objective:** Route traffic from timesheet.bluestone-consulting.net through NPM to the timesheet container on port 8082. HTTP only (LAN deployment, no SSL needed).

**Steps via NPM Admin UI (http://podman2024.bluestone-consulting.net:81/):**

1. Log in to NPM admin panel (rseward@bluestone-consulting.com)
2. Go to Proxy Hosts > Add Proxy Host
3. Configure:
   - Domain Names: timesheet.bluestone-consulting.net
   - Scheme: http
   - Forward Hostname: 192.168.1.66
   - Forward Port: 8082
   - Block Common Exploits: enabled
   - Websockets Support: enabled
4. Save (no SSL needed for LAN-only)

**Important:** NPM runs inside a root container. The rseward rootless container on port 8082 is accessible from the host network at 192.168.1.66:8082. NPM should be able to reach it via the host IP. If NPM cannot reach 192.168.1.66:8082, check if the rootless podman container is binding to 0.0.0.0 or only localhost. Rootless podman with `-p 8082:80` binds to 0.0.0.0 by default on Fedora.

**Verification:**
```bash
# From any LAN machine
curl -s -o /dev/null -w "%{http_code}" http://timesheet.bluestone-consulting.net/
# Should return 200

# Test API through the proxy
curl -s http://timesheet.bluestone-consulting.net/api/health
```

---

### Task 7: Verify the deployed app

**Objective:** Confirm ticket #282's feature is live and the container image works correctly (dogfooding).

**Steps:**

```bash
# 1. Health check through NPM
curl -s http://timesheet.bluestone-consulting.net/api/health

# 2. Load the frontend in a browser
# Navigate to http://timesheet.bluestone-consulting.net/
# Log in, go to the Enter Time page (HoursView)
# Verify: hovering over a Description cell shows a copy icon
# Click the copy icon -> description text copied to clipboard

# 3. Check container logs for any errors (on podman2024 as rseward)
podman logs timesheet-app --tail 50

# 4. Check nginx and fastapi are both running inside the container
podman exec timesheet-app curl -s http://localhost/api/health
podman exec timesheet-app curl -s http://localhost:8080/api/health
```

---

### Task 8: Set up container auto-start on boot

**Objective:** Ensure the timesheet container survives reboots. Uses Quadlet (podman 5.x recommended approach).

**Steps (on podman2024 as rseward):**

```bash
# Enable lingering so user services start at boot (requires sudo once)
sudo loginctl enable-linger rseward

# Create Quadlet directory
mkdir -p /home/rseward/.config/containers/systemd/
```

Create the Quadlet file at `/home/rseward/.config/containers/systemd/timesheet.container`:

```ini
[Unit]
Description=Timesheet Application

[Container]
Image=ghcr.io/rseward/timesheet:sha-5f2fc91
ContainerName=timesheet-app
PublishPort=8082:80
Volume=/home/rseward/data/timesheet:/data:Z
Environment=TIMESHEET_SQLITE=/data/timesheet.sqlite
Environment=TIMESHEET_SRC_HOME=/app/src
Environment=TIMESHEET_SA_URL=sqlite:////data/timesheet.sqlite

[Service]
Restart=always

[Install]
WantedBy=default.target
```

**Important:** `TIMESHEET_SA_URL` must use four slashes for an absolute path
(`sqlite:////data/timesheet.sqlite`), not three. With three slashes SQLAlchemy
interprets the path as relative and the container will fail with "unable to
open database file".

Then:
```bash
systemctl --user daemon-reload
systemctl --user start timesheet
```

Note: `systemctl --user enable timesheet` is NOT needed and will fail with
"Unit is transient or generated". The Quadlet generator processes the
`[Install]` section during `daemon-reload` and creates the
`default.target.wants` symlink automatically. Verify with
`systemctl --user is-enabled timesheet` (should report `generated`).

**Verification:**
```bash
systemctl --user status timesheet
# Should show active (running)

podman ps | grep timesheet
# Should show the container running

curl -s http://127.0.0.1:8082/api/health
# Should return {"status":"healthy"}
```

---

## Related Work

- **Ticket #282** (resolved): Copy icon on Description column. Already committed (4523551), will be live once deployed.
- **Ticket #283** (open): Patch docker/start.sh to run `alembic upgrade head` on first boot. Not blocking for this deployment since the database is being copied from the existing workstation instance (schema already migrated). The fix is needed for future fresh deployments from the container image.

## Files Changed

- No source code changes needed for deployment
- README.md already updated with build/deploy docs
- This plan saved to both:
  - /home/mercury/.hermes/plans/2026-10-02_143000-deploy-timesheet-podman2024.md (Hermes plan)
  - /home/mercury/src/github/timesheet/docs/deploy-podman2024.md (project copy, linked to ticket #283)

## Risks

1. **Memory constraints:** podman2024 has 3.8GB RAM with 3.3GB already in use. The timesheet container (nginx + FastAPI + Python) is lightweight (~100-200MB). GitLab is the likely memory hog. Monitor after deployment.

2. **SELinux:** Fedora 42 enforces SELinux. Volume mount uses `:Z` flag. If the container can't write to /data, verify with `ls -Z /home/rseward/data/timesheet/` and check audit logs with `sudo ausearch -m avc -ts recent`.

3. **Rootless port binding:** Rootless podman binds to 0.0.0.0 by default, but if the container can only bind to high ports without root, port 8082 should be fine (above 1024). NPM on the same host should reach it via 192.168.1.66:8082.

4. **NPM reaching rootless container:** NPM runs as a root container. The rseward rootless container is on the host network at 192.168.1.66:8082. If NPM can't reach it, alternative is to use `--network host` on the timesheet container (loses port isolation) or put both on the same podman network (complicated with mixed root/rootless).

5. **Database compatibility:** The existing SQLite DB from beleg must be compatible with the container's backend version. Since the same code is deployed, this should be a non-issue. If the container's alembic version is ahead of the DB, run `alembic upgrade head` manually.

6. **CI image availability:** ghcr.io/rseward/timesheet may be private. If rseward on podman2024 can't authenticate, fall back to local build + scp (Task 2 fallback).