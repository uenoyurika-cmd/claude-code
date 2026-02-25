// Dock positions: "left", "right", "top", "bottom", "center"
const DOCK_DEFAULTS = {
  left:   { widthRatio: 0.3, heightRatio: 1.0, minWidth: 380, minHeight: 500 },
  right:  { widthRatio: 0.3, heightRatio: 1.0, minWidth: 380, minHeight: 500 },
  top:    { widthRatio: 1.0, heightRatio: 0.45, minWidth: 600, minHeight: 350 },
  bottom: { widthRatio: 1.0, heightRatio: 0.45, minWidth: 600, minHeight: 350 },
  center: { widthRatio: 0.5, heightRatio: 0.65, minWidth: 900, minHeight: 700 }
};

let managerWindowId = null;

async function getDisplayBounds() {
  return new Promise((resolve) => {
    chrome.system.display.getInfo((displays) => {
      const primary = displays.find(d => d.isPrimary) || displays[0];
      resolve(primary.workArea);
    });
  });
}

async function getSavedDockPosition() {
  return new Promise((resolve) => {
    chrome.storage.local.get({ dockPosition: "center" }, (data) => {
      resolve(data.dockPosition);
    });
  });
}

function calculateWindowBounds(screenBounds, position) {
  const config = DOCK_DEFAULTS[position] || DOCK_DEFAULTS.center;
  let width = Math.max(Math.round(screenBounds.width * config.widthRatio), config.minWidth);
  let height = Math.max(Math.round(screenBounds.height * config.heightRatio), config.minHeight);
  let left = screenBounds.left;
  let top = screenBounds.top;

  switch (position) {
    case "left":
      // Snap to left edge, full height
      break;
    case "right":
      left = screenBounds.left + screenBounds.width - width;
      break;
    case "top":
      // Snap to top edge, full width
      break;
    case "bottom":
      top = screenBounds.top + screenBounds.height - height;
      break;
    case "center":
    default:
      left = screenBounds.left + Math.round((screenBounds.width - width) / 2);
      top = screenBounds.top + Math.round((screenBounds.height - height) / 2);
      break;
  }

  return { left, top, width, height };
}

async function openManagerWindow(position) {
  // If a manager window already exists, focus it
  if (managerWindowId !== null) {
    try {
      await chrome.windows.get(managerWindowId);
      // Window exists – reposition it
      const screen = await getDisplayBounds();
      const pos = position || await getSavedDockPosition();
      const bounds = calculateWindowBounds(screen, pos);
      await chrome.windows.update(managerWindowId, {
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height,
        focused: true
      });
      return;
    } catch {
      managerWindowId = null;
    }
  }

  const screen = await getDisplayBounds();
  const pos = position || await getSavedDockPosition();
  const bounds = calculateWindowBounds(screen, pos);

  const win = await chrome.windows.create({
    url: chrome.runtime.getURL("manager.html"),
    type: "popup",
    ...bounds
  });
  managerWindowId = win.id;
}

// Track when the manager window is closed
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === managerWindowId) {
    managerWindowId = null;
  }
});

// Listen for messages from popup / manager
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "openDetachedWindow") {
    openManagerWindow(message.position);
  }
  if (message.action === "setDockPosition") {
    chrome.storage.local.set({ dockPosition: message.position }, () => {
      openManagerWindow(message.position);
      sendResponse({ ok: true });
    });
    return true; // keep channel open for async sendResponse
  }
  if (message.action === "getDockPosition") {
    getSavedDockPosition().then((pos) => sendResponse({ position: pos }));
    return true;
  }
});
