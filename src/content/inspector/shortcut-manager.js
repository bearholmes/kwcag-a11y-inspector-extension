/**
 * 단축키 관리자
 * Inspector의 일시정지/재개 기능을 단축키로 제어합니다.
 * @module inspector/shortcut-manager
 */

import { CONSTANTS } from './constants.js';
import {
  getCurrentDocument,
  insertMessage,
  removeElement,
} from './dom-utils.js';

/**
 * 단축키 관리 객체를 생성하는 Factory 함수
 * @param {Inspector} inspector - Inspector 인스턴스
 * @returns {Object} 단축키 관리 객체
 */
export function createShortcutManager(inspector) {
  let isPaused = false;

  return {
    /**
     * 단축키 초기화
     * Escape 키로 Inspector를 일시정지/재개할 수 있도록 설정
     */
    initialize() {
      try {
        chrome.runtime.sendMessage({ cmd: 'pause' }, function (response) {
          if (chrome.runtime.lastError) {
            console.warn(
              '단축키 초기화 오류:',
              chrome.runtime.lastError.message,
            );
            return;
          }

          window.addEventListener(
            'keyup',
            function (e) {
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
        });
      } catch (error) {
        console.error('단축키 초기화 실패:', error);
      }
    },

    /**
     * Inspector 일시정지
     * 이벤트 리스너를 제거하고 일시정지 메시지를 표시
     * @returns {boolean} 성공 여부
     */
    pause() {
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
     * @returns {boolean} 성공 여부
     */
    resume() {
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
     * @returns {boolean} 일시정지 상태
     */
    isPaused() {
      return isPaused;
    },
  };
}

// shortcutManager는 나중에 inspector와 함께 초기화됩니다
let shortcutManager;

/**
 * 단축키 관리자 설정
 * @param {Object} manager - 생성된 단축키 관리자
 */
export function setShortcutManager(manager) {
  shortcutManager = manager;
}
