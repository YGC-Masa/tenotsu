
let scenario = [];
let currentIndex = 0;
let isAnimating = false;
let textSpeed = 30;
let fontSize = "1em";

const background = document.getElementById("background");
const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};
const nameBox = document.getElementById("name");
const textBox = document.getElementById("text");
const choicesBox = document.getElementById("choices");

const characterColors = {};

fetch("../characterColors.js")
  .then((res) => res.text())
  .then((text) => {
    const colorData = text.match(/\{[\s\S]*\}/);
    Object.assign(characterColors, JSON.parse(colorData[0]));
  });

function loadScenario(path) {
  fetch(path)
    .then((res) => res.json())
    .then((data) => {
      scenario = data.scenario;
      currentIndex = 0;
      textSpeed = data.speed || 30;
      fontSize = data.fontSize || "1em";
      textBox.style.fontSize = fontSize;
      nameBox.style.fontSize = fontSize;
      showLine();
    });
}

function showLine() {
  if (currentIndex >= scenario.length) return;
  const line = scenario[currentIndex];

  // 背景変更
  if (line.bg) {
    background.src = `../assets/${line.bg}`;
  }

  // キャラ表示
  if (line.characters) {
    ["left", "center", "right"].forEach((side) => {
      const charInfo = line.characters.find((c) => c.side === side);
      const slot = charSlots[side];

      if (!charInfo || charInfo.src === null) {
        slot.innerHTML = "";
        return;
      }

      const img = document.createElement("img");
      img.src = `../assets/${charInfo.src}`;
      img.className = "char-image";
      if (charInfo.effect) {
        img.style.animation = `${charInfo.effect} 0.5s ease`;
      }
      slot.innerHTML = "";
      slot.appendChild(img);
    });
  }

  // 名前とテキスト
  nameBox.textContent = line.name || "";
  nameBox.style.color = characterColors[line.name] || "#C0C0C0";
  showText(line.text || "", () => {
    if (line.choices) {
      showChoices(line.choices);
    } else {
      currentIndex++;
    }
  });
}

function showText(text, callback) {
  isAnimating = true;
  textBox.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    textBox.textContent += text[i++];
    if (i >= text.length) {
      clearInterval(timer);
      isAnimating = false;
      if (callback) callback();
    }
  }, textSpeed);
}

function showChoices(choices) {
  choicesBox.innerHTML = "";
  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      choicesBox.innerHTML = "";
      if (choice.jumpTo) {
        currentIndex = choice.jumpTo;
        showLine();
      } else if (choice.jumpToScenario) {
        loadScenario(`scenario/${choice.jumpToScenario}`);
      } else if (choice.jumpToUrl) {
        location.href = choice.jumpToUrl;
      }
    };
    choicesBox.appendChild(btn);
  });
}

background.addEventListener("click", () => {
  if (!isAnimating && choicesBox.children.length === 0) {
    showLine();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadScenario("scenario/000start.json");
});
