# ⚡ DevTab Pro

> **A clean, modern, ultra-responsive Chrome Extension New Tab Dashboard designed specifically for developers and power users.**

DevTab Pro turns your browser's new tab page into a high-productivity command center equipped with customizable widget sections, AI tool launchers, local dev server port monitoring, built-in developer utility drawers, dynamic bookmark shortcuts, and an official Google Apps waffle menu.

---

## ✨ Features

### 🛠️ Developer Productivity & Utilities
- **Active Local Dev Server Monitor**: Easily track and launch local dev ports (e.g. `http://localhost:3000`, `8000`, `5173`).
- **Developer Websites Directory**: Manageable developer bookmarks directory with automatic favicon resolution and drag-and-drop reordering.
- **Embedded Developer Toolbox**: Multi-tab utility drawer built directly into the dashboard:
  - 📝 **JSON Formatter & Minifier**: Instant JSON validation, formatting, and minification.
  - 🔑 **Base64 Encoder / Decoder**: Quick encoding and decoding.
  - 🔗 **URL Encoder / Decoder**: Handle URL-encoded strings seamlessly.
  - 🎲 **UUID v4 Generator**: Generate UUIDs with one-click clipboard copying.
  - 📚 **Dev Cheatsheets**: Quick command references for **Git** and **Docker**.
- **First-Time Developer Onboarding**: Prompts new users on first launch to toggle Developer Mode automatically.

### 🤖 AI Platforms Directory
- **Quick AI Access**: Pre-configured shortcuts for leading AI platforms (ChatGPT, Claude, Gemini, Perplexity, v0.dev, DeepSeek).
- **Manageable AI Directory**: Dedicated modal to add custom AI tools, specify descriptions, and remove existing ones.

### 🎨 Modular Customization & Layout
- **Drag-and-Drop Section Reordering**: Rearrange all main dashboard widget sections with persistent layout positioning saved locally.
- **Clear Drop-Target Indicators**: Smooth visual feedback and target drop badges when dragging widgets.
- **Section Resizing**: Vertical card resizing support for flexible workspace arrangements.
- **Custom Dashboard Sections**: Create user-defined widget cards for notes, daily goals, code snippets, or custom links.
- **GUI Settings Modal**: Floating 3:4 aspect-ratio settings window to toggle individual section visibilities and switch clock modes.

### 🌐 Browser & Web Tools
- **Google Apps Waffle Launcher**: Chrome-style 3×3 grid menu featuring drag-and-drop reordering for Google Apps (Gmail, Drive, YouTube, Calendar, etc.).
- **Multi-Engine Search**: Switch search providers on the fly (Google, Brave, YouTube, DuckDuckGo, Bing) with quick keyword prefixes.
- **Custom Shortcuts**: Add, reorder, and remove personal bookmarks with automated favicon fetching.
- **Dark & Light Mode**: Toggle dark/light themes instantly.
- **Digital / Analog Clock**: Switch between sleek digital clock and minimalist analog clock views.

### 💾 Backup & Restore Configuration
- Export your entire layout, custom sections, dev ports, shortcuts, and AI tool configurations to a single JSON backup file (`devtab-backup.json`).
- Restore configurations instantly across browsers or computers.

### 🛠️ Developer Utility Toolbox
- **JSON Formatter & Validator**: Format, minify, and validate JSON payloads.
- **Base64 Encoder / Decoder**: UTF-8 safe string conversion.
- **URL Encoder / Decoder**: Standard web URL encoding/decoding.
- **UUID v4 Generator**: 1-click cryptographically secure UUID generator with instant clipboard copy.
- **QR Code Generator**: Create QR codes for any URL or text with 1-click PNG download.
- **Dev Cheatsheets**: Quick command references for Git, Docker, and CLI.

---

## ⌨️ Keyboard Hotkeys

| Hotkey | Action |
| :--- | :--- |
| `/` | Focus search bar input immediately |
| `Alt + S` | Open / Close GUI Settings modal |
| `Alt + A` | Open / Close AI Platforms Directory modal |
| `Escape` | Close any active modal window or search dropdown |

---

## 🚀 Installation Guide

### 📦 Download Latest Release

[![Download DevTab Pro](https://img.shields.io/github/v/release/akashs278/dev-tab-pro?style=for-the-badge&logo=github&color=6366f1)](https://github.com/akashs278/dev-tab-pro/releases)

> ⚡ **Quick Download**: Download the latest pre-packaged zip release directly from [https://github.com/akashs278/dev-tab-pro/releases](https://github.com/akashs278/dev-tab-pro/releases).

### Load Extension in Chrome / Chromium Browsers

1. **Download & Extract**:
   - Download the latest `.zip` package from [GitHub Releases](https://github.com/akashs278/dev-tab-pro/releases) (`https://github.com/akashs278/dev-tab-pro/releases`) and extract the archive, **OR** clone the source code:
   ```bash
   git clone https://github.com/akashs278/dev-tab-pro.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click **Load unpacked** and select the extension folder (`dev-tab-pro` or extracted zip directory).
5. Open a **New Tab** (`Ctrl + T` or `Cmd + T`) to experience **DevTab Pro**!

---

## 📂 Project Architecture

```
dev-tab-pro/
├── manifest.json       # Chrome Extension Manifest (V3)
├── index.html          # Main Dashboard & Modal Markup
├── style.css           # Modern Dark/Light Theme & Responsive Grid Styles
├── script.js           # Core Application Logic, Drag-and-Drop & State Persistence
└── icons/              # Extension Icons (16px, 32px, 48px, 128px)
```

---

## 🔒 Security & Compliance

- **Manifest V3 Compliant**: Built strictly according to modern Chrome Extension guidelines.
- **Content Security Policy (CSP)**: Completely free of inline event attributes (`onclick`, `onerror`, etc.), ensuring full script execution compliance (`script-src 'self'`).
- **Privacy First**: All settings, bookmarks, ports, and custom sections are stored 100% locally in `localStorage` without external tracking.

---

## 📄 License

This project is licensed under the **MIT License**.
