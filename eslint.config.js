import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';

export default [
  js.configs.recommended,
  // JavaScript files
  {
    files: ['src/**/*.js'],
    plugins: {
      jsdoc,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        chrome: 'readonly',
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        Event: 'readonly',
        Promise: 'readonly',
        alert: 'readonly',
      },
    },
    rules: {
      // 에러 레벨 규칙
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[property.name='innerHTML']",
          message:
            '직접 innerHTML을 사용하지 마십시오. textContent 또는 전용 렌더링 헬퍼를 사용하세요.',
        },
        {
          selector:
            "MemberExpression[computed=true][property.value='innerHTML']",
          message:
            '직접 innerHTML을 사용하지 마십시오. textContent 또는 전용 렌더링 헬퍼를 사용하세요.',
        },
      ],

      // 코드 품질
      'no-var': 'error',
      'prefer-const': 'warn',
      'no-duplicate-imports': 'error',

      // JSDoc 규칙
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-param-names': 'warn',
      'jsdoc/check-tag-names': 'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'warn',
    },
  },
  // TypeScript files
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['src/**/*.ts'],
  })),
  {
    files: ['src/**/*.ts'],
    plugins: {
      jsdoc,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[property.name='innerHTML']",
          message:
            '직접 innerHTML을 사용하지 마십시오. textContent 또는 전용 렌더링 헬퍼를 사용하세요.',
        },
        {
          selector:
            "MemberExpression[computed=true][property.value='innerHTML']",
          message:
            '직접 innerHTML을 사용하지 마십시오. textContent 또는 전용 렌더링 헬퍼를 사용하세요.',
        },
      ],

      // 코드 품질
      'no-var': 'error',
      'prefer-const': 'warn',

      // JSDoc 규칙
      'jsdoc/check-alignment': 'warn',
      'jsdoc/check-param-names': 'warn',
      'jsdoc/check-tag-names': 'warn',
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns-description': 'warn',
    },
  },
  // Test files configuration
  {
    files: ['tests/**/*.js', 'jest.config.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        // Jest globals
        describe: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        jest: 'readonly',
        // Browser/DOM globals (jsdom)
        global: 'writable',
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        chrome: 'readonly',
        HTMLElement: 'readonly',
        HTMLDivElement: 'readonly',
        HTMLSpanElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLInputElement: 'readonly',
        Event: 'readonly',
        Promise: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': 'off', // Allow console in tests
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '.husky/**', 'coverage/**'],
  },
];
