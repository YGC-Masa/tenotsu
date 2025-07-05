const menuPanel = document.getElementById("menu-panel");
const listPanel = document.getElementById("list-panel");

function showMenu() {
  menuPanel.classList.remove("hidden");
}

function hideMenu() {
  menuPanel.classList.add("hidden");
}

function toggleMenu() {
  menuPanel.classList.toggle("hidden");
}

function showList(listItems = []) {
  listPanel.innerHTML = "";
  listItems.forEach((item) => {
    const button = document.createElement("button");
    button.innerText = item.label;
    button.addEventListener("click", () => {
      hideList();
      if (item.command) item.command();
    });
    listPanel.appendChild(button);
  });
  listPanel.classList.remove("hidden");
}

function hideList() {
  listPanel.classList.add("hidden");
}

// メニュー構築
function buildMenu() {
  menuPanel.innerHTML = "";

  const autoBtn = document.createElement("button");
  autoBtn.innerText = "オートモード";
  autoBtn.addEventListener("click", () => {
    hideMenu();
    nextScene();
  });
  menuPanel.appendChild(autoBtn);

  const skipBtn = document.createElement("button");
  skipBtn.innerText = "スキップ";
  skipBtn.addEventListener("click", () => {
    hideMenu();
    nextScene();
  });
  menuPanel.appendChild(skipBtn);

  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.innerText = "全画面表示ON/OFF";
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  });
  menuPanel.appendChild(fullscreenBtn);
}

// 初期化
document.addEventListener("DOMContentLoaded", buildMenu);
