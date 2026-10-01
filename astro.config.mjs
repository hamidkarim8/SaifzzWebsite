import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import sw from './integrations/sw.mjs';

export default defineConfig({
  site: 'https://saifzzaircondelectrical.com.my',
  build: { format: 'preserve' },
  integrations: [
    sitemap({
      filter: (page) => !/\/404\/?$/.test(page),
      serialize: (item) => ({ ...item, url: item.url.replace(/\/ms$/, '/ms/') }),
    }),
    sw(),
  ],
});
