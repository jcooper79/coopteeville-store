# Coopteeville: Business Strategy & Differentiation

## The problem
Funny-tee stores are a commodity. Thousands of print-on-demand shops sell the same "I'd rather be napping" jokes on the same Bella+Canvas blanks, compete on paid ads, and have no reason for anyone to come back. Traffic is rented, not earned.

## The thesis
**Coopteeville is a town, not a catalog.** We sell a cast of characters people want to collect, a say in what gets made, and a tool that turns customers into designers. The jokes are the product. The world is the moat.

## The four differentiators

### 1. A cast, not a catalog (character IP)
Six launch residents, each a car with a personality, and every design is "said" by one of them:

| Resident | Vehicle | Humor lane | Audience |
|---|---|---|---|
| Coop the Coupe (mascot, mayor) | Red coupe | Dad jokes, puns | Dads, gift buyers |
| Grandma Gearhart | Station wagon | Sassy elder, "back in my day" | Grandparents, moms, gift buyers |
| Torque Norris | Monster truck | Tough guy with a soft heart | Truck owners, off-road |
| Dee Zel | Delivery van | Exhausted worker humor | Trades, nurses, delivery drivers, office workers |
| Sparky Volt | EV | Anxious tech humor | EV owners, tech workers |
| Rusty Bolts | Junker | Junkyard philosopher, self-deprecating | Project-car people, mechanics |

Why it works: characters make sets. People collect sets the way they collect Funko figures or Sanrio. Every order ships with that resident's **trading card** as a Printful pack-in, with a QR code to the character's animated short. Characters also give us an endless social content engine: the residents "say" the drop on TikTok and Reels.

### 2. Pit Lane: customers vote on what gets printed
Each week the design crew pitches about 6 new lines. Customers vote, and the top 3 go into production. Everyone who voted for a winner gets early access and 15% off it.
- Print-on-demand means zero inventory risk, so the community does our product research for free.
- Every voter is a captured email and an early buyer (they've already said they like it).
- **Laps:** each design runs 3 laps (weeks). Big sellers go to the permanent *Hall of Fame*, and the rest retire for good. That creates real scarcity without overstock.

### 3. Vanity Plate Maker (built-in sharing)
Seven characters, a plate style, and a tagline make a one-of-a-kind tee. Vanity plates are a native car-culture joke format, and people share them on their own. Every plate gets a human look before printing (Printful orders start as drafts). Approved plates feed a public **Wall of Plates**, which doubles as SEO and social content.

### 4. Club Kits (B2B traffic engine)
Car clubs, Cars & Coffee meets, local shops, and dealership service departments get a custom Coopteeville run with their name on a resident tee, plus a referral code. Every car meet becomes a mini storefront, and clubs bring their own audiences. This is the one channel competitors can't copy with ad spend.

### Retention: Mileage Club
$1 equals 1 mile. 100 miles gets free shipping for life, 250 unlocks secret residents, and 500 gets your name hidden in a future design. It costs almost nothing and gives people a reason to come back.

## Traffic plan (earned before paid)
1. **Resident shorts:** a 10–15s animated clip per drop, posted to TikTok, Reels, and Shorts. This is our biggest lever.
2. **Pit Lane emails:** a weekly "vote now" and a "your pick won" email (Klaviyo or Resend).
3. **Car meets:** Club Kits, plus stickers handed out at local meets.
4. **SEO pages** per niche ("funny EV shirts", "gifts for truck guys", "mechanic shirts") and the Wall of Plates.
5. **Paid ads** only after organic clips prove a winning hook. Retarget Pit Lane voters.

## Platform recommendations

### Fulfillment: Printful as primary, Printify as an optional second line
| | Printful | Printify | Gelato |
|---|---|---|---|
| Quality consistency | High (in-house facilities) | Varies by print provider | Good |
| Base cost per tee | Higher | Lower (best margins) | Mid |
| Branding (pack-ins, inside labels, packing slips) | Yes | Limited | Limited |
| API for custom storefronts | Mature: orders, mockups, webhooks | Good | Good |
| Best for | Brand experience, trading-card pack-ins | Margin on simple designs | Local printing abroad (EU/UK/AU) |

**Recommendation:** launch on **Printful**. The trading-card pack-in and branded packaging are part of the differentiation, and consistent print quality protects reviews early on. Add Printify later for margin-sensitive basics, and Gelato if international demand shows up. The code keeps fulfillment behind one function, so switching or adding providers is a contained change.
*Check current base prices and pack-in fees in each vendor's dashboard before pricing finalizes.*

### Payments: Stripe Checkout
Hosted checkout with cards, Apple Pay, Google Pay, and Link. Stripe Tax handles sales tax. Stripe handles PCI compliance, so card data never touches our servers. Add PayPal later if checkout data shows demand.

### Hosting: Cloudflare
| Need | Cloudflare product |
|---|---|
| Storefront and API | Workers with static assets |
| Carts, orders, votes, plates | D1 (SQLite) |
| Print files and plate PNGs | R2 |
| Bot protection on votes and plate maker | Turnstile |
| Retrying fulfillment | Queues |
| support@ email | Email Routing |
| Domain and DNS | Cloudflare Registrar |

Why build custom instead of using Shopify: the three differentiators (Pit Lane, Plate Maker, the animated town) are custom experiences anyway, the cost is near zero at launch, and we own the stack. The trade-off is that we build the admin, discount, and email pieces ourselves. If that becomes a drag, a headless Shopify backend can slot in behind the same storefront.

## Unit economics (rough, to validate)
- Price $28 tee / $32 plate tee. Free shipping over $60 encourages buying two or more shirts.
- Printful base cost for a Bella+Canvas 3001 with front print is roughly $12–15. Stripe fees run about 3%.
- That leaves a gross margin of about $10–13 per tee before ads. Club Kits and bundles of two or more raise average order value.
