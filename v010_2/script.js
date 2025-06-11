let currentLine = 0;
let scenario = [];
let displayedCharacters = {};
let speed = 40;
let fontSize = "1.2em";

async function loadScenario() {
  const response = await fetch("scenario/000start.json");
  scenario = Object.values(await response.json());
  if (scenario[0].fontSize) {
    document.getElementById("text-box").style.fontSize = scenario[0].fontSize;
  }
  if (scenario[0].speed) speed = scenario[0].speed;
  if (scenario[0].bgm) playBGM(scenario[0].bgm);
  showLine();
}

function playBGM(src) {
  const player = document.getElementById("bgm-player");
  player.src = src;
  player.play();
}

function showLine() {
  if (currentLine >= scenario.length) return;
  const line = scenario[currentLine];

  if (line.effect) applyEffect(line.effect);
  if (line.background) {
    document.getElementById("bg").style.backgroundImage = `url(${line.background})`;
  }
  if (line.characters) {
    line.characters.forEach(char => {
      const side = char.side;
      const elem = document.getElementById(`char-${side}`);
      if (char.src === null) {
        elem.style.opacity = 0;
        delete displayedCharacters[side];
      } else {
        elem.src = char.src;
        elem.style.opacity = 1;
        displayedCharacters[side] = char.src;
      }
    });
  }
  if (line.name !== undefined) {
    const nameBox = document.getElementById("name-box");
    nameBox.innerText = line.name;
    nameBox.style.color =
      (line.name in characterColors && characterColors[line.name]) ||
      (characterColors[""]) || "#FFFFFF";
  }
  const textBox = document.getElementById("text-box");
  textBox.innerText = "";
  let i = 0;
  const interval = setInterval(() => {
    if (i >= line.text.length) {
      clearInterval(interval);
    } else {
      textBox.innerText += line.text[i++];
    }
  }, speed);
  currentLine++;
}

function applyEffect(effect) {
  console.log("Effect:", effect);
}

document.body.addEventListener("click", showLine);
window.onload = loadScenario;