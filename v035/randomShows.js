let randomImagesLayer = null;
let randomImageElements = [];
let cachedRandomImages = [];
let randomTextElements = [];
let randomTextLayer = null;

// --- 画像レイヤー ---
function createRandomImagesLayer() {
  if (randomImagesLayer) return;
  randomImagesLayer = document.getElementById("random-images-layer") || document.createElement("div");
  randomImagesLayer.id = "random-images-layer";
  Object.assign(randomImagesLayer.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    zIndex: "3",
    pointerEvents: "none"
  });
  document.body.appendChild(randomImagesLayer);
}

// --- テキストレイヤー ---
function createRandomTextLayer() {
  if (randomTextLayer) return;
  randomTextLayer = document.getElementById("random-text-layer") || document.createElement("div");
  randomTextLayer.id = "random-text-layer";
  Object.assign(randomTextLayer.style, {
    position: "absolute",
    bottom: "env(safe-area-inset-bottom, 0)",
    left: "0",
    width: "100%",
    height: "auto",
    zIndex: "4",
    pointerEvents: "none"
  });
  document.body.appendChild(randomTextLayer);
}

// --- 共通 ---
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function clearRandomImages() {
  if (randomImagesLayer) randomImagesLayer.innerHTML = "";
  randomImageElements = [];
}

function clearRandomTexts() {
  if (randomTextLayer) randomTextLayer.innerHTML = "";
  randomTextElements = [];
}

// --- 配置ロジック ---
function placeCachedImages() {
  if (!cachedRandomImages.length || !randomImagesLayer) return;
  clearRandomImages();

  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPortrait = w <= 768 && h > w;
  const cols = isPortrait ? 2 : 3;
  const rows = isPortrait ? 4 : 2;

  const safeX = w * 0.05;
  const safeY = h * 0.05;
  const cellW = (w - safeX * 2) / cols;
  const cellH = (h - safeY * 2) / rows;

  const positions = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      positions.push({ x, y });
    }
  }

  positions.forEach((pos, i) => {
    const src = cachedRandomImages[i % cachedRandomImages.length];
    const img = document.createElement("img");
    img.src = src;
    Object.assign(img.style, {
      position: "absolute",
      left: `${safeX + cellW * pos.x}px`,
      top: `${safeY + cellH * pos.y}px`,
      width: `${cellW}px`,
      height: `${cellH}px`,
      objectFit: "contain",
      pointerEvents: "none"
    });
    randomImagesLayer.appendChild(img);
    randomImageElements.push(img);
  });
}

// --- 表示 ON ---
function randomImagesOn() {
  if (!window.config || !config.randomPath) return;
  createRandomImagesLayer();

  if (!cachedRandomImages.length) {
    fetch(`${config.randomPath}imageset01.json`)
      .then(res => res.json())
      .then(data => {
        const imageBase = data.picpath || config.randomPath;
        const fixed = data.fixed ? [data.fixed] : [];
        const list = data.random || [];
        shuffleArray(list);
        const selected = [...fixed, ...list.slice(0, 7)].filter(Boolean);
        cachedRandomImages = selected.map(name => imageBase + name);
        placeCachedImages();
      });
  } else {
    placeCachedImages();
  }
}

function randomTextsOn() {
  if (!window.config || !config.randomPath) return;
  fetch(`${config.randomPath}textset01.json`)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data) || data.length < 4) return;
      createRandomTextLayer();
      clearRandomTexts();

      const pairCount = Math.floor(data.length / 2);
      const indexes = [];
      while (indexes.length < 2) {
        const i = Math.floor(Math.random() * pairCount);
        if (!indexes.includes(i)) indexes.push(i);
      }

      const [char1, text1] = [data[indexes[0] * 2], data[indexes[0] * 2 + 1]];
      const [char2, text2] = [data[indexes[1] * 2], data[indexes[1] * 2 + 1]];

      const style1 = characterStyles[char1] || characterStyles[""];
      const style2 = characterStyles[char2] || characterStyles[""];
      const color1 = style1.color || "#C0C0C0";
      const color2 = style2.color || "#C0C0C0";

      const w = window.innerWidth;
      const h = window.innerHeight;
      let fontSize = "1em";
      if (w <= 768 && h > w) fontSize = "0.8em";
      else if (w <= 768) fontSize = "0.75em";

      const note = document.createElement("div");
      Object.assign(note.style, {
        position: "absolute",
        left: "5%",
        bottom: "calc(env(safe-area-inset-bottom, 0) + 0.5em)",
        width: "90%",
        backgroundColor: "#fff",
        borderLeft: `10px solid ${color1}`,
        fontSize,
        fontWeight: "bold",
        padding: "0.4em 0.8em",
        borderRadius: "0.5em",
        boxSizing: "border-box",
        zIndex: "4"
      });

      const line1 = document.createElement("div");
      line1.textContent = text1;
      line1.style.color = color1;
      line1.style.textShadow = "1px 1px 2px #444";

      const line2 = document.createElement("div");
      line2.textContent = text2;
      line2.style.color = color2;
      line2.style.marginTop = "0.3em";
      line2.style.textShadow = "1px 1px 2px #444";

      note.appendChild(line1);
      note.appendChild(line2);
      randomTextLayer.appendChild(note);
      randomTextElements.push(note);
    });
}

// --- OFF ---
function randomImagesOff() {
  clearRandomImages();
}

function randomTextsOff() {
  clearRandomTexts();
}

// --- 画面回転で再配置 ---
window.addEventListener("resize", () => {
  placeCachedImages();
});

// グローバル関数として使用可能に
window.randomImagesOn = randomImagesOn;
window.randomImagesOff = randomImagesOff;
window.randomTextsOn = randomTextsOn;
window.randomTextsOff = randomTextsOff;
