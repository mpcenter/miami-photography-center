# Guía del panel de administración — Miami Photography Center

**Panel:** https://miamiphotographycenter.vercel.app/admin

---

## Cómo funciona el sistema (la dinámica completa)

```
   CLIENTE                    ALMACÉN                   PUBLICACIÓN
┌─────────────┐   guarda   ┌──────────────┐  detecta  ┌─────────────┐
│   /admin    │ ─────────► │    GitHub    │ ────────► │   Vercel    │
│ (Sveltia    │   cambio   │ (repositorio │   cambio  │ reconstruye │
│  CMS)       │            │  del sitio)  │           │  el sitio   │
└─────────────┘            └──────────────┘           └─────────────┘
                                                            │
                                              ~60 segundos  ▼
                                              cambio visible en la web
```

El cliente **nunca toca código**. Edita en un panel visual, guarda, y en
~1 minuto el cambio está publicado. No hay base de datos que mantener ni
mensualidad que pagar: los productos viven como archivos en el repositorio.

## Qué puede editar el cliente hoy

**Tienda — Productos** (`/admin` → "Tienda — Productos"):
- ➕ Crear producto nuevo: nombre (ES/EN), precio, categoría, foto, descripción, condición, especificaciones
- ✏️ Editar cualquier producto existente
- 🗑️ Eliminar productos
- 📷 Subir fotos desde su computadora (van a la librería de medios del sitio)

Los campos bilingües están etiquetados (Español / Inglés). La validación del
slug evita URLs rotas. El cliente no puede romper el diseño: solo edita datos.

## Acceso del cliente — 2 opciones

### Opción A — Token personal (funciona HOY, sin instalar nada)

⚠️ **Importante:** en la pantalla de login NO uses el botón "Sign In with
GitHub" (ese requiere el proxy OAuth de la Opción B y da "Not Found"). Usa el
botón **"Sign In Using Access Token"**.

1. El cliente crea una cuenta gratuita en github.com (o usas la tuya al inicio).
2. Tú lo invitas como colaborador del repositorio
   `oreste2b/miami-photography-center` (Settings → Collaborators).
3. Genera un token en GitHub → Settings → Developer settings →
   **Fine-grained tokens** → Generate new token:
   - Repository access: **Only select repositories** → `miami-photography-center`
   - Permissions → Repository permissions → **Contents: Read and write**
   - (alternativa: un **classic token** con el scope `repo`)
4. En `/admin` pulsa **"Sign In Using Access Token"**, pega el token en el
   diálogo y "Sign In". El navegador lo recuerda; no hay que repetirlo.

### Opción B — Botón "Entrar con GitHub" sin tokens (recomendada al lanzar)

Setup único de ~15 min por tu parte:
1. Despliega el worker gratuito [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)
   en Cloudflare Workers (botón "Deploy to Cloudflare Workers" del repo).
2. Crea una GitHub OAuth App (Settings → Developer settings → OAuth Apps)
   con callback `https://<tu-worker>.workers.dev/callback`.
3. Pon el Client ID/Secret como variables del worker y añade en
   `public/admin/config.yml`:
   ```yaml
   backend:
     base_url: https://<tu-worker>.workers.dev
   ```
Después de eso el cliente solo pulsa un botón y autoriza — sin tokens.

## Flujo típico: cambiar el precio de una cámara

1. Cliente abre `/admin` → Tienda — Productos → "Canon EOS R6 — Body"
2. Cambia Precio: 1499 → 1399 → **Guardar** (botón Save → Publish)
3. Sveltia hace el commit a GitHub automáticamente
4. Vercel detecta el commit y reconstruye (~60 s)
5. El precio nuevo aparece en `/store` y `/es/store`

## Demo local sin login (para enseñárselo al cliente)

En tu máquina: `npm run dev` y abre `http://localhost:4321/admin` →
**"Work with Local Repository"** → selecciona la carpeta del proyecto.
Editas productos en vivo contra los archivos locales, sin GitHub.

## Cómo se extiende (trabajo futuro tuyo)

El panel crece añadiendo colecciones en `public/admin/config.yml`:
- **Testimonios** de la home
- **Precios** de la tabla de servicios
- **Equipo** (página About)
- **FAQs**
Cada una sigue el mismo patrón que la colección de productos (archivos
JSON + adapter). El cliente las vería como pestañas nuevas en el panel.

## Costos del sistema completo

| Pieza | Servicio | Costo |
|---|---|---|
| Hosting del sitio | Vercel | $0 (plan Hobby) |
| Panel de administración | Sveltia CMS (open source) | $0 |
| Almacén de contenido | GitHub | $0 |
| Fotos subidas | Mismo repositorio | $0 |
| Pagos de la tienda (futuro) | Stripe | 2.9% + 30¢ por venta |
| Dominio | Hostinger (ya pagado) | — |

**Total fijo mensual: $0.**
