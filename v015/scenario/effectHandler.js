// effectHandler.js
// 各種演出エフェクトをまとめて管理し、対象要素に対して効果を実行するモジュール

export function playEffect(effectName, element, callback) {
  if (!effectName || !element) {
    if (callback) callback();
    return;
  }

  switch(effectName.toLowerCase()) {
    case 'fadein':
      fadeIn(element, callback);
      break;
    case 'slideleft':
      slideLeft(element, callback);
      break;
    case 'slideright':
      slideRight(element, callback);
      break;
    case 'whitein':
      whiteIn(element, callback);
      break;
    case 'blackin':
      blackIn(element, callback);
      break;
    case 'whiteout':
      whiteOut(element, callback);
      break;
    case 'blackout':
      blackOut(element, callback);
      break;
    case 'transition':
      // ここはカスタム対応。必要に応じて拡張してください
      if (callback) callback();
      break;
    default:
      if (callback) callback();
  }
}

// --- 各効果実装例 ---

function fadeIn(element, callback) {
  element.style.transition = 'opacity 0.8s ease';
  element.style.opacity = '0';
  // 一旦強制再描画
  element.offsetHeight;
  element.style.opacity = '1';
  setTimeout(() => {
    if (callback) callback();
  }, 800);
}

function slideLeft(element, callback) {
  element.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
  element.style.transform = 'translateX(100%)';
  element.style.opacity = '0';
  element.offsetHeight;
  element.style.transform = 'translateX(0)';
  element.style.opacity = '1';
  setTimeout(() => {
    if (callback) callback();
  }, 600);
}

function slideRight(element, callback) {
  element.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
  element.style.transform = 'translateX(-100%)';
  element.style.opacity = '0';
  element.offsetHeight;
  element.style.transform = 'translateX(0)';
  element.style.opacity = '1';
  setTimeout(() => {
    if (callback) callback();
  }, 600);
}

function whiteIn(element, callback) {
  const overlay = createOverlay('white');
  document.body.appendChild(overlay);
  overlay.style.transition = 'opacity 0.5s ease';
  overlay.style.opacity = '1';
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(overlay);
      if (callback) callback();
    }, 500);
  }, 500);
}

function blackIn(element, callback) {
  const overlay = createOverlay('black');
  document.body.appendChild(overlay);
  overlay.style.transition = 'opacity 0.5s ease';
  overlay.style.opacity = '1';
  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(overlay);
      if (callback) callback();
    }, 500);
  }, 500);
}

function whiteOut(element, callback) {
  const overlay = createOverlay('white');
  overlay.style.opacity = '0';
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity = '1';
    setTimeout(() => {
      if (callback) callback();
    }, 500);
  }, 10);
}

function blackOut(element, callback) {
  const overlay = createOverlay('black');
  overlay.style.opacity = '0';
  document.body.appendChild(overlay);
  setTimeout(() => {
    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity = '1';
    setTimeout(() => {
      if (callback) callback();
    }, 500);
  }, 10);
}

function createOverlay(color) {
  const div = document.createElement('div');
  div.style.position = 'fixed';
  div.style.top = '0';
  div.style.left = '0';
  div.style.width = '100vw';
  div.style.height = '100vh';
  div.style.backgroundColor = color;
  div.style.opacity = '0';
  div.style.pointerEvents = 'none';
  div.style.zIndex = '9999';
  return div;
}
