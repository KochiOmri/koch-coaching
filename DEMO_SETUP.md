# 🎯 DEMO ACCOUNT SETUP GUIDE
## Koch Coaching Platform - Share with Friends

This guide will help you create demo accounts and populate your platform with sample data so friends can explore it.

---

## 📧 DEMO CREDENTIALS

### Client Portal Demo
- **URL:** https://koch-coaching.vercel.app/portal/login
- **Email:** `demo@koch-coaching.com`
- **Password:** `Demo2024!`

### Admin Portal Demo
- **URL:** https://koch-coaching.vercel.app/admin/login
- **Password:** `Omrikoch1212!` (your existing admin password)

---

## 🚀 STEP 1: CREATE DEMO CLIENT ACCOUNT

### Option A: Via Registration Form (Recommended - 2 minutes)

1. **Open:** https://koch-coaching.vercel.app/portal/login
2. **Click:** "Register" or "Sign Up" tab
3. **Fill in:**
   - Name: `Demo Client`
   - Email: `demo@koch-coaching.com`
   - Password: `Demo2024!`
4. **Click:** "Sign Up"
5. **Done!** Account is created

### Option B: Via Admin Portal (3 minutes)

1. **Log into admin:** https://koch-coaching.vercel.app/admin/login
2. **Go to:** Clients → Add New Client
3. **Create client with above credentials**

---

## 📊 STEP 2: ADD DEMO DATA

To make the demo impressive, add sample data via your admin portal:

### 2.1 Add Sample Exercises (5 minutes)

**Admin Portal → Exercises → Add New**

Create 3-5 exercises with these examples:

**Exercise 1: Standing March**
- **Name:** Standing March - Gait Integration
- **Description:** Functional Patterns standing march drill to integrate proper pelvic positioning during gait cycle
- **Video URL:** https://www.youtube.com/watch?v=dQw4w9WgXcQ (replace with real FP video)
- **Category:** Gait Training
- **Duration:** 3 sets x 20 reps

**Exercise 2: Wall Plank Reach**
- **Name:** Wall Plank with Contralateral Reach
- **Description:** Core stability drill emphasizing rotational control and anti-extension
- **Video URL:** https://www.youtube.com/watch?v=example
- **Category:** Core Stability
- **Duration:** 3 sets x 10 reps each side

**Exercise 3: Split Stance RDL**
- **Name:** Split Stance Romanian Deadlift
- **Description:** Posterior chain loading with proper hip hinge mechanics
- **Video URL:** https://www.youtube.com/watch?v=example
- **Category:** Hip Mechanics
- **Duration:** 3 sets x 12 reps

### 2.2 Create Training Program (3 minutes)

**Admin Portal → Programs → Create New**

**Program Name:** 12-Week Foundation Program
**Description:** Comprehensive biomechanics retraining focusing on gait optimization and postural correction

**Add exercises to program:**
- Standing March - 3x20 (Week 1-4)
- Wall Plank Reach - 3x10 (Week 1-12)
- Split Stance RDL - 3x12 (Week 5-12)

**Assign to:** Demo Client

### 2.3 Add Sample Appointments (2 minutes)

**Admin Portal → Appointments → Add New**

Create 2-3 past appointments:
- **Date:** Last week
- **Client:** Demo Client
- **Type:** Initial Assessment
- **Status:** Completed

### 2.4 Add Progress Notes (2 minutes)

**Admin Portal → Session Notes**

**Sample Note:**
```
Client: Demo Client
Date: [last week]
Session Type: Initial Assessment

Assessment Notes:
- Anterior pelvic tilt observed during standing
- Left hip internal rotation limitation
- Gait analysis reveals excessive lumbar extension during stance phase
- Client reports chronic lower back discomfort (4/10 pain scale)

Training Focus:
- Initiated standing march protocol to address pelvic positioning
- Myofascial release on hip flexors and TFL
- Core bracing cues with breathing integration

Homework:
- Daily standing march practice 2x10 reps
- Hip flexor stretch 2 minutes each side
- Diaphragmatic breathing 5 minutes daily

Next Session Goals:
- Re-assess pelvic positioning
- Progress to split stance work
- Video gait analysis comparison
```

---

## 📤 STEP 3: SHARE WITH FRIENDS

### Copy-Paste Email Template

```
Subject: Check out my coaching platform! 🎯

Hey!

I've been building a biomechanics coaching platform and would love your feedback.

Try it out with this demo account:

🌐 Website: https://koch-coaching.vercel.app

👤 Demo Login:
- URL: https://koch-coaching.vercel.app/portal/login
- Email: demo@koch-coaching.com
- Password: Demo2024!

What you can do:
✓ View your training programs
✓ Browse exercise library with videos
✓ See progress tracking
✓ Book appointments
✓ Message with coach
✓ Track pain scores

The platform is built with:
- Next.js 16 (React)
- Supabase (database & auth)
- Tailwind CSS
- Real-time messaging
- AI posture analysis
- Google Calendar integration

Let me know what you think!

- Omri
```

### Copy-Paste WhatsApp Message

```
Hey! 👋

Check out my coaching platform: https://koch-coaching.vercel.app

Try the demo:
Email: demo@koch-coaching.com
Password: Demo2024!

Would love your feedback! 💪
```

### Copy-Paste Social Media Post

```
🚀 Just launched my biomechanics coaching platform!

Built with Next.js, Supabase, and real-time features.

Try the demo:
🔗 koch-coaching.vercel.app
📧 demo@koch-coaching.com
🔑 Demo2024!

Features:
✅ Training programs
✅ Exercise library
✅ Progress tracking
✅ Appointment booking
✅ Real-time messaging
✅ AI posture analysis

#NextJS #WebDev #Coaching #FunctionalPatterns
```

---

## 🎨 STEP 4: OPTIONAL ENHANCEMENTS

### Add Profile Photo for Demo Client

1. Admin → Clients → Demo Client
2. Upload a generic fitness photo
3. Adds visual appeal to the portal

### Add Before/After Photos

1. Admin → Clients → Demo Client → Progress
2. Upload sample transformation photos
3. Makes the demo more realistic

### Customize Landing Page

Your admin panel has a **Content** section where you can edit:
- Hero headline
- About section
- Services description
- Testimonials
- Contact info (already updated with WhatsApp!)

---

## ✅ VERIFICATION CHECKLIST

Before sharing, verify:

- [ ] Demo account can log in at portal/login
- [ ] Demo client sees assigned training program
- [ ] Exercise videos load correctly
- [ ] Appointments are visible in dashboard
- [ ] Progress notes are readable
- [ ] WhatsApp button shows your phone number (+972 54-619-7111)
- [ ] Landing page loads properly
- [ ] Mobile responsive (test on phone)

---

## 🛟 TROUBLESHOOTING

### Demo account can't log in
- Verify account was created in Supabase
- Check Vercel environment variables are set
- Try password reset via "Forgot Password"

### WhatsApp button not showing
- Check `data/site-content.json` has `whatsappNumber: "972546197111"`
- Redeploy on Vercel

### Exercises not showing
- Verify exercises are created in admin panel
- Check they're assigned to the training program
- Ensure program is assigned to Demo Client

### Need help?
- Check Vercel deployment logs
- Check Supabase logs
- Email: omrikochman@gmail.com

---

## 📊 ANALYTICS

Track demo usage:
- Vercel Analytics (built-in)
- Supabase Dashboard → Authentication (see user signups)
- Admin Portal → Dashboard (see appointment bookings)

---

## 🎯 NEXT STEPS

**After friends try the demo:**

1. **Collect Feedback**
   - What did they like?
   - What was confusing?
   - Any bugs?

2. **Iterate**
   - Fix reported issues
   - Add requested features
   - Improve UX based on feedback

3. **Launch for Real Clients**
   - Remove demo data
   - Create real client accounts
   - Start onboarding actual coaching clients!

---

## 🚀 DEPLOYMENT INFO

**Current Status:**
- ✅ GitHub: https://github.com/KochiOmri/koch-coaching
- ✅ Production: https://koch-coaching.vercel.app
- ✅ Auto-deploy: Every push to `main` branch

**Tech Stack:**
- Framework: Next.js 16.1.6
- Database: Supabase (PostgreSQL)
- Auth: Google OAuth + Email/Password
- Hosting: Vercel
- Analytics: Vercel Analytics

---

## 📞 CONTACT FOR DEMO

**Your Info (already on site):**
- Email: omrikochman@gmail.com
- Phone: +972 54-619-7111
- WhatsApp: Same number (button on landing page)
- Location: Israel
- Hours: Sun-Thu 09:00-18:00, Fri 09:00-13:00

---

**Created by:** Claude Code 🤖
**Date:** April 21, 2026
**Version:** 1.0

Good luck with your demo! 🎉
