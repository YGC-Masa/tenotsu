const menuPanelElement = document.getElementById("menu-panel");
const listPanelElement = document.getElementById("list-panel");

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
