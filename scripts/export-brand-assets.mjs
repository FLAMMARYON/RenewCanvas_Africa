import { mkdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const publicDir = join(root, "public");
const assets = [
  { svg: "favicon.svg", jpg: "favicon.jpg", width: 64, height: 64 },
  { svg: "icon.svg", jpg: "icon.jpg", width: 360, height: 80 },
  { svg: "apple-touch-icon.svg", jpg: "apple-touch-icon.jpg", width: 180, height: 180 },
  { svg: "icon-300.svg", jpg: "icon-300.jpg", width: 300, height: 300 },
  { svg: "icon-mark-300.svg", jpg: "icon-mark-300.jpg", width: 300, height: 300 },
  { svg: "linkedin-banner.svg", jpg: "linkedin-banner.jpg", width: 1584, height: 396 },
];

mkdirSync(publicDir, { recursive: true });

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROME_PATH ?? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
});
const page = await browser.newPage({ deviceScaleFactor: 1 });

for (const asset of assets) {
  await page.setViewportSize({ width: asset.width, height: asset.height });
  const svg = readFileSync(join(publicDir, asset.svg), "utf8");
  await page.setContent(`
    <!doctype html>
    <html>
      <head>
        <style>
          html, body { margin: 0; width: ${asset.width}px; height: ${asset.height}px; overflow: hidden; background: #fff; }
          svg { display: block; width: ${asset.width}px; height: ${asset.height}px; background: #fff; }
        </style>
      </head>
      <body aria-label="${basename(asset.svg)}">${svg}</body>
    </html>
  `);
  await page.locator("svg").first().waitFor();
  await page.screenshot({ path: join(publicDir, asset.jpg), type: "jpeg", quality: 95, fullPage: false });
}

await browser.close();
