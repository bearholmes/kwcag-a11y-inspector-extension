/**
 * Inspector DOM 유틸리티 함수
 * Inspector 모듈에서 사용되는 DOM 조작 및 메시지 표시 함수들을 제공합니다.
 * @module inspector/dom-utils
 */

import { CONSTANTS } from './constants.js';

/**
 * 현재 문서 객체를 반환하는 함수
 * @returns {Document} window.document 객체
 */
export function getCurrentDocument() {
  return window.document;
}

/**
 * 화면에 메시지를 표시하는 함수
 * 좌측 상단에 고정된 메시지 박스를 생성하여 표시합니다.
 * @param {string} msg - 표시할 메시지 텍스트
 */
export function insertMessage(msg) {
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
 * @param {string} elementId - 제거할 요소의 ID
 */
export function removeElement(elementId) {
  const document = getCurrentDocument();
  const element = document.getElementById(elementId);

  if (element) {
    const bodyEl = document.getElementsByTagName('BODY')[0];
    if (bodyEl) {
      bodyEl.removeChild(element);
    }
  }
}
