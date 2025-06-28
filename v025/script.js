let currentScenario = "000start.json";
let currentIndex = 0;
let bgm = null;
let isMuted = true;
let lastActiveSide = null;

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

function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
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
      } else if (charData && charData.src === "NULL") {
        slot.innerHTML = "";
      }
    });
  }

  updateCharacterDisplay();

  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || "#C0C0C0";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;
    setCharacterStyle(scene.name, scene);
    setTextWithSpeed(scene.text, currentSpeed);
  }

  if (scene.voice) {
    const voice = new Audio(config.voicePath + scene.voice);
    voice.muted = isMuted;
    voice.play();
  }

  if (scene.se) {
    const se = new Audio(config.sePath + scene.se);
    se.muted = isMuted;
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

document.getElementById("bg-touch-surface").addEventListener("dblclick", () => {
  loadMenu("menu01.json");
});

document.addEventListener("click", (e) => {
  if (menuPanel && !menuPanel.classList.contains("hidden")) {
    menuPanel.classList.add("hidden");
    return;
  }

  if (!isPlaying && choicesEl.children.length === 0) {
    next();
  }
});

window.addEventListener("resize", () => {
  setVhVariable();
  updateCharacterDisplay();
});

window.addEventListener("load", () => {
  setVhVariable();
  loadScenario(currentScenario);
});

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

// ▼ メニュー機能
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

  // 1: 音声状態切替ボタンを上部に追加
  const soundBtn = document.createElement("button");
  soundBtn.textContent = isMuted ? "音声ONへ" : "音声OFFへ";
  soundBtn.onclick = () => {
    isMuted = !isMuted;
    if (bgm) bgm.muted = isMuted;
    document.querySelectorAll("audio").forEach((audio) => {
      audio.muted = isMuted;
    });
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(soundBtn);

  // 2: 残りのメニュー
  menuData.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      menuPanel.classList.add("hidden");
      handleMenuAction(item);
    };
    menuPanel.appendChild(btn);
  });

  menuPanel.classList.remove("hidden");
}

function handleMenuAction(item) {
  if (item.action === "jump" && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    loadMenu(item.menu);
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  }
}
