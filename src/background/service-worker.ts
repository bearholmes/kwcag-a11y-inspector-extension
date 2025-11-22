/**
 * KWCAG A11y Inspector - Service Worker
 * Chrome Extension의 백그라운드 스크립트
 * @module service-worker
 */

import { StorageManager } from '../shared/storage-utils.ts';

/**
 * 기본 설정 값
 */
interface DefaultSettings {
  monitors: string;
  resolutions: string;
  ccshow: string;
  boxshow: string;
  linkmode: string;
  bgmode: string;
  linetype: string;
  colortype: string;
  bordersize: string;
  [key: string]: string; // Index signature for compatibility with Record<string, unknown>
}

/**
 * 사용자에게 알림을 표시하는 헬퍼 함수
 * @param message - 표시할 메시지
 */
function showNotification(message: string): void {
  chrome.notifications
    .create({
      type: 'basic',
      iconUrl: 'assets/icons/48.png',
      title: 'KWCAG A11y Inspector',
      message: message,
    })
    .catch((e) => console.error('[KWCAG Inspector]', e));
}

/**
 * 익스텐션 설치 또는 업데이트 시 발생하는 이벤트 처리
 * @listens chrome.runtime#onInstalled
 */
chrome.runtime.onInstalled.addListener((details) => {
  try {
    // 익스텐션을 처음 설치한 경우
    if (details.reason === 'install') {
      // 옵션 페이지를 새 탭으로 열기
      chrome.tabs.create({ url: 'options/settings.html' }).catch((error) => {
        console.error('[KWCAG Inspector] Failed to open options page:', error);
      });

      // 기본 설정 값 저장
      const defaultSettings: DefaultSettings = {
        monitors: '17',
        resolutions: '1366x768',
        ccshow: '0',
        boxshow: '1',
        linkmode: '0',
        bgmode: '1',
        linetype: 'dashed',
        colortype: 'ff0000',
        bordersize: '2',
      };

      StorageManager.setMultiple(defaultSettings).catch((error) => {
        console.error(
          '[KWCAG Inspector] Failed to save default settings:',
          error,
        );
      });
    }

    // 컨텍스트 메뉴 항목 생성
    // 우클릭 시 수동 계산기 팝업을 열 수 있는 메뉴 추가
    chrome.contextMenus.create({
      id: 'dkinspectContextMenu',
      title: '수동계산 팝업 열기',
      contexts: ['page', 'frame'],
    });
  } catch (error) {
    console.error('[KWCAG Inspector] Error in onInstalled listener:', error);
  }
});

/**
 * 컨텍스트 메뉴 클릭 이벤트 처리
 * @listens chrome.contextMenus#onClicked
 * @param info - 클릭 정보
 * @param tab - 현재 탭 정보
 */
chrome.contextMenus.onClicked.addListener(
  async (info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
    try {
      // 수동계산 팝업 메뉴 클릭 시
      if (info.menuItemId === 'dkinspectContextMenu') {
        // 탭 ID 유효성 검사
        if (!tab?.id) {
          console.error('[KWCAG Inspector] Invalid tab ID');
          return;
        }

        // calculator.js 스크립트 주입
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            import(chrome.runtime.getURL('content/calculator.js'));
          },
        });

        // calculator.css 스타일시트 주입
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ['calculator.css'],
        });
      }
    } catch (error) {
      console.error('[KWCAG Inspector] Error in context menu handler:', error);

      // Chrome 내부 페이지 또는 권한 없는 페이지인 경우
      if ((error as Error).message?.includes('Cannot access')) {
        console.warn(
          '[KWCAG Inspector] Cannot inject script on this page (restricted)',
        );
      }
    }
  },
);

/**
 * 확장 아이콘 클릭 이벤트 처리
 * 메인 인스펙터를 활성화/비활성화
 * @listens chrome.action#onClicked
 * @param tab - 현재 탭 정보
 */
chrome.action.onClicked.addListener(async (tab: chrome.tabs.Tab) => {
  try {
    // Chrome 내부 페이지 체크
    if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://')) {
      showNotification('Chrome/Edge 내부 페이지에서는 동작하지 않습니다.');
      return;
    }

    // Chrome Web Store 페이지 체크
    if (
      tab.url?.includes('chrome.google.com/webstore') ||
      tab.url?.includes('microsoftedge.microsoft.com/addons')
    ) {
      showNotification('스토어 페이지에서는 동작하지 않습니다.');
      return;
    }

    // 탭 ID 유효성 검사
    if (!tab?.id) {
      console.error('[KWCAG Inspector] Invalid tab ID');
      return;
    }

    // inspector.js 스크립트 주입
    // 타임스탬프를 추가하여 모듈 캐싱 방지 (매번 IIFE 재실행)
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        import(
          chrome.runtime.getURL('content/inspector.js') + '?t=' + Date.now()
        );
      },
    });

    // inspector.css 스타일시트 주입
    await chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['inspector.css'],
    });
  } catch (error) {
    console.error('[KWCAG Inspector] Error in action click handler:', error);

    // 사용자에게 친절한 에러 메시지 표시
    if ((error as Error).message?.includes('Cannot access')) {
      showNotification(
        '이 페이지에서는 확장프로그램을 사용할 수 없습니다.\n(권한이 제한된 페이지입니다)',
      );
    } else {
      showNotification(
        '확장프로그램 실행 중 오류가 발생했습니다.\n콘솔을 확인해주세요.',
      );
    }
  }
});

/**
 * 메시지 수신 이벤트 처리
 * Content Script와의 통신을 위한 메시지 리스너
 * @listens chrome.runtime#onMessage
 * @param request - 요청 메시지
 * @param sender - 메시지 발신자
 * @param sendResponse - 응답 함수
 * @returns true를 반환하면 비동기 응답 가능
 */
chrome.runtime.onMessage.addListener(
  (
    request: { cmd: string },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void,
  ): boolean => {
    try {
      // ESC 키 일시정지 명령 처리
      if (request.cmd === 'pause') {
        sendResponse('Escape');
        return true;
      }

      // 알 수 없는 명령어
      console.warn('[KWCAG Inspector] Unknown command:', request.cmd);
      sendResponse({ error: 'Unknown command' });
    } catch (error) {
      console.error('[KWCAG Inspector] Error in message handler:', error);
      sendResponse({ error: (error as Error).message });
    }

    return true; // 비동기 응답 지원
  },
);
