# Coopteeville Store

A funny car-tee storefront hosted on Cloudflare Workers. Checkout runs on Stripe and orders are fulfilled through Printful.

- `public/`: the storefront (one animated page, inline SVG characters) and the logo
- `src/index.ts`: API for checkout, the Stripe webhook that creates the Printful order, and Pit Lane votes
- `src/catalog.ts`: server-side prices and Printful variant mapping
- `migrations/`: D1 schema
- `docs/STRATEGY.md`: differentiation, traffic plan, and vendor recommendations
- `docs/BRAND.md`: logo, palette, type, voice, and IP guardrails
- `docs/PRINT-SPECS.md`: print file spec for designers (sizes, DPI, format, checklist)
- `scripts/check-print-file.mjs`: pre-flight checker, `npm run check:print -- file.png`
- `docs/ROADMAP.md`: what's next

## Run locally
```bash
npm install
cp .dev.vars.example .dev.vars   # fill in Stripe test keys
npm run db:migrate:local
npm run dev
```

## Deploy (first time)
```bash
npm run db:create          # paste the database_id into wrangler.jsonc
npm run db:migrate
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
npx wrangler secret put PRINTFUL_API_KEY
npx wrangler secret put VOTE_SALT
npm run deploy
```
Then add a Stripe webhook pointing at `https://<domain>/api/webhooks/stripe` for the `checkout.session.completed` event.

CI and other machines need `CLOUDFLARE_API_TOKEN` (permissions: Workers Scripts Edit, D1 Edit, Workers Routes Edit) and `CLOUDFLARE_ACCOUNT_ID`.

## Order flow
1. The cart is posted to `/api/checkout`. The Worker re-prices it from `catalog.ts`, saves it to D1, and creates a Stripe Checkout Session.
2. Stripe calls `/api/webhooks/stripe`. The Worker verifies the signature, records the order once (idempotent), and creates the Printful order.
3. Printful orders start as **drafts** (`PRINTFUL_AUTO_CONFIRM=false`) so plates and early orders get a human check. Switch it to `true` once launch QA passes.
