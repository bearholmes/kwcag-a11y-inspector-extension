/**
 * extension context invalidated 에러 발생 시에도 로컬라이즈된 문자열을
 * 안전하게 반환할 수 있도록 관리하는 헬퍼 모듈입니다.
 */
const EXTENSION_INVALIDATED_MESSAGE = 'Extension context invalidated';

const cachedMessages: Record<string, string> = {};
let contextInvalidated = false;

/**
 * 가져올 수 없는 경우를 대비한 기본 메시지를 선택합니다.
 * @param key - 메시지 키
 * @param fallback - 대체 텍스트
 * @returns 실질적으로 사용할 문자열
 */
function resolveText(key: string, fallback?: string): string {
  if (fallback !== undefined) {
    return fallback;
  }

  const cached = cachedMessages[key];
  if (cached !== undefined) {
    return cached;
  }

  return key;
}

/**
 * 캐시를 검사하고 chrome.i18n에서 가져온 문자열을 반환합니다.
 * @param key - `_locales`에 정의된 메시지 키
 * @param fallback - 가져오지 못할 때 사용할 예비 문자열
 */
export function getLocalizedMessage(key: string, fallback?: string): string {
  if (contextInvalidated) {
    return resolveText(key, fallback);
  }

  try {
    const message = chrome.i18n.getMessage(key);
    if (message) {
      cachedMessages[key] = message;
      return message;
    }

    return resolveText(key, fallback);
  } catch (error) {
    if (isExtensionContextInvalidatedError(error)) {
      contextInvalidated = true;
      return resolveText(key, fallback);
    }

    throw error;
  }
}

function isExtensionContextInvalidatedError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    error.message.includes(EXTENSION_INVALIDATED_MESSAGE)
  );
}
