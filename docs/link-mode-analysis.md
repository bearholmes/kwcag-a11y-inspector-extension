# 링크 모드 대상 엘리먼트 분석

## 상수 정의

### 인터랙티브 요소 (src/content/inspector/constants.ts:155-158)

```typescript
// 직접 상호작용 가능한 요소
INTERACTIVE_ELEMENTS: ['a', 'button', 'input', 'area'];

// 부모 요소로 인정되는 상호작용 요소 (area 제외)
PARENT_INTERACTIVE_ELEMENTS: ['a', 'button', 'input'];
```

## 링크모드별 동작 방식

### 1. 링크 모드 ON (분리형 선택자 + 인터랙티브 요소로 한정)

#### 자동 설정

- **trackingmode**: `true` (자동 활성화)
- **배경 옵션**: 사용 가능

#### 대상 요소 판정 로직 (src/content/inspector/event-handlers.ts:172-191)

```typescript
if (String(opt.linkmode) === '1') {
  const tagName = this.tagName.toLowerCase();
  const isInteractive = ['a', 'button', 'input', 'area'].includes(tagName);

  if (isInteractive) {
    // 현재 요소가 a, button, input, area → 현재 요소에 outline
    targetElement = this;
  } else if (부모가[('a', 'button', 'input')]) {
    // 부모가 a, button, input → 부모에 outline
    targetElement = this.parentElement;
  } else {
    // 둘 다 아니면 → outline 없음
    shouldShowOutline = false;
  }
}
```

#### 동작 예시

| HTML 구조                  | 마우스 위치 | 결과                          |
| -------------------------- | ----------- | ----------------------------- |
| `<button>클릭</button>`    | button      | button에 tracking div 표시 ✅ |
| `<a><span>링크</span></a>` | span        | 부모 a에 tracking div 표시 ✅ |
| `<div>일반 요소</div>`     | div         | tracking div 없음 ❌          |
| `<area>`                   | area        | tracking div 표시 ✅          |

### 2. 링크 모드 OFF (모든 요소)

#### 자동 설정

- **trackingmode**: `false` (자동 비활성화)
- **배경 옵션**: 사용 불가 (비활성화)

#### 대상 요소

- body를 제외한 모든 HTML 요소
- 분리형 선택자(tracking div) 사용 안 함
- 일반 outline만 사용

#### 동작 예시

| HTML 구조                | 마우스 위치 | 결과            |
| ------------------------ | ----------- | --------------- |
| `<div>`, `<span>`, `<p>` | 모든 요소   | outline 표시 ✅ |
| `<button>`, `<a>`        | 모든 요소   | outline 표시 ✅ |

## Tracking 모드 동작 (링크모드 ON일 때)

### Tracking Div 표시 조건 (src/content/inspector/event-handlers.ts:133-158)

```typescript
if (opt.trackingmode) {
  let targetElement: HTMLElement = this;
  const tagName = this.tagName.toLowerCase();
  const isInteractive = CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName);

  if (!isInteractive && this.parentElement) {
    const parentTagName = this.parentElement.nodeName.toLowerCase();
    const isParentInteractive =
      CONSTANTS.PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName);

    if (isParentInteractive) {
      // 부모가 interactive면 부모를 추적
      targetElement = this.parentElement;
    }
  }

  // tracking div 크기/위치 업데이트
  trackingEl!.style.width = `${getWidth(targetElement)}px`;
  trackingEl!.style.height = `${getHeight(targetElement)}px`;
  trackingEl!.style.left = `${getLeft(targetElement)}px`;
  trackingEl!.style.top = `${getTop(targetElement)}px`;
  trackingEl!.style.display = 'block';
}
```

### 정보 팝업 표시 조건 (src/content/inspector/event-handlers.ts:286-304)

```typescript
if (opt.trackingmode) {
  const tagName = this.tagName.toLowerCase();
  const parentTagName = this.parentElement?.nodeName.toLowerCase();

  if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
    // a, button, input, area → 현재 요소 정보 표시
    showElementInfo();
  } else {
    // 그 외 요소 → 정보 숨김
    block.style.display = 'none';
  }

  if (PARENT_INTERACTIVE_ELEMENTS.includes(parentTagName)) {
    // 부모가 a, button, input → 부모 정보 표시
    showParentInfo();
    trackingEl!.style.display = 'block';
  }
}
```

## 비교 요약

| 항목               | 링크 모드 ON                                                     | 링크 모드 OFF           |
| ------------------ | ---------------------------------------------------------------- | ----------------------- |
| **대상 엘리먼트**  | `a`, `button`, `input`, `area`<br/>+ 이들의 자식 요소(부모 추적) | 모든 요소 (body 제외)   |
| **Tracking 모드**  | 자동 활성화 (`true`)                                             | 자동 비활성화 (`false`) |
| **선택자 형태**    | 분리형 선택자 (tracking div)                                     | 일반 outline            |
| **배경색 옵션**    | 사용 가능                                                        | 사용 불가 (비활성화)    |
| **부모 요소 추적** | ✅ 지원                                                          | ❌ 미지원               |

## 특이사항

### 1. area 요소 처리

- `area` 요소는 INTERACTIVE_ELEMENTS에는 포함되지만
- PARENT_INTERACTIVE_ELEMENTS에는 제외됨
- 따라서 area의 자식 요소는 부모 추적 안 됨

### 2. 부모 요소 추적 범위

- 링크모드 ON에서 자식 요소 hover 시
- 부모가 `a`, `button`, `input`이면 부모를 추적
- 부모가 `area`이면 추적 안 됨 (PARENT_INTERACTIVE_ELEMENTS 제외)

### 3. 중복 처리 방지

- `lastHoveredElement`를 사용하여 중복 업데이트 방지
- Tracking 모드에서는 `targetElement`(부모)를 lastHoveredElement로 설정
- 같은 부모 내에서 자식 간 이동 시에도 추적 유지

## 설정 저장 로직 (src/options/settings.ts:636-661)

```typescript
// 링크 모드에 따라 trackingmode 자동 설정
const trackingmode = lm_sw === STATE_ENABLED;

// 링크 모드가 OFF일 때는 배경 모드도 OFF로 설정
const finalBgMode = lm_sw === STATE_ENABLED ? bg_sw : false;

const settingsData = {
  linkmode: lm_sw,
  trackingmode: trackingmode, // 자동 설정
  bgmode: finalBgMode, // 자동 설정
  // ...
};
```
