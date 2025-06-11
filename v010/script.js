let scenarioData;
let currentSceneId;
let speed = 30;
let fontSize = "20px";
let charactersState = {};
let bgmPlayer = document.getElementById("bgm");
let sePlayer = document.getElementById("se");

function loadScenario(path) {
  fetch(path)
    .then(response => response.json())
    .then(data => {
      scenarioData = data;
      speed = data.speed || 30;
      fontSize = data.fontSize || "20px";
      currentSceneId = data.start;
      showScene(currentSceneId);
    });
}

function showScene(sceneId) {
  const scene = scenarioData[sceneId];
  if (!scene) return;

  currentSceneId = sceneId;
  const dialogue = document.getElementById("dialogue");
  const textBox = document.getElementById("text-box");
  const choicesBox = document.getElementById("choices");

  textBox.style.fontSize = fontSize;
  choicesBox.innerHTML = "";

  // 背景画像
  if (scene.bg) {
    document.getElementById("background").style.backgroundImage = `url('${scene.bg}')`;
  }

  // BGM
  if (scene.bgm) {
    if (bgmPlayer.src !== scene.bgm) {
      bgmPlayer.src = scene.bgm;
      bgmPlayer.play();
    }
  }

  // キャラクター表示処理
  if (scene.characters) {
    updateCharacters(scene.characters);
  }

  // 名前・セリフ処理
  if (scene.text) {
    const name = scene.name || "";
    dialogue.innerHTML = "";
    const color = characterColors[name] || characterColors[""] || "#C0C0C0";
    textBox.style.color = color;
    showText(dialogue, scene.text, () => {
      if (scene.next) {
        setTimeout(() => showScene(scene.next), 500);
      }
    });
  } else if (scene.choices) {
    scene.choices.forEach(choice => {
      const button = document.createElement("button");
      button.className = "choice";
      button.textContent = choice.text;
      button.onclick = () => {
        if (choice.jumpToUrl) {
          location.href = choice.jumpToUrl;
        } else if (choice.jumpToScenario) {
          loadScenario(choice.jumpToScenario);
        } else if (choice.jumpToScene) {
          showScene(choice.jumpToScene);
        }
      };
      choicesBox.appendChild(button);
    });
  }
}

function showText(element, text, callback) {
  let i = 0;
  const timer = setInterval(() => {
    element.innerHTML += text.charAt(i++);
    if (i >= text.length) {
      clearInterval(timer);
      if (callback) callback();
    }
  }, speed);
}

function updateCharacters(characters) {
  const container = document.getElementById("characters");

  characters.forEach(char => {
    const side = char.side;
    const id = `char-${side}`;
    const existing = document.getElementById(id);

    if (char.src === null) {
      if (existing) {
        existing.classList.add("fade-out");
        setTimeout(() => existing.remove(), 500);
        delete charactersState[side];
      }
      return;
    }

    const img = document.createElement("img");
    img.src = char.src;
    img.className = "character";
    img.id = id;

    if (char.effect) img.classList.add(char.effect);
    else img.classList.add("dissolve");

    switch (side) {
      case "left":
        img.style.left = "0%";
        break;
      case "center":
        img.style.left = "35%";
        break;
      case "right":
        img.style.right = "0%";
        img.style.left = "auto";
        break;
    }

    if (existing) {
      existing.replaceWith(img);
    } else {
      container.appendChild(img);
    }

    charactersState[side] = char.src;
  });
}

// 開始
window.onload = () => {
  loadScenario("scenario/000start.json");
};
