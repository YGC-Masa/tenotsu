// config.jsの読み込み前提。configはグローバル変数で利用する。

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

// --- テキストの文字送り ---
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

// --- キャラクタースタイル設定 ---
function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || characterStyles[""];
  const fontSize = scene.fontSize || style.fontSize || defaultFontSize;
  currentSpeed = scene.speed || style.speed || defaultSpeed;
  document.documentElement.style.setProperty("--fontSize", fontSize);
  // 文字色をセット
  const color = style.color || "#C0C0C0";
  nameEl.style.color = color;
}

// --- キャラクター表示クリア ---
function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
    charSlots[pos].classList.remove("active");
  }
  lastActiveSide = null;
}

// --- キャラ表示更新 ---
function updateCharacterDisplay() {
  const isPortrait = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
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

// --- エフェクト適用（Promiseで同期処理） ---
function applyEffect(el, effectName) {
  return new Promise((resolve) => {
    if (window.effects && effectName && window.effects[effectName]) {
      window.effects[effectName](el);
      // 0.5秒後にresolve
      setTimeout(resolve, 500);
    } else {
      resolve();
    }
  });
}

// --- テキストエリア表示制御 ---
function updateTextAreaVisibility(show) {
  textAreaVisible = show;
  dialogueBox.classList.toggle("hidden", !show);
}

// --- シーン表示 ---
async function showScene(scene) {
  if (!scene) return;
  if (typingInterval) clearInterval(typingInterval);

  // 初期クリア
  textEl.innerHTML = "";
  nameEl.textContent = "";
  evLayer.innerHTML = "";
  choicesEl.innerHTML = "";
  clearRandomImages();  // ランダム画像クリア

  if (scene.textareashow !== undefined) {
    updateTextAreaVisibility(scene.textareashow);
  } else {
    updateTextAreaVisibility(true);
  }

  // 背景切替
  if (scene.bg) {
    await applyEffect(bgEl, scene.bgEffect || "fadeout");
    await new Promise(resolve => {
      bgEl.onload = resolve;
      bgEl.src = config.bgPath + scene.bg;
    });
    await applyEffect(bgEl, scene.bgEffect || "fadein");
  }

  // EV・CG表示
  if (scene.showev) {
    const evImg = document.createElement("img");
    evImg.src = config.evPath + scene.showev;
    evImg.classList.add("ev-image");
    evLayer.appendChild(evImg);
    await applyEffect(evImg, scene.evEffect || "fadein");
  }
  if (scene.showcg) {
    const cgImg = document.createElement("img");
    cgImg.src = config.cgPath + scene.showcg;
    cgImg.classList.add("cg-image");
    evLayer.appendChild(cgImg);
    await applyEffect(cgImg, scene.cgEffect || "fadein");
  }

  // BGM切替
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

  // キャラ表示
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
      } else {
        slot.innerHTML = "";
      }
    }
  }
  updateCharacterDisplay();

  // キャラ名・テキスト表示
  if (scene.name !== undefined && scene.text !== undefined) {
    setCharacterStyle(scene.name, scene);
    nameEl.textContent = scene.name;
    setTextWithSpeed(scene.text, currentSpeed);
  }

  // 効果音・ボイス再生
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

  // 選択肢表示
  if (scene.choices) {
    scene.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        clearCharacters();
        textEl.innerHTML = "";
        nameEl.textContent = "";
        evLayer.innerHTML = "";
        if (choice.jump) loadScenario(choice.jump);
        else if (choice.url) location.href = choice.url;
      };
      choicesEl.appendChild(btn);
    });
  }

  // メニュー・リスト表示
  if (scene.showmenu) {
    loadMenu(scene.showmenu);
  }
  if (scene.showlist) {
    loadList(scene.showlist);
  }

  // ランダム画像表示ON/OFF
  if (scene.randomimageson) {
    randomImagesOn();
  } else {
    randomImagesOff();
  }

  // 自動進行
  if (scene.auto && !scene.choices && !scene.text) {
    setTimeout(() => {
      if (!isPlaying) next();
    }, autoWaitTime);
  }
}

// --- 次シーン表示 ---
function next() {
  fetch(config.scenarioPath + currentScenario + "?t=" + Date.now())
    .then(res => res.json())
    .then(data => {
      currentIndex++;
      if (currentIndex < data.length) {
        showScene(data[currentIndex]);
      } else {
        // 最後まで来たときの処理（例：テキスト表示）
        if (textAreaVisible) {
          nameEl.textContent = "";
          textEl.innerHTML = "（物語は つづく・・・）";
        }
        isAutoMode = false;
      }
    });
}

// --- シナリオ読込 ---
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
    .then(res => res.json())
    .then(data => {
      showScene(data[0]);
    });
}

// --- 画面高さ用CSS変数設定 ---
function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

// --- メニュー表示 ---
async function loadMenu(filename = "menu01.json") {
  const res = await fetch(config.menuPath + filename + "?t=" + Date.now());
  const data = await res.json();
  showMenu(data);
}

function showMenu(menuData) {
  menuPanel.innerHTML = "";
  menuPanel.classList.remove("hidden");

  // 音声トグル
  const audioStateBtn = document.createElement("button");
  audioStateBtn.textContent = isMuted ? "音声ONへ" : "音声OFFへ";
  audioStateBtn.onclick = () => {
    isMuted = !isMuted;
    if (bgm) bgm.muted = isMuted;
    document.querySelectorAll("audio").forEach(a => a.muted = isMuted);
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
      setTimeout(() => { textEl.innerHTML = ""; }, 1000);
    }
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(autoBtn);

  // 全画面トグル
  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.textContent = document.fullscreenElement ? "全画面OFF" : "全画面ON";
  fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(fullscreenBtn);

  // その他メニュー項目
  menuData.items.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      menuPanel.classList.add("hidden");
      handleMenuAction(item);
    };
    menuPanel.appendChild(btn);
  });
}

// --- リスト表示 ---
async function loadList(filename = "list01.json") {
  const res = await fetch(config.listPath + filename + "?t=" + Date.now());
  const data = await res.json();
  showList(data);
}

function showList(listData) {
  listPanel.innerHTML = "";
  listPanel.classList.remove("hidden");

  listData.items.slice(0, 7).forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      listPanel.classList.add("hidden");
      handleMenuAction(item);
    };
    listPanel.appendChild(btn);
  });
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

// --- クリックで次へ or メニュー表示 ---
clickLayer.addEventListener("dblclick", () => {
  loadMenu("menu01.json");
});

let lastTouch = 0;
clickLayer.addEventListener("touchend", () => {
  const now = Date.now();
  if (now - lastTouch < 300) {
    loadMenu("menu01.json");
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
  
// --- ウィンドウリサイズ時処理 ---
window.addEventListener("resize", () => {
  setVhVariable();
  updateCharacterDisplay();
});

// --- ページ読み込み時処理 ---
window.addEventListener("load", () => {
  setVhVariable();
  loadScenario(currentScenario);
});

// --- ランダム画像表示管理関数は別ファイル randomShows.js に分離推奨 ---
// ここでは randomImagesOn(), randomImagesOff(), clearRandomImages() 等をグローバルで使う想定
