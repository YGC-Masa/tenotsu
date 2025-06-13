// script.js

// グローバル変数
let scenario = [];
let currentLine = 0;
let isTyping = false;
let typingSpeed = 30;
let defaultFontSize = "1.2em";
let autoMode = false;
let autoTimer = null;

// DOM 要素取得
const bg = document.getElementById("background");
const nameBox = document.getElementById("name");
const textBox = document.getElementById("text");
const dialogueBox = document.getElementById("dialogue-box");
const choicesBox = document.getElementById("choices");
const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right")
};

// レスポンシブ用スケール取得
function getResponsiveScale() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspect = w / h;
  if (aspect < 1) {
    // 縦画面スマホ
    return 0.7;
  } else if (w < 768) {
    // 小型横向き
    return 0.8;
  }
  // PCなど大きめ
  return 1.0;
}

// エフェクト適用: element に effect クラスを一度だけ付与
function applyEffect(element, effect) {
  if (!effect) effect = "dissolve";
  // 既存クラスをクリアして再トリガー
  element.classList.remove(...element.classList);
  void element.offsetWidth; // リフロー強制
  element.classList.add(effect);
}

// キャラクター表示・更新
function setCharacter({ side, src, effect, scale }) {
  const container = charSlots[side];
  if (!container) {
    console.warn("Invalid side:", side);
    return;
  }
  container.innerHTML = "";
  if (!src) {
    // src が null なら退場
    return;
  }
  const img = document.createElement("img");
  img.src = src;
  img.className = "char-image";
  // scale 指定がなければレスポンシブ値を使用
  const s = (typeof scale === "number") ? scale : getResponsiveScale();
  img.style.transform = `scale(${s})`;
  if (effect) {
    applyEffect(img, effect);
  }
  container.appendChild(img);
}

// 背景画像切替
function setBackground(src, effect) {
  if (effect) {
    applyEffect(bg, effect);
    // エフェクトが fade-out 等の場合、タイミングをずらして src を切り替えたい場合はここで調整可能
  }
  bg.src = src;
}

// セリフ表示
function showDialogue({ name, text, speed, fontSize: size }) {
  // 名前表示
  if (nameBox) {
    nameBox.textContent = name || "";
    nameBox.style.color = (window.characterColors && characterColors[name]) || "#C0C0C0";
  }
  // フォントサイズ
  textBox.style.fontSize = size || defaultFontSize;
  typingSpeed = speed || 30;
  typeText(text || "");
}

// タイピング表示
function typeText(text) {
  isTyping = true;
  textBox.textContent = "";
  let i = 0;
  function type() {
    if (!isTyping) {
      // 途中スキップされている場合、一気に表示
      textBox.textContent = text;
      return;
    }
    if (i < text.length) {
      textBox.textContent += text[i++];
      setTimeout(type, typingSpeed);
    } else {
      // 完了
      isTyping = false;
      // オートモード時は次行予約
      if (autoMode) {
        clearTimeout(autoTimer);
        autoTimer = setTimeout(nextLine, 1500);
      }
    }
  }
  type();
}

// 選択肢表示
function showChoices(choices) {
  choicesBox.innerHTML = "";
  // クリック可能にするため pointer-events 自動で有効化
  choicesBox.style.pointerEvents = "auto";
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      // クリックでオート解除
      if (autoMode) {
        autoMode = false;
        clearTimeout(autoTimer);
      }
      if (choice.jumpToUrl) {
        window.location.href = choice.jumpToUrl;
        return;
      }
      if (choice.jumpToScenario) {
        loadScenario(choice.jumpToScenario);
        return;
      }
      if (typeof choice.jumpToLine === "number") {
        currentLine = choice.jumpToLine;
        playLine();
        return;
      }
      // その他: 次へ進む
      currentLine++;
      playLine();
    };
    choicesBox.appendChild(btn);
  });
}

// シーン表示: 現在の行を再生
function playLine() {
  // 既存のオートタイマー解除
  clearTimeout(autoTimer);
  // 選択肢クリア
  choicesBox.innerHTML = "";
  choicesBox.style.pointerEvents = "none";

  const line = scenario[currentLine];
  if (!line) return;

  // 背景
  if (line.background) {
    setBackground(line.background, line.effect);
  }
  // キャラクター配列
  if (Array.isArray(line.characters)) {
    // 同時表示: 既存表示は上書き or 退場は src:null
    line.characters.forEach(c => setCharacter(c));
  }
  // 選択肢優先
  if (Array.isArray(line.choices)) {
    showChoices(line.choices);
  } else {
    // セリフ表示
    showDialogue(line);
  }
}

// 次の行へ
function nextLine() {
  if (isTyping) {
    // タイピング中ならスキップ
    isTyping = false;
    return;
  }
  currentLine++;
  playLine();
}

// シナリオ読み込み
function loadScenario(filename) {
  fetch(`scenario/${filename}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to load scenario: " + filename);
      return res.json();
    })
    .then(data => {
      scenario = data;
      currentLine = 0;
      playLine();
    })
    .catch(err => {
      console.error(err);
    });
}

// オートモード切替（ダブルクリック／ダブルタップ用）
function handleAutoToggle() {
  let lastTap = 0;
  // PC: dblclick
  bg.addEventListener("dblclick", () => {
    autoMode = !autoMode;
    if (autoMode) {
      // オート開始: タイピング中なら完了させてから次行
      if (isTyping) {
        isTyping = false;
      }
      nextLine();
    } else {
      clearTimeout(autoTimer);
    }
  });
  // タッチ: double-tap 検出
  bg.addEventListener("touchend", (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      autoMode = !autoMode;
      if (autoMode) {
        if (isTyping) isTyping = false;
        nextLine();
      } else {
        clearTimeout(autoTimer);
      }
    }
    lastTap = now;
  });
}

// 画面リサイズ時: 表示中キャラを再スケール
window.addEventListener("resize", () => {
  const line = scenario[currentLine];
  if (!line) return;
  if (Array.isArray(line.characters)) {
    // 再表示: 再度 setCharacter を呼ぶ
    line.characters.forEach(c => setCharacter(c));
  }
});

// セリフボックスクリックで進行 or スキップ
dialogueBox.addEventListener("click", () => {
  nextLine();
});

// 初期化: characterColors.js は index.html で読み込まれている前提
window.addEventListener("load", () => {
  handleAutoToggle();
  // 最初のシナリオ読み込み
  loadScenario("000start.json");
});
