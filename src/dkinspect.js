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

/*
 * ============================================================================
 * CONSTANTS SECTION
 * ============================================================================
 */

// COLOR & STYLING CONSTANTS
const CONSTANTS = {
  // 색상 및 스타일 상수
  COLOR: {
    DEFAULT_WHITE: '#FFFFFF',
    DEFAULT_BLACK: '#000000',
    TRANSPARENT_HEX: '#00000000',
    TRANSPARENT_HEX_SHORT: '00000000',
    MESSAGE_BG: '#3c77eb',
    MESSAGE_TEXT: '#ffffff',
  },

  // 측정 및 계산 상수
  MEASUREMENT: {
    MM_PER_INCH: 25.4,
    BLOCK_WIDTH: 332,
    DECIMAL_PLACES: 2,
    SIZE_PRECISION: 1,
  },

  // WCAG 명도 대비 계산 상수
  WCAG_CONTRAST: {
    LUMINANCE_RED: 0.2126,
    LUMINANCE_GREEN: 0.7152,
    LUMINANCE_BLUE: 0.0722,
    SRGB_THRESHOLD: 0.03928,
    SRGB_DIVISOR: 12.92,
    SRGB_OFFSET: 0.055,
    SRGB_MULTIPLIER: 1.055,
    SRGB_EXPONENT: 2.4,
    CONTRAST_OFFSET: 0.05,
    MAX_RGB_VALUE: 255,
  },

  // 타이밍 상수 (밀리초)
  TIMING: {
    MESSAGE_DISPLAY: 3000,
  },

  // UI 위치 및 크기 상수
  UI: {
    POSITION_OFFSET: 20,
    POSITION_OFFSET_LARGE: 40,
    POSITION_MIN: 10,
    Z_INDEX_MAX: '99999999',
    BORDER_WIDTH: 1,
    INLINE_BLOCK_SIZE: 8,
  },

  // 상호작용 요소 태그명
  INTERACTIVE_ELEMENTS: ['a', 'button', 'input', 'area'],

  // 부모 상호작용 요소 태그명
  PARENT_INTERACTIVE_ELEMENTS: ['a', 'button', 'input'],

  // 스타일 속성 값
  STYLE_VALUES: {
    NONE: 'none',
    AUTO: 'auto',
    TRANSPARENT: 'transparent',
    ZERO_PX: '0px',
    ZERO: '0',
    ZERO_MARGIN_PADDING: '0 0 0 0',
  },

  // 노드 타입
  NODE_TYPE: {
    ELEMENT: 1,
  },

  // HEX 색상 길이
  COLOR_LENGTH: {
    SHORT: 3,
    FULL: 6,
  },
};

/**
 * Chrome Storage API를 사용하여 저장된 데이터를 읽어오는 함수
 * @param {string} myKey - 읽어올 데이터의 키
 * @returns {Promise} 저장된 데이터를 포함하는 Promise 객체
 */
function readData(myKey) {
  // Promise 객체를 생성합니다.
  return new Promise((resolve, reject) => {
    try {
      // "chrome.storage.sync.get" 함수를 호출하여 데이터를 읽어옵니다.
      chrome.storage.sync.get(myKey, function (data) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          // 읽어온 데이터를 Promise 객체를 통해 반환합니다.
          resolve(data);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

async function myApp() {
  // "chrome.storage.sync" API를 이용하여, 여러 개의 데이터를 읽어옵니다.
  const { ccshow } = await readData('ccshow');
  const { resolutions } = await readData('resolutions');
  const { monitors } = await readData('monitors');
  const { linkmode } = await readData('linkmode');
  const { bgmode } = await readData('bgmode');
  const { linetype } = await readData('linetype');
  const { colortype } = await readData('colortype');
  const { trackingmode } = await readData('trackingmode');
  const { bordersize = 2 } = await readData('bordersize');

  const [width, height] = resolutions.split('x');
  const diagonal = Math.sqrt(
    Math.pow(parseInt(width), 2) + Math.pow(parseInt(height), 2),
  ).toFixed(CONSTANTS.MEASUREMENT.DECIMAL_PLACES);
  const std_px = CONSTANTS.MEASUREMENT.MM_PER_INCH / (diagonal / monitors);

  // "opt" 객체에 각 값을 저장합니다.
  const opt = {
    ccshow,
    stdpx: std_px,
    linkmode,
    bgmode,
    linetype,
    colortype: `#${colortype}`,
    trackingmode,
    bordersize,
  };

  // CSS Properties
  // 텍스트의 색상, 배경색, 명도(contrast)관련 문자열 배열
  const dkInspect_pColorBg = ['color', 'background-color', 'contrast'];

  // 길이 단위(px) 관련 문자열 배열
  const dkInspect_pLength = ['h', 'w', 'diagonal'];

  // 박스 모델(Box Model)과 관련된 CSS 속성을 나타내는 문자열 배열
  const dkInspect_pBox = [
    'height',
    'width',
    'border',
    'border-top',
    'border-right',
    'border-bottom',
    'border-left',
    'margin',
    'padding',
    'max-height',
    'min-height',
    'max-width',
    'min-width',
  ];

  // CSS Property 카테고리
  const dkInspect_categories = {
    pLength: dkInspect_pLength,
    pBox: dkInspect_pBox,
    pColorBg: dkInspect_pColorBg,
  };

  // CSS Property 카테고리 제목
  const dkInspect_categoriesTitle = {
    pLength: 'Length',
    pBox: 'Box',
    pColorBg: 'Color Contrast',
  };

  // Hexadecimal
  const dkInspect_hexa = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
  ];

  /*
   ** Utils
   */

  // 현재 문서 객체를 반환하는 함수
  function GetCurrentDocument() {
    return window.document;
  }

  // 10진수를 16진수로 변환하는 함수
  function DecToHex(nb) {
    return dkInspect_hexa[Math.floor(nb / 16)] + dkInspect_hexa[nb % 16];
  }

  /**
   * RGB 색상 값을 16진수로 변환하고, HTML 요소를 생성하여 16진수 색상 값과 함께 반환하는 함수
   * @param {string} str - RGB 형식의 색상 문자열 (예: "rgb(255, 0, 0)")
   * @returns {string} 색상 박스와 16진수 값을 포함한 HTML 문자열
   */
  function RGBToHex(str) {
    try {
      // RGB 색상 값을 추출하여 10진수에서 16진수로 변환한 배열을 만듭니다.
      const matches = str.match(/\d+/g);
      if (!matches || matches.length < 3) {
        return `<span style='border: ${CONSTANTS.UI.BORDER_WIDTH}px solid ${CONSTANTS.COLOR.DEFAULT_BLACK} !important;width: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;height: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;display: inline-block !important;background-color:${CONSTANTS.COLOR.DEFAULT_WHITE} !important;'></span> ${CONSTANTS.COLOR.DEFAULT_WHITE}`;
      }

      const hexValues = matches.map((val) => DecToHex(parseInt(val)));
      // 각각의 16진수 값을 조합하여 최종 16진수 색상 값을 만듭니다.
      let hexStr = `#${hexValues.join('')}`;

      // 만약 hexStr이 #00000000이라면, #FFFFFF으로 대체합니다.
      if (hexStr === CONSTANTS.COLOR.TRANSPARENT_HEX) {
        hexStr = CONSTANTS.COLOR.DEFAULT_WHITE;
      }

      // 생성된 16진수 색상 값을 포함한 HTML 요소를 반환합니다.
      return `<span style='border: ${CONSTANTS.UI.BORDER_WIDTH}px solid ${CONSTANTS.COLOR.DEFAULT_BLACK} !important;width: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;height: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;display: inline-block !important;background-color:${hexStr} !important;'></span> ${hexStr}`;
    } catch (error) {
      console.error('RGBToHex 변환 오류:', error);
      return `<span style='border: ${CONSTANTS.UI.BORDER_WIDTH}px solid ${CONSTANTS.COLOR.DEFAULT_BLACK} !important;width: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;height: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;display: inline-block !important;background-color:${CONSTANTS.COLOR.DEFAULT_WHITE} !important;'></span> ${CONSTANTS.COLOR.DEFAULT_WHITE}`;
    }
  }

  /**
   * RGB 색상 값을 16진수 문자열로 변환하여 반환하는 함수
   * @param {string} str - RGB 형식의 색상 문자열
   * @returns {string} 16진수 색상 문자열 (예: "FF0000")
   */
  function RGBToHexStr(str) {
    try {
      // 문자열에서 괄호 안의 값만 추출합니다.
      const matches = str.match(/\((.*?)\)/);
      if (!matches || !matches[1]) {
        return CONSTANTS.COLOR.DEFAULT_WHITE.substring(1);
      }

      const hexValues = matches[1].split(', ');
      let hexStr = '';

      // RGB 값을 16진수 문자열로 변환합니다.
      for (const item of hexValues) {
        hexStr += DecToHex(item);
      }

      // 만약 hexStr이 '00000000'이라면, 'FFFFFF'으로 대체합니다.
      if (hexStr === CONSTANTS.COLOR.TRANSPARENT_HEX_SHORT) {
        hexStr = CONSTANTS.COLOR.DEFAULT_WHITE.substring(1);
      }

      return hexStr;
    } catch (error) {
      console.error('RGBToHexStr 변환 오류:', error);
      return CONSTANTS.COLOR.DEFAULT_WHITE.substring(1);
    }
  }

  // 문자열에서 'px'를 제거하고, 반올림한 값을 문자열로 반환하는 함수입니다.
  function RemoveExtraFloat(nb) {
    nb = nb.substring(0, nb.length - 2);
    return `${Math.round(nb)}px`;
  }

  /**
   * RGB 색상에서 Luminance 값을 계산하여 반환하는 함수
   * @param {string} color - RGB 색상 코드 문자열 (3자리 또는 6자리)
   * @returns {number|false} 계산된 Luminance 값 (0 ~ 255) 또는 false
   */
  function getL(color) {
    try {
      let R, G, B;
      if (color.length === CONSTANTS.COLOR_LENGTH.SHORT) {
        R = getsRGB(color.substring(0, 1) + color.substring(0, 1));
        G = getsRGB(color.substring(1, 2) + color.substring(1, 2));
        B = getsRGB(color.substring(2, 3) + color.substring(2, 3));
      } else if (color.length === CONSTANTS.COLOR_LENGTH.FULL) {
        R = getsRGB(color.substring(0, 2));
        G = getsRGB(color.substring(2, 4));
        B = getsRGB(color.substring(4, 6));
      } else {
        return false;
      }

      // 값 유효성 검사
      if (R === false || G === false || B === false) {
        return false;
      }

      // Luminance 값 계산하여 반환
      return (
        CONSTANTS.WCAG_CONTRAST.LUMINANCE_RED * R +
        CONSTANTS.WCAG_CONTRAST.LUMINANCE_GREEN * G +
        CONSTANTS.WCAG_CONTRAST.LUMINANCE_BLUE * B
      );
    } catch (error) {
      console.error('Luminance 계산 오류:', error);
      return false;
    }
  }

  /**
   * 16진수 색상코드를 10진수 RGB 값으로 변환하는 함수
   * @param {string} color - 16진수 색상 코드
   * @returns {number|false} 10진수 RGB 값 또는 false
   */
  function getRGB(color) {
    try {
      const tmp = parseInt(color, 16);
      return isNaN(tmp) ? false : tmp;
    } catch (error) {
      console.error('RGB 변환 오류:', error);
      return false;
    }
  }

  /**
   * 16진수 색상코드를 sRGB 값으로 변환하는 함수
   * @param {string} color - 16진수 색상 코드
   * @returns {number|false} sRGB 값 또는 false
   */
  function getsRGB(color) {
    const tmp = getRGB(color);
    if (tmp === false) {
      return false;
    }

    const sRGB = tmp / CONSTANTS.WCAG_CONTRAST.MAX_RGB_VALUE;
    return sRGB <= CONSTANTS.WCAG_CONTRAST.SRGB_THRESHOLD
      ? sRGB / CONSTANTS.WCAG_CONTRAST.SRGB_DIVISOR
      : Math.pow(
          (sRGB + CONSTANTS.WCAG_CONTRAST.SRGB_OFFSET) /
            CONSTANTS.WCAG_CONTRAST.SRGB_MULTIPLIER,
          CONSTANTS.WCAG_CONTRAST.SRGB_EXPONENT,
        );
  }
  /*
   * CSSFunc
   */

  // 주어진 element의 CSS 속성 값을 반환하는 함수
  function GetCSSProperty(element, property) {
    return element.getPropertyValue(property);
  }

  // 주어진 element의 CSS 속성 값을 설정하는 함수
  function SetCSSProperty(element, property) {
    const document = GetCurrentDocument();
    const li = document.getElementById(`dkInspect_${property}`);

    if (!li) {
      console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
      return;
    }

    li.lastChild.innerHTML = ` : ${element.getPropertyValue(property)}`;
  }

  // element의 CSS property를 조건(condition)에 따라 설정하는 함수
  function SetCSSPropertyIf(element, property, condition) {
    // 현재 문서 가져오기
    const document = GetCurrentDocument();
    // 해당 property의 ID를 가진 엘리먼트 가져오기
    const li = document.getElementById(`dkInspect_${property}`);

    if (!li) {
      console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
      return 0;
    }

    // 조건이 참일 경우
    if (condition) {
      // li의 마지막 자식에 해당 property의 값을 넣어줌
      li.lastChild.innerHTML = ` : ${element.getPropertyValue(property)}`;
      // li 엘리먼트 보여주기
      li.style.display = 'block';

      return 1;
    }
    // 조건이 거짓일 경우
    else {
      // li 엘리먼트 숨기기
      li.style.display = 'none';

      return 0;
    }
  }

  // 요소 e의 왼쪽 위치를 반환하는 함수
  function getLeft(e) {
    // 요소 e의 boundingRect 가져오기
    const boundingRect = e.getBoundingClientRect();
    // boundingRect에서 left값 가져오기. 만약 없으면 0으로 설정
    const left = boundingRect.left || 0;
    // 문서의 스크롤 X축 오프셋 값 가져오기
    const documentOffsetLeft = document.body.ownerDocument.defaultView.scrollX;
    // 요소의 offsetLeft 값 가져오기
    const offsetLeft =
      document.body.getBoundingClientRect().left +
      window.scrollX -
      document.documentElement.clientLeft;
    // left값, 스크롤 X축 오프셋 값, 요소의 offsetLeft 값 합쳐서 반환
    return left + documentOffsetLeft - offsetLeft;
  }

  // 요소 e의 상단 위치를 반환하는 함수
  function getTop(e) {
    // 요소 e의 boundingRect 가져오기
    const boundingRect = e.getBoundingClientRect();
    // boundingRect에서 top값 가져오기. 만약 없으면 0으로 설정
    const top = boundingRect.top || 0;
    // 문서의 페이지 Y축 오프셋 값 가져오기
    const documentOffsetTop = document.body.ownerDocument.defaultView.scrollY;
    // 요소의 offsetTop 값 가져오기
    const offsetTop =
      document.body.getBoundingClientRect().top +
      window.scrollY -
      document.documentElement.clientTop;
    // top값, 페이지 Y축 오프셋 값, 요소의 offsetTop 값 합쳐서 반환
    return top + documentOffsetTop - offsetTop;
  }

  // 요소 e의 너비를 반환하는 함수
  function getWidth(e) {
    // 요소 e의 boundingRect 가져오기
    const boundingRect = e.getBoundingClientRect();
    // boundingRect에서 너비 값을 가져오기. 만약 없으면 0으로 설정
    return boundingRect.width || 0;
  }

  // 요소 e의 높이를 반환하는 함수
  function getHeight(e) {
    // 요소 e의 boundingRect 가져오기
    const boundingRect = e.getBoundingClientRect();
    // boundingRect에서 높이 값을 가져오기. 만약 없으면 0으로 설정
    return boundingRect.height || 0;
  }

  /**
   * 요소의 대각선 길이와 너비, 높이 값을 계산하고 이를 li 엘리먼트에 표시하는 함수
   * @param {CSSStyleDeclaration} element - CSS 스타일 객체
   * @param {Object} opt - 옵션 객체 (stdpx 포함)
   * @param {HTMLElement} e - DOM 요소
   * @param {boolean} w_condition - 너비 조건
   * @param {boolean} h_condition - 높이 조건
   * @returns {number} 성공 시 1, 실패 시 0
   */
  function SetCSSDiagonal(element, opt, e, w_condition, h_condition) {
    const document = GetCurrentDocument();
    // li 엘리먼트 가져오기
    const li_h = document.getElementById('dkInspect_h');
    const li_w = document.getElementById('dkInspect_w');
    const li_d = document.getElementById('dkInspect_diagonal');

    if (!li_h || !li_w || !li_d) {
      console.warn('대각선 표시 요소를 찾을 수 없습니다');
      return 0;
    }

    // 표준 픽셀 값 가져오기
    const std_px = opt.stdpx;
    let h_px, w_px;

    // 너비 조건과 높이 조건이 모두 참일 경우
    if (w_condition && h_condition) {
      // 패딩과 보더 값을 포함한 높이 값 계산
      const paddingTop = parseFloat(element.getPropertyValue('padding-top')); // 요소의 상단 패딩 값 가져오기
      const paddingBottom = parseFloat(
        element.getPropertyValue('padding-bottom'),
      ); // 요소의 하단 패딩 값 가져오기
      const borderTop = parseFloat(element.getPropertyValue('border-top')); // 요소의 상단 보더 값 가져오기
      const borderBottom = parseFloat(
        element.getPropertyValue('border-bottom'),
      ); // 요소의 하단 보더 값 가져오기
      h_px =
        parseFloat(element.getPropertyValue('height')) + // 요소의 높이 값 가져오기
        paddingTop + // 상단 패딩 값을 더함
        paddingBottom + // 하단 패딩 값을 더함
        borderTop + // 상단 보더 값을 더함
        borderBottom; // 하단 보더 값을 더함

      // 패딩과 보더 값을 포함한 너비 값 계산
      const paddingLeft = parseFloat(element.getPropertyValue('padding-left')); // 요소의 왼쪽 패딩 값 가져오기
      const paddingRight = parseFloat(
        element.getPropertyValue('padding-right'),
      ); // 요소의 오른쪽 패딩 값 가져오기
      const borderLeft = parseFloat(element.getPropertyValue('border-left')); // 요소의 왼쪽 보더 값 가져오기
      const borderRight = parseFloat(element.getPropertyValue('border-right')); // 요소의 오른쪽 보더 값 가져오기
      w_px =
        parseFloat(element.getPropertyValue('width')) + // 요소의 너비 값 가져오기
        paddingLeft + // 왼쪽 패딩 값을 더함
        paddingRight + // 오른쪽 패딩 값을 더함
        borderLeft + // 왼쪽 보더 값을 더함
        borderRight; // 오른쪽 보더 값을 더함
    }
    // 너비 조건과 높이 조건이 모두 거짓일 경우
    else {
      // 요소의 너비와 높이 값 가져오기
      h_px = getWidth(e);
      w_px = getHeight(e);
    }

    // 높이 값과 너비 값이 존재할 경우
    if (h_px && w_px) {
      // 대각선 길이, 대각선 길이의 픽셀 값, 너비, 높이 값을 계산
      const h = h_px * std_px;
      const w = w_px * std_px;
      const d = Math.sqrt(w * w + h * h);
      const d_px = Math.sqrt(w_px * w_px + h_px * h_px);

      // li 엘리먼트에 값을 넣고 보여주기
      li_h.lastChild.textContent = ` : ${h.toFixed(
        CONSTANTS.MEASUREMENT.SIZE_PRECISION,
      )}mm (${h_px.toFixed(CONSTANTS.MEASUREMENT.SIZE_PRECISION)}px)`;
      li_w.lastChild.textContent = ` : ${w.toFixed(
        CONSTANTS.MEASUREMENT.SIZE_PRECISION,
      )}mm (${w_px.toFixed(CONSTANTS.MEASUREMENT.SIZE_PRECISION)}px)`;
      li_d.lastChild.textContent = ` : ${d.toFixed(
        CONSTANTS.MEASUREMENT.SIZE_PRECISION,
      )}mm (${d_px.toFixed(CONSTANTS.MEASUREMENT.SIZE_PRECISION)}px)`;
      li_h.style.display = 'block';
      li_w.style.display = 'block';
      li_d.style.display = 'block';

      return 1;
    }
    // 높이 값 또는 너비 값이 없는 경우
    else {
      // li_d 엘리먼트를 숨기고 0 반환
      li_d.style.display = 'none';
      return 0;
    }
  }

  /**
   * 요소의 전경색과 배경색의 대비를 계산하고 이를 li 엘리먼트에 표시하는 함수
   * @param {CSSStyleDeclaration} element - CSS 스타일 객체
   * @param {boolean} condition - 표시 조건
   * @returns {number} 성공 시 1, 실패 시 0
   */
  function SetCSSColorContrast(element, condition) {
    const document = GetCurrentDocument();
    // li 엘리먼트 가져오기
    const li = document.getElementById('dkInspect_contrast');

    if (!li) {
      console.warn('대비 표시 요소를 찾을 수 없습니다');
      return 0;
    }

    try {
      // 전경색과 배경색 추출하여 L값 계산
      const foreground_color = RGBToHexStr(GetCSSProperty(element, 'color')); // 전경색 값 추출
      const background_color = RGBToHexStr(
        GetCSSProperty(element, 'background-color'),
      ); // 배경색 값 추출
      const L1 = getL(foreground_color); // 전경색의 L값 계산
      const L2 = getL(background_color); // 배경색의 L값 계산

      // L 값이 유효한지 확인
      if (L1 === false || L2 === false) {
        li.style.display = 'none';
        return 0;
      }

      // 대비 비율 계산
      const ratio =
        (Math.max(L1, L2) + CONSTANTS.WCAG_CONTRAST.CONTRAST_OFFSET) /
        (Math.min(L1, L2) + CONSTANTS.WCAG_CONTRAST.CONTRAST_OFFSET);

      // 조건이 참일 경우 li 엘리먼트에 대비 비율 값을 넣고 보여주기
      if (condition) {
        li.lastChild.innerHTML = ` : ${
          Math.round(ratio * 100) / 100
        }:1`;
        li.style.display = 'block';
        return 1;
      }
      // 조건이 거짓일 경우 li 엘리먼트를 숨기고 0 반환
      else {
        li.style.display = 'none';
        return 0;
      }
    } catch (error) {
      console.error('색상 대비 계산 오류:', error);
      li.style.display = 'none';
      return 0;
    }
  }

  // 요소의 CSS 속성 값을 변경하고 이를 li 엘리먼트에 표시하는 함수
  function SetCSSPropertyValue(element, property, value) {
    const document = GetCurrentDocument();
    // li 엘리먼트 가져오기
    const li = document.getElementById(`dkInspect_${property}`);

    if (!li) {
      console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
      return;
    }

    // li 엘리먼트의 텍스트 변경 및 보여주기
    li.lastChild.innerHTML = ` : ${value}`;
    li.style.display = 'block';
  }

  // 요소의 CSS 속성 값을 변경하고 이를 li 엘리먼트에 표시하는 함수
  function SetCSSPropertyValueIf(element, property, value, condition) {
    const document = GetCurrentDocument();
    // li 엘리먼트 가져오기
    const li = document.getElementById(`dkInspect_${property}`);

    if (!li) {
      console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
      return 0;
    }

    // 조건이 참일 경우 li 엘리먼트의 텍스트 변경 및 보여주기
    if (condition) {
      li.lastChild.innerHTML = ` : ${value}`;
      li.style.display = 'block';
      return 1;
    }
    // 조건이 거짓일 경우 li 엘리먼트를 숨기고 0 반환
    else {
      li.style.display = 'none';
      return 0;
    }
  }

  // li 엘리먼트의 특정 CSS 속성 값을 숨기는 함수
  function HideCSSProperty(property) {
    const document = GetCurrentDocument();
    // li 엘리먼트 가져오기
    const li = document.getElementById(`dkInspect_${property}`);
    // li 엘리먼트를 숨기기
    if (li) li.style.display = 'none';
  }

  // CSS 속성이 속한 카테고리 전체를 숨기는 함수
  function HideCSSCategory(category) {
    const document = GetCurrentDocument();
    // div 엘리먼트 가져오기
    const div = document.getElementById(`dkInspect_${category}`);

    // div 엘리먼트를 숨기기
    if (div) div.style.display = 'none';
  }

  // CSS 속성이 속한 카테고리 전체를 보여주는 함수
  function ShowCSSCategory(category) {
    const document = GetCurrentDocument();
    // div 엘리먼트 가져오기
    const div = document.getElementById(`dkInspect_${category}`);
    // div 엘리먼트를 보여주기
    if (div) div.style.display = 'block';
  }

  // 요소의 색상과 배경색, 대비 비율을 업데이트하는 함수
  function UpdateColorBg(element) {
    // 요소의 color 속성 값을 li 엘리먼트에 표시
    SetCSSPropertyValue(
      element,
      'color',
      RGBToHex(GetCSSProperty(element, 'color')),
    );
    // 배경색이 투명하지 않은 경우 background-color 속성 값을 li 엘리먼트에 표시
    SetCSSPropertyValueIf(
      element,
      'background-color',
      RGBToHex(GetCSSProperty(element, 'background-color')),
      GetCSSProperty(element, 'background-color') !==
        CONSTANTS.STYLE_VALUES.TRANSPARENT,
    );

    // 배경색이 투명하지 않은 경우 대비 비율을 계산하여 li 엘리먼트에 표시
    SetCSSColorContrast(
      element,
      GetCSSProperty(element, 'background-color') !==
        CONSTANTS.STYLE_VALUES.TRANSPARENT,
    );
  }

  // 요소의 길이 정보를 업데이트하는 함수
  function UpdateLength(element, opt, e) {
    // height 속성 값이 숫자로 파싱 가능한 경우와 width 속성 값이 숫자로 파싱 가능한 경우에만 대각선 길이를 계산하고 li 엘리먼트에 표시
    SetCSSDiagonal(
      element,
      opt,
      e,
      !isNaN(parseFloat(GetCSSProperty(element, 'height'))),
      !isNaN(parseFloat(GetCSSProperty(element, 'width'))),
    );
  }

  /**
   * 요소의 Box 모델 정보를 업데이트하는 함수
   * @param {CSSStyleDeclaration} element - CSS 스타일 객체
   */
  function UpdateBox(element) {
    // Height와 Width 속성 값이 auto가 아닌 경우에만 height와 width 속성 값을 li 엘리먼트에 표시합니다.
    SetCSSPropertyIf(
      element,
      'height',
      RemoveExtraFloat(GetCSSProperty(element, 'height')) !==
        CONSTANTS.STYLE_VALUES.AUTO,
    );
    SetCSSPropertyIf(
      element,
      'width',
      RemoveExtraFloat(GetCSSProperty(element, 'width')) !==
        CONSTANTS.STYLE_VALUES.AUTO,
    );

    // Border 정보를 가져와 각각의 속성 값에 따라 border-top, border-bottom, border-right, border-left 또는 border 속성에 값을 할당하고 표시합니다.
    const borderTop =
      RemoveExtraFloat(GetCSSProperty(element, 'border-top-width')) +
      ' ' +
      GetCSSProperty(element, 'border-top-style') +
      ' ' +
      RGBToHex(GetCSSProperty(element, 'border-top-color'));
    const borderBottom =
      RemoveExtraFloat(GetCSSProperty(element, 'border-bottom-width')) +
      ' ' +
      GetCSSProperty(element, 'border-bottom-style') +
      ' ' +
      RGBToHex(GetCSSProperty(element, 'border-bottom-color'));
    const borderRight =
      RemoveExtraFloat(GetCSSProperty(element, 'border-right-width')) +
      ' ' +
      GetCSSProperty(element, 'border-right-style') +
      ' ' +
      RGBToHex(GetCSSProperty(element, 'border-right-color'));
    const borderLeft =
      RemoveExtraFloat(GetCSSProperty(element, 'border-left-width')) +
      ' ' +
      GetCSSProperty(element, 'border-left-style') +
      ' ' +
      RGBToHex(GetCSSProperty(element, 'border-left-color'));

    if (
      borderTop === borderBottom &&
      borderBottom === borderRight &&
      borderRight === borderLeft &&
      GetCSSProperty(element, 'border-top-style') !==
        CONSTANTS.STYLE_VALUES.NONE
    ) {
      SetCSSPropertyValue(element, 'border', borderTop);

      HideCSSProperty('border-top');
      HideCSSProperty('border-bottom');
      HideCSSProperty('border-right');
      HideCSSProperty('border-left');
    } else {
      SetCSSPropertyValueIf(
        element,
        'border-top',
        borderTop,
        GetCSSProperty(element, 'border-top-style') !==
          CONSTANTS.STYLE_VALUES.NONE,
      );
      SetCSSPropertyValueIf(
        element,
        'border-bottom',
        borderBottom,
        GetCSSProperty(element, 'border-bottom-style') !==
          CONSTANTS.STYLE_VALUES.NONE,
      );
      SetCSSPropertyValueIf(
        element,
        'border-right',
        borderRight,
        GetCSSProperty(element, 'border-right-style') !==
          CONSTANTS.STYLE_VALUES.NONE,
      );
      SetCSSPropertyValueIf(
        element,
        'border-left',
        borderLeft,
        GetCSSProperty(element, 'border-left-style') !==
          CONSTANTS.STYLE_VALUES.NONE,
      );

      HideCSSProperty('border');
    }

    // Margin 값과 padding 값 정보를 가져와 각각 li 엘리먼트에 표시합니다.
    const marginTop = RemoveExtraFloat(GetCSSProperty(element, 'margin-top'));
    const marginBottom = RemoveExtraFloat(
      GetCSSProperty(element, 'margin-bottom'),
    );
    const marginRight = RemoveExtraFloat(
      GetCSSProperty(element, 'margin-right'),
    );
    const marginLeft = RemoveExtraFloat(GetCSSProperty(element, 'margin-left'));
    const margin = `${
      marginTop === CONSTANTS.STYLE_VALUES.ZERO_PX
        ? CONSTANTS.STYLE_VALUES.ZERO
        : marginTop
    } ${
      marginRight === CONSTANTS.STYLE_VALUES.ZERO_PX
        ? CONSTANTS.STYLE_VALUES.ZERO
        : marginRight
    } ${
      marginBottom === CONSTANTS.STYLE_VALUES.ZERO_PX
        ? CONSTANTS.STYLE_VALUES.ZERO
        : marginBottom
    } ${
      marginLeft === CONSTANTS.STYLE_VALUES.ZERO_PX
        ? CONSTANTS.STYLE_VALUES.ZERO
        : marginLeft
    }`;
    SetCSSPropertyValueIf(
      element,
      'margin',
      margin,
      margin !== CONSTANTS.STYLE_VALUES.ZERO_MARGIN_PADDING,
    );

    // padding
    const paddingTop = RemoveExtraFloat(GetCSSProperty(element, 'padding-top'));
    const paddingBottom = RemoveExtraFloat(
      GetCSSProperty(element, 'padding-bottom'),
    );
    const paddingRight = RemoveExtraFloat(
      GetCSSProperty(element, 'padding-right'),
    );
    const paddingLeft = RemoveExtraFloat(
      GetCSSProperty(element, 'padding-left'),
    );
    const padding = `${
      paddingTop === CONSTANTS.STYLE_VALUES.ZERO_PX
        ? CONSTANTS.STYLE_VALUES.ZERO
        : paddingTop
    } ${
      paddingRight === CONSTANTS.STYLE_VALUES.ZERO_PX
        ? CONSTANTS.STYLE_VALUES.ZERO
        : paddingRight
    } ${
      paddingBottom === CONSTANTS.STYLE_VALUES.ZERO_PX
        ? CONSTANTS.STYLE_VALUES.ZERO
        : paddingBottom
    } ${
      paddingLeft === CONSTANTS.STYLE_VALUES.ZERO_PX
        ? CONSTANTS.STYLE_VALUES.ZERO
        : paddingLeft
    }`;

    SetCSSPropertyValueIf(
      element,
      'padding',
      padding,
      padding !== CONSTANTS.STYLE_VALUES.ZERO_MARGIN_PADDING,
    );

    SetCSSPropertyIf(
      element,
      'min-height',
      GetCSSProperty(element, 'min-height') !== CONSTANTS.STYLE_VALUES.ZERO_PX,
    );
    SetCSSPropertyIf(
      element,
      'max-height',
      GetCSSProperty(element, 'max-height') !== CONSTANTS.STYLE_VALUES.NONE,
    );
    SetCSSPropertyIf(
      element,
      'min-width',
      GetCSSProperty(element, 'min-width') !== CONSTANTS.STYLE_VALUES.ZERO_PX,
    );
    SetCSSPropertyIf(
      element,
      'max-width',
      GetCSSProperty(element, 'max-width') !== CONSTANTS.STYLE_VALUES.NONE,
    );
  }

  /*
   ** Event Handlers
   */

  /**
   * dkInspectMouseOver 함수는 마우스 오버 이벤트를 처리하는 함수입니다.
   * @param {MouseEvent} e - 마우스 이벤트 객체
   */
  function dkInspectMouseOver(e) {
    // 필요한 변수들을 선언합니다.
    const document = GetCurrentDocument();
    const block = document.getElementById('dkInspect_block');
    const trackingEl = document.getElementById('dkInspect_tracking');

    if (!block) {
      return;
    }
    if (this.tagName.toLowerCase() !== 'body') {
      // 만약 추적 모드가 활성화되어 있다면
      if (opt.trackingmode) {
        // 클릭된 요소의 id가 'dkInspect_tracking'이 아니라면
        if (e.target.id !== 'dkInspect_tracking') {
          // 요소를 아웃라인으로 강조하기
          trackingEl.style.width = `${parseInt(getWidth(this))}px`;
          trackingEl.style.height = `${parseInt(getHeight(this))}px`;
          trackingEl.style.left = `${parseInt(getLeft(this))}px`;
          trackingEl.style.top = `${parseInt(getTop(this))}px`;
          trackingEl.style.display = 'block';
        }
      } else {
        // 아웃라인으로 요소를 강조하지 않는다면, 대신 다른 스타일 속성을 사용한다.
        this.style.setProperty(
          'outline-width',
          `${opt.bordersize}px`,
          'important',
        );
        this.style.setProperty('outline-color', opt.colortype, 'important');
        this.style.setProperty('outline-style', opt.linetype, 'important');
        this.style.setProperty(
          'outline-offset',
          `-${opt.bordersize}px`,
          'important',
        );
      }
    }

    const type1 = () => {
      let tit = `<${this.tagName}`;
      if (this.type) {
        tit += ` [${this.type}]`;
      }
      // 요소의 id와 클래스 이름을 제목에 추가한다.
      tit += `>${this.id === '' ? '' : ` #${this.id}`}${
        this.className === '' ? '' : ` .${this.className}`
      }`;
      block.firstChild.textContent = tit;
      // CSS 속성 업데이트
      const element = document.defaultView.getComputedStyle(this, null);
      UpdateLength(element, opt, this);
      UpdateBox(element);

      // 배경색 관련 CSS 카테고리 업데이트
      if (opt.ccshow === 1) {
        UpdateColorBg(element);
      } else {
        HideCSSCategory('pColorBg');
      }

      // 블록을 보여준다.
      block.style.display = 'block';
    };

    const type2 = () => {
      let tit = `<${this.parentElement.nodeName}`;
      if (this.parentElement.type) {
        tit += ` [${this.parentElement.type}]`;
      }
      // 요소를 포함하는 요소의 id와 클래스 이름을 제목에 추가한다.
      tit += `>${
        this.parentElement.id === '' ? '' : ` #${this.parentElement.id}`
      }${
        this.parentElement.className === ''
          ? ''
          : ` .${this.parentElement.className}`
      }`;
      block.firstChild.textContent = tit;
      // CSS 속성 업데이트
      const element = document.defaultView.getComputedStyle(
        this.parentElement,
        null,
      );
      UpdateLength(element, opt, this.parentElement);
      UpdateBox(element);

      // 배경색 관련 CSS 카테고리 업데이트
      if (opt.ccshow === 1) {
        UpdateColorBg(element);
      } else {
        HideCSSCategory('pColorBg');
      }
      // 블록을 보여준다.
      block.style.display = 'block';
    };

    if (opt.trackingmode) {
      if (this.id !== 'dkInspect_tracking') {
        const tagName = this.tagName.toLowerCase();
        const parentTagName = this.parentElement?.nodeName.toLowerCase();
        // 링크(a), 버튼(button), 입력란(input), 이미지 맵(area) 요소의 태그 이름과 유형(type)을 제목에 추가한다.
        if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
          type1();
        } else {
          // 블록을 숨긴다.
          block.style.display = 'none';
        }

        // 요소를 포함하는 링크(a), 버튼(button), 입력란(input) 요소의 태그 이름과 유형(type)을 제목에 추가한다.
        if (CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)) {
          type2();
          trackingEl.style.display = 'block';
        }
      }
    } else if (opt.linkmode === 1) {
      const tagName = this.tagName.toLowerCase();
      const parentTagName = this.parentElement?.nodeName.toLowerCase();

      // 링크(a), 버튼(button), 입력란(input), 이미지 맵(area) 요소의 태그 이름과 유형(type)을 제목에 추가한다.
      if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
        type1();
      }
      // 요소를 포함하는 링크(a), 버튼(button), 입력란(input) 요소의 태그 이름과 유형(type)을 제목에 추가한다.
      else if (CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)) {
        type2();
      } else {
        // 블록을 숨긴다.
        block.style.display = 'none';
      }
    } else {
      type1();
    }

    // 'dkInspectInsertMessage' 요소를 삭제한다.
    dkInspectRemoveElement('dkInspectInsertMessage');

    // 이벤트 전파를 중단한다.
    e.stopPropagation();
  }

  // 마우스가 요소에서 벗어나는 이벤트 핸들러 함수
  function dkInspectMouseOut(e) {
    if (opt.trackingmode) {
      // 트래킹 모드가 활성화되어 있으면
      const trackingEl = document.getElementById('dkInspect_tracking');
      if (this.id === 'dkInspect_tracking') {
        // 마우스가 'dkInspect_tracking' 요소에서 벗어나지 않았으면 해당 요소를 보이게 한다.
        trackingEl.style.display = 'block';
      } else {
        // 마우스가 'dkInspect_tracking' 요소에서 벗어났으면 해당 요소를 숨긴다.
        if (trackingEl) trackingEl.style.display = 'none';
      }
    } else {
      // 트래킹 모드가 비활성화되어 있으면 outline 속성을 초기화한다.
      this.style.outlineWidth = '';
      this.style.outlineColor = '';
      this.style.outlineStyle = '';
      this.style.outlineOffset = '';
    }
    // 이벤트 전파를 중단한다.
    e.stopPropagation();
  }

  /**
   * 마우스 이동 이벤트 핸들러 함수
   * @param {MouseEvent} e - 마우스 이벤트 객체
   */
  function dkInspectMouseMove(e) {
    const document = GetCurrentDocument();
    const block = document.getElementById('dkInspect_block');
    const trackingEl = document.getElementById('dkInspect_tracking');
    // 'dkInspect_block' 요소가 없으면 함수를 종료한다.
    if (!block) {
      return;
    }
    if (opt.trackingmode) {
      const tagName = this.tagName.toLowerCase();
      if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
        trackingEl.style.display = 'block';
      } else {
        if (this.id === 'dkInspect_tracking') {
          trackingEl.style.display = 'block';
        } else {
          const parentTagName = this.parentElement?.nodeName.toLowerCase();
          if (
            CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)
          ) {
            trackingEl.style.display = 'block';
          } else {
            trackingEl.style.display = 'none';
          }
        }
      }
    } else if (opt.linkmode === 1) {
      const tagName = this.tagName.toLowerCase();
      const parentTagName = this.parentElement?.nodeName.toLowerCase();
      if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
        block.style.display = 'block';
      } else if (
        CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)
      ) {
        block.style.display = 'block';
      } else {
        this.style.outlineWidth = '';
        this.style.outlineColor = '';
        this.style.outlineStyle = '';
        this.style.outlineOffset = '';
      }
    } else {
      block.style.display = 'block';
    }

    if (
      this.tagName.toLowerCase() === 'body' ||
      this.tagName.toLowerCase() === 'frame'
    ) {
      if (opt.trackingmode) {
        trackingEl.style.display = 'none';
      }
    }

    // dkInspect_block의 위치를 설정하는 코드
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;
    const blockWidth = CONSTANTS.MEASUREMENT.BLOCK_WIDTH;

    // dkInspect_block의 높이를 가져옴
    const blockHeight = parseInt(
      document.defaultView.getComputedStyle(block, null).height,
    );

    // dkInspect_block이 페이지 너비를 벗어나는 경우
    if (e.pageX + blockWidth > pageWidth) {
      // dkInspect_block을 왼쪽으로 이동시킴
      if (
        e.pageX - blockWidth - CONSTANTS.UI.POSITION_MIN >
        0
      )
        block.style.left = `${
          e.pageX - blockWidth - CONSTANTS.UI.POSITION_OFFSET_LARGE
        }px`;
      else block.style.left = `0px`;
    } else
      block.style.left = `${e.pageX + CONSTANTS.UI.POSITION_OFFSET}px`;

    // dkInspect_block이 페이지 높이를 벗어나는 경우
    if (e.pageY + blockHeight > pageHeight) {
      // dkInspect_block을 위쪽으로 이동시킴
      if (
        e.pageY - blockHeight - CONSTANTS.UI.POSITION_MIN >
        0
      )
        block.style.top = `${
          e.pageY - blockHeight - CONSTANTS.UI.POSITION_OFFSET
        }px`;
      else block.style.top = `0px`;
    } else
      block.style.top = `${e.pageY + CONSTANTS.UI.POSITION_OFFSET}px`;

    // dkInspect_block의 위치를 스크롤 위치에 맞게 조정하는 코드
    const inView = dkInspectIsElementInViewport(block);

    // dkInspect_block이 화면에 보이지 않는 경우
    if (!inView)
      block.style.top = `${
        window.scrollY + CONSTANTS.UI.POSITION_OFFSET
      }px`;

    // 이벤트 전파 방지
    e.stopPropagation();
  }

  // 주어진 요소(el)이 현재 화면에 보이는지를 확인하는 함수
  function dkInspectIsElementInViewport(el) {
    // 요소의 위치와 크기 정보를 구한다.
    const rect = el.getBoundingClientRect();

    // 요소가 현재 화면 안에 포함되어 있는지를 반환한다.
    // 요소의 top과 left 값이 모두 0 이상이고, bottom 값이 현재 화면의 높이 이하이며,
    // right 값이 현재 화면의 넓이 이하일 경우에 true를 반환한다.
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /*
   * dkInspect Class
   */
  function DkInspect() {
    // dkInspect_block을 생성하는 함수
    this.CreateBlock = function () {
      // 현재 문서(document)를 가져옴
      const document = GetCurrentDocument();
      let block;

      if (document) {
        // div 요소를 생성하고 id를 'dkInspect_block'로 설정함
        block = document.createElement('div');
        block.id = 'dkInspect_block';

        // CSS 선택자를 위한 제목(title)을 추가함
        const header = document.createElement('h1');
        header.appendChild(document.createTextNode(''));
        block.appendChild(header);

        // 모든 속성을 추가함
        const center = document.createElement('div');
        center.id = 'dkInspect_center';

        // dkInspect_categories 객체의 속성을 반복함
        for (const cat in dkInspect_categories) {
          const div = document.createElement('div');
          div.id = `dkInspect_${cat}`;
          div.className = 'dkInspect_category';

          // 카테고리 제목을 추가함
          const h2 = document.createElement('h2');
          h2.appendChild(
            document.createTextNode(dkInspect_categoriesTitle[cat]),
          );

          // 속성 목록을 추가함
          const ul = document.createElement('ul');
          const properties = dkInspect_categories[cat];

          // 속성을 반복하면서 각각의 요소(li)를 생성함
          for (const item of properties) {
            const li = document.createElement('li');
            li.id = `dkInspect_${item}`;

            // 속성 이름과 값에 대한 span 요소를 생성함
            const spanName = document.createElement('span');
            spanName.className = 'dkInspect_property';

            const spanValue = document.createElement('span');

            spanName.appendChild(document.createTextNode(item));
            li.appendChild(spanName);
            li.appendChild(spanValue);
            ul.appendChild(li);
          }
          div.appendChild(h2);
          div.appendChild(ul);
          center.appendChild(div);
        }

        // dkInspect_block에 추가함
        block.appendChild(center);
      }

      // '이 페이지에서 검사 할 요소 위로 포인터를 올려주세요.' 메시지를 출력함
      dkInspectInsertMessage(
        '이 페이지에서 검사 할 요소 위로 포인터를 올려주세요.',
      );

      // 생성된 dkInspect_block을 반환함
      return block;
    };

    // 현재 문서의 모든 요소를 반환하는 함수
    this.GetAllElements = function (element) {
      let elements = [];

      if (element && element.hasChildNodes()) {
        // 현재 요소가 자식 요소를 가지고 있을 경우, 현재 요소를 elements 배열에 추가한다.
        elements.push(element);
        // 현재 요소의 모든 자식 요소를 가져와서 재귀적으로 GetAllElements 함수를 호출한다.
        const child = element.childNodes;
        for (let i = 0; i < child.length; i++) {
          if (child[i].hasChildNodes()) {
            // 자식 요소가 또 자식 요소를 가지고 있는 경우, 재귀 호출을 통해 해당 요소의 모든 자식 요소를 가져온다.
            elements = elements.concat(this.GetAllElements(child[i]));
          } else if (child[i].nodeType === CONSTANTS.NODE_TYPE.ELEMENT) {
            // 자식 요소가 텍스트 노드가 아닌 요소인 경우, elements 배열에 추가한다.
            elements.push(child[i]);
          }
        }
      }
      // 모든 요소를 포함하는 elements 배열을 반환한다.
      return elements;
    };

    // Add event listeners for all elements in the current document
    // 모든 요소에 이벤트 리스너를 추가하는 함수
    this.AddEventListeners = function () {
      const document = GetCurrentDocument();
      // 문서의 모든 요소를 가져온다.
      const elements = this.GetAllElements(document.body);

      try {
        // FRAMESET 요소가 포함되어 있는 경우, 진단이 불가능하므로 경고 메시지를 출력하고 함수를 종료한다.
        if (
          window.frames.document &&
          window.frames.document.body &&
          window.frames.document.body.nodeName === 'FRAMESET'
        ) {
          alert('크롬 브라우저에서는 FRAMESET의 진단이 불가능합니다.');
          dkInspectRemoveElement('dkInspectInsertMessage');
          return false;
        }
      } catch (error) {
        console.warn('프레임 접근 오류:', error);
      }

      // 모든 요소에 대해 이벤트 리스너를 추가한다.
      elements.forEach((item) => {
        item.addEventListener('mouseover', dkInspectMouseOver, false);
        item.addEventListener('mouseout', dkInspectMouseOut, false);
        item.addEventListener('mousemove', dkInspectMouseMove, false);
      });

      // 만약 프레임이 존재하는 경우, 모든 프레임 내의 요소에 대해 이벤트 리스너를 추가한다.
      if (window.frames.length > 0) {
        for (let k = 0; k < window.frames.length; k++) {
          try {
            const frameEl = window.frames[k].document.body;
            if (frameEl) {
              const frameEls = this.GetAllElements(frameEl);
              frameEls.forEach((item) => {
                item.addEventListener('mouseover', dkInspectMouseOver, false);
                item.addEventListener('mouseout', dkInspectMouseOut, false);
                item.addEventListener('mousemove', dkInspectMouseMove, false);
              });
            }
          } catch (error) {
            console.warn(`프레임 ${k} 접근 오류:`, error);
          }
        }
      }
    };

    // 모든 요소의 이벤트 리스너를 제거하는 함수
    this.RemoveEventListeners = function () {
      const document = GetCurrentDocument();
      // 문서의 모든 요소를 가져온다.
      const elements = this.GetAllElements(document.body);

      // 모든 요소에 대해 이벤트 리스너를 제거한다.
      elements.forEach((item) => {
        item.removeEventListener('mouseover', dkInspectMouseOver, false);
        item.removeEventListener('mouseout', dkInspectMouseOut, false);
        item.removeEventListener('mousemove', dkInspectMouseMove, false);
      });

      // 만약 프레임이 존재하는 경우, 모든 프레임 내의 요소에 대해 이벤트 리스너를 제거한다.
      if (window.frames.length > 0) {
        for (let k = 0; k < window.frames.length; k++) {
          try {
            const frameEl = window.frames[k].document.body;
            if (frameEl) {
              const frameEls = this.GetAllElements(frameEl);
              frameEls.forEach((item) => {
                item.removeEventListener('mouseover', dkInspectMouseOver, false);
                item.removeEventListener('mouseout', dkInspectMouseOut, false);
                item.removeEventListener('mousemove', dkInspectMouseMove, false);
              });
            }
          } catch (error) {
            console.warn(`프레임 ${k} 접근 오류:`, error);
          }
        }
      }
    };
  }

  // tracking 객체 정의
  const tracking = {
    // trackingEl 엘리먼트 생성 함수
    generate: function () {
      const document = GetCurrentDocument();
      let trackingEl;
      if (document) {
        // trackingEl 생성 및 속성 설정
        trackingEl = document.createElement('div');
        trackingEl.id = 'dkInspect_tracking';
        this.setColor(trackingEl, opt.colortype);
        trackingEl.style.setProperty(
          'outline-style',
          opt.linetype,
          'important',
        );
      }
      return trackingEl;
    },
    // 테두리 색상 설정 함수
    setColor: function (e, hex) {
      if (e) {
        e.style.setProperty('outline-color', hex, 'important');
        // 배경색 설정 옵션에 따라 배경색 설정
        if (opt.bgmode) {
          e.style.setProperty(
            'background-color',
            this.hexToRGB(hex, 0.2),
            'important',
          );
        }
      }
    },
    // 16진수 색상코드를 rgba 색상값으로 변환하는 함수
    hexToRGB: function (hex, alpha) {
      alpha = alpha || 1;
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      hex = hex.replace(shorthandRegex, function (m, r, g, b) {
        return r + r + g + g + b + b;
      });
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex),
        r = parseInt(result[1], 16),
        g = parseInt(result[2], 16),
        b = parseInt(result[3], 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },
  };

  DkInspect.prototype.IsEnabled = function () {
    // 현재 페이지의 document 객체를 가져옵니다.
    const document = GetCurrentDocument();

    // 만약 dkInspect_block 요소가 존재하면 true를, 존재하지 않으면 false를 반환합니다.
    return !!document.getElementById('dkInspect_block');
  };

  // DkInspect 객체의 Enable 메소드
  DkInspect.prototype.Enable = function () {
    // 현재 문서 객체 가져오기
    const document = GetCurrentDocument();
    // dkInspect_block 요소 가져오기
    let block = document.getElementById('dkInspect_block');
    // 블록이 존재하지 않으면 새로운 블록을 생성
    if (!block) {
      // BODY 요소가 없으면 새로 생성
      if (!document.getElementsByTagName('BODY')[0]) {
        const body = document.createElement('BODY');
        document.documentElement.appendChild(body);
      }

      // 블록 생성 후 BODY 요소에 추가
      block = this.CreateBlock();
      document.getElementsByTagName('BODY')[0].appendChild(block);

      // 트래킹 모드가 활성화되어 있으면, 트래킹 요소 생성 후 BODY 요소에 추가
      if (opt.trackingmode) {
        const trackingEl = tracking.generate();
        document.getElementsByTagName('BODY')[0].appendChild(trackingEl);
      }

      // 마우스 이벤트 리스너 추가
      dkInspect.AddEventListeners();
      return true;
    }

    return false;
  };

  // DkInspect의 Disable 메서드
  DkInspect.prototype.Disable = function () {
    const document = GetCurrentDocument();
    const block = document.getElementById('dkInspect_block'); // 블록 엘리먼트 가져오기
    const trackingEl = document.getElementById('dkInspect_tracking'); // 트래킹 엘리먼트 가져오기

    if (block) {
      // 블록 엘리먼트가 존재하면
      const bodyEl = document.getElementsByTagName('BODY')[0];
      if (bodyEl) {
        bodyEl.removeChild(block); // body에서 블록 엘리먼트 제거
        if (opt.trackingmode && trackingEl) {
          // 트래킹 모드가 켜져 있으면
          bodyEl.removeChild(trackingEl); // body에서 트래킹 엘리먼트 제거
        }
      }
      this.RemoveEventListeners(); // 이벤트 리스너 제거
      return true; // 제거 성공 반환
    }

    return false; // 제거할 블록 엘리먼트가 없으면 실패 반환
  };

  // 메시지를 삽입하는 함수
  function dkInspectInsertMessage(msg) {
    const oNewP = document.createElement('p'); // 새로운 p 태그 생성
    const oText = document.createTextNode(msg); // 전달받은 메시지로 text 노드 생성

    // p 태그 속성 설정
    oNewP.appendChild(oText); // p 태그에 text 노드 추가
    oNewP.id = 'dkInspectInsertMessage';
    oNewP.style.backgroundColor = CONSTANTS.COLOR.MESSAGE_BG;
    oNewP.style.color = CONSTANTS.COLOR.MESSAGE_TEXT;
    oNewP.style.position = 'fixed';
    oNewP.style.top = `${CONSTANTS.UI.POSITION_MIN}px`;
    oNewP.style.left = `${CONSTANTS.UI.POSITION_MIN}px`;
    oNewP.style.zIndex = CONSTANTS.UI.Z_INDEX_MAX;
    oNewP.style.padding = '5px';
    oNewP.style.fontSize = '14px';
    oNewP.style.fontWeight = 'bold';

    document.getElementsByTagName('BODY')[0].appendChild(oNewP); // BODY에 p 태그 추가
  }

  // 이 함수는 주어진 divId를 가진 요소를 삭제합니다.
  function dkInspectRemoveElement(divId) {
    const element = document.getElementById(divId);

    if (element) {
      const bodyEl = document.getElementsByTagName('BODY')[0];
      if (bodyEl) {
        bodyEl.removeChild(element);
      }
    }
  }

  // dkInspect 멈춤 상태
  let dkInspectPause = false;
  // Chrome 브라우저 확장프로그램에서 단축키를 설정하여 dkInspect의 이벤트 리스너를 일시정지 혹은 다시 시작하는 기능을 구현
  const shortcut = {
    // 초기화 함수
    // 단축키를 설정하고, 해당 단축키를 눌렀을 때 dkInspect 이벤트 리스너 일시정지 혹은 다시 시작하는 함수를 호출
    initialize: function () {
      try {
        // 백그라운드 스크립트에 pause 메시지를 보냄
        chrome.runtime.sendMessage(
          {
            cmd: 'pause',
          },
          // 응답 받은 후 실행될 콜백 함수
          function (response) {
            if (chrome.runtime.lastError) {
              console.warn(
                '단축키 초기화 오류:',
                chrome.runtime.lastError.message,
              );
              return;
            }

            // window 객체에 keyup 이벤트 리스너를 추가함
            window.addEventListener(
              'keyup',
              function (e) {
                // 응답으로 받은 값과 눌린 키가 같은지 비교함
                if (e.key === response) {
                  // dkInspectPause 변수가 true일 경우, shortcut을 재개하고 그렇지 않을 경우 일시정지함
                  if (dkInspectPause) {
                    shortcut.resume();
                  } else {
                    shortcut.pause();
                  }
                }
              },
              false,
            );
          },
        );
      } catch (error) {
        console.error('단축키 초기화 실패:', error);
      }
    },
    // 일시정지 함수
    // dkInspect 이벤트 리스너를 일시정지합니다. 이 때, '일시정지' 메시지를 추가로 출력하고 3초 후에 메시지를 제거
    pause: function () {
      console.log('pause');

      // 현재 문서(document)를 가져옴
      const document = GetCurrentDocument();

      // id가 'dkInspect_block'인 요소를 가져옴
      const block = document.getElementById('dkInspect_block');

      // 'dkInspect_block' 요소가 존재하는 경우
      if (block) {
        // 이벤트 리스너 제거 및 dkInspectPause 변수 값을 true로 변경
        dkInspect.RemoveEventListeners();
        dkInspectPause = true;
        // '일시정지' 메시지를 출력하고 일정 시간 후에 제거
        dkInspectInsertMessage('일시정지');
        setTimeout(function () {
          dkInspectRemoveElement('dkInspectInsertMessage');
        }, CONSTANTS.TIMING.MESSAGE_DISPLAY);

        // 함수 실행을 종료하고 true 반환
        return true;
      }

      // 'dkInspect_block' 요소가 존재하지 않는 경우, false 반환
      return false;
    },

    // 재개 함수
    // dkInspect 이벤트 리스너를 다시 시작합니다. 이 때, '재개' 메시지를 추가로 출력하고 3초 후에 메시지를 제거
    resume: function () {
      console.log('resume');

      // 현재 문서(document)를 가져옴
      const document = GetCurrentDocument();

      // id가 'dkInspect_block'인 요소를 가져옴
      const block = document.getElementById('dkInspect_block');

      // 'dkInspect_block' 요소가 존재하는 경우
      if (block) {
        // 이벤트 리스너 추가 및 dkInspectPause 변수 값을 false로 변경
        dkInspect.AddEventListeners();
        dkInspectPause = false;
        // '재개' 메시지를 출력하고 일정 시간 후에 제거
        dkInspectInsertMessage('재개');
        setTimeout(function () {
          dkInspectRemoveElement('dkInspectInsertMessage');
        }, CONSTANTS.TIMING.MESSAGE_DISPLAY);

        // 함수 실행을 종료하고 true 반환
        return true;
      }

      // 'dkInspect_block' 요소가 존재하지 않는 경우, false 반환
      return false;
    },
  };

  /*
   * dkInspect entry-point
   */
  let dkInspect = new DkInspect();
  shortcut.initialize();

  if (dkInspect.IsEnabled()) {
    dkInspect.Disable();
  } else {
    dkInspect.Enable();
  }
}
myApp().then(() => console.log('Load'));
