# KWCAG A11y Inspector Extension

KWCAG 2.1의 2.1.3 조작 가능 검사항목을 측정하기 위한 크롬 확장 프로그램입니다.

## 주요 기능

- KWCAG 2.1의 2.1.3 조작 가능 검사항목(대각선 9mm, 6mm 이상)을 측정하기 위한 기능 제공
- 1.3.3 텍스트 콘텐츠의 명도 대비 검사항목을 측정 시 도움이 될 수 있는 보조 기능 제공
- 요소의 크기 측정 (너비, 높이, 대각선) - 픽셀 및 밀리미터 단위로 표시
- 요소의 색상 및 배경색, 명도 대비 측정 (비율 표시)
- 요소의 Box 모델 정보 표시 (width, height, border, margin, padding 등)
- 링크, 버튼, 입력 필드 등 조작 가능한 요소에 집중된 측정 기능

## 특징

- 페이지 내 모든 요소 또는 특정 조작 요소(a, button, input 태그)만 선택적으로 검사
- 요소 선택 시 시각적 표시 (테두리 스타일, 색상, 두께 설정 가능)
- 분리형 선택자를 통한 명확한 요소 구분
- 수동 계산 기능 (우클릭 컨텍스트 메뉴에서 접근 가능)
- 다양한 모니터 크기 및 해상도 설정 지원
- Esc 키를 이용한 일시정지/재개 기능

## 설치

[Chrome Web Store: KWCAG A11y Inspector](https://chrome.google.com/webstore/detail/kwcag-a11y-inspector/ngcmkfaolkgkjbddhjnhgoekgaamjibo?hl=ko)에서 설치할 수 있습니다.

## 사용 방법

1. 크롬 확장 프로그램 아이콘을 클릭하여 활성화
2. 웹 페이지에서 검사하고자 하는 요소 위에 마우스를 올려놓음
3. 표시되는 정보창에서 요소의 크기, 색상 대비, 박스 모델 정보 확인
4. 우클릭 컨텍스트 메뉴에서 "수동계산 팝업 열기" 선택하여 직접 값 입력 및 계산 가능
5. Esc 키를 눌러 일시정지/재개 가능

## 환경 설정

확장 프로그램 설치 후 옵션 페이지에서 다음 설정을 사용자 지정할 수 있습니다:

- 해상도 기준 (다양한 해상도 옵션 제공)
- 모니터 크기 (11인치부터 40인치까지 다양한 옵션)
- 명도 대비 체크 기능 활성화 여부
- 선택자 라인 스타일 (실선, 점선 등)
- 선택자 색상 및 테두리 두께
- 링크 모드 (모든 요소 또는 조작 요소만 검사)
- 분리형 선택자 및 배경 설정

## 주의사항

- 크롬 브라우저의 특성상 iframe, frame 내부 문서는 확인할 수 없습니다.
- 프레임셋(FRAMESET)의 경우 진단이 불가능합니다.

## 참고 자료

이 확장 프로그램은 다음 도구들을 참고하여 개발되었습니다:

- CSSViewer
- WebAIM의 Color Contrast Checker
- 접근성 컴포넌트 대각선도구 툴
- Page Ruler

## 지원 및 문의

문의사항이나 개선의견이 있으면 다음 링크를 통해 연락주세요:
[문의하기](https://chrome.google.com/webstore/detail/dk-a11y-inspector/ngcmkfaolkgkjbddhjnhgoekgaamjibo/support?hl=ko)

## 라이선스

MIT License

## 제작자

bearholmes <bearholmes@gmail.com>

[GitHub](https://github.com/bearholmes)
