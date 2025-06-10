// v010 script.js

let currentScene = 0;
let scenario = null;
let charColors = {};
const bg = document.getElementById("background");
const charArea = document.getElementById("characters");
const textBox = document.getElementById("text-box");
const nameBox = document.getElementById("name");
const messageBox = document.getElementById("message");
const choiceBox = document.getElementById("choices");
const bgm = document.getElementById("bgm");

const loadedCharacters = {}; // sideごとの表示状態保持

function loadCharacterColors() {
  return fetch("./../characterColors.json")
    .then((res) => res.json())
    .then((data) => {
      charColors = data;
    });
}

function getColor(name, jsonColor) {
  return jsonColor || charColors[name] || "white";
}

function setBackground(src, effect = "dissolve") {
  bg.style.opacity = 0;
  setTimeout(() => {
    bg.style.backgroundImage = `url(${src})`;
    bg.style.opacity = 1;
  }, 500);
}

function createCharacterElement(side, src, effect) {
  const img = document.createElement("img");
  img.dataset.side = side;
  img.src = src;
  img.classList.add(effect || "dissolve");
  setCharacterPosition(img, side);
  return img;
}

function setCharacterPosition(img, side) {
  const vw = window.innerWidth;
  const sidePos = {
    left: vw * 0.2,
    center: vw * 0.5,
    right: vw * 0.8,
  };
  img.style.left = `${sidePos[side] || sidePos.center}px`;
}

function clearCharacters() {
  charArea.innerHTML = "";
  for (const key in loadedCharacters) delete loadedCharacters[key];
}

function updateCharacters(characters) {
  characters.forEach(({ side, src, effect }) => {
    const existing = loadedCharacters[side];
    if (src === null) {
      if (existing) {
        existing.classList.add(effect || "fade-out");
        setTimeout(() => existing.remove(), 800);
        delete loadedCharacters[side];
      }
    } else if (!existing || existing.src !== location.origin + "/" + src) {
      const img = createCharacterElement(side, src, effect);
      loadedCharacters[side] = img;
      charArea.appendChild(img);
    }
  });
}

function typeText(text, speed, callback) {
  messageBox.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    messageBox.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, speed);
  messageBox.onclick = () => {
    clearInterval(interval);
    messageBox.innerHTML = text;
    messageBox.onclick = null;
    if (callback) callback();
  };
}

function showScene(scene) {
  choiceBox.innerHTML = "";
  if (scene.bg) setBackground(scene.bg, scene.effect);
  if (scene.characters) updateCharacters(scene.characters);
  if (scene.bgm) {
    bgm.src = scene.bgm;
    bgm.play();
  }
  if (scene.name || scene.text) {
    nameBox.innerHTML = scene.name || "";
    nameBox.style.color = getColor(scene.name, scene.color);
    typeText(scene.text || "", scenario.speed || 30);
  }
  if (scene.choices) {
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        if (choice.jumpToUrl) {
          window.location.href = choice.jumpToUrl;
        } else if (choice.jumpToScenario) {
          loadScenario(`scenario/${choice.jumpToScenario}`);
        } else if (typeof choice.next !== "undefined") {
          currentScene = choice.next;
          showScene(scenario.scenes[currentScene]);
        }
      };
      choiceBox.appendChild(btn);
    });
  }
}

function loadScenario(file) {
  fetch(file)
    .then((res) => res.json())
    .then((data) => {
      scenario = data;
      currentScene = 0;
      clearCharacters();
      showScene(scenario.scenes[currentScene]);
      if (scenario.fontSize) textBox.style.fontSize = scenario.fontSize;
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadCharacterColors().then(() => {
    loadScenario("scenario/000start.json");
  });
});
