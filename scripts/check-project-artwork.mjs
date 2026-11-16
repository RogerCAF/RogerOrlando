import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const portfolio = readFileSync("app/components/PortfolioCaseStudies.tsx", "utf8");
const css = readFileSync("app/components/portfolio-case-studies.css", "utf8");

const sources = [
  { name: "BreakUrge", path: "public/projects/breakurge-original.webp", width: 1254, height: 1254 },
  { name: "Bier Koerier", path: "public/projects/bierkoerier-original.webp", width: 1500, height: 1500 },
];

function webpSize(path) {
  const bytes = readFileSync(path);
  assert.equal(bytes.toString("ascii", 0, 4), "RIFF", path + ": RIFF header missing");
  assert.equal(bytes.toString("ascii", 8, 12), "WEBP", path + ": not a WebP image");
  assert.equal(bytes.toString("ascii", 12, 16), "VP8 ", path + ": unexpected WebP codec");
  assert.equal(bytes.toString("hex", 23, 26), "9d012a", path + ": VP8 frame header missing");
  return {
    width: bytes.readUInt16LE(26) & 0x3fff,
    height: bytes.readUInt16LE(28) & 0x3fff,
    bytes: bytes.length,
  };
}

for (const { name, path, width, height } of sources) {
  const size = webpSize(path);
  assert.equal(size.width, width, name + ": image was downscaled");
  assert.equal(size.height, height, name + ": image was downscaled");
  assert.ok(size.bytes > 100000, name + ": high-quality original was replaced with thumbnail");
  const browserPath = "/" + path.replace(/^public\//, "");
  assert.ok(portfolio.includes('src="' + browserPath + '"'), name + ": project card no longer uses original artwork");
}
assert.ok(portfolio.includes("/projects/cityfi-sharp.svg"), "CityFi vector logo was removed");
assert.ok(css.includes("object-fit:contain"), "Uncropped artwork framing removed");
assert.ok(!/image-rendering:\s*pixelated/.test(css), "Pixelated image rendering is forbidden");
console.log("Project artwork: 1254px BreakUrge, 1500px Bier Koerier and CityFi vector verified.");
