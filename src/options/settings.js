/*jshint browser: true */
/*global chrome */

// ============================================================================
// Imports
// ============================================================================
import './settings.css';
import Pickr from '@simonwep/pickr';
import '@simonwep/pickr/dist/themes/nano.min.css';

// ============================================================================
// Constants - 매직 넘버를 명명된 상수로 추출
// ============================================================================

/** @constant {number} - 기능 활성화 상태 */
const STATE_ENABLED = 1;

/** @constant {number} - 기능 비활성화 상태 */
const STATE_DISABLED = 0;

/** @constant {number} - 상태 메시지 표시 지속 시간 (밀리초) */
const STATUS_MESSAGE_DURATION = 8000;

/** @constant {string} - 선 유형: 실선 */
const LINE_TYPE_SOLID = 'solid';

/** @constant {string} - 선 유형: 대시선 */
const LINE_TYPE_DASHED = 'dashed';

/** @constant {string} - 선 유형: 점선 */
const LINE_TYPE_DOTTED = 'dotted';

/** @constant {string} - 기본 선 유형 */
const DEFAULT_LINE_TYPE = LINE_TYPE_DASHED;

/** @constant {string} - 추적 모드 활성화 문자열 값 */
const TRACKING_MODE_ENABLED = 'true';

// ============================================================================
// Utility Functions - 유틸리티 함수
// ============================================================================

/**
 * DOM 요소를 ID로 조회하는 헬퍼 함수
 * $ 함수를 정의합니다. 이 함수는 ID를 인자로 받아 해당 ID를 가진 요소를 반환합니다.
 *
 * @param {string} elementId - 조회할 요소의 ID
 * @returns {HTMLElement|null} ID에 해당하는 DOM 요소, 없으면 null
 * @throws {Error} elementId가 문자열이 아닌 경우
 *
 * @example
 * const button = $('myButton');
 * if (button) {
 *   button.addEventListener('click', handleClick);
 * }
 */
const $ = function (elementId) {
  try {
    // 입력 검증
    if (typeof elementId !== 'string') {
      throw new Error('Element ID must be a string');
    }

    if (!elementId.trim()) {
      throw new Error('Element ID cannot be empty');
    }

    return document.getElementById(elementId);
  } catch (error) {
    console.error(`Error in $() function: ${error.message}`, error);
    return null;
  }
};

/**
 * Chrome Storage에서 값을 안전하게 가져오는 헬퍼 함수
 *
 * @param {string} key - 가져올 저장소 키
 * @param {Function} callback - 값을 처리할 콜백 함수
 * @returns {void}
 * @throws {Error} key가 유효하지 않거나 callback이 함수가 아닌 경우
 */
function safeStorageGet(key, callback) {
  try {
    // 입력 검증
    if (typeof key !== 'string' || !key.trim()) {
      throw new Error('Storage key must be a non-empty string');
    }

    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    chrome.storage.sync.get(key, function (result) {
      try {
        if (chrome.runtime.lastError) {
          console.error(
            `Chrome storage error for key "${key}":`,
            chrome.runtime.lastError,
          );
          return;
        }
        callback(result);
      } catch (error) {
        console.error(`Error in storage callback for key "${key}":`, error);
      }
    });
  } catch (error) {
    console.error(`Error in safeStorageGet for key "${key}":`, error);
  }
}

/**
 * Chrome Storage에 값을 안전하게 저장하는 헬퍼 함수
 *
 * @param {Object} data - 저장할 데이터 객체
 * @param {Function} [callback] - 저장 완료 후 실행할 콜백 함수 (선택사항)
 * @returns {void}
 * @throws {Error} data가 객체가 아닌 경우
 */
function safeStorageSet(data, callback) {
  try {
    // 입력 검증
    if (typeof data !== 'object' || data === null) {
      throw new Error('Data must be a valid object');
    }

    chrome.storage.sync.set(data, function () {
      try {
        if (chrome.runtime.lastError) {
          console.error('Chrome storage set error:', chrome.runtime.lastError);
          return;
        }

        if (callback && typeof callback === 'function') {
          callback();
        }
      } catch (error) {
        console.error('Error in storage set callback:', error);
      }
    });
  } catch (error) {
    console.error('Error in safeStorageSet:', error);
  }
}

/**
 * 요소의 checked 속성을 안전하게 설정하는 헬퍼 함수
 *
 * @param {string} elementId - 요소의 ID
 * @param {boolean} checked - 설정할 checked 값
 * @returns {boolean} 성공 여부
 */
function safeSetChecked(elementId, checked) {
  try {
    const element = $(elementId);
    if (element) {
      element.checked = Boolean(checked);
      return true;
    }
    console.warn(`Element with ID "${elementId}" not found`);
    return false;
  } catch (error) {
    console.error(`Error setting checked for element "${elementId}":`, error);
    return false;
  }
}

/**
 * 요소의 selected 속성을 안전하게 설정하는 헬퍼 함수
 *
 * @param {string} elementId - 요소의 ID
 * @param {boolean} selected - 설정할 selected 값
 * @returns {boolean} 성공 여부
 */
function safeSetSelected(elementId, selected) {
  try {
    const element = $(elementId);
    if (element) {
      element.selected = Boolean(selected);
      return true;
    }
    console.warn(`Element with ID "${elementId}" not found`);
    return false;
  } catch (error) {
    console.error(`Error setting selected for element "${elementId}":`, error);
    return false;
  }
}

/**
 * 요소의 value 속성을 안전하게 설정하는 헬퍼 함수
 *
 * @param {string} elementId - 요소의 ID
 * @param {*} value - 설정할 value 값
 * @returns {boolean} 성공 여부
 */
function safeSetValue(elementId, value) {
  try {
    const element = $(elementId);
    if (element) {
      element.value = value !== undefined && value !== null ? value : '';
      return true;
    }
    console.warn(`Element with ID "${elementId}" not found`);
    return false;
  } catch (error) {
    console.error(`Error setting value for element "${elementId}":`, error);
    return false;
  }
}

// ============================================================================
// Core Functions - 핵심 기능 함수
// ============================================================================

/**
 * Chrome Storage에서 모니터 설정을 로드합니다
 *
 * @returns {void}
 */
function loadMonitorSettings() {
  try {
    safeStorageGet('monitors', function (result) {
      const monitors = result.monitors;
      if (monitors) {
        safeSetSelected(monitors, true);
      }
    });
  } catch (error) {
    console.error('Error loading monitor settings:', error);
  }
}

/**
 * Chrome Storage에서 해상도 설정을 로드합니다
 *
 * @returns {void}
 */
function loadResolutionSettings() {
  try {
    safeStorageGet('resolutions', function (result) {
      const resolutions = result.resolutions;
      if (resolutions) {
        safeSetSelected(resolutions, true);
      }
    });
  } catch (error) {
    console.error('Error loading resolution settings:', error);
  }
}

/**
 * Chrome Storage에서 CC(Closed Caption) 표시 설정을 로드합니다
 *
 * @returns {void}
 */
function loadCCShowSettings() {
  try {
    safeStorageGet('ccshow', function (result) {
      const ccshow = result.ccshow;

      if (ccshow === STATE_ENABLED) {
        safeSetChecked('ccShowOn', true);
      } else {
        safeSetChecked('ccShowOff', true);
      }
    });
  } catch (error) {
    console.error('Error loading CC show settings:', error);
  }
}

/**
 * Chrome Storage에서 링크 모드 설정을 로드합니다
 *
 * @returns {void}
 */
function loadLinkModeSettings() {
  try {
    safeStorageGet('linkmode', function (result) {
      const linkmode = result.linkmode;

      if (linkmode === STATE_ENABLED) {
        safeSetChecked('linkModeOn', true);
      } else {
        safeSetChecked('linkModeOff', true);
      }
    });
  } catch (error) {
    console.error('Error loading link mode settings:', error);
  }
}

/**
 * Chrome Storage에서 배경 모드 설정을 로드합니다
 *
 * @returns {void}
 */
function loadBackgroundModeSettings() {
  try {
    safeStorageGet('bgmode', function (result) {
      const bgmode = result.bgmode;

      if (bgmode === STATE_ENABLED) {
        safeSetChecked('bgModeOn', true);
      } else {
        safeSetChecked('bgModeOff', true);
      }
    });
  } catch (error) {
    console.error('Error loading background mode settings:', error);
  }
}

/**
 * Chrome Storage에서 선 유형 설정을 로드합니다
 *
 * @returns {void}
 */
function loadLineTypeSettings() {
  try {
    safeStorageGet('linetype', function (result) {
      const linetype = result.linetype;

      if (linetype === LINE_TYPE_SOLID) {
        safeSetChecked('linetype1', true);
      } else if (linetype === LINE_TYPE_DASHED) {
        safeSetChecked('linetype2', true);
      } else if (linetype === LINE_TYPE_DOTTED) {
        safeSetChecked('linetype3', true);
      }
    });
  } catch (error) {
    console.error('Error loading line type settings:', error);
  }
}

/**
 * Chrome Storage에서 색상 유형 설정을 로드합니다
 *
 * @returns {void}
 */
function loadColorTypeSettings() {
  try {
    safeStorageGet('colortype', function (result) {
      safeSetValue('colorType', result.colortype);
    });
  } catch (error) {
    console.error('Error loading color type settings:', error);
  }
}

/**
 * Chrome Storage에서 추적 모드 설정을 로드합니다
 *
 * @returns {void}
 */
function loadTrackingModeSettings() {
  try {
    safeStorageGet('trackingmode', function (result) {
      const trackingmode = result.trackingmode;

      if (trackingmode === TRACKING_MODE_ENABLED) {
        safeSetChecked('trackingModeOn', true);
      } else {
        safeSetChecked('trackingModeOff', true);
      }
    });
  } catch (error) {
    console.error('Error loading tracking mode settings:', error);
  }
}

/**
 * Chrome Storage에서 테두리 크기 설정을 로드합니다
 *
 * @returns {void}
 */
function loadBorderSizeSettings() {
  try {
    safeStorageGet('bordersize', function (result) {
      safeSetValue('bordersize', result.bordersize);
    });
  } catch (error) {
    console.error('Error loading border size settings:', error);
  }
}

/**
 * 저장된 설정 값을 모두 로드하는 함수
 * 설정 값 로드 함수
 * 모니터 크기, 해상도, CC 표시 여부, 링크 모드 여부, 배경 모드 여부,
 * 선 유형, 선 색상, 추적 모드 여부, 테두리 크기 값을 가져와서 설정함
 *
 * @returns {void}
 */
function loadEvent() {
  try {
    loadMonitorSettings();
    loadResolutionSettings();
    loadCCShowSettings();
    loadLinkModeSettings();
    loadBackgroundModeSettings();
    loadLineTypeSettings();
    loadColorTypeSettings();
    loadTrackingModeSettings();
    loadBorderSizeSettings();
  } catch (error) {
    console.error('Error in loadEvent:', error);
  }
}

/**
 * 체크박스 요소의 값을 가져와 숫자 상태로 반환합니다
 *
 * @param {string} onElementId - "On" 상태의 체크박스 요소 ID
 * @returns {number} 체크되어 있으면 STATE_ENABLED(1), 아니면 STATE_DISABLED(0)
 */
function getCheckboxState(onElementId) {
  try {
    const element = $(onElementId);
    if (!element) {
      console.warn(`Checkbox element "${onElementId}" not found`);
      return STATE_DISABLED;
    }
    return element.checked ? STATE_ENABLED : STATE_DISABLED;
  } catch (error) {
    console.error(`Error getting checkbox state for "${onElementId}":`, error);
    return STATE_DISABLED;
  }
}

/**
 * 체크박스 요소의 값을 가져와 불린 상태로 반환합니다
 *
 * @param {string} onElementId - "On" 상태의 체크박스 요소 ID
 * @returns {boolean} 체크되어 있으면 true, 아니면 false
 */
function getCheckboxBooleanState(onElementId) {
  try {
    const element = $(onElementId);
    if (!element) {
      console.warn(`Checkbox element "${onElementId}" not found`);
      return false;
    }
    return element.checked;
  } catch (error) {
    console.error(
      `Error getting checkbox boolean state for "${onElementId}":`,
      error,
    );
    return false;
  }
}

/**
 * 선택된 라디오 버튼에 따라 선 유형을 반환합니다
 *
 * @returns {string} 선택된 선 유형 (solid, dashed, dotted 중 하나)
 */
function getSelectedLineType() {
  try {
    if ($('linetype1') && $('linetype1').checked) {
      return LINE_TYPE_SOLID;
    } else if ($('linetype2') && $('linetype2').checked) {
      return LINE_TYPE_DASHED;
    } else if ($('linetype3') && $('linetype3').checked) {
      return LINE_TYPE_DOTTED;
    }
    return DEFAULT_LINE_TYPE;
  } catch (error) {
    console.error('Error getting selected line type:', error);
    return DEFAULT_LINE_TYPE;
  }
}

/**
 * 요소의 value를 안전하게 가져옵니다
 *
 * @param {string} elementId - 요소의 ID
 * @param {*} [defaultValue=''] - 요소를 찾을 수 없을 때 반환할 기본값
 * @returns {*} 요소의 value 또는 기본값
 */
function safeGetValue(elementId, defaultValue = '') {
  try {
    const element = $(elementId);
    if (!element) {
      console.warn(`Element "${elementId}" not found, using default value`);
      return defaultValue;
    }
    return element.value;
  } catch (error) {
    console.error(`Error getting value for "${elementId}":`, error);
    return defaultValue;
  }
}

/**
 * 상태 메시지를 표시하고 일정 시간 후 자동으로 제거합니다
 *
 * @param {string} elementId - 메시지를 표시할 요소의 ID
 * @param {string} message - 표시할 메시지
 * @param {number} [duration=STATUS_MESSAGE_DURATION] - 메시지 표시 지속 시간 (밀리초)
 * @returns {void}
 */
function showStatusMessage(
  elementId,
  message,
  duration = STATUS_MESSAGE_DURATION,
) {
  try {
    // 입력 검증
    if (typeof message !== 'string') {
      console.error('Message must be a string');
      return;
    }

    if (typeof duration !== 'number' || duration < 0) {
      console.error('Duration must be a positive number');
      duration = STATUS_MESSAGE_DURATION;
    }

    const element = $(elementId);
    if (!element) {
      console.warn(`Status element "${elementId}" not found`);
      return;
    }

    element.innerText = message;

    setTimeout(function () {
      try {
        const statusElement = $(elementId);
        if (statusElement) {
          statusElement.innerText = '';
        }
      } catch (error) {
        console.error('Error clearing status message:', error);
      }
    }, duration);
  } catch (error) {
    console.error('Error showing status message:', error);
  }
}

/**
 * 해상도 등록 버튼 클릭 시 실행되는 함수
 * 해상도 등록 버튼 클릭 시 실행될 코드
 * 입력된 모니터 크기와 해상도 값을 가져옴
 * CC 표시, 링크 모드, 배경 모드, 선 유형, 선 색상, 추적 모드, 테두리 크기 값을 가져옴
 * 입력된 값을 저장함
 * '저장완료!' 메시지를 출력함
 *
 * @returns {void}
 */
function resRegEvent() {
  try {
    // 입력된 모니터 크기와 해상도 값을 가져옴
    const monitor = safeGetValue('moniStd');
    const resolution = safeGetValue('resStd');

    // CC 표시, 링크 모드, 배경 모드, 선 유형, 선 색상, 추적 모드, 테두리 크기 값을 가져옴
    const cc_sw = getCheckboxState('ccShowOn');
    const lm_sw = getCheckboxState('linkModeOn');
    const bg_sw = getCheckboxBooleanState('bgModeOn');
    const linetype = getSelectedLineType();
    const colortype = safeGetValue('colorType');
    const trackingmode = getCheckboxBooleanState('trackingModeOn');
    const bordersize = safeGetValue('bordersize');

    // 입력 검증
    if (!monitor || !resolution) {
      console.warn('Monitor or resolution value is empty');
      showStatusMessage('resStatus', '모니터와 해상도를 선택해주세요.');
      return;
    }

    // 입력된 값을 저장함
    const settingsData = {
      monitors: monitor,
      resolutions: resolution,
      ccshow: cc_sw,
      linkmode: lm_sw,
      bgmode: bg_sw,
      linetype: linetype,
      colortype: colortype,
      trackingmode: trackingmode,
      bordersize: bordersize,
    };

    safeStorageSet(settingsData, function () {
      // '저장완료!' 메시지를 출력함
      showStatusMessage('resStatus', '저장완료!');
    });
  } catch (error) {
    console.error('Error in resRegEvent:', error);
    showStatusMessage('resStatus', '저장 중 오류가 발생했습니다.');
  }
}

/**
 * 이벤트 리스너를 안전하게 등록하는 함수
 *
 * @param {string} elementId - 이벤트를 등록할 요소의 ID
 * @param {string} eventType - 이벤트 타입 (예: 'click', 'change')
 * @param {Function} handler - 이벤트 핸들러 함수
 * @returns {boolean} 등록 성공 여부
 */
function safeAddEventListener(elementId, eventType, handler) {
  try {
    // 입력 검증
    if (typeof elementId !== 'string' || !elementId.trim()) {
      throw new Error('Element ID must be a non-empty string');
    }

    if (typeof eventType !== 'string' || !eventType.trim()) {
      throw new Error('Event type must be a non-empty string');
    }

    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }

    const element = $(elementId);
    if (!element) {
      console.warn(`Element "${elementId}" not found for event listener`);
      return false;
    }

    element.addEventListener(eventType, handler, false);
    return true;
  } catch (error) {
    console.error(`Error adding event listener to "${elementId}":`, error);
    return false;
  }
}

/**
 * DOM 초기화 함수
 * DOMContentLoaded 이벤트가 발생하면 실행될 코드
 * id가 'resBtn'인 요소에 클릭 이벤트 리스너를 추가함
 * loadEvent 함수를 실행함
 *
 * @returns {void}
 */
function initializePage() {
  try {
    // id가 'resBtn'인 요소에 클릭 이벤트 리스너를 추가함
    safeAddEventListener('resBtn', 'click', resRegEvent);

    // loadEvent 함수를 실행함
    loadEvent();
  } catch (error) {
    console.error('Error initializing page:', error);
  }
}

// ============================================================================
// Event Listeners - 이벤트 리스너
// ============================================================================

// DOMContentLoaded 이벤트가 발생하면 실행될 코드
window.addEventListener('DOMContentLoaded', initializePage, false);
