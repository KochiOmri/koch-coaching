#!/bin/bash
# ============================================================
# Google Calendar Setup Helper
# ============================================================
# Run this AFTER downloading the JSON key from Google Cloud.
#
# Usage:
#   bash setup-google-calendar.sh /path/to/your-key-file.json
#
# It reads the JSON key and updates your .env.local automatically.
# ============================================================

if [ -z "$1" ]; then
  echo ""
  echo "Usage: bash setup-google-calendar.sh <path-to-json-key>"
  echo ""
  echo "Example: bash setup-google-calendar.sh ~/Downloads/koch-coaching-abc123.json"
  echo ""
  exit 1
fi

JSON_FILE="$1"

if [ ! -f "$JSON_FILE" ]; then
  echo "Error: File not found: $JSON_FILE"
  exit 1
fi

# Extract values from the JSON key file
EMAIL=$(python3 -c "import json; f=open('$JSON_FILE'); d=json.load(f); print(d['client_email'])")
KEY=$(python3 -c "import json; f=open('$JSON_FILE'); d=json.load(f); print(d['private_key'])")

if [ -z "$EMAIL" ] || [ -z "$KEY" ]; then
  echo "Error: Could not read the JSON key file."
  exit 1
fi

echo ""
echo "Found service account: $EMAIL"
echo ""

# Ask for Calendar ID
read -p "Enter your Google Calendar ID (usually your email, e.g. omrikochman@gmail.com): " CALENDAR_ID

if [ -z "$CALENDAR_ID" ]; then
  CALENDAR_ID="omrikochman@gmail.com"
fi

# Update .env.local
ENV_FILE=".env.local"

# Remove old Google Calendar lines if they exist
grep -v "GOOGLE_SERVICE_ACCOUNT_EMAIL" "$ENV_FILE" | grep -v "GOOGLE_PRIVATE_KEY" | grep -v "GOOGLE_CALENDAR_ID" > "$ENV_FILE.tmp"
mv "$ENV_FILE.tmp" "$ENV_FILE"

# Add new values
cat >> "$ENV_FILE" << ENVEOF

# --- Google Calendar (auto-configured) ---
GOOGLE_SERVICE_ACCOUNT_EMAIL=$EMAIL
GOOGLE_PRIVATE_KEY="$KEY"
GOOGLE_CALENDAR_ID=$CALENDAR_ID
ENVEOF

echo ""
echo "Done! Your .env.local has been updated."
echo ""
echo "Next steps:"
echo "  1. Go to Google Calendar → Settings → Share with: $EMAIL"
echo "  2. Give it 'Make changes to events' permission"
echo "  3. Restart the dev server: npm run dev"
echo "  4. Book a test appointment and check your Google Calendar!"
echo ""
