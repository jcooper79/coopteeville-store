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
- [ ] Render plate PNGs on the server (Worker + resvg-wasm), then store them in R2
- [ ] Add Turnstile to voting and the Plate Maker
- [ ] Thank-you page, order confirmation email (Resend), support@ via Email Routing

## Phase 2: Policies & compliance
Draft and publish pages at `/policies/*`: Shipping, Returns & Reprints (print-on-demand misprint policy), Privacy (CCPA/CPRA and GDPR-ready), Terms of Service, Cookies with a consent banner, Accessibility statement (WCAG 2.1 AA target), Plate Maker content rules, and Pit Lane voting rules (no purchase necessary). Also: a business entity and sales-tax registration review.

## Phase 3: Design agent team
A crew of agents, each with a resident's voice and a humor lane:
- **Writers** (one per resident) pitch about 20 lines a week in that character's voice
- **Editor** removes duplicates, checks lines against trademarks (USPTO search), and applies the voice and IP rules in BRAND.md
- **Art director** turns the chosen lines into print-ready layouts (SVG to PNG at 4500×5400)
- **Pit Lane curator** picks about 6 a week for voting and writes the vote email
- **Social producer** scripts the 15-second resident short for each winner
- Final say always stays with a human before anything prints or posts.

## Phase 4: Growth
Club Kits portal, Mileage Club accounts, Wall of Plates, resident trading cards (Printful pack-ins), 3D character renders, and short-form animation pipeline.
