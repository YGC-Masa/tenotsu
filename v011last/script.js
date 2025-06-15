// キャラクター名と色の対応（characterColors.jsと連携）
const characterColors = {
  "": "#C0C0C0",
  "緋奈": "#d3381c",
  "藍": "#0067C0",
  "翠": "#005931",
  "こがね": "#FFF450",
  "琥珀": "#F68B1F",
};

// グローバル変数
let scenarioData = null;     // 現在読み込んだシナリオJSONデータ
let currentSceneIndex = 0;   // シナリオの進行インデックス
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

// フォントサイズ・速度の初期値
let fontSize = "1em";
let textSpeed = 40;

// シナリオ読み込み関数
async function loadScenario(url) {
  try {
    const response = await fetch(url);
    scenarioData = await response.json();
    currentSceneIndex = 0;

    // fontSize, speedがあれば初期設定
    if (scenarioData.fontSize) fontSize = scenarioData.fontSize;
    if (scenarioData.speed) textSpeed = scenarioData.speed;

    dialogueBox.style.setProperty("--fontSize", fontSize);

    showScene(currentSceneIndex);
  } catch (e) {
    console.error("シナリオ読み込み失敗", e);
  }
}

// シーン表示
function showScene(index) {
  if (!scenarioData || !scenarioData.scenes || index >= scenarioData.scenes.length) {
    endScenario();
    return;
  }
  const scene = scenarioData.scenes[index];

  // 背景変更
  if (scene.bg) {
    changeBackground(scene.bg);
  }

  // キャラクター表示切り替え
  if (scene.characters) {
    scene.characters.forEach(charData => {
      changeCharacter(charData.side, charData.src);
    });
  }

  // キャラクターを指定しない場所はnullでクリア
  ["left", "center", "right"].forEach(side => {
    if (!scene.characters || !scene.characters.some(c => c.side === side)) {
      changeCharacter(side, null);
    }
  });

  // 名前色
  nameBox.style.color = characterColors[scene.name] || characterColors[""];

  // 名前表示
  nameBox.textContent = scene.name;

  // テキスト表示（文字送り）
  displayText(scene.text, scene.speed || textSpeed);

  // 選択肢がある場合は表示
  if (scene.choices && scene.choices.length > 0) {
    showChoices(scene.choices);
  } else {
    clearChoices();
  }
}

// 背景変更（フェード無し版）
function changeBackground(src) {
  backgroundElement.src = src;
}

// キャラクター変更。src nullなら非表示
function changeCharacter(side, src) {
  const el = charElements[side];
  if (!el) return;

  if (!src || src.toLowerCase() === "null") {
    el.innerHTML = "";
    return;
  }
  el.innerHTML = `<img src="${src}" alt="${side}">`;
}

// 文字送り表示
function displayText(text, speed) {
  clearTimeout(autoTimeout);
  isTextDisplaying = true;
  textBox.textContent = "";

  let i = 0;
  function type() {
    if (i < text.length) {
      textBox.textContent += text.charAt(i);
      i++;
      autoTimeout = setTimeout(type, speed);
    } else {
      isTextDisplaying = false;
      // 自動モード時は少し待って次へ
      if (autoMode) {
        autoTimeout = setTimeout(() => {
          nextScene();
        }, 1500);
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
    btn.textContent = choice.text;
    btn.onclick = () => {
      if (choice.jump) {
        if (choice.jump.startsWith("http")) {
          window.open(choice.jump, "_blank");
        } else {
          loadScenario(choice.jump);
        }
      } else {
        nextScene();
      }
      clearChoices();
    };
    choicesBox.appendChild(btn);
  });
}

// 選択肢クリア
function clearChoices() {
  choicesBox.innerHTML = "";
}

// 次のシーンへ
function nextScene() {
  if (isTextDisplaying) {
    // 表示中は一気に表示
    clearTimeout(autoTimeout);
    textBox.textContent = scenarioData.scenes[currentSceneIndex].text;
    isTextDisplaying = false;
  } else {
    currentSceneIndex++;
    if (currentSceneIndex >= scenarioData.scenes.length) {
      endScenario();
    } else {
      showScene(currentSceneIndex);
    }
  }
}

// シナリオ終了処理
function endScenario() {
  nameBox.style.color = characterColors[""];
  nameBox.textContent = "";
  textBox.textContent = "物語は続く・・・";
  clearChoices();
  // オートモード停止
  autoMode = false;
  clearTimeout(autoTimeout);
}

// オートモード切替
function toggleAutoMode() {
  autoMode = !autoMode;
  if (autoMode && !isTextDisplaying) {
    autoTimeout = setTimeout(() => {
      nextScene();
    }, 1500);
  } else {
    clearTimeout(autoTimeout);
  }
}

// クリックイベント処理
function onClickGameArea() {
  if (isTextDisplaying) {
    clearTimeout(autoTimeout);
    textBox.textContent = scenarioData.scenes[currentSceneIndex].text;
    isTextDisplaying = false;
  } else {
    nextScene();
  }
}

// ダブルクリックでオートモード切替
function onDoubleClickGameArea() {
  toggleAutoMode();
}

// 初期化
function init() {
  document.getElementById("game-container").addEventListener("click", onClickGameArea);
  document.getElementById("game-container").addEventListener("dblclick", onDoubleClickGameArea);
  loadScenario("scenario/000start.json");
}

// ページロード時に初期化実行
window.addEventListener("load", init);
