// Open the manager in a detached window
chrome.action.onClicked.addListener(() => {
  openManagerWindow();
});

function openManagerWindow() {
  chrome.windows.create({
    url: chrome.runtime.getURL("manager.html"),
    type: "popup",
    width: 900,
    height: 700,
    left: 100,
    top: 100
  });
}

// Listen for messages from popup to open detached window
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "openDetachedWindow") {
    openManagerWindow();
  }
});
