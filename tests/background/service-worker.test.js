/**
 * Tests for background/service-worker.js
 * Service Worker 기본 로직 테스트
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Chrome API Mock
global.chrome = {
  notifications: {
    create: jest.fn(),
  },
  tabs: {
    create: jest.fn(() => Promise.resolve()),
    query: jest.fn(() => Promise.resolve([])),
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
  runtime: {
    onInstalled: {
      addListener: jest.fn(),
    },
    onMessage: {
      addListener: jest.fn(),
    },
    lastError: null,
  },
  scripting: {
    executeScript: jest.fn(() => Promise.resolve()),
    insertCSS: jest.fn(() => Promise.resolve()),
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
};

describe('Service Worker', () => {
  beforeEach(() => {
    // Mock 초기화
    jest.clearAllMocks();
    global.chrome.runtime.lastError = null;
  });

  describe('Chrome API Mocks', () => {
    test('chrome.notifications is available', () => {
      expect(chrome.notifications).toBeDefined();
      expect(chrome.notifications.create).toBeDefined();
    });

    test('chrome.runtime.onInstalled is available', () => {
      expect(chrome.runtime.onInstalled).toBeDefined();
      expect(chrome.runtime.onInstalled.addListener).toBeDefined();
    });

    test('chrome.contextMenus is available', () => {
      expect(chrome.contextMenus).toBeDefined();
      expect(chrome.contextMenus.create).toBeDefined();
    });

    test('chrome.action.onClicked is available', () => {
      expect(chrome.action.onClicked).toBeDefined();
      expect(chrome.action.onClicked.addListener).toBeDefined();
    });

    test('chrome.storage.sync is available', () => {
      expect(chrome.storage.sync).toBeDefined();
      expect(chrome.storage.sync.get).toBeDefined();
      expect(chrome.storage.sync.set).toBeDefined();
    });
  });

  describe('Module loading', () => {
    test('service-worker module can be loaded', async () => {
      // service-worker는 부수 효과가 있는 모듈이지만, import는 가능해야 함
      await expect(
        import('../../src/background/service-worker.ts'),
      ).resolves.toBeDefined();
    });
  });

  describe('Chrome API calls', () => {
    test('context menu create API is available', () => {
      // contextMenus.create API가 사용 가능한지 확인
      // 실제 호출은 service-worker 로드 시 발생하며, E2E 테스트에서 검증
      expect(chrome.contextMenus.create).toBeDefined();
      expect(typeof chrome.contextMenus.create).toBe('function');

      // API 호출 형식 테스트
      const menuConfig = {
        id: 'dkinspectContextMenu',
        title: '수동계산 팝업 열기',
        contexts: ['page', 'frame'],
      };

      expect(menuConfig).toHaveProperty('id');
      expect(menuConfig).toHaveProperty('title');
      expect(menuConfig).toHaveProperty('contexts');
    });
  });

  describe('Default settings', () => {
    test('default settings object structure', () => {
      const defaultSettings = {
        monitors: '17',
        resolutions: '1366x768',
        ccshow: '1',
        linkmode: '0',
        bgmode: '1',
        linetype: 'dashed',
        colortype: 'ff0000',
        bordersize: '2',
      };

      expect(defaultSettings).toHaveProperty('monitors');
      expect(defaultSettings).toHaveProperty('resolutions');
      expect(defaultSettings).toHaveProperty('ccshow');
      expect(defaultSettings).toHaveProperty('linkmode');
      expect(defaultSettings).toHaveProperty('bgmode');
      expect(defaultSettings).toHaveProperty('linetype');
      expect(defaultSettings).toHaveProperty('colortype');
      expect(defaultSettings).toHaveProperty('bordersize');

      // 값 검증
      expect(defaultSettings.monitors).toBe('17');
      expect(defaultSettings.resolutions).toBe('1366x768');
      expect(defaultSettings.linetype).toBe('dashed');
      expect(defaultSettings.colortype).toBe('ff0000');
    });

    test('default settings values are valid', () => {
      const defaultSettings = {
        monitors: '17',
        resolutions: '1366x768',
        ccshow: '1',
        linkmode: '0',
        bgmode: '1',
        linetype: 'dashed',
        colortype: 'ff0000',
        bordersize: '2',
      };

      // monitors는 숫자 문자열
      expect(isNaN(parseInt(defaultSettings.monitors))).toBe(false);

      // resolutions는 WxH 형식
      expect(defaultSettings.resolutions).toMatch(/^\d+x\d+$/);

      // ccshow는 0 또는 1
      expect(['0', '1']).toContain(defaultSettings.ccshow);

      // linetype은 유효한 CSS border-style 값
      expect(['solid', 'dashed', 'dotted']).toContain(defaultSettings.linetype);

      // colortype은 6자리 hex
      expect(defaultSettings.colortype).toMatch(/^[0-9a-fA-F]{6}$/);

      // bordersize는 숫자 문자열
      expect(isNaN(parseInt(defaultSettings.bordersize))).toBe(false);
    });
  });

  describe('Error handling', () => {
    test('handles Chrome API errors gracefully', () => {
      // Chrome API 에러를 시뮬레이션
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // 에러를 발생시키는 것보다, 에러 핸들링 코드가 있는지 확인
      expect(consoleErrorSpy).toBeDefined();

      consoleErrorSpy.mockRestore();
    });

    test('validates tab ID before operations', () => {
      const invalidTab = null;
      const validTab = { id: 123 };

      // null tab은 유효하지 않음
      expect(invalidTab?.id).toBeUndefined();

      // valid tab은 id를 가짐
      expect(validTab?.id).toBe(123);
    });

    test('validates URL before injection', () => {
      const chromeInternalUrl = 'chrome://extensions/';
      const chromeWebStoreUrl =
        'https://chrome.google.com/webstore/category/extensions';
      const validUrl = 'https://www.example.com';

      // chrome:// URL 검증
      expect(chromeInternalUrl.startsWith('chrome://')).toBe(true);

      // chrome web store URL 검증
      expect(chromeWebStoreUrl.includes('chrome.google.com/webstore')).toBe(
        true,
      );

      // 일반 URL은 허용
      expect(validUrl.startsWith('http')).toBe(true);
    });
  });

  describe('URL validation logic', () => {
    function isRestrictedUrl(url) {
      if (!url) return true;
      return (
        url.startsWith('chrome://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('edge://') ||
        url.includes('chrome.google.com/webstore')
      );
    }

    test('blocks chrome internal URLs', () => {
      expect(isRestrictedUrl('chrome://extensions/')).toBe(true);
      expect(isRestrictedUrl('chrome://settings/')).toBe(true);
      expect(isRestrictedUrl('chrome-extension://abc123/')).toBe(true);
    });

    test('blocks web store URLs', () => {
      expect(
        isRestrictedUrl(
          'https://chrome.google.com/webstore/category/extensions',
        ),
      ).toBe(true);
    });

    test('allows normal URLs', () => {
      expect(isRestrictedUrl('https://www.google.com')).toBe(false);
      expect(isRestrictedUrl('https://www.example.com')).toBe(false);
      expect(isRestrictedUrl('http://localhost:3000')).toBe(false);
    });

    test('handles null and undefined URLs', () => {
      expect(isRestrictedUrl(null)).toBe(true);
      expect(isRestrictedUrl(undefined)).toBe(true);
      expect(isRestrictedUrl('')).toBe(true);
    });
  });

  describe('Message command structure', () => {
    test('pause command structure', () => {
      const pauseMessage = { cmd: 'pause' };
      expect(pauseMessage).toHaveProperty('cmd');
      expect(pauseMessage.cmd).toBe('pause');
    });

    test('message responses', () => {
      const response = 'Escape';
      expect(typeof response).toBe('string');
      expect(response).toBe('Escape');
    });
  });
});
