/**
 * Tests for inspector/dom-utils.js
 * Inspector 모듈의 DOM 유틸리티 함수 테스트
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  getCurrentDocument,
  insertMessage,
  removeElement,
} from '../../src/content/inspector/dom-utils.js';

describe('Inspector DOM Utilities', () => {
  beforeEach(() => {
    // DOM 초기화
    document.body.innerHTML = '';
  });

  describe('getCurrentDocument', () => {
    test('returns window.document', () => {
      const doc = getCurrentDocument();
      expect(doc).toBe(window.document);
    });

    test('returned document has expected properties', () => {
      const doc = getCurrentDocument();
      expect(doc).toHaveProperty('createElement');
      expect(doc).toHaveProperty('getElementById');
      expect(doc).toHaveProperty('getElementsByTagName');
    });
  });

  describe('insertMessage', () => {
    test('creates message element with correct text', () => {
      insertMessage('테스트 메시지');

      const messageEl = document.getElementById('dkInspectInsertMessage');
      expect(messageEl).not.toBeNull();
      expect(messageEl.textContent).toBe('테스트 메시지');
    });

    test('message element has correct styles', () => {
      insertMessage('스타일 테스트');

      const messageEl = document.getElementById('dkInspectInsertMessage');
      expect(messageEl.style.position).toBe('fixed');
      expect(messageEl.style.top).toBe('10px'); // CONSTANTS.UI.POSITION_MIN
      expect(messageEl.style.left).toBe('10px'); // CONSTANTS.UI.POSITION_MIN
      expect(messageEl.style.padding).toBe('5px');
      expect(messageEl.style.fontSize).toBe('14px');
      expect(messageEl.style.fontWeight).toBe('bold');
    });

    test('message element is appended to body', () => {
      insertMessage('Body 테스트');

      const messageEl = document.getElementById('dkInspectInsertMessage');
      expect(messageEl.parentElement).toBe(document.body);
    });

    test('handles multiple message insertions', () => {
      insertMessage('첫 번째 메시지');
      const firstMessage = document.getElementById('dkInspectInsertMessage');
      expect(firstMessage.textContent).toBe('첫 번째 메시지');

      // 기존 메시지 제거
      removeElement('dkInspectInsertMessage');

      // 새 메시지 삽입
      insertMessage('두 번째 메시지');
      const secondMessage = document.getElementById('dkInspectInsertMessage');
      expect(secondMessage.textContent).toBe('두 번째 메시지');
    });

    test('handles empty message', () => {
      insertMessage('');

      const messageEl = document.getElementById('dkInspectInsertMessage');
      expect(messageEl).not.toBeNull();
      expect(messageEl.textContent).toBe('');
    });

    test('handles special characters in message', () => {
      const specialMsg = '<script>alert("XSS")</script>';
      insertMessage(specialMsg);

      const messageEl = document.getElementById('dkInspectInsertMessage');
      // textContent를 사용하므로 HTML이 이스케이프되어야 함
      expect(messageEl.textContent).toBe(specialMsg);
      expect(messageEl.innerHTML).toContain('&lt;script&gt;');
    });
  });

  describe('removeElement', () => {
    test('removes existing element by ID', () => {
      // 요소 생성
      const testEl = document.createElement('div');
      testEl.id = 'testElement';
      document.body.appendChild(testEl);

      expect(document.getElementById('testElement')).not.toBeNull();

      // 제거
      removeElement('testElement');

      expect(document.getElementById('testElement')).toBeNull();
    });

    test('handles non-existent element gracefully', () => {
      // 존재하지 않는 요소 제거 시도
      expect(() => {
        removeElement('nonExistentElement');
      }).not.toThrow();
    });

    test('removes message element', () => {
      insertMessage('제거 테스트');

      const messageEl = document.getElementById('dkInspectInsertMessage');
      expect(messageEl).not.toBeNull();

      removeElement('dkInspectInsertMessage');

      expect(document.getElementById('dkInspectInsertMessage')).toBeNull();
    });

    test('handles empty string ID', () => {
      expect(() => {
        removeElement('');
      }).not.toThrow();
    });

    test('handles null ID gracefully', () => {
      expect(() => {
        removeElement(null);
      }).not.toThrow();
    });
  });

  describe('Integration tests', () => {
    test('insert and remove message workflow', () => {
      // 메시지 삽입
      insertMessage('통합 테스트');
      expect(document.getElementById('dkInspectInsertMessage')).not.toBeNull();

      // 메시지 제거
      removeElement('dkInspectInsertMessage');
      expect(document.getElementById('dkInspectInsertMessage')).toBeNull();
    });

    test('multiple insert and remove cycles', () => {
      for (let i = 0; i < 5; i++) {
        insertMessage(`메시지 ${i}`);
        const messageEl = document.getElementById('dkInspectInsertMessage');
        expect(messageEl.textContent).toBe(`메시지 ${i}`);

        removeElement('dkInspectInsertMessage');
        expect(document.getElementById('dkInspectInsertMessage')).toBeNull();
      }
    });

    test('document operations are safe', () => {
      const doc = getCurrentDocument();

      // DOM 조작이 안전하게 작동하는지 확인
      insertMessage('안전성 테스트');
      const messageEl = doc.getElementById('dkInspectInsertMessage');

      expect(messageEl).not.toBeNull();
      expect(messageEl.ownerDocument).toBe(doc);

      removeElement('dkInspectInsertMessage');
      expect(doc.getElementById('dkInspectInsertMessage')).toBeNull();
    });
  });
});
