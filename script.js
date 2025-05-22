
let script = [];
let index = 0;
let currentScene = "prologue";
let bgmPlayer = new Audio();
let sfx = new Audio("assets/sfx/type_sound.mp3");

const characterColors = {
  "アカリ": "#ff66cc",
  "？？？": "#00ffff",
  "ユウト": "#ffa500"
};

function loadScenario(name, startIndex = 0) {
  currentScene = name;
  fetch(`scenario/${name}.json`)
    .then(res => res.json())
    .then(data => {
      script = data;
      index = startIndex;
      showScene();
    });
}

function playBGM(src) {
  if (!src) return;
  if (bgmPlayer.src.includes(src)) return;
  bgmPlayer.pause();
  bgmPlayer = new Audio(src);
  bgmPlayer.loop = true;
  bgmPlayer.volume = 0.5;
  bgmPlayer.play();
}

function showScene() {
  const scene = script[index];
  const nameBox = document.getElementById("name");
  const dialogueBox = document.getElementById("dialogue");
  const character = document.getElementById("character");
  const background = document.getElementById("background");
  const choicesBox = document.getElementById("choices");

  if (scene.choices) {
    document.getElementById("text-box").classList.add("hidden");
    choicesBox.classList.remove("hidden");
    choicesBox.innerHTML = "";

    scene.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        if (choice.next !== undefined) {
          index = choice.next;
          choicesBox.classList.add("hidden");
          document.getElementById("text-box").classList.remove("hidden");
          showScene();
        } else if (choice.jump) {
          loadScenario(choice.jump.scene, choice.jump.index);
        }
      };
      choicesBox.appendChild(btn);
    });
    return;
  }

  if (scene.character) {
    character.src = scene.character;
    character.className = scene.side === "right" ? "right" : "left";
  }

  if (scene.background) {
    background.style.backgroundImage = `url(${scene.background})`;
  }

  if (scene.bgm) {
    playBGM(scene.bgm);
  }

  nameBox.textContent = scene.name || "";
  dialogueBox.style.fontSize = scene.fontSize || "20px";
  const charColor = scene.color || characterColors[scene.name] || "white";
  dialogueBox.style.color = charColor;
  typeText(scene.text || "", scene.speed || 30);
}

function typeText(text, speed) {
  const dialogueBox = document.getElementById("dialogue");
  let i = 0;
  dialogueBox.textContent = "";

  const interval = setInterval(() => {
    if (i < text.length) {
      dialogueBox.textContent += text.charAt(i);
      sfx.currentTime = 0;
      sfx.play();
      i++;
    } else {
      clearInterval(interval);
    }
  }, speed);
}

document.getElementById("ui").addEventListener("click", () => {
  if (script[index]?.choices) return;
  index++;
  if (index < script.length) {
    showScene();
  } else {
    document.getElementById("dialogue").textContent = "（物語は続く……）";
    document.getElementById("name").textContent = "";
    bgmPlayer.pause();
  }
});

function saveProgress() {
  localStorage.setItem("vn_save", JSON.stringify({
    scene: currentScene,
    index: index
  }));
}

function loadProgress() {
  const saveData = JSON.parse(localStorage.getItem("vn_save"));
  if (saveData) {
    loadScenario(saveData.scene, saveData.index);
  } else {
    loadScenario("prologue", 0);
  }
}

window.onload = () => loadProgress();
