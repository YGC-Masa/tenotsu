let currentSceneIndex = 0;
let currentScenario = null;
let isPlaying = false;
let typingInterval = null;
let autoMode = false;

function setViewportHeight() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
window.addEventListener('resize', setViewportHeight);
window.addEventListener('orientationchange', setViewportHeight);
setViewportHeight();

function loadScenario(scenarioData) {
  currentScenario = scenarioData;
  currentSceneIndex = 0;
  isPlaying = false;
  autoMode = false;
  clearInterval(typingInterval);
  hideAllCharacters();
  clearEventLayer();
  showDialogueBox(true); // 初期状態ではテキストエリアを表示
  showScene(currentScenario.scenes[currentSceneIndex]);
}

function showScene(scene) {
  if (!scene) return;

  if (scene.textareashow !== undefined) {
    showDialogueBox(scene.textareashow);
  }

  if (scene.bg) {
    if (scene.bgEffect === 'whitein') {
      applyWhiteInEffect(scene.bg);
    } else if (scene.bgEffect === 'transition') {
      applyTransitionEffect(scene.bg);
    } else {
      setBackground(scene.bg);
    }
  }

  if (scene.ev) {
    showEvImage(scene.ev);
  } else {
    clearEventLayer();
  }

  if (scene.name || scene.text) {
    setText(scene.name || '', scene.text || '');
  } else {
    setText('', '');
  }

  if (scene.choices) {
    showChoices(scene.choices);
  } else {
    hideChoices();
  }

  if (scene.showlist) {
    showList(scene.showlist);
  }

  if (scene.wait) {
    setTimeout(() => {
      if (scene.auto) nextScene();
    }, scene.wait);
  } else if (scene.auto) {
    setTimeout(() => nextScene(), 800);
  }
}

function nextScene() {
  if (!currentScenario) return;
  currentSceneIndex++;
  if (currentSceneIndex < currentScenario.scenes.length) {
    showScene(currentScenario.scenes[currentSceneIndex]);
  } else {
    if (document.getElementById('dialogue-box').classList.contains('hidden')) {
      return; // テキスト非表示のまま終了
    }
    setText('', '物語はつづく・・・');
  }
}

function setText(name, text) {
  const nameArea = document.getElementById('name');
  const textArea = document.getElementById('text');
  nameArea.textContent = name;
  textArea.textContent = '';
  isPlaying = true;

  let i = 0;
  typingInterval = setInterval(() => {
    textArea.textContent = text.substring(0, i + 1);
    i++;
    if (i >= text.length) {
      clearInterval(typingInterval);
      isPlaying = false;
    }
  }, 30);
}

function showDialogueBox(show) {
  const box = document.getElementById('dialogue-box');
  if (show) {
    box.classList.remove('hidden');
  } else {
    box.classList.add('hidden');
  }
}

function hideAllCharacters() {
  ['char-left', 'char-center', 'char-right'].forEach(id => {
    const slot = document.getElementById(id);
    slot.innerHTML = '';
    slot.classList.remove('active');
  });
}

function showEvImage(filename) {
  const evLayer = document.getElementById('ev-layer');
  evLayer.innerHTML = `<img src="./ev/${filename}" class="ev-image" />`;
}

function clearEventLayer() {
  const evLayer = document.getElementById('ev-layer');
  evLayer.innerHTML = '';
}

function showChoices(choices) {
  const area = document.getElementById('choices');
  area.innerHTML = '';
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.textContent = choice.text;
    btn.onclick = () => loadScenarioFromFile(choice.jump);
    area.appendChild(btn);
  });
  area.classList.remove('hidden');
}

function hideChoices() {
  const area = document.getElementById('choices');
  area.innerHTML = '';
  area.classList.add('hidden');
}

function showList(filename) {
  fetch(`./list/${filename}`)
    .then(response => response.json())
    .then(data => {
      const panel = document.getElementById('list-panel');
      panel.innerHTML = '';
      data.items.forEach(item => {
        const btn = document.createElement('button');
        btn.textContent = item.label;
        btn.onclick = () => {
          panel.classList.add('hidden');
          loadScenarioFromFile(item.jump);
        };
        panel.appendChild(btn);
      });
      panel.classList.remove('hidden');
    });
}

function loadScenarioFromFile(filename) {
  fetch(`./scenario/${filename}`)
    .then(response => response.json())
    .then(data => loadScenario(data));
}

function setBackground(filename) {
  const bg = document.getElementById('background');
  bg.src = `./bgev/${filename}`;
}

function applyWhiteInEffect(filename) {
  const bg = document.getElementById('background');
  bg.style.transition = 'none';
  bg.style.opacity = 0;
  bg.src = `./bgev/${filename}`;
  setTimeout(() => {
    bg.style.transition = 'opacity 1s';
    bg.style.opacity = 1;
  }, 100);
}

function applyTransitionEffect(filename) {
  const bg = document.getElementById('background');
  bg.style.transition = 'opacity 0.8s';
  bg.style.opacity = 0;
  setTimeout(() => {
    bg.src = `./bgev/${filename}`;
    bg.style.opacity = 1;
  }, 300);
}

// メニュー表示切替
function toggleMenu() {
  const menu = document.getElementById('menu-panel');
  menu.classList.toggle('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
  loadScenarioFromFile('000start.json');

  // ダブルタップでメニュー表示
  let lastTap = 0;
  const clickLayer = document.getElementById('click-layer');
  clickLayer.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTap < 300) {
      toggleMenu();
    }
    lastTap = now;
  });

  // 通常クリックでスキップ
  clickLayer.addEventListener('click', () => {
    if (isPlaying) {
      clearInterval(typingInterval);
      const text = currentScenario.scenes[currentSceneIndex].text || '';
      document.getElementById('text').textContent = text;
      isPlaying = false;
    } else {
      nextScene();
    }
  });

  // 全画面化ボタン追加
  const menu = document.getElementById('menu-panel');
  const fullBtn = document.createElement('button');
  fullBtn.textContent = '全画面表示';
  fullBtn.onclick = () => {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  };
  menu.appendChild(fullBtn);
});
