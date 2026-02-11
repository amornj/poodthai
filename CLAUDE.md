# Poodthai - Development Guide

## Project Overview

Chrome extension (Manifest V3) for Thai text-to-speech using the Web Speech API. No build step, no external dependencies, no API calls.

## Architecture

```
poodthai/
├── manifest.json    # Extension manifest (MV3)
├── background.js    # Service worker: context menu, icon click, keyboard shortcut
├── content.js       # Injected into all pages: TTS engine + floating player UI
├── content.css      # Floating player bar styles (purple theme)
├── popup.html       # Options page (speed, volume, voice detection, setup guide)
├── popup.js         # Options logic
├── popup.css        # Options styles
└── icons/           # Extension icons (16, 48, 128 PNG)
```

## Key Decisions

- **Web Speech API**: Chosen over external TTS APIs to stay free forever with no server dependency. Trade-off: requires system-level Thai voice to be installed (macOS: Kanya, Windows: Thai language pack).
- **No popup on icon click**: `default_popup` was removed so `action.onClicked` fires to trigger TTS directly. Settings live in `options_ui` instead.
- **Sentence chunking**: Thai text is split by sentence-ending markers (ๆ ฯ . ! ? newline) and long chunks are split at ~200 chars to stay within Web Speech API limits.
- **Voice selection priority**: Google Thai > remote voice > any local Thai voice.

## How to Test

1. Load unpacked at `chrome://extensions/`
2. Navigate to any page with Thai text
3. Highlight text → click icon / right-click → "Read with Poodthai" / Alt+P
4. Floating player should appear at top of page

## Style

- Purple theme (#7c3aed primary)
- All CSS scoped under `#poodthai-player` to avoid page conflicts
- Player uses `z-index: 2147483647` to stay on top
