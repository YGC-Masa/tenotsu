let currentScenario = "000start.json";
let currentSceneIndex = 0;
let isAutoMode = false;
let isSkipping = false;
let isSceneTransitioning = false;
let clickDisabled = false;

const clickLayer = document.getElementById("click-layer");

// ビューポート高さ変数を再設定
window.addEventListener("resize", () => {
  if (typeof setVhVariable === "function") {
    setVhVariable();
  }
});

function loadScenario(scenario) {
  currentSceneIndex = 0;
  isAutoMode = false;
  isSkipping = false;
  isSceneTransitioning = false;
  clickDisabled = false;

  window.currentScenario = scenario;
  showScene(scenario[currentSceneIndex]);
}

function showScene(scene) {
  if (!scene || isSceneTransitioning) return;
  isSceneTransitioning = true;

  // ランダム画像レイヤー制御
  if (scene.randomimageson) randomImagesOn?.();
  if (scene.randomimagesoff) randomImagesOff?.();

  // 背景
  if (scene.bg) {
    const bg = document.getElementById("background");
    if (scene.effect && effects[scene.effect]) {
      effects[scene.effect](bg);
      setTimeout(() => { bg.src = scene.bg; }, 250);
    } else {
      bg.src = scene.bg;
    }
  }

  // EV/CG
  const evLayer = document.getElementById("ev-layer");
  evLayer.innerHTML = "";
  if (scene.ev || scene.cg) {
    const img = document.createElement("img");
    const basePath = scene.ev ? config.evPath : config.cgPath;
    img.src = basePath + (scene.ev || scene.cg);
    img.className = scene.ev ? "ev-image" : "cg-image";
    evLayer.appendChild(img);
  }

  // キャラクター
  clearCharacters();
  if (scene.chars) {
    for (const pos in scene.chars) {
      updateCharacterDisplay(pos, scene.chars[pos]);
    }
  }

  // 名前
  document.getElementById("name").innerText = scene.name || "";

  // テキスト
  if (scene.text) {
    setTextWithSpeed(scene.text, () => {
      isSceneTransitioning = false;
      if (scene.auto) {
        isAutoMode = true;
        setTimeout(nextScene, 1500);
      }
    });
  } else {
    document.getElementById("text").innerText = "";
    isSceneTransitioning = false;
    if (scene.auto) {
      isAutoMode = true;
      setTimeout(nextScene, 1000);
    }
  }

  updateUIState(scene);
}

function updateUIState(scene) {
  const dialogueBox = document.getElementById("dialogue-box");
  dialogueBox.style.display = scene.textareashow === false ? "none" : "";

  if (scene.choices) {
    showChoices(scene.choices);
  } else {
    hideChoices();
  }
}

function nextScene() {
  if (isSceneTransitioning) return;
  currentSceneIndex++;
  if (window.currentScenario && currentSceneIndex < window.currentScenario.length) {
    showScene(window.currentScenario[currentSceneIndex]);
  } else {
    showEndMessage();
  }
}

function showEndMessage() {
  const dialogueBox = document.getElementById("dialogue-box");
  if (dialogueBox.style.display === "none") return;

  document.getElementById("name").innerText = "";
  document.getElementById("text").innerText = "物語はつづく・・・";
}

function showChoices(choices) {
  const area = document.getElementById("choices");
  area.innerHTML = "";
  area.style.display = "block";

  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;
    btn.addEventListener("click", () => {
      if (choice.jump !== undefined) {
        currentSceneIndex = choice.jump;
        showScene(window.currentScenario[currentSceneIndex]);
      }
    });
    area.appendChild(btn);
  });
}

function hideChoices() {
  const area = document.getElementById("choices");
  area.innerHTML = "";
  area.style.display = "none";
}

// ▼クリック操作（通常進行）
clickLayer.addEventListener("click", () => {
  if (clickDisabled || isSceneTransitioning || isAutoMode || isSkipping) return;
  nextScene();
});

// ▼ダブルクリックでメニュー切り替え（list状態問わず）
let lastClickTime = 0;
clickLayer.addEventListener("dblclick", () => {
  const now = Date.now();
  if (now - lastClickTime < 300) return;
  lastClickTime = now;

  const listPanel = document.getElementById("list-panel");
  const menuPanel = document.getElementById("menu-panel");

  const isListOpen = !listPanel.classList.contains("hidden");
  const isMenuOpen = !menuPanel.classList.contains("hidden");

  if (isMenuOpen) {
    hideMenu();
  } else {
    showMenu();
  }
});
