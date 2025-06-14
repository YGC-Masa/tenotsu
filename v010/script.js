const baseWidth = 1920;
const baseHeight = 1080;

function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

function showCharacter(side, src, scale = 1) {
  const container = document.getElementById(`char-${side}`);
  container.innerHTML = "";
  if (src) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "char-image";
    // ここはCSSで高さ制御するため、transform scaleは削除
    // 必要なら scale を追加するならCSSクラスやスタイルで調整する
    container.appendChild(img);
  }
}

let currentScenario = null;
let currentIndex = 0;
let lastBackground = null; // 前の背景画像パスを保持

function showBackground(src) {
  const bg = document.getElementById("background");
  if (src && typeof src === "string") {
    bg.src = src;
    lastBackground = src; // 新しい背景を記憶
  } else if (lastBackground) {
    bg.src = lastBackground; // 前の背景を再適用
  }
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



function showScene() {
  const scene = currentScenario[currentIndex];
  if (!scene) return;

  showBackground(scene.background);
  ["left", "center", "right"].forEach(pos => {
    const char = (scene.characters || []).find(c => c.side === pos);
    showCharacter(pos, char?.src || null, char?.scale || 1);
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
  showScene();
});

loadScenario("scenario/000start.json");
