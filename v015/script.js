let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let bgm = null;

let currentTextTimer = null;
let isTextAnimating = false;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right")
};

let defaultFontSize = "1em";
let defaultSpeed = 40;
let currentSpeed = defaultSpeed;
let autoDelay = 1200;

function setTextWithSpeed(text, speed, callback) {
  if (currentTextTimer) {
    clearInterval(currentTextTimer);
    currentTextTimer = null;
  }

  textEl.innerHTML = "";
  isTextAnimating = true;

  let i = 0;
  currentTextTimer = setInterval(() => {
    if (i < text.length) {
      textEl.innerHTML += text[i++];
    } else {
      clearInterval(currentTextTimer);
      currentTextTimer = null;
      isTextAnimating = false;
      if (callback) callback();
    }
  }, speed);
}

function setCharacterStyle(name) {
  const style = characterStyles[name] || characterStyles[""];
  document.documentElement.style.setProperty("--fontSize", style.fontSize || defaultFontSize);
  currentSpeed = style.speed || defaultSpeed;
}

function showScene(scene) {
  // 背景
  if (scene.bg) {
    bgEl.src = config.bgPath + scene.bg;
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

  // キャラ描画
  if (scene.characters) {
    ["left", "center", "right"].forEach(pos => {
      const slot = charSlots[pos];
      const charData = scene.characters.find(c => c.side === pos);
      slot.innerHTML = "";

      if (charData && charData.src) {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");

        // エフェクト
        if (charData.effect) {
          img.classList.add(charData.effect);
        } else {
          img.classList.add("fadein");
        }

        slot.appendChild(img);
      }
    });
  }

  // 名前・テキスト
  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || "#FFFFFF";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;

    setCharacterStyle(scene.name);
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAuto && !scene.choices) {
        setTimeout(() => {
          next();
        }, autoDelay);
      }
    });
  }

  // 選択肢
  if (scene.choices) {
    choicesEl.innerHTML = "";
    scene.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        loadScenario(choice.jump);
      };
      choicesEl.appendChild(btn);
    });
  } else {
    choicesEl.innerHTML = "";
  }
}

function next() {
  fetch(config.scenarioPath + currentScenario)
    .then(res => res.json())
    .then(data => {
      currentIndex++;
      if (currentIndex < data.scenes.length) {
        showScene(data.scenes[currentIndex]);
      }
    });
}

function loadScenario(filename) {
  currentScenario = filename;
  currentIndex = 0;
  fetch(config.scenarioPath + filename)
    .then(res => res.json())
    .then(data => {
      showScene(data.scenes[0]);
    });
}

// スキップ・クリック処理
document.addEventListener("click", () => {
  if (choicesEl.children.length > 0) return;

  if (isTextAnimating) {
    // 途中でも全文表示
    if (currentTextTimer) {
      clearInterval(currentTextTimer);
      currentTextTimer = null;
    }
    const text = textEl.textContent;
    const scene = getCurrentScene();
    textEl.innerHTML = scene ? scene.text : text;
    isTextAnimating = false;
  } else {
    next();
  }
});

function getCurrentScene() {
  // 現在のシーン情報を再取得
  try {
    const path = config.scenarioPath + currentScenario;
    const request = new XMLHttpRequest();
    request.open("GET", path, false); // 同期リクエスト（非推奨だが簡易実装）
    request.send(null);
    if (request.status === 200) {
      const data = JSON.parse(request.responseText);
      return data.scenes[currentIndex];
    }
  } catch (e) {
    console.error("現在のシーン取得失敗:", e);
  }
  return null;
}

// vh再設定
function setVhVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("load", () => {
  setVhVariable();
  loadScenario(currentScenario);
});

window.addEventListener("resize", () => {
  setVhVariable();
});

// キーボードでオート切替
document.addEventListener("keydown", (e) => {
  if (e.key === "a") {
    isAuto = !isAuto;
    console.log("Auto mode:", isAuto);
  }
});
