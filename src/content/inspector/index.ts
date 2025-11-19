// Import CSS
import './inspector.css';
import { StorageManager } from '../../shared/storage-utils.ts';
import { CONSTANTS } from './constants.ts';
import { Inspector, InspectorOptions } from './inspector-core.ts';
import {
  createShortcutManager,
  setShortcutManager,
} from './shortcut-manager.ts';

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

/**
 * 스토리지에서 가져온 설정값 타입
 */
interface StorageSettings {
  ccshow?: string;
  resolutions: string;
  monitors: number;
  linkmode: string;
  bgmode: string | number;
  linetype: string;
  colortype: string;
  trackingmode?: string;
  bordersize?: number;
}

/**
 * CSS 속성 카테고리 타입
 */
interface Categories {
  pLength: string[];
  pBox: string[];
  pColorBg: string[];
}

/**
 * CSS 속성 카테고리 제목 타입
 */
interface CategoriesTitle {
  pLength: string;
  pBox: string;
  pColorBg: string;
}

/**
 * 애플리케이션 설정 타입
 */
interface AppConfig {
  opt: InspectorOptions;
  dkInspect_categories: Categories;
  dkInspect_categoriesTitle: CategoriesTitle;
}

/**
 * 애플리케이션 초기화 함수
 * 설정을 로드하고 Inspector 설정 객체를 생성합니다.
 * @returns Inspector 설정 객체
 */
async function myApp(): Promise<AppConfig> {
  // StorageManager를 이용하여 여러 개의 데이터를 한 번에 읽어옵니다.
  const settings = (await StorageManager.getMultiple([
    'ccshow',
    'resolutions',
    'monitors',
    'linkmode',
    'bgmode',
    'linetype',
    'colortype',
    'trackingmode',
    'bordersize',
  ])) as StorageSettings;

  const {
    ccshow,
    resolutions,
    monitors,
    linkmode,
    bgmode,
    linetype,
    colortype,
    trackingmode,
    bordersize = 2,
  } = settings;

  const [width, height] = resolutions.split('x');
  const diagonal = Math.sqrt(
    Math.pow(parseInt(width), 2) + Math.pow(parseInt(height), 2),
  ).toFixed(CONSTANTS.MEASUREMENT.DECIMAL_PLACES);
  const std_px = CONSTANTS.MEASUREMENT.MM_PER_INCH / (diagonal / monitors);

  // "opt" 객체에 각 값을 저장합니다.
  const opt: InspectorOptions = {
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
  const dkInspect_categories: Categories = {
    pLength: dkInspect_pLength,
    pBox: dkInspect_pBox,
    pColorBg: dkInspect_pColorBg,
  };

  // CSS Property 카테고리 제목
  const dkInspect_categoriesTitle: CategoriesTitle = {
    pLength: 'Length',
    pBox: 'Box',
    pColorBg: 'Color Contrast',
  };

  return {
    opt,
    dkInspect_categories,
    dkInspect_categoriesTitle,
  };
}

/*
 * Inspector Entry Point
 * 설정을 로드하고 Inspector 인스턴스를 생성하여 활성화/비활성화를 토글합니다.
 */
myApp().then(({ opt, dkInspect_categories, dkInspect_categoriesTitle }) => {
  // Inspector 인스턴스 생성
  const inspector = new Inspector(
    opt,
    dkInspect_categories,
    dkInspect_categoriesTitle,
  );

  // 단축키 관리자 생성 및 초기화
  const shortcutManager = createShortcutManager(inspector);
  setShortcutManager(shortcutManager);
  shortcutManager.initialize();

  // Inspector 활성화/비활성화 토글
  if (inspector.isEnabled()) {
    inspector.disable();
  } else {
    inspector.enable();
  }

  console.log('Load');
});
