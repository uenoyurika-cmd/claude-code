// Service Worker for Meta提案拡張機能
// アイコンクリック → 専用タブで開く（ポップアップではなくタブで動作させ、ページ移動しても作業継続可能）

chrome.action.onClicked.addListener(async () => {
  // 既に開いているタブがあればそちらにフォーカス
  const url = chrome.runtime.getURL("popup.html");
  const tabs = await chrome.tabs.query({});
  const existing = tabs.find((t) => t.url === url);

  if (existing) {
    await chrome.tabs.update(existing.id, { active: true });
    await chrome.windows.update(existing.windowId, { focused: true });
  } else {
    await chrome.tabs.create({ url });
  }
});

// メッセージハンドラ（将来の拡張用）
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "fetchPage") {
    fetchPageMeta(message.url)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // 非同期レスポンスを有効化
  }
});

// ページのメタ情報を取得
async function fetchPageMeta(url) {
  const response = await fetch(url);
  const html = await response.text();

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["'][^>]*>/i) ||
    html.match(/<meta[^>]*content=["']([\s\S]*?)["'][^>]*name=["']description["'][^>]*>/i);

  return {
    title: titleMatch ? titleMatch[1].trim() : "",
    description: descMatch ? descMatch[1].trim() : "",
  };
}
