// script.js - ノベルゲームのシナリオ管理・表示制御

// グローバル変数
let currentScenario = "000start.json"; // 現在のシナリオファイル
let currentIndex = 0;                  // シナリオ内の現在シーンインデックス
let bgm = null;                       // BGM Audioオブジェクト
let lastActiveSide = null;             // 最後に表示したキャラの位置
let isMuted = true;                   // ミュート状態
let typingInterval = null;             // 文字表示のタイマー
let isAutoMode = false;                // オートモードON/OFF
let autoWaitTime = 2000;               // オートモードの待機時間（ms）
let isPlaying = false;                 // 文字表示中フラグ
let currentSpeed = 40;                 // 文字表示速度（ms）
let defaultSpeed = 40;                 // デフォルト速度
let defaultFontSize = "1em";           // デフォルトフォントサイズ
let textAreaVisible = true;            // テキストエリア表示状態
let isScenarioEnded = false;           // シナリオ終了状態フラグ
let returnToTitleHandler = null;       // タイトル戻り用イベントハンドラ

// DOM要素取得
const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const evLayer = document.getElementById("ev-layer");
const clickLayer = document.getElementById("click-layer");
const dialogueBox = document.getElementById("dialogue-box");

// キャラクター表示スロット
const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right")
};

// ウィンドウ高さのCSS変数設定（モバイル対応用）
function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

// テキストエリアの表示・非表示切替
function updateTextAreaVisibility(show) {
  textAreaVisible = show;
  dialogueBox.classList.toggle("hidden", !show);
}

// 文字を1文字ずつ表示（速度制御つき）
function setTextWithSpeed(text, speed, callback) {
  if (typingInterval) clearInterval(typingInterval);
  isPlaying = true;
  textEl.innerHTML = "";
  let i = 0;
  typingInterval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(typingInterval);
      typingInterval = null;
      isPlaying = false;
      if (callback) callback();
      if (isAutoMode && choicesEl.children.length === 0) {
        setTimeout(() => { if (!isPlaying) next(); }, autoWaitTime);
      }
    }
  }, speed);
}

// キャラクター名に応じたスタイル設定（色・速度・フォントサイズ）
function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || characterStyles[""];
  const fontSize = scene.fontSize || style.fontSize || defaultFontSize;
  currentSpeed = scene.speed || style.speed || defaultSpeed;
  nameEl.style.color = style.color || "#C0C0C0";
  document.documentElement.style.setProperty("--fontSize", fontSize);
}

// キャラクター表示スロットを初期化
function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
    charSlots[pos].classList.remove("active");
  }
  lastActiveSide = null;
}

// モバイル縦画面時に最後に表示したキャラのみ表示、それ以外は非表示
function updateCharacterDisplay() {
  const isPortrait = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
  for (const pos in charSlots) {
    const slot = charSlots[pos];
    const hasCharacter = slot.children.length > 0;
    slot.classList.toggle("active", isPortrait ? (pos === lastActiveSide && hasCharacter) : hasCharacter);
  }
}

// シーン遷移時に各種エフェクトがあれば適用（例: fadein/fadeout）
async function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    return await window.effects[effectName](el);
  } else if (window.effects?.fadein) {
    return await window.effects.fadein(el);
  }
}

// シーン表示メイン関数
async function showScene(scene) {
  if (!scene) return;
  if (typingInterval) clearInterval(typingInterval);

  // 初期化
  textEl.innerHTML = "";
  nameEl.textContent = "";
  evLayer.innerHTML = "";
  choicesEl.innerHTML = "";

  // テキストエリア表示制御
  if (scene.textareashow !== undefined) updateTextAreaVisibility(scene.textareashow);

  // ランダム画像・テキストの表示制御
  if (scene.randomimageson === false && typeof randomImagesOff === "function") randomImagesOff();
  if (scene.randomimageson === true && typeof randomImagesOn === "function") randomImagesOn();
  if (scene.randomtexts !== undefined) {
    scene.randomtexts ? randomTextsOn?.() : randomTextsOff?.();
  }

  // 背景画像差し替え（エフェクト適用）
  if (scene.bg) {
    await applyEffect(bgEl, scene.bgEffect || "fadeout");
    await new Promise(resolve => {
      bgEl.onload = resolve;
      bgEl.src = config.bgPath + scene.bg;
    });
    await applyEffect(bgEl, scene.bgEffect || "fadein");
  }

  // EV画像表示
  if (scene.showev) {
    const evImg = document.createElement("img");
    evImg.src = config.evPath + scene.showev;
    evImg.classList.add("ev-image");
    evImg.onload = () => applyEffect(evImg, scene.evEffect || "fadein");
    evLayer.appendChild(evImg);
  }

  // CG画像表示
  if (scene.showcg) {
    const cgImg = document.createElement("img");
    cgImg.src = config.cgPath + scene.showcg;
    cgImg.classList.add("cg-image");
    cgImg.onload = () => applyEffect(cgImg, scene.cgEffect || "fadein");
    evLayer.appendChild(cgImg);
  }

  // BGM制御
  if (scene.bgm !== undefined) {
    if (bgm) bgm.pause();
    if (scene.bgm) {
      bgm = new Audio(config.bgmPath + scene.bgm);
      bgm.loop = true;
      bgm.muted = isMuted;
      bgm.play();
    }
  }

  // キャラクター表示
  if (scene.characters) {
    lastActiveSide = scene.characters[scene.characters.length - 1]?.side || null;
    ["left", "center", "right"].forEach(async (pos) => {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");
        slot.innerHTML = "";
        slot.appendChild(img);
        await applyEffect(img, charData.effect || "fadein");
      } else if (charData && charData.src === "NULL") {
        slot.innerHTML = "";
      }
    });
  }

  updateCharacterDisplay();

  // テキスト表示
  if (scene.name !== undefined && scene.text !== undefined) {
    nameEl.textContent = scene.name;
    setCharacterStyle(scene.name, scene);
    setTextWithSpeed(scene.text, currentSpeed);
  }

  // 音声・SE再生
  if (scene.voice) {
    const voice = new Audio(config.voicePath + scene.voice);
    voice.muted = isMuted;
    voice.play();
  }
  if (scene.se) {
    const se = new Audio(config.sePath + scene.se);
    se.muted = isMuted;
    se.play();
  }

  // 選択肢表示
  if (scene.choices) {
    scene.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        clearCharacters();
        textEl.innerHTML = "";
        nameEl.textContent = "";
        evLayer.innerHTML = "";
        if (choice.jump) {
          loadScenario(choice.jump);
        } else if (choice.url) {
          location.href = choice.url;
        }
      };
      choicesEl.appendChild(btn);
    });
  }

  // メニュー・リスト表示（scene.showmenu/showlist指定あれば）
  if (scene.showmenu) loadMenu(scene.showmenu);
  if (scene.showlist) loadList(scene.showlist);

  // 自動再生指定（テキストなし・選択肢なし）
  if (scene.auto && !scene.text && !scene.choices) {
    setTimeout(() => {
      if (!isPlaying) next();
    }, autoWaitTime);
  }
}

// 次シーン表示関数
function next() {
  fetch(config.scenarioPath + currentScenario + "?t=" + Date.now())
    .then(res => res.json())
    .then(data => {
      currentIndex++;
      const scenes = Array.isArray(data) ? data : data.scenes;
      if (currentIndex < scenes.length) {
        showScene(scenes[currentIndex]);
      } else {
        // シナリオ終了時の処理
        if (textAreaVisible) {
          nameEl.textContent = "";
          textEl.innerHTML = "（物語は つづく・・・（クリックでタイトルに戻ります））";
        }
        isAutoMode = false;
        isScenarioEnded = true;
      }
    });
}

// シナリオ読み込み関数
function loadScenario(filename) {
  // ランダム画像・テキストをOFF（存在すれば）
  randomImagesOff?.();
  randomTextsOff?.();

  currentScenario = filename;
  currentIndex = 0;
  isScenarioEnded = false;

  clearCharacters();
  textEl.innerHTML = "";
  nameEl.textContent = "";
  evLayer.innerHTML = "";

  hideMenuPanel?.();
  hideListPanel?.();

  if (typingInterval) clearInterval(typingInterval);
  updateTextAreaVisibility(true);

  fetch(config.scenarioPath + filename + "?t=" + Date.now())
    .then(res => res.json())
    .then(data => {
      const scenes = Array.isArray(data) ? data : data.scenes;
      showScene(scenes[0]);
    });
}

// クリックレイヤーのクリックイベント
clickLayer.addEventListener("click", () => {
  if (isScenarioEnded) {
    loadScenario("000start.json");
    return;
  }
  if (menuPanelVisible?.()) {
    hideMenuPanel?.();
    return;
  }
  if (!isPlaying && choicesEl.children.length === 0) {
    next();
  }
});

// ダブルクリック・連続タッチでメニュー表示は menuList.js 側でイベント登録予定

// ウィンドウリサイズ時処理
window.addEventListener("resize", () => {
  setVhVariable();
  updateCharacterDisplay();
});

// 初期読み込み時処理
window.addEventListener("DOMContentLoaded", () => {
  setVhVariable();
  loadScenario(currentScenario);
});
