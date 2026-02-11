# Privacy Policy — Poodthai (พูดไทย)

**Last updated:** February 11, 2025

## Overview

Poodthai is a Chrome extension that converts highlighted Thai text to speech using your browser's built-in Web Speech API. Your privacy is important to us — this extension is designed to work entirely on your device.

## Data Collection

**Poodthai does not collect, store, transmit, or share any user data.** Specifically:

- No personal information is collected
- No browsing history is tracked
- No text you highlight or listen to is recorded or sent anywhere
- No analytics or telemetry data is gathered
- No cookies are used
- No third-party services or APIs are called

## How It Works

- Text-to-speech is processed **locally** on your device using the browser's built-in `SpeechSynthesis` API
- Your speed and volume preferences are saved **locally** in Chrome's `storage.sync` (synced to your Google account only if you have Chrome Sync enabled — this is a standard Chrome feature, not controlled by this extension)
- No data ever leaves your browser to any external server

## Permissions Used

| Permission | Why |
|---|---|
| `activeTab` | To read text you have highlighted on the current page |
| `contextMenus` | To add "Read with Poodthai" to the right-click menu |
| `storage` | To save your speed and volume preferences locally |

## Third-Party Services

**None.** This extension makes zero network requests. It works entirely offline once installed (provided a Thai voice is available on your system).

## Changes

If this policy is ever updated, changes will be posted here with an updated date.

## Contact

If you have questions about this privacy policy, please open an issue at:
https://github.com/amornj/poodthai/issues
