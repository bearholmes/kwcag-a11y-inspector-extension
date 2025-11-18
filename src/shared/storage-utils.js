/**
 * Chrome Storage API 래퍼 클래스
 * 모든 Storage 작업을 Promise 기반으로 처리
 */
export class StorageManager {
  /**
   * Storage에서 값 가져오기
   * @param {string} key - 키
   * @returns {Promise<any>} 저장된 값
   */
  static get(key) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  /**
   * Storage에 값 저장하기
   * @param {string} key - 키
   * @param {any} value - 저장할 값
   * @returns {Promise<void>}
   */
  static set(key, value) {
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
   * @param {string[]} keys - 키 배열
   * @returns {Promise<Record<string, any>>} 키-값 객체
   */
  static getMultiple(keys) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(keys, (result) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  /**
   * 여러 키-값 쌍을 한 번에 저장하기
   * @param {Record<string, any>} items - 키-값 객체
   * @returns {Promise<void>}
   */
  static setMultiple(items) {
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
   * @param {string|string[]} keys - 삭제할 키 또는 키 배열
   * @returns {Promise<void>}
   */
  static remove(keys) {
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
   * @returns {Promise<void>}
   */
  static clear() {
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
