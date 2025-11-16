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
npm install  # installs the vendored TypeScript toolchain
npm run build
npm start
```

The server starts on [http://localhost:4000](http://localhost:4000). The static UI is served from the same origin and consumes the `/api/*` endpoints.

## Available scripts

| Script | Description |
| ------ | ----------- |
| `npm run build:server` | Type-checks and compiles the server into `dist/server`. |
| `npm run build:client` | Compiles the client-side TypeScript/JSX into `dist/public/assets`. |
| `npm run build` | Runs both builds and copies the static assets into `dist/public`. |
| `npm start` | Runs `node dist/server/index.js`. Build first if you have local changes. |

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
