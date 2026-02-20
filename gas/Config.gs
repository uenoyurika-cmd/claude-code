/**
 * アプリケーション設定
 */
const CONFIG = {
  // Google Slides テンプレートID
  TEMPLATE_SLIDE_ID: '1bpEqAKjD5vQBHqYmTqRcgFUti9b4IJ9UJVPnlgVZiRw',

  // 生成したスライドの出力先フォルダID（空の場合はマイドライブ直下）
  OUTPUT_FOLDER_ID: '',

  // Claude API設定
  CLAUDE_API_KEY: PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY') || '',
  CLAUDE_MODEL: 'claude-sonnet-4-20250514',
  CLAUDE_MAX_TOKENS: 4096,
};

/**
 * スクリプトプロパティからAPIキーを取得
 */
function getClaudeApiKey() {
  return PropertiesService.getScriptProperties().getProperty('CLAUDE_API_KEY');
}

/**
 * スクリプトプロパティにAPIキーを設定（初回セットアップ用）
 * GASエディタのスクリプトプロパティから設定するか、この関数を1回実行する
 */
function setClaudeApiKey(apiKey) {
  PropertiesService.getScriptProperties().setProperty('CLAUDE_API_KEY', apiKey);
}

/**
 * テンプレートIDを更新する
 */
function setTemplateSlideId(slideId) {
  PropertiesService.getScriptProperties().setProperty('TEMPLATE_SLIDE_ID', slideId);
}

/**
 * テンプレートIDを取得する（プロパティ優先、なければデフォルト）
 */
function getTemplateSlideId() {
  return PropertiesService.getScriptProperties().getProperty('TEMPLATE_SLIDE_ID')
    || CONFIG.TEMPLATE_SLIDE_ID;
}

/**
 * 出力フォルダIDを取得する
 */
function getOutputFolderId() {
  return PropertiesService.getScriptProperties().getProperty('OUTPUT_FOLDER_ID')
    || CONFIG.OUTPUT_FOLDER_ID;
}
