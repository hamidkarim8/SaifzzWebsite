# Improvements Phase 1 — Design Spec

Date: 2026-10-01. Builds on `2026-10-01-site-design.md`.

## Goals (priority order)

1. Good on mobile, installable PWA that works offline.
2. English / Bahasa Melayu switch. BM text follows DBP standard (`.claude/skills/dbp-translator`).
3. Real-looking content instead of template filler.

## Decisions

| Item | Choice |
|------|--------|
| Default language | English at `/`, BM at `/ms/` |
| Pages | Home, About, Services, Contact, 404 (each in both languages) |
| Removed | Topbar, team section + page, features/quote/testimonial pages, "Pages" dropdown, newsletter, testimonial photos, spinner, lorem ipsum |
| Forms | Fields compose a pre-filled WhatsApp message to the business number |
| Template credit | Kept as one tiny "Template by HTML Codex" line in the footer (CC BY 4.0) |
| Hosting | Cloudflare Workers static assets (`wrangler.jsonc`), unchanged |

## Structure

- `src/config.ts` — business details: name, phone, WhatsApp number, email, TikTok/Facebook/Instagram URLs, map query, stats. Placeholder values until owner supplies real ones.
- `src/i18n/en.ts`, `src/i18n/ms.ts` — all visible text, same shape (`ms` typed against `en`). `src/i18n/index.ts` — `Lang` type, `t(lang)`, `localePath(lang, page)`.
- `src/views/*.astro` — one component per page taking `lang`. `src/pages/*.astro` and `src/pages/ms/*.astro` are thin routes.
- `src/layouts/Base.astro` — props `lang`, `page`; sets `<html lang>`, title, description, canonical, `hreflang` alternates (en, ms, x-default).
- `src/components/Icon.astro` — inline SVG icons from Font Awesome free icon data (build time only).

## Content

- Services (6): Aircond installation; Aircond servicing & cleaning; Aircond troubleshooting & repair; Electrical wiring & rewiring; Electrical troubleshooting & repair (tripping, short circuit); Lights, fans & power points installation.
- Home: hero (2 slides), about, why choose us, services, WhatsApp enquiry form, testimonials (text only, dummy).
- About: about, stats counters, why choose us. Services: all 6 grouped Aircond / Electrical. Contact: enquiry form, call/WhatsApp/TikTok buttons, map, hours.
- Stats and testimonials are placeholders; owner confirms later.

## Navigation and CTAs

- Navbar: logo + name, Home/About/Services/Contact, `EN | BM` switch to the same page in the other language, WhatsApp + TikTok icons.
- Floating WhatsApp button on every page (bottom left; back-to-top stays bottom right).
- Footer: short description, contact info, quick links, social icons, `© <year> Saifzz Aircond Electrical`, tiny template credit.

## PWA

- `manifest.webmanifest`: name, short name "Saifzz", start `/`, standalone, theme `#001064`, background `#ffffff`, icons 192, 512, maskable 512.
- Service worker `/sw.js`, generated at build by a small Astro integration that lists every built file. Precache all pages and assets. Navigations: network first, fall back to cache, then cached 404. Assets: cache first. Old caches removed on activate.
- No third-party CDN at runtime: fonts (`@fontsource`), jQuery 3.7.1 and Bootstrap JS served from the site.

## SEO

Unique title + description per page per language, canonical, hreflang, `@astrojs/sitemap` (if compatible with Astro 7, else a generated `sitemap.xml`), `robots.txt`.

## Quality bar

- No horizontal scroll, no clipped navbar, tap targets ≥ 44px, on all pages at 360/375/414/768/1024/1366 px.
- Lighthouse mobile ≥ 90 for Performance, Accessibility, Best Practices, SEO on `/` and `/ms/contact`.
- Works offline after first visit (pages already cached load with network off).
