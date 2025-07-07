// randomShows.js

let randomImagesLayer = null;
let randomImageElements = [];
let randomTextLayer = null;
let randomTextElements = [];

// ▼ 画像レイヤー作成（省略。以前のコードと同じ）

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

// ▼ テキストレイヤー作成（省略）

function createRandomTextLayer() {
  if (randomTextLayer) return;
  randomTextLayer = document.createElement("div");
  randomTextLayer.id = "random-text-layer";
  Object.assign(randomTextLayer.style, {
    position: "absolute",
    bottom: "0",
    left: "5%",    // safe area 左端5%
    width: "90%",  // safe area 横幅90%
    height: "10%",
    zIndex: "3",
    pointerEvents: "none",
  });
  document.body.appendChild(randomTextLayer);
}

// ▼ 画像クリア（省略）
function clearRandomImages() {
  if (!randomImagesLayer) return;
  randomImagesLayer.innerHTML = "";
  randomImageElements = [];
}

// ▼ テキストクリア（省略）
function clearRandomTexts() {
  if (!randomTextLayer) return;
  randomTextLayer.innerHTML = "";
  randomTextElements = [];
}

// ▼ ランダム画像表示（省略）
// ... 以前と同じコード

// ▼ ランダムテキスト表示（修正）
// ランダムに1つだけ選び、付箋内で上下2段にテキストを分割表示
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

      if (!window.characterStyles) {
        console.warn("characterStyles が見つかりません。文字色はデフォルトになります。");
      }

      // dataは ["キャラ名", "テキスト", "キャラ名", "テキスト", ...] の配列

      // ランダムに1つ選ぶ（ペア単位で）
      const pairCount = data.length / 2;
      const idx = Math.floor(Math.random() * pairCount) * 2;
      const charName = data[idx];
      const text = data[idx + 1];

      const color = window.characterStyles?.[charName]?.color || "#888";

      // 付箋の親div
      const note = document.createElement("div");
      note.className = "random-text-note";
      Object.assign(note.style, {
        position: "absolute",
        left: "5%",
        width: "90%",
        height: "10%",
        backgroundColor: "white",
        borderLeft: `12px solid ${color}`,
        borderRadius: "0.5em",
        boxShadow: "2px 2px 6px rgba(0,0,0,0.2)",
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 3,
        color: color,
        fontWeight: "bold",
        boxSizing: "border-box",
        padding: "0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      });

      // 上段テキスト div（キャラ名）
      const topDiv = document.createElement("div");
      topDiv.textContent = charName;
      Object.assign(topDiv.style, {
        height: "50%",
        fontSize: "1.2em",
        lineHeight: "1.2em",
        paddingLeft: "1em",
        paddingTop: "0.3em",
        paddingBottom: "0",
        color: color,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        userSelect: "none",
      });

      // 下段テキスト div（セリフ）
      const bottomDiv = document.createElement("div");
      bottomDiv.textContent = text;
      Object.assign(bottomDiv.style, {
        height: "50%",
        fontSize: "1em",
        lineHeight: "1.2em",
        paddingLeft: "1em",
        paddingTop: "0",
        paddingBottom: "0.3em",
        color: "#333",
        overflowWrap: "break-word",
        userSelect: "none",
      });

      note.appendChild(topDiv);
      note.appendChild(bottomDiv);
      randomTextLayer.appendChild(note);
      randomTextElements.push(note);
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

// ▼ 配列シャッフル（省略）
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
