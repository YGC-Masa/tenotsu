// textHandler.js

export let currentSpeed = 40;
let textInterval = null;
export let isTextTyping = false;

export function setTextWithSpeed(textElement, text, speed, callback) {
  clearInterval(textInterval);
  isTextTyping = true;
  textElement.innerHTML = "";
  let i = 0;
  textInterval = setInterval(() => {
    textElement.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(textInterval);
      isTextTyping = false;
      if (callback) callback();
    }
  }, speed);
}

export function skipTextImmediately(textElement, text, callback) {
  clearInterval(textInterval);
  isTextTyping = false;
  textElement.innerHTML = text;
  if (callback) callback();
}
