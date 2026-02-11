# Poodthai (พูดไทย)

A Chrome extension that reads highlighted Thai text aloud. Free forever — no API calls, no accounts, no subscriptions.

## Features

- Highlight Thai text on any webpage and hear it spoken
- Floating player bar with play/pause, stop, prev/next, speed, and volume controls
- Right-click context menu: **Read with Poodthai**
- Keyboard shortcut: `Alt+P`
- Settings persist across sessions
- Uses the browser's built-in Web Speech API — works offline, completely free

## Install

1. Download or clone this repo
2. Open Chrome → `chrome://extensions/`
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select the `poodthai` folder

## Usage

1. Highlight Thai text on any webpage
2. Click the **Poodthai** extension icon (or right-click → "Read with Poodthai", or press `Alt+P`)
3. The floating player bar appears — control playback from there

### Settings

Right-click the extension icon → **Options** to adjust speed and volume.

## Thai Voice Setup

Poodthai uses the **Web Speech API** which relies on your system's installed voices. Thai voice may need to be installed manually:

### macOS

1. **System Settings** → **Accessibility** → **Spoken Content**
2. Click **System Voice** → **Manage Voices...**
3. Search **"Thai"** → download **Kanya**
4. Restart Chrome

### Windows

1. **Settings** → **Time & Language** → **Language & region**
2. **Add a language** → search **"Thai"** and install
3. Make sure **Text-to-speech** is checked
4. Restart Chrome

### Linux

```bash
sudo apt install espeak-ng
```

Then restart Chrome.

## Tech Stack

- Chrome Extension Manifest V3
- Web Speech API (SpeechSynthesis) — zero external dependencies
- Pure vanilla JS/CSS, no build step

## License

MIT
