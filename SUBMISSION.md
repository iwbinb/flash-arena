# Hackathon Submission Pack

## Project

Flash Arena is a real-time demo trading arena for Solana Blitz v5. Players enter short market rounds, trade long or short with demo USDC, and compete on live PnL, leaderboard rank, and final round settlement.

## Links

- Repository: https://github.com/iwbinb/flash-arena
- Live demo: add the Cloudflare Pages URL after deployment.
- Build command: `npm run build`
- Smoke check: `npm run smoke`
- Full verification: `npm run verify`
- Public CI: GitHub Actions `Verify` workflow runs the same verification command.

## One-Liner

Flash Arena turns Solana trading into a fast competitive arena using live market prices, simulated demo capital, wallet identity, and MagicBlock-ready settlement logs.

## What Judges Should Try

1. Open the arena and confirm it starts directly in the trading interface.
2. Connect a Solana wallet, or continue in demo mode if no wallet is installed.
3. Select BTC, ETH, SOL, JUP, or BONK.
4. Toggle market filters, chart timeframe, and candle/line chart modes.
5. Place a long or short market trade with demo USDC.
6. Switch to a limit or stop order and confirm it appears in the queued orders panel.
7. Cancel a queued order.
8. Watch open position PnL and leaderboard rank update.
9. Toggle the full leaderboard and My trades filter.
10. Close a position.
11. Settle the current round and confirm recent trades plus ER settlement logs update.
12. Copy the submission summary and export the round report.
13. Refresh the page and confirm demo positions, activity, and settlement history persist.

## MagicBlock Ephemeral Rollups Fit

The first version keeps balances and positions simulated for user safety, but it is structured around the MagicBlock ER role:

- Trade acceptance maps to low-latency arena state updates.
- Conditional order queues map to temporary round state.
- Round settlement maps to an ER batch/state snapshot.
- Leaderboard snapshots map to fast competition state finality.
- The RPC health surface can point to a MagicBlock-compatible endpoint through `VITE_MAGICBLOCK_RPC_URL`.

## Why Demo Funds

The hackathon demo should be easy for judges to run without deposits, custody, or liquidation risk. Demo USDC preserves the core trading and competition loop while avoiding real-money execution, wallet funding, compliance, and asset safety issues.

## P1-P6 Coverage

- P1 Playable arena: first-screen trading UI, active round, market selector/filter, demo balance, responsive layout.
- P2 Trading and risk: long, short, market, limit, stop, leverage, margin, fees, liquidation estimate, close, cancel.
- P3 Market feed: public live prices with fallback simulator, chart timeframe controls, candle and line modes.
- P4 Competition: expandable leaderboard, filterable recent trades, rank, final settlement, round reset, exportable round evidence.
- P5 Solana and MagicBlock: wallet identity, devnet RPC health, ER settlement log, MagicBlock-ready state model.
- P6 Delivery: README, Chinese README, requirements, deployment guide, smoke check, Cloudflare Pages config.

## Demo Video Script

Suggested length: 90 seconds.

1. Show the opening screen: Flash Arena, live round, price feed, ER latency, wallet button.
2. Connect wallet or show demo mode fallback.
3. Place a long BTC demo trade and point out demo USDC, leverage, and liquidation estimate.
4. Show the open position PnL and leaderboard update.
5. Toggle candle/line mode and show the market rules panel.
6. Queue a limit or stop order, then cancel it from Queued Orders.
7. Toggle Full leaderboard and My trades.
8. Close the open position and show recent trades.
9. Click Settle current round and show the ER Settlement Log.
10. Export the round report and copy the submission summary.
11. End on the README or submission pack explaining MagicBlock ER fit and demo-funds safety.

## Final Submission Checklist

- Public repository is accessible.
- Live Cloudflare Pages URL is added.
- `npm run check` passes.
- `npm run build` passes.
- `npm run smoke` passes.
- `npm run privacy` passes.
- `npm run verify` passes.
- GitHub Actions `Verify` workflow passes.
- Desktop and mobile layouts are visually checked.
- Demo video is recorded and linked.
- No real funds, private keys, local machine paths, or private notes are included.
