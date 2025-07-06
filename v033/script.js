let currentScenario = "000start.json";
let currentIndex = 0;
let bgm = null;
let lastActiveSide = null;
let isMuted = true;
let typingInterval = null;
let isAutoMode = false;
let autoWaitTime = 2000;
let isPlaying = false;
let currentSpeed = 40;
let defaultSpeed = 40;
let defaultFontSize = "1em";
let textAreaVisible = true;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const menuPanel = document.getElementById("menu-panel");
const listPanel = document.getElementById("list-panel");
const evLayer = document.getElementById("ev-layer");
const clickLayer = document.getElementById("click-layer");
const dialogueBox = document.getElementById("dialogue-box");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

function setTextWithSpeed(text, speed, callback) {
  if (typingInterval) clearInterval(typingInterval);
  isPlaying = true;
  textEl.innerHTML = "";
  let i = 0;
  typingInterval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(typingInterval);
      typingInterval = null;
      isPlaying = false;
      if (callback) callback();
      if (isAutoMode && choicesEl.children.length === 0) {
        setTimeout(() => {
          if (!isPlaying) next();
        }, autoWaitTime);
      }
    }
  }, speed);
}

function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || characterStyles[""];
  const fontSize = scene.fontSize || style.fontSize || defaultFontSize;
  currentSpeed = scene.speed || style.speed || defaultSpeed;
  document.documentElement.style.setProperty("--fontSize", fontSize);
}

function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
    charSlots[pos].classList.remove("active");
  }
  lastActiveSide = null;
}

function updateCharacterDisplay() {
  const isPortrait = isMobilePortrait();
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

async function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    return await window.effects[effectName](el);
  } else if (window.effects?.fadein) {
    return await window.effects.fadein(el);
  }
}

function updateTextAreaVisibility(show) {
  textAreaVisible = show;
  dialogueBox.classList.toggle("hidden", !show);
}

async function showScene(scene) {
  if (!scene) return;
  if (typingInterval) clearInterval(typingInterval);

  textEl.innerHTML = "";
  nameEl.textContent = "";
  evLayer.innerHTML = "";
  choicesEl.innerHTML = "";

  if (scene.textareashow !== undefined) {
    updateTextAreaVisibility(scene.textareashow);
  }

  if (scene.bg) {
    await applyEffect(bgEl, scene.bgEffect || "fadeout");
    await new Promise((resolve) => {
      bgEl.onload = resolve;
      bgEl.src = config.bgPath + scene.bg;
    });
    await applyEffect(bgEl, scene.bgEffect || "fadein");
  }

  if (scene.showev) {
    const evImg = document.createElement("img");
    evImg.src = config.evPath + scene.showev;
    evImg.cla
