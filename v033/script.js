let currentScenario = "000start.json";
let currentIndex = 0;
let bgm = null;
let lastActiveSide = null;
let isMuted = true;
let typingInterval = null;
let isAutoMode = false;
let autoWaitTime = 2000;
let isPlaying = false;
let currentSpeed = 40;
let defaultSpeed = 40;
let defaultFontSize = "1em";
let textAreaVisible = true;
let isSceneTransitioning = false;

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

function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

function updateTextAreaVisibility(show) {
  textAreaVisible = show;
  dialogueBox.classList.toggle("hidden", !show);
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
function setTextWithSpeed(text, speed, callback) {
  if (typingInterval) clearInterval(typingInterval);
  isPlaying = true;
  textEl.innerHTML = "";
  let i = 0;
  typingInterval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(typingInterval);
      typingInterval = null;
      isPlaying = false;
      if (callback) callback();
      if (isAutoMode && choicesEl.children.length === 0) {
        setTimeout(() => {
          if (!isPlaying) next();
        }, autoWaitTime);
      }
    }
  }, speed);
}

function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || characterStyles[""];
  const fontSize = scene.fontSize || style.fontSize || defaultFontSize;
  currentSpeed = scene.speed || style.speed || defaultSpeed;
  document.documentElement.style.setProperty("--fontSize", fontSize);
}

async function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    return await window.effects[effectName](el);
  } else if (window.effects?.fadein) {
    return await window.effects.fadein(el);
  }
}
async function showScene(scene) {
  if (!scene || isSceneTransitioning) return;
  isSceneTransitioning = true;

  if (typingInterval) clearInterval(typingInterval);
  textEl.innerHTML = "";
  nameEl.textContent = "";
  evLayer.innerHTML = "";
  choicesEl.innerHTML = "";

  if (scene.textareashow !== undefined) {
    updateTextAreaVisibility(scene.textareashow);
  }

  if (scene.randomimageson) {
    randomImagesOn();
  }
  
  if (scene.randomimagesoff) {
    randomImagesOff();
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

  if (scene.auto && scene.choices === undefined && scene.text === undefined) {
    setTimeout(() => {
      if (!isPlaying) next();
    }, autoWaitTime);
  }

  isSceneTransitioning = false;
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

function setVhVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", () => {
  setVhVariable();
  updateCharacterDisplay();
});
window.addEventListener("load", () => {
  setVhVariable();
  loadScenario(currentScenario);
});
async function loadMenu(filename = "menu01.json") {
  const res = await fetch(config.menuPath + filename + "?t=" + Date.now());
  const data = await res.json();
  showMenu(data);
}

function showMenu(menuData) {
  menuPanel.innerHTML = "";
  menuPanel.classList.remove("hidden");

  // 音声ON/OFF
  const audioStateBtn = document.createElement("button");
  audioStateBtn.textContent = isMuted ? "音声ONへ" : "音声OFFへ";
  audioStateBtn.onclick = () => {
    isMuted = !isMuted;
    if (bgm) bgm.muted = isMuted;
    document.querySelectorAll("audio").forEach((a) => (a.muted = isMuted));
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(audioStateBtn);

  // オートモード
  const autoBtn = document.createElement("button");
  autoBtn.textContent = isAutoMode ? "オートモードOFF" : "オートモードON";
  autoBtn.onclick = () => {
    isAutoMode = !isAutoMode;
    if (isAutoMode) {
      textEl.innerHTML = "(AutoMode On 3秒後開始)";
      setTimeout(() => {
        textEl.innerHTML = "";
        setTimeout(() => {
          if (!isPlaying && choicesEl.children.length === 0) next();
        }, autoWaitTime);
      }, 1000);
    } else {
      textEl.innerHTML = "(AutoMode Off)";
      setTimeout(() => {
        textEl.innerHTML = "";
      }, 1000);
    }
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(autoBtn);

  // 全画面ON/OFF
  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.textContent = document.fullscreenElement ? "全画面OFF" : "全画面ON";
  fullscreenBtn.onclick = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(fullscreenBtn);

  // メニュー内の項目
  menuData.items.forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      menuPanel.classList.add("hidden");
      handleMenuAction(item);
    };
    menuPanel.appendChild(btn);
  });
}
async function loadList(filename = "list01.json") {
  const res = await fetch(config.listPath + filename + "?t=" + Date.now());
  const data = await res.json();
  showList(data);
}

function showList(listData) {
  listPanel.innerHTML = "";
  listPanel.classList.remove("hidden");

  listData.items.slice(0, 7).forEach((item) => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      listPanel.classList.add("hidden");
      handleMenuAction(item);
    };
    listPanel.appendChild(btn);
  });

  // リストパネル最前面強調（z-indexを一度リセット）
  listPanel.style.zIndex = "12";
  setTimeout(() => {
    listPanel.style.zIndex = "11";
  }, 200); // 軽い遅延を挟むことで競合回避
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
let lastTouch = 0;

// ダブルクリック：メニュー表示のON/OFF（リストが開いていてもメニューは操作可能）
clickLayer.addEventListener("dblclick", () => {
  const menuVisible = !menuPanel.classList.contains("hidden");
  const listVisible = !listPanel.classList.contains("hidden");

  if (menuVisible) {
    // メニューが開いてる → 閉じる（リストが開いてても関係なし）
    menuPanel.classList.add("hidden");
  } else {
    // メニューが閉じていて：
    // ・リストが開いてる → メニューだけ開く
    // ・両方閉じている → メニュー開く
    menuPanel.classList.remove("hidden");
    loadMenu("menu01.json");
  }
});

// タッチ時：ダブルタップ検出
clickLayer.addEventListener("touchend", () => {
  const now = Date.now();
  if (now - lastTouch < 300) {
    clickLayer.dispatchEvent(new Event("dblclick"));
  }
  lastTouch = now;
});

// 通常クリック：次のシーンへ（ただしメニューが開いてるときは閉じる）
clickLayer.addEventListener("click", () => {
  if (!menuPanel.classList.contains("hidden")) {
    menuPanel.classList.add("hidden");
    return;
  }
  if (!isPlaying && choicesEl.children.length === 0) {
    next();
  }
});
