// script.js - v022 モバイル縦フォーカス対応
let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 2000;
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

function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

async function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    return await window.effects[effectName](el);
  } else if (window.effects?.fadein) {
    return await window.effects.fadein(el);
  }
}

function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
    charSlots[pos].style.display = "none";
  }
}

async function showScene(scene) {
  if (!scene) return;

  if (scene.bg) {
    await applyEffect(bgEl, scene.bgEffect || "fadeout");
    await new Promise((resolve) => {
      bgEl.onload = resolve;
      bgEl.src = config.bgPath + scene.bg;
    });
    await applyEffect(bgEl, scene.bgEffect || "fadein");
  }

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

  if (scene.characters) {
    const lastSide = scene.characters[scene.characters.length - 1]?.side;

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

        // モバイル縦：最後のキャラのみ表示
        if (isMobilePortrait()) {
          slot.style.display = (pos === lastSide) ? "block" : "none";
        } else {
          slot.style.display = "block";
        }
      } else if (charData && charData.src === "NULL") {
        slot.innerHTML = "";
        slot.style.display = "none";
      }
    });
  }

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

  if (scene.voice) {
    try {
      const voice = new Audio(config.voicePath + scene.voice);
      voice.play();
    } catch (e) {
      console.warn("ボイス再生エラー:", scene.voice);
    }
  }

  if (scene.se) {
    try {
      const se = new Audio(config.sePath + scene.se);
      se.play();
    } catch (e) {
      console.warn("SE再生エラー:", scene.se);
    }
  }

  if (scene.choices) {
    choicesEl.innerHTML = "";
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        textEl.innerHTML = "";
        nameEl.textContent = "";
        clearCharacters();
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
