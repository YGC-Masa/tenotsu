// characterStyles.js

const characterStyles = {
  hina: { fontSize: "1em", speed: 40 },
  ai: { fontSize: "1em", speed: 40 },
  midori: { fontSize: "1em", speed: 40 },
  kogane: { fontSize: "1em", speed: 40 },
  kohaku: { fontSize: "1em", speed: 40 }
};

export function getCharacterStyle(name) {
  return characterStyles[name] || { fontSize: "1em", speed: 40 };
}
