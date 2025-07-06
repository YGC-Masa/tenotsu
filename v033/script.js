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

  // effect が指定されている場合は呼び出す
  if (scene.effect && window.effects && typeof window.effects[scene.effect] === "function") {
    window.effects[scene.effect](document.getElementById("background"));
  }

  // auto + wait がある場合は次へ
  if (scene.auto && scene.wait) {
    setTimeout(() => {
      nextScene();
    }, scene.wait);
  }
}

function nextScene() {
  if (isSceneTransitioning) return;
  if (currentSceneIndex < scenario.length - 1) {
    currentSceneIndex++;
    showScene();
  }
}

function updateUIState(scene) {
  // 背景画像切り替え
  if (scene.bg) {
    const bg = document.getElementById("background");
    if (bg) {
      bg.style.backgroundImage = `url('${scene.bg}')`;
      bg.style.backgroundSize = "cover";
      bg.style.backgroundPosition = "center";
    }
  }

  // テキストエリア表示・非表示
  const textArea = document.getElementById("textarea");
  if (textArea) {
    textArea.style.display = (scene.textareashow === false) ? "none" : "block";
  }

  // ランダム画像表示制御
  if (scene.randomimageson) {
    randomImagesOn();
  } else if (scene.randomimagesoff) {
    randomImagesOff();
  }

  // showlist 指定がある場合は読み込み
  if (scene.showlist) {
    showList(scene.showlist);
  }
}

// DOM読み込み後にイベント登録
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
        hideMenu(); // メニューだけ閉じる
      } else {
        hideMenu();
      }
    } else {
      showMenu();
    }
  });
});
