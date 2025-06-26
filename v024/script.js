let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 2000;
let bgm = null;
let lastActiveSide = null;
let isMenuOpen = false;
let autoTimeoutID = null;
let lastTap = 0;

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

let defaultFontSize = "1em";
let defaultSpeed = 40;
let currentSpeed = defaultSpeed;
let isPlaying = false;
let skipText = false;

function setTextWithSpeed(text, speed, callback) {
  isPlaying = true;
  textEl.innerHTML = "";
  skipText = false;
  let i = 0;
  const interval = setInterval(() => {
    if (skipText) {
      textEl.innerHTML = text;
      clearInterval(interval);
      isPlaying = false;
      if (callback) callback();
      return;
    }
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
}

async function showScene(scene) {
  if (!scene) return;

  textEl.innerHTML = "";
  nameEl.textContent = "";
  choicesEl.innerHTML = "";

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
      bgm.muted = true; // デフォルトでミュート
      bgm.play();
    }
  }

  if (scene.characters) {
    lastActiveSide = scene.characters[scene.characters.length - 1]?.side || null;
    ["left", "center", "right"].forEach(async (pos) => {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
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
      } else if (charData && charData.src === "NULL") {
        slot.innerHTML = "";
        slot.classList.remove("active");
      }
    });
  }

  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || characterColors[""] || "#C0C0C0";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;
    setCharacterStyle(scene.name, scene);
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAuto) {
        autoTimeoutID = setTimeout(() => {
          if (!isPlaying) next();
        }, autoWait);
      }
    });
  }

  if (scene.voice) {
    try {
      const voice = new Audio(config.voicePath + scene.voice);
      voice.muted = true; // デフォルトでミュート
      voice.play();
    } catch (e) {
      console.warn("ボイス再生エラー:", scene.voice);
    }
  }

  if (scene.se) {
    try {
      const se = new Audio(config.sePath + scene.se);
      se.muted = true; // デフォルトでミュート
      se.play();
    } catch (e) {
      console.warn("SE再生エラー:", scene.se);
    }
  }

  if (scene.choices) {
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
  isMenuOpen = !isMenuOpen;
  menuPanel.classList.toggle("hidden", !isMenuOpen);
  if (isMenuOpen) {
    loadMenu("menu01.json");
  }
}

document.getElementById("text").addEventListener("click", () => {
  if (isMenuOpen) return;
  if (isPlaying) {
    skipText = true;
  } else if (!isAuto && choicesEl.children.length === 0) {
    textEl.innerHTML = "";
    nameEl.textContent = "";
    next();
  }
});

// PC向けダブルクリックでメニュー表示
bgEl.addEventListener("dblclick", toggleMenu);
charSlots.left.addEventListener("dblclick", toggleMenu);
charSlots.center.addEventListener("dblclick", toggleMenu);
charSlots.right.addEventListener("dblclick", toggleMenu);

// モバイル向けダブルタップでメニュー表示
function handleTouchTap(e) {
  const now = new Date().getTime();
  const delta = now - lastTap;
  if (delta < 400 && delta > 0) {
    toggleMenu();
    e.preventDefault();
  }
  lastTap = now;
}

bgEl.addEventListener("touchend", handleTouchTap);
charSlots.left.addEventListener("touchend", handleTouchTap);
charSlots.center.addEventListener("touchend", handleTouchTap);
charSlots.right.addEventListener("touchend", handleTouchTap);

// 起動時
window.addEventListener("load", () => {
  loadScenario(currentScenario);
  setVhVariable();
});

// ウィンドウリサイズ対応
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
  menuPanel.innerHTML = "";
  menuData.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      menuPanel.classList.add("hidden");
      isMenuOpen = false;
      handleMenuAction(item);
    };
    menuPanel.appendChild(btn);
  });
}

// メニューアクション処理
function handleMenuAction(item) {
  if (item.action === "auto") {
    if (autoTimeoutID) clearTimeout(autoTimeoutID);
    autoTimeoutID = setTimeout(() => { isAuto = true; }, 1750);
  } else if (item.action === "mute") {
    if (bgm) bgm.muted = true;
    document.querySelectorAll("audio").forEach((audio) => {
      audio.muted = true;
    });
  } else if (item.action === "jump" && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    loadMenu(item.menu);
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  }
}
