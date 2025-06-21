let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let autoWait = 2000;
let bgm = null;
let voice = null;
let se = null;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right")
};

let defaultFontSize = "1em";
let defaultSpeed = 40;
let currentSpeed = defaultSpeed;
let isPlaying = false;

function setTextWithSpeed(text, speed, callback) {
  isPlaying = true;
  textEl.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      textEl.innerHTML += text[i++];
    } else {
      clearInterval(interval);
      isPlaying = false;
      if (callback) callback();
    }
  }, speed);
}

function setCharacterStyle(name) {
  const style = characterStyles[name] || {};
  document.documentElement.style.setProperty("--fontSize", style.fontSize || defaultFontSize);
  currentSpeed = style.speed || defaultSpeed;
}

function applyEffect(el, effectName) {
  if (window.effects && effectName && window.effects[effectName]) {
    window.effects[effectName](el);
  } else {
    window.effects?.fadein(el);
  }
}

function playVoice(file) {
  if (voice) {
    voice.pause();
    voice = null;
  }
  if (file) {
    voice = new Audio(config.voicePath + file);
    voice.onerror = () => {
      console.warn("Voice load error:", file);
    };
    voice.play().catch((err) => {
      console.warn("Voice play error:", err);
    });
  }
}

function playSE(file) {
  if (se) {
    se.pause();
    se = null;
  }
  if (file) {
    se = new Audio(config.sePath + file);
    se.onerror = () => {
      console.warn("SE load error:", file);
    };
    se.play().catch((err) => {
      console.warn("SE play error:", err);
    });
  }
}

async function showScene(scene) {
  if (!scene) return;

  // 背景切り替え
  if (scene.bg) {
    await new Promise((resolve) => {
      applyEffect(bgEl, scene.bgEffect || "fadeout");
      setTimeout(() => {
        bgEl.onload = () => {
          applyEffect(bgEl, scene.bgEffect || "fadein");
          resolve();
        };
        bgEl.src = config.bgPath + scene.bg;
      }, 500);
    });
  }

  // BGM切り替え
  if (scene.bgm !== undefined) {
    if (bgm) {
      bgm.pause();
      bgm = null;
    }
    if (scene.bgm) {
      bgm = new Audio(config.bgmPath + scene.bgm);
      bgm.loop = true;
      bgm.play();
    }
  }

  // SE・ボイス再生
  if (scene.se) playSE(scene.se);
  if (scene.voice) playVoice(scene.voice);

  // キャラ表示
  if (scene.characters) {
    ["left", "center", "right"].forEach((pos) => {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      slot.innerHTML = "";
      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");
        slot.appendChild(img);
        applyEffect(img, charData.effect || "fadein");
      }
    });
  }

  // テキストと名前
  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || "#FFFFFF";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;

    setCharacterStyle(scene.name);
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAuto && choicesEl.children.length === 0) {
        setTimeout(() => {
          if (!isPlaying) next();
        }, autoWait);
      }
    });
  }

  // 選択肢
  if (scene.choices) {
    choicesEl.innerHTML = "";
    textEl.innerHTML = ""; // テキストバッファをクリア
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        choicesEl.innerHTML = "";
        textEl.innerHTML = "";
        if (choice.se) playSE(choice.se);
        if (choice.voice) playVoice(choice.voice);
        if (choice.jump) {
          loadScenario(choice.jump);
        } else if (choice.next !== undefined) {
          currentIndex = choice.next - 1;
          next();
        }
      };
      choicesEl.appendChild(btn);
    });
  } else {
    choicesEl.innerHTML = "";
  }
}

function next() {
  fetch(config.scenarioPath + currentScenario)
    .then((res) => res.json())
    .then((data) => {
      currentIndex++;
      if (currentIndex < data.scenes.length) {
        showScene(data.scenes[currentIndex]);
      }
    });
}

function loadScenario(filename) {
  currentScenario = filename;
  currentIndex = 0;
  fetch(config.scenarioPath + filename)
    .then((res) => res.json())
    .then((data) => {
      if (data.scenes.length > 0) {
        showScene(data.scenes[0]);
      }
    });
}

// オートモード切替
bgEl.addEventListener("dblclick", () => {
  isAuto = !isAuto;
});

document.addEventListener("click", () => {
  if (!isAuto && choicesEl.children.length === 0 && !isPlaying) {
    next();
  }
});

window.addEventListener("load", () => {
  loadScenario(currentScenario);
  setVhVariable();
});

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", setVhVariable);