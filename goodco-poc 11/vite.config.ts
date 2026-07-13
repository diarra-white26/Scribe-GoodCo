import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Relative base so the build works from any subpath, including a GitHub
  // Pages project site (username.github.io/repo-name/) without needing to
  // hardcode the repo name here.
  base: './',
  plugins: [react(), tailwindcss()],
});
