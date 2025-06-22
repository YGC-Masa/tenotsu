// script.js - v021-12（初期背景読み込みfix、fontSize優先）

let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 1750;
let bgm = null;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

let defaultFontSize = "1em";
let defaultSpeed = 40;
let currentSpeed = defaultSpeed;
let isPlaying = false;

function setTextWithSpeed(text, speed, callback) {
  isPlaying = true;
  textEl.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(interval);
      isPlaying = false;
      if (callback) callback();
    }
  }, speed);
}

function setCharacterStyle(name, scene = {}) {
  const style = characterStyles[name] || characterStyles[""];
  const fontSize = scene.fontSize || style.fontSize || defaultFontSize;
  currentSpeed = scene.speed || style.speed || defaultSpeed;
  document.documentElement.style.setProperty("--fontSize", fontSize);
}

async function applyEffect(el, effectName) {
  return new Promise((resolve) => {
    if (window.effects && effectName && window.effects[effectName]) {
      window.effects[effectName](el, resolve);
    } else {
      window.effects?.fadein(el, resolve);
    }
  });
}

function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
  }
}

async function showScene(scene) {
  if (!scene) return;

  // 背景処理
  if (scene.bg) {
    await applyEffect(bgEl, scene.bgEffect || "fadeout");

    await new Promise((resolve) => {
      bgEl.onload = () => resolve();
      bgEl.src = config.bgPath + scene.bg;
      if (bgEl.complete) resolve(); // キャッシュ済み対応
    });

    await applyEffect(bgEl, scene.bgEffect || "fadein");
  }

  // BGM処理
  if (scene.bgm !== undefined) {
    if (bgm) {
      bgm.pause();
      bgm = null;
    }
    if (scene.bgm) {
      bgm = new Audio(config.bgmPath + scene.bgm);
      bgm.loop = true;
      bgm.play();
    }
  }

  // キャラクター表示
  if (scene.characters) {
    ["left", "center", "right"].forEach((pos) => {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");
        slot.innerHTML = "";
        slot.appendChild(img);
        applyEffect(img, charData.effect || "fadein");
      } else if (charData && charData.src === "NULL") {
        slot.innerHTML = "";
      }
    });
  }

  // テキストと名前
  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || characterColors[""] || "#C0C0C0";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;
    setCharacterStyle(scene.name, scene);
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAuto) {
        setTimeout(() => {
          if (!isPlaying) next();
        }, autoWait);
      }
    });
  }

  // ボイス
  if (scene.voice) {
    try {
      const voice = new Audio(config.voicePath + scene.voice);
      voice.play();
    } catch (e) {
      console.warn("ボイス再生エラー:", scene.voice);
    }
  }

  // 効果音
  if (scene.se) {
    try {
      const se = new Audio(config.sePath + scene.se);
      se.play();
    } catch (e) {
      console.warn("SE再生エラー:", scene.se);
    }
  }

  // 選択肢
  if (scene.choices) {
    choicesEl.innerHTML = "";
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        textEl.innerHTML = "";
        nameEl.textContent = "";
        if (choice.jump) {
          loadScenario(choice.jump);
        } else if (choice.url) {
          location.href = choice.url;
        }
      };
      choicesEl.appendChild(btn);
    });
  } else {
    choicesEl.innerHTML = "";
  }
}

function next() {
  fetch(config.scenarioPath + currentScenario)
    .then((res) => res.json())
    .then((data) => {
      currentIndex++;
      if (currentIndex < data.scenes.length) {
        showScene(data.scenes[currentIndex]);
      }
    });
}

function loadScenario(filename) {
  currentScenario = filename;
  currentIndex = 0;
  clearCharacters();
  fetch(config.scenarioPath + filename)
    .then((res) => res.json())
    .then((data) => {
      showScene(data.scenes[0]);
    });
}

// オート再生切り替え（ダブルクリック）
bgEl.addEventListener("dblclick", () => {
  isAuto = !isAuto;
});

// 通常クリックで次へ
document.addEventListener("click", () => {
  if (!isAuto && choicesEl.children.length === 0 && !isPlaying) {
    next();
  }
});

// 読み込み時
window.addEventListener("load", () => {
  loadScenario(currentScenario);
  setVhVariable();
});

// モバイル高さ対応
function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", setVhVariable);
