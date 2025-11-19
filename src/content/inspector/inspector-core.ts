/**
 * Inspector 핵심 모듈
 * Inspector 클래스와 tracking 기능을 제공합니다.
 * @module inspector/inspector-core
 */

import { CONSTANTS } from './constants.ts';
import { createEventHandlers, EventHandlers } from './event-handlers.js';
import {
  getCurrentDocument,
  insertMessage,
  removeElement,
} from './dom-utils.ts';

/**
 * Inspector 설정 옵션
 */
export interface InspectorOptions {
  ccshow?: string;
  stdpx: number;
  linkmode: string;
  bgmode: string | number;
  linetype: string;
  colortype: string;
  trackingmode?: string;
  bordersize: string | number;
}

/**
 * CSS 속성 카테고리
 */
export interface Categories {
  [key: string]: string[];
}

/**
 * 카테고리 제목 맵
 */
export interface CategoriesTitle {
  [key: string]: string;
}

/**
 * Tracking 인터페이스
 */
export interface Tracking {
  generate: () => HTMLElement;
  setColor: (element: HTMLElement, hex: string) => void;
  hexToRGB: (hex: string, alpha?: number) => string;
}

/**
 * Tracking 객체를 생성하는 Factory 함수
 * @param opt - 설정 객체
 * @returns tracking 객체
 */
export function createTracking(opt: InspectorOptions): Tracking {
  return {
    /**
     * Tracking 요소를 생성
     * @returns tracking 요소
     */
    generate(): HTMLElement {
      const document = getCurrentDocument();
      let trackingEl: HTMLElement | undefined;
      if (document) {
        trackingEl = document.createElement('div');
        trackingEl.id = 'dkInspect_tracking';
        this.setColor(trackingEl, opt.colortype);
        trackingEl.style.setProperty(
          'outline-style',
          opt.linetype,
          'important',
        );
      }
      return trackingEl!;
    },

    /**
     * Tracking 요소의 테두리 색상 설정
     * @param element - 대상 요소
     * @param hex - 16진수 색상 코드
     */
    setColor(element: HTMLElement, hex: string): void {
      if (element) {
        element.style.setProperty('outline-color', hex, 'important');
        if (opt.bgmode) {
          element.style.setProperty(
            'background-color',
            this.hexToRGB(hex, 0.2),
            'important',
          );
        }
      }
    },

    /**
     * 16진수 색상 코드를 RGBA 색상값으로 변환
     * @param hex - 16진수 색상 코드
     * @param alpha - 알파값 (투명도)
     * @returns RGBA 색상 문자열
     */
    hexToRGB(hex: string, alpha: number = 1): string {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!result) {
        return `rgba(0, 0, 0, ${alpha})`;
      }
      const r = parseInt(result[1], 16);
      const g = parseInt(result[2], 16);
      const b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
  };
}

/**
 * Inspector 클래스 타입
 */
export interface InspectorInterface {
  opt: InspectorOptions;
  categories: Categories;
  categoriesTitle: CategoriesTitle;
  eventHandlers: EventHandlers;
  tracking: Tracking;
  createBlock: () => HTMLElement;
  getAllElements: (element: HTMLElement | null) => HTMLElement[];
  addEventListeners: () => boolean | void;
  removeEventListeners: () => void;
  isEnabled: () => boolean;
  enable: () => boolean;
  disable: () => boolean;
}

/**
 * Inspector 클래스
 * 페이지 요소 검사 및 정보 표시 기능을 제공합니다.
 * @param opt - 설정 객체
 * @param categories - CSS 속성 카테고리 맵
 * @param categoriesTitle - 카테고리 제목 맵
 */
export function Inspector(
  this: InspectorInterface,
  opt: InspectorOptions,
  categories: Categories,
  categoriesTitle: CategoriesTitle,
): void {
  this.opt = opt;
  this.categories = categories;
  this.categoriesTitle = categoriesTitle;
  this.eventHandlers = createEventHandlers(opt);
  this.tracking = createTracking(opt);

  /**
   * Inspector 정보 블록을 생성
   * @returns 생성된 블록 요소
   */
  this.createBlock = function (): HTMLElement {
    const document = getCurrentDocument();
    let block: HTMLElement | undefined;

    if (document) {
      block = document.createElement('div');
      block.id = 'dkInspect_block';

      // CSS 선택자 제목 추가
      const header = document.createElement('h1');
      header.appendChild(document.createTextNode(''));
      block.appendChild(header);

      // 속성 컨테이너 생성
      const center = document.createElement('div');
      center.id = 'dkInspect_center';

      // 모든 카테고리와 속성 추가
      for (const cat in this.categories) {
        const div = document.createElement('div');
        div.id = `dkInspect_${cat}`;
        div.className = 'dkInspect_category';

        // 카테고리 제목
        const h2 = document.createElement('h2');
        h2.appendChild(document.createTextNode(this.categoriesTitle[cat]));

        // 속성 목록
        const ul = document.createElement('ul');
        const properties = this.categories[cat];

        for (const item of properties) {
          const li = document.createElement('li');
          li.id = `dkInspect_${item}`;

          const spanName = document.createElement('span');
          spanName.className = 'dkInspect_property';

          const spanValue = document.createElement('span');

          spanName.appendChild(document.createTextNode(item));
          li.appendChild(spanName);
          li.appendChild(spanValue);
          ul.appendChild(li);
        }

        div.appendChild(h2);
        div.appendChild(ul);
        center.appendChild(div);
      }

      block.appendChild(center);
    }

    insertMessage('이 페이지에서 검사 할 요소 위로 포인터를 올려주세요.');
    return block!;
  };

  /**
   * 모든 하위 요소를 재귀적으로 가져오기
   * @param element - 시작 요소
   * @returns 모든 하위 요소 배열
   */
  this.getAllElements = function (element: HTMLElement | null): HTMLElement[] {
    let elements: HTMLElement[] = [];

    if (element && element.hasChildNodes()) {
      elements.push(element);
      const children = element.childNodes;
      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;
        if (child.hasChildNodes) {
          elements = elements.concat(this.getAllElements(child));
        } else if (child.nodeType === CONSTANTS.NODE_TYPE.ELEMENT) {
          elements.push(child);
        }
      }
    }
    return elements;
  };

  /**
   * 모든 요소에 이벤트 리스너 추가
   */
  this.addEventListeners = function (): boolean | void {
    const document = getCurrentDocument();
    const elements = this.getAllElements(document.body);

    try {
      // FRAMESET 체크
      if (
        window.frames.document &&
        window.frames.document.body &&
        window.frames.document.body.nodeName === 'FRAMESET'
      ) {
        alert('크롬 브라우저에서는 FRAMESET의 진단이 불가능합니다.');
        removeElement('dkInspectInsertMessage');
        return false;
      }
    } catch (error) {
      console.warn('프레임 접근 오류:', error);
    }

    // 이벤트 핸들러 추가
    elements.forEach((item) => {
      item.addEventListener(
        'mouseover',
        this.eventHandlers.handleMouseOver,
        false,
      );
      item.addEventListener(
        'mouseout',
        this.eventHandlers.handleMouseOut,
        false,
      );
      item.addEventListener(
        'mousemove',
        this.eventHandlers.handleMouseMove,
        false,
      );
    });

    // 프레임 처리
    if (window.frames.length > 0) {
      for (let k = 0; k < window.frames.length; k++) {
        try {
          const frameEl = window.frames[k].document.body;
          if (frameEl) {
            const frameEls = this.getAllElements(frameEl);
            frameEls.forEach((item) => {
              item.addEventListener(
                'mouseover',
                this.eventHandlers.handleMouseOver,
                false,
              );
              item.addEventListener(
                'mouseout',
                this.eventHandlers.handleMouseOut,
                false,
              );
              item.addEventListener(
                'mousemove',
                this.eventHandlers.handleMouseMove,
                false,
              );
            });
          }
        } catch (error) {
          console.warn(`프레임 ${k} 접근 오류:`, error);
        }
      }
    }
  };

  /**
   * 모든 요소에서 이벤트 리스너 제거
   */
  this.removeEventListeners = function (): void {
    const document = getCurrentDocument();
    const elements = this.getAllElements(document.body);

    elements.forEach((item) => {
      item.removeEventListener(
        'mouseover',
        this.eventHandlers.handleMouseOver,
        false,
      );
      item.removeEventListener(
        'mouseout',
        this.eventHandlers.handleMouseOut,
        false,
      );
      item.removeEventListener(
        'mousemove',
        this.eventHandlers.handleMouseMove,
        false,
      );
    });

    // 프레임 처리
    if (window.frames.length > 0) {
      for (let k = 0; k < window.frames.length; k++) {
        try {
          const frameEl = window.frames[k].document.body;
          if (frameEl) {
            const frameEls = this.getAllElements(frameEl);
            frameEls.forEach((item) => {
              item.removeEventListener(
                'mouseover',
                this.eventHandlers.handleMouseOver,
                false,
              );
              item.removeEventListener(
                'mouseout',
                this.eventHandlers.handleMouseOut,
                false,
              );
              item.removeEventListener(
                'mousemove',
                this.eventHandlers.handleMouseMove,
                false,
              );
            });
          }
        } catch (error) {
          console.warn(`프레임 ${k} 접근 오류:`, error);
        }
      }
    }
  };
}

/**
 * Inspector가 활성화되어 있는지 확인
 * @returns 활성화 여부
 */
Inspector.prototype.isEnabled = function (this: InspectorInterface): boolean {
  const document = getCurrentDocument();
  return !!document.getElementById('dkInspect_block');
};

/**
 * Inspector 활성화
 * @returns 활성화 성공 여부
 */
Inspector.prototype.enable = function (this: InspectorInterface): boolean {
  const document = getCurrentDocument();
  let block = document.getElementById('dkInspect_block');

  if (!block) {
    // BODY 요소가 없으면 생성
    if (!document.getElementsByTagName('BODY')[0]) {
      const body = document.createElement('BODY');
      document.documentElement.appendChild(body);
    }

    // 블록 생성 및 추가
    block = this.createBlock();
    document.getElementsByTagName('BODY')[0].appendChild(block);

    // Tracking 요소 생성 (tracking 모드인 경우)
    if (this.opt.trackingmode) {
      const trackingEl = this.tracking.generate();
      document.getElementsByTagName('BODY')[0].appendChild(trackingEl);
    }

    // 이벤트 리스너 추가
    this.addEventListeners();
    return true;
  }

  return false;
};

/**
 * Inspector 비활성화
 * @returns 비활성화 성공 여부
 */
Inspector.prototype.disable = function (this: InspectorInterface): boolean {
  const document = getCurrentDocument();
  const block = document.getElementById('dkInspect_block');
  const trackingEl = document.getElementById('dkInspect_tracking');

  if (block) {
    const bodyEl = document.getElementsByTagName('BODY')[0];
    if (bodyEl) {
      bodyEl.removeChild(block);
      if (this.opt.trackingmode && trackingEl) {
        bodyEl.removeChild(trackingEl);
      }
    }
    this.removeEventListeners();
    return true;
  }

  return false;
};
