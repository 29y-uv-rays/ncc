# RINCC Cadet Points System

Mobile-first Next.js + Supabase app for tracking NCC cadet performance, points, notes, and rewards.

## Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind CSS + TypeScript
- **Backend**: Next.js API routes
- **Database**: Supabase (Postgres + RLS)
- **Hosting**: Vercel

## Setup

### 1. Create a Supabase project

1. Go to https://app.supabase.com and create a new project.
2. Once it's ready, copy the project URL and the `service_role` key from **Project Settings -> API**.

### 2. Run the schema

In the Supabase dashboard, open the **SQL Editor** and run the contents of:

- `db/migrations/supabase_init.sql` -- creates tables, indexes, and RLS policies
- `db/seed.sql` -- inserts the initial admin password, contact data, and platoon stats

For the full notes JSON, paste `db/notes.json` into the `content` table (type = `notes`) via the Supabase dashboard, or use the admin panel after first login.

### 3. Local environment

Copy `.env.example` to `.env.local` and fill in the values:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_SESSION_SECRET=replace-with-a-long-random-string
```

### 4. Install and run

```bash
npm install
npm run dev
```

The app is available at http://localhost:3000. The admin panel is at http://localhost:3000/admin (no public link).

### Default admin password

`ccnir1091`

To rotate, run this in the Supabase SQL editor (or use the helper script):

```sql
UPDATE public.admin_auth
SET password_hash = '<new-scrypt-hash>',
    updated_at = now();
```

You can generate a new hash from Node:

```js
node -e "const c=require('crypto');const salt=c.randomBytes(16).toString('hex');const N=16384,r=8,p=1;const h=c.scryptSync('NEW_PASSWORD',salt,64,{N,r,p}).toString('hex');console.log('scrypt$n='+N+',r='+r+',p='+p+'$'+salt+'$'+h)"
```

## Deploy to Vercel

1. Push the repo to GitHub.
2. Import the project in Vercel.
3. Add the three environment variables from step 3 above in **Settings -> Environment Variables**.
4. Deploy.

## Project structure

```
app/
  page.tsx                          # Dashboard
  points/                           # Points flow
    page.tsx                        #   global leaderboard + platoon cards
    [platoon]/page.tsx              #   platoon leaderboard + breakdown
    [platoon]/[cadetId]/page.tsx    #   cadet profile + history
  rewards/page.tsx
  roadmap/page.tsx
  notes/page.tsx
  contact/page.tsx
  admin/                            # Protected admin panel
    page.tsx                        #   login
    (panel)/                        #   requires session
      dashboard/page.tsx
      points/page.tsx
      cadets/page.tsx
      rewards/page.tsx
      notes/page.tsx
      contact/page.tsx
      platoon-stats/page.tsx
  api/
    # public
    leaderboard/route.ts
    platoons/route.ts
    platoon/[platoon]/route.ts
    cadet/[cadetId]/route.ts
    rewards/route.ts
    notes/route.ts
    contact/route.ts
    platoon-stats/route.ts
    # admin (session protected)
    admin/login/route.ts
    admin/session/route.ts
    admin/logout/route.ts
    admin/cadets/route.ts
    admin/points/route.ts
    admin/rewards/route.ts
    admin/notes/route.ts
    admin/contact/route.ts
    admin/platoon-stats/route.ts

components/
  PageShell.tsx
  SiteHeader.tsx
  Pills.tsx
  ProgressBar.tsx
  CircularRing.tsx
  PlatoonCard.tsx
  CadetRow.tsx
  NotesRenderer.tsx
  LoadingBlock.tsx
  admin/AdminLayout.tsx

lib/
  db.ts                  # Supabase admin client
  auth.ts                # HMAC-signed admin session cookie
  password.ts            # scrypt verify + hash helpers
  format.ts
  api.ts
  safe.ts
  notes.ts
  types.ts

db/
  migrations/supabase_init.sql
  seed.sql
```
