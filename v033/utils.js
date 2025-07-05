let currentScenario = "000start.json";
let currentIndex = 0;
let bgm = null;
let isMuted = true;

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

// === シナリオ読み込みと表示 ===
async function showScene(scene) {
  if (!scene) return;
  if (typingInterval) clearInterval(typingInterval);

  // 初期化
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
    evImg.classList.add("ev-image");
    evImg.onload = () => applyEffect(evImg, scene.evEffect || "fadein");
    evLayer.appendChild(evImg);
  }

  if (scene.showcg) {
    const cgImg = document.createElement("img");
    cgImg.src = config.cgPath + scene.showcg;
    cgImg.classList.add("cg-image");
    cgImg.onload = () => applyEffect(cgImg, scene.cgEffect || "fadein");
    evLayer.appendChild(cgImg);
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
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        clearCharacters();
        textEl.innerHTML = "";
        nameEl.textContent = "";
        evLayer.innerHTML = "";
        if (choice.jump) {
          loadScenario(choice.jump);
        } else if (choice.url) {
          location.href = choice.url;
        }
      };
      choicesEl.appendChild(btn);
    });
  }

  if (scene.showmenu) {
    loadMenu(scene.showmenu);
  }

  if (scene.showlist) {
    loadList(scene.showlist);
  }

  if (scene.command === "randomimageson") {
    randomImagesOn();
  }

  if (scene.command === "randomimagesoff") {
    randomImagesOff();
  }

  if (scene.auto && scene.choices === undefined && scene.text === undefined) {
    setTimeout(() => {
      if (!isPlaying) next();
    }, autoWaitTime);
  }
}

function next() {
  fetch(config.scenarioPath + currentScenario + "?t=" + Date.now())
    .then((res) => res.json())
    .then((data) => {
      currentIndex++;
      if (currentIndex < data.scenes.length) {
        showScene(data.scenes[currentIndex]);
      } else {
        if (textAreaVisible) {
          nameEl.textContent = "";
          textEl.innerHTML = "（物語は つづく・・・）";
        }
        isAutoMode = false;
      }
    });
}

function loadScenario(filename) {
  currentScenario = filename;
  currentIndex = 0;
  clearCharacters();
  textEl.innerHTML = "";
  nameEl.textContent = "";
  evLayer.innerHTML = "";
  listPanel.classList.add("hidden");
  menuPanel.classList.add("hidden");
  if (typingInterval) clearInterval(typingInterval);
  updateTextAreaVisibility(true);

  fetch(config.scenarioPath + filename + "?t=" + Date.now())
    .then((res) => res.json())
    .then((data) => {
      showScene(data.scenes[0]);
    });
}

// === イベント処理 ===
window.addEventListener("resize", () => {
  setVhVariable();
  updateCharacterDisplay();
});

window.addEventListener("load", () => {
  setVhVariable();
  loadScenario(currentScenario);
});

// === クリック・タッチ制御 ===
clickLayer.addEventListener("dblclick", () => {
  const isMenuOpen = !menuPanel.classList.contains("hidden");
  const isListOpen = !listPanel.classList.contains("hidden");

  if (isMenuOpen) {
    menuPanel.classList.add("hidden");
  } else {
    menuPanel.classList.remove("hidden");
  }
});

let lastTouch = 0;
clickLayer.addEventListener("touchend", () => {
  const now = Date.now();
  if (now - lastTouch < 300) {
    menuPanel.classList.toggle("hidden");
  }
  lastTouch = now;
});

clickLayer.addEventListener("click", () => {
  if (!menuPanel.classList.contains("hidden")) {
    menuPanel.classList.add("hidden");
    return;
  }
  if (!isPlaying && choicesEl.children.length === 0) {
    next();
  }
});
