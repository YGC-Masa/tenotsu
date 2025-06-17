// 動的に --vh カスタムプロパティを更新（モバイルブラウザUIの高さ変動対応）
function updateVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// 初期とリサイズ時に呼び出し
window.addEventListener('resize', updateVh);
window.addEventListener('orientationchange', updateVh);
window.addEventListener('load', updateVh);

// シナリオデータ管理用
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
async function loadScenario(filename) {
  try {
    const res = await fetch(config.scenarioPath + filename);
    scenarioData = await res.json();
    currentSceneIndex = 0;
    showScene(currentSceneIndex);
  } catch (e) {
    console.error("シナリオ読み込み失敗:", e);
  }
}

// シーン表示
function showScene(index) {
  if (!scenarioData || index >= scenarioData.scenes.length) return;

  const scene = scenarioData.scenes[index];

  // 背景画像切替
  if (scene.bg) {
    backgroundElement.src = config.bgPath + scene.bg;
  }

  // キャラ表示
  ["left", "center", "right"].forEach(pos => {
    const charData = scene.characters?.find(c => c.side === pos);
    const img = charData?.src;
    const effect = charData?.effect || "";
    if (img && img.toLowerCase() !== "null") {
      charElements[pos].innerHTML = `<img src="${config.charPath + img}" class="char-image ${effect}">`;
    } else {
      charElements[pos].innerHTML = "";
    }
  });

  // 名前・色
  nameBox.textContent = scene.name || "";
  nameBox.style.color = characterColors[scene.name] || characterColors[""];

  // フォントサイズと速度（キャラごとに反映）
  const style = characterStyles[scene.name] || characterStyles[""];
  currentFontSize = style.fontSize || characterStyles[""].fontSize;
  currentSpeed = style.speed || characterStyles[""].speed;
  dialogueBox.style.setProperty("--fontSize", currentFontSize);
  dialogueBox.style.fontSize = currentFontSize;

  // セリフ表示
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

// テキスト表示（タイプ風）
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

// 選択肢表示
function showChoices(choices) {
  clearChoices();
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.className = "choice-button";
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

// 次のシーンへ
function nextScene() {
  if (isTextDisplaying) {
    clearTimeout(autoTimeout);
    const fullText = scenarioData.scenes[currentSceneIndex].text;
    textBox.textContent = fullText;
    isTextDisplaying = false;
  } else {
    currentSceneIndex++;
    showScene(currentSceneIndex);
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

// ゲーム画面クリック処理
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
