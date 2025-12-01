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
 * 단축키 관리자 인터페이스
 */
export interface ShortcutManager {
  initialize: () => void;
  pause: () => boolean;
  resume: () => boolean;
  isPaused: () => boolean;
  cleanup: () => void;
}

/**
 * 전역 상태를 위한 Window 인터페이스 확장
 */
declare global {
  interface Window {
    __kwcagShortcutState?: {
      keyupHandler: ((e: KeyboardEvent) => void) | null;
      isPaused: boolean;
      shortcutManager: ShortcutManager | null;
      isInitializing: boolean;
    };
  }
}

/**
 * 단축키 관리 객체를 생성하는 Factory 함수
 * @returns 단축키 관리 객체
 */

// Pause 키는 항상 Escape (하드코딩하여 race condition 방지)
const PAUSE_KEY = 'Escape';

// 전역 상태를 window 객체에 저장 (모듈 간 공유)
function getGlobalState() {
  if (!window.__kwcagShortcutState) {
    window.__kwcagShortcutState = {
      keyupHandler: null,
      isPaused: false,
      shortcutManager: null,
      isInitializing: false,
    };
  }
  return window.__kwcagShortcutState;
}

export function createShortcutManager(): ShortcutManager {
  const shortcutManager: ShortcutManager = {
    /**
     * 단축키 초기화
     * Escape 키로 Inspector를 일시정지/재개할 수 있도록 설정
     */
    initialize(): void {
      try {
        const state = getGlobalState();

        // 이미 초기화 중이면 대기
        if (state.isInitializing) {
          return;
        }

        state.isInitializing = true;

        // 전역 핸들러가 이미 있으면 먼저 제거 (중복 방지)
        if (state.keyupHandler) {
          window.removeEventListener('keyup', state.keyupHandler, false);
          state.keyupHandler = null;
        }

        // 현재 shortcutManager를 전역에 저장
        state.shortcutManager = shortcutManager;
        state.isPaused = false; // 재활성화 시 일시정지 상태 초기화

        // 전역 핸들러 생성 - window.__kwcagShortcutState 사용
        state.keyupHandler = function (e: KeyboardEvent) {
          const currentState = getGlobalState();
          if (e.key === PAUSE_KEY && currentState.shortcutManager) {
            if (currentState.isPaused) {
              currentState.shortcutManager.resume();
            } else {
              currentState.shortcutManager.pause();
            }
          }
        };

        window.addEventListener('keyup', state.keyupHandler, false);
        state.isInitializing = false;
      } catch (error) {
        console.error('단축키 초기화 실패:', error);
        getGlobalState().isInitializing = false;
      }
    },

    /**
     * Inspector 일시정지
     * 이벤트 리스너를 제거하고 일시정지 메시지를 표시
     * @returns 성공 여부
     */
    pause(): boolean {
      const document = getCurrentDocument();
      const block = document.querySelector('.a11y-inspector');

      if (block) {
        // 전역에서 현재 활성화된 inspector 가져오기
        const currentInspector = window.__kwcagInspector?.inspector;
        if (!currentInspector) {
          return false;
        }

        currentInspector.removeEventListeners();
        getGlobalState().isPaused = true;

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
      const document = getCurrentDocument();
      const block = document.querySelector('.a11y-inspector');

      if (block) {
        // 전역에서 현재 활성화된 inspector 가져오기
        const currentInspector = window.__kwcagInspector?.inspector;
        if (!currentInspector) {
          return false;
        }

        currentInspector.addEventListeners();
        getGlobalState().isPaused = false;

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
      return getGlobalState().isPaused;
    },

    /**
     * 단축키 정리
     * 이벤트 리스너를 제거하고 상태를 초기화
     */
    cleanup(): void {
      const state = getGlobalState();
      if (state.keyupHandler) {
        window.removeEventListener('keyup', state.keyupHandler, false);
        state.keyupHandler = null;
      }
      state.isPaused = false;
      state.shortcutManager = null;
      state.isInitializing = false;
    },
  };

  return shortcutManager;
}
