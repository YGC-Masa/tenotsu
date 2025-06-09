let currentScene = 0;
let scenarioData = null;
let characterColors = {};

const textBox = document.getElementById("text");
const background = document.getElementById("background");
const charactersContainer = document.getElementById("characters");

async function loadScenario() {
  scenarioData = await fetch("scenario/000start.json").then(res => res.json());
  characterColors = await fetch("./../../characterColors.json").then(res => res.json());
  showScene();
}

function clearText() {
  textBox.textContent = "";
}

function showScene() {
  const scene = scenarioData.scenes[currentScene];
  clearText();

  // 背景
  if (scene.background) {
    background.style.backgroundImage = `url(${scene.background})`;
  }

  // キャラ処理（略）

  // フォントサイズ指定
  if (scene.fontSize) {
    textBox.style.fontSize = scene.fontSize;
  } else {
    textBox.style.fontSize = "18px"; // デフォルト
  }

  // 表示色（略）

  // セリフ表示（タイピング風に）
  typeText(scene.text, scene.speed || 30);
}

function typeText(text, speed) {
  textBox.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      textBox.textContent += text[i++];
    } else {
      clearInterval(interval);
    }
  }, speed);
}


function sideToPosition(side) {
  switch (side) {
    case "left": return "5%";
    case "center": return "40%";
    case "right": return "75%";
    default: return "50%";
  }
}

function getColorForScene(scene) {
  if (scene.color) return scene.color;
  return "#ffffff";
}

document.addEventListener("click", () => {
  if (currentScene < scenarioData.scenes.length) {
    showScene();
  }
});

loadScenario();
