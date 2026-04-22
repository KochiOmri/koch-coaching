# 🔧 FIX ENVIRONMENT VARIABLES - MANUAL CHECK

## The Problem
Still getting "Failed to fetch" means the environment variables might not be set correctly in Vercel.

---

## ✅ STEP 1: Verify Environment Variables in Vercel (2 minutes)

### Go to Vercel Dashboard:
👉 **https://vercel.com/kochiomris-projects/koch-coaching/settings/environment-variables**

### Check if you see ALL 8 variables:

Look for these in the list:
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- [ ] `ADMIN_PASSWORD`
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- [ ] `GOOGLE_CALENDAR_ID`
- [ ] `ADMIN_EMAIL`
- [ ] `GOOGLE_PRIVATE_KEY`

---

## 🚨 IF ANY ARE MISSING - ADD THEM NOW:

### Click "Add New" and add these one by one:

**1. NEXT_PUBLIC_SUPABASE_URL**
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://adpfjvazlykuravwrhtu.supabase.co
Environment: ✓ Production ✓ Preview ✓ Development
```

**2. NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGZqdmF6bHlrdXJhdndyaHR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxODY3NjcsImV4cCI6MjA0NDc2Mjc2N30.GfKpXPK6EQnbtKMTnqhSJ_Xd-EmpxGc0rHIgKXvWDWQ
Environment: ✓ Production ✓ Preview ✓ Development
```

**3. NEXT_PUBLIC_GOOGLE_CLIENT_ID**
```
Key: NEXT_PUBLIC_GOOGLE_CLIENT_ID
Value: 171559689406-nbpiio0jfoj13o183fhtpen045c97ic3.apps.googleusercontent.com
Environment: ✓ Production ✓ Preview ✓ Development
```

**4. ADMIN_PASSWORD**
```
Key: ADMIN_PASSWORD
Value: Omrikoch1212!
Environment: ✓ Production ✓ Preview ✓ Development
```

**5. GOOGLE_SERVICE_ACCOUNT_EMAIL**
```
Key: GOOGLE_SERVICE_ACCOUNT_EMAIL
Value: koch-calendar@myoauth-project-441523.iam.gserviceaccount.com
Environment: ✓ Production ✓ Preview ✓ Development
```

**6. GOOGLE_CALENDAR_ID**
```
Key: GOOGLE_CALENDAR_ID
Value: omrikochman@gmail.com
Environment: ✓ Production ✓ Preview ✓ Development
```

**7. ADMIN_EMAIL**
```
Key: ADMIN_EMAIL
Value: omrikochman@gmail.com
Environment: ✓ Production ✓ Preview ✓ Development
```

**8. GOOGLE_PRIVATE_KEY**
```
Key: GOOGLE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----
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
-----END PRIVATE KEY-----

Environment: ✓ Production ✓ Preview ✓ Development
```

**IMPORTANT for GOOGLE_PRIVATE_KEY:**
- Copy the ENTIRE key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- Keep all the line breaks
- Don't add extra spaces

---

## ✅ STEP 2: After Adding Variables - Redeploy

### Once all 8 variables are added:

1. **Go to:** https://vercel.com/kochiomris-projects/koch-coaching
2. **Click "Deployments" tab**
3. **Click the 3 dots (...)** on the latest deployment
4. **Click "Redeploy"**
5. **Wait 2-3 minutes** for deployment to complete

---

## ✅ STEP 3: Test Again

**After redeployment is "Ready":**

1. **Open incognito window**
2. **Go to:** https://koch-coaching.vercel.app/portal/login
3. **Click "Register"**
4. **Fill in:**
   - Name: Demo Client
   - Email: demo@koch-coaching.com
   - Password: Demo2024!
5. **Click "Create Account"**

**Should work now!** ✅

---

## 🔍 HOW TO CHECK IF VARIABLES ARE SET:

In Vercel dashboard, you should see something like:

```
Environment Variables (8)

NEXT_PUBLIC_SUPABASE_URL          Production, Preview, Development
NEXT_PUBLIC_SUPABASE_ANON_KEY     Production, Preview, Development
NEXT_PUBLIC_GOOGLE_CLIENT_ID      Production, Preview, Development
ADMIN_PASSWORD                     Production, Preview, Development
GOOGLE_SERVICE_ACCOUNT_EMAIL       Production, Preview, Development
GOOGLE_CALENDAR_ID                 Production, Preview, Development
ADMIN_EMAIL                        Production, Preview, Development
GOOGLE_PRIVATE_KEY                 Production, Preview, Development
```

If you see less than 8, some are missing!

---

## 📸 SEND ME A SCREENSHOT

If still not working after this, send me a screenshot of:
1. Vercel → Settings → Environment Variables page
2. The "Failed to fetch" error in browser console (F12 → Console tab)

I'll help you debug it!

---

**Go to Vercel now and check those environment variables!** 🔧
