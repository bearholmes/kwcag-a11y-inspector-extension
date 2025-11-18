/**
 * Jest setup file - Mocks Chrome Extension APIs
 */

import { jest } from '@jest/globals';

// Mock chrome API
global.chrome = {
  runtime: {
    lastError: null,
    sendMessage: jest.fn((message, callback) => {
      if (callback) callback({});
    }),
    onMessage: {
      addListener: jest.fn(),
    },
    getURL: jest.fn((path) => `chrome-extension://fake-id/${path}`),
  },

  storage: {
    sync: {
      get: jest.fn((keys, callback) => {
        callback({});
      }),
      set: jest.fn((items, callback) => {
        if (callback) callback();
      }),
      remove: jest.fn((keys, callback) => {
        if (callback) callback();
      }),
      clear: jest.fn((callback) => {
        if (callback) callback();
      }),
    },
  },

  i18n: {
    getMessage: jest.fn((key) => key),
  },

  scripting: {
    executeScript: jest.fn(),
  },

  notifications: {
    create: jest.fn(),
  },

  contextMenus: {
    create: jest.fn(),
    onClicked: {
      addListener: jest.fn(),
    },
  },

  action: {
    onClicked: {
      addListener: jest.fn(),
    },
  },
};

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
};
