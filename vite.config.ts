import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const clientId = env.VITE_CLIENT_ID || 'client-a';

  const validClients = ['client-a', 'client-b'];
  const safeClientId = validClients.includes(clientId) ? clientId : 'client-a';

  console.log(`Building for client: ${safeClientId}`);

  const clientEnv = loadEnv(mode, process.cwd(), `VITE_${safeClientId.toUpperCase().replace(/-/g, '_')}_`);

  const injectedSecrets: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (key.startsWith('VITE_SECRET_') || key.startsWith('VITE_CUSTOM_')) {
      injectedSecrets[`import.meta.env.${key}`] = JSON.stringify(value);
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@client-config': path.resolve(__dirname, `./src/configs/clients/${safeClientId}.ts`),
      },
    },
    build: {
      outDir: `dist/${safeClientId}`,
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    define: {
      __CLIENT_ID__: JSON.stringify(safeClientId),
      ...injectedSecrets,
    },
  };
});
