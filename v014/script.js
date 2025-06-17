let currentScenario = "000start.json";
let currentIndex = 0;
let isAuto = false;
let bgm = null;

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

function setTextWithSpeed(text, speed, callback) {
  textEl.innerHTML = "";
  let i = 0;
  const interval = setInterval(() => {
    textEl.innerHTML += text[i++];
    if (i >= text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, speed);
}

function setCharacterStyle(name) {
  const style = characterStyles[name] || characterStyles[""];
  document.documentElement.style.setProperty("--fontSize", style.fontSize || defaultFontSize);
  currentSpeed = style.speed || defaultSpeed;
}

function showScene(scene) {
  // 背景
  if (scene.bg) {
    bgEl.src = config.bgPath + scene.bg;
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

  // キャラ表示・退場処理
  if (scene.characters) {
    ["left", "center", "right"].forEach(pos => {
      const slot = charSlots[pos];
      const charData = scene.characters.find(c => c.side === pos);

      const existingImg = slot.querySelector("img");

      if (!charData || charData.src === null) {
        if (existingImg) {
          existingImg.classList.remove("fadein", "slideinLeft", "slideinRight");
          existingImg.classList.add("fadeout");
          existingImg.addEventListener("animationend", () => {
            if (existingImg.parentNode) {
              existingImg.parentNode.removeChild(existingImg);
            }
          }, { once: true });
        }
        return;
      }

      if (existingImg) {
        // ここは単純置き換え
        slot.innerHTML = "";
      }

      const img = document.createElement("img");
      img.src = config.charPath + charData.src;
      img.classList.add("char-image");

      if (charData.effect) {
        img.classList.add(charData.effect);
      } else {
        img.classList.add("fadein");
      }
      slot.appendChild(img);
    });
  }

  // 名前・セリフ
  if (scene.name !== undefined && scene.text !== undefined) {
    const color = characterColors[scene.name] || "#FFFFFF";
    nameEl.textContent = scene.name;
    nameEl.style.color = color;

    setCharacterStyle(scene.name);
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAuto) next();
    });
  }

  // 選択肢
  if (scene.choices) {
    choicesEl.innerHTML = "";
    scene.choices.forEach(choice => {
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

async function loadScenario(filename) {
  try {
    const res = await fetch(config.scenarioPath + filename);
    if (!res.ok) throw new Error("Failed to load scenario");
    const data = await res.json();
    currentScenario = filename;
    currentIndex = 0;
    showScene(data[currentIndex]);
  } catch (e) {
    console.error(e);
  }
}

function next() {
  fetch(config.scenarioPath + currentScenario)
    .then(res => res.json())
    .then(data => {
      currentIndex++;
      if (currentIndex < data.length) {
        showScene(data[currentIndex]);
      } else {
        console.log("End of scenario");
      }
    })
    .catch(console.error);
}

window.onload = () => {
  loadScenario(currentScenario);
};
