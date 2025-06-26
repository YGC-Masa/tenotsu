// script.js - v023 メニュー＆モバイル対応強化
let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 2000;
let bgm = null;
let lastActiveSide = null;
let isPlaying = false;
let currentSpeed = 40;
let menuVisible = false;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
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

function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || {};
  const fontSize = scene.fontSize || style.fontSize || "1em";
  currentSpeed = scene.speed || style.speed || 40;
  document.documentElement.style.setProperty("--fontSize", fontSize);
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
      callback && callback();
    }
  }, speed);
}

async function applyEffect(el, effectName) {
  if (window.effects?.[effectName]) {
    return await window.effects[effectName](el);
  } else if (window.effects?.fadein) {
    return await window.effects.fadein(el);
  }
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
    if (bgm) bgm.pause();
    if (scene.bgm) {
      bgm = new Audio(config.bgmPath + scene.bgm);
      bgm.loop = true;
      bgm.muted = true;
      bgm.play();
    }
  }

  if (scene.characters) {
    lastActiveSide = scene.characters.at(-1)?.side || null;
    ["left", "center", "right"].forEach((pos) => {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");
        slot.innerHTML = "";
        slot.appendChild(img);
        if (isMobilePortrait()) {
          slot.classList.toggle("active", pos === lastActiveSide);
        } else {
          slot.classList.add("active");
        }
      } else {
        slot.innerHTML = "";
        slot.classList.remove("active");
      }
    });
  }

  if (scene.name !== undefined && scene.text !== undefined) {
    nameEl.textContent = scene.name;
    nameEl.style.color = characterColors[scene.name] || "#C0C0C0";
    setCharacterStyle(scene.name, scene);
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAuto) {
        setTimeout(() => {
          if (!isPlaying) next();
        }, autoWait);
      }
    });
  }

  if (scene.voice) {
    const voice = new Audio(config.voicePath + scene.voice);
    voice.muted = true;
    voice.play();
  }

  if (scene.se) {
    const se = new Audio(config.sePath + scene.se);
    se.muted = true;
    se.play();
  }

  if (scene.choices) {
    choicesEl.innerHTML = "";
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        clearCharacters();
        nameEl.textContent = "";
        textEl.innerHTML = "";
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
  nameEl.textContent = "";
  textEl.innerHTML = "";
  clearCharacters();
  fetch(config.scenarioPath + filename)
    .then((res) => res.json())
    .then((data) => showScene(data.scenes[0]));
}

function loadMenu(filename = "menu01.json") {
  fetch(config.menuPath + filename)
    .then((res) => res.json())
    .then((data) => {
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
    })
    .catch((e) => console.error("メニュー読み込みエラー:", e));
}

function handleMenuAction(item) {
  if (item.action === "auto") {
    setTimeout(() => { isAuto = true; }, 1750);
  } else if (item.action === "mute") {
    if (bgm) bgm.muted = true;
    document.querySelectorAll("audio").forEach(audio => audio.muted = true);
  } else if (item.action === "jump" && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    loadMenu(item.menu);
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  }
}

// テキストボックスクリックで進行またはスキップ
textEl.addEventListener("click", () => {
  if (menuVisible || choicesEl.children.length > 0) return;
  if (isPlaying) {
    const fullText = textEl.textContent;
    textEl.innerHTML = fullText;
    isPlaying = false;
  } else {
    nameEl.textContent = "";
    textEl.innerHTML = "";
    next();
  }
});

// ダブルクリック/ダブルタップでメニュー表示の ON/OFF
let lastTap = 0;
bgEl.addEventListener("click", (e) => {
  const now = Date.now();
  if (now - lastTap < 300) {
    if (menuVisible) {
      menuPanel.classList.add("hidden");
      menuVisible = false;
    } else {
      loadMenu("menu01.json");
    }
  }
  lastTap = now;
});

// 初期化
window.addEventListener("load", () => {
  loadScenario(currentScenario);
  setVhVariable();
});
function setVhVariable() {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}
window.addEventListener("resize", setVhVariable);
