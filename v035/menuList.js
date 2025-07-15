// menuList.js - 修正版（必ずこのように）
export function showMenuPanel() {
  const menuPanelElement = document.getElementById("menu-panel");
  if (menuPanelElement) menuPanelElement.classList.remove("hidden");
}

export function hideMenuPanel() {
  const menuPanelElement = document.getElementById("menu-panel");
  if (menuPanelElement) menuPanelElement.classList.add("hidden");
}

export function menuPanelVisible() {
  const menuPanelElement = document.getElementById("menu-panel");
  return menuPanelElement && !menuPanelElement.classList.contains("hidden");
}

export function showListPanel() {
  const listPanelElement = document.getElementById("list-panel");
  if (listPanelElement) listPanelElement.classList.remove("hidden");
}

export function hideListPanel() {
  const listPanelElement = document.getElementById("list-panel");
  if (listPanelElement) listPanelElement.classList.add("hidden");
}

export function listPanelVisible() {
  const listPanelElement = document.getElementById("list-panel");
  return listPanelElement && !listPanelElement.classList.contains("hidden");
}
