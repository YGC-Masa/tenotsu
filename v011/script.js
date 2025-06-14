let currentSceneIndex = 0;
let scenario = [];
let speed = 30;
let fontSize = '1em';

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

function setCharacter(side, src, effect, scale = 1) {
  const slot = charSlots[side];
  slot.innerHTML = "";

  if (src) {
    const img = document.createElement("img");
    img.src = src;
    img.className = "char-image";
    img.style.transform = `scale(${scale})`;
    if (effect) {
      img.style.animation = `${effect} 0.5s ease`;
    }
    slot.appendChild(img);
  }
}

function showBackground(src, effect) {
  const bg = document.getElementById("background");
  if (!src) return;
  bg.style.animation = "";
  if (effect) {
    bg.style.animation = `${effect} 0.5s ease`;
  }
  bg.src = src;
}

function showText(text, speed) {
  const textElement = document.getElementById("text");
  textElement.innerHTML = "";
  let i = 0;
  function type() {
    if (i < text.length) {
      textElement.innerHTML += text[i++];
      setTimeout(type, speed);
    }
  }
  type();
}

function showScene(index) {
  const scene = scenario[index];
  if (!scene) return;

  currentSceneIndex = index;
  speed = scene.speed ?? speed;
  fontSize = scene.fontSize ?? fontSize;
  document.getElementById("text").style.fontSize = fontSize;

  if (scene.background) {
    showBackground(scene.background, scene.effect);
  }

  if (scene.characters) {
    scene.characters.forEach((char) => {
      setCharacter(char.side, char.src, char.effect, char.scale ?? 1);
    });
  }

  const nameElem = document.getElementById("name");
  nameElem.textContent = scene.name || "";
  nameElem.style.color = characterColors[scene.name] || characterColors[""];

  showText(scene.text || "", speed);

  const choicesContainer = document.getElementById("choices");
  choicesContainer.innerHTML = "";
  if (scene.choices) {
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        if (choice.jumpToScenario) {
          loadScenario(choice.jumpToScenario);
        } else if (typeof choice.jumpTo === "number") {
          showScene(choice.jumpTo);
        }
      };
      choicesContainer.appendChild(btn);
    });
  }
}

function loadScenario(path) {
  fetch(`scenario/${path}`)
    .then((res) => res.json())
    .then((data) => {
      scenario = data;
      showScene(0);
    });
}

window.onload = () => {
  loadScenario("000start.json");
};
