// v012仕様対応 script.js

const scenarioDir = "scenario/";
let currentScenario = "000start.json";
let currentIndex = 0;
let autoMode = false;
let isSkipping = false;
let isTyping = false;
let charStyles = {};
let currentFontSize = "1em";
let currentSpeed = 30;

const nameBox = document.getElementById("name");
const textBox = document.getElementById("text");
const choicesBox = document.getElementById("choices");
const background = document.getElementById("background");
const bgm = new Audio();
const charLeft = document.getElementById("char-left");
const charCenter = document.getElementById("char-center");
const charRight = document.getElementById("char-right");

function loadCharacterStyles() {
  const script = document.createElement("script");
  script.src = "../characterStyles.js";
  document.head.appendChild(script);
}

function applyEffect(effect, callback) {
  switch (effect) {
    case "fadeOut":
      background.style.transition = "opacity 0.5s";
      background.style.opacity = 0;
      setTimeout(callback, 500);
      break;
    case "fadeIn":
      background.style.transition = "opacity 0.5s";
      background.style.opacity = 1;
      setTimeout(callback, 500);
      break;
    case "blackOut":
      background.style.backgroundColor = "black";
      background.src = "";
      setTimeout(callback, 500);
      break;
    case "whiteOut":
      background.style.backgroundColor = "white";
      background.src = "";
      setTimeout(callback, 500);
      break;
    default:
      callback();
  }
}

function setBackground(bgName) {
  background.style.backgroundColor = "";
  background.src = `../assets2/bgev/${bgName}`;
}

function setCharacter(position, filename) {
  const slot = {
    left: charLeft,
    center: charCenter,
    right: charRight,
  }[position];

  if (filename === null || filename === "null") {
    slot.innerHTML = "";
    return;
  }

  const img = document.createElement("img");
  img.src = `../assets2/char/${filename}`;
  img.classList.add("char-image");

  slot.innerHTML = "";
  slot.appendChild(img);
}

function playBGM(filename) {
  if (!filename) return;
  bgm.src = `../assets2/bgm/${filename}`;
  bgm.loop = true;
  bgm.play();
}

function setFontAndSpeed(name, overrideFontSize, overrideSpeed) {
  const defaultStyle = characterStyles[name] || { fontSize: "1em", speed: 30 };
  currentFontSize = overrideFontSize || defaultStyle.fontSize;
  currentSpeed = overrideSpeed !== undefined ? overrideSpeed : defaultStyle.speed;
  document.documentElement.style.setProperty("--fontSize", currentFontSize);
}

async function typeText(text) {
  isTyping = true;
  textBox.textContent = "";
  for (let i = 0; i < text.length; i++) {
    if (isSkipping) {
      textBox.textContent = text;
      break;
    }
    textBox.textContent += text[i];
    await new Promise((r) => setTimeout(r, currentSpeed));
  }
  isTyping = false;
}

function showDialogue(data, callback) {
  const { name, text, fontSize, speed } = data;
  nameBox.textContent = name || "";
  setFontAndSpeed(name, fontSize, speed);
  typeText(text).then(() => {
    if (autoMode) {
      setTimeout(callback, 1000);
    } else {
      document.body.addEventListener("click", function onClick() {
        document.body.removeEventListener("click", onClick);
        callback();
      });
    }
  });
}

function showChoices(choices) {
  choicesBox.innerHTML = "";
  choices.forEach((choice) => {
    const button = document.createElement("button");
    button.textContent = choice.text;
    button.onclick = () => {
      if (choice.jumpToScenario) {
        loadScenario(choice.jumpToScenario);
      } else {
        currentIndex = choice.next;
        runScenario();
      }
    };
    choicesBox.appendChild(button);
  });
}

function runScenario() {
  fetch(`${scenarioDir}${currentScenario}`)
    .then((res) => res.json())
    .then((data) => {
      const line = data[currentIndex];
      if (!line) return;

      if (line.effect) {
        applyEffect(line.effect, () => {
          currentIndex++;
          runScenario();
        });
        return;
      }

      if (line.bg) setBackground(line.bg);
      if (line.bgm) playBGM(line.bgm);
      if (line.char) {
        if (line.char.left !== undefined) setCharacter("left", line.char.left);
        if (line.char.center !== undefined) setCharacter("center", line.char.center);
        if (line.char.right !== undefined) setCharacter("right", line.char.right);
      }

      if (line.text) {
        choicesBox.innerHTML = "";
        showDialogue(line, () => {
          currentIndex++;
          runScenario();
        });
        return;
      }

      if (line.choices) {
        showChoices(line.choices);
        return;
      }

      if (line.jumpToScenario) {
        loadScenario(line.jumpToScenario);
        return;
      }

      currentIndex++;
      runScenario();
    });
}

function loadScenario(name) {
  currentScenario = name;
  currentIndex = 0;
  runScenario();
}

document.body.addEventListener("click", () => {
  if (isTyping) {
    isSkipping = true;
  }
});

document.getElementById("auto-button")?.addEventListener("click", () => {
  autoMode = !autoMode;
});

window.onload = () => {
  loadCharacterStyles();
  setTimeout(runScenario, 200);
};
