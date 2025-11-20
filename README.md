# streaman

streaman is a local-only Electron desktop application for managing livestreams, scheduled short-form uploads, VOD publishing, alerts, and go-live automations across TikTok, Twitch, Kick, YouTube, and Facebook. All automation and data live on your machine with a local SQLite database (`streaman.db`).

## Features
- Electron + React shell with IPC wiring for accounts, schedules, streams, VODs, alerts, and settings.
- Multiple accounts per platform with encrypted access/refresh tokens and periodic refresh jobs.
- Short-form scheduler for TikTok/Twitch/Kick/YouTube/Facebook with per-platform status tracking.
- Stream metadata updater that broadcasts title, category, and game to selected accounts.
- Alerts feed collected from platform events and pushed live to the renderer.
- VOD upload queue for long-form videos.
- Social automations for go-live messages via Twitter/X, Discord, or generic webhooks.
- Highlight capture for timestamped moments.

## Project structure
```
streaman/
├── electron/
│   ├── main.ts
│   └── preload.ts
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── services/
│   │   │   ├── tiktokService.ts
│   │   │   ├── twitchService.ts
│   │   │   ├── kickService.ts
│   │   │   ├── youtubeService.ts
│   │   │   └── facebookService.ts
│   │   ├── social/
│   │   │   ├── twitterService.ts
│   │   │   ├── discordService.ts
│   │   │   └── genericWebhookService.ts
│   │   ├── utils/
│   │   │   ├── encryption.ts
│   │   │   └── logger.ts
│   └── db/prisma.schema
├── renderer/
│   ├── index.html
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── styles.css
│       ├── api/
│       └── pages/
├── package.json
└── tsconfig.json
```

## Getting started

### Installation
```
npm install
```
This installs dependencies and generates the Prisma client.

### Development
Run Electron (main + backend) alongside the React renderer:
```
npm run dev
```
- Renderer dev server: `npm run dev:renderer`
- Electron main process: `npm run dev:main`

### Build
```
npm run build        # build backend + renderer
npm run build:renderer
npm run build:backend
```

### Packaging
Create distributable installers with electron-builder:
```
npm run dist
```

### Start packaged build locally
After building, start the compiled Electron app:
```
npm run start
```

## Database
The app uses SQLite through Prisma. The database file `streaman.db` is stored locally (under `backend/db/` by default). Models include accounts, scheduled shorts, VOD uploads, alerts, social integrations, and highlights.

## Platform linking
Use the Accounts page to connect TikTok, Twitch, Kick, YouTube, and Facebook accounts. Provide account ID, display name, access token, refresh token, and scopes. Tokens are encrypted before being written to the database. You can disconnect accounts at any time.

## Scheduling shorts and VODs
- **Shorts**: Create scheduled posts with title, description, tags, video path, scheduled time, and target platform/account.
- **VODs**: Queue long-form uploads with title, description, tags, video path, scheduled time, and platform/account.
Background jobs periodically publish pending items and update status to `pending`, `uploading`, `posted`, or `failed`.

## Stream metadata updates
From the Dashboard, select multiple platform accounts and push a shared title/category/game via the `streams:updateMetadata` IPC route.

## Alerts feed
Backend normalizes alert events (follows, subs, donations, raids, gifts) and stores them in SQLite. New alerts are pushed to the renderer over IPC and rendered in a live feed.

## Automations and social posting
Create social integrations for Twitter/X, Discord, or generic webhooks. Enable go-live message templates that trigger when new posts are published. Settings allow add/edit/delete/toggle of each integration.

## Known limitations
- Platform SDK calls are stubbed for local-only behavior; replace service methods with real platform API calls as needed.
- Token refresh and upload schedulers run on cron intervals within the Electron main process; ensure the app is open for tasks to execute.
- No overlays, chatbot, moderation, or loyalty systems are included by design.
