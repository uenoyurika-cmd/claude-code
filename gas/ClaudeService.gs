/**
 * OpenAI API連携サービス
 *
 * OpenAI APIを使用してテキスト生成・画像解析を行う。
 */

/**
 * OpenAI APIにリクエストを送信する
 * @param {string} userMessage - ユーザーメッセージ
 * @param {string} systemPrompt - システムプロンプト
 * @returns {string} レスポンステキスト
 */
function callOpenAIApi(userMessage, systemPrompt) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI APIキーが設定されていません。スクリプトプロパティに OPENAI_API_KEY を設定してください。');
  }

  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: CONFIG.OPENAI_MODEL,
    max_tokens: CONFIG.OPENAI_MAX_TOKENS,
    temperature: 0.7,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    const errorBody = response.getContentText();
    Logger.log('OpenAI API Error: ' + responseCode + ' - ' + errorBody);
    throw new Error('OpenAI API エラー (HTTP ' + responseCode + '): ' + errorBody);
  }

  const result = JSON.parse(response.getContentText());
  return result.choices[0].message.content;
}

/**
 * フォームデータからOpenAI APIを使ってテキストを生成する
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

出力はJSON形式で以下のキーを含めてください（値はすべて文字列型にしてください）：
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

  const responseText = callOpenAIApi(userMessage, systemPrompt);

  // JSONを抽出してパース
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('OpenAI APIの応答からJSONを抽出できませんでした');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * スケジュール画像からテキストを抽出する
 * @param {Array} base64Images - Base64エンコードされた画像の配列
 * @returns {string} 抽出されたスケジュールテキスト
 */
function extractScheduleFromImages(base64Images) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI APIキーが設定されていません。');
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

  // 画像コンテンツを構築（OpenAI Vision形式）
  const contentParts = [];
  for (const img of base64Images) {
    const matches = img.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (matches) {
      contentParts.push({
        type: 'image_url',
        image_url: {
          url: img,
        },
      });
    }
  }

  contentParts.push({
    type: 'text',
    text: 'この画像はプロジェクトのガントチャート/スケジュール表です。画像に記載されているスケジュール情報を正確にテキスト化してください。日付・曜日・工程名をすべて読み取ってください。',
  });

  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: CONFIG.OPENAI_MODEL,
    max_tokens: CONFIG.OPENAI_MAX_TOKENS,
    temperature: 0.3,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: contentParts },
    ],
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    throw new Error('スケジュール画像の解析に失敗しました (HTTP ' + responseCode + ')');
  }

  const result = JSON.parse(response.getContentText());
  return result.choices[0].message.content;
}
