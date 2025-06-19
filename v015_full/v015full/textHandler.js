import { characterStyles } from './characterStyles.js';
import { characterColors } from './characterColors.js';

export function setDialogue(nameBox, textBox, name, text) {
  nameBox.textContent = name || '';
  textBox.textContent = text || '';
  nameBox.style.color = characterColors[name] || 'white';
  const style = characterStyles[name];
  if (style && style.font) {
    textBox.style.font = style.font;
  }
}