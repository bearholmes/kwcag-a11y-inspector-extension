# E2E 테스트 계획 (End-to-End Testing Plan)

> **작성일**: 2025-11-18
> **프로젝트**: KWCAG 접근성 검사 확장 프로그램
> **목적**: Chrome Extension의 실제 사용자 시나리오를 검증하는 E2E 테스트 전략 수립

## 📋 목차

1. [개요](#1-개요)
2. [E2E 테스트 범위](#2-e2e-테스트-범위)
3. [테스트 도구 선정](#3-테스트-도구-선정)
4. [테스트 환경 구성](#4-테스트-환경-구성)
5. [테스트 시나리오](#5-테스트-시나리오)
6. [테스트 구현 예시](#6-테스트-구현-예시)
7. [CI 통합 방안](#7-ci-통합-방안)
8. [단계별 구현 계획](#8-단계별-구현-계획)
9. [성공 지표](#9-성공-지표)

---

## 1. 개요

### 1.1 E2E 테스트의 필요성

**Chrome Extension의 특수성**:

- Content Script와 Background Service Worker의 메시지 통신
- Chrome API의 실제 동작 검증 필요
- 웹 페이지와의 상호작용 검증
- 확장 프로그램 설치/활성화 상태 검증

**현재 상태**:

- ✅ Unit Test Coverage: 28.53% (Jest)
- ❌ E2E Test Coverage: 0%
- ❌ Integration Test Coverage: 0%

**목표**:

- 핵심 사용자 시나리오 100% 커버
- 주요 기능에 대한 회귀 테스트 자동화
- CI/CD 파이프라인 통합

### 1.2 테스트 범위 정의

| 테스트 유형            | 담당 도구                    | 커버리지 목표      |
| ---------------------- | ---------------------------- | ------------------ |
| Unit Test              | Jest                         | 80%                |
| Integration Test       | Jest + Chrome API Mock       | 주요 모듈 간 통신  |
| E2E Test               | Puppeteer + Chrome Extension | 핵심 시나리오 100% |
| Visual Regression Test | Percy/BackstopJS             | 주요 UI 컴포넌트   |

---

## 2. E2E 테스트 범위

### 2.1 핵심 기능별 우선순위

#### 🔴 P0 (Critical) - 반드시 테스트

1. **접근성 검사 실행**
   - 웹 페이지에서 요소 hover 시 인스펙터 표시
   - 접근성 정보 패널 표시 (색상 대비, 대체 텍스트 등)
   - 키보드 단축키로 일시정지/재개

2. **설정 페이지**
   - 색상 선택기로 검사 색상 변경
   - 해상도 설정 저장 및 적용
   - 설정 값 로컬 스토리지 저장

3. **색상 대비 계산**
   - 텍스트와 배경색 대비 계산 정확도
   - WCAG 2.1 AA/AAA 기준 판정

#### 🟡 P1 (High) - 중요 기능

4. **다양한 웹 페이지 호환성**
   - 정적 HTML 페이지
   - React/Vue 등 SPA
   - 동적 콘텐츠 로딩 페이지

5. **에러 핸들링**
   - 제한된 URL (chrome://, chrome-extension://)
   - 잘못된 설정 값 입력

#### 🟢 P2 (Medium) - 부가 기능

6. **성능**
   - 대규모 DOM에서의 반응 속도
   - 메모리 누수 방지

### 2.2 테스트하지 않을 범위

- Chrome Web Store 배포 프로세스 (수동 검증)
- 다국어 번역 품질 (수동 검증)
- 브라우저 호환성 (Chrome만 지원)

---

## 3. 테스트 도구 선정

### 3.1 도구 비교 분석

| 도구          | 장점                                            | 단점                   | 선정 여부   |
| ------------- | ----------------------------------------------- | ---------------------- | ----------- |
| **Puppeteer** | Chrome Extension 지원, Headless 모드, 빠른 속도 | Firefox 미지원         | ✅ **선정** |
| Playwright    | 멀티 브라우저, 강력한 API                       | Extension 지원 제한적  | ❌          |
| Selenium      | 멀티 브라우저, 성숙한 생태계                    | 느린 속도, 복잡한 설정 | ❌          |
| Cypress       | 개발자 경험 우수                                | Extension 미지원       | ❌          |

### 3.2 최종 선정: Puppeteer

**선정 이유**:

1. Chrome Extension 네이티브 지원
2. Headless/Headful 모드 전환 용이
3. 빠른 실행 속도 (CI 효율성)
4. Chrome DevTools Protocol 직접 사용 가능
5. Jest와 통합 용이

**설치 패키지**:

```json
{
  "devDependencies": {
    "puppeteer": "^22.0.0",
    "jest-puppeteer": "^10.0.0",
    "expect-puppeteer": "^10.0.0"
  }
}
```

### 3.3 보조 도구

| 도구              | 용도                      | 비용            |
| ----------------- | ------------------------- | --------------- |
| **Percy**         | Visual Regression Testing | Free (오픈소스) |
| **Lighthouse CI** | 성능/접근성 점수 추적     | Free            |
| **Axe Puppeteer** | 접근성 검사 자동화        | Free            |

---

## 4. 테스트 환경 구성

### 4.1 디렉터리 구조

```
tests/
├── e2e/
│   ├── setup/
│   │   ├── jest.config.js          # E2E용 Jest 설정
│   │   ├── global-setup.js         # Extension 빌드 및 로드
│   │   └── global-teardown.js      # 테스트 후 정리
│   ├── fixtures/
│   │   ├── test-pages/             # 테스트용 HTML 페이지
│   │   │   ├── simple.html
│   │   │   ├── spa-react.html
│   │   │   └── complex-dom.html
│   │   └── screenshots/            # 기준 스크린샷
│   ├── helpers/
│   │   ├── extension-helper.js     # Extension 로딩 유틸
│   │   ├── page-helper.js          # 페이지 조작 유틸
│   │   └── assertion-helper.js     # 커스텀 매처
│   ├── specs/
│   │   ├── inspector.e2e.test.js   # 인스펙터 E2E 테스트
│   │   ├── settings.e2e.test.js    # 설정 페이지 E2E 테스트
│   │   ├── color-contrast.e2e.test.js
│   │   └── shortcuts.e2e.test.js
│   └── visual/
│       ├── inspector-panel.visual.test.js
│       └── settings-page.visual.test.js
```

### 4.2 jest.config.js (E2E용)

```javascript
// tests/e2e/setup/jest.config.js
module.exports = {
  preset: 'jest-puppeteer',
  testMatch: ['**/tests/e2e/specs/**/*.e2e.test.js'],
  testTimeout: 30000, // E2E는 시간이 더 필요
  globalSetup: '<rootDir>/tests/e2e/setup/global-setup.js',
  globalTeardown: '<rootDir>/tests/e2e/setup/global-teardown.js',
  setupFilesAfterEnv: ['expect-puppeteer'],
  testEnvironment: 'node',
};
```

### 4.3 global-setup.js (Extension 빌드)

```javascript
// tests/e2e/setup/global-setup.js
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);

module.exports = async function globalSetup() {
  console.log('Building extension for E2E tests...');

  // Vite 빌드 실행
  await execAsync('npm run build', {
    cwd: path.resolve(__dirname, '../../..'),
  });

  console.log('Extension build completed');

  // Extension 경로를 전역 변수로 저장
  global.__EXTENSION_PATH__ = path.resolve(__dirname, '../../../dist');
};
```

### 4.4 extension-helper.js (Extension 로딩)

```javascript
// tests/e2e/helpers/extension-helper.js
const puppeteer = require('puppeteer');
const path = require('path');

/**
 * Chrome Extension이 로드된 브라우저 인스턴스 생성
 */
async function launchBrowserWithExtension() {
  const extensionPath =
    global.__EXTENSION_PATH__ || path.resolve(__dirname, '../../../dist');

  const browser = await puppeteer.launch({
    headless: false, // Extension은 headful 모드 필요
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
  });

  return browser;
}

/**
 * Extension의 Service Worker 페이지 가져오기
 */
async function getServiceWorkerPage(browser) {
  const targets = await browser.targets();
  const serviceWorkerTarget = targets.find(
    (target) => target.type() === 'service_worker',
  );

  if (!serviceWorkerTarget) {
    throw new Error('Service worker not found');
  }

  return await serviceWorkerTarget.page();
}

/**
 * Extension의 Options 페이지 열기
 */
async function openOptionsPage(browser) {
  const targets = await browser.targets();
  const extensionTarget = targets.find(
    (target) => target.type() === 'service_worker',
  );

  const extensionId = extensionTarget.url().split('/')[2];
  const optionsUrl = `chrome-extension://${extensionId}/src/options/settings.html`;

  const page = await browser.newPage();
  await page.goto(optionsUrl);
  return page;
}

module.exports = {
  launchBrowserWithExtension,
  getServiceWorkerPage,
  openOptionsPage,
};
```

---

## 5. 테스트 시나리오

### 5.1 인스펙터 기본 동작 시나리오

```gherkin
Feature: 접근성 인스펙터 기본 동작

  Scenario: 웹 페이지에서 요소 hover 시 인스펙터 표시
    Given 사용자가 테스트 웹 페이지를 열었을 때
    And Extension이 활성화되어 있을 때
    When 사용자가 <h1> 요소 위에 마우스를 올리면
    Then 인스펙터 패널이 표시되어야 한다
    And 패널에 요소의 태그명이 표시되어야 한다
    And 패널에 접근성 정보가 표시되어야 한다

  Scenario: 키보드 단축키로 일시정지
    Given 인스펙터가 활성화되어 있을 때
    When 사용자가 "Shift+P" 키를 누르면
    Then "일시정지" 메시지가 표시되어야 한다
    And 3초 후 메시지가 사라져야 한다
    And 요소 hover 시 인스펙터가 표시되지 않아야 한다

  Scenario: 키보드 단축키로 재개
    Given 인스펙터가 일시정지 상태일 때
    When 사용자가 "Shift+P" 키를 다시 누르면
    Then "재개" 메시지가 표시되어야 한다
    And 요소 hover 시 인스펙터가 다시 표시되어야 한다
```

### 5.2 색상 대비 계산 시나리오

```gherkin
Feature: 색상 대비 계산 및 WCAG 판정

  Scenario: 충분한 대비를 가진 텍스트
    Given 검은색(#000000) 텍스트와 흰색(#FFFFFF) 배경이 있을 때
    When 인스펙터가 색상 대비를 계산하면
    Then 대비율이 "21:1"이어야 한다
    And "AAA" 등급으로 표시되어야 한다

  Scenario: 불충분한 대비를 가진 텍스트
    Given 연한 회색(#AAAAAA) 텍스트와 흰색(#FFFFFF) 배경이 있을 때
    When 인스펙터가 색상 대비를 계산하면
    Then 대비율이 "2.32:1"이어야 한다
    And "Fail" 상태로 표시되어야 한다
```

### 5.3 설정 페이지 시나리오

```gherkin
Feature: 설정 페이지 동작

  Scenario: 색상 변경 및 저장
    Given 사용자가 설정 페이지를 열었을 때
    When 사용자가 색상 선택기를 클릭하면
    And 빨간색(#FF0000)을 선택하고 "확인"을 클릭하면
    Then "색상이 저장되었습니다" 메시지가 표시되어야 한다
    And Chrome Storage에 "colortype: FF0000"이 저장되어야 한다

  Scenario: 해상도 설정 변경
    Given 사용자가 설정 페이지를 열었을 때
    When 사용자가 해상도 입력란에 "1920x1080"을 입력하면
    And "저장" 버튼을 클릭하면
    Then "해상도가 저장되었습니다" 메시지가 표시되어야 한다
    And Chrome Storage에 해상도 값이 저장되어야 한다

  Scenario: 잘못된 해상도 형식 입력
    Given 사용자가 설정 페이지를 열었을 때
    When 사용자가 해상도 입력란에 "abc"를 입력하면
    And "저장" 버튼을 클릭하면
    Then 에러 메시지가 표시되어야 한다
    And 설정이 저장되지 않아야 한다
```

### 5.4 다양한 웹 페이지 호환성 시나리오

```gherkin
Feature: 다양한 웹 페이지 호환성

  Scenario: 정적 HTML 페이지
    Given 사용자가 정적 HTML 페이지를 열었을 때
    When 사용자가 요소 위에 마우스를 올리면
    Then 인스펙터가 정상적으로 표시되어야 한다

  Scenario: React SPA 페이지
    Given 사용자가 React로 만들어진 SPA를 열었을 때
    And 페이지가 완전히 로드되었을 때
    When 사용자가 동적 렌더링된 요소 위에 마우스를 올리면
    Then 인스펙터가 정상적으로 표시되어야 한다

  Scenario: 대규모 DOM 페이지
    Given 사용자가 10,000개 이상의 요소를 가진 페이지를 열었을 때
    When 사용자가 요소 위에 마우스를 올리면
    Then 인스펙터가 500ms 이내에 표시되어야 한다
```

---

## 6. 테스트 구현 예시

### 6.1 인스펙터 기본 동작 테스트

```javascript
// tests/e2e/specs/inspector.e2e.test.js
const {
  launchBrowserWithExtension,
  openOptionsPage,
} = require('../helpers/extension-helper');
const path = require('path');

describe('접근성 인스펙터 E2E 테스트', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await launchBrowserWithExtension();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  describe('기본 동작', () => {
    test('요소 hover 시 인스펙터 패널이 표시되어야 한다', async () => {
      // 테스트 페이지 로드
      const testPagePath = path.resolve(
        __dirname,
        '../fixtures/test-pages/simple.html',
      );
      await page.goto(`file://${testPagePath}`);

      // 페이지 로드 대기
      await page.waitForSelector('h1');

      // h1 요소에 hover
      await page.hover('h1');

      // 인스펙터 패널이 표시될 때까지 대기
      await page.waitForSelector('#dkInspectPanel', {
        visible: true,
        timeout: 5000,
      });

      // 패널 내용 검증
      const panelVisible = await page.$eval(
        '#dkInspectPanel',
        (el) => el.style.display !== 'none',
      );
      expect(panelVisible).toBe(true);

      // 태그명 표시 검증
      const tagNameText = await page.$eval(
        '#dkInspectPanel .tag-name',
        (el) => el.textContent,
      );
      expect(tagNameText).toContain('H1');
    });

    test('인스펙터 패널에 접근성 정보가 표시되어야 한다', async () => {
      const testPagePath = path.resolve(
        __dirname,
        '../fixtures/test-pages/simple.html',
      );
      await page.goto(`file://${testPagePath}`);

      await page.waitForSelector('img[alt="테스트 이미지"]');
      await page.hover('img[alt="테스트 이미지"]');

      await page.waitForSelector('#dkInspectPanel', { visible: true });

      // 대체 텍스트 정보 표시 검증
      const altText = await page.$eval(
        '#dkInspectPanel .alt-text',
        (el) => el.textContent,
      );
      expect(altText).toContain('테스트 이미지');
    });
  });

  describe('키보드 단축키', () => {
    test('Shift+P로 일시정지 및 재개가 되어야 한다', async () => {
      const testPagePath = path.resolve(
        __dirname,
        '../fixtures/test-pages/simple.html',
      );
      await page.goto(`file://${testPagePath}`);

      await page.waitForSelector('h1');

      // Shift+P로 일시정지
      await page.keyboard.down('Shift');
      await page.keyboard.press('KeyP');
      await page.keyboard.up('Shift');

      // 일시정지 메시지 표시 확인
      await page.waitForSelector('#dkInspectInsertMessage', {
        visible: true,
      });
      const pauseMessage = await page.$eval(
        '#dkInspectInsertMessage',
        (el) => el.textContent,
      );
      expect(pauseMessage).toBe('일시정지');

      // 3초 후 메시지 사라짐 확인
      await page.waitForTimeout(3500);
      const messageExists = await page.$('#dkInspectInsertMessage');
      expect(messageExists).toBeNull();

      // hover 시 인스펙터가 표시되지 않음 확인
      await page.hover('h1');
      await page.waitForTimeout(500);
      const panelExists = await page.$('#dkInspectPanel');
      expect(panelExists).toBeNull();

      // Shift+P로 재개
      await page.keyboard.down('Shift');
      await page.keyboard.press('KeyP');
      await page.keyboard.up('Shift');

      // 재개 메시지 표시 확인
      await page.waitForSelector('#dkInspectInsertMessage', {
        visible: true,
      });
      const resumeMessage = await page.$eval(
        '#dkInspectInsertMessage',
        (el) => el.textContent,
      );
      expect(resumeMessage).toBe('재개');

      // hover 시 인스펙터가 다시 표시됨 확인
      await page.waitForTimeout(500);
      await page.hover('h1');
      await page.waitForSelector('#dkInspectPanel', { visible: true });
    });
  });
});
```

### 6.2 색상 대비 계산 테스트

```javascript
// tests/e2e/specs/color-contrast.e2e.test.js
const { launchBrowserWithExtension } = require('../helpers/extension-helper');
const path = require('path');

describe('색상 대비 계산 E2E 테스트', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await launchBrowserWithExtension();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  test('충분한 대비를 가진 텍스트는 AAA 등급으로 표시되어야 한다', async () => {
    // 테스트 페이지 생성
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <p style="color: #000000; background-color: #FFFFFF;">
            검은색 텍스트
          </p>
        </body>
      </html>
    `);

    await page.hover('p');
    await page.waitForSelector('#dkInspectPanel', { visible: true });

    // 대비율 표시 확인
    const contrastRatio = await page.$eval(
      '#dkInspectPanel .contrast-ratio',
      (el) => el.textContent,
    );
    expect(contrastRatio).toContain('21');

    // AAA 등급 표시 확인
    const gradeText = await page.$eval(
      '#dkInspectPanel .wcag-grade',
      (el) => el.textContent,
    );
    expect(gradeText).toContain('AAA');
  });

  test('불충분한 대비를 가진 텍스트는 Fail로 표시되어야 한다', async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <p style="color: #AAAAAA; background-color: #FFFFFF;">
            연한 회색 텍스트
          </p>
        </body>
      </html>
    `);

    await page.hover('p');
    await page.waitForSelector('#dkInspectPanel', { visible: true });

    // 대비율 확인
    const contrastRatio = await page.$eval(
      '#dkInspectPanel .contrast-ratio',
      (el) => el.textContent,
    );
    const ratio = parseFloat(contrastRatio);
    expect(ratio).toBeLessThan(4.5); // AA 기준 미달

    // Fail 상태 확인
    const gradeText = await page.$eval(
      '#dkInspectPanel .wcag-grade',
      (el) => el.textContent,
    );
    expect(gradeText).toContain('Fail');
  });

  test('투명도가 있는 색상도 정확하게 계산되어야 한다', async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body style="background-color: #FFFFFF;">
          <div style="background-color: rgba(0, 0, 0, 0.5);">
            <p style="color: #FFFFFF;">
              반투명 배경 위의 텍스트
            </p>
          </div>
        </body>
      </html>
    `);

    await page.hover('p');
    await page.waitForSelector('#dkInspectPanel', { visible: true });

    // 대비율이 계산되었는지 확인
    const contrastRatio = await page.$eval(
      '#dkInspectPanel .contrast-ratio',
      (el) => el.textContent,
    );
    expect(contrastRatio).toMatch(/\d+(\.\d+)?/);
  });
});
```

### 6.3 설정 페이지 테스트

```javascript
// tests/e2e/specs/settings.e2e.test.js
const {
  launchBrowserWithExtension,
  openOptionsPage,
} = require('../helpers/extension-helper');

describe('설정 페이지 E2E 테스트', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await launchBrowserWithExtension();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await openOptionsPage(browser);
    await page.waitForSelector('#colorType');
  });

  afterEach(async () => {
    await page.close();
  });

  describe('색상 선택기', () => {
    test('색상을 변경하고 저장할 수 있어야 한다', async () => {
      // Pickr 색상 선택기 열기
      await page.click('.pcr-button');

      // 색상 선택기가 열릴 때까지 대기
      await page.waitForSelector('.pcr-app.visible');

      // HEX 입력란에 색상 입력
      await page.waitForSelector('.pcr-result');
      await page.click('.pcr-result');
      await page.keyboard.selectAll();
      await page.keyboard.type('#FF0000');

      // 저장 버튼 클릭
      await page.click('button.pcr-save');

      // 저장 성공 메시지 확인
      await page.waitForSelector('#resStatus', { visible: true });
      const statusMessage = await page.$eval(
        '#resStatus',
        (el) => el.textContent,
      );
      expect(statusMessage).toContain('색상이 저장되었습니다');

      // Chrome Storage에 저장되었는지 확인
      const savedColor = await page.evaluate(() => {
        return new Promise((resolve) => {
          chrome.storage.local.get(['colortype'], (result) => {
            resolve(result.colortype);
          });
        });
      });
      expect(savedColor).toBe('FF0000');
    });
  });

  describe('해상도 설정', () => {
    test('유효한 해상도를 저장할 수 있어야 한다', async () => {
      // 해상도 입력
      await page.waitForSelector('#devWidth');
      await page.type('#devWidth', '1920');
      await page.type('#devHeight', '1080');

      // 저장 버튼 클릭
      await page.click('#resRegBtn');

      // 성공 메시지 확인
      await page.waitForSelector('#resStatus', { visible: true });
      const statusMessage = await page.$eval(
        '#resStatus',
        (el) => el.textContent,
      );
      expect(statusMessage).toContain('저장');

      // Chrome Storage 확인
      const savedResolution = await page.evaluate(() => {
        return new Promise((resolve) => {
          chrome.storage.local.get(['devWidth', 'devHeight'], (result) => {
            resolve(result);
          });
        });
      });
      expect(savedResolution.devWidth).toBe('1920');
      expect(savedResolution.devHeight).toBe('1080');
    });

    test('잘못된 해상도 형식은 거부되어야 한다', async () => {
      // 잘못된 값 입력
      await page.type('#devWidth', 'abc');
      await page.type('#devHeight', 'xyz');

      // 저장 버튼 클릭
      await page.click('#resRegBtn');

      // 에러 메시지 또는 저장 실패 확인
      // (실제 구현에 따라 검증 로직 조정 필요)
      const savedResolution = await page.evaluate(() => {
        return new Promise((resolve) => {
          chrome.storage.local.get(['devWidth'], (result) => {
            resolve(result.devWidth);
          });
        });
      });
      expect(savedResolution).not.toBe('abc');
    });
  });

  describe('설정 로드', () => {
    test('페이지 로드 시 저장된 설정이 표시되어야 한다', async () => {
      // Storage에 값 저장
      await page.evaluate(() => {
        chrome.storage.local.set({
          colortype: '00FF00',
          devWidth: '2560',
          devHeight: '1440',
        });
      });

      // 페이지 새로고침
      await page.reload();
      await page.waitForSelector('#colorType');

      // 색상 확인
      const colorValue = await page.evaluate(() => {
        return window.pickrInstance
          ? window.pickrInstance.getColor().toHEXA().toString()
          : null;
      });
      expect(colorValue).toContain('00FF00');

      // 해상도 확인
      const width = await page.$eval('#devWidth', (el) => el.value);
      const height = await page.$eval('#devHeight', (el) => el.value);
      expect(width).toBe('2560');
      expect(height).toBe('1440');
    });
  });
});
```

### 6.4 다양한 웹 페이지 호환성 테스트

```javascript
// tests/e2e/specs/compatibility.e2e.test.js
const { launchBrowserWithExtension } = require('../helpers/extension-helper');
const path = require('path');

describe('웹 페이지 호환성 E2E 테스트', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await launchBrowserWithExtension();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  test('정적 HTML 페이지에서 정상 동작해야 한다', async () => {
    const testPagePath = path.resolve(
      __dirname,
      '../fixtures/test-pages/simple.html',
    );
    await page.goto(`file://${testPagePath}`);

    await page.waitForSelector('h1');
    await page.hover('h1');

    await page.waitForSelector('#dkInspectPanel', { visible: true });
    const panelExists = await page.$('#dkInspectPanel');
    expect(panelExists).not.toBeNull();
  });

  test('React SPA 페이지에서 정상 동작해야 한다', async () => {
    const testPagePath = path.resolve(
      __dirname,
      '../fixtures/test-pages/spa-react.html',
    );
    await page.goto(`file://${testPagePath}`);

    // React 렌더링 완료 대기
    await page.waitForSelector('[data-testid="react-component"]', {
      timeout: 5000,
    });

    await page.hover('[data-testid="react-component"]');
    await page.waitForSelector('#dkInspectPanel', { visible: true });

    const panelExists = await page.$('#dkInspectPanel');
    expect(panelExists).not.toBeNull();
  });

  test('대규모 DOM 페이지에서도 빠르게 반응해야 한다', async () => {
    // 10,000개 요소를 가진 페이지 생성
    const largeHTML = `
      <!DOCTYPE html>
      <html>
        <body>
          ${Array.from({ length: 10000 })
            .map((_, i) => `<div class="item-${i}">Item ${i}</div>`)
            .join('')}
        </body>
      </html>
    `;
    await page.setContent(largeHTML);

    // 마지막 요소에 hover
    const startTime = Date.now();
    await page.hover('.item-9999');

    // 인스펙터 표시 대기
    await page.waitForSelector('#dkInspectPanel', {
      visible: true,
      timeout: 1000,
    });
    const endTime = Date.now();

    // 500ms 이내에 표시되어야 함
    expect(endTime - startTime).toBeLessThan(500);
  });

  test('iframe 내부 요소도 검사할 수 있어야 한다', async () => {
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <body>
          <iframe id="testFrame" srcdoc="<p id='frameContent'>Iframe 내용</p>"></iframe>
        </body>
      </html>
    `);

    // iframe 로드 대기
    await page.waitForSelector('#testFrame');
    const frame = page.frames().find((f) => f.url().includes('srcdoc'));

    // iframe 내부 요소에 hover
    await frame.waitForSelector('#frameContent');
    await frame.hover('#frameContent');

    // 인스펙터 표시 확인
    await page.waitForSelector('#dkInspectPanel', { visible: true });
  });
});
```

### 6.5 테스트 픽스처 (Test Pages)

```html
<!-- tests/e2e/fixtures/test-pages/simple.html -->
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>Simple Test Page</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        padding: 20px;
      }
      .text-block {
        color: #000000;
        background-color: #ffffff;
        padding: 10px;
      }
    </style>
  </head>
  <body>
    <h1>접근성 테스트 페이지</h1>

    <img
      src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
      alt="테스트 이미지"
    />

    <p class="text-block">이것은 충분한 대비를 가진 텍스트입니다.</p>

    <p style="color: #AAAAAA; background-color: #FFFFFF;">
      이것은 불충분한 대비를 가진 텍스트입니다.
    </p>

    <button>테스트 버튼</button>

    <a href="https://example.com">테스트 링크</a>
  </body>
</html>
```

```html
<!-- tests/e2e/fixtures/test-pages/spa-react.html -->
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <title>React SPA Test Page</title>
    <script
      crossorigin
      src="https://unpkg.com/react@18/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"
    ></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  </head>
  <body>
    <div id="root"></div>

    <script type="text/babel">
      const { useState, useEffect } = React;

      function App() {
        const [items, setItems] = useState([]);

        useEffect(() => {
          // 동적 콘텐츠 시뮬레이션
          setTimeout(() => {
            setItems([
              { id: 1, text: 'Dynamic Item 1' },
              { id: 2, text: 'Dynamic Item 2' },
              { id: 3, text: 'Dynamic Item 3' },
            ]);
          }, 100);
        }, []);

        return (
          <div>
            <h1 data-testid="react-component">React SPA Test</h1>
            <ul>
              {items.map((item) => (
                <li key={item.id} data-testid={`item-${item.id}`}>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        );
      }

      ReactDOM.render(<App />, document.getElementById('root'));
    </script>
  </body>
</html>
```

---

## 7. CI 통합 방안

### 7.1 GitHub Actions Workflow

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  pull_request:
    branches: [main, next]
  push:
    branches: [main, next]
  workflow_dispatch:

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build extension
        run: npm run build

      - name: Install Chrome
        run: |
          wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
          sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
          sudo apt-get update
          sudo apt-get install -y google-chrome-stable

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          CI: true

      - name: Upload screenshots on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-screenshots
          path: tests/e2e/screenshots/failures/
          retention-days: 7

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-test-results
          path: tests/e2e/results/
          retention-days: 30
```

### 7.2 package.json 스크립트

```json
{
  "scripts": {
    "test": "jest --config jest.config.js",
    "test:e2e": "jest --config tests/e2e/setup/jest.config.js",
    "test:e2e:headed": "HEADLESS=false jest --config tests/e2e/setup/jest.config.js",
    "test:e2e:watch": "jest --config tests/e2e/setup/jest.config.js --watch",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

### 7.3 실패 시 스크린샷 캡처

```javascript
// tests/e2e/helpers/screenshot-helper.js
const fs = require('fs');
const path = require('path');

async function captureFailureScreenshot(page, testName) {
  const screenshotDir = path.resolve(__dirname, '../screenshots/failures');

  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const filename = `${testName.replace(/\s+/g, '-')}_${timestamp}.png`;
  const filepath = path.join(screenshotDir, filename);

  await page.screenshot({
    path: filepath,
    fullPage: true,
  });

  console.log(`Screenshot saved: ${filepath}`);
}

// Jest의 afterEach에서 사용
afterEach(async () => {
  if (jasmine.testResult.failedExpectations.length > 0) {
    await captureFailureScreenshot(page, jasmine.testResult.fullName);
  }
});
```

---

## 8. 단계별 구현 계획

### Phase 1: 기본 E2E 환경 구축 (1-2주)

**Week 1: 환경 설정**

- ✅ Puppeteer 및 jest-puppeteer 설치
- ✅ 디렉터리 구조 생성
- ✅ global-setup/teardown 구현
- ✅ extension-helper 유틸리티 구현
- ✅ 첫 번째 E2E 테스트 작성 (inspector 기본 동작)

**Week 2: 핵심 시나리오 테스트**

- ✅ 인스펙터 hover 동작 테스트
- ✅ 키보드 단축키 테스트
- ✅ 색상 대비 계산 테스트
- ✅ CI 통합 (GitHub Actions)

**산출물**:

- 10-15개 E2E 테스트 케이스
- GitHub Actions workflow 파일
- 테스트 픽스처 페이지 3-5개

### Phase 2: 설정 페이지 및 호환성 테스트 (2-3주)

**Week 3: 설정 페이지 테스트**

- ✅ Pickr 색상 선택기 테스트
- ✅ 해상도 설정 테스트
- ✅ Chrome Storage 연동 테스트
- ✅ 설정 로드/저장 라이프사이클 테스트

**Week 4-5: 호환성 테스트**

- ✅ 정적 HTML 페이지 테스트
- ✅ React/Vue SPA 테스트
- ✅ 대규모 DOM 성능 테스트
- ✅ iframe 호환성 테스트

**산출물**:

- 추가 15-20개 E2E 테스트 케이스
- 다양한 테스트 픽스처 페이지
- 호환성 매트릭스 문서

### Phase 3: Visual Regression 및 성능 테스트 (3-4주)

**Week 6-7: Visual Regression Testing**

- ✅ Percy 또는 BackstopJS 설정
- ✅ 인스펙터 패널 UI 스냅샷 테스트
- ✅ 설정 페이지 UI 스냅샷 테스트
- ✅ 다크모드/라이트모드 테스트 (향후 기능)

**Week 8-9: 성능 테스트**

- ✅ Lighthouse CI 설정
- ✅ 대규모 DOM에서 성능 측정
- ✅ 메모리 누수 테스트
- ✅ CPU 사용량 프로파일링

**산출물**:

- Visual regression 테스트 10-15개
- 성능 벤치마크 리포트
- Lighthouse CI 통합

### Phase 4: 고급 시나리오 및 최적화 (4-6주)

**Week 10-12: 고급 시나리오**

- ✅ 다국어 지원 테스트
- ✅ 에러 핸들링 테스트 (제한된 URL 등)
- ✅ 업데이트 시나리오 테스트
- ✅ 데이터 마이그레이션 테스트

**Week 13-15: 최적화 및 문서화**

- ✅ 테스트 실행 시간 최적화
- ✅ 불안정한 테스트(flaky test) 제거
- ✅ 테스트 커버리지 리포트 자동화
- ✅ E2E 테스트 가이드 문서 작성

**산출물**:

- 전체 E2E 테스트 50+ 케이스
- 안정적인 CI/CD 파이프라인
- 종합 테스트 문서

---

## 9. 성공 지표

### 9.1 정량적 지표 (KPIs)

| 지표                    | 현재 | 목표               | 측정 방법                         |
| ----------------------- | ---- | ------------------ | --------------------------------- |
| **E2E 테스트 커버리지** | 0%   | 핵심 시나리오 100% | 수동 추적 (Gherkin 시나리오 기반) |
| **테스트 케이스 수**    | 0    | 50+                | Jest 리포트                       |
| **테스트 실행 시간**    | N/A  | < 5분              | GitHub Actions 타임라인           |
| **회귀 버그 검출률**    | 0%   | 80%+               | 버그 리포트 추적                  |
| **CI 성공률**           | N/A  | 95%+               | GitHub Actions 통계               |
| **Flaky Test 비율**     | N/A  | < 5%               | 재실행 필요 횟수                  |

### 9.2 정성적 지표

- ✅ 주요 기능 변경 시 자동 회귀 테스트
- ✅ 프로덕션 배포 전 E2E 테스트 통과 필수
- ✅ 신규 기능 개발 시 E2E 테스트 동시 작성 문화
- ✅ 테스트 실패 시 명확한 에러 메시지 제공

### 9.3 비용 지표

| 항목               | 비용      | 비고                     |
| ------------------ | --------- | ------------------------ |
| **Puppeteer**      | $0/월     | 오픈소스                 |
| **GitHub Actions** | $0/월     | 오픈소스 프로젝트 무제한 |
| **Percy**          | $0/월     | 오픈소스 플랜            |
| **Lighthouse CI**  | $0/월     | 무료                     |
| **총 비용**        | **$0/월** | 완전 무료                |

---

## 10. 리스크 및 대응 방안

### 10.1 기술적 리스크

| 리스크                                           | 확률 | 영향도 | 대응 방안                                      |
| ------------------------------------------------ | ---- | ------ | ---------------------------------------------- |
| **Puppeteer headless 모드에서 Extension 미지원** | 높음 | 높음   | Headful 모드 사용, Xvfb로 가상 디스플레이 구성 |
| **CI 환경에서 Chrome 설치 실패**                 | 중간 | 높음   | Docker 이미지 사용 또는 설치 스크립트 견고화   |
| **테스트 실행 시간 과다**                        | 중간 | 중간   | 병렬 실행, 캐싱, 테스트 분할                   |
| **Flaky tests 발생**                             | 높음 | 중간   | 명시적 대기, 재시도 로직, 안정화 기간          |
| **Visual regression 차이 오탐**                  | 중간 | 낮음   | 임계값 조정, 동적 콘텐츠 마스킹                |

### 10.2 프로세스 리스크

| 리스크                             | 확률 | 영향도 | 대응 방안                              |
| ---------------------------------- | ---- | ------ | -------------------------------------- |
| **개발자가 E2E 테스트 작성 안 함** | 중간 | 높음   | PR 체크리스트 추가, 코드 리뷰 강화     |
| **테스트 유지보수 부담**           | 중간 | 중간   | 명확한 테스트 구조, 재사용 가능한 헬퍼 |
| **테스트 문서 업데이트 누락**      | 높음 | 낮음   | 문서화 자동화, PR 템플릿               |

---

## 11. 참고 자료

### 11.1 공식 문서

- [Puppeteer 공식 문서](https://pptr.dev/)
- [Jest Puppeteer 가이드](https://github.com/smooth-code/jest-puppeteer)
- [Chrome Extension Testing 가이드](https://developer.chrome.com/docs/extensions/mv3/test/)
- [Percy Visual Testing](https://percy.io/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

### 11.2 예제 프로젝트

- [Chrome Extension E2E Example](https://github.com/GoogleChrome/chrome-extensions-samples)
- [Puppeteer Examples](https://github.com/puppeteer/puppeteer/tree/main/examples)

### 11.3 모범 사례

- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [E2E Testing Anti-patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## 12. 부록

### 12.1 유용한 Puppeteer 패턴

```javascript
// 요소가 나타날 때까지 대기 (최대 5초)
await page.waitForSelector('#element', { visible: true, timeout: 5000 });

// 요소가 사라질 때까지 대기
await page.waitForSelector('#element', { hidden: true });

// 네트워크 idle 상태까지 대기
await page.goto('https://example.com', { waitUntil: 'networkidle2' });

// 커스텀 조건까지 대기
await page.waitForFunction(
  () => document.querySelector('#data').innerText !== 'Loading...',
);

// Chrome Storage 읽기
const data = await page.evaluate(() => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['key'], (result) => resolve(result.key));
  });
});

// 스크린샷 캡처
await page.screenshot({ path: 'screenshot.png', fullPage: true });

// 콘솔 로그 캡처
page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));

// 네트워크 요청 인터셉트
await page.setRequestInterception(true);
page.on('request', (request) => {
  if (request.url().includes('analytics')) {
    request.abort();
  } else {
    request.continue();
  }
});
```

### 12.2 Chrome Extension 특화 유틸리티

```javascript
/**
 * Extension ID 가져오기
 */
async function getExtensionId(browser) {
  const targets = await browser.targets();
  const extensionTarget = targets.find(
    (target) => target.type() === 'service_worker',
  );
  const extensionUrl = extensionTarget.url() || '';
  return extensionUrl.split('/')[2];
}

/**
 * Background Service Worker 페이지 가져오기
 */
async function getBackgroundPage(browser) {
  const targets = await browser.targets();
  const backgroundTarget = targets.find(
    (target) => target.type() === 'service_worker',
  );
  return await backgroundTarget.page();
}

/**
 * Content Script 실행 대기
 */
async function waitForContentScript(page, scriptName) {
  await page.waitForFunction(
    (name) => window[name] !== undefined,
    {},
    scriptName,
  );
}

/**
 * Chrome Storage 초기화
 */
async function clearChromeStorage(page) {
  await page.evaluate(() => {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => resolve());
    });
  });
}
```

### 12.3 디버깅 팁

```javascript
// Headful 모드로 실행 (브라우저 UI 표시)
const browser = await puppeteer.launch({
  headless: false,
  devtools: true, // DevTools 자동 열기
  slowMo: 50, // 액션 사이에 50ms 지연 (디버깅용)
});

// 페이지 상태 덤프
await page.evaluate(() => {
  console.log({
    title: document.title,
    url: window.location.href,
    elements: document.querySelectorAll('*').length,
    storage: localStorage,
  });
});

// 실패 시 HTML 덤프
if (testFailed) {
  const html = await page.content();
  fs.writeFileSync('failure-page.html', html);
}

// 네트워크 활동 로깅
page.on('request', (request) =>
  console.log('>>', request.method(), request.url()),
);
page.on('response', (response) =>
  console.log('<<', response.status(), response.url()),
);
```

---

## 📌 다음 단계

1. ✅ **Phase 1 시작**: Puppeteer 설치 및 기본 환경 구축
2. ✅ **첫 E2E 테스트 작성**: 인스펙터 hover 동작 테스트
3. ✅ **CI 통합**: GitHub Actions에 E2E 워크플로우 추가
4. ⏳ **지속적 확장**: 나머지 시나리오 순차적으로 추가

**예상 완료 시점**: 3-4개월 (Phase 1-4 완료)
**즉시 시작 가능한 작업**: Phase 1 환경 구축 (1-2일 소요)

---

**문서 버전**: 1.0
**최종 수정일**: 2025-11-18
**작성자**: Claude (AI Assistant)
**검토자**: TBD
