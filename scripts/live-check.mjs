const fail = (message) => {
  console.error(`Live check failed: ${message}`);
  process.exit(1);
};

const normalizeBaseUrl = (rawUrl) => {
  if (!rawUrl) {
    fail("usage: npm run live-check -- https://your-pages-url.pages.dev");
  }

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    fail(`invalid URL: ${rawUrl}`);
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    fail("URL must start with http:// or https://");
  }

  parsed.hash = "";
  parsed.search = "";
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  return parsed.toString().replace(/\/$/, "");
};

const checkOk = async (url, label) => {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    fail(`${label} returned HTTP ${response.status}`);
  }
  return response;
};

const baseUrl = normalizeBaseUrl(process.argv[2]);

const htmlResponse = await checkOk(`${baseUrl}/`, "App shell");
const html = await htmlResponse.text();

for (const copy of [
  "<title>Flash Arena</title>",
  'name="description"',
  'name="theme-color"',
  'rel="manifest"',
  'rel="icon"'
]) {
  if (!html.includes(copy)) {
    fail(`app shell is missing ${copy}`);
  }
}

if (!/\/assets\/index-[^"]+\.js/.test(html) || !/\/assets\/index-[^"]+\.css/.test(html)) {
  fail("app shell is missing compiled asset references");
}

const manifestResponse = await checkOk(`${baseUrl}/manifest.webmanifest`, "Manifest");
const manifest = await manifestResponse.json();
if (manifest.name !== "Flash Arena" || manifest.start_url !== "/" || manifest.display !== "standalone") {
  fail("manifest metadata is invalid");
}

await checkOk(`${baseUrl}/favicon.svg`, "Favicon");

const headers = htmlResponse.headers;
const csp = headers.get("content-security-policy");
const frameOptions = headers.get("x-frame-options");
const contentTypeOptions = headers.get("x-content-type-options");

if (!csp || !csp.includes("default-src 'self'")) {
  fail("Content-Security-Policy header is missing or incomplete");
}

if (frameOptions !== "DENY") {
  fail("X-Frame-Options header must be DENY");
}

if (contentTypeOptions !== "nosniff") {
  fail("X-Content-Type-Options header must be nosniff");
}

console.log(`Live check passed: ${baseUrl} serves the Flash Arena app shell, assets, manifest, favicon, and security headers.`);
