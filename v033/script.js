// script.js

let currentSceneIndex = 0;
let currentScenario = [];
let isSceneTransitioning = false;

function loadScenario(scenarioFile) {
  randomImagesOff();
  randomTextsOff();
  fetch(`${config.scenarioPath}${scenarioFile}`)
    .then(response => response.json())
    .then(data => {
      currentScenario = data;
      currentSceneIndex = 0;
      showScene();
    })
    .catch(err => console.error("シナリオ読み込みエラー:", err));
}

function showScene() {
  if (isSceneTransitioning || currentSceneIndex >= currentScenario.length) return;
  isSceneTransitioning = true;

  const scene = currentScenario[currentSceneIndex];

  // ランダム画像表示制御
  if (scene.randomimageson === true) {
    randomImagesOn();
  } else if (scene.randomimageson === false) {
    randomImagesOff();
  }

  // ランダムテキスト表示制御
  if (scene.randomtexts === true) {
    showRandomTexts();
  } else if (scene.randomtexts === false) {
    randomTextsOff();
  }

  if (scene.bg) {
    const bg = document.getElementById("background");
    bg.src = config.bgPath + scene.bg;
  }

  if (scene.bgm) playBGM(scene.bgm);
  if (scene.se) playSE(scene.se);
  if (scene.voice) playVoice(scene.voice);

  updateCharacters(scene.characters);

  if (scene.showev) showEV(scene.showev, scene.evEffect);
  if (scene.showcg) showCG(scene.showcg, scene.cgEffect);

  const nameBox = document.getElementById("name");
  const textBox = document.getElementById("text");

  const style = characterStyles[scene.name] || characterStyles[""];
  nameBox.textContent = scene.name || "";
  nameBox.style.color = style.color;
  nameBox.style.fontSize = style.fontSize;

  textBox.innerHTML = "";
  textBox.style.fontSize = style.fontSize;

  const text = scene.text || "";
  let i = 0;
  function typeText() {
    if (i < text.length) {
      textBox.innerHTML += text.charAt(i);
      i++;
      setTimeout(typeText, style.speed);
    } else {
      isSceneTransitioning = false;
    }
  }
  typeText();

  if (scene.choices) showChoices(scene.choices);
  else hideChoices();

  if (scene.showlist) {
    loadList(scene.showlist);
  }

  if (scene.auto === true) {
    setTimeout(() => {
      if (!isSceneTransitioning) nextScene();
    }, 1000);
  }
}

function nextScene() {
  if (isSceneTransitioning) return;
  currentSceneIndex++;
  showScene();
}

function updateCharacters(characters = []) {
  const slots = ["left", "center", "right"];
  slots.forEach(slot => {
    const container = document.getElementById(`char-${slot}`);
    container.innerHTML = "";
    container.classList.remove("active");
  });

  characters.forEach(char => {
    const container = document.getElementById(`char-${char.side}`);
    const img = document.createElement("img");
    img.src = config.charPath + char.src;
    img.classList.add("char-image");
    container.appendChild(img);
    container.classList.add("active");
  });
}

function showChoices(choices) {
  const area = document.getElementById("choices");
  area.innerHTML = "";
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      currentSceneIndex = choice.jumpTo;
      showScene();
    };
    area.appendChild(btn);
  });
  area.style.display = "block";
}

function hideChoices() {
  const area = document.getElementById("choices");
  area.innerHTML = "";
  area.style.display = "none";
}

// メニューとリスト
function handleMenuAction(item) {
  if (item.action === "jump" && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    loadMenu(item.menu);
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  }
}

function loadList(listFile) {
  fetch(`${config.listPath}${listFile}`)
    .then(res => res.json())
    .then(data => showList(data))
    .catch(err => console.error("リスト読み込みエラー:", err));
}

function showList(listData) {
  const listPanel = document.getElementById("list-panel");
  listPanel.innerHTML = "";
  listPanel.classList.remove("hidden");

  listData.items.slice(0, 7).forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      listPanel.classList.add("hidden");
      handleMenuAction(item);
    };
    listPanel.appendChild(btn);
  });
}

function loadMenu(menuFile) {
  fetch(`${config.menuPath}${menuFile}`)
    .then(res => res.json())
    .then(data => showMenu(data))
    .catch(err => console.error("メニュー読み込みエラー:", err));
}

function showMenu(menuData) {
  const menuPanel = document.getElementById("menu-panel");
  menuPanel.innerHTML = "";
  menuPanel.classList.remove("hidden");

  menuData.items.slice(0, 7).forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      menuPanel.classList.add("hidden");
      handleMenuAction(item);
    };
    menuPanel.appendChild(btn);
  });
}

// 初期化
window.addEventListener("DOMContentLoaded", () => {
  loadScenario("start.json");

  document.getElementById("click-layer").addEventListener("click", () => {
    if (!isSceneTransitioning) nextScene();
  });

  document.addEventListener("dblclick", () => {
    const menuPanel = document.getElementById("menu-panel");
    const listPanel = document.getElementById("list-panel");
    if (menuPanel.classList.contains("hidden")) {
      menuPanel.classList.remove("hidden");
    } else {
      menuPanel.classList.add("hidden");
    }
  });
});
