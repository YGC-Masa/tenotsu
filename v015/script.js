import { config } from './config.js';
import { playEffect } from './effectHandler.js';

const gameContainer = document.getElementById('game-container');
const background = document.getElementById('background');
const charSlots = {
  left: document.getElementById('char-left'),
  center: document.getElementById('char-center'),
  right: document.getElementById('char-right'),
};
const dialogueBox = document.getElementById('dialogue-box');
const nameBox = document.getElementById('name');
const textBox = document.getElementById('text');
const choicesBox = document.getElementById('choices');

let scenario = [];
let currentIndex = 0;
let isPlaying = false;

async function loadScenario() {
  try {
    const res = await fetch(config.scenarioPath + '000start.json');
    if (!res.ok) throw new Error('Failed to load scenario');
    scenario = await res.json();
  } catch (e) {
    console.error(e);
  }
}

function clearChars() {
  Object.values(charSlots).forEach(slot => (slot.innerHTML = ''));
}

function showCharacter(slotId, charImage, effect) {
  const slot = charSlots[slotId];
  if (!slot) return;

  slot.innerHTML = '';

  if (!charImage) return;

  const img = document.createElement('img');
  img.src = config.charPath + charImage;
  img.classList.add('char-image');
  slot.appendChild(img);

  if (effect) {
    playEffect(effect, img, () => {
      img.style.opacity = '1';
    });
  } else {
    img.style.opacity = '1';
  }
}

function setBackground(imageName, effect) {
  if (!imageName) return;

  if (effect) {
    // フェードアウトして背景差し替え、フェードイン等の演出想定
    playEffect(effect, background, () => {
      background.src = config.bgPath + imageName;
    });
  } else {
    background.src = config.bgPath + imageName;
  }
}

function showDialogue(name, text, color, effect) {
  nameBox.textContent = name || '';
  nameBox.style.color = color || 'white';
  textBox.textContent = text || '';

  if (effect) {
    playEffect(effect, dialogueBox, () => {
      // 必要あればコールバック処理
    });
  }
}

function clearChoices() {
  choicesBox.innerHTML = '';
}

function showChoices(choices) {
  clearChoices();
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice.text;
    btn.addEventListener('click', () => {
      currentIndex = choice.next;
      clearChoices();
      playScenario();
    });
    choicesBox.appendChild(btn);
  });
}

function waitForUserInputOrTimeout(timeout = 10000) {
  return new Promise(resolve => {
    let resolved = false;

    function onClick() {
      if (!resolved) {
        resolved = true;
        document.removeEventListener('click', onClick);
        resolve();
      }
    }

    document.addEventListener('click', onClick);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        document.removeEventListener('click', onClick);
        resolve();
      }
    }, timeout);
  });
}

async function playScenario() {
  if (currentIndex >= scenario.length) {
    console.log('End of scenario');
    isPlaying = false;
    return;
  }
  isPlaying = true;

  const item = scenario[currentIndex];

  // 背景
  if (item.background) {
    setBackground(item.background, item.effect);
  }

  // キャラ表示
  clearChars();
  if (item.characters) {
    for (const pos of ['left', 'center', 'right']) {
      if (item.characters[pos]) {
        showCharacter(pos, item.characters[pos].image, item.effect);
      }
    }
  }

  // セリフ
  showDialogue(item.name, item.text, item.color, item.effect);

  // 選択肢
  if (item.choices && item.choices.length > 0) {
    showChoices(item.choices);
  } else {
    await waitForUserInputOrTimeout(item.wait || 10000);
    currentIndex++;
    playScenario();
  }
}

async function init() {
  await loadScenario();
  playScenario();
}

window.addEventListener('load', init);
