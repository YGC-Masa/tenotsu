:root {
  --vh: 1vh;
  --fontSize: 1em;
}

body {
  margin: 0;
  padding: 0;
  background-color: black;
  font-family: sans-serif;
  overflow: hidden;
  height: calc(var(--vh, 1vh) * 100);
}

#game-container {
  width: 100%;
  height: 100%;
  position: relative;
}

#background {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.character-slot {
  position: absolute;
  bottom: 0;
  width: 33.3%;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}

#char-left {
  left: 0;
}

#char-center {
  left: 33.3%;
}

#char-right {
  left: 66.6%;
}

.char-image {
  max-height: 100%;
  max-width: 100%;
  opacity: 0;
  transition: opacity 0.5s ease, transform 0.5s ease;
}

/* エフェクトクラス */
.fadein {
  opacity: 1;
  transform: translateY(0);
}

.slideinLeft {
  opacity: 1;
  transform: translateX(-30px);
}

.slideinRight {
  opacity: 1;
  transform: translateX(30px);
}

/* テキスト・UI */
#text-area {
  position: absolute;
  bottom: 0;
  width: 100%;
  max-height: 35vh;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1em;
  font-size: var(--fontSize);
  z-index: 2;
  box-sizing: border-box;
}

#name {
  font-weight: bold;
  margin-bottom: 0.5em;
}

#text {
  white-space: pre-wrap;
}

#choices {
  margin-top: 1em;
}

#choices button {
  display: block;
  margin: 0.5em 0;
  padding: 0.5em 1em;
  font-size: 1em;
  background: #222;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

#choices button:hover {
  background: #444;
}
