// textHandler.js

let currentTextTimer = null;
let isTextAnimating = false;

/**
 * 指定速度で1文字ずつテキストを表示
 */
export function setTextWithSpeed(element, text, speed, callback) {
  if (currentTextTimer) {
    clearInterval(currentTextTimer);
  }

  element.innerHTML = "";
  isTextAnimating = true;

  let i = 0;
  currentTextTimer = setInterval(() => {
    if (i < text.length) {
      element.innerHTML += text[i++];
    } else {
      clearInterval(currentTextTimer);
      currentTextTimer = null;
      isTextAnimating = false;
      if (callback) callback();
    }
  }, speed);
}

/**
 * アニメーション中のテキストを即時表示（スキップ）
 */
export function skipText(element, fullText) {
  if (currentTextTimer) {
    clearInterval(currentTextTimer);
    currentTextTimer = null;
  }
  isTextAnimating = false;
  element.innerHTML = fullText;
}

/**
 * 現在アニメーション中かどうかを返す
 */
export function isAnimating() {
  return isTextAnimating;
}

/**
 * キャラごとのフォントサイズ・速度を適用して速度を返す
 */
export function setCharacterStyle(name, styles, defaultFontSize, defaultSpeed) {
  const style = styles[name] || styles[""];
  document.documentElement.style.setProperty("--fontSize", style.fontSize || defaultFontSize);
  return style.speed || defaultSpeed;
}
