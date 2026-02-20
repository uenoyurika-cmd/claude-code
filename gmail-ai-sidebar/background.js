// Side Panel をアクションクリックで開く
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Gmail のタブでのみサイドパネルを有効にする
chrome.tabs.onUpdated.addListener((tabId, info, tab) => {
  if (!tab.url) return;

  const isGmail = tab.url.includes("mail.google.com");

  chrome.sidePanel.setOptions({
    tabId,
    path: "sidepanel/sidepanel.html",
    enabled: true,
  });
});
