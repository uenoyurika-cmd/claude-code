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
function createSlideFromTemplate(customerName, replacements, scope, designRefImages) {
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

  // デザイン参考画像をスライドに挿入
  if (designRefImages) {
    insertDesignRefImages(presentation, designRefImages);
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
  const pageElements = slide.getPageElements();
  for (const element of pageElements) {
    replaceTextInElement(element, replacements);
  }
}

/**
 * ページ要素内のテキストを再帰的に置換する（グループ内要素も対応）
 * @param {PageElement} element - ページ要素
 * @param {Object} replacements - プレースホルダーと置換テキストのマップ
 */
function replaceTextInElement(element, replacements) {
  const type = element.getPageElementType();

  if (type === SlidesApp.PageElementType.SHAPE) {
    const shape = element.asShape();
    const textRange = shape.getText();
    if (textRange) {
      const text = textRange.asString();
      for (const [placeholder, replacement] of Object.entries(replacements)) {
        if (text.includes(placeholder)) {
          textRange.replaceAllText(placeholder, replacement);
        }
      }
    }
  } else if (type === SlidesApp.PageElementType.TABLE) {
    const table = element.asTable();
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
  } else if (type === SlidesApp.PageElementType.GROUP) {
    // グループ内の子要素を再帰的に処理
    const group = element.asGroup();
    const children = group.getChildren();
    for (const child of children) {
      replaceTextInElement(child, replacements);
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
 * デザイン参考画像を「デザインイメージのご提案」スライドに挿入する
 *
 * テンプレートの40ページ目（「デザインイメージのご提案」）にある
 * 【イメージ A】【イメージ B】の下に参考画像を挿入する。
 *
 * @param {Presentation} presentation - プレゼンテーションオブジェクト
 * @param {Object} designRefImages - { A: base64DataUrl, B: base64DataUrl }
 */
function insertDesignRefImages(presentation, designRefImages) {
  if (!designRefImages.A && !designRefImages.B) return;

  // 「デザインイメージのご提案」スライドを探す
  const slides = presentation.getSlides();
  let targetSlide = null;

  for (const slide of slides) {
    const text = getSlideFullText(slide);
    if (text.includes('デザインイメージのご提案')) {
      targetSlide = slide;
      break;
    }
  }

  if (!targetSlide) {
    Logger.log('デザインイメージのご提案スライドが見つかりません');
    return;
  }

  // スライドのサイズ情報（標準: 960pt x 540pt = 25400000 x 19050000 EMU）
  // イメージAは左半分、イメージBは右半分に配置
  var slideWidth = presentation.getPageWidth();
  var slideHeight = presentation.getPageHeight();
  var halfWidth = slideWidth / 2;

  // 画像の配置パラメータ（上部はタイトル＋テキスト領域のため、下半分に配置）
  var imgTop = slideHeight * 0.50;    // 上から50%の位置
  var imgHeight = slideHeight * 0.40;  // 高さ40%
  var imgWidth = halfWidth * 0.85;     // 幅は半分の85%
  var marginX = halfWidth * 0.075;     // 左右マージン

  // イメージA（左側に配置）
  if (designRefImages.A) {
    try {
      var blobA = base64ToBlob(designRefImages.A);
      targetSlide.insertImage(blobA, marginX, imgTop, imgWidth, imgHeight);
      Logger.log('デザイン参考画像A を挿入しました');
    } catch (e) {
      Logger.log('デザイン参考画像A の挿入に失敗: ' + e.message);
    }
  }

  // イメージB（右側に配置）
  if (designRefImages.B) {
    try {
      var blobB = base64ToBlob(designRefImages.B);
      targetSlide.insertImage(blobB, halfWidth + marginX, imgTop, imgWidth, imgHeight);
      Logger.log('デザイン参考画像B を挿入しました');
    } catch (e) {
      Logger.log('デザイン参考画像B の挿入に失敗: ' + e.message);
    }
  }
}

/**
 * Base64 Data URLからBlobに変換する
 * @param {string} dataUrl - "data:image/png;base64,..." 形式の文字列
 * @returns {Blob} 画像Blob
 */
function base64ToBlob(dataUrl) {
  var matches = dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('無効な画像データ形式です');
  }
  var contentType = matches[1];
  var base64Data = matches[2];
  var decoded = Utilities.base64Decode(base64Data);
  return Utilities.newBlob(decoded, contentType, 'design_ref');
}

/**
 * スライド内の全テキストを取得する
 */
function getSlideFullText(slide) {
  let text = '';
  const pageElements = slide.getPageElements();
  for (const element of pageElements) {
    text += getTextFromElement(element);
  }
  return text;
}

/**
 * ページ要素からテキストを再帰的に取得する（グループ内要素も対応）
 * @param {PageElement} element - ページ要素
 * @returns {string} テキスト
 */
function getTextFromElement(element) {
  let text = '';
  const type = element.getPageElementType();

  if (type === SlidesApp.PageElementType.SHAPE) {
    const textRange = element.asShape().getText();
    if (textRange) {
      text += textRange.asString() + '\n';
    }
  } else if (type === SlidesApp.PageElementType.TABLE) {
    const table = element.asTable();
    for (let row = 0; row < table.getNumRows(); row++) {
      for (let col = 0; col < table.getNumColumns(); col++) {
        const cell = table.getCell(row, col);
        const textRange = cell.getText();
        if (textRange) {
          text += textRange.asString() + '\n';
        }
      }
    }
  } else if (type === SlidesApp.PageElementType.GROUP) {
    const group = element.asGroup();
    const children = group.getChildren();
    for (const child of children) {
      text += getTextFromElement(child);
    }
  }

  return text;
}
