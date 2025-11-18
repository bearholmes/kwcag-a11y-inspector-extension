# KWCAG A11y Inspector Extension - 프로젝트 분석 문서

## 📋 프로젝트 개요

### 프로젝트 정보
- **프로젝트명**: KWCAG 2.1 Accessibility Inspector
- **타입**: Chrome Browser Extension (Manifest V3)
- **버전**: 0.13.0
- **라이선스**: MIT
- **언어**: JavaScript (ES6+)
- **배포**: [Chrome Web Store](https://chrome.google.com/webstore/detail/kwcag-a11y-inspector/ngcmkfaolkgkjbddhjnhgoekgaamjibo?hl=ko)

### 프로젝트 목적
KWCAG (Korean Web Content Accessibility Guidelines) 2.1의 2.1.3 "조작 가능" 검사항목을 측정하기 위한 웹 접근성 진단 도구입니다.

### 주요 기능
1. **요소 크기 측정**: 클릭 가능한 요소의 크기를 mm 및 픽셀 단위로 측정
2. **색상 대비 검사**: 텍스트 색상 대비율 계산 (WCAG 1.3.3 준수)
3. **수동 계산기**: 팝업을 통한 수동 치수 계산 기능
4. **시각적 강조**: 검사 중인 요소를 커스터마이징 가능한 테두리로 강조
5. **해상도 기반 계산**: 모니터 크기와 해상도를 기반으로 픽셀을 물리적 mm로 변환

---

## 🏗️ 프로젝트 구조

### 디렉토리 구조
```
kwcag-a11y-inspector-extension/
├── manifest.json           # Chrome 확장프로그램 매니페스트
├── package.json           # NPM 의존성 및 스크립트
├── option.html            # 옵션 페이지 UI
│
├── css/                   # 스타일시트
│   ├── cals.css          # 계산기 팝업 스타일
│   ├── dkinspect.css     # 메인 인스펙터 오버레이 스타일
│   └── option.css        # 옵션 페이지 스타일
│
├── img/                   # 확장프로그램 아이콘
│
├── js/                    # 트랜스파일된 JavaScript (프로덕션)
│   ├── cals.js
│   ├── dkinspect.js
│   ├── jscolor.min.js
│   ├── option.js
│   └── service-worker.js
│
└── src/                   # 소스 JavaScript (ES6+)
    ├── cals.js           # 계산기 로직
    ├── dkinspect.js      # 메인 인스펙터 로직
    ├── option.js         # 옵션 페이지 로직
    └── service-worker.js # 백그라운드 서비스 워커
```

### 핵심 파일 설명

#### 1. `src/service-worker.js` (76줄)
**역할**: 확장프로그램의 백그라운드 로직 관리

**주요 기능**:
- 확장프로그램 설치 시 옵션 페이지 생성
- 컨텍스트 메뉴(우클릭 메뉴) 관리
- 확장프로그램 아이콘 클릭 이벤트 처리
- 콘텐츠 스크립트 주입 관리
- 기본 설정값 초기화

**주요 API**:
- `chrome.runtime.onInstalled`
- `chrome.contextMenus`
- `chrome.action.onClicked`
- `chrome.scripting.executeScript`
- `chrome.storage.sync`

#### 2. `src/dkinspect.js` (1,350줄) - **핵심 로직**
**역할**: 요소 검사 및 측정 시스템의 메인 로직

**주요 기능**:
- 실시간 요소 호버 추적
- CSS 속성 추출 및 표시
- 물리적 치수 계산 (픽셀 → mm 변환)
- 색상 대비율 계산 (WCAG 준수)
- 다중 검사 모드 지원
- 키보드 단축키 (ESC로 일시정지/재개)
- 프레임 지원 (제한적)

**핵심 함수**:
- `myApp()`: 메인 비동기 초기화 함수
- `DkInspect`: 인스펙터 기능의 핵심 클래스
- `UpdateColorBg()`: 색상 대비 계산
- `SetCSSDiagonal()`: 모니터 기반 치수 계산
- 마우스 이벤트 핸들러 (mouseover, mousemove, mouseout)

**알고리즘**:
1. **픽셀 → mm 변환**:
   ```
   mm = (픽셀 × 모니터 인치 × 25.4) / sqrt(가로²+ 세로²)
   ```

2. **색상 대비율 계산**:
   - RGB → 상대 휘도 변환
   - WCAG 2.0 대비율 공식 적용
   - AA/AAA 레벨 준수 여부 판단

#### 3. `src/cals.js` (167줄)
**역할**: 수동 치수 계산기 팝업

**주요 기능**:
- 픽셀 치수를 mm로 변환
- 저장된 모니터/해상도 설정 사용
- 자동 검사가 불가능한 경우 수동 입력 제공

#### 4. `src/option.js` (138줄)
**역할**: 옵션 페이지 로직

**관리 설정**:
- 모니터 크기 (11-40 인치)
- 해상도 설정 (다수 프리셋)
- 색상 대비 표시 토글
- 링크 모드 (a/button/input 요소만 필터링)
- 테두리 스타일/색상/크기 커스터마이징
- 추적 모드 (별도 오버레이 모드)
- 배경 투명도 처리

---

## 🔧 기술 스택

### 런타임 기술
- Chrome Extension API (Manifest V3)
- Vanilla JavaScript (ES6+, async/await)
- Chrome Storage Sync API
- CSS3

### 개발 도구
```json
{
  "@babel/cli": "^7.21.0",
  "@babel/core": "^7.21.3",
  "@babel/preset-env": "^7.20.2",
  "prettier": "^2.8.4"
}
```

### 서드파티 라이브러리
- **jscolor.min.js**: 색상 선택기 컴포넌트

### 빌드 프로세스
```bash
npm run build    # src/ → js/ Babel 트랜스파일
npm run format   # Prettier 코드 포맷팅
```

---

## 🔄 주요 워크플로우

### 워크플로우 1: 요소 검사
```
사용자가 확장프로그램 아이콘 클릭
  ↓
service-worker.js가 dkinspect.js + dkinspect.css 주입
  ↓
dkinspect.js 초기화:
  - Chrome 스토리지에서 사용자 설정 로드
  - 플로팅 정보 블록 생성 (dkInspect_block)
  - 모든 페이지 요소에 마우스 이벤트 리스너 연결
  ↓
사용자가 요소 위에 호버:
  - mouseover: 요소 강조, CSS 정보 표시
  - mousemove: 커서 근처에 정보 블록 위치 조정
  - mouseout: 강조 제거
  ↓
실시간 표시:
  - 요소 태그, ID, 클래스
  - 물리적 치수 (mm + px)
  - 박스 모델 (padding, margin, border)
  - 색상 대비율 (활성화된 경우)
  ↓
ESC 키: 일시정지/재개
아이콘 재클릭: 인스펙터 비활성화
```

### 워크플로우 2: 수동 계산기
```
사용자가 페이지에서 우클릭
  ↓
컨텍스트 메뉴에서 "수동계산 팝업 열기" 선택
  ↓
service-worker.js가 cals.js + cals.css 주입
  ↓
계산기 팝업 표시:
  - 높이/너비 입력 필드 (픽셀 단위)
  ↓
사용자가 치수 입력 후 "확인" 클릭
  ↓
계산 수행:
  - 모니터/해상도 설정 가져오기
  - 픽셀을 mm로 변환
  - 대각선 길이 계산
  ↓
팝업에 결과 표시
```

---

## ⚠️ 현재 문제점 및 개선 영역

### 1. 버전 불일치
- **문제**: `manifest.json` (0.13.0) ≠ `option.html` (0.14.0) ≠ `package.json` (0.13.0)
- **영향**: 버전 관리 혼란
- **해결**: 버전 번호 동기화 필요

### 2. 테스트 코드 부재
- **문제**: 자동화된 테스트 없음
- **영향**: 복잡한 계산 로직의 정확성 검증 어려움
- **해결**: Jest 등의 테스트 프레임워크 도입

### 3. 에러 처리 부족
- **문제**: Chrome API 호출 시 try-catch 없음
- **영향**: 런타임 에러 발생 시 사용자 경험 저하
- **해결**: 포괄적인 에러 처리 추가

### 4. JSDoc 문서화 부족
- **문제**: 일부 함수에만 주석 존재
- **영향**: 코드 유지보수성 저하
- **해결**: 모든 함수에 JSDoc 추가

### 5. 소스맵 미생성
- **문제**: Babel 트랜스파일 시 소스맵 생성 안 됨
- **영향**: 디버깅 어려움
- **해결**: Babel 설정에 sourceMaps 옵션 추가

### 6. 매직 넘버 존재
- **문제**: 하드코딩된 숫자 (예: blockWidth = 332, timeout = 3000)
- **영향**: 코드 가독성 및 유지보수성 저하
- **해결**: 상수로 추출

### 7. 큰 함수 크기
- **문제**: 일부 함수가 100줄 이상
- **영향**: 코드 복잡도 증가
- **해결**: 함수 분리 리팩토링

### 8. 국제화 미지원
- **문제**: 모든 UI 텍스트가 한국어로 하드코딩
- **영향**: 다국어 지원 불가
- **해결**: Chrome i18n API 도입 고려 (선택사항)

### 9. 최소 문서화
- **문제**: README.md가 단 6줄
- **영향**: 신규 기여자 및 사용자 이해도 저하
- **해결**: 포괄적인 문서 작성

---

## 🎯 코드 품질 평가

### 강점
✅ 광범위한 한국어 주석으로 잘 문서화됨
✅ 일관된 코드 포맷팅 (Prettier 설정)
✅ 모던 JavaScript 사용 (async/await, ES6+)
✅ 관심사의 명확한 분리가 있는 모듈 구조
✅ 접근성 테스트를 위한 포괄적인 기능 세트

### 개선 필요 영역
⚠️ 함수 길이 (일부 함수가 100줄 초과)
⚠️ 전역 상태 관리 (dkInspectPause 변수)
⚠️ 매직 넘버 (예: blockWidth = 332, timeouts = 3000ms)
⚠️ 추적 모드와 일반 모드 간 중복 코드
⚠️ 타입 안전성 부족 (TypeScript 미사용)

---

## 📚 참고 자료

### 크레딧
- **기반**: CSSViewer 확장프로그램
- **색상 대비 로직**: WebAIM Color Contrast Checker
- **대각선 측정 방식**: Page Ruler 확장프로그램

### 관련 표준
- [KWCAG 2.1](http://www.wa.or.kr/m1/sub1.asp) - 한국형 웹 콘텐츠 접근성 지침
- [WCAG 2.0](https://www.w3.org/TR/WCAG20/) - 웹 콘텐츠 접근성 지침
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/intro/)

---

## 🚀 시작하기 (개발자용)

### 개발 환경 설정
```bash
# 의존성 설치
npm install

# 코드 포맷팅
npm run format

# 빌드
npm run build
```

### Chrome에 로드
1. Chrome에서 `chrome://extensions/` 접속
2. "개발자 모드" 활성화
3. "압축해제된 확장 프로그램을 로드합니다." 클릭
4. 프로젝트 디렉토리 선택

### 개발 워크플로우
1. `src/` 디렉토리의 소스 코드 수정
2. `npm run build` 실행하여 트랜스파일
3. Chrome에서 확장프로그램 새로고침
4. 테스트 및 디버깅

---

## 📊 프로젝트 메트릭

### 코드 통계
- **총 소스 파일**: 4개 (src/)
- **총 라인 수**: ~1,731줄
- **최대 파일**: dkinspect.js (1,350줄)
- **평균 함수 길이**: 약 30줄

### 복잡도
- **주요 로직 파일**: dkinspect.js
- **의존성 수**: 3개 (dev)
- **외부 라이브러리**: 1개 (jscolor)

---

## 🔮 향후 개선 방향

### 단기 (현재 작업)
1. ✅ 버전 번호 동기화
2. ✅ JSDoc 문서화 완성
3. ✅ 에러 처리 강화
4. ✅ 코드 리팩토링 (매직 넘버, 큰 함수)
5. ✅ 테스트 코드 작성
6. ✅ README.md 개선

### 중기
1. TypeScript 마이그레이션 고려
2. 빌드 프로세스 개선 (watch 모드)
3. 성능 최적화
4. 추가 접근성 지침 지원

### 장기
1. 다국어 지원 (i18n)
2. 고급 리포팅 기능
3. 데이터 내보내기 기능
4. 자동화된 접근성 검사

---

**문서 작성일**: 2025-11-18
**작성자**: Claude (AI Assistant)
**프로젝트 버전**: 0.13.0
