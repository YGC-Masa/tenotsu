:root {
  --vh: 1vh;
  --fontSize: 1em;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: sans-serif;
  background: #000;
  overflow: hidden;
}

#game-container {
  position: relative;
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
  touch-action: manipulation;
}

#background {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

/* キャラレイヤー */
#char-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 5%;
  box-sizing: border-box;
}

.char-slot {
  width: 30%;
  height: 80%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.char-image {
  max-height: 100%;
  max-width: 100%;
  transition: opacity 0.5s ease;
}

/* 各種エフェクト */
.fadein {
  animation: fadeIn 0.8s ease forwards;
}
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.slideinLeft {
  animation: slideInLeft 0.8s ease forwards;
}
@keyframes slideInLeft {
  0% { transform: translateX(-100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

.slideinRight {
  animation: slideInRight 0.8s ease forwards;
}
@keyframes slideInRight {
  0% { transform: translateX(100%); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

/* セリフ・名前・選択肢 */
#dialogue-box {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 1em;
  box-sizing: border-box;
  font-size: var(--fontSize);
  z-index: 2;
  max-height: 35vh;
}

.name-area {
  font-weight: bold;
  margin-bottom: 0.5em;
}

.choices-area {
  position: absolute;
  bottom: 35vh;
  width: 100%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.choices-area button {
  margin: 0.3em;
  padding: 0.5em 1em;
  font-size: 1em;
  border: none;
  background-color: #fff;
  color: #000;
  border-radius: 5px;
  cursor: pointer;
}

.choices-area button:hover {
  background-color: #ddd;
}
