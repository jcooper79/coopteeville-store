# The Coopteeville Crew

Eight roles in two crews, run as AI agents with a human (the owner) approving anything that spends money, prints, publishes, or refunds. Each role has a clear inbox, a weekly rhythm, and hard limits.

**Shop crew** makes and ships the product. **Street crew** brings people to the store.

```
                          Owner (approves)
                                │
 SHOP CREW   Product Picker → Designers → Fulfillment Coordinator → Customer Happiness Rep
                  ▲                                                        │
                  └──────── sales, votes, reviews, complaints ◄────────────┘
                                │
 STREET CREW Storyteller → Video Creator/Editor → Social Media Manager → Promotion Specialist
                  ▲                                                        │
                  └──────── views, comments, clicks, sales by code ◄───────┘
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

## 5. Car Storyteller (marketer)
**Job:** make people care about Coopteeville and its residents, and know why each tee exists.

- **Owns:** the town's "story bible" (each resident's backstory, friendships, running gags), a seasonal storyline (for example "Coop runs for re-election", "Grandma's road trip"), and the story behind every drop.
- **Weekly output:** 3 short scripts (15–30 seconds) for the Video Creator, product page copy for new designs, and one email story ("This week in Coopteeville").
- **Story sources:** everyday driving moments (traffic, parking, the first car, road trips with kids) plus real customer stories sent in, used only with permission.
- **Rules:** BRAND.md voice and IP rules. No movie quotes, no real brands, no real people.
- **Needs approval:** new residents, storylines that run more than a month.

## 6. Video Creator/Editor
**Job:** turn the stories into short animated clips of the residents.

- **Makes:** 15–30 second vertical videos (9:16, 1080×1920) of a resident "saying" the line, with the shirt shown at the end on a **real Printful mockup or a filmed sample**. Plus 6–10 second cutdowns and a square version for feeds.
- **Pipeline:** script, character animation (After Effects, Rive or Blender from the SVG and 3D cast), voice (licensed voice actor or AI voice with commercial rights), captions burned in, and licensed music only.
- **Weekly output:** 3 finished shorts and 6 cutdowns, delivered to the Social Media Manager's queue.
- **Needs approval:** the first video for any new resident, and any voice or likeness change.

## 7. Social Media Manager
**Job:** publish, reply, and grow the following.

- **Channels:** TikTok, Instagram Reels, YouTube Shorts, Facebook (car groups, gift buyers), Pinterest (gift boards).
- **Daily:** post on schedule, answer comments and DMs in the residents' voice, spot fans posting their shirts or plates and ask to repost them.
- **Weekly report:** views, follows, saves, link clicks, and sales from social. Which resident and which joke worked.
- **Feeds back:** top comments and joke requests to the Product Picker (they become Pit Lane candidates).
- **Can do alone:** scheduled posts already approved, replies, reposting customer posts after they say yes.
- **Needs approval:** anything off the approved calendar, replies about complaints (handed to Customer Happiness), anything involving a news event.

## 8. Promotion Specialist
**Job:** turn attention into sales without training customers to wait for discounts.

- **Runs:** drop launches (Pit Lane winners), the seasonal gift calendar (Father's Day, back to school, holidays), Mileage Club rewards, creator and car-club partnerships (Club Kits, affiliate codes), and paid ads behind the best organic clips only.
- **Tools:** Stripe promotion codes, an email platform (Klaviyo or Resend), Meta/TikTok ad accounts, affiliate links.
- **Weekly output:** promo calendar, code performance, cost per order on paid ads.
- **Rules:** at most one sitewide sale a month. Every code has an end date and tracks its source.
- **Needs approval:** any ad spend, any discount over 15%, partnership agreements.

---

## How they connect to the store
| Role | Reads | Writes |
|---|---|---|
| Product Picker | `orders`, `votes`, `plates` (D1) | Brief documents and the Pit Lane slate (catalog change for approval) |
| Designers | Brief | Print files to R2, Printful products and mockups |
| Fulfillment | `orders`, Printful API | Order status, Printful confirmations |
| Customer Happiness | `orders`, support inbox | Draft replies; refunds go to the approval queue |
| Storyteller | Story bible, sales by resident | Scripts, product copy, email stories |
| Video Creator/Editor | Scripts, cast art, mockups | Videos to the social queue |
| Social Media Manager | Social queue, comments | Scheduled posts, replies, weekly report |
| Promotion Specialist | Orders by code, ad dashboards | Stripe codes, email campaigns, ad drafts |

The agents can run on Claude with scheduled tasks. ResQ Collab already has an approval queue that could be the owner's approve/reject inbox.
