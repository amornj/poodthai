chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "poodthai-read",
    title: "Read with Poodthai",
    contexts: ["selection"],
  });
});

// Inject content script + CSS on demand, then send a message
async function injectAndSpeak(tabId, message) {
  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ["content.css"],
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content.js"],
  });
  chrome.tabs.sendMessage(tabId, message);
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "poodthai-read" && info.selectionText) {
    injectAndSpeak(tab.id, { action: "speak", text: info.selectionText });
  }
});

// Click extension icon → speak selected text
chrome.action.onClicked.addListener((tab) => {
  injectAndSpeak(tab.id, { action: "speak-selection" });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "play-selection") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        injectAndSpeak(tabs[0].id, { action: "speak-selection" });
      }
    });
  }
});
