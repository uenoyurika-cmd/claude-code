/**
 * 制作MTG資料自動生成 - メインエントリポイント
 *
 * Webアプリとしてデプロイし、フォームから入力された情報をもとに
 * Google Slidesテンプレートを複製・編集して制作MTG資料を自動生成する。
 */

/**
 * Webアプリのエントリポイント（GET）
 */
function doGet() {
  const html = HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('制作MTG資料 自動生成ツール')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}

/**
 * HTMLテンプレート内で他のHTMLファイルをインクルードするヘルパー
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * フォーム送信を処理するメイン関数
 * @param {Object} formData - フォームデータ
 * @returns {Object} 処理結果
 */
function processForm(formData) {
  try {
    Logger.log('フォームデータ受信: ' + JSON.stringify(formData));

    // 1. OpenAI APIで各テキストを生成・整形
    const generatedTexts = generateTextsWithClaude(formData);
    Logger.log('OpenAI API テキスト生成完了');

    // 2. スケジュール画像がある場合はテキスト抽出
    let scheduleText = '';
    if (formData.scheduleImages && formData.scheduleImages.length > 0) {
      scheduleText = extractScheduleFromImages(formData.scheduleImages);
      Logger.log('スケジュール画像テキスト抽出完了');
    }

    // 3. AI応答が文字列以外（配列・オブジェクト等）の場合に備えてString()で変換
    const toStr = (val) => {
      if (val == null) return '';
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) return val.join('\n');
      if (typeof val === 'object') return JSON.stringify(val, null, 2);
      return String(val);
    };

    // 4. テンプレートのプレースホルダーを置換するマップ
    const replacements = {
      // 基本情報（フォーム入力値）
      '{{社名}}': toStr(formData.customerName),
      '{{アカウントID}}': toStr(formData.accountId),
      '{{制作内容}}': toStr(formData.productionContent),
      // 制作目的・目標（AI生成）
      '{{制作目的}}': toStr(generatedTexts.purpose),
      '{{制作目標01}}': toStr(generatedTexts.goal01),
      '{{制作目標02}}': toStr(generatedTexts.goal02),
      '{{制作目標03}}': toStr(generatedTexts.goal03),
      // 顧客課題（AI生成）
      '{{現状の顧客課題_01}}': toStr(generatedTexts.challenge01),
      '{{現状の顧客課題_02}}': toStr(generatedTexts.challenge02),
      '{{現状の顧客課題_03}}': toStr(generatedTexts.challenge03),
      // デザインイメージ提案（AI生成）
      '{{イメージ A概要}}': toStr(generatedTexts.designImageA_summary),
      '{{イメージ A詳細}}': toStr(generatedTexts.designImageA_detail),
      '{{イメージ B概要}}': toStr(generatedTexts.designImageB_summary),
      '{{イメージ B詳細}}': toStr(generatedTexts.designImageB_detail),
      // スケジュール（画像解析 or フォーム入力）
      '{{スケジュール}}': toStr(scheduleText),
      '{{実装期間}}': toStr(formData.implementationPeriod),
      '{{修正期間}}': toStr(formData.revisionPeriod),
      '{{サイトチェック期間}}': toStr(formData.siteCheckPeriod),
      // 情報構成URL（フォーム入力）
      '{{WF_URL}}': toStr(formData.wfUrl),
    };

    const slideUrl = createSlideFromTemplate(formData.customerName, replacements, formData.scope);
    Logger.log('スライド生成完了: ' + slideUrl);

    return {
      success: true,
      slideUrl: slideUrl,
      generatedTexts: generatedTexts,
      scheduleText: scheduleText,
    };
  } catch (error) {
    Logger.log('エラー: ' + error.message + '\n' + error.stack);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 役務範囲のチェック内容をテキストに変換
 */
function formatScopeText(scope) {
  if (!scope) return '';

  const labels = {
    structureProposal: '構成提案',
    designCreation: 'デザイン作成',
    designProvided: 'デザイン先方支給',
    implementation: '実装',
    copyCreation: '原稿作成',
    copyProvided: '原稿先方支給',
    siteCopy: 'サイトコピー',
    javascript: 'JavaScript実装',
  };

  const items = [];
  for (const [key, label] of Object.entries(labels)) {
    if (scope[key]) {
      items.push('■ ' + label);
    } else {
      items.push('□ ' + label);
    }
  }
  return items.join('\n');
}

/**
 * プレビューデータを生成する（スライド作成前の確認用）
 */
function generatePreview(formData) {
  try {
    const generatedTexts = generateTextsWithClaude(formData);

    let scheduleText = '';
    if (formData.scheduleImages && formData.scheduleImages.length > 0) {
      scheduleText = extractScheduleFromImages(formData.scheduleImages);
    }

    return {
      success: true,
      preview: {
        customerName: formData.customerName,
        accountId: formData.accountId,
        productionContent: formData.productionContent,
        purpose: generatedTexts.purpose,
        goal01: generatedTexts.goal01,
        goal02: generatedTexts.goal02,
        goal03: generatedTexts.goal03,
        challenge01: generatedTexts.challenge01,
        challenge02: generatedTexts.challenge02,
        challenge03: generatedTexts.challenge03,
        designImageA_summary: generatedTexts.designImageA_summary,
        designImageA_detail: generatedTexts.designImageA_detail,
        designImageB_summary: generatedTexts.designImageB_summary,
        designImageB_detail: generatedTexts.designImageB_detail,
        scheduleText: scheduleText,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
