export const Effects = {
  FADEIN: 'fadein',
  SLIDELEFT: 'slideleft',
  SLIDERIGHT: 'slideright',
  WHITEOUT: 'whiteout',
  BLACKOUT: 'blackout',
};

export function isValidEffect(effect) {
  return Object.values(Effects).includes(effect);
}
