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
- ✅ **WCAG 2.2 목표 크기 검사**: WCAG 2.5.8 (AA) 및 2.5.5 (AAA) 준수 여부 실시간 표시
- ✅ **색상 대비 검사**: 텍스트와 배경의 명도 대비율 계산 및 AA/AAA 등급 표시 (WCAG 2.0 기준)
- ✅ **실시간 검사**: 마우스 호버만으로 즉시 측정
- ✅ **수동 계산기**: 직접 입력을 통한 치수 계산
- ✅ **커스터마이징**: 테두리 색상, 스타일, 두께 조정 가능
- ✅ **표시 옵션**: Box 모델, 명도 대비 등 선택적 표시 설정
- ✅ **다양한 모니터 지원**: 11~40인치, 다양한 해상도 설정
- ✅ **다국어 지원**: 11개 언어 지원 (한국어, 영어, 중국어, 일본어, 독일어, 프랑스어, 스페인어, 이탈리아어, 러시아어, 포르투갈어)

---

## 🎯 측정 기준

### KWCAG 2.1.3 - 조작 가능

- **최소 크기**: 6mm 대각선 길이 (약 45px × 45px @96DPI)
- **측정 범위**: box + padding + border
- **대상**: 링크, 버튼, 입력 필드 등 인터랙티브 요소

### WCAG 2.5.8 - 목표 크기 (최소, AA 등급)

- **최소 크기**: 24×24 CSS 픽셀
- **기준**: WCAG 2.2 Level AA
- **대상**: 모든 인터랙티브 요소

### WCAG 2.5.5 - 목표 크기 (향상, AAA 등급)

- **향상 크기**: 44×44 CSS 픽셀
- **기준**: WCAG 2.2 Level AAA
- **대상**: 모든 인터랙티브 요소

### WCAG 1.4.3 - 명도 대비

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

## 🤝 기여 방법

### Pull Request

1. 프로젝트를 Fork 합니다
2. Feature 브랜치를 생성합니다 (`git checkout -b
feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'feat: Add
some AmazingFeature'`)
4. 브랜치에 Push 합니다 (`git push origin
feature/AmazingFeature`)
5. Pull Request를 생성합니다

### 개발 가이드라인

- [ ] 코드 스타일 준수 (`npm run format`)
- [ ] 테스트 추가 (`npm test`)
- [ ] JSDoc 주석 작성
- [ ] README 업데이트 (필요 시)

---

## 📜 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 🙏 크레딧

이 프로젝트는 다음 오픈소스 프로젝트 및 도구에서 영감을 받았습니다:

- **[CSSViewer](https://github.com/miled/cssviewer)** - 기본 인스펙터 구조 ([Chrome Web Store](https://chrome.google.com/webstore/detail/cssviewer/ggfgijbpiheegefliciemofobhmofgce))
- **[WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)** - 색상 대비 계산 알고리즘
- **[접근성 컴포넌트 대각선도구](https://chrome.google.com/webstore/detail/chogmnfcfckihakaealpjfjdkbjmkpok)** - 대각선 진단 방식
- **[Page Ruler](https://github.com/wrakky/page-ruler)** - 요소 측정 방식 ([Chrome Web Store](https://chrome.google.com/webstore/detail/page-ruler/jlpkojjdgbllmedoapgfodplfhcbnbpn))

---

## 📚 참고 자료

### 접근성 지침

- [KWCAG 2.1](http://www.wa.or.kr/m1/sub1.asp) - 한국형 웹 콘텐츠 접근성 지침
- [WCAG 2.0](https://www.w3.org/TR/WCAG20/) - 웹 콘텐츠 접근성 지침
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) - 웹 콘텐츠 접근성 지침 2.2
- [WCAG 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) - 목표 크기 (최소, Level AA)
- [WCAG 2.5.5: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - 목표 크기 (향상, Level AAA)
- [WebAIM](https://webaim.org/) - 접근성 자료

### Chrome Extension

- [Manifest V3 가이드](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)

---

## 📞 지원

버그를 발견하셨나요? [Issues](https://github.com/bearholmes/kwcag-a11y-inspector-extension/issues)에 다음 정보와 함께 제보해주세요:

- 환경 정보 (Chrome 버전, OS)
- 재현 단계
- 예상 동작 vs 실제 동작
- 스크린샷 (가능한 경우)

---

## ⭐ Star History

이 프로젝트가 도움이 되셨다면 ⭐을 눌러주세요!

---

<div style="text-align:center">

**Made with ❤️ for Web Accessibility**

[⬆ Back to Top](#kwcag-a11y-inspector)

</div>
