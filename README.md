# KWCAG A11y Inspector

<div style="text-align:center">

**Languages**: 🇰🇷 [한국어](README.md) | 🇺🇸 [English](README.en.md)

![Version](https://img.shields.io/badge/version-0.13.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome Web Store](https://img.shields.io/badge/chrome-extension-orange.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-brightgreen.svg)

**한국형 웹 콘텐츠 접근성 지침(KWCAG) 2.1 검사를 위한 Chrome 확장프로그램**

[Chrome Web Store](https://chrome.google.com/webstore/detail/kwcag-a11y-inspector/ngcmkfaolkgkjbddhjnhgoekgaamjibo?hl=ko) | [문제 신고](https://github.com/bearholmes/kwcag-a11y-inspector-extension/issues) | [가이드](./PROJECT_ANALYSIS.md)

</div>

---

## 📋 소개

KWCAG A11y Inspector는 웹 접근성 진단을 위한 Chrome 확장프로그램입니다. KWCAG 2.1의 **2.1.3 조작 가능** 검사항목과 **1.3.3 명도 대비** 검사항목을 실시간으로 측정할 수 있습니다.

### 주요 기능

- ✅ **요소 크기 측정**: 클릭 가능한 요소의 실제 크기를 픽셀(px)과 밀리미터(mm) 단위로 표시
- ✅ **색상 대비 검사**: 텍스트와 배경의 명도 대비율 계산 (WCAG 2.0 기준)
- ✅ **실시간 검사**: 마우스 호버만으로 즉시 측정
- ✅ **수동 계산기**: 직접 입력을 통한 치수 계산
- ✅ **커스터마이징**: 테두리 색상, 스타일, 두께 조정 가능
- ✅ **다양한 모니터 지원**: 11~40인치, 다양한 해상도 설정
- ✅ **다국어 지원**: 11개 언어 지원 (한국어, 영어, 중국어, 일본어, 독일어, 프랑스어, 스페인어, 이탈리아어, 러시아어, 포르투갈어)

---

## 🎯 측정 기준

### KWCAG 2.1.3 - 조작 가능

- **최소 크기**: 6mm × 6mm (약 45px × 45px @96DPI)
- **측정 범위**: box + padding + border
- **대상 요소**: 링크, 버튼, 입력 필드 등 인터랙티브 요소

### WCAG 1.3.3 - 명도 대비

- **AA 등급**: 4.5:1 이상 (일반 텍스트)
- **AAA 등급**: 7:1 이상 (일반 텍스트)
- **계산 방식**: WCAG 2.0 상대 휘도(Relative Luminance) 기반

---

## 🚀 설치 방법

### Chrome Web Store에서 설치 (권장)

1. [KWCAG A11y Inspector](https://chrome.google.com/webstore/detail/kwcag-a11y-inspector/ngcmkfaolkgkjbddhjnhgoekgaamjibo?hl=ko) 페이지 방문
2. "Chrome에 추가" 버튼 클릭
3. 설치 완료 후 옵션 페이지에서 모니터 설정

### 수동 설치 (개발자용)

```bash
# 저장소 복제
git clone https://github.com/bearholmes/kwcag-a11y-inspector-extension.git
cd kwcag-a11y-inspector-extension

# 의존성 설치
npm install

# 빌드
npm run build

# Chrome에서 로드
# 1. chrome://extensions/ 접속
# 2. "개발자 모드" 활성화
# 3. "압축해제된 확장 프로그램을 로드합니다." 클릭
# 4. 프로젝트 디렉토리 선택
```

---

## 💡 사용 방법

### 기본 사용법

1. **확장프로그램 아이콘 클릭** 또는 단축키로 활성화
2. 검사하려는 요소 위에 **마우스 호버**
3. 실시간으로 크기와 색상 대비 정보 확인
4. **ESC 키**로 일시정지/재개

### 수동 계산기 사용

1. 페이지에서 **우클릭**
2. "수동계산 팝업 열기" 선택
3. 높이와 너비를 픽셀 단위로 입력
4. "확인" 버튼으로 mm 단위 결과 확인

### 설정 변경

1. 확장프로그램 아이콘 **우클릭** → "옵션"
2. 모니터 크기 및 해상도 설정
3. 표시 옵션 및 스타일 커스터마이징
4. 설정은 자동으로 Chrome 동기화에 저장

---

## 🛠️ 기술 스택

### 런타임

- **Chrome Extension API** (Manifest V3)
- **TypeScript** (ES2020) - 핵심 모듈 마이그레이션 완료
- **JavaScript** (ES2020) - 레거시 코드
- **CSS3**
- **Chrome i18n API** - 다국어 지원 (11개 언어)

### 개발 도구

- **Vite** - 빌드 도구 (TypeScript 지원)
- **TypeScript** - 타입 안전성 강화
- **Prettier** - 코드 포맷팅
- **ESLint** - 코드 품질 검사
- **Jest** - 단위 테스트 (28.53% 커버리지)
- **JSDoc** - 전체 코드 문서화 완료
- **Husky** - Git 훅 자동화

### 주요 라이브러리

- **@simonwep/pickr** - 색상 선택기 (MIT 라이선스)
- **@types/chrome** - Chrome API 타입 정의

### 코드 품질

- ✅ **TypeScript 마이그레이션**: 핵심 모듈 TypeScript로 전환 (~50%)
- ✅ **엄격한 타입 체킹**: strict 모드 활성화
- ✅ **완전한 JSDoc 문서화**: 모든 함수와 타입에 JSDoc 주석 적용
- ✅ **포괄적 에러 핸들링**: try-catch 블록과 구조화된 에러 메시지
- ✅ **상수 관리**: 매직 넘버 제거 및 CONSTANTS 객체로 중앙 관리
- ✅ **소스맵 지원**: 디버깅을 위한 소스맵 생성
- ✅ **테스트 커버리지**: 28.53% (238개 테스트)

---

## 📁 프로젝트 구조

```
kwcag-a11y-inspector-extension/
├── manifest.json                 # Chrome 확장프로그램 매니페스트
├── package.json                  # NPM 의존성 및 스크립트
├── tsconfig.json                 # TypeScript 설정
├── vite.config.js                # Vite 빌드 설정
│
├── _locales/                     # 국제화 리소스 (11개 언어)
│   ├── ko/messages.json         # 한국어
│   ├── en/messages.json         # 영어
│   └── ...                       # 9개 추가 언어
│
├── src/                          # 소스 코드
│   ├── background/
│   │   └── service-worker.ts    # 백그라운드 스크립트 (TypeScript)
│   ├── content/
│   │   ├── inspector/           # 인스펙터 모듈
│   │   │   ├── constants.ts     # 상수 정의 (TypeScript)
│   │   │   ├── color-utils.ts   # 색상 유틸리티 (TypeScript)
│   │   │   ├── dom-utils.ts     # DOM 유틸리티 (TypeScript)
│   │   │   ├── shortcut-manager.ts  # 단축키 관리자 (TypeScript)
│   │   │   ├── css-handlers.js  # CSS 핸들러
│   │   │   ├── event-handlers.js  # 이벤트 핸들러
│   │   │   ├── inspector-core.js  # 인스펙터 코어
│   │   │   └── index.js         # 진입점
│   │   └── calculator.js        # 수동 계산기
│   ├── options/
│   │   ├── settings.html        # 설정 페이지
│   │   └── settings.js          # 설정 로직
│   └── shared/
│       ├── storage-utils.ts     # Storage 유틸리티 (TypeScript)
│       └── dom-utils.ts         # 공통 DOM 유틸리티 (TypeScript)
│
├── tests/                        # 테스트 코드
│   ├── content/                 # 콘텐츠 스크립트 테스트
│   ├── background/              # 백그라운드 테스트
│   ├── options/                 # 옵션 페이지 테스트
│   └── shared/                  # 공통 유틸리티 테스트
│
├── dist/                         # 빌드 결과물
│   ├── background/
│   ├── content/
│   ├── options/
│   └── assets/
│
└── docs/                         # 문서
    ├── PROJECT_ANALYSIS.md      # 프로젝트 상세 분석
    ├── CICD_PLAN.md             # CI/CD 파이프라인 설계
    ├── E2E_TEST_PLAN.md         # E2E 테스트 계획
    └── ROADMAP.md               # 프로젝트 로드맵
```

---

## 🔧 개발 가이드

### 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 모드 (파일 감시)
npm run watch

# 빌드
npm run build

# 프로덕션 빌드 (최소화)
npm run build:prod

# 코드 포맷팅
npm run format

# 테스트 실행
npm test

# 테스트 (watch 모드)
npm run test:watch

# 테스트 커버리지
npm run test:coverage
```

### 코드 스타일

- **Prettier** 설정 준수
- **JSDoc** 주석 필수 (모든 함수)
- **한국어 주석** 권장 (비즈니스 로직)
- **ES2020** 문법 사용
- **에러 핸들링** 필수 (try-catch 블록)
- **타입 정의** 권장 (JSDoc @typedef)

### 보안 및 성능 주의사항

#### 보안

- ✅ Chrome 내부 페이지 및 스토어 페이지 접근 차단 구현됨
- ✅ 모든 사용자 입력에 대한 유효성 검증 필수
- ✅ XSS 방지를 위한 DOM 조작 시 textContent 사용 권장
- ⚠️ `eval()` 사용 금지
- ⚠️ `innerHTML` 사용 시 주의 (가능한 `textContent` 사용)

#### 성능

- ✅ ES2020 타겟으로 번들 크기 최적화 (약 130KB)
- ✅ 이벤트 리스너 최소화 및 적절한 해제
- ✅ DOM 접근 캐싱으로 성능 향상
- ⚠️ 대량 DOM 조작 시 `DocumentFragment` 사용 권장
- ⚠️ 긴 작업은 `requestAnimationFrame` 또는 `setTimeout`으로 분할

#### 접근성

- ✅ 키보드 단축키 지원 (ESC)
- ✅ 명확한 에러 메시지 제공
- ⚠️ 새로운 UI 요소 추가 시 ARIA 속성 고려

### 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드 설정 등
perf: 성능 개선
security: 보안 패치
i18n: 국제화 관련
```

---

## 🧪 테스트

### 단위 테스트

```bash
# 전체 테스트 실행
npm test

# 특정 파일 테스트
npm test -- src/__tests__/calculations.test.js

# 커버리지 리포트 생성
npm run test:coverage
```

### 수동 테스트 체크리스트

- [ ] 다양한 웹사이트에서 요소 측정
- [ ] 여러 모니터 설정에서 정확도 확인
- [ ] 색상 대비 계산 정확성 검증
- [ ] Chrome 내부 페이지에서 적절한 에러 메시지 표시
- [ ] 옵션 변경 시 즉시 반영 확인

---

## 📊 성능 최적화

### 번들 크기

- **dkinspect.js**: ~100KB (트랜스파일 후)
- **전체**: ~130KB
- **로딩 시간**: ~9ms (ES2020 타겟)
- **국제화 리소스**: 각 언어당 ~3KB

### 최적화 기법

- ✅ ES2020 타겟으로 불필요한 트랜스파일 제거 (Chrome 88+)
- ✅ Babel `modules: false` 설정으로 트리 쉐이킹 지원
- ✅ 소스맵 생성으로 디버깅 용이
- ✅ 이벤트 리스너 최소화 및 적절한 해제
- ✅ DOM 접근 캐싱
- ✅ 매직 넘버 제거 및 상수 중앙 관리로 유지보수성 향상

### 로딩 성능

- **초기 로딩**: Chrome Storage에서 설정 비동기 로드
- **스크립트 주입**: 필요 시에만 동적 주입 (Lazy Loading)
- **메모리 관리**: 인스펙터 비활성화 시 이벤트 리스너 정리

---

## 🤝 기여 방법

### 버그 리포트

버그를 발견하셨나요? [Issues](https://github.com/bearholmes/kwcag-a11y-inspector-extension/issues)에 다음 정보와 함께 제보해주세요:

- 환경 정보 (Chrome 버전, OS)
- 재현 단계
- 예상 동작 vs 실제 동작
- 스크린샷 (가능한 경우)

### Pull Request

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 개발 가이드라인

- [ ] 코드 스타일 준수 (`npm run format`)
- [ ] 테스트 추가 (`npm test`)
- [ ] JSDoc 주석 작성
- [ ] README 업데이트 (필요 시)

---

## 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

```
MIT License

Copyright (c) 2023 bearholmes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 크레딧

이 프로젝트는 다음 오픈소스 프로젝트에서 영감을 받았습니다:

- **[CSSViewer](https://github.com/miled/cssviewer)** - 기본 인스펙터 구조
- **[WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)** - 색상 대비 계산 알고리즘
- **[Page Ruler](https://github.com/wrakky/page-ruler)** - 대각선 측정 방식

---

## 📚 참고 자료

### 접근성 지침

- [KWCAG 2.1](http://www.wa.or.kr/m1/sub1.asp) - 한국형 웹 콘텐츠 접근성 지침
- [WCAG 2.0](https://www.w3.org/TR/WCAG20/) - 웹 콘텐츠 접근성 지침
- [WebAIM](https://webaim.org/) - 접근성 자료

### Chrome Extension

- [Manifest V3 가이드](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)

---

## 📞 지원

문제가 있거나 질문이 있으신가요?

- 📧 이메일: bearholmes@gmail.com
- 🐛 버그 리포트: [GitHub Issues](https://github.com/bearholmes/kwcag-a11y-inspector-extension/issues)
- 📖 문서: [프로젝트 분석 문서](./PROJECT_ANALYSIS.md)

---

## 🗺️ 로드맵

### v0.13.0 (완료) ✅

- [x] 국제화(i18n) 지원 - 11개 언어
- [x] 전체 JSDoc 문서화 완료
- [x] 포괄적 에러 핸들링 구현
- [x] ES2020 타겟 빌드 최적화
- [x] 매직 넘버 제거 및 상수 중앙 관리
- [x] 소스맵 생성 지원
- [x] **단위 테스트 구현** (Jest, 28.53% 커버리지)
- [x] **TypeScript 마이그레이션 시작** (핵심 모듈 50% 완료)
- [x] **Pickr 색상 선택기 통합** (jscolor → Pickr, MIT 라이선스)
- [x] **CI/CD 파이프라인 설계 문서화** (GitHub Actions)
- [x] **E2E 테스트 계획 문서화** (Puppeteer)

### v0.14.0 (진행 중) 🚧

- [x] **TypeScript 마이그레이션 100% 완료** ✅
  - [x] 핵심 유틸리티 (constants, storage-utils, dom-utils, color-utils, shortcut-manager, service-worker)
  - [x] Inspector 모듈 (inspector-core, css-handlers, event-handlers)
  - [x] Calculator 모듈 (calculator)
  - [x] Settings 모듈 (settings)
  - 총 12개 파일 마이그레이션 완료
- [ ] 테스트 커버리지 80% 달성
- [ ] CI/CD 파이프라인 구현 (Phase 1)
- [ ] E2E 테스트 구현 시작

### v0.15.0 (계획 중)

- [ ] CI/CD 파이프라인 완전 자동화 (Phase 2-3)
- [ ] E2E 테스트 커버리지 100% (핵심 시나리오)
- [ ] 테스트 커버리지 80% 달성
- [ ] 추가 WCAG 지침 지원 (2.5.5 목표 크기)
- [ ] 성능 최적화 및 프로파일링

### v0.16.0 (향후)

- [ ] 리포팅 기능 추가
- [ ] 전체 페이지 스캔 기능
- [ ] 결과 내보내기 (CSV, JSON, PDF)
- [ ] 사용자 정의 기준 설정
- [ ] Chrome DevTools 패널 통합

---

## ⭐ Star History

이 프로젝트가 도움이 되셨다면 ⭐을 눌러주세요!

---

<div style="text-align:center">

**Made with ❤️ for Web Accessibility**

[⬆ Back to Top](#kwcag-a11y-inspector)

</div>
