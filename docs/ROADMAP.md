# Roadmap

## Phase 0: Concept (this commit)
- [x] Animated storefront concept: residents, shop grid, Plate Maker, Pit Lane, Mileage Club, cart
- [x] Logo and favicon (SVG), brand guide
- [x] Worker API: Stripe Checkout, signed webhook, Printful order creation, votes
- [x] D1 schema
- [x] Strategy and differentiation doc

## Phase 1: Accounts & wiring (needs owner decisions)
- [ ] Pick the Cloudflare account and register the domain (coopteeville.com?)
- [ ] Stripe account, with test keys first. Turn on Stripe Tax.
- [ ] Printful account. Create the 12 launch products, then map variant IDs in `src/catalog.ts`.
- [ ] Upload print-ready PNGs to R2 (`files.coopteeville.com`)
- [ ] **Real photo mockups:** generate them with the Printful Mockup Generator API for every design and shirt color, store in R2, and show them as the main product photo (the animated art becomes a fun second view). Plate Maker gets a "See it on a real shirt" button that generates a mockup of that plate.
- [ ] Render plate PNGs on the server (Worker + resvg-wasm), then store them in R2
- [ ] Add Turnstile to voting and the Plate Maker
- [ ] Thank-you page, order confirmation email (Resend), support@ via Email Routing

## Phase 2: Policies & compliance
Draft and publish pages at `/policies/*`: Shipping, Returns & Reprints (print-on-demand misprint policy), Privacy (CCPA/CPRA and GDPR-ready), Terms of Service, Cookies with a consent banner, Accessibility statement (WCAG 2.1 AA target), Plate Maker content rules, and Pit Lane voting rules (no purchase necessary). Also: a business entity and sales-tax registration review.

## Phase 3: The crew
Product Picker, Designers (2–3), Order Fulfillment Coordinator, Customer Happiness Rep. Roles, rhythms and approval limits are in `docs/TEAM.md`. A human approves anything that prints, publishes, spends money, or refunds.

## Phase 4: Growth
Club Kits portal, Mileage Club accounts, Wall of Plates, resident trading cards (Printful pack-ins), 3D character renders, and short-form animation pipeline.
