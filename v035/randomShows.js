// randomShows.js - 最新完全版

let randomImagesLayer = null;
let randomTextLayer = null;
let randomImagesDataCache = null;
let preloadedImages = {};
let imagePathsCache = [];
let currentOrientation = '';

// ■ ランダム画像レイヤー作成
function createRandomImagesLayer() {
  if (randomImagesLayer) return; // 既にあれば無視
  randomImagesLayer = document.createElement("div");
  randomImagesLayer.id = "random-images-layer";
  Object.assign(randomImagesLayer.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "9",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: "env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)",
    background: "transparent",
    pointerEvents: "none",
    userSelect: "none",
  });
  document.body.appendChild(randomImagesLayer);
}

// ■ ランダムテキストレイヤー作成
function createRandomTextLayer() {
  if (randomTextLayer) return; // 既にあれば無視
  randomTextLayer = document.createElement("div");
  randomTextLayer.id = "random-text-layer";
  Object.assign(randomTextLayer.style, {
    position: "fixed",
    bottom: "10%",
    left: "5%",
    width: "90%",
    zIndex: "10",
    pointerEvents: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    userSelect: "none",
  });
  document.body.appendChild(randomTextLayer);
}

// ■ 画像プリロード（非表示保持）
function preloadImage(path) {
  if (!preloadedImages[path]) {
    const img = new Image();
    img.src = path;
    Object.assign(img.style, {
      position: "absolute",
      left: "-9999px",
      top: "-9999px",
      width: "auto",
      height: "auto",
      objectFit: "contain",
      pointerEvents: "none",
      userSelect: "none",
    });
    document.body.appendChild(img);
    preloadedImages[path] = img;
  }
}

// ■ 配列シャッフル（破壊せずコピーで）
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ■ ランダム画像表示ON
async function randomImagesOn() {
  createRandomImagesLayer();

  if (!randomImagesDataCache) {
    try {
      const res = await fetch(config.randomPath + "imageset01.json?t=" + Date.now());
      randomImagesDataCache = await res.json();
    } catch (e) {
      console.error("ランダム画像JSON読み込み失敗", e);
      return;
    }
  }

  const basePath = randomImagesDataCache.picpath || config.randomPath;
  const fixedImg = randomImagesDataCache.fixed ? [basePath + randomImagesDataCache.fixed] : [];
  const randomImgs = shuffleArray(randomImagesDataCache.random.map(p => basePath + p));

  // 最大8枚に収める（固定画像1枚+ランダム画像7枚まで）
  imagePathsCache = fixedImg.concat(randomImgs).slice(0, 8);

  // プリロード
  imagePathsCache.forEach(preloadImage);

  updateRandomImagesPosition();
}

// ■ ランダム画像表示OFF
function randomImagesOff() {
  if (!randomImagesLayer) return;
  while (randomImagesLayer.firstChild) {
    randomImagesLayer.removeChild(randomImagesLayer.firstChild);
  }
  randomImagesLayer.remove();
  randomImagesLayer = null;
  imagePathsCache = [];

  // プリロード画像はDOMからは消さず非表示保持（再利用のため）
  Object.values(preloadedImages).forEach(img => {
    if (img.parentElement !== document.body) {
      if (img.parentElement) img.parentElement.removeChild(img);
      Object.assign(img.style, {
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        width: "auto",
        height: "auto",
        objectFit: "contain",
        pointerEvents: "none",
        userSelect: "none",
      });
      document.body.appendChild(img);
    }
  });
}

// ■ 画面サイズ・向きに応じて画像配置更新（リサイズ対応）
function updateRandomImagesPosition() {
  if (!randomImagesLayer || imagePathsCache.length === 0) return;

  // まずレイヤー内クリア
  while (randomImagesLayer.firstChild) {
    randomImagesLayer.removeChild(randomImagesLayer.firstChild);
  }

  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPortrait = h > w;

  const cols = isPortrait ? 2 : 3;
  const rows = isPortrait ? 4 : 2;

  const boxWidthVW = 100 / cols;
  const boxHeightVH = 100 / rows;

  imagePathsCache.forEach((src, i) => {
    const container = document.createElement("div");
    Object.assign(container.style, {
      width: `${boxWidthVW}vw`,
      height: `${boxHeightVH}vh`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box",
      padding: "0.2em",
      userSelect: "none",
    });

    const img = preloadedImages[src] ? preloadedImages[src].cloneNode(true) : new Image();
    img.src = src;
    Object.assign(img.style, {
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
      pointerEvents: "none",
      userSelect: "none",
      imageRendering: "auto",
    });

    container.appendChild(img);
    randomImagesLayer.appendChild(container);
  });
}

// ■ ランダムテキスト表示ON
async function randomTextsOn() {
  createRandomTextLayer();

  let textData;
  try {
    const res = await fetch(config.randomPath + "textset01.json?t=" + Date.now());
    textData = await res.json();
  } catch (e) {
    console.error("ランダムテキストJSON読み込み失敗", e);
    return;
  }

  if (!Array.isArray(textData) || textData.length < 4) return;

  // 2ペア（4要素）をランダムに選択（重複なし）
  const pairCount = Math.floor(textData.length / 2);
  let selectedIndexes = [];
  while (selectedIndexes.length < 2) {
    const idx = Math.floor(Math.random() * pairCount);
    if (!selectedIndexes.includes(idx)) selectedIndexes.push(idx);
  }

  // 選ばれた2ペアのキャラ名＆テキスト
  const pairs = selectedIndexes.map(i => ({
    name: textData[i * 2],
    text: textData[i * 2 + 1]
  }));

  // クリアレイヤー
  randomTextLayer.innerHTML = "";

  // コンテナ（付箋風デザイン）
  const container = document.createElement("div");
  Object.assign(container.style, {
    backgroundColor: "white",
    borderRadius: "0.5em",
    border: "3px solid #444",
    boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
    padding: "1em 1.2em",
    width: "100%",
    maxWidth: "600px",
    boxSizing: "border-box",
    fontWeight: "bold",
    fontSize: window.innerWidth <= 768 && window.innerWidth > window.innerHeight ? "0.8em" : "1em",
    userSelect: "none",
    position: "relative",
  });

  // 左帯用色とテキスト色をキャラカラーから決定
  pairs.forEach(({ name, text }, idx) => {
    const style = characterStyles[name] || characterStyles[""];
    const charColor = style.color || "#000";

    const line = document.createElement("div");
    line.textContent = text;
    line.style.color = charColor;
    line.style.textShadow = "-1px -1px 0 #444,1px -1px 0 #444,-1px 1px 0 #444,1px 1px 0 #444";
    line.style.margin = idx === 0 ? "0 0 0.3em 0" : "0";
    container.appendChild(line);
  });

  // 左側に色帯をつけるための擬似要素を作るための親ラッパー
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.width = "100%";

  // 左側帯（キャラカラー濃い目）を複数表示
  pairs.forEach(({ name }, idx) => {
    const style = characterStyles[name] || characterStyles[""];
    const charColor = style.color || "#000";

    const band = document.createElement("div");
    Object.assign(band.style, {
      position: "absolute",
      left: "0",
      top: idx === 0 ? "0" : "50%",
      width: "10px",
      height: "50%",
      backgroundColor: charColor,
      borderRadius: "0.3em 0 0 0.3em",
      pointerEvents: "none",
      userSelect: "none",
    });
    wrapper.appendChild(band);
  });

  wrapper.appendChild(container);
  randomTextLayer.appendChild(wrapper);
}

// ■ ランダムテキスト表示OFF
function randomTextsOff() {
  if (!randomTextLayer) return;
  randomTextLayer.remove();
  randomTextLayer = null;
}

// ■ ウィンドウリサイズ時の処理
window.addEventListener("resize", () => {
  const newOrientation = window.innerWidth > window.innerHeight ? "landscape" : "portrait";
  if (newOrientation !== currentOrientation) {
    currentOrientation = newOrientation;
    updateRandomImagesPosition();
  }
});

