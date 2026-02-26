// ===== Default Price List =====
const DEFAULT_PRICE_LIST = [
  // --- ページ制作（通常・ディレクション費20%） ---
  { category: "ページ制作", name: "TOPリニューアル（M）", price: 540000, note: "6〜8セクション" },
  { category: "ページ制作", name: "TOPリニューアル（L）", price: 675000, note: "9〜11セクション" },
  { category: "ページ制作", name: "TOPリニューアル（M・ライティング込）", price: 675000, note: "" },
  { category: "ページ制作", name: "TOPリニューアル（L・ライティング込）", price: 810000, note: "" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS少・M）", price: 170000, note: "既存パーツ中心" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS少・L）", price: 275000, note: "" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS少・M・W）", price: 284000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS少・L・W）", price: 389000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS中・M）", price: 259000, note: "CSSの調整あり" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS中・L）", price: 405000, note: "" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS中・M・W）", price: 373000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS中・L・W）", price: 518000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS多・M）", price: 356000, note: "CSSの作り込みが多い" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS多・L）", price: 502000, note: "" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS多・M・W）", price: 470000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（デザインあり・CSS多・L・W）", price: 616000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（デザイン提出なし・CSS少・M）", price: 89000, note: "" },
  { category: "ページ制作", name: "下層ページ（デザイン提出なし・CSS少・L）", price: 146000, note: "" },
  { category: "ページ制作", name: "下層ページ（デザイン提出なし・CSS少・M・W）", price: 203000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（デザイン提出なし・CSS少・L・W）", price: 259000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（デザイン提出なし・CSS中・M）", price: 178000, note: "" },
  { category: "ページ制作", name: "下層ページ（デザイン提出なし・CSS中・L）", price: 275000, note: "" },
  { category: "ページ制作", name: "下層ページ（デザイン提出なし・CSS中・M・W）", price: 292000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（デザイン提出なし・CSS中・L・W）", price: 389000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS少・M）", price: 138000, note: "" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS少・L）", price: 211000, note: "" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS少・M・W）", price: 251000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS少・L・W）", price: 324000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS中・M）", price: 227000, note: "" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS中・L）", price: 340000, note: "" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS中・M・W）", price: 340000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS中・L・W）", price: 454000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS多・M）", price: 324000, note: "" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS多・L）", price: 437000, note: "" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS多・M・W）", price: 437000, note: "ライティング込" },
  { category: "ページ制作", name: "下層ページ（WF支給・CSS多・L・W）", price: 551000, note: "ライティング込" },
  { category: "ページ制作", name: "LP（デザインそのまま・M）", price: 405000, note: "" },
  { category: "ページ制作", name: "LP（デザインそのまま・L）", price: 540000, note: "" },
  { category: "ページ制作", name: "LPベーシック（M）", price: 540000, note: "" },
  { category: "ページ制作", name: "LPベーシック（L）", price: 675000, note: "" },
  { category: "ページ制作", name: "ベースデザイン設定", price: 27000, note: "" },
  { category: "ページ制作", name: "既存テンプレ流し込み", price: 20000, note: "" },
  { category: "ページ制作", name: "記事リスト一覧ページ", price: 7000, note: "" },
  { category: "ページ制作", name: "完了ページ", price: 0, note: "" },
  { category: "ページ制作", name: "ページ複製・差し替え", price: 14000, note: "" },
  { category: "ページ制作", name: "本番反映（TOP以外）", price: 7000, note: "1ページ0.5h" },
  { category: "ページ制作", name: "TOP本番反映", price: 32000, note: "¥32,000〜¥70,000" },

  // --- ページ制作（大型/リニューアル・ディレクション費25%・×1.05） ---
  { category: "大型/リニューアル", name: "TOPリニューアル（M）", price: 567000, note: "×1.05" },
  { category: "大型/リニューアル", name: "TOPリニューアル（L）", price: 709000, note: "×1.05" },
  { category: "大型/リニューアル", name: "TOPリニューアル（M・ライティング込）", price: 709000, note: "×1.05" },
  { category: "大型/リニューアル", name: "TOPリニューアル（L・ライティング込）", price: 851000, note: "×1.05" },

  // --- WF/ディレクション ---
  { category: "WF/ディレクション", name: "WF提供（TOP）", price: 68000, note: "" },
  { category: "WF/ディレクション", name: "WF提供（下層ページ）", price: 41000, note: "" },
  { category: "WF/ディレクション", name: "WF提供（LP/ボリューム多め）", price: 68000, note: "" },
  { category: "WF/ディレクション", name: "WF清書（客提供）", price: 54000, note: "" },
  { category: "WF/ディレクション", name: "サイトマップ制作（〜50P）", price: 68000, note: "" },
  { category: "WF/ディレクション", name: "リダイレクト設定CSV", price: 41000, note: "" },
  { category: "WF/ディレクション", name: "原稿制作（ヒアリング→たたき）", price: 41000, note: "" },

  // --- デザイン ---
  { category: "デザイン", name: "画像選定（5枚あたり）", price: 14000, note: "" },
  { category: "デザイン", name: "バナー・画像制作（PC）", price: 49000, note: "" },
  { category: "デザイン", name: "MV作成（シンプル）", price: 54000, note: "" },
  { category: "デザイン", name: "MV作成（2-3枚）", price: 68000, note: "" },
  { category: "デザイン", name: "MV作成（背景+モック）", price: 74000, note: "" },
  { category: "デザイン", name: "MV作成（装飾・ボタン2つ）", price: 128000, note: "" },
  { category: "デザイン", name: "MV作成（イラスト/概念図）", price: 135000, note: "¥135,000〜" },
  { category: "デザイン", name: "編集データ提供", price: 20000, note: "" },
  { category: "デザイン", name: "スマホカンプ（M）", price: 68000, note: "" },
  { category: "デザイン", name: "スマホカンプ（L）", price: 108000, note: "" },
  { category: "デザイン", name: "カンプ提案（TOP/LP）", price: 203000, note: "" },

  // --- 分析 ---
  { category: "分析", name: "ヒューリスティック調査", price: 300000, note: "" },
  { category: "分析", name: "競合分析調査", price: 350000, note: "" },

  // --- JSパーツ（コーダー工数×13,500+15,000 ディレ費） ---
  { category: "JSパーツ", name: "擬似ナビ", price: 83000, note: "5h" },
  { category: "JSパーツ", name: "メガメニュー", price: 218000, note: "15h〜" },
  { category: "JSパーツ", name: "SPハンバーガー移動", price: 56000, note: "3h" },
  { category: "JSパーツ", name: "フォームテキスト英語化", price: 56000, note: "3h" },
  { category: "JSパーツ", name: "モーダル1", price: 123000, note: "8h" },
  { category: "JSパーツ", name: "モーダル02", price: 56000, note: "3h" },
  { category: "JSパーツ", name: "cookie判定", price: 83000, note: "5h" },
  { category: "JSパーツ", name: "初回モーダル", price: 96000, note: "6h" },
  { category: "JSパーツ", name: "スクロールモーダル", price: 96000, note: "6h" },
  { category: "JSパーツ", name: "バナーポップアップ", price: 56000, note: "3h" },
  { category: "JSパーツ", name: "スライダー（自動）", price: 83000, note: "5h" },
  { category: "JSパーツ", name: "スライダー（手動）", price: 69000, note: "4h" },
  { category: "JSパーツ", name: "アニメーション（横スライド）", price: 42000, note: "2h" },
  { category: "JSパーツ", name: "背景色切替", price: 42000, note: "2h" },
  { category: "JSパーツ", name: "アコーディオン（FAQ）", price: 42000, note: "2h" },
  { category: "JSパーツ", name: "タブ切り替え（col）", price: 56000, note: "3h" },
  { category: "JSパーツ", name: "CTA・擬似フッター100%", price: 35000, note: "1.5h" },
  { category: "JSパーツ", name: "カレントナビ", price: 42000, note: "2h" },
  { category: "JSパーツ", name: "カレント表示（テキスト）", price: 35000, note: "1.5h" },
  { category: "JSパーツ", name: "TOPボタン", price: 29000, note: "1h" },
  { category: "JSパーツ", name: "追従セクション", price: 42000, note: "2h" },
  { category: "JSパーツ", name: "リンクリスト表示", price: 56000, note: "3h" },
  { category: "JSパーツ", name: "パンくず名称変更", price: 29000, note: "1h" },
  { category: "JSパーツ", name: "パンくず移動", price: 29000, note: "1h" },
  { category: "JSパーツ", name: "検索結果MV/サイドバー非表示", price: 35000, note: "1.5h" },
  { category: "JSパーツ", name: "サイドメニュー開閉", price: 35000, note: "1.5h" },
  { category: "JSパーツ", name: "フォーム追従", price: 42000, note: "2h" },
  { category: "JSパーツ", name: "画像+テキストスライド", price: 69000, note: "4h" },
  { category: "JSパーツ", name: "スライドショー（ズーム+フェード）", price: 42000, note: "2h" },
  { category: "JSパーツ", name: "ロゴスクロール", price: 42000, note: "2h" },
  { category: "JSパーツ", name: "フェードイン", price: 83000, note: "5h" },
  { category: "JSパーツ", name: "アコーディオン（行ver.）", price: 42000, note: "2h" },
  { category: "JSパーツ", name: "タブ切り替え（リスト）", price: 56000, note: "3h" },
  { category: "JSパーツ", name: "アンド検索", price: 69000, note: "4h" },
  { category: "JSパーツ", name: "JSパーツ反映（6-10P）", price: 14000, note: "1h" },

  // --- その他 ---
  { category: "その他", name: "サポコンサイト掲載（ロゴ・社名・URL）", price: 7000, note: "" },
  { category: "その他", name: "サポコンサイト掲載（紹介文250文字）", price: 14000, note: "" },
  { category: "その他", name: "サポコンサイト掲載（インタビュー）", price: 41000, note: "" },
];

const DEFAULT_PRICING_RULES = {
  directionFeeRate: 20,             // ディレクション費（通常）: 全体の20%
  directionFeeRateLarge: 25,        // 大型/リニューアル: 全体の25%
  hourlyRate: 13500,                // 通常実装 時間単価
  jsPartsDirectionFee: 15000,       // JSパーツ ディレクション費
  deployPerPage: 7000,              // 本番反映（TOP以外）1ページ
  renewalMultiplier: 1.05,          // 大型/リニューアル 乗算
};

// ===== State =====
let currentMode = "td"; // "td" | "estimate"
let pages = []; // { url, path, title, description, status, noIndex, selected }
let results = []; // { url, path, currentTitle, suggestedTitle, currentDesc, suggestedDesc, reason }

// Estimate mode state
let estPages = []; // { name, type, url, path, title, selected }
let estimateItems = []; // { id, tier, category, item, description, quantity, unitPrice }
let currentTierFilter = "all";

// Price list state
let priceList = [];
let pricingRules = {};
let priceFilterCategory = "all";

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

  // Price settings
  await loadPriceList();
  $("togglePriceSettings").addEventListener("click", togglePriceSettings);
  $("addPriceItem").addEventListener("click", addPriceItem);
  $("resetPriceList").addEventListener("click", resetPriceList);
  $("savePriceSettings").addEventListener("click", savePriceList);
  $("ruleDirectionFee").addEventListener("change", () => { pricingRules.directionFeeRate = Number($("ruleDirectionFee").value) || 20; });
  $("ruleDirectionFeeLarge").addEventListener("change", () => { pricingRules.directionFeeRateLarge = Number($("ruleDirectionFeeLarge").value) || 25; });
  $("ruleHourlyRate").addEventListener("change", () => { pricingRules.hourlyRate = Number($("ruleHourlyRate").value) || 13500; });
  $("ruleJsBase").addEventListener("change", () => { pricingRules.jsPartsDirectionFee = Number($("ruleJsBase").value) || 15000; });
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

  // Build price reference from current price list
  const priceRef = buildPriceReference();

  return `あなたはWebコンサルタント・Web制作ディレクターであり、サイト改善の見積もり作成のプロです。
以下のページリストに基づき、${typeLabel}の提案を松竹梅の3プランで作成してください。
TD（Title/Description）に限らず、デザイン・UX・コンテンツ・SEO・パフォーマンス・導線設計など、サイト全体の改善を幅広く提案してください。

【対象ページ一覧（${pageCount}件）】
${pageList}

【自社単価表（この金額を基準にしてください）】
${priceRef}

【見積ルール】
- ディレクション費（通常）: 全体の${pricingRules.directionFeeRate}%
- ディレクション費（大型/リニューアル案件）: 全体の${pricingRules.directionFeeRateLarge}%
- 通常実装 時間単価: ¥${pricingRules.hourlyRate.toLocaleString()}
- JSパーツ: コーダー工数×¥${pricingRules.hourlyRate.toLocaleString()}+¥${pricingRules.jsPartsDirectionFee.toLocaleString()}（ディレ費）
- サイトチェック: ディレクション費に含む
- Mサイズ: 6〜8セクション / Lサイズ: 9〜11セクション
- CSS少: 既存パーツ中心 / CSS中: CSSの調整あり / CSS多: CSSの作り込みが多い
- W: ライティング込み

以下のJSON形式で回答してください。各プランに複数の作業項目を含めてください。
金額は上記の自社単価表に基づき、日本円で設定してください。単価表にない項目は相場に基づいて見積もってください。

{
  "matsu": [
    { "category": "カテゴリ名", "item": "作業項目名", "description": "具体的な作業内容の説明", "quantity": 数量, "unitPrice": 単価 }
  ],
  "take": [ ... ],
  "ume": [ ... ]
}

【各プランの方針】
松（プレミアム）: 最も包括的なプラン。${isNewPages
    ? "プロによるオリジナルデザイン・コーディング・コンテンツ制作のフルパッケージ。UX設計、レスポンシブ対応、アニメーション、SEO設計、フォーム最適化、アクセス解析設計等"
    : "サイト全体の改善。デザインリニューアル、UX/UI改善、コンテンツ全面リライト、SEO対策（キーワード調査・TD最適化・構造化データ・内部リンク設計）、ページ表示速度改善、CTA/導線最適化、競合分析レポート、アクセス解析設計"}

竹（スタンダード）: バランスの良い中間プラン。${isNewPages
    ? "テンプレートベースのデザインにカスタマイズ、基本的なSEO設計、コンテンツ制作、レスポンシブ対応"
    : "主要ページのデザイン改善、コンテンツ部分修正、TD最適化、基本的なSEO改善、主要な導線改善、レスポンシブ対応の確認・調整"}

梅（ライト）: 最小限のコストで効果を出すプラン。${isNewPages
    ? "シンプルなテンプレート利用、最小限のカスタマイズ、テキスト中心のページ作成"
    : "TD修正、軽微なテキスト・画像の差し替え、最低限のデザイン調整、基本的なSEOチェック"}

【注意】
- quantityはページ数や作業回数を反映してください（対象は${pageCount}ページ）
- unitPriceは自社単価表の金額を使用してください
- カテゴリ例: ディレクション, ページ制作, デザイン, WF/ディレクション, コンテンツ制作, SEO対策, JSパーツ, 分析 等
- 各プランは4〜10項目程度
- ディレクション費を各プランの最初の項目として含めてください`;
}

function buildPriceReference() {
  const grouped = {};
  priceList.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  let ref = "";
  for (const [category, items] of Object.entries(grouped)) {
    ref += `\n【${category}】\n`;
    items.forEach((item) => {
      ref += `- ${item.name}: ¥${item.price.toLocaleString()}`;
      if (item.note) ref += `（${item.note}）`;
      ref += "\n";
    });
  }
  return ref;
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

  downloadCsv(`site_estimate_${formatDate()}.csv`, headers, rows);
}

// =========================================================
//  単価設定（Price List Settings）
// =========================================================

async function loadPriceList() {
  const stored = await chrome.storage.local.get(["priceList", "pricingRules"]);
  priceList = stored.priceList || JSON.parse(JSON.stringify(DEFAULT_PRICE_LIST));
  pricingRules = stored.pricingRules || { ...DEFAULT_PRICING_RULES };
  $("ruleDirectionFee").value = pricingRules.directionFeeRate;
  $("ruleDirectionFeeLarge").value = pricingRules.directionFeeRateLarge;
  $("ruleHourlyRate").value = pricingRules.hourlyRate;
  $("ruleJsBase").value = pricingRules.jsPartsDirectionFee;
  renderPriceCategoryFilter();
  renderPriceListTable();
}

async function savePriceList() {
  // Collect current values from inputs
  const rows = document.querySelectorAll("#priceListBody tr");
  rows.forEach((tr) => {
    const idx = Number(tr.dataset.index);
    if (isNaN(idx) || !priceList[idx]) return;
    const inputs = tr.querySelectorAll("input");
    priceList[idx].price = Number(inputs[0]?.value) || 0;
    priceList[idx].note = inputs[1]?.value || "";
  });

  pricingRules.directionFeeRate = Number($("ruleDirectionFee").value) || 20;
  pricingRules.directionFeeRateLarge = Number($("ruleDirectionFeeLarge").value) || 25;
  pricingRules.hourlyRate = Number($("ruleHourlyRate").value) || 13500;
  pricingRules.jsPartsDirectionFee = Number($("ruleJsBase").value) || 15000;

  await chrome.storage.local.set({ priceList, pricingRules });
  setStatus("priceSettingsStatus", "単価設定を保存しました", "success");
}

async function resetPriceList() {
  priceList = JSON.parse(JSON.stringify(DEFAULT_PRICE_LIST));
  pricingRules = { ...DEFAULT_PRICING_RULES };
  await chrome.storage.local.set({ priceList, pricingRules });
  $("ruleDirectionFee").value = pricingRules.directionFeeRate;
  $("ruleDirectionFeeLarge").value = pricingRules.directionFeeRateLarge;
  $("ruleHourlyRate").value = pricingRules.hourlyRate;
  $("ruleJsBase").value = pricingRules.jsPartsDirectionFee;
  renderPriceCategoryFilter();
  renderPriceListTable();
  setStatus("priceSettingsStatus", "デフォルト単価に戻しました", "success");
}

function togglePriceSettings() {
  const body = $("priceSettingsBody");
  const arrow = $("priceSettingsArrow");
  const isHidden = body.style.display === "none";
  body.style.display = isHidden ? "" : "none";
  arrow.textContent = isHidden ? "▼" : "▶";
}

function renderPriceCategoryFilter() {
  const container = $("priceCategoryFilter");
  const categories = ["all", ...new Set(priceList.map((p) => p.category))];
  container.innerHTML = categories.map((cat) => {
    const label = cat === "all" ? "すべて" : cat;
    const active = cat === priceFilterCategory ? "active" : "";
    return `<button class="price-cat-btn ${active}" data-cat="${escapeHtml(cat)}">${escapeHtml(label)}</button>`;
  }).join("");

  container.querySelectorAll(".price-cat-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      priceFilterCategory = btn.dataset.cat;
      container.querySelectorAll(".price-cat-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderPriceListTable();
    });
  });
}

function renderPriceListTable() {
  const tbody = $("priceListBody");
  tbody.innerHTML = "";

  priceList.forEach((item, idx) => {
    if (priceFilterCategory !== "all" && item.category !== priceFilterCategory) return;

    const tr = document.createElement("tr");
    tr.dataset.index = idx;
    tr.innerHTML = `
      <td title="${escapeHtml(item.category)}">${escapeHtml(item.category)}</td>
      <td title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</td>
      <td><input type="number" class="cell-input" value="${item.price}" min="0" step="1000" /></td>
      <td><input type="text" class="cell-input" value="${escapeHtml(item.note || "")}" style="text-align:left;" /></td>
      <td><button class="btn-delete-row" title="削除">×</button></td>
    `;

    // Price input change
    const priceInput = tr.querySelectorAll("input")[0];
    priceInput.addEventListener("change", () => {
      priceList[idx].price = Number(priceInput.value) || 0;
    });

    // Note input change
    const noteInput = tr.querySelectorAll("input")[1];
    noteInput.addEventListener("change", () => {
      priceList[idx].note = noteInput.value;
    });

    // Delete
    tr.querySelector(".btn-delete-row").addEventListener("click", () => {
      priceList.splice(idx, 1);
      renderPriceCategoryFilter();
      renderPriceListTable();
    });

    tbody.appendChild(tr);
  });

  $("priceItemCount").textContent = priceList.length;
}

function addPriceItem() {
  const category = priceFilterCategory !== "all" ? priceFilterCategory : "ページ制作";
  priceList.push({ category, name: "新規項目", price: 0, note: "" });
  renderPriceCategoryFilter();
  renderPriceListTable();

  // Scroll to bottom
  const wrapper = $("priceListTable").closest(".table-wrapper");
  if (wrapper) wrapper.scrollTop = wrapper.scrollHeight;
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
