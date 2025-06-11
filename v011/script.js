const scenarioFile = './scenario/000start.json';
const characterColorsPath = './../characterColors.js';
let scenarioData = null;
let currentIndex = 0;
let isAutoMode = false;
let autoModeTimeout = null;
let currentCharacters = {};
let characterColors = {};
let fontSize = '20px';
let textSpeed = 40;

function loadCharacterColors(callback) {
  const script = document.createElement('script');
  script.src = characterColorsPath;
  script.onload = () => {
    characterColors = window.characterColors || {};
    callback();
  };
  document.head.appendChild(script);
}

function loadScenario(callback) {
  fetch(scenarioFile)
    .then(response => response.json())
    .then(data => {
      scenarioData = data;
      fontSize = data.fontSize || fontSize;
      textSpeed = data.speed || textSpeed;
      callback();
    });
}

function applyBackground(src, effect) {
  const bg = document.getElementById('background');
  if (effect === 'black-out') {
    bg.classList.add('fade-out');
    setTimeout(() => {
      bg.src = src;
      bg.classList.remove('fade-out');
      bg.classList.add('fade-in');
    }, 500);
  } else {
    bg.src = src;
  }
}

function applyCharacters(characters) {
  characters.forEach(character => {
    const { side, src, effect } = character;
    const container = document.getElementById(`char-${side}`);
    if (src === null) {
      container.innerHTML = '';
      delete currentCharacters[side];
    } else {
      if (!currentCharacters[side] || currentCharacters[side].src !== src) {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'char-image';
        if (effect) {
          img.classList.add(effect);
        }
        container.innerHTML = '';
        container.appendChild(img);
        currentCharacters[side] = { src };
      }
    }
  });
}

function applyDialogue(dialogue, callback) {
  const name = dialogue.name || '';
  const text = dialogue.text || '';
  const color = (name in dialogue.color ? dialogue.color[name] : null)
             || characterColors[name]
             || '#FFFFFF';

  const nameElem = document.getElementById('name');
  const textElem = document.getElementById('text');
  nameElem.textContent = name;
  nameElem.style.color = color;
  textElem.innerHTML = '';
  textElem.style.fontSize = fontSize;

  let i = 0;
  function typeText() {
    if (i < text.length) {
      textElem.innerHTML += text[i++];
      setTimeout(typeText, textSpeed);
    } else if (callback) {
      callback();
    }
  }
  typeText();
}

function showChoices(choices) {
  const choiceBox = document.getElementById('choices');
  choiceBox.innerHTML = '';
  choices.forEach(choice => {
    const button = document.createElement('button');
    button.textContent = choice.text;
    button.onclick = () => {
      if (choice.jumpToUrl) {
        window.location.href = choice.jumpToUrl;
      } else if (choice.jumpToScenario) {
        scenarioFile = choice.jumpToScenario;
        currentIndex = 0;
        loadScenario(startScene);
      } else {
        currentIndex = choice.next;
        playScene();
      }
    };
    choiceBox.appendChild(button);
  });
}

function playScene() {
  const scene = scenarioData[currentIndex];
  if (!scene) return;

  const {
    background,
    effect = 'dissolve',
    characters = [],
    dialogue,
    choices,
    next
  } = scene;

  if (background) {
    applyBackground(background, effect);
  }

  if (characters.length > 0) {
    applyCharacters(characters);
  }

  if (dialogue) {
    applyDialogue(dialogue, () => {
      if (choices) {
        showChoices(choices);
      } else if (typeof next === 'number') {
        currentIndex = next;
        if (isAutoMode) {
          autoModeTimeout = setTimeout(playScene, 3000);
        }
      }
    });
  }
}

function startScene() {
  playScene();
}

function toggleAutoMode() {
  isAutoMode = !isAutoMode;
  if (isAutoMode) {
    playScene();
  } else {
    clearTimeout(autoModeTimeout);
  }
}

function handleDoubleTapBackground() {
  let lastTap = 0;
  document.getElementById('background').addEventListener('touchend', function (e) {
    const now = new Date().getTime();
    if (now - lastTap < 300) {
      toggleAutoMode();
    }
    lastTap = now;
  });
}

function init() {
  loadCharacterColors(() => {
    loadScenario(() => {
      document.getElementById('next').onclick = () => {
        if (isAutoMode) {
          toggleAutoMode();
        }
        currentIndex++;
        playScene();
      };
      handleDoubleTapBackground();
      startScene();
    });
  });
}

window.onload = init;
