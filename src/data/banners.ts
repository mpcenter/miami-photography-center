/* =====================================================
   Miami Photography Center — Promo banners adapter

   Banners live in src/content/banners/*.json — the client
   manages them from the /admin panel (Sveltia CMS): upload an
   image, optional link, toggle on/off, set the order. Each save
   commits to GitHub and Vercel rebuilds, so the home banner
   updates without code changes.
   ===================================================== */
export interface Banner {
  order: number;
  enabled: boolean;
  image: string;
  alt: string;
  link?: string;
  /** Optional promo text shown over the image (ES). */
  text?: string;
  /** Optional English version of the text (falls back to `text`). */
  textEn?: string;
  /** Substring of the text to highlight in brand yellow (e.g. "10%"). */
  highlight?: string;
}

const modules = import.meta.glob<{ default: Banner }>('../content/banners/*.json', { eager: true });

export const banners: Banner[] = Object.values(modules)
  .map((m) => m.default)
  .filter((b) => b.enabled !== false && b.image)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
