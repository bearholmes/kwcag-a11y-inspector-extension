/**
 * Tests for color-utils.js
 * Tests RGB/Hex conversion, WCAG luminance and contrast ratio calculations
 */

import { describe, test, expect, jest } from '@jest/globals';
import {
  DecToHex,
  RGBToHex,
  RGBToHexStr,
  getRGB,
  getsRGB,
  getL,
  getContrastRatio,
} from '../../src/content/inspector/color-utils.ts';

describe('Color Utilities', () => {
  describe('DecToHex', () => {
    test('converts 0 to 00', () => {
      expect(DecToHex(0)).toBe('00');
    });

    test('converts 255 to FF', () => {
      expect(DecToHex(255)).toBe('FF');
    });

    test('converts 128 to 80', () => {
      expect(DecToHex(128)).toBe('80');
    });

    test('converts single digit numbers', () => {
      expect(DecToHex(1)).toBe('01');
      expect(DecToHex(9)).toBe('09');
    });

    test('converts common color values', () => {
      expect(DecToHex(16)).toBe('10');
      expect(DecToHex(32)).toBe('20');
      expect(DecToHex(64)).toBe('40');
    });
  });

  describe('RGBToHex', () => {
    test('converts pure red to hex with HTML', () => {
      const result = RGBToHex('rgb(255, 0, 0)');
      expect(result).toContain('#FF0000');
      expect(result).toContain('<span');
      expect(result).toContain('background-color:#FF0000');
    });

    test('converts pure green to hex', () => {
      const result = RGBToHex('rgb(0, 255, 0)');
      expect(result).toContain('#00FF00');
    });

    test('converts pure blue to hex', () => {
      const result = RGBToHex('rgb(0, 0, 255)');
      expect(result).toContain('#0000FF');
    });

    test('converts white to hex', () => {
      const result = RGBToHex('rgb(255, 255, 255)');
      expect(result).toContain('#FFFFFF');
    });

    test('converts black to hex', () => {
      const result = RGBToHex('rgb(0, 0, 0)');
      expect(result).toContain('#000000');
    });

    test('converts transparent (0,0,0,0) to white', () => {
      const result = RGBToHex('rgba(0, 0, 0, 0)');
      expect(result).toContain('#FFFFFF');
    });

    test('handles invalid RGB format gracefully', () => {
      const result = RGBToHex('invalid-color');
      expect(result).toContain('#FFFFFF'); // Default fallback
    });

    test('handles null/undefined input gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const result1 = RGBToHex(null);
      const result2 = RGBToHex(undefined);
      expect(result1).toContain('#FFFFFF');
      expect(result2).toContain('#FFFFFF');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    test('handles RGB with extra spaces', () => {
      const result = RGBToHex('rgb(  100 ,  150 ,  200  )');
      expect(result).toContain('#6496C8');
    });
  });

  describe('RGBToHexStr', () => {
    test('converts RGB to hex string without #', () => {
      expect(RGBToHexStr('rgb(255, 0, 0)')).toBe('FF0000');
    });

    test('converts RGB to hex string for green', () => {
      expect(RGBToHexStr('rgb(0, 255, 0)')).toBe('00FF00');
    });

    test('converts RGB to hex string for blue', () => {
      expect(RGBToHexStr('rgb(0, 0, 255)')).toBe('0000FF');
    });

    test('converts white to FFFFFF', () => {
      expect(RGBToHexStr('rgb(255, 255, 255)')).toBe('FFFFFF');
    });

    test('converts black to 000000', () => {
      expect(RGBToHexStr('rgb(0, 0, 0)')).toBe('000000');
    });

    test('converts transparent to FFFFFF', () => {
      expect(RGBToHexStr('rgba(0, 0, 0, 0)')).toBe('FFFFFF');
    });

    test('handles invalid format gracefully', () => {
      const result = RGBToHexStr('invalid');
      expect(result).toBe('FFFFFF'); // Default fallback
    });

    test('handles null/undefined input gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const result1 = RGBToHexStr(null);
      const result2 = RGBToHexStr(undefined);
      expect(result1).toBe('FFFFFF');
      expect(result2).toBe('FFFFFF');
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    test('handles gray scale colors', () => {
      expect(RGBToHexStr('rgb(128, 128, 128)')).toBe('808080');
    });
  });

  describe('getRGB', () => {
    test('converts hex FF to decimal 255', () => {
      expect(getRGB('FF')).toBe(255);
    });

    test('converts hex 00 to decimal 0', () => {
      expect(getRGB('00')).toBe(0);
    });

    test('converts hex 80 to decimal 128', () => {
      expect(getRGB('80')).toBe(128);
    });

    test('handles lowercase hex values', () => {
      expect(getRGB('ff')).toBe(255);
      expect(getRGB('aa')).toBe(170);
    });

    test('returns false for invalid hex', () => {
      expect(getRGB('ZZ')).toBe(false);
      expect(getRGB('XY')).toBe(false);
    });

    test('handles null/undefined input gracefully', () => {
      const result1 = getRGB(null);
      const result2 = getRGB(undefined);
      expect(result1).toBe(false);
      expect(result2).toBe(false);
    });
  });

  describe('getsRGB', () => {
    test('converts low RGB values (below threshold)', () => {
      const result = getsRGB('01'); // Decimal 1
      expect(result).toBeCloseTo(0.000303, 5); // Lower precision due to floating point
    });

    test('converts high RGB values (above threshold)', () => {
      const result = getsRGB('FF'); // Decimal 255
      expect(result).toBeCloseTo(1.0, 1);
    });

    test('converts mid-range RGB values', () => {
      const result = getsRGB('80'); // Decimal 128
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(1);
    });

    test('returns false for invalid input', () => {
      expect(getsRGB('ZZ')).toBe(false);
    });

    test('handles 00 value', () => {
      expect(getsRGB('00')).toBe(0);
    });
  });

  describe('getL (Luminance)', () => {
    test('calculates luminance for white (FFFFFF)', () => {
      const luminance = getL('FFFFFF');
      expect(luminance).toBeCloseTo(1.0, 1);
    });

    test('calculates luminance for black (000000)', () => {
      const luminance = getL('000000');
      expect(luminance).toBe(0);
    });

    test('calculates luminance for red (FF0000)', () => {
      const luminance = getL('FF0000');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });

    test('calculates luminance for green (00FF00)', () => {
      const luminance = getL('00FF00');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });

    test('calculates luminance for blue (0000FF)', () => {
      const luminance = getL('0000FF');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });

    test('handles 3-digit hex colors (short form)', () => {
      const luminance = getL('FFF');
      expect(luminance).toBeCloseTo(1.0, 1);
    });

    test('handles 3-digit hex colors for black', () => {
      const luminance = getL('000');
      expect(luminance).toBe(0);
    });

    test('returns false for invalid color length', () => {
      expect(getL('FF')).toBe(false);
      expect(getL('FFFFFFF')).toBe(false);
    });

    test('returns false for invalid hex characters', () => {
      expect(getL('ZZZZZZ')).toBe(false);
    });

    test('handles gray colors', () => {
      const luminance = getL('808080');
      expect(luminance).toBeGreaterThan(0);
      expect(luminance).toBeLessThan(1);
    });

    test('handles null/undefined input gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const result1 = getL(null);
      const result2 = getL(undefined);
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('getContrastRatio', () => {
    test('calculates max contrast ratio (white vs black)', () => {
      const whiteL = getL('FFFFFF');
      const blackL = getL('000000');
      const ratio = getContrastRatio(whiteL, blackL);
      expect(ratio).toBeCloseTo(21, 0); // WCAG max contrast is 21:1
    });

    test('calculates contrast ratio (order independent)', () => {
      const whiteL = getL('FFFFFF');
      const blackL = getL('000000');
      const ratio1 = getContrastRatio(whiteL, blackL);
      const ratio2 = getContrastRatio(blackL, whiteL);
      expect(ratio1).toBe(ratio2);
    });

    test('calculates contrast ratio for same colors (1:1)', () => {
      const whiteL = getL('FFFFFF');
      const ratio = getContrastRatio(whiteL, whiteL);
      expect(ratio).toBe(1);
    });

    test('calculates contrast for similar colors (low contrast)', () => {
      const gray1 = getL('808080');
      const gray2 = getL('888888');
      const ratio = getContrastRatio(gray1, gray2);
      expect(ratio).toBeGreaterThan(1);
      expect(ratio).toBeLessThan(2);
    });

    test('WCAG AA compliance - black text on white (>= 4.5:1)', () => {
      const whiteL = getL('FFFFFF');
      const blackL = getL('000000');
      const ratio = getContrastRatio(whiteL, blackL);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    test('WCAG AAA compliance - black text on white (>= 7:1)', () => {
      const whiteL = getL('FFFFFF');
      const blackL = getL('000000');
      const ratio = getContrastRatio(whiteL, blackL);
      expect(ratio).toBeGreaterThanOrEqual(7);
    });
  });

  describe('Real-world color combinations', () => {
    test('typical blue link on white background', () => {
      const whiteL = getL('FFFFFF');
      const blueL = getL('0000FF');
      const ratio = getContrastRatio(whiteL, blueL);
      expect(ratio).toBeGreaterThan(4.5); // Should pass WCAG AA
    });

    test('light gray text on white (poor contrast)', () => {
      const whiteL = getL('FFFFFF');
      const lightGrayL = getL('CCCCCC');
      const ratio = getContrastRatio(whiteL, lightGrayL);
      expect(ratio).toBeLessThan(4.5); // Should fail WCAG AA
    });

    test('dark gray text on black (good contrast)', () => {
      const blackL = getL('000000');
      const darkGrayL = getL('333333');
      const ratio = getContrastRatio(blackL, darkGrayL);
      expect(ratio).toBeGreaterThan(1);
    });
  });
});
