"use strict";

const gameContainer = document.getElementById("game-container");
const backgroundImg = document.getElementById("background");
const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};
const dialogueBox = document.getElementById("dialogue-box");
const nameElem = document.getElementById("name");
const textElem = document.getElementById("text");
const choicesElem = document.getElementById("choices");

let scenario = null;
let currentSceneIndex = 0;
let isAutoMode = false;
let textTimer = null;
let textSpeed = 50;
let currentText = "";
let displayedTextLength = 0;

function fadeOut(element, duration = 600) {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = "0";
    setTimeout(() => resolve(), duration);
  });
}

function fadeIn(element, duration = 600) {
  return new Promise((resolve) => {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = "1";
    setTimeout(() => resolve(), duration);
  });
}

async function loadBackground(src) {
  if (!src) {
    backgroundImg.src = "";
    return;
  }
  await fadeOut(backgroundImg);
  return new Promise((resolve) => {
    backgroundImg.onload = async () => {
      await fadeIn(backgroundImg);
      resolve();
    };
    backgroundImg.src = src;
  });
}

async function changeCharacter(side, src) {
  const slot = charSlots[side];
  if (!slot) return;

  if (src === null || src === "null" || src === "") {
    // キャラを消す
    if (slot.firstChild) {
      await fadeOut(slot.firstChild);
      slot.removeChild(slot.firstChild);
    }
    return;
  }

  // キャラ画像差し替え
  let img = slot.querySelector("img");
  if (!img) {
    img = document.createElement("img");
    img.classList.add("char-image");
    slot.appendChild(img);
  }

  if (img.src.endsWith(src)) {
    // 同じ画像なら何もしない
    return;
  }

  await fadeOut(img);
  return new Promise((resolve) => {
    img.onload = async () => {
      await fadeIn(img);
      resolve();
    };
    img.src = src;
  });
}

// 文字表示処理
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function showText(text, speed = 50, fontSize = "1em") {
  textElem.style.fontSize = fontSize;
  textElem.textContent = "";
  currentText = text;
  displayedTextLength = 0;

  while (displayedTextLength < currentText.length) {
    textElem.textContent = currentText.slice(0, displayedTextLength + 1);
    displayedTextLength++;
    await sleep(speed);
  }
}

function clearChoices() {
  choicesElem.innerHTML = "";
  choicesElem.style.display = "none";
}

function showChoices(choices) {
  choicesElem.innerHTML = "";
  if (!choices || choices.length === 0) {
    choicesElem.style.display = "none";
    return;
  }
  choicesElem.style.display = "flex";
  for (const choice of choices) {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.addEventListener("click", () => {
      if (choice.next !== undefined) {
        goToScene(choice.next);
      } else if (choice.jumpToScenario) {
        loadScenario(choice.jumpToScenario);
      }
    });
    choicesElem.appendChild(btn);
  }
}

async function displayScene(scene) {
  dialogueBox.hidden = false;

  // 背景差し替え
  if (scene.bg) {
    await loadBackground(scene.bg);
  }

  // キャラ差し替え
  if (scene.characters) {
    const sides = ["left", "center", "right"];
    for (const side of sides) {
      const ch = scene.characters.find((c) => c.side === side);
      const src = ch ? ch.src : null;
      await changeCharacter(side, src);
    }
  }

  // 名前表示と色設定
  const charName = scene.name || "";
  nameElem.textContent = charName;
  const color = characterColors[charName] || "#C0C0C0";
  nameElem.style.setProperty("--nameColor", color);

  // 文字速度・フォントサイズ対応
  textSpeed = scene.speed || 50;
  const fontSize = scene.fontSize || "1em";

  // テキスト表示
  await showText(scene.text || "", textSpeed, fontSize);

  // 選択肢表示
  clearChoices();
  if (scene.choices && scene.choices.length > 0) {
    showChoices(scene.choices);
  }
}

async function goToScene(index) {
  if (!scenario || index < 0 || index >= scenario.scenes.length) return;
  currentSceneIndex = index;
  await displayScene(scenario.scenes[currentSceneIndex]);
}

async function nextScene() {
  if (!scenario) return;
  if (currentSceneIndex + 1 < scenario.scenes.length) {
    await goToScene(currentSceneIndex + 1);
  } else {
    // 最終シーンなら止める or 物語は続く表示などの処理
    clearChoices();
    nameElem.textContent = "";
    textElem.textContent = "物語は続く・・・";
  }
}

// クリック処理（背景・キャラ）
gameContainer.addEventListener("click", async () => {
  if (!scenario) return;
  // テキストの途中表示なら即全文表示
  if (displayedTextLength < currentText.length) {
    textElem.textContent = currentText;
    displayedTextLength = currentText.length;
    return;
  }
  // 次のシーンへ進む
  await nextScene();
});

// ダブルクリックでオートモード（簡易）
gameContainer.addEventListener("dblclick", () => {
  isAutoMode = !isAutoMode;
  if (isAutoMode) {
    autoPlay();
  }
});

async function autoPlay() {
  while (isAutoMode) {
    if (displayedTextLength < currentText.length) {
      textElem.textContent = currentText;
      displayedTextLength = currentText.length;
    } else {
      if (currentSceneIndex + 1 >= scenario.scenes.length) {
        isAutoMode = false;
        break;
      }
      await nextScene();
    }
    await sleep(1500);
  }
}

// シナリオ読み込み（JSON）
async function loadScenario(url = "000start.json") {
  try {
    const res = await fetch(url);
    scenario = await res.json();
    currentSceneIndex = 0;
    await displayScene(scenario.scenes[currentSceneIndex]);
  } catch (e) {
    console.error("シナリオ読み込み失敗", e);
  }
}

// 初期化
loadScenario();
