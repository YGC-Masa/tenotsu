export function playEffect(effect, element, callback) {
  element.classList.remove('fadein');
  void element.offsetWidth;
  if (effect === 'fadein') {
    element.classList.add('fadein');
  }
  if (callback) setTimeout(callback, 500);
}