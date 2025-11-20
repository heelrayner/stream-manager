# streaman

streaman is a local-only Electron desktop application for orchestrating livestreams, scheduled shorts, VOD uploads, alerts, and social automations across TikTok, Twitch, Kick, YouTube, and Facebook. All data is stored on-device in `streaman.db` using SQLite + Prisma and no external hosting or SaaS is required.

## Project Structure
```
streaman/
  electron/
    main.ts
    preload.ts
  backend/
    src/
      index.ts
      services/
        twitchService.ts
        youtubeService.ts
        tiktokService.ts
        kickService.ts
        facebookService.ts
      social/
        twitterService.ts
        discordService.ts
        genericWebhookService.ts
      db/
        prisma.schema
      utils/
        encryption.ts
        logger.ts
  renderer/
    src/
      main.tsx
      App.tsx
      components/
      pages/
        DashboardPage.tsx
        AccountsPage.tsx
        SchedulesPage.tsx
        VodsPage.tsx
        SettingsPage.tsx
      api/
        ipcClient.ts
        accountsApi.ts
        schedulesApi.ts
        streamsApi.ts
        vodsApi.ts
        settingsApi.ts
  package.json
  README.md
```

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
   - On Windows, run the command in PowerShell. Ensure Node.js, Python, and the Visual Studio Build Tools (for the `sqlite3` native module) are available on your PATH.

2. **Development**
   Run the Electron shell and renderer dev server together:
   ```bash
   npm run dev
   ```
   - Renderer runs on Vite at `http://localhost:5173`
   - Electron loads the dev server URL and wires IPC endpoints via the preload script

3. **Build**
   ```bash
   npm run build
   ```
   This builds the backend, renderer, and main process TypeScript into `dist/`.

4. **Distributables**
   ```bash
   npm run dist
   ```
   Packages installers with `electron-builder` into `dist/electron-builder/`.

5. **Start packaged app (from built output)**
   ```bash
   npm start
   ```
   - `npm start` rebuilds the backend, renderer, and main process before launching `dist/electron/main.js`, which keeps the packaged entrypoint consistent on Windows, macOS, and Linux.

## Windows notes
- Scripts use `cross-env` and `concurrently`, so they work the same in PowerShell, CMD, or Git Bash.
- Electron stores the SQLite database at `%APPDATA%/streaman/streaman.db` by default (Electron `userData` path), keeping data in the user profile without elevated permissions.
- If native dependencies fail to build, install the latest [Visual Studio Build Tools](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio) and restart your shell before re-running `npm install`.

## Key Features
- **Account linking** for TikTok, Twitch, Kick, YouTube, and Facebook with encrypted token storage, multiple accounts per platform, and IPC endpoints (`accounts:get`, `accounts:connect`, `accounts:disconnect`).
- **Scheduling shorts** with title, description, tags, video path, time, platform selection, and per-platform status tracking.
- **VOD management** for long-form uploads with the same scheduling controls.
- **Stream metadata updates** across any combination of linked accounts using a single form.
- **Alerts feed** that normalizes events, stores them, and pushes real-time updates to the renderer via IPC.
- **Automations** for go-live social posts (Twitter, Discord, or generic webhooks), metadata preflight, and highlight marking.
- **Social settings** stored in the `SocialIntegration` model with encryption for API keys or webhook URLs.

## Database
- SQLite database stored locally as `streaman.db`.
- Prisma schema lives in `backend/db/prisma.schema` with models for accounts, scheduled shorts, VODs, alerts, metadata updates, highlights, and social integrations.
- `npm run prisma:generate` runs automatically after install to generate the Prisma client.

## Known Limitations
- Platform API calls are mocked; replace service methods under `backend/src/services/` with real platform SDK logic.
- OAuth flows are not implemented; use your own authentication mechanism to populate tokens.
- Uploads and webhooks are simulated; add file handling and webhook endpoints as needed.
