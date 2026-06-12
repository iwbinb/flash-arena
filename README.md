# Flash Arena

Real-time trading battles on Solana.

Flash Arena is a trading competition app for Solana Blitz v5. Players join short market rounds, open long or short positions with demo balances, and compete on live PnL. The project is designed to showcase fast, onchain-feeling trading UX with MagicBlock Ephemeral Rollups while avoiding the risk and complexity of real-money trading.

## Concept

Flash Arena combines live market data with simulated trading capital:

- Live prices provide a realistic market environment.
- Demo balances keep the experience safe and easy to test.
- MagicBlock Ephemeral Rollups can handle real-time arena state, round settlement, and leaderboard updates.
- Solana wallet connection can be used for identity and signed actions without requiring real trading funds.

## Core Experience

1. Join a trading arena with a connected wallet.
2. Receive demo USDC for the current round.
3. Choose a market and open a long or short position.
4. Watch live PnL update in real time.
5. Close positions before the round ends.
6. Rank on the leaderboard by realized and unrealized PnL.
7. Settle the final round result through the arena state.

## Data Strategy

Flash Arena should use a hybrid data approach:

- Market prices: live data from sources such as Flash Trade, Pyth, Jupiter, or another reliable public price API.
- Balances and positions: simulated demo data.
- Arena state: devnet or MagicBlock Ephemeral Rollup state.
- Real funds: not required for the initial version.

This keeps the product credible for a trading hackathon while keeping implementation risk low.

## Current Features

- Arena Command Center desktop UI
- Mobile tab layout for trading, positions, leaderboard, and activity
- Wallet-based player identity with demo fallback mode
- Demo USDC balance per player
- Long and short position simulator
- Market, limit, and stop order flows
- Live market feed with fallback simulator
- Real-time PnL calculation
- Timed trading rounds
- Arena leaderboard with the current player highlighted
- Recent trades stream
- ER settlement log and RPC health surface
- Local browser persistence for demo positions, orders, trades, and settlement history
- PWA metadata, favicon, and mobile theme color
- Cloudflare Pages-ready deployment setup

## Technical Direction

The stack is:

- Frontend: React, Vite, TypeScript
- Styling: custom responsive CSS
- Blockchain: Solana devnet
- Real-time execution layer: MagicBlock Ephemeral Rollups
- Market data: live public price feed with fallback simulation
- Deployment: Cloudflare Pages
- Optional backend: Cloudflare Workers for API proxying, rate limiting, and lightweight persistence
- Optional storage: Cloudflare D1, KV, or Durable Objects

The first version prioritizes a complete playable demo over complex trading infrastructure.

## Local Development

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

Deploy to Cloudflare Pages:

```bash
npm run deploy
```

## Deployment Plan

Recommended deployment:

1. Push the public project repository to GitHub.
2. Connect the repository to Cloudflare Pages.
3. Deploy the frontend automatically from the main branch.
4. Use Cloudflare environment variables for public RPC endpoints and API configuration.
5. Add a Cloudflare Worker only if the app needs an API proxy or persistent shared state.

No traditional server is required for the initial hackathon version.

## Security and Privacy

Flash Arena should not require real user funds in the initial version.

Public repositories should not include:

- Private keys or seed phrases
- Personal local machine paths
- Private notes or internal workflow logs
- API secrets
- Unnecessary personal information

Environment-specific values should be stored in deployment environment variables, not committed to the repository.

## Hackathon Submission

A strong submission should include:

- Public GitHub repository
- Live demo link
- Short demo video
- Clear README
- Explanation of how MagicBlock Ephemeral Rollups are used
- Explanation of why demo balances are used instead of real funds

## Status

Playable demo implementation.
