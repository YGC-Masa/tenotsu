let currentScenario = "000start.json";
let currentSceneIndex = 0;
let isAutoMode = false;
let isSkipping = false;
let isSceneTransitioning = false;
let clickDisabled = false;

const clickLayer = document.getElementById("click-layer");

// ビューポート初期化
if (typeof setVhVariable === "function") {
  setVhVariable();
}
window.addEventListener("resize", () => {
  if (typeof setVhVariable === "function") {
    setVhVariable();
  }
});

// 初期シナリオロード
fetch(config.scenarioPath + currentScenario)
  .then(res => res.json())
  .then(data => {
    window.currentScenario = data;
    loadScenario(data);
  })
  .catch(err => {
    console.error("シナリオの読み込み失敗:", err);
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

  // ランダム画像
  if (scene.randomimageson) randomImagesOn?.(scene.randomimageson);
  if (scene.randomimagesoff) randomImagesOff?.();

  // 背景
  if (scene.bg) {
    const bg = document.getElementById("background");
    if (scene.effect && effects[scene.effect]) {
      effects[scene.effect](bg);
      setTimeout(() => {
        bg.src = config.bgPath + scene.bg;
      }, 250);
    } else {
      bg.src = config.bgPath + scene.bg;
    }
  }

  // EV or CG
  const evLayer = document.getElementById("ev-layer");
  evLayer.innerHTML = "";
  if (scene.ev || scene.cg) {
    const img = document.createElement("img");
    img.src = (scene.ev ? config.evPath : config.cgPath) + (scene.ev || scene.cg);
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

  // showlist/showmenu
  if (scene.showlist) {
    loadList(scene.showlist);
  } else {
    hideList();
  }

  if (scene.showmenu) {
    loadMenu(scene.showmenu);
  } else {
    hideMenu();
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
  if (dialogueBox.style.display !== "none") {
    nameArea.innerText = "";
    textArea.innerText = "物語はつづく・・・";
  }
}

function showChoices(choices) {
  const area = document.getElementById("choices");
  area.innerHTML = "";
  area.style.display = "block";

  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;
    btn.onclick = () => {
      if (choice.jump !== undefined) {
        currentSceneIndex = choice.jump;
        showScene(window.currentScenario[currentSceneIndex]);
      }
    };
    area.appendChild(btn);
  });
}

function hideChoices() {
  const area = document.getElementById("choices");
  area.innerHTML = "";
  area.style.display = "none";
}

clickLayer.addEventListener("click", () => {
  if (clickDisabled || isSceneTransitioning || isAutoMode || isSkipping) return;
  nextScene();
});

let lastClickTime = 0;
clickLayer.addEventListener("dblclick", () => {
  const now = Date.now();
  if (now - lastClickTime < 300) return;
  lastClickTime = now;

  const listOpen = !document.getElementById("list-panel").classList.contains("hidden");
  const menuOpen = !document.getElementById("menu-panel").classList.contains("hidden");

  if (menuOpen) {
    hideMenu();
  } else {
    showMenu();
  }
});
