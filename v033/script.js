let currentScenario = "000start.json";
let currentSceneIndex = 0;
let isAutoMode = false;
let isSkipping = false;
let isSceneTransitioning = false;
let clickDisabled = false;

const clickLayer = document.getElementById("click-layer");

window.addEventListener("resize", () => {
  if (typeof setVhVariable === "function") {
    setVhVariable();
  }
});

// ゲーム開始処理
document.addEventListener("DOMContentLoaded", () => {
  if (typeof setVhVariable === "function") {
    setVhVariable();
  }
  loadScenario(currentScenario);
});

// シナリオJSONを読み込んでスタート
function loadScenario(filename) {
  fetch(`./scenario/${filename}`)
    .then(res => res.json())
    .then(data => {
      window.currentScenario = data;
      currentSceneIndex = 0;
      isAutoMode = false;
      isSkipping = false;
      isSceneTransitioning = false;
      clickDisabled = false;
      showScene(window.currentScenario[currentSceneIndex]);
    })
    .catch(err => {
      console.error("シナリオ読み込みエラー:", err);
    });
}

function showScene(scene) {
  if (!scene || isSceneTransitioning) return;

  isSceneTransitioning = true;

  // ランダム画像制御
  if (scene.randomimageson) randomImagesOn?.();
  if (scene.randomimagesoff) randomImagesOff?.();

  // 背景
  if (scene.bg) {
    const bg = document.getElementById("background");
    if (scene.effect && effects[scene.effect]) {
      effects[scene.effect](bg);
      setTimeout(() => {
        bg.src = scene.bg;
      }, 250);
    } else {
      bg.src = scene.bg;
    }
  }

  // EV / CG
  const evLayer = document.getElementById("ev-layer");
  evLayer.innerHTML = "";
  if (scene.ev || scene.cg) {
    const img = document.createElement("img");
    img.src = scene.ev || scene.cg;
    img.className = scene.ev ? "ev-image" : "cg-image";
    evLayer.appendChild(img);
  }

  clearCharacters();
  if (scene.chars) {
    for (const pos in scene.chars) {
      updateCharacterDisplay(pos, scene.chars[pos]);
    }
  }

  document.getElementById("name").innerText = scene.name || "";
  const textArea = document.getElementById("text");

  if (scene.text) {
    setTextWithSpeed(scene.text, () => {
      isSceneTransitioning = false;
      if (scene.auto) {
        isAutoMode = true;
        setTimeout(nextScene, 1500);
      }
    });
  } else {
    textArea.innerText = "";
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
  const nameArea = document.getElementById("name");
  const textArea = document.getElementById("text");

  if (dialogueBox.style.display === "none") return;

  nameArea.innerText = "";
  textArea.innerText = "物語はつづく・・・";
}

function showChoices(choices) {
  const choicesArea = document.getElementById("choices");
  choicesArea.innerHTML = "";
  choicesArea.style.display = "block";

  choices.forEach(choice => {
    const button = document.createElement("button");
    button.innerText = choice.text;
    button.addEventListener("click", () => {
      if (choice.jump !== undefined) {
        currentSceneIndex = choice.jump;
        showScene(window.currentScenario[currentSceneIndex]);
      }
    });
    choicesArea.appendChild(button);
  });
}

function hideChoices() {
  const choicesArea = document.getElementById("choices");
  choicesArea.innerHTML = "";
  choicesArea.style.display = "none";
}

// ▼ クリック進行
clickLayer.addEventListener("click", () => {
  if (clickDisabled || isSceneTransitioning || isAutoMode || isSkipping) return;
  nextScene();
});

// ▼ ダブルクリックでメニューのON/OFF（list表示に関係なく）
let lastClickTime = 0;
clickLayer.addEventListener("dblclick", () => {
  const now = Date.now();
  if (now - lastClickTime < 300) return;
  lastClickTime = now;

  const isListOpen = !document.getElementById("list-panel").classList.contains("hidden");
  const isMenuOpen = !document.getElementById("menu-panel").classList.contains("hidden");

  if (isMenuOpen) {
    hideMenu(); // menuList.js に定義
  } else {
    showMenu(); // menuList.js に定義
  }
});
