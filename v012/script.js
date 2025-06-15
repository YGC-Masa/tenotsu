const gameContainer = document.getElementById('game-container');
const background = document.getElementById('background');
const nameBox = document.getElementById('name');
const textBox = document.getElementById('text');
const choicesBox = document.getElementById('choices');

const charSlots = {
  left: document.getElementById('char-img-left'),
  center: document.getElementById('char-img-center'),
  right: document.getElementById('char-img-right'),
};

let scenario = null;
let currentSceneIndex = 0;
let textSpeed = 30;
let isTyping = false;
let typingTimeout = null;
let fullText = '';
let currentCharIndex = 0;

function loadScenario(jsonData) {
  scenario = jsonData;
  currentSceneIndex = 0;
  textSpeed = jsonData.speed || 30;
  showScene(currentSceneIndex);
}

function showScene(index) {
  if (!scenario || index >= scenario.scenes.length) {
    nameBox.textContent = "";
    textBox.textContent = "物語は続く・・・";
    clearCharacters();
    choicesBox.innerHTML = "";
    return;
  }

  const scene = scenario.scenes[index];

  if (scene.bg) {
    background.src = scene.bg;
  }

  if (scene.characters) {
    ['left', 'center', 'right'].forEach((pos, i) => {
      const char = scene.characters[i];
      if (char && char.src) {
        changeCharacter(pos, char.src);
      } else {
        changeCharacter(pos, null);
      }
    });
  }

  if (scene.name !== undefined) {
    nameBox.textContent = scene.name;
    nameBox.style.color = characterColors[scene.name] || "#C0C0C0";
  } else {
    nameBox.textContent = "";
  }

  if (scene.text !== undefined) {
    startTyping(scene.text);
  } else {
    textBox.textContent = "";
  }

  choicesBox.innerHTML = "";
}

function changeCharacter(position, src) {
  if (!charSlots[position]) return;
  if (src === null) {
    charSlots[position].src = "";
    charSlots[position].style.visibility = "hidden";
  } else {
    charSlots[position].src = src;
    charSlots[position].style.visibility = "visible";
  }
}

function clearCharacters() {
  ['left', 'center', 'right'].forEach(pos => {
    changeCharacter(pos, null);
  });
}

function startTyping(text) {
  fullText = text;
  currentCharIndex = 0;
  textBox.textContent = "";
  isTyping = true;
  typeNextChar();
}

function typeNextChar() {
  if (currentCharIndex < fullText.length) {
    textBox.textContent += fullText[currentCharIndex];
    currentCharIndex++;
    typingTimeout = setTimeout(typeNextChar, textSpeed);
  } else {
    isTyping = false;
  }
}

gameContainer.addEventListener('click', () => {
  if (isTyping) {
    clearTimeout(typingTimeout);
    textBox.textContent = fullText;
    isTyping = false;
  } else {
    currentSceneIndex++;
    showScene(currentSceneIndex);
  }
});
