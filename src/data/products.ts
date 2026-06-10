/* =====================================================
   Miami Photography Center — Store catalog adapter

   Products live in src/content/products/*.json — those files
   are what the client edits through the /admin panel (Sveltia
   CMS). Each saved change commits to GitHub, which triggers a
   Vercel rebuild, so the store updates without code changes.
   ===================================================== */
export interface Product {
  slug: string;
  name: { en: string; es: string };
  price: number; // USD
  category: { en: string; es: string }; // Cameras | Lenses | Accessories
  img: string;
  desc: { en: string; es: string };
  condition: { en: string; es: string };
  specs: { en: string[]; es: string[] };
}

const modules = import.meta.glob<{ default: Product }>('../content/products/*.json', { eager: true });

export const products: Product[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.slug.localeCompare(b.slug));
