let script = [];
let index = 0;
let currentScene = "prologue";
let bgmPlayer = new Audio();

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
  dialogueBox.textContent = "";
  dialogueBox.style.fontSize = scene.fontSize || "20px";
  const charColor = scene.color || (characterColors && characterColors[scene.name]) || "white";
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
    document.getElementById("dialogue").textContent = "（日常は続く……）";
    document.getElementById("name").textContent = "";
    bgmPlayer.pause();
  }
});

window.onload = () => loadScenario("prologue", 0);
