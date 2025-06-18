import { characterStyles } from './characterStyles.js';
import { characterColors } from './characterColors.js';

export function setDialogue(nameBox, textBox, name, text) {
  nameBox.textContent = name || '';
  textBox.textContent = text || '';

  // 色設定（characterColors.js）
  nameBox.style.color = characterColors[name] || 'white';

  // スタイル（characterStyles.js）
  const style = characterStyles[name];
  if (style && style.font) {
    textBox.style.font = style.font;
  } else {
    textBox.style.font = '1em sans-serif';
  }
}
