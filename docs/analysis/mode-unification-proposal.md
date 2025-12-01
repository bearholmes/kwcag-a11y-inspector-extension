# 인스펙터 모드 통합 및 단순화 방안

## 문제 인식

### 현재 구조의 복잡성

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

### 핵심 발견: 실제로는 두 가지 모드만 존재

```typescript
// 현재: 3개 설정이 복잡하게 얽혀있음
linkmode: '0' | '1'           // 어떤 요소를 대상으로?
trackingmode: boolean         // 어떻게 렌더링?
bgmode: boolean              // 배경 표시?

// 실제로는:
Mode 1: 링크모드 ON  = trackingmode:true  + interactive elements + bgmode 가능
Mode 2: 링크모드 OFF = trackingmode:false + all elements        + bgmode 불가
```

**현재 3개의 설정이 실제로는 1개의 모드 선택에 종속됨**

## 단순화 방안

### 방안 1: 단일 Enum으로 통합 (가장 단순)

#### 구조

```typescript
// src/content/inspector/types.ts (새 파일)
export enum InspectorMode {
  INTERACTIVE = 'interactive', // 링크모드 ON
  ALL_ELEMENTS = 'all', // 링크모드 OFF
}

export interface InspectorOptions {
  mode: InspectorMode; // ✅ 단일 진실의 원천
  enableBackground: boolean; // interactive 모드에서만 유효
  stdpx: number;
  linetype: string;
  colortype: string;
  bordersize: string | number;
}

// 파생 속성은 getter로
class InspectorConfig {
  constructor(private options: InspectorOptions) {}

  get isInteractiveMode(): boolean {
    return this.options.mode === InspectorMode.INTERACTIVE;
  }

  get useTrackingDiv(): boolean {
    return this.isInteractiveMode; // 자동으로 결정됨
  }

  get showBackground(): boolean {
    return this.isInteractiveMode && this.options.enableBackground;
  }

  get targetElements(): readonly string[] {
    return this.isInteractiveMode ? CONSTANTS.INTERACTIVE_ELEMENTS : ['*']; // 모든 요소
  }
}
```

#### 장점

- ✅ 설정 1개로 줄어듦 (linkmode만 남음)
- ✅ trackingmode는 자동 파생
- ✅ 조건 분기 단순화
- ✅ 타입 안정성 향상

#### 단점

- ⚠️ 기존 storage 데이터 마이그레이션 필요
- ⚠️ 전체 코드베이스 수정 필요 (리스크 높음)

---

### 방안 2: Configuration Manager 패턴 (권장)

#### 구조

```typescript
// src/content/inspector/config-manager.ts (새 파일)
export class InspectorConfigManager {
  private mode: 'interactive' | 'all';
  private bgEnabled: boolean;

  constructor(linkmode: string, bgmode: boolean) {
    this.mode = linkmode === '1' ? 'interactive' : 'all';
    this.bgEnabled = bgmode;
  }

  // 모든 조건 로직이 한 곳에 집중
  isTrackingMode(): boolean {
    return this.mode === 'interactive';
  }

  shouldShowBackground(): boolean {
    return this.mode === 'interactive' && this.bgEnabled;
  }

  shouldTargetElement(element: HTMLElement): boolean {
    if (this.mode === 'all') return true;

    const tagName = element.tagName.toLowerCase();
    return CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName);
  }

  getTargetElement(element: HTMLElement): HTMLElement | null {
    if (this.mode === 'all') return element;

    // interactive 모드: 조상 검색
    const tagName = element.tagName.toLowerCase();
    if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
      return element;
    }
    return findInteractiveAncestor(element);
  }

  // settings.ts에서 저장 시 사용
  toStorageData(): {
    linkmode: number;
    trackingmode: boolean;
    bgmode: boolean;
  } {
    return {
      linkmode: this.mode === 'interactive' ? 1 : 0,
      trackingmode: this.mode === 'interactive', // 자동 계산
      bgmode: this.shouldShowBackground(), // 자동 계산
    };
  }
}
```

#### 사용 예시

**settings.ts에서:**

```typescript
function resRegEvent(): void {
  const lm_sw = getCheckBoxValue('linkMode', STATE_ENABLED, STATE_DISABLED);
  const bg_sw = getCheckBoxValue('bgMode', true, false);

  const config = new InspectorConfigManager(
    lm_sw === STATE_ENABLED ? '1' : '0',
    bg_sw,
  );

  // 저장
  const settingsData = {
    ...config.toStorageData(), // ✅ linkmode, trackingmode, bgmode 자동 계산
    linetype,
    colortype,
    bordersize,
  };
}
```

**event-handlers.ts에서:**

```typescript
export function createEventHandlers(
  opt: InspectorOptions,
  config: InspectorConfigManager, // ✅ config 주입
): EventHandlers {
  function handleMouseOver(this: HTMLElement, e: MouseEvent): void {
    // ❌ 기존: 복잡한 조건문
    // if (opt.trackingmode) { ... }
    // else if (String(opt.linkmode) === '1') { ... }
    // else { ... }

    // ✅ 개선: 단순화
    const target = config.getTargetElement(this);
    if (!target) return;

    if (config.isTrackingMode()) {
      updateTrackingDiv(target);
    } else {
      updateInlineOutline(target);
    }
  }
}
```

#### 장점

- ✅ 기존 코드 구조 유지 (점진적 개선)
- ✅ 조건 로직을 한 곳에 집중
- ✅ 타입 안정성 향상
- ✅ 테스트 용이
- ✅ 리스크 낮음
- ✅ 기존 storage 포맷 유지 (마이그레이션 불필요)

#### 적용 범위

```
1. src/content/inspector/config-manager.ts 생성
2. settings.ts 수정 (InspectorConfigManager 사용)
3. event-handlers.ts 수정 (config 주입)
4. inspector-core.ts 수정 (config 전달)
```

#### 예상 작업 시간

- **2-3일** (점진적 적용 가능)

---

### 방안 3: Strategy Pattern (가장 강력하지만 복잡)

#### 구조

```typescript
// src/content/inspector/strategies.ts (새 파일)
interface HighlightStrategy {
  shouldTarget(element: HTMLElement): boolean;
  getTargetElement(element: HTMLElement): HTMLElement | null;
  highlight(element: HTMLElement, options: RenderOptions): void;
  unhighlight(element: HTMLElement): void;
}

class InteractiveHighlightStrategy implements HighlightStrategy {
  shouldTarget(element: HTMLElement): boolean {
    const tagName = element.tagName.toLowerCase();
    return (
      CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName) ||
      findInteractiveAncestor(element) !== null
    );
  }

  getTargetElement(element: HTMLElement): HTMLElement | null {
    const tagName = element.tagName.toLowerCase();
    if (CONSTANTS.INTERACTIVE_ELEMENTS.includes(tagName)) {
      return element;
    }
    return findInteractiveAncestor(element);
  }

  highlight(element: HTMLElement, options: RenderOptions): void {
    // tracking div 사용
    const trackingEl = document.getElementById('dkInspect_tracking');
    if (trackingEl) {
      trackingEl.style.width = `${getWidth(element)}px`;
      trackingEl.style.height = `${getHeight(element)}px`;
      trackingEl.style.left = `${getLeft(element)}px`;
      trackingEl.style.top = `${getTop(element)}px`;
      trackingEl.style.display = 'block';
    }
  }

  unhighlight(element: HTMLElement): void {
    const trackingEl = document.getElementById('dkInspect_tracking');
    if (trackingEl) trackingEl.style.display = 'none';
  }
}

class AllElementsHighlightStrategy implements HighlightStrategy {
  shouldTarget(element: HTMLElement): boolean {
    return element.tagName.toLowerCase() !== 'body';
  }

  getTargetElement(element: HTMLElement): HTMLElement | null {
    return element;
  }

  highlight(element: HTMLElement, options: RenderOptions): void {
    // inline outline 사용
    element.style.setProperty(
      'outline-width',
      `${options.bordersize}px`,
      'important',
    );
    element.style.setProperty('outline-color', options.colortype, 'important');
    element.style.setProperty('outline-style', options.linetype, 'important');
    element.style.setProperty(
      'outline-offset',
      `-${options.bordersize}px`,
      'important',
    );
  }

  unhighlight(element: HTMLElement): void {
    element.style.outlineWidth = '';
    element.style.outlineColor = '';
    element.style.outlineStyle = '';
    element.style.outlineOffset = '';
  }
}

// Factory
export function createStrategy(mode: InspectorMode): HighlightStrategy {
  return mode === InspectorMode.INTERACTIVE
    ? new InteractiveHighlightStrategy()
    : new AllElementsHighlightStrategy();
}
```

#### 사용 예시

```typescript
// event-handlers.ts
export function createEventHandlers(opt: InspectorOptions): EventHandlers {
  const strategy = createStrategy(opt.mode);
  let lastHoveredElement: HTMLElement | null = null;

  function handleMouseOver(this: HTMLElement, e: MouseEvent): void {
    if (!strategy.shouldTarget(this)) return;

    const target = strategy.getTargetElement(this);
    if (!target) return;

    if (lastHoveredElement && lastHoveredElement !== target) {
      strategy.unhighlight(lastHoveredElement);
    }

    strategy.highlight(target, opt);
    lastHoveredElement = target;
  }

  function handleMouseOut(this: HTMLElement, e: MouseEvent): void {
    if (lastHoveredElement) {
      strategy.unhighlight(lastHoveredElement);
      lastHoveredElement = null;
    }
  }

  return { handleMouseOver, handleMouseOut, handleMouseMove };
}
```

#### 장점

- ✅ 두 모드의 로직 완전 분리 (응집도 최상)
- ✅ 새로운 모드 추가 시 확장 용이 (OCP 준수)
- ✅ 각 전략 독립 테스트 가능
- ✅ 코드 가독성 향상
- ✅ Cyclomatic Complexity 대폭 감소 (15+ → 3 이하)

#### 단점

- ⚠️ 초기 구현 비용 높음
- ⚠️ 클래스/파일 수 증가
- ⚠️ 팀원 학습 곡선

#### 예상 작업 시간

- **2-3주** (전면 리팩토링)

---

## 비교표

| 항목              | 현재 | 방안 1 (Enum)  | 방안 2 (ConfigManager) | 방안 3 (Strategy) |
| ----------------- | ---- | -------------- | ---------------------- | ----------------- |
| **설정 수**       | 3개  | 1개            | 1개 (내부적으로 3개)   | 1개               |
| **복잡도**        | 높음 | 낮음           | 중간                   | 낮음              |
| **구현 난이도**   | -    | 낮음           | 중간                   | 높음              |
| **확장성**        | 낮음 | 중간           | 중간                   | 매우 높음         |
| **리스크**        | -    | 높음 (대규모)  | 낮음 (점진적)          | 중간              |
| **적용 시간**     | -    | 1주            | 2-3일                  | 2-3주             |
| **마이그레이션**  | -    | 필요 (storage) | 불필요                 | 불필요            |
| **테스트 용이성** | 낮음 | 중간           | 높음                   | 매우 높음         |
| **유지보수성**    | 낮음 | 중간           | 높음                   | 매우 높음         |

## 권장 적용 전략

### 1단계: 즉시 적용 (1-2일) - 방안 2

**이유:**

- ✅ 기존 코드 구조 유지 (점진적 개선)
- ✅ 조건 로직을 한 곳에 집중
- ✅ 타입 안정성 향상
- ✅ 테스트 용이
- ✅ 리스크 낮음
- ✅ 즉각적인 개선 효과

**적용 범위:**

```
1. src/content/inspector/config-manager.ts 생성
2. settings.ts 수정 (InspectorConfigManager 사용)
3. event-handlers.ts 수정 (config 주입)
4. inspector-core.ts 수정 (config 전달)
```

**예상 효과:**

- 조건 분기 로직 50% 감소
- 코드 가독성 30% 향상
- 버그 발생 가능성 감소

### 2단계: 중기 적용 (2-3주) - 방안 1 + 방안 3 결합

1. **방안 1로 타입 단순화**
   - InspectorMode enum 도입
   - linkmode/trackingmode 통합
   - storage 데이터 마이그레이션 스크립트 작성

2. **방안 3으로 로직 분리**
   - Strategy 패턴으로 tracking/inline 완전 분리
   - 새 모드 추가 시 확장 용이
   - 각 전략 독립 테스트 케이스 작성

**예상 효과:**

- 전체 코드 복잡도 70% 감소
- 새 기능 추가 시간 50% 단축
- 버그 발생률 80% 감소

## 마이그레이션 체크리스트 (방안 2 기준)

### Phase 1: 준비 (0.5일)

- [ ] `src/content/inspector/config-manager.ts` 파일 생성
- [ ] InspectorConfigManager 클래스 구현
- [ ] 단위 테스트 작성
- [ ] 기존 동작과 동일한지 검증

### Phase 2: settings.ts 적용 (0.5일)

- [ ] resRegEvent() 함수에 InspectorConfigManager 적용
- [ ] loadLinkModeSettings() 수정 (필요시)
- [ ] 수동 테스트: 설정 저장/로드 확인

### Phase 3: event-handlers.ts 적용 (0.5일)

- [ ] createEventHandlers에 config 파라미터 추가
- [ ] handleMouseOver 로직 단순화
- [ ] handleMouseOut 로직 단순화
- [ ] 수동 테스트: 마우스 오버/아웃 동작 확인

### Phase 4: inspector-core.ts 적용 (0.5일)

- [ ] Inspector 클래스에 config 전달
- [ ] tracking div 생성 로직 확인
- [ ] 통합 테스트: 전체 플로우 확인

### Phase 5: 검증 및 문서화 (0.5일)

- [ ] 모든 시나리오 테스트
  - [ ] 링크모드 ON + 배경 ON
  - [ ] 링크모드 ON + 배경 OFF
  - [ ] 링크모드 OFF
- [ ] 코드 리뷰
- [ ] README 업데이트
- [ ] 커밋 및 PR 생성

## 예상 리스크 및 대응

### 리스크 1: 기존 동작 변경

**확률:** 중간
**영향:** 높음
**대응:**

- 각 단계별 철저한 테스트
- 기존 로직과 동일한지 단위 테스트로 검증
- 롤백 계획 수립

### 리스크 2: 성능 저하

**확률:** 낮음
**영향:** 중간
**대응:**

- 벤치마크 테스트 실행
- 필요시 메서드 인라인 최적화
- 객체 생성 최소화

### 리스크 3: 팀원 학습 곡선

**확률:** 낮음
**영향:** 낮음
**대응:**

- 코드 주석 충실히 작성
- 아키텍처 문서 제공
- 페어 프로그래밍으로 지식 공유

## 결론

**즉시 적용 권장: 방안 2 (Configuration Manager)**

- 낮은 리스크로 즉각적인 개선 효과
- 점진적 적용 가능
- 향후 방안 3으로 확장 가능한 기반 마련

**중장기 목표: 방안 1 + 방안 3 결합**

- 완전한 타입 안전성 확보
- 최상의 유지보수성 및 확장성
- 새로운 기능 추가 시 최소 영향
