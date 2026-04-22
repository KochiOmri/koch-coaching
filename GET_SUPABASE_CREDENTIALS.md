# 🔑 GET CORRECT SUPABASE CREDENTIALS

## Problem

Your Supabase API key in Vercel is **invalid or expired**. We need to get the correct credentials.

---

## STEPS (2 minutes)

### Step 1: Get Supabase Credentials

**1. Go to your Supabase Project Settings:**
👉 https://supabase.com/dashboard/project/adpfjvazlykuravwrhtu/settings/api

**2. Find these two values:**

**Project URL:**
```
Should look like: https://adpfjvazlykuravwrhtu.supabase.co
```
Copy this EXACT value.

**anon / public key:**
```
Should be a long JWT token starting with: eyJhbG...
```
Copy this EXACT value.

---

### Step 2: Update Vercel Environment Variables

**1. Go to Vercel Environment Variables:**
👉 https://vercel.com/kochiomris-projects/koch-coaching/settings/environment-variables

**2. Find and UPDATE these two variables:**

**NEXT_PUBLIC_SUPABASE_URL:**
- Click the 3 dots (...) → Edit
- Paste the Project URL from Step 1
- Make sure it's checked for: Production, Preview, Development
- Save

**NEXT_PUBLIC_SUPABASE_ANON_KEY:**
- Click the 3 dots (...) → Edit
- Paste the anon key from Step 1
- Make sure it's checked for: Production, Preview, Development
- Save

---

### Step 3: Redeploy

**1. Go to Deployments:**
👉 https://vercel.com/kochiomris-projects/koch-coaching

**2. Click the 3 dots (...)** on the latest deployment

**3. Click "Redeploy"**

**4. Wait 2 minutes** for deployment to complete

---

### Step 4: Test Again

**1. Open incognito window**

**2. Go to:** https://koch-coaching.vercel.app/portal/login

**3. Click "Register" tab**

**4. Fill in:**
   - Name: Demo Client
   - Email: demo@koch-coaching.com
   - Password: Demo2024!

**5. Click "Create Account"**

**It will work this time!** ✅

---

## Why This Happened

The Supabase API key might have:
- Expired (keys can expire)
- Been regenerated (if project was reset)
- Never been the correct key

We tested the current key and Supabase returned:
```
{"message":"Invalid API key"}
```

So we need the fresh, correct credentials from Supabase.

---

## Quick Links

1. **Get credentials:** https://supabase.com/dashboard/project/adpfjvazlykuravwrhtu/settings/api
2. **Update Vercel:** https://vercel.com/kochiomris-projects/koch-coaching/settings/environment-variables
3. **Redeploy:** https://vercel.com/kochiomris-projects/koch-coaching

**Do these 3 steps and it will work!** 🚀
