#!/usr/bin/env node
/**
 * Version Synchronization Script
 *
 * Automatically syncs version numbers across all project files:
 * - README.md
 * - README.en.md
 * - manifest.json (handled by vite.config.js during build)
 *
 * Usage:
 *   npm version patch|minor|major
 *   npm run version:sync (manual sync)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// ============================================================================
// Types
// ============================================================================

interface VersionUpdateResult {
  file: string;
  updated: boolean;
  oldVersion?: string;
  newVersion?: string;
  error?: string;
}

// ============================================================================
// Constants
// ============================================================================

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const BOLD = '\x1b[1m';

const FILES_TO_UPDATE = ['README.md', 'README.en.md'] as const;

const VERSION_BADGE_REGEX =
  /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-([\d.]+)-blue\.svg\)/;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Logs a message with color
 */
function log(message: string, color: string = RESET): void {
  console.log(`${color}${message}${RESET}`);
}

/**
 * Logs a success message
 */
function logSuccess(message: string): void {
  log(`✓ ${message}`, GREEN);
}

/**
 * Logs an error message
 */
function logError(message: string): void {
  log(`✗ ${message}`, RED);
}

/**
 * Logs an info message
 */
function logInfo(message: string): void {
  log(`ℹ ${message}`, BLUE);
}

/**
 * Logs a warning message
 */
function logWarning(message: string): void {
  log(`⚠ ${message}`, YELLOW);
}

/**
 * Gets the current version from package.json
 */
function getCurrentVersion(): string {
  try {
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    if (!packageJson.version) {
      throw new Error('Version not found in package.json');
    }

    return packageJson.version;
  } catch (error) {
    logError(
      `Failed to read version from package.json: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

/**
 * Updates version in a README file
 */
function updateReadmeVersion(
  filePath: string,
  newVersion: string,
): VersionUpdateResult {
  try {
    const fullPath = resolve(process.cwd(), filePath);

    if (!existsSync(fullPath)) {
      return {
        file: filePath,
        updated: false,
        error: 'File not found',
      };
    }

    let content = readFileSync(fullPath, 'utf-8');
    const match = content.match(VERSION_BADGE_REGEX);

    if (!match) {
      return {
        file: filePath,
        updated: false,
        error: 'Version badge not found',
      };
    }

    const oldVersion = match[1];

    if (oldVersion === newVersion) {
      return {
        file: filePath,
        updated: false,
        oldVersion,
        newVersion,
      };
    }

    content = content.replace(
      VERSION_BADGE_REGEX,
      `![Version](https://img.shields.io/badge/version-${newVersion}-blue.svg)`,
    );

    writeFileSync(fullPath, content, 'utf-8');

    return {
      file: filePath,
      updated: true,
      oldVersion,
      newVersion,
    };
  } catch (error) {
    return {
      file: filePath,
      updated: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Main function to sync all versions
 */
function syncVersions(): void {
  log(`\n${BOLD}🔄 Syncing version across project files...${RESET}\n`);

  const currentVersion = getCurrentVersion();
  logInfo(`Current version: ${BOLD}${currentVersion}${RESET}`);
  console.log();

  const results: VersionUpdateResult[] = [];

  for (const file of FILES_TO_UPDATE) {
    const result = updateReadmeVersion(file, currentVersion);
    results.push(result);

    if (result.error) {
      logError(`${file}: ${result.error}`);
    } else if (result.updated) {
      logSuccess(
        `${file}: ${result.oldVersion} → ${BOLD}${result.newVersion}${RESET}`,
      );
    } else if (result.oldVersion === result.newVersion) {
      logInfo(`${file}: Already up to date (${result.newVersion})`);
    }
  }

  console.log();

  const updatedCount = results.filter((r) => r.updated).length;
  const errorCount = results.filter((r) => r.error).length;

  if (errorCount > 0) {
    logWarning(`${errorCount} file(s) failed to update`);
  }

  if (updatedCount > 0) {
    logSuccess(`${updatedCount} file(s) updated successfully`);
  } else {
    logInfo('All files are already up to date');
  }

  console.log();
  log(`${BOLD}✨ Version sync complete!${RESET}\n`, GREEN);
}

// ============================================================================
// Main Execution
// ============================================================================

try {
  syncVersions();
} catch (error) {
  logError(
    `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exit(1);
}
