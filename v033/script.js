let currentScenario = null;
let currentSceneIndex = 0;
let isAutoMode = false;
let isSkipping = false;
let isSceneTransitioning = false;
let clickDisabled = false;

const clickLayer = document.getElementById("click-layer");

// resize時に --vh 再設定
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
  currentScenario = scenario;

  showScene(currentScenario[currentSceneIndex]);
}

async function loadScenarioFromFile(fileName) {
  try {
    const response = await fetch(config.scenarioPath + fileName);
    const scenarioData = await response.json();
    loadScenario(scenarioData);
  } catch (error) {
    console.error("シナリオ読み込みエラー:", error);
  }
}

function showScene(scene) {
  if (!scene || isSceneTransitioning) return;
  isSceneTransitioning = true;

  if (scene.randomimageson) randomImagesOn?.();
  if (scene.randomimagesoff) randomImagesOff?.();

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

  if (scene.ev || scene.cg) {
    const evLayer = document.getElementById("ev-layer");
    evLayer.innerHTML = "";
    const img = document.createElement("img");
    img.src = scene.ev || scene.cg;
    img.className = scene.ev ? "ev-image" : "cg-image";
    evLayer.appendChild(img);
  } else {
    document.getElementById("ev-layer").innerHTML = "";
  }

  clearCharacters();
  if (scene.chars) {
    for (const pos in scene.chars) {
      updateCharacterDisplay(pos, scene.chars[pos]);
    }
  }

  document.getElementById("name").innerText = scene.name || "";

  if (scene.text) {
    setTextWithSpeed(scene.text, () => {
      isSceneTransitioning = false;
      if (scene.auto) {
        isAutoMode = true;
        setTimeout(() => nextScene(), 1500);
      }
    });
  } else {
    document.getElementById("text").innerText = "";
    isSceneTransitioning = false;
    if (scene.auto) {
      isAutoMode = true;
      setTimeout(() => nextScene(), 1000);
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
  if (isSceneTransitioning || !currentScenario) return;
  currentSceneIndex++;
  if (currentSceneIndex < currentScenario.length) {
    showScene(currentScenario[currentSceneIndex]);
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
  const choicesArea = document.getElementById("choices");
  choicesArea.innerHTML = "";
  choicesArea.style.display = "block";

  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.innerText = choice.text;
    button.addEventListener("click", () => {
      if (choice.jump !== undefined) {
        currentSceneIndex = choice.jump;
        showScene(currentScenario[currentSceneIndex]);
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

// クリックで進行
clickLayer.addEventListener("click", () => {
  if (clickDisabled || isSceneTransitioning || isAutoMode || isSkipping) return;
  nextScene();
});

// ダブルクリックでメニュー表示/非表示（リスト状態問わず）
let lastClickTime = 0;
clickLayer.addEventListener("dblclick", () => {
  const now = Date.now();
  if (now - lastClickTime < 300) return;
  lastClickTime = now;

  const isMenuOpen = !document.getElementById("menu-panel").classList.contains("hidden");
  if (isMenuOpen) {
    hideMenu();
  } else {
    showMenu();
  }
});

// ✅ 起動時：初期シナリオ「000start.json」を読み込む
window.addEventListener("DOMContentLoaded", () => {
  loadScenarioFromFile("000start.json");
});
