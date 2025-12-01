/**
 * Inspector 모듈에서 사용되는 모든 상수 정의
 * @module inspector/constants
 */

/**
 * 색상 및 스타일 상수
 */
export interface ColorConstants {
  readonly DEFAULT_WHITE: string;
  readonly DEFAULT_BLACK: string;
  readonly TRANSPARENT_HEX: string;
  readonly TRANSPARENT_HEX_SHORT: string;
  readonly MESSAGE_BG: string;
  readonly MESSAGE_TEXT: string;
}

/**
 * 측정 및 계산 상수
 */
export interface MeasurementConstants {
  readonly MM_PER_INCH: number;
  readonly BLOCK_WIDTH: number;
  readonly DECIMAL_PLACES: number;
  readonly SIZE_PRECISION: number;
}

/**
 * WCAG 명도 대비 계산 상수
 */
export interface WCAGContrastConstants {
  readonly LUMINANCE_RED: number;
  readonly LUMINANCE_GREEN: number;
  readonly LUMINANCE_BLUE: number;
  readonly SRGB_THRESHOLD: number;
  readonly SRGB_DIVISOR: number;
  readonly SRGB_OFFSET: number;
  readonly SRGB_MULTIPLIER: number;
  readonly SRGB_EXPONENT: number;
  readonly CONTRAST_OFFSET: number;
  readonly MAX_RGB_VALUE: number;
  readonly RATIO_AA_NORMAL: number; // WCAG 1.4.3 Level AA (normal text)
  readonly RATIO_AAA_NORMAL: number; // WCAG 1.4.3 Level AAA (normal text)
}

/**
 * 타이밍 상수 (밀리초)
 */
export interface TimingConstants {
  readonly MESSAGE_DISPLAY: number;
}

/**
 * UI 위치 및 크기 상수
 */
export interface UIConstants {
  readonly POSITION_OFFSET: number;
  readonly POSITION_OFFSET_LARGE: number;
  readonly POSITION_MIN: number;
  readonly Z_INDEX_MAX: string;
  readonly BORDER_WIDTH: number;
  readonly INLINE_BLOCK_SIZE: number;
}

/**
 * 스타일 속성 값
 */
export interface StyleValueConstants {
  readonly NONE: string;
  readonly AUTO: string;
  readonly TRANSPARENT: string;
  readonly ZERO_PX: string;
  readonly ZERO: string;
  readonly ZERO_MARGIN_PADDING: string;
}

/**
 * 노드 타입
 */
export interface NodeTypeConstants {
  readonly ELEMENT: number;
}

/**
 * HEX 색상 길이
 */
export interface ColorLengthConstants {
  readonly SHORT: number;
  readonly FULL: number;
}

/**
 * 접근성 기준 임계값
 */
export interface AccessibilityThresholds {
  readonly KWCAG_213_MM: number;
  readonly WCAG_258_CSS_PX: number;
  readonly WCAG_255_CSS_PX: number;
  readonly DPI_STANDARD: number;
}

/**
 * 모든 상수를 포함하는 인터페이스
 */
export interface Constants {
  readonly COLOR: ColorConstants;
  readonly MEASUREMENT: MeasurementConstants;
  readonly WCAG_CONTRAST: WCAGContrastConstants;
  readonly TIMING: TimingConstants;
  readonly UI: UIConstants;
  readonly INTERACTIVE_ELEMENTS: readonly string[];
  readonly PARENT_INTERACTIVE_ELEMENTS: readonly string[];
  readonly STYLE_VALUES: StyleValueConstants;
  readonly NODE_TYPE: NodeTypeConstants;
  readonly COLOR_LENGTH: ColorLengthConstants;
  readonly ACCESSIBILITY: AccessibilityThresholds;
}

export const CONSTANTS: Constants = {
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
    RATIO_AA_NORMAL: 4.5, // WCAG 1.4.3 Level AA
    RATIO_AAA_NORMAL: 7.0, // WCAG 1.4.3 Level AAA
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
  INTERACTIVE_ELEMENTS: ['a', 'button', 'input', 'area'] as const,

  // 부모 상호작용 요소 태그명
  PARENT_INTERACTIVE_ELEMENTS: ['a', 'button', 'input'] as const,

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

  // 접근성 기준 임계값
  ACCESSIBILITY: {
    KWCAG_213_MM: 6.0,
    WCAG_258_CSS_PX: 24,
    WCAG_255_CSS_PX: 44,
    DPI_STANDARD: 96,
  },
} as const;

/**
 * 16진수 문자 배열 (0-F)
 */
export const HEX_CHARS: readonly string[] = [
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
] as const;
