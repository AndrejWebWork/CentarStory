# CentarStory

A cultural guide to the Municipality of Centar in Skopje. The app opens on Explore. There is no login, signup, or promotional landing page.

Primary destinations: **Explore**, **Scan**, **Museums**, **Traditional Food**, **Get Around**.

Languages: English (default), Turkish, Serbian (Latin / Gajica), Macedonian (Cyrillic), Ukrainian (Cyrillic). The choice is stored in the `NEXT_LOCALE` cookie.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
npm start
```

## Environment variables

All are optional. Copy `.env.example` only if you add a remote recogniser.

| Variable | Purpose |
| --- | --- |
| `RECOGNITION_PROVIDER` | `openai`, `google`, or `anthropic`. Unset = labeled on-device demo. |
| `RECOGNITION_API_KEY` | Server-only. Never sent to the browser. |
| `RECOGNITION_MODEL` | Optional model override. |
| `RECOGNITION_BASE_URL` | Optional OpenAI-compatible base URL. |
| `NEXT_PUBLIC_MAP_STYLE_URL` | Vector style URL. Default: OpenFreeMap Liberty. |

Without a recognition key, Scan compares the photograph in the browser with credited reference images and labelled profiles. It never claims certainty. A manual catalogue is always available. Photographs are not stored.

If OpenFreeMap or the public OSRM demo router is unavailable, the map falls back to OSM raster tiles and labelled approximate walk lines. Those public endpoints are rate-limited and are not unlimited production services.

## Recognition

- **Demo (default):** on-device colour/structure comparison against credited Commons references plus a fallback catalogue. Scores are capped below 1.
- **Remote (optional):** server route `/api/recognition` with the provider key. On timeout or network failure the UI labels a local fallback.

## Data coverage (not exhaustive)

Verified Centar sites in this atlas: 22 mapped records. Restaurants: Pelister (Centar) and Destan (nearby, unmapped). Transport tariffs are cited from official pages with check dates. This is not a complete monument, restaurant, or events census of Centar.
