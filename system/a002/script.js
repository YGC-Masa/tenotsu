let scenario = [];
let currentIndex = 0;
let currentBGM = null;
let charaColors = {};

async function loadScenario(url) {
  const res = await fetch(url);
  scenario = await res.json();
}

async function loadCharacterColors(url) {
  const res = await fetch(url);
  charaColors = await res.json();
}

function setBGM(src) {
  if (!src) return;
  if (currentBGM) {
    currentBGM.pause();
    currentBGM = null;
  }
  currentBGM = new Audio(src);
  currentBGM.loop = true;
  currentBGM.volume = 0.5;
  currentBGM.play();
}

function setBackground(src) {
  const bg = document.getElementById("background");
  bg.style.backgroundImage = `url(${src})`;
}

function updateCharacters(scene) {
  const charLeft = document.getElementById("char-left");
  const charRight = document.getElementById("char-right");
  const charCenter = document.getElementById("char-center");

  [charLeft, charRight, charCenter].forEach(img => {
    img.style.opacity = "0";
    img.src = "";
  });

  if (scene.characters) {
    scene.characters.forEach(c => {
      let el;
      if (c.side === "left") el = charLeft;
      else if (c.side === "right") el = charRight;
      else el = charCenter;

      el.src = c.src;
      el.style.opacity = "1";
    });
  }
}

function updateText(name, text) {
  const nameElem = document.getElementById("name");
  const textElem = document.getElementById("text");

  nameElem.innerText = name || "";
  textElem.innerText = "";
  textElem.style.color = name && charaColors[name] ? charaColors[name] : "#ffffff";

  let index = 0;
  const speed = 30;

  const interval = setInterval(() => {
    if (index < text.length) {
      textElem.innerText += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, speed);
}

function showScene(index) {
  const scene = scenario[index];
  if (!scene) return;

  // テキストクリア
  document.getElementById("text").innerText = "";
  document.getElementById("name").innerText = "";

  if (scene.bg) setBackground(scene.bg);
  if (scene.bgm) setBGM(scene.bgm);
  updateCharacters(scene);
  updateText(scene.name, scene.text);
}

function nextScene() {
  if (currentIndex < scenario.length - 1) {
    currentIndex++;
    showScene(currentIndex);
  }
}

document.getElementById("text-area").addEventListener("click", () => {
  nextScene();
});

window.onload = async () => {
  await loadCharacterColors("./characterColors.json");
  await loadScenario("./scenario/start.json");
  showScene(currentIndex);
};
