export type Locale = 'en' | 'es';

export const locales: Locale[] = ['en', 'es'];
export const defaultLocale: Locale = 'en';

/** Prefix a root-relative path with the locale (en = no prefix). */
export function localePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'en') return clean === '/' ? '/' : clean;
  return clean === '/' ? '/es' : `/es${clean}`;
}

/** Given the current pathname, return the equivalent path in the other locale. */
export function altLocalePath(locale: Locale, pathname: string): string {
  if (locale === 'es') {
    const stripped = pathname.replace(/^\/es(\/|$)/, '/');
    return stripped === '' ? '/' : stripped;
  }
  return pathname === '/' ? '/es' : `/es${pathname}`;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'en' ? 'es' : 'en';
}
