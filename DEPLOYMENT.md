Vercel Deployment Checklist

1) Environment variables (add in Vercel dashboard under Project > Settings > Environment Variables)

- NEXT_PUBLIC_SUPABASE_URL: your Supabase URL (e.g. https://xyz.supabase.co)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: your Supabase anon key
- SUPABASE_SERVICE_ROLE_KEY: your Supabase service role key (server only)
- NEXT_PUBLIC_RAZORPAY_KEY_ID: Razorpay Key ID (public)
- RAZORPAY_KEY_ID: Razorpay Key ID (server)
- RAZORPAY_KEY_SECRET: Razorpay Key Secret (server)
- RAZORPAY_WEBHOOK_SECRET: Razorpay webhook secret (server)

2) Migrations & seeds
- Run the SQL files in `sql/` in this order in Supabase SQL editor:
  - `sql/init.sql`
  - `sql/migrations/001_add_comment_parent.sql`
  - `sql/migrations/002_add_prompt_status.sql`
  - `sql/migrations/003_create_categories.sql`
  - `sql/migrations/004_storage_policies.sql`
  - `sql/migrations/005_prompts_insert_policy.sql`
  - `sql/seed_categories.sql`
  - `sql/seed.sql`

3) Razorpay webhook
- Add a webhook in Razorpay dashboard with URL:
  `https://<your-vercel-domain>/api/webhooks/razorpay`
- Use the `RAZORPAY_WEBHOOK_SECRET` you configured above when creating the webhook.
- Enable event `payment.captured` (and optionally `order.paid`).

4) Test flow
- Deploy to Vercel and visit the site.
- Create a test user, create or use a premium prompt, click Buy.
- Complete checkout; verify purchases show in Admin > Purchases and prompt unlocks for that user.

5) Security notes
- Never commit `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, or `RAZORPAY_WEBHOOK_SECRET` to the repo.
- `SUPABASE_SERVICE_ROLE_KEY` must be set in Vercel for server routes to perform admin writes.
