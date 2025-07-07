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
    height: "10%", // 画面下部10%の高さを占める
    zIndex: "3",
    pointerEvents: "none",
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

// ▼ 配列シャッフル（Fisher-Yates）
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ▼ 輝度を上げて薄くする関数（#rrggbb → 薄色rgb）
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
    .then(response => response.json())
    .then(data => {
      createRandomImagesLayer();
      clearRandomImages();

      const w = window.innerWidth;
      const h = window.innerHeight;

      const isMobilePortrait = w <= 768 && h > w;
      const isMobileLandscape = w <= 768 && w > h;

      let cols, rows;
      if (isMobilePortrait) {
        cols = 2;
        rows = 4;
      } else { // モバイル横 or PC
        cols = 3;
        rows = 2;
      }

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

// ▼ ランダムテキスト表示（2文言1枚の付箋風）
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

      if (data.length < 4) {
        console.warn("textset01.json はキャラ名とテキストがペアで最低2セット必要です。");
        return;
      }

      // dataは [キャラ名, テキスト, キャラ名, テキスト,...]
      // ペア数
      const pairCount = data.length / 2;

      // 2つのランダムペアを選ぶ（重複なし）
      const selectedIndexes = [];
      while (selectedIndexes.length < 2) {
        const idx = Math.floor(Math.random() * pairCount);
        if (!selectedIndexes.includes(idx)) selectedIndexes.push(idx);
      }

      // 付箋1枚に2段テキストをまとめて作成
      const note = document.createElement("div");
      note.className = "random-text-note";

      // 配置とサイズ（safe areaの横5%~95%、縦90~100%）
      Object.assign(note.style, {
        position: "absolute",
        left: "5%",
        width: "90%",
        top: "90%",
        height: "10%",
        borderRadius: "0.5em",
        boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "0.5em 1em",
        boxSizing: "border-box",
        userSelect: "none",
        pointerEvents: "none",
        zIndex: 3,
        backgroundColor: "",  // 後述で設定
        borderLeft: "",      // 後述で設定
        color: "",           // 後述で設定
      });

      // キャラカラー（付箋背景は薄色、左帯は原色、テキスト色は原色）
      // 2つのキャラカラーを混ぜて背景色は平均化（または1つ目の薄色）とする方法もあるが、
      // ここは1つ目のキャラカラーをベースに薄色に設定し、テキストは各段のキャラ色に設定する例。

      const charName1 = data[selectedIndexes[0] * 2];
      const charName2 = data[selectedIndexes[1] * 2];
      const style1 = characterStyles[charName1] || characterStyles[""];
      const style2 = characterStyles[charName2] || characterStyles[""];
      const baseColor1 = style1.color || "#C0C0C0";

      // 付箋背景薄色化
      note.style.backgroundColor = lightenColor(baseColor1, 85);
      note.style.borderLeft = `12px solid ${baseColor1}`;

      // テキスト上段
      const line1 = document.createElement("div");
      line1.textContent = data[selectedIndexes[0] * 2 + 1];
      Object.assign(line1.style, {
        color: style1.color,
        fontWeight: "bold",
        fontSize: "1em",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      });

      // テキスト下段
      const line2 = document.createElement("div");
      line2.textContent = data[selectedIndexes[1] * 2 + 1];
      Object.assign(line2.style, {
        color: style2.color,
        fontWeight: "bold",
        fontSize: "1em",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      });

      note.appendChild(line1);
      note.appendChild(line2);

      randomTextLayer.appendChild(note);
      randomTextElements.push(note);
    })
    .catch(err => console.error("ランダムテキストJSONの読み込みに失敗しました", err));
}

// ▼ ランダム画像非表示
function randomImagesOff() {
  clearRandomImages();
}

// ▼ ランダムテキスト非表示
function randomTextsOff() {
  clearRandomTexts();
}
