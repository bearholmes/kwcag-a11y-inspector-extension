/**
 * Tests for storage-utils.js
 * Tests Chrome Storage API wrapper with Promise-based interface
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { StorageManager } from '../../src/shared/storage-utils.ts';

describe('StorageManager', () => {
  beforeEach(() => {
    // Reset chrome mock before each test
    chrome.runtime.lastError = null;
    jest.clearAllMocks();
  });

  describe('get', () => {
    test('retrieves value from storage successfully', async () => {
      const testKey = 'monitors';
      const testValue = '17';

      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ [testKey]: testValue });
      });

      const result = await StorageManager.get(testKey);
      expect(result).toBe(testValue);
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(
        [testKey],
        expect.any(Function),
      );
    });

    test('retrieves undefined for non-existent key', async () => {
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const result = await StorageManager.get('nonexistent');
      expect(result).toBeUndefined();
    });

    test('rejects with error when storage operation fails', async () => {
      const errorMessage = 'Storage quota exceeded';
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        chrome.runtime.lastError = { message: errorMessage };
        callback({});
      });

      await expect(StorageManager.get('test')).rejects.toThrow(errorMessage);
    });

    test('handles complex object values', async () => {
      const testValue = { resolution: '1920x1080', monitor: 24 };
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ settings: testValue });
      });

      const result = await StorageManager.get('settings');
      expect(result).toEqual(testValue);
    });
  });

  describe('set', () => {
    test('saves value to storage successfully', async () => {
      chrome.storage.sync.set.mockImplementation((items, callback) => {
        callback();
      });

      await expect(
        StorageManager.set('monitors', '24'),
      ).resolves.toBeUndefined();
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        { monitors: '24' },
        expect.any(Function),
      );
    });

    test('rejects with error when storage write fails', async () => {
      const errorMessage = 'Storage quota exceeded';
      chrome.storage.sync.set.mockImplementation((items, callback) => {
        chrome.runtime.lastError = { message: errorMessage };
        callback();
      });

      await expect(StorageManager.set('test', 'value')).rejects.toThrow(
        errorMessage,
      );
    });

    test('saves complex objects', async () => {
      const testValue = { ccshow: 1, linkmode: 0, bordersize: 3 };
      chrome.storage.sync.set.mockImplementation((items, callback) => {
        callback();
      });

      await StorageManager.set('settings', testValue);
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        { settings: testValue },
        expect.any(Function),
      );
    });

    test('saves boolean values', async () => {
      chrome.storage.sync.set.mockImplementation((items, callback) => {
        callback();
      });

      await StorageManager.set('trackingmode', true);
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        { trackingmode: true },
        expect.any(Function),
      );
    });
  });

  describe('getMultiple', () => {
    test('retrieves multiple values at once', async () => {
      const testKeys = ['monitors', 'resolutions', 'ccshow'];
      const testValues = {
        monitors: '17',
        resolutions: '1920x1080',
        ccshow: 1,
      };

      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(testValues);
      });

      const result = await StorageManager.getMultiple(testKeys);
      expect(result).toEqual(testValues);
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(
        testKeys,
        expect.any(Function),
      );
    });

    test('returns partial results for missing keys', async () => {
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ monitors: '17' }); // Only one key exists
      });

      const result = await StorageManager.getMultiple([
        'monitors',
        'nonexistent',
      ]);
      expect(result).toEqual({ monitors: '17' });
    });

    test('rejects with error when retrieval fails', async () => {
      const errorMessage = 'Connection error';
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        chrome.runtime.lastError = { message: errorMessage };
        callback({});
      });

      await expect(
        StorageManager.getMultiple(['test1', 'test2']),
      ).rejects.toThrow(errorMessage);
    });
  });

  describe('setMultiple', () => {
    test('saves multiple key-value pairs at once', async () => {
      const testItems = {
        monitors: '24',
        resolutions: '2560x1440',
        ccshow: 1,
      };

      chrome.storage.sync.set.mockImplementation((items, callback) => {
        callback();
      });

      await expect(
        StorageManager.setMultiple(testItems),
      ).resolves.toBeUndefined();
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        testItems,
        expect.any(Function),
      );
    });

    test('rejects with error when bulk save fails', async () => {
      const errorMessage = 'Storage quota exceeded';
      chrome.storage.sync.set.mockImplementation((items, callback) => {
        chrome.runtime.lastError = { message: errorMessage };
        callback();
      });

      await expect(
        StorageManager.setMultiple({ test: 'value' }),
      ).rejects.toThrow(errorMessage);
    });

    test('handles empty object', async () => {
      chrome.storage.sync.set.mockImplementation((items, callback) => {
        callback();
      });

      await expect(StorageManager.setMultiple({})).resolves.toBeUndefined();
    });
  });

  describe('remove', () => {
    test('removes single key successfully', async () => {
      chrome.storage.sync.remove.mockImplementation((keys, callback) => {
        callback();
      });

      await expect(StorageManager.remove('monitors')).resolves.toBeUndefined();
      expect(chrome.storage.sync.remove).toHaveBeenCalledWith(
        'monitors',
        expect.any(Function),
      );
    });

    test('removes multiple keys at once', async () => {
      const keysToRemove = ['monitors', 'resolutions'];

      chrome.storage.sync.remove.mockImplementation((keys, callback) => {
        callback();
      });

      await expect(
        StorageManager.remove(keysToRemove),
      ).resolves.toBeUndefined();
      expect(chrome.storage.sync.remove).toHaveBeenCalledWith(
        keysToRemove,
        expect.any(Function),
      );
    });

    test('rejects with error when removal fails', async () => {
      const errorMessage = 'Permission denied';
      chrome.storage.sync.remove.mockImplementation((keys, callback) => {
        chrome.runtime.lastError = { message: errorMessage };
        callback();
      });

      await expect(StorageManager.remove('test')).rejects.toThrow(errorMessage);
    });
  });

  describe('clear', () => {
    test('clears all storage successfully', async () => {
      chrome.storage.sync.clear.mockImplementation((callback) => {
        callback();
      });

      await expect(StorageManager.clear()).resolves.toBeUndefined();
      expect(chrome.storage.sync.clear).toHaveBeenCalledWith(
        expect.any(Function),
      );
    });

    test('rejects with error when clear fails', async () => {
      const errorMessage = 'Permission denied';
      chrome.storage.sync.clear.mockImplementation((callback) => {
        chrome.runtime.lastError = { message: errorMessage };
        callback();
      });

      await expect(StorageManager.clear()).rejects.toThrow(errorMessage);
    });
  });

  describe('Integration scenarios', () => {
    test('set and get workflow', async () => {
      const testKey = 'userPreference';
      const testValue = { theme: 'dark', fontSize: 14 };

      // Mock set
      chrome.storage.sync.set.mockImplementation((items, callback) => {
        callback();
      });

      await StorageManager.set(testKey, testValue);

      // Mock get to return what was set
      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({ [testKey]: testValue });
      });

      const result = await StorageManager.get(testKey);
      expect(result).toEqual(testValue);
    });

    test('setMultiple and getMultiple workflow', async () => {
      const testData = {
        monitors: '27',
        resolutions: '2560x1440',
        ccshow: 1,
      };

      chrome.storage.sync.set.mockImplementation((items, callback) => {
        callback();
      });

      await StorageManager.setMultiple(testData);

      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback(testData);
      });

      const result = await StorageManager.getMultiple(Object.keys(testData));
      expect(result).toEqual(testData);
    });

    test('set, remove, and verify deletion', async () => {
      chrome.storage.sync.set.mockImplementation((items, callback) => {
        callback();
      });

      await StorageManager.set('tempKey', 'tempValue');

      chrome.storage.sync.remove.mockImplementation((keys, callback) => {
        callback();
      });

      await StorageManager.remove('tempKey');

      chrome.storage.sync.get.mockImplementation((keys, callback) => {
        callback({}); // Key no longer exists
      });

      const result = await StorageManager.get('tempKey');
      expect(result).toBeUndefined();
    });
  });
});
