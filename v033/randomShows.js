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
  randomTextLayer = document.createElement("div");
  randomTextLayer.id = "random-text-layer";
  Object.assign(randomTextLayer.style, {
    position: "absolute",
    bottom: "env(safe-area-inset-bottom)",
    left: "0",
    width: "100%",
    height: "10%",
    zIndex: "3",
    pointerEvents: "none",
    position: "fixed"
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
  if (!window.config || !config.randomPath) return;

  fetch(`${config.randomPath}imageset01.json`)
    .then(res => res.json())
    .then(data => {
      createRandomImagesLayer();
      clearRandomImages();

      const isMobileLandscape = window.innerWidth <= 768 && window.innerWidth > window.innerHeight;
      const isMobilePortrait = window.innerWidth <= 768 && window.innerHeight >= window.innerWidth;

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

// ▼ ランダムテキスト表示（上下2段、キャラカラー対応）
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

      const selected = [];
      const usedIndexes = new Set();

      while (selected.length < 2 && usedIndexes.size < data.length / 2) {
        const idx = Math.floor(Math.random() * (data.length / 2));
        if (!usedIndexes.has(idx)) {
          usedIndexes.add(idx);
          selected.push([data[idx * 2], data[idx * 2 + 1]]);
        }
      }

      selected.forEach(([char, text], i) => {
        const div = document.createElement("div");
        div.className = "random-text-note";

        // キャラカラー取得
        const style = (window.characterStyles || {})[char] || {};
        const color = style.color || "#000";

        Object.assign(div.style, {
          color: color,                  // テキスト色
          borderLeft: `12px solid ${color}`, // 左帯の色
          position: "absolute",
          left: "5%",
          width: "90%",
          textAlign: "left",
          bottom: i === 0 ? "5%" : "0%" // 上段 or 下段
        });

        div.textContent = `「${text}」`;
        randomTextLayer.appendChild(div);
        randomTextElements.push(div);
      });
    })
    .catch(err => console.error("ランダムテキストJSONの読み込みに失敗しました", err));
}

function createTextNote(text, stripeColor, topPercent, bottomPercent) {
  const div = document.createElement("div");
  div.className = "random-text-note";
  Object.assign(div.style, {
    display: "inline-block",
    position: "absolute",
    left: "5%",
    width: "90%",
    top: `calc(${topPercent}vh)`,
    height: `calc(${bottomPercent - topPercent}vh)`,
    backgroundColor: "white",
    borderLeft: `solid 12px ${stripeColor}`,
    color: "#000",
    fontWeight: "bold",
    padding: "0.5em 1em",
    fontSize: "1em",
    boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
    lineHeight: "1.4",
    display: "flex",
    alignItems: "center"
  });
  div.textContent = text;
  return div;
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
