let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 2000;
let bgm = null;
let lastActiveSide = null;
let isPlaying = false;
let textBuffer = "";
let currentSpeed = 40;
let menuVisible = true;
let defaultFontSize = "1em";
let defaultSpeed = 40;
let menuTimeoutID = null;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const dialogueBox = document.getElementById("dialogue-box");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

const menuContainer = document.getElementById("menu-panel");

function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

function setVhVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", () => {
  setVhVariable();
  updateCharacterVisibility();
});

function updateCharacterVisibility() {
  const isPortrait = isMobilePortrait();
  for (const pos in charSlots) {
    const slot = charSlots[pos];
    if (isPortrait) {
      slot.classList.toggle("active", pos === lastActiveSide);
    } else {
      if (slot.innerHTML.trim() !== "") {
        slot.classList.add("active");
      }
    }
  }
}

function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || characterStyles[""];
  const fontSize = scene.fontSize || style.fontSize || defaultFontSize;
  currentSpeed = scene.speed || style.speed || defaultSpeed;
  document.documentElement.style.setProperty("--fontSize", fontSize);
}

function setTextWithSpeed(text, speed, callback) {
  isPlaying = true;
  textEl.innerHTML = "";
  let i = 0;
  textBuffer = text;
  const interval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(interval);
      isPlaying = false;
      textBuffer = "";
      if (callback) callback();
    }
  }, speed);
}

async function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    await window.effects[effectName](el);
  } else if (window.effects?.fadein) {
    await window.effects.fadein(el);
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
      bgm.muted = true; // 初期はミュート
      bgm.play();
    }
  }

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

  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || "#C0C0C0";
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

  if (scene.voice) {
    const voice = new Audio(config.voicePath + scene.voice);
    voice.muted = true; // 初期はミュート
    voice.play();
  }

  if (scene.se) {
    const se = new Audio(config.sePath + scene.se);
    se.muted = true; // 初期はミュート
    se.play();
  }

  if (scene.choices) {
    choicesEl.innerHTML = "";
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
  nameEl.textContent = "";
  textEl.innerHTML = "";
  clearCharacters();
  fetch(config.scenarioPath + filename)
    .then(res => res.json())
    .then(data => showScene(data.scenes[0]));
}

function toggleMenu() {
  menuVisible = !menuVisible;
  menuContainer.classList.toggle("hidden", !menuVisible);
  if (menuVisible) {
    clearTimeout(menuTimeoutID);
    menuTimeoutID = setTimeout(() => {
      menuContainer.classList.add("hidden");
      menuVisible = false;
    }, 5000);
  }
}

// ダブルクリック or ダブルタップでメニュー切り替え
let lastTap = 0;
bgEl.addEventListener("dblclick", toggleMenu);
bgEl.addEventListener("touchend", (e) => {
  const now = new Date().getTime();
  if (now - lastTap < 300) {
    toggleMenu();
  }
  lastTap = now;
});

// テキストボックスクリックで進行
dialogueBox.addEventListener("click", () => {
  if (menuVisible || choicesEl.children.length > 0) return;

  if (isPlaying && textBuffer) {
    textEl.innerHTML = textBuffer;
    isPlaying = false;
    textBuffer = "";
  } else if (!isPlaying && !textBuffer) {
    next();
  }
});

// 初期化
window.addEventListener("load", () => {
  setVhVariable();
  loadScenario(currentScenario);
});

// ▼▼▼ メニュー処理 ▼▼▼
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
  menuData.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      menuContainer.classList.add("hidden");
      menuVisible = false;
      handleMenuAction(item);
    };
    menuContainer.appendChild(btn);
  });
  menuVisible = true;
  menuContainer.classList.remove("hidden");
  clearTimeout(menuTimeoutID);
  menuTimeoutID = setTimeout(() => {
    menuContainer.classList.add("hidden");
    menuVisible = false;
  }, 5000);
}

function handleMenuAction(item) {
  switch (item.action) {
    case "auto":
      setTimeout(() => { isAuto = true; }, 1750);
      break;
    case "mute":
      if (bgm) bgm.muted = true;
      document.querySelectorAll("audio").forEach(audio => {
        audio.muted = true;
      });
      break;
    case "jump":
      if (item.jump) loadScenario(item.jump);
      break;
    case "menu":
      if (item.menu) loadMenu(item.menu);
      break;
    case "url":
      if (item.url) location.href = item.url;
      break;
  }
}
