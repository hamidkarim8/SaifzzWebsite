# Template Mirror Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the HTML Codex AirCon template as an Astro static site whose built HTML matches the template page for page, then rename the brand.

**Architecture:** Template assets go to `public/` unchanged. A one-off generator script (kept outside the repo) cuts the template HTML at its `<!-- X Start/End -->` markers into Astro components, a layout and 9 pages, so markup is copied mechanically instead of retyped. A compare script normalizes whitespace/comments and checks every built page against its template page.

**Tech Stack:** Astro (latest), Node 24, Bootstrap 5 + jQuery + WOW/Owl/counterup/parallax (from template), sharp (favicon generation only, outside repo).

**Spec:** `docs/specs/2026-10-01-site-design.md`

## Global Constraints

- Template source: `C:\Users\HamidKarim\OneDrive\ac-repair-website-template` (read only, never modified).
- Project root: `C:\SaifzzWebsite`. Remote: `https://github.com/hamidkarim8/SaifzzWebsite.git`, branch `main`. Never `git push`.
- `site`: `https://saifzzaircondelectrical.com.my`.
- Commit messages short and plain. No `Co-Authored-By`, no Claude/Anthropic mention.
- No lengthy or explanatory comments in code.
- Footer "Designed By HTML Codex" credit stays.
- All `<script>` tags use `is:inline` so Astro does not bundle them.
- Helper scripts live in the session scratchpad `$S` = `C:/Users/HAMIDK~1/AppData/Local/Temp/claude/C--SaifzzWebsite/545565cb-18b4-48af-bec7-428ede5a1c4a/scratchpad`, not in the repo.

## Allowed differences from template

1. Internal links: `index.html` → `/`, `X.html` → `/X`.
2. Asset paths made root-absolute (`img/` → `/img/`, same for `css/ js/ lib/`), so the 404 page works at nested URLs.
3. Favicon links replaced (template's `img/favicon.ico` does not exist).
4. Section marker comments removed.

## Review Focus

1. 404 at a nested URL (`/foo/bar`) must still load CSS/JS/images → Task 3 checks no relative asset paths remain in `dist/*.html`.
2. Clean URL `/about` (no `.html`) must return the page in `astro preview` → Task 4 curls every route.
3. Navbar highlights the correct item on each page (dropdown parent too for Features/Quote/Team/Testimonial/404) → covered by compare script in Task 3.
4. Mobile menu, dropdown, carousel, counters need jQuery/Bootstrap scripts emitted verbatim → Task 3 greps built HTML for exact CDN `<script>` tags.
5. Template ships without `lib/owlcarousel/assets/owl.carousel.min.css` (empty folder), so the testimonial slider renders unstyled, same as the raw template → Task 4 records it; fix belongs to the improvement phase.

---

### Task 1: Scaffold Astro project, assets, favicon, git

**Files:**
- Create: `package.json`, `astro.config.mjs`, `.gitignore`, `README.md`, `TEMPLATE-LICENSE.txt`
- Create: `public/css/**`, `public/js/**`, `public/lib/**`, `public/img/**`, `public/scss/**` (copied)
- Create: `public/favicon.svg`, `public/favicon.ico`, `public/apple-touch-icon.png`
- Create: `src/pages/index.astro` (placeholder, replaced in Task 3)

**Interfaces:**
- Produces: `npm run build` → `dist/<page>.html` (`build.format: 'file'`); favicon files at site root.

- [ ] **Step 1: Init git and npm project**

```bash
cd /c/SaifzzWebsite
git init -b main
git remote add origin https://github.com/hamidkarim8/SaifzzWebsite.git
```

`package.json`:

```json
{
  "name": "saifzz-website",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

```bash
npm install astro
```

`astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://saifzzaircondelectrical.com.my',
  build: { format: 'file' },
});
```

`.gitignore`:

```
node_modules/
dist/
.astro/
```

`README.md`:

```markdown
# SaifzzAircondElectrical

Website for SaifzzAircondElectrical. Built with Astro, hosted on Cloudflare Pages.

## Develop

    npm install
    npm run dev

## Build

    npm run build   # output in dist/

## Deploy

Cloudflare Pages, framework preset Astro, build command `npm run build`, output `dist`.

Based on the AirCon template by [HTML Codex](https://htmlcodex.com) (CC BY 4.0, see TEMPLATE-LICENSE.txt).
```

- [ ] **Step 2: Copy template assets**

```bash
T="/c/Users/HamidKarim/OneDrive/ac-repair-website-template"
mkdir -p public
cp -r "$T/css" "$T/js" "$T/lib" "$T/img" "$T/scss" public/
cp "$T/LICENSE.txt" TEMPLATE-LICENSE.txt
```

- [ ] **Step 3: Favicon**

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#001064"/><g fill="none" stroke="#FF800F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M32 10v44M13 21l38 22M13 43l38-22"/><path d="M25 14l7 6 7-6M25 50l7-6 7 6"/></g></svg>
```

`$S/favicon/make.mjs`:

```js
import sharp from 'sharp';
import fs from 'node:fs';

const P = 'C:/SaifzzWebsite/public';
const svg = fs.readFileSync(`${P}/favicon.svg`);
await sharp(svg, { density: 300 }).resize(180, 180).png().toFile(`${P}/apple-touch-icon.png`);
const png = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
const h = Buffer.alloc(22);
h.writeUInt16LE(0, 0);
h.writeUInt16LE(1, 2);
h.writeUInt16LE(1, 4);
h.writeUInt8(32, 6);
h.writeUInt8(32, 7);
h.writeUInt16LE(1, 10);
h.writeUInt16LE(32, 12);
h.writeUInt32LE(png.length, 14);
h.writeUInt32LE(22, 18);
fs.writeFileSync(`${P}/favicon.ico`, Buffer.concat([h, png]));
```

```bash
cd "$S/favicon" && npm init -y >/dev/null && npm install sharp && node make.mjs
```

Expected: `public/favicon.ico` (~1 KB) and `public/apple-touch-icon.png` exist. Open both with the Read tool to eyeball them.

- [ ] **Step 4: Placeholder page and build**

`src/pages/index.astro`:

```astro
<html><body>placeholder</body></html>
```

Run: `npm run build`
Expected: build succeeds, `dist/index.html` exists. No commit yet (first commit is the full mirror).

---

### Task 2: Compare script (the test)

**Files:**
- Create: `$S/compare.mjs`

**Interfaces:**
- Consumes: `dist/<page>.html` from Task 1 build.
- Produces: `node $S/compare.mjs` → prints `PASS <page>` / `FAIL <page>` with context, exit 1 on any failure.

- [ ] **Step 1: Write the script**

```js
import fs from 'node:fs';

const T = 'C:/Users/HamidKarim/OneDrive/ac-repair-website-template';
const D = 'C:/SaifzzWebsite/dist';
const pages = ['index', 'about', 'service', 'feature', 'quote', 'team', 'testimonial', 'contact', '404'];

const fix = s => s
  .replace(/href="index\.html"/g, 'href="/"')
  .replace(/href="([a-z0-9]+)\.html"/g, 'href="/$1"')
  .replace(/(src|href|data-image-src)="(img|css|js|lib)\//g, '$1="/$2/');

const norm = s => s
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<link[^>]*rel="(icon|apple-touch-icon)"[^>]*>/g, '')
  .replace(/\s+/g, ' ')
  .replace(/>\s+</g, '><')
  .replace(/\s+>/g, '>')
  .replace(/^<!doctype/i, '<!DOCTYPE')
  .trim();

let fail = 0;
for (const p of pages) {
  const a = norm(fix(fs.readFileSync(`${T}/${p}.html`, 'utf8')));
  const file = `${D}/${p}.html`;
  if (!fs.existsSync(file)) { fail++; console.log(`FAIL ${p} missing`); continue; }
  const b = norm(fs.readFileSync(file, 'utf8'));
  if (a === b) { console.log(`PASS ${p}`); continue; }
  fail++;
  let i = 0;
  while (a[i] === b[i]) i++;
  console.log(`FAIL ${p} @${i}\n  template: ${a.slice(Math.max(0, i - 80), i + 120)}\n  built:    ${b.slice(Math.max(0, i - 80), i + 120)}`);
}
process.exit(fail ? 1 : 0);
```

- [ ] **Step 2: Run against placeholder build**

Run: `node $S/compare.mjs`
Expected: `FAIL index @...` and `FAIL <page> missing` for the other 8, exit 1.

---

### Task 3: Generate layout, components, pages

**Files:**
- Create: `$S/generate.mjs`
- Create: `src/layouts/Base.astro`
- Create: `src/components/Topbar.astro`, `Navbar.astro`, `Footer.astro`, `PageHeader.astro`, `About.astro`, `Facts.astro`, `Features.astro`, `Service.astro`, `Quote.astro`, `Team.astro`, `Testimonial.astro`
- Create: `src/pages/index.astro` (overwrite), `about.astro`, `service.astro`, `feature.astro`, `quote.astro`, `team.astro`, `testimonial.astro`, `contact.astro`, `404.astro`

**Interfaces:**
- `Base.astro` props: `active: 'home' | 'about' | 'service' | 'contact' | 'feature' | 'quote' | 'team' | 'testimonial' | '404'`
- `Navbar.astro` props: `active` (same values)
- `PageHeader.astro` props: `title: string`, `crumb: string`
- `Quote.astro` props: `page?: boolean` (true = quote page margin variant)
- `Team.astro` props: `full?: boolean` (true = 8 members, else 4)
- Other components: no props.

- [ ] **Step 1: Write generator**

`$S/generate.mjs`:

```js
import fs from 'node:fs';
import path from 'node:path';

const T = 'C:/Users/HamidKarim/OneDrive/ac-repair-website-template';
const OUT = 'C:/SaifzzWebsite/src';

const read = f => fs.readFileSync(`${T}/${f}`, 'utf8').replace(/\r\n/g, '\n');
const write = (f, s) => {
  fs.mkdirSync(path.dirname(`${OUT}/${f}`), { recursive: true });
  fs.writeFileSync(`${OUT}/${f}`, s.replace(/^[ \t]*<!-- [^\n]*? -->\n/gm, ''));
};
const fix = s => s
  .replace(/href="index\.html"/g, 'href="/"')
  .replace(/href="([a-z0-9]+)\.html"/g, 'href="/$1"')
  .replace(/(src|href|data-image-src)="(img|css|js|lib)\//g, '$1="/$2/');
const section = (file, name) => {
  const src = read(file);
  const s = src.indexOf(`<!-- ${name} Start -->`);
  const e = src.indexOf(`<!-- ${name} End -->`);
  if (s < 0 || e < 0) throw new Error(`${name} missing in ${file}`);
  return fix(src.slice(src.indexOf('\n', s) + 1, src.lastIndexOf('\n', e) + 1)).replace(/^ {4}/gm, '');
};
const fm = (lines = []) => (lines.length ? `---\n${lines.join('\n')}\n---\n` : '');

for (const [name, file] of [
  ['Topbar', 'index.html'], ['Footer', 'index.html'], ['About', 'index.html'], ['Facts', 'index.html'],
  ['Features', 'index.html'], ['Service', 'index.html'], ['Testimonial', 'index.html'],
]) write(`components/${name}.astro`, section(file, name));

const nav = section('index.html', 'Navbar')
  .replace(/<a href="\/(\w*)" class="nav-item nav-link(?: active)?">/g,
    (_, p) => `<a href="/${p}" class:list={["nav-item nav-link", { active: active === "${p || 'home'}" }]}>`)
  .replace(/<a href="\/(\w+)" class="dropdown-item">/g,
    (_, p) => `<a href="/${p}" class:list={["dropdown-item", { active: active === "${p}" }]}>`)
  .replace('class="nav-link dropdown-toggle"', 'class:list={["nav-link dropdown-toggle", { active: dropdown.includes(active) }]}');
write('components/Navbar.astro', fm([
  'const { active } = Astro.props;',
  'const dropdown = ["feature", "quote", "team", "testimonial", "404"];',
]) + nav);

write('components/PageHeader.astro', fm(['const { title, crumb } = Astro.props;']) +
  section('about.html', 'Page Header')
    .replace('>About Us</h1>', '>{title}</h1>')
    .replace('aria-current="page">About</li>', 'aria-current="page">{crumb}</li>'));

const quote = section('quote.html', 'Quote').replace(
  '<div class="container-fluid overflow-hidden px-lg-0" style="margin: 6rem 0;">',
  '<div class={page ? "container-fluid overflow-hidden px-lg-0" : "container-fluid overflow-hidden my-5 px-lg-0"} style={page ? "margin: 6rem 0;" : undefined}>');
write('components/Quote.astro', fm(['const { page = false } = Astro.props;']) + quote);

const team = section('team.html', 'Team');
const members = [...team.matchAll(/\n {12}<div class="col-lg-3 col-md-6/g)];
if (members.length !== 8) throw new Error(`expected 8 team members, got ${members.length}`);
const a = members[4].index + 1;
const b = team.lastIndexOf('        </div>\n    </div>\n</div>');
write('components/Team.astro', fm(['const { full = false } = Astro.props;']) +
  team.slice(0, a) + '{full && (\n<Fragment>\n' + team.slice(a, b) + '</Fragment>\n)}\n' + team.slice(b));

const index = read('index.html');
const head = fix(index.slice(0, index.indexOf('<body>') + '<body>\n'.length)).replace(
  /<link href="\/img\/favicon\.ico" rel="icon">/,
  '<link href="/favicon.svg" rel="icon" type="image/svg+xml">\n    <link href="/favicon.ico" rel="icon" sizes="32x32">\n    <link href="/apple-touch-icon.png" rel="apple-touch-icon">');
const nf = read('404.html');
const tail = fix(nf.slice(nf.indexOf('\n', nf.indexOf('<!-- Footer End -->')) + 1))
  .replace(/<script /g, '<script is:inline ');
write('layouts/Base.astro', fm([
  "import Topbar from '../components/Topbar.astro';",
  "import Navbar from '../components/Navbar.astro';",
  "import Footer from '../components/Footer.astro';",
  'const { active } = Astro.props;',
]) + head + section('index.html', 'Spinner') +
  '<Topbar />\n<Navbar active={active} />\n<slot />\n<Footer />\n' + tail);

const C = n => ({ imp: n, tag: `<${n} />` });
const pages = {
  index: { active: 'home', body: [{ raw: section('index.html', 'Carousel') }, C('About'), C('Facts'), C('Features'), C('Service'), C('Quote'), C('Team'), C('Testimonial')] },
  about: { active: 'about', header: ['About Us', 'About'], body: [C('About'), C('Facts'), C('Team')] },
  service: { active: 'service', header: ['Services', 'Services'], body: [C('Service')] },
  feature: { active: 'feature', header: ['Features', 'Features'], body: [C('Features')] },
  quote: { active: 'quote', header: ['Free Quote', 'Free Quote'], body: [{ imp: 'Quote', tag: '<Quote page />' }] },
  team: { active: 'team', header: ['Our Team', 'Our Team'], body: [{ imp: 'Team', tag: '<Team full />' }] },
  testimonial: { active: 'testimonial', header: ['Testimonial', 'Testimonial'], body: [C('Testimonial')] },
  contact: { active: 'contact', header: ['Contact Us', 'Contact'], body: [{ raw: section('contact.html', 'Contact') }] },
  404: { active: '404', header: ['404 Error', '404 Error'], body: [{ raw: section('404.html', '404') }] },
};
for (const [file, p] of Object.entries(pages)) {
  const imps = ["import Base from '../layouts/Base.astro';"];
  if (p.header) imps.push("import PageHeader from '../components/PageHeader.astro';");
  for (const s of p.body) if (s.imp) imps.push(`import ${s.imp} from '../components/${s.imp}.astro';`);
  const body = [
    p.header ? `<PageHeader title="${p.header[0]}" crumb="${p.header[1]}" />\n` : '',
    ...p.body.map(s => s.raw ?? `${s.tag}\n`),
  ].join('');
  write(`pages/${file}.astro`, fm(imps) + `<Base active="${p.active}">\n${body}</Base>\n`);
}
console.log('generated');
```

- [ ] **Step 2: Run generator and build**

```bash
node $S/generate.mjs && npm run build
```

Expected: `generated`, build succeeds, `dist/` has 9 `.html` files.

- [ ] **Step 3: Run compare**

Run: `node $S/compare.mjs`
Expected: `PASS` for all 9, exit 0.

If a page FAILs, read the printed context. Fix the cause in `generate.mjs` (not in generated files), re-run Step 2 and 3. Only add a normalization rule to `compare.mjs` if the difference is pure serialization (e.g. attribute quoting) and does not change rendering; note any such rule in the final report.

- [ ] **Step 4: Review Focus checks**

```bash
grep -lE '(src|href|data-image-src)="(img|css|js|lib)/' dist/*.html
```
Expected: no output (no relative asset paths left).

```bash
grep -c '<script src="https://code.jquery.com/jquery-3.4.1.min.js"></script>' dist/*.html
```
Expected: `1` for each of the 9 files.

```bash
grep -rn "is:inline\|class:list" dist/*.html
```
Expected: no output.

- [ ] **Step 5: Read generated files**

Read `src/layouts/Base.astro`, `src/components/Navbar.astro`, `src/components/Team.astro`, `src/components/Quote.astro`, `src/pages/index.astro`. Confirm no leftover marker comments, frontmatter correct, footer credit present in `Footer.astro`.

---

### Task 4: Serve check and initial commit

**Files:** none new.

- [ ] **Step 1: Preview routes**

Run `npm run preview` in background, then:

```bash
for r in / /about /service /feature /quote /team /testimonial /contact /does/not/exist; do
  printf "%s " "$r"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:4321$r"
done
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/favicon.ico
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:4321/css/style.css
```

Expected: 200 for all pages, 404 for `/does/not/exist` (body is the 404 page: check with `curl -s http://localhost:4321/does/not/exist | grep -c "Page Not Found"` → 1), 200 for favicon and css.

- [ ] **Step 2: Asset existence check**

```bash
grep -ohE '(src|href|data-image-src)="/(img|css|js|lib)/[^"]+"' dist/*.html | sed -E 's/.*="\/(.*)"/\1/' | sort -u | while read f; do [ -f "dist/$f" ] || echo "MISSING $f"; done
```

Expected: only `MISSING lib/owlcarousel/assets/owl.carousel.min.css` (template ships without it). Record in memory as an improvement-phase fix.

- [ ] **Step 3: Visual check**

Stop preview. Ask Hamid to run `npm run dev`, open http://localhost:4321 next to the original `index.html` from the template folder, and spot-check home, about, team, quote, contact, 404 on desktop and phone width (navbar collapse, dropdown, carousel, counters).

- [ ] **Step 4: Commit mirror**

```bash
git add .gitignore README.md TEMPLATE-LICENSE.txt astro.config.mjs package.json package-lock.json public src
git status --short | grep -v '^A ' 
git commit -m "Initial mirror of AirCon template"
```

Expected: status shows only `docs/` untracked. Commit created. `git log -1 --format=%B` contains no Co-Authored-By line.

---

### Task 5: Commit docs

- [ ] **Step 1: Commit spec and plan**

```bash
git add docs
git commit -m "Add site design spec"
```

---

### Task 6: Rename brand

**Files:**
- Modify: `src/components/Navbar.astro` (brand `<h1>`)
- Modify: `src/components/Footer.astro` (footer brand `<h1>`)
- Modify: `src/layouts/Base.astro` (`<title>`)

- [ ] **Step 1: Write failing check**

```bash
npm run build && grep -l "AirCon" dist/*.html
```
Expected: all 9 files listed.

- [ ] **Step 2: Replace**

In `Navbar.astro` and `Footer.astro`: `alt="">AirCon</h1>` → `alt="">SaifzzAircondElectrical</h1>`.
In `Base.astro`: `<title>AirCon - AC Repair Website Template</title>` → `<title>SaifzzAircondElectrical</title>`.

- [ ] **Step 3: Verify**

```bash
npm run build && grep -l "AirCon" dist/*.html; grep -c "SaifzzAircondElectrical" dist/index.html
```
Expected: first grep no output; count `3` (title, navbar, footer).

Ask Hamid to check navbar at phone width; if the long name overflows, note it for the improvement phase.

- [ ] **Step 4: Commit**

```bash
git add src
git commit -m "Rename brand to SaifzzAircondElectrical"
```

- [ ] **Step 5: Update memory**

Append session log to `project-saifzz-website.md`: commits made, owl CSS missing, next steps (Hamid pushes, Cloudflare Pages connect, improvements).
