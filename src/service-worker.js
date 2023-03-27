// 익스텐션 설치 시 발생하는 이벤트 리스너
chrome.runtime.onInstalled.addListener(function (details) {
  // 익스텐션을 처음 설치한 경우
  if (details.reason === 'install') {
    console.log('install');
    // option.html 페이지를 생성함
    chrome.tabs.create({ url: 'option.html' });

    // 기본 설정 값을 저장함
    chrome.storage.sync.set({
      monitors: '17',
      resolutions: '1366x768',
      ccshow: '1',
      linkmode: '0',
      bgmode: '1',
      linetype: 'dashed',
      colortype: 'ff0000',
      bordersize: '2',
    });
  }
});

// 컨텍스트 메뉴 항목 생성 코드
chrome.contextMenus.create({
  id: 'dkinspectContextMenu', // 항목의 고유 ID
  title: '수동계산 팝업 열기', // 항목에 표시될 텍스트
  contexts: ['page', 'frame'], // 항목이 표시될 컨텍스트
});

// 컨텍스트 메뉴 항목 클릭 시 실행될 코드
chrome.contextMenus.onClicked.addListener((info, tab) => {
  // 항목의 고유 ID가 "dkinspectContextMenu"인 경우
  if (info.menuItemId === 'dkinspectContextMenu') {
    // 현재 탭에서 cals.js 파일을 실행함
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['js/cals.js'],
    });

    // 현재 탭에서 cals.css 파일을 삽입함
    chrome.scripting.insertCSS({
      target: { tabId: tab.id },
      files: ['css/cals.css'],
    });
  }
});

// 확장 아이콘 클릭 시 실행될 코드
chrome.action.onClicked.addListener(function (tab) {
  // 현재 탭이 구글 크롬 내부 페이지인 경우
  if (tab.url.startsWith('chrome://')) {
    alert('It does not work on Google Chrome internal pages.');
    return;
  }

  // 현재 탭에서 dkinspect.js 파일을 실행함
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['js/dkinspect.js'],
  });

  // 현재 탭에서 dkinspect.css 파일을 삽입함
  chrome.scripting.insertCSS({
    target: { tabId: tab.id },
    files: ['css/dkinspect.css'],
  });
});

// 백그라운드 스크립트에서 메시지 수신 시 실행될 코드
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // cmd 값이 'pause'인 경우
  if (request.cmd === 'pause') {
    sendResponse('Escape'); // esc 키 값 반환
  }
});
