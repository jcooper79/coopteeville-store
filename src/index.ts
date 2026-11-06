import {
  COLORS, PIT_LANE_IDS, PLATE, PLATE_STYLES, PLATE_TAGS, SHIPPING, SIZES,
  findProduct, validPlate, type Color, type Size,
} from "./catalog";

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  SITE_URL: string;
  PRINTFUL_AUTO_CONFIRM: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PRINTFUL_API_KEY: string;
  PRINTFUL_STORE_ID?: string;
  VOTE_SALT: string;
}

interface CartItem {
  id: string;
  size: Size;
  color: Color;
  qty: number;
  custom: { text: string; style: string; tag: string } | null;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(req.url);
    try {
      if (pathname === "/api/checkout" && req.method === "POST") return await checkout(req, env);
      if (pathname === "/api/webhooks/stripe" && req.method === "POST") return await stripeWebhook(req, env);
      if (pathname === "/api/pitlane" && req.method === "GET") return await tallies(env);
      if (pathname === "/api/pitlane/vote" && req.method === "POST") return await vote(req, env);
      if (pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
      return env.ASSETS.fetch(req);
    } catch (err) {
      console.error(err);
      return json({ error: "Something went wrong on our end. Please try again." }, 500);
    }
  },
} satisfies ExportedHandler<Env>;

/* ---------------- Checkout ---------------- */

function parseCart(body: unknown): CartItem[] | string {
  const items = (body as { items?: unknown })?.items;
  if (!Array.isArray(items) || items.length === 0 || items.length > 25) return "Your cart is empty or too large.";
  const out: CartItem[] = [];
  for (const raw of items as Record<string, unknown>[]) {
    const product = findProduct(String(raw.id));
    const size = String(raw.size) as Size;
    const color = String(raw.color) as Color;
    const qty = Number(raw.qty);
    if (!product) return "One of the items is no longer available.";
    if (!SIZES.includes(size) || !COLORS.includes(color) || !product.colors.includes(color)) return "Pick a valid size and color.";
    if (!Number.isInteger(qty) || qty < 1 || qty > 10) return "Quantity must be between 1 and 10.";
    let custom: CartItem["custom"] = null;
    if (product.id === PLATE.id) {
      const c = raw.custom as Record<string, unknown> | null;
      const text = String(c?.text ?? "").toUpperCase();
      if (!validPlate(text)) return "That plate can't be printed. Try different letters.";
      if (!PLATE_STYLES.includes(String(c?.style) as never) || !PLATE_TAGS.includes(String(c?.tag))) return "Pick a plate style and tagline.";
      custom = { text, style: String(c!.style), tag: String(c!.tag) };
    }
    out.push({ id: product.id, size, color, qty, custom });
  }
  return out;
}

async function checkout(req: Request, env: Env): Promise<Response> {
  const cart = parseCart(await req.json().catch(() => null));
  if (typeof cart === "string") return json({ error: cart }, 400);

  const cartId = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO carts (id, items_json) VALUES (?, ?)").bind(cartId, JSON.stringify(cart)).run();

  const f = new URLSearchParams();
  f.set("mode", "payment");
  f.set("client_reference_id", cartId);
  f.set("success_url", `${env.SITE_URL}/thanks?session_id={CHECKOUT_SESSION_ID}`);
  f.set("cancel_url", `${env.SITE_URL}/#shop`);
  f.set("automatic_tax[enabled]", "true");
  f.set("allow_promotion_codes", "true");
  f.set("shipping_address_collection[allowed_countries][0]", "US");
  f.set("shipping_address_collection[allowed_countries][1]", "CA");

  let subtotal = 0;
  cart.forEach((item, i) => {
    const product = findProduct(item.id)!;
    subtotal += product.priceCents * item.qty;
    const name = item.custom ? `Vanity Plate Tee: ${item.custom.text}` : product.name;
    f.set(`line_items[${i}][quantity]`, String(item.qty));
    f.set(`line_items[${i}][price_data][currency]`, "usd");
    f.set(`line_items[${i}][price_data][unit_amount]`, String(product.priceCents));
    f.set(`line_items[${i}][price_data][tax_behavior]`, "exclusive");
    f.set(`line_items[${i}][price_data][product_data][name]`, name);
    f.set(`line_items[${i}][price_data][product_data][description]`, `${item.size} · ${item.color}`);
    f.set(`line_items[${i}][price_data][product_data][tax_code]`, "txcd_30011000"); // clothing
  });

  const free = subtotal >= SHIPPING.freeOverCents;
  f.set("shipping_options[0][shipping_rate_data][type]", "fixed_amount");
  f.set("shipping_options[0][shipping_rate_data][display_name]", free ? "Free standard shipping" : "Standard shipping");
  f.set("shipping_options[0][shipping_rate_data][fixed_amount][amount]", String(free ? 0 : SHIPPING.flatCents));
  f.set("shipping_options[0][shipping_rate_data][fixed_amount][currency]", "usd");
  f.set("shipping_options[0][shipping_rate_data][tax_behavior]", "exclusive");

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: { authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "content-type": "application/x-www-form-urlencoded" },
    body: f,
  });
  const session = (await res.json()) as { url?: string; error?: { message: string } };
  if (!res.ok || !session.url) {
    console.error("stripe checkout error", session.error?.message);
    return json({ error: "Checkout couldn't start. Please try again in a minute." }, 502);
  }
  return json({ url: session.url });
}

/* ---------------- Stripe webhook -> Printful ---------------- */

async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verifyStripe(req: Request, body: string, secret: string): Promise<boolean> {
  const header = req.headers.get("stripe-signature") ?? "";
  const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
  const t = Number(parts.t);
  if (!t || Math.abs(Date.now() / 1000 - t) > 300) return false;
  const expected = await hmacHex(secret, `${t}.${body}`);
  return header.split(",").some((kv) => kv.startsWith("v1=") && safeEqual(kv.slice(3), expected));
}

async function stripeWebhook(req: Request, env: Env): Promise<Response> {
  const body = await req.text();
  if (!(await verifyStripe(req, body, env.STRIPE_WEBHOOK_SECRET))) return json({ error: "bad signature" }, 400);

  const event = JSON.parse(body);
  if (event.type !== "checkout.session.completed") return json({ received: true });
  const s = event.data.object;
  if (s.payment_status !== "paid") return json({ received: true });

  // Idempotency: Stripe retries webhooks; the UNIQUE constraint stops double orders.
  const inserted = await env.DB.prepare(
    "INSERT OR IGNORE INTO orders (stripe_session_id, cart_id, email, amount_total) VALUES (?, ?, ?, ?)",
  ).bind(s.id, s.client_reference_id, s.customer_details?.email ?? null, s.amount_total).run();
  if (!inserted.meta.changes) return json({ received: true, duplicate: true });

  const row = await env.DB.prepare("SELECT items_json FROM carts WHERE id = ?").bind(s.client_reference_id).first<{ items_json: string }>();
  if (!row) {
    await markOrder(env, s.id, "error", null, "cart not found");
    return json({ received: true });
  }

  try {
    const pfId = await createPrintfulOrder(env, s, JSON.parse(row.items_json) as CartItem[]);
    await markOrder(env, s.id, env.PRINTFUL_AUTO_CONFIRM === "true" ? "sent_to_printful" : "printful_draft", pfId, null);
  } catch (err) {
    // Payment is captured; flag for manual fulfillment instead of failing the webhook.
    await markOrder(env, s.id, "error", null, String(err).slice(0, 500));
  }
  return json({ received: true });
}

const markOrder = (env: Env, sessionId: string, status: string, pfId: string | null, error: string | null) =>
  env.DB.prepare("UPDATE orders SET status = ?, printful_order_id = ?, error = ? WHERE stripe_session_id = ?")
    .bind(status, pfId, error, sessionId).run();

async function createPrintfulOrder(env: Env, s: any, cart: CartItem[]): Promise<string> {
  // Newer Stripe API versions nest shipping under collected_information.
  const ship = s.collected_information?.shipping_details ?? s.shipping_details;
  const a = ship?.address;
  if (!a) throw new Error("no shipping address on session");

  const items = cart.map((item) => {
    const product = findProduct(item.id)!;
    const variantId = product.printful.variantIds[`${item.color}:${item.size}`];
    if (!variantId) throw new Error(`no Printful variant mapped for ${item.id} ${item.color}:${item.size}`);
    const file = item.custom
      ? `${env.SITE_URL}/api/print/plate?${new URLSearchParams(item.custom)}` // TODO: render plate PNG to R2
      : product.printful.frontFile;
    return { variant_id: variantId, quantity: item.qty, files: [{ type: "front", url: file }] };
  });

  const headers: Record<string, string> = { authorization: `Bearer ${env.PRINTFUL_API_KEY}`, "content-type": "application/json" };
  if (env.PRINTFUL_STORE_ID) headers["X-PF-Store-Id"] = env.PRINTFUL_STORE_ID;

  const confirm = env.PRINTFUL_AUTO_CONFIRM === "true";
  const res = await fetch(`https://api.printful.com/orders?confirm=${confirm}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      external_id: String(s.id).slice(-32),
      recipient: {
        name: ship.name, address1: a.line1, address2: a.line2 ?? "", city: a.city,
        state_code: a.state, country_code: a.country, zip: a.postal_code, email: s.customer_details?.email,
      },
      items,
      packing_slip: { message: "Thanks for visiting Coopteeville. Your resident card is inside." },
    }),
  });
  const out = (await res.json()) as { result?: { id: number }; error?: { message: string } };
  if (!res.ok || !out.result) throw new Error(`printful ${res.status}: ${out.error?.message ?? "unknown"}`);
  return String(out.result.id);
}

/* ---------------- Pit Lane votes ---------------- */

async function tallies(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare("SELECT design_id, COUNT(*) AS n FROM votes GROUP BY design_id").all<{ design_id: string; n: number }>();
  return json({ tallies: Object.fromEntries(results.map((r) => [r.design_id, r.n])) });
}

async function vote(req: Request, env: Env): Promise<Response> {
  const { designId } = ((await req.json().catch(() => ({}))) ?? {}) as { designId?: string };
  if (!designId || !PIT_LANE_IDS.includes(designId)) return json({ error: "Unknown design." }, 400);
  // One vote per design per visitor. Add Cloudflare Turnstile before public launch.
  const who = `${req.headers.get("cf-connecting-ip") ?? ""}|${req.headers.get("user-agent") ?? ""}`;
  const voter = await hmacHex(env.VOTE_SALT, who);
  await env.DB.prepare("INSERT OR IGNORE INTO votes (design_id, voter_hash) VALUES (?, ?)").bind(designId, voter).run();
  return json({ ok: true });
}
