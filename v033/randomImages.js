// randomImages.js - v033-02 セーフエリアランダム画像配置

const RANDOM_IMAGE_LAYER_ID = "random-image-layer";

// セーフエリア比率
const SAFE_MARGIN = 0.1;

// セル分割定義（3列2行 → 計6セル）
const CELL_ROWS = 2;
const CELL_COLS = 3;

// セルごとの画像設定
const fixedImageSrc = "../asset2/bgev/titleon.jpg"; // セル① 固定画像
const randomImagePool = [                   // セル②〜⑥ ランダム画像
"../asset2/ev/a01ev01.png",
"../asset2/ev/a01ev02.png",
"../asset2/ev/a01ev03.png",
"../asset2/ev/a01ev04.png",
"../asset2/ev/a01ev05.png",
"../asset2/ev/b01ev01.png",
"../asset2/ev/b01ev02.png",
"../asset2/ev/c01ev01.png",
"../asset2/ev/c01ev02.png",
"../asset2/ev/d01ev01.png",
"../asset2/ev/d01ev02.png",
"../asset2/ev/e01ev01.png",
"../asset2/ev/e01ev02.png",
"../asset2/ev/ev01.png",
"../asset2/ev/ev_rooftop.png"

];

// 画像読み込み用ユーティリティ
function createSafeImage(src, cellIndex) {
  const img = new Image();
  img.src = src;
  img.classList.add("random-image");
  img.dataset.cellIndex = cellIndex;
  return img;
}

// レイヤーの初期化（初回時に DOM 作成）
function ensureRandomImageLayer() {
  let layer = document.getElementById(RANDOM_IMAGE_LAYER_ID);
  if (!layer) {
    layer = document.createElement("div");
    layer.id = RANDOM_IMAGE_LAYER_ID;
    layer.style.position = "absolute";
    layer.style.top = "0";
    layer.style.left = "0";
    layer.style.width = "100%";
    layer.style.height = "100%";
    layer.style.zIndex = "2.5"; // EVより上、クリックより下扱い
    layer.style.pointerEvents = "none"; // 通過可能に
    layer.style.display = "flex";
    layer.style.justifyContent = "center";
    layer.style.alignItems = "center";
    document.getElementById("game-container").appendChild(layer);
  }
  return layer;
}

// メイン関数：画像表示
function showRandomImages() {
  const container = ensureRandomImageLayer();
  container.innerHTML = ""; // 初期化

  const containerWidth = container.offsetWidth;
  const containerHeight = container.offsetHeight;

  const safeWidth = containerWidth * (1 - SAFE_MARGIN * 2);
  const safeHeight = containerHeight * (1 - SAFE_MARGIN * 2);
  const offsetX = containerWidth * SAFE_MARGIN;
  const offsetY = containerHeight * SAFE_MARGIN;

  const cellWidth = safeWidth / CELL_COLS;
  const cellHeight = safeHeight / CELL_ROWS;

  const selectedRandoms = shuffleArray(randomImagePool).slice(0, 5); // ②〜⑥をランダムに5つ選択

  for (let i = 0; i < 6; i++) {
    const row = Math.floor(i / CELL_COLS);
    const col = i % CELL_COLS;
    const x = offsetX + col * cellWidth;
    const y = offsetY + row * cellHeight;

    const img = createSafeImage(i === 0 ? fixedImageSrc : selectedRandoms[i - 1], i);
    img.style.position = "absolute";
    img.onload = () => {
      const scale = Math.min(cellWidth / img.naturalWidth, cellHeight / img.naturalHeight);
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      img.style.width = `${width}px`;
      img.style.height = `${height}px`;
      img.style.left = `${x + (cellWidth - width) / 2}px`;
      img.style.top = `${y + (cellHeight - height) / 2}px`;
    };
    container.appendChild(img);
  }
}

// 補助：配列シャッフル
function shuffleArray(array) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 外部から実行できるよう export
window.showRandomImages = showRandomImages;
