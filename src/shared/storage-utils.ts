/**
 * Chrome Storage API 래퍼 클래스
 * 모든 Storage 작업을 Promise 기반으로 처리
 */
export class StorageManager {
  /**
   * Storage에서 값 가져오기
   * @param key - 키
   * @returns 저장된 값
   */
  static get<T = unknown>(key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result[key] as T | undefined);
        }
      });
    });
  }

  /**
   * Storage에 값 저장하기
   * @param key - 키
   * @param value - 저장할 값
   */
  static set<T = unknown>(key: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * 여러 키의 값을 한 번에 가져오기
   * @param keys - 키 배열
   * @returns 키-값 객체
   */
  static getMultiple<
    T extends Record<string, unknown> = Record<string, unknown>,
  >(keys: string[]): Promise<Partial<T>> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result as Partial<T>);
        }
      });
    });
  }

  /**
   * 여러 키-값 쌍을 한 번에 저장하기
   * @param items - 키-값 객체
   */
  static setMultiple<
    T extends Record<string, unknown> = Record<string, unknown>,
  >(items: T): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set(items, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Storage에서 키 삭제
   * @param keys - 삭제할 키 또는 키 배열
   */
  static remove(keys: string | string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.remove(keys, () => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Storage 전체 초기화
   */
  static clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.clear(() => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }
}
