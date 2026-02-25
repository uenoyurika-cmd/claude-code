// Popup UI logic

const searchInput = document.getElementById("searchInput");
const bookmarkTree = document.getElementById("bookmarkTree");
const openDetachedBtn = document.getElementById("openDetached");
const addBookmarkBtn = document.getElementById("addBookmark");

let searchTimeout = null;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadBookmarks();
  loadDockPosition();
  setupEventListeners();
});

function setupEventListeners() {
  // Open detached window
  openDetachedBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "openDetachedWindow" });
    window.close();
  });

  // Dock position selector
  document.querySelectorAll(".dock-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const position = btn.dataset.position;
      document.querySelectorAll(".dock-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      chrome.runtime.sendMessage({ action: "setDockPosition", position });
    });
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

async function loadDockPosition() {
  chrome.runtime.sendMessage({ action: "getDockPosition" }, (response) => {
    if (response && response.position) {
      document.querySelectorAll(".dock-btn").forEach(b => b.classList.remove("active"));
      const active = document.querySelector(`.dock-btn[data-position="${response.position}"]`);
      if (active) active.classList.add("active");
    }
  });
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
            <span class="folder-toggle">&#9654;</span>
            <span class="folder-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/></svg></span>
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
            <span class="folder-toggle">&#9654;</span>
            <span class="folder-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/></svg></span>
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
        toggle.innerHTML = children.classList.contains("collapsed") ? "&#9654;" : "&#9660;";
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
    addBookmarkBtn.classList.add("btn-success");
    setTimeout(() => {
      addBookmarkBtn.textContent = "+ 現在のページを追加";
      addBookmarkBtn.classList.remove("btn-success");
    }, 1500);
  }
}
