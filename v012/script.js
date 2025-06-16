let scenario = [];
let currentIndex = 0;
let isAuto = false;
let autoDelay = 1500;
let isSkipping = false;
let currentFontSize = "1em";
let currentSpeed = 50;

let charStyles = {};
let charColors = {};

window.addEventListener("load", async () => {
  // 外部ファイルを読み込む
  charColors = await loadJSON("../characterColors.js");
  charStyles = await loadJSON("../characterStyles.js");
  scenario = await loadJSON("scenario/000start.json");

  showLine();
});

async function loadJSON(path) {
  const module = await import(path);
  return module.default || module;
}

function showLine() {
  const line = scenario[currentIndex];
  if (!line) return;

  // 背景変更
  if (line.bg) {
    document.getElementById("background").src = `../assets2/bgev/${line.bg}`;
  }

  // BGM再生
  if (line.bgm) {
    const audio = document.getElementById("bgm");
    audio.src = `../assets2/bgm/${line.bgm}`;
    audio.loop = true;
    audio.play();
  }

  // キャラ表示
  if (line.char) {
    ["left", "center", "right"].forEach(pos => {
      const char = line.char[pos];
      const slot = document.getElementById(`char-${pos}`);
      if (char === null) {
        slot.innerHTML = "";
      } else if (char) {
        slot.innerHTML = `<img src="../assets2/char/${char}" class="char-image">`;
      }
    });
  }

  // フォントサイズと速度の決定
  const charName = line.name || "";
  const style = charStyles[charName] || {};
  currentFontSize = (line.fontSize || style.fontSize || "1em");
  currentSpeed = (line.speed || style.speed || 50);

  // 名前と色
  const nameBox = document.getElementById("name");
  nameBox.textContent = charName;
  nameBox.style.color = charColors[charName] || "#C0C0C0";

  // セリフ表示
  const textBox = document.getElementById("text");
  textBox.innerHTML = "";
  document.documentElement.style.setProperty("--fontSize", currentFontSize);
  typeText(line.text, textBox, currentSpeed);

  // 選択肢
  const choices = document.getElementById("choices");
  choices.innerHTML = "";
  if (line.choices) {
    line.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice.label;
      btn.onclick = async () => {
        if (choice.jumpToScenario) {
          scenario = await loadJSON(`scenario/${choice.jumpToScenario}`);
          currentIndex = 0;
        } else {
          currentIndex = choice.nextIndex ?? currentIndex + 1;
        }
        showLine();
      };
      choices.appendChild(btn);
    });
  }
}

function typeText(text, element, speed) {
  let index = 0;
  const interval = setInterval(() => {
    element.innerHTML += text.charAt(index);
    index++;
    if (index >= text.length) {
      clearInterval(interval);
      if (isAuto && !scenario[currentIndex].choices) {
        setTimeout(() => {
          currentIndex++;
          showLine();
        }, autoDelay);
      }
    }
  }, isSkipping ? 0 : speed);
}

document.addEventListener("click", () => {
  if (!scenario[currentIndex].choices) {
    currentIndex++;
    showLine();
  }
});
