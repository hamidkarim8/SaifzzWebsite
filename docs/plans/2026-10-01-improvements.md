# Improvements Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the template mirror into a bilingual (EN/BM), mobile-first, installable/offline site with real-looking aircond + electrical content and WhatsApp CTAs.

**Architecture:** Text lives in typed dictionaries (`src/i18n`), business details in `src/config.ts`, pages in `src/views` rendered by thin EN and `/ms/` routes. A build-time Astro integration writes a precaching service worker. All runtime assets are self-hosted.

**Tech Stack:** Astro 7.3.5, Bootstrap 5.0.0 (template CSS + local bundle JS), jQuery 3.7.1 (local), WOW/Owl/counterup (template libs), `@fontsource/roboto`, `@fontsource/roboto-slab`, `@fortawesome/free-solid-svg-icons` + `@fortawesome/free-brands-svg-icons` (build-time SVG data), sharp (icons, scratchpad only), puppeteer-core + local Chrome and Lighthouse (verification, scratchpad only).

**Spec:** `docs/specs/2026-10-01-improvements-design.md`

## Global Constraints

- English default at `/`; BM at `/ms/`. Pages: `index`, `about`, `service`, `contact`, `404` in both languages.
- BM text: standard Malaysian Malay per `.claude/skills/dbp-translator/SKILL.md` (no Indonesian forms, natural phrasing, marketing register).
- Brand display name `Saifzz Aircond Electrical`; colours primary `#FF800F`, secondary `#001064`.
- Footer keeps one tiny `Template by HTML Codex` link to `https://htmlcodex.com`.
- No runtime requests to third-party CDNs (Google Maps embed on Contact is the only external resource).
- No lorem ipsum, no `example.com`, no `New York`, no `+012 345` anywhere in `dist/`.
- Commits short and plain, no Claude/Anthropic mention, never push. No lengthy comments in code.
- Verification scripts live in the scratchpad `$S` (`C:/Users/HAMIDK~1/AppData/Local/Temp/claude/C--SaifzzWebsite/545565cb-18b4-48af-bec7-428ede5a1c4a/scratchpad`), not the repo. Preview server: `npx astro preview --port 4321`.

## Review Focus

1. Switching language on an inner page lands on the same page in the other language (not the home page) → Task 2 check script asserts the switch href per route.
2. WhatsApp form with special characters (`&`, `#`, newline, Malay text) must arrive intact → Task 4 puppeteer test fills `Ali & Abu #2` and checks the decoded `text` param.
3. Offline load of a page never visited directly (e.g. `/ms/service` after visiting only `/`) → Task 5 offline test visits `/` only, then loads other pages offline.
4. Stale content after deploy: a new build must replace the old cache → Task 5 asserts the cache name contains a content hash that changes when a file changes.
5. 404 inside `/ms/` must show the BM 404 page → Task 6 checks `dist/ms/404.html` exists and is BM; live check after push.

---

### Task 1: Self-host assets, inline icons, drop spinner and CDNs

**Files:**
- Modify: `package.json` (deps), `src/layouts/Base.astro`, `public/js/main.js`, `src/components/*.astro` that use `<i class="fa…|bi…">`
- Create: `src/components/Icon.astro`, `public/lib/jquery/jquery.min.js`, `public/lib/bootstrap/bootstrap.bundle.min.js`

**Interfaces:**
- Produces: `<Icon name="phone" class?="…" />` — `name` is a key of the `icons` map in `Icon.astro`; renders `<svg class="icon …" viewBox="0 0 W H" aria-hidden="true" fill="currentColor"><path d="…"/></svg>`, sized `1em` via CSS `.icon{width:1em;height:1em;vertical-align:-.125em}`.

- [ ] **Step 1: RED** — `npm run build && grep -lE "fonts.googleapis|cdnjs|jsdelivr|code.jquery" dist/*.html` lists files.
- [ ] **Step 2:** `npm i @fontsource/roboto @fontsource/roboto-slab && npm i -D @fortawesome/free-solid-svg-icons @fortawesome/free-brands-svg-icons`. Download `https://code.jquery.com/jquery-3.7.1.min.js` → `public/lib/jquery/jquery.min.js`; `https://cdn.jsdelivr.net/npm/bootstrap@5.0.0/dist/js/bootstrap.bundle.min.js` → `public/lib/bootstrap/bootstrap.bundle.min.js`.
- [ ] **Step 3:** `Icon.astro`:

```astro
---
import { faPhone, faEnvelope, faLocationDot, faClock, faArrowUp, faChevronLeft, faChevronRight, faCheck, faTriangleExclamation, faStar } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faTiktok, faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';
const icons = { phone: faPhone, envelope: faEnvelope, location: faLocationDot, clock: faClock, 'arrow-up': faArrowUp, 'chevron-left': faChevronLeft, 'chevron-right': faChevronRight, check: faCheck, warning: faTriangleExclamation, star: faStar, whatsapp: faWhatsapp, tiktok: faTiktok, facebook: faFacebookF, instagram: faInstagram };
const { name, class: cls = '' } = Astro.props;
const [w, h, , , d] = icons[name].icon;
---
<svg class={`icon ${cls}`} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" fill="currentColor"><path d={d} /></svg>
```

- [ ] **Step 4:** Base: remove Google Fonts/Font Awesome/Bootstrap Icons `<link>`s and preconnects; frontmatter imports `@fontsource/roboto/latin-400.css`, `latin-500.css`, `latin-700.css`, `@fontsource/roboto-slab/latin-400.css`, `latin-600.css`, `latin-800.css`. Scripts → `/lib/jquery/jquery.min.js`, `/lib/bootstrap/bootstrap.bundle.min.js`. Remove spinner markup; remove spinner block from `main.js`. Owl `navText` → inline SVG strings (chevron paths). Add `.icon` CSS to `style.css`.
- [ ] **Step 5: GREEN** — build; external-host grep returns nothing; `grep -c "fa-\|bi-" dist/*.html` → 0; screenshot `/` at 375 and 1366 to eyeball icons/fonts.
- [ ] **Step 6:** Commit `Self-host fonts and scripts, use inline SVG icons`.

---

### Task 2: Config, i18n scaffolding, layout, navbar, routes; remove dropped sections

**Files:**
- Create: `src/config.ts`, `src/i18n/en.ts`, `src/i18n/ms.ts`, `src/i18n/index.ts`, `src/views/{Home,About,Services,Contact,NotFound}.astro`, `src/pages/ms/{index,about,service,contact,404}.astro`
- Modify: `src/layouts/Base.astro`, `src/components/Navbar.astro`, `src/pages/{index,about,service,contact,404}.astro`, `public/css/style.css`
- Delete: `src/components/Topbar.astro`, `src/components/Team.astro`, `src/pages/{feature,quote,team,testimonial}.astro`

**Interfaces:**
- `src/config.ts` exports `site = { name, phone, phoneHref, whatsapp, email, tiktok, facebook, instagram, mapQuery, stats: { customers, years, jobs, rating } }`.
- `src/i18n/index.ts` exports `type Lang = 'en' | 'ms'`, `type Page = 'index' | 'about' | 'service' | 'contact' | '404'`, `t(lang: Lang)` → dictionary, `localePath(lang: Lang, page: Page): string` (`en`: `/`, `/about`…; `ms`: `/ms/`, `/ms/about`…), `otherLang(lang)`.
- `en.ts` exports `en` (const object); `ms.ts` exports `ms: typeof en`.
- `Base.astro` props `{ lang: Lang; page: Page }`; renders title/description from `t(lang).meta[page]`, canonical `new URL(localePath(lang,page), Astro.site)`, alternates en/ms/x-default (not on 404).
- `Navbar.astro` props `{ lang, page }`: 4 links via `localePath`, switch link `localePath(otherLang(lang), page)` labelled `BM`/`EN`, WhatsApp + TikTok icon links with `aria-label`.
- Views take `{ lang }`.

- [ ] **Step 1: RED** — write `$S/check-site.mjs`: for each of the 10 routes (`index, about, service, contact, 404` × en/ms) assert `dist` file exists (`about.html`, `ms/about.html`, `index.html`, `ms/index.html`…), `<html lang="en|ms">`, switch link equals counterpart path, `hreflang="ms"`/`"en"` present (non-404), no `team-item`, no topbar markup (`bg-dark text-white-50 py-2`), no `dropdown-toggle`, no banned strings (`lorem|ipsum|diam|clita|example\.com|New York|\+012 345|Your Site Name`, case-insensitive). Prints PASS/FAIL per route, exit 1 on any fail. Run → FAIL.
- [ ] **Step 2:** Implement config, i18n (EN + BM text written in Task 3; this task creates the full key structure with final EN text and BM text), views, routes, Base, Navbar; delete dropped files. Unused template CSS (topbar, team, testimonial-left/right) removed from `style.css`.
- [ ] **Step 3: GREEN** — `npm run build && node $S/check-site.mjs` → 10 PASS (banned-string check may only pass after Task 3; if so record as expected and finish in Task 3).
- [ ] **Step 4:** Commit `Add EN/BM routing and remove unused sections`.

---

### Task 3: Content (EN + BM), sections, footer

**Files:**
- Modify: `src/i18n/en.ts`, `src/i18n/ms.ts`, `src/components/{About,Facts,Features,Service,Testimonial,Footer,PageHeader}.astro`; rename `Quote.astro` → `Enquiry.astro`
- Modify: views to compose sections per spec Content section

**Interfaces:**
- Each section component takes `{ lang }` and reads `t(lang)` + `site`.
- `Enquiry.astro` form: `<form class="wa-form" data-wa="{site.whatsapp}" data-template="{t.enquiry.template}">` with fields `name` (required), `service` (select of 6 services, required), `area`, `message`; template placeholders `{name} {service} {area} {message}`.

- [ ] **Step 1: RED** — `node $S/check-site.mjs` fails on banned strings (template filler still in sections).
- [ ] **Step 2:** Write EN copy (plain, friendly, local Malaysian customer). Write BM following the DBP skill. Services per spec (6). Testimonials: 4 dummy, name + area, no images; carousel keeps Owl. Footer per spec, including tiny credit line. 404 text both languages.
- [ ] **Step 3: GREEN** — check-site 10 PASS. Read `ms.ts` once more against the DBP skill's pitfalls list (Indonesian forms, over-borrowed English).
- [ ] **Step 4:** Commit `Replace template filler with real content`.

---

### Task 4: WhatsApp CTAs

**Files:**
- Create: `src/components/WhatsAppButton.astro`
- Modify: `src/components/Enquiry.astro` (script), `src/layouts/Base.astro`, `public/css/style.css`

**Interfaces:**
- Form submit → `window.open('https://wa.me/' + data-wa + '?text=' + encodeURIComponent(msg), '_blank')`, `msg` = template with fields substituted, empty fields' lines dropped.

- [ ] **Step 1: RED** — `$S/wa-test.mjs` (puppeteer): on `/contact` and `/ms/contact`, stub `window.open` to record URL, fill name `Ali & Abu #2`, pick service 2, area `Shah Alam`, message `Line1\nLine2`, submit; assert URL starts with `https://wa.me/<site.whatsapp>?text=` and decoded text contains each value verbatim and the localized service name. Also assert a floating `a.whatsapp-float[href^="https://wa.me/"]` exists with `aria-label`. Run → FAIL.
- [ ] **Step 2:** Implement script (Astro `<script>` in Enquiry), floating button (bottom left, 56px, `#25D366`, above back-to-top z-index), CSS.
- [ ] **Step 3: GREEN** — wa-test PASS both languages.
- [ ] **Step 4:** Commit `Add WhatsApp enquiry form and floating button`.

---

### Task 5: PWA

**Files:**
- Create: `public/manifest.webmanifest`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-maskable-512.png`, `src/sw.js` (template), `integrations/sw.mjs`
- Modify: `astro.config.mjs`, `src/layouts/Base.astro` (manifest link, `theme-color` meta, SW register)

**Interfaces:**
- `integrations/sw.mjs` default export `sw()` → Astro integration; hook `astro:build:done({ dir })`: walk `dir`, skip `sw.js`, `*.map`, `scss/`, `*.php`; map `index.html`→`/`, `ms/index.html`→`/ms/`, `X.html`→`/X`, `ms/X.html`→`/ms/X`; others `/path`. Version = first 10 hex of sha256 over all file contents. Write `dir/sw.js` from `src/sw.js` replacing `self.__PRECACHE__` with the JSON list and `__VERSION__` with the version.
- `src/sw.js`: cache name `saifzz-<version>`; install → `cache.addAll(precache)` + `skipWaiting`; activate → delete other `saifzz-*` caches + `clients.claim`; fetch (GET, same-origin): navigation → network first, put in cache, fall back to cached request, then `/ms/404` if path starts `/ms/` else `/404`; other → cache first then network.

- [ ] **Step 1: RED** — `$S/pwa-test.mjs` (puppeteer): open `/`, wait `navigator.serviceWorker.ready`, `page.setOfflineMode(true)`, goto `/about`, `/ms/service`, `/ms/contact`, `/contact` → each renders its `<h1>` (not Chrome offline page); fetch `/manifest.webmanifest` → JSON with `name`, `icons` (192, 512, maskable). Also: build twice with a one-byte change to `public/css/style.css` between → the `saifzz-<version>` string in `dist/sw.js` differs. Run → FAIL.
- [ ] **Step 2:** Generate icons with sharp from `public/favicon.svg` (maskable: snowflake scaled to 60% on full-bleed navy). Write manifest, sw template, integration, Base additions.
- [ ] **Step 3: GREEN** — pwa-test PASS.
- [ ] **Step 4:** Commit `Add PWA manifest and offline service worker`.

---

### Task 6: SEO

**Files:**
- Modify: `astro.config.mjs` (sitemap), `package.json`
- Create: `public/robots.txt`

- [ ] **Step 1: RED** — `$S/seo-test.mjs`: 8 non-404 pages have unique `<title>` and non-empty `<meta name="description">`; `dist/sitemap-index.xml` (or `sitemap.xml`) lists all 8 URLs on `https://saifzzaircondelectrical.com.my` and no 404; `robots.txt` has `Sitemap:` line; `dist/ms/404.html` contains BM 404 text. Run → FAIL.
- [ ] **Step 2:** `npx astro add sitemap` (if peer conflict with Astro 7, generate `sitemap.xml` in the Task 5 integration instead and ledger it). Filter out 404 pages. `robots.txt`: `User-agent: *`, `Allow: /`, `Sitemap: https://saifzzaircondelectrical.com.my/sitemap-index.xml`.
- [ ] **Step 3: GREEN** — seo-test PASS.
- [ ] **Step 4:** Commit `Add sitemap and robots.txt`.

---

### Task 7: Mobile audit and fixes

**Files:** whatever the audit shows (expected: `public/css/style.css`, section components).

- [ ] **Step 1: RED/baseline** — extend `$S/measure/measure.mjs` to all 10 routes × widths 360, 375, 414, 768, 1024, 1366; add checks: every visible `a, button, input, select, textarea` ≥ 44×44 px or inline text link inside a paragraph; computed body font-size ≥ 14px; no element wider than viewport. Run Lighthouse mobile: `npx lighthouse http://localhost:4321/ --chrome-path="C:/Program Files/Google/Chrome/Application/chrome.exe" --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --output=json --output-path=$S/lh-home.json --chrome-flags="--headless=new"`; same for `/ms/contact`. Record scores.
- [ ] **Step 2:** Fix each failure at its cause (CSS or markup). Screenshots at 375 of every page, eyeball.
- [ ] **Step 3: GREEN** — measure all PASS; Lighthouse ≥ 90 on all four categories for both URLs (if Performance is below 90 only because of the local preview server, record the score and reason in the ledger).
- [ ] **Step 4:** Commit `Fix mobile layout issues`.

---

### Task 8: Wrap-up

- [ ] Re-run all scratchpad tests (check-site, wa-test, pwa-test, seo-test, measure) on a fresh build → all PASS.
- [ ] Final whole-branch review (fresh reviewer, most capable model).
- [ ] Update README (structure, where to edit content: `src/config.ts`, `src/i18n/*.ts`).
- [ ] Update memory with commits, structure, placeholders to replace, next steps.
