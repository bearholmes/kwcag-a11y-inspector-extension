/**
 * Inspector 모듈에서 사용되는 모든 상수 정의
 * @module inspector/constants
 */

export const CONSTANTS = {
  // 색상 및 스타일 상수
  COLOR: {
    DEFAULT_WHITE: '#FFFFFF',
    DEFAULT_BLACK: '#000000',
    TRANSPARENT_HEX: '#00000000',
    TRANSPARENT_HEX_SHORT: '00000000',
    MESSAGE_BG: '#3c77eb',
    MESSAGE_TEXT: '#ffffff',
  },

  // 측정 및 계산 상수
  MEASUREMENT: {
    MM_PER_INCH: 25.4,
    BLOCK_WIDTH: 332,
    DECIMAL_PLACES: 2,
    SIZE_PRECISION: 1,
  },

  // WCAG 명도 대비 계산 상수
  WCAG_CONTRAST: {
    LUMINANCE_RED: 0.2126,
    LUMINANCE_GREEN: 0.7152,
    LUMINANCE_BLUE: 0.0722,
    SRGB_THRESHOLD: 0.03928,
    SRGB_DIVISOR: 12.92,
    SRGB_OFFSET: 0.055,
    SRGB_MULTIPLIER: 1.055,
    SRGB_EXPONENT: 2.4,
    CONTRAST_OFFSET: 0.05,
    MAX_RGB_VALUE: 255,
  },

  // 타이밍 상수 (밀리초)
  TIMING: {
    MESSAGE_DISPLAY: 3000,
  },

  // UI 위치 및 크기 상수
  UI: {
    POSITION_OFFSET: 20,
    POSITION_OFFSET_LARGE: 40,
    POSITION_MIN: 10,
    Z_INDEX_MAX: '99999999',
    BORDER_WIDTH: 1,
    INLINE_BLOCK_SIZE: 8,
  },

  // 상호작용 요소 태그명
  INTERACTIVE_ELEMENTS: ['a', 'button', 'input', 'area'],

  // 부모 상호작용 요소 태그명
  PARENT_INTERACTIVE_ELEMENTS: ['a', 'button', 'input'],

  // 스타일 속성 값
  STYLE_VALUES: {
    NONE: 'none',
    AUTO: 'auto',
    TRANSPARENT: 'transparent',
    ZERO_PX: '0px',
    ZERO: '0',
    ZERO_MARGIN_PADDING: '0 0 0 0',
  },

  // 노드 타입
  NODE_TYPE: {
    ELEMENT: 1,
  },

  // HEX 색상 길이
  COLOR_LENGTH: {
    SHORT: 3,
    FULL: 6,
  },
};

/**
 * 16진수 문자 배열 (0-F)
 */
export const HEX_CHARS = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
];
