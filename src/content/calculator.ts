// Import CSS
import './calculator.css';
import { StorageManager } from '../shared/storage-utils.ts';

/**
 * Calculator result callback data interface
 */
interface CalculatorResult {
  monitor: string;
  resolution: string;
  height: string;
  width: string;
  diagonal: string;
  diagonal_px: string;
}

/**
 * Calculator callback function type
 */
type CalculatorCallback = (result: CalculatorResult) => void;

(function (): void {
  // ==================== CONSTANTS ====================

  /**
   * UI 요소 ID 상수
   * @constant
   */
  const ELEMENT_IDS = {
    CONTAINER: 'dkInspect_cals',
    INPUT_HEIGHT: 'dkInspect_input_height',
    INPUT_WIDTH: 'dkInspect_input_width',
    BTN_SUBMIT: 'dkInspect_btn_submit',
    BTN_CLOSE: 'dkInspect_btn_close',
    RESULT: 'dkInspect_cals_result',
  } as const;

  /**
   * CSS 클래스 상수
   * @constant
   */
  const CSS_CLASSES = {
    PROPERTY: 'dkInspect_property',
    BUTTON: 'btn',
  } as const;

  /**
   * 스토리지 키 상수
   * @constant
   */
  const STORAGE_KEYS = {
    RESOLUTIONS: 'resolutions',
    MONITORS: 'monitors',
  } as const;

  /**
   * 계산 상수
   * @constant
   */
  const CALCULATION_CONSTANTS = {
    MM_PER_INCH: 25.4,
    DECIMAL_PLACES_STANDARD: 2,
    DECIMAL_PLACES_RESULT: 1,
  } as const;

  /**
   * 기본 에러 메시지
   * @constant
   */
  const ERROR_MESSAGES = {
    INVALID_INPUT: '유효하지 않은 입력값입니다.',
    MISSING_ELEMENT: '필수 요소를 찾을 수 없습니다.',
    STORAGE_ERROR: '저장소에서 데이터를 읽을 수 없습니다.',
    CALCULATION_ERROR: '계산 중 오류가 발생했습니다.',
  } as const;

  // ==================== UTILITY FUNCTIONS ====================

  // document 객체와 html 요소를 변수에 할당합니다.
  const doc = document;

  /**
   * ID를 인자로 받아 해당 ID를 가진 DOM 요소를 반환합니다.
   *
   * @function $
   * @param id - 찾고자 하는 요소의 ID
   * @returns 찾은 DOM 요소 또는 null
   * @example
   * const element = $('myElementId');
   */
  const $ = function (id: string): HTMLElement | null {
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

  /**
   * 숫자 입력값의 유효성을 검증하는 함수입니다.
   *
   * @function validateNumericInput
   * @param value - 검증할 값
   * @returns 유효한 숫자인 경우 true, 그렇지 않으면 false
   * @example
   * validateNumericInput('123'); // true
   * validateNumericInput('abc'); // false
   */
  function validateNumericInput(
    value: string | number | null | undefined,
  ): boolean {
    if (value === null || value === undefined || value === '') {
      return false;
    }
    const num = Number(value);
    return !isNaN(num) && isFinite(num) && num > 0;
  }

  /**
   * DOM 요소가 존재하는지 확인하는 함수입니다.
   *
   * @function validateElement
   * @param element - 검증할 DOM 요소
   * @param elementName - 요소의 이름 (에러 메시지용)
   * @returns 요소가 존재하면 true, 그렇지 않으면 false
   */
  function validateElement(
    element: HTMLElement | null,
    elementName: string,
  ): element is HTMLElement {
    if (!element) {
      console.error(`${ERROR_MESSAGES.MISSING_ELEMENT}: ${elementName}`);
      return false;
    }
    return true;
  }

  /**
   * 에러 메시지를 사용자에게 표시하는 함수입니다.
   *
   * @function displayError
   * @param message - 표시할 에러 메시지
   * @returns void
   */
  function displayError(message: string): void {
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

  // ==================== MAIN CALCULATOR OBJECT ====================

  const cals = {
    /**
     * "dkInspect_cals" ID를 가진 "div" 요소를 생성하고, 이를 화면에 추가하는 함수입니다.
     * 계산기 UI의 초기 구조를 생성합니다.
     *
     * @function initialize
     * @memberof cals
     * @returns void
     * @throws Error DOM 요소 생성 또는 추가 실패 시 에러
     * @example
     * cals.initialize();
     */
    initialize: function (): void {
      try {
        // "div" 요소를 생성하고, 이 요소의 ID를 "dkInspect_cals"로 설정합니다.
        const container = doc.createElement('div');
        container.id = ELEMENT_IDS.CONTAINER;

        // "h1" 요소를 생성하고, 이 요소에 "수동 계산"이라는 텍스트 노드를 추가합니다.
        const header = doc.createElement('h1');
        header.appendChild(doc.createTextNode('수동 계산'));
        container.appendChild(header);

        // "div" 요소를 하나 더 생성하고, 이 요소에 "ul" 요소를 추가합니다.
        const inputContainer = doc.createElement('div');
        const ul = doc.createElement('ul');

        // Height input field
        const heightLi = doc.createElement('li');
        const heightLabelSpan = doc.createElement('span');
        heightLabelSpan.className = CSS_CLASSES.PROPERTY;
        const heightLabel = doc.createElement('label');
        heightLabel.setAttribute('for', ELEMENT_IDS.INPUT_HEIGHT);
        heightLabel.textContent = 'Height';
        heightLabelSpan.appendChild(heightLabel);
        const heightInputSpan = doc.createElement('span');
        const heightInput = doc.createElement('input');
        heightInput.type = 'text';
        heightInput.id = ELEMENT_IDS.INPUT_HEIGHT;
        heightInputSpan.appendChild(heightInput);
        heightInputSpan.appendChild(doc.createTextNode(' px'));
        heightLi.appendChild(heightLabelSpan);
        heightLi.appendChild(heightInputSpan);
        ul.appendChild(heightLi);

        // Width input field
        const widthLi = doc.createElement('li');
        const widthLabelSpan = doc.createElement('span');
        widthLabelSpan.className = CSS_CLASSES.PROPERTY;
        const widthLabel = doc.createElement('label');
        widthLabel.setAttribute('for', ELEMENT_IDS.INPUT_WIDTH);
        widthLabel.textContent = 'Width';
        widthLabelSpan.appendChild(widthLabel);
        const widthInputSpan = doc.createElement('span');
        const widthInput = doc.createElement('input');
        widthInput.type = 'text';
        widthInput.id = ELEMENT_IDS.INPUT_WIDTH;
        widthInputSpan.appendChild(widthInput);
        widthInputSpan.appendChild(doc.createTextNode(' px'));
        widthLi.appendChild(widthLabelSpan);
        widthLi.appendChild(widthInputSpan);
        ul.appendChild(widthLi);

        // Buttons
        const btnLi = doc.createElement('li');
        const btnSpan = doc.createElement('span');
        btnSpan.style.cssFloat = 'right';
        const submitBtn = doc.createElement('button');
        submitBtn.id = ELEMENT_IDS.BTN_SUBMIT;
        submitBtn.className = CSS_CLASSES.BUTTON;
        submitBtn.textContent = '확인';
        const closeBtn = doc.createElement('button');
        closeBtn.id = ELEMENT_IDS.BTN_CLOSE;
        closeBtn.className = CSS_CLASSES.BUTTON;
        closeBtn.textContent = '닫기';
        btnSpan.appendChild(submitBtn);
        btnSpan.appendChild(closeBtn);
        btnLi.appendChild(btnSpan);
        ul.appendChild(btnLi);

        // "ul" 요소를 "div" 요소에 추가합니다.
        inputContainer.appendChild(ul);
        container.appendChild(inputContainer);

        // 결과를 출력할 "div" 요소를 생성하고, 이 요소의 ID를 "dkInspect_cals_result"로 설정합니다.
        const result = doc.createElement('div');
        result.id = ELEMENT_IDS.RESULT;
        container.appendChild(result);

        // 새로 생성한 "div" 요소를 "body" 요소에 추가합니다.
        const body = window.document.getElementsByTagName('BODY')[0];
        if (!body) {
          throw new Error('Body element not found');
        }
        body.appendChild(container);

        // 이벤트 전파 방지 (포커스 유지 및 외부 이벤트 간섭 방지)
        const stopPropagation = (e: Event) => e.stopPropagation();
        [
          'click',
          'mousedown',
          'mouseup',
          'keydown',
          'keyup',
          'keypress',
        ].forEach((eventType) => {
          container.addEventListener(eventType, stopPropagation);
        });
      } catch (error) {
        console.error('Error in initialize:', error);
        displayError('UI 초기화에 실패했습니다.');
      }
    },

    /**
     * "dkInspect_cals" ID를 가진 "div" 요소를 제거하는 함수입니다.
     * 계산기 UI를 화면에서 제거합니다.
     *
     * @function close
     * @memberof cals
     * @returns void
     * @throws Error 요소 제거 실패 시 에러
     * @example
     * cals.close();
     */
    close: function (): void {
      try {
        // "dkInspect_cals" ID를 가진 "div" 요소를 가져와 변수에 할당합니다.
        const container = $(ELEMENT_IDS.CONTAINER);

        if (!validateElement(container, ELEMENT_IDS.CONTAINER)) {
          return;
        }

        // "body" 요소에서 "container" 요소를 제거합니다.
        const body = window.document.getElementsByTagName('BODY')[0];
        if (!body) {
          throw new Error('Body element not found');
        }

        body.removeChild(container);
      } catch (error) {
        console.error('Error in close:', error);
        // 닫기 실패는 심각한 문제가 아니므로 사용자에게 알리지 않음
      }
    },

    /**
     * 입력 필드에서 값을 가져와 계산을 수행한 다음, 결과를 화면에 출력하는 함수입니다.
     *
     * @async
     * @function submit
     * @memberof cals
     * @returns 비동기 작업 완료를 나타내는 Promise
     * @throws Error 입력값 검증 실패 또는 계산 중 에러 발생 시
     * @example
     * await cals.submit();
     */
    submit: async function (): Promise<void> {
      try {
        // 입력 요소들을 가져옵니다.
        const heightInput = $(
          ELEMENT_IDS.INPUT_HEIGHT,
        ) as HTMLInputElement | null;
        const widthInput = $(
          ELEMENT_IDS.INPUT_WIDTH,
        ) as HTMLInputElement | null;

        // 요소 존재 여부 확인
        if (
          !validateElement(heightInput, 'Height Input') ||
          !validateElement(widthInput, 'Width Input')
        ) {
          displayError(ERROR_MESSAGES.MISSING_ELEMENT);
          return;
        }

        // "dkInspect_input_height"와 "dkInspect_input_width" ID를 가진 입력 필드의 값을 가져옵니다.
        const h = heightInput.value;
        const w = widthInput.value;

        // 입력값 검증
        if (!validateNumericInput(h) || !validateNumericInput(w)) {
          displayError(
            ERROR_MESSAGES.INVALID_INPUT + ' 양수 숫자만 입력 가능합니다.',
          );
          return;
        }

        // "setDiagonal" 함수를 호출하여 계산을 수행합니다.
        await cals.setDiagonal(h, w, function (cb: CalculatorResult): void {
          try {
            // 결과를 출력하기 위해 "dkInspect_cals_result" ID를 가진 요소를 찾아 가져옵니다.
            const res = $(ELEMENT_IDS.RESULT);

            if (!validateElement(res, 'Result Container')) {
              return;
            }

            // 이전 내용을 모두 지우고, "h2" 요소를 추가하여 "Results"라는 텍스트 노드를 출력합니다.
            res.textContent = '';
            const header = doc.createElement('h2');
            header.appendChild(doc.createTextNode('Results'));
            res.appendChild(header);

            // 입력값과 계산 결과를 "ul" 요소에 추가하여 "dkInspect_cals_result" 요소에 출력합니다.
            const list = [
              { label: 'height', value: `${cb.height} mm (${h}px)` },
              { label: 'width', value: `${cb.width} mm (${w}px)` },
              {
                label: 'diagonal',
                value: `${cb.diagonal} mm (${cb.diagonal_px}px)`,
              },
            ];

            // "list" 배열에 저장된 값들을 이용하여 "ul" 요소를 생성하고, 이 요소에 "li" 요소들을 추가합니다.
            const ul = doc.createElement('ul');
            list.forEach((item) => {
              // "li" 요소를 생성하고, 안전하게 DOM 요소를 추가합니다.
              const li = doc.createElement('li');

              const labelSpan = doc.createElement('span');
              labelSpan.className = CSS_CLASSES.PROPERTY;
              labelSpan.textContent = ` ${item.label} : `;

              const valueSpan = doc.createElement('span');
              valueSpan.textContent = item.value;

              li.appendChild(labelSpan);
              li.appendChild(valueSpan);

              // 생성된 "li" 요소를 "ul" 요소에 추가합니다.
              ul.appendChild(li);
            });

            // "ul" 요소를 "dkInspect_cals_result" 요소에 추가합니다.
            res.appendChild(ul);

            // 해상도와 모니터 크기 정보를 "span" 요소에 추가하여 "dkInspect_cals_result" 요소에 출력합니다.
            const span = doc.createElement('span');
            span.textContent =
              ' * 기준 : ' + cb.resolution + ' (' + cb.monitor + ' inch)';
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

    /**
     * 입력받은 높이와 너비를 사용하여 모니터의 대각선 길이, 해상도, 픽셀당 mm 길이를 계산하는 함수입니다.
     *
     * @async
     * @function setDiagonal
     * @memberof cals
     * @param h - 높이 값 (픽셀 단위)
     * @param w - 너비 값 (픽셀 단위)
     * @param callback - 계산 결과를 전달받을 콜백 함수
     * @returns 비동기 작업 완료를 나타내는 Promise
     * @throws Error 스토리지 읽기 실패 또는 계산 중 에러 발생 시
     * @example
     * await cals.setDiagonal(1920, 1080, (result) => {
     *   console.log(result.diagonal);
     * });
     */
    setDiagonal: async function (
      h: string | number,
      w: string | number,
      callback: CalculatorCallback,
    ): Promise<void> {
      try {
        // 입력값 검증
        if (!validateNumericInput(h) || !validateNumericInput(w)) {
          throw new Error(ERROR_MESSAGES.INVALID_INPUT);
        }

        if (typeof callback !== 'function') {
          throw new Error('Callback must be a function');
        }

        // StorageManager를 이용하여 저장된 "resolutions"와 "monitors" 값을 가져옵니다.
        const data = await StorageManager.getMultiple([
          STORAGE_KEYS.RESOLUTIONS,
          STORAGE_KEYS.MONITORS,
        ]);

        // 데이터 검증
        if (!data || !data.resolutions) {
          throw new Error(`${ERROR_MESSAGES.STORAGE_ERROR}: resolutions`);
        }
        if (!data || !data.monitors) {
          throw new Error(`${ERROR_MESSAGES.STORAGE_ERROR}: monitors`);
        }

        const { resolutions, monitors } = data;

        // 계산 결과를 저장할 객체를 생성합니다.
        const cb: Partial<CalculatorResult> = {};
        cb.monitor = String(monitors);
        cb.resolution = String(resolutions);

        // 해상도의 가로 세로 값을 구합니다.
        const std_res = cb.resolution.split('x');

        if (std_res.length !== 2) {
          throw new Error('Invalid resolution format');
        }

        const resWidth = parseInt(std_res[0]);
        const resHeight = parseInt(std_res[1]);

        if (
          !validateNumericInput(resWidth) ||
          !validateNumericInput(resHeight)
        ) {
          throw new Error('Invalid resolution values');
        }

        // 가로 세로 값을 이용하여 표준 대각선 길이를 구합니다.
        const std_diagonal = Math.sqrt(
          Math.pow(resWidth, 2) + Math.pow(resHeight, 2),
        ).toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_STANDARD);

        // 모니터 크기 검증
        const monitorSize = parseFloat(cb.monitor);
        if (!validateNumericInput(monitorSize)) {
          throw new Error('Invalid monitor size');
        }

        // 표준 대각선 길이를 이용하여 픽셀당 mm 길이를 구합니다.
        const std_px =
          CALCULATION_CONSTANTS.MM_PER_INCH /
          (Number(std_diagonal) / monitorSize); // mm 기준

        // 입력값을 숫자로 변환
        const heightNum = parseFloat(String(h));
        const widthNum = parseFloat(String(w));

        // 입력받은 높이와 너비를 이용하여, 실제 높이와 너비를 구합니다.
        cb.height = (heightNum * std_px).toFixed(
          CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT,
        ); // to mm
        cb.width = (widthNum * std_px).toFixed(
          CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT,
        ); // to mm
        cb.diagonal = Math.sqrt(
          Math.pow(Number(cb.width), 2) + Math.pow(Number(cb.height), 2),
        ).toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT); // to mm

        // 입력받은 높이와 너비를 이용하여 대각선 길이(px)를 구합니다.
        cb.diagonal_px = Math.sqrt(
          Math.pow(heightNum, 2) + Math.pow(widthNum, 2),
        ).toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT); // to px

        // 계산 결과를 콜백 함수에 전달합니다.
        callback(cb as CalculatorResult);
      } catch (error) {
        console.error('Error in setDiagonal:', error);
        displayError(
          (error as Error).message || ERROR_MESSAGES.CALCULATION_ERROR,
        );
        throw error;
      }
    },
  };

  // ==================== INITIALIZATION ====================

  try {
    // "dkInspect_cals" 요소가 없을 경우에만 "cals.initialize()" 함수를 호출하여 계산기 UI를 초기화합니다.
    if (!$(ELEMENT_IDS.CONTAINER)) {
      cals.initialize();
    }

    // "dkInspect_btn_close" 요소와 "dkInspect_btn_submit" 요소에 이벤트 리스너를 추가합니다.
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
