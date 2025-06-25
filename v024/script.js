// script.js - v024 改・クリック競合対策＋ダブルクリックでメニュー復活＋初期ミュート

// 省略: 変数初期化や定義部分は元のまま

// （中略：変数定義・関数群などは変更なし）
// showScene、setTextWithSpeed、setCharacterStyle、applyEffect、clearCharacters などは省略

// ▼ クリックイベント（オートモード切替＋次シーン進行）＋クリック遅延判別
let clickTimer = null;
document.addEventListener("click", (e) => {
  if (clickTimer) {
    clearTimeout(clickTimer);
    clickTimer = null;
    return; // ダブルクリック扱い、ここでは無処理
  }

  clickTimer = setTimeout(() => {
    clickTimer = null;
    if (isAuto && choicesEl.children.length === 0 && !isPlaying) {
      isAuto = false;
    } else if (!isAuto && choicesEl.children.length === 0 && !isPlaying) {
      next();
    }
  }, 300); // 300ms以内に2回押されたら無効
});

// ▼ ダブルクリックでメニュー呼び出し
bgEl.addEventListener("dblclick", () => {
  loadMenu("menu01.json");
});
document.getElementById("char-layer").addEventListener("dblclick", () => {
  loadMenu("menu01.json");
});

// ▼ メニュー処理
function loadMenu(filename) {
  fetch(config.menuPath + filename)
    .then((res) => res.json())
    .then((data) => {
      menuPanel.innerHTML = "";
      data.items.forEach((item) => {
        const btn = document.createElement("button");
        btn.textContent = item.text;
        btn.onclick = () => {
          handleMenuAction(item);
          menuPanel.classList.add("hidden");
        };
        menuPanel.appendChild(btn);
      });
      menuPanel.classList.remove("hidden");
    });
}

function handleMenuAction(item) {
  if (item.action === "auto") {
    setTimeout(() => { isAuto = true; }, 1750);
  } else if (item.action === "mute") {
    audioMuted = true;
    if (bgm) bgm.muted = true;
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

// ▼ 起動時処理
window.addEventListener("load", () => {
  loadScenario(currentScenario);
  setVhVariable();
});

// ▼ 画面リサイズで再調整
window.addEventListener("resize", () => {
  setVhVariable();
  updateActiveSlotResponsive();
});

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
