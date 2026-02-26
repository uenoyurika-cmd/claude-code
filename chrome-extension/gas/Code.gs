// ============================================
//  Meta提案拡張機能 — 社内展開LP
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
