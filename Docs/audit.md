# Apertio landing page — project audit

**Date:** 22 Oct 2026  
**Scope:** Full repository (`apertio-landing-page`), with emphasis on architecture, live UX, performance, accessibility, SEO, and engineering hygiene.  
**Method:** Source review of `src/`, config, lockfiles, and public assets. ESLint on non-ignored sources. No production deploy, Lighthouse run, or legal review of partner-mark usage.

---

## Executive summary

This is a **single-page Next.js 16 marketing site** for Apertio (visitors, access, and attendance). The live page has a coherent story, a distinct visual system, and several well-built sections (Visit types, partners marquee, architecture strip). It is not yet launch-hardened.

The biggest issues are structural, not visual:

1. **The page is almost entirely client-rendered** and pulls a vendor chart kit (~10.5k lines, 68 files) to draw two 7-point demo charts.
2. **Dead code and unused dependencies** from earlier iterations (globe, feature stack, shadcn `Button`, `cobe`, `@number-flow/react`) still ship in the tree and, in some cases, the install.
3. **Launch basics are missing:** Open Graph / social cards, branded favicon, analytics, a real lead capture path, tests, and CI.
4. **Accessibility is inconsistent.** Visit types is careful; Hero, Nav, charts, and most GSAP blocks are not.

Nothing in the repo looks like an application-security incident (no API, no secrets, no user-generated HTML). The risk is **shipping a heavy, incomplete marketing site** rather than a compromised one.

| Area            | Rating      | Notes                                              |
| --------------- | ----------- | -------------------------------------------------- |
| Product story   | Strong      | Clear pillars, honest “illustrative” analytics     |
| Visual design   | Strong      | Coherent type, glass, cobalt system                |
| Architecture    | Uneven      | Simple App Router, but client-heavy and over-vendored |
| Performance     | Weak        | Animation stack + chart kit + unoptimized logo     |
| Accessibility   | Mixed       | One excellent section, gaps everywhere else        |
| SEO / share     | Weak        | Title/description only                             |
| Security        | Low risk    | Static site; add headers before public launch      |
| DX / hygiene    | Weak        | Dual lockfiles, dead code, no tests/CI             |

---

## Project snapshot

| Item            | Value |
| --------------- | ----- |
| Stack           | Next.js **16.3.6** (App Router), React **19.2.8**, Tailwind CSS **4**, TypeScript strict |
| Package name    | `ultima` (does not match the Apertio brand) |
| Package manager | Declared `pnpm@10.33.0`; **both** `pnpm-lock.yaml` and `package-lock.json` are committed |
| Routes          | One: `/` (`src/app/page.tsx`) |
| Backend         | None — no `app/api`, middleware, env vars, or forms |
| Tests           | None |
| CI              | None (no `.github/`) |
| Lint            | `eslint-config-next` core-web-vitals + typescript; **entire `src/components/charts/` is ignored** |
| Source size     | ~94 TS/TSX files. Charts ~10.6k LOC; landing + app + lib ~3.3k LOC |

### Live page composition

`src/app/page.tsx` renders, in order:

1. `AnimatedBackground` — fixed aurora / grid / noise
2. `Nav`
3. `Hero`
4. `PartnersMarquee` — Honeywell, Suprema, Spectra, Spintly
5. `FeatureDeepDive` — four pillars, plus Visit types, Waypoint, Smart room booking, Admin dashboard
6. `AnalyticsSection` — mock KPIs + two charts
7. `HardwareWorkflow`
8. `ContactCTA` — `mailto:hello@apertio.app`
9. `Footer`

`Footer` is a Server Component. Almost every other landing surface is `"use client"`. `SmoothScroll` (Lenis + GSAP ScrollTrigger) wraps the whole tree in `layout.tsx`.

### Dead / leftover surfaces (not mounted)

| File | What it is |
| ---- | ---------- |
| `src/components/landing/FeatureStack.tsx` | Pinned GSAP “peel the stack” intro; would collide with `id="features"` |
| `src/components/landing/GlobeSection.tsx` | Pinned “multi-site reach” section |
| `src/components/landing/GlobeCanvas.tsx` | `cobe` WebGL globe |
| `src/components/ui/button.tsx` | shadcn Button; **not imported anywhere** |
| `public/{file,window,vercel,next,globe}.svg` | create-next-app leftovers |

---

## Architecture

```
src/app/layout.tsx          fonts, metadata, SmoothScroll
src/app/page.tsx            section assembly (RSC)
src/components/landing/     page sections
src/components/motion/      Lenis + GSAP background
src/components/charts/      vendored Bklit / visx kit (shadcn registry `@bklit`)
src/lib/                    cn, formatters, mock series, reduced-motion helper
```

**What works:** App Router layout is thin; path aliases (`@/*`) are consistent; TypeScript is strict; Tailwind v4 tokens in `globals.css` give a real design system (ink / cobalt / glass / visit-type accents).

**What does not scale:**

- Three animation runtimes on one page: **GSAP + ScrollTrigger**, **framer-motion**, and **motion** (`motion/react`, used by the chart kit). `framer-motion` and `motion` are the same library under two package names.
- `gsap.registerPlugin(...)` is repeated in every GSAP section instead of once at app bootstrap.
- `prefersReducedMotion()` in `src/lib/motion.ts` is a **one-shot `matchMedia` read**. It does not subscribe to changes, and it returns `false` during SSR.
- The Bklit chart kit is a product-analytics widget (phases, loading sweep, projections, brush, highlight segments). It is used here as a 7-day sparkline. That is a large mismatch.

`components.json` points at the `@bklit` registry (`https://ui.bklit.com/r/{name}.json`). Treat `src/components/charts/**` as **vendor code**, or replace it — do not grow product logic inside it.

---

## Findings

Severity: **High** = fix before a public launch. **Medium** = should land in the next pass. **Low** = cleanup.

### High

#### H1 — Client bundle is far too large for a marketing homepage

Almost every section is `"use client"`. The homepage therefore downloads GSAP, Lenis, Framer Motion, visx, d3-shape/array, and the full chart orchestrator before a visitor can read the hero.

The analytics block (`AnalyticsSection`) is the worst offender: two charts, seven points each, built on ~68 chart files.

**Fix direction:** Keep `page.tsx` as a Server Component (already is). Split below-the-fold sections with `next/dynamic`. Replace the visx kit with a small SVG/sparkline (the KPI sparklines in the same file are 25 lines and enough). Or statically render chart PNGs/SVGs for the landing.

#### H2 — Dual lockfiles; package identity is wrong

- `package.json` `"name": "ultima"`
- `"packageManager": "pnpm@10.33.0"` but `package-lock.json` is also committed and recently touched
- `clsx` + `tailwind-merge` **and** the new `cn` package (shadcn’s replacement) all installed
- `shadcn` CLI is a **runtime** dependency
- `@number-flow/react` is unused
- `cobe` is only referenced by unmounted `GlobeCanvas`
- `radix-ui` is only referenced by unmounted `Button`

Install drift between npm and pnpm will produce “works on my machine” bugs. Pick **pnpm**, delete `package-lock.json`, rename the package to `apertio-landing-page`, and prune unused deps.

#### H3 — Share / SEO / brand chrome is incomplete

`layout.tsx` sets `title` and `description` only. Missing for a public marketing site:

- Open Graph + Twitter card images and copy
- Canonical URL / metadataBase
- `robots.ts` / `sitemap.ts` (or `app/robots.ts` + `app/sitemap.ts`)
- JSON-LD `Organization` / `SoftwareApplication`
- Branded favicon / apple-touch-icon (current `src/app/favicon.ico` is the create-next-app default)
- `alt` on the logo is fine; OG image should not be the 590×681 cropped PNG as-is

Without this, Slack/LinkedIn/WhatsApp unfurls will look like a generic Next app.

#### H4 — Accessibility gaps on the primary path

**Mobile nav** (`Nav.tsx`): menu button has `aria-label` but no `aria-expanded`, no `aria-controls`, no Escape-to-close, no focus trap, no scroll lock. The panel is a sibling, not a disclosure that assistive tech can follow.

**Hero, Contact CTA, Nav CTA, Analytics cards** use `framer-motion` enter/hover animation with **no** `useReducedMotion`. WCAG 2.3.3 / 2.2.2: decorative motion should not run when the user asked it not to. GSAP sections check a snapshot; Framer blocks mostly do not.

**Charts:** the visx SVG is `aria-hidden`. There is no table, `aria-label`, or text summary of the 7-day series. The surrounding copy calls the data “illustrative,” which is good, but a screen reader still gets nothing.

**Skip link:** none. The header is `fixed`, so in-page anchors rely on Lenis `offset: -16`, which is tight against a 4.5rem nav (see M4).

**Visit types** is the exception: tablist, arrow keys, `aria-controls`, noscript fallback. Use that as the pattern.

#### H5 — Conversion path is a mailto

`ContactCTA` is a single `mailto:hello@apertio.app` link. There is no form, Cal.com/Calendly, or confirmation that the mailbox is monitored. For a B2B access-control pitch, a dead or unmonitored inbox is a lost deal, not a UX nit.

Also missing: privacy policy / terms (needed if you later add a form, analytics, or WhatsApp click-to-chat as the copy already promises).

---

### Medium

#### M1 — Animation runtime is over-specified and leaky

`SmoothScroll` enables Lenis, pipes scroll into ScrollTrigger, sets `gsap.ticker.lagSmoothing(0)`, and never restores lag smoothing on unmount. Hash-link clicks are intercepted globally.

GSAP `ScrollTrigger` instances are created in FeatureDeepDive, HardwareWorkflow, VisitTypes, Waypoint, SmartRoomBooking, AdminDashboard (and the dead FeatureStack / GlobeSection). Combined with Lenis pin/scrub, this is a known source of jank and iOS address-bar bugs.

**Fix direction:** One scroll system. Either Lenis **or** native CSS `scroll-behavior`, not both plus GSAP pin. Restore `lagSmoothing` in the effect cleanup. Register GSAP plugins once.

#### M2 — Logo is opted out of the image optimizer

`BrandLogo` sets `unoptimized` and `quality={100}` on a 171 KB PNG, and it is rendered **twice above the fold** (nav 52px + hero 380px) with `priority` on both.

Let `next/image` optimize; drop `unoptimized`. Consider a cropped/square mark for the nav so the 590×681 asset is not the header icon.

#### M3 — Copy and product flags still look like a working doc

- Visit types marks internal “gate-desk live list” as **Coming soon** (`soon: true`, comment: “still marked [CONFIRM] by product”).
- Feature copy is dense and implementation-specific (“PunchLog → DailyTimesheet”, “token charge after free-room check”, “ACS group IDs”). Fine for a technical buyer; heavy for a first-glance landing.
- Footer module links (`#visit`, `#access`, `#time`, `#risk`, `#workflow`) work because those ids exist inside FeatureDeepDive — but they are easy to break if that file is split.
- Dark-theme tokens exist for `.visit-types` only; the rest of the site is light-locked. Dead CSS.

Decide: shipping product vs. vision. Either remove “Coming soon” items or group them in a clearly labeled roadmap.

#### M4 — Fixed header vs. in-page anchors

Nav is `fixed` at `h-[4.5rem]`. SmoothScroll offset is `-16` px. Anchor targets (`#features`, `#contact`, …) will sit under the bar. Use `scroll-margin-top` on sections (e.g. `scroll-mt-24`) and/or a Lenis offset of ~80.

Mobile menu does not close on resize to desktop, and does not restore focus to the toggle.

#### M5 — Charts and mock data presentation

`mock-analytics.ts` builds dates with `new Date()` at module load (fine for a client island; would be a cache/SSR surprise if this file is ever imported from a Server Component).

KPI “7-day visitors = 1,219” is **not** the sum of `visitorSeries` (1,219 vs 1,219 actually: 142+168+151+190+176+204+188 = 1,219 — that one checks out). Keep a single source of truth so copy and series cannot drift.

The punch chart plots `punches` but the file also has `hours` — unused.

#### M6 — No tests, no CI, charts unlinted

`eslint.config.mjs` globally ignores `src/components/charts/**` and `shimmering-text.tsx`. A 10k-line dependency with no lint and no visual tests will regress silently.

At minimum: GitHub Action on PR (`pnpm lint`, `pnpm build`). Optionally Playwright for `/` smoke + reduced-motion.

#### M7 — Security headers and supply chain (pre-launch)

Attack surface is small, but a public Vercel deploy should still set:

- `Content-Security-Policy` (Google Fonts, `'self'`, no unexpected script)
- `Referrer-Policy`, `X-Content-Type-Options`, `Permissions-Policy` (camera/mic unused)

`next.config.ts` is empty — this is where those go (`headers()`).

`dangerouslySetInnerHTML` in VisitTypes injects a static `<style>` noscript fallback. Risk is negligible; prefer a `globals.css` `@media` / `.no-js` class if you ever touch that string dynamically.

`.gitignore` already ignores `.env*` — keep it that way.

---

### Low

#### L1 — Dead code and leftover assets

Remove or quarantine `FeatureStack`, `GlobeSection`, `GlobeCanvas`, unused `Button`, create-next-app SVGs. If globe/stack might return, move them to a branch, not `main`.

`formatCurrency` in `src/lib/format.ts` is unused.

#### L2 — README is still the create-next-app template

It still talks about Geist, `app/page.tsx` (actual path is `src/app/page.tsx`), and npm/yarn/bun. Replace with Apertio context, `pnpm dev`, and a short section map.

#### L3 — `cn` migration is half-done

`src/lib/utils.ts` still wraps `clsx` + `tailwind-merge`. `button.tsx` imports `cn` from `"cn"`. Complete `pnpm dlx shadcn@latest migrate cn` **or** drop the `cn` package and keep the local helper — not both.

#### L4 — Partners marquee duplicates DOM 4×

`[...partners, ...partners, ...partners, ...partners]` for an infinite CSS/motion loop. Two copies are enough for a `-50%` translate. Images themselves are small; this is noise, not a crisis.

#### L5 — Unused public / default Next assets

`public/file.svg`, `window.svg`, `vercel.svg`, `next.svg`, `globe.svg` are unused. `src/app/favicon.ico` should be replaced, not just kept because Next requires a file there.

---

## What is in good shape

- **Positioning** is clear: one people model across Visit, Access, Time, Risk; hardware stays source of record.
- **Visit types** is the best-built section: tokens, tab semantics, noscript, “Coming soon” honesty.
- **Partners marquee** respects `prefers-reduced-motion` via `useSyncExternalStore` (the right pattern — reuse it).
- **Contact and footer** include a partner-mark trademark line.
- **Analytics copy** says “illustrative” instead of faking a live product.
- **Type scale** (Syne / Instrument Sans / Geist Mono) is loaded with `display: "swap"`.
- **No secrets, no API keys, no server actions** in the tree.
- ESLint on first-party landing files is currently clean.

---

## Recommended order of work

### Before a public URL

1. Pick pnpm; delete `package-lock.json`; rename package; prune unused dependencies (`@number-flow/react`, and `cobe` / `radix-ui` if globe/button stay dead).
2. Add `metadataBase`, Open Graph, Twitter, canonical, branded favicon, sitemap/robots.
3. Replace mailto with a monitored path (form, HubSpot, or Calendly) and add privacy copy if you collect email.
4. Fix nav disclosure semantics, skip link, `scroll-margin-top`, and reduced-motion on Hero/Nav/CTA.
5. Add CSP + baseline security headers in `next.config.ts`.
6. Smoke CI: `pnpm lint` + `pnpm build`.

### Next design/engineering pass

1. Dynamically import below-the-fold client islands; replace Bklit charts with the existing sparkline approach or static art.
2. Collapse to one motion library (keep GSAP **or** Motion, not both plus Lenis pins).
3. Delete dead sections/assets; rewrite README.
4. Finish the `cn` migration; stop ignoring charts in ESLint if they stay, or vendor them under `src/vendor/`.
5. Decide fate of Globe / FeatureStack (restore as a deliberate section, or delete).

### Later

- Real analytics (Plausible/GA) behind a consent banner if you target the EU/UK.
- Playwright smoke + `prefers-reduced-motion` screenshot.
- Legal pages; partner-logo usage confirmation from Honeywell / Suprema / Spectra / Spintly.

---

## Inventory

### Dependencies (runtime) and whether the live page needs them

| Package | Live page? | Notes |
| ------- | ---------- | ----- |
| `next` / `react` / `react-dom` | Yes | |
| `tailwind-merge` / `clsx` / `cn` | Yes, redundant | Three class-name helpers |
| `framer-motion` | Yes | Landing |
| `motion` | Yes | Chart kit |
| `gsap` / `@gsap/react` | Yes | Many sections + Lenis bridge |
| `lenis` | Yes | Root smooth scroll |
| `lucide-react` | Yes | |
| `@visx/*` / `d3-array` / `d3-shape` | Yes, only via charts | Overkill |
| `cobe` | **No** | GlobeCanvas unmounted |
| `@number-flow/react` | **No** | |
| `radix-ui` | **No** | Button unmounted |
| `shadcn` | CLI only | Should be devDependency or dropped |
| `class-variance-authority` | Only Button | Unused on live page |
| `tw-animate-css` | CSS import | |

### Scripts today

```json
"dev": "next dev",
"build": "next build",
"start": "next start",
"lint": "eslint"
```

Missing: `typecheck` (`tsc --noEmit`), `test`, format.

---

## Out of scope / not verified

- Visual QA in a browser (layout at 375 / 768 / 1280, chart tooltip, Lenis on iOS).
- Whether `hello@apertio.app` exists and is monitored.
- Trademark clearance for partner logos.
- Lighthouse / Core Web Vitals on a production build.
- Whether the product claims (ACS adapters, WhatsApp, payroll CSV, etc.) match the actual Apertio app.

Those four should be the next audit pass once the High items above are closed.
