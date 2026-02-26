// ===== State =====
let currentMode = "td"; // "td" | "estimate"
let pages = []; // { url, path, title, description, status, noIndex, selected }
let results = []; // { url, path, currentTitle, suggestedTitle, currentDesc, suggestedDesc, reason }

// Estimate mode state
let estPages = []; // { name, type, url, path, title, selected }
let estimateItems = []; // { id, tier, category, item, description, quantity, unitPrice }
let currentTierFilter = "all";

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

  // Shared
  $("saveApiKey").addEventListener("click", saveApiKey);

  // Mode selection
  $("modeCardTd").addEventListener("click", () => selectMode("td"));
  $("modeCardEstimate").addEventListener("click", () => selectMode("estimate"));

  // TD mode
  $("fetchSitemap").addEventListener("click", fetchSitemap);
  $("fetchFromCms").addEventListener("click", fetchFromCms);
  $("fetchMeta").addEventListener("click", fetchMetaFromPages);
  $("selectAll").addEventListener("change", toggleSelectAll);
  $("generateSuggestions").addEventListener("click", generateAiSuggestions);
  $("exportCsv").addEventListener("click", exportCsv);

  // Estimate mode — tabs
  $("tabEstSitemap").addEventListener("click", () => switchEstTab("est-sitemap-tab"));
  $("tabEstManual").addEventListener("click", () => switchEstTab("est-manual-tab"));

  // Estimate mode — data input
  $("estFetchSitemap").addEventListener("click", estFetchSitemap);
  $("estFetchFromCms").addEventListener("click", estFetchFromCms);
  $("parseManualPages").addEventListener("click", parseManualPages);
  $("estSelectAll").addEventListener("change", estToggleSelectAll);

  // Estimate mode — AI & results
  $("generateEstimate").addEventListener("click", generateEstimate);
  $("exportEstimateCsv").addEventListener("click", exportEstimateCsv);
  $("addEstimateRow").addEventListener("click", addEstimateRow);

  // Tier filter tabs
  document.querySelectorAll(".tier-tab").forEach((btn) => {
    btn.addEventListener("click", () => filterTier(btn.dataset.tier));
  });
});

// ===== Mode Selection =====
function selectMode(mode) {
  currentMode = mode;
  $("modeCardTd").classList.toggle("active", mode === "td");
  $("modeCardEstimate").classList.toggle("active", mode === "estimate");
  $("td-sections").style.display = mode === "td" ? "" : "none";
  $("estimate-sections").style.display = mode === "estimate" ? "" : "none";
}

// ===== Estimate Tab Switch =====
function switchEstTab(tabId) {
  document.querySelectorAll("#section-est-input .tab-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll("#section-est-input .tab-content").forEach((c) => {
    c.style.display = "none";
    c.classList.remove("active");
  });
  const target = $(tabId);
  if (target) {
    target.style.display = "";
    target.classList.add("active");
  }
  // Activate correct tab button
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add("active");
}

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

// =========================================================
//  TD改善モード（既存機能）
// =========================================================

// ===== 2a. サイトマップ取得 =====
async function fetchSitemap() {
  const url = $("sitemapUrl").value.trim();
  if (!url) {
    setStatus("sitemapStatus", "URLを入力してください", "error");
    return;
  }

  setStatus("sitemapStatus", "サイトマップを取得中...");

  try {
    const urls = await parseSitemap(url);
    if (urls.length === 0) {
      setStatus("sitemapStatus", "URLが見つかりませんでした", "error");
      return;
    }

    pages = urls.map((u) => {
      const parsed = new URL(u);
      return { url: u, path: parsed.pathname, title: "", description: "", status: "", noIndex: "", selected: true };
    });

    renderPagesTable();
    setStatus("sitemapStatus", `${urls.length} ページを検出しました`, "success");
  } catch (e) {
    setStatus("sitemapStatus", `取得エラー: ${e.message}`, "error");
  }
}

// ===== 2b. ferret One CMS ページ一覧から取得 =====
async function fetchFromCms() {
  setStatus("sitemapStatus", "ferret One のタブを検索中...");

  try {
    const extracted = await extractFerretOneData();
    if (!extracted || extracted.length === 0) {
      setStatus("sitemapStatus", "ページ一覧テーブルが見つかりませんでした。「ページの一括設定」画面を表示中か確認してください。", "error");
      return;
    }

    pages = extracted.map((p) => ({ ...p, description: "", selected: true }));
    renderPagesTable();
    setStatus("sitemapStatus", `ferret One から ${pages.length} ページを検出しました（タイトル取得済み）`, "success");
    $("fetchMeta").disabled = false;
  } catch (e) {
    setStatus("sitemapStatus", `取得エラー: ${e.message}`, "error");
  }
}

// ===== ferret One 専用: ページ一括設定テーブルからデータ抽出 =====
function extractFromFerretOne() {
  const table = document.querySelector("table.js-sortable") ||
                document.querySelector("table.new-table") ||
                document.querySelector("table.table-hover");

  if (!table) return [];

  const rows = table.querySelectorAll("tbody tr");
  const result = [];

  rows.forEach((tr) => {
    const cells = tr.querySelectorAll("td");
    if (cells.length < 4) return;

    const linkEl = cells[1]?.querySelector("a[href]");
    if (!linkEl) return;

    const url = linkEl.href;
    const path = linkEl.textContent.trim();
    const title = cells[2]?.textContent?.trim() || "";
    const status = cells[3]?.textContent?.trim() || "";
    const noIndex = cells.length >= 6 ? cells[5]?.textContent?.trim() || "" : "";

    result.push({ url, path, title, status, noIndex });
  });

  return result;
}

// ===== 3. TD取得（各ページのHTMLから description を取得） =====
async function fetchMetaFromPages() {
  const selected = pages.filter((p) => p.selected);
  if (selected.length === 0) {
    setStatus("metaStatus", "ページを選択してください", "error");
    return;
  }

  setStatus("metaStatus", `0 / ${selected.length} ページのメタ情報を取得中...`);
  $("fetchMeta").disabled = true;

  let completed = 0;

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

          if (!page.title) {
            page.title = doc.querySelector("title")?.textContent?.trim() || "";
          }

          const metaDesc =
            doc.querySelector('meta[name="description"]') ||
            doc.querySelector('meta[property="og:description"]');
          page.description = metaDesc?.getAttribute("content")?.trim() || "";
        } catch {
          if (!page.title) page.title = "(取得失敗)";
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

  const selected = pages.filter((p) => p.selected && (p.title || p.url));
  if (selected.length === 0) {
    setStatus("aiStatus", "対象ページがありません", "error");
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
        url: page.url, path: page.path || "",
        currentTitle: page.title, suggestedTitle: suggestion.title,
        currentDesc: page.description, suggestedDesc: suggestion.description,
        reason: suggestion.reason,
      });
    } catch (e) {
      results.push({
        url: page.url, path: page.path || "",
        currentTitle: page.title, suggestedTitle: "(エラー)",
        currentDesc: page.description, suggestedDesc: "(エラー)",
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

// OpenAI API 呼び出し（TD改善用）
async function callOpenAI(apiKey, page) {
  const prompt = `あなたはSEOの専門家です。以下のWebページのTitle（タイトルタグ）とDescription（メタディスクリプション）を分析し、SEO効果を最大化する改善案を提案してください。

【URL】${page.url}
【パス】${page.path || ""}
【現在のTitle】${page.title || "(未設定)"}
【現在のDescription】${page.description || "(未設定)"}

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

  return await callOpenAIRaw(apiKey, prompt);
}

// ===== 5. CSV書き出し =====
function exportCsv() {
  if (results.length === 0) return;

  const headers = ["URL", "パス", "現在のTitle", "提案Title", "現在のDescription", "提案Description", "改善ポイント"];
  const rows = results.map((r) => [r.url, r.path, r.currentTitle, r.suggestedTitle, r.currentDesc, r.suggestedDesc, r.reason]);

  downloadCsv(`seo_suggestions_${formatDate()}.csv`, headers, rows);
}

// =========================================================
//  提案見積もりモード（新機能）
// =========================================================

// ===== 3a. サイトマップ取得（見積もり用） =====
async function estFetchSitemap() {
  const url = $("estSitemapUrl").value.trim();
  if (!url) {
    setStatus("estInputStatus", "URLを入力してください", "error");
    return;
  }

  setStatus("estInputStatus", "サイトマップを取得中...");

  try {
    const urls = await parseSitemap(url);
    if (urls.length === 0) {
      setStatus("estInputStatus", "URLが見つかりませんでした", "error");
      return;
    }

    estPages = urls.map((u) => {
      const parsed = new URL(u);
      return { name: parsed.pathname, type: "既存ページ", url: u, path: parsed.pathname, title: "", selected: true };
    });

    // Fetch titles for context (batch of 5)
    setStatus("estInputStatus", "ページタイトルを取得中...");
    let done = 0;
    for (let i = 0; i < estPages.length; i += 5) {
      const batch = estPages.slice(i, i + 5);
      await Promise.all(batch.map(async (p) => {
        try {
          const res = await fetch(p.url);
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, "text/html");
          p.title = doc.querySelector("title")?.textContent?.trim() || "";
          if (p.title) p.name = p.title;
        } catch { /* skip */ }
        done++;
        setStatus("estInputStatus", `${done} / ${estPages.length} タイトル取得中...`);
      }));
    }

    renderEstPagesTable();
    setStatus("estInputStatus", `${estPages.length} ページを検出しました`, "success");
  } catch (e) {
    setStatus("estInputStatus", `取得エラー: ${e.message}`, "error");
  }
}

// ===== 3b. ferret One から取得（見積もり用） =====
async function estFetchFromCms() {
  setStatus("estInputStatus", "ferret One のタブを検索中...");

  try {
    const extracted = await extractFerretOneData();
    if (!extracted || extracted.length === 0) {
      setStatus("estInputStatus", "ページ一覧テーブルが見つかりませんでした。", "error");
      return;
    }

    estPages = extracted.map((p) => ({
      name: p.title || p.path, type: "既存ページ", url: p.url, path: p.path, title: p.title, selected: true,
    }));

    renderEstPagesTable();
    setStatus("estInputStatus", `ferret One から ${estPages.length} ページを検出しました`, "success");
  } catch (e) {
    setStatus("estInputStatus", `取得エラー: ${e.message}`, "error");
  }
}

// ===== 3c. 手動ページリスト読み込み =====
function parseManualPages() {
  const text = $("manualPageList").value.trim();
  if (!text) {
    setStatus("estInputStatus", "ページリストを入力してください", "error");
    return;
  }

  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

  estPages = lines.map((line) => ({
    name: line, type: "新規作成", url: "", path: "", title: "", selected: true,
  }));

  renderEstPagesTable();
  setStatus("estInputStatus", `${estPages.length} 件のページを読み込みました`, "success");
}

// ===== 4. AI 松竹梅見積もり生成 =====
async function generateEstimate() {
  const stored = await chrome.storage.local.get("openaiApiKey");
  const apiKey = stored.openaiApiKey;

  if (!apiKey) {
    setStatus("estAiStatus", "OpenAI API Key を設定してください", "error");
    return;
  }

  const selected = estPages.filter((p) => p.selected);
  if (selected.length === 0) {
    setStatus("estAiStatus", "対象ページがありません", "error");
    return;
  }

  $("generateEstimate").disabled = true;
  $("estProgressBar").style.display = "block";
  estimateItems = [];

  const isNewPages = selected.some((p) => p.type === "新規作成");

  // Build page list summary for AI
  const pageList = selected.map((p, i) => {
    if (p.type === "新規作成") {
      return `${i + 1}. [新規] ${p.name}`;
    }
    return `${i + 1}. [既存] ${p.name} (${p.url || p.path})${p.title ? " — " + p.title : ""}`;
  }).join("\n");

  setStatus("estAiStatus", "松竹梅の提案を生成中...");
  $("estProgressFill").style.width = "30%";
  $("estProgressText").textContent = "AI 分析中...";

  try {
    const prompt = buildEstimatePrompt(pageList, selected.length, isNewPages);
    const result = await callOpenAIRaw(apiKey, prompt);

    // Parse the result — expecting { matsu: [...], take: [...], ume: [...] }
    if (result.matsu) {
      result.matsu.forEach((item) => addEstimateItemFromAI("matsu", item));
    }
    if (result.take) {
      result.take.forEach((item) => addEstimateItemFromAI("take", item));
    }
    if (result.ume) {
      result.ume.forEach((item) => addEstimateItemFromAI("ume", item));
    }

    $("estProgressFill").style.width = "100%";
    $("estProgressText").textContent = "完了";

    renderEstimateTable();
    updateEstimateTotals();
    $("exportEstimateCsv").disabled = false;
    setStatus("estAiStatus", `松竹梅 ${estimateItems.length} 項目の見積もりを生成しました`, "success");
  } catch (e) {
    setStatus("estAiStatus", `生成エラー: ${e.message}`, "error");
  }

  $("generateEstimate").disabled = false;
}

function buildEstimatePrompt(pageList, pageCount, isNewPages) {
  const typeLabel = isNewPages ? "新規ページ作成" : "既存ページ改善";

  return `あなたはWebマーケティング・SEOの専門家であり、Web制作の見積もり作成のプロです。
以下のページリストに基づき、${typeLabel}の提案を松竹梅の3プランで作成してください。

【対象ページ一覧（${pageCount}件）】
${pageList}

以下のJSON形式で回答してください。各プランに複数の作業項目を含めてください。
金額は日本円で、現実的なWeb制作・SEO改善の相場に基づいてください。

{
  "matsu": [
    { "category": "カテゴリ名", "item": "作業項目名", "description": "具体的な作業内容の説明", "quantity": 数量, "unitPrice": 単価 }
  ],
  "take": [ ... ],
  "ume": [ ... ]
}

【各プランの方針】
松（プレミアム）: 最も包括的なプラン。${isNewPages
    ? "プロによるデザイン・コーディング・コンテンツ制作を含むフルパッケージ。高品質なオリジナルデザイン、SEO設計、レスポンシブ対応、アニメーション等"
    : "SEOキーワード調査、Title/Description最適化、コンテンツ全面リライト、内部リンク設計、構造化データ追加、競合分析レポート"}

竹（スタンダード）: バランスの良い中間プラン。${isNewPages
    ? "テンプレートベースのデザインにカスタマイズ、基本的なSEO設計、コンテンツ制作"
    : "Title/Description最適化、コンテンツ部分修正、基本的なSEO改善、メタタグ最適化"}

梅（ライト）: 最小限のコストで効果を出すプラン。${isNewPages
    ? "シンプルなテンプレート利用、最小限のカスタマイズ、テキスト中心のページ"
    : "Title/Description修正のみ、最小限のテキスト調整"}

【注意】
- quantityはページ数や作業回数を反映してください（対象は${pageCount}ページ）
- unitPriceは1件あたりの単価（円）
- カテゴリ例: SEO分析, コンテンツ制作, デザイン, コーディング, ディレクション, レポート 等
- 各プランは3〜8項目程度
- 合計金額の目安: 松は竹の1.5〜2倍、梅は竹の0.3〜0.5倍`;
}

function addEstimateItemFromAI(tier, item) {
  estimateItems.push({
    id: Date.now() + Math.random(),
    tier,
    category: item.category || "",
    item: item.item || "",
    description: item.description || "",
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unitPrice) || 0,
  });
}

// ===== Tier Filter =====
function filterTier(tier) {
  currentTierFilter = tier;
  document.querySelectorAll(".tier-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tier === tier);
  });
  renderEstimateTable();
}

// ===== Render Estimate Table =====
function renderEstimateTable() {
  const tbody = $("estimateTableBody");
  tbody.innerHTML = "";

  const filtered = currentTierFilter === "all"
    ? estimateItems
    : estimateItems.filter((item) => item.tier === currentTierFilter);

  filtered.forEach((item) => {
    const tr = document.createElement("tr");
    tr.dataset.id = item.id;

    const tierLabel = { matsu: "松", take: "竹", ume: "梅" }[item.tier] || item.tier;
    const badgeClass = `badge-${item.tier}`;
    const subtotal = item.quantity * item.unitPrice;

    tr.innerHTML = `
      <td data-tier><span class="badge ${badgeClass}">${tierLabel}</span></td>
      <td title="${escapeHtml(item.category)}">${escapeHtml(item.category)}</td>
      <td title="${escapeHtml(item.item)}">${escapeHtml(item.item)}</td>
      <td style="max-width:300px; white-space:normal;" title="${escapeHtml(item.description)}">${escapeHtml(item.description)}</td>
      <td><input type="number" class="cell-input" value="${item.quantity}" min="0" data-field="quantity" /></td>
      <td><input type="number" class="cell-input" value="${item.unitPrice}" min="0" step="1000" data-field="unitPrice" /></td>
      <td style="text-align:right; font-weight:600;">${formatYen(subtotal)}</td>
      <td><button class="btn-delete-row" title="削除">x</button></td>
    `;

    // Editable inputs
    tr.querySelectorAll(".cell-input").forEach((input) => {
      input.addEventListener("change", () => {
        const field = input.dataset.field;
        item[field] = Number(input.value) || 0;
        // Update subtotal cell
        const subtotalCell = tr.querySelector("td:nth-child(7)");
        subtotalCell.textContent = formatYen(item.quantity * item.unitPrice);
        updateEstimateTotals();
      });
    });

    // Delete button
    tr.querySelector(".btn-delete-row").addEventListener("click", () => {
      estimateItems = estimateItems.filter((i) => i.id !== item.id);
      renderEstimateTable();
      updateEstimateTotals();
    });

    tbody.appendChild(tr);
  });
}

// ===== Add Manual Row =====
function addEstimateRow() {
  const tier = currentTierFilter === "all" ? "take" : currentTierFilter;
  estimateItems.push({
    id: Date.now() + Math.random(),
    tier,
    category: "",
    item: "新規項目",
    description: "",
    quantity: 1,
    unitPrice: 0,
  });
  renderEstimateTable();
  updateEstimateTotals();

  // Scroll to bottom
  const wrapper = $("estimateTable").closest(".table-wrapper");
  if (wrapper) wrapper.scrollTop = wrapper.scrollHeight;
}

// ===== Update Totals =====
function updateEstimateTotals() {
  const totals = { matsu: 0, take: 0, ume: 0 };
  estimateItems.forEach((item) => {
    if (totals[item.tier] !== undefined) {
      totals[item.tier] += item.quantity * item.unitPrice;
    }
  });
  $("totalMatsu").textContent = formatYen(totals.matsu);
  $("totalTake").textContent = formatYen(totals.take);
  $("totalUme").textContent = formatYen(totals.ume);
}

// ===== Export Estimate CSV =====
function exportEstimateCsv() {
  if (estimateItems.length === 0) return;

  const tierNames = { matsu: "松（プレミアム）", take: "竹（スタンダード）", ume: "梅（ライト）" };
  const headers = ["プラン", "カテゴリ", "項目", "内容", "数量", "単価（円）", "小計（円）"];
  const rows = estimateItems.map((item) => [
    tierNames[item.tier] || item.tier,
    item.category,
    item.item,
    item.description,
    item.quantity,
    item.unitPrice,
    item.quantity * item.unitPrice,
  ]);

  // Add total rows
  const totals = { matsu: 0, take: 0, ume: 0 };
  estimateItems.forEach((item) => {
    if (totals[item.tier] !== undefined) totals[item.tier] += item.quantity * item.unitPrice;
  });
  rows.push([]);
  rows.push(["", "", "", "", "", "松 合計", totals.matsu]);
  rows.push(["", "", "", "", "", "竹 合計", totals.take]);
  rows.push(["", "", "", "", "", "梅 合計", totals.ume]);

  downloadCsv(`seo_estimate_${formatDate()}.csv`, headers, rows);
}

// =========================================================
//  共通ユーティリティ
// =========================================================

// Shared sitemap parser
async function parseSitemap(url) {
  const response = await fetch(url);
  const text = await response.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "text/xml");

  const urls = [];
  const locs = xml.querySelectorAll("url > loc");
  locs.forEach((loc) => urls.push(loc.textContent.trim()));

  // sitemapindex
  if (urls.length === 0) {
    const sitemapLocs = xml.querySelectorAll("sitemap > loc");
    for (const loc of sitemapLocs) {
      const subRes = await fetch(loc.textContent.trim());
      const subText = await subRes.text();
      const subXml = parser.parseFromString(subText, "text/xml");
      subXml.querySelectorAll("url > loc").forEach((l) => urls.push(l.textContent.trim()));
    }
  }

  return urls;
}

// Shared ferret One extraction
async function extractFerretOneData() {
  const allTabs = await chrome.tabs.query({});
  const ferretTab = allTabs.find(
    (t) => t.url && (t.url.includes("/page_collection") || t.url.includes("ferret-one"))
  );

  if (!ferretTab) {
    throw new Error("ferret One の「ページの一括設定」画面を開いたタブが見つかりません。先にそのページを開いてください。");
  }

  const injectionResults = await chrome.scripting.executeScript({
    target: { tabId: ferretTab.id },
    func: extractFromFerretOne,
  });

  return injectionResults[0]?.result || [];
}

// Shared OpenAI API call
async function callOpenAIRaw(apiKey, prompt) {
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

// Shared CSV download
function downloadCsv(filename, headers, rows) {
  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatDate() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatYen(n) {
  if (!n && n !== 0) return "-";
  return "¥" + Number(n).toLocaleString("ja-JP");
}

// ===== UI Helpers =====
function renderPagesTable() {
  const tbody = $("pagesTableBody");
  tbody.innerHTML = "";

  pages.forEach((page, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" data-index="${i}" ${page.selected ? "checked" : ""} /></td>
      <td title="${escapeHtml(page.url)}">${escapeHtml(page.path || truncate(page.url, 30))}</td>
      <td title="${escapeHtml(page.title)}">${escapeHtml(truncate(page.title, 30)) || '<span style="opacity:0.35">(未設定)</span>'}</td>
      <td title="${escapeHtml(page.description)}">${escapeHtml(truncate(page.description, 30)) || '<span style="opacity:0.35">—</span>'}</td>
      <td>${escapeHtml(page.status || "")}</td>
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
      <td title="${escapeHtml(r.url)}">${escapeHtml(r.path || truncate(r.url, 25))}</td>
      <td title="${escapeHtml(r.currentTitle)}">${escapeHtml(truncate(r.currentTitle, 25))}</td>
      <td title="${escapeHtml(r.suggestedTitle)}">${escapeHtml(truncate(r.suggestedTitle, 25))}</td>
      <td title="${escapeHtml(r.currentDesc)}">${escapeHtml(truncate(r.currentDesc, 25))}</td>
      <td title="${escapeHtml(r.suggestedDesc)}">${escapeHtml(truncate(r.suggestedDesc, 25))}</td>
      <td title="${escapeHtml(r.reason)}">${escapeHtml(truncate(r.reason, 30))}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderEstPagesTable() {
  const tbody = $("estPagesBody");
  tbody.innerHTML = "";

  estPages.forEach((page, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" data-index="${i}" ${page.selected ? "checked" : ""} /></td>
      <td title="${escapeHtml(page.name)}">${escapeHtml(truncate(page.name, 40))}</td>
      <td>${escapeHtml(page.type)}</td>
      <td title="${escapeHtml(page.title)}">${escapeHtml(truncate(page.title, 25)) || '<span style="opacity:0.35">—</span>'}</td>
    `;
    tr.querySelector("input").addEventListener("change", (e) => {
      estPages[i].selected = e.target.checked;
    });
    tbody.appendChild(tr);
  });

  $("estPageCount").textContent = estPages.length;
  $("estPagesWrapper").style.display = "";
  $("generateEstimate").disabled = estPages.length === 0;
}

function toggleSelectAll(e) {
  const checked = e.target.checked;
  pages.forEach((p) => (p.selected = checked));
  renderPagesTable();
  $("selectAll").checked = checked;
}

function estToggleSelectAll(e) {
  const checked = e.target.checked;
  estPages.forEach((p) => (p.selected = checked));
  renderEstPagesTable();
  $("estSelectAll").checked = checked;
}

function setStatus(id, message, type = "") {
  const el = $(id);
  el.textContent = message;
  el.className = `status ${type}`;
}

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function truncate(str, len) {
  if (!str) return "";
  return str.length > len ? str.substring(0, len) + "..." : str;
}
