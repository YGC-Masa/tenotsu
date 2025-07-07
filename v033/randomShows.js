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
  randomTextLayer = document.getElementById("random-text-layer") || document.createElement("div");
  randomTextLayer.id = "random-text-layer";
  Object.assign(randomTextLayer.style, {
    position: "absolute",
    bottom: "0",
    left: "0",
    width: "100%",
    height: "10%",
    zIndex: "3",
    pointerEvents: "none"
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

// ▼ 配列シャッフル
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ▼ 色を薄く
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));
  return `rgb(${r},${g},${b})`;
}

// ▼ ランダム画像表示
function randomImagesOn() {
  if (!window.config || !config.randomPath) {
    console.error("config.randomPath が定義されていません。");
    return;
  }

  fetch(`${config.randomPath}imageset01.json`)
    .then(res => res.json())
    .then(data => {
      createRandomImagesLayer();
      clearRandomImages();

      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobilePortrait = w <= 768 && h > w;
      const isMobileLandscape = w <= 768 && w > h;

      // 配置行列を端末によって変更
      let cols = 3, rows = 2;
      if (isMobilePortrait) {
        cols = 2;
        rows = 4;
      }

      // セーフエリア内に配置
      const safeArea = {
        x: w * 0.1,
        y: h * 0.1,
        width: w * 0.8,
        height: h * 0.8
      };

      const cellWidth = safeArea.width / cols;
      const cellHeight = safeArea.height / rows;

      const positions = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          positions.push({ x, y });
        }
      }

      // ランダム画像パス
      const imageBasePath = data.picpath || config.randomPath;
      const fixedImage = data.fixed;
      const randomList = [...data.random];
      shuffleArray(randomList);

      positions.forEach((pos, index) => {
        const img = document.createElement("img");
        img.draggable = false;
        img.classList.add("random-image");

        const left = safeArea.x + cellWidth * pos.x;
        const top = safeArea.y + cellHeight * pos.y;

        Object.assign(img.style, {
          position: "absolute",
          left: `${left}px`,
          top: `${top}px`,
          width: `${cellWidth}px`,
          height: `${cellHeight}px`,
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
          pointerEvents: "none"
        });

        // 1枚目は固定、それ以外はシャッフルから
        img.src = (index === 0 && fixedImage)
          ? imageBasePath + fixedImage
          : imageBasePath + (randomList.shift() || "");

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

      if (!Array.isArray(data) || data.length < 4) {
        console.warn("textset01.json には最低2ペアのデータが必要です。");
        return;
      }

      const pairCount = Math.floor(data.length / 2);
      const selectedIndexes = new Set();

      while (selectedIndexes.size < 2) {
        selectedIndexes.add(Math.floor(Math.random() * pairCount));
      }

      const [idx1, idx2] = [...selectedIndexes];
      const charName1 = data[idx1 * 2];
      const text1 = data[idx1 * 2 + 1];
      const charName2 = data[idx2 * 2];
      const text2 = data[idx2 * 2 + 1];

      const style1 = characterStyles[charName1] || characterStyles[""];
      const style2 = characterStyles[charName2] || characterStyles[""];
      const baseColor = style1.color || "#C0C0C0";
      const bgColor = lightenColor(baseColor, 85);

      const note = document.createElement("div");
      note.className = "random-text-note";

      Object.assign(note.style, {
        backgroundColor: bgColor,
        borderLeft: `12px solid ${baseColor}`,
        position: "absolute",
        left: "5%",
        width: "90%",
        top: "90%",
        height: "auto",
        padding: "0.5em 1em",
        borderRadius: "0.5em",
        boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "0.3em",
        fontSize: "1em",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 3
      });

      const line1 = document.createElement("div");
      line1.textContent = `${charName1}：${text1}`;
      Object.assign(line1.style, {
        color: baseColor,
        fontWeight: "bold",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      });

      const line2 = document.createElement("div");
      line2.textContent = `${charName2}：${text2}`;
      Object.assign(line2.style, {
        color: "#000",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      });

      note.appendChild(line1);
      note.appendChild(line2);
      randomTextLayer.appendChild(note);
      randomTextElements.push(note);
    })
    .catch(err => console.error("ランダムテキストJSONの読み込みに失敗しました", err));
}


// ▼ 非表示関数
function randomImagesOff() { clearRandomImages(); }
function randomTextsOff() { clearRandomTexts(); }
