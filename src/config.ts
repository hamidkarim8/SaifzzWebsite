export const site = {
  name: 'Saifzz Aircond Electrical',
  phone: '+60 00-000 0000',
  whatsapp: '60000000000',
  email: '',
  area: 'Kuala Lumpur & Selangor',
  tiktok: 'https://www.tiktok.com/',
  facebook: '',
  instagram: '',
  mapQuery: 'Kuala Lumpur',
  stats: { customers: 500, jobs: 1200, years: 5, days: 6 },
};

export const phoneHref = `tel:+${site.phone.replace(/\D/g, '')}`;
export const waLink = (text = '') => `https://wa.me/${site.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
