function setVhVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
setVhVariable();
window.addEventListener("resize", setVhVariable);

// セリフをスピード付きで表示
function setTextWithSpeed(text, callback) {
  const textElement = document.getElementById("text");
  textElement.innerHTML = "";
  let i = 0;

  function typeChar() {
    if (i < text.length) {
      textElement.innerHTML += text[i++];
      setTimeout(typeChar, 30); // 1文字ごとのスピード調整
    } else if (callback) {
      callback();
    }
  }

  typeChar();
}

// キャラスタイル適用（透明度や反転等）
function setCharacterStyle(charImg, charId) {
  if (!window.characterStyles || !window.characterStyles[charId]) return;

  const style = window.characterStyles[charId];

  if (style.opacity !== undefined) {
    charImg.style.opacity = style.opacity;
  }

  if (style.scaleX !== undefined) {
    charImg.style.transform = `scaleX(${style.scaleX})`;
  }
}

// キャラ全消去
function clearCharacters() {
  ["left", "center", "right"].forEach((pos) => {
    const slot = document.getElementById(`char-${pos}`);
    slot.innerHTML = "";
    slot.classList.remove("active");
  });
}

// キャラ表示
function updateCharacterDisplay(position, charId) {
  const slot = document.getElementById(`char-${position}`);
  if (!slot) return;

  slot.classList.add("active");
  const img = document.createElement("img");
  img.src = `./characters/${charId}`;
  img.className = "char-image";

  const color = window.characterColors?.[charId] || "#FFFFFF";
  img.style.border = `2px solid ${color}`;

  setCharacterStyle(img, charId);
  slot.innerHTML = "";
  slot.appendChild(img);
}
