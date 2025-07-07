let randomImagesLayer = null;
let randomImageElements = [];
let randomTextLayer = null;
let randomTextElements = [];

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
    left: "0",
    width: "100%",
    height: "10%",
    zIndex: "3",
    pointerEvents: "none",
  });

  document.body.appendChild(randomTextLayer);
}

function clearRandomImages() {
  if (!randomImagesLayer) return;
  randomImagesLayer.innerHTML = "";
  randomImageElements = [];
}

function clearRandomTexts() {
  if (!randomTextLayer) return;
  randomTextLayer.innerHTML = "";
  randomTextElements = [];
}

function randomImagesOn() {
  if (!window.config || !config.randomPath) {
    console.error("config.randomPath が定義されていません。");
    return;
  }

  fetch(`${config.randomPath}imageset01.json`)
    .then(response => response.json())
    .then(data => {
      createRandomImagesLayer();
      clearRandomImages();

      const isMobilePortrait = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
      const isMobileLandscape = window.innerWidth <= 768 && window.innerWidth <= window.innerHeight;

      const cols = isMobilePortrait ? 2 : 3;
      const rows = isMobilePortrait ? 4 : 2;

      const safeArea = {
        x: window.innerWidth * 0.05,
        y: window.innerHeight * 0.05,
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.9
      };

      const cellWidth = safeArea.width / cols;
      const cellHeight = safeArea.height / rows;

      const positions = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          positions.push({ x, y });
        }
      }

      const imageBasePath = data.picpath || config.randomPath;
      const fixedImage = data.fixed;
      const randomList = [...data.random];
      shuffleArray(randomList);

      positions.forEach((pos, index) => {
        const img = document.createElement("img");
        img.draggable = false;
        img.style.position = "absolute";
        img.style.objectFit = "contain";
        img.style.pointerEvents = "none";

        const left = safeArea.x + cellWidth * pos.x;
        const top = safeArea.y + cellHeight * pos.y;

        Object.assign(img.style, {
          left: `${left}px`,
          top: `${top}px`,
          width: `${cellWidth}px`,
          height: `${cellHeight}px`,
          maxWidth: "100%",
          maxHeight: "100%",
        });

        img.src = index === 0 && fixedImage ? imageBasePath + fixedImage : imageBasePath + (randomList.shift() || "");

        randomImagesLayer.appendChild(img);
        randomImageElements.push(img);
      });
    })
    .catch(err => console.error("ランダム画像JSONの読み込みに失敗しました", err));
}

function randomTextsOn() {
  if (!window.config || !config.randomPath) {
    console.error("config.randomPath が定義されていません。");
    return;
  }

  fetch(`${config.randomPath}textset01.json`)
    .then(res => res.json())
    .then(data => {
      if (!Array.isArray(data)) return;

      createRandomTextLayer();
      clearRandomTexts();

      const usedIndexes = new Set();

      const pickIndexes = [];
      while (pickIndexes.length < 2 && usedIndexes.size < data.length / 2) {
        const i = Math.floor(Math.random() * (data.length / 2));
        if (!usedIndexes.has(i)) {
          usedIndexes.add(i);
          pickIndexes.push(i * 2);
        }
      }

      const verticalPositions = ["90%", "95%"]; // 上段・下段
      pickIndexes.forEach((idx, i) => {
        const [name, text] = data.slice(idx, idx + 2);
        const style = (window.characterStyles?.[name]) || { color: "#000" };
        const charColor = style.color || "#000";

        const div = document.createElement("div");
        div.className = "random-text-note";
        div.textContent = text;
        Object.assign(div.style, {
          left: `${5 + Math.random() * 90}%`,
          top: verticalPositions[i],
          backgroundColor: "#ffffff",
          borderLeft: `12px solid ${charColor}`,
          color: charColor
        });

        randomTextLayer.appendChild(div);
        randomTextElements.push(div);
      });
    })
    .catch(err => console.error("ランダムテキストJSONの読み込みに失敗しました", err));
}

function randomImagesOff() {
  clearRandomImages();
}

function randomTextsOff() {
  clearRandomTexts();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
