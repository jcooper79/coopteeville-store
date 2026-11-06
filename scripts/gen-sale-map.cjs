const fs=require('fs');
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const LANES=[["Customer","phone or laptop"],["Coopteeville","Cloudflare Worker · D1 · R2"],["Stripe","payments · tax · receipts"],["Printful","print · pack · ship"],["Resend","email"],["Crew & Owner","agents + approvals"]];
const X=i=>150+i*190, W=1200;
const ROWS=[
 {p:"Checkout"},
 {a:0,b:1,t:"Taps Checkout",s:"POST /api/checkout"},
 {a:1,t:"Re-prices cart, saves it",s:"catalog.ts · D1 carts"},
 {a:1,b:2,t:"Create Checkout Session",s:"Stripe API · secret key"},
 {a:2,b:0,t:"Hosted checkout page",s:"card · Apple Pay · Stripe Tax"},
 {a:0,b:2,t:"Pays"},
 {a:2,b:0,t:"Receipt email",s:"Stripe setting"},
 {p:"Payment confirmed: straight to production"},
 {a:2,b:1,t:"Payment succeeded",s:"signed webhook /api/webhooks/stripe"},
 {a:1,t:"Records the order once",s:"no double orders on retries"},
 {a:1,t:"Plate check",s:"blocklist now · AI check planned",k:"plan"},
 {a:1,b:5,t:"Flagged plate waits for review",s:"plate orders only, until the AI check ships",k:"man"},
 {a:1,b:3,t:"Create order, confirmed",s:"POST /orders?confirm=true · print file from R2"},
 {p:"Printing and delivery"},
 {a:3,t:"Prints, packs, ships",s:"DTG print · resident card pack-in"},
 {a:3,b:0,t:"Package delivered",s:"carrier chosen by Printful"},
 {a:3,b:1,t:"Shipped, with tracking",s:"webhook /api/webhooks/printful"},
 {a:1,b:4,t:"Send tracking email",s:"Resend API"},
 {a:4,b:0,t:"“Your tee is on the road”"},
 {p:"Exceptions only: when something goes wrong"},
 {a:3,b:1,t:"Order failed or on hold",s:"status set to error"},
 {a:1,b:5,t:"Exception queue",s:"Fulfillment Coordinator fixes and retries",k:"man"},
 {a:0,b:5,t:"Question or misprint photo",s:"support@ · Customer Happiness Rep",k:"man"},
 {a:5,b:2,t:"Refund",s:"owner approves · Stripe",k:"man"},
 {a:5,b:3,t:"Reprint claim",s:"Printful covers misprints",k:"man"}
];
let y=118, n=0, body="", rowsSvg="";
const tw=(s,f)=>s.length*f*0.56;
function lbl(x,yy,t,cls,anchor="middle",f=12.5){const w=tw(t,f)+10;const rx=anchor==="middle"?x-w/2:x-5;return `<rect class="lblbg" x="${rx.toFixed(1)}" y="${yy-f+1}" width="${w.toFixed(1)}" height="${f+5}" rx="3"/><text class="${cls}" x="${x}" y="${yy}" text-anchor="${anchor}">${esc(t)}</text>`}
for(const r of ROWS){
 if(r.p){rowsSvg+=`<rect class="phase" x="8" y="${y-4}" width="${W-16}" height="26" rx="6"/><text class="phaset" x="20" y="${y+13}">${esc(r.p.toUpperCase())}</text>`;y+=40;continue}
 n++; const k=r.k||"auto";
 rowsSvg+=`<g class="step ${k}"><circle class="num" cx="40" cy="${y}" r="12"/><text class="numt" x="40" y="${y+4}" text-anchor="middle">${n}</text>`;
 if(r.b===undefined){const x=X(r.a);
  rowsSvg+=`<path class="arr" d="M${x} ${y-9} h30 v18 h-24" marker-end="url(#ah-${k})"/>`+lbl(x+40,y-2,r.t,"t","start")+(r.s?lbl(x+40,y+14,r.s,"s","start",11):"");
 }else{const xa=X(r.a),xb=X(r.b),dir=xb>xa?1:-1,mid=(xa+xb)/2;
  rowsSvg+=`<line class="arr" x1="${xa+dir*4}" y1="${y}" x2="${xb-dir*8}" y2="${y}" marker-end="url(#ah-${k})"/>`+lbl(mid,y-7,r.t,"t")+(r.s?lbl(mid,y+16,r.s,"s","middle",11):"");
 }
 rowsSvg+=`</g>`; y+=52;
}
const H=y+10;
let head="";LANES.forEach(([a,b],i)=>{const x=X(i);head+=`<line class="life" x1="${x}" y1="72" x2="${x}" y2="${H-6}"/><rect class="lane" x="${x-82}" y="14" width="164" height="54" rx="10"/><text class="lt" x="${x}" y="37" text-anchor="middle">${esc(a)}</text><text class="ls" x="${x}" y="55" text-anchor="middle">${esc(b)}</text>`});
const marker=k=>`<marker id="ah-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="mk-${k}"/></marker>`;
const seq=`<svg class="diagram" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sequence of one Coopteeville sale: checkout through Stripe, automatic production at Printful, shipping email through Resend, and the five exception paths that need a person."><defs>${marker("auto")}${marker("man")}${marker("plan")}</defs>${head}${rowsSvg}</svg>`;

// pipeline figure
const PW=1200, bw=150, bh=70, xs=[20,220,420,620,820], r1=46, r2=196;
const box=(x,yy,t,s,cls="")=>`<rect class="pbox ${cls}" x="${x}" y="${yy}" width="${bw}" height="${bh}" rx="10"/><text class="pt" x="${x+bw/2}" y="${yy+30}" text-anchor="middle">${esc(t)}</text><text class="ps" x="${x+bw/2}" y="${yy+50}" text-anchor="middle">${esc(s)}</text>`;
const arrow=(x1,x2,yy,t,k="auto")=>`<line class="arr ${k}" x1="${x1}" y1="${yy}" x2="${x2-6}" y2="${yy}" marker-end="url(#ph-${k})"/>${t?`<text class="s" x="${(x1+x2)/2}" y="${yy-8}" text-anchor="middle">${esc(t)}</text>`:""}`;
const row1=[["Product Picker","weekly brief"],["Designers","print files + mockups"],["Owner approves","design sign-off","gate"],["Pit Lane vote","customers pick 3"],["Published","catalog · Printful · R2"]];
const row2=[["Car Storyteller","scripts + copy"],["Video Creator","9:16 shorts"],["Social Media Mgr","posts + replies"],["Promotion Spec.","drops · codes · ads"],["Owner approves","ad spend · big discounts","gate"]];
const lab1=["brief","files","approved","winners"], lab2=["scripts","shorts","posts","spend"];
let pipe="";
row1.forEach((b,i)=>{pipe+=box(xs[i],r1,b[0],b[1],b[2]||"");if(i<4)pipe+=arrow(xs[i]+bw,xs[i+1],r1+bh/2,lab1[i])});
row2.forEach((b,i)=>{pipe+=box(xs[i],r2,b[0],b[1],b[2]||"");if(i<4)pipe+=arrow(xs[i]+bw,xs[i+1],r2+bh/2,lab2[i])});
pipe+=`<rect class="pbox store" x="1030" y="${r1}" width="150" height="${r2+bh-r1}" rx="12"/><text class="pt" x="1105" y="${(r1+r2+bh)/2-6}" text-anchor="middle">Storefront</text><text class="ps" x="1105" y="${(r1+r2+bh)/2+14}" text-anchor="middle">coopteeville.com</text>`;
pipe+=arrow(xs[4]+bw,1030,r1+bh/2,"for sale");
pipe+=arrow(xs[4]+bw,1030,r2+bh/2,"traffic");
pipe+=`<path class="arr fb" d="M1105 ${r2+bh} V${r2+bh+44} H95 V${r2+bh+6}" marker-end="url(#ph-auto)"/><text class="s" x="560" y="${r2+bh+38}" text-anchor="middle">sales · votes · comments · code results feed next week's picks and stories</text>`;
pipe+=`<text class="phaset" x="20" y="30">SHOP CREW: MAKE THE PRODUCT</text><text class="phaset" x="20" y="${r2-16}">STREET CREW: BRING THE BUYERS</text>`;
const pipeSvg=`<svg class="diagram" viewBox="0 0 ${PW} ${r2+bh+60}" role="img" aria-label="Before the sale: the shop crew moves a design from brief to published with one owner approval, and the street crew moves a story to promotion with an owner approval on ad spend; both feed the storefront, and results loop back."><defs><marker id="ph-auto" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 z" class="mk-auto"/></marker></defs>${pipe}</svg>`;

const IFACES=[
 ["Storefront → Worker","/api/checkout, /api/pitlane, /api/pitlane/vote","JSON over HTTPS","Built","Turnstile bot check planned"],
 ["Worker → Stripe","Checkout Sessions API","Secret key (Worker secret)","Built",""],
 ["Stripe → Worker","/api/webhooks/stripe","Signed (HMAC, 5 min window)","Built","Idempotent on session id"],
 ["Worker → Printful","POST /orders?confirm=true","API token","Built","Needs variant IDs mapped"],
 ["Printful → Worker","/api/webhooks/printful","Secret token in URL","Built","shipped, failed, on hold, canceled"],
 ["Worker → Resend","POST /emails","API key","Built","Sends once the key is added"],
 ["Worker ↔ D1","carts, orders, votes, plates","Binding","Built",""],
 ["Worker ↔ R2","print files, plate PNGs, mockups","Binding","Planned","Plate PNG render in the Worker"],
 ["Worker → Claude","Plate text moderation","API key","Planned","Then PLATE_AUTO_APPROVE=true"],
 ["Crew agents ↔ store","Read orders, work exceptions, draft replies","Scoped API token","Planned","Scheduled agent runs"],
 ["Owner approvals","Refunds, ad spend, designs, flagged plates","Approval queue (ResQ Collab or email)","Planned",""],
 ["Street crew → socials","TikTok, Reels, Shorts, Pinterest","Scheduler (Buffer or Later)","Planned","Approved calendar only"]
];
const ifaceRows=IFACES.map(r=>`<tr><td>${esc(r[0])}</td><td><code>${esc(r[1])}</code></td><td>${esc(r[2])}</td><td><span class="pill ${r[3]==="Built"?"ok":"plan"}">${r[3]}</span></td><td>${esc(r[4])}</td></tr>`).join("");

const MANUAL=[
 ["Flagged plate","Plate orders, until the AI check ships","Fulfillment Coordinator","Approve or edit the draft in Printful","Automate: AI check, then auto-confirm"],
 ["Printful failed or on hold","Bad address, missing file, stock","Fulfillment Coordinator","Fix and resubmit","Automate: retry queue for temporary errors"],
 ["Refund or chargeback","Customer asks, or a dispute opens","Owner","Approve in Stripe","Stays manual: money leaves"],
 ["Misprint reprint","Customer sends a photo","Customer Happiness, then Fulfillment","File a Printful reprint claim","Stays manual: needs a judgment call"],
 ["Customer questions","Sizing, where's my order","Customer Happiness Rep","Agent answers alone","Mostly automated already"]
];
const manRows=MANUAL.map(r=>`<tr><td><b>${esc(r[0])}</b></td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td>${esc(r[4])}</td></tr>`).join("");

const page=`<title>Coopteeville Sale Map</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Baloo+2:wght@500;600;700;800&family=JetBrains+Mono:wght@500&display=swap">
<style>
/* Layout: one engineering sheet. Summary chips, then the sequence of a sale (lanes = systems, rows = time), then the crews upstream, then the interface and manual-touch tables. */
:root{--bg:#f4f8fd;--panel:#ffffff;--fg:#1c2033;--muted:#576079;--line:#c9d3e3;--phase:#e6eef9;--manual:#d9480f;--manual-bg:#fff0e6;--ok:#1f8a5c;--ok-bg:#e3f6ec;--plan:#6a5acd;--plan-bg:#efedfb;--cherry:#e0362b;
--display:"Bungee","Arial Black",system-ui,sans-serif;--body:"Baloo 2","Trebuchet MS",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,Menlo,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#131624;--panel:#1b1f31;--fg:#e8ecf6;--muted:#a3acc4;--line:#353c57;--phase:#22283f;--manual:#ff8f4d;--manual-bg:#3a2417;--ok:#4fd39a;--ok-bg:#16332a;--plan:#a99cff;--plan-bg:#272347;--cherry:#ff6a5c;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#131624;--panel:#1b1f31;--fg:#e8ecf6;--muted:#a3acc4;--line:#353c57;--phase:#22283f;--manual:#ff8f4d;--manual-bg:#3a2417;--ok:#4fd39a;--ok-bg:#16332a;--plan:#a99cff;--plan-bg:#272347;--cherry:#ff6a5c;color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--body);font-size:16px;line-height:1.5}
.wrap>*{min-width:0}
.wrap{max-width:1240px;margin:0 auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:36px 56px;display:grid;gap:40px}
h1,h2{font-family:var(--display);font-weight:400;line-height:1.1;margin:0;text-wrap:balance}
h1{font-size:clamp(1.9rem,4vw,2.8rem)} h1 span{color:var(--cherry)}
h2{font-size:1.35rem;margin-bottom:6px}
p{margin:0;max-width:68ch;color:var(--muted);font-weight:600}
.eyebrow{font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-size:.78rem;color:var(--muted)}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px}
.chip{background:var(--panel);border:2px solid var(--line);border-radius:12px;padding:10px 14px;min-width:0}
.chip b{display:block;font-family:var(--display);font-weight:400;font-size:1.5rem;font-variant-numeric:tabular-nums}
.chip.man{border-color:var(--manual)} .chip.man b{color:var(--manual)}
.chip.ok b{color:var(--ok)}
.legend{display:flex;flex-wrap:wrap;gap:18px;font-weight:700;font-size:.9rem;color:var(--muted);margin-top:10px}
.legend i{display:inline-block;width:30px;height:0;border-top:3px solid var(--fg);vertical-align:middle;margin-right:6px}
.legend .m i{border-color:var(--manual)} .legend .p i{border-top-style:dashed;border-color:var(--plan)}
.scroll{overflow-x:auto;background:var(--panel);border:2px solid var(--line);border-radius:16px;padding:8px}
figure{margin:0;display:grid;gap:10px}
figcaption{color:var(--muted);font-weight:600;font-size:.95rem;max-width:80ch}
svg.diagram{display:block;width:100%;min-width:900px;height:auto;color:var(--fg);font-family:var(--body)}
svg .life{stroke:var(--line);stroke-width:2;stroke-dasharray:4 5}
svg .lane{fill:var(--phase);stroke:currentColor;stroke-width:2}
svg .lt{font-family:var(--display);font-size:14px;fill:currentColor}
svg .ls,svg .ps{font-size:11.5px;fill:var(--muted);font-weight:600}
svg .phase{fill:var(--phase)} svg .phaset{font-size:11.5px;font-weight:800;letter-spacing:.1em;fill:var(--muted)}
svg .lblbg{fill:var(--panel)}
svg .t{font-size:12.5px;font-weight:700;fill:currentColor} svg .s{font-size:11px;font-weight:600;fill:var(--muted);font-family:var(--body)}
svg .arr{stroke:currentColor;stroke-width:2;fill:none}
svg .num{fill:var(--panel);stroke:currentColor;stroke-width:2} svg .numt{font-size:11px;font-weight:800;fill:currentColor}
svg .mk-auto{fill:currentColor} svg .mk-man{fill:var(--manual)} svg .mk-plan{fill:var(--plan)}
svg .man .arr{stroke:var(--manual)} svg .man .num{fill:var(--manual);stroke:var(--manual)} svg .man .numt{fill:#fff} svg .man .t{fill:var(--manual)}
svg .plan .arr{stroke:var(--plan);stroke-dasharray:6 5} svg .plan .num{stroke:var(--plan);stroke-dasharray:3 3}
svg .pbox{fill:var(--panel);stroke:currentColor;stroke-width:2} svg .pbox.gate{fill:var(--manual-bg);stroke:var(--manual)} svg .pbox.store{fill:var(--phase)}
svg .pt{font-size:13.5px;font-weight:800;fill:currentColor} svg .fb{stroke-dasharray:5 5;stroke:var(--muted)}
table{width:100%;border-collapse:collapse;background:var(--panel);font-size:.95rem;min-width:760px}
th,td{text-align:left;padding:10px 12px;border-bottom:1px solid var(--line);vertical-align:top}
th{font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
code{font-family:var(--mono);font-size:.82rem;overflow-wrap:anywhere}
.pill{display:inline-block;border-radius:999px;padding:0 10px;font-weight:800;font-size:.8rem}
.pill.ok{background:var(--ok-bg);color:var(--ok)} .pill.plan{background:var(--plan-bg);color:var(--plan)}
.tbl{overflow-x:auto;border:2px solid var(--line);border-radius:16px}
.mantable tr td:first-child{border-left:4px solid var(--manual)}
.note{background:var(--panel);border:2px solid var(--line);border-radius:16px;padding:16px 18px;display:grid;gap:6px}
.note p{color:var(--fg)}
</style>
<div class="wrap">
 <header>
  <div class="eyebrow">How one sale works, end to end</div>
  <h1>Coopteeville <span>Sale Map</span></h1>
  <p style="margin-top:8px">A normal order goes from tap to doorstep with no person involved. People step in only when something goes wrong or money leaves the business.</p>
  <div class="chips">
   <div class="chip ok"><b>0</b>manual steps on a normal order</div>
   <div class="chip man"><b>5</b>exception types that reach a person</div>
   <div class="chip"><b>6</b>systems involved</div>
   <div class="chip"><b>8</b>crew roles</div>
  </div>
  <div class="legend"><span><i></i>Automated, built</span><span class="p"><i></i>Planned</span><span class="m"><i></i>Manual touch</span></div>
 </header>

 <section>
  <h2>One order, start to finish</h2>
  <figure>
   <div class="scroll">${seq}</div>
   <figcaption>Each column is a system; time runs down the page. Steps 1–16 run on their own. Step 10 applies only to Vanity Plate orders until the AI plate check ships. Steps 18–21 happen only when something goes wrong.</figcaption>
  </figure>
 </section>

 <section>
  <h2>Before the sale: who makes it and who sells it</h2>
  <figure>
   <div class="scroll">${pipeSvg}</div>
   <figcaption>The two crews work upstream of every sale. The owner signs off on new designs and on anything that spends money; everything else runs on a weekly rhythm (see docs/TEAM.md).</figcaption>
  </figure>
 </section>

 <section>
  <h2>Where a person touches it</h2>
  <div class="tbl"><table class="mantable"><thead><tr><th>Exception</th><th>When it happens</th><th>Who</th><th>What they do</th><th>Path to automation</th></tr></thead><tbody>${manRows}</tbody></table></div>
 </section>

 <section>
  <h2>Every interface</h2>
  <div class="tbl"><table><thead><tr><th>Connection</th><th>Endpoint</th><th>Auth</th><th>Status</th><th>Notes</th></tr></thead><tbody>${ifaceRows}</tbody></table></div>
 </section>

 <section class="note">
  <h2>To go fully hands-off</h2>
  <p>1. Map Printful variant IDs and upload print files to R2. Until then, orders fail and land in the exception queue.</p>
  <p>2. Ship the AI plate check, then set PLATE_AUTO_APPROVE to true. Plate orders then print without review.</p>
  <p>3. Add a retry queue (Cloudflare Queues) so temporary Printful or network errors retry on their own.</p>
  <p>4. Keep refunds and misprint judgment calls with people. They are rare and involve money or judgment.</p>
 </section>
</div>`;
fs.writeFileSync(process.argv[2],page);
