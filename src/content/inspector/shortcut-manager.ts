/**
 * 단축키 관리자
 * Inspector의 일시정지/재개 기능을 단축키로 제어합니다.
 * @module inspector/shortcut-manager
 */

import { CONSTANTS } from './constants.ts';
import {
  getCurrentDocument,
  insertMessage,
  removeElement,
} from './dom-utils.ts';

/**
 * Inspector 인터페이스
 */
export interface Inspector {
  removeEventListeners: () => void;
  addEventListeners: () => void;
}

/**
 * 단축키 관리자 인터페이스
 */
export interface ShortcutManager {
  initialize: () => void;
  pause: () => boolean;
  resume: () => boolean;
  isPaused: () => boolean;
}

/**
 * 단축키 관리 객체를 생성하는 Factory 함수
 * @param inspector - Inspector 인스턴스
 * @returns 단축키 관리 객체
 */
export function createShortcutManager(inspector: Inspector): ShortcutManager {
  let isPaused = false;

  const shortcutManager: ShortcutManager = {
    /**
     * 단축키 초기화
     * Escape 키로 Inspector를 일시정지/재개할 수 있도록 설정
     */
    initialize(): void {
      try {
        chrome.runtime.sendMessage(
          { cmd: 'pause' },
          function (response: string) {
            if (chrome.runtime.lastError) {
              console.warn(
                '단축키 초기화 오류:',
                chrome.runtime.lastError.message,
              );
              return;
            }

            window.addEventListener(
              'keyup',
              function (e: KeyboardEvent) {
                if (e.key === response) {
                  if (isPaused) {
                    shortcutManager.resume();
                  } else {
                    shortcutManager.pause();
                  }
                }
              },
              false,
            );
          },
        );
      } catch (error) {
        console.error('단축키 초기화 실패:', error);
      }
    },

    /**
     * Inspector 일시정지
     * 이벤트 리스너를 제거하고 일시정지 메시지를 표시
     * @returns 성공 여부
     */
    pause(): boolean {
      console.log('pause');

      const document = getCurrentDocument();
      const block = document.getElementById('dkInspect_block');

      if (block) {
        inspector.removeEventListeners();
        isPaused = true;

        insertMessage('일시정지');
        setTimeout(function () {
          removeElement('dkInspectInsertMessage');
        }, CONSTANTS.TIMING.MESSAGE_DISPLAY);

        return true;
      }

      return false;
    },

    /**
     * Inspector 재개
     * 이벤트 리스너를 다시 추가하고 재개 메시지를 표시
     * @returns 성공 여부
     */
    resume(): boolean {
      console.log('resume');

      const document = getCurrentDocument();
      const block = document.getElementById('dkInspect_block');

      if (block) {
        inspector.addEventListeners();
        isPaused = false;

        insertMessage('재개');
        setTimeout(function () {
          removeElement('dkInspectInsertMessage');
        }, CONSTANTS.TIMING.MESSAGE_DISPLAY);

        return true;
      }

      return false;
    },

    /**
     * 현재 일시정지 상태 확인
     * @returns 일시정지 상태
     */
    isPaused(): boolean {
      return isPaused;
    },
  };

  return shortcutManager;
}

// shortcutManager는 나중에 inspector와 함께 초기화됩니다
let shortcutManager: ShortcutManager | undefined;

/**
 * 단축키 관리자 설정
 * @param manager - 생성된 단축키 관리자
 */
export function setShortcutManager(manager: ShortcutManager): void {
  shortcutManager = manager;
}
