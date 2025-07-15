let randomImagesLayer = null;
let randomImageElements = [];
let randomTextElements = [];
let randomTextLayer = null;

let randomImagesDataCache = null;
let imagePathsCache = null;
let preloadedImages = {}; // src => <img>（非表示で保持）

// ▼ レイヤー作成
function createRandomImagesLayer() {
  if (randomImagesLayer) return;
  randomImagesLayer = document.createElement("div");
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
    bottom: "0",
    left: "0",
    width: "100%",
    zIndex: "3",
    pointerEvents: "none"
  });
  document.body.appendChild(randomTextLayer);
}

// ▼ クリア
function clearRandomImages() {
  if (randomImagesLayer) {
    // 子をすべて一旦 body（非表示保持領域）に戻す
    randomImageElements.forEach(img => {
      if (img.parentElement === randomImagesLayer) {
        randomImagesLayer.removeChild(img);
        // bodyに戻すときは非表示に
        img.style.position = "fixed";
        img.style.left = "-9999px";
        img.style.top = "-9999px";
        img.style.width = "auto";
        img.style.height = "auto";
        img.style.objectFit = "contain";
        document.body.appendChild(img);
      }
    });
  }
  randomImageElements = [];
}

function clearRandomTexts() {
  if (randomTextLayer) randomTextLayer.innerHTML = "";
  randomTextElements = [];
}

// ▼ シャッフル
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ▼ ランダム画像表示
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
      .catch(err => console.error("画像JSON読み込み失敗", err));
  }
}

function buildRandomImages(data) {
  createRandomImagesLayer();
  clearRandomImages();

  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPortrait = w <= 768 && h > w;
  let cols = 3, rows = 2;
  if (isPortrait) { cols = 2; rows = 4; }

  const safeArea = { x: w * 0.1, y: h * 0.1, width: w * 0.8, height: h * 0.8 };
  const cellW = safeArea.width / cols;
  const cellH = safeArea.height / rows;

  const positions = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      positions.push({ x, y });
    }
  }

  const base = data.picpath || config.randomPath;
  const list = [];
  if (data.fixed) list.push(base + data.fixed);
  const rand = [...data.random];
  shuffleArray(rand);
  while (list.length < 8 && rand.length) list.push(base + rand.shift());
  imagePathsCache = list;

  const selected = imagePathsCache.slice(0, positions.length);

  selected.forEach((src, i) => {
    const { x, y } = positions[i];

    // 画像がプリロード済みなら reuse、なければ preload & reuse
    if (!preloadedImages[src]) {
      const img = new Image();
      img.src = src;
      // 非表示領域に置いておく
      img.style.position = "fixed";
      img.style.left = "-9999px";
      img.style.top = "-9999px";
      img.style.width = "auto";
      img.style.height = "auto";
      img.style.objectFit = "contain";
      document.body.appendChild(img);
      preloadedImages[src] = img;

      // まだロード中の場合はonload待つのもありだが省略（先に表示しても大丈夫）
    }

    // 使うときは再配置＆スタイル調整
    const img = preloadedImages[src];
    if (img.parentElement !== randomImagesLayer) {
      // 親を移動
      if (img.parentElement) img.parentElement.removeChild(img);
      randomImagesLayer.appendChild(img);
    }
    Object.assign(img.style, {
      position: "absolute",
      left: `${safeArea.x + cellW * x}px`,
      top: `${safeArea.y + cellH * y}px`,
      width: `${cellW}px`,
      height: `${cellH}px`,
      objectFit: "contain",
      pointerEvents: "none",
      display: "block"
    });

    randomImageElements.push(img);
  });
}

// ▼ ランダムテキスト表示（変更なし）
function randomTextsOn() {
  if (!window.config || !config.randomPath) return;

  fetch(`${config.randomPath}textset01.json`)
    .then(res => res.json())
    .then(data => {
      createRandomTextLayer();
      clearRandomTexts();

      if (data.length < 4) return;

      const selected = [];
      const pairs = data.length / 2;
      while (selected.length < 2) {
        const i = Math.floor(Math.random() * pairs);
        if (!selected.includes(i)) selected.push(i);
      }

      const name1 = data[selected[0] * 2];
      const text1 = data[selected[0] * 2 + 1];
      const name2 = data[selected[1] * 2];
      const text2 = data[selected[1] * 2 + 1];

      const s1 = characterStyles[name1] || characterStyles[""];
      const s2 = characterStyles[name2] || characterStyles[""];
      const c1 = s1.color || "#C0C0C0";
      const c2 = s2.color || "#C0C0C0";

      const w = window.innerWidth;
      const h = window.innerHeight;
      let fontSize = "1em";
      let padding = "0.075em 1em";
      let lineGap = "0.05em";
      let paddingBottom = "0.075em";

      if (w <= 768 && h > w) {
        fontSize = "0.8em";
        padding = "0.05em 0.8em";
        lineGap = "0.05em";
        paddingBottom = "0.2em";
      } else if (w <= 768 && w >= h) {
        fontSize = "0.8em";
        padding = "0.05em 0.6em";
        lineGap = "0.05em";
        paddingBottom = "0.075em";
      }

      const note = document.createElement("div");
      Object.assign(note.style, {
        position: "absolute",
        left: "5%",
        width: "90%",
        bottom: "0",
        backgroundColor: "#fff",
        borderLeft: `10px solid ${c1}`,
        fontSize,
        fontWeight: "bold",
        padding,
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${paddingBottom})`,
        borderRadius: "0.5em",
        boxSizing: "border-box",
        zIndex: 3
      });

      const line1 = document.createElement("div");
      line1.textContent = text1;
      line1.style.color = c1;
      line1.style.marginBottom = lineGap;
      line1.style.textShadow = "-1px -1px 1px #444, 1px -1px 1px #444, -1px 1px 1px #444, 1px 1px 1px #444";

      const line2 = document.createElement("div");
      line2.textContent = text2;
      line2.style.color = c2;
      line2.style.textShadow = "-1px -1px 1px #444, 1px -1px 1px #444, -1px 1px 1px #444, 1px 1px 1px #444";

      note.appendChild(line1);
      note.appendChild(line2);
      randomTextLayer.appendChild(note);
      randomTextElements.push(note);
    })
    .catch(err => console.error("テキストJSON読み込み失敗", err));
}

// ▼ OFF系
function randomImagesOff() {
  clearRandomImages();
  randomImagesDataCache = null;
  imagePathsCache = null;

  // 非表示にしてbodyに戻すだけ。破棄しない。
  Object.values(preloadedImages).forEach(img => {
    if (img.parentElement !== document.body) {
      if (img.parentElement) img.parentElement.removeChild(img);
      img.style.position = "fixed";
      img.style.left = "-9999px";
      img.style.top = "-9999px";
      img.style.width = "auto";
      img.style.height = "auto";
      img.style.objectFit = "contain";
      document.body.appendChild(img);
    }
  });
}

function randomTextsOff() {
  clearRandomTexts();
}

// ▼ リサイズ対応
window.addEventListener("resize", () => {
  if (randomImagesLayer && randomImagesDataCache) {
    clearRandomImages();
    buildRandomImages(randomImagesDataCache);
  }
});
