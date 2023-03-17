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
function readData(myKey) {
  return new Promise((resolve) => {
    chrome.storage.local.get(myKey, function (data) {
      resolve(data);
    });
  });
}
async function myApp() {
  const opt = {};

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
  ).toFixed(2);
  const std_px = 25.4 / (diagonal / monitors);

  opt['ccshow'] = ccshow;
  opt['stdpx'] = std_px;
  opt['linkmode'] = linkmode;
  opt['bgmode'] = bgmode;
  opt['linetype'] = linetype;
  opt['colortype'] = '#' + colortype;
  opt['trackingmode'] = trackingmode;
  opt['bordersize'] = bordersize;

  // CSS Properties
  const dkInspect_pColorBg = ['color', 'background-color', 'contrast'];

  const dkInspect_pLength = ['h', 'w', 'diagonal'];

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

  // CSS Property categories
  const dkInspect_categories = {
    pLength: dkInspect_pLength,
    pBox: dkInspect_pBox,
    pColorBg: dkInspect_pColorBg,
  };

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

  function GetCurrentDocument() {
    return window.document;
  }

  function DecToHex(nb) {
    let nbHexa;
    nbHexa = '';

    nbHexa += dkInspect_hexa[Math.floor(nb / 16)];
    nb = nb % 16;
    nbHexa += dkInspect_hexa[nb];

    return nbHexa;
  }

  function RGBToHex(str) {
    const start = str.search(/\(/) + 1;
    const end = str.search(/\)/);

    str = str.slice(start, end);

    const hexValues = str.split(', ');
    let hexStr;
    hexStr = '#';

    for (const item of hexValues) {
      hexStr += DecToHex(item);
    }

    if (hexStr === '#00000000') {
      hexStr = '#FFFFFF';
    }

    hexStr =
      "<span style='border: 1px solid #000000 !important;width: 8px !important;height: 8px !important;display: inline-block !important;background-color:" +
      hexStr +
      " !important;'></span> " +
      hexStr;

    return hexStr;
  }

  function RGBToHexStr(str) {
    const start = str.search(/\(/) + 1;
    const end = str.search(/\)/);

    str = str.slice(start, end);

    const hexValues = str.split(', ');
    let hexStr = '';

    for (const item of hexValues) {
      hexStr += DecToHex(item);
    }

    if (hexStr === '00000000') {
      hexStr = 'FFFFFF';
    }

    return hexStr;
  }

  function RemoveExtraFloat(nb) {
    nb = nb.substr(0, nb.length - 2);

    return Math.round(nb) + 'px';
  }

  function getL(color) {
    let R, G, B, update;
    if (color.length === 3) {
      R = getsRGB(color.substring(0, 1) + color.substring(0, 1));
      G = getsRGB(color.substring(1, 2) + color.substring(1, 2));
      B = getsRGB(color.substring(2, 3) + color.substring(2, 3));
      update = true;
    } else if (color.length === 6) {
      R = getsRGB(color.substring(0, 2));
      G = getsRGB(color.substring(2, 4));
      B = getsRGB(color.substring(4, 6));
      update = true;
    } else {
      update = false;
    }
    if (update === true) {
      // L
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    } else {
      return false;
    }
  }

  function getRGB(color) {
    const tmp = parseInt(color, 16);
    return isNaN(tmp) ? false : tmp;
  }

  function getsRGB(color) {
    const tmp = getRGB(color);
    if (tmp === false) {
      return false;
    }

    const sRGB = tmp / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  }
  /*
   * CSSFunc
   */

  function GetCSSProperty(element, property) {
    return element.getPropertyValue(property);
  }

  function SetCSSProperty(element, property) {
    const document = GetCurrentDocument();
    const li = document.getElementById('dkInspect_' + property);

    li.lastChild.innerHTML = ' : ' + element.getPropertyValue(property);
  }

  function SetCSSPropertyIf(element, property, condition) {
    const document = GetCurrentDocument();
    const li = document.getElementById('dkInspect_' + property);

    if (condition) {
      li.lastChild.innerHTML = ' : ' + element.getPropertyValue(property);
      li.style.display = 'block';

      return 1;
    } else {
      li.style.display = 'none';

      return 0;
    }
  }

  function getLeft(e) {
    //  console.log(this);
    const boundingRect = e.getBoundingClientRect(),
      left = boundingRect.left || 0,
      documentOffsetLeft = document.body.ownerDocument.defaultView.pageXOffset,
      offsetLeft =
        document.body.getBoundingClientRect().left +
        window.pageXOffset -
        document.documentElement.clientLeft;
    return left + documentOffsetLeft - offsetLeft;
  }

  function getTop(e) {
    const boundingRect = e.getBoundingClientRect(),
      top = boundingRect.top || 0,
      documentOffsetTop = document.body.ownerDocument.defaultView.pageYOffset,
      offsetTop =
        document.body.getBoundingClientRect().top +
        window.pageYOffset -
        document.documentElement.clientTop;
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

    const std_px = opt.stdpx;
    let h_px, w_px;
    if (w_condition && h_condition) {
      const paddingTop = parseFloat(element.getPropertyValue('padding-top'));
      const paddingBottom = parseFloat(
        element.getPropertyValue('padding-bottom'),
      );
      const borderTop = parseFloat(element.getPropertyValue('border-top'));
      const borderBottom = parseFloat(
        element.getPropertyValue('border-bottom'),
      );
      h_px =
        parseFloat(element.getPropertyValue('height')) +
        paddingTop +
        paddingBottom +
        borderTop +
        borderBottom;
      const paddingLeft = parseFloat(element.getPropertyValue('padding-left'));
      const paddingRight = parseFloat(
        element.getPropertyValue('padding-right'),
      );
      const borderLeft = parseFloat(element.getPropertyValue('border-left'));
      const borderRight = parseFloat(element.getPropertyValue('border-right'));
      w_px =
        parseFloat(element.getPropertyValue('width')) +
        paddingLeft +
        paddingRight +
        borderLeft +
        borderRight;
    } else {
      h_px = getWidth(e);
      w_px = getHeight(e);
    }

    if (h_px && w_px) {
      const h = h_px * std_px;
      const w = w_px * std_px;
      const d = Math.sqrt(w * w + h * h);
      const d_px = Math.sqrt(w_px * w_px + h_px * h_px);

      li_h.lastChild.textContent =
        ' : ' + h.toFixed(1) + 'mm' + ' (' + h_px.toFixed(1) + 'px)';
      li_w.lastChild.textContent =
        ' : ' + w.toFixed(1) + 'mm' + ' (' + w_px.toFixed(1) + 'px)';
      li_d.lastChild.textContent =
        ' : ' + d.toFixed(1) + 'mm' + ' (' + d_px.toFixed(1) + 'px)';

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

    const foreground_color = RGBToHexStr(GetCSSProperty(element, 'color'));
    const background_color = RGBToHexStr(
      GetCSSProperty(element, 'background-color'),
    );

    const L1 = getL(foreground_color);
    const L2 = getL(background_color);

    const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);

    if (condition) {
      li.lastChild.innerHTML = ' : ' + Math.round(ratio * 100) / 100 + ':1';
      li.style.display = 'block';
      return 1;
    } else {
      li.style.display = 'none';
      return 0;
    }
  }

  function SetCSSPropertyValue(element, property, value) {
    const document = GetCurrentDocument();
    const li = document.getElementById('dkInspect_' + property);

    li.lastChild.innerHTML = ' : ' + value;
    li.style.display = 'block';
  }

  function SetCSSPropertyValueIf(element, property, value, condition) {
    const document = GetCurrentDocument();
    const li = document.getElementById('dkInspect_' + property);

    if (condition) {
      li.lastChild.innerHTML = ' : ' + value;
      li.style.display = 'block';

      return 1;
    } else {
      li.style.display = 'none';

      return 0;
    }
  }

  function HideCSSProperty(property) {
    const document = GetCurrentDocument();
    const li = document.getElementById('dkInspect_' + property);

    li.style.display = 'none';
  }

  function HideCSSCategory(category) {
    const document = GetCurrentDocument();
    const div = document.getElementById('dkInspect_' + category);

    div.style.display = 'none';
  }

  function ShowCSSCategory(category) {
    const document = GetCurrentDocument();
    const div = document.getElementById('dkInspect_' + category);

    div.style.display = 'block';
  }

  function UpdateColorBg(element) {
    // Color
    SetCSSPropertyValue(
      element,
      'color',
      RGBToHex(GetCSSProperty(element, 'color')),
    );
    // Background
    SetCSSPropertyValueIf(
      element,
      'background-color',
      RGBToHex(GetCSSProperty(element, 'background-color')),
      GetCSSProperty(element, 'background-color') !== 'transparent',
    );
    //contrast
    SetCSSColorContrast(
      element,
      GetCSSProperty(element, 'background-color') !== 'transparent',
    );
  }

  function UpdateLength(element, opt, e) {
    SetCSSDiagonal(
      element,
      opt,
      e,
      RemoveExtraFloat(GetCSSProperty(element, 'height')) !== 'NaNpx',
      RemoveExtraFloat(GetCSSProperty(element, 'width')) !== 'NaNpx',
    );
  }

  function UpdateBox(element) {
    // Width/Height
    SetCSSPropertyIf(
      element,
      'height',
      RemoveExtraFloat(GetCSSProperty(element, 'height')) !== 'auto',
    );
    SetCSSPropertyIf(
      element,
      'width',
      RemoveExtraFloat(GetCSSProperty(element, 'width')) !== 'auto',
    );

    // Border
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
      GetCSSProperty(element, 'border-top-style') !== 'none'
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
        GetCSSProperty(element, 'border-top-style') !== 'none',
      );
      SetCSSPropertyValueIf(
        element,
        'border-bottom',
        borderBottom,
        GetCSSProperty(element, 'border-bottom-style') !== 'none',
      );
      SetCSSPropertyValueIf(
        element,
        'border-right',
        borderRight,
        GetCSSProperty(element, 'border-right-style') !== 'none',
      );
      SetCSSPropertyValueIf(
        element,
        'border-left',
        borderLeft,
        GetCSSProperty(element, 'border-left-style') !== 'none',
      );

      HideCSSProperty('border');
    }

    // Margin
    const marginTop = RemoveExtraFloat(GetCSSProperty(element, 'margin-top'));
    const marginBottom = RemoveExtraFloat(
      GetCSSProperty(element, 'margin-bottom'),
    );
    const marginRight = RemoveExtraFloat(
      GetCSSProperty(element, 'margin-right'),
    );
    const marginLeft = RemoveExtraFloat(GetCSSProperty(element, 'margin-left'));
    const margin =
      (marginTop === '0px' ? '0' : marginTop) +
      ' ' +
      (marginRight === '0px' ? '0' : marginRight) +
      ' ' +
      (marginBottom === '0px' ? '0' : marginBottom) +
      ' ' +
      (marginLeft === '0px' ? '0' : marginLeft);

    SetCSSPropertyValueIf(element, 'margin', margin, margin !== '0 0 0 0');

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
    const padding =
      (paddingTop === '0px' ? '0' : paddingTop) +
      ' ' +
      (paddingRight === '0px' ? '0' : paddingRight) +
      ' ' +
      (paddingBottom === '0px' ? '0' : paddingBottom) +
      ' ' +
      (paddingLeft === '0px' ? '0' : paddingLeft);

    SetCSSPropertyValueIf(element, 'padding', padding, padding !== '0 0 0 0');

    // Max/Min Width/Height
    SetCSSPropertyIf(
      element,
      'min-height',
      GetCSSProperty(element, 'min-height') !== '0px',
    );
    SetCSSPropertyIf(
      element,
      'max-height',
      GetCSSProperty(element, 'max-height') !== 'none',
    );
    SetCSSPropertyIf(
      element,
      'min-width',
      GetCSSProperty(element, 'min-width') !== '0px',
    );
    SetCSSPropertyIf(
      element,
      'max-width',
      GetCSSProperty(element, 'max-width') !== 'none',
    );
  }

  /*
   ** Event Handlers
   */

  function dkInspectMouseOver(e) {
    // Block
    const document = GetCurrentDocument();
    const block = document.getElementById('dkInspect_block');
    const trackingEl = document.getElementById('dkInspect_tracking');

    if (!block) {
      return;
    }
    if (this.tagName.toLowerCase() !== 'body') {
      if (opt.trackingmode) {
        if (e.target.id !== 'dkInspect_tracking') {
          // Outline element
          trackingEl.style.width = parseInt(getWidth(this)) + 'px';
          trackingEl.style.height = parseInt(getHeight(this)) + 'px';

          trackingEl.style.left = parseInt(getLeft(this)) + 'px';
          trackingEl.style.top = parseInt(getTop(this)) + 'px';
          trackingEl.style.display = 'block';
        }
      } else {
        this.style.setProperty(
          'outline-width',
          opt.bordersize + 'px',
          'important',
        );
        this.style.setProperty('outline-color', opt.colortype, 'important');
        this.style.setProperty('outline-style', opt.linetype, 'important');
        this.style.setProperty(
          'outline-offset',
          '-' + opt.bordersize + 'px',
          'important',
        );
      }
    }

    if (opt.trackingmode) {
      if (this.id !== 'dkInspect_tracking') {
        if (
          this.tagName.toLowerCase() === 'a' ||
          this.tagName.toLowerCase() === 'button' ||
          this.tagName.toLowerCase() === 'input' ||
          this.tagName.toLowerCase() === 'area'
        ) {
          let tit = '&lt;' + this.tagName;
          if (this.type) {
            tit += ' [' + this.type + ']';
          }
          tit +=
            '&gt;' +
            (this.id === '' ? '' : ' #' + this.id) +
            (this.className === '' ? '' : ' .' + this.className);
          block.firstChild.innerHTML = tit;

          // Updating CSS properties
          const element = document.defaultView.getComputedStyle(this, null);
          UpdateLength(element, opt, this);
          UpdateBox(element);

          if (opt.ccshow === 1) {
            UpdateColorBg(element);
          } else {
            HideCSSCategory('pColorBg');
          }

          block.style.display = 'block';
        } else {
          block.style.display = 'none';
        }

        if (
          this.parentElement.nodeName.toLowerCase() === 'a' ||
          this.parentElement.nodeName.toLowerCase() === 'button' ||
          this.parentElement.nodeName.toLowerCase() === 'input'
        ) {
          let tit = '&lt;' + this.parentElement.nodeName;
          if (this.parentElement.type) {
            tit += ' [' + this.parentElement.type + ']';
          }
          tit +=
            '&gt;' +
            (this.parentElement.id === '' ? '' : ' #' + this.parentElement.id) +
            (this.parentElement.className === ''
              ? ''
              : ' .' + this.parentElement.className);
          block.firstChild.innerHTML = tit;

          // Updating CSS properties
          const element = document.defaultView.getComputedStyle(
            this.parentElement,
            null,
          );
          UpdateLength(element, opt, this.parentElement);
          UpdateBox(element);

          if (opt.ccshow === 1) {
            UpdateColorBg(element);
          } else {
            HideCSSCategory('pColorBg');
          }
          block.style.display = 'block';
          trackingEl.style.display = 'block';
        }
      }
    } else if (opt.linkmode === 1) {
      if (
        this.tagName.toLowerCase() === 'a' ||
        this.tagName.toLowerCase() === 'button' ||
        this.tagName.toLowerCase() === 'input' ||
        this.tagName.toLowerCase() === 'area'
      ) {
        let tit = '&lt;' + this.tagName;
        if (this.type) {
          tit += ' [' + this.type + ']';
        }
        tit +=
          '&gt;' +
          (this.id === '' ? '' : ' #' + this.id) +
          (this.className === '' ? '' : ' .' + this.className);
        block.firstChild.innerHTML = tit;

        // Updating CSS properties
        const element = document.defaultView.getComputedStyle(this, null);
        UpdateLength(element, opt, this);
        UpdateBox(element);

        if (opt.ccshow === 1) {
          UpdateColorBg(element);
        } else {
          HideCSSCategory('pColorBg');
        }

        block.style.display = 'block';
      } else if (
        this.parentElement.nodeName.toLowerCase() === 'a' ||
        this.parentElement.nodeName.toLowerCase() === 'button' ||
        this.parentElement.nodeName.toLowerCase() === 'input'
      ) {
        let tit = '&lt;' + this.parentElement.nodeName;
        if (this.parentElement.type) {
          tit += ' [' + this.parentElement.type + ']';
        }
        tit +=
          '&gt;' +
          (this.parentElement.id === '' ? '' : ' #' + this.parentElement.id) +
          (this.parentElement.className === ''
            ? ''
            : ' .' + this.parentElement.className);
        block.firstChild.innerHTML = tit;

        // Updating CSS properties
        const element = document.defaultView.getComputedStyle(
          this.parentElement,
          null,
        );
        UpdateLength(element, opt, this.parentElement);
        UpdateBox(element);

        if (opt.ccshow === 1) {
          UpdateColorBg(element);
        } else {
          HideCSSCategory('pColorBg');
        }
        block.style.display = 'block';
      } else {
        block.style.display = 'none';
      }
    } else {
      let tit = '&lt;' + this.tagName;
      if (this.type) {
        tit += ' [' + this.type + ']';
      }
      tit +=
        '&gt;' +
        (this.id === '' ? '' : ' #' + this.id) +
        (this.className === '' ? '' : ' .' + this.className);
      block.firstChild.innerHTML = tit;

      // Updating CSS properties
      const element = document.defaultView.getComputedStyle(this, null);
      UpdateLength(element, opt, this);
      UpdateBox(element);

      if (opt.ccshow === 1) {
        UpdateColorBg(element);
      } else {
        HideCSSCategory('pColorBg');
      }
      block.style.display = 'block';
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
      if (
        this.tagName.toLowerCase() === 'a' ||
        this.tagName.toLowerCase() === 'button' ||
        this.tagName.toLowerCase() === 'input' ||
        this.tagName.toLowerCase() === 'area'
      ) {
        trackingEl.style.display = 'block';
      } else {
        if (this.id === 'dkInspect_tracking') {
          trackingEl.style.display = 'block';
        } else if (
          this.parentElement.nodeName.toLowerCase() === 'a' ||
          this.parentElement.nodeName.toLowerCase() === 'button' ||
          this.parentElement.nodeName.toLowerCase() === 'input'
        ) {
          trackingEl.style.display = 'block';
        } else {
          trackingEl.style.display = 'none';
        }
      }
    } else if (opt.linkmode === 1) {
      if (
        this.tagName.toLowerCase() === 'a' ||
        this.tagName.toLowerCase() === 'button' ||
        this.tagName.toLowerCase() === 'input' ||
        this.tagName.toLowerCase() === 'area'
      ) {
        block.style.display = 'block';
      } else if (
        this.parentElement.nodeName.toLowerCase() === 'a' ||
        this.parentElement.nodeName.toLowerCase() === 'button' ||
        this.parentElement.nodeName.toLowerCase() === 'input'
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

    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;
    const blockWidth = 332;
    const blockHeight = parseInt(
      document.defaultView.getComputedStyle(block, null).height,
    );

    if (e.pageX + blockWidth > pageWidth) {
      if (e.pageX - blockWidth - 10 > 0)
        block.style.left = e.pageX - blockWidth - 40 + 'px';
      else block.style.left = 0 + 'px';
    } else block.style.left = e.pageX + 20 + 'px';

    if (e.pageY + blockHeight > pageHeight) {
      if (e.pageY - blockHeight - 10 > 0)
        block.style.top = e.pageY - blockHeight - 20 + 'px';
      else block.style.top = 0 + 'px';
    } else block.style.top = e.pageY + 20 + 'px';

    // adapt block top to screen offset
    const inView = dkInspectIsElementInViewport(block);

    if (!inView) block.style.top = window.pageYOffset + 20 + 'px';

    e.stopPropagation();
  }

  function dkInspectIsElementInViewport(el) {
    const rect = el.getBoundingClientRect();

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
    // Create a block to display information
    this.CreateBlock = function () {
      const document = GetCurrentDocument();
      let block;

      if (document) {
        // Create a div block
        block = document.createElement('div');
        block.id = 'dkInspect_block';

        // Insert a title for CSS selector
        const header = document.createElement('h1');

        header.appendChild(document.createTextNode(''));
        block.appendChild(header);

        // Insert all properties
        const center = document.createElement('div');

        center.id = 'dkInspect_center';

        for (const cat in dkInspect_categories) {
          const div = document.createElement('div');

          div.id = 'dkInspect_' + cat;
          div.className = 'dkInspect_category';

          const h2 = document.createElement('h2');

          h2.appendChild(
            document.createTextNode(dkInspect_categoriesTitle[cat]),
          );

          const ul = document.createElement('ul');
          const properties = dkInspect_categories[cat];

          for (const item of properties) {
            const li = document.createElement('li');
            li.id = 'dkInspect_' + item;

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

        // Insert a footer
        //const footer = document.createElement("div");
        //footer.id = "dkInspect_footer";
        //footer.appendChild( document.createTextNode("dkInspect 1.6") );
        //block.appendChild(footer);
      }
      dkInspectInsertMessage(
        '이 페이지에서 검사 할 요소 위로 포인터를 올려주세요.',
      );

      return block;
    };

    // Get all elements within the given element
    this.GetAllElements = function (element) {
      let elements = [];

      if (element && element.hasChildNodes()) {
        elements.push(element);

        const child = element.childNodes;

        for (let i = 0; i < child.length; i++) {
          if (child[i].hasChildNodes()) {
            elements = elements.concat(this.GetAllElements(child[i]));
          } else if (child[i].nodeType === 1) {
            elements.push(child[i]);
          }
        }
      }
      return elements;
    };

    // Add event listeners for all elements in the current document
    this.AddEventListeners = function () {
      const document = GetCurrentDocument();
      const elements = this.GetAllElements(document.body);
      if (window.frames.document.body.nodeName === 'FRAMESET') {
        // const frameEl =window.frames.document.body.getElementsByTagName('frame')[0].src;
        alert('크롬 브라우저에서는 FRAMESET의 진단이 불가능 합니다.');
        dkInspectRemoveElement('dkInspectInsertMessage');
        return false;
      } else {
        elements.forEach((item) => {
          item.addEventListener('mouseover', dkInspectMouseOver, false);
          item.addEventListener('mouseout', dkInspectMouseOut, false);
          item.addEventListener('mousemove', dkInspectMouseMove, false);
        });

        if (window.frames.length > 0) {
          for (let k = 0; k < window.frames.length; k++) {
            const frameEl = window.frames[k].document.body;
            const frameEls = this.GetAllElements(frameEl);
            //     console.log(frameEls);
            frameEls.forEach((item) => {
              item.addEventListener('mouseover', dkInspectMouseOver, false);
              item.addEventListener('mouseout', dkInspectMouseOut, false);
              item.addEventListener('mousemove', dkInspectMouseMove, false);
            });
          }
        }
      }
    };

    // Remove event listeners for all elements in the current document
    this.RemoveEventListeners = function () {
      const document = GetCurrentDocument();
      const elements = this.GetAllElements(document.body);

      elements.forEach((item) => {
        item.removeEventListener('mouseover', dkInspectMouseOver, false);
        item.removeEventListener('mouseout', dkInspectMouseOut, false);
        item.removeEventListener('mousemove', dkInspectMouseMove, false);
      });

      if (window.frames.length > 0) {
        for (let k = 0; k < window.frames.length; k++) {
          const frameEl = window.frames[k].document.body;
          if (frameEl) {
            const frameEls = this.GetAllElements(frameEl);
            frameEls.forEach((item) => {
              item.removeEventListener('mouseover', dkInspectMouseOver, false);
              item.removeEventListener('mouseout', dkInspectMouseOut, false);
              item.removeEventListener('mousemove', dkInspectMouseMove, false);
            });
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
        // Create a div block
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
    setColor: function (e, hex) {
      if (e) {
        e.style.setProperty('outline-color', hex, 'important');
        if (opt.bgmode) {
          e.style.setProperty(
            'background-color',
            this.hexToRGB(hex, 0.2),
            'important',
          );
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
      return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + alpha + ')';
    },
  };
  /*
   * Check if dkInspect is enabled
   */
  DkInspect.prototype.IsEnabled = function () {
    const document = GetCurrentDocument();

    return !!document.getElementById('dkInspect_block');
  };

  /*
   * Enable dkInspect
   */
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

  /*
   * Disable dkInspect
   */
  DkInspect.prototype.Disable = function () {
    const document = GetCurrentDocument();
    const block = document.getElementById('dkInspect_block');
    const trackingEl = document.getElementById('dkInspect_tracking');

    if (block) {
      document.getElementsByTagName('BODY')[0].removeChild(block);
      if (opt.trackingmode) {
        document.getElementsByTagName('BODY')[0].removeChild(trackingEl);
      }

      this.RemoveEventListeners();
      console.log('disabled dkInspect');
      return true;
    }

    return false;
  };

  /*
   * Display the notification message
   */
  function dkInspectInsertMessage(msg) {
    const oNewP = document.createElement('p');
    const oText = document.createTextNode(msg);

    oNewP.appendChild(oText);
    oNewP.id = 'dkInspectInsertMessage';
    oNewP.style.backgroundColor = '#3c77eb';
    oNewP.style.color = '#ffffff';
    oNewP.style.position = 'fixed';
    oNewP.style.top = '10px';
    oNewP.style.left = '10px';
    oNewP.style.zIndex = '99999999';
    oNewP.style.padding = '5px';
    oNewP.style.fontSize = '14px';
    oNewP.style.fontWeight = 'bold';

    document.getElementsByTagName('BODY')[0].appendChild(oNewP);
  }

  /*
   * Removes and element from the dom, used to remove the notification message
   */
  function dkInspectRemoveElement(divid) {
    const n = document.getElementById(divid);

    if (n) {
      document.getElementsByTagName('BODY')[0].removeChild(n);
    }
  }

  let dkInspectPause = false;
  const shortcut = {
    initialize: function () {
      chrome.extension.sendMessage(
        {
          cmd: 'pause',
        },
        function (response) {
          window.addEventListener(
            'keyup',
            function (e) {
              if (e.which === response) {
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
        }, 3000);
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
        }, 3000);
        return true;
      }

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
myApp()
  .then(() => console.log('Load'))
  .catch((e) => console.error(e));
