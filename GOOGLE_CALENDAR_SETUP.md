# Google Calendar Setup Guide for KOCH Coaching

Follow these steps to connect your website's booking system to your Google Calendar.
When a client books an appointment, it will automatically appear in your Google Calendar.

---

## Step 1: Create a Google Cloud Project

1. Go to: https://console.cloud.google.com/
2. Sign in with **omrikochman@gmail.com**
3. Click the project dropdown at the top → **"New Project"**
4. Name it: `koch-coaching`
5. Click **Create**

## Step 2: Enable the Google Calendar API

1. Go to: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com
2. Make sure the `koch-coaching` project is selected at the top
3. Click **"Enable"**

## Step 3: Create a Service Account

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **"+ Create Service Account"**
3. Name: `koch-calendar`
4. Click **Create and Continue**
5. For "Role", select **"Editor"** → click **Continue**
6. Click **Done**

## Step 4: Create a Key for the Service Account

1. Click on the service account you just created (`koch-calendar`)
2. Go to the **"Keys"** tab
3. Click **"Add Key"** → **"Create new key"**
4. Choose **JSON** → click **Create**
5. A JSON file will download — **keep this file safe!**

## Step 5: Share Your Google Calendar

1. Open Google Calendar: https://calendar.google.com
2. On the left sidebar, hover over **"Omri Kochman"** calendar → click the 3 dots → **"Settings and sharing"**
3. Scroll to **"Share with specific people or groups"**
4. Click **"+ Add people and groups"**
5. Paste the service account email (from the JSON file, looks like: `koch-calendar@koch-coaching.iam.gserviceaccount.com`)
6. Set permission to: **"Make changes to events"**
7. Click **Send**

## Step 6: Get Your Calendar ID

1. Still in Calendar Settings, scroll to **"Integrate calendar"**
2. Copy the **Calendar ID** (usually looks like your email: `omrikochman@gmail.com`)

## Step 7: Update Your .env.local

Open the downloaded JSON key file and copy the values into your `.env.local`:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=koch-calendar@koch-coaching.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...your-key-here...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=omrikochman@gmail.com
```

The `client_email` field in the JSON = GOOGLE_SERVICE_ACCOUNT_EMAIL
The `private_key` field in the JSON = GOOGLE_PRIVATE_KEY
Your calendar email = GOOGLE_CALENDAR_ID

## Done!

Restart the dev server and book a test appointment. It should appear in your Google Calendar within seconds!
