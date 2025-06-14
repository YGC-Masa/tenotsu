// v011/script.js

const scenarioPath = "v011/scenario/000start.json";
let scenario = [];
let currentLine = 0;
let isTyping = false;
let speed = 30;
let fontSize = "1em";
let bgm = null;

const nameBox = document.getElementById("name");
const textBox = document.getElementById("text");
const choicesBox = document.getElementById("choices");
const bgImg = document.getElementById("background");
const bgmPlayer = document.getElementById("bgm");
const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

function loadScenario(path) {
  fetch(path)
    .then((res) => res.json())
    .then((data) => {
      scenario = data.scenario;
      speed = data.speed || 30;
      fontSize = data.fontSize || "1em";
      textBox.style.fontSize = fontSize;
      showLine();
    });
}

function showLine() {
  if (currentLine >= scenario.length) return;
  const line = scenario[currentLine];

  // 背景処理
  if (line.bg) {
    bgImg.src = `assets/bgev/${line.bg}`;
  }

  // BGM処理
  if (line.bgm) {
    if (line.bgm === "none") {
      bgmPlayer.pause();
      bgmPlayer.src = "";
    } else {
      bgmPlayer.src = `assets/bgm/${line.bgm}`;
      bgmPlayer.play();
    }
  }

  // キャラクター処理
  if (line.characters) {
    ["left", "center", "right"].forEach((side) => {
      const slot = charSlots[side];
      const charData = line.characters.find((c) => c.side === side);

      if (!charData || charData.src === null) {
        slot.innerHTML = "";
        return;
      }

      const img = document.createElement("img");
      img.className = "char-image";
      img.src = `assets/char/${charData.src}`;
      slot.innerHTML = "";
      slot.appendChild(img);
    });
  }

  // テキスト処理
  nameBox.innerText = line.name || "";
  nameBox.style.color = characterColors[line.name] || characterColors[""];
  showText(line.text || "", () => {
    if (line.choices) {
      showChoices(line.choices);
    }
  });
}

function showText(text, callback) {
  isTyping = true;
  textBox.innerText = "";
  let i = 0;

  function typeChar() {
    if (i < text.length) {
      textBox.innerText += text[i++];
      setTimeout(typeChar, speed);
    } else {
      isTyping = false;
      callback?.();
    }
  }

  typeChar();
}

function showChoices(choices) {
  choicesBox.innerHTML = "";
  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.innerText = choice.text;
    btn.onclick = () => {
      if (choice.jumpTo) {
        currentLine = scenario.findIndex((line) => line.label === choice.jumpTo);
      } else if (choice.jumpToScenario) {
        loadScenario(`v011/scenario/${choice.jumpToScenario}`);
        currentLine = 0;
        return;
      } else if (choice.jumpToUrl) {
        location.href = choice.jumpToUrl;
        return;
      } else {
        currentLine++;
      }
      choicesBox.innerHTML = "";
      showLine();
    };
    choicesBox.appendChild(btn);
  });
}

document.addEventListener("click", () => {
  if (isTyping) {
    isTyping = false;
    const fullText = scenario[currentLine].text;
    textBox.innerText = fullText;
  } else if (!scenario[currentLine].choices) {
    currentLine++;
    showLine();
  }
});

loadScenario(scenarioPath);
