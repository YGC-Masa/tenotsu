// randomShows.js

let randomImagesLayer = null;
let randomImageElements = [];
let randomTextElements = [];
let randomTextLayer = null;

let randomImagesDataCache = null;    // JSONデータキャッシュ
let imagePathsCache = null;          // 表示する画像のパスキャッシュ（最大8件）

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

// ▼ ランダム画像表示（最大8件・キャッシュ＆順序固定）
function randomImagesOn() {
  if (!window.config || !config.randomPath) return;

  if (randomImagesDataCache) {
    buildRandomImages(randomImagesDataCache);
  } else {
    fetch(`${config.randomPath}imageset01.json`)
      .then(res => res.json())
      .then(data => {
        randomImagesDataCache = data;
        buildRandomImages(data);
      })
      .catch(err => console.error("ランダム画像JSONの読み込みに失敗しました", err));
  }
}

// ▼ 画像DOM構築（初回のみ画像選出→以後は順序保持で再描画）
function buildRandomImages(data) {
  createRandomImagesLayer();
  clearRandomImages();

  const w = window.innerWidth;
  const h = window.innerHeight;
  const isMobilePortrait = w <= 768 && h > w;
  let cols = 3, rows = 2;
  if (isMobilePortrait) { cols = 2; rows = 4; }

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

  // ▼ 初回のみ画像選出・順序確定
  if (!imagePathsCache) {
    const imageBasePath = data.picpath || config.randomPath;
    const result = [];

    // 先頭に固定画像があれば入れる
    if (data.fixed) result.push(imageBasePath + data.fixed);

    const randomList = [...data.random];
    shuffleArray(randomList);

    const maxImages = Math.min(8, positions.length);
    const needed = maxImages - result.length;

    for (let i = 0; i < needed; i++) {
      result.push(imageBasePath + randomList[i]);
    }

    imagePathsCache = result;
  }

  // ▼ キャッシュに基づいて描画
  imagePathsCache.forEach((path, index) => {
    if (!positions[index]) return;
    const pos = positions[index];
    const img = document.createElement("img");
    img.draggable = false;
    img.style.position = "absolute";
    img.style.objectFit = "contain";
    img.style.pointerEvents = "none";
    img.style.boxSizing = "border-box";

    const left = safeArea.x + cellWidth * pos.x;
    const top = safeArea.y + cellHeight * pos.y;
    Object.assign(img.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${cellWidth}px`,
      height: `${cellHeight}px`,
      maxWidth: "100%",
      maxHeight: "100%"
    });

    img.src = path;
    randomImagesLayer.appendChild(img);
    randomImageElements.push(img);
  });
}

// ▼ ランダムテキスト表示（従来通り）
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

      const baseColor1 = style1.color || "#C0C0C0";
      const baseColor2 = style2.color || "#C0C0C0";

      // ▼ レスポンシブ判定
      const w = window.innerWidth;
      const h = window.innerHeight;
      let fontSize = "1.0em";
      let padding = "0.5em 1em";

      if (w <= 768 && h > w) {
        // モバイル縦
        fontSize = "0.9em";
        padding = "0.4em 0.8em";
      } else if (w <= 768 && w >= h) {
        // モバイル横
        fontSize = "0.85em";
        padding = "0.3em 0.6em";
      }

      const note = document.createElement("div");
      note.className = "random-text-note";
      Object.assign(note.style, {
        position: "absolute",
        left: "5%",
        width: "90%",
        bottom: "0",
        backgroundColor: "#fff",
        borderLeft: `10px solid ${baseColor1}`,
        fontSize: fontSize,
        fontWeight: "bold",
        padding: padding,
        borderRadius: "0.5em",
        boxSizing: "border-box",
        zIndex: 3
      });

      const line1 = document.createElement("div");
      line1.textContent = text1;
      line1.style.color = baseColor1;
      line1.style.textShadow = `-1.2px -1.2px 1px #444, 1.2px -1.2px 1px #444, -1.2px 1.2px 1px #444, 1.2px 1.2px 1px #444`;

      const line2 = document.createElement("div");
      line2.textContent = text2;
      line2.style.color = baseColor2;
      line2.style.textShadow = `-1.2px -1.2px 1px #444, 1.2px -1.2px 1px #444, -1.2px 1.2px 1px #444, 1.2px 1.2px 1px #444`;

      note.appendChild(line1);
      note.appendChild(line2);
      randomTextLayer.appendChild(note);
      randomTextElements.push(note);
    })
    .catch(err => console.error("ランダムテキストJSONの読み込みに失敗しました", err));
}


// ▼ 非表示関数
function randomImagesOff() {
  clearRandomImages();
}
function randomTextsOff() {
  clearRandomTexts();
}

// ▼ 回転時の再描画（シャッフルなしで再配置）
window.addEventListener("resize", () => {
  if (randomImagesLayer && randomImagesDataCache) {
    randomImagesOff();
    buildRandomImages(randomImagesDataCache);
  }
});
