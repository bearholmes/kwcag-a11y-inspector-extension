const STATE_ENABLED = 1;
const STATE_DISABLED = 0;
const STATUS_MESSAGE_DURATION = 8000;
const LINE_TYPE_SOLID = 'solid';
const LINE_TYPE_DASHED = 'dashed';
const LINE_TYPE_DOTTED = 'dotted';
const DEFAULT_LINE_TYPE = LINE_TYPE_DASHED;
const TRACKING_MODE_ENABLED = 'true';
const $ = function (elementId) {
  try {
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
function safeStorageGet(key, callback) {
  try {
    if (typeof key !== 'string' || !key.trim()) {
      throw new Error('Storage key must be a non-empty string');
    }
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    chrome.storage.sync.get(key, function (result) {
      try {
        if (chrome.runtime.lastError) {
          console.error(`Chrome storage error for key "${key}":`, chrome.runtime.lastError);
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
function safeStorageSet(data, callback) {
  try {
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
function loadColorTypeSettings() {
  try {
    safeStorageGet('colortype', function (result) {
      safeSetValue('colorType', result.colortype);
    });
  } catch (error) {
    console.error('Error loading color type settings:', error);
  }
}
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
function loadBorderSizeSettings() {
  try {
    safeStorageGet('bordersize', function (result) {
      safeSetValue('bordersize', result.bordersize);
    });
  } catch (error) {
    console.error('Error loading border size settings:', error);
  }
}
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
function getCheckboxBooleanState(onElementId) {
  try {
    const element = $(onElementId);
    if (!element) {
      console.warn(`Checkbox element "${onElementId}" not found`);
      return false;
    }
    return element.checked;
  } catch (error) {
    console.error(`Error getting checkbox boolean state for "${onElementId}":`, error);
    return false;
  }
}
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
function showStatusMessage(elementId, message, duration = STATUS_MESSAGE_DURATION) {
  try {
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
function resRegEvent() {
  try {
    const monitor = safeGetValue('moniStd');
    const resolution = safeGetValue('resStd');
    const cc_sw = getCheckboxState('ccShowOn');
    const lm_sw = getCheckboxState('linkModeOn');
    const bg_sw = getCheckboxBooleanState('bgModeOn');
    const linetype = getSelectedLineType();
    const colortype = safeGetValue('colorType');
    const trackingmode = getCheckboxBooleanState('trackingModeOn');
    const bordersize = safeGetValue('bordersize');
    if (!monitor || !resolution) {
      console.warn('Monitor or resolution value is empty');
      showStatusMessage('resStatus', '모니터와 해상도를 선택해주세요.');
      return;
    }
    const settingsData = {
      monitors: monitor,
      resolutions: resolution,
      ccshow: cc_sw,
      linkmode: lm_sw,
      bgmode: bg_sw,
      linetype: linetype,
      colortype: colortype,
      trackingmode: trackingmode,
      bordersize: bordersize
    };
    safeStorageSet(settingsData, function () {
      showStatusMessage('resStatus', '저장완료!');
    });
  } catch (error) {
    console.error('Error in resRegEvent:', error);
    showStatusMessage('resStatus', '저장 중 오류가 발생했습니다.');
  }
}
function safeAddEventListener(elementId, eventType, handler) {
  try {
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
function initializePage() {
  try {
    safeAddEventListener('resBtn', 'click', resRegEvent);
    loadEvent();
  } catch (error) {
    console.error('Error initializing page:', error);
  }
}
window.addEventListener('DOMContentLoaded', initializePage, false);
//# sourceMappingURL=option.js.map