chrome.runtime.onInstalled.addListener(details => {
  try {
    if (details.reason === 'install') {
      console.log('[KWCAG Inspector] Extension installed');
      chrome.tabs.create({
        url: 'option.html'
      }).catch(error => {
        console.error('[KWCAG Inspector] Failed to open options page:', error);
      });
      const defaultSettings = {
        monitors: '17',
        resolutions: '1366x768',
        ccshow: '1',
        linkmode: '0',
        bgmode: '1',
        linetype: 'dashed',
        colortype: 'ff0000',
        bordersize: '2'
      };
      chrome.storage.sync.set(defaultSettings).catch(error => {
        console.error('[KWCAG Inspector] Failed to save default settings:', error);
      });
    } else if (details.reason === 'update') {
      console.log(`[KWCAG Inspector] Extension updated from ${details.previousVersion}`);
    }
  } catch (error) {
    console.error('[KWCAG Inspector] Error in onInstalled listener:', error);
  }
});
try {
  chrome.contextMenus.create({
    id: 'dkinspectContextMenu',
    title: '수동계산 팝업 열기',
    contexts: ['page', 'frame']
  });
} catch (error) {
  console.error('[KWCAG Inspector] Failed to create context menu:', error);
}
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  try {
    if (info.menuItemId === 'dkinspectContextMenu') {
      if (!tab?.id) {
        console.error('[KWCAG Inspector] Invalid tab ID');
        return;
      }
      await chrome.scripting.executeScript({
        target: {
          tabId: tab.id
        },
        files: ['js/cals.js']
      });
      await chrome.scripting.insertCSS({
        target: {
          tabId: tab.id
        },
        files: ['css/cals.css']
      });
      console.log('[KWCAG Inspector] Calculator popup injected');
    }
  } catch (error) {
    console.error('[KWCAG Inspector] Error in context menu handler:', error);
    if (error.message?.includes('Cannot access')) {
      console.warn('[KWCAG Inspector] Cannot inject script on this page (restricted)');
    }
  }
});
chrome.action.onClicked.addListener(async tab => {
  try {
    if (tab.url?.startsWith('chrome://') || tab.url?.startsWith('edge://')) {
      alert('Chrome/Edge 내부 페이지에서는 동작하지 않습니다.');
      return;
    }
    if (tab.url?.includes('chrome.google.com/webstore') || tab.url?.includes('microsoftedge.microsoft.com/addons')) {
      alert('스토어 페이지에서는 동작하지 않습니다.');
      return;
    }
    if (!tab?.id) {
      console.error('[KWCAG Inspector] Invalid tab ID');
      return;
    }
    await chrome.scripting.executeScript({
      target: {
        tabId: tab.id
      },
      files: ['js/dkinspect.js']
    });
    await chrome.scripting.insertCSS({
      target: {
        tabId: tab.id
      },
      files: ['css/dkinspect.css']
    });
    console.log('[KWCAG Inspector] Inspector activated');
  } catch (error) {
    console.error('[KWCAG Inspector] Error in action click handler:', error);
    if (error.message?.includes('Cannot access')) {
      alert('이 페이지에서는 확장프로그램을 사용할 수 없습니다.\n(권한이 제한된 페이지입니다)');
    } else {
      alert('확장프로그램 실행 중 오류가 발생했습니다.\n콘솔을 확인해주세요.');
    }
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  try {
    if (request.cmd === 'pause') {
      sendResponse('Escape');
      return true;
    }
    console.warn('[KWCAG Inspector] Unknown command:', request.cmd);
    sendResponse({
      error: 'Unknown command'
    });
  } catch (error) {
    console.error('[KWCAG Inspector] Error in message handler:', error);
    sendResponse({
      error: error.message
    });
  }
  return true;
});
//# sourceMappingURL=service-worker.js.map