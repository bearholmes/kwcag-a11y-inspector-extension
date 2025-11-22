# KWCAG A11y Inspector

<div style="text-align:center">

**Languages**: 🇰🇷 [한국어](README.md) | 🇺🇸 [English](README.en.md)

![Version](https://img.shields.io/badge/version-0.13.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome Web Store](https://img.shields.io/badge/chrome-extension-orange.svg)
![Manifest](https://img.shields.io/badge/manifest-v3-brightgreen.svg)

**Chrome Extension for Korean Web Content Accessibility Guidelines (KWCAG) 2.1 Inspection**

[Chrome Web Store](https://chrome.google.com/webstore/detail/kwcag-a11y-inspector/ngcmkfaolkgkjbddhjnhgoekgaamjibo?hl=en) | [Report Issues](https://github.com/bearholmes/kwcag-a11y-inspector-extension/issues) | [Guide](./PROJECT_ANALYSIS.md)

</div>

---

## 📋 Introduction

KWCAG A11y Inspector is a Chrome extension for web accessibility inspection. It enables real-time measurement of KWCAG 2.1's **2.1.3 Operable** and **1.3.3 Color Contrast** criteria.

### Key Features

- ✅ **Element Size Measurement**: Display actual size of clickable elements in pixels (px) and millimeters (mm)
- ✅ **WCAG 2.2 Target Size Check**: Real-time display of WCAG 2.5.8 (AA) and 2.5.5 (AAA) compliance
- ✅ **Color Contrast Check**: Calculate luminance contrast ratio between text and background with AA/AAA level display (WCAG 2.0 standard)
- ✅ **Real-time Inspection**: Instant measurement with mouse hover
- ✅ **Manual Calculator**: Calculate dimensions through direct input
- ✅ **Customization**: Adjust border color, style, and thickness
- ✅ **Display Options**: Selectively show Box model, color contrast, etc.
- ✅ **Various Monitor Support**: 11~40 inches, various resolution settings
- ✅ **Multi-language Support**: 11 languages supported (Korean, English, Chinese, Japanese, German, French, Spanish, Italian, Russian, Portuguese)

---

## 🎯 Measurement Criteria

### KWCAG 2.1.3 - Operable

- **Minimum Size**: 6mm diagonal length (approximately 45px × 45px @96DPI)
- **Measurement Range**: box + padding + border
- **Target Elements**: Interactive elements such as links, buttons, input fields

### WCAG 2.5.8 - Target Size (Minimum, AA Level)

- **Minimum Size**: 24×24 CSS pixels
- **Standard**: WCAG 2.2 Level AA
- **Target**: All interactive elements

### WCAG 2.5.5 - Target Size (Enhanced, AAA Level)

- **Enhanced Size**: 44×44 CSS pixels
- **Standard**: WCAG 2.2 Level AAA
- **Target**: All interactive elements

### WCAG 1.4.3 - Color Contrast

- **AA Level**: 4.5:1 or higher (normal text)
- **AAA Level**: 7:1 or higher (normal text)
- **Calculation Method**: Based on WCAG 2.0 Relative Luminance

---

## 🚀 Installation

### Install from Chrome Web Store (Recommended)

1. Visit [KWCAG A11y Inspector](https://chrome.google.com/webstore/detail/kwcag-a11y-inspector/ngcmkfaolkgkjbddhjnhgoekgaamjibo?hl=en) page
2. Click "Add to Chrome" button
3. Configure monitor settings in the options page after installation

### Manual Installation (For Developers)

```bash
# Clone repository
git clone https://github.com/bearholmes/kwcag-a11y-inspector-extension.git
cd kwcag-a11y-inspector-extension

# Install dependencies
npm install

# Build
npm run build

# Load in Chrome
# 1. Visit chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked extension"
# 4. Select the project directory
```

---

## 💡 Usage

### Basic Usage

1. **Click extension icon** or activate with keyboard shortcut
2. **Hover** over the element you want to inspect
3. View size and color contrast information in real-time
4. Press **ESC key** to pause/resume

### Using Manual Calculator

1. **Right-click** on the page
2. Select "Open Manual Calculator"
3. Enter height and width in pixels
4. Click "OK" to see results in mm

### Change Settings

1. **Right-click** extension icon → "Options"
2. Configure monitor size and resolution
3. Customize display options and styles
4. Settings are automatically saved to Chrome sync

---

## 🛠️ Tech Stack

### Runtime

- **Chrome Extension API** (Manifest V3)
- **TypeScript** (ES2020) - Core modules migrated
- **JavaScript** (ES2020) - Legacy code
- **CSS3**
- **Chrome i18n API** - Multi-language support (11 languages)

### Development Tools

- **Vite** - Build tool (TypeScript support)
- **TypeScript** - Type safety enhancement
- **Prettier** - Code formatting
- **ESLint** - Code quality inspection
- **Jest** - Unit testing (28.53% coverage)
- **JSDoc** - Complete code documentation
- **Husky** - Git hooks automation

### Main Libraries

- **@simonwep/pickr** - Color picker (MIT License)
- **@types/chrome** - Chrome API type definitions

### Code Quality

- ✅ **TypeScript Migration**: Core modules converted to TypeScript (~50%)
- ✅ **Strict Type Checking**: Strict mode enabled
- ✅ **Complete JSDoc Documentation**: JSDoc comments applied to all functions and types
- ✅ **Comprehensive Error Handling**: try-catch blocks and structured error messages
- ✅ **Constants Management**: Magic numbers removed and centrally managed with CONSTANTS object
- ✅ **Source Map Support**: Source maps generated for debugging
- ✅ **Test Coverage**: 28.53% (238 tests)

---

## 📁 Project Structure

```
kwcag-a11y-inspector-extension/
├── manifest.json                 # Chrome extension manifest
├── package.json                  # NPM dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── vite.config.js                # Vite build configuration
│
├── _locales/                     # Internationalization resources (11 languages)
│   ├── ko/messages.json         # Korean
│   ├── en/messages.json         # English
│   └── ...                       # 9 additional languages
│
├── src/                          # Source code
│   ├── background/
│   │   └── service-worker.ts    # Background script (TypeScript)
│   ├── content/
│   │   ├── inspector/           # Inspector module
│   │   │   ├── constants.ts     # Constants definition (TypeScript)
│   │   │   ├── color-utils.ts   # Color utilities (TypeScript)
│   │   │   ├── dom-utils.ts     # DOM utilities (TypeScript)
│   │   │   ├── shortcut-manager.ts  # Shortcut manager (TypeScript)
│   │   │   ├── css-handlers.js  # CSS handlers
│   │   │   ├── event-handlers.js  # Event handlers
│   │   │   ├── inspector-core.js  # Inspector core
│   │   │   └── index.js         # Entry point
│   │   └── calculator.js        # Manual calculator
│   ├── options/
│   │   ├── settings.html        # Settings page
│   │   └── settings.js          # Settings logic
│   └── shared/
│       ├── storage-utils.ts     # Storage utilities (TypeScript)
│       └── dom-utils.ts         # Common DOM utilities (TypeScript)
│
├── tests/                        # Test code
│   ├── content/                 # Content script tests
│   ├── background/              # Background tests
│   ├── options/                 # Options page tests
│   └── shared/                  # Common utility tests
│
├── dist/                         # Build output
│   ├── background/
│   ├── content/
│   ├── options/
│   └── assets/
│
└── docs/                         # Documentation
    ├── PROJECT_ANALYSIS.md      # Detailed project analysis
    ├── CICD_PLAN.md             # CI/CD pipeline design
    ├── E2E_TEST_PLAN.md         # E2E test plan
    └── ROADMAP.md               # Project roadmap
```

---

## 🔧 Development Guide

### Development Environment Setup

```bash
# Install dependencies
npm install

# Development mode (watch files)
npm run watch

# Build
npm run build

# Production build (minified)
npm run build:prod

# Code formatting
npm run format

# Run tests
npm test

# Tests (watch mode)
npm run test:watch

# Test coverage
npm run test:coverage
```

### Code Style

- Follow **Prettier** configuration
- **JSDoc** comments required (all functions)
- **Korean comments** recommended (business logic)
- Use **ES2020** syntax
- **Error handling** required (try-catch blocks)
- **Type definitions** recommended (JSDoc @typedef)

### Security and Performance Considerations

#### Security

- ✅ Chrome internal pages and store pages access blocked
- ✅ Input validation required for all user inputs
- ✅ Use textContent for DOM manipulation to prevent XSS
- ⚠️ Never use `eval()`
- ⚠️ Be careful when using `innerHTML` (use `textContent` when possible)

#### Performance

- ✅ Bundle size optimized with ES2020 target (~130KB)
- ✅ Event listeners minimized and properly removed
- ✅ DOM access cached for performance improvement
- ⚠️ Use `DocumentFragment` for bulk DOM manipulation
- ⚠️ Split long operations with `requestAnimationFrame` or `setTimeout`

#### Accessibility

- ✅ Keyboard shortcut support (ESC)
- ✅ Clear error messages provided
- ⚠️ Consider ARIA attributes when adding new UI elements

### Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code formatting
refactor: Code refactoring
test: Test code
chore: Build configuration
perf: Performance improvement
security: Security patch
i18n: Internationalization related
```

---

## 🧪 Testing

### Unit Tests

```bash
# Run all tests
npm test

# Test specific file
npm test -- src/__tests__/calculations.test.js

# Generate coverage report
npm run test:coverage
```

### Manual Testing Checklist

- [ ] Measure elements on various websites
- [ ] Verify accuracy with multiple monitor settings
- [ ] Validate color contrast calculation accuracy
- [ ] Verify appropriate error messages on Chrome internal pages
- [ ] Confirm immediate reflection of option changes

---

## 📊 Performance Optimization

### Bundle Size

- **dkinspect.js**: ~100KB (after transpilation)
- **Total**: ~130KB
- **Loading time**: ~9ms (ES2020 target)
- **i18n resources**: ~3KB per language

### Optimization Techniques

- ✅ Removed unnecessary transpilation with ES2020 target (Chrome 88+)
- ✅ Tree shaking support with Babel `modules: false` setting
- ✅ Source maps generated for debugging
- ✅ Event listeners minimized and properly removed
- ✅ DOM access cached
- ✅ Magic numbers removed and centrally managed for maintainability

### Loading Performance

- **Initial loading**: Asynchronous loading of settings from Chrome Storage
- **Script injection**: Dynamic injection only when needed (Lazy Loading)
- **Memory management**: Event listener cleanup when inspector is disabled

---

## 🤝 Contributing

### Bug Reports

Found a bug? Report it to [Issues](https://github.com/bearholmes/kwcag-a11y-inspector-extension/issues) with the following information:

- Environment information (Chrome version, OS)
- Steps to reproduce
- Expected behavior vs actual behavior
- Screenshots (if possible)

### Pull Request

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- [ ] Follow code style (`npm run format`)
- [ ] Add tests (`npm test`)
- [ ] Write JSDoc comments
- [ ] Update README (if necessary)

---

## 📜 License

This project is distributed under the MIT License. See [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2023 bearholmes

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 🙏 Credits

This project was inspired by the following open source projects:

- **[CSSViewer](https://github.com/miled/cssviewer)** - Basic inspector structure
- **[WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)** - Color contrast calculation algorithm
- **[Page Ruler](https://github.com/wrakky/page-ruler)** - Diagonal measurement method

---

## 📚 References

### Accessibility Guidelines

- [KWCAG 2.1](http://www.wa.or.kr/m1/sub1.asp) - Korean Web Content Accessibility Guidelines
- [WCAG 2.0](https://www.w3.org/TR/WCAG20/) - Web Content Accessibility Guidelines
- [WebAIM](https://webaim.org/) - Accessibility resources

### Chrome Extension

- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)

---

## 📞 Support

Have issues or questions?

- 📧 Email: bearholmes@gmail.com
- 🐛 Bug reports: [GitHub Issues](https://github.com/bearholmes/kwcag-a11y-inspector-extension/issues)
- 📖 Documentation: [Project Analysis Document](./PROJECT_ANALYSIS.md)

---

## 🗺️ Roadmap

### v0.13.0 (Completed) ✅

- [x] Internationalization (i18n) support - 11 languages
- [x] Complete JSDoc documentation
- [x] Comprehensive error handling
- [x] ES2020 target build optimization
- [x] Magic numbers removed and constants centrally managed
- [x] Source map generation support
- [x] **Unit test implementation** (Jest, 28.53% coverage)
- [x] **TypeScript migration started** (50% of core modules completed)
- [x] **Pickr color picker integration** (jscolor → Pickr, MIT License)
- [x] **CI/CD pipeline design documentation** (GitHub Actions)
- [x] **E2E test plan documentation** (Puppeteer)

### v0.14.0 (In Progress) 🚧

- [x] **TypeScript migration 100% complete** ✅
  - [x] Core utilities (constants, storage-utils, dom-utils, color-utils, shortcut-manager, service-worker)
  - [x] Inspector modules (inspector-core, css-handlers, event-handlers)
  - [x] Calculator module (calculator)
  - [x] Settings module (settings)
  - 12 files migrated in total
- [x] **WCAG 2.2 Target Size Support** ✅
  - [x] WCAG 2.5.8 (AA) 24×24 CSS pixel check
  - [x] WCAG 2.5.5 (AAA) 44×44 CSS pixel check
  - [x] KWCAG 2.1.3 diagonal length calculation improvement
- [x] **Color Contrast Display Subdivision** ✅
  - [x] Contrast ratio display
  - [x] WCAG 1.4.3 AA (4.5:1) compliance
  - [x] WCAG 1.4.3 AAA (7:1) compliance
- [x] **Box Model Optional Display Option** ✅
- [ ] Achieve 80% test coverage
- [ ] Implement CI/CD pipeline (Phase 1)
- [ ] Start E2E test implementation

### v0.15.0 (Planned)

- [ ] Fully automate CI/CD pipeline (Phase 2-3)
- [ ] 100% E2E test coverage (core scenarios)
- [ ] Achieve 80% test coverage
- [ ] Performance optimization and profiling

### v0.16.0 (Future)

- [ ] Add reporting functionality
- [ ] Full page scan feature
- [ ] Export results (CSV, JSON, PDF)
- [ ] User-defined criteria settings
- [ ] Chrome DevTools panel integration

---

## ⭐ Star History

If this project helped you, please give it a ⭐!

---

<div style="text-align:center">

**Made with ❤️ for Web Accessibility**

[⬆ Back to Top](#kwcag-a11y-inspector)

</div>
