// Manager (detached window) UI logic

const searchInput = document.getElementById("searchInput");
const bookmarkTree = document.getElementById("bookmarkTree");
const folderTreeEl = document.getElementById("folderTree");
const breadcrumb = document.getElementById("breadcrumb");
const contextMenu = document.getElementById("contextMenu");
const editModal = document.getElementById("editModal");
const viewTreeBtn = document.getElementById("viewTree");
const viewGridBtn = document.getElementById("viewGrid");
const addFolderBtn = document.getElementById("addFolder");

let currentFolderId = "0";
let currentView = "tree"; // "tree" or "grid"
let folderPaths = {};
let contextTarget = null;
let modalMode = null; // "edit" or "move"
let searchTimeout = null;

document.addEventListener("DOMContentLoaded", () => {
  loadSidebar();
  navigateToFolder("0");
  loadDockPosition();
  setupEventListeners();
});

function setupEventListeners() {
  // Search
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = searchInput.value.trim();
      if (query) {
        searchBookmarks(query);
      } else {
        navigateToFolder(currentFolderId);
      }
    }, 250);
  });

  // View toggle
  viewTreeBtn.addEventListener("click", () => setView("tree"));
  viewGridBtn.addEventListener("click", () => setView("grid"));

  // Dock position selector
  document.querySelectorAll(".dock-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const position = btn.dataset.position;
      document.querySelectorAll(".dock-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      chrome.runtime.sendMessage({ action: "setDockPosition", position });
    });
  });

  // Add folder
  addFolderBtn.addEventListener("click", () => createNewFolder());

  // Bookmark item clicks
  bookmarkTree.addEventListener("click", handleItemClick);
  bookmarkTree.addEventListener("contextmenu", handleContextMenu);

  // Context menu actions
  contextMenu.addEventListener("click", handleContextAction);

  // Close context menu on outside click
  document.addEventListener("click", () => hideContextMenu());

  // Modal
  document.getElementById("modalCancel").addEventListener("click", hideModal);
  document.querySelector(".modal-backdrop").addEventListener("click", hideModal);
  document.getElementById("modalSave").addEventListener("click", handleModalSave);

  // Drag and drop
  bookmarkTree.addEventListener("dragstart", handleDragStart);
  bookmarkTree.addEventListener("dragover", handleDragOver);
  bookmarkTree.addEventListener("dragleave", handleDragLeave);
  bookmarkTree.addEventListener("drop", handleDrop);

  // Sidebar folder clicks
  folderTreeEl.addEventListener("click", handleSidebarClick);

  // Keyboard shortcut
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideContextMenu();
      hideModal();
    }
    if (e.key === "f" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

// ===== Dock Position =====

function loadDockPosition() {
  chrome.runtime.sendMessage({ action: "getDockPosition" }, (response) => {
    if (response && response.position) {
      document.querySelectorAll(".dock-btn").forEach(b => b.classList.remove("active"));
      const active = document.querySelector(`.dock-btn[data-position="${response.position}"]`);
      if (active) active.classList.add("active");
    }
  });
}

// ===== Sidebar =====

async function loadSidebar() {
  const tree = await BookmarkManager.getTree();
  folderPaths = BookmarkManager.buildFolderPaths(tree[0].children);
  renderSidebarFolders(tree[0].children);
}

function renderSidebarFolders(nodes, depth = 0) {
  let html = "";
  for (const node of nodes) {
    if (BookmarkManager.isFolder(node)) {
      const indent = depth * 16;
      const childCount = node.children ? node.children.filter(c => !c.url).length : 0;
      html += `
        <div class="sidebar-folder" data-id="${node.id}" style="padding-left: ${indent + 8}px">
          <svg class="sidebar-folder-icon" width="14" height="14" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/></svg>
          <span class="folder-name">${BookmarkManager.escapeHtml(node.title || "Root")}</span>
        </div>
      `;
      if (node.children && childCount > 0) {
        html += renderSidebarFolders(node.children, depth + 1);
      }
    }
  }
  if (depth === 0) {
    folderTreeEl.innerHTML = html;
  }
  return html;
}

function handleSidebarClick(e) {
  const folder = e.target.closest(".sidebar-folder");
  if (folder) {
    navigateToFolder(folder.dataset.id);
    folderTreeEl.querySelectorAll(".sidebar-folder").forEach(f => f.classList.remove("active"));
    folder.classList.add("active");
  }
}

// ===== Navigation =====

async function navigateToFolder(folderId) {
  currentFolderId = folderId;
  const children = folderId === "0"
    ? (await BookmarkManager.getTree())[0].children
    : await BookmarkManager.getChildren(folderId);
  renderBreadcrumb(folderId);
  renderContent(children);
}

async function renderBreadcrumb(folderId) {
  if (folderId === "0") {
    breadcrumb.innerHTML = '<span class="breadcrumb-item active">すべてのブックマーク</span>';
    return;
  }

  const path = folderPaths[folderId];
  if (!path) {
    breadcrumb.innerHTML = '<span class="breadcrumb-item active">すべてのブックマーク</span>';
    return;
  }

  const parts = path.split(" / ");
  let html = `<span class="breadcrumb-item clickable" data-id="0">すべて</span>`;
  html += parts.map((part, i) => {
    if (i === parts.length - 1) {
      return ` <span class="breadcrumb-sep">&#8250;</span> <span class="breadcrumb-item active">${BookmarkManager.escapeHtml(part)}</span>`;
    }
    return ` <span class="breadcrumb-sep">&#8250;</span> <span class="breadcrumb-item">${BookmarkManager.escapeHtml(part)}</span>`;
  }).join("");

  breadcrumb.innerHTML = html;
  breadcrumb.querySelector('[data-id="0"]')?.addEventListener("click", () => navigateToFolder("0"));
}

function renderContent(nodes) {
  if (currentView === "grid") {
    renderGrid(nodes);
  } else {
    renderList(nodes);
  }
}

function renderList(nodes) {
  let html = "";
  const folders = nodes.filter(n => BookmarkManager.isFolder(n));
  const bookmarks = nodes.filter(n => !BookmarkManager.isFolder(n));

  for (const node of [...folders, ...bookmarks]) {
    html += BookmarkManager.renderBookmarkItem(node, { draggable: true });
  }

  bookmarkTree.className = "bookmark-tree view-list";
  bookmarkTree.innerHTML = html || '<div class="empty-state"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></div><p>このフォルダは空です</p></div>';
}

function renderGrid(nodes) {
  const folders = nodes.filter(n => BookmarkManager.isFolder(n));
  const bookmarks = nodes.filter(n => !BookmarkManager.isFolder(n));

  let html = "";
  for (const node of [...folders, ...bookmarks]) {
    if (BookmarkManager.isFolder(node)) {
      html += `
        <div class="grid-item folder" data-id="${node.id}" draggable="true">
          <div class="grid-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="var(--accent)" stroke="none"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/></svg></div>
          <div class="grid-title">${BookmarkManager.escapeHtml(node.title || "無題")}</div>
          <div class="grid-count">${node.children ? node.children.length : 0} 件</div>
        </div>
      `;
    } else {
      const favicon = BookmarkManager.getFaviconUrl(node.url);
      html += `
        <div class="grid-item bookmark" data-id="${node.id}" data-url="${BookmarkManager.escapeHtml(node.url)}" draggable="true">
          <img class="grid-favicon" src="${favicon}" alt="" width="32" height="32" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><rect width=%2232%22 height=%2232%22 rx=%224%22 fill=%22%23e8e8e8%22/></svg>'">
          <div class="grid-title">${BookmarkManager.escapeHtml(node.title || node.url)}</div>
        </div>
      `;
    }
  }

  bookmarkTree.className = "bookmark-tree view-grid";
  bookmarkTree.innerHTML = html || '<div class="empty-state"><div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--gray)" stroke-width="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg></div><p>このフォルダは空です</p></div>';
}

// ===== Search =====

async function searchBookmarks(query) {
  const results = await BookmarkManager.search(query);
  let html = "";
  if (results.length === 0) {
    html = '<div class="empty-state"><p>検索結果がありません</p></div>';
  } else {
    for (const node of results) {
      const path = folderPaths[node.parentId] || "";
      html += BookmarkManager.renderBookmarkItem(node, { draggable: true, showPath: true, folderPath: path });
    }
  }
  bookmarkTree.className = "bookmark-tree view-list";
  bookmarkTree.innerHTML = html;
}

// ===== View Toggle =====

function setView(view) {
  currentView = view;
  viewTreeBtn.classList.toggle("active", view === "tree");
  viewGridBtn.classList.toggle("active", view === "grid");
  navigateToFolder(currentFolderId);
}

// ===== Item Click =====

function handleItemClick(e) {
  const item = e.target.closest(".bookmark-item, .grid-item");
  if (!item) return;

  if (item.classList.contains("folder")) {
    navigateToFolder(item.dataset.id);
    return;
  }

  const url = item.dataset.url;
  if (url) {
    window.open(url, "_blank");
  }
}

// ===== Context Menu =====

function handleContextMenu(e) {
  const item = e.target.closest(".bookmark-item, .grid-item");
  if (!item) return;

  e.preventDefault();
  contextTarget = item;

  contextMenu.style.left = `${e.clientX}px`;
  contextMenu.style.top = `${e.clientY}px`;
  contextMenu.classList.remove("hidden");

  const rect = contextMenu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    contextMenu.style.left = `${e.clientX - rect.width}px`;
  }
  if (rect.bottom > window.innerHeight) {
    contextMenu.style.top = `${e.clientY - rect.height}px`;
  }
}

function hideContextMenu() {
  contextMenu.classList.add("hidden");
}

async function handleContextAction(e) {
  const btn = e.target.closest("button");
  if (!btn || !contextTarget) return;

  const action = btn.dataset.action;
  const id = contextTarget.dataset.id;
  const url = contextTarget.dataset.url;
  const isFolder = contextTarget.classList.contains("folder");

  hideContextMenu();

  switch (action) {
    case "open":
      if (isFolder) {
        navigateToFolder(id);
      } else if (url) {
        window.open(url, "_blank");
      }
      break;

    case "openNewTab":
      if (url) {
        chrome.tabs.create({ url });
      }
      break;

    case "edit":
      showEditModal(id, isFolder);
      break;

    case "move":
      showMoveModal(id);
      break;

    case "delete":
      if (confirm(isFolder ? "このフォルダとその中身を削除しますか？" : "このブックマークを削除しますか？")) {
        if (isFolder) {
          await BookmarkManager.removeTree(id);
        } else {
          await BookmarkManager.remove(id);
        }
        navigateToFolder(currentFolderId);
        loadSidebar();
      }
      break;
  }
}

// ===== Modal =====

async function showEditModal(id, isFolder) {
  modalMode = "edit";
  const [node] = await new Promise(r => chrome.bookmarks.get(id, r));

  document.getElementById("modalTitle").textContent = isFolder ? "フォルダを編集" : "ブックマークを編集";
  document.getElementById("editName").value = node.title || "";
  document.getElementById("urlGroup").classList.toggle("hidden", isFolder);
  document.getElementById("editUrl").value = node.url || "";
  document.getElementById("parentGroup").classList.add("hidden");

  editModal.dataset.targetId = id;
  editModal.classList.remove("hidden");
}

async function showMoveModal(id) {
  modalMode = "move";
  const tree = await BookmarkManager.getTree();
  folderPaths = BookmarkManager.buildFolderPaths(tree[0].children);

  document.getElementById("modalTitle").textContent = "移動先を選択";
  document.getElementById("editName").parentElement.classList.add("hidden");
  document.getElementById("urlGroup").classList.add("hidden");
  document.getElementById("parentGroup").classList.remove("hidden");

  const select = document.getElementById("editParent");
  select.innerHTML = "";
  for (const [fid, path] of Object.entries(folderPaths)) {
    const option = document.createElement("option");
    option.value = fid;
    option.textContent = path;
    select.appendChild(option);
  }

  editModal.dataset.targetId = id;
  editModal.classList.remove("hidden");
}

function hideModal() {
  editModal.classList.add("hidden");
  document.getElementById("editName").parentElement.classList.remove("hidden");
  document.getElementById("urlGroup").classList.remove("hidden");
  document.getElementById("parentGroup").classList.remove("hidden");
}

async function handleModalSave() {
  const id = editModal.dataset.targetId;

  if (modalMode === "edit") {
    const title = document.getElementById("editName").value;
    const url = document.getElementById("editUrl").value;
    const changes = { title };
    if (url && !document.getElementById("urlGroup").classList.contains("hidden")) {
      changes.url = url;
    }
    await BookmarkManager.update(id, changes);
  } else if (modalMode === "move") {
    const parentId = document.getElementById("editParent").value;
    await BookmarkManager.move(id, { parentId });
  }

  hideModal();
  navigateToFolder(currentFolderId);
  loadSidebar();
}

// ===== Drag and Drop =====

let draggedId = null;

function handleDragStart(e) {
  const item = e.target.closest(".bookmark-item, .grid-item");
  if (!item) return;

  draggedId = item.dataset.id;
  e.dataTransfer.effectAllowed = "move";
  item.classList.add("dragging");
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  const target = e.target.closest(".bookmark-item.folder, .grid-item.folder");
  if (target && target.dataset.id !== draggedId) {
    target.classList.add("drag-over");
  }
}

function handleDragLeave(e) {
  const target = e.target.closest(".bookmark-item.folder, .grid-item.folder");
  if (target) {
    target.classList.remove("drag-over");
  }
}

async function handleDrop(e) {
  e.preventDefault();

  const target = e.target.closest(".bookmark-item.folder, .grid-item.folder");
  if (target && draggedId && target.dataset.id !== draggedId) {
    await BookmarkManager.move(draggedId, { parentId: target.dataset.id });
    navigateToFolder(currentFolderId);
    loadSidebar();
  }

  document.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
  document.querySelectorAll(".dragging").forEach(el => el.classList.remove("dragging"));
  draggedId = null;
}

// ===== Create Folder =====

async function createNewFolder() {
  const name = prompt("新しいフォルダ名:");
  if (name) {
    await BookmarkManager.create({
      parentId: currentFolderId === "0" ? "1" : currentFolderId,
      title: name
    });
    navigateToFolder(currentFolderId);
    loadSidebar();
  }
}
