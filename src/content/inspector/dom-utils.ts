/**
 * Inspector DOM 유틸리티 함수
 * Inspector 모듈에서 사용되는 DOM 조작 및 메시지 표시 함수들을 제공합니다.
 * @module inspector/dom-utils
 */

import { CONSTANTS } from './constants.ts';

/**
 * 현재 문서 객체를 반환하는 함수
 * @returns window.document 객체
 */
export function getCurrentDocument(): Document {
  return window.document;
}

/**
 * 화면에 메시지를 표시하는 함수
 * 좌측 상단에 고정된 메시지 박스를 생성하여 표시합니다.
 * @param msg - 표시할 메시지 텍스트
 */
export function insertMessage(msg: string): void {
  const document = getCurrentDocument();
  const messageEl = document.createElement('p');
  const textNode = document.createTextNode(msg);

  messageEl.appendChild(textNode);
  messageEl.id = 'dkInspectInsertMessage';
  messageEl.style.backgroundColor = CONSTANTS.COLOR.MESSAGE_BG;
  messageEl.style.color = CONSTANTS.COLOR.MESSAGE_TEXT;
  messageEl.style.position = 'fixed';
  messageEl.style.top = `${CONSTANTS.UI.POSITION_MIN}px`;
  messageEl.style.left = `${CONSTANTS.UI.POSITION_MIN}px`;
  messageEl.style.zIndex = CONSTANTS.UI.Z_INDEX_MAX;
  messageEl.style.padding = '5px';
  messageEl.style.fontSize = '14px';
  messageEl.style.fontWeight = 'bold';

  const bodyEl = document.getElementsByTagName('BODY')[0];
  if (bodyEl) {
    bodyEl.appendChild(messageEl);
  }
}

/**
 * 지정된 ID를 가진 요소를 DOM에서 제거하는 함수
 * @param elementId - 제거할 요소의 ID
 */
export function removeElement(elementId: string): void {
  const document = getCurrentDocument();
  const element = document.getElementById(elementId);

  if (element) {
    const bodyEl = document.getElementsByTagName('BODY')[0];
    if (bodyEl) {
      bodyEl.removeChild(element);
    }
  }
}

/**
 * 목표 크기 측정 결과 타입
 */
export interface TargetSizeResult {
  /** 너비 (CSS 픽셀) */
  width: number;
  /** 높이 (CSS 픽셀) */
  height: number;
  /** WCAG 2.5.8 (AA) 준수 여부 - 24×24 CSS px */
  meetsWCAG258: boolean;
  /** WCAG 2.5.5 (AAA) 준수 여부 - 44×44 CSS px */
  meetsWCAG255: boolean;
}

/**
 * 요소의 CSS 픽셀 크기를 측정하고 WCAG 목표 크기 기준 준수 여부를 확인하는 함수
 * HiDPI, 페이지 줌과 무관하게 CSS 픽셀만 측정합니다.
 *
 * @param element - 측정할 HTML 요소
 * @returns 목표 크기 측정 결과
 *
 * @example
 * const button = document.querySelector('button');
 * const result = getTargetSize(button);
 * console.log(result.meetsWCAG258); // true or false
 */
export function getTargetSize(element: HTMLElement): TargetSizeResult {
  const rect = element.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;

  return {
    width,
    height,
    meetsWCAG258:
      width >= CONSTANTS.ACCESSIBILITY.WCAG_258_CSS_PX &&
      height >= CONSTANTS.ACCESSIBILITY.WCAG_258_CSS_PX,
    meetsWCAG255:
      width >= CONSTANTS.ACCESSIBILITY.WCAG_255_CSS_PX &&
      height >= CONSTANTS.ACCESSIBILITY.WCAG_255_CSS_PX,
  };
}
