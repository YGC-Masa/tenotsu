// textHandler.js
// ユーザーのクリック待ちやタイムアウト待ちを処理し、スキップ時のセリフ混在防止を考慮

export function waitForUserInputOrTimeout(timeout = 2000) {
  return new Promise(resolve => {
    let resolved = false;

    function onUserInput() {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve();
    }

    function cleanup() {
      document.removeEventListener('click', onUserInput);
      document.removeEventListener('keydown', onUserInput);
    }

    // ユーザーのクリックかキーボードでの操作待ち
    document.addEventListener('click', onUserInput);
    document.addEventListener('keydown', onUserInput);

    // タイムアウト
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve();
      }
    }, timeout);
  });
}
