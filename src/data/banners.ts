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
}

const modules = import.meta.glob<{ default: Banner }>('../content/banners/*.json', { eager: true });

export const banners: Banner[] = Object.values(modules)
  .map((m) => m.default)
  .filter((b) => b.enabled !== false && b.image)
  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
