let defaultSpeed = 40;
let currentSpeed = defaultSpeed;
let currentInterval = null;

export function setCharacterStyle(name, characterStyles) {
  const style = characterStyles[name] || characterStyles[""];
  document.documentElement.style.setProperty("--fontSize", style.fontSize || "1em");
  currentSpeed = style.speed || defaultSpeed;
}

export function setTextWithSpeed(text, textEl, speed = currentSpeed, callback) {
  if (currentInterval) clearInterval(currentInterval);
  textEl.innerHTML = "";
  let i = 0;
  currentInterval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(currentInterval);
      currentInterval = null;
      if (callback) callback();
    }
  }, speed);
}

export function skipText(text, textEl, callback) {
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }
  textEl.innerHTML = text;
  if (callback) callback();
}
