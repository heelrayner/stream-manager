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
