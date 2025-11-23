/**
 * 이벤트 핸들러
 * 마우스 이벤트를 처리하고 요소 하이라이팅 및 정보 표시를 담당합니다.
 * @module inspector/event-handlers
 */

import { CONSTANTS } from './constants.ts';
import {
  updateColorBackground,
  updateLength,
  updateBox,
  updateTargetSize,
  hideCSSCategory,
} from './css-handlers.ts';
import { getCurrentDocument, removeElement } from './dom-utils.ts';
import { InspectorOptions } from './inspector-core.ts';

/**
 * 이벤트 핸들러 인터페이스
 */
export interface EventHandlers {
  handleMouseOver: (this: HTMLElement, e: MouseEvent) => void;
  handleMouseOut: (this: HTMLElement, e: MouseEvent) => void;
  handleMouseMove: (this: HTMLElement, e: MouseEvent) => void;
}

/**
 * 요소의 왼쪽 위치를 계산 (스크롤 오프셋 포함)
 * @param element - 대상 요소
 * @returns 요소의 절대 왼쪽 위치
 */
function getLeft(element: HTMLElement): number {
  const boundingRect = element.getBoundingClientRect();
  const left = boundingRect.left || 0;
  const documentOffsetLeft = document.body.ownerDocument!.defaultView!.scrollX;
  const offsetLeft =
    document.body.getBoundingClientRect().left +
    window.scrollX -
    document.documentElement.clientLeft;
  return left + documentOffsetLeft - offsetLeft;
}

/**
 * 요소의 상단 위치를 계산 (스크롤 오프셋 포함)
 * @param element - 대상 요소
 * @returns 요소의 절대 상단 위치
 */
function getTop(element: HTMLElement): number {
  const boundingRect = element.getBoundingClientRect();
  const top = boundingRect.top || 0;
  const documentOffsetTop = document.body.ownerDocument!.defaultView!.scrollY;
  const offsetTop =
    document.body.getBoundingClientRect().top +
    window.scrollY -
    document.documentElement.clientTop;
  return top + documentOffsetTop - offsetTop;
}

/**
 * 요소의 너비를 반환
 * @param element - 대상 요소
 * @returns 요소의 너비
 */
function getWidth(element: HTMLElement): number {
  const boundingRect = element.getBoundingClientRect();
  return boundingRect.width || 0;
}

/**
 * 요소의 높이를 반환
 * @param element - 대상 요소
 * @returns 요소의 높이
 */
function getHeight(element: HTMLElement): number {
  const boundingRect = element.getBoundingClientRect();
  return boundingRect.height || 0;
}

/**
 * 현재 요소에서 가장 가까운 인터랙티브 조상 요소를 찾습니다
 * @param element - 시작 요소
 * @returns 인터랙티브 조상 요소 또는 null
 */
function findInteractiveAncestor(element: HTMLElement): HTMLElement | null {
  let current = element.parentElement;
  while (current && current.tagName.toLowerCase() !== 'body') {
    const tagName = current.tagName.toLowerCase();
    if (CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(tagName)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * 요소가 현재 뷰포트 내에 있는지 확인
 * @param element - 확인할 요소
 * @returns 뷰포트 내에 있으면 true
 */
function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * 이벤트 핸들러를 생성하는 Factory 함수
 * opt 설정을 closure로 capture하여 이벤트 핸들러에서 사용
 * @param opt - 설정 객체
 * @returns 이벤트 핸들러 객체
 */
export function createEventHandlers(opt: InspectorOptions): EventHandlers {
  // 마지막으로 hover한 요소를 추적하여 중복 업데이트 방지
  let lastHoveredElement: HTMLElement | null = null;

  // mousemove throttling을 위한 변수
  let isUpdatingPosition = false;

  /**
   * 마우스 오버 이벤트 핸들러
   * 요소 위에 마우스를 올렸을 때 요소를 강조하고 정보를 표시
   * @param e - 마우스 이벤트 객체
   * @this HTMLElement 이벤트가 발생한 요소
   */
  function handleMouseOver(this: HTMLElement, e: MouseEvent): void {
    const document = getCurrentDocument();
    const block = document.querySelector(
      '.a11y-inspector',
    ) as HTMLElement | null;
    const trackingEl = document.querySelector(
      '.a11y-inspector-tracking',
    ) as HTMLElement | null;

    if (!block) {
      return;
    }

    // 인스펙터 자체 UI 요소는 무시
    if (this.id && this.id.startsWith('dkInspect')) {
      return;
    }

    // 같은 요소에 대한 중복 처리 방지
    if (this === lastHoveredElement) {
      return;
    }

    if (this.tagName.toLowerCase() !== 'body') {
      if (opt.trackingmode) {
        // Tracking mode는 항상 interactive 요소만 추적
        const tagName = this.tagName.toLowerCase();
        const isInteractive = CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName);

        let targetElement: HTMLElement | null;

        if (isInteractive) {
          // 현재 요소가 interactive면 현재 요소 타겟팅
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          targetElement = this;
        } else {
          // 가장 가까운 인터랙티브 조상 요소 찾기
          targetElement = findInteractiveAncestor(this);
        }

        // targetElement가 있을 때만 tracking div 표시
        if (
          targetElement &&
          !(e.target as HTMLElement).classList.contains(
            'a11y-inspector-tracking',
          )
        ) {
          trackingEl!.style.width = `${parseInt(String(getWidth(targetElement)))}px`;
          trackingEl!.style.height = `${parseInt(String(getHeight(targetElement)))}px`;
          trackingEl!.style.left = `${parseInt(String(getLeft(targetElement)))}px`;
          trackingEl!.style.top = `${parseInt(String(getTop(targetElement)))}px`;
          trackingEl!.style.display = 'block';
          lastHoveredElement = targetElement;
        } else {
          // interactive 요소가 아니면 tracking div 숨김
          if (trackingEl) trackingEl.style.display = 'none';
          lastHoveredElement = null;
        }
      } else {
        // 이전 요소의 outline 제거
        if (lastHoveredElement) {
          lastHoveredElement.style.outlineWidth = '';
          lastHoveredElement.style.outlineColor = '';
          lastHoveredElement.style.outlineStyle = '';
          lastHoveredElement.style.outlineOffset = '';
        }

        // Non-tracking mode
        // trackingmode와 linkmode가 동기화되어야 하지만, 과거 설정 호환을 위해 둘 다 체크
        const isLinkModeOn = opt.trackingmode || String(opt.linkmode) === '1';
        let shouldShowOutline = true;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        let targetElement: HTMLElement = this;

        if (isLinkModeOn) {
          // Link 모드 ON: 인터랙티브 요소이거나 조상이 인터랙티브 요소일 때만 아웃라인 표시
          const tagName = this.tagName.toLowerCase();
          const isInteractive =
            CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName);

          if (isInteractive) {
            // 현재 요소가 interactive면 현재 요소에 outline
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            targetElement = this;
          } else {
            // 가장 가까운 인터랙티브 조상 요소 찾기
            const interactiveAncestor = findInteractiveAncestor(this);
            if (interactiveAncestor) {
              // 조상이 interactive면 조상에 outline
              targetElement = interactiveAncestor;
            } else {
              // 조상 중에 interactive 없으면 outline 없음
              shouldShowOutline = false;
            }
          }
        }
        // linkmode === '0' (OFF)이면 모든 요소에 outline 표시

        if (shouldShowOutline) {
          targetElement.style.setProperty(
            'outline-width',
            `${opt.bordersize}px`,
            'important',
          );
          targetElement.style.setProperty(
            'outline-color',
            opt.colortype,
            'important',
          );
          targetElement.style.setProperty(
            'outline-style',
            opt.linetype,
            'important',
          );
          targetElement.style.setProperty(
            'outline-offset',
            `-${opt.bordersize}px`,
            'important',
          );

          // outline을 설정한 요소를 lastHoveredElement로 설정
          lastHoveredElement = targetElement;
        } else {
          // outline을 설정하지 않으면 lastHoveredElement를 null로 설정
          lastHoveredElement = null;
        }
      }
    }

    // 요소 정보를 표시하는 함수 (일반 요소)
    const showElementInfo = (): void => {
      let title = `<${this.tagName}`;
      if ((this as HTMLInputElement).type) {
        title += ` [${(this as HTMLInputElement).type}]`;
      }
      title += `>${this.id === '' ? '' : ` #${this.id}`}${
        this.className === '' ? '' : ` .${this.className}`
      }`;
      block.firstChild!.textContent = title;

      const element = document.defaultView!.getComputedStyle(this, null);
      updateLength(element, opt, this);
      updateTargetSize(this, opt);

      if (String(opt.boxshow) === '1') {
        updateBox(element);
      } else {
        hideCSSCategory('pBox');
      }

      if (String(opt.ccshow) === '1') {
        updateColorBackground(element);
      } else {
        hideCSSCategory('pColorBg');
      }

      // display가 이미 block이 아닐 때만 변경 (DOM 변경 최소화)
      if (block.style.display !== 'block') {
        block.style.display = 'block';
      }
    };

    // 조상 요소 정보를 표시하는 함수
    const showAncestorInfo = (ancestorElement: HTMLElement): void => {
      let title = `<${ancestorElement.nodeName}`;
      if ((ancestorElement as HTMLInputElement).type) {
        title += ` [${(ancestorElement as HTMLInputElement).type}]`;
      }
      title += `>${ancestorElement.id === '' ? '' : ` #${ancestorElement.id}`}${
        ancestorElement.className === '' ? '' : ` .${ancestorElement.className}`
      }`;
      block.firstChild!.textContent = title;

      const element = document.defaultView!.getComputedStyle(
        ancestorElement,
        null,
      );
      updateLength(element, opt, ancestorElement);
      updateTargetSize(ancestorElement, opt);

      if (String(opt.boxshow) === '1') {
        updateBox(element);
      } else {
        hideCSSCategory('pBox');
      }

      if (String(opt.ccshow) === '1') {
        updateColorBackground(element);
      } else {
        hideCSSCategory('pColorBg');
      }

      // display가 이미 block이 아닐 때만 변경 (DOM 변경 최소화)
      if (block.style.display !== 'block') {
        block.style.display = 'block';
      }
    };

    if (opt.trackingmode) {
      if (!this.classList.contains('a11y-inspector-tracking')) {
        const tagName = this.tagName.toLowerCase();
        const interactiveAncestor = findInteractiveAncestor(this);

        if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
          showElementInfo();
        } else {
          block.style.display = 'none';
        }

        if (interactiveAncestor) {
          showAncestorInfo(interactiveAncestor);
          trackingEl!.style.display = 'block';
        }
      }
    } else if (String(opt.linkmode) === '1') {
      const tagName = this.tagName.toLowerCase();
      const interactiveAncestor = findInteractiveAncestor(this);

      if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
        showElementInfo();
      } else if (interactiveAncestor) {
        showAncestorInfo(interactiveAncestor);
      } else {
        block.style.display = 'none';
      }
    } else {
      // 링크 모드 OFF (모든 요소 모드) - 모든 요소의 정보 표시
      showElementInfo();
    }

    removeElement('dkInspectInsertMessage');
    e.stopPropagation();
  }

  /**
   * 마우스 아웃 이벤트 핸들러
   * 요소에서 마우스가 벗어났을 때 하이라이트 제거
   * @param e - 마우스 이벤트 객체
   * @this HTMLElement 이벤트가 발생한 요소
   */
  function handleMouseOut(this: HTMLElement, e: MouseEvent): void {
    const document = getCurrentDocument();
    const block = document.querySelector(
      '.a11y-inspector',
    ) as HTMLElement | null;

    // lastHoveredElement가 없으면 아무것도 할 필요 없음
    if (!lastHoveredElement) {
      return;
    }

    // 현재 요소가 lastHoveredElement의 자손인지 확인
    const isDescendantOfHovered = (element: HTMLElement): boolean => {
      let current: HTMLElement | null = element;
      while (current) {
        if (current === lastHoveredElement) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    };

    // 현재 요소 또는 조상이 lastHoveredElement인 경우에만 초기화
    const shouldClear =
      this === lastHoveredElement || isDescendantOfHovered(this);

    if (shouldClear) {
      if (opt.trackingmode) {
        const trackingEl = document.querySelector(
          '.a11y-inspector-tracking',
        ) as HTMLElement | null;
        if (this.classList.contains('a11y-inspector-tracking')) {
          trackingEl!.style.display = 'block';
        } else {
          if (trackingEl) trackingEl.style.display = 'none';
          // trackingmode에서도 팝업 숨기기
          if (block) block.style.display = 'none';
        }
      } else {
        // Non-tracking mode에서는 outline 제거
        lastHoveredElement.style.outlineWidth = '';
        lastHoveredElement.style.outlineColor = '';
        lastHoveredElement.style.outlineStyle = '';
        lastHoveredElement.style.outlineOffset = '';
        // 팝업도 함께 숨기기
        if (block) block.style.display = 'none';
      }
      lastHoveredElement = null;
    }

    e.stopPropagation();
  }

  /**
   * 마우스 이동 이벤트 핸들러
   * 정보 블록의 위치를 마우스 위치에 따라 조정
   * @param e - 마우스 이벤트 객체
   * @this HTMLElement 이벤트가 발생한 요소
   */
  function handleMouseMove(this: HTMLElement, e: MouseEvent): void {
    const document = getCurrentDocument();
    const block = document.querySelector(
      '.a11y-inspector',
    ) as HTMLElement | null;

    if (!block || block.style.display === 'none') {
      return;
    }

    // requestAnimationFrame으로 throttling
    if (!isUpdatingPosition) {
      isUpdatingPosition = true;
      requestAnimationFrame(() => {
        // 정보 블록 위치 설정
        const pageWidth = window.innerWidth;
        const pageHeight = window.innerHeight;
        const blockWidth = CONSTANTS.MEASUREMENT.BLOCK_WIDTH;
        const blockHeight = parseInt(
          document.defaultView!.getComputedStyle(block, null).height,
        );

        // 블록이 페이지 너비를 벗어나는 경우
        if (e.pageX + blockWidth > pageWidth) {
          if (e.pageX - blockWidth - CONSTANTS.UI.POSITION_MIN > 0) {
            block.style.left = `${e.pageX - blockWidth - CONSTANTS.UI.POSITION_OFFSET_LARGE}px`;
          } else {
            block.style.left = '0px';
          }
        } else {
          block.style.left = `${e.pageX + CONSTANTS.UI.POSITION_OFFSET}px`;
        }

        // 블록이 페이지 높이를 벗어나는 경우
        if (e.pageY + blockHeight > pageHeight) {
          if (e.pageY - blockHeight - CONSTANTS.UI.POSITION_MIN > 0) {
            block.style.top = `${e.pageY - blockHeight - CONSTANTS.UI.POSITION_OFFSET}px`;
          } else {
            block.style.top = '0px';
          }
        } else {
          block.style.top = `${e.pageY + CONSTANTS.UI.POSITION_OFFSET}px`;
        }

        // 블록이 화면에 보이지 않는 경우 스크롤 위치에 맞게 조정
        const inView = isElementInViewport(block);
        if (!inView) {
          block.style.top = `${window.scrollY + CONSTANTS.UI.POSITION_OFFSET}px`;
        }

        isUpdatingPosition = false;
      });
    }

    e.stopPropagation();
  }

  return {
    handleMouseOver,
    handleMouseOut,
    handleMouseMove,
  };
}
