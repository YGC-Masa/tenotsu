// effectHandler.js

/**
 * 画面効果を実行する関数
 * @param {string} effectName - エフェクト名（fadein, fadeout, whitein, whiteout, blackin, blackout, slideleft, slideright, transitionなど）
 * @param {HTMLElement} target - 効果をかける要素（例: 背景画像やゲーム全体コンテナ）
 * @param {Function} onComplete - 効果完了時のコールバック
 * @param {object} [options] - オプション（durationなど）
 */
export function playEffect(effectName, target, onComplete, options = {}) {
  const duration = options.duration || 500; // デフォルト500ms
  let animationClass = '';
  let cleanup = () => {
    if (animationClass) target.classList.remove(animationClass);
  };

  switch (effectName.toLowerCase()) {
    case 'fadein':
      animationClass = 'fadein';
      target.style.opacity = 0;
      target.style.transition = `opacity ${duration}ms ease`;
      target.style.opacity = 1;
      setTimeout(() => {
        cleanup();
        onComplete && onComplete();
      }, duration);
      break;

    case 'fadeout':
      animationClass = 'fadeout';
      target.style.opacity = 1;
      target.style.transition = `opacity ${duration}ms ease`;
      target.style.opacity = 0;
      setTimeout(() => {
        cleanup();
        onComplete && onComplete();
      }, duration);
      break;

    case 'whitein':
      animationClass = 'whitein';
      applyOverlay('white', duration, onComplete);
      break;

    case 'whiteout':
      animationClass = 'whiteout';
      removeOverlay(duration, onComplete);
      break;

    case 'blackin':
      animationClass = 'blackin';
      applyOverlay('black', duration, onComplete);
      break;

    case 'blackout':
      animationClass = 'blackout';
      removeOverlay(duration, onComplete);
      break;

    case 'slideleft':
      animationClass = 'slideinLeft';
      target.classList.add(animationClass);
      setTimeout(() => {
        target.classList.remove(animationClass);
        onComplete && onComplete();
      }, duration);
      break;

    case 'slideright':
      animationClass = 'slideinRight';
      target.classList.add(animationClass);
      setTimeout(() => {
        target.classList.remove(animationClass);
        onComplete && onComplete();
      }, duration);
      break;

    case 'transition':
      // カスタムトランジションは options.transitionClass で指定を想定
      if (options.transitionClass) {
        animationClass = options.transitionClass;
        target.classList.add(animationClass);
        setTimeout(() => {
          target.classList.remove(animationClass);
          onComplete && onComplete();
        }, duration);
      } else {
        onComplete && onComplete();
      }
      break;

    default:
      // 未対応のエフェクトは即時完了扱い
      onComplete && onComplete();
      break;
  }
}

/**
 * オーバーレイ適用（whitein, blackin 用）
 * @param {string} color - 'white' or 'black'
 * @param {number} duration - ミリ秒
 * @param {Function} callback - 完了時
 */
function applyOverlay(color, duration, callback) {
  let overlay = document.getElementById('effect-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'effect-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: color,
      opacity: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      transition: `opacity ${duration}ms ease`
    });
    document.body.appendChild(overlay);
  }
  overlay.style.opacity = '1';

  setTimeout(() => {
    callback && callback();
  }, duration);
}

/**
 * オーバーレイ解除（whiteout, blackout 用）
 * @param {number} duration - ミリ秒
 * @param {Function} callback - 完了時
 */
function removeOverlay(duration, callback) {
  const overlay = document.getElementById('effect-overlay');
  if (!overlay) {
    callback && callback();
    return;
  }
  overlay.style.opacity = '0';
  setTimeout(() => {
    if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
    callback && callback();
  }, duration);
}
