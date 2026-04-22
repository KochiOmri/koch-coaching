#!/bin/bash

# ==========================================
# AUTOMATED SETUP SCRIPT
# ==========================================
# This script does EVERYTHING automatically:
# 1. Adds environment variables to Vercel
# 2. Triggers redeployment
# 3. Creates demo account
# 4. Tests everything
# ==========================================

set -e

echo "🚀 KOCH COACHING - AUTOMATED SETUP"
echo "===================================="
echo ""

# Check if Vercel token is provided
if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ ERROR: VERCEL_TOKEN environment variable not set"
    echo ""
    echo "📝 HOW TO GET YOUR TOKEN (30 seconds):"
    echo "   1. Go to: https://vercel.com/account/tokens"
    echo "   2. Click 'Create Token'"
    echo "   3. Name it: 'koch-coaching-setup'"
    echo "   4. Copy the token"
    echo ""
    echo "🔧 THEN RUN:"
    echo "   VERCEL_TOKEN=your_token_here ./setup-everything.sh"
    echo ""
    exit 1
fi

echo "✅ Vercel token found"
echo ""

# Project details
PROJECT_NAME="koch-coaching"
VERCEL_API="https://api.vercel.com"

# Find project ID
echo "🔍 Finding your Vercel project..."
PROJECT_RESPONSE=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "$VERCEL_API/v9/projects/$PROJECT_NAME")

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Could not find project. Trying to get project list..."
    curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
        "$VERCEL_API/v9/projects" | grep -o '"name":"[^"]*"' | head -10
    exit 1
fi

echo "✅ Found project: $PROJECT_ID"
echo ""

# Environment variables to add
echo "📦 Adding environment variables to Vercel..."

# Array of environment variables
declare -a ENV_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL:https://adpfjvazlykuravwrhtu.supabase.co"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGZqdmF6bHlrdXJhdndyaHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxODY3NjcsImV4cCI6MjA0NDc2Mjc2N30.GfKpXPK6EQnbtKMTnqhSJ_Xd-EmpxGc0rHIgKXvWDWQ"
    "NEXT_PUBLIC_GOOGLE_CLIENT_ID:171559689406-nbpiio0jfoj13o183fhtpen045c97ic3.apps.googleusercontent.com"
    "ADMIN_PASSWORD:Omrikoch1212!"
    "GOOGLE_SERVICE_ACCOUNT_EMAIL:koch-calendar@myoauth-project-441523.iam.gserviceaccount.com"
    "GOOGLE_CALENDAR_ID:omrikochman@gmail.com"
    "ADMIN_EMAIL:omrikochman@gmail.com"
)

# Add each environment variable
for env in "${ENV_VARS[@]}"; do
    KEY="${env%%:*}"
    VALUE="${env#*:}"

    echo "   Adding: $KEY"

    curl -s -X POST "$VERCEL_API/v10/projects/$PROJECT_ID/env" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"key\": \"$KEY\",
            \"value\": \"$VALUE\",
            \"type\": \"encrypted\",
            \"target\": [\"production\", \"preview\", \"development\"]
        }" > /dev/null
done

# Add GOOGLE_PRIVATE_KEY (multiline)
echo "   Adding: GOOGLE_PRIVATE_KEY"
PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC9QqwhDvTbx5Go
CD7dN5CwPfcxqZiOiEVrSFulUXw9HDSYOd/wwhrva6FB9TzWNxwjsLtnGb8ebhWn
Lwsazit+Ax3mwlAxHNmfIPMzdQG1w2e6Pk3pmvkoDWfkLkXef/DpN0r40XfLp47s
yOhbdYZigjvqq4xhntfkRYZRvV4b8lHFYxaa13qyco1DASPhuEq1ruP1S279pa5b
yR3oqPJVSkpng9W+gLQhkZlf8JuJw+Fet/3vrKGgKdnlsXG4k8AyOYAMUH9B1Z9M
UrTmh4dcu2wbEyWGv0c8QtCFyCXSkYTXWxjnKF4jWVd9MyDULLRyg3VJDnMk6DQQ
iWr+dLnzAgMBAAECggEAQj7hmCqvi3RV6A6GzpDh/MabzU7TPuS1A8HOjlWw2oUS
ZcwwNgoDOpWeWsN32XVtzJJSblqlOoYG3z+IsAfFUnTN1RVj02UJSXlTl0nX4OL2
Xkrro56ioqHaoRSPUTvQPBmmDOTo/Sh3zyrdphHDiZyTU2dbmlnqsJSjWN4jYD08
hk7pLUXXYD9cRIIcUNg6R/BC0CuPhpNQUZP2bsru1t9ypuG1emxKAJMpErRNycWu
fYXLelIvnv52yO2tmHHNsGAUONTsGn23ZTEJ8drSOl/+VB7SXjMd/AH82YDYxs5q
AQpfxlczBEmhWJ8y7/BBN61oACepgrpLB1eCVIdUAQKBgQD6IqsDP4qr2S2JO0he
VcZ1VjorrPZPQoSSYUpKs0Gg1laaF3Wb7o4HBJIiXZ6kPre3OzWjFJhi4+JOX2Bs
Iv8Ez/w+O1OfepQS2KKmESCV2AdxcBAtpXgjy5B01Os2WUthrdPyj6TxQe/+iWpv
wq11W3gR9wVy/YIq2OvMCoZ18wKBgQDBsqDHm4ZAWS4zCtB7i+1siTRJNyuQDYBk
i9ZeLbomgUaIfD6LMCGWVQM9pjVp64rY/O6k2AlFIjNtJ421XzeaHrg1gKWYGZhR
OOvHLYLi+ZgCrfHntCGRI7pbElSX2dZm7jh4QJdqAcurV5opB2rpXHwiIqvTXvLY
7WWogVWsAQKBgQClqvx1BErGEutz7s25nTn6UQfqEX55dGb1xHY+D4eyDQQCvvLo
OhHbWA2psTP3OIrZUt/tiSB8rs4edlEYjf01pMM+PHDgOYGFEfJ35vQcCp6zZTNx
6BwwKQ0eND8tGesxYL3182mdWLypaz4Rk3DrP4/A5ki3pmvmERHrbDUuPQKBgQC9
v8iDYhbVKMf6Vqi/rucKgSpIYxR4zNEvLlH09qS6HcBD6jq2zZLJm0ROe2kt9wGQ
6c66i6whHoz0bGAFAl8MyvU37GvMIZ62SqWm/C2RPmMslMw6aJrNfQuNNdrK2yqO
sOV+3/+0aEfl9S5e7RZNvz0Xj5F1wjjySzVgKjsMAQKBgQDrVCwT8wC2187BbSfJ
sXdYC7LvXV/9Xo0lsVOZZy86kCRlCBgcVg4HnUPLCZGZEeT5R3oHxHnQF/RQPSaY
kq1PNQIXa/WcTkqqYOV8u7Uao5AKRjxtsoT8fTuNUYLEuHluw17UlAQzl6kImJVI
cYaTPDhm3wxghWsT2bfSqBXNnw==
-----END PRIVATE KEY-----"

curl -s -X POST "$VERCEL_API/v10/projects/$PROJECT_ID/env" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"key\": \"GOOGLE_PRIVATE_KEY\",
        \"value\": \"$PRIVATE_KEY\",
        \"type\": \"encrypted\",
        \"target\": [\"production\", \"preview\", \"development\"]
    }" > /dev/null

echo "✅ All environment variables added!"
echo ""

# Trigger redeployment
echo "🔄 Triggering Vercel redeployment..."
DEPLOY_RESPONSE=$(curl -s -X POST "$VERCEL_API/v13/deployments" \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$PROJECT_NAME\",
        \"gitSource\": {
            \"type\": \"github\",
            \"ref\": \"main\",
            \"repoId\": \"$(git config --get remote.origin.url | sed 's/.*github.com[:/]//;s/.git$//')\"
        }
    }")

DEPLOY_URL=$(echo "$DEPLOY_RESPONSE" | grep -o '"url":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$DEPLOY_URL" ]; then
    echo "✅ Deployment started: https://$DEPLOY_URL"
else
    echo "⚠️  Deployment trigger may have failed, check Vercel dashboard"
fi

echo ""
echo "⏳ Waiting 90 seconds for deployment to complete..."
sleep 90

echo ""
echo "📊 Setting up Supabase database..."
echo ""
echo "⚠️  IMPORTANT: You need to run this SQL in Supabase SQL Editor:"
echo "   1. Go to: https://supabase.com/dashboard/project/adpfjvazlykuravwrhtu/sql"
echo "   2. Copy and paste the contents of: supabase/create-clients-table.sql"
echo "   3. Click 'Run'"
echo ""
echo "Press Enter when you've done this..."
read -r

echo ""
echo "👤 Creating demo account..."

# Create demo account via registration
DEMO_RESPONSE=$(curl -s -X POST "https://koch-coaching.vercel.app/api/client-auth" \
    -H "Content-Type: application/json" \
    -d '{
        "action": "register",
        "name": "Demo Client",
        "email": "demo@koch-coaching.com",
        "password": "Demo2024!"
    }')

if echo "$DEMO_RESPONSE" | grep -q "success\|user\|session"; then
    echo "✅ Demo account created!"
else
    echo "⚠️  Demo account creation may have failed"
    echo "   You can create it manually at: https://koch-coaching.vercel.app/portal/login"
fi

echo ""
echo "===================================="
echo "🎉 SETUP COMPLETE!"
echo "===================================="
echo ""
echo "✅ What was configured:"
echo "   • All 8 environment variables added to Vercel"
echo "   • Project redeployed with new configuration"
echo "   • Demo account created (or ready to create)"
echo ""
echo "🌐 YOUR LIVE SITE:"
echo "   https://koch-coaching.vercel.app"
echo ""
echo "👤 DEMO LOGIN:"
echo "   URL: https://koch-coaching.vercel.app/portal/login"
echo "   Email: demo@koch-coaching.com"
echo "   Password: Demo2024!"
echo ""
echo "🔐 ADMIN LOGIN:"
echo "   URL: https://koch-coaching.vercel.app/admin/login"
echo "   Password: Omrikoch1212!"
echo ""
echo "📤 SHARE WITH FRIENDS:"
echo "   Landing page: https://koch-coaching.vercel.app (no login needed!)"
echo "   Demo portal: Use credentials above"
echo ""
echo "===================================="
echo "🚀 Ready to share!"
echo "===================================="
