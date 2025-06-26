// script.js - 修正版（モバイル縦active切替＆メニュー安定）
let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 2000;
let bgm = null;
let lastActiveSide = null;
let textBuffer = "";
let isPlaying = false;
let currentSpeed = 40;
let menuVisible = true;
let doubleTapTimer = null;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const dialogueBox = document.getElementById("dialogue-box");
const menuPanel = document.getElementById("menu-panel");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
    charSlots[pos].classList.remove("active");
  }
}

function setTextWithSpeed(text, speed, callback) {
  isPlaying = true;
  textBuffer = text;
  textEl.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    if (i >= text.length) {
      clearInterval(interval);
      isPlaying = false;
      if (callback) callback();
    } else {
      textEl.innerHTML += text[i++];
    }
  }, speed);
}

function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || {};
  const fontSize = scene.fontSize || style.fontSize || "1em";
  currentSpeed = scene.speed || style.speed || 40;
  document.documentElement.style.setProperty("--fontSize", fontSize);
}

async function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    await window.effects[effectName](el);
  } else if (window.effects?.fadein) {
    await window.effects.fadein(el);
  }
}

async function showScene(scene) {
  if (!scene) return;

  nameEl.textContent = "";
  textEl.innerHTML = "";
  choicesEl.innerHTML = "";
  clearCharacters();

  if (scene.bg) {
    await applyEffect(bgEl, scene.bgEffect || "fadeout");
    await new Promise((resolve) => {
      bgEl.onload = resolve;
      bgEl.src = config.bgPath + scene.bg;
    });
    await applyEffect(bgEl, scene.bgEffect || "fadein");
  }

  if (scene.bgm !== undefined) {
    if (bgm) bgm.pause();
    bgm = scene.bgm ? new Audio(config.bgmPath + scene.bgm) : null;
    if (bgm) {
      bgm.loop = true;
      bgm.muted = true; // 初期ミュート
      bgm.play();
    }
  }

  if (scene.characters) {
    lastActiveSide = scene.characters[scene.characters.length - 1]?.side || null;
    for (const pos of ["left", "center", "right"]) {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      slot.classList.remove("active");
      slot.innerHTML = "";

      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");
        slot.appendChild(img);
        await applyEffect(img, charData.effect || "fadein");

        if (isMobilePortrait()) {
          if (pos === lastActiveSide) slot.classList.add("active");
        } else {
          slot.classList.add("active");
        }
      }
    }
  }

  if (scene.name !== undefined && scene.text !== undefined) {
    nameEl.textContent = scene.name;
    nameEl.style.color = characterColors[scene.name] || "#c0c0c0";
    setCharacterStyle(scene.name, scene);
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAuto) setTimeout(() => !isPlaying && next(), autoWait);
    });
  }

  if (scene.voice) {
    const voice = new Audio(config.voicePath + scene.voice);
    voice.muted = true;
    voice.play().catch(() => {});
  }

  if (scene.se) {
    const se = new Audio(config.sePath + scene.se);
    se.muted = true;
    se.play().catch(() => {});
  }

  if (scene.choices) {
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        nameEl.textContent = "";
        textEl.innerHTML = "";
        clearCharacters();
        if (choice.jump) loadScenario(choice.jump);
        else if (choice.url) location.href = choice.url;
      };
      choicesEl.appendChild(btn);
    });
  }
}

function next() {
  fetch(config.scenarioPath + currentScenario)
    .then((res) => res.json())
    .then((data) => {
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
    .then((res) => res.json())
    .then((data) => {
      showScene(data.scenes[0]);
    });
}

function loadMenu(filename = "menu01.json") {
  fetch(config.menuPath + filename)
    .then((res) => res.json())
    .then((data) => {
      showMenu(data);
    });
}

function showMenu(data) {
  menuPanel.innerHTML = "";
  data.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      menuPanel.classList.add("hidden");
      menuVisible = false;
      handleMenuAction(item);
    };
    menuPanel.appendChild(btn);
  });
  menuPanel.classList.remove("hidden");
  menuVisible = true;
}

function handleMenuAction(item) {
  if (item.action === "auto") {
    setTimeout(() => (isAuto = true), 1750);
  } else if (item.action === "mute") {
    if (bgm) bgm.muted = true;
    document.querySelectorAll("audio").forEach((a) => (a.muted = true));
  } else if (item.action === "jump" && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    loadMenu(item.menu);
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  }
}

// ▼▼▼ ダブルクリック・ダブルタップでメニュー切替 ▼▼▼
function setupDoubleClickMenu() {
  let lastTap = 0;

  function toggleMenu() {
    if (menuVisible) {
      menuPanel.classList.add("hidden");
      menuVisible = false;
    } else {
      loadMenu("menu01.json");
    }
  }

  bgEl.addEventListener("dblclick", toggleMenu);

  bgEl.addEventListener("touchend", (e) => {
    const now = new Date().getTime();
    if (now - lastTap < 300) {
      e.preventDefault();
      toggleMenu();
    }
    lastTap = now;
  });
}

// ▼▼▼ テキストボックスクリック ▼▼▼
dialogueBox.addEventListener("click", () => {
  if (menuVisible || choicesEl.children.length > 0) return;
  if (isPlaying) {
    isPlaying = false;
    textEl.innerHTML = textBuffer;
  } else {
    next();
  }
});

window.addEventListener("load", () => {
  setVhVariable();
  loadScenario(currentScenario);
  setupDoubleClickMenu();
});

function setVhVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
window.addEventListener("resize", setVhVariable);
