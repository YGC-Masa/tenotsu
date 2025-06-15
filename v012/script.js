(async function () {
  const background = document.getElementById("background");
  const charSlots = {
    left: document.getElementById("char-left"),
    center: document.getElementById("char-center"),
    right: document.getElementById("char-right")
  };
  const dialogueBox = document.getElementById("dialogue-box");
  const nameBox = document.getElementById("name");
  const textBox = document.getElementById("text");

  let scenes = [];
  let currentSceneIndex = 0;
  let isTyping = false;
  let skipTyping = false;
  let autoMode = false;
  let autoInterval = null;
  const speed = 40;
  const delay = ms => new Promise(res => setTimeout(res, ms));

  // テキストを1文字ずつ表示（途中でスキップ可能）
  async function showText(text) {
    textBox.textContent = "";
    isTyping = true;
    for (let i = 0; i < text.length; i++) {
      if (skipTyping) {
        textBox.textContent = text;
        break;
      }
      textBox.textContent += text[i];
      await delay(speed);
    }
    isTyping = false;
    skipTyping = false;
  }

  // 背景画像差し替え
  function changeBackground(src) {
    if (!src) return;
    background.src = src;
  }

  // キャラ表示差し替え（pos: left, center, right）
  function changeCharacter(pos, charData) {
    const slot = charSlots[pos];
    if (!slot) return;

    if (!charData || !charData.src) {
      slot.innerHTML = "";
      return;
    }

    if (slot.firstElementChild && slot.firstElementChild.src.endsWith(charData.src)) {
      // 同じ画像なら何もしない
      return;
    }

    const img = new Image();
    img.src = charData.src;
    img.alt = charData.name || "";
    slot.innerHTML = "";
    slot.appendChild(img);
  }

  // シーン表示
  async function showScene(index) {
    if (!scenes[index]) return;
    const scene = scenes[index];

    changeBackground(scene.bg);

    // キャラは左右中央分を処理（配列形式を想定）
    ["left", "center", "right"].forEach(pos => {
      if (scene.characters && scene.characters[pos]) {
        changeCharacter(pos, scene.characters[pos]);
      } else {
        changeCharacter(pos, null);
      }
    });

    nameBox.textContent = scene.name || "";
    nameBox.style.color = characterColors[scene.name] || "#C0C0C0";

    await showText(scene.text || "");
  }

  // 次のシーンへ
  async function nextScene() {
    currentSceneIndex++;
    if (currentSceneIndex >= scenes.length) {
      currentSceneIndex = 0;
    }
    await showScene(currentSceneIndex);
  }

  // クリック時の挙動
  async function onBgOrCharClick() {
    if (isTyping) {
      skipTyping = true;
    } else {
      await nextScene();
    }
  }

  // オートモードの切替
  function toggleAutoMode() {
    if (autoMode) {
      clearInterval(autoInterval);
      autoInterval = null;
      autoMode = false;
      console.log("Auto mode OFF");
    } else {
      autoMode = true;
      console.log("Auto mode ON");
      autoInterval = setInterval(async () => {
        if (!isTyping) {
          await nextScene();
        }
      }, 3000);
    }
  }

  // 背景・キャラクリックイベント登録
  background.addEventListener("click", onBgOrCharClick);
  background.addEventListener("dblclick", toggleAutoMode);

  for (const pos of ["left", "center", "right"]) {
    charSlots[pos].addEventListener("click", onBgOrCharClick);
    charSlots[pos].addEventListener("dblclick", toggleAutoMode);
  }

  // テキストボックスクリックで表示ON/OFF切替
  dialogueBox.addEventListener("click", () => {
    if (dialogueBox.style.display === "none") {
      dialogueBox.style.display = "block";
    } else {
      dialogueBox.style.display = "none";
    }
  });

  // シナリオJSONロード＆初期シーン表示
  const response = await fetch("scenario/000start.json");
  const data = await response.json();
  scenes = data.scenes;

  await showScene(currentSceneIndex);
})();
