import { pathToFileURL } from "node:url";

const fail = (message) => {
  throw new Error(`Live check failed: ${message}`);
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

const checkOk = async (fetchImpl, url, label) => {
  const response = await fetchImpl(url, { redirect: "follow" });
  if (!response.ok) {
    fail(`${label} returned HTTP ${response.status}`);
  }
  return response;
};

const extractAssetPath = (html, extension) => {
  const pattern = new RegExp(`/assets/index-[^"]+\\.${extension}`);
  const match = html.match(pattern);
  if (!match) {
    fail(`app shell is missing compiled ${extension} asset reference`);
  }
  return match[0];
};

export const runLiveCheck = async (rawUrl, fetchImpl = fetch) => {
  const baseUrl = normalizeBaseUrl(rawUrl);

  const htmlResponse = await checkOk(fetchImpl, `${baseUrl}/`, "App shell");
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

  const jsAssetPath = extractAssetPath(html, "js");
  const cssAssetPath = extractAssetPath(html, "css");

  const jsResponse = await checkOk(fetchImpl, `${baseUrl}${jsAssetPath}`, "Compiled JavaScript asset");
  const jsBundle = await jsResponse.text();
  const requiredBundleCopy = [
    "Flash Arena",
    "Connect Wallet",
    "Queued Orders",
    "Settle current round",
    "No real funds required",
    "P1-P6 Coverage",
    "Demo flow staged",
    "MagicBlock ER state pipeline",
    "Submission Readiness",
    "Round report exported"
  ];

  for (const copy of requiredBundleCopy) {
    if (!jsBundle.includes(copy)) {
      fail(`compiled JavaScript asset is missing required UI copy: ${copy}`);
    }
  }

  const cssResponse = await checkOk(fetchImpl, `${baseUrl}${cssAssetPath}`, "Compiled CSS asset");
  const cssBundle = await cssResponse.text();
  for (const selector of [".dashboard-grid", ".coverage-scorecard", ".judge-flow", ".er-pipeline", ".mobile-tabs"]) {
    if (!cssBundle.includes(selector)) {
      fail(`compiled CSS asset is missing required selector: ${selector}`);
    }
  }

  const manifestResponse = await checkOk(fetchImpl, `${baseUrl}/manifest.webmanifest`, "Manifest");
  const manifest = await manifestResponse.json();
  if (manifest.name !== "Flash Arena" || manifest.start_url !== "/" || manifest.display !== "standalone") {
    fail("manifest metadata is invalid");
  }

  await checkOk(fetchImpl, `${baseUrl}/favicon.svg`, "Favicon");
  await checkOk(fetchImpl, `${baseUrl}/flash-arena-demo.mp4`, "Demo video");

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

  return `Live check passed: ${baseUrl} serves the Flash Arena app shell, assets, manifest, favicon, demo video, and security headers.`;
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    console.log(await runLiveCheck(process.argv[2]));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
