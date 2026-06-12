import { existsSync, readFileSync } from "node:fs";

const fail = (message) => {
  console.error(`Submission audit failed: ${message}`);
  process.exit(1);
};

const read = (file) => {
  if (!existsSync(file)) {
    fail(`${file} is missing`);
  }
  return readFileSync(file, "utf8");
};

const requireIncludes = (file, checks) => {
  const content = read(file);
  for (const check of checks) {
    if (!content.includes(check)) {
      fail(`${file} is missing required content: ${check}`);
    }
  }
};

const packageJson = JSON.parse(read("package.json"));
const requiredScripts = ["check", "build", "smoke", "audit", "product-check", "privacy", "verify", "live-check", "live-check:selftest", "deploy"];
for (const script of requiredScripts) {
  if (!packageJson.scripts?.[script]) {
    fail(`package.json is missing script: ${script}`);
  }
}

const requiredFiles = [
  "README.md",
  "README.zh-CN.md",
  "REQUIREMENTS.md",
  "REQUIREMENTS.zh-CN.md",
  "SUBMISSION.md",
  "SUBMISSION_CHECKLIST.md",
  "RELEASE_EVIDENCE.md",
  "DEPLOYMENT.md",
  "wrangler.toml",
  ".github/workflows/verify.yml",
  "scripts/live-check.mjs",
  "scripts/live-check-selftest.mjs",
  "scripts/smoke-check.mjs",
  "scripts/privacy-check.mjs",
  "scripts/product-check.mjs",
  "scripts/submission-audit.mjs",
  "public/manifest.webmanifest",
  "public/_headers",
  "public/favicon.svg",
  ".env.example"
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    fail(`${file} is missing`);
  }
}

requireIncludes("README.md", [
  "Requirements",
  "Submission Pack",
  "Deployment Guide",
  "npm run verify",
  "Cloudflare Pages",
  "No real funds"
]);

requireIncludes("README.zh-CN.md", [
  "需求列表",
  "提交材料",
  "部署说明",
  "npm run verify",
  "Cloudflare Pages",
  "真实资金"
]);

requireIncludes("REQUIREMENTS.md", [
  "P1: Playable Arena Foundation",
  "P2: Trading and Risk Controls",
  "P3: Market Feed and Charting",
  "P4: Competition Layer",
  "P5: Solana and MagicBlock Story",
  "P6: Delivery, QA, and Submission"
]);

requireIncludes("SUBMISSION.md", [
  "What Judges Should Try",
  "MagicBlock Ephemeral Rollups Fit",
  "Demo Video Script",
  "Final Submission Checklist",
  "https://flash-arena.pages.dev"
]);

requireIncludes("SUBMISSION_CHECKLIST.md", [
  "Cloudflare Pages deployment is live",
  "GitHub Actions `Verify` workflow passes",
  "Submission readiness panel reflects core demo status",
  "npm run product-check"
]);

requireIncludes("RELEASE_EVIDENCE.md", [
  "P1-P6 Evidence Matrix",
  "Judge Flow",
  "Verification Commands",
  "https://flash-arena.pages.dev",
  "npm run live-check -- https://your-project.pages.dev",
  "Cloudflare Pages URL"
]);

requireIncludes("DEPLOYMENT.md", [
  "Framework preset: Vite",
  "Build command: `npm run build`",
  "Build output directory: `dist`",
  "Post-Deploy Check",
  "npm run live-check",
  "VITE_MAGICBLOCK_RPC_URL"
]);

requireIncludes("wrangler.toml", [
  'name = "flash-arena"',
  'pages_build_output_dir = "./dist"'
]);

requireIncludes(".github/workflows/verify.yml", [
  "npm ci",
  "npm run verify",
  "ubuntu-latest"
]);

const manifest = JSON.parse(read("public/manifest.webmanifest"));
if (manifest.name !== "Flash Arena" || manifest.start_url !== "/" || manifest.display !== "standalone") {
  fail("public/manifest.webmanifest has invalid app metadata");
}

requireIncludes("public/_headers", [
  "Content-Security-Policy",
  "X-Frame-Options",
  "X-Content-Type-Options",
  "Permissions-Policy"
]);

console.log("Submission audit passed: public docs, CI, PWA, Cloudflare config, safety notes, and P1-P6 submission artifacts are present.");
