const baseWidth = 1920;
const baseHeight = 1080;
let scaleRatio = 1;

function calculateScaleRatio() {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;
  const shortSide = Math.min(screenW, screenH);
  scaleRatio = shortSide / Math.min(baseWidth, baseHeight);
}

function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

function showCharacter(side, src) {
  const container = document.getElementById(`char-${side}`);
  container.innerHTML = "";
  if (src) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "char-image";

    // 横表示は幅400pxベース、縦表示は600pxベースのスケーリング
    const baseCharWidth = 600;
    const shrinkRatio = isLandscape() ? 400 / baseCharWidth : 1;

    img.style.transform = `scale(${scaleRatio * shrinkRatio})`;
    container.appendChild(img);
  }
}

function showBackground(src) {
  const bg = document.getElementById("background");
  bg.src = src;
}

function showText(name, text, color) {
  document.getElementById("name").textContent = name;
  document.getElementById("name").style.color = color || "#C0C0C0";
  document.getElementById("text").textContent = text;
}

function showChoices(choices) {
  const container = document.getElementById("choices");
  container.innerHTML = "";
  choices.forEach(choice => {
    const button = document.createElement("button");
    button.textContent = choice.text;
    button.onclick = () => {
      if (choice.jumpTo) loadScenario(choice.jumpTo);
    };
    container.appendChild(button);
  });
}

let currentScenario = null;
let currentIndex = 0;

function showScene() {
  const scene = currentScenario[currentIndex];
  if (!scene) return;

  showBackground(scene.background);
  ["left", "center", "right"].forEach(pos => {
    const char = (scene.characters || []).find(c => c.side === pos);
    showCharacter(pos, char?.src || null);
  });

  const color = window.characterColors?.[scene.name] || "#C0C0C0";
  showText(scene.name || "", scene.text || "", color);

  if (scene.choices) {
    showChoices(scene.choices);
  } else {
    showChoices([]);
    currentIndex++;
    setTimeout(showScene, scene.speed || 2000);
  }
}

function loadScenario(path) {
  fetch(path)
    .then(res => res.json())
    .then(data => {
      currentScenario = data;
      currentIndex = 0;
      showScene();
    });
}

window.addEventListener("resize", () => {
  calculateScaleRatio();
  showScene();
});

calculateScaleRatio();
loadScenario("scenario/000start.json");
