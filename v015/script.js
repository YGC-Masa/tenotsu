import { config } from './config.js';
import { playEffect } from './effectHandler.js';
import { waitForUserInputOrTimeout } from './textHandler.js';

// DOM要素の取得
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
let skipRequested = false;

// シナリオJSON読み込み
async function loadScenario() {
  const res = await fetch(config.scenarioPath + '000start.json');
  scenario = await res.json();
}

// キャラクター表示クリア
function clearChars() {
  Object.values(charSlots).forEach(slot => slot.innerHTML = '');
}

// キャラクター表示（指定スロットに画像を出す）
function showCharacter(slotId, charImage, effect) {
  const slot = charSlots[slotId];
  if (!slot) return;

  slot.innerHTML = ''; // 一旦クリア

  if (!charImage) return;

  const img = document.createElement('img');
  img.src = `${config.charPath}${charImage}`;
  img.classList.add('char-image');
  img.style.opacity = '0';
  slot.appendChild(img);

  // 効果ありなら効果再生
  if (effect) {
    playEffect(effect, img, () => {
      img.style.opacity = '1';
    });
  } else {
    img.style.opacity = '1';
  }
}

// 背景画像設定（効果付き）
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

// セリフ表示
function showDialogue(name, text, color, effect) {
  nameBox.textContent = name || '';
  nameBox.style.color = color || 'white';
  textBox.textContent = text || '';

  if (effect) {
    playEffect(effect, dialogueBox);
  }
}

// 選択肢クリア
function clearChoices() {
  choicesBox.innerHTML = '';
}

// 選択肢表示
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

// メインシナリオ再生
async function playScenario() {
  if (currentIndex >= scenario.length) {
    console.log('シナリオ終了');
    return;
  }
  isPlaying = true;

  const item = scenario[currentIndex];

  // 背景変更
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
    // スキップ対応を含めて、クリック待ち or 自動進行
    await waitForUserInputOrTimeout(item.wait || 2000);
    currentIndex++;
    playScenario();
  }
}

async function init() {
  await loadScenario();
  playScenario();
}

// 読み込み時起動
window.addEventListener('load', init);
