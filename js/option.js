/*jshint browser: true */
/*global chrome */

const $ = function () {
  return document.getElementById(arguments[0]);
};

function loadEvent() {
  chrome.storage.local.get('monitors', function (result) {
    const monitors = result.monitors;
    if (monitors) {
      $(monitors).selected = true;
    }
  });
  chrome.storage.local.get('resolutions', function (result) {
    const resolutions = result.resolutions;
    if (resolutions) {
      $(resolutions).selected = true;
    }
  });
  chrome.storage.local.get('ccshow', function (result) {
    const ccshow = result.ccshow;

    if (ccshow === 1) {
      $('ccShowOn').checked = true;
    } else {
      $('ccShowOff').checked = true;
    }
  });
  chrome.storage.local.get('linkmode', function (result) {
    const linkmode = result.linkmode;

    if (linkmode === 1) {
      $('linkModeOn').checked = true;
    } else {
      $('linkModeOff').checked = true;
    }
  });
  chrome.storage.local.get('bgmode', function (result) {
    const bgmode = result.bgmode;

    if (bgmode === 1) {
      $('bgModeOn').checked = true;
    } else {
      $('bgModeOff').checked = true;
    }
  });
  chrome.storage.local.get('linetype', function (result) {
    const linetype = result.linetype;

    if (linetype === 'solid') {
      $('linetype1').checked = true;
    } else if (linetype === 'dashed') {
      $('linetype2').checked = true;
    } else if (linetype === 'dotted') {
      $('linetype3').checked = true;
    }
  });
  chrome.storage.local.get('colortype', function (result) {
    $('colorType').value = result.colortype;
  });
  chrome.storage.local.get('trackingmode', function (result) {
    const trackingmode = result.trackingmode;

    if (trackingmode === 'true') {
      $('trackingModeOn').checked = true;
    } else {
      $('trackingModeOff').checked = true;
    }
  });
  chrome.storage.local.get('bordersize', function (result) {
    $('bordersize').value = result.bordersize;
  });
}

function resRegEvent() {
  const monitor = $('moniStd').value;
  const resolution = $('resStd').value;

  let cc_sw = 0;
  if ($('ccShowOn').checked) cc_sw = 1;

  let lm_sw = 0;
  if ($('linkModeOn').checked) lm_sw = 1;

  let bg_sw = false;
  if ($('bgModeOn').checked) bg_sw = true;

  let linetype = 'dashed';
  if ($('linetype1').checked) {
    linetype = 'solid';
  } else if ($('linetype2').checked) {
    linetype = 'dashed';
  } else if ($('linetype3').checked) {
    linetype = 'dotted';
  }
  const colortype = $('colorType').value;

  let trackingmode = false;
  if ($('trackingModeOn').checked) trackingmode = true;

  const bordersize = $('bordersize').value;

  chrome.storage.local.set({
    monitors: monitor,
    resolutions: resolution,
    ccshow: cc_sw,
    linkmode: lm_sw,
    bgmode: bg_sw,
    linetype: linetype,
    colortype: colortype,
    trackingmode: trackingmode,
    bordersize: bordersize,
  });

  $('resStatus').innerText = '저장완료!';
  setTimeout(function () {
    $('resStatus').innerText = '';
  }, 8000);
}

window.addEventListener('DOMContentLoaded', function () {
  $('resBtn').addEventListener('click', resRegEvent, false);
  loadEvent();
});
