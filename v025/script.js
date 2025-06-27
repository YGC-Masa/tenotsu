// script.js - v024 修正版
let currentScenario = "000start.json";
let currentIndex = 0;
let isPlaying = false;
let bgm = null;
let isMuted = true;
let lastActiveSide = null;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

const menuPanel = document.getElementById("menu-panel");
let tapCount = 0;
let tapTimer = null;

function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

function updateCharacterDisplay() {
  const isPortrait = isMobilePortrait();
  for (const pos in charSlots) {
    const slot = charSlots[pos];
    const hasImage = slot.querySelector("img") !== null;
    if (isPortrait) {
      slot.classList.toggle("active", hasImage && pos === lastActiveSide);
    } else {
      slot.classList.toggle("active", hasImage);
    }
  }
}

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
  const fontSize = scene.fontSize || style.fontSize || "1em";
  document.documentElement.style.setProperty("--fontSize", fontSize);
}

async function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    return await window.effects[effectName](el);
  } else if (window.effects?.fadein) {
    return await window.effects.fadein(el);
  }
}

function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
    charSlots[pos].classList.remove("active");
  }
  lastActiveSide = null;
  updateCharacterDisplay();
}

async function showScene(scene) {
  if (!scene) return;

  if (scene.bg) {
    await applyEffect(bgEl, scene.bgEffect || "fadeout");
    await new Promise((resolve) => {
      bgEl.onload = resolve;
      bgEl.src = config.bgPath + scene.bg;
    });
    await applyEffect(bgEl, scene.bgEffect || "fadein");
  }

  if (scene.bgm !== undefined) {
    if (bgm) {
      bgm.pause();
      bgm = null;
    }
    if (scene.bgm) {
      bgm = new Audio(config.bgmPath + scene.bgm);
      bgm.loop = true;
      bgm.muted = isMuted;
      bgm.play();
    }
  }

  if (scene.characters) {
    lastActiveSide = scene.characters[scene.characters.length - 1]?.side || null;

    for (const pos in charSlots) {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");
        slot.innerHTML = "";
        slot.appendChild(img);
        await applyEffect(img, charData.effect || "fadein");
      } else {
        slot.innerHTML = "";
      }
    }
    updateCharacterDisplay();
  }

  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || characterColors[""] || "#C0C0C0";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;
    setCharacterStyle(scene.name, scene);
    setTextWithSpeed(scene.text, characterStyles[scene.name]?.speed || 40);
  }

  if (scene.voice && !isMuted) {
    const voice = new Audio(config.voicePath + scene.voice);
    voice.play();
  }

  if (scene.se && !isMuted) {
    const se = new Audio(config.sePath + scene.se);
    se.play();
  }

  if (scene.choices) {
    choicesEl.innerHTML = "";
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        textEl.innerHTML = "";
        nameEl.textContent = "";
        clearCharacters();
        if (choice.jump) {
          loadScenario(choice.jump);
        } else if (choice.url) {
          location.href = choice.url;
        }
      };
      choicesEl.appendChild(btn);
    });
  } else {
    choicesEl.innerHTML = "";
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

function toggleMenu() {
  if (menuPanel.classList.contains("hidden")) {
    loadMenu("menu01.json");
  } else {
    menuPanel.classList.add("hidden");
  }
}

bgEl.addEventListener("click", () => {
  tapCount++;
  if (tapTimer) clearTimeout(tapTimer);
  tapTimer = setTimeout(() => {
    if (tapCount >= 2) toggleMenu();
    else if (!isPlaying && choicesEl.children.length === 0) next();
    tapCount = 0;
  }, 300);
});

document.getElementById("dialogue-box").addEventListener("click", () => {
  if (isPlaying) {
    isPlaying = false;
    const fullText = textEl.textContent;
    textEl.textContent = fullText;
  } else if (choicesEl.children.length === 0) {
    next();
  }
});

window.addEventListener("resize", updateCharacterDisplay);
window.addEventListener("load", () => {
  setVhVariable();
  loadScenario(currentScenario);
});

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

async function loadMenu(filename) {
  try {
    const res = await fetch(config.menuPath + filename);
    const data = await res.json();
    showMenu(data);
  } catch (e) {
    console.error("メニュー読み込みエラー:", e);
  }
}

function showMenu(menuData) {
  menuPanel.innerHTML = "";
  menuPanel.classList.remove("hidden");
  menuData.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      menuPanel.classList.add("hidden");
      handleMenuAction(item);
    };
    menuPanel.appendChild(btn);
  });
  setTimeout(() => menuPanel.classList.add("hidden"), 5000);
}

function handleMenuAction(item) {
  if (item.action === "mute") {
    isMuted = true;
    if (bgm) bgm.muted = true;
    document.querySelectorAll("audio").forEach(a => a.muted = true);
  } else if (item.action === "unmute") {
    isMuted = false;
    if (bgm) bgm.muted = false;
    document.querySelectorAll("audio").forEach(a => a.muted = false);
  } else if (item.action === "jump" && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    loadMenu(item.menu);
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  }
}
