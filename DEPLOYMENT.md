# Deployment

Flash Arena is designed for Cloudflare Pages.

## Cloudflare Pages

Use these settings:

- Framework preset: Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: 20

The repository also includes `wrangler.toml`:

```toml
name = "flash-arena"
pages_build_output_dir = "./dist"
```

Deploy with:

```bash
npm run deploy
```

## Post-Deploy Check

After Cloudflare Pages returns a public URL, verify the live deployment:

```bash
npm run live-check -- https://your-project.pages.dev
```

The live check confirms:

- The app shell is reachable.
- Compiled JavaScript and CSS assets are referenced.
- PWA manifest and favicon load.
- Security headers are present.

## Environment Variables

Optional:

```text
VITE_MAGICBLOCK_RPC_URL=https://api.devnet.solana.com
```

Use a MagicBlock-compatible dev or test RPC endpoint when available. If no endpoint is provided, the app uses Solana devnet for the public health check and keeps the arena state local for demo safety.

For Cloudflare Pages dashboard deployments, set the same variable in the Pages project environment settings.

## Safety Notes

Do not add private keys, seed phrases, private RPC credentials, or API secrets to the repository. Demo balances and positions are simulated by design.
