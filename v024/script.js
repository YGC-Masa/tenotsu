// script.js - v023 メニュー対応版（audioMuted 全種適用）

let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 2000;
let bgm = null;
let lastActiveSide = null;
let audioMuted = true; // 初期状態で全オーディオをミュート

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

const menuContainer = document.createElement("div");
menuContainer.className = "menu-panel";
document.body.appendChild(menuContainer);

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

function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || characterStyles[""];
  const fontSize = scene.fontSize || style.fontSize || defaultFontSize;
  currentSpeed = scene.speed || style.speed || defaultSpeed;
  document.documentElement.style.setProperty("--fontSize", fontSize);
}

function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

async function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    return await window.effects[effectName](el);
  } else {
    return await window.effects.fadein(el);
  }
}

function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
    charSlots[pos].classList.remove("active");
  }
  lastActiveSide = null;
}

async function showScene(scene) {
  if (!scene) return;

  // 背景
  if (scene.bg) {
    await applyEffect(bgEl, scene.bgEffect || "fadeout");
    await new Promise(resolve => {
      bgEl.onload = resolve;
      bgEl.src = config.bgPath + scene.bg;
    });
    await applyEffect(bgEl, scene.bgEffect || "fadein");
  }

  // BGM
  if (scene.bgm !== undefined) {
    if (bgm) {
      bgm.pause();
      bgm = null;
    }
    if (scene.bgm) {
      bgm = new Audio(config.bgmPath + scene.bgm);
      bgm.loop = true;
      bgm.muted = audioMuted;
      bgm.play();
    }
  }

  // キャラ表示
  if (scene.characters) {
    lastActiveSide = scene.characters[scene.characters.length - 1]?.side || null;
    for (const pos of ["left", "center", "right"]) {
      const slot = charSlots[pos];
      const charData = scene.characters.find(c => c.side === pos);
      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");
        slot.innerHTML = "";
        slot.appendChild(img);
        await applyEffect(img, charData.effect || "fadein");
        if (isMobilePortrait()) {
          slot.classList.toggle("active", pos === lastActiveSide);
        } else {
          slot.classList.add("active");
        }
      } else {
        slot.innerHTML = "";
        slot.classList.remove("active");
      }
    }
  }

  // 名前とテキスト
  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || characterColors[""] || "#C0C0C0";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;
    setCharacterStyle(scene.name, scene);
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAuto) {
        setTimeout(() => {
          if (!isPlaying) next();
        }, autoWait);
      }
    });
  }

  // Voice
  if (scene.voice) {
    try {
      const voice = new Audio(config.voicePath + scene.voice);
      voice.muted = audioMuted;
      voice.play();
    } catch (e) {
      console.warn("ボイス再生エラー:", scene.voice);
    }
  }

  // SE
  if (scene.se) {
    try {
      const se = new Audio(config.sePath + scene.se);
      se.muted = audioMuted;
      se.play();
    } catch (e) {
      console.warn("SE再生エラー:", scene.se);
    }
  }

  // 選択肢
  if (scene.choices) {
    choicesEl.innerHTML = "";
    scene.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        textEl.innerHTML = "";
        nameEl.textContent = "";
        clearCharacters();
        if (choice.jump) loadScenario(choice.jump);
        else if (choice.url) location.href = choice.url;
      };
      choicesEl.appendChild(btn);
    });
  } else {
    choicesEl.innerHTML = "";
  }
}

function next() {
  fetch(config.scenarioPath + currentScenario)
    .then(res => res.json())
    .then(data => {
      currentIndex++;
      if (currentIndex < data.scenes.length) {
        showScene(data.scenes[currentIndex]);
      }
    });
}

function loadScenario(filename) {
  currentScenario = filename;
  currentIndex = 0;
  clearCharacters();
  fetch(config.scenarioPath + filename)
    .then(res => res.json())
    .then(data => showScene(data.scenes[0]));
}

// ダブルクリックでメニュー
bgEl.addEventListener("dblclick", () => loadMenu("menu01.json"));

// シングルクリックで進行/オートOFF
document.addEventListener("click", () => {
  if (!isAuto && choicesEl.children.length === 0 && !isPlaying) {
    next();
  } else if (isAuto && choicesEl.children.length === 0 && !isPlaying) {
    isAuto = false;
  }
});

window.addEventListener("load", () => {
  loadScenario(currentScenario);
  setVhVariable();
});

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
window.addEventListener("resize", setVhVariable);

// メニュー読み込み＆表示
async function loadMenu(filename = "menu01.json") {
  try {
    const res = await fetch(config.menuPath + filename);
    const data = await res.json();
    showMenu(data);
  } catch (e) {
    console.error("メニュー読み込みエラー:", e);
  }
}

function showMenu(menuData) {
  menuContainer.innerHTML = "";
  menuData.items.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      handleMenuAction(item);
      // メニューは常時表示中
    };
    menuContainer.appendChild(btn);
  });
}

function handleMenuAction(item) {
  if (item.action === "auto") {
    isAuto = true;
  } else if (item.action === "mute") {
    audioMuted = true;
    if (bgm) bgm.muted = true;
  } else if (item.action === "unmute") {
    audioMuted = false;
    if (bgm) bgm.muted = false;
  } else if (item.action === "jump" && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    loadMenu(item.menu);
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  }
}
