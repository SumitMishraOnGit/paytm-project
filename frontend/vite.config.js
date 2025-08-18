import { defineConfig, loadEnv } from 'vite'; 
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig(({ mode }) => { 
  const env = loadEnv(mode, process.cwd(), ''); 
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': { 
          target: env.VITE_BACKEND_URL, 
          changeOrigin: true,
        },
      },
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss(),
          autoprefixer(),
        ],
      },
    },
  };
});