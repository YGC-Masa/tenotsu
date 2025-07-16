let currentScenario = "000start.json";
let currentIndex = 0;
let isMuted = true;
let typingInterval = null;
let isAutoMode = false;
let isPlaying = false;
let autoWaitTime = 2000;
let currentSpeed = 40;
let textAreaVisible = true;
let returnToTitleHandler = null;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const clickLayer = document.getElementById("click-layer");
const dialogueBox = document.getElementById("dialogue-box");

function updateTextAreaVisibility(show) {
  textAreaVisible = show;
  dialogueBox.classList.toggle("hidden", !show);
}

function setTextWithSpeed(text, speed, callback) {
  if (typingInterval) clearInterval(typingInterval);
  textEl.innerHTML = "";
  isPlaying = true;
  let i = 0;
  typingInterval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(typingInterval);
      isPlaying = false;
      if (callback) callback();
      if (isAutoMode && choicesEl.children.length === 0) {
        setTimeout(() => { if (!isPlaying) next(); }, autoWaitTime);
      }
    }
  }, speed);
}

function next() {
  fetch(config.scenarioPath + currentScenario + "?t=" + Date.now())
    .then(res => res.json())
    .then(data => {
      currentIndex++;
      const scenes = Array.isArray(data) ? data : data.scenes;
      if (currentIndex < scenes.length) {
        showScene(scenes[currentIndex]);
      } else {
        // 物語終了時の処理
        if (textAreaVisible) {
          nameEl.textContent = "";
          textEl.innerHTML = "（物語は つづく・・・クリックでタイトルに戻ります）";

          returnToTitleHandler = () => {
            clickLayer.removeEventListener("click", returnToTitleHandler);
            loadScenario("000start.json");
          };

          clickLayer.addEventListener("click", returnToTitleHandler);
        }
      }
    });
}

function loadScenario(filename) {
  if (typingInterval) clearInterval(typingInterval);
  currentScenario = filename;
  currentIndex = 0;
  nameEl.textContent = "";
  textEl.innerHTML = "";
  updateTextAreaVisibility(true);
  if (returnToTitleHandler) {
    clickLayer.removeEventListener("click", returnToTitleHandler);
    returnToTitleHandler = null;
  }

  fetch(config.scenarioPath + filename + "?t=" + Date.now())
    .then(res => res.json())
    .then(data => {
      const scenes = Array.isArray(data) ? data : data.scenes;
      showScene(scenes[0]);
    });
}

function showScene(scene) {
  if (!scene) return;
  if (typingInterval) clearInterval(typingInterval);

  nameEl.textContent = scene.name || "";
  textEl.innerHTML = "";
  updateTextAreaVisibility(scene.textareashow !== false);

  if (scene.name && scene.text) {
    setTextWithSpeed(scene.text, currentSpeed);
  }
}

// ▼ イベント設定
clickLayer.addEventListener("click", () => {
  if (!isPlaying && choicesEl.children.length === 0) {
    next();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  loadScenario(currentScenario);
});

let clickTimeout = null;

clickLayer.addEventListener("click", () => {
  if (clickTimeout) return;
  clickTimeout = setTimeout(() => {
    if (!isPlaying && choicesEl.children.length === 0) {
      next();
    }
    clickTimeout = null;
  }, 300);
});

clickLayer.addEventListener("dblclick", () => {
  if (clickTimeout) {
    clearTimeout(clickTimeout);
    clickTimeout = null;
  }
  loadMenu("menu01.json");
});
