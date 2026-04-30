# Switch — UGC Game Development

Built with React 18 + TypeScript + Vite + Tailwind CSS.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and change VITE_ADMIN_PASSWORD to something secure

# 3. Start dev server (runs both Vite + json-server)
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001
- Admin: http://localhost:5173/admin/login

## Admin Dashboard

Go to `/admin/login` and enter your password (set in `.env`).

From there you can:
- Add / edit / delete games
- Write and publish blog posts
- Toggle featured status on games

## Project Structure

```
src/
├── api/         # All data fetching (easy to swap to Supabase etc)
├── components/  # Shared UI: Nav, Footer, GameCard, BlogCard, etc
├── pages/       # Route-level pages
│   ├── admin/   # Dashboard pages (protected)
│   ├── Home.tsx
│   ├── GamesPage.tsx
│   ├── BlogPage.tsx
│   └── BlogPostPage.tsx
└── types/       # TypeScript interfaces
```

## Deploying

1. Replace `json-server` with a real backend — Supabase is the easiest free option.
2. Update `src/api/index.ts` to point to your new API.
3. `npm run build` → deploy `dist/` to Vercel, Netlify, etc.

## Changing the Admin Password

Edit `VITE_ADMIN_PASSWORD` in `.env`. Note: this is a frontend env var — for production, use a proper auth system (Supabase Auth, Clerk, etc).

## Email Notifications (Resend)

To get email notifications when someone fills in the contact form:

1. Sign up free at [resend.com](https://resend.com)
2. Get your API key
3. Add to your `.env`:
   ```
   RESEND_API_KEY=re_your_key_here
   ```
4. In Resend, verify your sending domain (`playswitchgames.com`)

Without the key, submissions still save to the admin dashboard — you just won't get email notifications.

## Analytics

Page views are tracked automatically to `db.json` for every public page visit.
View them in the admin dashboard at `/admin`.

No third-party trackers — all data stays local. When you deploy to production,
consider swapping to [Plausible](https://plausible.io) for persistent analytics.
