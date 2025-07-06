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
  // 必要に応じてキャラ、背景、テキスト表示などを追加
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

  // 他のUI更新処理（テキスト、キャラクターなど）があればここに
}

// DOM要素が読み込まれてからイベント設定
document.addEventListener("DOMContentLoaded", () => {
  const clickLayer = document.getElementById("clicklayer");
  if (clickLayer) {
    clickLayer.addEventListener("click", () => {
      nextScene();
    });
  }

  // ダブルクリックでメニュー開閉
  document.addEventListener("dblclick", () => {
    if (menuVisible()) {
      if (listVisible()) {
        hideMenu(); // リストは残す
      } else {
        hideMenu();
      }
    } else {
      showMenu();
    }
  });
});
