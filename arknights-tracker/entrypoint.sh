#!/bin/sh
set -eu

CONFIG_PATH="/app/build/client/config.js"
API_BASE_VAL="${PUBLIC_API_BASE:-}"
AUDIO_BASE_VAL="${PUBLIC_AUDIO_BASE:-}"

JSON_PARTS=""

if [ -n "$API_BASE_VAL" ]; then
    esc_api=$(printf '%s' "$API_BASE_VAL" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
    JSON_PARTS="\"API_BASE\":\"$esc_api\""
fi

if [ -n "$AUDIO_BASE_VAL" ]; then
    esc_audio=$(printf '%s' "$AUDIO_BASE_VAL" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g')
    if [ -n "$JSON_PARTS" ]; then
        JSON_PARTS="$JSON_PARTS,\"AUDIO_BASE\":\"$esc_audio\""
    else
        JSON_PARTS="\"AUDIO_BASE\":\"$esc_audio\""
    fi
fi

cat > "$CONFIG_PATH" <<EOF
window.__CONFIG__ = {$JSON_PARTS};
EOF

exec "$@"
