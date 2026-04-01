# AGENTS.md

## Purpose
- This is a client-only React + Vite visualization app for China city "maimai index" (machines per 10k population), not a backend service (`src/App.tsx`, `src/components/ChinaMap.tsx`).
- Core UX is: province filter -> map + ranking + province detail update together from static JSON data.

## Architecture Map
- Entry: `src/main.tsx` renders `App` in `StrictMode`.
- Orchestration: `src/App.tsx` owns `selectedProvince` and computes derived slices with `useMemo` (`stats`, `topCities`, `provinceCities`).
- Visualization boundary: `src/components/ChinaMap.tsx` is the only ECharts integration (fetches `/中华人民共和国.geojson`, registers `china`, builds `EChartsOption`).
- Sidebar/reporting: `CityRanking`, `ProvinceDetail`, `StatsCard`, `ProvinceSelector` are pure presentational/derived-data components.
- UI primitives under `src/components/ui/*` are shadcn/radix-style building blocks; prefer composition over editing generated primitives unless needed.

## Data Contracts (Important)
- App uses preprocessed static files in `src/data/*` (imported at build time), not runtime API calls.
- `cityData.json` item shape is relied on directly: `name`, `province`, `coord:[lng,lat]`, `maimai_count`, `population_total`, `maimai_index`, optional `grp_total`, `per_capita_total`.
- `provinceData.json` is keyed by province string and must stay name-compatible with `provinceList.json` and `ChinaMap` province-name mapping (`resolveGeoProvinceName`).
- Formula and thresholds are duplicated in UI + map logic; if changing one, update both `src/App.tsx` (legend/info text) and `src/components/ChinaMap.tsx` (`transformIndex`, `getColor`).

## Build, Lint, Run
- Install: `bun install`
- Dev server: `bun dev`
- Production build: `bun run build`
- Preview build: `bun run preview`
- Lint: `bun run lint`
- No test script exists in `package.json`; validate behavior manually in browser (province switching, fullscreen map, tooltip values, Top20 ranking).

## Project Conventions
- TypeScript strict mode is enabled (`tsconfig.app.json`); avoid introducing `any` unless unavoidable for external payloads.
- Use `@/` alias for app imports (`vite.config.ts`, `tsconfig.app.json`), but local sibling imports are common inside feature files.
- Tailwind utility styling is primary; map colors are theme variables in `src/components/china-map.css` (do not hardcode map palette in TS).
- Keep bundle chunk grouping logic in `vite.config.ts` `manualChunks`; new heavy deps should be assigned to an existing/new vendor bucket.

## Integration and Cross-Component Behavior
- `selectedProvince` is the main shared state contract passed from `App` into `ProvinceSelector`, `ChinaMap`, `ProvinceDetail`, and province tab/ranking.
- `ChinaMap` remounts on fullscreen toggle via `key={isFullscreen ? 'map-fullscreen' : 'map-windowed'}` to avoid ECharts sizing glitches.
- `ChinaMap` computes dynamic province zoom from GeoJSON bbox metadata (`buildMapViewMeta`, `getDynamicProvinceZoom`); preserve this behavior when adjusting map focus.
- Tooltip content expects GDP fields may be null and already handles fallback text; keep null-safe formatting.

## Safe Change Boundaries
- Prefer edits in feature components (`src/components/*.tsx`) and `src/App.tsx`; avoid broad rewrites under `src/components/ui/*`.
- If modifying data schema, update all consumers in one change set (`App`, `ChinaMap`, `CityRanking`, `ProvinceDetail`) and sanity-check rendered values.
- Keep `base: './'` in `vite.config.ts` unless deployment target explicitly changes (current setup assumes static relative-path hosting).
