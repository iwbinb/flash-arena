# Submission Checklist

## Live Demo

- [ ] Cloudflare Pages deployment is live.
- [ ] The app opens directly to the trading arena.
- [ ] Desktop layout is usable at 1440 x 1024.
- [ ] Mobile layout is usable at 390 x 844.

## Core Product

- [ ] Wallet connect flow works or clearly falls back to demo mode.
- [ ] Live or fallback prices update the active market.
- [ ] Demo USDC balance is visible.
- [ ] Long and short trades can be placed.
- [ ] Limit and stop orders can be queued, viewed, triggered, and cancelled.
- [ ] Market filters, chart timeframe, candle/line mode, leaderboard toggle, and trade filters respond.
- [ ] Positions update PnL in real time.
- [ ] Positions can be closed.
- [ ] The current round can be settled and a new round can open.
- [ ] Leaderboard updates after user trades.
- [ ] Recent trades update after open and close actions.
- [ ] ER settlement log updates after arena actions.
- [ ] ER pipeline explains trade intent, ephemeral state, batch/root, and leaderboard snapshot.
- [ ] Submission summary can be copied and round report can be exported.
- [ ] Round report includes readiness, Judge Flow, and P1-P6 coverage evidence.
- [ ] Submission readiness panel reflects core demo status.
- [ ] P1-P6 Coverage scorecard reflects the demo state.
- [ ] Demo button stages trade, queued order, leaderboard, and ER evidence for fast review.
- [ ] Judge Flow tracks the key review actions.
- [ ] Demo positions and activity persist after refresh.
- [ ] Favicon and app metadata load in the deployed page.

## Safety

- [ ] No real funds are required.
- [ ] No private keys, seed phrases, API secrets, or personal local paths are committed.
- [ ] All simulated balances are labeled as demo funds.

## Hackathon Materials

- [ ] Public GitHub repository is available.
- [ ] README explains the product and data strategy.
- [ ] Public P1-P6 requirements are included.
- [ ] Submission pack explains judging flow, demo video script, and MagicBlock ER fit.
- [ ] Deployment instructions are included.
- [ ] `npm run check`, `npm run build`, `npm run smoke`, `npm run audit`, `npm run product-check`, `npm run privacy`, and `npm run verify` pass.
- [ ] `npm run live-check -- <live-demo-url>` passes after Cloudflare deployment.
- [ ] GitHub Actions `Verify` workflow passes on `main`.
- [ ] Demo video shows wallet, round, trade, PnL, leaderboard, and ER log.
- [ ] Submission explains how MagicBlock Ephemeral Rollups fit the arena state layer.
