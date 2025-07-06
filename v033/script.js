// script.js

let currentSceneIndex = 0;
let scenario = [];
let isSceneTransitioning = false;

function loadScenario(data) {
  scenario = data;
  currentSceneIndex = 0;
  isSceneTransitioning = false;
  hideMenu();
  hideList();
  showScene();
}

function showScene() {
  if (isSceneTransitioning) return;
  const scene = scenario[currentSceneIndex];
  if (!scene) return;

  updateUIState(scene);

  // キャラ・背景・音声などの表示処理があればここに
}

function nextScene() {
  if (isSceneTransitioning) return;
  if (currentSceneIndex < scenario.length - 1) {
    currentSceneIndex++;
    showScene();
  }
}

function updateUIState(scene) {
  if (scene.randomimageson) {
    randomImagesOn();
  } else if (scene.randomimagesoff) {
    randomImagesOff();
  }

  // その他UI更新（例: テキスト、キャラ表示など）
}

// イベント
document.getElementById("clicklayer").addEventListener("click", () => {
  nextScene();
});

// ダブルクリックでメニュー
document.addEventListener("dblclick", () => {
  if (menuVisible()) {
    hideMenu();
  } else {
    showMenu();
  }
});
