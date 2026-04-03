import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "public/images/brand/jc-monogram.png");
const brandDir = join(root, "public/images/brand");
const ogDir = join(root, "public/images/og");

async function main() {
  await mkdir(ogDir, { recursive: true });

  const widths = [64, 128, 256, 512];
  for (const w of widths) {
    await sharp(src)
      .resize(w, w, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 88, effort: 4 })
      .toFile(join(brandDir, `jc-monogram-${w}w.webp`));
  }

  const maxLogo = 400;
  const { data, info } = await sharp(src)
    .resize(maxLogo, maxLogo, { fit: "inside" })
    .png()
    .toBuffer({ resolveWithObject: true });
  const left = Math.max(0, Math.floor((1200 - info.width) / 2));
  const top = Math.max(0, Math.floor((630 - info.height) / 2));

  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  })
    .composite([{ input: data, left, top }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(join(ogDir, "default.jpg"));

  await sharp(src)
    .resize(180, 180, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toFile(join(root, "public/apple-touch-icon.png"));

  await sharp(src)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(join(root, "app/icon.png"));

  await sharp(src)
    .resize(192, 192, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(join(root, "public/icon-192.png"));

  await sharp(src)
    .resize(512, 512, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toFile(join(root, "public/icon-512.png"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
