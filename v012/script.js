let scenarioFile = './scenario/000start.json'; // let に変更
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
      fontSize = data.fontSize === "small" ? "14px" :
                 data.fontSize === "medium" ? "20px" :
                 data.fontSize === "large" ? "26px" : "20px";
      textSpeed = data.speed || 40;
      callback();
    })
    .catch(e => {
      console.error('Failed to load scenario:', e);
    });
}

function applyBackground(src, effect) {
  const bg = document.getElementById('background');
  const fullSrc = `../assets/bgev/${src}`;
  if (effect === 'black-out') {
    bg.classList.add('fade-out');
    setTimeout(() => {
      bg.src = fullSrc;
      bg.classList.remove('fade-out');
      bg.classList.add('fade-in');
    }, 500);
  } else {
    bg.src = fullSrc;
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
        img.src = `../assets/char/${src}`;
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

function applyDialogue(scene, callback) {
  // JSONの仕様に合わせてnameとtextを取得
  let name = '';
  let text = '';
  if (scene.characters && scene.characters.length === 1 && scene.text) {
    // 名前はJSONのスクリプトで直接テキスト内にある場合も多いので
    name = ''; 
    text = scene.text;
  } else if (scene.text) {
    text = scene.text;
  }
  // キャラ名が明記されている場合は抜き出してもいいがここでは省略

  const nameElem = document.getElementById('name');
  const textElem = document.getElementById('text');
  nameElem.textContent = name;
  nameElem.style.color = name && characterColors[name] ? characterColors[name] : '#fff';
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
    button.textContent = choice.label || choice.text || '選択肢';
    button.onclick = () => {
      if (choice.jumpToUrl) {
        window.location.href = choice.jumpToUrl;
      } else if (choice.jumpToScenario) {
        scenarioFile = `./scenario/${choice.jumpToScenario}`;
        currentIndex = 0;
        loadScenario(startScene);
      } else if (typeof choice.next === 'number') {
        currentIndex = choice.next;
        playScene();
      }
      choiceBox.innerHTML = '';
    };
    choiceBox.appendChild(button);
  });
}

function playScene() {
  if (!scenarioData) return;
  const scene = scenarioData.scripts[currentIndex];
  if (!scene) return;

  // 背景
  if (scene.bg) {
    applyBackground(scene.bg, scene.effect);
  }

  // キャラ
  if (scene.characters) {
    applyCharacters(scene.characters);
  }

  // テキスト
  if (scene.text) {
    applyDialogue(scene, () => {
      if (scene.choices) {
        showChoices(scene.choices);
      } else if (typeof scene.next === 'number') {
        currentIndex = scene.next;
        if (isAutoMode) {
          autoModeTimeout = setTimeout(playScene, 3000);
        }
      }
    });
  } else {
    // テキストなしでも次へ進む
    if (scene.choices) {
      showChoices(scene.choices);
    } else if (typeof scene.next === 'number') {
      currentIndex = scene.next;
      if (isAutoMode) {
        autoModeTimeout = setTimeout(playScene, 3000);
      }
    }
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
  const bg = document.getElementById('background');
  bg.addEventListener('touchend', function (e) {
    const now = Date.now();
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
