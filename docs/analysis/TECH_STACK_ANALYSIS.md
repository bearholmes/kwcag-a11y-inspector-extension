# 기술 스택 검토 및 개선 방안

## 1. 현대적인 프레임워크 도입 검토

### 검토 대상 프레임워크
- React
- Vue
- Svelte
- Lit (Web Components)

### 도입 가능성 분석

#### ❌ 권장하지 않음 - 이유:

**1. Chrome Extension의 특수성**
- Content Script는 실제 웹페이지에 주입됨
- 번들 크기가 직접적으로 페이지 성능에 영향
- 현재 dkinspect.js는 약 1,350줄이지만 트랜스파일 후 크기가 작음
- React/Vue 추가 시 최소 40-100KB의 런타임 오버헤드 발생

**2. 현재 아키텍처의 적합성**
```
✅ 장점:
- DOM 직접 조작으로 최소 오버헤드
- 빠른 로딩 시간
- 호스트 페이지와의 충돌 위험 최소화
- 메모리 사용량 최소화

❌ 프레임워크 도입 시 문제점:
- 호스트 페이지에 이미 React/Vue가 있을 경우 버전 충돌 가능
- 번들 크기 증가로 주입 속도 저하
- 불필요한 가상 DOM 오버헤드
- CSP (Content Security Policy) 이슈 발생 가능
```

**3. 현재 UI 복잡도**
- UI가 단순함 (플로팅 정보 블록 + 계산기 팝업)
- 상태 관리가 복잡하지 않음
- 프레임워크의 이점을 충분히 활용하기 어려움

#### ✅ 예외적 도입 고려 상황
만약 다음과 같은 요구사항이 생긴다면:
- 복잡한 대시보드 UI 추가
- 옵션 페이지를 SPA로 전환
- 실시간 데이터 시각화 추가

→ **권장**: Svelte 또는 Lit (가벼움, Web Components 기반)

### 결론: 프레임워크 도입 **불필요**

**대안**:
- Vanilla JS 유지
- 필요 시 Web Components로 컴포넌트화
- JSDoc + TypeScript 타입 체크로 개발 경험 개선

---

## 2. TypeScript 도입 검토

### ✅ 강력히 권장 - 이유:

#### 장점

**1. 타입 안전성**
```typescript
// 현재 (JavaScript)
function calculateMM(pixels, monitorInch, width, height) {
  return (pixels * monitorInch * 25.4) / Math.sqrt(width**2 + height**2);
}
// 버그 가능성: 잘못된 타입의 인자 전달 시 런타임 에러

// TypeScript 도입 후
function calculateMM(
  pixels: number,
  monitorInch: number,
  width: number,
  height: number
): number {
  return (pixels * monitorInch * 25.4) / Math.sqrt(width**2 + height**2);
}
// 컴파일 타임에 타입 오류 감지
```

**2. 개발자 경험 향상**
- IDE 자동완성 개선
- 리팩토링 안전성 증가
- 문서화 효과 (타입이 곧 문서)
- 에러를 작성 시점에 발견

**3. Chrome API 타입 지원**
```typescript
// @types/chrome 설치 시
chrome.storage.sync.get(['monitorInch'], (result) => {
  const inch = result.monitorInch; // 타입 추론 가능
});
```

#### 도입 전략

### 전략 1: 점진적 마이그레이션 (권장)

**단계별 접근**:
```
Phase 1: TypeScript 환경 설정 (1-2시간)
  ├─ tsconfig.json 생성
  ├─ @types/chrome 설치
  └─ allowJs: true로 기존 JS와 공존

Phase 2: 유틸리티 함수부터 변환 (2-3시간)
  ├─ 계산 로직 함수들을 .ts로 변환
  ├─ 타입 정의 작성
  └─ 테스트로 검증

Phase 3: 주요 파일 변환 (4-6시간)
  ├─ service-worker.js → .ts
  ├─ option.js → .ts
  ├─ cals.js → .ts
  └─ dkinspect.js → .ts (가장 복잡, 마지막에)

Phase 4: 엄격 모드 활성화 (1-2시간)
  └─ strict: true, noImplicitAny: true
```

**예상 소요 시간**: 8-13시간
**위험도**: 낮음 (점진적이므로)

### 전략 2: JSDoc 타입 체크 활용 (빠른 대안)

TypeScript 파일로 전환하지 않고도 타입 체크 가능:

**설정**:
```json
// jsconfig.json
{
  "compilerOptions": {
    "checkJs": true,
    "strict": true,
    "types": ["chrome"]
  },
  "include": ["src/**/*"]
}
```

**코드 예시**:
```javascript
/**
 * 픽셀을 밀리미터로 변환
 * @param {number} pixels - 픽셀 값
 * @param {number} monitorInch - 모니터 인치
 * @param {number} width - 해상도 가로
 * @param {number} height - 해상도 세로
 * @returns {number} 밀리미터 값
 */
function calculateMM(pixels, monitorInch, width, height) {
  return (pixels * monitorInch * 25.4) / Math.sqrt(width**2 + height**2);
}
```

**장점**:
- 파일 확장자 변경 불필요
- 빌드 프로세스 변경 최소화
- VS Code에서 즉시 타입 체크
- 기존 코드와 100% 호환

**단점**:
- TypeScript의 고급 기능 사용 불가
- 타입 정의가 주석이라 장황함

### 전략 3: 하이브리드 접근 (최적안)

**제안**:
1. **현재 프로젝트**: JSDoc + 타입 체크 활성화
   - 즉시 적용 가능
   - 위험도 0%
   - 개발 경험 즉시 개선

2. **향후 2.0 버전**: 완전한 TypeScript 전환
   - 충분한 시간을 두고 마이그레이션
   - 테스트 코드 먼저 작성 후 안전하게 전환

### 도입 시 필요한 패키지

```json
{
  "devDependencies": {
    "@types/chrome": "^0.0.248",
    "typescript": "^5.3.0",
    "@babel/preset-typescript": "^7.23.0"
  }
}
```

### 빌드 프로세스 변경

**현재**:
```
src/*.js → [Babel] → js/*.js
```

**TypeScript 도입 후**:
```
src/*.ts → [TypeScript] → lib/*.js → [Babel] → js/*.js
```

또는:

```
src/*.ts → [Babel + @preset-typescript] → js/*.js
```

---

## 3. 최종 권장사항

### 즉시 적용 (이번 작업)
✅ **JSDoc 타입 어노테이션 추가**
- 모든 함수에 JSDoc 작성
- jsconfig.json으로 타입 체크 활성화
- VS Code IntelliSense 개선

✅ **코드 품질 개선**
- ESLint 도입
- 엄격한 린팅 규칙 적용
- Prettier 유지

### 단기 (1-2개월 내)
⏳ **테스트 커버리지 확보**
- Jest 설정
- 핵심 로직 단위 테스트
- 80% 이상 커버리지 목표

⏳ **CI/CD 파이프라인**
- GitHub Actions
- 자동 빌드 및 테스트
- Chrome Web Store 자동 배포

### 중기 (3-6개월)
🔮 **TypeScript 완전 전환 검토**
- 테스트 코드 완비 후 진행
- 점진적 마이그레이션
- 타입 정의 라이브러리 구축

🔮 **성능 최적화**
- 번들 크기 최소화
- 코드 스플리팅
- Lazy loading

### 장기 (6개월+)
🚀 **기능 확장**
- 추가 WCAG 지침 지원
- 리포팅 기능
- 데이터 분석 대시보드 (이때 프레임워크 재검토)

---

## 4. 구현 계획

### Phase 1: JSDoc + 타입 체크 (현재 작업)

**1단계**: jsconfig.json 생성
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "checkJs": true,
    "strict": false,
    "noImplicitAny": false,
    "lib": ["ES2020", "DOM"],
    "types": ["chrome"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "js"]
}
```

**2단계**: @types/chrome 설치
```bash
npm install --save-dev @types/chrome
```

**3단계**: 모든 함수에 JSDoc 추가
- 매개변수 타입
- 반환 타입
- 설명

**4단계**: VS Code에서 타입 체크 확인
- 문제 탭에서 타입 오류 확인
- 점진적으로 수정

### Phase 2: ESLint 설정

```bash
npm install --save-dev eslint eslint-config-airbnb-base
```

**eslint.config.js**:
```javascript
export default [
  {
    files: ['src/**/*.js'],
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'prefer-const': 'error',
      'no-var': 'error'
    }
  }
];
```

### Phase 3: 테스트 프레임워크

```bash
npm install --save-dev jest @types/jest
```

---

## 5. 비용-효과 분석

| 항목 | 시간 투자 | 즉시 효과 | 장기 효과 | 권장도 |
|------|----------|----------|----------|--------|
| **프레임워크 도입** | 20-40h | ⚠️ 낮음 | ⚠️ 낮음 | ❌ |
| **TypeScript 완전 전환** | 12-20h | ⭐⭐ 중간 | ⭐⭐⭐ 높음 | ⏳ 나중에 |
| **JSDoc + 타입 체크** | 4-6h | ⭐⭐⭐ 높음 | ⭐⭐ 중간 | ✅ 즉시 |
| **ESLint** | 2-3h | ⭐⭐ 중간 | ⭐⭐⭐ 높음 | ✅ 즉시 |
| **테스트 코드** | 8-12h | ⭐⭐ 중간 | ⭐⭐⭐ 높음 | ✅ 즉시 |

---

## 결론

**현재 프로젝트에 대한 최적 전략**:

1. ✅ **프레임워크 도입 안 함** - 불필요, 오버헤드만 증가
2. ✅ **JSDoc + 타입 체크 즉시 적용** - 낮은 비용, 높은 효과
3. ⏳ **TypeScript는 추후 검토** - 테스트 코드 완비 후 점진적 전환
4. ✅ **코드 품질 도구 강화** - ESLint, Prettier, Jest

이 접근법은:
- 최소한의 위험
- 즉각적인 개발 경험 개선
- 향후 TypeScript 전환의 발판 마련
- 기존 코드베이스 존중

---

**작성일**: 2025-11-18
**검토자**: Claude (AI Assistant)
