# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KWCAG A11y Inspector is a Chrome Extension (Manifest V3) for web accessibility testing. It measures interactive element sizes per KWCAG 2.1.3 (6mm diagonal minimum), WCAG 2.5.8 (24×24 CSS pixels), WCAG 2.5.5 (44×44 CSS pixels), and color contrast ratios per WCAG 1.4.3. The extension supports 11 languages and has completed TypeScript migration.

## Development Commands

### Build & Development

```bash
npm run dev           # Development build with file watching
npm run build         # Production build
npm run clean         # Remove dist directory
```

### Testing

```bash
npm test              # Run all tests
npm test -- path/to/file.test.js  # Run specific test file
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Code Quality

```bash
npm run format        # Format code with Prettier
npm run lint          # Lint JavaScript/TypeScript files
npm run lint:fix      # Auto-fix linting issues
```

### Installing the Extension

After building, load the extension in Chrome:

1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project directory

## Architecture

### Module Structure

The codebase follows a modular architecture with clear separation of concerns:

**Background (Service Worker)**

- `src/background/service-worker.ts`: Handles extension lifecycle, context menus, and script injection
- Uses `StorageManager` for settings persistence
- Creates context menu for manual calculator popup
- Injects content scripts into active tabs

**Content Scripts**

- **Inspector Module** (`src/content/inspector/`): Main accessibility inspection functionality
  - `index.ts`: Entry point, initializes Inspector and ShortcutManager
  - `inspector-core.ts`: Core Inspector class, manages tracking overlay
  - `event-handlers.ts`: Mouse/keyboard event handling, element detection logic
  - `css-handlers.ts`: CSS property reading and processing
  - `constants.ts`: Centralized constants (colors, measurements, WCAG values)
  - `color-utils.ts`: Color conversion and contrast calculation (WCAG 2.0)
  - `dom-utils.ts`: DOM manipulation utilities
  - `shortcut-manager.ts`: Keyboard shortcut handling (ESC key)

- **Calculator Module** (`src/content/calculator/`): Manual size calculation
  - `calculator.ts`: UI and logic for manual pixel-to-mm conversion
  - `calculator-math.ts`: Pixel-to-mm calculation formulas

**Options Page**

- `src/options/settings.ts`: Settings UI with Pickr color picker integration
- `src/options/settings.html`: Settings page layout
- Manages monitor size, resolution, display preferences, and link mode

**Shared Utilities**

- `src/shared/storage-utils.ts`: Promise-based Chrome Storage API wrapper (`StorageManager` class)
- `src/shared/dom-utils.ts`: Common DOM utilities

### Key Architectural Patterns

**Link Mode Behavior**

- Link Mode ON (`linkmode: '1'`):
  - Only tracks interactive elements: `a`, `button`, `input`, `area`
  - Automatically enables `trackingmode` (overlay div)
  - Parent element tracking: if hovering child of interactive element, tracks parent
  - Background color option available
- Link Mode OFF (`linkmode: '0'`):
  - Tracks all elements except `body`
  - Automatically disables `trackingmode`
  - Uses standard outline only
  - Background color option disabled
- See `docs/link-mode-analysis.md` for detailed behavior

**Inspector Flow**

1. Background script injects content scripts into tab
2. `index.ts` initializes Inspector with settings from Chrome Storage
3. Event handlers attach to document for mouseover/mouseout/keydown
4. On hover, inspector calculates element dimensions (px → mm) and color contrast
5. Tracking div or outline highlights the element
6. Info popup displays measurements and accessibility compliance

**Storage Pattern**

- All Chrome Storage operations use `StorageManager` class (Promise-based)
- Settings keys: `monitors`, `resolutions`, `ccshow`, `boxshow`, `linkmode`, `bgmode`, `linetype`, `colortype`, `bordersize`, `trackingmode`
- Settings automatically sync via Chrome Storage Sync API

**Constants Management**

- All magic numbers and strings centralized in `src/content/inspector/constants.ts`
- Organized by category: `COLOR`, `MEASUREMENT`, `ACCESSIBILITY`, `WCAG_CONTRAST`, `TIMING`, `UI`, `STYLE_VALUES`
- Exported as `CONSTANTS` object with TypeScript interfaces
- WCAG compliance thresholds: WCAG_258_CSS_PX (24), WCAG_255_CSS_PX (44), KWCAG_213_MM (6.0), RATIO_AA_NORMAL (4.5), RATIO_AAA_NORMAL (7.0)

## Internationalization (i18n)

### UI Text

- **MUST** use `chrome.i18n.getMessage()` for all user-facing UI text
- Message keys defined in `_locales/{locale}/messages.json`
- Default locale: `en` (English), set in `manifest.json`

### Error Messages

- **MUST** be hardcoded in **English**
- Error messages are for developers/debugging, not end users
- Do NOT use i18n for error messages

### Example

```typescript
// ✅ CORRECT - UI text uses i18n
const MESSAGE_KEYS = {
  CALC_TITLE: 'calcTitle',
  CALC_HEIGHT: 'calcHeight',
} as const;
header.textContent = chrome.i18n.getMessage(MESSAGE_KEYS.CALC_TITLE);

// ✅ CORRECT - Error messages in English
const ERROR_MESSAGES = {
  INVALID_INPUT: 'Invalid input value.',
  STORAGE_ERROR: 'Cannot read data from storage.',
} as const;
console.error(ERROR_MESSAGES.INVALID_INPUT);

// ❌ WRONG - Don't use i18n for error messages
console.error(chrome.i18n.getMessage('errorInvalidInput'));
```

### Supported Languages

11 languages: English (en), Korean (ko), German (de), Spanish (es), French (fr), Italian (it), Japanese (ja), Portuguese (pt), Russian (ru), Chinese Simplified (zh_CN), Chinese Traditional (zh_TW)

## TypeScript Migration Status

### Completed (100%)

- All core modules migrated to TypeScript
- `strict` mode enabled in `tsconfig.json`
- Type definitions: `@types/chrome`, `@types/node`, `@types/jest`

### Migrated Files (12 files)

- `src/background/service-worker.ts`
- `src/content/inspector/` (all 8 files)
- `src/content/calculator/calculator-math.ts`
- `src/content/calculator.ts`
- `src/options/settings.ts`
- `src/shared/storage-utils.ts`
- `src/shared/dom-utils.ts`

## Code Style

### TypeScript

- Use TypeScript for all new files
- Follow strict mode rules (no implicit `any`, null checks, etc.)
- Use `const` assertions for constant objects
- Prefer interfaces over type aliases for object shapes
- Add JSDoc comments for functions and public APIs

### Naming Conventions

- Constants: `UPPER_SNAKE_CASE`
- Variables/Functions: `camelCase`
- Types/Interfaces: `PascalCase`
- CSS Classes: `kebab-case`

### Comments

- JSDoc for functions and public APIs
- Korean comments for complex business logic explanations
- English for brief inline comments

### Formatting

- EditorConfig settings: UTF-8, LF, 2 spaces, trim trailing whitespace
- Prettier for code formatting
- ESLint for code quality

## Security & Performance

### Security

- Chrome internal pages (chrome://, chrome-extension://) are blocked
- All user input validated
- Use `textContent` instead of `innerHTML` to prevent XSS
- Never use `eval()`
- Content Security Policy defined in `manifest.json`

### Performance

- ES2020 target (Chrome 88+) reduces bundle size (~130KB total)
- Tree-shaking enabled via Vite
- Event listeners properly cleaned up on inspector disable
- DOM access cached where possible
- Source maps enabled for debugging

## Git Workflow

### Branch Naming

```
claude/{feature-description}-{sessionId}
```

Example: `claude/calculator-multilingual-support-016csrChRgV7cauVfyCbaYzL`

### Commit Messages

Use conventional commit format:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code formatting
refactor: Code refactoring
test: Add/update tests
chore: Build configuration, dependencies
perf: Performance improvement
security: Security patch
i18n: Internationalization changes
```

### Workflow

- Always commit and push before session end
- Base branch: `next` (use this for PRs)
- Current branch visible in git status

## Testing

### Test Configuration

- Framework: Jest with jsdom environment
- TypeScript support via ts-jest
- Test files: `tests/**/*.test.js`
- Setup file: `tests/setup.js`

### Coverage

- Current: 28.53% overall
- Per-file thresholds set for core modules:
  - `storage-utils.ts`: 100%
  - `color-utils.ts`: 96%+
  - `calculator-math.ts`: 100%
  - `dom-utils.ts`: 95%+

### Running Tests

See "Development Commands" section above

## Build System (Vite)

### Entry Points

- `background/service-worker`: Background service worker
- `content/inspector`: Inspector module
- `content/calculator`: Calculator module
- `options/settings`: Settings page

### Build Process

1. TypeScript compilation (ES2020 target)
2. Bundle each entry point independently (no code splitting)
3. Copy static assets (manifest.json with version injection, HTML, CSS, icons, locales)
4. Output to `dist/` directory

### Assets Copied

- `manifest.json` (with version from package.json)
- HTML files (`settings.html`)
- CSS files (`inspector.css`, `calculator.css`)
- Icons (16, 22, 24, 32, 48, 128)
- Locale files for 11 languages

## Common Tasks

### Adding a New Message Key

1. Add key to `_locales/en/messages.json`
2. Translate to other 10 languages
3. Define constant in your module: `const MY_KEY = 'myMessageKey'`
4. Use: `chrome.i18n.getMessage(MY_KEY)`

### Modifying Inspector Behavior

- Element detection: `event-handlers.ts` (mouseover handler)
- Visual styling: `css-handlers.ts`
- Tracking overlay: `inspector-core.ts` (Tracking object)
- Constants: `constants.ts` (measurements, colors, thresholds)

### Adding a New Setting

1. Add to default settings in `service-worker.ts`
2. Add UI control in `settings.html`
3. Add save/load logic in `settings.ts`
4. Update `InspectorOptions` interface in `inspector-core.ts`
5. Use setting in inspector module

### Updating WCAG Calculations

- Color contrast: `color-utils.ts` (`calculateContrastRatio` function)
- Size measurements: `calculator-math.ts` (`calculateDimensions` function)
- Target size compliance: `dom-utils.ts` (`getTargetSize` function)
- Constants: `constants.ts` (`ACCESSIBILITY` and `WCAG_CONTRAST` sections)

## References

### Accessibility Standards

- KWCAG 2.1: http://www.wa.or.kr/m1/sub1.asp
- WCAG 2.0: https://www.w3.org/TR/WCAG20/

### Chrome Extension

- Manifest V3: https://developer.chrome.com/docs/extensions/mv3/intro/
- Chrome Extension API: https://developer.chrome.com/docs/extensions/reference/

### Inspiration

- CSSViewer: https://github.com/miled/cssviewer (inspector structure)
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/ (contrast algorithm)
- Page Ruler: https://github.com/wrakky/page-ruler (measurement approach)
