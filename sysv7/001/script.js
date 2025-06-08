let scenario = [];
let currentIndex = 0;

async function loadScenario() {
  const res = await fetch("scenario.json");
  scenario = await res.json();
  playScene();
}

function setBackground(src) {
  if (src) document.getElementById("background").style.backgroundImage = `url(${src})`;
}

function setCharacters(chars = []) {
  ["left", "right", "center", "sub1", "sub2"].forEach(pos => {
    const el = document.getElementById("character-" + pos);
    el.innerHTML = "";
    const char = chars.find(c => c.side === pos);
    if (char) {
      const img = document.createElement("img");
      img.src = char.src;
      img.style.maxHeight = "100%";
      el.appendChild(img);
    }
  });
}

function setText(name, text, speed = 40, fontSize = 18) {
  const nameBox = document.getElementById("name");
  const textBox = document.getElementById("text");
  nameBox.textContent = name || "";
  nameBox.style.color = characterColors[name] || "white";
  textBox.style.fontSize = fontSize + "px";
  textBox.textContent = "";
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      textBox.textContent += text[i++];
    } else {
      clearInterval(interval);
    }
  }, speed);
}

function setChoices(choices) {
  const container = document.getElementById("choices");
  container.innerHTML = "";
  choices.forEach(choice => {
    const btn = document.createElement("button");
    btn.textContent = choice.text;
    btn.onclick = () => {
      if (choice.jumpToUrl) {
        window.location.href = choice.jumpToUrl;
      } else if (choice.next !== undefined) {
        currentIndex = choice.next;
        playScene();
      }
    };
    container.appendChild(btn);
  });
}

function setBGM(src) {
  const audio = document.getElementById("bgm");
  if (src && audio.src !== src) {
    audio.src = src;
    audio.play();
  }
}

function playScene() {
  const scene = scenario[currentIndex];
  if (!scene) return;
  if (scene.command === "jump" && scene.url) {
    window.location.href = scene.url;
    return;
  }

  setBackground(scene.bg);
  setCharacters(scene.characters);
  setBGM(scene.bgm);
  setText(scene.name, scene.text, scene.speed, scene.fontSize);

  if (scene.choices) {
    setChoices(scene.choices);
  } else {
    document.getElementById("choices").innerHTML = "";
    document.getElementById("text-box").onclick = () => {
      currentIndex++;
      playScene();
    };
  }
}

window.onload = loadScenario;