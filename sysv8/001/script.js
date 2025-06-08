let scenario = [];
let currentIndex = 0;

const background = document.getElementById("background");
const characters = document.getElementById("characters");
const nameBox = document.getElementById("nameBox");
const textBox = document.getElementById("textBox");
const choicesBox = document.getElementById("choices");
const bgmPlayer = document.getElementById("bgm");

function loadScenario(file) {
  fetch(file)
    .then(res => res.json())
    .then(data => {
      scenario = data;
      currentIndex = 0;
      showLine();
    });
}

function showLine() {
  const line = scenario[currentIndex];
  if (!line) return;

  // 背景処理
  if (line.bg) {
    background.style.opacity = 0;
    setTimeout(() => {
      background.style.backgroundImage = `url(${line.bg})`;
      background.style.opacity = 1;
    }, 500);
  }

  // BGM処理
  if (line.bgm) {
    bgmPlayer.src = line.bgm;
    bgmPlayer.play();
  }

  // キャラクター処理
  characters.innerHTML = "";
  if (line.characters) {
    line.characters.forEach(char => {
      const img = document.createElement("img");
      img.src = char.src;
img.style.left =
  char.side === "left" ? "15%" :
  char.side === "left2" ? "30%" :
  char.side === "center" ? "45%" :
  char.side === "right2" ? "60%" :
  char.side === "right" ? "75%" :
  "45%"; // デフォルトは中央
      characters.appendChild(img);
    });
  }

  // テキスト処理
  nameBox.textContent = line.name || "";
  const baseColor = characterColors[line.name];
  nameBox.style.color = baseColor || line.color || "white";

  textBox.textContent = line.text || "";

  // 選択肢処理
  choicesBox.innerHTML = "";
  if (line.choices) {
    line.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        if (choice.jumpToScenario) {
          loadScenario(choice.jumpToScenario);
        } else if (choice.jumpToUrl) {
          location.href = choice.jumpToUrl;
        } else if (choice.next !== undefined) {
          currentIndex = choice.next;
          showLine();
        }
      };
      choicesBox.appendChild(btn);
    });
  } else {
    document.body.onclick = () => {
      currentIndex++;
      showLine();
    };
  }
}

window.onload = () => {
  loadScenario("scenario/000start.json");
};
