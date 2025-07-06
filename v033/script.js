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
  if (scene.randomimageson) randomImagesOn?.(scene.randomimageson);
  if (scene.randomimagesoff) randomImagesOff?.();

  // 背景処理
  if (scene.bg) {
    const bg = document.getElementById("background");
    const fullBgPath = config.bgPath + scene.bg;

    if (scene.effect && effects[scene.effect]) {
      effects[scene.effect](bg);
      setTimeout(() => {
        bg.src = fullBgPath;
      }, 250);
    } else {
      bg.src = fullBgPath;
    }
  }

  // EV or CG 処理
  const evLayer = document.getElementById("ev-layer");
  evLayer.innerHTML = "";
  if (scene.ev || scene.cg) {
    const img = document.createElement("img");
    img.src = (scene.ev ? config.evPath : config.cgPath) + (scene.ev || scene.cg);
    img.className = scene.ev ? "ev-image" : "cg-image";
    evLayer.appendChild(img);
  }

  // キャラ処理
  clearCharacters();
  if (scene.chars) {
    for (const pos in scene.chars) {
      updateCharacterDisplay(pos, scene.chars[pos]);
    }
  }

  // 名前表示
  document.getElementById("name").innerText = scene.name || "";

  // テキスト表示
  if (scene.text) {
    setTextWithSpeed(scene.text, () => {
      isSceneTransitioning = false;
      if (scene.auto) {
        isAutoMode = true;
        setTimeout(nextScene, scene.wait || 1500);
      }
    });
  } else {
    document.getElementById("text").innerText = "";
    isSceneTransitioning = false;
    if (scene.auto) {
      isAutoMode = true;
      setTimeout(nextScene, scene.wait || 1000);
    }
  }

  // UI更新
  updateUIState(scene);

  // showlist処理
  if (scene.showlist) {
    showList(scene.showlist);
  }
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

  choices.forEach((choice) => {
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

// ダブルクリックでメニュー切替（list表示に関係なく）
let lastClickTime = 0;
clickLayer.addEventListener("dblclick", () => {
  const now = Date.now();
  if (now - lastClickTime < 300) return;
  lastClickTime = now;

  const isListOpen = !document.getElementById("list-panel").classList.contains("hidden");
  const isMenuOpen = !document.getElementById("menu-panel").classList.contains("hidden");

  if (isMenuOpen) {
    hideMenu();
  } else {
    showMenu();
  }
});

clickLayer.addEventListener("click", () => {
  if (clickDisabled || isSceneTransitioning || isAutoMode || isSkipping) return;
  nextScene();
});

// 起動処理：最初のシナリオを読み込み
fetch(config.scenarioPath + currentScenario)
  .then(res => res.json())
  .then(data => {
    loadScenario(data);
  })
  .catch(err => {
    console.error("シナリオファイルの読み込みに失敗:", err);
  });
