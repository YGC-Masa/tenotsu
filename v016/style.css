:root {
  --fontSize: 1em;
  --vh: 1vh;
}

body {
  margin: 0;
  padding: 0;
  background: black;
  font-family: "Helvetica Neue", sans-serif;
  overflow: hidden;
}

#game-container {
  position: relative;
  width: 100%;
  height: calc(var(--vh, 1vh) * 100);
  overflow: hidden;
}

#background {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.5s ease;
  z-index: 0;
}

#char-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  z-index: 1;
}

.char-slot {
  position: relative;
  width: 33%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.char-slot img.char-image {
  max-height: 95%;
  max-width: 100%;
  transition: all 0.5s ease;
}

#dialogue-box {
  position: absolute;
  bottom: 0;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 1em;
  font-size: var(--fontSize);
  z-index: 2;
}

.name-area {
  font-weight: bold;
  margin-bottom: 0.2em;
}

.text-area {
  white-space: pre-wrap;
}

.choices-area {
  position: absolute;
  bottom: 6em;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  z-index: 3;
}

.choices-area button {
  font-size: 1em;
  padding: 0.6em 1.2em;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 0.3em;
  cursor: pointer;
}

.choices-area button:hover {
  background-color: #555;
}
