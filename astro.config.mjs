import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: 'https://sunify.github.io',
  base: process.env.NODE_ENV === 'production' ? '/photos' : '/',
  build: {
    assets: 'assets'
  },
  integrations: [mdx(), svelte()]
});