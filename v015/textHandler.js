// textHandler.js

import { getCharacterStyle } from './characterStyles.js';

let isSkipping = false;
let currentTimeouts = [];

/**
 * セリフを表示（typewriter風）
 * @param {string} name - キャラ名
 * @param {string} text - セリフ
 * @param {Function} onComplete - 完了時に呼ばれるコールバック
 */
export function showDialogue(name, text, onComplete) {
  const nameBox = document.getElementById('name');
  const textBox = document.getElementById('text');

  // スタイルの適用
  const charStyle = getCharacterStyle(name);
  document.documentElement.style.setProperty('--fontSize', charStyle.fontSize || '1em');

  nameBox.textContent = name;
  textBox.textContent = '';

  clearAllTimeouts();

  const speed = isSkipping ? 0 : (charStyle.speed || 30); // ミリ秒/文字

  for (let i = 0; i <= text.length; i++) {
    const timeout = setTimeout(() => {
      textBox.textContent = text.slice(0, i);
      if (i === text.length && typeof onComplete === 'function') {
        onComplete();
      }
    }, i * speed);
    currentTimeouts.push(timeout);
  }
}

/**
 * スキップ状態を切り替え
 * trueで即座に全文表示
 */
export function toggleSkip(state) {
  isSkipping = state;
}

/**
 * 表示中のテキストを強制的に最後まで表示
 */
export function fastForward(text, onComplete) {
  clearAllTimeouts();
  const textBox = document.getElementById('text');
  textBox.textContent = text;
  if (typeof onComplete === 'function') {
    onComplete();
  }
}

/**
 * タイムアウトを全てクリア
 */
function clearAllTimeouts() {
  currentTimeouts.forEach(timeout => clearTimeout(timeout));
  currentTimeouts = [];
}
