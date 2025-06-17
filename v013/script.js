// 素材の相対パス設定
const config = {
  bgPath: "../assets2/bgev/",
  charPath: "../assets2/char/",
  bgmPath: "../assets2/bgm/",
  scenarioPath: "scenario/"
};

// --vh 動的更新
function updateVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', updateVh);
window.addEventListener('orientationchange', updateVh);
window.addEventListener('load', updateVh);

// 初期変数
let scenarioData = null;
let currentSceneIndex = 0;
let isTextDisplaying = false;
let autoMode = false;
let autoTimeout = null;

let charElements = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

let backgroundElement = document.getElementById("background");
let dialogueBox = document.getElementById("dialogue-box");
let nameBox = document.getElementById("name");
let textBox = document.getElementById("text");
let choicesBox = document.getElementById("choices");

let currentFontSize = characterStyles[""].fontSize || "1em";
let currentSpeed = characterStyles[""].speed || 40;

// シナリオ読み込み
async function loadScenario(fileName) {
  try {
    const res = await fetch(config.scenarioPath + fileName);
    scenarioData = await res.json();
    currentSceneIndex = 0;
    showScene(currentSceneIndex);
  } catch (e) {
    console.error("読み込み失敗:", e);
  }
}

// シーン表示
function showScene(index) {
  if (!scenarioData || index >= scenarioData.scenes.length) return;

  const scene = scenarioData.scenes[index];

  // 背景
  if (scene.bg) {
    applyImageEffect(backgroundElement, config.bgPath + scene.bg, scene.effect);
  }

  // キャラ表示
  ["left", "center", "right"].forEach(pos => {
    const charData = scene.characters?.find(c => c.side === pos);
    const img = charData?.src;
    const el = charElements[pos];
    if (img && img.toLowerCase() !== "null") {
      applyImageEffect(el, config.charPath + img, scene.effect, true);
    } else {
      el.innerHTML = "";
    }
  });

  // 名前・色
  nameBox.textContent = scene.name || "";
  nameBox.style.color = characterColors[scene.name] || characterColors[""];

  // フォントサイズと速度
  const style = characterStyles[scene.name] || characterStyles[""];
  currentFontSize = style.fontSize || characterStyles[""].fontSize;
  currentSpeed = style.speed || characterStyles[""].speed;
  dialogueBox.style.setProperty("--fontSize", currentFontSize);
  dialogueBox.style.fontSize = currentFontSize;

  // セリフ
  const text = scene.text || "";
  const speed = scene.speed ?? currentSpeed;
  displayText(text, speed);

  // 選択肢
  if (scene.choices) {
    showChoices(scene.choices);
  } else {
    clearChoices();
  }
}

// エフェクト適用
function applyImageEffect(targetEl, imagePath, effect, isCharacter = false) {
  const temp = document.createElement("img");
  temp.src = imagePath;
  temp.className = isCharacter ? "char-image" : "";
  temp.style.opacity = 0;

  if (effect) {
    temp.classList.add("effect-" + effect);
  }

  const container = isCharacter ? targetEl : targetEl.parentNode;
  if (isCharacter) {
    targetEl.innerHTML = "";
    targetEl.appendChild(temp);
  } else {
    targetEl.src = imagePath;
    targetEl.className = "";
    if (effect) {
      targetEl.classList.add("effect-" + effect);
    }
  }

  requestAnimationFrame(() => {
    temp.style.opacity = 1;
  });
}

// テキスト表示
function displayText(text, speed) {
  clearTimeout(autoTimeout);
  isTextDisplaying = true;
  textBox.textContent = "";
  let i = 0;

  function type() {
    if (i < text.length) {
      textBox.textContent += text.charAt(i++);
      autoTimeout = setTimeout(type, speed);
    } else {
      isTextDisplaying = false;
      if (autoMode) {
        autoTimeout = setTimeout(nextScene, 1500);
      }
    }
  }
  type();
}

// 選択肢
function showChoices(choices) {
  clearChoices();
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      if (choice.jump) {
        loadScenario(choice.jump);
      } else {
        nextScene();
      }
    };
    choicesBox.appendChild(btn);
  });
}
function clearChoices() {
  choicesBox.innerHTML = "";
}

// 次へ
function nextScene() {
  if (isTextDisplaying) {
    clearTimeout(autoTimeout);
    const fullText = scenarioData.scenes[currentSceneIndex].text;
    textBox.textContent = fullText;
    isTextDisplaying = false;
  } else {
    showScene(++currentSceneIndex);
  }
}

// オートモード切り替え
function toggleAutoMode() {
  autoMode = !autoMode;
  if (autoMode && !isTextDisplaying) {
    autoTimeout = setTimeout(nextScene, 1500);
  } else {
    clearTimeout(autoTimeout);
  }
}

// ゲームエリアクリック処理
function onClickGameArea() {
  if (isTextDisplaying) {
    clearTimeout(autoTimeout);
    const fullText = scenarioData.scenes[currentSceneIndex].text;
    textBox.textContent = fullText;
    isTextDisplaying = false;
  } else {
    nextScene();
  }
}
function onDoubleClickGameArea() {
  toggleAutoMode();
}

// 初期化
function init() {
  updateVh();
  document.getElementById("game-container").addEventListener("click", onClickGameArea);
  document.getElementById("game-container").addEventListener("dblclick", onDoubleClickGameArea);
  loadScenario("000start.json");
}
window.addEventListener("load", init);
