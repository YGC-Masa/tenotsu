// script.js - v015-04 修正版

let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 2000; // オートモード時の待機時間（ミリ秒）
let bgm = null;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

let defaultFontSize = "1em";
let defaultSpeed = 40;
let currentSpeed = defaultSpeed;
let isPlaying = false;

function setTextWithSpeed(text, speed, callback) {
  isPlaying = true;
  textEl.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(interval);
      isPlaying = false;
      if (callback) callback();
    }
  }, speed);
}

function setCharacterStyle(name) {
  const style = characterStyles[name] || characterStyles[""];
  document.documentElement.style.setProperty("--fontSize", style.fontSize || defaultFontSize);
  currentSpeed = style.speed || defaultSpeed;
}

function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    window.effects[effectName](el);
  } else {
    window.effects?.fadein(el);
  }
}

async function showScene(scene) {
  if (!scene) return;

  // 背景切り替え
  if (scene.bg) {
    applyEffect(bgEl, scene.bgEffect || "fadeout");
    await new Promise((resolve) => setTimeout(resolve, 500));
    bgEl.src = config.bgPath + scene.bg;
    applyEffect(bgEl, scene.bgEffect || "fadein");
  }

  // BGM切り替え
  if (scene.bgm !== undefined) {
    if (bgm) {
      bgm.pause();
      bgm = null;
    }
    if (scene.bgm) {
      bgm = new Audio(config.bgmPath + scene.bgm);
      bgm.loop = true;
      bgm.play();
    }
  }

  // キャラクター表示
  if (scene.characters) {
    ["left", "center", "right"].forEach((pos) => {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      slot.innerHTML = "";

      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");
        slot.appendChild(img);
        applyEffect(img, charData.effect || "fadein");
      }
    });
  }

  // 名前とセリフ（空やundefinedの場合は空文字にフォールバック）
  if (scene.name !== undefined || scene.text !== undefined) {
    const safeName = scene.name || "";
    const safeText = scene.text || "";
    const color = characterColors[safeName] || "#FFFFFF";
    nameEl.textContent = safeName;
    nameEl.style.color = color;

    setCharacterStyle(safeName);
    setTextWithSpeed(safeText, currentSpeed, () => {
      if (isAuto) {
        setTimeout(() => {
          if (!isPlaying) next();
        }, autoWait);
      }
    });
  } else {
    // 名前・テキストが全くない場合はクリア
    nameEl.textContent = "";
    textEl
