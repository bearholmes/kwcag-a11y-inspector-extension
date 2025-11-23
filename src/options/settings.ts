/*jshint browser: true */

// ============================================================================
// Imports
// ============================================================================
import './settings.css';
import Pickr from '@simonwep/pickr';
import '@simonwep/pickr/dist/themes/nano.min.css';
import { StorageManager } from '../shared/storage-utils.ts';
import { $ } from '../shared/dom-utils.ts';

// ============================================================================
// Constants - 매직 넘버를 명명된 상수로 추출
// ============================================================================

/** @constant - 기능 활성화 상태 */
const STATE_ENABLED = 1 as const;

/** @constant - 기능 비활성화 상태 */
const STATE_DISABLED = 0 as const;

/** @constant - 상태 메시지 표시 지속 시간 (밀리초) */
const STATUS_MESSAGE_DURATION = 8000 as const;

/** @constant - 선 유형: 실선 */
const LINE_TYPE_SOLID = 'solid' as const;

/** @constant - 선 유형: 대시선 */
const LINE_TYPE_DASHED = 'dashed' as const;

/** @constant - 선 유형: 점선 */
const LINE_TYPE_DOTTED = 'dotted' as const;

/** @constant - 기본 선 유형 */
const DEFAULT_LINE_TYPE = LINE_TYPE_DASHED;

// ============================================================================
// Types
// ============================================================================

type LineType =
  | typeof LINE_TYPE_SOLID
  | typeof LINE_TYPE_DASHED
  | typeof LINE_TYPE_DOTTED;
type StorageCallback = (result: Record<string, unknown>) => void;

// ============================================================================
// Global Variables - 전역 변수
// ============================================================================

/**
 * Pickr 색상 선택기 인스턴스
 */
let pickrInstance: Pickr | null = null;

// ============================================================================
// Utility Functions - 유틸리티 함수
// ============================================================================

/**
 * Chrome Storage에서 값을 안전하게 가져오는 헬퍼 함수
 *
 * @param key - 가져올 저장소 키
 * @param callback - 값을 처리할 콜백 함수
 * @returns void
 * @throws Error key가 유효하지 않거나 callback이 함수가 아닌 경우
 */
function safeStorageGet(key: string, callback: StorageCallback): void {
  try {
    // 입력 검증
    if (!key.trim()) {
      throw new Error('Storage key must be a non-empty string');
    }

    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    StorageManager.get(key)
      .then((value) => {
        callback({ [key]: value });
      })
      .catch((error) => {
        console.error(`Chrome storage error for key "${key}":`, error);
      });
  } catch (error) {
    console.error(`Error in safeStorageGet for key "${key}":`, error);
  }
}

/**
 * Chrome Storage에 값을 안전하게 저장하는 헬퍼 함수
 *
 * @param data - 저장할 데이터 객체
 * @param callback - 저장 완료 후 실행할 콜백 함수 (선택사항)
 * @returns void
 * @throws Error data가 객체가 아닌 경우
 */
function safeStorageSet(
  data: Record<string, unknown>,
  callback?: () => void,
): void {
  try {
    // 입력 검증
    if (typeof data !== 'object' || data === null) {
      throw new Error('Data must be a valid object');
    }

    StorageManager.setMultiple(data)
      .then(() => {
        if (callback && typeof callback === 'function') {
          callback();
        }
      })
      .catch((error) => {
        console.error('Chrome storage set error:', error);
      });
  } catch (error) {
    console.error('Error in safeStorageSet:', error);
  }
}

/**
 * 요소의 checked 속성을 안전하게 설정하는 헬퍼 함수
 *
 * @param elementId - 요소의 ID
 * @param checked - 설정할 checked 값
 * @returns 성공 여부
 */
function safeSetChecked(elementId: string, checked: boolean): boolean {
  try {
    const element = $(elementId) as HTMLInputElement | null;
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
 * @param elementId - 요소의 ID
 * @param selected - 설정할 selected 값
 * @returns 성공 여부
 */
function safeSetSelected(elementId: string, selected: boolean): boolean {
  try {
    const element = $(elementId) as HTMLOptionElement | null;
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
 * @param elementId - 요소의 ID
 * @param value - 설정할 value 값
 * @returns 성공 여부
 */
function safeSetValue(elementId: string, value: unknown): boolean {
  try {
    const element = $(elementId) as HTMLInputElement | HTMLSelectElement | null;
    if (element) {
      element.value =
        value !== undefined && value !== null ? String(value) : '';
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
 * @returns void
 */
function loadMonitorSettings(): void {
  try {
    safeStorageGet('monitors', function (result) {
      const monitors = result.monitors as string | undefined;
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
 * @returns void
 */
function loadResolutionSettings(): void {
  try {
    safeStorageGet('resolutions', function (result) {
      const resolutions = result.resolutions as string | undefined;
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
 * @returns void
 */
function loadCCShowSettings(): void {
  try {
    safeStorageGet('ccshow', function (result) {
      const ccshow = result.ccshow as number | undefined;

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
 * Chrome Storage에서 Box 모델 표시 설정을 로드합니다
 *
 * @returns void
 */
function loadBoxShowSettings(): void {
  try {
    safeStorageGet('boxshow', function (result) {
      const boxshow = result.boxshow as number | undefined;

      if (boxshow === STATE_ENABLED) {
        safeSetChecked('boxShowOn', true);
      } else {
        safeSetChecked('boxShowOff', true);
      }
    });
  } catch (error) {
    console.error('Error loading Box show settings:', error);
  }
}

/**
 * Chrome Storage에서 링크 모드 설정을 로드하고 라디오 버튼 상태를 맞춥니다
 *
 * @returns void
 */
function loadLinkModeSettings(): void {
  try {
    safeStorageGet('linkmode', function (result) {
      const linkmode = result.linkmode as number | undefined;

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
 * Chrome Storage에서 선 유형 설정을 로드합니다
 *
 * @returns void
 */
function loadLineTypeSettings(): void {
  try {
    safeStorageGet('linetype', function (result) {
      const linetype = result.linetype as LineType | undefined;

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
 * Pickr 색상 선택기의 초기 값을 설정합니다
 *
 * @param pickrInstance - Pickr 인스턴스
 * @returns void
 */
function loadColorTypeSettings(pickrInstance: Pickr | null): void {
  try {
    safeStorageGet('colortype', function (result) {
      const colorHex = (result.colortype as string | undefined) || 'ff0000';
      if (pickrInstance) {
        pickrInstance.setColor(`#${colorHex}`);
      }
    });
  } catch (error) {
    console.error('Error loading color type settings:', error);
  }
}

/**
 * Chrome Storage에서 테두리 크기 설정을 로드합니다
 *
 * @returns void
 */
function loadBorderSizeSettings(): void {
  try {
    safeStorageGet('bordersize', function (result) {
      safeSetValue('bordersize', result.bordersize);
    });
  } catch (error) {
    console.error('Error loading border size settings:', error);
  }
}

/**
 * Pickr 색상 선택기를 초기화하는 함수
 * @returns Pickr 인스턴스 또는 null
 */
function initializeColorPicker(): Pickr | null {
  try {
    const colorTypeEl = $('colorType');
    if (!colorTypeEl) {
      console.warn('Color picker element not found');
      return null;
    }

    const pickr = Pickr.create({
      el: '#colorType',
      theme: 'nano',
      default: '#ff0000',

      components: {
        preview: true,
        opacity: false,
        hue: true,

        interaction: {
          hex: true,
          input: true,
          save: true,
        },
      },

      i18n: {
        'btn:save': '확인',
        'btn:cancel': '취소',
        'btn:clear': '초기화',
      },
    });

    // 색상 저장 이벤트
    pickr.on('save', (color: Pickr.HSVaColor | null) => {
      try {
        if (color) {
          const hexColor = color.toHEXA().toString().substring(1, 7);
          safeStorageSet({ colortype: hexColor }, function () {
            showStatusMessage('resStatus', '색상이 저장되었습니다.');
          });
          pickr.hide();
        }
      } catch (error) {
        console.error('Error saving color:', error);
        showStatusMessage('resStatus', '색상 저장 중 오류가 발생했습니다.');
      }
    });

    return pickr;
  } catch (error) {
    console.error('Error initializing color picker:', error);
    return null;
  }
}

/**
 * 컬러 프리셋 버튼 클릭 이벤트 핸들러를 초기화합니다
 *
 * @param pickrInstance - Pickr 인스턴스
 * @returns void
 */
function initializeColorPresets(pickrInstance: Pickr | null): void {
  try {
    const presetButtons = document.querySelectorAll('.color-preset');

    presetButtons.forEach((button) => {
      button.addEventListener('click', function (this: HTMLElement) {
        const colorValue = this.getAttribute('data-color');
        if (colorValue && pickrInstance) {
          // Pickr에 색상 설정
          pickrInstance.setColor(`#${colorValue}`);

          // 즉시 저장
          safeStorageSet({ colortype: colorValue }, function () {
            const savedMessage =
              chrome.i18n.getMessage('settingSaved') || '저장완료!';
            showStatusMessage('resStatus', savedMessage);
          });
        }
      });
    });
  } catch (error) {
    console.error('Error initializing color presets:', error);
  }
}

/**
 * 저장된 설정 값을 모두 로드하는 함수
 * 설정 값 로드 함수
 * 모니터 크기, 해상도, CC 표시 여부, 링크 모드 여부,
 * 선 유형, 선 색상, 추적 모드 여부, 테두리 크기 값을 가져와서 설정함
 *
 * @param pickrInstance - Pickr 인스턴스
 * @returns void
 */
function loadEvent(pickrInstance: Pickr | null = null): void {
  try {
    loadMonitorSettings();
    loadResolutionSettings();
    loadCCShowSettings();
    loadBoxShowSettings();
    loadLinkModeSettings();
    loadLineTypeSettings();
    loadColorTypeSettings(pickrInstance);
    loadBorderSizeSettings();
  } catch (error) {
    console.error('Error in loadEvent:', error);
  }
}

/**
 * 체크박스 요소의 값을 가져와 숫자 상태로 반환합니다
 *
 * @param onElementId - "On" 상태의 체크박스 요소 ID
 * @returns 체크되어 있으면 STATE_ENABLED(1), 아니면 STATE_DISABLED(0)
 */
function getCheckboxState(onElementId: string): number {
  try {
    const element = $(onElementId) as HTMLInputElement | null;
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
 * 선택된 라디오 버튼에 따라 선 유형을 반환합니다
 *
 * @returns 선택된 선 유형 (solid, dashed, dotted 중 하나)
 */
function getSelectedLineType(): LineType {
  try {
    const linetype1 = $('linetype1') as HTMLInputElement | null;
    const linetype2 = $('linetype2') as HTMLInputElement | null;
    const linetype3 = $('linetype3') as HTMLInputElement | null;

    if (linetype1 && linetype1.checked) {
      return LINE_TYPE_SOLID;
    } else if (linetype2 && linetype2.checked) {
      return LINE_TYPE_DASHED;
    } else if (linetype3 && linetype3.checked) {
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
 * @param elementId - 요소의 ID
 * @param defaultValue - 요소를 찾을 수 없을 때 반환할 기본값
 * @returns 요소의 value 또는 기본값
 */
function safeGetValue(elementId: string, defaultValue: string = ''): string {
  try {
    const element = $(elementId) as HTMLInputElement | HTMLSelectElement | null;
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
 * @param elementId - 메시지를 표시할 요소의 ID
 * @param message - 표시할 메시지
 * @param duration - 메시지 표시 지속 시간 (밀리초)
 * @returns void
 */
function showStatusMessage(
  elementId: string,
  message: string,
  duration: number = STATUS_MESSAGE_DURATION,
): void {
  try {
    if (duration < 0) {
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
 * 이벤트 리스너를 안전하게 등록하는 함수
 *
 * @param elementId - 이벤트를 등록할 요소의 ID
 * @param eventType - 이벤트 타입 (예: 'click', 'change')
 * @param handler - 이벤트 핸들러 함수
 * @returns 등록 성공 여부
 */
function safeAddEventListener(
  elementId: string,
  eventType: string,
  handler: EventListener,
): boolean {
  try {
    // 입력 검증
    if (!elementId.trim()) {
      throw new Error('Element ID must be a non-empty string');
    }

    if (!eventType.trim()) {
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
 * i18n 초기화 함수
 * data-i18n 속성을 가진 모든 요소의 텍스트를 다국어로 변환
 *
 * @returns void
 */
function initializeI18n(): void {
  try {
    // data-i18n 속성을 가진 모든 요소를 찾아서 텍스트 변환
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach((element) => {
      const key = element.getAttribute('data-i18n');
      if (key) {
        const message = chrome.i18n.getMessage(key);
        if (message) {
          element.textContent = message;
        }
      }
    });

    // document title 설정
    document.title =
      chrome.i18n.getMessage('optionPageTitle') || document.title;

    // 버전 정보 자동 설정 (manifest.json에서 가져옴)
    const version = chrome.runtime.getManifest().version;
    const versionElement = document.querySelector('.header-version');
    if (versionElement) {
      versionElement.textContent = `${chrome.i18n.getMessage('optionVersion')} : ${version}`;
    }
  } catch (error) {
    console.error('Error initializing i18n:', error);
  }
}

/**
 * 즉시 저장 핸들러 - 설정 변경 시 자동으로 저장
 *
 * @returns void
 */
function handleAutoSave(): void {
  try {
    // 입력된 모니터 크기와 해상도 값을 가져옴
    const monitor = safeGetValue('moniStd');
    const resolution = safeGetValue('resStd');

    // CC 표시, Box 모델, 링크 모드, 선 유형 값을 가져옴
    const cc_sw = getCheckboxState('ccShowOn');
    const box_sw = getCheckboxState('boxShowOn');
    const lm_sw = getCheckboxState('linkModeOn');
    const linetype = getSelectedLineType();

    // Pickr에서 색상 가져오기
    let colortype = 'ff0000'; // 기본값
    if (pickrInstance) {
      const color = pickrInstance.getColor();
      if (color) {
        colortype = color.toHEXA().toString().substring(1, 7);
      }
    }

    const bordersize = safeGetValue('bordersize');

    // 링크 모드에 따라 trackingmode 자동 설정
    const trackingmode = lm_sw === STATE_ENABLED;

    // 입력 검증
    if (!monitor || !resolution) {
      console.warn('Monitor or resolution value is empty');
      return;
    }

    // 저장
    const settingsData: Record<string, unknown> = {
      monitors: monitor,
      resolutions: resolution,
      ccshow: cc_sw,
      boxshow: box_sw,
      linkmode: lm_sw,
      linetype: linetype,
      colortype: colortype,
      trackingmode: trackingmode,
      bordersize: bordersize,
    };

    safeStorageSet(settingsData, function () {
      const savedMessage = chrome.i18n.getMessage('settingSaved') || '저장됨';
      showStatusMessage('resStatus', `✓ ${savedMessage}`, 2000);
    });
  } catch (error) {
    console.error('Error in handleAutoSave:', error);
  }
}

/**
 * 즉시 저장 이벤트 리스너 초기화
 *
 * @returns void
 */
function initializeAutoSave(): void {
  try {
    // Select 요소들
    safeAddEventListener('moniStd', 'change', handleAutoSave);
    safeAddEventListener('resStd', 'change', handleAutoSave);

    // Radio 요소들
    safeAddEventListener('ccShowOn', 'change', handleAutoSave);
    safeAddEventListener('ccShowOff', 'change', handleAutoSave);
    safeAddEventListener('boxShowOn', 'change', handleAutoSave);
    safeAddEventListener('boxShowOff', 'change', handleAutoSave);
    safeAddEventListener('linetype1', 'change', handleAutoSave);
    safeAddEventListener('linetype2', 'change', handleAutoSave);
    safeAddEventListener('linetype3', 'change', handleAutoSave);
    safeAddEventListener('linkModeOn', 'change', handleAutoSave);
    safeAddEventListener('linkModeOff', 'change', handleAutoSave);

    // Number input
    safeAddEventListener('bordersize', 'change', handleAutoSave);
  } catch (error) {
    console.error('Error initializing auto-save:', error);
  }
}

/**
 * DOM 초기화 함수
 * DOMContentLoaded 이벤트가 발생하면 실행될 코드
 * Pickr 색상 선택기를 초기화하고 설정을 로드함
 *
 * @returns void
 */
function initializePage(): void {
  try {
    // i18n 초기화 (가장 먼저 실행)
    initializeI18n();

    // Pickr 색상 선택기 초기화 및 전역 변수에 저장
    pickrInstance = initializeColorPicker();

    // 컬러 프리셋 버튼 초기화
    initializeColorPresets(pickrInstance);

    // 즉시 저장 이벤트 리스너 초기화
    initializeAutoSave();

    // loadEvent 함수를 실행함 (Pickr 인스턴스 전달)
    loadEvent(pickrInstance);
  } catch (error) {
    console.error('Error initializing page:', error);
  }
}

// ============================================================================
// Event Listeners - 이벤트 리스너
// ============================================================================

// DOMContentLoaded 이벤트가 발생하면 실행될 코드
window.addEventListener('DOMContentLoaded', initializePage, false);
