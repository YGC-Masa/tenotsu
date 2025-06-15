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
  const nextButton = document.getElementById("next");

  let currentChars = { left: null, center: null, right: null };
  let autoMode = false;

  const response = await fetch("scenario/000start.json");
  const data = await response.json();
  const scenes = data.scenes;
  const fontSize = data.fontSize || "1em";
  const speed = data.speed || 40;
  document.documentElement.style.setProperty("--fontSize", fontSize);

  let i = 0;
  const delay = ms => new Promise(res => setTimeout(res, ms));

  async function changeBackground(newSrc) {
    if (!newSrc) return;
    background.src = newSrc;
  }

  async function changeCharacter(pos, charData) {
    const slot = charSlots[pos];
    if (!slot) return;

    // 退場
    if (charData.src === null) {
      slot.innerHTML = "";
      currentChars[pos] = null;
      return;
    }

    if (currentChars[pos] === charData.src) return;

    const img = new Image();
    img.src = charData.src;
    img.className = "char-image";

    await new Promise(res => {
      img.onload = res;
      img.onerror = res;
    });

    slot.innerHTML = "";
    slot.appendChild(img);
    currentChars[pos] = charData.src;
  }

  async function showScene(index) {
    if (!scenes[index]) return;
    const scene = scenes[index];

    if (scene.bg) await changeBackground(scene.bg);

    if (scene.bgm) playBGM(scene.bgm);
    if (scene.se) playSE(scene.se);

    if (scene.characters) {
      for (const pos of ["left", "center", "right"]) {
        const charData = scene.characters.find(c => c.side === pos);
        if (charData) {
          await changeCharacter(pos, charData);
        }
      }
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
        btn.onclick = () => showScene(choice.jump);
        choicesBox.appendChild(btn);
      });
    } else {
      nextButton.style.display = "block";
      nextButton.onclick = () => {
        nextButton.style.display = "none";
        showScene(++i);
      };
    }
  }

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

  showScene(i);
})();
