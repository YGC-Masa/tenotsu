// menulist.js - ESモジュール対応

const menuPanelElement = document.getElementById("menu-panel");
const listPanelElement = document.getElementById("list-panel");

export function showMenuPanel() {
  if (menuPanelElement) menuPanelElement.classList.remove("hidden");
}

export function hideMenuPanel() {
  if (menuPanelElement) menuPanelElement.classList.add("hidden");
}

export function menuPanelVisible() {
  return menuPanelElement && !menuPanelElement.classList.contains("hidden");
}

export function showListPanel() {
  if (listPanelElement) listPanelElement.classList.remove("hidden");
}

export function hideListPanel() {
  if (listPanelElement) listPanelElement.classList.add("hidden");
}

export function listPanelVisible() {
  return listPanelElement && !listPanelElement.classList.contains("hidden");
}
