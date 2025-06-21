let currentScene = [];
let currentIndex = 0;
let isTyping = false;
let isSkipping = false;
let isAuto = false;
let typingInterval = null;

window.addEventListener('DOMContentLoaded', async () => {
  updateVH();
  updateLayout();
  await loadScenario('scenario/000start.json');
  showNextScene();
});

window.addEventListener('resize', () => {
  updateVH();
  updateLayout();
});

window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    updateVH();
    updateLayout();
  }, 300);
});

function updateVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function updateLayout() {
  const container = document.querySelector('.char-container');
  const isLandscape = window.matchMedia("(orientation: landscape)").matches;

  if (isLandscape) {
    container.classList.add('landscape');
    container.classList.remove('portrait');
  } else {
    container.classList.add('portrait');
    container.classList.remove('landscape');
  }
}

async function loadScenario(path) {
  const res = await fetch(path);
  currentScene = await res.json();
  currentIndex = 0;
}

async function showNextScene() {
  if (currentIndex >= currentScene.length) return;

  const scene = currentScene[currentIndex];
  currentIndex++;

  if (scene.effect) {
    await playEffect(scene.effect);
  }

  if (scene.bg) {
    document.getElementById('background').style.backgroundImage =
      `url(${config.bgPath}${scene.bg})`;
  }

  if (scene.chars) {
    updateCharacters(scene.chars);
  }

  if (scene.bgm) {
    playBGM(scene.bgm);
  }

  if (scene.se) {
    playSE(scene.se);
  }

  if (scene.voice) {
    playVoice(scene.voice);
  }

  if (scene.text) {
    await showText(scene.text);
  }

  if (scene.next) {
    await loadScenario(`scenario/${scene.next}`);
    showNextScene();
    return;
  }

  if (isAuto && !isSkipping) {
    setTimeout(showNextScene, 1000);
  }
}

function updateCharacters(charData) {
  ['char1', 'char2', 'char3'].forEach((id, i) => {
    const charEl = document.getElementById(id);
    const charInfo = charData[i];
    if (charInfo && charInfo.img) {
      charEl.src = `${config.charPath}${charInfo.img}`;
      charEl.style.display = 'block';
    } else {
      charEl.style.display = 'none';
    }
  });
}

function playEffect(effect) {
  return new Promise(resolve => {
    // fadein, whiteout, blackout などを effect.js で処理
    if (typeof window.runEffect === 'function') {
      window.runEffect(effect, resolve);
    } else {
      resolve();
    }
  });
}

function playBGM(filename) {
  // BGMをループ再生
  const bgmPath = `${config.bgmPath}${filename}`;
  const bgm = new Audio(bgmPath);
  bgm.loop = true;
  bgm.volume = 0.6;
  bgm.play();
}

function playSE(filename) {
  const se = new Audio(`${config.sePath}${filename}`);
  se.volume = 1.0;
  se.play();
}

function playVoice(filename) {
  const voice = new Audio(`${config.voicePath}${filename}`);
  voice.volume = 1.0;
  voice.play();
}

function showText(text) {
  return new Promise(resolve => {
    const textBox = document.getElementById('text-box');
    textBox.textContent = '';
    isTyping = true;
    let i = 0;

    typingInterval = setInterval(() => {
      if (i < text.length) {
        textBox.textContent += text[i++];
      } else {
        clearInterval(typingInterval);
        isTyping = false;
        resolve();
      }
    }, isSkipping ? 0 : 40);
  });
}

document.addEventListener('click', () => {
  if (isTyping) {
    clearInterval(typingInterval);
    const fullText = currentScene[currentIndex - 1].text;
    document.getElementById('text-box').textContent = fullText;
    isTyping = false;
    return;
  }

  if (!isTyping) {
    showNextScene();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 's') {
    isSkipping = !isSkipping;
    console.log('Skip mode:', isSkipping);
  } else if (e.key === 'a') {
    isAuto = !isAuto;
    console.log('Auto mode:', isAuto);
    if (isAuto) showNextScene();
  }
});
