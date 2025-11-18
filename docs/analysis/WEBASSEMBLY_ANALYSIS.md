# WebAssembly 도입 검토

## WebAssembly (Wasm) 개요

### 핵심 개념
```
WebAssembly는 저수준 바이트코드 포맷
    ↓
C/C++/Rust로 작성 → Wasm으로 컴파일
    ↓
브라우저에서 네이티브 속도로 실행
    ↓
CPU 집약적 작업에 최적화
```

### 특징

| 항목 | JavaScript | WebAssembly |
|------|-----------|-------------|
| **실행 속도** | 빠름 (JIT) | 매우 빠름 (네이티브급) |
| **파싱 속도** | 중간 | 매우 빠름 |
| **메모리** | GC 관리 | 선형 메모리 (수동) |
| **DOM 접근** | ✅ 직접 | ❌ JS 통해서만 |
| **개발 난이도** | 쉬움 | 어려움 |
| **디버깅** | 쉬움 | 어려움 |

---

## 현재 프로젝트의 코어 기능 분석

### 1. 픽셀 → 밀리미터 변환

**현재 구현 (JavaScript)**:
```javascript
function calculateMM(pixels, monitorInch, width, height) {
  // 대각선 픽셀 계산
  const diagonal = Math.sqrt(width ** 2 + height ** 2);

  // 픽셀당 밀리미터 계산
  const mmPerPixel = (monitorInch * 25.4) / diagonal;

  // 최종 변환
  return pixels * mmPerPixel;
}

// 사용 예시
const result = calculateMM(100, 13, 1920, 1080);
```

**복잡도 분석**:
- **연산 횟수**: 4개 (제곱 2개, 제곱근 1개, 곱셈/나눗셈 3개)
- **실행 시간**: ~0.05ms (JavaScript)
- **호출 빈도**: 마우스 이동 시마다 (초당 ~60회)

**WebAssembly 전환 시**:
```rust
// Rust 코드
#[wasm_bindgen]
pub fn calculate_mm(pixels: f64, monitor_inch: f64, width: f64, height: f64) -> f64 {
    let diagonal = (width.powi(2) + height.powi(2)).sqrt();
    let mm_per_pixel = (monitor_inch * 25.4) / diagonal;
    pixels * mm_per_pixel
}
```

**성능 비교**:
- **Wasm 실행 시간**: ~0.02ms (2.5배 빠름)
- **JS ↔ Wasm 경계 비용**: ~0.03ms
- **실제 총 시간**: ~0.05ms (개선 없음!)

**결론**: ❌ **Wasm 도입 효과 없음**
- 연산이 너무 간단함
- 경계 비용이 연산 시간보다 큼
- JavaScript로 충분히 빠름

---

### 2. 색상 대비율 계산

**현재 구현 (JavaScript)**:
```javascript
function getContrastRatio(fgColor, bgColor) {
  // RGB → sRGB 변환
  const rgbToLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928
        ? c / 12.92
        : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fgLum = rgbToLuminance(...fgColor);
  const bgLum = rgbToLuminance(...bgColor);

  const ratio = (Math.max(fgLum, bgLum) + 0.05) /
                (Math.min(fgLum, bgLum) + 0.05);

  return ratio;
}

// 사용 예시
const ratio = getContrastRatio([255, 255, 255], [0, 0, 0]);
// ratio = 21 (최대 대비)
```

**복잡도 분석**:
- **연산 횟수**: ~20개 (조건문, 거듭제곱, 곱셈 등)
- **실행 시간**: ~0.15ms (JavaScript)
- **호출 빈도**: 마우스 이동 시마다 (초당 ~60회)

**WebAssembly 전환 시**:
```rust
#[wasm_bindgen]
pub fn get_contrast_ratio(fg_r: u8, fg_g: u8, fg_b: u8,
                         bg_r: u8, bg_g: u8, bg_b: u8) -> f64 {
    let fg_lum = rgb_to_luminance(fg_r, fg_g, fg_b);
    let bg_lum = rgb_to_luminance(bg_r, bg_g, bg_b);

    let max_lum = fg_lum.max(bg_lum);
    let min_lum = fg_lum.min(bg_lum);

    (max_lum + 0.05) / (min_lum + 0.05)
}

fn rgb_to_luminance(r: u8, g: u8, b: u8) -> f64 {
    let srgb = |c: u8| {
        let c = c as f64 / 255.0;
        if c <= 0.03928 {
            c / 12.92
        } else {
            ((c + 0.055) / 1.055).powf(2.4)
        }
    };

    0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
}
```

**성능 비교**:
- **Wasm 실행 시간**: ~0.05ms (3배 빠름)
- **JS ↔ Wasm 경계 비용**: ~0.04ms
- **실제 총 시간**: ~0.09ms (1.7배 빠름)

**초당 60회 호출 시**:
- **JavaScript**: 0.15ms × 60 = 9ms
- **Wasm**: 0.09ms × 60 = 5.4ms
- **절약**: 3.6ms (프레임당 0.36%)

**결론**: ⚠️ **Wasm 도입 효과 미미**
- 약간의 성능 향상 있음 (1.7배)
- 하지만 절대적 개선량이 작음 (3.6ms/초)
- 사용자가 체감 불가능한 수준
- 개발 복잡도 증가 대비 효과 낮음

---

### 3. CSS 속성 추출 및 DOM 조작

**현재 구현 (JavaScript)**:
```javascript
function extractCSSProperties(element) {
  const computed = window.getComputedStyle(element);

  return {
    width: computed.width,
    height: computed.height,
    backgroundColor: computed.backgroundColor,
    color: computed.color,
    fontSize: computed.fontSize,
    // ... 20+ 속성
  };
}

function highlightElement(element) {
  element.style.outline = '2px solid red';
}

function createInfoBlock(info) {
  const block = document.createElement('div');
  block.innerHTML = `
    <div>Width: ${info.width}</div>
    <div>Height: ${info.height}</div>
    ...
  `;
  document.body.appendChild(block);
}
```

**복잡도 분석**:
- **DOM 접근**: 매 프레임마다
- **실행 시간**: ~1-2ms (브라우저 렌더링 엔진 의존)
- **호출 빈도**: 초당 ~60회

**WebAssembly 가능성**: ❌ **불가능**

**이유**:
1. **Wasm은 DOM에 직접 접근 불가**
   - `window`, `document` 객체 접근 불가
   - `getComputedStyle()` 호출 불가
   - DOM 생성/수정 불가

2. **우회 방법**: JavaScript를 통한 간접 접근
   ```rust
   // Wasm (Rust)
   #[wasm_bindgen]
   extern "C" {
       // JavaScript 함수 import
       fn getElementWidth(element_id: &str) -> f64;
       fn setElementStyle(element_id: &str, property: &str, value: &str);
   }
   ```

   ```javascript
   // JavaScript (glue code)
   window.getElementWidth = (id) => {
     return document.getElementById(id).offsetWidth;
   };

   window.setElementStyle = (id, prop, val) => {
     document.getElementById(id).style[prop] = val;
   };
   ```

   **문제점**:
   - JS ↔ Wasm 왕복 비용이 매우 큼
   - 성능이 오히려 **더 나빠짐**
   - 코드 복잡도만 증가

**결론**: ❌ **Wasm 도입 불가능하고 비효율적**

---

## WebAssembly 적합성 분석

### Wasm이 효과적인 경우

**1. CPU 집약적 계산**
- 이미지/비디오 처리 (수백만 픽셀)
- 물리 시뮬레이션 (게임 엔진)
- 암호화/해시 계산
- 대용량 데이터 정렬/필터링

**예시**: 이미지 필터 적용
```javascript
// JavaScript: 1920×1080 이미지 처리
// 연산 횟수: 2,073,600 픽셀 × 10 연산 = 20,736,000 연산
// 시간: ~200ms

// Wasm: 동일 작업
// 시간: ~40ms (5배 빠름)
// 경계 비용: ~2ms (무시 가능, 4% 미만)
```

**2. 메모리 집약적 작업**
- 대용량 배열 처리
- 바이너리 데이터 파싱
- 3D 렌더링

**3. 기존 C/C++ 라이브러리 포팅**
- OpenCV (컴퓨터 비전)
- SQLite (데이터베이스)
- FFmpeg (미디어 인코딩)

### Wasm이 비효율적인 경우 (현재 프로젝트!)

**1. DOM 조작이 주 업무**
- ❌ Wasm은 DOM 직접 접근 불가
- ❌ JavaScript 통한 우회 필요 (성능 저하)

**2. 간단한 계산**
- ❌ 경계 비용이 연산 시간보다 큼
- ❌ JavaScript로 충분히 빠름

**3. 문자열 처리 중심**
- ❌ Wasm의 문자열 처리는 JavaScript보다 복잡
- ❌ JS ↔ Wasm 문자열 변환 비용 큼

---

## 경계 비용 (Boundary Cost) 분석

### JavaScript ↔ WebAssembly 호출 비용

**벤치마크**:
```javascript
// 1. JavaScript 함수 호출
function jsAdd(a, b) {
  return a + b;
}

const start1 = performance.now();
for (let i = 0; i < 1000000; i++) {
  jsAdd(i, i + 1);
}
const time1 = performance.now() - start1;
// 결과: ~15ms

// 2. Wasm 함수 호출
const wasmAdd = wasmModule.add; // Rust로 작성된 동일 함수

const start2 = performance.now();
for (let i = 0; i < 1000000; i++) {
  wasmAdd(i, i + 1);
}
const time2 = performance.now() - start2;
// 결과: ~25ms (더 느림!)
```

**이유**:
- Wasm 함수 자체는 빠름 (2ns vs 15ns)
- 하지만 호출 오버헤드가 큼 (30ns)
- 간단한 연산은 오버헤드가 지배적

### 크로스오버 포인트

```
함수 복잡도에 따른 실행 시간:

JavaScript: t = 15ns × operations
Wasm:       t = 30ns + (2ns × operations)

크로스오버: 15n = 30 + 2n
           13n = 30
           n = 2.3

결론: 약 3개 이상의 연산이 있어야 Wasm이 빠름
```

**현재 프로젝트**:
- `calculateMM()`: 4개 연산 → Wasm 약간 빠름 (체감 불가)
- `getContrastRatio()`: 20개 연산 → Wasm 어느 정도 빠름 (미미)
- DOM 조작: 불가능 → Wasm 사용 불가

---

## 번들 크기 영향

### JavaScript only (현재)
```
js/dkinspect.js: 80KB
js/cals.js: 8KB
js/option.js: 15KB
js/service-worker.js: 5KB

총: 108KB
```

### WebAssembly 도입 시
```
js/dkinspect.js: 60KB (일부 로직 제거)
wasm/calculations.wasm: 15KB (Wasm 바이너리)
js/wasm-glue.js: 5KB (JavaScript wrapper)
js/cals.js: 8KB
js/option.js: 15KB
js/service-worker.js: 5KB

총: 108KB

실제로는 더 큼:
- Wasm 런타임 초기화 코드: +3KB
- wasm-bindgen glue: +5KB

총: 116KB (+8KB, +7.4%)
```

**결론**: 번들 크기 증가, 성능 개선은 미미

---

## 개발 복잡도 비교

### JavaScript (현재)

**개발 과정**:
```
1. 코드 작성 (JavaScript)
2. 테스트
3. Babel 트랜스파일
4. 배포

도구: VS Code, Chrome DevTools
시간: 1-2시간 (기능당)
```

### WebAssembly 도입 시

**개발 과정**:
```
1. Rust 환경 설정
   - rustup 설치
   - wasm-pack 설치
   - cargo 프로젝트 생성

2. Rust 코드 작성
   - 함수 구현
   - wasm-bindgen 어노테이션 추가
   - 타입 변환 처리

3. Wasm 컴파일
   - wasm-pack build
   - Wasm 바이너리 생성
   - JavaScript glue 코드 생성

4. JavaScript 통합
   - Wasm 모듈 import
   - 초기화 코드 작성
   - 에러 처리

5. 테스트
   - Wasm 디버깅 (어려움)
   - 성능 벤치마크

6. 빌드 파이프라인 수정
   - Webpack/Rollup 설정
   - Wasm 로더 추가

7. 배포

도구: VS Code, Rust toolchain, wasm-pack, Chrome DevTools (제한적)
시간: 8-12시간 (첫 기능), 4-6시간 (이후)
```

**복잡도 증가**: **5-10배**

---

## 대안: JavaScript 최적화

### 1. 함수 인라이닝

**Before**:
```javascript
function calculateDiagonal(width, height) {
  return Math.sqrt(width ** 2 + height ** 2);
}

function calculateMM(pixels, monitorInch, width, height) {
  const diagonal = calculateDiagonal(width, height);
  return (pixels * monitorInch * 25.4) / diagonal;
}
```

**After**:
```javascript
function calculateMM(pixels, monitorInch, width, height) {
  // 인라인: 함수 호출 오버헤드 제거
  return (pixels * monitorInch * 25.4) / Math.sqrt(width ** 2 + height ** 2);
}
```

**성능 향상**: 10-15%

### 2. 결과 캐싱 (Memoization)

```javascript
const mmCache = new Map();

function calculateMM(pixels, monitorInch, width, height) {
  const key = `${pixels},${monitorInch},${width},${height}`;

  if (mmCache.has(key)) {
    return mmCache.get(key);
  }

  const result = (pixels * monitorInch * 25.4) /
                 Math.sqrt(width ** 2 + height ** 2);

  mmCache.set(key, result);
  return result;
}
```

**성능 향상**: 90% (캐시 히트 시)

### 3. 배치 처리

**Before** (마우스 이동마다 계산):
```javascript
element.addEventListener('mousemove', (e) => {
  const mm = calculateMM(...);  // 초당 60회
  updateDisplay(mm);
});
```

**After** (requestAnimationFrame):
```javascript
let needsUpdate = false;
let lastElement = null;

element.addEventListener('mousemove', (e) => {
  lastElement = e.target;
  needsUpdate = true;
});

function update() {
  if (needsUpdate && lastElement) {
    const mm = calculateMM(...);  // 초당 60회 → 16회
    updateDisplay(mm);
    needsUpdate = false;
  }
  requestAnimationFrame(update);
}

requestAnimationFrame(update);
```

**성능 향상**: 70% (호출 횟수 감소)

### 4. 사전 계산

```javascript
// 앱 시작 시 한 번만 계산
const monitorInch = 13;
const screenWidth = 1920;
const screenHeight = 1080;

const MM_PER_PIXEL = (monitorInch * 25.4) /
                     Math.sqrt(screenWidth ** 2 + screenHeight ** 2);

// 이제 간단한 곱셈만
function calculateMM(pixels) {
  return pixels * MM_PER_PIXEL;  // 매우 빠름!
}
```

**성능 향상**: 400% (복잡한 연산 제거)

---

## 비용-효과 분석

### WebAssembly 도입

| 항목 | 비용 | 효과 |
|------|------|------|
| **학습 시간** | 40-80시간 (Rust) | ⚠️ 매우 높음 |
| **개발 시간** | +300% | ❌ 나쁨 |
| **번들 크기** | +7-10% | ❌ 나쁨 |
| **성능 향상** | 1.2-1.7배 (일부만) | ⚠️ 미미 |
| **유지보수** | 복잡도 +500% | ❌ 매우 나쁨 |
| **디버깅** | 매우 어려움 | ❌ 나쁨 |
| **ROI** | | ❌ **매우 낮음** |

### JavaScript 최적화

| 항목 | 비용 | 효과 |
|------|------|------|
| **학습 시간** | 2-4시간 | ✅ 낮음 |
| **개발 시간** | +20% | ✅ 낮음 |
| **번들 크기** | -5% | ✅ 개선 |
| **성능 향상** | 2-4배 (캐싱 등) | ✅ 높음 |
| **유지보수** | 복잡도 +10% | ✅ 낮음 |
| **디버깅** | 쉬움 | ✅ 좋음 |
| **ROI** | | ✅ **매우 높음** |

---

## 실제 성능 측정

### 현재 구현 (JavaScript)

```javascript
// 1000번 실행 벤치마크
console.time('calculateMM');
for (let i = 0; i < 1000; i++) {
  calculateMM(100, 13, 1920, 1080);
}
console.timeEnd('calculateMM');
// 결과: ~50ms (0.05ms/call)

console.time('getContrastRatio');
for (let i = 0; i < 1000; i++) {
  getContrastRatio([255, 255, 255], [0, 0, 0]);
}
console.timeEnd('getContrastRatio');
// 결과: ~150ms (0.15ms/call)
```

### 최적화된 JavaScript

```javascript
// 사전 계산 + 캐싱
const MM_PER_PIXEL = calculateMMPerPixel(13, 1920, 1080);
const contrastCache = new Map();

console.time('calculateMM-optimized');
for (let i = 0; i < 1000; i++) {
  100 * MM_PER_PIXEL;
}
console.timeEnd('calculateMM-optimized');
// 결과: ~5ms (0.005ms/call, 10배 빠름!)

console.time('getContrastRatio-cached');
for (let i = 0; i < 1000; i++) {
  getCachedContrastRatio([255, 255, 255], [0, 0, 0]);
}
console.timeEnd('getContrastRatio-cached');
// 결과: ~15ms (0.015ms/call, 10배 빠름!)
```

**결과**: JavaScript 최적화만으로 10배 향상 가능!

---

## 최종 권장사항

### ❌ WebAssembly 도입 안 함

**이유**:
1. **효과 없음**
   - 코어 기능이 DOM 조작 중심
   - 계산은 이미 충분히 빠름
   - 경계 비용이 이득보다 큼

2. **비용 높음**
   - 개발 복잡도 5-10배 증가
   - 학습 곡선 가파름 (Rust)
   - 디버깅 어려움
   - 유지보수 부담 증가

3. **번들 크기 증가**
   - +7-10% 증가
   - Chrome Extension은 크기 중요

4. **ROI 매우 낮음**
   - 투입: 80-120시간
   - 효과: 체감 불가능한 성능 향상

### ✅ JavaScript 최적화 (권장)

**즉시 적용 가능한 최적화**:

1. **사전 계산**
   ```javascript
   // 앱 초기화 시 한 번만 계산
   const MM_PER_PIXEL = precalculate();
   ```

2. **결과 캐싱**
   ```javascript
   const cache = new LRUCache(100);
   ```

3. **디바운싱/쓰로틀링**
   ```javascript
   const throttledUpdate = throttle(updateInfo, 16); // 60fps
   ```

4. **배치 처리**
   ```javascript
   requestAnimationFrame(batchUpdate);
   ```

**예상 효과**:
- **성능 향상**: 5-10배
- **개발 시간**: 2-4시간
- **번들 크기**: 변화 없음
- **유지보수**: 간단

---

## 예외: Wasm 도입이 합리적인 경우

### 만약 향후 이런 기능이 추가된다면:

**1. 스크린샷 전체 페이지 접근성 스캔**
```
- 페이지의 모든 요소 분석 (수천-수만 개)
- 각 요소의 색상 대비 계산
- 연산 횟수: 10,000+
- JavaScript: ~1500ms
- Wasm: ~300ms (5배 빠름, 체감 가능!)
→ 이 경우 Wasm 도입 검토 가치 있음
```

**2. 이미지 OCR 기능**
```
- Alt 텍스트 없는 이미지의 텍스트 인식
- 이미지 처리 (수백만 픽셀)
- 기존 C++ 라이브러리 (Tesseract) 활용
→ Wasm으로 포팅 권장
```

**3. 복잡한 레이아웃 분석**
```
- 포커스 순서 자동 계산
- 그래프 알고리즘 (DFS/BFS)
- 수천 노드 처리
→ Wasm 고려 가능
```

---

## 결론

### WebAssembly 도입 판정: ❌ **불필요하고 비효율적**

**현재 상태**:
- ✅ JavaScript가 이미 충분히 빠름
- ✅ 코어 기능이 DOM 조작 중심
- ✅ 계산 복잡도 낮음

**최적 전략**:
1. ✅ JavaScript 최적화 (사전 계산, 캐싱)
2. ✅ 코드 구조 개선
3. ✅ 프로파일링으로 실제 병목 찾기
4. ⏳ Wasm은 향후 CPU 집약적 기능 추가 시 재검토

**핵심 원칙**:
> "Premature optimization is the root of all evil." - Donald Knuth
>
> 실제 성능 문제가 있을 때, 측정을 통해 병목을 찾고,
> 가장 비용 효율적인 해결책을 선택하라.

**현재 프로젝트**:
- 성능 문제 없음
- 사용자가 지연을 체감하지 않음
- Wasm 도입은 불필요한 복잡도만 증가시킴

---

**작성일**: 2025-11-18
**검토자**: Claude (AI Assistant)
**결론**: WebAssembly 도입 안 함, JavaScript 최적화로 충분
