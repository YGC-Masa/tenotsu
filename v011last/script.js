const nameBox = document.getElementById("name");
const textBox = document.getElementById("text");
const choicesBox = document.getElementById("choices");
const bg = document.getElementById("background");
const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right")
};

let scenario = [];
let currentScene = 0;
let isAutoMode = true;
let charElements = { left: null, center: null, right: null };

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function applyTextEffect(text, speed) {
  return new Promise(async (resolve) => {
    textBox.innerHTML = "";
    for (let i = 0; i < text.length; i++) {
      textBox.innerHTML += text[i];
      await sleep(speed);
    }
    resolve();
  });
}

function setBackground(src, effect) {
  if (!src) return;
  if (effect === "fade") {
    bg.classList.add("fade-out");
    setTimeout(() => {
      bg.src = src;
      bg.onload = () => bg.classList.remove("fade-out");
    }, 300);
  } else {
    bg.src = src;
  }
}

function setCharacter(side, src) {
  const slot = charSlots[side];
  if (!slot) return;

  // NULL指定：退場処理
  if (src === null) {
    if (charElements[side]) {
      slot.removeChild(charElements[side]);
      charElements[side] = null;
    }
    return;
  }

  // 同じ画像なら更新不要
  if (charElements[side]?.dataset.src === src) return;

  // 一旦削除
  if (charElements[side]) {
    slot.removeChild(charElements[side]);
  }

  // 新規作成
  const img = document.createElement("img");
  img.src = src;
  img.className = "char-image";
  img.dataset.src = src;
  img.style.opacity = 0;

  img.onload = () => {
    img.style.transition = "opacity 0.3s";
    img.style.opacity = 1;
  };

  charElements[side] = img;
  slot.appendChild(img);
}

function setCharacters(charList) {
  const sides = ["left", "center", "right"];
  sides.forEach(side => {
    const entry = charList.find(c => c.side === side);
    if (entry) {
      setCharacter(side, entry.src);
    } else {
      // null指定が明示されている場合のみ退場させる
      const hasNull = charList.find(c => c.side === side && c.src === null);
      if (hasNull) {
        setCharacter(side, null);
      }
    }
  });
}

async function showScene(scene) {
  nameBox.textContent = scene.name || "";
  nameBox.style.color = characterColors[scene.name] || "#C0C0C0";

  if (scene.bg) {
    setBackground(scene.bg, scene.bgEffect || null);
  }

  if (scene.characters) {
    setCharacters(scene.characters);
  }

  if (scene.fontSize) {
    textBox.style.fontSize = scene.fontSize;
  } else {
    textBox.style.fontSize = "1em";
  }

  const speed = scene.speed !== undefined ? scene.speed : 20;
  await applyTextEffect(scene.text || "", speed);

  if (scene.choices) {
    choicesBox.innerHTML = "";
    scene.choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        loadScenario(choice.jumpToScenario);
      };
      choicesBox.appendChild(btn);
    });
  } else if (scene.jumpToScenario) {
    await sleep(1000);
    loadScenario(scene.jumpToScenario);
  } else if (isAutoMode) {
    await sleep(1000);
    currentScene++;
    if (currentScene < scenario.length) {
      showScene(scenario[currentScene]);
    }
  }
}

function loadScenario(path) {
  fetch(path)
    .then(res => res.json())
    .then(data => {
      scenario = data.scenes;
      currentScene = 0;
      showScene(scenario[currentScene]);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadScenario("scenario/000start.json");
});
