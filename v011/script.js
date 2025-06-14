let currentScenario = null;
let currentIndex = 0;
let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let lastBackground = null;

function loadScenario(path) {
  fetch(path)
    .then(response => response.json())
    .then(data => {
      currentScenario = data;
      currentIndex = 0;
      applySettings(data);
      showNext();
    });
}

function applySettings(data) {
  const text = document.getElementById("text");
  text.style.fontSize = (data.fontSize || "24px");
  text.dataset.speed = data.speed || "40";
}

function showNext() {
  if (!currentScenario || currentIndex >= currentScenario.scenes.length) return;
  const scene = currentScenario.scenes[currentIndex++];

  if (scene.jumpToUrl) {
    window.location.href = scene.jumpToUrl;
    return;
  }

  if (scene.jumpToScenario) {
    loadScenario(scene.jumpToScenario);
    return;
  }

  showBackground(scene.background);
  showCharacters(scene.characters || []);
  showDialogue(scene);

  if (scene.effect) {
    applyEffect(scene.effect);
  }
}

function showBackground(src) {
  const bg = document.getElementById("background");
  if (src && typeof src === "string") {
    bg.src = src;
    lastBackground = src;
  } else if (lastBackground) {
    bg.src = lastBackground;
  }
}

function showCharacters(characters) {
  const positions = ["left", "center", "right"];
  positions.forEach(pos => {
    const img = document.getElementById(`char-${pos}`);
    img.style.display = "none";
  });

  characters.forEach(char => {
    const img = document.getElementById(`char-${char.side}`);
    if (char.src) {
      img.src = char.src;
      img.style.display = "block";
      img.className = ""; // エフェクトリセット
      if (char.effect) img.classList.add(char.effect);
    } else {
      img.style.display = "none";
    }
  });
}

function showDialogue(scene) {
  const nameElem = document.getElementById("name");
  const textElem = document.getElementById("text");
  const colorMap = window.characterColors || {};
  const color = colorMap[scene.name] || "#C0C0C0";

  nameElem.textContent = scene.name || "";
  nameElem.style.color = color;

  textElem.innerHTML = "";
  const text = scene.text || "";
  let index = 0;
  const speed = parseInt(textElem.dataset.speed, 10);

  function typeChar() {
    if (index < text.length) {
      textElem.innerHTML += text[index++];
      setTimeout(typeChar, speed);
    }
  }

  typeChar();
}

function applyEffect(effectName) {
  const overlay = document.getElementById("overlay");
  overlay.className = "overlay " + effectName;
  overlay.style.display = "block";
  overlay.addEventListener("animationend", () => {
    overlay.style.display = "none";
    overlay.className = "overlay";
  }, { once: true });
}

document.getElementById("next-button").addEventListener("click", showNext);

// 初期シナリオ読み込み
window.addEventListener("DOMContentLoaded", () => {
  loadScenario("scenario/000start.json");
});
