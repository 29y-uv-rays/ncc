# Deployment Guide

End-to-end production deploy of the RINCC Cadet Points System to **Vercel** (frontend + API) and **Supabase** (database + auth-adjacent storage).

The app is already production-ready. This guide is the checklist to take it from repo → live URL.

---

## 0. Prerequisites

- [ ] GitHub account (repo to deploy from)
- [ ] Vercel account (https://vercel.com — sign in with GitHub)
- [ ] Supabase account (https://app.supabase.com — sign in with GitHub)
- [ ] A generated `ADMIN_SESSION_SECRET` (instructions in §3)
- [ ] Default admin password: `ccnir1091` (rotate it after first login)

Total time: **15–25 minutes**, most of it waiting for Supabase project provisioning.

---

## 1. Create the Supabase project

1. Go to https://app.supabase.com → **New project**.
2. Pick a region close to your users (Singapore `ap-southeast-1` is closest to RI).
3. Set a strong database password (you do **not** need it for this app — the service_role key is what we use — but save it somewhere safe).
4. Wait ~2 minutes for provisioning.

### 1a. Copy your project credentials

Once the project is ready, go to **Project Settings → API** and copy:

| Variable name in Supabase dashboard | Where it goes in the app |
| --- | --- |
| **Project URL** (e.g. `https://abcd1234.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
| **service_role** key (click "Reveal" — `eyJ...` long JWT) | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ **Never** expose the service_role key to the browser. Only the **anon** key is safe in client code. We use the service_role key from server-side code only (API routes), so it stays in Vercel environment variables.

### 1b. Run the schema

In the Supabase dashboard, open **SQL Editor → New query** and run the contents of:

```
db/migrations/supabase_init.sql
```

This single file creates:
- 6 tables: `cadets`, `points_logs`, `rewards`, `platoon_stats`, `content`, `admin_auth`
- Indexes on hot columns (`platoon`, `total_points`, `cadet_id+created_at`, `category`)
- Row Level Security (RLS) enabled on **all 6 tables**, with 22 policies that:
  - allow public (anon) reads on `cadets`, `rewards`, `platoon_stats`, `content`
  - **block** all anon writes (insert/update/delete) on every table including `points_logs` and `admin_auth`
- 2 RPCs:
  - `award_points(p_cadet_id, p_points, p_category, p_reason, p_awarded_by)` — atomic point mutation (used by `/api/admin/points`)
  - `recompute_cadet_points(p_cadet_id)` — recovery / audit tool

Run it as one query. If it succeeds, you should see "Success. No rows returned" — that's expected (DDL doesn't return rows).

### 1c. Run the seed

In the same SQL Editor, open another **New query** and run:

```
db/seed.sql
```

This inserts:
- 1 row into `admin_auth` with the default scrypt-hashed password `ccnir1091`
- 4 rows into `platoon_stats` (one per platoon, all zeroed out — fill in from the admin panel)
- 1 row into `content` (type = `contact`) with placeholder contact info

The `content` row for `notes` is **not** seeded here because the full notes JSON is large. It's easiest to load it after first deploy via the **Admin → Notes** page, or with the helper script:

```bash
# 1. (Optional) regenerate db/notes.json from the source-of-truth
npm run notes:build
# 2. Push it into Supabase (reads env vars from .env or shell)
npm run notes:load
```

(See "Optional: seed notes via SQL" below for a pure-SQL alternative.)

---

## 2. Generate the admin session secret

The app signs admin session cookies with HMAC-SHA256. The signing key must be a long random string and **must never change after deploy** (doing so invalidates all active admin sessions — including yours).

### Windows (PowerShell)

```powershell
node -e "$s=[Convert]::ToBase64String((New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes(48)) -replace '\+','-' -replace '/','_'; Write-Host $s"
```

### macOS / Linux

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

**Save the output** — you'll paste it into Vercel in step 4. It looks something like:

```
7CA8TV1ySp0Y0XezgtrgGJKbIB0gluu-sg-mcVMHEUudzlAjwA_XCZAH3jEMAYbv
```

> The app refuses to start in production if `ADMIN_SESSION_SECRET` is missing or shorter than 32 chars. There's no fallback. This is intentional — see `lib/auth.ts`.

---

## 3. Push the repo to GitHub

If this is already in a GitHub repo, skip to step 4.

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create rincc-points --public --source=. --remote=origin --push
```

Or use the GitHub web UI to create an empty repo, then:

```bash
git remote add origin https://github.com/YOUR_USER/rincc-points.git
git branch -M main
git push -u origin main
```

> The repo is **public-safe** — no secrets are committed. `.env*` files are in `.gitignore` (the default Next.js template).

---

## 4. Deploy to Vercel

### 4a. Import the project

1. Go to https://vercel.com/new
2. **Import** your GitHub repo.
3. Vercel auto-detects Next.js. **Don't change the framework preset.**
4. **Don't click Deploy yet.** Click **Environment Variables** first.

### 4b. Set the three environment variables

Add these three to **all three environments** (Production, Preview, Development):

| Name | Value | Environments |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://YOUR_PROJECT_ID.supabase.co` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | the `eyJ...` service_role JWT from Supabase | Production, Preview, Development |
| `ADMIN_SESSION_SECRET` | the 64-char string from step 2 | Production, Preview, Development |

> **Recommendation:** set different secrets for Production vs. Preview if you want preview deploys to be isolated.

### 4c. Deploy

Click **Deploy**. The first build takes 2–4 minutes (Vercel installs deps and runs `next build`).

When it finishes, you should see a green checkmark and a URL like `https://rincc-points-xxx.vercel.app`.

> Build must succeed without env vars because the Supabase client is a **lazy factory** (`getSupabaseAdmin()` in `lib/db.ts`). If you see a build error about `supabaseAdmin is not defined` or "supabaseUrl is required", it means an API route is being statically prerendered — every API route has `export const dynamic = "force-dynamic"` and `export const runtime = "nodejs"` to prevent that. If a new route is added, follow the same pattern.

---

## 5. Smoke test (do this once after first deploy)

Open the URL Vercel gave you and run through this list. **All must pass** before you hand the URL to anyone.

### Public surface (no login)

- [ ] `/` — Dashboard renders with 5 nav cards
- [ ] `/points` — Global leaderboard with at least the seeded platoons visible (cadets will be empty until you add some)
- [ ] `/points/test` — Platoon page shows "no cadets" empty state
- [ ] `/rewards` — Renders with empty state
- [ ] `/roadmap` — Renders (placeholder content — fill in later)
- [ ] `/notes` — Renders (empty until you add notes via admin)
- [ ] `/contact` — Shows the seeded contact info

### Admin surface (login required)

- [ ] `/admin` — Login page renders, redirects to `/admin/dashboard` if you're already logged in
- [ ] Log in with `ccnir1091` — redirects to `/admin/dashboard`
- [ ] `/admin/dashboard` — Shows "0 cadets" (you haven't added any yet)
- [ ] `/admin/cadets` — Add a test cadet (e.g. "Test User", "test" platoon)
- [ ] `/admin/points` — Award +10 PT points to the test cadet
- [ ] Go back to `/points/test` — the test cadet appears with 10 points
- [ ] `/points/test/1` (or whatever ID was assigned) — shows the 10-point history entry
- [ ] Logout works (clears the cookie, redirects to `/admin`)

### If anything fails

See the **Troubleshooting** section below.

---

## 6. Maintenance

### Rotate the admin password

Do this from the Supabase SQL Editor (not from inside the app — the app has no password-change UI by design, to keep the admin surface small).

1. Generate a new scrypt hash on your machine:

   ```bash
   node -e "const c=require('crypto');const salt=c.randomBytes(16).toString('hex');const N=16384,r=8,p=1;const h=c.scryptSync('YOUR_NEW_PASSWORD',salt,64,{N,r,p}).toString('hex');console.log('scrypt$n='+N+',r='+r+',p='+p+'$'+salt+'$'+h)"
   ```

2. In Supabase SQL Editor:

   ```sql
   UPDATE public.admin_auth
   SET password_hash = '<paste-the-output-here>',
       updated_at = now();
   ```

3. Old sessions are still valid (cookies are valid until they expire) — the new password takes effect for **future** logins only. If you need to force-logout everyone, change `ADMIN_SESSION_SECRET` in Vercel (but be aware this logs you out too).

### Add real content

- **Cheers / NCC lore / drills** — go to `/admin/notes`, paste the full NCC notes JSON into the editor. The structure is `{ sections: NotesSection[] }` where each section has `title`, optional `subtitle`, and either `paragraphs`, `list`, or `content_after` field.
- **Roadmap** — edit `content` row with `type = 'roadmap'` in Supabase, or use the admin panel.
- **Contact** — same: `content` row with `type = 'contact'`.
- **Platoon stats (PT/IFC/drills percentages)** — go to `/admin/platoon-stats`, edit each platoon.

### Verify RLS is actually locked down

Run this in Supabase SQL Editor to confirm anon cannot write:

```sql
SET ROLE anon;
INSERT INTO public.cadets (name, platoon) VALUES ('Hacker', 'test');
-- expected: ERROR: new row violates row-level security policy
RESET ROLE;
```

If the insert succeeds, **do not deploy** — your RLS policies are broken. Check `db/migrations/supabase_init.sql` line 123 ("No anon insert cadets") and re-run the migration.

### Backups

Supabase Pro plans have point-in-time recovery. Free plans have daily automated backups (7-day retention on Pro, none on Free). For school data, upgrade to Pro **before** the first day of tracking — you cannot recover deleted cadet data on the free tier if something goes wrong.

---

## 7. Troubleshooting

### Build fails: "supabaseUrl is required"

A new API route was added without `export const dynamic = "force-dynamic"`. Add both:

```ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
```

to the top of the route file. Then redeploy.

### Build fails: "Module not found: Can't resolve 'pg'"

You (or an old commit) still has the raw `pg` library somewhere. Search the codebase:

```bash
grep -r "from 'pg'" app/ lib/
```

Should return nothing. The migrated app uses `@supabase/supabase-js` only.

### Login returns 401 with the correct password

1. Confirm `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key, not the **anon** key. The anon key will fail the `admin_auth` table lookup because of RLS.
2. In Supabase SQL Editor, check the row exists:
   ```sql
   SELECT id, length(password_hash) FROM public.admin_auth;
   ```
   Should return 1 row with `length = 200-ish` characters.
3. If the row is missing, re-run `db/seed.sql`.

### Login returns 429

You hit the rate limiter (5 attempts/min/IP). Wait 60 seconds, or restart the dev server to clear the in-memory bucket. **In production this is per-Vercel-instance** — for true multi-region limiting, swap `lib/rate-limit.ts` for Upstash Redis (free tier available).

### Admin pages show "Access denied" even when logged in

The session cookie didn't get set, or the browser is blocking it. Check:
- DevTools → Application → Cookies → look for `rincc_session`
- The cookie should have `HttpOnly`, `Secure` (in production), `SameSite=Lax`
- `ADMIN_SESSION_SECRET` is the **same value** in Vercel as it was when you logged in. Changing it invalidates all sessions.

### Public pages show empty data even though DB has rows

RLS is blocking reads. Run in SQL Editor:

```sql
SELECT * FROM public.cadets;
-- as anon:
SET ROLE anon;
SELECT * FROM public.cadets;
RESET ROLE;
```

If the first works and the second doesn't, your public-read policies are missing. Re-run `db/migrations/supabase_init.sql`.

### Total points is out of sync with `points_logs`

A manual SQL update happened somewhere. Fix it with the recovery RPC:

```sql
SELECT public.recompute_cadet_points(123);  -- one cadet
-- or rebuild all:
SELECT id, public.recompute_cadet_points(id) FROM public.cadets;
```

---

## 8. Optional: seed notes via SQL

If you want to skip the admin panel and load NCC notes straight from SQL:

1. Open `db/notes.json` (or whatever the current export is — see `lib/notes.ts` for the type).
2. In Supabase SQL Editor, escape the JSON and run:

   ```sql
   INSERT INTO public.content (type, data)
   VALUES ('notes', '{ ... paste escaped JSON here ... }'::jsonb)
   ON CONFLICT (type) DO UPDATE
   SET data = EXCLUDED.data, updated_at = now();
   ```

3. Hit `/notes` — it should render immediately.

For large payloads, use `psql` from a terminal instead of the web editor:

   ```bash
   psql "$DATABASE_URL" -c "\copy (SELECT jsonb_build_object('sections', <notes json here>)) TO '/tmp/notes.json'"
   psql "$DATABASE_URL" -c "UPDATE public.content SET data = pg_read_file('/tmp/notes.json')::jsonb WHERE type = 'notes'"
   ```

(You can find the connection string in Supabase dashboard → Project Settings → Database → Connection string → URI. Use the **direct** connection, not the pooler, for admin operations.)

---

## 9. Day-2 checklist

After deploy, every term:

- [ ] Rotate `ADMIN_SESSION_SECRET` once per year (invalidates all sessions — schedule a maintenance window)
- [ ] Rotate admin password at the start of every academic year
- [ ] Spot-check RLS still works (run the `SET ROLE anon` insert test from §6)
- [ ] Review Supabase logs for suspicious activity (Dashboard → Logs → API)
- [ ] If traffic grows, upgrade rate limiter to Upstash Redis (single line change in `lib/rate-limit.ts`)

---

That's it. The app should now be live at `https://rincc-points-xxx.vercel.app`. If anything in this guide is unclear or doesn't match what you see, the live code is the source of truth — README.md has the short version, this file has the long version, and `lib/*.ts` has the implementation.
