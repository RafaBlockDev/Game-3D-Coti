import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@coti-io/coti-ethers': fileURLToPath(new URL('./lib/cotiEthersShim.ts', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 8080,
  },
  preview: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 8080,
  },
});
