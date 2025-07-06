function setTextWithSpeed(text, callback) {
  const textArea = document.getElementById("text");
  textArea.innerText = "";
  let i = 0;

  function typeChar() {
    if (i < text.length) {
      textArea.innerText += text[i++];
      setTimeout(typeChar, 20); // 1文字20ms間隔
    } else if (typeof callback === "function") {
      callback();
    }
  }

  typeChar();
}

function setCharacterStyle(imgElement, charId) {
  if (!imgElement || !charId) return;

  // 色指定
  const color = window.characterColors?.[charId];
  if (color) {
    imgElement.style.filter = `drop-shadow(0 0 4px ${color})`;
  }

  // CSSスタイル指定
  const styleClass = window.characterStyles?.[charId];
  if (styleClass) {
    imgElement.classList.add(styleClass);
  }
}

function clearCharacters() {
  const slots = ["char-left", "char-center", "char-right"];
  slots.forEach((id) => {
    const slot = document.getElementById(id);
    if (slot) {
      slot.innerHTML = "";
      slot.classList.remove("active");
    }
  });
}

function updateCharacterDisplay(position, charId) {
  const slotId = `char-${position}`;
  const slot = document.getElementById(slotId);
  if (!slot) return;

  slot.innerHTML = "";

  const img = document.createElement("img");
  img.src = `./assets/char/${charId}`;
  img.className = "char-image";

  setCharacterStyle(img, charId);

  slot.appendChild(img);
  slot.classList.add("active");
}

// 画面高さを --vh に反映（iOS対応）
function setVhVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
