chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "poodthai-read",
    title: "Read with Poodthai",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "poodthai-read" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "speak",
      text: info.selectionText,
    });
  }
});

// Click extension icon → speak selected text
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "speak-selection" });
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "play-selection") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "speak-selection" });
      }
    });
  }
});
