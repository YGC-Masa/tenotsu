// menuList.js

const menuPanelElement = document.getElementById("menu");
const listPanelElement = document.getElementById("list");

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
