# Flash Arena Requirements

This document defines the public product scope for the hackathon build. The goal is a complete, playable trading arena that demonstrates a fast Solana-native experience without requiring real user funds.

## Default Product Decisions

- Trading capital: demo USDC only.
- Market data: live public prices first, deterministic fallback simulator second.
- Wallet: Solana wallet for identity, demo mode when a wallet is unavailable.
- Execution layer: MagicBlock Ephemeral Rollups as the intended real-time arena state layer.
- Network: Solana devnet or a MagicBlock-compatible test endpoint.
- Deployment: Cloudflare Pages.
- Backend: not required for the first submission; add Cloudflare Workers only if shared persistence or proxying becomes necessary.

## P1: Playable Arena Foundation

What to build:

- A first-screen trading arena, not a marketing landing page.
- Active round state with countdown, live status, and reset.
- Demo USDC balance, equity, PnL, and rank.
- Market selection for BTC, ETH, SOL, JUP, and BONK perpetual-style markets.
- Responsive desktop and mobile layouts.

How to build:

- Use React, Vite, and TypeScript.
- Keep arena state local for demo safety.
- Persist demo state in browser storage so refreshes do not erase the round.

Completion target:

- A user can open the app, understand the active round, select a market, and see their demo balance and rank immediately.

## P2: Trading and Risk Controls

What to build:

- Long and short trade flow.
- Market, limit, and stop order types.
- Margin input, quick sizing, and leverage control.
- Estimated position size, fees, and liquidation price.
- Account-level risk summary with margin usage, queued margin, gross exposure, and closest liquidation gap.
- Position close flow with realized PnL.
- Visible queued conditional orders with cancel actions.

How to build:

- Simulate fills against the current market price.
- Trigger limit and stop orders from price updates.
- Reject orders that exceed available demo balance.
- Label all balances and order amounts as demo funds.

Completion target:

- A user can open, monitor, close, queue, trigger, and cancel demo trades without real funds.

## P3: Market Feed and Charting

What to build:

- Live public price updates.
- Automatic fallback simulator when the live feed is delayed or unavailable.
- Candlestick-style chart and market stats.
- Feed status indicator.

How to build:

- Fetch public price data on an interval.
- Merge live prices into local market candles.
- Continue evolving prices locally if the feed fails.

Completion target:

- The arena remains usable whether the public price API is healthy, stale, or unavailable.

## P4: Competition Layer

What to build:

- Leaderboard with current user row highlighted.
- Seed competitors for demo credibility.
- Recent trade stream.
- Round settlement action.
- Final PnL and leaderboard snapshot events.

How to build:

- Combine realized PnL, unrealized PnL, and open positions into equity.
- Sort competitors by equity.
- Write user actions to recent trades and settlement logs.

Completion target:

- A user can trade and see their rank, activity, and final round result update in the app.

## P5: Solana and MagicBlock Story

What to build:

- Wallet connect flow for Solana identity.
- Demo fallback when no wallet is installed.
- RPC health check using a configurable devnet or MagicBlock-compatible endpoint.
- ER settlement log showing accepted trades, batch/state updates, and round settlement.

How to build:

- Read `VITE_MAGICBLOCK_RPC_URL` from the deployment environment.
- Default to Solana devnet for the public health check.
- Keep real trading and custody out of the first version.

Completion target:

- The submission clearly demonstrates where MagicBlock Ephemeral Rollups fit: fast arena state, order acceptance, settlement logs, and leaderboard snapshots.

## P6: Delivery, QA, and Submission

What to build:

- English README.
- Chinese README.
- Deployment instructions.
- Submission checklist.
- Production build smoke check.
- Cloudflare Pages configuration.

How to build:

- Keep public documentation focused on product, setup, safety, and submission.
- Keep secrets, private keys, local machine paths, and private notes out of the repository.
- Use Cloudflare Pages for the live demo.

Completion target:

- The project has a public repository, passing local checks, a production build, and a live demo link once deployment is authorized.

## Acceptance Gates

- `npm run check` passes.
- `npm run build` passes.
- `npm run smoke` passes.
- Desktop layout is usable at 1440 x 1024.
- Mobile layout is usable at 390 x 844.
- No real funds are required.
- No private keys, seed phrases, API secrets, personal local paths, or private notes are committed.
- Public GitHub repository is available.
- Cloudflare Pages live demo is available before final hackathon submission.
