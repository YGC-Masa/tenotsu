// characterStyles.js
// キャラクターごとのフォントサイズとテキスト速度を管理するモジュール

const characterStyles = {
  hina: { fontSize: "1.0em", speed: 40 },
  ai: { fontSize: "0.95em", speed: 50 },
  midori: { fontSize: "1.0em", speed: 45 },
  kogane: { fontSize: "1.1em", speed: 30 },
  kohaku: { fontSize: "1.0em", speed: 40 }
};

// 指定キャラ名のスタイルを返す。なければデフォルトを返す
export function getCharacterStyle(name) {
  return characterStyles[name] || { fontSize: "1em", speed: 40 };
}
