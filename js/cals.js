(function () {
  const ELEMENT_IDS = {
    CONTAINER: 'dkInspect_cals',
    INPUT_HEIGHT: 'dkInspect_input_height',
    INPUT_WIDTH: 'dkInspect_input_width',
    BTN_SUBMIT: 'dkInspect_btn_submit',
    BTN_CLOSE: 'dkInspect_btn_close',
    RESULT: 'dkInspect_cals_result'
  };
  const CSS_CLASSES = {
    PROPERTY: 'dkInspect_property',
    BUTTON: 'btn'
  };
  const STORAGE_KEYS = {
    RESOLUTIONS: 'resolutions',
    MONITORS: 'monitors'
  };
  const CALCULATION_CONSTANTS = {
    MM_PER_INCH: 25.4,
    DECIMAL_PLACES_STANDARD: 2,
    DECIMAL_PLACES_RESULT: 1
  };
  const ERROR_MESSAGES = {
    INVALID_INPUT: '유효하지 않은 입력값입니다.',
    MISSING_ELEMENT: '필수 요소를 찾을 수 없습니다.',
    STORAGE_ERROR: '저장소에서 데이터를 읽을 수 없습니다.',
    CALCULATION_ERROR: '계산 중 오류가 발생했습니다.'
  };
  const doc = document;
  const $ = function (id) {
    try {
      if (!id || typeof id !== 'string') {
        console.error('Invalid ID provided to $ function:', id);
        return null;
      }
      return document.getElementById(id);
    } catch (error) {
      console.error('Error in $ function:', error);
      return null;
    }
  };
  function readData(myKey) {
    return new Promise((resolve, reject) => {
      try {
        if (!myKey || typeof myKey !== 'string') {
          reject(new Error('Invalid key provided to readData'));
          return;
        }
        if (!chrome || !chrome.storage || !chrome.storage.sync) {
          reject(new Error('Chrome storage API not available'));
          return;
        }
        chrome.storage.sync.get(myKey, function (data) {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          resolve(data);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  function validateNumericInput(value) {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    const num = Number(value);
    return !isNaN(num) && isFinite(num) && num > 0;
  }
  function validateElement(element, elementName) {
    if (!element) {
      console.error(`${ERROR_MESSAGES.MISSING_ELEMENT}: ${elementName}`);
      return false;
    }
    return true;
  }
  function displayError(message) {
    const resultElement = $(ELEMENT_IDS.RESULT);
    if (resultElement) {
      resultElement.textContent = '';
      const errorDiv = doc.createElement('div');
      errorDiv.style.color = 'red';
      errorDiv.style.padding = '10px';
      errorDiv.textContent = `오류: ${message}`;
      resultElement.appendChild(errorDiv);
    }
    alert(`오류: ${message}`);
  }
  const cals = {
    initialize: function () {
      try {
        const container = doc.createElement('div');
        container.id = ELEMENT_IDS.CONTAINER;
        const header = doc.createElement('h1');
        header.appendChild(doc.createTextNode('수동 계산'));
        container.appendChild(header);
        const inputContainer = doc.createElement('div');
        const ul = doc.createElement('ul');
        const list = [`<span class='${CSS_CLASSES.PROPERTY}'><label for='${ELEMENT_IDS.INPUT_HEIGHT}'>Height</label></span><span><input type='text' id='${ELEMENT_IDS.INPUT_HEIGHT}'> px</span>`, `<span class='${CSS_CLASSES.PROPERTY}'><label for='${ELEMENT_IDS.INPUT_WIDTH}'>Width</label></span><span><input type='text' id='${ELEMENT_IDS.INPUT_WIDTH}'> px</span>`, `<span style='float:right'><button id='${ELEMENT_IDS.BTN_SUBMIT}' class='${CSS_CLASSES.BUTTON}'>확인</button><button id='${ELEMENT_IDS.BTN_CLOSE}' class='${CSS_CLASSES.BUTTON}'>닫기</button></span>`];
        list.forEach(item => {
          const li = doc.createElement('li');
          li.innerHTML = item;
          ul.appendChild(li);
        });
        inputContainer.appendChild(ul);
        container.appendChild(inputContainer);
        const result = doc.createElement('div');
        result.id = ELEMENT_IDS.RESULT;
        container.appendChild(result);
        const body = window.document.getElementsByTagName('BODY')[0];
        if (!body) {
          throw new Error('Body element not found');
        }
        body.appendChild(container);
      } catch (error) {
        console.error('Error in initialize:', error);
        displayError('UI 초기화에 실패했습니다.');
      }
    },
    close: function () {
      try {
        const container = $(ELEMENT_IDS.CONTAINER);
        if (!validateElement(container, ELEMENT_IDS.CONTAINER)) {
          return;
        }
        const body = window.document.getElementsByTagName('BODY')[0];
        if (!body) {
          throw new Error('Body element not found');
        }
        body.removeChild(container);
      } catch (error) {
        console.error('Error in close:', error);
      }
    },
    submit: async function () {
      try {
        const heightInput = $(ELEMENT_IDS.INPUT_HEIGHT);
        const widthInput = $(ELEMENT_IDS.INPUT_WIDTH);
        if (!validateElement(heightInput, 'Height Input') || !validateElement(widthInput, 'Width Input')) {
          displayError(ERROR_MESSAGES.MISSING_ELEMENT);
          return;
        }
        const h = heightInput.value;
        const w = widthInput.value;
        if (!validateNumericInput(h) || !validateNumericInput(w)) {
          displayError(ERROR_MESSAGES.INVALID_INPUT + ' 양수 숫자만 입력 가능합니다.');
          return;
        }
        await cals.setDiagonal(h, w, function (cb) {
          try {
            const res = $(ELEMENT_IDS.RESULT);
            if (!validateElement(res, 'Result Container')) {
              return;
            }
            res.textContent = '';
            const header = doc.createElement('h2');
            header.appendChild(doc.createTextNode('Results'));
            res.appendChild(header);
            const list = [`<span class='${CSS_CLASSES.PROPERTY}'> height : </span><span>${cb.height} mm (${h}px)</span>`, `<span class='${CSS_CLASSES.PROPERTY}'> width : </span><span>${cb.width} mm (${w}px)</span>`, `<span class='${CSS_CLASSES.PROPERTY}'> diagonal : </span><span>${cb.diagonal} mm (${cb.diagonal_px}px)</span>`];
            const ul = doc.createElement('ul');
            list.forEach(item => {
              const li = doc.createElement('li');
              li.innerHTML = item;
              ul.appendChild(li);
            });
            res.appendChild(ul);
            const span = doc.createElement('span');
            span.textContent = ' * 기준 : ' + cb.resolution + ' (' + cb.monitor + ' inch)';
            res.appendChild(span);
          } catch (error) {
            console.error('Error in submit callback:', error);
            displayError('결과 표시 중 오류가 발생했습니다.');
          }
        });
      } catch (error) {
        console.error('Error in submit:', error);
        displayError(ERROR_MESSAGES.CALCULATION_ERROR);
      }
    },
    setDiagonal: async function (h, w, callback) {
      try {
        if (!validateNumericInput(h) || !validateNumericInput(w)) {
          throw new Error(ERROR_MESSAGES.INVALID_INPUT);
        }
        if (typeof callback !== 'function') {
          throw new Error('Callback must be a function');
        }
        const resolutionsData = await readData(STORAGE_KEYS.RESOLUTIONS);
        const monitorsData = await readData(STORAGE_KEYS.MONITORS);
        if (!resolutionsData || !resolutionsData.resolutions) {
          throw new Error(`${ERROR_MESSAGES.STORAGE_ERROR}: resolutions`);
        }
        if (!monitorsData || !monitorsData.monitors) {
          throw new Error(`${ERROR_MESSAGES.STORAGE_ERROR}: monitors`);
        }
        const {
          resolutions
        } = resolutionsData;
        const {
          monitors
        } = monitorsData;
        const cb = {};
        cb.monitor = monitors;
        cb.resolution = resolutions;
        const std_res = cb.resolution.split('x');
        if (std_res.length !== 2) {
          throw new Error('Invalid resolution format');
        }
        const resWidth = parseInt(std_res[0]);
        const resHeight = parseInt(std_res[1]);
        if (!validateNumericInput(resWidth) || !validateNumericInput(resHeight)) {
          throw new Error('Invalid resolution values');
        }
        const std_diagonal = Math.sqrt(Math.pow(resWidth, 2) + Math.pow(resHeight, 2)).toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_STANDARD);
        const monitorSize = parseFloat(cb.monitor);
        if (!validateNumericInput(monitorSize)) {
          throw new Error('Invalid monitor size');
        }
        const std_px = CALCULATION_CONSTANTS.MM_PER_INCH / (std_diagonal / monitorSize);
        const heightNum = parseFloat(h);
        const widthNum = parseFloat(w);
        cb.height = (heightNum * std_px).toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT);
        cb.width = (widthNum * std_px).toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT);
        cb.diagonal = Math.sqrt(Math.pow(cb.width, 2) + Math.pow(cb.height, 2)).toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT);
        cb.diagonal_px = Math.sqrt(Math.pow(heightNum, 2) + Math.pow(widthNum, 2)).toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT);
        callback(cb);
      } catch (error) {
        console.error('Error in setDiagonal:', error);
        displayError(error.message || ERROR_MESSAGES.CALCULATION_ERROR);
        throw error;
      }
    }
  };
  try {
    if (!$(ELEMENT_IDS.CONTAINER)) {
      cals.initialize();
    }
    const closeBtn = $(ELEMENT_IDS.BTN_CLOSE);
    const submitBtn = $(ELEMENT_IDS.BTN_SUBMIT);
    if (validateElement(closeBtn, 'Close Button')) {
      closeBtn.addEventListener('click', cals.close);
    }
    if (validateElement(submitBtn, 'Submit Button')) {
      submitBtn.addEventListener('click', cals.submit);
    }
  } catch (error) {
    console.error('Error during initialization:', error);
    displayError('계산기 초기화에 실패했습니다.');
  }
})();
//# sourceMappingURL=cals.js.map