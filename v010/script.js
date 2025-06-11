import { characterColors } from "../characterColors.js";

const textBox = document.getElementById("text");
const nameBox = document.getElementById("name");
const choicesBox = document.getElementById("choices");
const background = document.getElementById("background");
const characterLayer = document.getElementById("character-layer");
const bgm = document.getElementById("bgm");
const se = document.getElementById("se");

let currentCharacters = {}; // sideごとの表示キャラ状態
let textSpeed = 30;
let fontSize = "20px";

async function loadScenario(path) {
  const res = await fetch(path);
  return await res.json();
}

function setBackground(src) {
  background.style.backgroundImage = `url(../${src})`;
}

function playBGM(src) {
  bgm.src = `../${src}`;
  bgm.play();
}

function playSE(src) {
  se.src = `../${src}`;
  se.play();
}

function clearCharacters() {
  characterLayer.innerHTML = "";
  currentCharacters = {};
}

function showCharacter({ side, src, effect }) {
  if (!side) return;
  const div = document.createElement("img");
  div.classList.add("character");
  div.dataset.side = side;
  div.style.opacity = "0";

  if (side === "left") div.style.left = "5%";
  if (side === "center") div.style.left = "35%";
  if (side === "right") div.style.left = "65%";

  if (src) {
    div.src = `../${src}`;
    characterLayer.appendChild(div);
    requestAnimationFrame(() => {
      div.style.opacity = "1";
    });
    currentCharacters[side] = div;
  } else {
    const existing = currentCharacters[side];
    if (existing) {
      existing.style.opacity = "0";
      setTimeout(() => existing.remove(), 500);
      delete currentCharacters[side];
    }
  }
}

function applyEffect(effect, callback) {
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.zIndex = 9999;
  document.body.appendChild(overlay);

  const fadeColor = {
    "black-in": "black",
    "black-out": "black",
    "white-in": "white",
    "white-out": "white"
  }[effect] || "black";

  if (effect === "black-in" || effect === "white-in") {
    overlay.style.backgroundColor = fadeColor;
    overlay.style.opacity = "1";
    overlay.style.transition = "opacity 0.5s";
    requestAnimationFrame(() => {
      overlay.style.opacity = "0";
    });
  } else if (effect === "black-out" || effect === "white-out") {
    overlay.style.backgroundColor = fadeColor;
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.5s";
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });
  } else {
    overlay.remove();
    if (callback) callback();
    return;
  }

  setTimeout(() => {
    overlay.remove();
    if (callback) callback();
  }, 500);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function typeText(text) {
  textBox.innerHTML = "";
  for (let char of text) {
    textBox.innerHTML += char;
    await wait(textSpeed);
  }
}

function setFont(size) {
  textBox.style.fontSize = size;
  nameBox.style.fontSize = size;
}

async function showLine(line) {
  const effect = line.effect || "dissolve";

  if (line.bg) setBackground(line.bg);
  if (line.bgm) playBGM(line.bgm);
  if (line.se) playSE(line.se);

  if (line.characters) {
    line.characters.forEach(showCharacter);
  }

  if (line.text) {
    const match = line.text.match(/^(.+?)「(.*)」$/);
    if (match) {
      const speaker = match[1];
      const content = match[2];
      nameBox.textContent = speaker;
      nameBox.style.color = characterColors[speaker] || "#C0C0C0";
      await typeText(content);
    } else {
      nameBox.textContent = "";
      await typeText(line.text);
    }
    await wait(500);
  }

  if (line.choices) {
    choicesBox.innerHTML = "";
    return new Promise((resolve) => {
      line.choices.forEach((choice) => {
        const btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.className = "choice-button";
        btn.onclick = () => {
          if (choice.jumpToScenario) {
            loadAndRun(`scenario/${choice.jumpToScenario}`);
          } else if (choice.jumpToUrl) {
            window.location.href = choice.jumpToUrl;
          }
          resolve();
        };
        choicesBox.appendChild(btn);
      });
    });
  }

  return wait(300);
}

async function runScenario(scenario) {
  if (scenario.fontSize) setFont(scenario.fontSize);
  if (scenario.speed) textSpeed = scenario.speed;

  for (let i = 0; i < scenario.start.length; i++) {
    await showLine(scenario.start[i]);
  }
}

async function loadAndRun(path) {
  const scenario = await loadScenario(path);
  clearCharacters();
  await runScenario(scenario);
}

loadAndRun("scenario/000start.json");
