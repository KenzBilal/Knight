#!/bin/bash
set -euo pipefail

# ─── Knight Auto-Deploy ──────────────────────────────────────────────────────
# Pulls latest code, rebuilds Docker containers, cleans up.
# Triggered by: systemd path unit (git HEAD change), manual run, or CI/CD.

REPO_DIR="/home/kenz/Projects/Knight"
LOG_FILE="$HOME/.local/log/knight-deploy.log"
DEPLOY_MARKER="/tmp/knight-deploy-running"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

# Prevent concurrent deploys
if [ -f "$DEPLOY_MARKER" ]; then
  pid=$(cat "$DEPLOY_MARKER" 2>/dev/null)
  if kill -0 "$pid" 2>/dev/null; then
    log "SKIP: Deploy already running (PID $pid)"
    exit 0
  fi
  rm -f "$DEPLOY_MARKER"
fi

echo $$ > "$DEPLOY_MARKER"
trap 'rm -f "$DEPLOY_MARKER"' EXIT

cd "$REPO_DIR"

log "=== Deploy started ==="

# Pull latest code
log "Pulling latest code..."
git fetch origin master 2>&1 | tee -a "$LOG_FILE"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/master)

if [ "$LOCAL" = "$REMOTE" ]; then
  log "Already up to date ($LOCAL). Skipping rebuild."
  exit 0
fi

git pull origin master 2>&1 | tee -a "$LOG_FILE"
NEW=$(git rev-parse HEAD)
log "Updated: $LOCAL → $NEW"

# Rebuild and restart Docker containers
log "Rebuilding Docker containers..."
docker compose up -d --build --remove-orphans 2>&1 | tee -a "$LOG_FILE"

# Clean up old images
docker image prune -f 2>&1 | tee -a "$LOG_FILE"

log "=== Deploy complete: $NEW ==="
