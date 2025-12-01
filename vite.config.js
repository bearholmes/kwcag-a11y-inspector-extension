import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// package.json에서 버전 읽기
const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
const version = packageJson.version;

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
        // 코드 스플리팅 비활성화 - 각 엔트리가 독립적인 번들로 생성
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    {
      name: 'copy-assets',
      closeBundle() {
        // Copy manifest.json with version injection
        const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));
        manifest.version = version;
        writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));

        // Copy HTML files
        mkdirSync('dist/options', { recursive: true });
        copyFileSync('src/options/settings.html', 'dist/options/settings.html');

        // Copy CSS files
        copyFileSync('src/content/calculator.css', 'dist/calculator.css');
        copyFileSync(
          'src/content/inspector/inspector.css',
          'dist/inspector.css',
        );

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
