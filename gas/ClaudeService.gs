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
  const hasDesignRefA = formData.designRefImageA && formData.designRefImageA.startsWith('data:image');
  const hasDesignRefB = formData.designRefImageB && formData.designRefImageB.startsWith('data:image');
  const hasAnyImage = hasDesignRefA || hasDesignRefB;

  // デザイン参考画像の有無でプロンプトを切り替え
  const designImageInstruction = hasAnyImage
    ? `デザインイメージについて：
- 添付されたデザイン参考画像を分析し、その画像のデザイン特徴を説明してください
- 参考画像Aがある場合：画像Aの配色・レイアウト・雰囲気・BtoBサイトとしての訴求ポイントをdesignImageA_summary/detailに記載
- 参考画像Bがある場合：画像Bの配色・レイアウト・雰囲気・BtoBサイトとしての訴求ポイントをdesignImageB_summary/detailに記載
- 参考画像がないパターンは、テキスト入力のデザイン要望から提案を生成してください`
    : `デザインイメージは2パターン（A/B）を提案してください。各パターンに実在の参考サイトURLを含めてください。`;

  const systemPrompt = `あなたはferret One（BtoBマーケティングツール）のWeb制作ディレクターです。
制作MTG資料のGoogle Slidesテンプレートに埋め込むテキストを生成してください。

以下のルールに従ってください：
- 簡潔で分かりやすいビジネス文書として整形する
- 顧客の要望を的確に反映する
- 制作チームと顧客の双方が理解しやすい表現を使う
- 各項目は1〜2文程度で簡潔にまとめる

${designImageInstruction}

出力はJSON形式で以下のキーを含めてください（値はすべて文字列型にしてください）：
{
  "purpose": "制作の大目的（1文で簡潔に）",
  "goal01": "サイトの目標1（例：問い合わせ数の増加）",
  "goal02": "サイトの目標2（例：ブランドイメージの刷新）",
  "goal03": "サイトの目標3（なければ空文字）",
  "challenge01": "現状の顧客課題1",
  "challenge02": "現状の顧客課題2",
  "challenge03": "現状の顧客課題3（なければ空文字）",
  "designImageA_summary": "デザインイメージA概要（方向性を10文字程度で）",
  "designImageA_detail": "デザインイメージA詳細（配色・レイアウト・雰囲気・訴求ポイント等を2〜3文で）",
  "designImageB_summary": "デザインイメージB概要（方向性を10文字程度で）",
  "designImageB_detail": "デザインイメージB詳細（配色・レイアウト・雰囲気・訴求ポイント等を2〜3文で）"
}`;

  const textMessage = `以下の情報をもとに、ferret One制作MTG資料用のテキストを生成してください。

【顧客名】${formData.customerName || '未入力'}
【アカウントID】${formData.accountId || '未入力'}
【制作内容】${formData.productionContent || '未入力'}

【制作目的（入力メモ）】
${formData.purpose || '未入力'}

【既存サイトの課題（入力メモ）】
${formData.challenges || '未入力'}

【デザイン要望・提案希望（入力メモ）】
${formData.designRequest || '未入力'}

上記を整形し、テンプレートのプレースホルダーに埋め込む文章を生成してください。
JSON形式で出力してください。`;

  let responseText;

  if (hasAnyImage) {
    // Vision API で画像付きリクエスト
    responseText = callOpenAIApiWithImages(systemPrompt, textMessage, formData.designRefImageA, formData.designRefImageB);
  } else {
    responseText = callOpenAIApi(textMessage, systemPrompt);
  }

  // JSONを抽出してパース
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('OpenAI APIの応答からJSONを抽出できませんでした');
  }

  return JSON.parse(jsonMatch[0]);
}

/**
 * デザイン参考画像付きでOpenAI APIにリクエストを送信する（Vision対応）
 * @param {string} systemPrompt - システムプロンプト
 * @param {string} textMessage - テキストメッセージ
 * @param {string|null} imageA - デザイン参考画像A（Base64 Data URL）
 * @param {string|null} imageB - デザイン参考画像B（Base64 Data URL）
 * @returns {string} レスポンステキスト
 */
function callOpenAIApiWithImages(systemPrompt, textMessage, imageA, imageB) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error('OpenAI APIキーが設定されていません。');
  }

  // マルチモーダルコンテンツを構築
  const contentParts = [];

  if (imageA) {
    contentParts.push({
      type: 'text',
      text: '【デザイン参考画像A】以下の画像はデザインイメージAの参考サイトです：',
    });
    contentParts.push({
      type: 'image_url',
      image_url: { url: imageA },
    });
  }

  if (imageB) {
    contentParts.push({
      type: 'text',
      text: '【デザイン参考画像B】以下の画像はデザインイメージBの参考サイトです：',
    });
    contentParts.push({
      type: 'image_url',
      image_url: { url: imageB },
    });
  }

  contentParts.push({
    type: 'text',
    text: textMessage,
  });

  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: CONFIG.OPENAI_MODEL,
    max_tokens: CONFIG.OPENAI_MAX_TOKENS,
    temperature: 0.7,
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
    const errorBody = response.getContentText();
    Logger.log('OpenAI Vision API Error: ' + responseCode + ' - ' + errorBody);
    throw new Error('OpenAI API エラー (HTTP ' + responseCode + '): ' + errorBody);
  }

  const result = JSON.parse(response.getContentText());
  return result.choices[0].message.content;
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
