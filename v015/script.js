import { playEffect } from './effectHandler.js';

const config = {
  scenarioPath: './scenario/000start.json',
  assetBasePath: './assets2/',
};

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
  const res = await fetch(config.scenarioPath);
  scenario = await res.json();
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
  img.src = `${config.assetBasePath}char/${charImage}`;
  img.classList.add('char-image');
  slot.appendChild(img);

  if (effect) {
    playEffect(effect, img);
  } else {
    img.style.opacity = '1';
  }
}

function setBackground(imageName, effect) {
  if (!imageName) return;

  background.src = `${config.assetBasePath}bgev/${imageName}`;

  if (effect) {
    playEffect(effect, background);
  }
}

function showDialogue(name, text, color, effect) {
  nameBox.textContent = name || '';
  nameBox.style.color = color || 'white';
  textBox.textContent = text || '';

  if (effect) {
    playEffect(effect, dialogueBox);
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

function waitForUserInputOrTimeout(timeout) {
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
    return;
  }
  isPlaying = true;

  const item = scenario[currentIndex];

  // 背景設定
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

  // セリフ表示
  showDialogue(item.name, item.text, item.color, item.effect);

  // 選択肢処理
  if (item.choices && item.choices.length > 0) {
    showChoices(item.choices);
  } else {
    // 自動進行（クリックまたはタイムアウト待ち）
    await waitForUserInputOrTimeout(item.wait || 2000);
    currentIndex++;
    await playScenario();
  }
}

async function init() {
  await loadScenario();
  await playScenario();
}

window.addEventListener('load', init);
