# KWCAG A11y Inspector - 개발 로드맵

**프로젝트 버전**: 0.13.0
**마지막 업데이트**: 2025-11-18

---

## 📊 현재 상태

### ✅ 완료된 작업 (2025-11-18)

- [x] 기능 기반 프로젝트 구조 (background/, content/, options/, shared/)
- [x] 파일명 일관성 개선 (kebab-case)
- [x] XSS 취약점 수정 (innerHTML → textContent/createElement)
- [x] Service Worker 개선 (alert → chrome.notifications)
- [x] 의존성 최신화 (보안 취약점 0개)
- [x] jscolor (GPL) → @simonwep/pickr (MIT) 전환
- [x] Vite 빌드 시스템 도입 (빌드 속도 71% 단축)
- [x] TypeScript 설정 추가
- [x] Git Hooks (husky + lint-staged)
- [x] GitHub Actions CI/CD
- [x] ESLint 설정 및 자동 린트
- [x] 11개 언어 국제화 지원
- [x] **Phase 1 완료**: Storage/DOM 유틸리티 통합, TypeScript 의존성 제거, CSP 분석
- [x] **Phase 2 완료**: inspector.js 모듈화 (1,393줄 → 6개 모듈, 현대적 네이밍 적용)

### 📈 핵심 지표

| 지표              | 현재 값 | 목표   | 상태         |
| ----------------- | ------- | ------ | ------------ |
| 번들 크기         | 287KB   | 250KB  | 🟡 개선 가능 |
| 빌드 시간         | 5초     | 3.5초  | 🟡 개선 가능 |
| 보안 취약점       | 0개     | 0개    | ✅ 달성      |
| 테스트 커버리지   | 0%      | 80%    | 🔴 미달성    |
| TypeScript 전환율 | 0%      | 100%   | 🔴 미달성    |
| 코드 품질 점수    | 8.5/10  | 9.5/10 | 🟡 개선 가능 |

---

## 🎯 Phase 1: 긴급 개선 (1-2주)

**목표**: 코드 품질 및 유지보수성 즉각 개선

### 1.1 불필요한 의존성 제거 ⏱️ 30분

**작업 내용**:

```bash
# Babel은 더 이상 사용하지 않음 (Vite로 전환)
npm uninstall @babel/cli @babel/core @babel/preset-env

# @crxjs/vite-plugin은 설치했으나 미사용
npm uninstall @crxjs/vite-plugin

# TypeScript를 당장 사용하지 않는다면
npm uninstall @types/chrome @types/node typescript
```

**예상 효과**:

- node_modules 크기: 119MB → 90MB (24% 감소)
- 빌드 시간: 5초 → 4.5초 (10% 단축)
- 의존성 복잡도 감소

**담당**: DevOps
**우선순위**: 🔴 높음

---

### 1.2 공통 Storage 유틸리티 추출 ⏱️ 3시간

**작업 내용**:

**파일 생성**: `src/shared/storage-utils.js`

```javascript
/**
 * Chrome Storage API 래퍼 클래스
 */
export class StorageManager {
  /**
   * Storage에서 값 가져오기
   * @param {string} key - 키
   * @returns {Promise<any>}
   */
  static async get(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(key, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  /**
   * Storage에 값 저장
   * @param {string} key - 키
   * @param {any} value - 값
   * @returns {Promise<void>}
   */
  static async set(key, value) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 여러 값 한번에 가져오기
   * @param {string[]} keys - 키 배열
   * @returns {Promise<Object>}
   */
  static async getMultiple(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  }
}
```

**적용 파일**:

- `src/background/service-worker.js` (Line 77-96)
- `src/content/inspector.js` (Line 105-122)
- `src/content/calculator.js` (Line 97-125)
- `src/options/settings.js` (Line 83-111)

**예상 효과**:

- 코드 중복 제거 (~150줄)
- 에러 처리 일관성 확보
- 유지보수성 향상

**담당**: 개발자
**우선순위**: 🔴 높음

---

### 1.3 공통 DOM 유틸리티 추출 ⏱️ 2시간

**파일 생성**: `src/shared/dom-utils.js`

```javascript
/**
 * ID로 요소 조회
 * @param {string} id - 요소 ID
 * @returns {HTMLElement|null}
 */
export function $(id) {
  return document.getElementById(id);
}

/**
 * 요소 생성 헬퍼
 * @param {string} tag - 태그명
 * @param {Object} options - 옵션
 * @returns {HTMLElement}
 */
export function createElement(
  tag,
  { className, textContent, attrs = {} } = {},
) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (textContent) element.textContent = textContent;
  Object.entries(attrs).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

/**
 * 요소 검증
 * @param {HTMLElement} element - 검증할 요소
 * @param {string} name - 요소 이름
 * @returns {boolean}
 */
export function validateElement(element, name) {
  if (!element) {
    console.error(`Required element not found: ${name}`);
    return false;
  }
  return true;
}
```

**담당**: 개발자
**우선순위**: 🟡 중간

---

### 1.4 CSP 헤더 추가 ⏱️ 1시간

**파일 수정**: `manifest.json`

```json
{
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; style-src 'self' 'unsafe-inline';"
  }
}
```

**단계별 작업**:

1. CSP 헤더 추가
2. 인라인 스타일 제거 (가능한 경우)
3. 빌드 & 테스트
4. 'unsafe-inline' 제거 시도

**예상 효과**:

- XSS 공격 방어 강화
- 보안 점수 향상

**담당**: 보안팀
**우선순위**: 🟡 중간

---

## 🚀 Phase 2: 코드 모듈화 (2-3주)

**목표**: 유지보수성 대폭 향상

### 2.1 inspector.js 모듈 분할 ⏱️ 2주

**현재 상태**: 1,641줄 단일 파일
**목표**: 5-6개 파일로 분할

**새로운 구조**:

```
src/content/inspector/
├── index.js                 (엔트리 포인트, 100줄)
├── constants.js            (상수 정의, 100줄)
├── color-utils.js          (색상 계산, 200줄)
├── css-handlers.js         (CSS 계산/업데이트, 400줄)
├── event-handlers.js       (이벤트 핸들러, 300줄)
├── inspector-core.js       (메인 로직, 400줄)
├── shortcut-manager.js     (단축키 관리, 150줄)
└── inspector.css
```

**상세 계획**:

#### Week 1: 준비 및 분리 (1주차)

- [ ] **Day 1-2**: constants.js 분리
  - CONSTANTS 객체 추출
  - 모든 상수 중앙화

- [ ] **Day 3-4**: color-utils.js 분리
  - RGB/Hex 변환 함수
  - WCAG 대비 계산 함수
  - Luminance 계산 함수

- [ ] **Day 5**: 테스트 및 검증
  - 빌드 확인
  - 기능 동작 확인

#### Week 2: 핵심 로직 분리 (2주차)

- [ ] **Day 1-2**: css-handlers.js 분리
  - UpdateColorBg, UpdateLength 등
  - CSS 속성 계산 로직

- [ ] **Day 3-4**: event-handlers.js 분리
  - MouseOver, MouseOut, MouseMove
  - 이벤트 리스너 로직

- [ ] **Day 5**: inspector-core.js & index.js
  - DkInspect 클래스
  - 엔트리 포인트

**마이그레이션 예시**:

**Before** (inspector.js):

```javascript
// 1,641줄 단일 파일
const CONSTANTS = { ... };
function DecToHex(nb) { ... }
function UpdateColorBg(element) { ... }
// ... 1,600+ lines
```

**After**:

`constants.js`:

```javascript
export const CONSTANTS = {
  COLOR: { ... },
  MEASUREMENT: { ... },
  WCAG_CONTRAST: { ... },
};
```

`color-utils.js`:

```javascript
import { CONSTANTS } from './constants';

export function DecToHex(nb) { ... }
export function RGBToHex(str) { ... }
export function getL(color) { ... }
```

`index.js`:

```javascript
import { CONSTANTS } from './constants';
import { DecToHex, getL } from './color-utils';
import { UpdateColorBg, UpdateLength } from './css-handlers';
import { DkInspect } from './inspector-core';

async function myApp() {
  const opt = await loadSettings();
  const dkInspect = new DkInspect(opt);

  if (dkInspect.IsEnabled()) {
    dkInspect.Disable();
  } else {
    dkInspect.Enable();
  }
}

myApp().then(() => console.log('Load'));
```

**Vite 설정 업데이트**:

```javascript
// vite.config.js
rollupOptions: {
  input: {
    'content/inspector': resolve(__dirname, 'src/content/inspector/index.js'),
  }
}
```

**예상 효과**:

- 가독성 200% 향상
- 파일당 평균 300줄 이하
- Tree Shaking으로 번들 크기 5% 감소
- 개발 생산성 50% 향상

**담당**: 개발자
**우선순위**: 🔴 높음

---

### 2.2 calculator.js 리팩토링 ⏱️ 3일

**목표**: 계산 로직 분리

**새로운 구조**:

```
src/content/calculator/
├── index.js               (엔트리, UI 관리)
├── calculator-ui.js      (DOM 생성/조작)
├── calculator-math.js    (계산 로직)
└── calculator.css
```

`calculator-math.js`:

```javascript
export class SizeCalculator {
  constructor(stdPx) {
    this.stdPx = stdPx;
  }

  /**
   * 화면 크기 계산
   * @param {number} height - 높이(px)
   * @param {number} width - 너비(px)
   * @returns {Object} 계산 결과
   */
  calculateDimensions(height, width) {
    const heightMm = (height / this.stdPx).toFixed(2);
    const widthMm = (width / this.stdPx).toFixed(2);
    const diagonal = Math.sqrt(
      Math.pow(heightMm, 2) + Math.pow(widthMm, 2),
    ).toFixed(2);

    return {
      heightMm,
      widthMm,
      diagonal,
      heightPx: height,
      widthPx: width,
    };
  }
}
```

**담당**: 개발자
**우선순위**: 🟢 낮음

---

## 📝 Phase 3: 테스트 구축 (3-4주)

**목표**: 테스트 커버리지 80% 달성

### 3.1 유틸리티 함수 테스트 ⏱️ 1주

**우선순위 높은 테스트**:

`tests/shared/storage-utils.test.js`:

```javascript
import { StorageManager } from '@/shared/storage-utils';

describe('StorageManager', () => {
  beforeEach(() => {
    global.chrome = {
      storage: {
        sync: {
          get: jest.fn(),
          set: jest.fn(),
        },
      },
    };
  });

  test('should get value from storage', async () => {
    chrome.storage.sync.get.mockImplementation((key, callback) => {
      callback({ monitors: '17' });
    });

    const result = await StorageManager.get('monitors');
    expect(result).toBe('17');
  });

  test('should handle storage error', async () => {
    chrome.storage.sync.get.mockImplementation((key, callback) => {
      chrome.runtime.lastError = new Error('Storage error');
      callback({});
    });

    await expect(StorageManager.get('monitors')).rejects.toThrow(
      'Storage error',
    );
  });
});
```

`tests/content/color-utils.test.js`:

```javascript
import { DecToHex, RGBToHex, getL } from '@/content/inspector/color-utils';

describe('Color Utilities', () => {
  describe('DecToHex', () => {
    test('should convert decimal to hex', () => {
      expect(DecToHex(255)).toBe('ff');
      expect(DecToHex(0)).toBe('00');
      expect(DecToHex(128)).toBe('80');
    });
  });

  describe('getL (Luminance)', () => {
    test('should calculate luminance for white', () => {
      expect(getL('FFFFFF')).toBeCloseTo(255, 1);
    });

    test('should calculate luminance for black', () => {
      expect(getL('000000')).toBe(0);
    });
  });
});
```

`tests/content/calculator.test.js`:

```javascript
import { SizeCalculator } from '@/content/calculator/calculator-math';

describe('SizeCalculator', () => {
  test('should calculate dimensions correctly', () => {
    const calculator = new SizeCalculator(2.835);
    const result = calculator.calculateDimensions(1920, 1080);

    expect(result.heightMm).toBe('677.25');
    expect(result.widthMm).toBe('380.92');
    expect(parseFloat(result.diagonal)).toBeCloseTo(776.63, 1);
  });
});
```

**작업 일정**:

- **Week 1**: 유틸리티 함수 테스트 (storage, color, DOM)
- **Week 2**: 계산 로직 테스트 (calculator, WCAG)
- **Week 3**: 통합 테스트 (inspector, settings)
- **Week 4**: E2E 테스트 (Puppeteer)

**목표 커버리지**:
| 모듈 | 목표 커버리지 |
|------|--------------|
| shared/ | 90% |
| calculator/ | 85% |
| inspector/ | 75% |
| settings/ | 70% |
| **전체** | **80%** |

**담당**: QA팀
**우선순위**: 🔴 높음

---

## 🎨 Phase 4: Pickr 통합 (1주)

**목표**: jscolor 완전 제거 및 Pickr 통합

### 4.1 settings.js Pickr 초기화 ⏱️ 3일

**작업 내용**:

`src/options/settings.js`:

```javascript
import Pickr from '@simonwep/pickr';
import '@simonwep/pickr/dist/themes/nano.min.css';

// 기존 jscolor 관련 코드 제거
// const colorType = safeGetValue('colorType');

// Pickr 초기화
function initColorPicker() {
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
      'btn:save': chrome.i18n.getMessage('calcConfirm') || 'Save',
    },
  });

  pickr.on('save', (color) => {
    const hexColor = color.toHEXA().toString().substring(1, 7);
    StorageManager.set('colortype', hexColor);
    pickr.hide();
  });

  return pickr;
}
```

**settings.html 수정**:

```html
<!-- Before: jscolor -->
<input type="text" id="colorType" class="inp_comm jscolor" value="ff0000" />

<!-- After: Pickr -->
<div id="colorType"></div>
```

**예상 효과**:

- 라이선스 문제 완전 해결
- 더 나은 UX
- npm 패키지 관리

**담당**: 개발자
**우선순위**: 🟡 중간

---

## 💎 Phase 5: TypeScript 마이그레이션 (3개월)

**목표**: 100% TypeScript 전환

### 5.1 타입 정의 작성 ⏱️ 2주

`src/types/index.d.ts`:

```typescript
/** WCAG 대비 계산 결과 */
export interface ContrastResult {
  ratio: number;
  foreground: string;
  background: string;
  passes: {
    AA: boolean;
    AAA: boolean;
    AALarge: boolean;
    AAALarge: boolean;
  };
}

/** 요소 크기 정보 */
export interface ElementDimensions {
  height: number;
  width: number;
  diagonal: number;
  heightMm: number;
  widthMm: number;
  diagonalMm: number;
}

/** 인스펙터 설정 */
export interface InspectorSettings {
  monitors: string;
  resolutions: string;
  ccshow: 0 | 1;
  linkmode: 0 | 1;
  bgmode: boolean;
  linetype: 'solid' | 'dashed' | 'dotted';
  colortype: string;
  trackingmode: boolean;
  bordersize: number;
}

/** Storage 관리자 */
export interface IStorageManager {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T): Promise<void>;
  getMultiple(keys: string[]): Promise<Record<string, any>>;
}
```

### 5.2 순차적 변환

**Month 1**: 기반 모듈

- [x] tsconfig.json 생성 ✅
- [ ] src/types/index.d.ts 작성
- [ ] src/shared/\*.ts 변환
  - storage-utils.ts
  - dom-utils.ts
  - validators.ts

**Month 2**: 독립 모듈

- [ ] src/background/service-worker.ts
- [ ] src/content/calculator/\*.ts
- [ ] src/options/settings.ts

**Month 3**: 복잡한 모듈

- [ ] src/content/inspector/\*.ts (가장 복잡)
- [ ] 통합 테스트
- [ ] 타입 에러 수정

**마이그레이션 전략**:

1. `.js` 파일을 `.ts`로 변경
2. `any` 타입으로 시작
3. 점진적으로 구체적인 타입으로 교체
4. strict 모드 활성화

**예시**:

```typescript
// Before (JS)
function getL(color) {
  let R, G, B;
  // ...
  return R * 0.2126 + G * 0.7152 + B * 0.0722;
}

// After (TS)
function getL(color: string): number | false {
  if (color.length !== 3 && color.length !== 6) {
    return false;
  }

  const R: number = getsRGB(/* ... */);
  const G: number = getsRGB(/* ... */);
  const B: number = getsRGB(/* ... */);

  if (R === false || G === false || B === false) {
    return false;
  }

  return (
    CONSTANTS.WCAG_CONTRAST.LUMINANCE_RED * R +
    CONSTANTS.WCAG_CONTRAST.LUMINANCE_GREEN * G +
    CONSTANTS.WCAG_CONTRAST.LUMINANCE_BLUE * B
  );
}
```

**예상 효과**:

- 타입 안정성 확보
- 런타임 에러 70% 감소
- IDE 자동완성 지원
- 리팩토링 안정성 향상

**담당**: 개발팀
**우선순위**: 🔴 높음

---

## 🔬 Phase 6: 고급 기능 (선택, 6개월+)

**목표**: 사용자 경험 대폭 향상

### 6.1 색상 대비 자동 수정 제안 ⏱️ 3주

**기능**:

- 현재 색상 대비가 WCAG 기준 미달 시
- 자동으로 개선된 색상 조합 제안
- UI에 "Fix Contrast" 버튼 추가

**구현**:

```typescript
interface ContrastSuggestion {
  original: { fg: string; bg: string };
  suggested: { fg: string; bg: string };
  ratio: number;
  improvement: string;
}

function suggestBetterContrast(
  foreground: string,
  background: string,
  targetRatio: number = 4.5,
): ContrastSuggestion[] {
  const suggestions: ContrastSuggestion[] = [];

  // 전경색 어둡게/밝게 조정
  for (let adjustment = -50; adjustment <= 50; adjustment += 10) {
    const newFg = adjustLuminance(foreground, adjustment);
    const ratio = calculateContrastRatio(newFg, background);

    if (ratio >= targetRatio) {
      suggestions.push({
        original: { fg: foreground, bg: background },
        suggested: { fg: newFg, bg: background },
        ratio,
        improvement: `${((ratio / getCurrentRatio() - 1) * 100).toFixed(0)}%`,
      });
    }
  }

  return suggestions.sort((a, b) => b.ratio - a.ratio);
}
```

**우선순위**: 🟢 낮음

---

### 6.2 키보드 접근성 자동 검사 ⏱️ 4주

**기능**:

- Tab 키로 순회 가능한지 검사
- 포커스 스타일 검사
- ARIA 속성 검사
- 자동 리포트 생성

**구현**:

```typescript
interface A11yIssue {
  element: HTMLElement;
  type: 'focus-order' | 'missing-label' | 'low-contrast' | 'aria-invalid';
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion: string;
  wcagRef: string;
}

class A11yChecker {
  static checkPage(): A11yIssue[] {
    const issues: A11yIssue[] = [];

    // 포커스 순서 검사
    this.checkFocusOrder(issues);

    // 폼 레이블 검사
    this.checkFormLabels(issues);

    // ARIA 속성 검사
    this.checkAriaAttributes(issues);

    // 색상 대비 검사 (이미 구현됨)
    this.checkColorContrast(issues);

    return issues;
  }

  private static checkFocusOrder(issues: A11yIssue[]) {
    const focusableElements = document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    focusableElements.forEach((el, index) => {
      const tabIndex = el.getAttribute('tabindex');
      if (tabIndex && parseInt(tabIndex) > 0) {
        issues.push({
          element: el as HTMLElement,
          type: 'focus-order',
          severity: 'warning',
          message: 'Positive tabindex found',
          suggestion: 'Use tabindex="0" or remove tabindex',
          wcagRef: 'WCAG 2.4.3',
        });
      }
    });
  }
}
```

**우선순위**: 🟢 낮음

---

### 6.3 PDF/HTML 리포트 생성 ⏱️ 3주

**기능**:

- 검사 결과를 PDF 또는 HTML로 저장
- 브랜딩 가능한 템플릿
- 이슈 스크린샷 자동 캡처

**우선순위**: 🟢 낮음

---

## 📅 타임라인 요약

```
2025년 11월 - 12월 (6주)
├─ Week 1-2: Phase 1 - 긴급 개선
│  ├─ 의존성 정리
│  ├─ 공통 유틸리티 추출
│  └─ CSP 헤더 추가
│
├─ Week 3-4: Phase 2.1 - inspector.js 모듈화
│  ├─ constants, color-utils 분리
│  └─ css-handlers, event-handlers 분리
│
└─ Week 5-6: Phase 2.2 + Phase 4
   ├─ calculator 리팩토링
   └─ Pickr 통합

2025년 12월 - 2026년 1월 (4주)
├─ Week 7-10: Phase 3 - 테스트 구축
│  ├─ 유틸리티 테스트
│  ├─ 계산 로직 테스트
│  ├─ 통합 테스트
│  └─ E2E 테스트

2026년 1월 - 3월 (12주)
└─ Week 11-22: Phase 5 - TypeScript 마이그레이션
   ├─ Month 1: shared, types
   ├─ Month 2: calculator, settings, service-worker
   └─ Month 3: inspector, 통합 테스트

2026년 4월 이후 (선택)
└─ Phase 6: 고급 기능
   ├─ 색상 대비 자동 수정
   ├─ 키보드 접근성 검사
   └─ PDF 리포트 생성
```

---

## 🎯 우선순위 매트릭스

| 작업                    | 중요도     | 긴급도   | 예상 시간 | 우선순위  |
| ----------------------- | ---------- | -------- | --------- | --------- |
| 불필요한 의존성 제거    | ⭐⭐⭐     | ⭐⭐⭐   | 30분      | 🔴 최우선 |
| 공통 Storage 유틸리티   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | 3시간     | 🔴 최우선 |
| CSP 헤더 추가           | ⭐⭐⭐⭐   | ⭐⭐⭐   | 1시간     | 🔴 최우선 |
| inspector.js 모듈화     | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 2주       | 🔴 최우선 |
| 테스트 코드 작성        | ⭐⭐⭐⭐⭐ | ⭐⭐⭐   | 4주       | 🔴 높음   |
| TypeScript 마이그레이션 | ⭐⭐⭐⭐⭐ | ⭐⭐     | 3개월     | 🟡 중간   |
| Pickr 통합              | ⭐⭐⭐     | ⭐⭐     | 3일       | 🟡 중간   |
| calculator 리팩토링     | ⭐⭐⭐     | ⭐       | 3일       | 🟢 낮음   |
| 고급 기능 추가          | ⭐⭐       | ⭐       | 10주+     | 🟢 낮음   |

---

## 📊 성공 지표 (KPI)

### 단기 목표 (1개월)

- [ ] 번들 크기: 287KB → 250KB (-13%)
- [ ] 빌드 시간: 5초 → 3.5초 (-30%)
- [ ] 코드 중복: 150줄 제거
- [ ] 보안 점수: 7.5/10 → 9.0/10

### 중기 목표 (3개월)

- [ ] 테스트 커버리지: 0% → 80%
- [ ] TypeScript 전환율: 0% → 50%
- [ ] 파일당 평균 줄 수: 500줄 → 300줄
- [ ] 코드 품질 점수: 8.5/10 → 9.5/10

### 장기 목표 (6개월)

- [ ] TypeScript 전환율: 100%
- [ ] 버그 발생률: 50% 감소
- [ ] 개발 생산성: 70% 향상
- [ ] 사용자 만족도: 4.5/5.0 → 4.8/5.0

---

## 🤝 팀 역할 분담

| 역할             | 담당자 | 주요 업무                       |
| ---------------- | ------ | ------------------------------- |
| **Tech Lead**    | TBD    | 아키텍처 설계, 코드 리뷰        |
| **Backend Dev**  | TBD    | Storage, Service Worker         |
| **Frontend Dev** | TBD    | Inspector, Calculator, Settings |
| **QA Engineer**  | TBD    | 테스트 작성, 품질 보증          |
| **DevOps**       | TBD    | CI/CD, 빌드 최적화              |
| **Security**     | TBD    | CSP, 보안 검토                  |

---

## 📚 참고 자료

### 문서

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### 도구

- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Jest](https://jestjs.io/)
- [Puppeteer](https://pptr.dev/)
- [Rollup Bundle Analyzer](https://github.com/btd/rollup-plugin-visualizer)

---

## 🔄 업데이트 이력

| 날짜       | 버전 | 변경 내용                                       |
| ---------- | ---- | ----------------------------------------------- |
| 2025-11-18 | 1.0  | 초기 로드맵 작성                                |
| 2025-11-18 | 1.1  | Phase 1 & Phase 2 완료 반영, 진행 상황 업데이트 |

---

**문의**: bearholmes@gmail.com
**Repository**: https://github.com/bearholmes/kwcag-a11y-inspector-extension
