export const site = {
  name: 'Saifzz Aircond Electrical',
  live: false,
  phone: '+60 16-281 5887',
  whatsapp: '60162815887',
  email: '',
  area: 'Kuala Lumpur & Selangor',
  tiktok: 'https://www.tiktok.com/@aircondservicekajang',
  facebook: '',
  instagram: '',
  mapQuery: 'Selangor, Malaysia',
  stats: { customers: 500, jobs: 1200, years: 10 },
};

export const phoneHref = `tel:+${site.phone.replace(/\D/g, '')}`;
export const waDisplay = `+${site.whatsapp.slice(0, 2)} ${site.whatsapp.slice(2, 4)}-${site.whatsapp.slice(4, 7)} ${site.whatsapp.slice(7)}`;
export const tiktokHandle = site.tiktok.match(/@[\w.]+/)?.[0] ?? 'TikTok';
export const waLink = (text = '') => `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
