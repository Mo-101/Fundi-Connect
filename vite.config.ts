import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: false,
      port: 4000,
      // Proxy /api to Vercel so local dev uses the live DB without needing
      // the Express server to connect to Neon from WSL (WSL2 MTU bug).
      proxy: {
        '/api': {
          target: 'https://fundi-connect-beryl.vercel.app',
          changeOrigin: true,
          secure: true,
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/tests/setup.ts'],
      include: ['src/tests/**/*.test.ts', 'src/tests/**/*.test.tsx'],
    },
  };
});
