// randomShows.js

let randomImagesLayer = null;
let randomImageElements = [];
let randomTextElements = [];
let randomTextLayer = null;

// ▼ 画像レイヤー作成
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

// ▼ テキストレイヤー作成
function createRandomTextLayer() {
  if (randomTextLayer) return;

  randomTextLayer = document.createElement("div");
  randomTextLayer.id = "random-text-layer";
  Object.assign(randomTextLayer.style, {
    position: "absolute",
    bottom: "10%",
    left: "0",
    width: "100%",
    height: "10%",
    zIndex: "3",
    pointerEvents: "none",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center"
  });

  document.body.appendChild(randomTextLayer);
}

// ▼ 画像クリア
function clearRandomImages() {
  if (!randomImagesLayer) return;
  randomImagesLayer.innerHTML = "";
  randomImageElements = [];
}

// ▼ テキストクリア
function clearRandomTexts() {
  if (!randomTextLayer) return;
  randomTextLayer.innerHTML = "";
  randomTextElements = [];
}

// ▼ ランダム画像表示
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

      const isMobileLandscape = window.innerWidth <= 768 && window.innerWidth > window.innerHeight;

      const cols = isMobileLandscape ? 2 : 3;
      const rows = isMobileLandscape ? 4 : 2;

      const safeArea = {
        x: window.innerWidth * 0.1,
        y: window.innerHeight * 0.1,
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8
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

// ▼ ランダムテキスト表示
function randomTextsOn() {
  if (!window.config || !config.randomPath) {
    console.error("config.randomPath が定義されていません。");
    return;
  }

  fetch(`${config.randomPath}textset01.json`)
    .then(res => res.json())
    .then(data => {
      createRandomTextLayer();
      clearRandomTexts();

      const usedIndexes = new Set();
      const count = 20; // 5%ずつ、2段で20個

      for (let i = 0; i < count; i++) {
        const index = Math.floor(Math.random() * data.length);
        if (usedIndexes.has(index)) continue;
        usedIndexes.add(index);

        const div = document.createElement("div");
        div.className = "random-text-sticky";
        div.textContent = data[index];
        Object.assign(div.style, {
          background: "rgba(255,182,193,0.9)",
          color: "#000",
          fontSize: "0.9em",
          padding: "0.3em 0.6em",
          margin: "0.2em",
          borderRadius: "0.5em",
          fontWeight: "bold",
          boxShadow: "0 2px 5px rgba(0,0,0,0.3)"
        });

        randomTextLayer.appendChild(div);
        randomTextElements.push(div);
      }
    })
    .catch(err => console.error("ランダムテキストJSONの読み込みに失敗しました", err));
}

// ▼ オフ関数
function randomImagesOff() {
  clearRandomImages();
}

function randomTextsOff() {
  clearRandomTexts();
}

// ▼ 配列シャッフル
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
