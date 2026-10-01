import { defineConfig } from 'astro/config';
import sw from './integrations/sw.mjs';

export default defineConfig({
  site: 'https://saifzzaircondelectrical.com.my',
  build: { format: 'file' },
  integrations: [sw()],
});
