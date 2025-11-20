import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'background/service-worker': resolve(
          __dirname,
          'src/background/service-worker.ts',
        ),
        'content/inspector': resolve(
          __dirname,
          'src/content/inspector/index.ts',
        ),
        'content/calculator': resolve(__dirname, 'src/content/calculator.ts'),
        'options/settings': resolve(__dirname, 'src/options/settings.ts'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return '[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
        inlineDynamicImports: false,
      },
    },
  },
  plugins: [
    {
      name: 'copy-assets',
      closeBundle() {
        // Copy manifest.json
        copyFileSync('manifest.json', 'dist/manifest.json');

        // Copy HTML files
        mkdirSync('dist/options', { recursive: true });
        copyFileSync('src/options/settings.html', 'dist/options/settings.html');

        // Copy assets
        mkdirSync('dist/assets/icons', { recursive: true });
        const iconsDir = 'assets/icons';
        [
          '16.png',
          '22.png',
          '24.png',
          '32.png',
          '48.png',
          '128-crap.png',
        ].forEach((icon) => {
          copyFileSync(`${iconsDir}/${icon}`, `dist/assets/icons/${icon}`);
        });

        // Copy _locales
        const locales = [
          'ko',
          'en',
          'ja',
          'zh_CN',
          'zh_TW',
          'de',
          'fr',
          'es',
          'it',
          'ru',
          'pt',
        ];
        locales.forEach((locale) => {
          mkdirSync(`dist/_locales/${locale}`, { recursive: true });
          copyFileSync(
            `_locales/${locale}/messages.json`,
            `dist/_locales/${locale}/messages.json`,
          );
        });
      },
    },
  ],
});
