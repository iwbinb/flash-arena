# Submission Checklist

## Links

- Live demo: https://flash-arena.pages.dev
- Demo video: https://flash-arena.pages.dev/flash-arena-demo.mp4
- Repository: https://github.com/iwbinb/flash-arena

## Live Demo

- [x] Cloudflare Pages deployment is live.
- [x] The app opens directly to the trading arena.
- [x] Desktop layout is usable at 1440 x 1024.
- [x] Mobile layout is usable at 390 x 844.

## Core Product

- [x] Wallet connect flow works or clearly falls back to demo mode.
- [x] Live or fallback prices update the active market.
- [x] Demo USDC balance is visible.
- [x] Long and short trades can be placed.
- [x] Limit and stop orders can be queued, viewed, triggered, and cancelled.
- [x] Market filters, chart timeframe, candle/line mode, leaderboard toggle, and trade filters respond.
- [x] Positions update PnL in real time.
- [x] Positions can be closed.
- [x] The current round can be settled and a new round can open.
- [x] Leaderboard updates after user trades.
- [x] Recent trades update after open and close actions.
- [x] ER settlement log updates after arena actions.
- [x] ER pipeline explains trade intent, ephemeral state, batch/root, and leaderboard snapshot.
- [x] Submission summary can be copied and round report can be exported.
- [x] Round report includes readiness, Judge Flow, and P1-P6 coverage evidence.
- [x] Submission readiness panel reflects core demo status.
- [x] P1-P6 Coverage scorecard reflects the demo state.
- [x] Demo button stages trade, queued order, leaderboard, and ER evidence for fast review.
- [x] Judge Flow tracks the key review actions.
- [x] Demo positions and activity persist after refresh.
- [x] Favicon and app metadata load in the deployed page.

## Safety

- [x] No real funds are required.
- [x] No private keys, seed phrases, API secrets, or personal local paths are committed.
- [x] All simulated balances are labeled as demo funds.

## Hackathon Materials

- [x] Public GitHub repository is available.
- [x] README explains the product and data strategy.
- [x] Public P1-P6 requirements are included.
- [x] Submission pack explains judging flow, demo video script, and MagicBlock ER fit.
- [x] Deployment instructions are included.
- [x] `npm run check`, `npm run build`, `npm run smoke`, `npm run audit`, `npm run product-check`, `npm run privacy`, and `npm run verify` pass.
- [x] `npm run live-check -- <live-demo-url>` passes after Cloudflare deployment.
- [x] GitHub Actions `Verify` workflow passes on `main`.
- [x] Demo video shows wallet, round, trade, PnL, leaderboard, and ER log.
- [x] Submission explains how MagicBlock Ephemeral Rollups fit the arena state layer.
