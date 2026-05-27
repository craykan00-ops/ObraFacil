const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length);
  const crc = Buffer.allocUnsafe(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}

function makePNG(size) {
  // Colors: bg=#C77700 (199,119,0), fg=white (255,255,255)
  const BG = [199, 119, 0];
  const FG = [255, 255, 255];

  const pixels = [];
  for (let y = 0; y < size; y++) {
    const row = [0]; // filter byte
    for (let x = 0; x < size; x++) {
      const xn = x / size; // normalized 0-1
      const yn = y / size;
      let color = BG;

      // Draw a simple crane silhouette in white
      const s = size;
      // Vertical mast: 44-54% x, 18-85% y
      if (xn >= 0.44 && xn <= 0.54 && yn >= 0.18 && yn <= 0.85) color = FG;
      // Main jib (horizontal arm): 49-84% x, 18-26% y
      if (xn >= 0.49 && xn <= 0.84 && yn >= 0.18 && yn <= 0.26) color = FG;
      // Counter jib: 14-50% x, 18-26% y
      if (xn >= 0.14 && xn <= 0.50 && yn >= 0.18 && yn <= 0.26) color = FG;
      // Hook cable: 74-78% x, 26-65% y
      if (xn >= 0.74 && xn <= 0.78 && yn >= 0.26 && yn <= 0.65) color = FG;
      // Hook: 69-83% x, 65-72% y
      if (xn >= 0.69 && xn <= 0.83 && yn >= 0.65 && yn <= 0.72) color = FG;
      // Hook inner cut (make it U-shape): cancel center 72-80% x, 65-69% y
      if (xn >= 0.72 && xn <= 0.80 && yn >= 0.65 && yn <= 0.69) color = BG;
      // Cab box on mast: 41-58% x, 26-36% y
      if (xn >= 0.41 && xn <= 0.58 && yn >= 0.26 && yn <= 0.36) color = FG;

      row.push(color[0], color[1], color[2]);
    }
    pixels.push(...row);
  }

  const raw = Buffer.from(pixels);
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2;

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const dir = path.join(__dirname, '..', 'public');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'icon-192.png'), makePNG(192));
fs.writeFileSync(path.join(dir, 'icon-512.png'), makePNG(512));
console.log('Icons generated: public/icon-192.png and public/icon-512.png');
