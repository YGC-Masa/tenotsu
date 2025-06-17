import { config } from "./config.js";
import { characterColors } from "./characterColors.js";
import { characterStyles } from "./characterStyles.js";

const bgElem = document.getElementById("background");
const charLayer = document.getElementById("char-layer");
const nameElem = document.getElementById("name");
const textElem = document.getElementById("text");
const choicesElem = document.getElementById("choices");

let currentScenario = null;
let currentIndex = 0;
let autoPlay = false;
let autoPlayTimeout = null;

// 現在表示中のキャラ情報 { slotIndex: {name, imgElem, effectClass} }
const displayedChars = {};

function setBackground(src) {
  if (bgElem.style.backgroundImage !== `url(${src})`) {
    bgElem.style.backgroundImage = `url(${src})`;
  }
}

function clearCharacters() {
  charLayer.innerHTML = "";
  Object.keys(displayedChars).forEach(key => delete displayedChars[key]);
}

function showCharacter(slot, charName, imgSrc, effect = "") {
  // slotは0～2の想定（三人まで横並び）
  if (!displayedChars[slot]) {
    const slotDiv = document.createElement("div");
    slotDiv.className = "char-slot";
    charLayer.appendChild(slotDiv);
    displayedChars[slot] = { slotDiv };
  }
  const slotDiv = displayedChars[slot].slotDiv;

  let imgElem = slotDiv.querySelector("img");
  if (!imgElem) {
    imgElem = document.createElement("img");
    imgElem.className = "char-image";
    slotDiv.appendChild(imgElem);
  }

  // 画像差し替えとエフェクト付与
  imgElem.src = imgSrc;
  imgElem.className = "char-image"; // クラスリセット
  if (effect) {
    imgElem.classList.add(effect);
  }
  displayedChars[slot].name = charName;
  displayedChars[slot].imgElem = imgElem;
}

function removeCharacter(slot) {
  if (displayedChars[slot]) {
    const slotDiv = displayedChars[slot].slotDiv;
    slotDiv.innerHTML = "";
    delete displayedChars[slot];
  }
}

function setName(name) {
  if (name === "") {
    nameElem.textContent = "";
    nameElem.style.color = characterColors[""] || "#CCC";
  } else {
    nameElem.textContent = name;
    nameElem.style.color = characterColors[name] || "#FFF";
  }
}

function setText(text, fontSize = "1em", speed = 30) {
  // テキストの一文字ずつ表示（速度ms）
  return new Promise((resolve) => {
    textElem.textContent = "";
    let i = 0;
    textElem.style.fontSize = fontSize;

    function typeChar() {
      if (i < text.length) {
        textElem.textContent += text.charAt(i);
        i++;
        setTimeout(typeChar, speed);
      } else {
        resolve();
      }
    }
    typeChar();
  });
}

function clearChoices() {
  choicesElem.innerHTML = "";
}

function showChoices(choices) {
  clearChoices();
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      loadScenario(choice.next);
    };
    choicesElem.appendChild(btn);
  });
}

// シナリオ読み込みと再生
async function loadScenario(scenarioFile) {
  clearChoices();
  setName("");
  textElem.textContent = "";

  try {
    const response = await fetch(`./scenario/${scenarioFile}`);
    const data = await response.json();

    currentScenario = data;
    currentIndex = 0;

    await playScenario();
  } catch (e) {
    console.error("シナリオ読み込み失敗", e);
  }
}

async function playScenario() {
  if (!currentScenario || currentIndex >= currentScenario.length) {
    clearCharacters();
    return;
  }

  const step = currentScenario[currentIndex];

  // 背景切り替え
  if (step.bg) {
    setBackground(config.bgPath + step.bg);
  }

  // キャラ表示処理
  if (step.characters) {
    clearCharacters();
    step.characters.forEach((char, idx) => {
      if (char.name) {
        const charImgPath = config.charPath + char.img;
        showCharacter(idx, char.name, charImgPath, char.effect);
      }
    });
  }

  // 名前設定
  setName(step.name || "");

  // フォントサイズ・速度はキャラごとにデフォルトがあり、個別指定があれば優先
  let fontSize = "1em";
  let speed = 30;

  if (step.name && characterStyles[step.name]) {
    fontSize = characterStyles[step.name].fontSize || fontSize;
    speed = characterStyles[step.name].speed || speed;
  }
  if (step.fontSize) fontSize = step.fontSize;
  if (step.speed) speed = step.speed;

  // セリフ表示
  await setText(step.text || "", fontSize, speed);

  // 選択肢表示
  if (step.choices && step.choices.length > 0) {
    showChoices(step.choices);
  } else {
    // 次のステップへ
    currentIndex++;
    await playScenario();
  }
}

// ページロード時
window.addEventListener("load", () => {
  // CSSのvh対策（モバイルのURLバー問題）
  function setVH() {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  }
  setVH();
  window.addEventListener("resize", setVH);

  loadScenario("000start.json");
});
