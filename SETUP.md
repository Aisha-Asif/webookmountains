# WeBookMountains — Complete Setup Guide

## What you're deploying
A full mountain expedition booking platform:
- Public homepage with trip listings
- Trip detail pages with booking form
- Guide profiles listing page
- Customer dashboard (bookings, disputes)
- Guide dashboard (manage trips, confirm/decline bookings)
- Review submission
- Dispute filing system
- Custom JWT auth (username + password, no email)

---

## Step 1 — Create Supabase Project

1. Go to **https://supabase.com** → Sign up / Sign in
2. Click **New project**
3. Fill in:
   - **Name:** webookmountains
   - **Database password:** Choose a strong password and save it
   - **Region:** Choose closest to your users (e.g., ap-south-1 for Pakistan)
4. Click **Create new project** — wait ~2 minutes for it to provision

---

## Step 2 — Run the Database Schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `supabase/schema.sql` from this project
4. Copy the **entire contents** and paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. You should see: "Success. No rows returned"

This creates all tables, indexes, RLS policies, and seeds demo data.

---

## Step 3 — Get Your Supabase Keys

1. In Supabase, go to **Project Settings** → **API**
2. Copy these three values:
   - **Project URL** (looks like: https://xxxx.supabase.co)
   - **anon / public key** (long JWT string)
   - **service_role / secret key** (different long JWT string — keep secret!)

---

## Step 4 — Set Up the Project Locally

```bash
# Clone or download this project folder, then:
cd webookmountains

# Copy the env template
cp .env.local.example .env.local
```

Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
JWT_SECRET=pick_any_random_string_at_least_32_chars_long
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For JWT_SECRET:** Generate a random string, e.g.:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 5 — Install & Run Locally

```bash
npm install
npm run dev
```

Open **http://localhost:3000** — you should see the homepage.

### Test with seed accounts
| Role     | Username      | Password    |
|----------|---------------|-------------|
| Customer | alex_hiker    | password123 |
| Customer | sara_peaks    | password123 |
| Customer | james_summit  | password123 |
| Guide    | hassan_guide  | password123 |
| Guide    | imran_peaks   | password123 |
| Guide    | fatima_guide  | password123 |

---

## Step 6 — Deploy to Vercel

### Option A: Via Vercel CLI
```bash
npm install -g vercel
vercel
```
Follow the prompts. When asked about environment variables, add them manually.

### Option B: Via Vercel Dashboard (recommended)

1. Push your code to a GitHub repository:
```bash
git init
git add .
git commit -m "Initial WeBookMountains"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/webookmountains.git
git push -u origin main
```

2. Go to **https://vercel.com** → Sign in with GitHub
3. Click **Add New → Project**
4. Import your repository
5. Before deploying, click **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = your service role key
   - `JWT_SECRET` = your random string
   - `NEXT_PUBLIC_APP_URL` = https://your-vercel-domain.vercel.app
6. Click **Deploy**

---

## Step 7 — Update NEXT_PUBLIC_APP_URL

After Vercel gives you a URL (e.g., `webookmountains.vercel.app`):
1. Go to Vercel → your project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your actual Vercel URL
3. Redeploy (Vercel → Deployments → Redeploy)

---

## Step 8 — Add Intercom Fin AI (Optional — Phase 1)

1. Sign up at **https://www.intercom.com**
2. Create a workspace
3. Go to **Settings → Messenger** and get your App ID
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_INTERCOM_APP_ID=your_app_id
   ```
5. Add this script to `app/layout.tsx` before closing `</body>`:
   ```html
   <script>
     window.intercomSettings = {
       app_id: process.env.NEXT_PUBLIC_INTERCOM_APP_ID,
     };
   </script>
   <script async src="https://widget.intercom.io/widget/YOUR_APP_ID"></script>
   ```

---

## What's in the seed data

### Trips
| Trip | Mountain | Difficulty | Price | Guide |
|------|----------|------------|-------|-------|
| K2 Base Camp Expedition | K2 | Advanced | $2,400/person | Hassan Khan |
| Concordia & Gasherbrum | Gasherbrum I | Advanced | $1,950/person | Hassan Khan |
| Nanga Parbat Base Camp | Nanga Parbat | Intermediate | $850/person | Imran Baig |
| Rakaposhi Base Camp | Rakaposhi | Intermediate | $650/person | Imran Baig |
| Nanga Parbat Women's | Nanga Parbat | Intermediate | $1,100/person | Fatima Malik |
| Tirich Mir Base Camp | Tirich Mir | Advanced | $1,600/person | Fatima Malik |

### Bookings (pre-seeded for testing)
- `alex_hiker` has a **confirmed** upcoming K2 booking (45 days away)
- `alex_hiker` has a **completed** Rakaposhi booking (can review)
- `sara_peaks` has a **pending** Nanga Parbat booking (guide needs to confirm)
- `sara_peaks` has a **disputed** Concordia booking
- `james_summit` has a **confirmed** booking **2 days away** (tests 24h alert)
- `priya_climbs` has a completed Women's Expedition booking

### Testing the 24-hour escalation rule
Log in as `james_summit` and check the customer dashboard. 
The booking within 2 days shows the amber "Trip within 24 hours" warning banner.

### Testing the dispute flow
1. Log in as `sara_peaks`
2. Go to dashboard → you'll see the existing dispute
3. Or go to `/disputes/new` and file a new one with a valid booking ID

---

## Project Structure

```
webookmountains/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── (dashboard)/     # Protected dashboards
│   │   ├── customer/    # Customer dashboard
│   │   ├── guide/       # Guide dashboard + new trip
│   │   ├── bookings/    # Review submission
│   │   └── disputes/    # Dispute filing
│   ├── (public)/        # Public pages
│   │   ├── page.tsx     # Homepage
│   │   ├── trips/       # Trip listing + detail
│   │   └── guides/      # Guide directory
│   ├── api/             # All API routes
│   │   ├── auth/        # login / register / logout / session
│   │   ├── trips/       # CRUD trips
│   │   ├── bookings/    # CRUD bookings + review
│   │   ├── guides/      # Guide profiles
│   │   └── disputes/    # Dispute management
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/          # Navbar, Footer
│   └── booking/         # TripCard, BookingForm
├── lib/
│   ├── auth.ts          # JWT helpers
│   ├── supabase.ts      # DB client
│   └── utils.ts         # Formatting helpers
├── types/index.ts        # TypeScript interfaces
├── middleware.ts          # Route protection
└── supabase/schema.sql   # Run this in Supabase
```

---

## Common Issues

**"relation does not exist" error**
→ You didn't run schema.sql. Go to Supabase SQL Editor and run it.

**"Invalid API key" error**  
→ Check your `.env.local` values match exactly from Supabase Settings → API

**Login fails with correct credentials**  
→ The bcrypt hash in seed data must match. If you see auth issues, re-run schema.sql (it uses ON CONFLICT DO NOTHING so safe to re-run).

**Trips not showing on homepage**  
→ Check that `is_active = TRUE` in the trips table. Run in SQL Editor:
```sql
SELECT id, title, is_active FROM trips;
```

**Vercel build fails**  
→ Make sure all 4 environment variables are set in Vercel dashboard before deploying.
