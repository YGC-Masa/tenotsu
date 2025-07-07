let randomImagesLayer = null;
let randomTextLayer = null;
let randomImageElements = [];
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
  randomTextLayer = document.getElementById("random-text-layer") || document.createElement("div");
  randomTextLayer.id = "random-text-layer";
  Object.assign(randomTextLayer.style, {
    position: "absolute",
    bottom: "0",
    left: "5vw",
    width: "90vw",
    height: "10vh",
    zIndex: "3",
    pointerEvents: "none",
    userSelect: "none"
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
    .then(response => response.json())
    .then(data => {
      createRandomImagesLayer();
      clearRandomImages();

      const isMobile = window.innerWidth <= 768;
      const isLandscape = window.innerWidth > window.innerHeight;

      const cols = isMobile ? (isLandscape ? 3 : 2) : 3;
      const rows = isMobile ? (isLandscape ? 2 : 4) : 2;

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
          height: `${cellHeight}px`
        });

        img.src = index === 0 && fixedImage
          ? imageBasePath + fixedImage
          : imageBasePath + (randomList.shift() || "");

        randomImagesLayer.appendChild(img);
        randomImageElements.push(img);
      });
    })
    .catch(err => console.error("ランダム画像読み込み失敗", err));
}

function randomTextsOn() {
  if (!window.config || !config.randomPath) return;

  fetch(`${config.randomPath}textset01.json`)
    .then(res => res.json())
    .then(data => {
      createRandomTextLayer();
      clearRandomTexts();

      // 2つだけランダムに選ぶ
      const pairs = [];
      for (let i = 0; i < data.length - 1; i += 2) {
        pairs.push([data[i], data[i + 1]]);
      }
      shuffleArray(pairs);
      const [charName, text] = pairs[0];

      const charStyle = characterStyles[charName] || characterStyles[""];
      const baseColor = charStyle.color || "#666";
      const lightBg = lightenColor(baseColor, 85);

      const note = document.createElement("div");
      note.className = "random-text-note";
      note.style.setProperty("--char-color", baseColor);
      note.style.backgroundColor = lightBg;

      const nameDiv = document.createElement("div");
      nameDiv.textContent = charName;
      nameDiv.style.fontWeight = "bold";
      nameDiv.style.color = baseColor;
      nameDiv.style.fontSize = "1em";

      const textDiv = document.createElement("div");
      textDiv.textContent = text;
      textDiv.style.color = "#000";
      textDiv.style.fontSize = "0.95em";

      note.appendChild(nameDiv);
      note.appendChild(textDiv);

      // ランダム位置（セーフエリア内）
      const left = 5 + Math.random() * 90; // 5%〜95%
      const top = 90 + Math.random() * 5;  // 90%〜95%

      Object.assign(note.style, {
        left: `${left}vw`,
        top: `${top}vh`
      });

      randomTextLayer.appendChild(note);
      randomTextElements.push(note);
    })
    .catch(err => console.error("ランダムテキスト読み込み失敗", err));
}

function randomImagesOff() {
  clearRandomImages();
}

function randomTextsOff() {
  clearRandomTexts();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// 色を薄くするユーティリティ
function lightenColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, ((num >> 16) & 255) + (255 - ((num >> 16) & 255)) * percent / 100);
  const g = Math.min(255, ((num >> 8) & 255) + (255 - ((num >> 8) & 255)) * percent / 100);
  const b = Math.min(255, (num & 255) + (255 - (num & 255)) * percent / 100);
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}
