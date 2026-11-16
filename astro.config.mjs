import { defineConfig } from 'astro/config';

// Set SITE_URL and BASE_PATH when moving to another host.
export default defineConfig({
  site: process.env.SITE_URL || 'https://kointaker.github.io',
  base: process.env.BASE_PATH ?? '/Portfolio_Website',
  trailingSlash: 'always',
  output: 'static',
});
