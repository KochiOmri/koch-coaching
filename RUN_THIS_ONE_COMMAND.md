# ⚡ ONE COMMAND TO DO EVERYTHING

## Step 1: Get Your Vercel Token (30 seconds)

1. **Open:** https://vercel.com/account/tokens
2. **Click:** "Create Token"
3. **Name:** `koch-coaching-setup`
4. **Scope:** Full Account
5. **Click:** "Create"
6. **Copy the token** (starts with `vercel_...` or similar)

---

## Step 2: Run ONE Command (2 minutes)

**Open Terminal and run:**

```bash
cd "/Users/omrikochman/Documents/Island Code/koch-coaching"

VERCEL_TOKEN=paste_your_token_here ./setup-everything.sh
```

**Replace `paste_your_token_here` with the token you just copied!**

**Example:**
```bash
VERCEL_TOKEN=vercel_abc123xyz ./setup-everything.sh
```

---

## ✅ What This Does Automatically:

1. ✅ Adds ALL 8 environment variables to Vercel
2. ✅ Triggers automatic redeployment
3. ✅ Creates demo account
4. ✅ Tests everything
5. ✅ **DONE!**

---

## 🎉 After It Finishes (2-3 minutes):

**Your site is READY!**

**Share with friends:**
```
Landing page: https://koch-coaching.vercel.app
(No login needed - anyone can view!)

Demo login:
URL: https://koch-coaching.vercel.app/portal/login
Email: demo@koch-coaching.com
Password: Demo2024!
```

---

## ⚠️ If You Get Errors:

**Error: "VERCEL_TOKEN environment variable not set"**
- You forgot to add `VERCEL_TOKEN=` before the command
- Copy-paste the full command with your token

**Error: "Could not find project"**
- Your token may not have the right permissions
- Make sure you selected "Full Account" when creating the token

**Error: "curl: command not found"**
- Unlikely on macOS, but if it happens, let me know

---

## 🚀 THAT'S IT!

**One command, everything done automatically.**

No manual clicking, no dashboard navigation, no copying/pasting variables one by one.

**Just run the command and wait 2-3 minutes!**

---

## 📞 Need Help?

If the command fails:
1. Copy the error message
2. Screenshot what happened
3. Let me know and I'll fix it!

---

**Ready? Get your token and run the command!** 🎯
