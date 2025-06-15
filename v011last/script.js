let scenarioData = null;
let currentSceneIndex = 0;
let isTextDisplaying = false;
let autoMode = false;
let autoTimeout = null;

let charElements = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};
let backgroundElement = document.getElementById("background");
let dialogueBox = document.getElementById("dialogue-box");
let nameBox = document.getElementById("name");
let textBox = document.getElementById("text");
let choicesBox = document.getElementById("choices");

let fontSize = "1em";
let textSpeed = 40;

async function loadScenario(url) {
  try {
    const response = await fetch(url);
    scenarioData = await response.json();
    currentSceneIndex = 0;
    if (scenarioData.fontSize) fontSize = scenarioData.fontSize;
    if (scenarioData.speed) textSpeed = scenarioData.speed;
    dialogueBox.style.setProperty("--fontSize", fontSize);
    showScene(currentSceneIndex);
  } catch (e) {
    console.error("シナリオ読み込み失敗", e);
  }
}

function showScene(index) {
  if (!scenarioData || !scenarioData.scenes || index >= scenarioData.scenes.length) {
    endScenario();
    return;
  }
  const scene = scenarioData.scenes[index];

  if (scene.bg) changeBackground(scene.bg);
  if (scene.characters) {
    scene.characters.forEach(charData => {
      changeCharacter(charData.side, charData.src);
    });
  }

  ["left", "center", "right"].forEach(side => {
    if (!scene.characters || !scene.characters.some(c => c.side === side)) {
      changeCharacter(side, null);
    }
  });

  nameBox.style.color = characterColors[scene.name] || characterColors[""];
  nameBox.textContent = scene.name;
  displayText(scene.text, scene.speed || textSpeed);

  if (scene.choices && scene.choices.length > 0) {
    showChoices(scene.choices);
  } else {
    clearChoices();
  }
}

function changeBackground(src) {
  backgroundElement.src = src;
}

function changeCharacter(side, src) {
  const el = charElements[side];
  if (!el) return;
  if (!src || src.toLowerCase() === "null") {
    el.innerHTML = "";
  } else {
    el.innerHTML = `<img src="${src}" class="char-image" alt="${side}">`;
  }
}

function displayText(text, speed) {
  clearTimeout(autoTimeout);
  isTextDisplaying = true;
  textBox.textContent = "";

  let i = 0;
  function type() {
    if (i < text.length) {
      textBox.textContent += text.charAt(i);
      i++;
      autoTimeout = setTimeout(type, speed);
    } else {
      isTextDisplaying = false;
      if (autoMode) {
        autoTimeout = setTimeout(() => nextScene(), 1500);
      }
    }
  }
  type();
}

function showChoices(choices) {
  clearChoices();
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      if (choice.jump) {
        loadScenario(choice.jump);
      } else {
        nextScene();
      }
    };
    choicesBox.appendChild(btn);
  });
}

function clearChoices() {
  choicesBox.innerHTML = "";
}

function nextScene() {
  if (isTextDisplaying) {
    clearTimeout(autoTimeout);
    textBox.textContent = scenarioData.scenes[currentSceneIndex].text;
    isTextDisplaying = false;
  } else {
    currentSceneIndex++;
    showScene(currentSceneIndex);
  }
}

function endScenario() {
  nameBox.style.color = characterColors[""];
  nameBox.textContent = "";
  textBox.textContent = "物語は続く・・・";
  clearChoices();
  autoMode = false;
  clearTimeout(autoTimeout);
}

function toggleAutoMode() {
  autoMode = !autoMode;
  if (autoMode && !isTextDisplaying) {
    autoTimeout = setTimeout(() => nextScene(), 1500);
  } else {
    clearTimeout(autoTimeout);
  }
}

function onClickGameArea() {
  if (isTextDisplaying) {
    clearTimeout(autoTimeout);
    textBox.textContent = scenarioData.scenes[currentSceneIndex].text;
    isTextDisplaying = false;
  } else {
    nextScene();
  }
}

function onDoubleClickGameArea() {
  toggleAutoMode();
}

function init() {
  document.getElementById("game-container").addEventListener("click", onClickGameArea);
  document.getElementById("game-container").addEventListener("dblclick", onDoubleClickGameArea);
  loadScenario("scenario/000start.json");
}

window.addEventListener("load", init);
