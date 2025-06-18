import { config } from "./config.js";
import { characterColors } from "./characterColors.js";
import { characterStyles } from "./characterStyles.js";
import { playEffect } from "./effectHandler.js";

const gameContainer = document.getElementById("game-container");
const background = document.getElementById("background");
const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right"),
};
const dialogueBox = document.getElementById("dialogue-box");
const nameBox = document.getElementById("name");
const textBox = document.getElementById("text");
const choicesBox = document.getElementById("choices");

let scenario = [];
let currentIndex = 0;
let isPlaying = false;
let skipRequested = false;

async function loadScenario() {
  const res = await fetch(`${config.scenarioPath}000start.json`);
  scenario = await res.json();
}

function clearChars() {
  Object.values(charSlots).forEach((slot) => (slot.innerHTML = ""));
}

function showCharacter(slotId, charImage, effect) {
  const slot = charSlots[slotId];
  if (!slot) return;

  slot.innerHTML = "";

  if (!charImage) return;

  const img = document.createElement("img");
  img.src = `${config.charPath}${
