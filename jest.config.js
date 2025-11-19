export default {
  testEnvironment: 'jsdom',

  // Module paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Transform ES modules
  transform: {},

  // File extensions
  moduleFileExtensions: ['js', 'ts', 'json'],

  // Test patterns
  testMatch: ['**/tests/**/*.test.js'],

  // Coverage
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/**/index.js', // Entry points often have low coverage
    '!**/node_modules/**',
  ],

  // Coverage thresholds - Per-file for tested modules
  coverageThreshold: {
    'src/shared/storage-utils.js': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
    'src/shared/dom-utils.js': {
      statements: 95,
      branches: 100,
      functions: 100,
      lines: 95,
    },
    'src/content/inspector/color-utils.js': {
      statements: 96,
      branches: 100,
      functions: 100,
      lines: 96,
    },
    'src/content/calculator/calculator-math.js': {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Coverage reporters
  coverageReporters: ['text', 'lcov', 'html'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Verbose output
  verbose: true,
};
