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
    bottom: "0",
    left: "5vw",      // 横幅5%の左右余白を確保
    width: "90vw",    // 横幅は90%で左右に5%ずつの余白
    height: "10vh",   // 画面下10%の高さ
    zIndex: "3",
    pointerEvents: "none",
    userSelect: "none",
    fontFamily: "'Arial', sans-serif",
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

      const isMobilePortrait = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
      const isMobileLandscape = window.innerWidth <= 768 && window.innerWidth > window.innerHeight;
      // 判定修正：モバイル横は画面幅<=768かつ横長
      // PCは画面幅>768

      let cols, rows;
      if (isMobilePortrait) {
        cols = 2; rows = 4;  // モバイル縦 2列×4行
      } else {
        cols = 3; rows = 2;  // PC・モバイル横 3列×2行
      }

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

// ▼ ランダムテキスト表示（2個を上下2段に表示）
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

      // ランダムに2つだけ選択（重複しないように）
      const indexes = [];
      while (indexes.length < 2 && indexes.length < data.length) {
        const idx = Math.floor(Math.random() * data.length);
        if (!indexes.includes(idx)) indexes.push(idx);
      }

      // 上段テキスト
      const upperNote = document.createElement("div");
      upperNote.className = "random-text-note";
      upperNote.textContent = data[indexes[0]];
      Object.assign(upperNote.style, {
        bottom: "5vh",   // 画面高さ90%〜95%（=下10%のうち上段5%）
        left: "0",
        width: "90%",    // 親の横幅90%を活かす
        height: "5vh",
        clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)"  // 下辺ギザギザカット風
      });
      randomTextLayer.appendChild(upperNote);
      randomTextElements.push(upperNote);

      // 下段テキスト
      const lowerNote = document.createElement("div");
      lowerNote.className = "random-text-note";
      lowerNote.textContent = data[indexes[1]];
      Object.assign(lowerNote.style, {
        bottom: "0",    // 画面高さ95%〜100%（=下10%のうち下段5%）
        left: "0",
        width: "90%",
        height: "5vh",
        clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0% 100%)"  // 上辺ギザギザカット風
      });
      randomTextLayer.appendChild(lowerNote);
      randomTextElements.push(lowerNote);
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
