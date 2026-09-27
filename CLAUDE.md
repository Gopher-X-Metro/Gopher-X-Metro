# Gopher-X-Metro

Live map of UMN campus buses (Peak Transit) + Metro Transit buses/light rail. React 18 CRA (`react-scripts`), TypeScript, Chakra UI, Leaflet, Tailwind. Deployed to GitHub Pages (org repo `Gopher-X-Metro/Gopher-X-Metro`).

## Layout
- `src/backend/` — data layer: `Static.ts` (static GTFS JSON from `public/gtfs`), `Realtime.ts` (GTFS-RT protobuf from svc.metrotransit.org + Peak vehicles), `Peak.ts` (UMN campus routes), `Live.ts` (nearby stops, departures, alerts), `Plan.ts`, `Schedule.ts`, `Fetch.ts` (JSON fetch helper, returns undefined on failure).
- `src/frontend/Pages/{Map,Schedule,Alerts,About}`, `src/frontend/NavBar`.
- `scripts/build-gtfs.mjs <dir>` — converts Metro Transit GTFS txt → `public/gtfs/**.json` (gitignored `/gtfs`; generated in CI).

## Config
- `REACT_APP_PEAK_KEY` — Peak Transit rider API key. Local: `.env.local` (gitignored). CI: repo secret of same name. CRA inlines it into the bundle, so it is not truly secret.
- `REACT_APP_LINE_*` — map line widths.

## CI (`.github/workflows/deploy.yml`)
Runs on push to main + Mondays 10:00 UTC: downloads GTFS, builds JSON, `tsc --noEmit`, builds, deploys Pages. Node 22. Writes `public/data/last_updated.json`. Scheduled failure opens an issue labeled `stale-data`; keepalive job stops GitHub disabling the cron.

## Commands
`npm start` · `npm run build` · `npx tsc --noEmit` · `npm run knip` (dead code)
