import { config } from './config.js';
import { characterColors } from './characterColors.js';
import { characterStyles } from './characterStyles.js';
import { playEffect } from './effectHandler.js';
import { showTextByCharacter } from './textHandler.js';

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
let skipRequested = false;

async function loadScenario() {
  const res = await fetch(`${config.scenarioPath}000start.json`);
  scenario = await res.json();
}

function clearChars() {
  Object.values(charSlots).forEach(slot => slot.innerHTML = '');
}

function showCharacter(slotId, charImage, effect) {
  const slot = charSlots[slotId];
  if (!slot || !charImage) return;

  slot.innerHTML = '';
  const img = document.createElement('img');
  img.src = `${config.charPath}${charImage}`;
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
    playEffect(effect, background, () => {
      background.src = `${config.bgPath}${imageName}`;
    });
  } else {
    background.src = `${config.bgPath}${imageName}`;
  }
}

function showDialogue(name, text, effect) {
  nameBox.textContent = name || '';
  nameBox.style.color = characterColors[name] || 'white';

  const style = characterStyles[name] || {};
  const speed = style.speed || 40;

  if (effect) {
    playEffect(effect, dialogueBox, () => {
      showTextByCharacter(textBox, text || '', speed);
    });
  } else {
    showTextByCharacter(textBox, text || '', speed);
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

async function waitForUserInputOrTimeout(timeout = 10000) {
  return new Promise(resolve => {
    let resolved = false;

    const clickHandler = () => {
      if (!resolved) {
        resolved = true;
        document.removeEventListener('click', clickHandler);
        resolve();
      }
    };

    document.addEventListener('click', clickHandler);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        document.removeEventListener('click', clickHandler);
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

  const item = scenario[currentIndex];
  clearChars();
  clearChoices();

  // 背景設定
  if (item.background) {
    setBackground(item.background, item.effect);
  }

  // キャラクター表示
  if (item.characters) {
    ['left', 'center', 'right'].forEach(pos => {
      if (item.characters[pos]) {
        showCharacter(pos, item.characters[pos].image, item.effect);
      }
    });
  }

  // セリフ表示
  showDialogue(item.name, item.text, item.effect);

  // 選択肢あり
  if (item.choices && item.choices.length > 0) {
    showChoices(item.choices);
  } else {
    await waitForUserInputOrTimeout(item.wait || 10000);
    currentIndex++;
    playScenario();
  }
}

function initResizeHandler() {
  const setVH = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  window.addEventListener('resize', setVH);
  setVH();
}

window.addEventListener('load', async () => {
  initResizeHandler();
  await loadScenario();
  playScenario();
});
