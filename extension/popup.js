// Popup UI logic

const searchInput = document.getElementById("searchInput");
const bookmarkTree = document.getElementById("bookmarkTree");
const openDetachedBtn = document.getElementById("openDetached");
const addBookmarkBtn = document.getElementById("addBookmark");

let searchTimeout = null;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadBookmarks();
  setupEventListeners();
});

function setupEventListeners() {
  // Open detached window
  openDetachedBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openDetachedWindow" });
    window.close();
  });

  // Search with debounce
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = searchInput.value.trim();
      if (query) {
        searchBookmarks(query);
      } else {
        loadBookmarks();
      }
    }, 250);
  });

  // Add current page as bookmark
  addBookmarkBtn.addEventListener("click", addCurrentPage);

  // Click on bookmark items
  bookmarkTree.addEventListener("click", handleItemClick);
}

async function loadBookmarks() {
  const tree = await BookmarkManager.getTree();
  renderTree(tree[0].children);
}

function renderTree(nodes) {
  let html = "";
  for (const node of nodes) {
    if (BookmarkManager.isFolder(node)) {
      html += `
        <div class="tree-folder" data-id="${node.id}">
          <div class="bookmark-item folder" data-id="${node.id}">
            <span class="folder-toggle">▶</span>
            <span class="folder-icon">📁</span>
            <span class="bookmark-title">${BookmarkManager.escapeHtml(node.title || "無題")}</span>
            <span class="item-count">${node.children ? node.children.length : 0}</span>
          </div>
          <div class="tree-children collapsed">
            ${node.children ? renderChildNodes(node.children) : ""}
          </div>
        </div>
      `;
    } else {
      html += BookmarkManager.renderBookmarkItem(node);
    }
  }
  bookmarkTree.innerHTML = html || '<div class="empty-state">ブックマークがありません</div>';
}

function renderChildNodes(nodes) {
  let html = "";
  for (const node of nodes) {
    if (BookmarkManager.isFolder(node)) {
      html += `
        <div class="tree-folder" data-id="${node.id}">
          <div class="bookmark-item folder" data-id="${node.id}">
            <span class="folder-toggle">▶</span>
            <span class="folder-icon">📁</span>
            <span class="bookmark-title">${BookmarkManager.escapeHtml(node.title || "無題")}</span>
            <span class="item-count">${node.children ? node.children.length : 0}</span>
          </div>
          <div class="tree-children collapsed">
            ${node.children ? renderChildNodes(node.children) : ""}
          </div>
        </div>
      `;
    } else {
      html += BookmarkManager.renderBookmarkItem(node);
    }
  }
  return html;
}

async function searchBookmarks(query) {
  const results = await BookmarkManager.search(query);
  let html = "";
  if (results.length === 0) {
    html = '<div class="empty-state">検索結果がありません</div>';
  } else {
    for (const node of results) {
      html += BookmarkManager.renderBookmarkItem(node, { showPath: true });
    }
  }
  bookmarkTree.innerHTML = html;
}

function handleItemClick(e) {
  const item = e.target.closest(".bookmark-item");
  if (!item) return;

  // Toggle folder
  if (item.classList.contains("folder")) {
    const folder = item.closest(".tree-folder");
    if (folder) {
      const children = folder.querySelector(".tree-children");
      const toggle = item.querySelector(".folder-toggle");
      if (children) {
        children.classList.toggle("collapsed");
        toggle.textContent = children.classList.contains("collapsed") ? "▶" : "▼";
      }
    }
    return;
  }

  // Open bookmark
  const url = item.dataset.url;
  if (url) {
    chrome.tabs.create({ url });
    window.close();
  }
}

async function addCurrentPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    await BookmarkManager.create({
      title: tab.title,
      url: tab.url
    });
    loadBookmarks();
    addBookmarkBtn.textContent = "✓ 追加しました";
    setTimeout(() => {
      addBookmarkBtn.textContent = "+ 現在のページを追加";
    }, 1500);
  }
}
