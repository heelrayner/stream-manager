# Stream Manager

Stream Manager is a local-only dashboard for planning livestreams and shorts across TikTok, Twitch, Kick, YouTube, and Facebook. It stores API keys and stream plans in a local SQLite database and exposes a lightweight React-like UI for managing schedules, statuses, and per-platform metadata.

## Tech stack

- **Backend:** Node.js 22, TypeScript, custom HTTP server with SQLite (via the built-in `node:sqlite` driver)
- **Frontend:** React-style UI written in TypeScript and compiled with the TypeScript compiler (no external bundler required)
- **Database:** SQLite (`stream_manager.db`) living alongside the project root

## Prerequisites

- Node.js 22+
- npm 10+
- Set an `ENCRYPTION_KEY` environment variable to encrypt API tokens (defaults to `stream-manager-development-key` for local usage)

## Getting started

```bash
# macOS/Linux
./scripts/install.sh   # installs dependencies and runs the build
npm start              # launches the Electron shell and local API on http://localhost:4000

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts/install.ps1
npm start
```

Need a manual flow instead? Run `npm install`, `npm run build`, then `npm start`. The install step pulls in the local TypeScript compiler so `tsc` works on Windows without needing a global install. If you're behind a proxy or registry mirror,
set `NPM_CONFIG_REGISTRY` before installing so dependencies resolve correctly.

### Removing local artifacts

To clean up everything that was installed or generated locally (including `stream_manager.db`), run:

```bash
# macOS/Linux
./scripts/uninstall.sh

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File scripts/uninstall.ps1
```

The Electron shell opens [http://localhost:4000](http://localhost:4000) after booting the bundled API server. The static UI is served from the same origin and consumes the `/api/*` endpoints.

## Available scripts

| Script | Description |
| ------ | ----------- |
| `npm run build:server` | Type-checks and compiles the server into `dist/server`. |
| `npm run build:client` | Compiles the client-side TypeScript/JSX into `dist/public/assets`. |
| `npm run build` | Runs both builds, compiles the Electron entry, and copies the static assets into `dist/public`. |
| `npm run build:electron` | Compiles the Electron main process into `dist/electron`. |
| `npm start` | Builds (if needed) and launches the Electron shell pointing at the local API. |
| `npm run start:server` | Runs only the API server on `http://localhost:4000` (without Electron). |

## API overview

All responses are JSON. Important routes include:

- `GET /api/health` – simple readiness probe.
- `GET /api/platforms` – list saved platform credentials (tokens are never returned, only previews).
- `POST /api/platforms` – add a platform credential (`platform`, `username`, `apiKey`, optional `notes`).
- `DELETE /api/platforms/:id` – remove a credential.
- `GET /api/streams` – list planned livestreams/shorts.
- `POST /api/streams` – create a schedule item (`title`, `platform`, `contentType`, `status`, optional `scheduledAt`, `notes`, `accountId`).
- `PATCH /api/streams/:id/status` – quick status changes.
- `GET /api/dashboard` – aggregate counts used for the stat cards.

## Security notes

- All API tokens are AES-256 encrypted at rest using the `ENCRYPTION_KEY` env var. Only previews (masked values) are exposed to the client.
- Everything runs locally; no third-party services or SaaS endpoints are required.

## Development tips

- The custom mini-React implementation (`client/src/lib/tiny-react.ts`) powers hooks (`useState`, `useEffect`) and JSX rendering without external dependencies.
- The backend uses the experimental `node:sqlite` driver. Node 22 prints an experimental warning the first time the database is opened.
- If TypeScript complains about missing Node/Electron globals in offline environments, the stub declarations in `server/types/node/index.d.ts` and `electron/types` keep builds green without pulling from DefinitelyTyped.
