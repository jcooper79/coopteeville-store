// Renders the sample "Monday Ran Me Over" reel (1080x1920, 30fps) frame by frame, then encodes with ffmpeg.
// Usage: node scripts/render-reel.cjs <mockup.jpg> <out.mp4>
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const [mockupPath, out] = process.argv.slice(2);
const FPS = 30, DUR = 13, W = 1080, H = 1920;
const framesDir = path.join(path.dirname(out), "reel-frames");
fs.rmSync(framesDir, { recursive: true, force: true }); fs.mkdirSync(framesDir, { recursive: true });
const mockup = "data:image/jpeg;base64," + fs.readFileSync(mockupPath).toString("base64");
const logo = fs.readFileSync(path.resolve(__dirname, "../public/assets/logo.svg"), "utf8");

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.goto("file://" + path.resolve(__dirname, "../public/index.html"));
  await p.evaluate(async () => { await document.fonts.load("40px Bungee"); await document.fonts.load("800 40px 'Baloo 2'"); await document.fonts.ready; });
  await p.evaluate(({ mockup, logo, W, H }) => {
    const C = window.Coopteeville;
    for (let i = 1; i < 10000; i++) { clearInterval(i); clearTimeout(i); }
    document.querySelectorAll("header,main,footer,.scrim,.drawer,.toast,.garage,script").forEach((e) => e.remove());
    const st = document.createElement("style");
    st.textContent = `*{animation:none!important;transition:none!important}
      html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#9ddcff}
      #stage{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:linear-gradient(#6fc0fb 0%,#9ddcff 45%,#ffe3b3 80%,#ffc98a 100%);font-family:"Baloo 2",sans-serif}
      .abs{position:absolute;will-change:transform,opacity}
      .cap{left:60px;right:60px;top:210px;text-align:center;font-family:Bungee,sans-serif;font-size:118px;line-height:1.02;color:#1c2033;text-shadow:0 6px 0 rgba(255,255,255,.65)}
      .cap em{font-style:normal;color:#e0362b}
      .sub{left:80px;right:80px;text-align:center;font-weight:800;font-size:46px;color:#1c2033}
      #road{left:0;right:0;top:1380px;height:330px;background:#2c3040;border-top:10px solid #3a3f52}
      #road i{position:absolute;left:0;right:0;top:150px;height:14px;background:repeating-linear-gradient(90deg,#ffc83a 0 90px,transparent 90px 180px)}
      #hills{left:0;right:0;top:1230px;height:170px}
      #sun{width:300px;height:300px;border-radius:50%;right:90px;top:1000px;background:radial-gradient(#fff6d6,#ffd36b 55%,rgba(255,200,90,0) 72%)}
      #reelBubble{left:110px;right:110px;top:560px;background:#fff;border:8px solid #1c2033;border-radius:50px;padding:28px 40px;font-weight:800;font-size:64px;text-align:center;line-height:1.1}
      #reelBubble:after{content:"";position:absolute;left:50%;bottom:-38px;width:60px;height:60px;background:#fff;border-right:8px solid #1c2033;border-bottom:8px solid #1c2033;transform:translateX(-50%) rotate(45deg)}
      #shirt{left:120px;width:840px;top:600px;border:10px solid #1c2033;border-radius:48px;overflow:hidden;background:#fff;box-shadow:0 24px 0 rgba(28,32,51,.25)}
      #shirt img{display:block;width:100%}
      #shirt b{position:absolute;left:24px;top:24px;background:#ffc83a;border:5px solid #1c2033;border-radius:16px;padding:4px 16px;font-family:Bungee,sans-serif;font-size:30px}
      #logo{left:90px;right:90px;top:560px}
      #logo svg{width:100%;height:auto}
      #url{left:0;right:0;top:1130px;text-align:center;font-family:Bungee,sans-serif;font-size:76px;color:#1c2033}
      #flash{inset:0;background:#fff}`;
    document.head.appendChild(st);
    let blocks = ""; for (let i = 0; i < 70; i++) { const x = i * 54; blocks += `<path d="M${x} 0 h36 l24 57 h-36z M${x + 24} 69 h36 l-24 57 h-36z"/>`; }
    const tread = `<svg width="3800" height="130" viewBox="0 0 3800 130"><g fill="#3a3f52"><rect x="0" y="59" width="3800" height="9"/>${blocks}</g></svg>`;
    document.body.innerHTML = `<div id="stage">
      <div class="abs" id="sun"></div>
      <svg class="abs" id="hills" viewBox="0 0 1080 170" preserveAspectRatio="none"><path d="M0 170 L0 80 Q180 10 380 70 T760 60 T1080 70 L1080 170Z" fill="#7ad37f"/><path d="M0 170 L0 120 Q260 60 540 110 T1080 105 L1080 170Z" fill="#5cbf68"/></svg>
      <div class="abs" id="road"><i></i></div>
      <div class="abs" id="side" style="left:0;top:1380px;width:620px"><svg viewBox="0 0 170 80" width="620">${C.carSideInner("#ff4b3e", true)}</svg></div>
      <div class="abs" id="front" style="left:140px;top:760px;width:800px">${C.carFront(C.RES.coop, { k: "reelA", still: true })}</div>
      <div class="abs" id="frontTired" style="left:140px;top:760px;width:800px">${C.carFront({ ...C.RES.coop, mood: "tired" }, { k: "reelB", still: true })}</div>
      <div class="abs" id="track1" style="left:-1400px;top:1010px">${tread}</div>
      <div class="abs" id="track2" style="left:-1400px;top:1290px">${tread}</div>
      <div class="abs cap" id="cap1">Meet<br><em>Coop.</em></div>
      <div class="abs cap" id="cap2">It's<br>Monday.</div>
      <div class="abs" id="reelBubble">Ugh. Mondays always try to run me over…</div>
      <div class="abs cap" id="cap3">Monday ran<br><em>me over.</em></div>
      <div class="abs cap" id="cap4" style="top:200px;font-size:96px">The Tired<br><em>Collection</em></div>
      <div class="abs" id="shirt"><img src="${mockup}" alt=""><b>REAL SHIRT</b></div>
      <div class="abs sub" id="sub4" style="top:1520px;color:#fff">Real shirt. Real tread marks.<br>(Printed. Not driven.)</div>
      <div class="abs cap" id="cap5" style="top:250px;font-size:104px">Collect<br><em>them all.</em></div>
      <div class="abs" id="logo">${logo}</div>
      <div class="abs" id="url">coopteeville.com</div>
      <div class="abs sub" id="sub5" style="top:1250px">Opening soon. Join the Car Club.</div>
      <div class="abs" id="flash"></div>
    </div>`;
    const $ = (id) => document.getElementById(id);
    const clamp = (x) => Math.max(0, Math.min(1, x));
    const seg = (t, a, b) => clamp((t - a) / (b - a));
    const easeOut = (x) => 1 - Math.pow(1 - x, 3);
    const back = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
    const show = (el, o, tf = "") => { el.style.opacity = o; el.style.transform = tf; el.style.visibility = o > 0.001 ? "visible" : "hidden"; };
    const wheels = [...document.querySelectorAll("#side .wheel")]; wheels.forEach((w) => { w.style.transformBox = "fill-box"; w.style.transformOrigin = "center"; });
    const lids = (id) => [...document.querySelectorAll(`#${id} .lid`)].forEach((l) => { l.style.transformBox = "fill-box"; l.style.transformOrigin = "50% 0"; });
    lids("front"); lids("frontTired");
    window.render = (t) => {
      // Scene 1 (0-2s): Coop drives in
      const drive = easeOut(seg(t, 0.1, 1.6)), leave = Math.pow(seg(t, 10.6, 12.2), 2);
      show($("side"), t < 2.1 || t > 10.5 ? 1 : 0, `translateX(${-700 + drive * 930 + leave * 1300}px)`);
      wheels.forEach((w) => (w.style.transform = `rotate(${t * 900}deg)`));
      show($("cap1"), t < 1.9 ? seg(t, 0.4, 0.8) : 1 - seg(t, 1.9, 2.1), `translateY(${(1 - easeOut(seg(t, 0.4, 0.9))) * 60}px)`);
      // Scene 2 (2-5s): close-up, bubble, blink
      const pop = back(seg(t, 2.0, 2.45));
      const sc2 = t >= 2.0 && t < 5.35;
      show($("front"), sc2 ? 1 : 0, `scale(${0.6 + 0.4 * pop})`);
      const blink = t > 3.6 && t < 3.75;
      document.querySelectorAll("#front .lid").forEach((l) => (l.style.transform = `scaleY(${blink ? 1 : 0})`));
      show($("cap2"), t >= 2.1 && t < 5.0 ? seg(t, 2.1, 2.4) : 0);
      show($("reelBubble"), t >= 2.8 && t < 5.0 ? seg(t, 2.8, 3.05) : 0, `scale(${0.85 + 0.15 * easeOut(seg(t, 2.8, 3.1))})`);
      // Scene 3 (5-7.6s): the tire track wipe, Coop goes tired
      const w1 = easeOut(seg(t, 5.0, 5.45)), w2 = easeOut(seg(t, 5.15, 5.6));
      const sc3 = t >= 5.0 && t < 7.7;
      show($("track1"), sc3 ? 1 : 0, `translateX(${-2600 + w1 * 2600}px) rotate(-24deg)`);
      show($("track2"), sc3 ? 1 : 0, `translateX(${-2600 + w2 * 2600}px) rotate(-24deg)`);
      const squash = t > 5.3 && t < 5.7 ? 1 - 0.14 * Math.sin(seg(t, 5.3, 5.7) * Math.PI) : 1;
      show($("frontTired"), t >= 5.35 && t < 7.7 ? 1 : 0, `scale(1,${squash})`);
      show($("cap3"), t >= 5.6 && t < 7.6 ? seg(t, 5.6, 5.85) : 0, `scale(${0.8 + 0.2 * back(seg(t, 5.6, 5.95))})`);
      // Scene 4 (7.6-10.6s): the real shirt
      const up = easeOut(seg(t, 7.7, 8.3));
      const sc4 = t >= 7.6 && t < 10.6;
      show($("cap4"), sc4 ? seg(t, 7.7, 8.0) : 0);
      show($("shirt"), sc4 ? 1 : 0, `translateY(${(1 - up) * 1400}px) rotate(${(1 - up) * 6 - 1.5}deg)`);
      show($("sub4"), sc4 ? seg(t, 8.4, 8.8) : 0);
      // Scene 5 (10.6-13s): end card
      const sc5 = t >= 10.6;
      show($("cap5"), sc5 ? seg(t, 10.7, 11.0) : 0);
      show($("logo"), sc5 ? 1 : 0, `scale(${0.5 + 0.5 * back(seg(t, 10.7, 11.15))})`);
      show($("url"), sc5 ? seg(t, 11.2, 11.5) : 0);
      show($("sub5"), sc5 ? seg(t, 11.5, 11.8) : 0);
      // white flashes on cuts
      const fl = Math.max(...[2.0, 5.0, 7.6, 10.6].map((c) => (t >= c && t < c + 0.18 ? 1 - (t - c) / 0.18 : 0)));
      show($("flash"), fl * 0.55);
    };
  }, { mockup, logo, W, H });
  await p.waitForTimeout(500);
  const N = FPS * DUR;
  for (let f = 0; f < N; f++) {
    await p.evaluate((t) => window.render(t), f / FPS);
    await p.screenshot({ path: path.join(framesDir, String(f).padStart(4, "0") + ".jpg"), type: "jpeg", quality: 92 });
    if (f % 60 === 0) process.stdout.write(`frame ${f}/${N}\n`);
  }
  await b.close();
  // Original sound design: two horn honks, a whoosh on the tire track, a chime on the end card.
  const audio = "aevalsrc='0.22*(between(t,1.15,1.37)+between(t,1.5,1.85))*(sin(2*PI*370*t)+0.6*sin(2*PI*466*t))+0.35*between(t,5,5.6)*sin(PI*(t-5)/0.6)*(random(0)*2-1)+0.25*between(t,10.65,11.6)*exp(-5*(t-10.65))*(sin(2*PI*880*t)+0.5*sin(2*PI*1320*t))':s=44100:d=" + DUR;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", path.join(framesDir, "%04d.jpg"), "-f", "lavfi", "-i", audio,
    "-shortest", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", out]);
  console.log("wrote", out);
})();
