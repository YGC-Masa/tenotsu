// textHandler.js
// テキスト表示・アニメーション管理モジュール
import { getCharacterStyle } from './characterStyles.js';

export class TextHandler {
  constructor(nameElement, textElement) {
    this.nameElement = nameElement;
    this.textElement = textElement;

    this.isTyping = false;
    this.typingTimeout = null;
    this.currentText = "";
    this.currentIndex = 0;
    this.speed = 40;
  }

  async setText(name, text) {
    // 名前に合わせてフォントサイズと速度をセット
    const style = getCharacterStyle(name.toLowerCase());
    this.nameElement.style.fontSize = style.fontSize;
    this.textElement.style.fontSize = style.fontSize;
    this.speed = style.speed;

    this.nameElement.textContent = name;
    this.currentText = text;
    this.currentIndex = 0;
    this.textElement.textContent = "";

    await this.typeText();
  }

  typeText() {
    return new Promise((resolve) => {
      this.isTyping = true;

      const type = () => {
        if (this.currentIndex < this.currentText.length) {
          this.textElement.textContent += this.currentText.charAt(this.currentIndex);
          this.currentIndex++;
          this.typingTimeout = setTimeout(type, this.speed);
        } else {
          this.isTyping = false;
          resolve();
        }
      };

      type();
    });
  }

  skip() {
    if (this.isTyping) {
      clearTimeout(this.typingTimeout);
      this.textElement.textContent = this.currentText;
      this.isTyping = false;
      return true; // スキップ成功
    }
    return false; // スキップできず（完了している）
  }
}
