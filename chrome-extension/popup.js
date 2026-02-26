// ===== State =====
let pages = []; // { url, title, description, selected }
let results = []; // { url, currentTitle, suggestedTitle, currentDesc, suggestedDesc, reason }

// ===== DOM Elements =====
const $ = (id) => document.getElementById(id);

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", async () => {
  // Load saved API key
  const stored = await chrome.storage.local.get("openaiApiKey");
  if (stored.openaiApiKey) {
    $("apiKey").value = stored.openaiApiKey;
    $("apiKeyStatus").textContent = "API Key 設定済み";
    $("apiKeyStatus").className = "status success";
  }

  // Event listeners
  $("saveApiKey").addEventListener("click", saveApiKey);
  $("fetchSitemap").addEventListener("click", fetchSitemap);
  $("fetchFromCms").addEventListener("click", fetchFromCms);
  $("fetchMeta").addEventListener("click", fetchMetaFromPages);
  $("selectAll").addEventListener("change", toggleSelectAll);
  $("generateSuggestions").addEventListener("click", generateAiSuggestions);
  $("exportCsv").addEventListener("click", exportCsv);
});

// ===== 1. API Key 保存 =====
async function saveApiKey() {
  const key = $("apiKey").value.trim();
  if (!key) {
    setStatus("apiKeyStatus", "API Key を入力してください", "error");
    return;
  }
  await chrome.storage.local.set({ openaiApiKey: key });
  setStatus("apiKeyStatus", "API Key を保存しました", "success");
}

// ===== 2. サイトマップ取得 =====
async function fetchSitemap() {
  const url = $("sitemapUrl").value.trim();
  if (!url) {
    setStatus("sitemapStatus", "URLを入力してください", "error");
    return;
  }

  setStatus("sitemapStatus", "サイトマップを取得中...");

  try {
    const response = await fetch(url);
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");

    const urls = [];

    // 標準的なsitemap.xml
    const locs = xml.querySelectorAll("url > loc");
    locs.forEach((loc) => {
      urls.push(loc.textContent.trim());
    });

    // sitemapindex の場合
    if (urls.length === 0) {
      const sitemapLocs = xml.querySelectorAll("sitemap > loc");
      if (sitemapLocs.length > 0) {
        setStatus("sitemapStatus", "サイトマップインデックスを検出。個別サイトマップを取得中...");
        for (const loc of sitemapLocs) {
          const subRes = await fetch(loc.textContent.trim());
          const subText = await subRes.text();
          const subXml = parser.parseFromString(subText, "text/xml");
          subXml.querySelectorAll("url > loc").forEach((l) => {
            urls.push(l.textContent.trim());
          });
        }
      }
    }

    if (urls.length === 0) {
      setStatus("sitemapStatus", "URLが見つかりませんでした", "error");
      return;
    }

    pages = urls.map((u) => ({
      url: u,
      title: "",
      description: "",
      selected: true,
    }));

    renderPagesTable();
    setStatus("sitemapStatus", `${urls.length} ページを検出しました`, "success");
  } catch (e) {
    setStatus("sitemapStatus", `取得エラー: ${e.message}`, "error");
  }
}

// ===== 2b. CMSページからリンク取得 =====
async function fetchFromCms() {
  setStatus("sitemapStatus", "現在のページからリンクを取得中...");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const injectionResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractLinksFromPage,
    });

    const urls = injectionResults[0]?.result || [];

    if (urls.length === 0) {
      setStatus("sitemapStatus", "リンクが見つかりませんでした", "error");
      return;
    }

    pages = urls.map((u) => ({
      url: u,
      title: "",
      description: "",
      selected: true,
    }));

    renderPagesTable();
    setStatus("sitemapStatus", `${urls.length} ページを検出しました`, "success");
  } catch (e) {
    setStatus("sitemapStatus", `取得エラー: ${e.message}`, "error");
  }
}

// Content script: ページ内のリンクを抽出
function extractLinksFromPage() {
  const links = document.querySelectorAll("a[href]");
  const currentOrigin = location.origin;
  const seen = new Set();
  const result = [];

  links.forEach((a) => {
    try {
      const url = new URL(a.href, location.href);
      // 同一ドメインのHTTPリンクのみ
      if (
        url.origin === currentOrigin &&
        url.protocol.startsWith("http") &&
        !url.hash &&
        !seen.has(url.pathname)
      ) {
        seen.add(url.pathname);
        result.push(url.href);
      }
    } catch {
      // invalid URL
    }
  });

  return result;
}

// ===== 3. TD取得 =====
async function fetchMetaFromPages() {
  const selected = pages.filter((p) => p.selected);
  if (selected.length === 0) {
    setStatus("metaStatus", "ページを選択してください", "error");
    return;
  }

  setStatus("metaStatus", `0 / ${selected.length} ページのメタ情報を取得中...`);
  $("fetchMeta").disabled = true;

  let completed = 0;

  // 5件ずつ並列取得
  const batchSize = 5;
  for (let i = 0; i < selected.length; i += batchSize) {
    const batch = selected.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (page) => {
        try {
          const response = await fetch(page.url);
          const html = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          page.title = doc.querySelector("title")?.textContent?.trim() || "";
          const metaDesc =
            doc.querySelector('meta[name="description"]') ||
            doc.querySelector('meta[property="og:description"]');
          page.description = metaDesc?.getAttribute("content")?.trim() || "";
        } catch {
          page.title = "(取得失敗)";
          page.description = "(取得失敗)";
        }
        completed++;
        setStatus("metaStatus", `${completed} / ${selected.length} ページのメタ情報を取得中...`);
      })
    );
  }

  renderPagesTable();
  $("fetchMeta").disabled = false;
  $("generateSuggestions").disabled = false;
  setStatus("metaStatus", `${completed} ページのメタ情報を取得しました`, "success");
}

// ===== 4. AI提案生成 =====
async function generateAiSuggestions() {
  const stored = await chrome.storage.local.get("openaiApiKey");
  const apiKey = stored.openaiApiKey;

  if (!apiKey) {
    setStatus("aiStatus", "OpenAI API Key を設定してください", "error");
    return;
  }

  const selected = pages.filter((p) => p.selected && p.title);
  if (selected.length === 0) {
    setStatus("aiStatus", "メタ情報を先に取得してください", "error");
    return;
  }

  $("generateSuggestions").disabled = true;
  $("progressBar").style.display = "block";
  results = [];

  let completed = 0;
  const total = selected.length;

  for (const page of selected) {
    try {
      const suggestion = await callOpenAI(apiKey, page);
      results.push({
        url: page.url,
        currentTitle: page.title,
        suggestedTitle: suggestion.title,
        currentDesc: page.description,
        suggestedDesc: suggestion.description,
        reason: suggestion.reason,
      });
    } catch (e) {
      results.push({
        url: page.url,
        currentTitle: page.title,
        suggestedTitle: "(エラー)",
        currentDesc: page.description,
        suggestedDesc: "(エラー)",
        reason: e.message,
      });
    }

    completed++;
    const pct = Math.round((completed / total) * 100);
    $("progressFill").style.width = pct + "%";
    $("progressText").textContent = `${completed} / ${total} (${pct}%)`;
  }

  renderResultsTable();
  $("generateSuggestions").disabled = false;
  $("exportCsv").disabled = false;
  setStatus("aiStatus", `${results.length} ページの提案を生成しました`, "success");
}

// OpenAI API 呼び出し
async function callOpenAI(apiKey, page) {
  const prompt = `あなたはSEOの専門家です。以下のWebページのTitle（タイトルタグ）とDescription（メタディスクリプション）を分析し、SEO効果を最大化する改善案を提案してください。

【URL】${page.url}
【現在のTitle】${page.title}
【現在のDescription】${page.description}

以下のJSON形式で回答してください（日本語で回答）:
{
  "title": "提案するタイトル（30〜60文字程度）",
  "description": "提案するディスクリプション（80〜160文字程度）",
  "reason": "改善ポイントの簡潔な説明"
}

注意点:
- 検索意図に合ったキーワードを自然に含める
- クリック率を高める魅力的な表現にする
- 文字数制限を守る
- 現在の内容が既に最適な場合はその旨を伝える`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  return JSON.parse(content);
}

// ===== 5. CSV書き出し =====
function exportCsv() {
  if (results.length === 0) return;

  const headers = [
    "URL",
    "現在のTitle",
    "提案Title",
    "現在のDescription",
    "提案Description",
    "改善ポイント",
  ];

  const rows = results.map((r) => [
    r.url,
    r.currentTitle,
    r.suggestedTitle,
    r.currentDesc,
    r.suggestedDesc,
    r.reason,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  // BOM付きUTF-8でExcel対応
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `seo_suggestions_${formatDate()}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

function formatDate() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
}

// ===== UI Helpers =====
function renderPagesTable() {
  const tbody = $("pagesTableBody");
  tbody.innerHTML = "";

  pages.forEach((page, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" data-index="${i}" ${page.selected ? "checked" : ""} /></td>
      <td title="${escapeHtml(page.url)}">${escapeHtml(truncate(page.url, 40))}</td>
      <td title="${escapeHtml(page.title)}">${escapeHtml(truncate(page.title, 30))}</td>
      <td title="${escapeHtml(page.description)}">${escapeHtml(truncate(page.description, 30))}</td>
    `;
    tr.querySelector("input").addEventListener("change", (e) => {
      pages[i].selected = e.target.checked;
    });
    tbody.appendChild(tr);
  });

  $("pageCount").textContent = pages.length;
  $("fetchMeta").disabled = pages.length === 0;
}

function renderResultsTable() {
  const tbody = $("resultsTableBody");
  tbody.innerHTML = "";

  results.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td title="${escapeHtml(r.url)}">${escapeHtml(truncate(r.url, 30))}</td>
      <td title="${escapeHtml(r.currentTitle)}">${escapeHtml(truncate(r.currentTitle, 25))}</td>
      <td title="${escapeHtml(r.suggestedTitle)}">${escapeHtml(truncate(r.suggestedTitle, 25))}</td>
      <td title="${escapeHtml(r.currentDesc)}">${escapeHtml(truncate(r.currentDesc, 25))}</td>
      <td title="${escapeHtml(r.suggestedDesc)}">${escapeHtml(truncate(r.suggestedDesc, 25))}</td>
      <td title="${escapeHtml(r.reason)}">${escapeHtml(truncate(r.reason, 30))}</td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleSelectAll(e) {
  const checked = e.target.checked;
  pages.forEach((p) => (p.selected = checked));
  renderPagesTable();
  $("selectAll").checked = checked;
}

function setStatus(id, message, type = "") {
  const el = $(id);
  el.textContent = message;
  el.className = `status ${type}`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function truncate(str, len) {
  if (!str) return "";
  return str.length > len ? str.substring(0, len) + "..." : str;
}
