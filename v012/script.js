// 文字色設定（characterColors.jsで定義）
const characterColors = {
  "": "#C0C0C0",        // モブやナレーション用
  "緋奈": "#d3381c",
  "藍": "#0067C0",
  "翠": "#005931",
  "こがね": "#FFF450",
  "琥珀": "#F68B1F",
};

const gameContainer = document.getElementById('game-container');
const background = document.getElementById('background');
const nameBox = document.getElementById('name');
const textBox = document.getElementById('text');
const choicesBox = document.getElementById('choices');

const charSlots = {
  left: document.getElementById('char-img-left'),
  center: document.getElementById('char-img-center'),
  right: document.getElementById('char-img-right'),
};

let scenario = null; // JSONシナリオオブジェクト
let currentSceneIndex = 0;

let textSpeed = 30;
let isTyping = false;
let typingTimeout = null;
let fullText = '';
let currentCharIndex = 0;

function loadScenario(jsonData) {
  scenario = jsonData;
  currentSceneIndex = 0;
  textSpeed = jsonData.speed || 30;
  showScene(currentSceneIndex);
}

function showScene(index) {
  if (!scenario || index >= scenario.scenes.length) {
    // シナリオ終了
    nameBox.textContent = "";
    textBox.textContent = "物語は続く・・・";
    clearCharacters();
    choicesBox.innerHTML = "";
    return;
  }

  const scene = scenario.scenes[index];

  // 背景切り替え（あれば）
  if (scene.bg) {
    background.src = scene.bg;
  }

  // キャラクター差し替え
  if (scene.characters) {
    ['left', 'center', 'right'].forEach((pos, i) => {
      const char = scene.characters[i];
      if (char && char.src) {
        changeCharacter(pos, char.src);
      } else {
        changeCharacter(pos, null);
      }
    });
  } else {
    clearCharacters();
  }

  // 名前表示＆文字色
  if (scene.name !== undefined) {
    nameBox.textContent = scene.name;
    nameBox.style.color = characterColors[scene.name] || "#C0C0C0";
  } else {
    nameBox.textContent = "";
  }

  // テキスト表示準備
  if (scene.text !== undefined) {
    startTyping(scene.text);
  } else {
    textBox.textContent = "";
  }

  // 選択肢は今回は空にしておく（対応すれば拡張可能）
  choicesBox.innerHTML = "";
}

function changeCharacter(position, src) {
  if (!charSlots[position]) return;
  if (src === null) {
    charSlots[position].src = "";
    charSlots[position].style.visibility = "hidden";
  } else {
    charSlots[position].src = src;
    charSlots[position].style.visibility = "visible";
  }
}

function clearCharacters() {
  ['left', 'center', 'right'].forEach(pos => {
    changeCharacter(pos, null);
  });
}

// テキストを1文字ずつ表示する
function startTyping(text) {
  fullText = text;
  currentCharIndex = 0;
  textBox.textContent = "";
  isTyping = true;
  typeNextChar();
}

function typeNextChar() {
  if (currentCharIndex < fullText.length) {
    textBox.textContent += fullText[currentCharIndex];
    currentCharIndex++;
    typingTimeout = setTimeout(typeNextChar, textSpeed);
  } else {
    isTyping = false;
  }
}

// クリック処理：表示中なら一気出し、表示済みなら次シーンへ
gameContainer.addEventListener('click', () => {
  if (isTyping) {
    clearTimeout(typingTimeout);
    textBox.textContent = fullText;
    isTyping = false;
  } else {
    currentSceneIndex++;
    showScene(currentSceneIndex);
  }
});

// 最初のシナリオJSON読み込みは外部から呼ぶ想定
// 例：fetch('scenario.json').then(r => r.json()).then(loadScenario);

// 以下は動作確認用の簡単な呼び出し例（必ず外すか差し替えてください）
// loadScenario(サンプルシナリオJSON);
