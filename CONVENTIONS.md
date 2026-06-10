# MPC Astro — Conventions for page builders

Project root: this repo. Astro 5 static site, deployed on Vercel.

## Pattern (MANDATORY — read `src/components/pages/HomePage.astro` first as the reference)

1. Each page = ONE component in `src/components/pages/XxxPage.astro`:
   ```astro
   ---
   import Base from '../../layouts/Base.astro';
   import { localePath, type Locale } from '../../lib/i18n';
   interface Props { locale: Locale }
   const { locale } = Astro.props;
   const p = (path: string) => localePath(locale, path);
   const t = locale === 'es' ? { /* full Spanish content */ } : { /* full English content */ };
   ---
   <Base locale={locale} title={t.title} description={t.description}>
     ...sections...
   </Base>
   ```
2. Two thin route files render it:
   - `src/pages/<slug>.astro` → `<XxxPage locale="en" />`
   - `src/pages/es/<slug>.astro` → `<XxxPage locale="es" />`
3. ES content: natural, neutral Latin-American Spanish. Translate ALL copy, not just headings.

## Layout & shared pieces (DO NOT EDIT THESE FILES)
- `src/layouts/Base.astro` — provides `<head>` SEO (title/description/canonical/hreflang/OG), Nav, Footer, GSAP+ScrollTrigger+Lenis CDN, `/scripts/main.js`. Props: `locale`, `title`, `description`, `minimal` (landing mode: no nav links, no footer columns), `ogImage`.
- Inject page-specific `<script>` / JSON-LD via `slot="head"` (add `is:inline` to raw scripts).
- DO NOT edit: `Base.astro`, `Nav.astro`, `Footer.astro`, `global.css`, `main.js`, `package.json`, `astro.config.mjs`, `vercel.json`, other agents' pages.

## CSS
- Global classes available (see `src/styles/global.css`): `.btn .btn--primary .btn--ghost .btn--lg`, `.eyebrow`, `.page-hero .page-hero__inner .page-hero__title .page-hero__lede`, `.breadcrumbs`, `.services .services__grid .services__grid--three .card .card--accent .card__inner/__index/__title/__copy/__media/__link`, `.process .process__steps .process__step .process__num`, `.stats .stats__grid .stats__item .stats__num .stats__label`, `.reviews .quote`, `.cta .cta__inner .cta__title .cta__copy .cta__actions`, `.coverage` (dark parallax band), `.brands` (marquee), `.form .form__row .form__field .form__note`.
- Page-specific styles: either copy a legacy CSS file to `src/styles/<name>.css` and `import '../../styles/<name>.css';` in the component frontmatter, or add a `<style is:global>` block at the END of the component. Prefix new classes with a page namespace (e.g. `.members-`, `.store-`, `.lp-`).
- Design language: Apple-style. Fog canvas `#f5f5f7` background, ink `#1d1d1f` dark sections, electric blue `#0071e3` accents, big display headings (clamp), 28px card radius, generous whitespace. Match it.

## Animations (already wired in main.js — just use attributes)
- `data-anim="fade-up"` on any element → fade-up entry on scroll.
- `data-tilt` on `.card` → 3D hover tilt.
- `data-parallax-bg` on a `.coverage__parallax` div → scroll parallax.
- `.stats__num` with `data-count="10" data-suffix="+"` → counts up on scroll.
- Page-specific JS (e.g. accordion): copy legacy JS to `public/scripts/<name>.js` and load via `<script src="/scripts/<name>.js" defer is:inline slot="head"></script>`. Guard everything by element existence.

## Forms
- All forms: `<form class="form js-demo-form" action="#" method="POST" data-success="...">` — main.js intercepts submit and shows a success note (demo build; real backend wired at launch). `data-success` per locale.
- Use `.form__row` (2-col) and `.form__field` with `<label>` + required attrs.

## Links
- Internal links ALWAYS via `p('/route')`. New route names: `/repair`, `/on-site`, `/sensor-cleaning`, `/membership`, `/productions`, `/services`, `/about`, `/contact`, `/faq`, `/store`, `/privacy`, `/terms`. (Old names like `/camera-and-gear-repair` are redirected — never link them.)
- Phone: `tel:+17867632091` → display `(786) 763-2091`. Email: `service@miamiphotographycenter.com`. Address: 3911 SW 27th St, West Park, FL 33023.

## Content sources
- `legacy/*.html` — current pages to port (markup + copy).
- `/Users/orestesbaratuti/001_MCP/mpc.md` — raw copy of the old live site (FAQs, on-site service details, productions list, about text).
- `WIREFRAME.md` — approved structure per page.
- Images: Unsplash URLs (`?w=1200&q=80&auto=format&fit=crop`), always with `loading="lazy" decoding="async"` except heroes.

## Verification
- Do NOT run `npx astro build` (it races with other agents). Syntax-check your work by reading it carefully; the integrator runs the build.
