#!/bin/sh
set -eu

CONFIG_PATH="/app/build/client/config.js"
CONFIG_JSON="{}"

if [ -n "${PUBLIC_API_BASE:-}" ]; then
    esc=$(printf '%s' "$PUBLIC_API_BASE" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
    CONFIG_JSON="{\"API_BASE\":\"$esc\"}"
fi

cat > "$CONFIG_PATH" <<EOF
window.__CONFIG__ = $CONFIG_JSON;
EOF

exec "$@"
