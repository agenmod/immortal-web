#!/bin/bash
set -euo pipefail

PROJECT_DIR="/opt/projects/immortal-web"
NGINX_CONF="/etc/nginx/conf.d/symbiotime.com.conf"
HEALTH_TIMEOUT=60

BLUE_PORT=3002
GREEN_PORT=3003
BLUE_CONTAINER="immortal-web-blue"
GREEN_CONTAINER="immortal-web-green"

cd "$PROJECT_DIR"

# ── detect which slot is currently live ──
current_port=$(grep -oP 'proxy_pass http://127\.0\.0\.1:\K\d+' "$NGINX_CONF" | head -1)

if [ "$current_port" = "$GREEN_PORT" ]; then
  LIVE="green";  LIVE_PORT=$GREEN_PORT;  LIVE_CTR=$GREEN_CONTAINER
  NEXT="blue";   NEXT_PORT=$BLUE_PORT;   NEXT_CTR=$BLUE_CONTAINER
else
  LIVE="blue";   LIVE_PORT=$BLUE_PORT;   LIVE_CTR=$BLUE_CONTAINER
  NEXT="green";  NEXT_PORT=$GREEN_PORT;  NEXT_CTR=$GREEN_CONTAINER
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  当前活跃: $LIVE (port $LIVE_PORT)"
echo "  即将部署: $NEXT (port $NEXT_PORT)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. pull latest code ──
echo "[1/6] 拉取最新代码..."
git pull origin main

# ── 2. build & start the NEXT slot ──
echo "[2/6] 构建新版本 ($NEXT)..."
docker compose build "$NEXT"

echo "[3/6] 启动新容器 ($NEXT_CTR)..."
docker compose up -d "$NEXT"

# ── 3. wait for health check ──
echo "[4/6] 等待健康检查 (最多 ${HEALTH_TIMEOUT}s)..."
elapsed=0
while [ $elapsed -lt $HEALTH_TIMEOUT ]; do
  if curl -sf "http://127.0.0.1:${NEXT_PORT}/api/health" > /dev/null 2>&1; then
    echo "  ✓ $NEXT_CTR 健康检查通过 (${elapsed}s)"
    break
  fi
  sleep 2
  elapsed=$((elapsed + 2))
  echo "  ... 等待中 (${elapsed}s)"
done

if [ $elapsed -ge $HEALTH_TIMEOUT ]; then
  echo "  ✗ 健康检查超时！回滚..."
  docker compose stop "$NEXT"
  echo "  部署失败，旧版本仍在运行。"
  exit 1
fi

# ── 4. switch nginx to NEXT slot ──
echo "[5/6] 切换 nginx → port $NEXT_PORT..."
sed -i "s|proxy_pass http://127.0.0.1:${LIVE_PORT}|proxy_pass http://127.0.0.1:${NEXT_PORT}|g" "$NGINX_CONF"
nginx -t && nginx -s reload

echo "  ✓ 流量已切换到 $NEXT_CTR"

# ── 5. graceful stop old slot ──
echo "[6/6] 优雅停止旧容器 ($LIVE_CTR)..."
sleep 5
docker compose stop "$LIVE"

# ── cleanup old images ──
docker image prune -f > /dev/null 2>&1 || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ 部署完成！"
echo "  活跃: $NEXT (port $NEXT_PORT)"
echo "  已停: $LIVE (port $LIVE_PORT)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
