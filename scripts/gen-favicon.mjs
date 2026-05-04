/**
 * Converts src/app/image/logo.jpg to src/app/favicon.ico (multi-size PNG inside ICO).
 * Run: npm run gen:favicon
 */
import { writeFileSync } from "fs";
import { createRequire } from "module";
import { dirname, join } from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const toIco = require("to-ico");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..");
const input = join(root, "src/app/image/logo.jpg");
const output = join(root, "src/app/favicon.ico");

const sizes = [16, 32, 48];
const pngBuffers = await Promise.all(
  sizes.map((s) =>
    sharp(input)
      .resize(s, s, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toBuffer(),
  ),
);

const buf = await toIco(pngBuffers);
writeFileSync(output, buf);
console.warn("Written:", output);
