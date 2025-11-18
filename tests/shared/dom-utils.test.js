/**
 * Tests for dom-utils.js
 * Tests DOM manipulation utility functions
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
  $,
  createElement,
  setTextContent,
  setInnerHTML,
  addEventListenerSafe,
  toggleDisplay,
  addClassToElements,
  removeClassFromElements,
} from '../../src/shared/dom-utils.js';

describe('DOM Utilities', () => {
  beforeEach(() => {
    // Reset document body before each test
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('$', () => {
    test('finds element by ID', () => {
      document.body.innerHTML = '<div id="test-element">Test</div>';
      const element = $('test-element');
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.id).toBe('test-element');
    });

    test('returns null for non-existent ID', () => {
      const element = $('nonexistent');
      expect(element).toBeNull();
    });

    test('returns null for empty string', () => {
      const element = $('');
      expect(element).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    test('returns null for whitespace-only string', () => {
      const element = $('   ');
      expect(element).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    test('returns null for non-string input', () => {
      const element = $(123);
      expect(element).toBeNull();
    });

    test('finds element with complex ID', () => {
      document.body.innerHTML = '<div id="my-complex_id.123">Test</div>';
      const element = $('my-complex_id.123');
      expect(element).toBeInstanceOf(HTMLElement);
    });
  });

  describe('createElement', () => {
    test('creates basic element', () => {
      const element = createElement('div');
      expect(element).toBeInstanceOf(HTMLDivElement);
      expect(element.tagName).toBe('DIV');
    });

    test('creates element with className', () => {
      const element = createElement('div', { className: 'test-class' });
      expect(element.className).toBe('test-class');
    });

    test('creates element with textContent', () => {
      const element = createElement('p', { textContent: 'Hello World' });
      expect(element.textContent).toBe('Hello World');
    });

    test('creates element with attributes', () => {
      const element = createElement('input', {
        attrs: { type: 'text', placeholder: 'Enter name' },
      });
      expect(element.getAttribute('type')).toBe('text');
      expect(element.getAttribute('placeholder')).toBe('Enter name');
    });

    test('creates element with all options', () => {
      const element = createElement('button', {
        className: 'btn primary',
        textContent: 'Click me',
        attrs: { id: 'submit-btn', type: 'submit' },
      });
      expect(element.className).toBe('btn primary');
      expect(element.textContent).toBe('Click me');
      expect(element.getAttribute('id')).toBe('submit-btn');
      expect(element.getAttribute('type')).toBe('submit');
    });

    test('creates element without options', () => {
      const element = createElement('span');
      expect(element).toBeInstanceOf(HTMLSpanElement);
      expect(element.className).toBe('');
      expect(element.textContent).toBe('');
    });

    test('handles empty attrs object', () => {
      const element = createElement('div', { attrs: {} });
      expect(element).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe('setTextContent', () => {
    test('sets text content safely', () => {
      const element = document.createElement('div');
      setTextContent(element, 'Safe text');
      expect(element.textContent).toBe('Safe text');
    });

    test('escapes HTML to prevent XSS', () => {
      const element = document.createElement('div');
      const maliciousText = '<script>alert("XSS")</script>';
      setTextContent(element, maliciousText);
      expect(element.textContent).toBe(maliciousText);
      expect(element.innerHTML).toBe(
        '&lt;script&gt;alert("XSS")&lt;/script&gt;',
      );
    });

    test('handles null element gracefully', () => {
      setTextContent(null, 'text');
      expect(console.error).toHaveBeenCalled();
    });

    test('handles non-HTMLElement gracefully', () => {
      setTextContent({}, 'text');
      expect(console.error).toHaveBeenCalled();
    });

    test('handles special characters', () => {
      const element = document.createElement('div');
      setTextContent(element, 'Text with & < > " \' characters');
      expect(element.textContent).toContain('&');
      expect(element.textContent).toContain('<');
      expect(element.textContent).toContain('>');
    });
  });

  describe('setInnerHTML', () => {
    test('sets innerHTML (with deprecation warning)', () => {
      const element = document.createElement('div');
      setInnerHTML(element, '<span>Test</span>');
      expect(element.innerHTML).toBe('<span>Test</span>');
      expect(console.warn).toHaveBeenCalled();
    });

    test('shows deprecation warning', () => {
      const element = document.createElement('div');
      setInnerHTML(element, 'test');
      expect(console.warn).toHaveBeenCalledWith(
        'setInnerHTML is deprecated. Use createElement and appendChild instead.',
      );
    });

    test('handles null element gracefully', () => {
      setInnerHTML(null, '<div>test</div>');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addEventListenerSafe', () => {
    test('adds event listener successfully', () => {
      const element = document.createElement('button');
      const handler = jest.fn();
      addEventListenerSafe(element, 'click', handler);

      element.click();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    test('adds event listener with options', () => {
      const element = document.createElement('div');
      const handler = jest.fn();
      addEventListenerSafe(element, 'click', handler, { once: true });

      element.click();
      element.click();
      expect(handler).toHaveBeenCalledTimes(1); // Only called once due to 'once' option
    });

    test('handles null element gracefully', () => {
      const handler = jest.fn();
      addEventListenerSafe(null, 'click', handler);
      expect(console.error).toHaveBeenCalled();
    });

    test('handles non-function handler', () => {
      const element = document.createElement('button');
      addEventListenerSafe(element, 'click', 'not-a-function');
      expect(console.error).toHaveBeenCalled();
    });

    test('handles multiple event types', () => {
      const element = document.createElement('input');
      const handler = jest.fn();
      addEventListenerSafe(element, 'focus', handler);
      addEventListenerSafe(element, 'blur', handler);

      element.dispatchEvent(new Event('focus'));
      element.dispatchEvent(new Event('blur'));
      expect(handler).toHaveBeenCalledTimes(2);
    });
  });

  describe('toggleDisplay', () => {
    test('hides element when show=false', () => {
      const element = document.createElement('div');
      toggleDisplay(element, false);
      expect(element.style.display).toBe('none');
    });

    test('shows element when show=true', () => {
      const element = document.createElement('div');
      element.style.display = 'none';
      toggleDisplay(element, true);
      expect(element.style.display).toBe('');
    });

    test('toggles display when show is undefined', () => {
      const element = document.createElement('div');
      element.style.display = '';

      toggleDisplay(element);
      expect(element.style.display).toBe('none');

      toggleDisplay(element);
      expect(element.style.display).toBe('');
    });

    test('handles null element gracefully', () => {
      toggleDisplay(null, true);
      expect(console.error).toHaveBeenCalled();
    });

    test('handles non-HTMLElement gracefully', () => {
      toggleDisplay({}, true);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('addClassToElements', () => {
    test('adds class to multiple elements', () => {
      const elements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];

      addClassToElements(elements, 'active');

      elements.forEach((el) => {
        expect(el.classList.contains('active')).toBe(true);
      });
    });

    test('handles empty array', () => {
      addClassToElements([], 'active');
      // Should not throw error
    });

    test('skips null elements in array', () => {
      const elements = [
        document.createElement('div'),
        null,
        document.createElement('div'),
      ];
      addClassToElements(elements, 'active');

      expect(elements[0].classList.contains('active')).toBe(true);
      expect(elements[2].classList.contains('active')).toBe(true);
    });

    test('handles non-array input gracefully', () => {
      addClassToElements('not-an-array', 'active');
      expect(console.error).toHaveBeenCalled();
    });

    test('adds class to element', () => {
      const elements = [document.createElement('div')];
      addClassToElements(elements, 'highlighted');
      expect(elements[0].classList.contains('highlighted')).toBe(true);
    });
  });

  describe('removeClassFromElements', () => {
    test('removes class from multiple elements', () => {
      const elements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ];

      elements.forEach((el) => el.classList.add('active', 'highlight'));

      removeClassFromElements(elements, 'active');

      elements.forEach((el) => {
        expect(el.classList.contains('active')).toBe(false);
        expect(el.classList.contains('highlight')).toBe(true);
      });
    });

    test('handles empty array', () => {
      removeClassFromElements([], 'active');
      // Should not throw error
    });

    test('skips null elements in array', () => {
      const elements = [
        document.createElement('div'),
        null,
        document.createElement('div'),
      ];
      elements[0].classList.add('active');
      elements[2].classList.add('active');

      removeClassFromElements(elements, 'active');

      expect(elements[0].classList.contains('active')).toBe(false);
      expect(elements[2].classList.contains('active')).toBe(false);
    });

    test('handles non-array input gracefully', () => {
      removeClassFromElements('not-an-array', 'active');
      expect(console.error).toHaveBeenCalled();
    });

    test('handles non-existent class gracefully', () => {
      const elements = [document.createElement('div')];
      removeClassFromElements(elements, 'nonexistent');
      // Should not throw error
    });
  });

  describe('Integration tests', () => {
    test('create, append, find, and modify element', () => {
      const container = createElement('div', { attrs: { id: 'container' } });
      document.body.appendChild(container);

      const button = createElement('button', {
        className: 'btn',
        textContent: 'Click',
        attrs: { id: 'my-button' },
      });
      container.appendChild(button);

      const foundButton = $('my-button');
      expect(foundButton).toBe(button);

      setTextContent(foundButton, 'Updated');
      expect(foundButton.textContent).toBe('Updated');

      toggleDisplay(foundButton, false);
      expect(foundButton.style.display).toBe('none');
    });

    test('create multiple elements and manage classes', () => {
      const elements = [];
      for (let i = 0; i < 3; i++) {
        elements.push(createElement('div', { className: 'item' }));
      }

      addClassToElements(elements, 'active');
      elements.forEach((el) => {
        expect(el.classList.contains('item')).toBe(true);
        expect(el.classList.contains('active')).toBe(true);
      });

      removeClassFromElements(elements, 'active');
      elements.forEach((el) => {
        expect(el.classList.contains('active')).toBe(false);
      });
    });
  });
});
