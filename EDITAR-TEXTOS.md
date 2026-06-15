# Cómo cambiar el texto de la web desde GitHub

Los textos viven dentro de los archivos `.astro` (código). Editarlos en
GitHub es seguro si sigues estos pasos. (La tienda es aparte: los productos
se editan desde el panel `/admin`.)

## Pasos

1. Entra a **https://github.com/oreste2b/miami-photography-center**
2. Abre el archivo de la página que quieres cambiar (mapa abajo).
3. Pulsa el **lápiz** ✏️ ("Edit this file"), arriba a la derecha.
4. Cambia **solo el texto entre comillas** `'...'`.
5. Abajo: **"Commit changes"** → *Commit directly to the `main` branch* →
   **Commit changes**.
6. En **~1 minuto** Vercel publica el cambio. Recarga la web.

## Mapa de páginas → archivo

| Página | Archivo |
|---|---|
| Inicio | `src/components/pages/HomePage.astro` |
| Reparación | `src/components/pages/RepairPage.astro` |
| Servicio In Situ | `src/components/pages/OnSitePage.astro` |
| Limpieza de sensor | `src/components/pages/SensorCleaningPage.astro` |
| Membresía | `src/components/pages/MembershipPage.astro` |
| Producciones | `src/components/pages/ProductionsPage.astro` |
| Servicios (hub) | `src/components/pages/ServicesPage.astro` |
| Sobre nosotros | `src/components/pages/AboutPage.astro` |
| Contacto | `src/components/pages/ContactPage.astro` |
| Preguntas frecuentes | `src/components/pages/FaqPage.astro` |
| Privacidad / Términos | `src/components/pages/PrivacyPage.astro` · `TermsPage.astro` |
| Landings de ads | `src/components/pages/LpSensorCleaningPage.astro` · `LpCameraRepairPage.astro` |
| Menú superior | `src/components/Nav.astro` |
| Pie de página | `src/components/Footer.astro` |
| Productos de la tienda | desde el panel `/admin` (no aquí) |

## ⚠️ Cada texto está DOS veces: español e inglés

Dentro de cada archivo hay dos bloques:
- `locale === 'es' ? {` … → **ESPAÑOL**
- `} : {` … → **INGLÉS**

Cambia el texto en **los dos** para que coincida en ambos idiomas.

Ejemplo (`HomePage.astro`):
```
heroLede: 'Limpieza de sensor, servicio móvil in situ...',   ← español
...
heroLede: 'Sensor cleaning, mobile on-site service...',      ← inglés
```
Editas lo de entre comillas; dejas `heroLede:` y las comillas igual.

## Reglas de oro (para no romper la web)

- ✅ Edita **solo lo que está entre comillas** `'...'`.
- ❌ No borres comas `,`, llaves `{ }`, ni los nombres tipo `heroLede:`.
- ❌ Si el texto lleva apóstrofo (`'`), escríbelo `\'` o usa `'` `'` tipográficas.
- 💡 Usa la pestaña **"Preview"** de GitHub antes de commitear.
- 🔄 Si algo sale mal: GitHub guarda cada cambio; se puede revertir el commit.

## ¿Y si rompo algo?

Si tras un cambio la web no actualiza o se ve un error, normalmente es una
comilla o coma borrada por accidente. Avísame con el nombre del archivo y lo
reviso en minutos, o revierte el commit desde la pestaña **Commits** del repo.
