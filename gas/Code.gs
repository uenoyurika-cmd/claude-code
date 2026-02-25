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

    // 3. デザイン参考サイトの提案を取得
    const designReferences = generatedTexts.designReferences || '';

    // 4. 役務範囲テキストを生成
    const scopeText = formatScopeText(formData.scope);

    // 5. テンプレートを複製してプレースホルダーを置換
    // AI応答が文字列以外（配列・オブジェクト等）の場合に備えてString()で変換
    const toStr = (val) => {
      if (val == null) return '';
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) return val.join('\n');
      if (typeof val === 'object') return JSON.stringify(val, null, 2);
      return String(val);
    };

    const replacements = {
      '{{顧客名}}': toStr(formData.customerName),
      '{{アカウントID}}': toStr(formData.accountId),
      '{{制作内容}}': toStr(formData.productionContent),
      '{{制作目的}}': toStr(generatedTexts.purpose),
      '{{既存サイトの課題}}': toStr(generatedTexts.challenges),
      '{{デザイン要望・提案}}': toStr(generatedTexts.designProposal),
      '{{デザイン参考}}': toStr(designReferences),
      '{{制作スケジュール}}': toStr(scheduleText),
      '{{役務範囲}}': toStr(scopeText),
      '{{日付}}': Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd'),
    };

    const slideUrl = createSlideFromTemplate(formData.customerName, replacements);
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

    const scopeText = formatScopeText(formData.scope);

    return {
      success: true,
      preview: {
        customerName: formData.customerName,
        accountId: formData.accountId,
        productionContent: formData.productionContent,
        purpose: generatedTexts.purpose,
        challenges: generatedTexts.challenges,
        designProposal: generatedTexts.designProposal,
        designReferences: generatedTexts.designReferences,
        scheduleText: scheduleText,
        scopeText: scopeText,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}
