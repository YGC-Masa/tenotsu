let currentScenario = "000start.json";
let currentIndex = 0;
let loadedScenario = [];
let isAuto = false;
let isTyping = false;
let bgm = null;

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};

let defaultFontSize = "1em";
let defaultSpeed = 40;
let currentSpeed = defaultSpeed;

function setTextWithSpeed(text, speed, callback) {
  isTyping = true;
  textEl.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(interval);
      isTyping = false;
      if (callback) callback();
    }
  }, speed);
}

function setCharacterStyle(name) {
  const style = characterStyles[name] || characterStyles[""];
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

function showScene(scene) {
  // 背景切り替え（フェードアウト完了後に画像変更）
  if (scene.bg) {
    bgEl.style.transition = "opacity 0.5s ease";
    bgEl.style.opacity = "1";

    const onFadeOutEnd = () => {
      bgEl.removeEventListener("transitionend", onFadeOutEnd);
      bgEl.src = config.bgPath + scene.bg;

      // フェードイン
      requestAnimationFrame(() => {
        bgEl.style.transition = "opacity 0.5s ease";
        bgEl.style.opacity = "0";
        requestAnimationFrame(() => {
          bgEl.style.opacity = "1";
        });
      });
    };

    bgEl.addEventListener("transitionend", onFadeOutEnd);
    requestAnimationFrame(() => {
      bgEl.style.opacity = "0";
    });
  }

  // BGM
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

  // キャラ表示
  if (scene.characters === undefined || scene.characters === null) {
    // 指定なし → 維持
  } else if (Array.isArray(scene.characters) && scene.characters.length === 0) {
    // 全キャラ退場
    ["left", "center", "right"].forEach(pos => {
      charSlots[pos].innerHTML = "";
    });
  } else {
    // 個別指定
    ["left", "center", "right"].forEach(pos => {
      const slot = charSlots[pos];
      const charData = scene.characters.find(c => c.side === pos);

      if (!charData) return;

      if (charData.src === null) {
        slot.innerHTML = "";
        return;
      }

      slot.innerHTML = "";
      const img = document.createElement("img");
      img.src = config.charPath + charData.src;
      img.classList.add("char-image");
      slot.appendChild(img);
      applyEffect(img, charData.effect || "fadein");
    });
  }

  // 名前とセリフ
  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || "#FFFFFF";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;

    setCharacterStyle(scene.name);
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAuto) {
        setTimeout(() => {
          next();
        }, 2000); // オートプレイ待機時間 2秒
      }
    });
  }

  // 選択肢
  if (scene.choices) {
    choicesEl.innerHTML = "";
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        loadScenario(choice.jump);
      };
      choicesEl.appendChild(btn);
    });
  } else {
    choicesEl.innerHTML = "";
  }
}

function next() {
  if (isTyping) return;
  currentIndex++;
  if (currentIndex < loadedScenario.length) {
    showScene(loadedScenario[currentIndex]);
  }
}

function loadScenario(filename) {
  currentScenario = filename;
  currentIndex = 0;
  fetch(config.scenarioPath + filename)
    .then(res => res.json())
    .then(data => {
      loadedScenario = data.scenes || [];
      if (loadedScenario.length > 0) {
        showScene(loadedScenario[0]);
      }
    });
}

document.addEventListener("click", () => {
  if (!isAuto && choicesEl.children.length === 0 && !isTyping) {
    next();
  }
});

window.addEventListener("load", () => {
  loadScenario(currentScenario);
  setVhVariable();
});

function setVhVariable() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", setVhVariable);
window.addEventListener("orientationchange", setVhVariable);

// 背景画像のダブルクリックでオート切替（表示なし・ボタンなし）
bgEl.addEventListener("dblclick", () => {
  isAuto = !isAuto;
});
