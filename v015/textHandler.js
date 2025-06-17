// textHandler.js

export let currentSpeed = 40;
let textInterval = null;

export function setTextWithSpeed(textElement, text, speed, callback) {
  clearInterval(textInterval); // 前の処理をクリア
  textElement.innerHTML = "";
  let i = 0;
  textInterval = setInterval(() => {
    textElement.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(textInterval);
      if (callback) callback();
    }
  }, speed);
}

export function skipTextImmediately(textElement, text, callback) {
  clearInterval(textInterval);
  textElement.innerHTML = text;
  if (callback) callback();
}
