let isRandomImagesOn = false;
let usedRandomImages = [];
let randomImagesData = null;

const randomImagesLayer = document.createElement("div");
randomImagesLayer.id = "random-images-layer";
randomImagesLayer.style.position = "absolute";
randomImagesLayer.style.top = "0";
randomImagesLayer.style.left = "0";
randomImagesLayer.style.width = "100%";
randomImagesLayer.style.height = "100%";
randomImagesLayer.style.zIndex = "2.5"; // BG(0), EV(2) より上、click-layer(9)より下
randomImagesLayer.style.pointerEvents = "none";
document.getElementById("game-container").appendChild(randomImagesLayer);

async function randomImagesOn() {
  isRandomImagesOn = true;
  usedRandomImages = [];

  if (!randomImagesData) {
    try {
      const res = await fetch("./random/imageset01.json");
      randomImagesData = await res.json();
    } catch (e) {
      console.error("ランダム画像JSONの読み込みに失敗しました", e);
      return;
    }
  }

  renderRandomImages();
}

function randomImagesOff() {
  isRandomImagesOn = false;
  usedRandomImages = [];
  randomImagesLayer.innerHTML = "";
}

function renderRandomImages() {
  if (!isRandomImagesOn || !randomImagesData) return;

  randomImagesLayer.innerHTML = "";

  const containerWidth = randomImagesLayer.clientWidth;
  const containerHeight = randomImagesLayer.clientHeight;

  const safeLeft = containerWidth * 0.1;
  const safeTop = containerHeight * 0.1;
  const safeWidth = containerWidth * 0.8;
  const safeHeight = containerHeight * 0.8;

  const cellWidth = safeWidth / 3;
  const cellHeight = safeHeight / 2;

  const positions = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1]
  ];

  // セル①（左上）＝固定画像
  const fixedImg = document.createElement("img");
  fixedImg.src = randomImagesData.fixed;
  fixedImg.style.position = "absolute";
  fixedImg.style.objectFit = "contain";
  fixedImg.style.pointerEvents = "none";

  const [fx, fy] = positions[0];
  fixedImg.style.left = `${safeLeft + fx * cellWidth}px`;
  fixedImg.style.top = `${safeTop + fy * cellHeight}px`;
  fixedImg.style.width = `${cellWidth}px`;
  fixedImg.style.height = `${cellHeight}px`;

  randomImagesLayer.appendChild(fixedImg);

  // セル②〜⑥＝ランダム画像（重複なし）
  const remainingPositions = positions.slice(1);
  const availableImages = [...randomImagesData.random];

  for (let i = 0; i < remainingPositions.length && availableImages.length > 0; i++) {
    const candidates = availableImages.filter(img => !usedRandomImages.includes(img));
    if (candidates.length === 0) break;

    const index = Math.floor(Math.random() * candidates.length);
    const imgName = candidates[index];
    usedRandomImages.push(imgName);

    const [x, y] = remainingPositions[i];
    const img = document.createElement("img");
    img.src = randomImagesData.randompath + imgName;
    img.style.position = "absolute";
    img.style.objectFit = "contain";
    img.style.pointerEvents = "none";

    img.style.left = `${safeLeft + x * cellWidth}px`;
    img.style.top = `${safeTop + y * cellHeight}px`;
    img.style.width = `${cellWidth}px`;
    img.style.height = `${cellHeight}px`;

    randomImagesLayer.appendChild(img);
  }
}
