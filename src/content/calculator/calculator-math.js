/**
 * Calculator Math Module
 * 순수한 계산 로직만 포함 (테스트 가능)
 * @module calculator/calculator-math
 */

/**
 * 계산 상수
 * @constant {Object}
 */
export const CALCULATION_CONSTANTS = {
  MM_PER_INCH: 25.4,
  DECIMAL_PLACES_STANDARD: 2,
  DECIMAL_PLACES_RESULT: 1,
};

/**
 * 숫자 입력값의 유효성을 검증하는 함수
 *
 * @param {string|number} value - 검증할 값
 * @returns {boolean} 유효한 숫자인 경우 true, 그렇지 않으면 false
 * @example
 * validateNumericInput('123'); // true
 * validateNumericInput('abc'); // false
 */
export function validateNumericInput(value) {
  if (value === null || value === undefined || value === '') {
    return false;
  }
  const num = Number(value);
  return !isNaN(num) && isFinite(num) && num > 0;
}

/**
 * 해상도 문자열을 파싱하는 함수
 *
 * @param {string} resolution - 해상도 문자열 (예: "1920x1080")
 * @returns {{width: number, height: number}|null} 파싱된 해상도 또는 null
 */
export function parseResolution(resolution) {
  if (!resolution || typeof resolution !== 'string') {
    return null;
  }

  const parts = resolution.split('x');
  if (parts.length !== 2) {
    return null;
  }

  const width = parseInt(parts[0]);
  const height = parseInt(parts[1]);

  if (!validateNumericInput(width) || !validateNumericInput(height)) {
    return null;
  }

  return { width, height };
}

/**
 * 피타고라스 정리를 이용한 대각선 길이 계산
 *
 * @param {number} width - 너비
 * @param {number} height - 높이
 * @returns {number} 대각선 길이
 */
export function calculateDiagonal(width, height) {
  if (!validateNumericInput(width) || !validateNumericInput(height)) {
    throw new Error('Invalid width or height values');
  }
  return Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
}

/**
 * 표준 픽셀당 mm 길이 계산
 *
 * @param {number} diagonalPixels - 대각선 길이 (픽셀)
 * @param {number} monitorInches - 모니터 크기 (인치)
 * @returns {number} 픽셀당 mm 길이
 */
export function calculateStandardPixelSize(diagonalPixels, monitorInches) {
  if (
    !validateNumericInput(diagonalPixels) ||
    !validateNumericInput(monitorInches)
  ) {
    throw new Error('Invalid diagonal or monitor size');
  }
  return CALCULATION_CONSTANTS.MM_PER_INCH / (diagonalPixels / monitorInches);
}

/**
 * 픽셀 크기를 mm로 변환
 *
 * @param {number} pixels - 픽셀 값
 * @param {number} pixelSizeMm - 픽셀당 mm 크기
 * @returns {number} mm 값
 */
export function convertPixelsToMm(pixels, pixelSizeMm) {
  if (!validateNumericInput(pixels) || !validateNumericInput(pixelSizeMm)) {
    throw new Error('Invalid pixels or pixelSizeMm');
  }
  return pixels * pixelSizeMm;
}

/**
 * 요소의 크기를 계산하는 메인 함수
 *
 * @param {Object} params - 계산 파라미터
 * @param {number} params.heightPx - 높이 (픽셀)
 * @param {number} params.widthPx - 너비 (픽셀)
 * @param {string} params.resolution - 표준 해상도 (예: "1920x1080")
 * @param {number} params.monitorSize - 모니터 크기 (인치)
 * @returns {Object} 계산 결과
 * @returns {string} result.heightMm - 높이 (mm)
 * @returns {string} result.widthMm - 너비 (mm)
 * @returns {string} result.diagonalMm - 대각선 (mm)
 * @returns {string} result.diagonalPx - 대각선 (픽셀)
 * @throws {Error} 입력값이 유효하지 않은 경우
 */
export function calculateDimensions(params) {
  const { heightPx, widthPx, resolution, monitorSize } = params;

  // 입력값 검증
  if (!validateNumericInput(heightPx) || !validateNumericInput(widthPx)) {
    throw new Error('Invalid height or width values');
  }

  if (!validateNumericInput(monitorSize)) {
    throw new Error('Invalid monitor size');
  }

  // 해상도 파싱
  const parsedResolution = parseResolution(resolution);
  if (!parsedResolution) {
    throw new Error('Invalid resolution format');
  }

  // 표준 대각선 길이 계산 (픽셀)
  const standardDiagonalPx = calculateDiagonal(
    parsedResolution.width,
    parsedResolution.height,
  );

  // 픽셀당 mm 크기 계산
  const pixelSizeMm = calculateStandardPixelSize(
    standardDiagonalPx,
    monitorSize,
  );

  // 입력값을 mm로 변환
  const heightMm = convertPixelsToMm(heightPx, pixelSizeMm);
  const widthMm = convertPixelsToMm(widthPx, pixelSizeMm);
  const diagonalMm = calculateDiagonal(widthMm, heightMm);

  // 입력값의 대각선 길이 (픽셀)
  const diagonalPx = calculateDiagonal(widthPx, heightPx);

  return {
    heightMm: heightMm.toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT),
    widthMm: widthMm.toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT),
    diagonalMm: diagonalMm.toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT),
    diagonalPx: diagonalPx.toFixed(CALCULATION_CONSTANTS.DECIMAL_PLACES_RESULT),
  };
}
