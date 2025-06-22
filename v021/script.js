let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 2000;
let bgm = null;
let voice = null;
let se = null;

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

function setCharacterStyle(name) {
  const style = characterStyles[name] || characterStyles[""];
  document.documentElement.style.setProperty("--fontSize", style.fontSize || defaultFontSize);
  currentSpeed = style.speed || defaultSpeed;
}

function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    window.effects[effectName](el);
  } else {
    window.effects?.fadein(el);
  }
}

async function showScene(scene) {
  if (!scene) return;

  // 背景切り替え
  if (scene.bg) {
    await new Promise((resolve) => {
      applyEffect(bgEl, scene.bgEffect || "fadeout");
      setTimeout(() => {
        bgEl.onload = () => {
          applyEffect(bgEl, scene.bgEffect || "fadein");
          resolve();
        };
        bgEl.src = config.bgPath + scene.bg;
      }, 500);
    });
  }

  // BGM
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

  // SE
  if (scene.se) {
    try {
      se = new Audio(config.sePath + scene.se);
      se.play();
    } catch (e) {
      console.warn("SE再生失敗:", scene.se);
    }
  }

  // ボイス
  if (scene.voice) {
    try {
      voice = new Audio(config.voicePath + scene.voice);
      voice.play();
    } catch (e) {
      console.warn("ボイス再生失敗:", scene.voice);
    }
  }

  // キャラ表示
  if (scene.characters) {
    ["left", "center", "right"].forEach((pos) => {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      slot.innerHTML = "";
      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");
        slot.appendChild(img);
        applyEffect(img, charData.effect || "fadein");
      }
    });
  }

  // テキスト・名前
  if (scene.text !== undefined) {
    const color = characterColors[scene.name] || characterColors[""] || "#C0C0C0";
    nameEl.textContent = scene.name || "";
    nameEl.style.color = color;
    setCharacterStyle(scene.name || "");
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAuto) {
        setTimeout(() => {
          if (!isPlaying) next();
        }, autoWait);
      }
    });
  }

  // 選択肢
  if (scene.choices) {
    choicesEl.innerHTML = "";
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        // テキストバッファクリア
        textEl.innerHTML = "";
        nameEl.textContent = "";
        // 処理分岐
        if (choice.jump) {
          loadScenario(choice.jump);
        } else if (choice.se) {
          const s = new Audio(config.sePath + choice.se);
          s.play();
        } else if (choice.voice) {
          const v = new Audio(config.voicePath + choice.voice);
          v.play();
        } else if (choice.url) {
          window.location.href = choice.url;
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

  // キャラスロットクリア
  Object.values(charSlots).forEach(slot => slot.innerHTML = "");

  fetch(config.scenarioPath + filename)
    .then((res) => res.json())
    .then((data) => {
      showScene(data.scenes[0]);
    });
}

// オートモード：背景ダブルクリックで切替
bgEl.addEventListener("dblclick", () => {
  isAuto = !isAuto;
});

// 通常クリック：自動再生オフ時のみ進行
document.addEventListener("click", () => {
  if (!isAuto && choicesEl.children.length === 0 && !isPlaying) {
    next();
  }
});

// 初期化
window.addEventListener("load", () => {
  loadScenario(currentScenario);
  setVhVariable();
});

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", setVhVariable);
