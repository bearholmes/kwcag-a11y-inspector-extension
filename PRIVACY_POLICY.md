# Privacy Policy / 개인정보처리방침

**Last Updated / 최종 수정일: December 2, 2025 / 2025년 12월 2일**

---

## English

### KWCAG A11y Inspector - Privacy Policy

**KWCAG A11y Inspector** ("the Extension") is committed to protecting your privacy. This Privacy Policy explains how we handle data when you use our web accessibility inspection tool.

### 1. Data Collection

**We do NOT collect any personal data.**

The Extension does not:

- Collect browsing history
- Track which websites you visit
- Store any content from web pages you inspect
- Transmit any data to external servers
- Use analytics or tracking services
- Collect personally identifiable information

### 2. Data Storage

The Extension stores **only user preferences** locally using Chrome's secure storage API:

**Stored Settings:**

- Monitor size (11-40 inches)
- Screen resolution (e.g., 1920x1080)
- Display preferences (border color, style, thickness)
- Feature toggles (color contrast check ON/OFF, box model display ON/OFF)
- Link mode preference (all elements vs. specific elements)

**Storage Method:**

- All data is stored using `chrome.storage.sync`
- Data syncs across your Chrome browsers when signed into the same Google account
- No data is transmitted to our servers or any third-party services

### 3. Permissions Used

The Extension requests the following permissions:

| Permission         | Purpose                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `activeTab`        | Access the current tab only when you click the extension icon or context menu |
| `scripting`        | Inject inspection tools into web pages on-demand                              |
| `storage`          | Save your preferences (monitor settings, UI customization)                    |
| `contextMenus`     | Add "Open Manual Calculator" to right-click menu                              |
| `notifications`    | Show error messages when extension can't run on restricted pages              |
| `host_permissions` | Access web pages to perform accessibility inspection                          |

**All permissions are used solely for accessibility inspection functionality.**

### 4. How Your Data is Used

**User Settings:** Used to calculate accurate pixel-to-millimeter conversions and customize the inspection interface according to your preferences.

**No Other Use:** We do not use your data for advertising, analytics, or any purpose other than providing the extension's accessibility inspection features.

### 5. Third-Party Access

**None.** We do not share, sell, or transmit any data to third parties.

### 6. Data Security

- All data is stored locally on your device using Chrome's secure storage API
- No server-side storage or cloud services are used
- No network requests are made (except to Chrome's sync service if you're signed in)

### 7. Children's Privacy

The Extension does not knowingly collect information from children under 13. It is designed for web developers and accessibility professionals.

### 8. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Significant changes will be announced through the Chrome Web Store listing.

### 9. Open Source

This extension is open source. You can review the code at:
https://github.com/bearholmes/kwcag-a11y-inspector-extension

### 10. Contact

For questions or concerns about this Privacy Policy:

- Email: bearholmes@gmail.com
- GitHub Issues: https://github.com/bearholmes/kwcag-a11y-inspector-extension/issues

---

## 한국어

### KWCAG 접근성 검사기 - 개인정보처리방침

**KWCAG A11y Inspector** ("확장프로그램")는 사용자의 개인정보를 보호하기 위해 최선을 다하고 있습니다. 본 개인정보처리방침은 웹 접근성 검사 도구 사용 시 데이터 처리 방법을 설명합니다.

### 1. 데이터 수집

**개인 데이터를 수집하지 않습니다.**

확장프로그램은 다음을 수행하지 않습니다:

- 브라우징 기록 수집
- 방문한 웹사이트 추적
- 검사한 웹페이지의 콘텐츠 저장
- 외부 서버로 데이터 전송
- 분석 또는 추적 서비스 사용
- 개인 식별 정보 수집

### 2. 데이터 저장

확장프로그램은 Chrome의 보안 저장소 API를 사용하여 **사용자 설정만** 로컬에 저장합니다:

**저장되는 설정:**

- 모니터 크기 (11-40인치)
- 화면 해상도 (예: 1920x1080)
- 표시 옵션 (테두리 색상, 스타일, 두께)
- 기능 토글 (색상 대비 검사 ON/OFF, Box 모델 표시 ON/OFF)
- 링크 모드 설정 (모든 요소 vs. 특정 요소)

**저장 방식:**

- 모든 데이터는 `chrome.storage.sync` 사용
- 동일한 Google 계정으로 로그인한 Chrome 브라우저 간 동기화
- 서버나 제3자 서비스로 데이터 전송 없음

### 3. 사용 권한

확장프로그램이 요청하는 권한:

| 권한               | 사용 목적                                               |
| ------------------ | ------------------------------------------------------- |
| `activeTab`        | 확장 아이콘 또는 컨텍스트 메뉴 클릭 시에만 현재 탭 접근 |
| `scripting`        | 웹페이지에 검사 도구를 온디맨드 방식으로 주입           |
| `storage`          | 사용자 설정 저장 (모니터 설정, UI 커스터마이징)         |
| `contextMenus`     | 우클릭 메뉴에 "수동계산 팝업 열기" 추가                 |
| `notifications`    | 제한된 페이지에서 실행 불가 시 오류 메시지 표시         |
| `host_permissions` | 접근성 검사를 수행하기 위해 웹페이지 접근               |

**모든 권한은 접근성 검사 기능을 위해서만 사용됩니다.**

### 4. 데이터 사용 방법

**사용자 설정:** 정확한 픽셀-밀리미터 변환 계산 및 사용자 선호도에 따른 검사 인터페이스 커스터마이징에 사용됩니다.

**다른 용도 없음:** 광고, 분석 또는 확장프로그램의 접근성 검사 기능 제공 외의 목적으로 데이터를 사용하지 않습니다.

### 5. 제3자 접근

**없음.** 어떠한 데이터도 제3자와 공유, 판매 또는 전송하지 않습니다.

### 6. 데이터 보안

- 모든 데이터는 Chrome의 보안 저장소 API를 사용하여 로컬에 저장
- 서버 측 저장소 또는 클라우드 서비스 미사용
- 네트워크 요청 없음 (로그인 시 Chrome 동기화 서비스 제외)

### 7. 아동 개인정보

확장프로그램은 13세 미만 아동의 정보를 의도적으로 수집하지 않습니다. 웹 개발자 및 접근성 전문가를 위해 설계되었습니다.

### 8. 개인정보처리방침 변경

본 개인정보처리방침은 수시로 업데이트될 수 있습니다. 변경 사항은 "최종 수정일"과 함께 이 페이지에 게시됩니다. 중요한 변경 사항은 Chrome Web Store 리스팅을 통해 공지됩니다.

### 9. 오픈소스

이 확장프로그램은 오픈소스입니다. 코드는 다음에서 확인할 수 있습니다:
https://github.com/bearholmes/kwcag-a11y-inspector-extension

### 10. 문의

개인정보처리방침에 대한 질문이나 우려 사항:

- 이메일: bearholmes@gmail.com
- GitHub Issues: https://github.com/bearholmes/kwcag-a11y-inspector-extension/issues

---

**We are committed to protecting your privacy. Thank you for using KWCAG A11y Inspector.**

**귀하의 개인정보를 보호하기 위해 최선을 다하겠습니다. KWCAG 접근성 검사기를 사용해 주셔서 감사합니다.**
