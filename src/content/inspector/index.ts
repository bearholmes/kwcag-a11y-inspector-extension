import { StorageManager } from '../../shared/storage-utils.ts';
import { CONSTANTS } from './constants.ts';
import {
  Inspector,
  InspectorConstructor,
  InspectorOptions,
  Categories,
  CategoriesTitle,
} from './inspector-core.ts';
import { createShortcutManager } from './shortcut-manager.ts';
import { getLocalizedMessage } from '../../shared/i18n-utils.ts';

/**
 * 전역 window 객체에 Inspector 인스턴스 저장을 위한 타입 확장
 */
declare global {
  interface Window {
    __kwcagInspector?: {
      inspector: InstanceType<InspectorConstructor>;
      shortcutManager: ReturnType<typeof createShortcutManager>;
    };
  }
}

/**
 * 스토리지에서 가져온 설정값 타입
 */
interface StorageSettings {
  ccshow?: string;
  boxshow?: string;
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
    'boxshow',
    'resolutions',
    'monitors',
    'linkmode',
    'bgmode',
    'linetype',
    'colortype',
    'trackingmode',
    'bordersize',
  ])) as unknown as StorageSettings;

  const {
    ccshow,
    boxshow,
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
  );
  const std_px = CONSTANTS.MEASUREMENT.MM_PER_INCH / (diagonal / monitors);

  // "opt" 객체에 각 값을 저장합니다.
  const opt: InspectorOptions = {
    ccshow,
    boxshow,
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
  const dkInspect_pColorBg = [
    'color',
    'background-color',
    'contrast',
    'contrastAA',
    'contrastAAA',
  ];

  // 길이 단위(px) 관련 문자열 배열
  const dkInspect_pLength = ['h', 'w', 'diagonal'];

  // 목표 크기(Target Size) 관련 문자열 배열
  const dkInspect_pTargetSize = ['wcag258', 'wcag255', 'kwcag213'];

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
    pTargetSize: dkInspect_pTargetSize,
    pBox: dkInspect_pBox,
    pColorBg: dkInspect_pColorBg,
  };

  // CSS Property 카테고리 제목
  const dkInspect_categoriesTitle: CategoriesTitle = {
    pLength: 'Length',
    pTargetSize: getLocalizedMessage('targetSizeInfo', 'Target Size Check'),
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
(async () => {
  // DOM에서 Inspector가 이미 활성화되어 있는지 확인
  const existingBlock = document.querySelector('.a11y-inspector');
  if (existingBlock) {
    // 이미 활성화되어 있으면 제거 (비활성화)
    const existingTracking = document.querySelector('.a11y-inspector-tracking');
    existingBlock.remove();
    if (existingTracking) {
      existingTracking.remove();
    }

    // 단축키 관리자 정리
    if (window.__kwcagInspector?.shortcutManager) {
      window.__kwcagInspector.shortcutManager.cleanup();
    }

    return;
  }

  // 비활성화 상태면 새로 생성 (활성화)
  const { opt, dkInspect_categories, dkInspect_categoriesTitle } =
    await myApp();

  // Inspector 인스턴스 생성
  const inspector = new (Inspector as unknown as InspectorConstructor)(
    opt,
    dkInspect_categories,
    dkInspect_categoriesTitle,
  );

  // 단축키 관리자 생성 및 초기화
  const shortcutManager = createShortcutManager();
  shortcutManager.initialize();

  // 전역 window 객체에 저장 (단축키용)
  window.__kwcagInspector = {
    inspector,
    shortcutManager,
  };

  // Inspector 활성화
  inspector.enable();
})();
