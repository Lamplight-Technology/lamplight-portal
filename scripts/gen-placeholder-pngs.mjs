// Generates placeholder PNGs for apple-touch-icon and og-image.
// Hand-rolled PNG encoder using only Node built-ins. Outputs RGBA images
// with a brand gradient + a center wordmark drawn as filled rectangles.
// Replace these PNGs with real brand artwork before sharing publicly.

import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, "..", "client", "public");

function crc32(buf) {
  let c;
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

function gradientPixel(x, y, w, h) {
  // Diagonal: #0f172a → #1e3a8a → #312e81
  const t = (x + y) / (w + h);
  const stops = [
    { t: 0,    rgb: [0x0f, 0x17, 0x2a] },
    { t: 0.5,  rgb: [0x1e, 0x3a, 0x8a] },
    { t: 1,    rgb: [0x31, 0x2e, 0x81] },
  ];
  let i = 0;
  while (i < stops.length - 1 && t > stops[i + 1].t) i++;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  const localT = (t - a.t) / Math.max(b.t - a.t, 0.0001);
  return [
    lerp(a.rgb[0], b.rgb[0], localT),
    lerp(a.rgb[1], b.rgb[1], localT),
    lerp(a.rgb[2], b.rgb[2], localT),
  ];
}

// 5x7 bitmap font (uppercase letters + space + period only — enough for a placeholder)
const FONT = {
  L: ["10000","10000","10000","10000","10000","10000","11111"],
  A: ["01110","10001","10001","11111","10001","10001","10001"],
  M: ["10001","11011","10101","10001","10001","10001","10001"],
  P: ["11110","10001","10001","11110","10000","10000","10000"],
  I: ["11111","00100","00100","00100","00100","00100","11111"],
  G: ["01110","10001","10000","10111","10001","10001","01110"],
  H: ["10001","10001","10001","11111","10001","10001","10001"],
  T: ["11111","00100","00100","00100","00100","00100","00100"],
  E: ["11111","10000","10000","11110","10000","10000","11111"],
  C: ["01110","10001","10000","10000","10000","10001","01110"],
  N: ["10001","11001","10101","10011","10001","10001","10001"],
  O: ["01110","10001","10001","10001","10001","10001","01110"],
  Y: ["10001","10001","01010","00100","00100","00100","00100"],
  " ": ["00000","00000","00000","00000","00000","00000","00000"],
  ".": ["00000","00000","00000","00000","00000","00000","00100"],
  "—": ["00000","00000","00000","11111","00000","00000","00000"],
};

function drawText(pixels, w, h, text, cx, cy, scale, color) {
  const charW = 5, charH = 7, gap = 1;
  const totalW = text.length * (charW + gap) - gap;
  const x0 = cx - Math.floor((totalW * scale) / 2);
  const y0 = cy - Math.floor((charH * scale) / 2);
  for (let ci = 0; ci < text.length; ci++) {
    const ch = text[ci].toUpperCase();
    const glyph = FONT[ch] ?? FONT[" "];
    for (let gy = 0; gy < charH; gy++) {
      for (let gx = 0; gx < charW; gx++) {
        if (glyph[gy][gx] === "1") {
          for (let sy = 0; sy < scale; sy++) {
            for (let sx = 0; sx < scale; sx++) {
              const px = x0 + (ci * (charW + gap) + gx) * scale + sx;
              const py = y0 + gy * scale + sy;
              if (px >= 0 && px < w && py >= 0 && py < h) {
                const idx = (py * w + px) * 4;
                pixels[idx] = color[0];
                pixels[idx + 1] = color[1];
                pixels[idx + 2] = color[2];
                pixels[idx + 3] = 255;
              }
            }
          }
        }
      }
    }
  }
}

function drawFlame(pixels, w, h, cx, cy, size) {
  // Stylized flame shape via vertical ellipse, brand amber #fbbf24.
  for (let y = -size; y <= size; y++) {
    for (let x = -size; x <= size; x++) {
      // teardrop: narrower at top, wider at bottom
      const tt = (y + size) / (2 * size);
      const radius = size * (0.35 + 0.65 * tt);
      const dx = x;
      const dy = y * 1.3;
      const r2 = (dx / radius) ** 2 + (dy / size) ** 2;
      if (r2 <= 1) {
        const px = cx + x;
        const py = cy + y;
        if (px >= 0 && px < w && py >= 0 && py < h) {
          const idx = (py * w + px) * 4;
          // gradient: lighter at top
          const r = lerp(0xfd, 0xd9, tt);
          const g = lerp(0xe6, 0x77, tt);
          const b = lerp(0x8a, 0x06, tt);
          pixels[idx] = r;
          pixels[idx + 1] = g;
          pixels[idx + 2] = b;
          pixels[idx + 3] = 255;
        }
      }
    }
  }
}

function encodePNG(width, height, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);   // bit depth
  ihdr.writeUInt8(6, 9);   // color type = RGBA
  ihdr.writeUInt8(0, 10);  // compression
  ihdr.writeUInt8(0, 11);  // filter
  ihdr.writeUInt8(0, 12);  // interlace

  // Add filter byte (0) at the start of each scanline
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0;
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = deflateSync(raw);

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

function buildOgImage() {
  const W = 1200, H = 630;
  const pixels = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const [r, g, b] = gradientPixel(x, y, W, H);
      const i = (y * W + x) * 4;
      pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = 255;
    }
  }
  // Flame above wordmark
  drawFlame(pixels, W, H, W / 2, H / 2 - 100, 70);
  // Wordmark
  drawText(pixels, W, H, "LAMPLIGHT TECHNOLOGY", W / 2, H / 2 + 30, 6, [255, 255, 255]);
  drawText(pixels, W, H, "FROM IDEA TO IMPACT", W / 2, H / 2 + 110, 4, [191, 219, 254]);
  return encodePNG(W, H, pixels);
}

function buildAppleTouchIcon() {
  const W = 180, H = 180;
  const pixels = Buffer.alloc(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const [r, g, b] = gradientPixel(x, y, W, H);
      const i = (y * W + x) * 4;
      pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b; pixels[i + 3] = 255;
    }
  }
  drawFlame(pixels, W, H, W / 2, H / 2, 50);
  return encodePNG(W, H, pixels);
}

writeFileSync(resolve(OUT_DIR, "og-image.png"), buildOgImage());
writeFileSync(resolve(OUT_DIR, "apple-touch-icon.png"), buildAppleTouchIcon());
console.log("Wrote og-image.png and apple-touch-icon.png to", OUT_DIR);
