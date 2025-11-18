# CI/CD 파이프라인 설계 문서

**프로젝트**: KWCAG A11y Inspector Extension
**문서 버전**: 1.0
**작성일**: 2025-11-18
**상태**: 설계 단계 (구현 대기)

---

## 📋 목차

1. [개요](#개요)
2. [CI/CD 아키텍처](#cicd-아키텍처)
3. [GitHub Actions 워크플로우 설계](#github-actions-워크플로우-설계)
4. [자동화 프로세스](#자동화-프로세스)
5. [보안 및 품질 검사](#보안-및-품질-검사)
6. [배포 전략](#배포-전략)
7. [단계별 구현 계획](#단계별-구현-계획)
8. [참고 자료](#참고-자료)

---

## 🎯 개요

### 목적

- 코드 품질 자동 검증
- 테스트 자동 실행 및 커버리지 모니터링
- Chrome Extension 자동 빌드 및 패키징
- Chrome Web Store 배포 자동화
- 릴리스 노트 자동 생성

### 현재 상태

- ✅ Husky + lint-staged를 통한 pre-commit 훅 설정 완료
- ✅ ESLint + Prettier를 통한 코드 품질 관리
- ✅ Jest를 통한 단위 테스트 인프라 구축 (238개 테스트, 28.53% 커버리지)
- ✅ Vite를 통한 빌드 시스템 구축
- ❌ GitHub Actions CI/CD 파이프라인 미구축
- ❌ 자동 배포 시스템 미구축

### 목표

- **단기 (1-2주)**: CI 파이프라인 구축 (빌드, 테스트, 린트)
- **중기 (3-4주)**: CD 파이프라인 구축 (자동 배포)
- **장기 (2-3개월)**: 고급 기능 추가 (E2E 테스트, 성능 모니터링, 자동 릴리스)

---

## 🏗️ CI/CD 아키텍처

### 전체 흐름

```
┌─────────────────┐
│ Developer Push  │
│   to Branch     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│          GitHub Actions Trigger             │
│  - Push to any branch                       │
│  - Pull Request                             │
│  - Manual trigger (workflow_dispatch)       │
└────────┬────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────┐
│             CI Pipeline (자동)               │
│                                              │
│  1. Environment Setup                        │
│     - Node.js 20.x                           │
│     - npm install                            │
│                                              │
│  2. Code Quality Checks                      │
│     - ESLint (오류 시 실패)                   │
│     - Prettier check (오류 시 실패)           │
│                                              │
│  3. Tests                                    │
│     - Unit tests (Jest)                      │
│     - Coverage report (28.53% → 목표 80%)    │
│     - E2E tests (Playwright, 향후)           │
│                                              │
│  4. Build                                    │
│     - Vite build                             │
│     - Asset optimization                     │
│     - Bundle analysis                        │
│                                              │
│  5. Security Scan                            │
│     - npm audit                              │
│     - Dependency check                       │
│                                              │
└────────┬────────────────────────────────────┘
         │
         ▼
    ┌───────┐
    │Success│
    └───┬───┘
        │
        ▼ (only on main/next branch)
┌─────────────────────────────────────────────┐
│             CD Pipeline (수동/자동)          │
│                                              │
│  1. Semantic Versioning                      │
│     - Auto bump version                      │
│     - Generate CHANGELOG                     │
│                                              │
│  2. Package Extension                        │
│     - Create .zip for Chrome Web Store       │
│     - Generate source code archive           │
│                                              │
│  3. Create GitHub Release                    │
│     - Tag version                            │
│     - Attach artifacts                       │
│     - Auto-generate release notes            │
│                                              │
│  4. Deploy to Chrome Web Store (수동 승인)   │
│     - Upload extension                       │
│     - Submit for review                      │
│                                              │
└─────────────────────────────────────────────┘
```

---

## 🔧 GitHub Actions 워크플로우 설계

### 1. CI Workflow (`.github/workflows/ci.yml`)

```yaml
name: CI Pipeline

on:
  push:
    branches: ['**']
  pull_request:
    branches: [main, next]
  workflow_dispatch:

jobs:
  # ===== Job 1: 코드 품질 검사 =====
  lint:
    name: Code Quality Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Check Prettier formatting
        run: npx prettier --check .

  # ===== Job 2: 테스트 =====
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info
          fail_ci_if_error: false

      - name: Comment coverage on PR
        if: github.event_name == 'pull_request'
        uses: romeovs/lcov-reporter-action@v0.3.1
        with:
          lcov-file: ./coverage/lcov.info
          github-token: ${{ secrets.GITHUB_TOKEN }}

  # ===== Job 3: 빌드 =====
  build:
    name: Build Extension
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build extension
        run: npm run build

      - name: Check build output
        run: |
          if [ ! -d "dist" ]; then
            echo "Build failed: dist directory not found"
            exit 1
          fi
          echo "Build successful!"
          ls -lah dist/

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: extension-build
          path: dist/
          retention-days: 7

  # ===== Job 4: 보안 스캔 =====
  security:
    name: Security Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true

      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        continue-on-error: true
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

### 2. CD Workflow (`.github/workflows/release.yml`)

```yaml
name: Release Pipeline

on:
  push:
    branches: [main]
    tags:
      - 'v*'
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to release (e.g., 1.0.0)'
        required: true

jobs:
  # ===== Job 1: 릴리스 준비 =====
  prepare-release:
    name: Prepare Release
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Determine version
        id: version
        run: |
          if [ "${{ github.event.inputs.version }}" != "" ]; then
            VERSION="${{ github.event.inputs.version }}"
          else
            VERSION=$(node -p "require('./package.json').version")
          fi
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "Releasing version: $VERSION"

      - name: Generate CHANGELOG
        run: npx conventional-changelog -p angular -i CHANGELOG.md -s

      - name: Commit version bump
        if: github.event.inputs.version != ''
        run: |
          npm version ${{ github.event.inputs.version }} --no-git-tag-version
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add package.json CHANGELOG.md
          git commit -m "chore: release v${{ steps.version.outputs.version }}"
          git push

  # ===== Job 2: 빌드 및 패키징 =====
  build-and-package:
    name: Build and Package
    runs-on: ubuntu-latest
    needs: prepare-release
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build extension
        run: npm run build

      - name: Create extension package
        run: |
          cd dist
          zip -r ../kwcag-a11y-inspector-v${{ needs.prepare-release.outputs.version }}.zip .
          cd ..

      - name: Create source code archive
        run: |
          git archive --format=zip --output=source-code-v${{ needs.prepare-release.outputs.version }}.zip HEAD

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: release-artifacts
          path: |
            kwcag-a11y-inspector-v${{ needs.prepare-release.outputs.version }}.zip
            source-code-v${{ needs.prepare-release.outputs.version }}.zip

  # ===== Job 3: GitHub Release 생성 =====
  create-release:
    name: Create GitHub Release
    runs-on: ubuntu-latest
    needs: [prepare-release, build-and-package]
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: release-artifacts

      - name: Generate release notes
        id: release_notes
        run: |
          npx conventional-changelog -p angular | tail -n +3 > release-notes.md
          cat release-notes.md

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ needs.prepare-release.outputs.version }}
          name: Release v${{ needs.prepare-release.outputs.version }}
          body_path: release-notes.md
          files: |
            kwcag-a11y-inspector-v${{ needs.prepare-release.outputs.version }}.zip
            source-code-v${{ needs.prepare-release.outputs.version }}.zip
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  # ===== Job 4: Chrome Web Store 배포 (수동 승인) =====
  deploy-to-webstore:
    name: Deploy to Chrome Web Store
    runs-on: ubuntu-latest
    needs: [prepare-release, create-release]
    environment:
      name: production
      url: https://chrome.google.com/webstore/detail/kwcag-a11y-inspector/ngcmkfaolkgkjbddhjnhgoekgaamjibo
    steps:
      - name: Download artifacts
        uses: actions/download-artifact@v4
        with:
          name: release-artifacts

      - name: Upload to Chrome Web Store
        uses: PlasmoHQ/bpp@v3
        with:
          keys: ${{ secrets.CHROME_WEBSTORE_KEYS }}
          artifact: kwcag-a11y-inspector-v${{ needs.prepare-release.outputs.version }}.zip
          chrome-extension-id: ngcmkfaolkgkjbddhjnhgoekgaamjibo
```

### 3. E2E Test Workflow (`.github/workflows/e2e.yml`) - 향후

```yaml
name: E2E Tests

on:
  pull_request:
    branches: [main, next]
  schedule:
    - cron: '0 2 * * *' # 매일 오전 2시
  workflow_dispatch:

jobs:
  e2e-test:
    name: E2E Tests (Playwright)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Build extension
        run: npm run build

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: e2e-test-results
          path: test-results/
          retention-days: 30
```

---

## 🔄 자동화 프로세스

### 1. PR 생성 시

```
1. Lint 검사 실행
2. Unit 테스트 실행
3. Coverage 리포트 생성 및 PR에 코멘트
4. 빌드 실행 및 artifacts 생성
5. 보안 스캔 실행
```

**성공 조건**: 모든 검사 통과
**실패 시**: PR 머지 차단, 실패한 항목 표시

### 2. Main/Next 브랜치에 머지 시

```
1. PR 검사 항목 재실행
2. 빌드 artifacts 생성
3. (옵션) 자동 버전 범프
```

### 3. 릴리스 태그 생성 시 (`v*`)

```
1. CHANGELOG 자동 생성
2. Extension 패키징 (.zip)
3. Source code 아카이브 생성
4. GitHub Release 자동 생성
5. (수동 승인 후) Chrome Web Store 배포
```

---

## 🛡️ 보안 및 품질 검사

### 코드 품질

| 검사 항목     | 도구     | 임계값                | 실패 시 동작        |
| ------------- | -------- | --------------------- | ------------------- |
| Linting       | ESLint   | 에러 0개              | CI 실패             |
| Formatting    | Prettier | 100% 준수             | CI 실패             |
| Test Coverage | Jest     | 현재 28.53%, 목표 80% | 경고만 (실패 안 함) |
| Bundle Size   | Vite     | < 500KB               | 경고만              |

### 보안 검사

| 검사 항목          | 도구            | 실행 시점 | 실패 시 동작        |
| ------------------ | --------------- | --------- | ------------------- |
| Dependency Audit   | npm audit       | 모든 PR   | moderate 이상: 경고 |
| Vulnerability Scan | Snyk            | 모든 PR   | 고위험: CI 실패     |
| License Check      | license-checker | 릴리스 시 | GPL 발견 시: 경고   |

---

## 📦 배포 전략

### 환경 분리

```
┌──────────────────────┐
│  Development (dev)   │  ← Feature branches
│  - 자동 빌드          │
│  - 수동 테스트        │
└──────────┬───────────┘
           │
           ▼ (PR merge)
┌──────────────────────┐
│  Staging (next)      │  ← Next branch
│  - 자동 빌드          │
│  - E2E 테스트         │
│  - 베타 테스터 배포    │
└──────────┬───────────┘
           │
           ▼ (release)
┌──────────────────────┐
│  Production (main)   │  ← Main branch
│  - 릴리스 태그 생성    │
│  - Chrome Web Store  │
│  - 전체 사용자 배포    │
└──────────────────────┘
```

### 버전 관리 전략 (Semantic Versioning)

```
v{MAJOR}.{MINOR}.{PATCH}

MAJOR: 호환되지 않는 API 변경
MINOR: 하위 호환되는 기능 추가
PATCH: 하위 호환되는 버그 수정

예시:
- v0.13.0 → v0.13.1 (버그 수정)
- v0.13.1 → v0.14.0 (새 기능 추가)
- v0.14.0 → v1.0.0 (메이저 릴리스)
```

### 릴리스 프로세스

1. **개발 완료** → `feature/*` 브랜치에서 작업
2. **PR 생성** → `next` 브랜치로 PR
3. **코드 리뷰** → 리뷰 및 CI 통과 확인
4. **Staging 배포** → `next` 브랜치에 머지
5. **베타 테스트** → 베타 테스터 그룹 테스트
6. **Production 준비** → `main` 브랜치로 PR
7. **릴리스 생성** → 태그 푸시 (`v1.0.0`)
8. **자동 배포** → GitHub Release + Chrome Web Store

---

## 📋 단계별 구현 계획

### Phase 1: CI 파이프라인 구축 (1-2주) 🔴 우선순위 높음

**Week 1: 기본 CI 설정**

- [ ] `.github/workflows/ci.yml` 작성
  - [ ] Lint job 구현
  - [ ] Test job 구현
  - [ ] Build job 구현
- [ ] Branch protection rules 설정
  - [ ] main, next 브랜치 보호
  - [ ] CI 통과 필수 설정
  - [ ] 최소 1명 리뷰 필수

**Week 2: 고급 CI 기능**

- [ ] Coverage 리포트 통합 (Codecov)
- [ ] PR 코멘트 자동화
- [ ] Security scan 통합 (npm audit, Snyk)
- [ ] Build artifacts 업로드
- [ ] Slack/Discord 알림 통합 (선택)

**예상 효과**:

- ✅ 코드 품질 자동 검증
- ✅ 테스트 자동 실행
- ✅ 빌드 오류 조기 발견
- ✅ PR 머지 전 검증 강화

---

### Phase 2: CD 파이프라인 구축 (3-4주) 🟡 우선순위 중간

**Week 3: Release 자동화**

- [ ] `.github/workflows/release.yml` 작성
- [ ] Semantic versioning 자동화
  - [ ] conventional-commits 설정
  - [ ] 자동 버전 범프
- [ ] CHANGELOG 자동 생성
- [ ] GitHub Release 자동 생성

**Week 4: Chrome Web Store 배포**

- [ ] Chrome Web Store API 키 발급
- [ ] Extension 패키징 자동화
- [ ] 배포 승인 프로세스 설정
- [ ] 배포 후 검증 스크립트

**예상 효과**:

- ✅ 릴리스 프로세스 간소화 (수동 1시간 → 자동 10분)
- ✅ 배포 실수 감소
- ✅ 릴리스 노트 자동 생성
- ✅ 일관된 배포 프로세스

---

### Phase 3: 고급 기능 추가 (2-3개월) 🟢 우선순위 낮음

**Month 1: E2E 테스트**

- [ ] Playwright 설정
- [ ] E2E 테스트 시나리오 작성
  - [ ] 확장 프로그램 설치 테스트
  - [ ] 핵심 기능 동작 테스트 (요소 검사, 색상 대비, 계산기)
  - [ ] 옵션 페이지 테스트
- [ ] `.github/workflows/e2e.yml` 작성
- [ ] 스케줄 테스트 설정 (nightly)

**Month 2: 성능 모니터링**

- [ ] Bundle size 모니터링
- [ ] Lighthouse CI 통합
- [ ] 성능 회귀 탐지
- [ ] 성능 리포트 자동 생성

**Month 3: 배포 전략 고도화**

- [ ] Canary deployment (소수 사용자 먼저 배포)
- [ ] Rollback 전략
- [ ] A/B 테스팅 인프라
- [ ] 사용자 피드백 자동 수집

**예상 효과**:

- ✅ 프로덕션 버그 감소
- ✅ 성능 회귀 방지
- ✅ 사용자 경험 향상
- ✅ 데이터 기반 의사결정

---

## 💰 비용 분석

### GitHub Actions 사용량 (무료 티어)

| 플랜               | 월 무료 시간 | 예상 사용량 |
| ------------------ | ------------ | ----------- |
| Public Repository  | 무제한       | N/A         |
| Private Repository | 2,000분      | ~500분/월   |

**예상 워크플로우 실행 시간**:

- CI (lint + test + build): ~5분/실행
- E2E: ~10분/실행
- Release: ~3분/실행

**월 예상 실행 횟수**:

- CI: ~100회 (PR + push) = 500분
- E2E: ~30회 (PR + nightly) = 300분
- Release: ~4회 = 12분
- **총합**: ~812분/월

→ Public repo이므로 **무료**
→ Private repo라면 무료 티어 내 사용 가능

### 외부 서비스 비용

| 서비스  | 목적            | 무료 티어          | 유료 플랜    |
| ------- | --------------- | ------------------ | ------------ |
| Codecov | Coverage 리포트 | ✅ 무료 (오픈소스) | -            |
| Snyk    | 보안 스캔       | ✅ 무료 (오픈소스) | -            |
| Sentry  | 에러 모니터링   | ✅ 5K errors/월    | $26/월 (50K) |

**총 예상 비용**: **$0/월** (오픈소스 프로젝트)

---

## 🔐 필요한 Secrets

GitHub Repository Settings → Secrets에 등록 필요:

```bash
# Chrome Web Store API (배포용)
CHROME_WEBSTORE_CLIENT_ID=xxx
CHROME_WEBSTORE_CLIENT_SECRET=xxx
CHROME_WEBSTORE_REFRESH_TOKEN=xxx

# 또는 BPP 통합 키
CHROME_WEBSTORE_KEYS='{"client_id":"xxx","client_secret":"xxx","refresh_token":"xxx"}'

# 보안 스캔 (선택)
SNYK_TOKEN=xxx

# Coverage 리포트 (선택)
CODECOV_TOKEN=xxx

# 알림 (선택)
SLACK_WEBHOOK_URL=xxx
DISCORD_WEBHOOK_URL=xxx
```

---

## 📊 성공 지표 (KPI)

### CI/CD 성능 지표

| 지표             | 현재          | 목표     | 측정 방법      |
| ---------------- | ------------- | -------- | -------------- |
| CI 실행 시간     | N/A           | < 5분    | GitHub Actions |
| CI 성공률        | N/A           | > 95%    | GitHub Actions |
| 배포 주기        | 수동 (불규칙) | 주 1회   | Release 횟수   |
| 배포 시간        | ~1시간 (수동) | < 10분   | GitHub Actions |
| 프로덕션 버그    | ?             | 50% 감소 | Issue tracker  |
| Hotfix 배포 시간 | ~1일          | < 1시간  | Release 시간   |

### 코드 품질 지표

| 지표            | 현재                | 목표    | 측정 방법       |
| --------------- | ------------------- | ------- | --------------- |
| Test Coverage   | 28.53%              | 80%     | Jest coverage   |
| Linting 에러    | 0                   | 0       | ESLint          |
| Security 취약점 | 0 (high)            | 0       | npm audit, Snyk |
| Bundle Size     | 29.90 kB (settings) | < 35 kB | Vite build      |

---

## 🔧 로컬 테스트 방법

CI/CD 파이프라인을 로컬에서 테스트:

```bash
# Act 설치 (GitHub Actions를 로컬에서 실행)
brew install act  # macOS
# or
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash  # Linux

# CI 워크플로우 로컬 실행
act push

# 특정 job만 실행
act -j lint
act -j test
act -j build

# Secrets 파일 사용
act -s GITHUB_TOKEN=xxx push
```

---

## 📚 참고 자료

### GitHub Actions

- [GitHub Actions 문서](https://docs.github.com/en/actions)
- [Workflow 문법](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)

### Chrome Extension 배포

- [Chrome Web Store API](https://developer.chrome.com/docs/webstore/using_webstore_api/)
- [PlasmoHQ BPP](https://github.com/PlasmoHQ/bpp) - Browser Platform Publisher
- [Chrome Extension 배포 가이드](https://developer.chrome.com/docs/webstore/publish/)

### CI/CD 모범 사례

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

### 테스팅

- [Playwright 문서](https://playwright.dev/)
- [Jest 문서](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)

### 보안

- [npm audit 문서](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

## 📝 다음 단계

1. **즉시 시작 가능**:
   - [ ] `.github/workflows/` 디렉토리 생성
   - [ ] `ci.yml` 파일 작성 (lint + test + build)
   - [ ] Branch protection rules 설정

2. **준비 필요**:
   - [ ] Chrome Web Store API 키 발급
   - [ ] Codecov 계정 연동
   - [ ] Snyk 계정 연동

3. **향후 검토**:
   - [ ] E2E 테스트 프레임워크 선택
   - [ ] 성능 모니터링 도구 선택
   - [ ] 에러 트래킹 서비스 도입

---

**문서 작성자**: Claude AI Assistant
**최종 업데이트**: 2025-11-18
**다음 리뷰 예정일**: 2025-12-01
