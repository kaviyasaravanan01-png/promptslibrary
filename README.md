# Prompt Library Marketplace

This project is a Next.js (App Router) application backed by Supabase and Razorpay for micro-transactions (INR). It implements a marketplace of AI prompts where premium prompts can be unlocked with a one-time payment.

Quick start

1. Copy `.env.local.example` to `.env.local` and fill values.
2. Run `npm install`.
3. Run `npm run dev`.

Files of interest

- `sql/init.sql` — database schema and RLS policies for Supabase.
- `app/` — Next.js App Router pages and API routes.
- `lib/` — Supabase server/browser clients and payment helpers.
- `app/api/payment/*` — create-order and verify endpoints.
- `app/api/webhooks/razorpay/route.ts` — Razorpay webhook handler.

I'll scaffold the rest of the app next (routes, helpers, Tailwind config, core components). Confirm if you want any naming/price defaults changed.
