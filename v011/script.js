let currentIndex = 0;
let scenario = [];
const textBox = document.getElementById("text");
const optionsBox = document.getElementById("options");
const bgImage = document.getElementById("background");
const charLeft = document.getElementById("char-left");
const charCenter = document.getElementById("char-center");
const charRight = document.getElementById("char-right");
const bgm = document.getElementById("bgm");

const characterMap = {
  left: charLeft,
  center: charCenter,
  right: charRight,
};

let characterColors = {};

fetch("characterColors.js")
  .then((res) => res.text())
  .then((text) => {
    characterColors = eval(text);
  });

function setBackground(src) {
  bgImage.src = src || "";
}

function setCharacters(characters) {
  for (const side in characterMap) {
    const char = characters.find((c) => c.side === side);
    const img = characterMap[side];
    if (char && char.src) {
      img.src = char.src;
      img.style.display = "block";
    } else {
      img.style.display = "none";
    }
  }
}

function setText(text, speaker = "") {
  textBox.innerHTML = speaker
    ? `<span style="color:${characterColors[speaker] || "#C0C0C0"}">${speaker}：</span>${text}`
    : text;
}

function setOptions(options) {
  optionsBox.innerHTML = "";
  options?.forEach((opt) => {
    const btn = document.createElement("div");
    btn.className = "option";
    btn.textContent = opt.text;
    btn.onclick = () => {
      if (opt.jumpToUrl) location.href = opt.jumpToUrl;
      else if (opt.jumpToScenario) loadScenario(opt.jumpToScenario);
      else if (opt.jumpTo != null) {
        currentIndex = opt.jumpTo;
        showLine();
      }
    };
    optionsBox.appendChild(btn);
  });
}

function playBgm(src) {
  if (src) {
    if (bgm.src !== src) {
      bgm.src = src;
      bgm.play();
    }
  } else {
    bgm.pause();
    bgm.src = "";
  }
}

function showLine() {
  const line = scenario[currentIndex];
  if (!line) return;
  if (line.background) setBackground(line.background);
  if (line.characters) setCharacters(line.characters);
  if (line.bgm !== undefined) playBgm(line.bgm);
  setText(line.text || "", line.speaker);
  setOptions(line.options);
  if (!line.options) {
    currentIndex++;
    setTimeout(showLine, line.speed || 2000);
  }
}

function loadScenario(path) {
  fetch(path)
    .then((res) => res.json())
    .then((data) => {
      scenario = data;
      currentIndex = 0;
      showLine();
    });
}

loadScenario("v011/scenario/000start.json");
