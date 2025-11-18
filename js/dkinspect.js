const CONSTANTS = {
  COLOR: {
    DEFAULT_WHITE: '#FFFFFF',
    DEFAULT_BLACK: '#000000',
    TRANSPARENT_HEX: '#00000000',
    TRANSPARENT_HEX_SHORT: '00000000',
    MESSAGE_BG: '#3c77eb',
    MESSAGE_TEXT: '#ffffff'
  },
  MEASUREMENT: {
    MM_PER_INCH: 25.4,
    BLOCK_WIDTH: 332,
    DECIMAL_PLACES: 2,
    SIZE_PRECISION: 1
  },
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
    MAX_RGB_VALUE: 255
  },
  TIMING: {
    MESSAGE_DISPLAY: 3000
  },
  UI: {
    POSITION_OFFSET: 20,
    POSITION_OFFSET_LARGE: 40,
    POSITION_MIN: 10,
    Z_INDEX_MAX: '99999999',
    BORDER_WIDTH: 1,
    INLINE_BLOCK_SIZE: 8
  },
  INTERACTIVE_ELEMENTS: ['a', 'button', 'input', 'area'],
  PARENT_INTERACTIVE_ELEMENTS: ['a', 'button', 'input'],
  STYLE_VALUES: {
    NONE: 'none',
    AUTO: 'auto',
    TRANSPARENT: 'transparent',
    ZERO_PX: '0px',
    ZERO: '0',
    ZERO_MARGIN_PADDING: '0 0 0 0'
  },
  NODE_TYPE: {
    ELEMENT: 1
  },
  COLOR_LENGTH: {
    SHORT: 3,
    FULL: 6
  }
};
function readData(myKey) {
  return new Promise((resolve, reject) => {
    try {
      chrome.storage.sync.get(myKey, function (data) {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(data);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}
async function myApp() {
  const {
    ccshow
  } = await readData('ccshow');
  const {
    resolutions
  } = await readData('resolutions');
  const {
    monitors
  } = await readData('monitors');
  const {
    linkmode
  } = await readData('linkmode');
  const {
    bgmode
  } = await readData('bgmode');
  const {
    linetype
  } = await readData('linetype');
  const {
    colortype
  } = await readData('colortype');
  const {
    trackingmode
  } = await readData('trackingmode');
  const {
    bordersize = 2
  } = await readData('bordersize');
  const [width, height] = resolutions.split('x');
  const diagonal = Math.sqrt(Math.pow(parseInt(width), 2) + Math.pow(parseInt(height), 2)).toFixed(CONSTANTS.MEASUREMENT.DECIMAL_PLACES);
  const std_px = CONSTANTS.MEASUREMENT.MM_PER_INCH / (diagonal / monitors);
  const opt = {
    ccshow,
    stdpx: std_px,
    linkmode,
    bgmode,
    linetype,
    colortype: `#${colortype}`,
    trackingmode,
    bordersize
  };
  const dkInspect_pColorBg = ['color', 'background-color', 'contrast'];
  const dkInspect_pLength = ['h', 'w', 'diagonal'];
  const dkInspect_pBox = ['height', 'width', 'border', 'border-top', 'border-right', 'border-bottom', 'border-left', 'margin', 'padding', 'max-height', 'min-height', 'max-width', 'min-width'];
  const dkInspect_categories = {
    pLength: dkInspect_pLength,
    pBox: dkInspect_pBox,
    pColorBg: dkInspect_pColorBg
  };
  const dkInspect_categoriesTitle = {
    pLength: 'Length',
    pBox: 'Box',
    pColorBg: 'Color Contrast'
  };
  const dkInspect_hexa = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
  function GetCurrentDocument() {
    return window.document;
  }
  function DecToHex(nb) {
    return dkInspect_hexa[Math.floor(nb / 16)] + dkInspect_hexa[nb % 16];
  }
  function RGBToHex(str) {
    try {
      const matches = str.match(/\d+/g);
      if (!matches || matches.length < 3) {
        return `<span style='border: ${CONSTANTS.UI.BORDER_WIDTH}px solid ${CONSTANTS.COLOR.DEFAULT_BLACK} !important;width: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;height: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;display: inline-block !important;background-color:${CONSTANTS.COLOR.DEFAULT_WHITE} !important;'></span> ${CONSTANTS.COLOR.DEFAULT_WHITE}`;
      }
      const hexValues = matches.map(val => DecToHex(parseInt(val)));
      let hexStr = `#${hexValues.join('')}`;
      if (hexStr === CONSTANTS.COLOR.TRANSPARENT_HEX) {
        hexStr = CONSTANTS.COLOR.DEFAULT_WHITE;
      }
      return `<span style='border: ${CONSTANTS.UI.BORDER_WIDTH}px solid ${CONSTANTS.COLOR.DEFAULT_BLACK} !important;width: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;height: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;display: inline-block !important;background-color:${hexStr} !important;'></span> ${hexStr}`;
    } catch (error) {
      console.error('RGBToHex 변환 오류:', error);
      return `<span style='border: ${CONSTANTS.UI.BORDER_WIDTH}px solid ${CONSTANTS.COLOR.DEFAULT_BLACK} !important;width: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;height: ${CONSTANTS.UI.INLINE_BLOCK_SIZE}px !important;display: inline-block !important;background-color:${CONSTANTS.COLOR.DEFAULT_WHITE} !important;'></span> ${CONSTANTS.COLOR.DEFAULT_WHITE}`;
    }
  }
  function RGBToHexStr(str) {
    try {
      const matches = str.match(/\((.*?)\)/);
      if (!matches || !matches[1]) {
        return CONSTANTS.COLOR.DEFAULT_WHITE.substring(1);
      }
      const hexValues = matches[1].split(', ');
      let hexStr = '';
      for (const item of hexValues) {
        hexStr += DecToHex(item);
      }
      if (hexStr === CONSTANTS.COLOR.TRANSPARENT_HEX_SHORT) {
        hexStr = CONSTANTS.COLOR.DEFAULT_WHITE.substring(1);
      }
      return hexStr;
    } catch (error) {
      console.error('RGBToHexStr 변환 오류:', error);
      return CONSTANTS.COLOR.DEFAULT_WHITE.substring(1);
    }
  }
  function RemoveExtraFloat(nb) {
    nb = nb.substring(0, nb.length - 2);
    return `${Math.round(nb)}px`;
  }
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
      if (R === false || G === false || B === false) {
        return false;
      }
      return CONSTANTS.WCAG_CONTRAST.LUMINANCE_RED * R + CONSTANTS.WCAG_CONTRAST.LUMINANCE_GREEN * G + CONSTANTS.WCAG_CONTRAST.LUMINANCE_BLUE * B;
    } catch (error) {
      console.error('Luminance 계산 오류:', error);
      return false;
    }
  }
  function getRGB(color) {
    try {
      const tmp = parseInt(color, 16);
      return isNaN(tmp) ? false : tmp;
    } catch (error) {
      console.error('RGB 변환 오류:', error);
      return false;
    }
  }
  function getsRGB(color) {
    const tmp = getRGB(color);
    if (tmp === false) {
      return false;
    }
    const sRGB = tmp / CONSTANTS.WCAG_CONTRAST.MAX_RGB_VALUE;
    return sRGB <= CONSTANTS.WCAG_CONTRAST.SRGB_THRESHOLD ? sRGB / CONSTANTS.WCAG_CONTRAST.SRGB_DIVISOR : Math.pow((sRGB + CONSTANTS.WCAG_CONTRAST.SRGB_OFFSET) / CONSTANTS.WCAG_CONTRAST.SRGB_MULTIPLIER, CONSTANTS.WCAG_CONTRAST.SRGB_EXPONENT);
  }
  function GetCSSProperty(element, property) {
    return element.getPropertyValue(property);
  }
  function SetCSSProperty(element, property) {
    const document = GetCurrentDocument();
    const li = document.getElementById(`dkInspect_${property}`);
    if (!li) {
      console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
      return;
    }
    li.lastChild.innerHTML = ` : ${element.getPropertyValue(property)}`;
  }
  function SetCSSPropertyIf(element, property, condition) {
    const document = GetCurrentDocument();
    const li = document.getElementById(`dkInspect_${property}`);
    if (!li) {
      console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
      return 0;
    }
    if (condition) {
      li.lastChild.innerHTML = ` : ${element.getPropertyValue(property)}`;
      li.style.display = 'block';
      return 1;
    } else {
      li.style.display = 'none';
      return 0;
    }
  }
  function getLeft(e) {
    const boundingRect = e.getBoundingClientRect();
    const left = boundingRect.left || 0;
    const documentOffsetLeft = document.body.ownerDocument.defaultView.scrollX;
    const offsetLeft = document.body.getBoundingClientRect().left + window.scrollX - document.documentElement.clientLeft;
    return left + documentOffsetLeft - offsetLeft;
  }
  function getTop(e) {
    const boundingRect = e.getBoundingClientRect();
    const top = boundingRect.top || 0;
    const documentOffsetTop = document.body.ownerDocument.defaultView.scrollY;
    const offsetTop = document.body.getBoundingClientRect().top + window.scrollY - document.documentElement.clientTop;
    return top + documentOffsetTop - offsetTop;
  }
  function getWidth(e) {
    const boundingRect = e.getBoundingClientRect();
    return boundingRect.width || 0;
  }
  function getHeight(e) {
    const boundingRect = e.getBoundingClientRect();
    return boundingRect.height || 0;
  }
  function SetCSSDiagonal(element, opt, e, w_condition, h_condition) {
    const document = GetCurrentDocument();
    const li_h = document.getElementById('dkInspect_h');
    const li_w = document.getElementById('dkInspect_w');
    const li_d = document.getElementById('dkInspect_diagonal');
    if (!li_h || !li_w || !li_d) {
      console.warn('대각선 표시 요소를 찾을 수 없습니다');
      return 0;
    }
    const std_px = opt.stdpx;
    let h_px, w_px;
    if (w_condition && h_condition) {
      const paddingTop = parseFloat(element.getPropertyValue('padding-top'));
      const paddingBottom = parseFloat(element.getPropertyValue('padding-bottom'));
      const borderTop = parseFloat(element.getPropertyValue('border-top'));
      const borderBottom = parseFloat(element.getPropertyValue('border-bottom'));
      h_px = parseFloat(element.getPropertyValue('height')) + paddingTop + paddingBottom + borderTop + borderBottom;
      const paddingLeft = parseFloat(element.getPropertyValue('padding-left'));
      const paddingRight = parseFloat(element.getPropertyValue('padding-right'));
      const borderLeft = parseFloat(element.getPropertyValue('border-left'));
      const borderRight = parseFloat(element.getPropertyValue('border-right'));
      w_px = parseFloat(element.getPropertyValue('width')) + paddingLeft + paddingRight + borderLeft + borderRight;
    } else {
      h_px = getWidth(e);
      w_px = getHeight(e);
    }
    if (h_px && w_px) {
      const h = h_px * std_px;
      const w = w_px * std_px;
      const d = Math.sqrt(w * w + h * h);
      const d_px = Math.sqrt(w_px * w_px + h_px * h_px);
      li_h.lastChild.textContent = ` : ${h.toFixed(CONSTANTS.MEASUREMENT.SIZE_PRECISION)}mm (${h_px.toFixed(CONSTANTS.MEASUREMENT.SIZE_PRECISION)}px)`;
      li_w.lastChild.textContent = ` : ${w.toFixed(CONSTANTS.MEASUREMENT.SIZE_PRECISION)}mm (${w_px.toFixed(CONSTANTS.MEASUREMENT.SIZE_PRECISION)}px)`;
      li_d.lastChild.textContent = ` : ${d.toFixed(CONSTANTS.MEASUREMENT.SIZE_PRECISION)}mm (${d_px.toFixed(CONSTANTS.MEASUREMENT.SIZE_PRECISION)}px)`;
      li_h.style.display = 'block';
      li_w.style.display = 'block';
      li_d.style.display = 'block';
      return 1;
    } else {
      li_d.style.display = 'none';
      return 0;
    }
  }
  function SetCSSColorContrast(element, condition) {
    const document = GetCurrentDocument();
    const li = document.getElementById('dkInspect_contrast');
    if (!li) {
      console.warn('대비 표시 요소를 찾을 수 없습니다');
      return 0;
    }
    try {
      const foreground_color = RGBToHexStr(GetCSSProperty(element, 'color'));
      const background_color = RGBToHexStr(GetCSSProperty(element, 'background-color'));
      const L1 = getL(foreground_color);
      const L2 = getL(background_color);
      if (L1 === false || L2 === false) {
        li.style.display = 'none';
        return 0;
      }
      const ratio = (Math.max(L1, L2) + CONSTANTS.WCAG_CONTRAST.CONTRAST_OFFSET) / (Math.min(L1, L2) + CONSTANTS.WCAG_CONTRAST.CONTRAST_OFFSET);
      if (condition) {
        li.lastChild.innerHTML = ` : ${Math.round(ratio * 100) / 100}:1`;
        li.style.display = 'block';
        return 1;
      } else {
        li.style.display = 'none';
        return 0;
      }
    } catch (error) {
      console.error('색상 대비 계산 오류:', error);
      li.style.display = 'none';
      return 0;
    }
  }
  function SetCSSPropertyValue(element, property, value) {
    const document = GetCurrentDocument();
    const li = document.getElementById(`dkInspect_${property}`);
    if (!li) {
      console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
      return;
    }
    li.lastChild.innerHTML = ` : ${value}`;
    li.style.display = 'block';
  }
  function SetCSSPropertyValueIf(element, property, value, condition) {
    const document = GetCurrentDocument();
    const li = document.getElementById(`dkInspect_${property}`);
    if (!li) {
      console.warn(`요소를 찾을 수 없습니다: dkInspect_${property}`);
      return 0;
    }
    if (condition) {
      li.lastChild.innerHTML = ` : ${value}`;
      li.style.display = 'block';
      return 1;
    } else {
      li.style.display = 'none';
      return 0;
    }
  }
  function HideCSSProperty(property) {
    const document = GetCurrentDocument();
    const li = document.getElementById(`dkInspect_${property}`);
    if (li) li.style.display = 'none';
  }
  function HideCSSCategory(category) {
    const document = GetCurrentDocument();
    const div = document.getElementById(`dkInspect_${category}`);
    if (div) div.style.display = 'none';
  }
  function ShowCSSCategory(category) {
    const document = GetCurrentDocument();
    const div = document.getElementById(`dkInspect_${category}`);
    if (div) div.style.display = 'block';
  }
  function UpdateColorBg(element) {
    SetCSSPropertyValue(element, 'color', RGBToHex(GetCSSProperty(element, 'color')));
    SetCSSPropertyValueIf(element, 'background-color', RGBToHex(GetCSSProperty(element, 'background-color')), GetCSSProperty(element, 'background-color') !== CONSTANTS.STYLE_VALUES.TRANSPARENT);
    SetCSSColorContrast(element, GetCSSProperty(element, 'background-color') !== CONSTANTS.STYLE_VALUES.TRANSPARENT);
  }
  function UpdateLength(element, opt, e) {
    SetCSSDiagonal(element, opt, e, !isNaN(parseFloat(GetCSSProperty(element, 'height'))), !isNaN(parseFloat(GetCSSProperty(element, 'width'))));
  }
  function UpdateBox(element) {
    SetCSSPropertyIf(element, 'height', RemoveExtraFloat(GetCSSProperty(element, 'height')) !== CONSTANTS.STYLE_VALUES.AUTO);
    SetCSSPropertyIf(element, 'width', RemoveExtraFloat(GetCSSProperty(element, 'width')) !== CONSTANTS.STYLE_VALUES.AUTO);
    const borderTop = RemoveExtraFloat(GetCSSProperty(element, 'border-top-width')) + ' ' + GetCSSProperty(element, 'border-top-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-top-color'));
    const borderBottom = RemoveExtraFloat(GetCSSProperty(element, 'border-bottom-width')) + ' ' + GetCSSProperty(element, 'border-bottom-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-bottom-color'));
    const borderRight = RemoveExtraFloat(GetCSSProperty(element, 'border-right-width')) + ' ' + GetCSSProperty(element, 'border-right-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-right-color'));
    const borderLeft = RemoveExtraFloat(GetCSSProperty(element, 'border-left-width')) + ' ' + GetCSSProperty(element, 'border-left-style') + ' ' + RGBToHex(GetCSSProperty(element, 'border-left-color'));
    if (borderTop === borderBottom && borderBottom === borderRight && borderRight === borderLeft && GetCSSProperty(element, 'border-top-style') !== CONSTANTS.STYLE_VALUES.NONE) {
      SetCSSPropertyValue(element, 'border', borderTop);
      HideCSSProperty('border-top');
      HideCSSProperty('border-bottom');
      HideCSSProperty('border-right');
      HideCSSProperty('border-left');
    } else {
      SetCSSPropertyValueIf(element, 'border-top', borderTop, GetCSSProperty(element, 'border-top-style') !== CONSTANTS.STYLE_VALUES.NONE);
      SetCSSPropertyValueIf(element, 'border-bottom', borderBottom, GetCSSProperty(element, 'border-bottom-style') !== CONSTANTS.STYLE_VALUES.NONE);
      SetCSSPropertyValueIf(element, 'border-right', borderRight, GetCSSProperty(element, 'border-right-style') !== CONSTANTS.STYLE_VALUES.NONE);
      SetCSSPropertyValueIf(element, 'border-left', borderLeft, GetCSSProperty(element, 'border-left-style') !== CONSTANTS.STYLE_VALUES.NONE);
      HideCSSProperty('border');
    }
    const marginTop = RemoveExtraFloat(GetCSSProperty(element, 'margin-top'));
    const marginBottom = RemoveExtraFloat(GetCSSProperty(element, 'margin-bottom'));
    const marginRight = RemoveExtraFloat(GetCSSProperty(element, 'margin-right'));
    const marginLeft = RemoveExtraFloat(GetCSSProperty(element, 'margin-left'));
    const margin = `${marginTop === CONSTANTS.STYLE_VALUES.ZERO_PX ? CONSTANTS.STYLE_VALUES.ZERO : marginTop} ${marginRight === CONSTANTS.STYLE_VALUES.ZERO_PX ? CONSTANTS.STYLE_VALUES.ZERO : marginRight} ${marginBottom === CONSTANTS.STYLE_VALUES.ZERO_PX ? CONSTANTS.STYLE_VALUES.ZERO : marginBottom} ${marginLeft === CONSTANTS.STYLE_VALUES.ZERO_PX ? CONSTANTS.STYLE_VALUES.ZERO : marginLeft}`;
    SetCSSPropertyValueIf(element, 'margin', margin, margin !== CONSTANTS.STYLE_VALUES.ZERO_MARGIN_PADDING);
    const paddingTop = RemoveExtraFloat(GetCSSProperty(element, 'padding-top'));
    const paddingBottom = RemoveExtraFloat(GetCSSProperty(element, 'padding-bottom'));
    const paddingRight = RemoveExtraFloat(GetCSSProperty(element, 'padding-right'));
    const paddingLeft = RemoveExtraFloat(GetCSSProperty(element, 'padding-left'));
    const padding = `${paddingTop === CONSTANTS.STYLE_VALUES.ZERO_PX ? CONSTANTS.STYLE_VALUES.ZERO : paddingTop} ${paddingRight === CONSTANTS.STYLE_VALUES.ZERO_PX ? CONSTANTS.STYLE_VALUES.ZERO : paddingRight} ${paddingBottom === CONSTANTS.STYLE_VALUES.ZERO_PX ? CONSTANTS.STYLE_VALUES.ZERO : paddingBottom} ${paddingLeft === CONSTANTS.STYLE_VALUES.ZERO_PX ? CONSTANTS.STYLE_VALUES.ZERO : paddingLeft}`;
    SetCSSPropertyValueIf(element, 'padding', padding, padding !== CONSTANTS.STYLE_VALUES.ZERO_MARGIN_PADDING);
    SetCSSPropertyIf(element, 'min-height', GetCSSProperty(element, 'min-height') !== CONSTANTS.STYLE_VALUES.ZERO_PX);
    SetCSSPropertyIf(element, 'max-height', GetCSSProperty(element, 'max-height') !== CONSTANTS.STYLE_VALUES.NONE);
    SetCSSPropertyIf(element, 'min-width', GetCSSProperty(element, 'min-width') !== CONSTANTS.STYLE_VALUES.ZERO_PX);
    SetCSSPropertyIf(element, 'max-width', GetCSSProperty(element, 'max-width') !== CONSTANTS.STYLE_VALUES.NONE);
  }
  function dkInspectMouseOver(e) {
    const document = GetCurrentDocument();
    const block = document.getElementById('dkInspect_block');
    const trackingEl = document.getElementById('dkInspect_tracking');
    if (!block) {
      return;
    }
    if (this.tagName.toLowerCase() !== 'body') {
      if (opt.trackingmode) {
        if (e.target.id !== 'dkInspect_tracking') {
          trackingEl.style.width = `${parseInt(getWidth(this))}px`;
          trackingEl.style.height = `${parseInt(getHeight(this))}px`;
          trackingEl.style.left = `${parseInt(getLeft(this))}px`;
          trackingEl.style.top = `${parseInt(getTop(this))}px`;
          trackingEl.style.display = 'block';
        }
      } else {
        this.style.setProperty('outline-width', `${opt.bordersize}px`, 'important');
        this.style.setProperty('outline-color', opt.colortype, 'important');
        this.style.setProperty('outline-style', opt.linetype, 'important');
        this.style.setProperty('outline-offset', `-${opt.bordersize}px`, 'important');
      }
    }
    const type1 = () => {
      let tit = `<${this.tagName}`;
      if (this.type) {
        tit += ` [${this.type}]`;
      }
      tit += `>${this.id === '' ? '' : ` #${this.id}`}${this.className === '' ? '' : ` .${this.className}`}`;
      block.firstChild.textContent = tit;
      const element = document.defaultView.getComputedStyle(this, null);
      UpdateLength(element, opt, this);
      UpdateBox(element);
      if (opt.ccshow === 1) {
        UpdateColorBg(element);
      } else {
        HideCSSCategory('pColorBg');
      }
      block.style.display = 'block';
    };
    const type2 = () => {
      let tit = `<${this.parentElement.nodeName}`;
      if (this.parentElement.type) {
        tit += ` [${this.parentElement.type}]`;
      }
      tit += `>${this.parentElement.id === '' ? '' : ` #${this.parentElement.id}`}${this.parentElement.className === '' ? '' : ` .${this.parentElement.className}`}`;
      block.firstChild.textContent = tit;
      const element = document.defaultView.getComputedStyle(this.parentElement, null);
      UpdateLength(element, opt, this.parentElement);
      UpdateBox(element);
      if (opt.ccshow === 1) {
        UpdateColorBg(element);
      } else {
        HideCSSCategory('pColorBg');
      }
      block.style.display = 'block';
    };
    if (opt.trackingmode) {
      if (this.id !== 'dkInspect_tracking') {
        const tagName = this.tagName.toLowerCase();
        const parentTagName = this.parentElement?.nodeName.toLowerCase();
        if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
          type1();
        } else {
          block.style.display = 'none';
        }
        if (CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)) {
          type2();
          trackingEl.style.display = 'block';
        }
      }
    } else if (opt.linkmode === 1) {
      const tagName = this.tagName.toLowerCase();
      const parentTagName = this.parentElement?.nodeName.toLowerCase();
      if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
        type1();
      } else if (CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)) {
        type2();
      } else {
        block.style.display = 'none';
      }
    } else {
      type1();
    }
    dkInspectRemoveElement('dkInspectInsertMessage');
    e.stopPropagation();
  }
  function dkInspectMouseOut(e) {
    if (opt.trackingmode) {
      const trackingEl = document.getElementById('dkInspect_tracking');
      if (this.id === 'dkInspect_tracking') {
        trackingEl.style.display = 'block';
      } else {
        if (trackingEl) trackingEl.style.display = 'none';
      }
    } else {
      this.style.outlineWidth = '';
      this.style.outlineColor = '';
      this.style.outlineStyle = '';
      this.style.outlineOffset = '';
    }
    e.stopPropagation();
  }
  function dkInspectMouseMove(e) {
    const document = GetCurrentDocument();
    const block = document.getElementById('dkInspect_block');
    const trackingEl = document.getElementById('dkInspect_tracking');
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
          if (CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)) {
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
      } else if (CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)) {
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
    if (this.tagName.toLowerCase() === 'body' || this.tagName.toLowerCase() === 'frame') {
      if (opt.trackingmode) {
        trackingEl.style.display = 'none';
      }
    }
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;
    const blockWidth = CONSTANTS.MEASUREMENT.BLOCK_WIDTH;
    const blockHeight = parseInt(document.defaultView.getComputedStyle(block, null).height);
    if (e.pageX + blockWidth > pageWidth) {
      if (e.pageX - blockWidth - CONSTANTS.UI.POSITION_MIN > 0) block.style.left = `${e.pageX - blockWidth - CONSTANTS.UI.POSITION_OFFSET_LARGE}px`;else block.style.left = `0px`;
    } else block.style.left = `${e.pageX + CONSTANTS.UI.POSITION_OFFSET}px`;
    if (e.pageY + blockHeight > pageHeight) {
      if (e.pageY - blockHeight - CONSTANTS.UI.POSITION_MIN > 0) block.style.top = `${e.pageY - blockHeight - CONSTANTS.UI.POSITION_OFFSET}px`;else block.style.top = `0px`;
    } else block.style.top = `${e.pageY + CONSTANTS.UI.POSITION_OFFSET}px`;
    const inView = dkInspectIsElementInViewport(block);
    if (!inView) block.style.top = `${window.scrollY + CONSTANTS.UI.POSITION_OFFSET}px`;
    e.stopPropagation();
  }
  function dkInspectIsElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top >= 0 && rect.left >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && rect.right <= (window.innerWidth || document.documentElement.clientWidth);
  }
  function DkInspect() {
    this.CreateBlock = function () {
      const document = GetCurrentDocument();
      let block;
      if (document) {
        block = document.createElement('div');
        block.id = 'dkInspect_block';
        const header = document.createElement('h1');
        header.appendChild(document.createTextNode(''));
        block.appendChild(header);
        const center = document.createElement('div');
        center.id = 'dkInspect_center';
        for (const cat in dkInspect_categories) {
          const div = document.createElement('div');
          div.id = `dkInspect_${cat}`;
          div.className = 'dkInspect_category';
          const h2 = document.createElement('h2');
          h2.appendChild(document.createTextNode(dkInspect_categoriesTitle[cat]));
          const ul = document.createElement('ul');
          const properties = dkInspect_categories[cat];
          for (const item of properties) {
            const li = document.createElement('li');
            li.id = `dkInspect_${item}`;
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
        block.appendChild(center);
      }
      dkInspectInsertMessage('이 페이지에서 검사 할 요소 위로 포인터를 올려주세요.');
      return block;
    };
    this.GetAllElements = function (element) {
      let elements = [];
      if (element && element.hasChildNodes()) {
        elements.push(element);
        const child = element.childNodes;
        for (let i = 0; i < child.length; i++) {
          if (child[i].hasChildNodes()) {
            elements = elements.concat(this.GetAllElements(child[i]));
          } else if (child[i].nodeType === CONSTANTS.NODE_TYPE.ELEMENT) {
            elements.push(child[i]);
          }
        }
      }
      return elements;
    };
    this.AddEventListeners = function () {
      const document = GetCurrentDocument();
      const elements = this.GetAllElements(document.body);
      try {
        if (window.frames.document && window.frames.document.body && window.frames.document.body.nodeName === 'FRAMESET') {
          alert('크롬 브라우저에서는 FRAMESET의 진단이 불가능합니다.');
          dkInspectRemoveElement('dkInspectInsertMessage');
          return false;
        }
      } catch (error) {
        console.warn('프레임 접근 오류:', error);
      }
      elements.forEach(item => {
        item.addEventListener('mouseover', dkInspectMouseOver, false);
        item.addEventListener('mouseout', dkInspectMouseOut, false);
        item.addEventListener('mousemove', dkInspectMouseMove, false);
      });
      if (window.frames.length > 0) {
        for (let k = 0; k < window.frames.length; k++) {
          try {
            const frameEl = window.frames[k].document.body;
            if (frameEl) {
              const frameEls = this.GetAllElements(frameEl);
              frameEls.forEach(item => {
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
    this.RemoveEventListeners = function () {
      const document = GetCurrentDocument();
      const elements = this.GetAllElements(document.body);
      elements.forEach(item => {
        item.removeEventListener('mouseover', dkInspectMouseOver, false);
        item.removeEventListener('mouseout', dkInspectMouseOut, false);
        item.removeEventListener('mousemove', dkInspectMouseMove, false);
      });
      if (window.frames.length > 0) {
        for (let k = 0; k < window.frames.length; k++) {
          try {
            const frameEl = window.frames[k].document.body;
            if (frameEl) {
              const frameEls = this.GetAllElements(frameEl);
              frameEls.forEach(item => {
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
  const tracking = {
    generate: function () {
      const document = GetCurrentDocument();
      let trackingEl;
      if (document) {
        trackingEl = document.createElement('div');
        trackingEl.id = 'dkInspect_tracking';
        this.setColor(trackingEl, opt.colortype);
        trackingEl.style.setProperty('outline-style', opt.linetype, 'important');
      }
      return trackingEl;
    },
    setColor: function (e, hex) {
      if (e) {
        e.style.setProperty('outline-color', hex, 'important');
        if (opt.bgmode) {
          e.style.setProperty('background-color', this.hexToRGB(hex, 0.2), 'important');
        }
      }
    },
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
    }
  };
  DkInspect.prototype.IsEnabled = function () {
    const document = GetCurrentDocument();
    return !!document.getElementById('dkInspect_block');
  };
  DkInspect.prototype.Enable = function () {
    const document = GetCurrentDocument();
    let block = document.getElementById('dkInspect_block');
    if (!block) {
      if (!document.getElementsByTagName('BODY')[0]) {
        const body = document.createElement('BODY');
        document.documentElement.appendChild(body);
      }
      block = this.CreateBlock();
      document.getElementsByTagName('BODY')[0].appendChild(block);
      if (opt.trackingmode) {
        const trackingEl = tracking.generate();
        document.getElementsByTagName('BODY')[0].appendChild(trackingEl);
      }
      dkInspect.AddEventListeners();
      return true;
    }
    return false;
  };
  DkInspect.prototype.Disable = function () {
    const document = GetCurrentDocument();
    const block = document.getElementById('dkInspect_block');
    const trackingEl = document.getElementById('dkInspect_tracking');
    if (block) {
      const bodyEl = document.getElementsByTagName('BODY')[0];
      if (bodyEl) {
        bodyEl.removeChild(block);
        if (opt.trackingmode && trackingEl) {
          bodyEl.removeChild(trackingEl);
        }
      }
      this.RemoveEventListeners();
      return true;
    }
    return false;
  };
  function dkInspectInsertMessage(msg) {
    const oNewP = document.createElement('p');
    const oText = document.createTextNode(msg);
    oNewP.appendChild(oText);
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
    document.getElementsByTagName('BODY')[0].appendChild(oNewP);
  }
  function dkInspectRemoveElement(divId) {
    const element = document.getElementById(divId);
    if (element) {
      const bodyEl = document.getElementsByTagName('BODY')[0];
      if (bodyEl) {
        bodyEl.removeChild(element);
      }
    }
  }
  let dkInspectPause = false;
  const shortcut = {
    initialize: function () {
      try {
        chrome.runtime.sendMessage({
          cmd: 'pause'
        }, function (response) {
          if (chrome.runtime.lastError) {
            console.warn('단축키 초기화 오류:', chrome.runtime.lastError.message);
            return;
          }
          window.addEventListener('keyup', function (e) {
            if (e.key === response) {
              if (dkInspectPause) {
                shortcut.resume();
              } else {
                shortcut.pause();
              }
            }
          }, false);
        });
      } catch (error) {
        console.error('단축키 초기화 실패:', error);
      }
    },
    pause: function () {
      console.log('pause');
      const document = GetCurrentDocument();
      const block = document.getElementById('dkInspect_block');
      if (block) {
        dkInspect.RemoveEventListeners();
        dkInspectPause = true;
        dkInspectInsertMessage('일시정지');
        setTimeout(function () {
          dkInspectRemoveElement('dkInspectInsertMessage');
        }, CONSTANTS.TIMING.MESSAGE_DISPLAY);
        return true;
      }
      return false;
    },
    resume: function () {
      console.log('resume');
      const document = GetCurrentDocument();
      const block = document.getElementById('dkInspect_block');
      if (block) {
        dkInspect.AddEventListeners();
        dkInspectPause = false;
        dkInspectInsertMessage('재개');
        setTimeout(function () {
          dkInspectRemoveElement('dkInspectInsertMessage');
        }, CONSTANTS.TIMING.MESSAGE_DISPLAY);
        return true;
      }
      return false;
    }
  };
  let dkInspect = new DkInspect();
  shortcut.initialize();
  if (dkInspect.IsEnabled()) {
    dkInspect.Disable();
  } else {
    dkInspect.Enable();
  }
}
myApp().then(() => console.log('Load'));
//# sourceMappingURL=dkinspect.js.map