// script.js

// 事前に config.js で以下のオブジェクトが定義されている想定
// const ASSET_BASE_PATHS = {
//   bg: "../assets2/bgev/",
//   char: "../assets2/char/",
//   bgm: "../assets2/bgm/",
// };

const gameContainer = document.getElementById("game-container");
const background = document.getElementById("background");
const charLeft = document.getElementById("char-left");
const charCenter = document.getElementById("char-center");
const charRight = document.getElementById("char-right");
const dialogueBox = document.getElementById("dialogue-box");
const nameElem = document.getElementById("name");
const textElem = document.getElementById("text");
const choicesElem = document.getElementById("choices");

let scenarioData = null;
let currentIndex = 0;
let defaultFontSize = "1em";
let defaultSpeed = 30;  // ミリ秒/文字

// シナリオの素材パスをベースパス付きに加工する
function processScenarioPaths(scenario) {
  if (scenario.bg) {
    scenario.bg = ASSET_BASE_PATHS.bg + scenario.bg;
  }
  if (scenario.characters) {
    scenario.characters.forEach(char => {
      if (char.src) {
        char.src = ASSET_BASE_PATHS.char + char.src;
      }
    });
  }
  if (scenario.bgm) {
    scenario.bgm = ASSET_BASE_PATHS.bgm + scenario.bgm;
  }
  return scenario;
}

// セリフのテキストを速度でゆっくり表示
function typeText(text, speed, callback) {
  textElem.textContent = "";
  let i = 0;
  function next() {
    if (i < text.length) {
      textElem.textContent += text[i];
      i++;
      setTimeout(next, speed);
    } else if (callback) {
      callback();
    }
  }
  next();
}

// キャラ表示処理（左、中、右）
function showCharacters(chars) {
  // まず全キャラ消す
  charLeft.innerHTML = "";
  charCenter.innerHTML = "";
  charRight.innerHTML = "";

  chars.forEach(char => {
    const img = document.createElement("img");
    img.className = "char-image";
    img.src = char.src;
    // 表示位置によって親要素を変更
    if (char.side === "left") charLeft.appendChild(img);
    else if (char.side === "center") charCenter.appendChild(img);
    else if (char.side === "right") charRight.appendChild(img);
  });
}

// 選択肢表示
function showChoices(choices) {
  choicesElem.innerHTML = "";
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      // 選択肢ジャンプ先があれば
      if (choice.jumpTo) {
        loadScenario(choice.jumpTo);
      } else {
        nextStep();
      }
    };
    choicesElem.appendChild(btn);
  });
}

// シナリオの1つのステップを処理
function displayStep(step) {
  // 背景切替
  if (step.bg) {
    background.src = step.bg;
  }
  // キャラ表示
  if (step.characters) {
    showCharacters(step.characters);
  }

  // 名前
  nameElem.textContent = step.name || "";

  // フォントサイズ設定（個別指定があれば、なければデフォルト）
  dialogueBox.style.fontSize = step.fontSize || defaultFontSize;

  // セリフ速度（ミリ秒/文字）
  const speed = step.speed || defaultSpeed;

  // セリフタイプ表示
  typeText(step.text || "", speed, () => {
    // セリフ表示後に選択肢表示 or 次ステップ待ち
    if (step.choices) {
      showChoices(step.choices);
    } else {
      choicesElem.innerHTML = "";
      // ここで自動的に次へ進める場合はnextStep()呼ぶ（現仕様では手動）
    }
  });
}

// 次のシナリオステップへ
function nextStep() {
  currentIndex++;
  if (currentIndex >= scenarioData.length) {
    console.log("シナリオ終了");
    return;
  }
  displayStep(scenarioData[currentIndex]);
}

// シナリオJSONを読み込む関数
function loadScenario(path = "scenario/000start.json") {
  fetch(path)
    .then(response => response.json())
    .then(data => {
      // もしシナリオが配列形式でなくオブジェクト形式なら適宜修正
      // ここは配列前提
      scenarioData = data.map(processScenarioPaths);
      currentIndex = 0;

      // 最初のステップを表示
      displayStep(scenarioData[currentIndex]);
    })
    .catch(err => {
      console.error("シナリオ読み込み失敗:", err);
    });
}

window.onload = () => {
  loadScenario();
};
