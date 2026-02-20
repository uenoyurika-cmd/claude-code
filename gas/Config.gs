/**
 * アプリケーション設定
 */
const CONFIG = {
  // Google Slides テンプレートID
  TEMPLATE_SLIDE_ID: '1bpEqAKjD5vQBHqYmTqRcgFUti9b4IJ9UJVPnlgVZiRw',

  // 生成したスライドの出力先フォルダID（空の場合はマイドライブ直下）
  OUTPUT_FOLDER_ID: '',

  // Gemini API設定
  GEMINI_MODEL: 'gemini-2.0-flash',
  GEMINI_MAX_TOKENS: 4096,
};

/**
 * スクリプトプロパティからAPIキーを取得
 */
function getGeminiApiKey() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
}

/**
 * スクリプトプロパティにAPIキーを設定（初回セットアップ用）
 */
function setGeminiApiKey(apiKey) {
  PropertiesService.getScriptProperties().setProperty('GEMINI_API_KEY', apiKey);
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
