# KOCH Coaching Platform

A full-stack coaching platform built with **Next.js 16**, **Supabase**, and **Tailwind CSS**. It includes a public landing page, an admin back-office, and a client portal -- all in one codebase.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [The Three Portals](#the-three-portals)
4. [Tech Stack](#tech-stack)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Database (Supabase)](#database-supabase)
8. [Authentication](#authentication)
9. [Google Calendar Integration](#google-calendar-integration)
10. [API Routes](#api-routes)
11. [Mobile / iPhone Support](#mobile--iphone-support)
12. [Development Progress](#development-progress)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER                          │
│                                                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Landing  │  │ Admin Portal │  │Client Portal │  │
│  │ Page     │  │ /admin/*     │  │ /portal/*    │  │
│  │ /        │  │              │  │              │  │
│  └────┬─────┘  └──────┬───────┘  └──────┬───────┘  │
│       │               │                │           │
└───────┼───────────────┼────────────────┼───────────┘
        │               │                │
   ┌────▼───────────────▼────────────────▼────┐
   │           Next.js 16 App Router          │
   │                                          │
   │  proxy.ts ─── Session cookie refresh     │
   │  /api/*   ─── REST API endpoints         │
   │  /app/*   ─── Pages (SSR + Client)       │
   │                                          │
   └──────────────┬───────────────────────────┘
                  │
        ┌─────────▼──────────┐
        │     Supabase       │
        │  ┌───────────────┐ │
        │  │ PostgreSQL DB │ │
        │  │ (profiles,    │ │
        │  │  appointments,│ │
        │  │  messages...) │ │
        │  └───────────────┘ │
        │  ┌───────────────┐ │
        │  │ Auth (OAuth)  │ │
        │  │ Google SSO    │ │
        │  └───────────────┘ │
        │  ┌───────────────┐ │
        │  │ Realtime      │ │
        │  │ (Messages)    │ │
        │  └───────────────┘ │
        └────────────────────┘
```

### How requests flow

1. **User visits a page** -- Next.js renders it (server or client component).
2. **`proxy.ts`** runs on every request to `/admin/*`, `/portal/*`, `/auth/*` -- it refreshes the Supabase session cookie so the user stays logged in.
3. **Client components** use the `useAuth()` hook to check if the user is logged in and get their profile (name, email, role).
4. **API routes** (`/api/*`) handle data operations. They check if Supabase is configured; if yes, they use it. If not, they fall back to local JSON files in the `data/` folder.
5. **Supabase Row Level Security (RLS)** enforces that users can only access their own data. Admins can access everything via the `is_admin()` function.

---

## Project Structure

```
koch-coaching/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing page (public)
│   │   ├── layout.tsx          # Root layout (fonts, meta, analytics)
│   │   ├── globals.css         # Tailwind + theme variables
│   │   │
│   │   ├── admin/              # Admin portal
│   │   │   ├── login/page.tsx  # Admin login (Google OAuth + password)
│   │   │   ├── dashboard/      # Stats, calendar, chart
│   │   │   ├── clients/        # Client management
│   │   │   ├── appointments/   # Appointment management
│   │   │   ├── exercises/      # Exercise library
│   │   │   ├── programs/       # Training programs
│   │   │   ├── messages/       # Chat with clients
│   │   │   ├── session-notes/  # Session documentation
│   │   │   ├── videos/         # Video management
│   │   │   ├── availability/   # Schedule settings
│   │   │   └── ... (20+ admin pages)
│   │   │
│   │   ├── portal/             # Client portal
│   │   │   ├── login/page.tsx  # Client login (Google + email)
│   │   │   ├── dashboard/      # Client home
│   │   │   ├── appointments/   # View/book appointments
│   │   │   ├── exercises/      # Exercise videos
│   │   │   ├── progress/       # Pain scores, posture
│   │   │   ├── messages/       # Chat with coach
│   │   │   ├── billing/        # Packages & payments
│   │   │   └── program/[id]/   # Program detail
│   │   │
│   │   ├── auth/
│   │   │   └── callback/       # OAuth redirect handler
│   │   │
│   │   ├── api/                # REST API routes (30+ endpoints)
│   │   │   ├── appointments/
│   │   │   ├── clients/
│   │   │   ├── messages/
│   │   │   ├── exercises/
│   │   │   └── ...
│   │   │
│   │   ├── blog/               # Blog (MDX)
│   │   ├── classes/            # Public group classes
│   │   ├── intake/             # Intake form
│   │   └── refer/[code]/       # Referral landing
│   │
│   ├── components/             # Reusable UI components (21 files)
│   │   ├── AdminSidebar.tsx    # Admin navigation + auth guard
│   │   ├── PortalNav.tsx       # Client navigation + auth guard
│   │   ├── Hero.tsx            # Landing hero section
│   │   ├── BookingForm.tsx     # Appointment booking
│   │   └── ...
│   │
│   ├── lib/                    # Business logic & integrations (21 files)
│   │   ├── supabase/           # Supabase clients (browser, server, db)
│   │   ├── google-calendar.ts  # Google Calendar sync
│   │   ├── email.ts            # Email notifications (Resend)
│   │   ├── stripe.ts           # Payment processing
│   │   └── ...
│   │
│   ├── hooks/                  # React hooks
│   │   ├── useAuth.ts          # Authentication state
│   │   └── useIsMobile.ts      # Mobile detection
│   │
│   └── proxy.ts                # Session refresh (Next.js 16 proxy)
│
├── data/                       # JSON data (fallback when no Supabase)
├── supabase/                   # Database schema & migrations
├── public/                     # Static files, PWA manifest
└── content/blog/               # Blog posts (MDX)
```

---

## The Three Portals

### 1. Landing Page (`/`)

The public-facing website. A single-page design with sections:

- **Hero** -- Video background with CTA
- **About** -- Coach introduction
- **Video Showcase** -- Transformation videos
- **FP Methodology** -- Functional Patterns explanation
- **Services** -- Available coaching services
- **Before/After** -- Client transformation slider
- **Results** -- Testimonials
- **Booking Form** -- Schedule a consultation
- **Footer** -- Contact info

All content is editable from the admin portal (CMS-driven).

### 2. Admin Portal (`/admin`)

The coach's back-office. Protected by Google OAuth (admin role required).

| Page | What it does |
|------|-------------|
| Dashboard | Stats overview, calendar, bookings chart |
| Clients | View/manage all clients |
| Appointments | Manage bookings, sync with Google Calendar |
| Session Notes | Document each session |
| Exercises | Build exercise library with videos |
| Programs | Create training programs, assign to clients |
| Videos | Manage video content |
| Messages | Real-time chat with clients |
| Availability | Set working hours and blocked dates |
| Packages | Create service packages with pricing |
| Billing | (via Stripe when configured) |
| Intake Forms | Review client intake submissions |
| Posture Analysis | AI-powered posture assessment |
| Referrals | Track client referral program |
| Content | Edit landing page text/images (CMS) |
| Design | Customize colors, fonts, theme |
| Marketing | Campaign management |
| Social Media | Social feed integration |
| WhatsApp | Message templates |
| Integrations | External service connections |
| Group Classes | Schedule and manage group sessions |

### 3. Client Portal (`/portal`)

What clients see after logging in. Protected by Supabase Auth.

| Page | What it does |
|------|-------------|
| Dashboard | Welcome, active package, programs, referral code |
| Appointments | View upcoming, book new (calendar picker) |
| Exercises | Browse exercise video library with filters |
| Progress | Pain scores, session notes, posture analysis |
| Messages | Real-time chat with coach |
| Billing | View packages, make payments |
| Program Detail | View assigned program with exercises |

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16.1 (App Router) | Full-stack React with SSR |
| Database | Supabase (PostgreSQL) | Auth, DB, realtime, storage |
| Styling | Tailwind CSS 4 | Utility-first, responsive |
| Auth | Supabase Auth (Google OAuth) | Secure, session-based |
| Icons | Lucide React | Consistent icon set |
| Animations | Framer Motion | Smooth transitions |
| Calendar | Google Calendar API | Appointment sync |
| Payments | Stripe | Secure payments |
| Email | Resend | Transactional emails |
| Hosting | Vercel | Zero-config Next.js |
| PWA | Service Worker + Manifest | Mobile installable |
| Analytics | Vercel Analytics | Page views, web vitals |

---

## Getting Started

### Prerequisites

- **Node.js 18+** (recommended: 20+)
- **npm** (comes with Node.js)
- A **Supabase** account (free tier works)
- A **Google Cloud** project (for OAuth + Calendar)

### Step 1: Install dependencies

```bash
cd koch-coaching
npm install
```

### Step 2: Set up environment variables

Copy the example and fill in your values:

```bash
cp .env.local.example .env.local
```

See [Environment Variables](#environment-variables) for details on each variable.

### Step 3: Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings > API** and copy your URL and anon key
3. Run the schema SQL in the **SQL Editor**:
   - First: `supabase/schema.sql`
   - Then: `supabase/fix-all-rls-recursion.sql`
4. Set up Google OAuth provider in **Authentication > Providers > Google**

### Step 4: Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

- Admin: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Portal: [http://localhost:3000/portal/login](http://localhost:3000/portal/login)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `ADMIN_PASSWORD` | Yes | Fallback admin password |
| `ADMIN_EMAIL` | Yes | Admin notification email |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | For calendar | Service account email |
| `GOOGLE_PRIVATE_KEY` | For calendar | Service account private key |
| `GOOGLE_CALENDAR_ID` | For calendar | Your calendar email |
| `RESEND_API_KEY` | For emails | Resend API key |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | For payments | Stripe webhook secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | For payments | Stripe publishable key |

---

## Database (Supabase)

### Dual-mode data layer

The app works in two modes:

1. **Supabase mode** (production): All data lives in PostgreSQL via Supabase.
2. **JSON fallback** (development): Data is stored in `data/*.json` files.

API routes automatically detect which mode to use via `isSupabaseConfigured()`.

### Key tables

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts (linked to Supabase Auth) |
| `appointments` | Bookings with date, time, service |
| `clients` | Client information |
| `exercises` | Exercise library |
| `programs` | Training programs |
| `session_notes` | Coach's session documentation |
| `messages` | Real-time chat messages |
| `packages` | Service packages and pricing |
| `client_packages` | Which client bought which package |
| `referrals` | Referral program tracking |
| `posture_analyses` | AI posture assessments |
| `intake_forms` | Client intake submissions |
| `group_classes` | Group class schedules |
| `site_content` | CMS content for landing page |
| `site_design` | Theme/design settings |

### Row Level Security (RLS)

Every table has RLS policies that ensure:
- **Admins** can read/write everything (via `is_admin()` function)
- **Clients** can only read their own data
- **Public tables** (exercises, packages, site content) are readable by everyone

The `is_admin()` function uses `SECURITY DEFINER` to bypass RLS when checking the admin role, preventing infinite recursion.

---

## Authentication

### How it works

1. **Google OAuth** is the primary login method for both admin and client portals.
2. **Supabase Auth** manages sessions via secure HTTP-only cookies.
3. **`proxy.ts`** refreshes the session cookie on every request (Next.js 16 proxy pattern).
4. **`useAuth()` hook** provides the current user and profile to client components.

### Auth flow (step by step)

```
User clicks "Sign in with Google"
  → Supabase redirects to Google
  → User signs in at Google
  → Google redirects to /auth/callback?code=xxx
  → callback/route.ts exchanges code for session
  → Session cookies are set on the response
  → User is redirected to dashboard
  → useAuth() hook reads the session and fetches the profile
  → AdminSidebar / PortalNav show the UI (or redirect if not authorized)
```

### Admin vs Client

- **Admin**: Must have `role = 'admin'` in the `profiles` table.
- **Client**: Any authenticated user can access the client portal.

---

## Google Calendar Integration

When configured, appointments created in the admin portal or via the booking form automatically sync to your Google Calendar.

### Setup steps

1. Enable **Google Calendar API** in Google Cloud Console
2. Create a **Service Account** and download the JSON key
3. Share your Google Calendar with the service account email
4. Add credentials to `.env.local`

See `GOOGLE_CALENDAR_SETUP.md` for detailed instructions.

---

## API Routes

All API routes are in `src/app/api/`. They follow a consistent pattern:

```typescript
// Dual-mode: Supabase first, JSON fallback
if (isSupabaseConfigured()) {
  const db = await getDb();
  // ... use Supabase
} else {
  // ... use JSON file
}
```

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/appointments` | GET, POST | List/create appointments |
| `/api/appointments/[id]` | GET, PUT, DELETE | Single appointment |
| `/api/appointments/slots` | GET | Available time slots |
| `/api/clients` | GET, POST | List/create clients |
| `/api/exercises` | GET, POST | Exercise library |
| `/api/exercises/[id]` | GET, PUT, DELETE | Single exercise |
| `/api/programs` | GET, POST | Training programs |
| `/api/programs/[id]` | GET, PUT, DELETE | Single program |
| `/api/messages` | GET, POST | Chat messages |
| `/api/session-notes` | GET, POST | Session documentation |
| `/api/packages` | GET, POST | Service packages |
| `/api/client-packages` | GET, POST | Client package assignments |
| `/api/client-progress` | GET, POST | Progress tracking |
| `/api/referrals` | GET, POST | Referral program |
| `/api/posture-analysis` | GET, POST | Posture assessments |
| `/api/intake` | GET, POST | Intake form submissions |
| `/api/group-classes` | GET, POST | Group class management |
| `/api/site-content` | GET, PUT | CMS content |
| `/api/site-design` | GET, PUT | Theme settings |
| `/api/upload` | POST | File uploads |
| `/api/stripe/checkout` | POST | Payment processing |

---

## Mobile / iPhone Support

The app is optimized for mobile devices:

- **Responsive design**: All pages use Tailwind responsive classes (`sm:`, `md:`, `lg:`)
- **PWA**: Installable via "Add to Home Screen" (manifest.json + service worker)
- **Touch-friendly**: Large tap targets, swipe-friendly navigation
- **Performance**: No `backdrop-blur` on mobile (causes jank on iOS), lazy-loaded videos, optimized images via `next/image`
- **Safe areas**: `viewport-fit: cover` + padding for iPhone notch

---

## Development Progress

### Completed

- [x] Landing page with CMS-driven content
- [x] Admin portal with 20+ management pages
- [x] Client portal with 7 functional pages
- [x] Google OAuth authentication (admin + client)
- [x] Supabase database integration
- [x] Real-time messaging (Supabase Realtime)
- [x] Google Calendar integration (code + credentials)
- [x] Appointment booking with calendar picker
- [x] Exercise library with video playback
- [x] Training program management
- [x] Client progress tracking (pain scores, posture)
- [x] AI posture analysis (MediaPipe)
- [x] Referral program
- [x] PWA support (installable on mobile)
- [x] Blog system (MDX)
- [x] RLS security policies (with recursion fix)
- [x] QA automation tests

### Configured (needs credentials)

- [ ] Stripe payments (add `STRIPE_SECRET_KEY` to `.env.local`)
- [ ] Email notifications (add `RESEND_API_KEY` to `.env.local`)

### Architecture decisions

| Decision | Rationale |
|----------|-----------|
| Next.js 16 App Router | Full-stack React, server components, API routes in one project |
| Supabase over Firebase | PostgreSQL (relational), built-in auth, realtime, RLS, free tier |
| proxy.ts over middleware.ts | Next.js 16.1 pattern for thin session refresh |
| Client-side auth guards | More reliable than middleware for route protection in Next.js 16 |
| JSON fallback | Allows development without Supabase; zero-config local setup |
| Tailwind CSS 4 | Zero-config with PostCSS, responsive utilities, dark mode |
| Lucide icons | Tree-shakeable, consistent style, large library |
