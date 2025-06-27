let currentScenario = "000start.json";
let currentIndex = 0;
let bgm = null;
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

let currentSpeed = 40;
let isPlaying = false;
let timeoutID = null;
let audioMuted = true;

// 📱 モバイル縦表示かどうか判定
function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

// キャラ表示状態を更新（縦：最後の一人／横：全員）
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

window.addEventListener("resize", updateCharacterDisplay);

function clearCharacters() {
  for (const pos in charSlots) {
    const slot = charSlots[pos];
    slot.innerHTML = "";
    slot.classList.remove("active");
  }
  lastActiveSide = null;
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
  const style = characterStyles[name] || {};
  const fontSize = scene.fontSize || style.fontSize || "1em";
  currentSpeed = scene.speed || style.speed || 40;
  document.documentElement.style.setProperty("--fontSize", fontSize);
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
      bgm.muted = audioMuted;
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
    const color = characterColors[scene.name] || "#C0C0C0";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;
    setCharacterStyle(scene.name, scene);
    setTextWithSpeed(scene.text, currentSpeed);
  }

  if (scene.voice) {
    try {
      const voice = new Audio(config.voicePath + scene.voice);
      voice.muted = audioMuted;
      voice.play();
    } catch (e) {
      console.warn("ボイス再生エラー:", scene.voice);
    }
  }

  if (scene.se) {
    try {
      const se = new Audio(config.sePath + scene.se);
      se.muted = audioMuted;
      se.play();
    } catch (e) {
      console.warn("SE再生エラー:", scene.se);
    }
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
  nameEl.textContent = "";
  textEl.innerHTML = "";
  clearCharacters();
  fetch(config.scenarioPath + filename)
    .then((res) => res.json())
    .then((data) => {
      showScene(data.scenes[0]);
    });
}

// ▼▼▼ メニュー処理 ▼▼▼
function handleMenuAction(item) {
  if (item.action === "mute") {
    audioMuted = true;
    if (bgm) bgm.muted = true;
    document.querySelectorAll("audio").forEach((a) => (a.muted = true));
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
  clearTimeout(timeoutID);
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
  timeoutID = setTimeout(() => menuPanel.classList.add("hidden"), 5000);
}

// ▼▼▼ イベント ▼▼▼
bgEl.addEventListener("click", () => {
  next();
});

bgEl.addEventListener("dblclick", () => {
  showMenuFromToggle();
});

function showMenuFromToggle() {
  if (!menuPanel.classList.contains("hidden")) {
    menuPanel.classList.add("hidden");
    clearTimeout(timeoutID);
  } else {
    loadMenu("menu01.json");
  }
}

document.getElementById("dialogue-box").addEventListener("click", () => {
  if (isPlaying) {
    currentSpeed = 0;
  } else {
    next();
  }
});

window.addEventListener("load", () => {
  loadScenario(currentScenario);
});
