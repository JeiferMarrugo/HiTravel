#!/bin/sh
set -e

if [ "$OPENWA_AUTO_START" = "true" ] && [ -n "$OPENWA_WATCHDOG_SECRET" ]; then
  (
    while true; do
      node scripts/openwa-watchdog.mjs || true
      sleep 180
    done
  ) &
fi

exec node server.js
