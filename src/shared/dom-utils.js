/**
 * DOM 유틸리티 함수 모음
 * 자주 사용되는 DOM 조작 함수들을 제공합니다.
 */

/**
 * ID로 요소 조회
 * @param {string} id - 요소 ID
 * @returns {HTMLElement|null} 조회된 DOM 요소 또는 null
 */
export function $(id) {
  try {
    if (typeof id !== 'string' || !id.trim()) {
      console.error('Element ID must be a non-empty string');
      return null;
    }
    return document.getElementById(id);
  } catch (error) {
    console.error(`Error in $() function: ${error.message}`, error);
    return null;
  }
}

/**
 * 요소 생성 헬퍼
 * @param {string} tag - 태그명
 * @param {Object} options - 옵션
 * @param {string} [options.className] - CSS 클래스명
 * @param {string} [options.textContent] - 텍스트 내용
 * @param {Object} [options.attrs] - 속성 객체
 * @returns {HTMLElement} 생성된 DOM 요소
 */
export function createElement(
  tag,
  { className, textContent, attrs = {} } = {},
) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

/**
 * 안전하게 요소의 텍스트 내용 설정 (XSS 방지)
 * @param {HTMLElement} element - 대상 요소
 * @param {string} text - 설정할 텍스트
 */
export function setTextContent(element, text) {
  if (!element || !(element instanceof HTMLElement)) {
    console.error('Invalid element provided to setTextContent');
    return;
  }
  element.textContent = text;
}

/**
 * 안전하게 요소에 HTML 추가 (XSS 방지를 위해 textContent 사용 권장)
 * @deprecated HTML 주입 대신 createElement와 appendChild 사용을 권장합니다.
 * @param {HTMLElement} element - 대상 요소
 * @param {string} html - HTML 문자열
 */
export function setInnerHTML(element, html) {
  console.warn(
    'setInnerHTML is deprecated. Use createElement and appendChild instead.',
  );
  if (!element || !(element instanceof HTMLElement)) {
    console.error('Invalid element provided to setInnerHTML');
    return;
  }
  element.innerHTML = html;
}

/**
 * 요소에 이벤트 리스너 추가 (안전한 방식)
 * @param {HTMLElement} element - 대상 요소
 * @param {string} event - 이벤트 타입
 * @param {Function} handler - 이벤트 핸들러
 * @param {Object} [options] - 이벤트 리스너 옵션
 */
export function addEventListenerSafe(element, event, handler, options) {
  if (!element || !(element instanceof HTMLElement)) {
    console.error('Invalid element provided to addEventListenerSafe');
    return;
  }
  if (typeof handler !== 'function') {
    console.error('Handler must be a function');
    return;
  }
  element.addEventListener(event, handler, options);
}

/**
 * 요소 표시/숨김 토글
 * @param {HTMLElement} element - 대상 요소
 * @param {boolean} [show] - true면 표시, false면 숨김, undefined면 토글
 */
export function toggleDisplay(element, show) {
  if (!element || !(element instanceof HTMLElement)) {
    console.error('Invalid element provided to toggleDisplay');
    return;
  }
  if (show === undefined) {
    element.style.display = element.style.display === 'none' ? '' : 'none';
  } else {
    element.style.display = show ? '' : 'none';
  }
}

/**
 * 여러 요소에 CSS 클래스 추가
 * @param {HTMLElement[]} elements - 대상 요소 배열
 * @param {string} className - 추가할 클래스명
 */
export function addClassToElements(elements, className) {
  if (!Array.isArray(elements)) {
    console.error('elements must be an array');
    return;
  }
  elements.forEach((element) => {
    if (element && element instanceof HTMLElement) {
      element.classList.add(className);
    }
  });
}

/**
 * 여러 요소에서 CSS 클래스 제거
 * @param {HTMLElement[]} elements - 대상 요소 배열
 * @param {string} className - 제거할 클래스명
 */
export function removeClassFromElements(elements, className) {
  if (!Array.isArray(elements)) {
    console.error('elements must be an array');
    return;
  }
  elements.forEach((element) => {
    if (element && element instanceof HTMLElement) {
      element.classList.remove(className);
    }
  });
}
