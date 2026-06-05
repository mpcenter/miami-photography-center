# Miami Photography Center — New Website Proposal

> Apple-inspired gallery aesthetic with scrollytelling, parallax, and 3D hover.
> Zero-build static site, deployable to Vercel.

---

## What's here

```
/
├── index.html        ← Home (full proposal, single H1, schema, all SEO fixed)
├── styles.css        ← Apple design tokens + components
├── script.js         ← GSAP scrollytelling + parallax + 3D tilt
├── favicon.svg       ← Inline SVG favicon (no .jpg)
├── robots.txt        ← Proper crawl directives + sitemap
├── sitemap.xml       ← Prioritized sitemap (1.0 home, 0.9 services, etc.)
├── vercel.json       ← Cache headers + security headers
└── code insp/        ← Reference (Apple design tokens — untouched)
```

## Design system

Pulled from `code insp/DESIGN.md`:

- **Canvas**: `#f5f5f7` Fog · `#ffffff` Pure White · `#1d1d1f` Apple Ink
- **Accent**: `#0071e3` Electric Blue — reserved for the conversion button only
- **Type**: SF Pro Display 600 for headlines (44–96px, negative tracking) · SF Pro Text 17–21px body
- **Radius**: 28px on cards/images, 980px pills, 999px chips
- **Elevation**: Flat. No shadows. Depth comes from surface progression and whitespace.

## Animation system

Three techniques, each used where it earns the screen real estate:

1. **Pinned scrollytelling** — `.story` section pins for 4 viewport-heights as 4 scenes swap text + image (precision → sensor cleaning → repair → ship-it). Triggered with GSAP ScrollTrigger.
2. **Parallax** — Hero ring + image move at different speeds. Coverage section background drifts behind the headline.
3. **3D hover tilt** — Service cards (`[data-tilt]`) follow the cursor with `perspective(1500px) rotateX/Y(±8deg)`.

Everything respects `prefers-reduced-motion`.

## SEO — what we fixed from the audit

| Issue (old site) | Fixed here |
| --- | --- |
| Title without "camera repair" or "Miami" | `Camera Repair Miami \| Sensor Cleaning & On-Site Service — MPC` (60 char) |
| Meta description 89 char, generic | 160 char with keywords + CTA |
| 4 H1s on home | **Single H1**: "Camera Repair, Engineered with Precision." |
| Only `WebSite` schema | `LocalBusiness` + `Service` + `OfferCatalog` + `AggregateRating` + `areaServed` |
| `og:image:alt` empty | Filled with descriptive text |
| `.jpg` favicon | SVG favicon |
| No `Service` schema | Per-service entries with `OfferCatalog` |
| No geo coverage | `areaServed` array (Miami, Fort Lauderdale, West Palm, Boca, Keys) |
| Sitemap with uniform priority | Differentiated: 1.0 home / 0.9 services / 0.2 legal |

## How to preview locally

No build step. Any static server works:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .

# Or open index.html directly
open index.html
```

## Deploy to Vercel

```bash
# Login (one-time)
npx vercel login

# Preview deploy
npx vercel

# Production
npx vercel --prod
```

`vercel.json` already includes:
- Cache headers for static assets (1 year, immutable)
- HSTS preload
- Security headers (X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- `cleanUrls` so `/services` works without `.html`

## Next pages to build

This is a **home proposal**. Once approved, we replicate the system for:

1. `/services` — overview grid (use the `.card` component)
2. `/camera-and-gear-repair` — landing + repair request form
3. `/on-site-services` — coverage map + mobile process
4. `/photo-and-video-productions` — portfolio gallery
5. `/send-your-equipment` — 3-step ship-in flow
6. `/online-store` — product grid with `Product` schema
7. `/faqs` — accordion with `FAQPage` schema
8. `/contact` — form + map embed
9. `/brands/{canon|nikon|sony|fujifilm|leica|panasonic}` — 6 brand landings (high-value SEO)
10. `/locations/{miami|fort-lauderdale|west-palm-beach|keys}` — 4 geo landings

## Notes for the client meeting

- **Images are placeholders** (Unsplash) — replace with real photos of the workshop, technicians, gear close-ups, and Miami coverage area.
- **Aggregate rating in schema is a placeholder** (4.9 / 47) — must reflect real Google Business Profile reviews before publishing.
- **Pricing**: I included "From $49" for sensor cleaning (matches competitor benchmark). Confirm real entry-level prices before going live.
- **Color trial**: the home leans Apple-neutral. If the brand wants more identity, we can introduce a single warm accent (amber / warm gray) without breaking the system.
- **Phone format**: link uses `tel:+17867632091` (E.164) for click-to-call across devices.

## Lighthouse targets (proposal)

| Metric | Target |
| --- | --- |
| Performance | ≥ 95 |
| Accessibility | ≥ 100 |
| Best Practices | 100 |
| SEO | 100 |
| LCP | < 2.0 s |
| CLS | < 0.05 |
| INP | < 200 ms |
