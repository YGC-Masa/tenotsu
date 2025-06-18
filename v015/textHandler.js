// textHandler.js
// セリフの1文字ずつ表示 + スキップ防止のクリック・タイムアウト制御

let currentTextTimeout = null;

/**
 * 一文字ずつテキストを表示（タイピング風演出）
 * @param {string} text 表示するテキスト
 * @param {HTMLElement} element 表示先の要素
 * @param {number} speed ミリ秒ごとの文字速度（例: 30）
 * @param {Function} callback 表示完了後に呼ばれる関数（省略可）
 */
export function showTextByCharacter(text, element, speed = 30, callback) {
  // 以前の表示が残っていればクリア
  if (currentTextTimeout) {
    clearTimeout(currentTextTimeout);
    currentTextTimeout = null;
  }

  element.textContent = "";
  let index = 0;

  function typeNext() {
    if (index < text.length) {
      element.textContent += text[index++];
      currentTextTimeout = setTimeout(typeNext, speed);
    } else {
      if (callback) callback();
    }
  }

  typeNext();
}

/**
 * ユーザー操作またはタイムアウト待ち
 * @param {number} timeout 待機時間（ミリ秒）
 * @returns {Promise<void>}
 */
export function waitForUserInputOrTimeout(timeout = 2000) {
  return new Promise(resolve => {
    let resolved = false;

    function onUserInput() {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    }

    function cleanup() {
      document.removeEventListener('click', onUserInput);
      document.removeEventListener('keydown', onUserInput);
    }

    document.addEventListener('click', onUserInput);
    document.addEventListener('keydown', onUserInput);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    }, timeout);
  });
}
