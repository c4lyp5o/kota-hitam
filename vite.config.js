import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset paths, so the build also works from a subfolder such as an itch.io page.
  base: './',
});
