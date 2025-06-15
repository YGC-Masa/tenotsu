(async function () {
  const background = document.getElementById("background");
  const charSlots = {
    left: document.getElementById("char-left"),
    center: document.getElementById("char-center"),
    right: document.getElementById("char-right"),
  };
  const nameBox = document.getElementById("name");
  const textBox = document.getElementById("text");
  const choicesBox = document.getElementById("choices");
  const dialogueBox = document.getElementById("dialogue-box");
  const game = document.getElementById("game");

  let currentChars = { left: null, center: null, right: null };
  let isTextDisplaying = false;
  let autoMode = false;
  let autoTimeoutId = null;

  // フォントサイズ・速度はシナリオから設定
  const response = await fetch("scenario/000start.json");
  const data = await response.json();
  const scenes = data.scenes;
  const fontSize = data.fontSize || "1em";
  const speed = data.speed || 40;
  document.documentElement.style.setProperty("--fontSize", fontSize);

  let sceneIndex = 0;

  // テキストを1文字ずつ表示
  async function showText(text) {
    isTextDisplaying = true;
    textBox.textContent = "";
    for (let i = 0; i < text.length; i++) {
      textBox.textContent += text[i];
      await delay(speed);
      if (!isTextDisplaying) {
        // 中断された場合は一気に表示
        textBox.textContent = text;
        break;
      }
    }
    isTextDisplaying = false;
  }

  // 遅延用
  const delay = ms => new Promise(res => setTimeout(res, ms));

  // キャラ画像差し替え・退場。nullで退場扱い
  async function changeCharacter(pos, charData) {
    const slot = charSlots[pos];
    if (!slot) return;

    if (!charData || charData.src === null) {
      // 退場時は即座に画像削除
      if (currentChars[pos]) {
        slot.innerHTML = "";
        currentChars[pos] = null;
      }
      return;
    }

    if (currentChars[pos] === charData.src) return;

    // 画像をプリロードして差し替え
    const img = new Image();
    img.src = charData.src;
    img.className = "char-image";
    img.style.opacity = "1";

    await new Promise(res => {
      img.onload = res;
      img.onerror = res;
    });

    slot.innerHTML = "";
    slot.appendChild(img);
    currentChars[pos] = charData.src;
  }

  // 背景差し替え
  async function changeBackground(newSrc) {
    if (!newSrc || background.src.endsWith(newSrc)) return;

    const img = new Image();
    img.src = newSrc;
    await new Promise(res => {
      img.onload = res;
      img.onerror = res;
    });

    background.src = newSrc;
  }

  // BGM再生（ループ）
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

  // SE再生（ワンショット）
  function playSE(src) {
    if (!src) return;
    const audio = new Audio(src);
    audio.play();
  }

  // シーン表示
  async function showScene(index) {
    if (!scenes[index]) {
      // シナリオ終了時のモブセリフで停止
      nameBox.textContent = "";
      textBox.textContent = "物語は続く・・・";
      choicesBox.innerHTML = "";
      return;
    }

    sceneIndex = index;
    const scene = scenes[index];

    if (scene.bg) await changeBackground(scene.bg);

    if (scene.bgm) playBGM(scene.bgm);
    if (scene.se) playSE(scene.se);

    // キャラ配置
    for (const pos of ["left", "center", "right"]) {
      const charData = scene.characters ? scene.characters.find(c => c.side === pos) : null;
      await changeCharacter(pos, charData);
    }

    // 名前表示と色設定
    nameBox.textContent = scene.name || "";
    nameBox.style.color = characterColors[scene.name] || "#C0C0C0";
    document.documentElement.style.setProperty("--name-color", nameBox.style.color);

    // テキスト表示（1文字ずつ）
    await showText(scene.text || "");

    // 選択肢表示
    choicesBox.innerHTML = "";
    if (scene.choices) {
      scene.choices.forEach(choice => {
        const btn = document.createElement("button");
        btn.textContent = choice.text;
        btn.addEventListener("click", () => {
          showScene(choice.next);
        });
        choicesBox.appendChild(btn);
      });
    } else {
      // 自動で次のシーンへ進むボタンなしモード
    }
  }

  // クリック処理
  dialogueBox.addEventListener("click", async () => {
    if (isTextDisplaying) {
      // 表示中テキストを即座に表示完了
      isTextDisplaying = false;
    } else {
      // 次のシーンへ
      if (sceneIndex + 1 < scenes.length) {
        await showScene(sceneIndex + 1);
      }
    }
  });

  // 背景・キャラクリックでテキストウィンドウの表示切替
  function toggleDialogue() {
    if (dialogueBox.style.display === "none" || dialogueBox.style.opacity === "0") {
      dialogueBox.style.display = "block";
      dialogueBox.style.opacity = "1";
    } else {
      dialogueBox.style.opacity = "0";
      setTimeout(() => (dialogueBox.style.display = "none"), 300);
    }
  }

  // ダブルクリックでオートモード開始/停止
  let clickTimer = null;
  game.addEventListener("click", (e) => {
    if (e.target === dialogueBox || dialogueBox.contains(e.target)) return;
    if (clickTimer) {
      clearTimeout(clickTimer);
      clickTimer = null;
      // ダブルクリック
      autoMode = !autoMode;
      if (autoMode) {
        autoPlay();
      } else {
        clearTimeout(autoTimeoutId);
      }
    } else {
      clickTimer = setTimeout(() => {
        clickTimer = null;
        // シングルクリックはテキストウィンドウの表示切替
        toggleDialogue();
      }, 250);
    }
  });

  async function autoPlay() {
    if (!autoMode) return;
    if (isTextDisplaying) {
      isTextDisplaying = false;
    } else {
      if (sceneIndex + 1 < scenes.length) {
        await showScene(sceneIndex + 1);
      }
    }
    autoTimeoutId = setTimeout(autoPlay, 1500);
  }

  // 初期シーン開始
  await showScene(0);
})();
