/**
 * Tests for inspector/shortcut-manager.js
 * 단축키 관리자 테스트
 */

import {
  describe,
  test,
  expect,
  jest,
  beforeEach,
  afterEach,
} from '@jest/globals';
import { createShortcutManager } from '../../src/content/inspector/shortcut-manager.ts';

// Chrome API Mock
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    lastError: null,
  },
};

describe('Shortcut Manager', () => {
  let mockInspector;
  let shortcutManager;

  beforeEach(() => {
    // DOM 초기화
    document.body.innerHTML = '';

    // Fake timers 사용
    jest.useFakeTimers();

    // Inspector mock 생성
    mockInspector = {
      removeEventListeners: jest.fn(),
      addEventListeners: jest.fn(),
    };

    // shortcut manager 생성
    shortcutManager = createShortcutManager(mockInspector);

    // Chrome API 초기화
    global.chrome.runtime.lastError = null;
    global.chrome.runtime.sendMessage.mockClear();
  });

  afterEach(() => {
    // Timers 정리
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('createShortcutManager', () => {
    test('creates shortcut manager with correct methods', () => {
      expect(shortcutManager).toHaveProperty('initialize');
      expect(shortcutManager).toHaveProperty('pause');
      expect(shortcutManager).toHaveProperty('resume');
      expect(shortcutManager).toHaveProperty('isPaused');
    });

    test('initial state is not paused', () => {
      expect(shortcutManager.isPaused()).toBe(false);
    });
  });

  describe('pause', () => {
    test('pauses inspector when block exists', () => {
      // dkInspect_block 생성
      const block = document.createElement('div');
      block.id = 'dkInspect_block';
      document.body.appendChild(block);

      const result = shortcutManager.pause();

      expect(result).toBe(true);
      expect(mockInspector.removeEventListeners).toHaveBeenCalled();
      expect(shortcutManager.isPaused()).toBe(true);
    });

    test('returns false when block does not exist', () => {
      const result = shortcutManager.pause();

      expect(result).toBe(false);
      expect(mockInspector.removeEventListeners).not.toHaveBeenCalled();
    });

    test('shows pause message', () => {
      const block = document.createElement('div');
      block.id = 'dkInspect_block';
      document.body.appendChild(block);

      shortcutManager.pause();

      // 메시지가 표시되었는지 확인
      const messageEl = document.getElementById('dkInspectInsertMessage');
      expect(messageEl).not.toBeNull();
      expect(messageEl.textContent).toBe('일시정지');

      // 메시지가 제거되는지 확인 (3초 후, CONSTANTS.TIMING.MESSAGE_DISPLAY)
      jest.advanceTimersByTime(3000);

      const removedMessage = document.getElementById('dkInspectInsertMessage');
      expect(removedMessage).toBeNull();
    });

    test('does not change state if already paused', () => {
      const block = document.createElement('div');
      block.id = 'dkInspect_block';
      document.body.appendChild(block);

      shortcutManager.pause();
      expect(shortcutManager.isPaused()).toBe(true);

      mockInspector.removeEventListeners.mockClear();

      shortcutManager.pause();
      expect(shortcutManager.isPaused()).toBe(true);
      // 두 번째 pause는 여전히 removeEventListeners를 호출
      expect(mockInspector.removeEventListeners).toHaveBeenCalled();
    });
  });

  describe('resume', () => {
    test('resumes inspector when block exists', () => {
      const block = document.createElement('div');
      block.id = 'dkInspect_block';
      document.body.appendChild(block);

      // 먼저 pause
      shortcutManager.pause();

      // resume
      const result = shortcutManager.resume();

      expect(result).toBe(true);
      expect(mockInspector.addEventListeners).toHaveBeenCalled();
      expect(shortcutManager.isPaused()).toBe(false);
    });

    test('returns false when block does not exist', () => {
      const result = shortcutManager.resume();

      expect(result).toBe(false);
      expect(mockInspector.addEventListeners).not.toHaveBeenCalled();
    });

    test('shows resume message', () => {
      const block = document.createElement('div');
      block.id = 'dkInspect_block';
      document.body.appendChild(block);

      // 먼저 pause
      shortcutManager.pause();

      // 이전 메시지 제거 대기
      jest.advanceTimersByTime(3000);

      // resume
      shortcutManager.resume();

      const messageEl = document.getElementById('dkInspectInsertMessage');
      expect(messageEl).not.toBeNull();
      expect(messageEl.textContent).toBe('재개');
    });

    test('can resume from not paused state', () => {
      const block = document.createElement('div');
      block.id = 'dkInspect_block';
      document.body.appendChild(block);

      expect(shortcutManager.isPaused()).toBe(false);

      const result = shortcutManager.resume();
      expect(result).toBe(true);
      expect(mockInspector.addEventListeners).toHaveBeenCalled();
    });
  });

  describe('isPaused', () => {
    test('returns current pause state', () => {
      const block = document.createElement('div');
      block.id = 'dkInspect_block';
      document.body.appendChild(block);

      expect(shortcutManager.isPaused()).toBe(false);

      shortcutManager.pause();
      expect(shortcutManager.isPaused()).toBe(true);

      shortcutManager.resume();
      expect(shortcutManager.isPaused()).toBe(false);
    });
  });

  describe('initialize', () => {
    test('sends message to chrome runtime', () => {
      shortcutManager.initialize();

      expect(global.chrome.runtime.sendMessage).toHaveBeenCalledWith(
        { cmd: 'pause' },
        expect.any(Function),
      );
    });

    test('handles chrome runtime error gracefully', () => {
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      global.chrome.runtime.sendMessage.mockImplementation((msg, callback) => {
        global.chrome.runtime.lastError = { message: 'Test error' };
        callback();
      });

      expect(() => {
        shortcutManager.initialize();
      }).not.toThrow();

      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
      global.chrome.runtime.lastError = null;
    });

    test('handles initialization error', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      global.chrome.runtime.sendMessage.mockImplementation(() => {
        throw new Error('Initialization failed');
      });

      expect(() => {
        shortcutManager.initialize();
      }).not.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Integration tests', () => {
    test('full pause and resume cycle', () => {
      const block = document.createElement('div');
      block.id = 'dkInspect_block';
      document.body.appendChild(block);

      // 초기 상태
      expect(shortcutManager.isPaused()).toBe(false);

      // 일시정지
      const pauseResult = shortcutManager.pause();
      expect(pauseResult).toBe(true);
      expect(shortcutManager.isPaused()).toBe(true);
      expect(mockInspector.removeEventListeners).toHaveBeenCalled();

      // 재개
      mockInspector.addEventListeners.mockClear();
      const resumeResult = shortcutManager.resume();
      expect(resumeResult).toBe(true);
      expect(shortcutManager.isPaused()).toBe(false);
      expect(mockInspector.addEventListeners).toHaveBeenCalled();
    });

    test('multiple pause/resume cycles', () => {
      const block = document.createElement('div');
      block.id = 'dkInspect_block';
      document.body.appendChild(block);

      for (let i = 0; i < 3; i++) {
        shortcutManager.pause();
        expect(shortcutManager.isPaused()).toBe(true);

        shortcutManager.resume();
        expect(shortcutManager.isPaused()).toBe(false);
      }

      expect(mockInspector.removeEventListeners).toHaveBeenCalledTimes(3);
      expect(mockInspector.addEventListeners).toHaveBeenCalledTimes(3);
    });
  });
});
