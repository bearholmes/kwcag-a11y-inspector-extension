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
  /**
   * 마우스 오버 이벤트 핸들러
   * 요소 위에 마우스를 올렸을 때 요소를 강조하고 정보를 표시
   * @param e - 마우스 이벤트 객체
   * @this HTMLElement 이벤트가 발생한 요소
   */
  function handleMouseOver(this: HTMLElement, e: MouseEvent): void {
    const document = getCurrentDocument();
    const block = document.getElementById('dkInspect_block');
    const trackingEl = document.getElementById('dkInspect_tracking');

    if (!block) {
      return;
    }

    if (this.tagName.toLowerCase() !== 'body') {
      if (opt.trackingmode) {
        if ((e.target as HTMLElement).id !== 'dkInspect_tracking') {
          trackingEl!.style.width = `${parseInt(String(getWidth(this)))}px`;
          trackingEl!.style.height = `${parseInt(String(getHeight(this)))}px`;
          trackingEl!.style.left = `${parseInt(String(getLeft(this)))}px`;
          trackingEl!.style.top = `${parseInt(String(getTop(this)))}px`;
          trackingEl!.style.display = 'block';
        }
      } else {
        this.style.setProperty(
          'outline-width',
          `${opt.bordersize}px`,
          'important',
        );
        this.style.setProperty('outline-color', opt.colortype, 'important');
        this.style.setProperty('outline-style', opt.linetype, 'important');
        this.style.setProperty(
          'outline-offset',
          `-${opt.bordersize}px`,
          'important',
        );
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
      updateBox(element);

      if (opt.ccshow === '1' || opt.ccshow === 1) {
        updateColorBackground(element);
      } else {
        hideCSSCategory('pColorBg');
      }

      block.style.display = 'block';
    };

    // 부모 요소 정보를 표시하는 함수
    const showParentInfo = (): void => {
      let title = `<${this.parentElement!.nodeName}`;
      if ((this.parentElement as HTMLInputElement).type) {
        title += ` [${(this.parentElement as HTMLInputElement).type}]`;
      }
      title += `>${
        this.parentElement!.id === '' ? '' : ` #${this.parentElement!.id}`
      }${
        this.parentElement!.className === ''
          ? ''
          : ` .${this.parentElement!.className}`
      }`;
      block.firstChild!.textContent = title;

      const element = document.defaultView!.getComputedStyle(
        this.parentElement!,
        null,
      );
      updateLength(element, opt, this.parentElement!);
      updateBox(element);

      if (opt.ccshow === '1' || opt.ccshow === 1) {
        updateColorBackground(element);
      } else {
        hideCSSCategory('pColorBg');
      }

      block.style.display = 'block';
    };

    if (opt.trackingmode) {
      if (this.id !== 'dkInspect_tracking') {
        const tagName = this.tagName.toLowerCase();
        const parentTagName = this.parentElement?.nodeName.toLowerCase();

        if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
          showElementInfo();
        } else {
          block.style.display = 'none';
        }

        if (
          parentTagName &&
          CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)
        ) {
          showParentInfo();
          trackingEl!.style.display = 'block';
        }
      }
    } else if (opt.linkmode === '1' || opt.linkmode === 1) {
      const tagName = this.tagName.toLowerCase();
      const parentTagName = this.parentElement?.nodeName.toLowerCase();

      if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
        showElementInfo();
      } else if (
        parentTagName &&
        CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)
      ) {
        showParentInfo();
      } else {
        block.style.display = 'none';
      }
    } else {
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
    if (opt.trackingmode) {
      const trackingEl = document.getElementById('dkInspect_tracking');
      if (this.id === 'dkInspect_tracking') {
        trackingEl!.style.display = 'block';
      } else {
        if (trackingEl) trackingEl.style.display = 'none';
      }
    } else {
      this.style.outlineWidth = '';
      this.style.outlineColor = '';
      this.style.outlineStyle = '';
      this.style.outlineOffset = '';
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
    const block = document.getElementById('dkInspect_block');
    const trackingEl = document.getElementById('dkInspect_tracking');

    if (!block) {
      return;
    }

    if (opt.trackingmode) {
      const tagName = this.tagName.toLowerCase();
      if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
        trackingEl!.style.display = 'block';
      } else {
        if (this.id === 'dkInspect_tracking') {
          trackingEl!.style.display = 'block';
        } else {
          const parentTagName = this.parentElement?.nodeName.toLowerCase();
          if (
            parentTagName &&
            CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)
          ) {
            trackingEl!.style.display = 'block';
          } else {
            trackingEl!.style.display = 'none';
          }
        }
      }
    } else if (opt.linkmode === '1' || opt.linkmode === 1) {
      const tagName = this.tagName.toLowerCase();
      const parentTagName = this.parentElement?.nodeName.toLowerCase();
      if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
        block.style.display = 'block';
      } else if (
        parentTagName &&
        CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)
      ) {
        block.style.display = 'block';
      } else {
        this.style.outlineWidth = '';
        this.style.outlineColor = '';
        this.style.outlineStyle = '';
        this.style.outlineOffset = '';
      }
    } else {
      block.style.display = 'block';
    }

    if (
      this.tagName.toLowerCase() === 'body' ||
      this.tagName.toLowerCase() === 'frame'
    ) {
      if (opt.trackingmode) {
        trackingEl!.style.display = 'none';
      }
    }

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
        block.style.left = `${
          e.pageX - blockWidth - CONSTANTS.UI.POSITION_OFFSET_LARGE
        }px`;
      } else {
        block.style.left = '0px';
      }
    } else {
      block.style.left = `${e.pageX + CONSTANTS.UI.POSITION_OFFSET}px`;
    }

    // 블록이 페이지 높이를 벗어나는 경우
    if (e.pageY + blockHeight > pageHeight) {
      if (e.pageY - blockHeight - CONSTANTS.UI.POSITION_MIN > 0) {
        block.style.top = `${
          e.pageY - blockHeight - CONSTANTS.UI.POSITION_OFFSET
        }px`;
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

    e.stopPropagation();
  }

  return {
    handleMouseOver,
    handleMouseOut,
    handleMouseMove,
  };
}
