async function randomImagesOn(jsonFile) {
  if (isRandomImagesOn) return;
  isRandomImagesOn = true;
  createRandomImagesLayer();

  const res = await fetch(`./randomimages/${jsonFile}?t=${Date.now()}`);
  const data = await res.json();

  const safeWidth = window.innerWidth * 0.8;
  const safeHeight = window.innerHeight * 0.8;
  const offsetX = window.innerWidth * 0.1;
  const offsetY = window.innerHeight * 0.1;
  const cellWidth = safeWidth / 3;
  const cellHeight = safeHeight / 2;

  randomImagesLayer.innerHTML = "";

  const positions = [
    { row: 0, col: 0 }, // ① 固定
    { row: 0, col: 1 }, // ②〜⑥ ランダム
    { row: 0, col: 2 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 }
  ];

  const used = new Set();
  const getUniqueRandomImage = () => {
    if (used.size >= data.random.length) return null;
    let img;
    do {
      img = data.random[Math.floor(Math.random() * data.random.length)];
    } while (used.has(img));
    used.add(img);
    return img;
  };

  for (let i = 0; i < 6; i++) {
    const img = document.createElement("img");
    const pos = positions[i];
    const x = offsetX + pos.col * cellWidth;
    const y = offsetY + pos.row * cellHeight;

    img.style.position = "absolute";
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.width = `${cellWidth}px`;
    img.style.height = `${cellHeight}px`;
    img.style.objectFit = "contain";
    img.style.pointerEvents = "none";

    if (i === 0) {
      img.src = data.fixed;
    } else {
      const randImage = getUniqueRandomImage();
      if (randImage) {
        img.src = data.randompath + randImage;
      }
    }

    randomImagesLayer.appendChild(img);
  }
}
