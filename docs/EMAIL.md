# Coopteeville Email Addresses

Every address has a job and a crew owner. All of them forward to the owner's inbox until the crew agents are connected.

| Address | Use | Crew owner |
|---|---|---|
| **gearhead@coopteeville.com** | Customer help: sizing, "where's my order", anything | Customer Happiness Rep |
| **pitcrew@coopteeville.com** | Order problems, misprints, reprints, shipping | Fulfillment Coordinator |
| **tollbooth@coopteeville.com** | Billing, refunds, receipts, chargebacks | Owner |
| **showroom@coopteeville.com** | Sales: Club Kits, bulk and wholesale orders | Promotion Specialist |
| **carpool@coopteeville.com** | Partnerships: creators, car clubs, car meets, affiliates | Promotion Specialist |
| **honk@coopteeville.com** | Hello, fan mail, customer stories, press | Car Storyteller |
| **plates@coopteeville.com** | Plate Maker questions and plate review | Fulfillment Coordinator |
| **glovebox@coopteeville.com** | Sender address for receipts and shipping emails ("Coopteeville Pit Crew"). Replies forward to gearhead@ | Automated |

## Setup (Cloudflare Email Routing)
1. Cloudflare dashboard > coopteeville.com > Email > Email Routing > Enable. Cloudflare adds the MX and SPF records (the zone's DNS was cleared, so these are needed).
2. Add the destination inbox and click the verification email.
3. Add one routing rule per address above, plus a catch-all to gearhead@.
4. For sending (glovebox@ via Resend), add Resend's DKIM and SPF records when the Resend account is created.

The deploy token cannot do this today. To let Claude set it up, add these permissions to the token: **Zone > Email Routing Rules: Edit**, **Account > Email Routing Addresses: Edit**, **Zone > DNS: Edit**.
