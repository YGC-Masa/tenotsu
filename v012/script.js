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

  // effect適用関数（対象DOM, effect名, 入場or退場）
  async function applyEffect(element, effectName, mode = "in") {
    if (!element) return;
    if (!effectName) effectName = "dissolve";
    // マップを作成（in/outで変化）
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
    const cls = effectClassMap[effectName] ? effectClassMap[effectName][mode] : null;
    if (!cls) return; // 未対応のeffect

    // クラス付与してアニメーション開始
    element.classList.add(cls);

    // アニメーション終了時にクラスを外すPromise
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

  // 背景画像差し替え+effect付き
  async function changeBackground(newSrc, effectName) {
    if (!newSrc) return;
    // 新しい画像をプリロード
    const img = new Image();
    img.src = newSrc;
    await new Promise(res => {
      img.onload = res;
      img.onerror = res;
    });

    // effectがfade系なら、古い画像にfade-outかblack-out等を適用し、その間にsrc切り替え、最後にfade-inを適用する形が理想
    // ここではシンプルにfadeで実装

    // fade-out古い背景
    await applyEffect(background, effectName ? effectName.replace("-in", "-out") : "fade-out", "out");

    // 画像差し替え
    background.src = newSrc;

    // fade-in新背景
    await applyEffect(background, effectName || "fade-in", "in");
  }

  // キャラ画像差し替え+effect付き
  async function changeCharacter(pos, charData) {
    const slot = charSlots[pos];
    if (!slot) return;

    // キャラ退場
    if (charData.src === null) {
      if (currentChars[pos]) {
        // 退場エフェクトがあれば
        await applyEffect(slot.firstElementChild, charData.effect || "fade-out", "out");
        slot.innerHTML = "";
        currentChars[pos] = null;
      }
      return;
    }

    // 既に同じ画像なら何もしない
    if (currentChars[pos] === charData.src) return;

    // 新しい画像を用意
    const img = new Image();
    img.src = charData.src;
    img.className = "char-image";
    img.style.opacity = 0;

    // 表示する前にプリロード
    await new Promise(res => {
      img.onload = res;
      img.onerror = res;
    });

    // 古い画像をoutエフェクト
    if (slot.firstElementChild) {
      await applyEffect(slot.firstElementChild, charData.effect ? charData.effect.replace("-in", "-out") : "fade-out", "out");
    }

    slot.innerHTML = "";
    slot.appendChild(img);

    // 入場エフェクト
    await applyEffect(img, charData.effect || "fade-in", "in");
    currentChars[pos] = charData.src;
  }

  async function showScene(index) {
    if (!scenes[index]) return;
    const scene = scenes[index];

    // 背景差し替え（effect対応）
    if (scene.bg) {
      await changeBackground(scene.bg, scene.bgEffect || scene.effect);
    }

    // BGM・SE再生
    if (scene.bgm) playBGM(scene.bgm);
    if (scene.se) playSE(scene.se);

    // キャラ表示差し替え（effect対応）
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
      document.body.onclick = null; // クリックで自動進行を無効化
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
