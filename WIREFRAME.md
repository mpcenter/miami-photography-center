# Miami Photography Center — Wireframe v2

## Stack final
- **Framework**: Astro (estático, en Vercel)
- **CMS contenido**: Sanity Studio (testimonios, equipo, precios, FAQ, copys editables)
- **Tienda**: Sanity (productos) + Stripe Checkout (pagos), sin suscripción mensual
- **Dominio**: Hostinger → DNS apuntando a Vercel
- **Idiomas**: EN (default) + ES (`/es/...`)
- **Animaciones**: GSAP + ScrollTrigger + Lenis
- **Color base**: negro + amarillo neón (del logo). Acento blanco.

## Por qué este stack
- Astro = mismo rendimiento que HTML plano + i18n + componentes + CMS-ready
- Sanity = cliente edita texto/precios/equipo en UI visual sin tocar código
- Sanity + Stripe = cliente añade productos al mismo CMS, paga solo por venta (sin mensualidad)
- Vercel = deploy automático cuando el cliente edita en Sanity o tú haces push

---

## 0. Jerarquía de producto (decidida)

```
PRIMARIO (hero del negocio)
└── Camera & Gear Repair

3 DESTACADOS (strip debajo del hero)
├── Annual Membership          ← NUEVO, no existe aún
├── Sensor Cleaning             ← sub-servicio destacado
└── On-Site Service

SECUNDARIO
└── Photo & Video Productions

UTILIDADES
├── Online Store                ← decidir: ¿qué se vende?
├── Contact / FAQ / About
└── Legal (Privacy, Terms)
```

---

## 1. Sitemap completo

### Sitio principal (Astro en `miamiphotographycenter.com`)

| Ruta | Tipo | Versión ES | Notas |
|---|---|---|---|
| `/` | Home marketing | `/es/` | Hero = Repair, strip 3 destacados |
| `/services` | Hub servicios | `/es/servicios` | Catálogo + chooser |
| `/repair` | Servicio principal SEO | `/es/repair` | Renombrar desde `/camera-and-gear-repair` |
| `/on-site` | Servicio SEO | `/es/on-site` | Renombrar desde `/on-site-services` |
| `/sensor-cleaning` | Servicio SEO | `/es/limpieza-sensor` | **NUEVA** página propia |
| `/membership` | Servicio SEO | `/es/membresia` | **NUEVA** |
| `/productions` | Servicio SEO | `/es/produccion` | **NUEVA** |
| `/about` | Team MPC | `/es/sobre-nosotros` | **NUEVA** |
| `/contact` | Contacto | `/es/contacto` | **NUEVA** |
| `/faq` | FAQ | `/es/faq` | **NUEVA** |
| `/privacy` `/terms` | Legal | `/es/...` | **NUEVA** |

### Landing pages de ads (nav minimal, 1 CTA)

| Ruta | Para qué campaña |
|---|---|
| `/lp/sensor-cleaning-miami` | Google/Meta ads "limpieza de sensor Miami" |
| `/lp/repair-canon-nikon` | Ads "reparación cámara Canon/Nikon" |
| `/lp/on-site-studio` | Ads B2B a estudios y productoras |
| `/lp/membership-pro` | Ads de membresía a fotógrafos pro |
| `/lp/productions-restaurants` | Ads producción foto a restaurantes |
| `/lp/[campaign-slug]` | Plantilla para nuevas campañas |

Plantilla landing: hero único + 1 CTA + form sticky + 3 trust signals + 3 testimonios + FAQ corta + CTA final. Sin menú o menú colapsado. Pixel de Meta + GA4 + conversión configurada.

### Tienda (Sanity + Stripe, dentro del mismo sitio Astro)

| Ruta | Función |
|---|---|
| `/store` | Catálogo con grid de productos, filtros |
| `/store/[slug]` | Detalle de producto + botón "Buy now" → Stripe Checkout |
| `/store/success` | Página post-compra |
| `/store/cancelled` | Si el usuario cancela el checkout |

**Cliente maneja:**
- Productos: añade/edita/borra en Sanity (foto, título, precio, stock, peso, dimensiones, descripción EN/ES)
- Cobros y órdenes: dashboard de Stripe (notificaciones por email, recibos automáticos)

**Tú configuras (una vez):**
- Webhook de Stripe → Sanity para descontar stock al vender
- Shipping rules en Stripe (tarifa plana inicial o por peso)
- Impuestos automáticos (Stripe Tax para USA — ~$10/mo solo si se activa)

**Costo recurrente:** $0. Solo 2.9% + 30¢ por venta.

### CMS (Sanity Studio en `cms.miamiphotographycenter.com`)

Schemas que voy a crear en Sanity:
- `testimonial` (nombre, foto, texto, rating, servicio)
- `teamMember` (nombre, rol, foto, bio, EN/ES)
- `service` (precios, includes, target, EN/ES)
- `faqEntry` (pregunta, respuesta, categoría, EN/ES)
- `pageCopy` (textos de hero/CTA editables sin tocar código, EN/ES)
- `membershipTier` (nombre, precio, beneficios, EN/ES)
- `siteSettings` (teléfono, email, dirección, horario, redes)

El cliente edita en Sanity → Vercel rebuilda → cambios live en ~30s.

### Nav principal (con i18n + store)
```
[Logo MPC]   Repair · On-Site · Membership · Productions · Store ↗ · Contact   [EN/ES]   [Request Repair →]
```

---

## 2. HOME `/` — wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ NAV (sticky, fondo negro, logo amarillo)                    │
├─────────────────────────────────────────────────────────────┤
│ HERO — Camera & Gear Repair                                 │
│  ┌─────────────────────────┬─────────────────────────────┐  │
│  │ H1: Precision Repairs.   │  Imagen producto sfx30.webp │  │
│  │ Done In-House.           │  (cámara transparente flotante)│
│  │                          │  + parallax sutil           │  │
│  │ Sub: Digital + analog.   │                             │  │
│  │ 6-month warranty.        │                             │  │
│  │                          │                             │  │
│  │ [Request Repair →]       │                             │  │
│  │ [How it works]           │                             │  │
│  └─────────────────────────┴─────────────────────────────┘  │
│  ↓ Scroll indicator                                          │
├─────────────────────────────────────────────────────────────┤
│ STRIP 3 DESTACADOS                                           │
│  ┌──────────┬──────────┬──────────┐                          │
│  │ MEMBERSHIP│ SENSOR   │ ON-SITE  │                         │
│  │ Annual   │ CLEANING │ SERVICE  │                          │
│  │ Plan     │ 30 min   │ Mobile   │                          │
│  │ →        │ →        │ →        │                          │
│  └──────────┴──────────┴──────────┘                          │
│  Anim: stagger entrance al hacer scroll                      │
├─────────────────────────────────────────────────────────────┤
│ STORY — "We bring precision to your doorstep"               │
│  (ya existe — mantener)                                      │
├─────────────────────────────────────────────────────────────┤
│ COVERAGE — Mapa Florida + "From West Palm to the Keys"     │
│  (ya existe — mantener)                                      │
├─────────────────────────────────────────────────────────────┤
│ BRANDS — Nikon · Canon · Sony · Fujifilm · Panasonic ·     │
│          Blackmagic (logos en strip animado)                 │
├─────────────────────────────────────────────────────────────┤
│ PROCESS — Ship it. We'll handle the rest. (3 pasos)        │
├─────────────────────────────────────────────────────────────┤
│ PRODUCTIONS — Banda secundaria, 5 tiles compactos          │
│  Food · Product · Portraits · Events · Nature              │
│  CTA: Explore productions →                                  │
├─────────────────────────────────────────────────────────────┤
│ TEAM MPC — "More than a business..." + foto Orlando        │
│  CTA: Meet the team →                                        │
├─────────────────────────────────────────────────────────────┤
│ REVIEWS — Carousel testimonios                              │
│  CTA: Share your experience                                  │
├─────────────────────────────────────────────────────────────┤
│ FINAL CTA — "Ready when you are."                          │
│  [Request Repair]  [Book On-Site]                           │
├─────────────────────────────────────────────────────────────┤
│ FOOTER — Address, phone, email, social, legal              │
└─────────────────────────────────────────────────────────────┘
```

**Cambios vs lo actual:**
- Hero se centra en **Camera & Gear Repair** (es lo principal), no genérico
- Las 4 cards actuales → **strip de 3 destacados** (sale Repair de ahí porque ya es el hero, entra Membership)
- Productions baja a banda secundaria
- Team MPC se mueve a Home como teaser (link a /about)

---

## 3. CAMERA & GEAR REPAIR `/camera-and-gear-repair` — wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ NAV                                                          │
├─────────────────────────────────────────────────────────────┤
│ HERO PAGE                                                    │
│  Breadcrumb: Home > Services > Camera & Gear Repair         │
│  H1: Camera & Gear Repair                                    │
│  H2: Precision Repairs, Done In-House by Experts            │
│  [Start a Repair Request →]                                  │
├─────────────────────────────────────────────────────────────┤
│ 3 BLOQUES DE SERVICIO                                        │
│  ┌────────────────────┬────────────────────┬──────────────┐  │
│  │ CAMERA REPAIRS     │ LENS REPAIRS       │ ADDITIONAL   │  │
│  │ • DSLR/Mirrorless  │ • Focus/zoom       │ • Flashes    │  │
│  │ • 35mm/Medium fmt  │ • Mount/contacts   │ • Tripods    │  │
│  │ • Diagnostics      │ • Internal optics  │ • File rec.  │  │
│  │ • Components       │                    │ • Sensor cln │  │
│  └────────────────────┴────────────────────┴──────────────┘  │
├─────────────────────────────────────────────────────────────┤
│ TRUST STRIP — Logos marcas + "6-month warranty" + "10+ yrs"│
├─────────────────────────────────────────────────────────────┤
│ FORMULARIO DIAGNÓSTICO (sticky right column en desktop)     │
│  Lado izq: instructions + tiempos esperados                 │
│  Lado der: form                                              │
│   - Full Name *                                              │
│   - Location (area)                                          │
│   - Phone *                                                  │
│   - Email *                                                  │
│   - Equipment Brand & Model                                  │
│   - Description of Issue *                                   │
│   - Number of Items *                                        │
│   - [Send Request]                                           │
│  ↓ "You will receive an email with shipping instructions"   │
├─────────────────────────────────────────────────────────────┤
│ FAQ ACORDEÓN (las 5 preguntas del doc)                      │
├─────────────────────────────────────────────────────────────┤
│ CROSS-SELL                                                   │
│  "Need it done at your location? → On-Site Services"        │
│  "Service it regularly? → See Annual Membership"            │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. ON-SITE SERVICES `/on-site-services` — wireframe

```
┌─────────────────────────────────────────────────────────────┐
│ HERO                                                         │
│  H1: On-Site Services                                        │
│  H2: Professional Maintenance — Wherever You Are            │
│  CTA: [Book On-Site Visit →]                                 │
├─────────────────────────────────────────────────────────────┤
│ 5 SERVICIOS ON-SITE (cards verticales o acordeón)           │
│  1. Professional Sensor Cleaning On-Site (30 min)           │
│     - 1 cámara + 1 lente + 1 accesorio                       │
│     - Firmware update                                        │
│     - Travel fee según área                                  │
│  2. On-Site Diagnostics & Equipment Pickup                  │
│  3. Events, Conferences & Photographer Meetups              │
│     (min 20 items)                                           │
│  4. Pickup & Delivery for Advanced Repairs                  │
│  5. Custom Maintenance Plans (link → Membership)            │
├─────────────────────────────────────────────────────────────┤
│ MAP — Cobertura South Florida                               │
│  "West Palm → Keys" zonas marcadas                          │
├─────────────────────────────────────────────────────────────┤
│ BOOKING FORM (similar al de repair pero con campos:)        │
│  - Service type (dropdown)                                  │
│  - Address                                                   │
│  - Preferred date                                            │
│  - Equipment count                                           │
├─────────────────────────────────────────────────────────────┤
│ CROSS-SELL: Membership (visitas recurrentes con descuento)  │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. MEMBERSHIP `/membership` — wireframe (NUEVA)

```
┌─────────────────────────────────────────────────────────────┐
│ HERO                                                         │
│  H1: MPC Annual Membership                                   │
│  H2: Your gear, maintained year-round.                      │
│  Sub: One plan. Scheduled care. Priority service.           │
│  [Become a Member →]                                         │
├─────────────────────────────────────────────────────────────┤
│ ¿QUÉ INCLUYE? (checklist visual)                            │
│  ✓ X sensor cleanings per year                              │
│  ✓ Y on-site visits per year                                │
│  ✓ Priority repair queue                                    │
│  ✓ Volume discount on additional repairs                    │
│  ✓ Annual gear condition report                             │
│  ✓ Firmware updates                                         │
├─────────────────────────────────────────────────────────────┤
│ TIERS (si aplica) o PRICING ÚNICO                           │
│  ┌──────────────┬──────────────┬──────────────┐             │
│  │ SOLO         │ STUDIO       │ INSTITUTION  │             │
│  │ $X/year      │ $Y/year      │ Custom       │             │
│  │ • 1 cuerpo   │ • 3 cuerpos  │ • 10+ items  │             │
│  │ • 2 lentes   │ • 5 lentes   │ • Schools    │             │
│  └──────────────┴──────────────┴──────────────┘             │
│  ⚠️ FALTA INFO: definir tiers, precios y qué incluyen       │
├─────────────────────────────────────────────────────────────┤
│ COMPARISON: Single service vs Membership                    │
│  Tabla mostrando ahorro                                      │
├─────────────────────────────────────────────────────────────┤
│ TARGETS: Photographers · Studios · Schools · Productions    │
├─────────────────────────────────────────────────────────────┤
│ FAQ específica de membership                                │
├─────────────────────────────────────────────────────────────┤
│ FORM: Apply for Membership                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. PHOTO & VIDEO PRODUCTIONS `/photo-video-productions` — wireframe (NUEVA)

```
┌─────────────────────────────────────────────────────────────┐
│ HERO                                                         │
│  H1: Photo & Video Productions                              │
│  H2: Creative Visual Services for Brands & Professionals    │
│  [Plan Your Production →]                                    │
├─────────────────────────────────────────────────────────────┤
│ 5 SERVICIOS (cards numeradas 01-05)                         │
│  01 Food & Restaurant Photography                           │
│  02 Product Photography                                     │
│  03 Professional Portraits                                  │
│  04 Event Coverage                                          │
│  05 Nature & Landscape Photography                          │
│                                                              │
│  Cada card: imagen + descripción + "Perfect for" + Includes │
├─────────────────────────────────────────────────────────────┤
│ "Looking to elevate your brand?" CTA grande                 │
├─────────────────────────────────────────────────────────────┤
│ BRIEF FORM                                                   │
│  - Service type · Date · Location · Budget range · Brief    │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. CONTACT `/contact` — wireframe (NUEVA)

```
┌─────────────────────────────────────────────────────────────┐
│ HERO simple                                                  │
│  H1: Get in Touch                                            │
├─────────────────────────────────────────────────────────────┤
│ 2 COLUMNAS                                                   │
│  IZQ                          DER                            │
│  📞 +1 786 763 2091           Form:                         │
│  ✉ service@miamiphoto...      - Full Name                   │
│  📍 3911 SW 27th St           - Email                       │
│     West Park, FL 33023       - Message                     │
│                                - [Send]                      │
│  Hours (definir)                                             │
│  Social: IG / FB / TikTok                                   │
├─────────────────────────────────────────────────────────────┤
│ MAP embed (Google Maps de la dirección)                     │
├─────────────────────────────────────────────────────────────┤
│ CTA secundario: "Need a repair? Use this form instead →"   │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. FAQ `/faq` — wireframe (NUEVA)

Acordeón con las 5 preguntas del doc + sumar:
- ¿Cómo envío mi gear? (shipping instructions)
- ¿Cuánto cuesta la membership?
- ¿Hacen presupuestos sin compromiso?
- ¿Garantía qué cubre?

---

## 9. ABOUT / TEAM `/about` — wireframe (NUEVA)

```
HERO
 H1: Team MPC
 Sub: More than a business — a dedicated team.

STORY
 (el texto largo del doc)

CEO
 Foto + nombre Orlando Untoria + bio corta

TEAM ROLES (grid)
 - MA in Professional Photography
 - Technician Specialized in Audiovisual Equipment
 - Director of Photography and Video Production
 - Specialist in Visual Content Creation
 - Consultant in Audiovisual Solutions

EXPERIENCE timeline
 2011-present, Visual Works Studio
 etc.

VALUES strip
 "We don't just repair cameras. We restore confidence."

CTA → Repair / On-Site / Membership
```

---

## 10. Decisiones tomadas (v2)

| Tema | Decisión |
|---|---|
| Stack | Astro estático en Vercel |
| CMS | Sanity Studio (sitio) + Shopify (tienda) |
| Tienda | Shopify en `store.` subdominio, envío USA |
| Membership | Diseñamos tiers desde cero (propuesta abajo) |
| Sensor Cleaning | Página propia `/sensor-cleaning` (para ads + SEO) |
| Idioma | Bilingüe EN/ES con i18n de Astro |
| Landing pages | `/lp/[campaign]` por cada ad, nav minimal, 1 CTA |
| Pagos servicios | Stripe para membership (próxima fase) |
| Reservas | Form de solicitud por ahora; Calendly fase 2 |

### Membership tiers (propuesta inicial, ajustamos con el cliente)

```
SOLO — $XX/year (fotógrafo individual)
 ✓ 2 limpiezas de sensor / año
 ✓ 1 visita on-site / año
 ✓ Prioridad en cola de reparación
 ✓ 10% descuento en reparaciones adicionales
 ✓ Hasta 1 cuerpo + 2 lentes

STUDIO — $XXX/year (estudio o productora chica)
 ✓ 6 limpiezas de sensor / año
 ✓ 4 visitas on-site / año
 ✓ Prioridad alta + diagnóstico gratis
 ✓ 15% descuento en reparaciones
 ✓ Hasta 3 cuerpos + 5 lentes
 ✓ Reporte anual de condición de equipo

INSTITUTION — Custom (escuelas, productoras grandes)
 ✓ Limpiezas ilimitadas en visitas programadas
 ✓ On-site mensual incluido
 ✓ Soporte técnico directo
 ✓ Plan personalizado por # de items
 ✓ Facturación corporativa
```

⚠️ Precios placeholder — los definimos con el cliente antes de publicar.

---

## 11. Animaciones (plan)

Stack: **GSAP + ScrollTrigger + Lenis** (ya cargados en `script.js` probablemente — verificar).

Por sección:
- **Hero**: text reveal stagger + parallax sutil del producto
- **Strip 3 destacados**: cards stagger fade-up al hacer scroll
- **Coverage map**: trazo SVG dibujándose
- **Brands**: marquee infinito horizontal
- **Process**: línea conectora dibujándose al scroll
- **Reviews**: carousel con drag inertia
- **Hover states**: micro-interacciones en cards (lift + glow amarillo)
- **Cursor**: opcional, custom dot/circle

Respetar `prefers-reduced-motion`: siempre.

---

## 12. Plan de ejecución por fases

### Fase 0 — Setup (1-2 días)
- [ ] Crear proyecto Astro nuevo en el repo (mantiene el código actual como referencia)
- [ ] Configurar i18n (EN/ES)
- [ ] Migrar CSS actual a sistema de tokens (colores, tipos, espaciados)
- [ ] Cargar GSAP + ScrollTrigger + Lenis como librerías base
- [ ] Setup Sanity Studio (schemas iniciales)
- [ ] Setup Shopify trial + dominio `store.`
- [ ] Configurar Vercel: deploy automático + webhook de Sanity

### Fase 1 — Páginas core (semana 1-2)
- [ ] Home rediseñada (jerarquía nueva: Repair hero + 3 destacados)
- [ ] `/repair` (la página fuerte)
- [ ] `/on-site`
- [ ] `/sensor-cleaning` (nueva)
- [ ] `/membership` (nueva, con tiers placeholder)

### Fase 2 — Soporte (semana 2-3)
- [ ] `/productions` (nueva)
- [ ] `/about` (Team MPC, nueva)
- [ ] `/contact` (con form a email + Sanity)
- [ ] `/faq` (alimentada por Sanity)
- [ ] `/privacy` `/terms`

### Fase 3 — Landing pages de ads (semana 3)
- [ ] Plantilla base `/lp/[slug]` con nav minimal
- [ ] 5 landings iniciales (las que están arriba)
- [ ] Pixel Meta + GA4 + eventos de conversión

### Fase 4 — Tienda (semana 3-4)
- [ ] Schema `product` en Sanity (foto, precio, stock, peso, dimensiones, descripción EN/ES)
- [ ] Páginas `/store` (grid) y `/store/[slug]` (detalle)
- [ ] Integración Stripe Checkout (server endpoint en Vercel Function)
- [ ] Webhook Stripe → Sanity para descontar stock
- [ ] Shipping rules iniciales (flat o por peso/zona)
- [ ] Páginas `/store/success` y `/store/cancelled`
- [ ] Subir 5-10 productos demo con el cliente

### Fase 5 — Versión ES (semana 4)
- [ ] Traducción de todo el contenido (Sanity ya tiene los campos)
- [ ] QA bilingüe

### Fase 6 — Lanzamiento
- [ ] DNS de Hostinger → Vercel + Shopify
- [ ] SSL, redirects de URLs viejas si existen
- [ ] Sitemap + robots actualizados
- [ ] Handoff al cliente: video tutorial de Sanity + Shopify

---

## Siguiente paso inmediato

1. Tú revisas este wireframe v2 y validas que la arquitectura te cuadra
2. Confirmas los precios de Membership (o decimos "TBD" y arrancamos con placeholders)
3. Arranco la **Fase 0**: crear el proyecto Astro y migrar el sistema visual
