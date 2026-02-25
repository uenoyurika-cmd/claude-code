/**
 * Google Slides テンプレート操作サービス
 *
 * テンプレートの複製、プレースホルダー置換、役務範囲に基づく不要ページ削除を行う。
 */

/**
 * テンプレートを複製してプレースホルダーを置換し、新しいスライドを作成する
 * @param {string} customerName - 顧客名（ファイル名に使用）
 * @param {Object} replacements - プレースホルダーと置換テキストのマップ
 * @param {Object} scope - 役務範囲（ページ取捨選択に使用）
 * @returns {string} 生成されたスライドのURL
 */
function createSlideFromTemplate(customerName, replacements, scope) {
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

  // 役務範囲に基づいて不要ページを削除
  removeSlidesBasedOnScope(presentation, scope);

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
 * 役務範囲に基づいてスライドを削除する
 *
 * テンプレートの黄色メモに従い、役務範囲のチェック状態に応じてページを取捨選択する：
 * - 「デザインが不要な場合は削除」→ designCreation が OFF なら削除
 * - 「原稿執筆が不要な場合は削除」→ copyCreation が OFF なら削除
 * - 「顧客原稿支給の際使用」→ copyProvided が ON のときだけ残す
 * - 「JavaScriptが不要な場合は削除」→ javascript が OFF なら削除
 * - 「顧客デザイン支給の際使用」→ designProvided が ON のときだけ残す
 * - 「サイトコピーでリニューアルの場合使用」→ siteCopy が ON のときだけ残す
 *
 * @param {Presentation} presentation - プレゼンテーションオブジェクト
 * @param {Object} scope - 役務範囲オブジェクト
 */
function removeSlidesBasedOnScope(presentation, scope) {
  if (!scope) return;

  // 削除ルール定義：
  // keywords = スライド内テキストに含まれるキーワード（いずれかがマッチすれば対象）
  // shouldDelete = true のとき、該当スライドを削除
  const deleteRules = [];

  // デザイン作成関連ページ（「制作規約 ーデザインー」「デザイン制作における注意事項」等）
  // → デザイン作成が役務範囲に含まれない場合は削除
  if (!scope.designCreation) {
    deleteRules.push({
      keywords: ['制作規約 ーデザインー', 'デザイン制作における注意事項', 'デザインイメージのご提案'],
      reason: 'デザイン作成なし',
    });
  }

  // 原稿執筆関連ページ
  // → 原稿作成が役務範囲に含まれない場合は削除
  if (!scope.copyCreation) {
    deleteRules.push({
      keywords: ['制作規約 ー原稿執筆ー', '原稿執筆方針'],
      reason: '原稿作成なし',
    });
  }

  // 顧客原稿支給時の注意ページ（「禁止・注意表現」で原稿関連のもの）
  // → 原稿先方支給でない場合は削除
  if (!scope.copyProvided) {
    deleteRules.push({
      keywords: ['顧客原稿支給の際'],
      reason: '原稿先方支給なし',
    });
  }

  // JavaScript実装確認ページ
  // → JavaScript実装が不要な場合は削除
  if (!scope.javascript) {
    deleteRules.push({
      keywords: ['JavaScriptによる実装のご確認'],
      reason: 'JavaScript実装なし',
    });
  }

  // 顧客デザイン支給関連ページ（「ご支給デザイン」セクション）
  // → デザイン先方支給でない場合は削除
  if (!scope.designProvided) {
    deleteRules.push({
      keywords: ['ご支給デザインでの', 'デザイン作成時のルール', 'スマートフォン・タブレット対応', '顧客デザイン支給の際'],
      reason: 'デザイン先方支給なし',
    });
  }

  // サイトコピー関連ページ
  // → サイトコピーでない場合は削除
  if (!scope.siteCopy) {
    deleteRules.push({
      keywords: ['サイトコピー'],
      reason: 'サイトコピーなし',
    });
  }

  if (deleteRules.length === 0) return;

  const slides = presentation.getSlides();

  // 後ろから削除（インデックスずれ防止）
  for (let i = slides.length - 1; i >= 0; i--) {
    // 最低1枚は残す
    if (presentation.getSlides().length <= 1) break;

    const slide = slides[i];
    const slideText = getSlideFullText(slide);

    for (const rule of deleteRules) {
      const shouldDelete = rule.keywords.some(function(keyword) {
        return slideText.includes(keyword);
      });

      if (shouldDelete) {
        slide.remove();
        Logger.log('スライド削除 (理由: ' + rule.reason + '): スライド ' + (i + 1));
        break; // このスライドは削除済み、次のスライドへ
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

  // テーブル内のテキストも含める
  const tables = slide.getTables();
  for (const table of tables) {
    for (let row = 0; row < table.getNumRows(); row++) {
      for (let col = 0; col < table.getNumColumns(); col++) {
        const cell = table.getCell(row, col);
        const textRange = cell.getText();
        if (textRange) {
          text += textRange.asString() + '\n';
        }
      }
    }
  }

  return text;
}
