// ============================================
//  Meta提案拡張機能 — 社内展開LP & スライド生成
//  Google Apps Script (GAS) Web App
//
//  【セットアップ手順】
//  1. Google Drive → 新規 → Google Apps Script
//  2. コード.gs に このファイル (gas/Code.gs) の内容を貼り付け
//  3. ファイル追加 → HTML → 「index」という名前で作成
//  4. index.html に gas/index.html の内容を貼り付け
//  5. デプロイ → 新しいデプロイ → ウェブアプリ
//     - 実行するユーザー: 自分
//     - アクセス: 組織内の全員（社内限定にする場合）
//  6. デプロイして表示されたURLを社内に共有
//
//  【機能】
//  - GET: 社内ガイドLP を表示
//  - POST: 見積もりデータから Google スライド提案書を自動生成
// ============================================

/**
 * GET リクエスト → LP を表示
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Meta提案拡張機能 — 社内ガイド')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

/**
 * POST リクエスト → Google スライド提案書を生成
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.action === 'createSlides') {
      var url = createProposalSlides_(data);
      return ContentService.createTextOutput(JSON.stringify({ success: true, url: url }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Unknown action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// =========================================================
//  Google スライド提案書 生成
// =========================================================

var COLORS_ = {
  RED: '#EC2D44',
  DARK: '#4A1A1F',
  LIGHT: '#F7E2E5',
  WHITE: '#FFFFFF',
  MATSU_BG: '#FFF8E1', MATSU: '#B8860B',
  TAKE_BG: '#E8F5E9',  TAKE: '#2E7D32',
  UME_BG: '#FFF3E0',   UME: '#E65100',
};

var TIERS_ = {
  matsu: { label: '松（プレミアム）', char: '松', bg: COLORS_.MATSU_BG, fg: COLORS_.MATSU },
  take:  { label: '竹（スタンダード）', char: '竹', bg: COLORS_.TAKE_BG, fg: COLORS_.TAKE },
  ume:   { label: '梅（ライト）',       char: '梅', bg: COLORS_.UME_BG, fg: COLORS_.UME },
};

function createProposalSlides_(data) {
  var dateStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd');
  var pres = SlidesApp.create('サイト改善提案書_' + dateStr);

  // ---------- Slide 1: Title ----------
  var s1 = pres.getSlides()[0];
  s1.getBackground().setSolidFill(COLORS_.LIGHT);
  clearSlide_(s1);
  addText_(s1, 'サイト改善\n提案書', 80, 80, 560, 200, COLORS_.RED, 44, true, 'CENTER');
  addText_(s1, Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy年MM月dd日'), 80, 300, 560, 40, COLORS_.DARK, 18, false, 'CENTER');

  // ---------- Slide 2: Overview ----------
  var s2 = pres.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  s2.getBackground().setSolidFill(COLORS_.WHITE);
  addText_(s2, '提案プラン 概要', 30, 15, 660, 40, COLORS_.RED, 26, true, 'LEFT');
  addLine_(s2, 30, 55, 690, 55, COLORS_.RED);

  var colW = 210, gap = 12, sx = 30, sy = 70;
  var tiers = ['matsu', 'take', 'ume'];
  for (var i = 0; i < tiers.length; i++) {
    var tier = tiers[i];
    var tc = TIERS_[tier];
    var summ = (data.planSummaries && data.planSummaries[tier]) || {};
    var total = (data.totals && data.totals[tier]) || 0;
    var x = sx + i * (colW + gap);

    addRect_(s2, x, sy, colW, 330, tc.bg);
    addText_(s2, tc.label, x + 8, sy + 8, colW - 16, 28, tc.fg, 14, true, 'CENTER');
    addText_(s2, fmtYen_(total), x + 8, sy + 38, colW - 16, 28, COLORS_.RED, 18, true, 'CENTER');
    addText_(s2, summ.summary || '', x + 8, sy + 72, colW - 16, 55, COLORS_.DARK, 9, false, 'LEFT');

    var pts = (summ.sellingPoints || []).map(function(p) { return '\u2713 ' + p; }).join('\n');
    addText_(s2, pts, x + 8, sy + 132, colW - 16, 190, COLORS_.DARK, 9, false, 'LEFT');
  }

  // ---------- Slides 3–5: Per-tier detail ----------
  for (var t = 0; t < tiers.length; t++) {
    var tier = tiers[t];
    var tc = TIERS_[tier];
    var summ = (data.planSummaries && data.planSummaries[tier]) || {};
    var total = (data.totals && data.totals[tier]) || 0;
    var items = (data.items || []).filter(function(it) { return it.tier === tier; });

    var sl = pres.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    sl.getBackground().setSolidFill(COLORS_.WHITE);

    // Header bar
    addRect_(sl, 0, 0, 720, 52, tc.bg);
    addText_(sl, tc.label, 28, 8, 350, 36, tc.fg, 22, true, 'LEFT');
    addText_(sl, '合計 ' + fmtYen_(total), 380, 8, 310, 36, COLORS_.RED, 20, true, 'RIGHT');

    // Summary
    addText_(sl, summ.summary || '', 28, 60, 664, 24, COLORS_.DARK, 11, false, 'LEFT');

    // Selling points row
    var sp = summ.sellingPoints || [];
    var spW = sp.length > 0 ? Math.floor(664 / Math.min(sp.length, 4)) : 0;
    for (var p = 0; p < Math.min(sp.length, 4); p++) {
      var px = 28 + p * spW;
      addRect_(sl, px, 88, spW - 4, 28, COLORS_.LIGHT);
      addText_(sl, '\u2713 ' + sp[p], px + 4, 90, spW - 12, 24, COLORS_.RED, 9, true, 'LEFT');
    }

    // Table header
    var ty = 124;
    addRect_(sl, 28, ty, 664, 20, COLORS_.RED);
    var cols = [
      { l: 'カテゴリ', w: 90 }, { l: '項目', w: 140 }, { l: '内容', w: 220 },
      { l: '数量', w: 50 }, { l: '単価', w: 82 }, { l: '小計', w: 82 }
    ];
    var cx = 28;
    for (var c = 0; c < cols.length; c++) {
      addText_(sl, cols[c].l, cx, ty, cols[c].w, 20, COLORS_.WHITE, 8, true, 'CENTER');
      cx += cols[c].w;
    }

    // Table rows (limit to ~12 rows to fit slide)
    var ry = ty + 20;
    var maxRows = Math.min(items.length, 12);
    for (var r = 0; r < maxRows; r++) {
      var it = items[r];
      var bgc = r % 2 === 0 ? COLORS_.WHITE : COLORS_.LIGHT;
      addRect_(sl, 28, ry, 664, 20, bgc);
      var sub = (it.quantity || 0) * (it.unitPrice || 0);
      var vals = [it.category || '', it.item || '', it.description || '', String(it.quantity || 0), fmtYen_(it.unitPrice || 0), fmtYen_(sub)];
      cx = 28;
      for (var c = 0; c < cols.length; c++) {
        var al = c >= 3 ? 'RIGHT' : 'LEFT';
        addText_(sl, vals[c], cx, ry, cols[c].w, 20, COLORS_.DARK, 7.5, false, al);
        cx += cols[c].w;
      }
      ry += 20;
    }
    if (items.length > maxRows) {
      addText_(sl, '… 他 ' + (items.length - maxRows) + ' 項目', 28, ry + 4, 664, 16, COLORS_.DARK, 8, false, 'LEFT');
    }
  }

  // ---------- Slide 6: Total Comparison ----------
  var sf = pres.appendSlide(SlidesApp.PredefinedLayout.BLANK);
  sf.getBackground().setSolidFill(COLORS_.WHITE);
  addText_(sf, 'お見積もり金額 比較', 30, 15, 660, 40, COLORS_.RED, 26, true, 'LEFT');
  addLine_(sf, 30, 55, 690, 55, COLORS_.RED);

  for (var i = 0; i < tiers.length; i++) {
    var tier = tiers[i];
    var tc = TIERS_[tier];
    var total = (data.totals && data.totals[tier]) || 0;
    var count = (data.items || []).filter(function(it) { return it.tier === tier; }).length;
    var summ = (data.planSummaries && data.planSummaries[tier]) || {};
    var y = 75 + i * 100;

    addRect_(sf, 50, y, 620, 85, tc.bg);
    addText_(sf, tc.label, 70, y + 8, 250, 30, tc.fg, 20, true, 'LEFT');
    addText_(sf, fmtYen_(total), 350, y + 4, 300, 36, COLORS_.RED, 28, true, 'RIGHT');
    addText_(sf, count + ' 項目', 70, y + 42, 200, 20, COLORS_.DARK, 10, false, 'LEFT');
    addText_(sf, summ.summary || '', 70, y + 60, 580, 18, COLORS_.DARK, 8, false, 'LEFT');
  }

  return pres.getUrl();
}

// ===== Helper Functions =====

function fmtYen_(n) {
  if (!n && n !== 0) return '-';
  return '\u00a5' + Number(n).toLocaleString('ja-JP');
}

function clearSlide_(slide) {
  var elements = slide.getPageElements();
  for (var i = elements.length - 1; i >= 0; i--) {
    elements[i].remove();
  }
}

function addText_(slide, text, x, y, w, h, color, size, bold, align) {
  var shape = slide.insertShape(SlidesApp.ShapeType.TEXT_BOX, x, y, w, h);
  shape.getText().setText(text || '');
  var style = shape.getText().getTextStyle();
  style.setForegroundColor(color).setFontSize(size).setBold(bold).setFontFamily('Noto Sans JP');
  var para = shape.getText().getParagraphStyle();
  if (align === 'CENTER') para.setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER);
  else if (align === 'RIGHT') para.setParagraphAlignment(SlidesApp.ParagraphAlignment.END);
  else para.setParagraphAlignment(SlidesApp.ParagraphAlignment.START);
  shape.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
  return shape;
}

function addRect_(slide, x, y, w, h, fill) {
  var shape = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, x, y, w, h);
  shape.getFill().setSolidFill(fill);
  shape.getBorder().setTransparent();
  return shape;
}

function addLine_(slide, x1, y1, x2, y2, color) {
  var line = slide.insertLine(SlidesApp.LineCategory.STRAIGHT, x1, y1, x2, y2);
  line.getLineFill().setSolidFill(color);
  line.setWeight(2);
  return line;
}
