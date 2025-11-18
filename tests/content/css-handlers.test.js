/**
 * Tests for inspector/css-handlers.js
 * CSS 속성 핸들러 테스트 (핵심 기능만)
 */

import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import {
  hideCSSCategory,
  updateColorBackground,
  updateLength,
  updateBox,
} from '../../src/content/inspector/css-handlers.js';

describe('CSS Handlers', () => {
  beforeEach(() => {
    // DOM 초기화
    document.body.innerHTML = '';
  });

  describe('hideCSSCategory', () => {
    test('hides category div when it exists', () => {
      const div = document.createElement('div');
      div.id = 'dkInspect_testCategory';
      div.style.display = 'block';
      document.body.appendChild(div);

      hideCSSCategory('testCategory');

      expect(div.style.display).toBe('none');
    });

    test('handles non-existent category gracefully', () => {
      expect(() => {
        hideCSSCategory('nonExistentCategory');
      }).not.toThrow();
    });

    test('handles null category', () => {
      expect(() => {
        hideCSSCategory(null);
      }).not.toThrow();
    });

    test('handles empty string category', () => {
      expect(() => {
        hideCSSCategory('');
      }).not.toThrow();
    });
  });

  describe('updateColorBackground', () => {
    test('throws error with null element', () => {
      // updateColorBackground는 null 체크를 하지 않으므로 에러 발생
      expect(() => {
        updateColorBackground(null);
      }).toThrow();
    });

    test('requires dkInspect_ccshow element', () => {
      const mockElement = {
        getPropertyValue: (prop) => {
          if (prop === 'color') return 'rgb(0, 0, 0)';
          if (prop === 'background-color') return 'rgb(255, 255, 255)';
          return '';
        },
      };

      // ccshow 요소가 없으면 console.warn이 호출됨
      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      updateColorBackground(mockElement);

      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    test('works with required DOM elements', () => {
      // 필요한 DOM 구조 생성
      const ccshowDiv = document.createElement('div');
      ccshowDiv.id = 'dkInspect_ccshow';
      document.body.appendChild(ccshowDiv);

      const colorLi = document.createElement('li');
      colorLi.id = 'dkInspect_color';
      const colorSpan = document.createElement('span');
      colorLi.appendChild(colorSpan);
      document.body.appendChild(colorLi);

      const bgColorLi = document.createElement('li');
      bgColorLi.id = 'dkInspect_background-color';
      const bgSpan = document.createElement('span');
      bgColorLi.appendChild(bgSpan);
      document.body.appendChild(bgColorLi);

      const colorContrastLi = document.createElement('li');
      colorContrastLi.id = 'dkInspect_colorcontrast';
      const contrastSpan = document.createElement('span');
      colorContrastLi.appendChild(contrastSpan);
      document.body.appendChild(colorContrastLi);

      const mockElement = {
        getPropertyValue: (prop) => {
          if (prop === 'color') return 'rgb(0, 0, 0)';
          if (prop === 'background-color') return 'rgb(255, 255, 255)';
          return '';
        },
      };

      // 함수가 에러 없이 실행되는지 확인
      // DOM 조작의 세부사항은 E2E 테스트에서 검증
      expect(() => {
        updateColorBackground(mockElement);
      }).not.toThrow();
    });
  });

  describe('updateLength', () => {
    test('throws error with null element', () => {
      // updateLength는 null 체크를 하지 않으므로 에러 발생
      expect(() => {
        updateLength(null, {}, null);
      }).toThrow();
    });

    test('requires dkInspect_h, dkInspect_w, dkInspect_diagonal elements', () => {
      const mockElement = {
        getPropertyValue: () => '0px',
      };

      const mockOpt = { stdpx: 2.835 };
      const mockDomElement = {
        offsetHeight: 100,
        offsetWidth: 100,
      };

      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      updateLength(mockElement, mockOpt, mockDomElement);

      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    test('calculates dimensions when elements exist', () => {
      // 필요한 DOM 요소 생성
      const heightLi = document.createElement('li');
      heightLi.id = 'dkInspect_h';
      const heightSpan = document.createElement('span');
      heightLi.appendChild(heightSpan);
      document.body.appendChild(heightLi);

      const widthLi = document.createElement('li');
      widthLi.id = 'dkInspect_w';
      const widthSpan = document.createElement('span');
      widthLi.appendChild(widthSpan);
      document.body.appendChild(widthLi);

      const diagonalLi = document.createElement('li');
      diagonalLi.id = 'dkInspect_diagonal';
      const diagonalSpan = document.createElement('span');
      diagonalLi.appendChild(diagonalSpan);
      document.body.appendChild(diagonalLi);

      const mockElement = {
        getPropertyValue: (prop) => {
          if (prop === 'padding-top') return '0px';
          if (prop === 'padding-bottom') return '0px';
          if (prop === 'padding-left') return '0px';
          if (prop === 'padding-right') return '0px';
          if (prop === 'border-top-width') return '0px';
          if (prop === 'border-bottom-width') return '0px';
          if (prop === 'border-left-width') return '0px';
          if (prop === 'border-right-width') return '0px';
          return '0px';
        },
      };

      const mockOpt = { stdpx: 2.835 };
      const mockDomElement = {
        offsetHeight: 100,
        offsetWidth: 100,
      };

      expect(() => {
        updateLength(mockElement, mockOpt, mockDomElement);
      }).not.toThrow();
    });
  });

  describe('updateBox', () => {
    test('throws error with null element', () => {
      // updateBox는 null 체크를 하지 않으므로 에러 발생
      expect(() => {
        updateBox(null);
      }).toThrow();
    });

    test('updates box model properties', () => {
      // 필요한 DOM 요소들 생성
      const properties = [
        'border',
        'margin',
        'padding',
        'min-height',
        'max-height',
        'min-width',
        'max-width',
      ];

      properties.forEach((prop) => {
        const li = document.createElement('li');
        li.id = `dkInspect_${prop}`;
        const span = document.createElement('span');
        li.appendChild(span);
        document.body.appendChild(li);
      });

      const mockElement = {
        getPropertyValue: (prop) => {
          if (prop.includes('border')) return '1px solid rgb(0, 0, 0)';
          if (prop.includes('margin')) return '10px';
          if (prop.includes('padding')) return '5px';
          if (prop === 'min-height') return '0px';
          if (prop === 'max-height') return 'none';
          if (prop === 'min-width') return '0px';
          if (prop === 'max-width') return 'none';
          return '0px';
        },
      };

      expect(() => {
        updateBox(mockElement);
      }).not.toThrow();
    });

    test('handles missing DOM elements gracefully', () => {
      const mockElement = {
        getPropertyValue: () => '0px',
      };

      const consoleWarnSpy = jest
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      updateBox(mockElement);

      // 요소가 없으면 warn이 여러 번 호출됨
      expect(consoleWarnSpy.mock.calls.length).toBeGreaterThan(0);

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Integration tests', () => {
    test('hideCSSCategory handles undefined gracefully', () => {
      expect(() => {
        hideCSSCategory(undefined);
      }).not.toThrow();
    });

    test('update functions throw with undefined element', () => {
      // CSSStyleDeclaration이 필요한 함수들은 undefined로 에러 발생
      expect(() => {
        updateColorBackground(undefined);
      }).toThrow();

      expect(() => {
        updateLength(undefined, undefined, undefined);
      }).toThrow();

      expect(() => {
        updateBox(undefined);
      }).toThrow();
    });

    test('functions work with empty DOM', () => {
      document.body.innerHTML = '';

      const mockElement = {
        getPropertyValue: () => '0px',
      };

      // 모든 함수가 빈 DOM에서도 크래시 없이 동작해야 함
      expect(() => {
        hideCSSCategory('test');
        updateColorBackground(mockElement);
        updateLength(
          mockElement,
          { stdpx: 1 },
          { offsetHeight: 0, offsetWidth: 0 },
        );
        updateBox(mockElement);
      }).not.toThrow();
    });
  });
});
