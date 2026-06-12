import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "dist/index.html",
  "dist/manifest.webmanifest",
  "dist/favicon.svg",
  "dist/_headers"
];

const fail = (message) => {
  console.error(`Smoke check failed: ${message}`);
  process.exit(1);
};

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    fail(`${file} is missing from the production build`);
  }
}

const html = readFileSync("dist/index.html", "utf8");
if (!html.includes('<div id="root"></div>')) {
  fail("app root is missing");
}

if (!/\/assets\/index-[^"]+\.js/.test(html) || !/\/assets\/index-[^"]+\.css/.test(html)) {
  fail("compiled JavaScript or CSS asset references are missing");
}

const manifest = JSON.parse(readFileSync("dist/manifest.webmanifest", "utf8"));
if (manifest.name !== "Flash Arena" || manifest.start_url !== "/") {
  fail("web app manifest metadata is invalid");
}

const headers = readFileSync("dist/_headers", "utf8");
if (!headers.includes("Content-Security-Policy") || !headers.includes("X-Frame-Options")) {
  fail("security headers are incomplete");
}

console.log("Smoke check passed: production build includes the app shell, compiled assets, PWA manifest, and security headers.");
