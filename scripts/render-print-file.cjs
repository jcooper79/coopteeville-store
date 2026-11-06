// Renders a storefront design to a print-ready PNG (4500x5400, transparent, see docs/PRINT-SPECS.md).
// Usage: node scripts/render-print-file.cjs <product-id> <light|dark> <out.png>
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const [id, tone, out] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 4500, height: 5400 } });
  await p.goto("file://" + path.resolve(__dirname, "../public/index.html"));
  await p.waitForTimeout(1200);
  const svg = await p.evaluate(([id, tone]) => {
    const C = window.Coopteeville, prod = C.PRODUCTS.find((x) => x.id === id);
    // Light shirts get dark ink; dark shirts get light ink. The shirt itself is not printed.
    const c = tone === "dark" ? { fill: "#22242c", ink: "#ffffff" } : { fill: "#ffffff", ink: "#1c2033" };
    let art = C.artFor(prod)(c);
    // On the print file, tire tracks stop at the print area (not the shirt silhouette).
    art = art.replace(/<clipPath id="([^"]+)"><path d="[^"]*"\/><\/clipPath>/g, '<clipPath id="$1"><rect x="66" y="86" width="168" height="201.6" rx="4"/></clipPath>');
    // Print area = chest box of the storefront mockup (5:6 like 4500x5400). Swap the knockout outline
    // (shirt-colored stroke) for transparent by drawing it in the shirt color only where tracks are.
    // Knock the tracks out under the lettering (a mask) instead of printing a shirt-colored outline,
    // so the shirt shows through on any color and no extra ink is used.
    const i = art.indexOf("<text");
    let shapes = art.slice(0, i), texts = art.slice(i);
    const strokeRe = new RegExp('stroke="' + c.fill + '"', "g");
    const maskTexts = texts.replace(/fill="[^"]*"/g, 'fill="#000"').replace(strokeRe, 'stroke="#000"');
    const inkTexts = texts.replace(strokeRe, 'stroke="none"');
    art = `<defs><mask id="ko" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="320"><rect x="0" y="0" width="300" height="320" fill="#fff"/>${maskTexts}</mask></defs><g mask="url(#ko)">${shapes}</g>${inkTexts}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="59.3 78 181.4 217.7" width="4500" height="5400">${art}</svg>`;
  }, [id, tone]);
  await p.setContent(`<html><head><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bungee&family=Baloo+2:wght@800&display=block"></head><body style="margin:0;background:transparent">${svg}</body></html>`);
  await p.evaluate(async () => { await document.fonts.load("20px Bungee"); await document.fonts.load("800 20px 'Baloo 2'"); await document.fonts.ready; });
  if (!(await p.evaluate(() => document.fonts.check("20px Bungee")))) throw new Error("Bungee did not load; refusing to render with a fallback font");
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: 4500, height: 5400 } });
  await b.close();
  // Stamp 300 DPI and an embedded sRGB profile (Pillow).
  require("child_process").execFileSync("python3", ["-c",
    "import sys;from PIL import Image,ImageCms;im=Image.open(sys.argv[1]);p=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB'));im.save(sys.argv[1],dpi=(300,300),icc_profile=p.tobytes(),optimize=True)", out]);
  console.log("wrote", out);
})();
