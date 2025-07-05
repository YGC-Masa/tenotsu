// utils.js - UI制御・状態系ユーティリティ

// タイピング表示
function setTextWithSpeed(text, speed, callback) {
  if (typingInterval) clearInterval(typingInterval);
  isPlaying = true;
  const textEl = document.getElementById("text");
  textEl.innerHTML = "";
  let i = 0;
  typingInterval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(typingInterval);
      typingInterval = null;
      isPlaying = false;
      if (callback) callback();
      const choicesEl = document.getElementById("choices");
      if (isAutoMode && choicesEl.children.length === 0) {
        setTimeout(() => {
          if (!isPlaying) next();
        }, autoWaitTime);
      }
    }
  }, speed);
}

// キャラクターのスタイル設定
function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || characterStyles[""];
  const fontSize = scene.fontSize || style.fontSize || defaultFontSize;
  currentSpeed = scene.speed || style.speed || defaultSpeed;
  document.documentElement.style.setProperty("--fontSize", fontSize);
}

// キャラクター画像クリア
function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
    charSlots[pos].classList.remove("active");
  }
  lastActiveSide = null;
}

// 表示キャラクターの切り替え（モバイル時制御）
function updateCharacterDisplay() {
  const isPortrait = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
  for (const pos in charSlots) {
    const slot = charSlots[pos];
    const hasCharacter = slot.children.length > 0;
    if (isPortrait) {
      slot.classList.toggle("active", pos === lastActiveSide && hasCharacter);
    } else {
      slot.classList.toggle("active", hasCharacter);
    }
  }
}

// テキストエリアの表示・非表示
function updateTextAreaVisibility(show) {
  const dialogueBox = document.getElementById("dialogue-box");
  textAreaVisible = show;
  dialogueBox.classList.toggle("hidden", !show);
}

// ビューポート高さの再設定
function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
