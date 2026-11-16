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
  if (name === "BreakUrge") {
    assert.ok(portfolio.includes('src="/projects/breakurge-original.webp"'),
      "BreakUrge card must display its authentic high-res brand icon");
  }
  // The authentic supplied Bier Koerier master stays in the repo; the slim
  // project-reel presentation is now a deliberately simplified vector mark.

}
for (const path of ["public/projects/cityfi-portfolio.svg", "public/projects/bierkoerier-portfolio.svg"]) {
  const svg = readFileSync(path, "utf8");
  const browserPath="/" + path.replace(/^public\//, "");
  assert.ok(portfolio.includes('src="' + browserPath + '"'), "New portfolio vector was not used: " + path);
  assert.match(svg, /viewBox="0 0 1000 400"/, "The logo's wide reel aspect ratio changed.");
  assert.ok(svg.includes("<svg") && svg.includes("</svg>"), "Invalid SVG: " + path);
  assert.ok(!/<image\b|base64,/.test(svg), "Embedded blurry bitmap disguised as SVG: " + path);
  assert.ok(svg.length > 1500, "Vector logo is unexpectedly empty: " + path);
}
assert.ok(!portfolio.includes("cs-breakurge-wordmark"), "Duplicate BreakUrge wordmark can crowd its thumbnail.");
assert.ok(portfolio.includes('cs-preview cs-breakurge-identity'), "Compact BreakUrge centered identity is missing.");
assert.ok(css.includes("width:112px!important"), "BreakUrge desktop identity must fit 178px artwork frame.");
assert.ok(css.includes("width:103px!important"), "BreakUrge mobile identity must fit 168px frame.");
assert.ok(css.includes("object-fit:contain"), "Uncropped artwork framing removed");
assert.ok(!/image-rendering:\s*pixelated/.test(css), "Pixelated image rendering is forbidden");
console.log("Project artwork: authentic high-resolution originals preserved, compact BreakUrge, and crisp CityFi/Bier Koerier wide vector art verified.");
