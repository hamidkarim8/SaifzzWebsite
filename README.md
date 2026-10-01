# Saifzz Aircond Electrical

Website for Saifzz Aircond Electrical. Built with Astro, hosted on Cloudflare Workers.

English at `/`, Bahasa Melayu at `/ms`. Installable as an app (PWA) and works offline after the first visit.

## Develop

    npm install
    npm run dev

## Build

    npm run build   # output in dist/

## Edit content

- `src/config.ts`: business name, phone, WhatsApp number, TikTok/Facebook/Instagram links, service area, map location, stats.
- `src/i18n/en.ts` and `src/i18n/ms.ts`: all page text. Both files have the same keys. `{brand}` and `{area}` are filled in from `src/config.ts`.
- `public/img/`: images.

## Structure

- `src/views/`: one file per page, shared by both languages.
- `src/pages/` and `src/pages/ms/`: routes for English and BM.
- `src/components/`: page sections.
- `src/sw.js` + `integrations/sw.mjs`: offline service worker, generated at build.

## Deploy

Cloudflare Workers (static assets), config in `wrangler.jsonc`. Auto-deploys on push to `main`.

Based on the AirCon template by [HTML Codex](https://htmlcodex.com) (CC BY 4.0, see TEMPLATE-LICENSE.txt).
