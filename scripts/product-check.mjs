import { existsSync, readFileSync } from "node:fs";

const fail = (message) => {
  console.error(`Product check failed: ${message}`);
  process.exit(1);
};

const read = (file) => {
  if (!existsSync(file)) {
    fail(`${file} is missing`);
  }
  return readFileSync(file, "utf8");
};

const source = {
  app: read("src/App.tsx"),
  marketData: read("src/marketData.ts"),
  sim: read("src/sim.ts"),
  types: read("src/types.ts"),
  styles: read("src/styles.css"),
  packageJson: JSON.parse(read("package.json")),
  requirements: read("REQUIREMENTS.md"),
  submission: read("SUBMISSION.md"),
  checklist: read("SUBMISSION_CHECKLIST.md"),
  deployment: read("DEPLOYMENT.md"),
  headers: read("public/_headers"),
  manifest: JSON.parse(read("public/manifest.webmanifest"))
};

const includes = (content, text) => content.includes(text);

const checks = [
  {
    group: "P1 playable arena foundation",
    evidence: [
      ["first screen is the arena shell", includes(source.app, '<main className="app-shell">')],
      ["active round state is visible", includes(source.app, "Round 12") && includes(source.app, "formatCountdown")],
      ["round reset flow exists", includes(source.app, "const resetRound") && includes(source.app, "Round Reset")],
      ["demo equity and PnL are calculated", includes(source.app, "DEMO_STARTING_BALANCE") && includes(source.app, "unrealizedPnl")],
      ["state persists in localStorage", includes(source.app, "usePersistentState") && includes(source.app, "window.localStorage")],
      ["required markets exist", ["BTCUSDT", "ETHUSDT", "SOLUSDT", "JUPUSDT", "BONKUSDT"].every((market) => includes(source.marketData, market))],
      ["desktop and mobile layouts are defined", includes(source.styles, ".dashboard-grid") && includes(source.styles, ".mobile-tabs") && includes(source.styles, "@media (max-width: 760px)")],
      ["requirements document defines P1", includes(source.requirements, "P1: Playable Arena Foundation")]
    ]
  },
  {
    group: "P2 trading and risk controls",
    evidence: [
      ["long and short sides exist", includes(source.types, 'export type Side = "long" | "short"') && includes(source.app, 'onSideChange("long")') && includes(source.app, 'onSideChange("short")')],
      ["market, limit, and stop orders exist", includes(source.types, 'export type OrderType = "market" | "limit" | "stop"') && includes(source.app, '(["market", "limit", "stop"] as const)')],
      ["margin and leverage controls exist", includes(source.app, "Amount (Demo USDC)") && includes(source.app, 'type="range"') && includes(source.app, 'max="50"')],
      ["position size, fees, and liquidation estimate exist", includes(source.app, "Position size") && includes(source.app, "Est. fees") && includes(source.sim, "calculateLiquidationEstimate")],
      ["insufficient demo balance is rejected", includes(source.app, "Insufficient demo USDC") && includes(source.app, "selectedMargin > availableBalance")],
      ["conditional orders can be queued and cancelled", includes(source.app, "Conditional Order Queued") && includes(source.app, "cancelPendingOrder") && includes(source.app, "PendingOrdersList")],
      ["conditional orders can trigger from price updates", includes(source.app, "triggered.push(order)") && includes(source.app, 'openPosition(order.side, order.margin, order.leverage, order.marketId, "triggered")')],
      ["positions can close with realized PnL", includes(source.app, "const closePosition") && includes(source.app, "setRealizedPnl") && includes(source.sim, "calculatePositionPnl")],
      ["requirements document defines P2", includes(source.requirements, "P2: Trading and Risk Controls")]
    ]
  },
  {
    group: "P3 market feed and charting",
    evidence: [
      ["live CoinGecko feed exists", includes(source.app, "api.coingecko.com") && includes(source.marketData, "coingeckoIds")],
      ["fallback simulator exists", includes(source.app, "Fallback simulator") && includes(source.sim, "evolveFallbackMarkets")],
      ["feed stale and fallback status are modeled", includes(source.types, '"stale"') && includes(source.types, '"fallback"')],
      ["live prices merge into candles", includes(source.sim, "mergeLivePrices") && includes(source.sim, "makeNextCandle")],
      ["chart supports candles and line modes", includes(source.app, "Candles") && includes(source.app, "Line") && includes(source.app, "chartMode")],
      ["chart timeframe controls exist", ["1m", "5m", "15m", "1h", "4h", "1D"].every((timeframe) => includes(source.app, timeframe))],
      ["market stats are visible", includes(source.app, "24h Change") && includes(source.app, "Open Interest")],
      ["requirements document defines P3", includes(source.requirements, "P3: Market Feed and Charting")]
    ]
  },
  {
    group: "P4 competition layer",
    evidence: [
      ["leaderboard component exists", includes(source.app, "function Leaderboard") && includes(source.app, "you-row")],
      ["seed competitors are credible", (source.marketData.match(/equity:/g) ?? []).length >= 10],
      ["leaderboard sorts by equity", includes(source.app, "sort((first, second) => second.equity - first.equity)")],
      ["recent trade stream exists", includes(source.app, "function RecentTrades") && includes(source.marketData, "seededTrades")],
      ["round settlement exists", includes(source.app, "const settleRound") && includes(source.app, "Round Settled")],
      ["settlement captures leaderboard snapshot", includes(source.app, "Leaderboard Snapshot")],
      ["report export includes leaderboard and trades", includes(source.app, "exportRoundReport") && includes(source.app, "leaderboard.slice") && includes(source.app, "recentTrades.slice")],
      ["requirements document defines P4", includes(source.requirements, "P4: Competition Layer")]
    ]
  },
  {
    group: "P5 Solana and MagicBlock story",
    evidence: [
      ["Solana wallet connect flow exists", includes(source.app, "window.solana") && includes(source.app, "connectWallet") && includes(source.app, "disconnectWallet")],
      ["demo fallback exists when wallet is missing", includes(source.app, "No Solana wallet found") && includes(source.app, "Demo Mode")],
      ["MagicBlock RPC env var exists", includes(source.app, "VITE_MAGICBLOCK_RPC_URL") && includes(source.deployment, "VITE_MAGICBLOCK_RPC_URL")],
      ["devnet fallback RPC exists", includes(source.app, "https://api.devnet.solana.com")],
      ["RPC health check uses getSlot", includes(source.app, '"getSlot"') && includes(source.app, "setErLatency")],
      ["ER log component exists", includes(source.app, "function ErLog") && includes(source.app, "ER Settlement Log")],
      ["ER events cover accepted, batch, state, settlement, and snapshot concepts", ["Trade Accepted", "Batch Committed", "State Root Update", "Trade Settled", "Leaderboard Snapshot"].every((event) => includes(source.app + source.marketData, event))],
      ["requirements document defines P5", includes(source.requirements, "P5: Solana and MagicBlock Story")]
    ]
  },
  {
    group: "P6 delivery, QA, and submission",
    evidence: [
      ["required npm scripts exist", ["check", "build", "smoke", "audit", "privacy", "product-check", "verify", "live-check", "deploy"].every((script) => Boolean(source.packageJson.scripts?.[script]))],
      ["verify includes product-check", includes(source.packageJson.scripts.verify ?? "", "npm run product-check")],
      ["English and Chinese docs exist", existsSync("README.md") && existsSync("README.zh-CN.md") && existsSync("REQUIREMENTS.zh-CN.md")],
      ["submission pack and checklist exist", includes(source.submission, "Demo Video Script") && includes(source.checklist, "# Submission Checklist") && includes(source.checklist, "Hackathon Materials")],
      ["Cloudflare Pages config exists", existsSync("wrangler.toml") && includes(source.deployment, "Cloudflare Pages")],
      ["PWA metadata exists", source.manifest.name === "Flash Arena" && source.manifest.start_url === "/" && source.manifest.display === "standalone"],
      ["security headers exist", ["Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options", "Permissions-Policy"].every((header) => includes(source.headers, header))],
      ["live deployment check exists", existsSync("scripts/live-check.mjs") && includes(source.deployment, "npm run live-check")],
      ["requirements document defines P6", includes(source.requirements, "P6: Delivery, QA, and Submission")]
    ]
  }
];

const failures = [];

for (const check of checks) {
  for (const [label, passed] of check.evidence) {
    if (!passed) {
      failures.push(`${check.group}: ${label}`);
    }
  }
}

if (failures.length > 0) {
  fail(failures.join("\n"));
}

const score = checks.reduce((total, check) => total + check.evidence.length, 0);
console.log(`Product check passed: ${score} P1-P6 evidence gates are present across product code, docs, deployment config, and QA scripts.`);
