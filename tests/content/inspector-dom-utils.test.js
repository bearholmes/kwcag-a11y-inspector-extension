/**
 * Tests for inspector/dom-utils.js
 * Inspector 모듈의 DOM 유틸리티 함수 테스트
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  getCurrentDocument,
  insertMessage,
  removeElement,
  getTargetSize,
} from '../../src/content/inspector/dom-utils.ts';

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

  describe('getTargetSize', () => {
    /**
     * Helper function to mock getBoundingClientRect for testing
     * JSDOM doesn't calculate actual sizes, so we need to mock it
     */
    function mockElementSize(element, width, height) {
      element.getBoundingClientRect = jest.fn(() => ({
        width,
        height,
        top: 0,
        left: 0,
        bottom: height,
        right: width,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));
    }

    test('returns correct size for 24x24 element (WCAG 2.5.8 minimum)', () => {
      const element = document.createElement('button');
      element.style.width = '24px';
      element.style.height = '24px';
      document.body.appendChild(element);
      mockElementSize(element, 24, 24);

      const result = getTargetSize(element);

      expect(result.width).toBe(24);
      expect(result.height).toBe(24);
      expect(result.meetsWCAG258).toBe(true);
      expect(result.meetsWCAG255).toBe(false);
    });

    test('returns correct size for 44x44 element (WCAG 2.5.5 AAA)', () => {
      const element = document.createElement('button');
      element.style.width = '44px';
      element.style.height = '44px';
      document.body.appendChild(element);
      mockElementSize(element, 44, 44);

      const result = getTargetSize(element);

      expect(result.width).toBe(44);
      expect(result.height).toBe(44);
      expect(result.meetsWCAG258).toBe(true);
      expect(result.meetsWCAG255).toBe(true);
    });

    test('detects non-compliant element smaller than 24x24', () => {
      const element = document.createElement('button');
      element.style.width = '20px';
      element.style.height = '20px';
      document.body.appendChild(element);
      mockElementSize(element, 20, 20);

      const result = getTargetSize(element);

      expect(result.width).toBe(20);
      expect(result.height).toBe(20);
      expect(result.meetsWCAG258).toBe(false);
      expect(result.meetsWCAG255).toBe(false);
    });

    test('detects element that meets AA but not AAA (30x30)', () => {
      const element = document.createElement('a');
      element.style.width = '30px';
      element.style.height = '30px';
      element.style.display = 'block';
      document.body.appendChild(element);
      mockElementSize(element, 30, 30);

      const result = getTargetSize(element);

      expect(result.width).toBe(30);
      expect(result.height).toBe(30);
      expect(result.meetsWCAG258).toBe(true);
      expect(result.meetsWCAG255).toBe(false);
    });

    test('handles element with padding correctly', () => {
      const element = document.createElement('button');
      // 16x16 content + 4px padding on all sides = 24x24 total
      element.style.width = '16px';
      element.style.height = '16px';
      element.style.padding = '4px';
      element.style.boxSizing = 'content-box';
      document.body.appendChild(element);
      mockElementSize(element, 24, 24);

      const result = getTargetSize(element);

      // getBoundingClientRect includes padding
      expect(result.width).toBe(24);
      expect(result.height).toBe(24);
      expect(result.meetsWCAG258).toBe(true);
    });

    test('handles element with border correctly', () => {
      const element = document.createElement('button');
      // 22x22 + 1px border on all sides = 24x24 total
      element.style.width = '22px';
      element.style.height = '22px';
      element.style.border = '1px solid black';
      element.style.boxSizing = 'content-box';
      document.body.appendChild(element);
      mockElementSize(element, 24, 24);

      const result = getTargetSize(element);

      expect(result.width).toBe(24);
      expect(result.height).toBe(24);
      expect(result.meetsWCAG258).toBe(true);
    });

    test('handles non-square elements (width != height)', () => {
      const element = document.createElement('button');
      element.style.width = '48px';
      element.style.height = '20px';
      document.body.appendChild(element);
      mockElementSize(element, 48, 20);

      const result = getTargetSize(element);

      expect(result.width).toBe(48);
      expect(result.height).toBe(20);
      // Both dimensions must meet the requirement
      expect(result.meetsWCAG258).toBe(false);
      expect(result.meetsWCAG255).toBe(false);
    });

    test('handles very large elements', () => {
      const element = document.createElement('button');
      element.style.width = '200px';
      element.style.height = '100px';
      document.body.appendChild(element);
      mockElementSize(element, 200, 100);

      const result = getTargetSize(element);

      expect(result.width).toBe(200);
      expect(result.height).toBe(100);
      expect(result.meetsWCAG258).toBe(true);
      expect(result.meetsWCAG255).toBe(true);
    });

    test('handles edge case: exactly 23x23 (1px below minimum)', () => {
      const element = document.createElement('button');
      element.style.width = '23px';
      element.style.height = '23px';
      document.body.appendChild(element);
      mockElementSize(element, 23, 23);

      const result = getTargetSize(element);

      expect(result.width).toBe(23);
      expect(result.height).toBe(23);
      expect(result.meetsWCAG258).toBe(false);
    });

    test('handles edge case: exactly 25x25 (1px above minimum)', () => {
      const element = document.createElement('button');
      element.style.width = '25px';
      element.style.height = '25px';
      document.body.appendChild(element);
      mockElementSize(element, 25, 25);

      const result = getTargetSize(element);

      expect(result.width).toBe(25);
      expect(result.height).toBe(25);
      expect(result.meetsWCAG258).toBe(true);
      expect(result.meetsWCAG255).toBe(false);
    });

    test('handles inline elements with display:inline-block', () => {
      const element = document.createElement('span');
      element.style.display = 'inline-block';
      element.style.width = '30px';
      element.style.height = '30px';
      document.body.appendChild(element);
      mockElementSize(element, 30, 30);

      const result = getTargetSize(element);

      expect(result.width).toBe(30);
      expect(result.height).toBe(30);
      expect(result.meetsWCAG258).toBe(true);
    });

    test('returns result for element with box-sizing: border-box', () => {
      const element = document.createElement('button');
      element.style.width = '24px';
      element.style.height = '24px';
      element.style.padding = '5px';
      element.style.border = '2px solid black';
      element.style.boxSizing = 'border-box';
      document.body.appendChild(element);
      mockElementSize(element, 24, 24);

      const result = getTargetSize(element);

      // border-box: total size is exactly 24x24
      expect(result.width).toBe(24);
      expect(result.height).toBe(24);
      expect(result.meetsWCAG258).toBe(true);
    });

    test('handles element without explicit dimensions', () => {
      const element = document.createElement('button');
      element.textContent = 'Click me';
      document.body.appendChild(element);
      // Mock a realistic size for a button with text
      mockElementSize(element, 80, 32);

      const result = getTargetSize(element);

      // Should still return dimensions based on content
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
      expect(typeof result.meetsWCAG258).toBe('boolean');
      expect(typeof result.meetsWCAG255).toBe('boolean');
    });
  });
});
