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
async function loadScenario(url) {
  try {
    const res = await fetch(url);
    scenarioData = await res.json();
    currentSceneIndex = 0;
    showScene(currentSceneIndex);
  } catch (e) {
    console.error("読み込み失敗:", e);
  }
}

// シーン表示
function showScene(index) {
  if (!scenarioData || index >= scenarioData.scenes.length) {
    endScenario();
    return;
  }

  const scene = scenarioData.scenes[index];

  // 背景
  if (scene.bg) {
    backgroundElement.src = config.bgPath + scene.bg;
  }

  // キャラ表示
  ["left", "center", "right"].forEach(pos => {
    const charData = scene.characters?.find(c => c.side === pos);
    const img = charData?.src;
    charElements[pos].innerHTML = (img && img.toLowerCase() !== "null")
      ? `<img src="${config.charPath + img}" class="char-image">` : "";
  });

  // 名前・色
  nameBox.textContent = scene.name || "";
  nameBox.style.color = characterColors[scene.name] || characterColors[""];

  // フォントサイズと速度（キャラごとに反映）
  const style = characterStyles[scene.name] || characterStyles[""];
  currentFontSize = style.fontSize || characterStyles[""].fontSize;
  currentSpeed = style.speed || characterStyles[""].speed;
  dialogueBox.style.setProperty("--fontSize", currentFontSize);

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

function endScenario() {
  nameBox.textContent = "";
  textBox.textContent = "物語は続く…";
  clearChoices();
  autoMode = false;
  clearTimeout(autoTimeout);
}

// オート
function toggleAutoMode() {
  autoMode = !autoMode;
  if (autoMode && !isTextDisplaying) {
    autoTimeout = setTimeout(nextScene, 1500);
  } else {
    clearTimeout(autoTimeout);
  }
}

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

function init() {
  document.getElementById("game-container").addEventListener("click", onClickGameArea);
  document.getElementById("game-container").addEventListener("dblclick", onDoubleClickGameArea);
  loadScenario("scenario/000start.json");
}

window.addEventListener("load", init);
