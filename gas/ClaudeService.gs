/**
 * Gemini API連携サービス
 *
 * Gemini APIを使用してテキスト生成・画像解析を行う。
 */

/**
 * Gemini APIにリクエストを送信する
 * @param {string} userMessage - ユーザーメッセージ
 * @param {string} systemPrompt - システムプロンプト
 * @returns {string} レスポンステキスト
 */
function callGeminiApi(userMessage, systemPrompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini APIキーが設定されていません。スクリプトプロパティに GEMINI_API_KEY を設定してください。');
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + CONFIG.GEMINI_MODEL + ':generateContent?key=' + apiKey;

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      maxOutputTokens: CONFIG.GEMINI_MAX_TOKENS,
      temperature: 0.7,
    },
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    const errorBody = response.getContentText();
    Logger.log('Gemini API Error: ' + responseCode + ' - ' + errorBody);
    throw new Error('Gemini API エラー (HTTP ' + responseCode + '): ' + errorBody);
  }

  const result = JSON.parse(response.getContentText());
  return result.candidates[0].content.parts[0].text;
}

/**
 * フォームデータからGemini APIを使ってテキストを生成する
 * @param {Object} formData - フォームデータ
 * @returns {Object} 生成テキスト群
 */
function generateTextsWithClaude(formData) {
  const systemPrompt = `あなたはWeb制作会社の制作ディレクターです。
制作MTG（ミーティング）資料を作成するために、入力された情報をもとにプロフェッショナルな文章を生成してください。

以下のルールに従ってください：
- 簡潔で分かりやすいビジネス文書として整形する
- 箇条書きを活用し、読みやすくする
- 顧客の要望を的確に反映する
- 制作チームが理解しやすい表現を使う
- 必要に応じて提案や補足を加える

出力はJSON形式で以下のキーを含めてください：
{
  "purpose": "制作目的（整形済み）",
  "challenges": "既存サイトの課題（整形済み）",
  "designProposal": "デザイン要望・提案内容（整形済み）",
  "designReferences": "デザイン参考サイトの提案（URL付き、2-3件）"
}`;

  const userMessage = `以下の情報をもとに、制作MTG資料用のテキストを生成してください。

【顧客名】${formData.customerName || '未入力'}
【アカウントID】${formData.accountId || '未入力'}
【制作内容】${formData.productionContent || '未入力'}

【制作目的（入力メモ）】
${formData.purpose || '未入力'}

【既存サイトの課題（入力メモ）】
${formData.challenges || '未入力'}

【デザイン要望・提案希望（入力メモ）】
${formData.designRequest || '未入力'}

上記を整形し、制作MTG資料として適切な文章にしてください。
デザイン参考サイトは、入力されたデザイン要望に合いそうな実在の参考サイトを2〜3件提案してください。
JSON形式で出力してください。`;

  const responseText = callGeminiApi(userMessage, systemPrompt);

  // JSONを抽出してパース
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Gemini APIの応答からJSONを抽出できませんでした');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * スケジュール画像からテキストを抽出する
 * @param {Array} base64Images - Base64エンコードされた画像の配列
 * @returns {string} 抽出されたスケジュールテキスト
 */
function extractScheduleFromImages(base64Images) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini APIキーが設定されていません。');
  }

  const systemPrompt = `あなたはプロジェクトスケジュールの読み取り専門家です。
ガントチャートやスケジュール表の画像から、以下の形式でスケジュール情報をテキスト化してください。

出力形式：
- 各工程を行ごとに記載
- 工程名、開始日、終了日、期間を含める
- 日付は yyyy/MM/dd 形式で記載
- マイルストーンがあれば明記する

例：
構成提案: 2026/02/20 〜 2026/02/27（1週間）
デザイン作成: 2026/02/28 〜 2026/03/13（2週間）
実装: 2026/03/14 〜 2026/03/28（2週間）
テスト・修正: 2026/03/29 〜 2026/04/04（1週間）
公開: 2026/04/05`;

  // 画像コンテンツを構築
  const parts = [];
  for (const img of base64Images) {
    const matches = img.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (matches) {
      parts.push({
        inline_data: {
          mime_type: matches[1],
          data: matches[2],
        },
      });
    }
  }

  parts.push({
    text: 'この画像はプロジェクトのガントチャート/スケジュール表です。画像に記載されているスケジュール情報を正確にテキスト化してください。日付・曜日・工程名をすべて読み取ってください。',
  });

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + CONFIG.GEMINI_MODEL + ':generateContent?key=' + apiKey;

  const payload = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: parts,
      },
    ],
    generationConfig: {
      maxOutputTokens: CONFIG.GEMINI_MAX_TOKENS,
      temperature: 0.3,
    },
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    throw new Error('スケジュール画像の解析に失敗しました (HTTP ' + responseCode + ')');
  }

  const result = JSON.parse(response.getContentText());
  return result.candidates[0].content.parts[0].text;
}
