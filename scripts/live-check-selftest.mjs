import { existsSync, readFileSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";
import { runLiveCheck } from "./live-check.mjs";

const fail = (message) => {
  console.error(`Live check self-test failed: ${message}`);
  process.exit(1);
};

const distDir = resolve("dist");
if (!existsSync(join(distDir, "index.html"))) {
  fail("dist/index.html is missing. Run npm run build before npm run live-check:selftest.");
}

const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'; connect-src 'self' https://api.coingecko.com https://api.devnet.solana.com https://*.solana.com https://*.magicblock.app https://*.magicblock.gg; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".svg": "image/svg+xml; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};

const resolveRequestPath = (url) => {
  const { pathname } = new URL(url, "http://127.0.0.1");
  const filePath = pathname === "/" ? "/index.html" : pathname;
  const resolved = resolve(join(distDir, normalize(filePath)));
  if (!resolved.startsWith(distDir)) return null;
  return resolved;
};

const fixtureFetch = async (url) => {
  const filePath = resolveRequestPath(url);
  if (!filePath || !existsSync(filePath)) {
    return new Response("Not found", { status: 404, headers: securityHeaders });
  }

  return new Response(readFileSync(filePath), {
    status: 200,
    headers: {
      ...securityHeaders,
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream"
    }
  });
};

try {
  await runLiveCheck("https://flash-arena.local", fixtureFetch);
  console.log("Live check self-test passed: local production build satisfies the live deployment gate.");
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
