/**
 * Google Slides テンプレート操作サービス
 *
 * テンプレートの複製、プレースホルダー置換、不要ページの削除を行う。
 */

/**
 * テンプレートを複製してプレースホルダーを置換し、新しいスライドを作成する
 * @param {string} customerName - 顧客名（ファイル名に使用）
 * @param {Object} replacements - プレースホルダーと置換テキストのマップ
 * @returns {string} 生成されたスライドのURL
 */
function createSlideFromTemplate(customerName, replacements) {
  const templateId = getTemplateSlideId();
  const templateFile = DriveApp.getFileById(templateId);

  // ファイル名を生成
  const dateStr = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMdd');
  const newFileName = '【' + (customerName || '顧客名未設定') + '御中】ferretOne制作MTG資料_' + dateStr;

  // テンプレートを複製
  let newFile;
  const outputFolderId = getOutputFolderId();
  if (outputFolderId) {
    const folder = DriveApp.getFolderById(outputFolderId);
    newFile = templateFile.makeCopy(newFileName, folder);
  } else {
    newFile = templateFile.makeCopy(newFileName);
  }

  const newFileId = newFile.getId();
  const presentation = SlidesApp.openById(newFileId);
  const slides = presentation.getSlides();

  // 全スライドのプレースホルダーを置換
  for (const slide of slides) {
    replaceTextInSlide(slide, replacements);
  }

  // 不要ページの判定と削除
  removeEmptySlides(presentation, replacements);

  // 変更を保存
  presentation.saveAndClose();

  return 'https://docs.google.com/presentation/d/' + newFileId + '/edit';
}

/**
 * スライド内のテキストプレースホルダーを置換する
 * @param {Slide} slide - スライドオブジェクト
 * @param {Object} replacements - プレースホルダーと置換テキストのマップ
 */
function replaceTextInSlide(slide, replacements) {
  const shapes = slide.getShapes();

  for (const shape of shapes) {
    const textRange = shape.getText();
    if (!textRange) continue;

    const text = textRange.asString();

    for (const [placeholder, replacement] of Object.entries(replacements)) {
      if (text.includes(placeholder)) {
        textRange.replaceAllText(placeholder, replacement);
      }
    }
  }

  // テーブル内のテキストも置換
  const tables = slide.getTables();
  for (const table of tables) {
    for (let row = 0; row < table.getNumRows(); row++) {
      for (let col = 0; col < table.getNumColumns(); col++) {
        const cell = table.getCell(row, col);
        const textRange = cell.getText();
        const text = textRange.asString();

        for (const [placeholder, replacement] of Object.entries(replacements)) {
          if (text.includes(placeholder)) {
            textRange.replaceAllText(placeholder, replacement);
          }
        }
      }
    }
  }
}

/**
 * 内容が空のスライドを削除する
 * コンテンツが空（置換テキストが空文字列）のセクションに対応するスライドを削除する
 * @param {Presentation} presentation - プレゼンテーションオブジェクト
 * @param {Object} replacements - プレースホルダーと置換テキストのマップ
 */
function removeEmptySlides(presentation, replacements) {
  // 空の置換テキストに対応するセクション名を特定
  const emptyPlaceholders = [];
  for (const [placeholder, replacement] of Object.entries(replacements)) {
    const str = String(replacement || '');
    if (!str || str.trim() === '') {
      emptyPlaceholders.push(placeholder);
    }
  }

  if (emptyPlaceholders.length === 0) return;

  // セクションプレースホルダーとスライドの対応マップ
  const sectionMap = {
    '{{デザイン参考}}': 'デザイン参考',
    '{{制作スケジュール}}': 'スケジュール',
  };

  const slides = presentation.getSlides();

  // 後ろから削除（インデックスずれ防止）
  for (let i = slides.length - 1; i >= 0; i--) {
    const slide = slides[i];
    const slideText = getSlideFullText(slide);

    for (const emptyPlaceholder of emptyPlaceholders) {
      const sectionName = sectionMap[emptyPlaceholder];
      if (!sectionName) continue;

      // スライドのタイトルやテキストにセクション名が含まれ、
      // かつ内容が空の場合に削除対象とする
      if (slideText.includes(sectionName) && isSlideContentEmpty(slide)) {
        // 最低1枚は残す
        if (presentation.getSlides().length > 1) {
          slide.remove();
          Logger.log('空のスライドを削除: ' + sectionName);
        }
        break;
      }
    }
  }
}

/**
 * スライド内の全テキストを取得する
 */
function getSlideFullText(slide) {
  let text = '';
  const shapes = slide.getShapes();
  for (const shape of shapes) {
    const textRange = shape.getText();
    if (textRange) {
      text += textRange.asString() + '\n';
    }
  }
  return text;
}

/**
 * スライドのコンテンツ部分が実質的に空かどうか判定する
 */
function isSlideContentEmpty(slide) {
  const shapes = slide.getShapes();
  let hasContent = false;

  for (const shape of shapes) {
    const textRange = shape.getText();
    if (!textRange) continue;

    const text = textRange.asString().trim();
    // タイトルっぽいテキスト以外にコンテンツがあれば空ではない
    if (text.length > 0 && !isLikelyTitle(text)) {
      hasContent = true;
      break;
    }
  }

  return !hasContent;
}

/**
 * テキストがタイトルっぽいかどうか判定する
 */
function isLikelyTitle(text) {
  // 短いテキスト（20文字以下）でプレースホルダーを含まないものはタイトル候補
  return text.length <= 20 && !text.includes('{{');
}
