import { site } from '../config';
import { en } from './en';
import { ms } from './ms';

export type Lang = 'en' | 'ms';
export type Page = 'index' | 'about' | 'service' | 'media' | 'contact' | '404';
export type Dict = typeof en;

const fill = (v: unknown): unknown => {
  if (typeof v === 'string') return v.replaceAll('{brand}', site.name).replaceAll('{area}', site.area);
  if (Array.isArray(v)) return v.map(fill);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, fill(x)]));
  return v;
};

const dicts: Record<Lang, Dict> = { en: fill(en) as Dict, ms: fill(ms) as Dict };

export const t = (lang: Lang) => dicts[lang];
export const otherLang = (lang: Lang): Lang => (lang === 'en' ? 'ms' : 'en');
export const localePath = (lang: Lang, page: Page) => {
  const p = page === 'index' ? '' : page;
  return lang === 'en' ? `/${p}` : `/ms/${p}`;
};
