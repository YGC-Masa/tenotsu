// ▼ テキストをスピード制御付きで表示
function setTextWithSpeed(text, callback) {
  const textArea = document.getElementById("text");
  textArea.innerText = "";
  let index = 0;
  const speed = 20; // 1文字の表示間隔（ミリ秒）

  function typeChar() {
    if (index < text.length) {
      textArea.innerText += text.charAt(index);
      index++;
      setTimeout(typeChar, speed);
    } else if (callback) {
      callback();
    }
  }

  typeChar();
}

// ▼ キャラクターのスタイルを適用
function setCharacterStyle(img, charId) {
  if (!window.characterStyles || !charId) return;
  const style = window.characterStyles[charId];
  if (!style) return;

  if (style.scale) {
    img.style.transform = `scale(${style.scale})`;
  }
  if (style.marginLeft) {
    img.style.marginLeft = style.marginLeft;
  }
  if (style.marginTop) {
    img.style.marginTop = style.marginTop;
  }
}

// ▼ キャラクターの表示をクリア
function clearCharacters() {
  const slots = document.querySelectorAll(".char-slot");
  slots.forEach((slot) => {
    slot.innerHTML = "";
    slot.classList.remove("active");
  });
}

// ▼ キャラクターを表示（config.charPath対応）
function updateCharacterDisplay(position, charId) {
  const slotId = `char-${position}`;
  const slot = document.getElementById(slotId);
  if (!slot || !charId) return;

  slot.innerHTML = "";

  const img = document.createElement("img");
  const basePath = window.config?.charPath || "./assets/char/";
  img.src = basePath + charId;
  img.className = "char-image";

  setCharacterStyle(img, charId);

  slot.appendChild(img);
  slot.classList.add("active");
}

// ▼ --vh の再計算（iOS対策）
function setVhVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
