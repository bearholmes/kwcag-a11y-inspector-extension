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
- **Target**: Interactive elements such as links, buttons, input fields

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

## 🤝 Contributing

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

---

## 🙏 Credits

This project was inspired by the following open source projects and tools:

- **[CSSViewer](https://github.com/miled/cssviewer)** - Basic inspector structure ([Chrome Web Store](https://chrome.google.com/webstore/detail/cssviewer/ggfgijbpiheegefliciemofobhmofgce))
- **[WebAIM Color Contrast Checker](https://webaim.org/resources/contrastchecker/)** - Color contrast calculation algorithm
- **[Accessibility Component Diagonal Tool](https://chrome.google.com/webstore/detail/chogmnfcfckihakaealpjfjdkbjmkpok)** - Diagonal measurement diagnostic method
- **[Page Ruler](https://github.com/wrakky/page-ruler)** - Element measurement method ([Chrome Web Store](https://chrome.google.com/webstore/detail/page-ruler/jlpkojjdgbllmedoapgfodplfhcbnbpn))

---

## 📚 References

### Accessibility Guidelines

- [KWCAG 2.1](http://www.wa.or.kr/m1/sub1.asp) - Korean Web Content Accessibility Guidelines
- [WCAG 2.0](https://www.w3.org/TR/WCAG20/) - Web Content Accessibility Guidelines
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) - Web Content Accessibility Guidelines 2.2
- [WCAG 2.5.8: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) - Target Size (Minimum, Level AA)
- [WCAG 2.5.5: Target Size (Enhanced)](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html) - Target Size (Enhanced, Level AAA)
- [WebAIM](https://webaim.org/) - Accessibility resources

### Chrome Extension

- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Chrome Extension API](https://developer.chrome.com/docs/extensions/reference/)

---

## 📞 Support

This project started as a solo effort and is open to collaborators.

- Claude Code and Codex have been working together since November 2025.

Found a bug? Report it to [Issues](https://github.com/bearholmes/kwcag-a11y-inspector-extension/issues) with the following information:

- Environment information (Chrome version, OS)
- Steps to reproduce
- Expected behavior vs actual behavior
- Screenshots (if possible)

---

## ⭐ Star History

If this project helped you, please give it a ⭐!

---

<div style="text-align:center">

**Made with ❤️ for Web Accessibility**

[⬆ Back to Top](#kwcag-a11y-inspector)

</div>
