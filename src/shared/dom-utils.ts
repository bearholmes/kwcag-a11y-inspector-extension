/**
 * DOM 유틸리티 함수 모음
 * 자주 사용되는 DOM 조작 함수들을 제공합니다.
 */

/**
 * ID로 요소 조회
 * @param id - 요소 ID
 * @returns 조회된 DOM 요소 또는 null
 */
export function $(id: string): HTMLElement | null {
  try {
    if (!id.trim()) {
      console.error('Element ID must be a non-empty string');
      return null;
    }
    return document.getElementById(id);
  } catch (error) {
    console.error(`Error in $() function: ${(error as Error).message}`, error);
    return null;
  }
}

/**
 * 요소 생성 옵션
 */
export interface CreateElementOptions {
  className?: string;
  textContent?: string;
  attrs?: Record<string, string>;
}

/**
 * 요소 생성 헬퍼
 * @param tag - 태그명
 * @param options - 요소 생성 옵션
 * @param options.className - 요소에 추가할 CSS 클래스명 (선택적)
 * @param options.textContent - 요소의 텍스트 내용 (선택적)
 * @param options.attrs - 요소에 설정할 속성들의 키-값 쌍 (선택적)
 * @returns 생성된 DOM 요소
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  { className, textContent, attrs = {} }: CreateElementOptions = {},
): HTMLElementTagNameMap[K] {
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
 * @param element - 대상 요소
 * @param text - 설정할 텍스트
 */
export function setTextContent(
  element: HTMLElement | null,
  text: string,
): void {
  if (!element || !(element instanceof HTMLElement)) {
    console.error('Invalid element provided to setTextContent');
    return;
  }
  element.textContent = text;
}

/**
 * 요소에 이벤트 리스너 추가 (안전한 방식)
 * @param element - 대상 요소
 * @param event - 이벤트 타입
 * @param handler - 이벤트 핸들러
 * @param options - 이벤트 리스너 옵션
 */
export function addEventListenerSafe<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | null,
  event: K,
  handler: (this: HTMLElement, ev: HTMLElementEventMap[K]) => unknown,
  options?: boolean | AddEventListenerOptions,
): void {
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
 * @param element - 대상 요소
 * @param show - true면 표시, false면 숨김, undefined면 토글
 */
export function toggleDisplay(
  element: HTMLElement | null,
  show?: boolean,
): void {
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
 * @param elements - 대상 요소 배열
 * @param className - 추가할 클래스명
 */
export function addClassToElements(
  elements: HTMLElement[],
  className: string,
): void {
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
 * @param elements - 대상 요소 배열
 * @param className - 제거할 클래스명
 */
export function removeClassFromElements(
  elements: HTMLElement[],
  className: string,
): void {
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
