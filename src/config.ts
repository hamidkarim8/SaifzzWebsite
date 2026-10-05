export const site = {
  name: 'Saifzz Aircond Electrical',
  live: true,
  phone: '+60 16-281 5887',
  whatsapp: '60162815887',
  email: '',
  area: { en: 'Kajang, Bangi, Semenyih and nearby areas', ms: 'Kajang, Bangi, Semenyih dan kawasan berdekatan' },
  areaServed: ['Kajang', 'Bangi', 'Semenyih'],
  tiktok: 'https://www.tiktok.com/@aircondservicekajang',
  facebook: '',
  instagram: '',
  mapQuery: 'Kajang, Selangor, Malaysia',
  regNo: '202603156325 (KT0615877-D)',
  licences: ['CSTP', 'PW4'],
  waTag: '[from website]',
  stats: { customers: 500, jobs: 1200, years: 10 },
};

export const phoneHref = `tel:+${site.phone.replace(/\D/g, '')}`;
export const waDisplay = `+${site.whatsapp.slice(0, 2)} ${site.whatsapp.slice(2, 4)}-${site.whatsapp.slice(4, 7)} ${site.whatsapp.slice(7)}`;
export const tiktokHandle = site.tiktok.match(/@[\w.]+/)?.[0] ?? 'TikTok';
export const waText = (text: string) => `${text}\n\n${site.waTag}`;
export const waLink = (text: string) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(waText(text))}`;
