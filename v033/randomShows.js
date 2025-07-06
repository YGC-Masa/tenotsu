function randomImagesOn() {
  if (!window.config || !config.randomPath) {
    console.error("config.randomPath が定義されていません。");
    return;
  }
  console.log("randomImagesOn 実行");

  fetch(`${config.randomPath}imageset01.json`)
    .then(response => {
      if (!response.ok) throw new Error("JSON読み込み失敗");
      return response.json();
    })
    .then(data => {
      console.log("imageset01.json 読み込み成功", data);

      createRandomImagesLayer();
      clearRandomImages();

      const safeArea = {
        x: window.innerWidth * 0.1,
        y: window.innerHeight * 0.1,
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.8
      };

      const cellWidth = safeArea.width / 3;
      const cellHeight = safeArea.height / 2;

      const positions = [
        { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
        { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }
      ];

      const fixedImage = data.fixed;
      const randomList = [...data.random];
      shuffleArray(randomList);

      positions.forEach((pos, index) => {
        const img = document.createElement("img");
        img.draggable = false;
        img.style.position = "absolute";
        img.style.maxWidth = "100%";
        img.style.maxHeight = "100%";
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
          img.src = config.randomPath + fixedImage;
          console.log("固定画像セット:", img.src);
        } else {
          const randomImg = randomList.shift();
          if (randomImg) {
            img.src = config.randomPath + data.randompath + randomImg;
            console.log("ランダム画像セット:", img.src);
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
