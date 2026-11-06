# The Coopteeville Crew

Four roles, run as AI agents with a human (the owner) approving anything that spends money, prints, publishes, or refunds. Each role has a clear inbox, a weekly rhythm, and hard limits.

```
            Owner (approves)
                  │
   ┌──────────────┼───────────────────┬─────────────────────┐
Product Picker → Designers (2–3) → Fulfillment Coordinator → Customer Happiness Rep
   ▲                                                         │
   └──────────── sales, votes, reviews, complaints ◄─────────┘
```

---

## 1. Product Picker
**Job:** decide what we make, what stays, and what retires.

- **Inputs:** sales by design, size, and color; Pit Lane votes; Plate Maker trends (which words people type); reviews; the seasonal calendar (Father's Day, back to school, holidays).
- **Weekly output, every Monday:**
  - A **Design brief**: about 10 lines to develop, each with resident, occasion, target buyer, and why
  - **Pit Lane slate**: the 6 finished designs that go up for vote
  - **Lap report**: which designs move to the Hall of Fame and which retire
  - **Product ideas**: new blanks to try (hoodie, sticker, air freshener) with margin math
- **Rules:** follows the voice and IP rules in BRAND.md. Checks every line against the USPTO trademark search and common phrases already trademarked for apparel.
- **Needs approval:** new product types, price changes, retiring a Hall of Fame design.

## 2. Designers (start with 2, grow to 3)
**Job:** turn approved lines into print-ready files **and real mockups**.

| Designer | Style lane |
|---|---|
| **Character artist** | Resident illustrations: poses, expressions, new residents |
| **Type designer** | Saying-led layouts in Bungee, badges, retro signs, halftone textures |
| **Custom & templates** (add 3rd) | Plate Maker styles, Club Kit templates, gift collections |

- **Every design delivers:** `_light` and `_dark` PNGs at 4500×5400, a vector source with text outlined, and **photo mockups from Printful on every shirt color**. The animated storefront art is for fun; the mockup is what the customer judges.
- **Quality gate:** `npm run check:print` must pass, and the PRINT-SPECS.md checklist is signed off. The first print of each new design gets a physical sample.
- **Needs approval:** final design before it goes on Pit Lane or the store.

## 3. Order Fulfillment Coordinator
**Job:** every paid order prints correctly and ships on time.

- **Watches:** new orders in D1, Printful draft orders, Printful status updates (in production, shipped, problem).
- **Daily:**
  - Review each **Plate Maker** order (text is clean, not offensive, not a trademark), then confirm the Printful draft
  - Fix failed orders (missing variant, bad address) and retry
  - Flag orders stuck in production more than 5 business days
  - Request **reprints** from Printful for misprints, with photos from the customer
- **Weekly:** fulfillment report covering orders, average days to ship, reprint rate, and cost per order versus plan.
- **Needs approval:** cancelling a paid order, any order over $200, switching print providers.

## 4. Customer Happiness Rep
**Job:** fast, friendly answers in the Coopteeville voice.

- **Inbox:** support@coopteeville.com (Cloudflare Email Routing), order lookups by email and order number.
- **Handles:** "where's my order", size exchanges, misprint reprints (with the Fulfillment Coordinator), Plate Maker questions, Club Kit inquiries (passed to the owner).
- **Response target:** first reply within 4 business hours.
- **Tone:** warm, a light pun allowed, never at the customer's expense. Signs off as "the Coopteeville crew".
- **Can do alone:** order status, tracking, sizing help, a 10% "sorry" code.
- **Needs approval:** refunds of any amount, anything legal or a chargeback, public review replies.
- **Feeds back:** weekly top 5 complaints and praise to the Product Picker.

---

## How they connect to the store
| Role | Reads | Writes |
|---|---|---|
| Product Picker | `orders`, `votes`, `plates` (D1) | Brief documents and the Pit Lane slate (catalog change for approval) |
| Designers | Brief | Print files to R2, Printful products and mockups |
| Fulfillment | `orders`, Printful API | Order status, Printful confirmations |
| Customer Happiness | `orders`, support inbox | Draft replies; refunds go to the approval queue |

The agents can run on Claude with scheduled tasks. ResQ Collab already has an approval queue that could be the owner's approve/reject inbox.
