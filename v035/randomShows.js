let randomImagesLayer = null;
let randomImageElements = [];
let cachedRandomImages = []; // 最大8枚キャッシュ
let randomTextElements = [];
let randomTextLayer = null;

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
    zIndex: "2.5",
    pointerEvents: "none"
  });
  document.body.appendChild(randomImagesLayer);
}

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
    zIndex: "3",
    pointerEvents: "none"
  });
  document.body.appendChild(randomTextLayer);
}

function clearRandomImages() {
  if (!randomImagesLayer) return;
  randomImagesLayer.innerHTML = "";
  randomImageElements = [];
  cachedRandomImages = [];
}

function clearRandomTexts() {
  if (!randomTextLayer) return;
  randomTextLayer.innerHTML = "";
  randomTextElements = [];
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function randomImagesOn() {
  if (!window.config || !config.randomPath) return;
  createRandomImagesLayer();
  clearRandomImages();

  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobilePortrait = w <= 768 && h > w;
  let cols = 3, rows = 2;
  if (isMobilePortrait) { cols = 2; rows = 4; }

  const safeArea = { x: w * 0.1, y: h * 0.1, width: w * 0.8, height: h * 0.8 };
  const cellWidth = safeArea.width / cols;
  const cellHeight = safeArea.height / rows;
  const positions = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      positions.push({ x, y });

  if (cachedRandomImages.length !== 8) {
    fetch(`${config.randomPath}imageset01.json`)
      .then(res => res.json())
      .then(data => {
        const imageBasePath = data.picpath || config.randomPath;
        const fixedImage = data.fixed;
        const randomList = [...data.random];
        shuffleArray(randomList);
        const selected = [fixedImage, ...randomList.slice(0, 7)].filter(Boolean);
        cachedRandomImages = selected.map(src => imageBasePath + src);
        placeCachedImages(positions, cellWidth, cellHeight, safeArea);
      });
  } else {
    placeCachedImages(positions, cellWidth, cellHeight, safeArea);
  }
}

function placeCachedImages(positions, cellWidth, cellHeight, safeArea) {
  positions.forEach((pos, index) => {
    const img = document.createElement("img");
    img.draggable = false;
    img.src = cachedRandomImages[index % cachedRandomImages.length];
    Object.assign(img.style, {
      position: "absolute",
      left: `${safeArea.x + cellWidth * pos.x}px`,
      top: `${safeArea.y + cellHeight * pos.y}px`,
      width: `${cellWidth}px`,
      height: `${cellHeight}px`,
      objectFit: "contain",
      pointerEvents: "none",
      maxWidth: "100%",
      maxHeight: "100%"
    });
    randomImagesLayer.appendChild(img);
    randomImageElements.push(img);
  });
}

function randomTextsOn() {
  if (!window.config || !config.randomPath) return;
  fetch(`${config.randomPath}textset01.json`)
    .then(res => res.json())
    .then(data => {
      createRandomTextLayer();
      clearRandomTexts();
      if (data.length < 4) return;

      const pairCount = data.length / 2;
      const selectedIndexes = [];
      while (selectedIndexes.length < 2) {
        const idx = Math.floor(Math.random() * pairCount);
        if (!selectedIndexes.includes(idx)) selectedIndexes.push(idx);
      }

      const charName1 = data[selectedIndexes[0] * 2];
      const charName2 = data[selectedIndexes[1] * 2];
      const text1 = data[selectedIndexes[0] * 2 + 1];
      const text2 = data[selectedIndexes[1] * 2 + 1];

      const style1 = characterStyles[charName1] || characterStyles[""];
      const style2 = characterStyles[charName2] || characterStyles[""];
      const color1 = style1.color || "#C0C0C0";
      const color2 = style2.color || "#C0C0C0";

      const w = window.innerWidth;
      const h = window.innerHeight;
      let fontSize = "1em", padding = "0.075em 1em", lineGap = "0.05em", paddingBottom = "0.075em";

      if (w <= 768 && h > w) {
        fontSize = "0.8em";
        padding = "0.05em 0.8em";
        paddingBottom = "0.2em";
      } else if (w <= 768 && w >= h) {
        fontSize = "0.8em";
        padding = "0.05em 0.6em";
        paddingBottom = "0.075em";
      }

      const note = document.createElement("div");
      Object.assign(note.style, {
        position: "absolute",
        left: "5%",
        width: "90%",
        bottom: `calc(env(safe-area-inset-bottom, 0) + ${paddingBottom})`,
        backgroundColor: "#fff",
        borderLeft: `10px solid ${color1}`,
        fontSize,
        fontWeight: "bold",
        padding,
        borderRadius: "0.5em",
        boxSizing: "border-box",
        zIndex: 3
      });

      const shadow = "-1.2px -1.2px 1px #444, 1.2px -1.2px 1px #444, -1.2px 1.2px 1px #444, 1.2px 1.2px 1px #444";

      const line1 = document.createElement("div");
      line1.textContent = text1;
      line1.style.color = color1;
      line1.style.marginBottom = lineGap;
      line1.style.textShadow = shadow;

      const line2 = document.createElement("div");
      line2.textContent = text2;
      line2.style.color = color2;
      line2.style.textShadow = shadow;

      note.appendChild(line1);
      note.appendChild(line2);
      randomTextLayer.appendChild(note);
      randomTextElements.push(note);
    });
}

function randomImagesOff() { clearRandomImages(); }
function randomTextsOff() { clearRandomTexts(); }
