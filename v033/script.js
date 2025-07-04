// グローバル定義など（v032 継承）
let currentScenario = "000start.json";
let currentIndex = 0;
let bgm = null;
let lastActiveSide = null;
let isMuted = true;
let typingInterval = null;
let isAutoMode = false;
let autoWaitTime = 2000;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const menuPanel = document.getElementById("menu-panel");
const listPanel = document.getElementById("list-panel");
const evLayer = document.getElementById("ev-layer");
const clickLayer = document.getElementById("click-layer");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

let defaultFontSize = "1em";
let defaultSpeed = 40;
let currentSpeed = defaultSpeed;
let isPlaying = false;

// --vh 再計算
function setVhVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", () => {
  setVhVariable();
  updateCharacterDisplay();
});
window.addEventListener("DOMContentLoaded", () => {
  setVhVariable();
  loadScenario(currentScenario);
});

// 画面クリックレイヤー上での操作を確保
clickLayer.addEventListener("dblclick", () => loadMenu("menu01.json"));
clickLayer.addEventListener("click", () => {
  if (!menuPanel.classList.contains("hidden")) {
    menuPanel.classList.add("hidden");
    return;
  }
  if (!listPanel.classList.contains("hidden")) {
    listPanel.classList.add("hidden");
    return;
  }
  if (!isPlaying && choicesEl.children.length === 0) {
    next();
  }
});

// 省略：タイプ処理、キャラ表示等は v032 と同じ

// === メニュー表示 ===
async function loadMenu(filename = "menu01.json") {
  const res = await fetch(config.menuPath + filename + "?t=" + Date.now());
  const data = await res.json();
  showMenu(data);
}

function showMenu(menuData) {
  menuPanel.innerHTML = "";
  menuPanel.classList.remove("hidden");

  // 音声切替ボタン（左詰め固定）
  const audioBtn = document.createElement("button");
  audioBtn.className = "menu-sound-toggle";
  audioBtn.textContent = isMuted ? "音声ONへ" : "音声OFFへ";
  audioBtn.onclick = () => {
    isMuted = !isMuted;
    if (bgm) bgm.muted = isMuted;
    document.querySelectorAll("audio").forEach(a => (a.muted = isMuted));
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(audioBtn);

  // オートモード ON/OFF
  const autoBtn = document.createElement("button");
  autoBtn.textContent = isAutoMode ? "オートモードOFF" : "オートモードON";
  autoBtn.onclick = () => {
    isAutoMode = !isAutoMode;
    textEl.innerHTML = isAutoMode ? "(AutoMode On 3秒後開始)" : "(AutoMode Off)";
    setTimeout(() => (textEl.innerHTML = ""), 1000);
    if (isAutoMode) {
      setTimeout(() => {
        if (!isPlaying && choicesEl.children.length === 0) next();
      }, autoWaitTime + 1000);
    }
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(autoBtn);

  // 全画面表示 ON/OFF ボタン 追加
  const fsBtn = document.createElement("button");
  fsBtn.textContent = document.fullscreenElement ? "全画面を解除" : "全画面表示";
  fsBtn.onclick = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(fsBtn);

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
