# CentarStory

A cultural guide to the Municipality of Centar in Skopje. The app opens on Transport. There is no login, signup, or promotional landing page.

Primary destinations: **Transport**, **Scan**, **Events**, **Traditional Food**, **Get Around**.

Languages: English (default), Turkish, Serbian (Latin / Gajica), Macedonian (Cyrillic), Ukrainian (Cyrillic), Albanian. The choice is stored in the `NEXT_LOCALE` cookie.

A cookie notice is required. It stays until accepted. Accepting stores `centarstory_consent` for one year. There are no advertising or analytics cookies. The cookie policy is at `/cookies`.

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

All are optional. Copy `.env.example` only if you add a remote recogniser or a different map style.

| Variable | Purpose |
| --- | --- |
| `RECOGNITION_PROVIDER` | `openai`, `google`, or `anthropic`. Unset = labeled on-device demo. |
| `RECOGNITION_API_KEY` | Server-only. Never sent to the browser. |
| `RECOGNITION_MODEL` | Optional model override. |
| `RECOGNITION_BASE_URL` | Optional OpenAI-compatible base URL. |
| `RECOGNITION_FREE_TIER` | `true` only for the allowed free vision models. |
| `NEXT_PUBLIC_MAP_STYLE_URL` | Vector style URL. Default: OpenFreeMap Liberty, restyled in the app for Centar. |

Without a recognition key, Scan compares the photograph in the browser with credited reference images and labelled profiles. It never claims certainty. A manual catalogue is always available. Photographs are not stored. If the browser allows it, Scan may read the device location once to improve a match. That reading is not stored as a cookie.

Maps use OpenFreeMap vector tiles, drawn as a Centar folio: the municipality is outlined, the area outside it is dimmed, and buildings can show in relief. Attribution to OpenStreetMap contributors is required. If the vector style fails, the map falls back to OSM raster tiles. Walking lines may come from the public OSRM pedestrian router. A kitchen pin opens Google Maps walking directions. Those public endpoints are rate-limited and are not unlimited production services.

## Recognition

- **Demo (default):** on-device colour/structure comparison against credited Commons references plus a fallback catalogue. Scores are capped below 1.
- **Remote (optional):** server route `/api/recognition` with the provider key. On timeout or network failure the UI labels a local fallback.

## Data coverage (not exhaustive)

The atlas is a sourced guide to places, municipal events, dishes, and movement in Centar. It is not a complete monument, restaurant, or events census. Restaurant pins on the food map are OpenStreetMap kitchens, kafanas, gostilnicas, and grill houses in Centar and the Old Bazaar. Several doors can share one name, so a house page may still have no single pin. Transport tariffs are cited from the pages named in the app, with check dates.

## Legal

`/legal`, `/privacy`, `/terms`, and `/cookies` are the notice, privacy policy, terms of use, and cookie policy. The date on those pages is the date in `src/content/legal.ts`.
