# Release Evidence

This file gives judges and reviewers a single place to verify what is ready for the Flash Arena submission.

Cloudflare Pages URL: https://flash-arena.pages.dev

Demo video URL: https://flash-arena.pages.dev/flash-arena-demo.mp4

## Product Scope

Flash Arena is a playable Solana trading arena with demo USDC, live-or-fallback market prices, long and short position flows, competition rounds, leaderboard updates, and a MagicBlock Ephemeral Rollups settlement story.

The product intentionally avoids real funds in the first submission. Wallet connection is used for identity, while balances, orders, positions, and leaderboard state are demo state for safe judging.

## P1-P6 Evidence Matrix

| Phase | Requirement | Evidence |
| --- | --- | --- |
| P1 | Playable arena foundation | First screen opens to the arena shell with active round, demo equity, rank, market selection, desktop grid, and mobile tabs. |
| P2 | Trading and risk controls | Long, short, market, limit, and stop order flows are present with leverage, margin, fees, liquidation estimate, risk summary, close flow, and queued order cancel/trigger handling. |
| P3 | Market feed and charting | Live public price fetch feeds market candles, while a deterministic fallback simulator keeps the app usable when the public feed is stale or unavailable. |
| P4 | Competition layer | Leaderboard, seeded competitors, recent trades, settlement log, round settlement, leaderboard snapshot, and exported round report are available in the app. |
| P5 | Solana and MagicBlock story | Solana wallet identity, demo fallback mode, configurable RPC health check, ER settlement log, and ER pipeline explain trade intent, ephemeral state, batch/root, and rank finality. |
| P6 | Delivery and QA | English and Chinese docs, requirements, submission pack, checklist, Cloudflare Pages config, PWA metadata, security headers, CI workflow, and verification scripts are included. |

## Judge Flow

1. Open the live demo after Cloudflare Pages deployment.
2. Click `Demo` to stage a complete review scenario.
3. Review wallet/demo identity, active round, demo USDC balance, market chart, order ticket, queued orders, positions, leaderboard, recent trades, ER log, and ER pipeline.
4. Place or close a demo trade, then check PnL, rank, and settlement activity.
5. Use `Summary` to copy submission evidence.
6. Use `Report` to export the round report with readiness, Judge Flow, and P1-P6 coverage evidence.

## Verification Commands

Run these before submission:

```bash
npm run check
npm run smoke
npm run audit
npm run product-check
npm run privacy
npm run verify
```

After Cloudflare Pages returns a public URL, run:

```bash
npm run live-check -- https://your-project.pages.dev
```

Current verified live deployment:

```bash
npm run live-check -- https://flash-arena.pages.dev
```

Result: passed.

## Automated Evidence

- `npm run verify` runs TypeScript, production build smoke check, live-check self-test, submission audit, P1-P6 product evidence check, and privacy scan.
- GitHub Actions runs the `Verify` workflow on pushes and pull requests to `main`.
- `npm run product-check` verifies P1-P6 coverage across product code, docs, deployment config, and QA scripts.
- `npm run live-check -- <url>` verifies the deployed app shell, compiled assets, core arena copy, P1-P6 UI, ER UI, PWA metadata, favicon, and security headers.

## Submission Gate

The project is ready for final submission when:

- The public repository points to the latest `main` branch.
- GitHub Actions `Verify` passes on `main`.
- Cloudflare Pages serves the built app.
- `npm run live-check -- <live-demo-url>` passes.
- The demo video is available at `/flash-arena-demo.mp4`.

Current status: the live Cloudflare Pages deployment is available at https://flash-arena.pages.dev and the live deployment check passes.
