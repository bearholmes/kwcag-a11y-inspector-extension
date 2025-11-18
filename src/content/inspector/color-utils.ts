/**
 * 색상 변환 및 WCAG 대비 계산 유틸리티
 * @module inspector/color-utils
 */

import { CONSTANTS, HEX_CHARS } from './constants.ts';

/**
 * 10진수를 16진수로 변환하는 함수
 * @param nb - 10진수 값
 * @returns 16진수 문자열 (2자리)
 */
export function DecToHex(nb: number): string {
  return HEX_CHARS[Math.floor(nb / 16)] + HEX_CHARS[nb % 16];
}

/**
 * RGB 색상 값을 16진수로 변환하고, HTML 요소를 생성하여 16진수 색상 값과 함께 반환하는 함수
 * @param str - RGB 형식의 색상 문자열 (예: "rgb(255, 0, 0)")
 * @returns 색상 박스와 16진수 값을 포함한 HTML 문자열
 */
export function RGBToHex(str: string): string {
  try {
    // RGB 색상 값을 추출하여 10진수에서 16진수로 변환한 배열을 만듭니다.
    const matches = str.match(/\d+/g);
    if (!matches || matches.length < 3) {
      return `<span style='border: ${CONSTANTS.UI.BORDER_WIDTH}px solid ${CONSTANTS.COLOR.DEFAULT_BLACK} !important;width: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;height: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;display: inline-block !important;background-color:${CONSTANTS.COLOR.DEFAULT_WHITE} !important;'></span> ${CONSTANTS.COLOR.DEFAULT_WHITE}`;
    }

    const hexValues = matches.map((val) => DecToHex(parseInt(val)));
    // 각각의 16진수 값을 조합하여 최종 16진수 색상 값을 만듭니다.
    let hexStr = `#${hexValues.join('')}`;

    // 만약 hexStr이 #00000000이라면, #FFFFFF으로 대체합니다.
    if (hexStr === CONSTANTS.COLOR.TRANSPARENT_HEX) {
      hexStr = CONSTANTS.COLOR.DEFAULT_WHITE;
    }

    // 생성된 16진수 색상 값을 포함한 HTML 요소를 반환합니다.
    return `<span style='border: ${CONSTANTS.UI.BORDER_WIDTH}px solid ${CONSTANTS.COLOR.DEFAULT_BLACK} !important;width: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;height: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;display: inline-block !important;background-color:${hexStr} !important;'></span> ${hexStr}`;
  } catch (error) {
    console.error('RGBToHex 변환 오류:', error);
    return `<span style='border: ${CONSTANTS.UI.BORDER_WIDTH}px solid ${CONSTANTS.COLOR.DEFAULT_BLACK} !important;width: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;height: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;display: inline-block !important;background-color:${CONSTANTS.COLOR.DEFAULT_WHITE} !important;'></span> ${CONSTANTS.COLOR.DEFAULT_WHITE}`;
  }
}

/**
 * RGB 색상 값을 16진수 문자열로 변환하여 반환하는 함수
 * @param str - RGB 형식의 색상 문자열
 * @returns 16진수 색상 문자열 (예: "FF0000")
 */
export function RGBToHexStr(str: string): string {
  try {
    // 문자열에서 괄호 안의 값만 추출합니다.
    const matches = str.match(/\((.*?)\)/);
    if (!matches || !matches[1]) {
      return CONSTANTS.COLOR.DEFAULT_WHITE.substring(1);
    }

    const hexValues = matches[1].split(', ');
    let hexStr = '';

    // RGB 값을 16진수 문자열로 변환합니다.
    for (const item of hexValues) {
      hexStr += DecToHex(parseInt(item));
    }

    // 만약 hexStr이 '00000000'이라면, 'FFFFFF'으로 대체합니다.
    if (hexStr === CONSTANTS.COLOR.TRANSPARENT_HEX_SHORT) {
      hexStr = CONSTANTS.COLOR.DEFAULT_WHITE.substring(1);
    }

    return hexStr;
  } catch (error) {
    console.error('RGBToHexStr 변환 오류:', error);
    return CONSTANTS.COLOR.DEFAULT_WHITE.substring(1);
  }
}

/**
 * 16진수 색상코드를 10진수 RGB 값으로 변환하는 함수
 * @param color - 16진수 색상 코드
 * @returns 10진수 RGB 값 또는 false
 */
export function getRGB(color: string): number | false {
  try {
    const tmp = parseInt(color, 16);
    return isNaN(tmp) ? false : tmp;
  } catch (error) {
    console.error('RGB 변환 오류:', error);
    return false;
  }
}

/**
 * 16진수 색상코드를 sRGB 값으로 변환하는 함수
 * @param color - 16진수 색상 코드
 * @returns sRGB 값 또는 false
 */
export function getsRGB(color: string): number | false {
  const tmp = getRGB(color);
  if (tmp === false) {
    return false;
  }

  const sRGB = tmp / CONSTANTS.WCAG_CONTRAST.MAX_RGB_VALUE;
  return sRGB <= CONSTANTS.WCAG_CONTRAST.SRGB_THRESHOLD
    ? sRGB / CONSTANTS.WCAG_CONTRAST.SRGB_DIVISOR
    : Math.pow(
        (sRGB + CONSTANTS.WCAG_CONTRAST.SRGB_OFFSET) /
          CONSTANTS.WCAG_CONTRAST.SRGB_MULTIPLIER,
        CONSTANTS.WCAG_CONTRAST.SRGB_EXPONENT,
      );
}

/**
 * RGB 색상에서 Luminance 값을 계산하여 반환하는 함수
 * @param color - RGB 색상 코드 문자열 (3자리 또는 6자리)
 * @returns 계산된 Luminance 값 (0 ~ 255) 또는 false
 */
export function getL(color: string): number | false {
  try {
    let R: number | false, G: number | false, B: number | false;
    if (color.length === CONSTANTS.COLOR_LENGTH.SHORT) {
      R = getsRGB(color.substring(0, 1) + color.substring(0, 1));
      G = getsRGB(color.substring(1, 2) + color.substring(1, 2));
      B = getsRGB(color.substring(2, 3) + color.substring(2, 3));
    } else if (color.length === CONSTANTS.COLOR_LENGTH.FULL) {
      R = getsRGB(color.substring(0, 2));
      G = getsRGB(color.substring(2, 4));
      B = getsRGB(color.substring(4, 6));
    } else {
      return false;
    }

    // 값 유효성 검사
    if (R === false || G === false || B === false) {
      return false;
    }

    // Luminance 값 계산하여 반환
    return (
      CONSTANTS.WCAG_CONTRAST.LUMINANCE_RED * R +
      CONSTANTS.WCAG_CONTRAST.LUMINANCE_GREEN * G +
      CONSTANTS.WCAG_CONTRAST.LUMINANCE_BLUE * B
    );
  } catch (error) {
    console.error('Luminance 계산 오류:', error);
    return false;
  }
}

/**
 * 두 색상 간의 WCAG 명도 대비율을 계산하는 함수
 * @param L1 - 첫 번째 색상의 Luminance 값
 * @param L2 - 두 번째 색상의 Luminance 값
 * @returns 명도 대비율
 */
export function getContrastRatio(L1: number, L2: number): number {
  if (L1 > L2) {
    return (
      (L1 + CONSTANTS.WCAG_CONTRAST.CONTRAST_OFFSET) /
      (L2 + CONSTANTS.WCAG_CONTRAST.CONTRAST_OFFSET)
    );
  } else {
    return (
      (L2 + CONSTANTS.WCAG_CONTRAST.CONTRAST_OFFSET) /
      (L1 + CONSTANTS.WCAG_CONTRAST.CONTRAST_OFFSET)
    );
  }
}
