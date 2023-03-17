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
var dkInspectLoaded = false;

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason == "install") {
        chrome.tabs.create( {url: "option.html"} );
        chrome.storage.local.set({'monitors': '17'});
        chrome.storage.local.set({'resolutions': '1366x768'});
        chrome.storage.local.set({'ccshow': '1'});
        chrome.storage.local.set({'linkmode': '0'});
        chrome.storage.local.set({'bgmode': '1'});
        chrome.storage.local.set({'linetype': 'dashed'});
        chrome.storage.local.set({'colortype': 'ff0000'});
        chrome.storage.local.set({'bordersize': '2'});
    }
});
// || details.reason == "update" 제외
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
  if(request.cmd == "pause"){
    sendResponse('27'); //esc
  }
});

chrome.browserAction.onClicked.addListener(function(tab) {
    if (tab.url.indexOf("https://chrome.google.com") == 0 || tab.url.indexOf("chrome://") == 0) {
        alert("크롬 내부 페이지에서는 동작하지 않습니다."); //It does not work on Google Chrome Internal pages
        return;
    }
    chrome.tabs.executeScript(tab.id, {file: 'js/dkinspect.js'});
    chrome.tabs.insertCSS(tab.id, {file: 'css/dkinspect.css'});

    dkInspectLoaded = true;
});

chrome.contextMenus.create({
    contexts: ["browser_action"],
    title: "수동계산하기",
    onclick: function(tab) {
    	  chrome.tabs.executeScript(tab.id, {file: 'js/cals.js'});
    	    chrome.tabs.insertCSS(tab.id, {file: 'css/cals.css'});
      }
});


