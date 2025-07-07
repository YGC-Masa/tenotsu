// menuList.js

const menuPanelElement = document.getElementById("menu-panel");
const listPanelElement = document.getElementById("list-panel");

function showMenu() {
  if (menuPanelElement) menuPanelElement.style.display = "block";
}

function hideMenu() {
  if (menuPanelElement) menuPanelElement.style.display = "none";
}

function menuVisible() {
  return menuPanelElement && menuPanelElement.style.display === "block";
}

function showList() {
  if (listPanelElement) listPanelElement.style.display = "block";
}

function hideList() {
  if (listPanelElement) listPanelElement.style.display = "none";
}

function listVisible() {
  return listPanelElement && listPanelElement.style.display === "block";
}
// loadList関数（JSONから読み込む）
async function loadList(filename = "list01.json") {
  try {
    const res = await fetch(config.listPath + filename + "?t=" + Date.now());
    const data = await res.json();
    showList(data);
  } catch (e) {
    console.error("リスト読み込みエラー:", e);
  }
}

// showList関数（リストデータを表示）
function showList(listData) {
  if (!listPanelElement) return;
  listPanelElement.innerHTML = "";
  listPanelElement.style.display = "block";

  const items = listData.items || [];
  items.slice(0, 7).forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      hideList();
      handleMenuAction(item);
    };
    listPanelElement.appendChild(btn);
  });
}

// リストやメニューからのジャンプ処理
function handleMenuAction(item) {
  if (item.action === "jump" && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    loadMenu(item.menu);
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  }
}
