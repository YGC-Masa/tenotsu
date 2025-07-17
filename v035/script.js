// script.js - v035-09

const initialScenario = "000start.json";
let currentScenario = "";
let scenarioData = null;
let currentIndex = 0;
let isSceneTransitioning = false;
let isScenarioEnded = false;
let clickLayer = null;

document.addEventListener("DOMContentLoaded", () => {
  clickLayer = document.getElementById("click-layer");

  if (clickLayer) {
    clickLayer.addEventListener("click", handleClick);
    clickLayer.addEventListener("dblclick", handleDoubleClick);
    clickLayer.addEventListener("touchend", handleDoubleClick);
  }

  // メニュー/リスト制御関数をグローバル化
  window.hideMenuPanel = hideMenuPanel;
  window.menuPanelVisible = menuPanelVisible;
  window.hideListPanel = hideListPanel;

  loadScenario(initialScenario); // 初回は自動スタート
});

function handleClick() {
  if (isSceneTransitioning) return;

  if (isScenarioEnded) {
    if (currentScenario !== initialScenario) {
      jumpToInitialScenario();
    }
    return;
  }

  nextScene();
}

function handleDoubleClick() {
  if (menuPanelVisible()) {
    hideMenuPanel();
  } else {
    showMenuPanel();
  }
}

function loadScenario(jsonFile) {
  fetch(`./scenario/${jsonFile}`)
    .then(res => res.json())
    .then(data => {
      scenarioData = data;
      currentScenario = jsonFile;
      currentIndex = 0;
      isScenarioEnded = false;
      updateUIState();
      showScene();
    })
    .catch(err => {
      console.error("シナリオ読み込みエラー:", err);
    });
}

function showScene() {
  if (!scenarioData || currentIndex >= scenarioData.length) {
    showEndMessage();
    return;
  }

  const scene = scenarioData[currentIndex];
  if (!scene) return;

  isSceneTransitioning = true;

  // 背景処理
  if (scene.bg) {
    const bg = document.getElementById("bg");
    if (bg) bg.style.backgroundImage = `url(./bg/${scene.bg})`;
  }

  // キャラ処理
  const left = document.getElementById("chara-left");
  const right = document.getElementById("chara-right");
  if (left) left.src = scene.left || "";
  if (right) right.src = scene.right || "";

  // テキスト処理
  const textArea = document.getElementById("text-area");
  const nameArea = document.getElementById("name-area");
  const name = scene.name || "";
  const text = scene.text || "";

  const style = characterStyles[name] || characterStyles[""];
  if (nameArea) {
    nameArea.innerText = name;
    nameArea.style.color = style.color;
  }

  if (textArea) {
    textArea.style.fontSize = style.fontSize;
    textArea.innerHTML = "";
    typeText(textArea, text, style.speed);
  }

  // ランダム系制御（表示／非表示制御）
  if (scene.randomtexton) {
    randomTextsOn();
  } else {
    randomTextsOff();
  }

  if (scene.randomimageon) {
    randomImagesOn();
  } else {
    randomImagesOff();
  }

  isSceneTransitioning = false;
}

function typeText(element, text, speed) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      element.innerHTML += text[i++];
      setTimeout(typing, speed);
    }
  }
  typing();
}

function nextScene() {
  if (!scenarioData) return;
  currentIndex++;
  showScene();
}

function showEndMessage() {
  isScenarioEnded = true;
  const textArea = document.getElementById("text-area");
  if (textArea) {
    textArea.innerHTML = "物語はつづく・・・（クリックでタイトルに戻ります）";
    textArea.style.display = "block";
  }
}

function jumpToInitialScenario() {
  // フラグリセット
  hideMenuPanel();
  hideListPanel();
  randomTextsOff();
  randomImagesOff();

  const textArea = document.getElementById("text-area");
  if (textArea) textArea.innerHTML = "";

  isScenarioEnded = false;
  isSceneTransitioning = false;

  loadScenario(initialScenario);
}

// --- UI 管理 ---

function updateUIState() {
  // 必要に応じてボタン状態など更新
}

function hideMenuPanel() {
  const menu = document.getElementById("menu-panel");
  if (menu) menu.style.display = "none";
}

function hideListPanel() {
  const list = document.getElementById("list-panel");
  if (list) list.style.display = "none";
}

function showMenuPanel() {
  const menu = document.getElementById("menu-panel");
  if (menu) menu.style.display = "block";
}

function menuPanelVisible() {
  const menu = document.getElementById("menu-panel");
  return menu && menu.style.display !== "none";
}

// --- ランダム表示制御（外部JSで定義） ---

function randomTextsOn() {
  if (window.randomTextsOnImpl) window.randomTextsOnImpl();
}

function randomTextsOff() {
  if (window.randomTextsOffImpl) window.randomTextsOffImpl();
}

function randomImagesOn() {
  if (window.randomImagesOnImpl) window.randomImagesOnImpl();
}

function randomImagesOff() {
  if (window.randomImagesOffImpl) window.randomImagesOffImpl();
}
