// menuList.js - v035-08

const menuPanelElement = document.getElementById("menu-panel");
const listPanelElement = document.getElementById("list-panel");

// 表示・非表示関数
function showMenuPanel() {
  if (menuPanelElement) menuPanelElement.classList.remove("hidden");
}
function hideMenuPanel() {
  if (menuPanelElement) menuPanelElement.classList.add("hidden");
}
function menuPanelVisible() {
  return menuPanelElement && !menuPanelElement.classList.contains("hidden");
}
function showListPanel() {
  if (listPanelElement) listPanelElement.classList.remove("hidden");
}
function hideListPanel() {
  if (listPanelElement) listPanelElement.classList.add("hidden");
}
function listPanelVisible() {
  return listPanelElement && !listPanelElement.classList.contains("hidden");
}

// メニュー・リスト読み込み
async function loadMenu(filename = "menu01.json") {
  try {
    const res = await fetch(config.menuPath + filename + "?t=" + Date.now());
    const data = await res.json();
    showMenu(data);
  } catch (e) {
    console.error("メニュー読み込み失敗", e);
  }
}

async function loadList(filename = "list01.json") {
  try {
    const res = await fetch(config.listPath + filename + "?t=" + Date.now());
    const data = await res.json();
    showList(data);
  } catch (e) {
    console.error("リスト読み込み失敗", e);
  }
}

// メニュー表示
function showMenu(menuData) {
  menuPanelElement.innerHTML = "";
  showMenuPanel();

  // 音声ON/OFF切替ボタン
  const audioBtn = document.createElement("button");
  audioBtn.textContent = isMuted ? "音声ONへ" : "音声OFFへ";
  audioBtn.onclick = () => {
    isMuted = !isMuted;
    if (bgm) bgm.muted = isMuted;
    document.querySelectorAll("audio").forEach(a => (a.muted = isMuted));
    hideMenuPanel();
  };
  menuPanelElement.appendChild(audioBtn);

  // オートモードON/OFF切替ボタン
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
    hideMenuPanel();
  };
  menuPanelElement.appendChild(autoBtn);

  // 全画面ON/OFF切替ボタン
  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.textContent = document.fullscreenElement ? "全画面OFF" : "全画面ON";
  fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    hideMenuPanel();
  };
  menuPanelElement.appendChild(fullscreenBtn);

  // メニュー項目ボタン生成
  menuData.items.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      hideMenuPanel();
      handleMenuAction(item);
    };
    menuPanelElement.appendChild(btn);
  });
}

// リスト表示
function showList(listData) {
  listPanelElement.innerHTML = "";
  showListPanel();

  listData.items.slice(0, 7).forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      hideListPanel();
      handleMenuAction(item);
    };
    listPanelElement.appendChild(btn);
  });
}

// メニューアクション共通処理
function handleMenuAction(item) {
  if (item.action === "jump" && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    loadMenu(item.menu);
  } else if (item.action === "list" && item.list) {
    loadList(item.list);
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  }
}

// ダブルクリック・ダブルタップでメニュー表示
let lastTouchTime = 0;
clickLayer.addEventListener("dblclick", () => {
  loadMenu("menu01.json");
});
clickLayer.addEventListener("touchend", () => {
  const now = Date.now();
  if (now - lastTouchTime < 300) {
    loadMenu("menu01.json");
  }
  lastTouchTime = now;
});
