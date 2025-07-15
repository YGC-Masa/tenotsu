// menuList.js - メニューとリストの表示制御用モジュール

const menuPanelElement = document.getElementById("menu-panel");
const listPanelElement = document.getElementById("list-panel");

// メニュー表示
export function showMenuPanel() {
  if (menuPanelElement) {
    menuPanelElement.classList.remove("hidden");
  }
}

// メニュー非表示
export function hideMenuPanel() {
  if (menuPanelElement) {
    menuPanelElement.classList.add("hidden");
  }
}

// メニュー表示中かどうか
export function menuPanelVisible() {
  return menuPanelElement && !menuPanelElement.classList.contains("hidden");
}

// リスト表示
export function showListPanel() {
  if (listPanelElement) {
    listPanelElement.classList.remove("hidden");
  }
}

// リスト非表示
export function hideListPanel() {
  if (listPanelElement) {
    listPanelElement.classList.add("hidden");
  }
}

// リスト表示中かどうか
export function listPanelVisible() {
  return listPanelElement && !listPanelElement.classList.contains("hidden");
}
