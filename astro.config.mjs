import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sw from './integrations/sw.mjs';

export default defineConfig({
  site: 'https://saifzzaircondelectrical.com.my',
  build: { format: 'file' },
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(page) }), sw()],
});
