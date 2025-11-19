/**
 * CSS 속성 핸들러
 * CSS 속성 읽기, 계산, 표시 업데이트를 담당하는 함수들을 제공합니다.
 * @module inspector/css-handlers
 */

import { CONSTANTS } from './constants.ts';
import { RGBToHex, RGBToHexStr, getL } from './color-utils.ts';
import { getCurrentDocument } from './dom-utils.ts';
import { InspectorOptions } from './inspector-core.ts';

/**
 * 문자열에서 'px'를 제거하고 반올림한 값을 문자열로 반환
 * @param value - 픽셀 값 문자열 (예: "10.5px")
 * @returns 반올림된 픽셀 값 (예: "11px")
 */
function removeExtraFloat(value: string): string {
  const numericValue = value.substring(0, value.length - 2);
  return `${Math.round(Number(numericValue))}px`;
}

/**
 * 요소의 CSS 속성 값을 반환
 * @param element - CSS 스타일 객체
 * @param property - CSS 속성명
 * @returns CSS 속성 값
 */
function getCSSProperty(
  element: CSSStyleDeclaration,
  property: string,
): string {
  return element.getPropertyValue(property);
}

/**
 * CSS 속성을 조건에 따라 설정하고 표시/숨김 처리
 * @param element - CSS 스타일 객체
 * @param property - CSS 속성명
 * @param condition - 표시 조건
 * @returns 성공 시 1, 실패 시 0
 */
function setCSSPropertyIf(
  element: CSSStyleDeclaration,
  property: string,
  condition: boolean,
): number {
  const document = getCurrentDocument();
  const li = document.getElementById(`dkInspect_${property}`);

  if (!li) {
    console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
    return 0;
  }

  if (condition) {
    li.lastChild!.textContent = ` : ${element.getPropertyValue(property)}`;
    li.style.display = 'block';
    return 1;
  } else {
    li.style.display = 'none';
    return 0;
  }
}

/**
 * CSS 속성 값을 설정하고 표시
 * @param element - CSS 스타일 객체
 * @param property - CSS 속성명
 * @param value - 설정할 값
 */
function setCSSPropertyValue(
  element: CSSStyleDeclaration,
  property: string,
  value: string,
): void {
  const document = getCurrentDocument();
  const li = document.getElementById(`dkInspect_${property}`);

  if (!li) {
    console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
    return;
  }

  li.lastChild!.textContent = ` : ${value}`;
  li.style.display = 'block';
}

/**
 * CSS 속성 값을 조건에 따라 설정하고 표시
 * @param element - CSS 스타일 객체
 * @param property - CSS 속성명
 * @param value - 설정할 값
 * @param condition - 표시 조건
 * @returns 성공 시 1, 실패 시 0
 */
function setCSSPropertyValueIf(
  element: CSSStyleDeclaration,
  property: string,
  value: string,
  condition: boolean,
): number {
  const document = getCurrentDocument();
  const li = document.getElementById(`dkInspect_${property}`);

  if (!li) {
    console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
    return 0;
  }

  if (condition) {
    li.lastChild!.textContent = ` : ${value}`;
    li.style.display = 'block';
    return 1;
  } else {
    li.style.display = 'none';
    return 0;
  }
}

/**
 * 특정 CSS 속성 표시를 숨김
 * @param property - CSS 속성명
 */
function hideCSSProperty(property: string): void {
  const document = getCurrentDocument();
  const li = document.getElementById(`dkInspect_${property}`);
  if (li) li.style.display = 'none';
}

/**
 * CSS 속성 카테고리 전체를 숨김
 * @param category - 카테고리명
 */
export function hideCSSCategory(category: string): void {
  const document = getCurrentDocument();
  const div = document.getElementById(`dkInspect_${category}`);
  if (div) div.style.display = 'none';
}

/**
 * 요소의 대각선 길이와 너비, 높이 값을 계산하고 표시
 * @param element - CSS 스타일 객체
 * @param opt - 옵션 객체 (stdpx 포함)
 * @param domElement - DOM 요소
 * @param hasWidth - 너비 조건
 * @param hasHeight - 높이 조건
 * @returns 성공 시 1, 실패 시 0
 */
function setCSSDiagonal(
  element: CSSStyleDeclaration,
  opt: InspectorOptions,
  domElement: HTMLElement,
  hasWidth: boolean,
  hasHeight: boolean,
): number {
  const document = getCurrentDocument();
  const heightLi = document.getElementById('dkInspect_h');
  const widthLi = document.getElementById('dkInspect_w');
  const diagonalLi = document.getElementById('dkInspect_diagonal');

  if (!heightLi || !widthLi || !diagonalLi) {
    console.warn('대각선 표시 요소를 찾을 수 없습니다');
    return 0;
  }

  const stdPx = opt.stdpx;
  let heightPx: number, widthPx: number;

  if (hasWidth && hasHeight) {
    // 패딩과 보더를 포함한 높이 계산
    const paddingTop = parseFloat(element.getPropertyValue('padding-top'));
    const paddingBottom = parseFloat(
      element.getPropertyValue('padding-bottom'),
    );
    const borderTop = parseFloat(element.getPropertyValue('border-top'));
    const borderBottom = parseFloat(element.getPropertyValue('border-bottom'));
    heightPx =
      parseFloat(element.getPropertyValue('height')) +
      paddingTop +
      paddingBottom +
      borderTop +
      borderBottom;

    // 패딩과 보더를 포함한 너비 계산
    const paddingLeft = parseFloat(element.getPropertyValue('padding-left'));
    const paddingRight = parseFloat(element.getPropertyValue('padding-right'));
    const borderLeft = parseFloat(element.getPropertyValue('border-left'));
    const borderRight = parseFloat(element.getPropertyValue('border-right'));
    widthPx =
      parseFloat(element.getPropertyValue('width')) +
      paddingLeft +
      paddingRight +
      borderLeft +
      borderRight;
  } else {
    // Bounding rect에서 너비와 높이 가져오기
    const boundingRect = domElement.getBoundingClientRect();
    heightPx = boundingRect.width || 0;
    widthPx = boundingRect.height || 0;
  }

  if (heightPx && widthPx) {
    // mm 단위로 변환
    const heightMm = heightPx * stdPx;
    const widthMm = widthPx * stdPx;
    const diagonalMm = Math.sqrt(widthMm * widthMm + heightMm * heightMm);
    const diagonalPx = Math.sqrt(widthPx * widthPx + heightPx * heightPx);

    // 표시 업데이트
    const precision = CONSTANTS.MEASUREMENT.SIZE_PRECISION;
    heightLi.lastChild!.textContent = ` : ${heightMm.toFixed(precision)}mm (${heightPx.toFixed(precision)}px)`;
    widthLi.lastChild!.textContent = ` : ${widthMm.toFixed(precision)}mm (${widthPx.toFixed(precision)}px)`;
    diagonalLi.lastChild!.textContent = ` : ${diagonalMm.toFixed(precision)}mm (${diagonalPx.toFixed(precision)}px)`;
    heightLi.style.display = 'block';
    widthLi.style.display = 'block';
    diagonalLi.style.display = 'block';

    return 1;
  } else {
    diagonalLi.style.display = 'none';
    return 0;
  }
}

/**
 * 요소의 전경색과 배경색의 명도 대비를 계산하고 표시
 * @param element - CSS 스타일 객체
 * @param condition - 표시 조건
 * @returns 성공 시 1, 실패 시 0
 */
function setCSSColorContrast(
  element: CSSStyleDeclaration,
  condition: boolean,
): number {
  const document = getCurrentDocument();
  const li = document.getElementById('dkInspect_contrast');

  if (!li) {
    console.warn('대비 표시 요소를 찾을 수 없습니다');
    return 0;
  }

  try {
    const foregroundColor = RGBToHexStr(getCSSProperty(element, 'color'));
    const backgroundColor = RGBToHexStr(
      getCSSProperty(element, 'background-color'),
    );
    const L1 = getL(foregroundColor);
    const L2 = getL(backgroundColor);

    if (L1 === false || L2 === false) {
      li.style.display = 'none';
      return 0;
    }

    const ratio =
      (Math.max(L1, L2) + CONSTANTS.WCAG_CONTRAST.CONTRAST_OFFSET) /
      (Math.min(L1, L2) + CONSTANTS.WCAG_CONTRAST.CONTRAST_OFFSET);

    if (condition) {
      li.lastChild!.textContent = ` : ${Math.round(ratio * 100) / 100}:1`;
      li.style.display = 'block';
      return 1;
    } else {
      li.style.display = 'none';
      return 0;
    }
  } catch (error) {
    console.error('색상 대비 계산 오류:', error);
    li.style.display = 'none';
    return 0;
  }
}

/**
 * 요소의 색상과 배경색, 대비 비율을 업데이트
 * @param element - CSS 스타일 객체
 */
export function updateColorBackground(element: CSSStyleDeclaration): void {
  setCSSPropertyValue(
    element,
    'color',
    RGBToHex(getCSSProperty(element, 'color')),
  );

  setCSSPropertyValueIf(
    element,
    'background-color',
    RGBToHex(getCSSProperty(element, 'background-color')),
    getCSSProperty(element, 'background-color') !==
      CONSTANTS.STYLE_VALUES.TRANSPARENT,
  );

  setCSSColorContrast(
    element,
    getCSSProperty(element, 'background-color') !==
      CONSTANTS.STYLE_VALUES.TRANSPARENT,
  );
}

/**
 * 요소의 길이 정보(높이, 너비, 대각선)를 업데이트
 * @param element - CSS 스타일 객체
 * @param opt - 옵션 객체
 * @param domElement - DOM 요소
 */
export function updateLength(
  element: CSSStyleDeclaration,
  opt: InspectorOptions,
  domElement: HTMLElement,
): void {
  setCSSDiagonal(
    element,
    opt,
    domElement,
    !isNaN(parseFloat(getCSSProperty(element, 'height'))),
    !isNaN(parseFloat(getCSSProperty(element, 'width'))),
  );
}

/**
 * 요소의 Box 모델 정보를 업데이트
 * (height, width, border, margin, padding 등)
 * @param element - CSS 스타일 객체
 */
export function updateBox(element: CSSStyleDeclaration): void {
  // Height와 Width
  setCSSPropertyIf(
    element,
    'height',
    removeExtraFloat(getCSSProperty(element, 'height')) !==
      CONSTANTS.STYLE_VALUES.AUTO,
  );
  setCSSPropertyIf(
    element,
    'width',
    removeExtraFloat(getCSSProperty(element, 'width')) !==
      CONSTANTS.STYLE_VALUES.AUTO,
  );

  // Border 정보
  const borderTop =
    removeExtraFloat(getCSSProperty(element, 'border-top-width')) +
    ' ' +
    getCSSProperty(element, 'border-top-style') +
    ' ' +
    RGBToHex(getCSSProperty(element, 'border-top-color'));
  const borderBottom =
    removeExtraFloat(getCSSProperty(element, 'border-bottom-width')) +
    ' ' +
    getCSSProperty(element, 'border-bottom-style') +
    ' ' +
    RGBToHex(getCSSProperty(element, 'border-bottom-color'));
  const borderRight =
    removeExtraFloat(getCSSProperty(element, 'border-right-width')) +
    ' ' +
    getCSSProperty(element, 'border-right-style') +
    ' ' +
    RGBToHex(getCSSProperty(element, 'border-right-color'));
  const borderLeft =
    removeExtraFloat(getCSSProperty(element, 'border-left-width')) +
    ' ' +
    getCSSProperty(element, 'border-left-style') +
    ' ' +
    RGBToHex(getCSSProperty(element, 'border-left-color'));

  // Border가 모두 같은 경우 border로 통합
  if (
    borderTop === borderBottom &&
    borderBottom === borderRight &&
    borderRight === borderLeft &&
    getCSSProperty(element, 'border-top-style') !== CONSTANTS.STYLE_VALUES.NONE
  ) {
    setCSSPropertyValue(element, 'border', borderTop);
    hideCSSProperty('border-top');
    hideCSSProperty('border-bottom');
    hideCSSProperty('border-right');
    hideCSSProperty('border-left');
  } else {
    setCSSPropertyValueIf(
      element,
      'border-top',
      borderTop,
      getCSSProperty(element, 'border-top-style') !==
        CONSTANTS.STYLE_VALUES.NONE,
    );
    setCSSPropertyValueIf(
      element,
      'border-bottom',
      borderBottom,
      getCSSProperty(element, 'border-bottom-style') !==
        CONSTANTS.STYLE_VALUES.NONE,
    );
    setCSSPropertyValueIf(
      element,
      'border-right',
      borderRight,
      getCSSProperty(element, 'border-right-style') !==
        CONSTANTS.STYLE_VALUES.NONE,
    );
    setCSSPropertyValueIf(
      element,
      'border-left',
      borderLeft,
      getCSSProperty(element, 'border-left-style') !==
        CONSTANTS.STYLE_VALUES.NONE,
    );
    hideCSSProperty('border');
  }

  // Margin 정보
  const marginTop = removeExtraFloat(getCSSProperty(element, 'margin-top'));
  const marginBottom = removeExtraFloat(
    getCSSProperty(element, 'margin-bottom'),
  );
  const marginRight = removeExtraFloat(getCSSProperty(element, 'margin-right'));
  const marginLeft = removeExtraFloat(getCSSProperty(element, 'margin-left'));
  const margin = `${
    marginTop === CONSTANTS.STYLE_VALUES.ZERO_PX
      ? CONSTANTS.STYLE_VALUES.ZERO
      : marginTop
  } ${
    marginRight === CONSTANTS.STYLE_VALUES.ZERO_PX
      ? CONSTANTS.STYLE_VALUES.ZERO
      : marginRight
  } ${
    marginBottom === CONSTANTS.STYLE_VALUES.ZERO_PX
      ? CONSTANTS.STYLE_VALUES.ZERO
      : marginBottom
  } ${
    marginLeft === CONSTANTS.STYLE_VALUES.ZERO_PX
      ? CONSTANTS.STYLE_VALUES.ZERO
      : marginLeft
  }`;
  setCSSPropertyValueIf(
    element,
    'margin',
    margin,
    margin !== CONSTANTS.STYLE_VALUES.ZERO_MARGIN_PADDING,
  );

  // Padding 정보
  const paddingTop = removeExtraFloat(getCSSProperty(element, 'padding-top'));
  const paddingBottom = removeExtraFloat(
    getCSSProperty(element, 'padding-bottom'),
  );
  const paddingRight = removeExtraFloat(
    getCSSProperty(element, 'padding-right'),
  );
  const paddingLeft = removeExtraFloat(getCSSProperty(element, 'padding-left'));
  const padding = `${
    paddingTop === CONSTANTS.STYLE_VALUES.ZERO_PX
      ? CONSTANTS.STYLE_VALUES.ZERO
      : paddingTop
  } ${
    paddingRight === CONSTANTS.STYLE_VALUES.ZERO_PX
      ? CONSTANTS.STYLE_VALUES.ZERO
      : paddingRight
  } ${
    paddingBottom === CONSTANTS.STYLE_VALUES.ZERO_PX
      ? CONSTANTS.STYLE_VALUES.ZERO
      : paddingBottom
  } ${
    paddingLeft === CONSTANTS.STYLE_VALUES.ZERO_PX
      ? CONSTANTS.STYLE_VALUES.ZERO
      : paddingLeft
  }`;

  setCSSPropertyValueIf(
    element,
    'padding',
    padding,
    padding !== CONSTANTS.STYLE_VALUES.ZERO_MARGIN_PADDING,
  );

  // Min/Max Height and Width
  setCSSPropertyIf(
    element,
    'min-height',
    getCSSProperty(element, 'min-height') !== CONSTANTS.STYLE_VALUES.ZERO_PX,
  );
  setCSSPropertyIf(
    element,
    'max-height',
    getCSSProperty(element, 'max-height') !== CONSTANTS.STYLE_VALUES.NONE,
  );
  setCSSPropertyIf(
    element,
    'min-width',
    getCSSProperty(element, 'min-width') !== CONSTANTS.STYLE_VALUES.ZERO_PX,
  );
  setCSSPropertyIf(
    element,
    'max-width',
    getCSSProperty(element, 'max-width') !== CONSTANTS.STYLE_VALUES.NONE,
  );
}
