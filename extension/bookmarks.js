// Shared bookmark utilities used by both popup and manager

const BookmarkManager = {
  // Fetch the full bookmark tree
  async getTree() {
    return new Promise((resolve) => {
      chrome.bookmarks.getTree((tree) => resolve(tree));
    });
  },

  // Search bookmarks by query
  async search(query) {
    return new Promise((resolve) => {
      chrome.bookmarks.search(query, (results) => resolve(results));
    });
  },

  // Get children of a specific folder
  async getChildren(folderId) {
    return new Promise((resolve) => {
      chrome.bookmarks.getChildren(folderId, (children) => resolve(children));
    });
  },

  // Create a new bookmark or folder
  async create(details) {
    return new Promise((resolve) => {
      chrome.bookmarks.create(details, (result) => resolve(result));
    });
  },

  // Update bookmark title or URL
  async update(id, changes) {
    return new Promise((resolve) => {
      chrome.bookmarks.update(id, changes, (result) => resolve(result));
    });
  },

  // Move bookmark to a different folder or position
  async move(id, destination) {
    return new Promise((resolve) => {
      chrome.bookmarks.move(id, destination, (result) => resolve(result));
    });
  },

  // Remove a bookmark or empty folder
  async remove(id) {
    return new Promise((resolve) => {
      chrome.bookmarks.remove(id, () => resolve());
    });
  },

  // Remove a folder and all its contents
  async removeTree(id) {
    return new Promise((resolve) => {
      chrome.bookmarks.removeTree(id, () => resolve());
    });
  },

  // Get favicon URL for a bookmark
  getFaviconUrl(url) {
    if (!url) return "";
    try {
      const u = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=32`;
    } catch {
      return "";
    }
  },

  // Check if a node is a folder
  isFolder(node) {
    return !node.url;
  },

  // Flatten tree for search results
  flattenTree(nodes, result = []) {
    for (const node of nodes) {
      if (node.url) {
        result.push(node);
      }
      if (node.children) {
        this.flattenTree(node.children, result);
      }
    }
    return result;
  },

  // Build folder path map  { id -> "Folder / SubFolder / ..." }
  buildFolderPaths(nodes, path = "", map = {}) {
    for (const node of nodes) {
      if (this.isFolder(node)) {
        const currentPath = path ? `${path} / ${node.title}` : node.title || "Root";
        map[node.id] = currentPath;
        if (node.children) {
          this.buildFolderPaths(node.children, currentPath, map);
        }
      }
    }
    return map;
  },

  // Render a single bookmark item as HTML
  renderBookmarkItem(node, options = {}) {
    const { draggable = false, showPath = false, folderPath = "" } = options;

    if (this.isFolder(node)) {
      return `
        <div class="bookmark-item folder" data-id="${node.id}" ${draggable ? 'draggable="true"' : ""}>
          <span class="folder-icon">📁</span>
          <span class="bookmark-title">${this.escapeHtml(node.title || "無題のフォルダ")}</span>
          <span class="item-count">${node.children ? node.children.length : ""}</span>
        </div>
      `;
    }

    const favicon = this.getFaviconUrl(node.url);
    return `
      <div class="bookmark-item bookmark" data-id="${node.id}" data-url="${this.escapeHtml(node.url)}" ${draggable ? 'draggable="true"' : ""}>
        <img class="favicon" src="${favicon}" alt="" width="16" height="16" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><rect width=%2216%22 height=%2216%22 rx=%222%22 fill=%22%23ddd%22/></svg>'">
        <div class="bookmark-info">
          <span class="bookmark-title">${this.escapeHtml(node.title || node.url)}</span>
          ${showPath && folderPath ? `<span class="bookmark-path">${this.escapeHtml(folderPath)}</span>` : ""}
          <span class="bookmark-url">${this.escapeHtml(this.truncateUrl(node.url))}</span>
        </div>
      </div>
    `;
  },

  truncateUrl(url, maxLength = 60) {
    if (!url || url.length <= maxLength) return url || "";
    return url.substring(0, maxLength) + "...";
  },

  escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
};
