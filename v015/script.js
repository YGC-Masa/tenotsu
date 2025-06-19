// script.js - v015-04 完全版

let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 2000; // オートモード時の待機時間（ミリ秒）
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
    applyEffect(bgEl, scene.bgEffect || "fadeout");
    await new Promise((resolve) => setTimeout(resolve, 500));
    bgEl.src = config.bgPath + scene.bg;
    applyEffect(bgEl, scene.bgEffect || "fadein");
  }

  // BGM切り替え
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

  // 名前とセリフ
  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || "#FFFFFF";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;

    setCharacterStyle(scene.name);
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
  fetch(config.scenarioPath + filename)
    .then((res) => res.json())
    .then((data) => {
      showScene(data.scenes[0]);
    });
}

// 背景クリックでオートモード切替
bgEl.addEventListener("dblclick", () => {
  isAuto = !isAuto;
});

document.addEventListener("click", () => {
  if (!isAuto && choicesEl.children.length === 0 && !isPlaying) {
    next();
  }
});

window.addEventListener("load", () => {
  loadScenario(currentScenario);
  setVhVariable();
});

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", setVhVariable);
