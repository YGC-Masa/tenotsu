// menuList.js - メニュー＆リスト統合版

async function loadMenu(filename = "menu01.json") {
  try {
    const res = await fetch(config.menuPath + filename + "?t=" + Date.now());
    const data = await res.json();
    showMenu(data);
  } catch (e) {
    console.error("メニュー読み込み失敗", e);
  }
}

function showMenu(menuData) {
  const menuPanel = document.getElementById("menu-panel");
  const textEl = document.getElementById("text");
  const choicesEl = document.getElementById("choices");

  menuPanel.innerHTML = "";
  menuPanel.classList.remove("hidden");

  // 音声ON/OFF
  const audioStateBtn = document.createElement("button");
  audioStateBtn.textContent = isMuted ? "音声ONへ" : "音声OFFへ";
  audioStateBtn.onclick = () => {
    isMuted = !isMuted;
    if (bgm) bgm.muted = isMuted;
    document.querySelectorAll("audio").forEach(a => a.muted = isMuted);
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(audioStateBtn);

  // オートモードON/OFF
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

  // 全画面表示 ON/OFF
  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.textContent = document.fullscreenElement ? "全画面OFF" : "全画面ON";
  fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen();
    }
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(fullscreenBtn);

  // メニュー項目
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

// === リスト表示 ===
async function loadList(filename = "list01.json") {
  try {
    const res = await fetch(config.listPath + filename + "?t=" + Date.now());
    const data = await res.json();
    showList(data);
  } catch (e) {
    console.error("リスト読み込み失敗", e);
  }
}

function showList(listData) {
  const listPanel = document.getElementById("list-panel");

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

// === メニュー＆リスト共通アクション処理 ===
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
