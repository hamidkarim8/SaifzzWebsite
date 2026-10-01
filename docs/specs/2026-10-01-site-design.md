# SaifzzAircondElectrical Website — Design Spec

Date: 2026-10-01

Site name: **SaifzzAircondElectrical**. Domain (to be purchased): `saifzzaircondelectrical.com.my`.

## Goal

Informational website for an aircond service business. Shows services and info, drives visitors to contact via WhatsApp, TikTok and other channels. No backend.

## Decisions

| Item | Choice |
|------|--------|
| Stack | Astro, static output |
| Hosting | Cloudflare Pages (free), custom domain added after purchase |
| Repo | https://github.com/hamidkarim8/SaifzzWebsite.git, branch `main` |
| Base template | HTML Codex "AirCon" (`C:\Users\HamidKarim\OneDrive\ac-repair-website-template`) |
| Pages | All 9: index, about, service, feature, quote, team, testimonial, contact, 404 |

## Phase 1 — Mirror (initial commit)

Output must look and behave identical to the template.

### Structure

```
public/            css/ js/ lib/ img/ scss/ copied unchanged from template
src/layouts/Base.astro
src/components/    Topbar, Navbar, Footer, PageHeader, plus sections reused across pages
src/pages/         index, about, service, feature, quote, team, testimonial, contact, 404
astro.config.mjs, package.json, .gitignore, README.md
```

### Rules

- Markup, classes, text, images and scripts copied as-is (Bootstrap 5, jQuery, WOW, Owl Carousel, counterup, parallax).
- Blocks repeated across pages become components. Page-specific blocks stay in the page.
- Navbar takes a prop for the active link.
- Clean URLs (`/`, `/about`, `/service`, ...). Template `*.html` links rewritten to match. `404.astro` builds to `404.html`.
- Footer "Designed By HTML Codex" credit kept (CC BY 4.0 license requirement).
- Template section marker comments not carried over.
- Template references a missing `img/favicon.ico`. Add simple favicon: navy (#001064) rounded square with orange (#FF800F) snowflake, as `favicon.svg` + 32px `favicon.ico` + 180px `apple-touch-icon.png`.
- `site` in `astro.config.mjs` set to `https://saifzzaircondelectrical.com.my`.
- Brand text stays "AirCon" in the mirror.

### Verification

- `npm run build` succeeds with no errors.
- Each of the 9 pages served by `npm run preview` compared against the original HTML in a browser: same layout, carousel, testimonials slider, counters, animations, navbar dropdown, mobile menu.

### Commits

1. `Initial mirror of AirCon template` (includes favicon)
2. `Add site design spec`
3. `Rename brand to SaifzzAircondElectrical` (brand name, page titles)

Hamid pushes to GitHub himself.

## Phase 2 — Deploy

Cloudflare Pages → connect GitHub repo → framework preset Astro, build `npm run build`, output `dist`. Custom domain `saifzzaircondelectrical.com.my` attached once bought. Cloudflare Registrar does not sell `.com.my`, so buy at a MYNIC reseller (Exabytes, Shopper, IPServerOne, etc.), then point its nameservers to Cloudflare.

## Phase 3 — Improvements (later, separate specs)

Real business content, WhatsApp/TikTok/other CTAs, floating WhatsApp button, SEO meta + sitemap + LocalBusiness JSON-LD, image optimization, page pruning, UI refresh.
