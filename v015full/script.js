import { playEffect } from './effectHandler.js';
import { setDialogue } from './textHandler.js';
import { config } from './config.js';

const gameContainer = document.getElementById('game-container');
const background = document.getElementById('background');
const charSlots = {
  left: document.getElementById('char-left'),
  center: document.getElementById('char-center'),
  right: document.getElementById('char-right'),
};
const nameBox = document.getElementById('name');
const textBox = document.getElementById('text');
const choicesBox = document.getElementById('choices');

let scenario = [];
let currentIndex = 0;

async function loadScenario() {
  const res = await fetch(config.scenarioPath + '000start.json');
  scenario = await res.json();
}

function clearChars() {
  Object.values(charSlots).forEach(slot => slot.innerHTML = '');
}

function showCharacter(slotId, charImage, effect) {
  const slot = charSlots[slotId];
  if (!slot || !charImage) return;

  const img = document.createElement('img');
  img.src = config.charPath + charImage;
  img.classList.add('char-image');
  slot.innerHTML = '';
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
      background.src = config.bgPath + imageName;
    });
  } else {
    background.src = config.bgPath + imageName;
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

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function playScenario() {
  if (currentIndex >= scenario.length) return;

  const item = scenario[currentIndex];
  clearChars();

  setBackground(item.background, item.effect);
  if (item.characters) {
    ['left', 'center', 'right'].forEach(pos => {
      if (item.characters[pos]) {
        showCharacter(pos, item.characters[pos].image, item.effect);
      }
    });
  }
  setDialogue(nameBox, textBox, item.name, item.text);

  if (item.choices) {
    showChoices(item.choices);
  } else {
    await wait(item.wait || 2000);
    currentIndex++;
    playScenario();
  }
}

window.addEventListener('load', async () => {
  await loadScenario();
  playScenario();
});
