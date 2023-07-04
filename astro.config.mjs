import { defineConfig } from 'astro/config';
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: process.env.NODE_ENV === 'production' ? 'https://sunify.github.io' : 'http://localhost:3000',
  base: '/photos',
  build: {
    assets: 'assets'
  },
  integrations: [svelte()]
});