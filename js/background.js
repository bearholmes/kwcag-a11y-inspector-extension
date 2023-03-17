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
  if (details.reason == 'install') {
    console.log('install');
    chrome.tabs.create({ url: 'option.html' });
    chrome.storage.local.set({
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

chrome.browserAction.onClicked.addListener(function (tab) {
  if (
    tab.url.indexOf('https://chrome.google.com') == 0 ||
    tab.url.indexOf('chrome://') == 0
  ) {
    alert('크롬 내부 페이지에서는 동작하지 않습니다.'); //It does not work on Google Chrome Internal pages
    return;
  }
  chrome.tabs.executeScript(tab.id, { file: 'js/dkinspect.js' });
  chrome.tabs.insertCSS(tab.id, { file: 'css/dkinspect.css' });
});

chrome.contextMenus.create({
  contexts: ['browser_action'],
  title: '수동계산하기',
  onclick: function (tab) {
    chrome.tabs.executeScript(tab.id, { file: 'js/cals.js' });
    chrome.tabs.insertCSS(tab.id, { file: 'css/cals.css' });
  },
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.cmd === 'pause') {
    sendResponse('27'); //esc
  }
});
