#!/bin/sh
set -e

CONFIG_DIR="/usr/share/nginx/html/assets/config"
CONFIG_FILE="${CONFIG_DIR}/app-config.json"

# Ensure config directory exists
mkdir -p "${CONFIG_DIR}"

# Generate runtime config from environment variables
# Defaults to localhost if API_URL is not provided
cat > "${CONFIG_FILE}" <<EOF
{
  "apiUrl": "${API_URL:-http://localhost:50551/}"
}
EOF

echo "============================================="
echo " Nutriciosa Admin Frontend"
echo "============================================="
echo " API_URL: ${API_URL:-http://localhost:50551/}"
echo " Config:  ${CONFIG_FILE}"
echo "============================================="

# Validate JSON was written correctly
if [ ! -s "${CONFIG_FILE}" ]; then
  echo "ERROR: Failed to generate config file"
  exit 1
fi

# Start Nginx
exec nginx -g 'daemon off;'
