import { config } from "./config.js";
import { characterColors } from "./characterColors.js";
import { characterStyles } from "./characterStyles.js";
import { setTextWithSpeed, skipText, setCharacterStyle } from "./textHandler.js";

let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let bgm = null;
let isTextAnimating = false;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

function showScene(scene) {
  // 背景
  if (scene.bg) {
    bgEl.src = config.bgPath + scene.bg;
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

  // キャラ表示
  if (scene.characters) {
    ["left", "center", "right"].forEach((pos) => {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      slot.innerHTML = "";

      if (charData && charData.src) {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");

        // エフェクト
        if (charData.effect) {
          img.classList.add(charData.effect);
        } else {
          img.classList.add("fadein"); // デフォルト効果
        }

        slot.appendChild(img);
      }
    });
  }

  // 名前とセリフ
  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || "#FFFFFF";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;

    setCharacterStyle(scene.name, characterStyles);

    isTextAnimating = true;
    setTextWithSpeed(
      scene.text,
      textEl,
      characterStyles[scene.name]?.speed || 40,
      () => {
        isTextAnimating = false;
        if (isAuto) {
          next();
        }
      }
    );
  } else {
    nameEl.textContent = "";
    textEl.textContent = "";
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

document.addEventListener("click", () => {
  if (isTextAnimating) {
    // 文字送り中ならスキップ
    fetch(config.scenarioPath + currentScenario)
      .then((res) => res.json())
      .then((data) => {
        const scene = data.scenes[currentIndex];
        skipText(scene.text, textEl);
        isTextAnimating = false;
      });
  } else if (!isAuto && choicesEl.children.length === 0) {
    next();
  }
});

window.addEventListener("load", () => {
  loadScenario(currentScenario);
  setVhVariable();
});

window.addEventListener("resize", () => {
  setVhVariable();
});

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}
