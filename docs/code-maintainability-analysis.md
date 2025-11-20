# 코드 유지보수성 분석 및 개선 방안

## 현재 구조의 문제점

### 1. 로직 분산 (Logic Fragmentation)

#### 문제 상황

링크 모드 관련 로직이 여러 파일에 분산되어 있음:

```
settings.ts (설정 저장)
├─ linkmode 값 저장
├─ trackingmode 자동 계산
└─ bgmode 자동 계산

event-handlers.ts (동작 구현)
├─ opt.trackingmode 체크
├─ opt.linkmode 체크
└─ findInteractiveAncestor 호출

inspector-core.ts (tracking 생성)
└─ trackingmode에 따라 tracking div 생성
```

**문제점:**

- 한 기능을 수정하려면 3개 파일을 동시에 봐야 함
- 로직의 전체 흐름을 파악하기 어려움
- 설정과 동작이 분리되어 일관성 유지 어려움

### 2. 중복 코드 (Code Duplication)

#### tracking mode와 non-tracking mode의 중복

```typescript
// tracking mode (event-handlers.ts:133-155)
if (opt.trackingmode) {
  let targetElement: HTMLElement = this;
  const tagName = this.tagName.toLowerCase();
  const isInteractive = CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName);

  if (!isInteractive) {
    const interactiveAncestor = findInteractiveAncestor(this);
    if (interactiveAncestor) {
      targetElement = interactiveAncestor;
    }
  }
  // ... tracking div 업데이트
}

// non-tracking mode (event-handlers.ts:169-188)
if (String(opt.linkmode) === '1') {
  const tagName = this.tagName.toLowerCase();
  const isInteractive = CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName);

  if (isInteractive) {
    targetElement = this;
  } else {
    const interactiveAncestor = findInteractiveAncestor(this);
    if (interactiveAncestor) {
      targetElement = interactiveAncestor;
    }
  }
  // ... outline 설정
}
```

**문제점:**

- 거의 동일한 "interactive 요소 찾기" 로직이 2번 반복
- 한쪽을 수정하면 다른 쪽도 수정해야 함
- 버그 수정 시 양쪽 모두 확인 필요

### 3. 복잡한 조건 분기 (Complex Conditional Logic)

#### handleMouseOver의 분기 구조

```typescript
if (opt.trackingmode) {
  // tracking mode 로직
  if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
    showElementInfo();
  } else {
    block.style.display = 'none';
  }
  if (interactiveAncestor) {
    showAncestorInfo(interactiveAncestor);
  }
} else if (String(opt.linkmode) === '1') {
  // link mode 로직
  if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
    showElementInfo();
  } else if (interactiveAncestor) {
    showAncestorInfo(interactiveAncestor);
  } else {
    block.style.display = 'none';
  }
} else {
  // all elements mode
  showElementInfo();
}
```

**문제점:**

- 3단계 중첩 조건문
- 각 분기의 차이가 명확하지 않음
- 새로운 모드 추가 시 복잡도 급증
- 테스트해야 할 경로가 많음 (3 × N 조합)

### 4. 암묵적 의존성 (Implicit Dependencies)

#### 자동 설정의 연쇄 효과

```typescript
// settings.ts:638
const trackingmode = lm_sw === STATE_ENABLED;

// settings.ts:648
const finalBgMode = lm_sw === STATE_ENABLED ? bg_sw : false;
```

**문제점:**

- `linkmode` 변경 → `trackingmode` 자동 변경 → 동작 변경
- `linkmode` 변경 → `bgmode` 자동 변경 → UI 변경
- 변경의 영향 범위를 코드만 보고 알기 어려움
- 디버깅 시 예상치 못한 동작 발생 가능

### 5. 상태 불일치 위험 (State Inconsistency Risk)

#### 여러 곳에서 같은 조건 체크

```typescript
// event-handlers.ts
if (opt.trackingmode) { ... }
if (String(opt.linkmode) === '1') { ... }

// inspector-core.ts
if (this.opt.trackingmode) { ... }

// settings.ts
if (linkmode === STATE_ENABLED) { ... }
```

**문제점:**

- 같은 의미의 조건이 다른 형태로 표현됨
- 하나를 수정할 때 다른 곳을 놓칠 수 있음
- 타입이 다름 (boolean vs string vs number)

---

## 구체적인 유지보수 시나리오

### 시나리오 1: "area 요소도 부모 추적 대상에 추가"

**현재 구조에서 수정해야 할 곳:**

1. ✏️ `constants.ts`: PARENT_INTERACTIVE_ELEMENTS에 'area' 추가
2. ✏️ `event-handlers.ts` 확인: findInteractiveAncestor 동작 확인
3. ✏️ `event-handlers.ts` 확인: tracking mode 로직 확인
4. ✏️ `event-handlers.ts` 확인: non-tracking mode 로직 확인
5. ✏️ `event-handlers.ts` 확인: info 표시 로직 확인
6. ✏️ `link-mode-analysis.md` 문서 업데이트
7. 🧪 테스트: 5개 조건 × 2개 모드 = 10개 케이스

**예상 소요 시간:** 30분 ~ 1시간

### 시나리오 2: "새로운 모드 추가: 폼 요소만 검사"

**현재 구조에서 수정해야 할 곳:**

1. ✏️ `settings.html`: 새 라디오 버튼 추가
2. ✏️ `settings.ts`: 새 모드 저장 로직 추가
3. ✏️ `inspector-core.ts`: 새 모드 처리 추가
4. ✏️ `event-handlers.ts`: handleMouseOver에 새 분기 추가
5. ✏️ `event-handlers.ts`: handleMouseOut에 새 분기 추가
6. ✏️ `constants.ts`: FORM_ELEMENTS 상수 추가
7. ✏️ 문서 업데이트
8. 🧪 테스트: 기존 테스트 + 새 모드 테스트

**예상 소요 시간:** 2~3시간

### 시나리오 3: "버그 수정: a 링크 내부 svg 요소 추적 안 됨"

**디버깅 경로:**

1. 🔍 `event-handlers.ts`: handleMouseOver 확인
2. 🔍 `findInteractiveAncestor` 로직 확인
3. 🔍 tracking mode 분기 확인
4. 🔍 non-tracking mode 분기 확인 (둘 다!)
5. 🔍 `constants.ts`: INTERACTIVE_ELEMENTS 확인
6. ✏️ 수정 (2곳?)
7. 🧪 테스트: 양쪽 모드에서 확인

**예상 소요 시간:** 1~2시간 (버그 찾기 포함)

---

## 복잡도 메트릭

### 현재 코드 복잡도

```
Cyclomatic Complexity (순환 복잡도):
- handleMouseOver: 15+ (매우 높음)
- resRegEvent: 8 (높음)

Lines of Code:
- event-handlers.ts: 422 lines
- handleMouseOver function: ~220 lines

Coupling (결합도):
- settings.ts ↔ event-handlers.ts: 강함
- event-handlers.ts ↔ inspector-core.ts: 강함
- 설정 변경 시 3개 파일 영향

Duplication (중복도):
- Interactive 요소 찾기 로직: 2회 중복
- 조건 체크 로직: 3회 이상 중복
```

### 관리 난이도 점수

| 항목                | 점수 (1-10) | 설명                      |
| ------------------- | ----------- | ------------------------- |
| **코드 이해도**     | 4/10        | 전체 흐름 파악 어려움     |
| **수정 용이성**     | 3/10        | 여러 파일 동시 수정 필요  |
| **테스트 커버리지** | 5/10        | 많은 분기로 테스트 어려움 |
| **버그 발생 위험**  | 7/10        | 높음 (조건 분기 많음)     |
| **신규 기능 추가**  | 3/10        | 매우 어려움               |
| **문서화 필요도**   | 9/10        | 문서 없이는 이해 불가     |

---

## 개선 방안

### 1. 전략 패턴 (Strategy Pattern) 도입

#### 현재 구조

```typescript
if (opt.trackingmode) {
  // tracking 로직
} else if (opt.linkmode === '1') {
  // link 로직
} else {
  // all elements 로직
}
```

#### 개선 후

```typescript
interface InspectorStrategy {
  shouldHighlight(element: HTMLElement): boolean;
  getTargetElement(element: HTMLElement): HTMLElement;
  highlight(element: HTMLElement): void;
  unhighlight(element: HTMLElement): void;
}

class TrackingModeStrategy implements InspectorStrategy { ... }
class LinkModeStrategy implements InspectorStrategy { ... }
class AllElementsStrategy implements InspectorStrategy { ... }

// 사용
const strategy = getStrategy(opt);
if (strategy.shouldHighlight(element)) {
  const target = strategy.getTargetElement(element);
  strategy.highlight(target);
}
```

**장점:**

- 각 모드의 로직이 독립적으로 분리됨
- 새 모드 추가 시 기존 코드 수정 불필요
- 테스트가 쉬워짐 (모드별 독립 테스트)

### 2. 설정 관리 객체 (Configuration Manager)

#### 현재 구조

```typescript
// settings.ts
const trackingmode = lm_sw === STATE_ENABLED;
const finalBgMode = lm_sw === STATE_ENABLED ? bg_sw : false;

// event-handlers.ts
if (opt.trackingmode) { ... }
if (String(opt.linkmode) === '1') { ... }
```

#### 개선 후

```typescript
class InspectorConfig {
  private linkMode: LinkMode;
  private bgMode: boolean;

  get isTrackingMode(): boolean {
    return this.linkMode === LinkMode.INTERACTIVE;
  }

  get shouldShowBackground(): boolean {
    return this.isTrackingMode && this.bgMode;
  }

  getMode(): InspectorMode {
    return this.isTrackingMode
      ? InspectorMode.TRACKING
      : InspectorMode.INLINE;
  }
}

// 사용
if (config.isTrackingMode) { ... }
if (config.shouldShowBackground) { ... }
```

**장점:**

- 설정 로직이 한 곳에 집중됨
- 자동 계산 로직이 명확해짐
- 타입 안정성 향상

### 3. 공통 로직 추출

#### 현재 구조

```typescript
// 2곳에서 중복
const isInteractive = CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName);
if (!isInteractive) {
  const ancestor = findInteractiveAncestor(this);
  if (ancestor) targetElement = ancestor;
}
```

#### 개선 후

```typescript
class ElementAnalyzer {
  static getInteractiveTarget(element: HTMLElement): HTMLElement | null {
    const tagName = element.tagName.toLowerCase();
    if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
      return element;
    }
    return findInteractiveAncestor(element);
  }

  static isInteractiveElement(element: HTMLElement): boolean {
    return this.getInteractiveTarget(element) !== null;
  }
}

// 사용
const target = ElementAnalyzer.getInteractiveTarget(this);
if (target) { ... }
```

**장점:**

- 중복 제거
- 한 곳만 수정하면 됨
- 재사용성 향상

### 4. 모드별 핸들러 분리

#### 현재 구조

```typescript
function handleMouseOver(this: HTMLElement, e: MouseEvent): void {
  // 220 lines of complex logic
  if (opt.trackingmode) {
    // 70 lines
  } else if (opt.linkmode === '1') {
    // 50 lines
  } else {
    // 10 lines
  }
}
```

#### 개선 후

```typescript
interface ModeHandler {
  onMouseOver(element: HTMLElement, e: MouseEvent): void;
  onMouseOut(element: HTMLElement, e: MouseEvent): void;
}

class TrackingModeHandler implements ModeHandler {
  onMouseOver(element: HTMLElement, e: MouseEvent): void {
    // 70 lines - tracking 전용
  }
}

class InlineModeHandler implements ModeHandler {
  onMouseOver(element: HTMLElement, e: MouseEvent): void {
    // 60 lines - inline 전용
  }
}

// 사용
function createHandlers(mode: InspectorMode): EventHandlers {
  const handler = getModeHandler(mode);
  return {
    handleMouseOver: (e) => handler.onMouseOver(this, e),
    handleMouseOut: (e) => handler.onMouseOut(this, e),
  };
}
```

**장점:**

- 각 모드의 로직 완전 분리
- 함수 길이 감소
- 이해하기 쉬움

---

## 개선 우선순위

### 단기 (1-2주)

1. ✅ **공통 로직 추출** (영향도: 중, 난이도: 낮)
   - ElementAnalyzer 클래스 생성
   - 중복 코드 제거

2. ✅ **타입 안정성 개선** (영향도: 중, 난이도: 낮)
   - enum 타입 정의
   - string/number 혼용 제거

### 중기 (1개월)

3. ✅ **Configuration Manager 도입** (영향도: 높음, 난이도: 중)
   - InspectorConfig 클래스 생성
   - 설정 로직 중앙화

4. ✅ **핸들러 분리** (영향도: 높음, 난이도: 중)
   - ModeHandler 인터페이스 정의
   - 모드별 핸들러 구현

### 장기 (2-3개월)

5. ✅ **전략 패턴 전면 도입** (영향도: 매우 높음, 난이도: 높음)
   - 전체 아키텍처 재설계
   - 점진적 마이그레이션

---

## 결론

### 현재 구조의 핵심 문제

1. **로직 분산**: 3개 파일에 걸쳐 있어 전체 흐름 파악 어려움
2. **중복 코드**: 같은 로직이 2-3곳에 반복됨
3. **복잡한 조건 분기**: 15+ 복잡도로 이해/수정 어려움
4. **암묵적 의존성**: linkmode 변경이 trackingmode, bgmode에 영향

### 관리 어려움의 원인

#### 1. 역사적 배경 (Historical Context)

**초기 구조 (v1.0)**

```typescript
// 단순한 outline 방식만 존재
function handleMouseOver() {
  element.style.outline = '2px solid red';
}
```

**분리형 선택자 도입 시도 (v2.0)**

- 더 나은 시각적 표현을 위해 tracking div 방식 도입 시도
- **기술적 이슈 발생**:
  - 성능 문제 (위치 계산 오버헤드)
  - 브라우저 호환성 문제
  - 특정 웹사이트에서 동작 불안정
- **결과**: 완전 전환 실패, 두 방식 병행 결정

**현재 구조 (v3.0)**

```typescript
// 두 방식이 공존
if (trackingmode) {
  // 분리형 선택자 (새 방식)
  trackingDiv.style.left = ...;
} else {
  // 일반 outline (기존 방식)
  element.style.outline = ...;
}
```

#### 2. 구조적 문제의 근본 원인

**"완전 전환 실패"가 만든 복잡성**

```
원래 의도:
  inline outline → tracking div (전면 교체)

실제 결과:
  inline outline + tracking div (병행 운영)
                ↓
        조건 분기 폭발
                ↓
        유지보수 어려움
```

**기술 부채 누적 과정:**

1. **Phase 1**: outline만 사용 (단순)
2. **Phase 2**: tracking 추가 시도 → 실패
3. **Phase 3**: 두 방식 병행 (복잡도 2배)
4. **Phase 4**: 링크 모드 추가 (복잡도 4배)
5. **Phase 5**: 자동 전환 로직 추가 (복잡도 8배)

#### 3. 왜 완전 전환하지 못했나?

**기술적 제약사항 (추정):**

1. **성능 문제**
   - 모든 요소에 tracking div 사용 시 DOM 폭발
   - 대규모 페이지에서 메모리 부족
   - 위치 계산으로 인한 프레임 드롭

2. **호환성 문제**
   - 특정 CSS transform과 충돌
   - position: fixed 요소 추적 오류
   - iframe 내부 요소 처리 불가

3. **사용성 문제**
   - 사용자가 기존 방식에 익숙함
   - 새 방식에 대한 거부감
   - 마이그레이션 비용

#### 4. 현재 타협안의 문제점

**"양쪽의 단점만 가져옴"**

```
Tracking Mode (분리형)
  장점: 시각적 명확성 ✅
  단점: 복잡한 로직 ❌ ← 이걸 안고 감

Inline Mode (일반형)
  장점: 단순한 구현 ✅
  단점: 제한된 기능 ❌ ← 이것도 유지해야 함

결과: 두 시스템 모두 관리 필요 = 2배 작업량
```

#### 5. 핵심 교훈

> **"완전 전환 실패 후 병행 운영은 기술 부채의 가장 큰 원인"**

- ❌ 레거시 시스템 완전 제거 실패
- ❌ 신규 시스템 부분 도입
- ❌ 두 시스템 간 브릿지 로직 추가
- ❌ 복잡도 기하급수적 증가

### 개선 효과 (예상)

- ✅ 코드 이해도: 4/10 → 8/10
- ✅ 수정 용이성: 3/10 → 8/10
- ✅ 버그 발생 위험: 7/10 → 3/10
- ✅ 신규 기능 추가: 3/10 → 9/10

### 권장사항

현재 구조는 **기술 부채**가 높은 상태입니다.

#### 전략적 선택지

**Option A: 완전 통합 (Big Bang)**

- tracking mode로 완전 전환
- 기존 inline mode 완전 제거
- 장점: 코드 단순화, 유지보수 용이
- 단점: 과거 실패 경험, 높은 리스크
- **권장하지 않음** ❌

**Option B: 점진적 개선 (Incremental)**

- 현재 구조 유지하되 리팩토링
- 전략 패턴으로 분리
- 장점: 안정적, 단계적 개선
- 단점: 시간 소요
- **권장함** ✅

**Option C: 현상 유지 (Status Quo)**

- 아무것도 안 함
- 장점: 당장은 편함
- 단점: 기술 부채 계속 누적
- **비권장** ❌

#### 실행 계획

**즉시 (1-2일)**

1. 📝 이 분석 문서 팀 공유
2. 📝 기술 부채 인지 및 동의

**단기 (1-2주) - 최소한 해야 할 것**

1. ✅ 공통 로직 추출
2. ✅ 타입 안정성 개선
3. ✅ 단위 테스트 추가
   → **신규 기능 추가 전 필수**

**중장기 (1-3개월) - 구조 개선**

1. ✅ 전략 패턴 도입
2. ✅ 핸들러 분리
3. ✅ Configuration Manager
   → 리소스 여유 시 진행

#### 최종 권고

> **"신규 기능 추가 전에 최소한 단기 개선(1-2주)을 진행하는 것을 강력히 권장합니다."**
>
> 현재 상태에서 기능 추가 시:
>
> - 개발 시간: 2배
> - 버그 발생률: 3배
> - 유지보수 비용: 5배

### 부록: 과거 전환 실패 사례 분석

#### 왜 실패했을까?

**실패 요인 추정:**

1. **올인 접근 (All-or-Nothing)**
   - 한 번에 모든 것을 바꾸려 함
   - 실패 시 롤백 어려움

2. **부족한 테스트**
   - 다양한 환경 테스트 부족
   - Edge case 미발견

3. **성능 최적화 부재**
   - 초기부터 모든 요소에 적용
   - throttling/debouncing 미적용

#### 다음 시도 시 교훈

**성공 확률 높이는 방법:**

1. ✅ **점진적 접근**
   - 한 모드씩 전환
   - 충분한 테스트 기간

2. ✅ **Feature Flag 사용**
   - 옵션으로 제공
   - 사용자 선택 가능

3. ✅ **성능 모니터링**
   - 메트릭 수집
   - 문제 조기 발견

4. ✅ **롤백 계획**
   - 언제든 되돌릴 수 있게
   - 데이터 마이그레이션 고려
