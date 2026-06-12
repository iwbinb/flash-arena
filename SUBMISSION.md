# Hackathon Submission Pack

## Project

Flash Arena is a real-time demo trading arena for Solana Blitz v5. Players enter short market rounds, trade long or short with demo USDC, and compete on live PnL, leaderboard rank, and final round settlement.

## Links

- Repository: https://github.com/iwbinb/flash-arena
- Live demo: https://flash-arena.pages.dev
- Build command: `npm run build`
- Smoke check: `npm run smoke`
- Submission artifact audit: `npm run audit`
- Product coverage check: `npm run product-check`
- Full verification: `npm run verify`
- Live deployment check: `npm run live-check -- <live-demo-url>`
- Verified live command: `npm run live-check -- https://flash-arena.pages.dev`
- Public CI: GitHub Actions `Verify` workflow runs the same verification command.

## One-Liner

Flash Arena turns Solana trading into a fast competitive arena using live market prices, simulated demo capital, wallet identity, and MagicBlock-ready settlement logs.

## What Judges Should Try

1. Open the arena and confirm it starts directly in the trading interface.
2. Connect a Solana wallet, or continue in demo mode if no wallet is installed.
3. Use the Demo button to stage a complete review state, or manually select BTC, ETH, SOL, JUP, or BONK.
4. Toggle market filters, chart timeframe, and candle/line chart modes.
5. Place a long or short market trade with demo USDC.
6. Switch to a limit or stop order and confirm it appears in the queued orders panel.
7. Cancel a queued order.
8. Watch open position PnL and leaderboard rank update.
9. Toggle the full leaderboard and My trades filter.
10. Close a position.
11. Settle the current round and confirm recent trades plus ER settlement logs update.
12. Check the Submission Readiness panel and Judge Flow.
13. Review the P1-P6 Coverage scorecard.
14. Copy the submission summary and export the round report.
15. Refresh the page and confirm demo positions, activity, and settlement history persist.

## MagicBlock Ephemeral Rollups Fit

The first version keeps balances and positions simulated for user safety, but it is structured around the MagicBlock ER role:

- Trade acceptance maps to low-latency arena state updates.
- Conditional order queues map to temporary round state.
- Round settlement maps to an ER batch/state snapshot.
- Leaderboard snapshots map to fast competition state finality.
- The in-app ER pipeline shows the review path from trade intent to ephemeral state, batch/root, and leaderboard snapshot.
- The RPC health surface can point to a MagicBlock-compatible endpoint through `VITE_MAGICBLOCK_RPC_URL`.

## Why Demo Funds

The hackathon demo should be easy for judges to run without deposits, custody, or liquidation risk. Demo USDC preserves the core trading and competition loop while avoiding real-money execution, wallet funding, compliance, and asset safety issues.

## P1-P6 Coverage

- P1 Playable arena: first-screen trading UI, active round, market selector/filter, demo balance, responsive layout.
- P2 Trading and risk: long, short, market, limit, stop, leverage, margin, fees, liquidation estimate, account risk summary, close, cancel.
- P3 Market feed: public live prices with fallback simulator, chart timeframe controls, candle and line modes.
- P4 Competition: expandable leaderboard, filterable recent trades, rank, final settlement, round reset, exportable round evidence with Judge Flow and P1-P6 coverage.
- P5 Solana and MagicBlock: wallet identity, devnet RPC health, ER settlement log, ER pipeline, MagicBlock-ready state model.
- P6 Delivery: README, Chinese README, requirements, deployment guide, smoke check, CI, readiness panel, P1-P6 coverage scorecard, one-click judge demo staging, Judge Flow, Cloudflare Pages config.

## Demo Video Script

Suggested length: 90 seconds.

1. Show the opening screen: Flash Arena, live round, price feed, ER latency, wallet button.
2. Connect wallet or show demo mode fallback.
3. Click Demo or place a long BTC demo trade, then point out demo USDC, leverage, and liquidation estimate.
4. Show the open position PnL and leaderboard update.
5. Toggle candle/line mode and show the market rules panel.
6. Queue a limit or stop order, then cancel it from Queued Orders.
7. Toggle Full leaderboard and My trades.
8. Close the open position and show recent trades.
9. Click Settle current round and show the ER Settlement Log.
10. Show the P1-P6 Coverage scorecard, export the round report with acceptance evidence, and copy the submission summary.
11. End on the README or submission pack explaining MagicBlock ER fit and demo-funds safety.

## Final Submission Checklist

- Public repository is accessible.
- Live Cloudflare Pages URL is added: https://flash-arena.pages.dev
- `npm run check` passes.
- `npm run build` passes.
- `npm run smoke` passes.
- `npm run audit` passes.
- `npm run product-check` passes.
- `npm run privacy` passes.
- `npm run verify` passes.
- `npm run live-check -- <live-demo-url>` passes after deployment.
- GitHub Actions `Verify` workflow passes.
- Desktop and mobile layouts are visually checked.
- Demo video is recorded and linked.
- No real funds, private keys, local machine paths, or private notes are included.
