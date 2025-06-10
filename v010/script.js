const scenarioPath = "scenario/000start.json";
const colorPath = "../../characterColors.json";

let scenarioData;
let currentIndex = 0;
let currentCharacters = {};
let characterColors = {};
let isSkipping = false;
let autoPlay = false;
let textSpeed = 30;
let fontSize = "20px";
let bgmPlayer = new Audio();

const textBox = document.getElementById("text");
const nameBox = document.getElementById("name");
const characterArea = document.getElementById("characters");
const choicesArea = document.getElementById("choices");
const background = document.getElementById("background");

async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

function applyEffect(effect) {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    overlay.className = `overlay ${effect}`;
    document.body.appendChild(overlay);
    setTimeout(() => {
      overlay.remove();
      resolve();
    }, 800);
  });
}

function applyTextEffect(text, speed) {
  return new Promise(resolve => {
    textBox.innerHTML = "";
    let i = 0;
    const interval = setInterval(() => {
      if (isSkipping || i >= text.length) {
        textBox.innerText = text;
        clearInterval(interval);
        resolve();
        return;
      }
      textBox.innerHTML += text[i++];
    }, speed);
  });
}

function getColor(name) {
  return (
    (scenarioData.colors && scenarioData.colors[name]) ||
    characterColors[name] ||
    "#ffffff"
  );
}

function updateCharacters(newCharacters = []) {
  newCharacters.forEach(char => {
    const { side, src, effect = "dissolve" } = char;
    if (!src) {
      const old = currentCharacters[side];
      if (old) {
        const el = document.getElementById(`char-${side}`);
        if (el) {
          el.classList.add(effect);
          setTimeout(() => el.remove(), 800);
        }
        delete currentCharacters[side];
      }
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.className = `char ${side} ${effect}`;
      img.id = `char-${side}`;
      const old = document.getElementById(`char-${side}`);
      if (old) old.remove();
      characterArea.appendChild(img);
      currentCharacters[side] = src;
    }
  });
}

function showChoices(choices) {
  choicesArea.innerHTML = "";
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      if (choice.jumpToUrl) {
        location.href = choice.jumpToUrl;
      } else if (choice.jumpToScenario) {
        loadScenario(`scenario/${choice.jumpToScenario}`);
      }
    };
    choicesArea.appendChild(btn);
  });
}

async function playScene(scene) {
  const {
    background: bg,
    bgm,
    characters,
    name,
    text,
    effect,
    fontSize: size,
    speed,
    choices
  } = scene;

  if (bg) background.style.backgroundImage = `url(${bg})`;
  if (bgm) {
    bgmPlayer.src = bgm;
    bgmPlayer.loop = true;
    bgmPlayer.play();
  }
  if (effect) await applyEffect(effect);
  if (characters) updateCharacters(characters);
  if (size) fontSize = size;
  if (speed !== undefined) textSpeed = speed;
  if (text) {
    nameBox.innerText = name || "";
    nameBox.style.color = getColor(name || "");
    textBox.innerText = "";
    await applyTextEffect(text, textSpeed);
  }
  if (choices) {
    showChoices(choices);
    return;
  }
}

async function next() {
  if (currentIndex >= scenarioData.scripts.length) return;
  const scene = scenarioData.scripts[currentIndex++];
  await playScene(scene);
  if (autoPlay) setTimeout(next, 500);
}

async function loadScenario(path) {
  scenarioData = await loadJSON(path);
  currentIndex = 0;
  currentCharacters = {};
  choicesArea.innerHTML = "";
  background.style.backgroundImage = "";
  textBox.innerText = "";
  nameBox.innerText = "";
  await next();
}

async function start() {
  characterColors = await loadJSON(colorPath);
  await loadScenario(scenarioPath);
}

document.getElementById("next").onclick = () => {
  if (textBox.innerText !== "") {
    isSkipping = true;
    textBox.innerText = "";
  } else {
    isSkipping = false;
    next();
  }
};

document.getElementById("auto").onclick = () => {
  autoPlay = !autoPlay;
  document.getElementById("auto").innerText = autoPlay ? "停止" : "自動";
  if (autoPlay) next();
};

start();
