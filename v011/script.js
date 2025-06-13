let scenario = [];
let currentLine = 0;
let isTyping = false;
let typingSpeed = 30;
let fontSize = "1.2em";
let autoMode = false;
let autoTimer = null;

const bg = document.getElementById("background");
const nameBox = document.getElementById("name");
const textBox = document.getElementById("text");
const dialogueBox = document.getElementById("dialogue-box");
const choicesBox = document.getElementById("choices");
const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right")
};

function applyEffect(element, effect) {
  if (!effect) effect = "dissolve";
  element.classList.remove(...element.classList);
  void element.offsetWidth;
  element.classList.add(effect);
}

function setCharacter({ side, src, effect, scale = 1.0 }) {
  const container = charSlots[side];
  container.innerHTML = "";
  if (!src) return;

  const img = document.createElement("img");
  img.src = src;
  img.className = "char-image";
  img.style.transform = `scale(${scale})`;

  applyEffect(img, effect);
  container.appendChild(img);
}

function setBackground(src, effect) {
  if (effect) applyEffect(bg, effect);
  bg.src = src;
}

function showDialogue({ name, text, speed, fontSize: size }) {
  nameBox.style.color = characterColors[name] || "#C0C0C0";
  nameBox.textContent = name || "";
  textBox.style.fontSize = size || fontSize;
  typingSpeed = speed || 30;
  typeText(text);
}

function typeText(text) {
  isTyping = true;
  textBox.textContent = "";
  let i = 0;
  function type() {
    if (!isTyping) {
      textBox.textContent = text;
      return;
    }
    if (i < text.length) {
      textBox.textContent += text[i++];
      setTimeout(type, typingSpeed);
    } else {
      isTyping = false;
      if (autoMode) autoTimer = setTimeout(nextLine, 1500);
    }
  }
  type();
}

function showChoices(choices) {
  choicesBox.innerHTML = "";
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      if (choice.jumpToUrl) location.href = choice.jumpToUrl;
      if (choice.jumpToScenario) loadScenario(choice.jumpToScenario);
      if (typeof choice.jumpToLine === "number") {
        currentLine = choice.jumpToLine;
        playLine();
      }
    };
    choicesBox.appendChild(btn);
  });
}

function playLine() {
  const line = scenario[currentLine];
  if (!line) return;

  if (line.background) setBackground(line.background, line.effect);
  (line.characters || []).forEach(c => setCharacter(c));
  if (line.choices) showChoices(line.choices);
  else showDialogue(line);
}

function nextLine() {
  if (isTyping) {
    isTyping = false;
    return;
  }
  currentLine++;
  playLine();
}

dialogueBox.addEventListener("click", nextLine);
document.body.addEventListener("dblclick", () => {
  autoMode = !autoMode;
  if (autoMode) nextLine();
  else clearTimeout(autoTimer);
});

function loadScenario(filename) {
  fetch(`scenario/${filename}`)
    .then(res => res.json())
    .then(data => {
      scenario = data;
      currentLine = 0;
      playLine();
    });
}

loadScenario("000start.json");
