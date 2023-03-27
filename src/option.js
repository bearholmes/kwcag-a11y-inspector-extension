/*jshint browser: true */
/*global chrome */

// $ 함수를 정의합니다. 이 함수는 ID를 인자로 받아 해당 ID를 가진 요소를 반환합니다.
const $ = function () {
  return document.getElementById(arguments[0]);
};

// 설정 값 로드 함수
function loadEvent() {
  // 모니터 크기, 해상도, CC 표시 여부, 링크 모드 여부, 배경 모드 여부, 선 유형, 선 색상, 추적 모드 여부, 테두리 크기 값을 가져와서 설정함
  chrome.storage.sync.get('monitors', function (result) {
    const monitors = result.monitors;
    if (monitors) {
      $(monitors).selected = true;
    }
  });
  chrome.storage.sync.get('resolutions', function (result) {
    const resolutions = result.resolutions;
    if (resolutions) {
      $(resolutions).selected = true;
    }
  });
  chrome.storage.sync.get('ccshow', function (result) {
    const ccshow = result.ccshow;

    if (ccshow === 1) {
      $('ccShowOn').checked = true;
    } else {
      $('ccShowOff').checked = true;
    }
  });
  chrome.storage.sync.get('linkmode', function (result) {
    const linkmode = result.linkmode;

    if (linkmode === 1) {
      $('linkModeOn').checked = true;
    } else {
      $('linkModeOff').checked = true;
    }
  });
  chrome.storage.sync.get('bgmode', function (result) {
    const bgmode = result.bgmode;

    if (bgmode === 1) {
      $('bgModeOn').checked = true;
    } else {
      $('bgModeOff').checked = true;
    }
  });
  chrome.storage.sync.get('linetype', function (result) {
    const linetype = result.linetype;

    if (linetype === 'solid') {
      $('linetype1').checked = true;
    } else if (linetype === 'dashed') {
      $('linetype2').checked = true;
    } else if (linetype === 'dotted') {
      $('linetype3').checked = true;
    }
  });
  chrome.storage.sync.get('colortype', function (result) {
    $('colorType').value = result.colortype;
  });
  chrome.storage.sync.get('trackingmode', function (result) {
    const trackingmode = result.trackingmode;

    if (trackingmode === 'true') {
      $('trackingModeOn').checked = true;
    } else {
      $('trackingModeOff').checked = true;
    }
  });
  chrome.storage.sync.get('bordersize', function (result) {
    $('bordersize').value = result.bordersize;
  });
}

// 해상도 등록 버튼 클릭 시 실행될 코드
function resRegEvent() {
  // 입력된 모니터 크기와 해상도 값을 가져옴
  const monitor = $('moniStd').value;
  const resolution = $('resStd').value;

  // CC 표시, 링크 모드, 배경 모드, 선 유형, 선 색상, 추적 모드, 테두리 크기 값을 가져옴
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

  // 입력된 값을 저장함
  chrome.storage.sync.set({
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

  // '저장완료!' 메시지를 출력함
  $('resStatus').innerText = '저장완료!';
  setTimeout(function () {
    $('resStatus').innerText = '';
  }, 8000);
}

// DOMContentLoaded 이벤트가 발생하면 실행될 코드
window.addEventListener('DOMContentLoaded', function () {
  // id가 'resBtn'인 요소에 클릭 이벤트 리스너를 추가함
  $('resBtn').addEventListener('click', resRegEvent, false);

  // loadEvent 함수를 실행함
  loadEvent();
});
