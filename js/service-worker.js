/*!
 * BASE on CSSViewer, CSSViewer 기반으로 작성되었습니다.
 * CSSViewer, A Google Chrome Extension for fellow web developers, web designers, and hobbyists.
 *
 * https://github.com/miled/cssviewer
 * https://chrome.google.com/webstore/detail/cssviewer/ggfgijbpiheegefliciemofobhmofgce
 *
 * Copyright (c) 2006, 2008 Nicolas Huon
 *
 * This source code is licensed under the GNU General Public License,
 * Version 2. See the file COPYING for more details.
 */

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function (details) {
  console.log('onInstalled');
  if (details.reason === 'install') {
    console.log('install');
    chrome.tabs.create({ url: 'option.html' });
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

chrome.contextMenus.create({
  id: "dkinspectContextMenu",
  title: "수동계산 팝업 열기",
  contexts: ["page", "frame"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "dkinspectContextMenu") {
    console.log("My Context Menu clicked!");
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['js/cals.js']
    });
    chrome.scripting.insertCSS({
      target: {tabId: tab.id},
      files: ['css/cals.css']
    });
  }
});

// browserAction.onClicked event listener
chrome.action.onClicked.addListener(function (tab) {
  if (tab.url.startsWith('chrome://')) {
    alert('It does not work on Google Chrome internal pages.');
    return;
  }

  chrome.scripting.executeScript({
    target: {tabId: tab.id},
    files: ['js/dkinspect.js']
  });
  chrome.scripting.insertCSS({
    target: {tabId: tab.id},
    files: ['css/dkinspect.css']
  });
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.cmd === 'pause') {
    sendResponse('Escape'); //esc
  }
});
