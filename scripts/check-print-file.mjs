#!/usr/bin/env node
// Pre-flight check for Coopteeville print files (see docs/PRINT-SPECS.md).
// Usage: node scripts/check-print-file.mjs file1.png [file2.png ...]
// No dependencies: parses the PNG directly.
import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const SPEC = { w: 4500, h: 5400, dpi: 300, margin: 150, semiMaxPct: 2 };

function parsePng(buf) {
  const sig = "89504e470d0a1a0a";
  if (buf.subarray(0, 8).toString("hex") !== sig) throw new Error("not a PNG file");
  let off = 8; const chunks = {}; const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off); const type = buf.toString("ascii", off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === "IDAT") idat.push(data); else chunks[type] = data;
    off += 12 + len;
    if (type === "IEND") break;
  }
  const ih = chunks.IHDR;
  return {
    width: ih.readUInt32BE(0), height: ih.readUInt32BE(4), bitDepth: ih[8], colorType: ih[9], interlace: ih[12],
    phys: chunks.pHYs, srgb: !!chunks.sRGB, icc: chunks.iCCP ? chunks.iCCP.toString("latin1", 0, chunks.iCCP.indexOf(0)) : null,
    iccData: chunks.iCCP ? chunks.iCCP.subarray(chunks.iCCP.indexOf(0) + 2) : null,
    idat: Buffer.concat(idat),
  };
}

// Decode 8-bit RGBA pixels and return alpha stats + bounding box of the art.
function alphaStats(png) {
  const { width: w, height: h } = png, bpp = 4, stride = w * bpp;
  const raw = inflateSync(png.idat);
  let prev = Buffer.alloc(stride), cur = Buffer.alloc(stride);
  let opaque = 0, semi = 0, minX = w, minY = h, maxX = -1, maxY = -1;
  for (let y = 0; y < h; y++) {
    const ft = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, b = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (ft === 1) v += a; else if (ft === 2) v += b; else if (ft === 3) v += (a + b) >> 1;
      else if (ft === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      cur[i] = v & 255;
    }
    for (let x = 0; x < w; x++) {
      const al = cur[x * 4 + 3];
      if (al === 0) continue;
      if (al === 255) opaque++; else semi++;
      if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    [prev, cur] = [cur, prev];
  }
  return { opaque, semi, box: maxX < 0 ? null : { minX, minY, maxX, maxY } };
}

let failed = false;
for (const file of process.argv.slice(2)) {
  const fails = [], warns = [], info = [];
  try {
    const png = parsePng(readFileSync(file));
    if (png.width !== SPEC.w || png.height !== SPEC.h) {
      const isChest = png.width === 1200 && png.height === 1200;
      (isChest ? info : fails).push(`canvas ${png.width}×${png.height} px ${isChest ? "(left-chest canvas)" : `— expected ${SPEC.w}×${SPEC.h}`}`);
    } else info.push(`canvas ${png.width}×${png.height} px ✓`);

    if (png.phys && png.phys[8] === 1) {
      const dpi = Math.round(png.phys.readUInt32BE(0) * 0.0254);
      (dpi === SPEC.dpi ? info : warns).push(`${dpi} DPI${dpi === SPEC.dpi ? " ✓" : ` — set export to ${SPEC.dpi}`}`);
    } else warns.push("no DPI stored — set export to 300 DPI");

    let iccIsSrgb = false;
    if (png.iccData) { try { const t = inflateSync(png.iccData).toString("latin1"); iccIsSrgb = /sRGB/i.test(t) || /s\0R\0G\0B/i.test(t); } catch {} }
    if (png.srgb || /srgb/i.test(png.icc ?? "") || iccIsSrgb) info.push("sRGB ✓");
    else warns.push(png.icc ? `color profile "${png.icc}" — use sRGB IEC61966-2.1` : "no color profile — embed sRGB");

    if (png.colorType !== 6 || png.bitDepth !== 8 || png.interlace !== 0) {
      fails.push(`PNG must be 8-bit RGBA, non-interlaced (got colorType ${png.colorType}, ${png.bitDepth}-bit${png.interlace ? ", interlaced" : ""})`);
    } else {
      const s = alphaStats(png);
      if (!s.box) fails.push("image is completely transparent");
      else {
        const { minX, minY, maxX, maxY } = s.box, aw = maxX - minX + 1, ah = maxY - minY + 1;
        info.push(`art box ${aw}×${ah} px = ${(aw / 300).toFixed(1)}×${(ah / 300).toFixed(1)} in printed`);
        if (minX === 0 && minY === 0 && maxX === png.width - 1 && maxY === png.height - 1 && s.semi === 0)
          fails.push("art fills the whole canvas edge to edge — background is probably not transparent");
        const left = minX, right = png.width - 1 - maxX;
        if (Math.abs(left - right) > 20) warns.push(`art is off-center by ${Math.abs(left - right) / 2} px (left ${left}, right ${right})`);
        if (minY > 300) warns.push(`art starts ${minY} px from the top — move it up so it doesn't print on the belly`);
        const edge = Math.min(left, right, png.height - 1 - maxY);
        if (edge < SPEC.margin && aw < png.width) warns.push(`art is ${edge} px from an edge — keep ${SPEC.margin} px margin`);
        const pct = (s.semi / (s.opaque + s.semi)) * 100;
        (pct > SPEC.semiMaxPct ? fails : info).push(`semi-transparent pixels ${pct.toFixed(1)}%${pct > SPEC.semiMaxPct ? " — remove soft shadows/glows or halftone them" : " ✓"}`);
      }
    }
  } catch (e) { fails.push(String(e.message || e)); }

  console.log(`\n${fails.length ? "✗ FAIL" : warns.length ? "! CHECK" : "✓ PASS"}  ${file}`);
  for (const m of fails) console.log("   ✗ " + m);
  for (const m of warns) console.log("   ! " + m);
  for (const m of info) console.log("   · " + m);
  if (fails.length) failed = true;
}
if (process.argv.length < 3) { console.log("Usage: npm run check:print -- file.png [more.png]"); process.exit(2); }
process.exit(failed ? 1 : 0);
