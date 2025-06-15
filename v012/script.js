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
  let autoMode = false;

  const response = await fetch("scenario/000start.json");
  const data = await response.json();
  const scenes = data.scenes;
  const fontSize = data.fontSize || "1em";
  const speed = data.speed || 40;
  document.documentElement.style.setProperty("--fontSize", fontSize);

  let i = 0;
  const delay = ms => new Promise(res => setTimeout(res, ms));

  async function applyEffect(element, effectName, mode = "in") {
    if (!element) return;
    if (!effectName) effectName = "dissolve";

    const effectClassMap = {
      "dissolve": { in: "effect-fade-in", out: "effect-fade-out" },
      "fade-in": { in: "effect-fade-in" },
      "fade-out": { out: "effect-fade-out" },
      "slide-left-in": { in: "effect-slide-left-in" },
      "slide-right-in": { in: "effect-slide-right-in" },
      "slide-left-out": { out: "effect-slide-left-out" },
      "slide-right-out": { out: "effect-slide-right-out" },
      "black-in": { in: "effect-black-in" },
      "black-out": { out: "effect-black-out" },
      "white-in": { in: "effect-white-in" },
      "white-out": { out: "effect-white-out" },
    };
    const cls = effectClassMap[effectName]?.[mode];
    if (!cls) return;

    element.classList.add(cls);
    await new Promise(resolve => {
      function onAnimEnd(e) {
        if (e.target === element) {
          element.removeEventListener("animationend", onAnimEnd);
          element.classList.remove(cls);
          resolve();
        }
      }
      element.addEventListener("animationend", onAnimEnd);
    });
  }

  async function changeBackground(newSrc, effectName) {
    if (!newSrc) return;
    const img = new Image();
    img.src = newSrc;
    await new Promise(res => { img.onload = res; img.onerror = res; });

    await applyEffect(background, effectName?.replace("-in", "-out") || "fade-out", "out");
    background.src = newSrc;
    await applyEffect(background, effectName || "fade-in", "in");
  }

  async function changeCharacter(pos, charData) {
    const slot = charSlots[pos];
    if (!slot) return;

    if (charData.src === null) {
      if (currentChars[pos]) {
        await applyEffect(slot.firstElementChild, charData.effect || "fade-out", "out");
        slot.innerHTML = "";
        currentChars[pos] = null;
      }
      return;
    }

    const img = new Image();
    img.src = charData.src;
    img.className = "char-image";
    img.style.opacity = 0;

    await new Promise(res => { img.onload = res; img.onerror = res; });

    if (slot.firstElementChild) {
      await applyEffect(slot.firstElementChild, charData.effect?.replace("-in", "-out") || "fade-out", "out");
    }

    slot.innerHTML = "";
    slot.appendChild(img);

    await applyEffect(img, charData.effect || "fade-in", "in");
    img.style.opacity = 1;

    currentChars[pos] = charData.src;
  }

  async function showScene(index) {
    if (!scenes[index]) return;
    const scene = scenes[index];

    if (scene.bg) {
      await changeBackground(scene.bg, scene.bgEffect || scene.effect);
    }

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

    const sceneText = scene.text || "";
    textBox.textContent = "";
    for (let j = 0; j < sceneText.length; j++) {
      textBox.textContent += sceneText[j];
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
      document.body.onclick = null;
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
