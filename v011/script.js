(async function () {
  const background = document.getElementById("background");
  const charSlots = {
    left: document.getElementById("char-left"),
    center: document.getElementById("char-center"),
    right: document.getElementById("char-right")
  };
  const nameBox = document.getElementById("name");
  const textBox = document.getElementById("text");
  const choicesBox = document.getElementById("choices");

  let currentChars = { left: null, center: null, right: null };
  let scenes = [];
  let fontSize = "1em";
  let speed = 40;
  let i = 0;

  const delay = ms => new Promise(res => setTimeout(res, ms));

  async function loadScenario(filename, startIndex = 0) {
    const response = await fetch(`scenario/${filename}`);
    const data = await response.json();
    scenes = data.scenes;
    fontSize = data.fontSize || "1em";
    speed = data.speed || 40;
    document.documentElement.style.setProperty("--fontSize", fontSize);
    i = startIndex;
    showScene(i);
  }

  async function showScene(index) {
    if (!scenes[index]) return;
    const scene = scenes[index];
    if (scene.bg) background.src = scene.bg;
    if (scene.bgm) playBGM(scene.bgm);
    if (scene.se) playSE(scene.se);

    if (scene.characters) {
      ["left", "center", "right"].forEach(pos => {
        const charData = scene.characters.find(c => c.side === pos);
        if (charData) {
          if (charData.src === null) {
            charSlots[pos].innerHTML = "";
            currentChars[pos] = null;
          } else {
            if (currentChars[pos] !== charData.src) {
              const img = new Image();
              img.src = charData.src;
              img.className = "char-image";
              charSlots[pos].innerHTML = "";
              charSlots[pos].appendChild(img);
              currentChars[pos] = charData.src;
            }
          }
        }
      });
    }

    nameBox.textContent = scene.name || "";
    nameBox.style.color = characterColors[scene.name] || "#C0C0C0";
    textBox.textContent = "";

    for (let j = 0; j < (scene.text || "").length; j++) {
      textBox.textContent += scene.text[j];
      await delay(speed);
    }

    choicesBox.innerHTML = "";
    if (scene.choices) {
      scene.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.label;
        btn.onclick = () => {
          if (choice.jumpToScenario) {
            loadScenario(choice.jumpToScenario);
          } else if (typeof choice.jump === "number") {
            showScene(choice.jump);
          }
        };
        choicesBox.appendChild(btn);
      });
    } else {
      document.body.onclick = () => {
        document.body.onclick = null;
        showScene(++i);
      };
    }
  }

  function playBGM(src) {
    if (!playBGM.audio) {
      playBGM.audio = new Audio();
      playBGM.audio.loop = true;
    }
    if (!playBGM.audio.src.endsWith(src)) {
      playBGM.audio.src = src;
    }
    playBGM.audio.play();
  }

  function playSE(src) {
    const audio = new Audio(src);
    audio.play();
  }

  // 初期読み込み
  loadScenario("000start.json");
})();
