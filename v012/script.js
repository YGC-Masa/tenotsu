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
  const dialogueBox = document.getElementById("dialogue-box");

  let currentChars = { left: null, center: null, right: null };
  let autoMode = false;
  let textSpeed = 40;
  let i = 0;
  let skipping = false;
  let textFullyDisplayed = false;
  let autoTimer = null;

  const response = await fetch("scenario/000start.json");
  const data = await response.json();
  const scenes = data.scenes;
  const fontSize = data.fontSize || "1em";
  textSpeed = data.speed || 40;
  document.documentElement.style.setProperty("--fontSize", fontSize);

  const delay = ms => new Promise(res => setTimeout(res, ms));

  function playBGM(src) {
    if (!playBGM.audio) {
      playBGM.audio = new Audio();
      playBGM.audio.loop = true;
    }
    if (playBGM.audio.src !== location.origin + "/" + src) {
      playBGM.audio.src = src;
    }
    playBGM.audio.play();
  }

  function playSE(src) {
    const audio = new Audio(src);
    audio.play();
  }

  function setCharacter(pos, src) {
    const slot = charSlots[pos];
    if (!slot) return;
    if (!src) {
      slot.innerHTML = "";
      currentChars[pos] = null;
    } else {
      if (currentChars[pos] === src) return;
      const img = document.createElement("img");
      img.src = src;
      img.className = "char-image";
      slot.innerHTML = "";
      slot.appendChild(img);
      currentChars[pos] = src;
    }
  }

  async function showScene(index) {
    if (!scenes[index]) return;
    const scene = scenes[index];
    i = index;
    textFullyDisplayed = false;

    // 背景
    if (scene.bg) {
      background.src = scene.bg;
    }

    // BGM・SE
    if (scene.bgm) playBGM(scene.bgm);
    if (scene.se) playSE(scene.se);

    // キャラ
    if (scene.characters) {
      for (const pos of ["left", "center", "right"]) {
        const charData = scene.characters.find(c => c.side === pos);
        setCharacter(pos, charData ? charData.src : null);
      }
    }

    // 名前と色
    nameBox.textContent = scene.name || "";
    nameBox.style.color = characterColors[scene.name] || "#C0C0C0";

    // テキスト表示
    textBox.textContent = "";
    const text = scene.text || "";

    for (let j = 0; j < text.length; j++) {
      if (skipping) {
        textBox.textContent = text;
        break;
      }
      textBox.textContent += text[j];
      await delay(textSpeed);
    }

    textFullyDisplayed = true;
    skipping = false;

    // 選択肢
    choicesBox.innerHTML = "";
    if (scene.choices) {
      scene.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.label;
        btn.onclick = () => {
          autoMode = false;
          clearTimeout(autoTimer);
          showScene(choice.jump);
        };
        choicesBox.appendChild(btn);
      });
    } else if (index >= scenes.length - 1) {
      // 終端処理
      document.body.onclick = null;
      autoMode = false;
      await delay(300);
      nameBox.textContent = "";
      nameBox.style.color = "#C0C0C0";
      textBox.textContent = "物語は続く……";
    } else if (autoMode) {
      autoTimer = setTimeout(() => showScene(index + 1), 1500);
    }
  }

  // テキストクリック時の処理
  dialogueBox.addEventListener("click", () => {
    if (!textFullyDisplayed) {
      skipping = true;
    } else {
      showScene(i + 1);
    }
  });

  // 背景やキャラをクリックでテキスト表示切替
  const toggleDialogue = () => {
    const visible = dialogueBox.style.display !== "none";
    dialogueBox.style.display = visible ? "none" : "block";
  };

  const toggleAutoMode = () => {
    autoMode = !autoMode;
    if (autoMode && textFullyDisplayed && !choicesBox.hasChildNodes()) {
      autoTimer = setTimeout(() => showScene(i + 1), 1500);
    } else {
      clearTimeout(autoTimer);
    }
  };

  [background, ...Object.values(charSlots)].forEach(el => {
    el.addEventListener("click", toggleDialogue);
    el.addEventListener("dblclick", toggleAutoMode);
  });

  showScene(i);
})();
