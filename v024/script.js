let currentScenario = "000start.json";
let currentIndex = 0;
let bgm = null;
let lastActiveSide = null;
let isPlaying = false;
let currentSpeed = 40;
let defaultFontSize = "1em";

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
window.addEventListener("resize", () => {
  setVhVariable();
  updateCharacterDisplay();
});

function updateCharacterDisplay() {
  const isPortrait = isMobilePortrait();
  for (const pos in charSlots) {
    const slot = charSlots[pos];
    if (isPortrait) {
      slot.classList.toggle("active", pos === lastActiveSide);
    } else {
      if (slot.children.length > 0) {
        slot.classList.add("active");
      } else {
        slot.classList.remove("active");
      }
    }
  }
}

function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || characterStyles[""];
  const fontSize = scene.fontSize || style.fontSize || defaultFontSize;
  currentSpeed = scene.speed || style.speed || 40;
  document.documentElement.style.setProperty("--fontSize", fontSize);
}

function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
    charSlots[pos].classList.remove("active");
  }
  lastActiveSide = null;
}

async function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    return await window.effects[effectName](el);
  } else if (window.effects?.fadein) {
    return await window.effects.fadein(el);
  }
}

async function showScene(scene) {
  if (!scene) return;

  // 背景
  if (scene.bg) {
    await applyEffect(bgEl, scene.bgEffect || "fadeout");
    await new Promise((resolve) => {
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
      bgm.play();
    }
  }

  // キャラ表示
  if (scene.characters) {
    lastActiveSide = scene.characters[scene.characters.length - 1]?.side || null;

    for (const pos of ["left", "center", "right"]) {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.className = "char-image";
        slot.innerHTML = "";
        slot.appendChild(img);
        await applyEffect(img, charData.effect || "fadein");

        const isPortrait = isMobilePortrait();
        slot.classList.toggle("active", isPortrait ? pos === lastActiveSide : true);
      } else {
        slot.innerHTML = "";
        slot.classList.remove("active");
      }
    }
  }

  // セリフ
  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || "#C0C0C0";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;
    setCharacterStyle(scene.name, scene);
    setTextWithSpeed(scene.text, currentSpeed);
  }

  // ボイス・SE
  if (scene.voice) {
    try {
      const voice = new Audio(config.voicePath + scene.voice);
      voice.play();
    } catch (e) {
      console.warn("ボイスエラー:", e);
    }
  }
  if (scene.se) {
    try {
      const se = new Audio(config.sePath + scene.se);
      se.play();
    } catch (e) {
      console.warn("SEエラー:", e);
    }
  }

  // 選択肢
  if (scene.choices) {
    choicesEl.innerHTML = "";
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        clearCharacters();
        nameEl.textContent = "";
        textEl.textContent = "";
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

function setTextWithSpeed(text, speed) {
  isPlaying = true;
  textEl.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(interval);
      isPlaying = false;
    }
  }, speed);
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

document.addEventListener("click", () => {
  if (!isPlaying && choicesEl.children.length === 0) {
    next();
  }
});

bgEl.addEventListener("dblclick", () => {
  loadMenu("menu01.json");
});

window.addEventListener("load", () => {
  setVhVariable();
  loadScenario(currentScenario);
});

// メニュー処理
const menuContainer = document.getElementById("menu-panel");

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
  menuContainer.classList.remove("hidden");
  menuData.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      menuContainer.classList.add("hidden");
      handleMenuAction(item);
    };
    menuContainer.appendChild(btn);
  });
}

function handleMenuAction(item) {
  if (item.action === "jump" && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    loadMenu(item.menu);
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  } else if (item.action === "mute") {
    if (bgm) bgm.muted = true;
    document.querySelectorAll("audio").forEach((audio) => {
      audio.muted = true;
    });
  }
}
