# 버전 관리 스크립트

## 개요

이 디렉토리는 모든 프로젝트 파일에서 버전 일관성을 보장하는 자동화된 버전 관리 스크립트를 포함하고 있습니다.

## 스크립트

### `sync-version.ts`

`package.json`의 버전 번호를 다음 파일들에 자동으로 동기화합니다:

- `README.md` - 버전 뱃지
- `README.en.md` - 버전 뱃지
- `dist/manifest.json` - 빌드 시 (vite.config.js에서 처리)

## 사용법

### 자동 버전 관리 (권장)

npm의 내장 버전 명령어를 사용하면 다음이 자동으로 실행됩니다:

1. `package.json`의 버전 업데이트
2. 모든 README 파일로 버전 동기화
3. git 커밋 생성
4. git 태그 생성
5. 원격 저장소로 푸시 (태그 포함)

```bash
# 패치 버전 증가 (1.0.0 → 1.0.1)
npm version patch

# 마이너 버전 증가 (1.0.0 → 1.1.0)
npm version minor

# 메이저 버전 증가 (1.0.0 → 2.0.0)
npm version major

# 특정 버전 설정
npm version 1.2.3
```

### 수동 버전 동기화

git 커밋 없이 버전을 수동으로 동기화해야 하는 경우:

```bash
npm run version:sync
```

## 작동 방식

### npm 버전 라이프사이클

`npm version [patch|minor|major]`를 실행하면 다음이 자동으로 발생합니다:

1. **preversion** (선택 사항) - 버전 증가 전 테스트 실행
2. **version** - `package.json` 업데이트 후:
   - ✅ `npm run version:sync`를 실행하여 README 파일 업데이트
   - ✅ `git add`로 README 파일 스테이징
3. **postversion** - 커밋 및 태그 생성 후:
   - ✅ 커밋 및 태그를 원격 저장소로 푸시

### 버전 동기화 스크립트 세부사항

`sync-version.ts` 스크립트는:

- ✅ `package.json`에서 버전을 읽음 (단일 진실 공급원)
- ✅ 정규식을 사용하여 README 파일의 버전 뱃지 업데이트
- ✅ 가독성을 위한 컬러 콘솔 출력 제공
- ✅ 업데이트된 파일 보고
- ✅ 오류를 우아하게 처리
- ✅ 이미 최신 상태인 파일은 건너뜀

## 기능

### ✨ 단일 진실 공급원

- 버전은 `package.json`에서 한 번만 정의됨
- 다른 모든 파일은 이 소스에서 동기화됨

### 🎨 아름다운 콘솔 출력

- 색상으로 구분된 메시지 (성공, 오류, 정보, 경고)
- 변경 사항의 명확한 표시
- 전문적인 포맷팅

### 🛡️ 오류 처리

- 파일 존재 여부 검증
- 오류 포착 및 보고
- 유용한 오류 메시지 제공

### 🔍 스마트 업데이트

- 버전이 실제로 변경되었을 때만 파일 업데이트
- 변경되지 않은 파일 보고
- 이전 버전 → 새 버전 전환 표시

## 예제

### 표준 릴리스 워크플로우

```bash
# 코드 변경 사항 작업
git add .
git commit -m "feat: Add new feature"

# 버전 증가 및 릴리스
npm version patch

# 출력:
# 🔄 Syncing version across project files...
# ℹ Current version: 1.0.1
# ✓ README.md: 1.0.0 → 1.0.1
# ✓ README.en.md: 1.0.0 → 1.0.1
# ✓ 2 file(s) updated successfully
# ✨ Version sync complete!
#
# v1.0.1
```

### 릴리스 패키지 빌드

```bash
# 버전 증가 후, 빌드 및 패키징
npm run build:zip

# 생성됨: kwcag-a11y-inspector-v1.0.1.zip
```

## 문제 해결

### 스크립트가 실행되지 않음

"tsx: command not found" 오류가 발생하는 경우:

```bash
npm install
```

### Git 푸시 실패

자동 푸시를 원하지 않는 경우, `package.json`에서 `postversion` 스크립트를 제거하세요:

```json
{
  "scripts": {
    "postversion": ""
  }
}
```

### 수동 버전 불일치

버전이 동기화되지 않은 경우:

```bash
npm run version:sync
```

## 모범 사례

1. **항상 `npm version` 사용** - 버전 번호를 수동으로 편집하지 마세요
2. **변경 사항 검토** - `npm version` 실행 전 (자동으로 커밋을 생성합니다)
3. **릴리스 전 테스트** - 버전 명령어는 마지막 단계여야 합니다
4. **시맨틱 버저닝 사용**:
   - `patch` - 버그 수정 (1.0.0 → 1.0.1)
   - `minor` - 새로운 기능 (1.0.0 → 1.1.0)
   - `major` - 호환성이 깨지는 변경 (1.0.0 → 2.0.0)

## 다른 도구와의 통합

### Vite 빌드

`vite.config.js`에는 이미 다음을 수행하는 플러그인이 있습니다:

- `package.json`에서 버전 읽기
- 빌드 시 `dist/manifest.json`에 주입
- 수동 개입 불필요

### Husky & lint-staged

버전 동기화는 git 훅을 준수합니다:

- Prettier가 업데이트된 README 파일을 포맷팅
- ESLint가 동기화 스크립트를 검사
- Git 훅은 버전 커밋 시 정상적으로 실행됨

## 기여하기

버전 동기화가 필요한 새 파일을 추가할 때:

1. `sync-version.ts`의 `FILES_TO_UPDATE` 배열 업데이트
2. 파일 형식에 적합한 정규식 패턴 추가
3. 새 파일로 이 README 업데이트
4. `npm run version:sync`로 테스트
