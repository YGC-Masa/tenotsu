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
  let isTextDisplaying = false;
  const delay = ms => new Promise(res => setTimeout(res, ms));

  // effect適用関数（対象DOM, effect名, 入場or退場）
  async function applyEffect(element, effectName, mode = "in") {
    if (!element) return;
    if (!effectName) effectName = "fade";
    const effectClassMap = {
      "fade": { in: "effect-fade-in", out: "effect-fade-out" },
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
    const cls = effectClassMap[effectName] ? effectClassMap[effectName][mode] : null;
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

  // 背景画像差し替え
  async function changeBackground(newSrc, effectName) {
    if (!newSrc) return;

    const img = new Image();
    img.src = newSrc;
    await new Promise(res => {
      img.onload = res;
      img.onerror = res;
    });

    await applyEffect(background, effectName ? effectName.replace("-in", "-out") : "fade-out", "out");

    background.src = newSrc;

    await applyEffect(background, effectName || "fade-in", "in");
  }

  // キャラ画像差し替え（Nullで退場だが currentCharsは保持）
  async function changeCharacter(pos, charData) {
    const slot = charSlots[pos];
    if (!slot) return;

    // 退場: src === null → 表示は消すが currentCharsは保持
    if (charData.src === null) {
      if (slot.firstElementChild) {
        await applyEffect(slot.firstElementChild, charData.effect || "fade-out", "out");
        slot.innerHTML = "";
        // currentChars[pos]はクリアしない（画像パスはメモリに残す）
      }
      return;
    }

    // 既に同じ画像なら何もしない
    if (currentChars[pos] === charData.src) return;

    const img = new Image();
    img.src = charData.src;
    img.className = "char-image";
    img.style.opacity = 0;

    await new Promise(res => {
      img.onload = res;
      img.onerror = res;
    });

    // 古い画像をoutエフェクトで退場
    if (slot.firstElementChild) {
      await applyEffect(slot.firstElementChild, charData.effect ? charData.effect.replace("-in", "-out") : "fade-out", "out");
    }

    slot.innerHTML = "";
    slot.appendChild(img);

    await applyEffect(img, charData.effect || "fade-in", "in");

    currentChars[pos] = charData.src;
  }

  // BGM再生
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

  // SE再生
  function playSE(src) {
    const audio = new Audio(src);
    audio.play();
  }

  // テキスト表示を一気に表示するフラグ
  let skipText = false;

  async function showScene(index) {
    if (!scenes[index]) {
      // シナリオ終了時モブセリフ表示で停止
      nameBox.textContent = "";
      nameBox.style.color = characterColors[""] || "#C0C0C0";
      textBox.textContent = "物語は続く・・・";
      choicesBox.innerHTML = "";
      isTextDisplaying = false;
      return;
    }

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

    textBox.textContent = "";
    isTextDisplaying = true;
    skipText = false;

    for (let j = 0; j < (scene.text || "").length; j++) {
      if (skipText) {
        textBox.textContent = scene.text;
        break;
      }
      textBox.textContent += scene.text[j];
      await delay(speed);
    }
    isTextDisplaying = false;

    choicesBox.innerHTML = "";
    if (scene.choices) {
      scene.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.label;
        btn.onclick = () => showScene(choice.jump);
        choicesBox.appendChild(btn);
      });
    }
  }

  // クリック処理：テキスト表示の制御
  document.getElementById("game").addEventListener("click", () => {
    if (isTextDisplaying) {
      // テキスト表示中は一気に表示に切り替え
      skipText = true;
    } else {
      // 表示終了後は次シーンへ
      showScene(++i);
    }
  });

  // 初回表示
  showScene(i);

})();
