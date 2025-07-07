function randomImagesOn() {
  if (!window.config || !config.randomPath) {
    console.error("config.randomPath が定義されていません。");
    return;
  }

  fetch(`${config.randomPath}imageset01.json`)
    .then(response => {
      if (!response.ok) throw new Error("JSON読み込み失敗");
      return response.json();
    })
    .then(data => {
      createRandomImagesLayer();
      clearRandomImages();

      const safeArea = {
        x: window.innerWidth * 0.1,
        y: window.innerHeight * 0.1,
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8
      };

      // モバイル横画面（横向き）の判定
      const isMobileLandscape =
        window.innerWidth < 768 &&
        window.innerWidth > window.innerHeight;

      const columns = isMobileLandscape ? 2 : 3;
      const rows = isMobileLandscape ? 4 : 2;

      const cellWidth = safeArea.width / columns;
      const cellHeight = safeArea.height / rows;

      const positions = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
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
        img.className = "random-image";
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

        if (index === 0) {
          img.src = imageBasePath + fixedImage;
        } else {
          const randomImg = randomList.shift();
          if (randomImg) {
            img.src = imageBasePath + randomImg;
          }
        }

        randomImagesLayer.appendChild(img);
        randomImageElements.push(img);
      });
    })
    .catch(err => {
      console.error("ランダム画像JSONの読み込みに失敗しました", err);
    });
}
