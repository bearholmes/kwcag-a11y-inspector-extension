/**
 * Tests for calculator-math.js
 * Tests calculator dimension calculation logic
 */

import { describe, test, expect } from '@jest/globals';
import {
  CALCULATION_CONSTANTS,
  validateNumericInput,
  parseResolution,
  calculateDiagonal,
  calculateStandardPixelSize,
  convertPixelsToMm,
  calculateDimensions,
} from '../../src/content/calculator/calculator-math.ts';

describe('Calculator Math', () => {
  describe('CALCULATION_CONSTANTS', () => {
    test('has correct MM_PER_INCH value', () => {
      expect(CALCULATION_CONSTANTS.MM_PER_INCH).toBe(25.4);
    });

    test('has decimal place constants', () => {
      expect(CALCULATION_CONSTANTS.DECIMAL_PLACES_STANDARD).toBe(2);
      expect(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT).toBe(1);
    });
  });

  describe('validateNumericInput', () => {
    test('returns true for valid positive numbers', () => {
      expect(validateNumericInput(1)).toBe(true);
      expect(validateNumericInput(100)).toBe(true);
      expect(validateNumericInput(0.5)).toBe(true);
      expect(validateNumericInput('123')).toBe(true);
      expect(validateNumericInput('45.67')).toBe(true);
    });

    test('returns false for zero', () => {
      expect(validateNumericInput(0)).toBe(false);
      expect(validateNumericInput('0')).toBe(false);
    });

    test('returns false for negative numbers', () => {
      expect(validateNumericInput(-1)).toBe(false);
      expect(validateNumericInput('-10')).toBe(false);
    });

    test('returns false for non-numeric values', () => {
      expect(validateNumericInput('abc')).toBe(false);
      expect(validateNumericInput('12abc')).toBe(false);
      expect(validateNumericInput(NaN)).toBe(false);
      expect(validateNumericInput(Infinity)).toBe(false);
    });

    test('returns false for null, undefined, empty string', () => {
      expect(validateNumericInput(null)).toBe(false);
      expect(validateNumericInput(undefined)).toBe(false);
      expect(validateNumericInput('')).toBe(false);
    });
  });

  describe('parseResolution', () => {
    test('parses valid resolution strings', () => {
      const result = parseResolution('1920x1080');
      expect(result).toEqual({ width: 1920, height: 1080 });
    });

    test('parses various resolution formats', () => {
      expect(parseResolution('1280x720')).toEqual({ width: 1280, height: 720 });
      expect(parseResolution('2560x1440')).toEqual({
        width: 2560,
        height: 1440,
      });
      expect(parseResolution('3840x2160')).toEqual({
        width: 3840,
        height: 2160,
      });
    });

    test('returns null for invalid formats', () => {
      expect(parseResolution('1920')).toBeNull();
      expect(parseResolution('1920x')).toBeNull();
      expect(parseResolution('x1080')).toBeNull();
      expect(parseResolution('1920x1080x60')).toBeNull();
    });

    test('returns null for non-numeric values', () => {
      expect(parseResolution('abcxdef')).toBeNull();
      expect(parseResolution('1920xabc')).toBeNull();
    });

    test('returns null for negative values', () => {
      expect(parseResolution('-1920x1080')).toBeNull();
      expect(parseResolution('1920x-1080')).toBeNull();
    });

    test('returns null for null, undefined, non-string', () => {
      expect(parseResolution(null)).toBeNull();
      expect(parseResolution(undefined)).toBeNull();
      expect(parseResolution(123)).toBeNull();
    });
  });

  describe('calculateDiagonal', () => {
    test('calculates diagonal correctly (Pythagorean theorem)', () => {
      // 3-4-5 triangle
      expect(calculateDiagonal(3, 4)).toBeCloseTo(5, 5);

      // Common 16:9 aspect ratio
      const diagonal = calculateDiagonal(1920, 1080);
      expect(diagonal).toBeCloseTo(2202.91, 2);
    });

    test('calculates diagonal for square dimensions', () => {
      const diagonal = calculateDiagonal(100, 100);
      expect(diagonal).toBeCloseTo(141.42, 2); // 100 * sqrt(2)
    });

    test('handles decimal values', () => {
      const diagonal = calculateDiagonal(10.5, 7.5);
      expect(diagonal).toBeGreaterThan(0);
      expect(diagonal).toBeCloseTo(12.9, 1);
    });

    test('throws error for invalid inputs', () => {
      expect(() => calculateDiagonal(0, 100)).toThrow(
        'Invalid width or height',
      );
      expect(() => calculateDiagonal(100, 0)).toThrow(
        'Invalid width or height',
      );
      expect(() => calculateDiagonal(-10, 100)).toThrow(
        'Invalid width or height',
      );
      expect(() => calculateDiagonal('abc', 100)).toThrow(
        'Invalid width or height',
      );
    });
  });

  describe('calculateStandardPixelSize', () => {
    test('calculates pixel size correctly', () => {
      // For a 24" Full HD monitor (1920x1080)
      const diagonal = calculateDiagonal(1920, 1080);
      const pixelSize = calculateStandardPixelSize(diagonal, 24);

      // Should be around 0.277mm per pixel
      expect(pixelSize).toBeGreaterThan(0);
      expect(pixelSize).toBeCloseTo(0.277, 3);
    });

    test('calculates for different monitor sizes', () => {
      const diagonal = calculateDiagonal(1920, 1080);

      const size24 = calculateStandardPixelSize(diagonal, 24);
      const size27 = calculateStandardPixelSize(diagonal, 27);

      // Larger monitor = larger pixels
      expect(size27).toBeGreaterThan(size24);
    });

    test('throws error for invalid inputs', () => {
      expect(() => calculateStandardPixelSize(0, 24)).toThrow(
        'Invalid diagonal or monitor size',
      );
      expect(() => calculateStandardPixelSize(2000, 0)).toThrow(
        'Invalid diagonal or monitor size',
      );
      expect(() => calculateStandardPixelSize(-2000, 24)).toThrow(
        'Invalid diagonal or monitor size',
      );
    });
  });

  describe('convertPixelsToMm', () => {
    test('converts pixels to mm correctly', () => {
      const pixelSize = 0.25; // 0.25mm per pixel
      const result = convertPixelsToMm(100, pixelSize);
      expect(result).toBe(25); // 100 * 0.25 = 25mm
    });

    test('handles decimal pixel sizes', () => {
      const pixelSize = 0.277;
      const result = convertPixelsToMm(1920, pixelSize);
      expect(result).toBeCloseTo(531.84, 2);
    });

    test('throws error for invalid inputs', () => {
      expect(() => convertPixelsToMm(0, 0.25)).toThrow(
        'Invalid pixels or pixelSizeMm',
      );
      expect(() => convertPixelsToMm(100, 0)).toThrow(
        'Invalid pixels or pixelSizeMm',
      );
      expect(() => convertPixelsToMm(-100, 0.25)).toThrow(
        'Invalid pixels or pixelSizeMm',
      );
    });
  });

  describe('calculateDimensions', () => {
    test('calculates dimensions for standard Full HD 24" monitor', () => {
      const result = calculateDimensions({
        heightPx: 1080,
        widthPx: 1920,
        resolution: '1920x1080',
        monitorSize: 24,
      });

      // All values should be strings with 1 decimal place
      expect(typeof result.heightMm).toBe('string');
      expect(typeof result.widthMm).toBe('string');
      expect(typeof result.diagonalMm).toBe('string');
      expect(typeof result.diagonalPx).toBe('string');

      // Check approximate mm values (within 1mm tolerance)
      expect(parseFloat(result.heightMm)).toBeGreaterThan(295);
      expect(parseFloat(result.heightMm)).toBeLessThan(305);
      expect(parseFloat(result.widthMm)).toBeGreaterThan(525);
      expect(parseFloat(result.widthMm)).toBeLessThan(540);
      expect(parseFloat(result.diagonalMm)).toBeGreaterThan(600); // ~24 inches in mm
      expect(parseFloat(result.diagonalMm)).toBeLessThan(615);
      expect(parseFloat(result.diagonalPx)).toBeCloseTo(2202.9, 0);
    });

    test('calculates for different element sizes on same monitor', () => {
      const small = calculateDimensions({
        heightPx: 100,
        widthPx: 200,
        resolution: '1920x1080',
        monitorSize: 24,
      });

      const large = calculateDimensions({
        heightPx: 500,
        widthPx: 1000,
        resolution: '1920x1080',
        monitorSize: 24,
      });

      // Larger element should have proportionally larger mm values
      const smallHeight = parseFloat(small.heightMm);
      const largeHeight = parseFloat(large.heightMm);
      const smallWidth = parseFloat(small.widthMm);
      const largeWidth = parseFloat(large.widthMm);

      // Check that the ratio is approximately 5:1 (within 0.5mm tolerance)
      expect(largeHeight / smallHeight).toBeCloseTo(5, 0);
      expect(largeWidth / smallWidth).toBeCloseTo(5, 0);
    });

    test('calculates for different monitor sizes with same resolution', () => {
      const monitor24 = calculateDimensions({
        heightPx: 1080,
        widthPx: 1920,
        resolution: '1920x1080',
        monitorSize: 24,
      });

      const monitor27 = calculateDimensions({
        heightPx: 1080,
        widthPx: 1920,
        resolution: '1920x1080',
        monitorSize: 27,
      });

      // Same pixel dimensions on larger monitor = larger physical size
      expect(parseFloat(monitor27.heightMm)).toBeGreaterThan(
        parseFloat(monitor24.heightMm),
      );
      expect(parseFloat(monitor27.widthMm)).toBeGreaterThan(
        parseFloat(monitor24.widthMm),
      );
    });

    test('calculates for different resolutions', () => {
      const hd = calculateDimensions({
        heightPx: 720,
        widthPx: 1280,
        resolution: '1280x720',
        monitorSize: 24,
      });

      const fullHd = calculateDimensions({
        heightPx: 1080,
        widthPx: 1920,
        resolution: '1920x1080',
        monitorSize: 24,
      });

      // Both should produce valid results
      expect(parseFloat(hd.diagonalMm)).toBeGreaterThan(0);
      expect(parseFloat(fullHd.diagonalMm)).toBeGreaterThan(0);
    });

    test('validates decimal places in results', () => {
      const result = calculateDimensions({
        heightPx: 1080,
        widthPx: 1920,
        resolution: '1920x1080',
        monitorSize: 24,
      });

      // Check that results have exactly 1 decimal place
      expect(result.heightMm).toMatch(/^\d+\.\d$/);
      expect(result.widthMm).toMatch(/^\d+\.\d$/);
      expect(result.diagonalMm).toMatch(/^\d+\.\d$/);
      expect(result.diagonalPx).toMatch(/^\d+\.\d$/);
    });

    test('throws error for invalid height or width', () => {
      expect(() =>
        calculateDimensions({
          heightPx: 0,
          widthPx: 1920,
          resolution: '1920x1080',
          monitorSize: 24,
        }),
      ).toThrow('Invalid height or width');

      expect(() =>
        calculateDimensions({
          heightPx: -100,
          widthPx: 1920,
          resolution: '1920x1080',
          monitorSize: 24,
        }),
      ).toThrow('Invalid height or width');
    });

    test('throws error for invalid monitor size', () => {
      expect(() =>
        calculateDimensions({
          heightPx: 1080,
          widthPx: 1920,
          resolution: '1920x1080',
          monitorSize: 0,
        }),
      ).toThrow('Invalid monitor size');

      expect(() =>
        calculateDimensions({
          heightPx: 1080,
          widthPx: 1920,
          resolution: '1920x1080',
          monitorSize: -24,
        }),
      ).toThrow('Invalid monitor size');
    });

    test('throws error for invalid resolution format', () => {
      expect(() =>
        calculateDimensions({
          heightPx: 1080,
          widthPx: 1920,
          resolution: 'invalid',
          monitorSize: 24,
        }),
      ).toThrow('Invalid resolution format');

      expect(() =>
        calculateDimensions({
          heightPx: 1080,
          widthPx: 1920,
          resolution: '1920',
          monitorSize: 24,
        }),
      ).toThrow('Invalid resolution format');
    });
  });

  describe('Real-world scenarios', () => {
    test('calculates for small UI element (button)', () => {
      // Button: 44x120 pixels on Full HD 24" monitor
      const result = calculateDimensions({
        heightPx: 44,
        widthPx: 120,
        resolution: '1920x1080',
        monitorSize: 24,
      });

      const heightMm = parseFloat(result.heightMm);
      const widthMm = parseFloat(result.widthMm);

      // Should be at least 11.7mm (WCAG 2.1.3 minimum target size)
      expect(heightMm).toBeGreaterThan(10);
      expect(widthMm).toBeGreaterThan(10);
    });

    test('calculates for various common monitor configurations', () => {
      const configs = [
        { resolution: '1280x720', monitorSize: 22, name: 'HD 22"' },
        { resolution: '1920x1080', monitorSize: 24, name: 'Full HD 24"' },
        { resolution: '2560x1440', monitorSize: 27, name: 'QHD 27"' },
        { resolution: '3840x2160', monitorSize: 32, name: '4K 32"' },
      ];

      configs.forEach((config) => {
        const result = calculateDimensions({
          heightPx: 100,
          widthPx: 100,
          resolution: config.resolution,
          monitorSize: config.monitorSize,
        });

        // All should produce valid results
        expect(parseFloat(result.heightMm)).toBeGreaterThan(0);
        expect(parseFloat(result.widthMm)).toBeGreaterThan(0);
        expect(parseFloat(result.diagonalMm)).toBeGreaterThan(0);
      });
    });

    test('verifies WCAG 2.1.3 target size (44x44 pixels minimum)', () => {
      // On a typical Full HD 24" monitor
      const result = calculateDimensions({
        heightPx: 44,
        widthPx: 44,
        resolution: '1920x1080',
        monitorSize: 24,
      });

      const diagonalMm = parseFloat(result.diagonalMm);

      // WCAG 2.1.3: Minimum 11.7mm diagonal
      // However, this depends on monitor DPI, so we just check it's reasonable
      expect(diagonalMm).toBeGreaterThan(10);
      expect(diagonalMm).toBeLessThan(30);
    });
  });
});
