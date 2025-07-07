let randomImagesLayer = null;
let randomImageElements = [];
let randomTextLayer = null;
let randomTextElements = [];

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

      const isMobilePortrait = window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
      const isMobileLandscape = window.innerWidth <= 768 && window.innerWidth > window.innerHeight;

      let cols = 3;
      let rows = 2;

      if (isMobilePortrait) {
        cols = 2;
        rows = 4;
      } else if (isMobileLandscape) {
        cols = 3;
        rows = 2;
      }
      // PCは cols=3, rows=2 のまま

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
          maxHeight: "100%"
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

      // ランダムに2個選ぶ
      const usedIndexes = new Set();
      while (usedIndexes.size < 2 && usedIndexes.size < data.length) {
        usedIndexes.add(Math.floor(Math.random() * data.length));
      }
      const selectedTexts = Array.from(usedIndexes).map(i => data[i]);

      // randomTextLayerは画面全幅固定、高さ10%固定、位置はbottom0にする
      Object.assign(randomTextLayer.style, {
        display: "block",
        position: "absolute",
        bottom: "0",
        left: "0",
        width: "100%",
        height: "10%", // 画面下10%
        pointerEvents: "none",
        overflow: "visible",
      });

      // 上段テキスト配置 (縦90%-95%)
      const divTop = document.createElement("div");
      divTop.className = "random-text-note";
      divTop.textContent = selectedTexts[0] || "";
      Object.assign(divTop.style, {
        position: "absolute",
        top: "90%",     // 親の10%高さのうち90% = 画面全体の90%〜95%あたり
        left: "5%",
        width: "90%",   // 横幅5%~95%の幅
        height: "5%",
        lineHeight: "1.2",
        background: "rgba(255,192,203,0.95)", // ピンク付箋風
        color: "#000",
        fontWeight: "bold",
        fontSize: "0.9em",
        borderRadius: "0.4em 0.4em 0 0",
        boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
        padding: "0.2em 0.4em",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        clipPath: "polygon(0 0, 95% 0, 100% 20%, 100% 100%, 0% 100%)" // 右端ギザギザ風カット
      });

      // 下段テキスト配置 (縦95%-100%)
      const divBottom = document.createElement("div");
      divBottom.className = "random-text-note";
      divBottom.textContent = selectedTexts[1] || "";
      Object.assign(divBottom.style, {
        position: "absolute",
        top: "95%",
        left: "5%",
        width: "90%",
        height: "5%",
        lineHeight: "1.2",
        background: "rgba(255,182,193,0.95)",
        color: "#000",
        fontWeight: "bold",
        fontSize: "0.9em",
        borderRadius: "0 0 0.4em 0.4em",
        boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
        padding: "0.2em 0.4em",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        clipPath: "polygon(0 0, 100% 0, 100% 80%, 95% 100%, 0% 100%)"
      });

      randomTextLayer.appendChild(divTop);
      randomTextLayer.appendChild(divBottom);

      randomTextElements.push(divTop, divBottom);
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
