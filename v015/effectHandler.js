export function playEffect(effect, element, callback) {
  if (!effect || !element) {
    if (callback) callback();
    return;
  }

  // 一旦初期化
  element.classList.remove('fadein', 'slideinLeft', 'slideinRight', 'whiteout', 'blackout');

  switch (effect) {
    case 'fadein':
      element.classList.add('fadein');
      break;
    case 'slideleft':
      element.classList.add('slideinLeft');
      break;
    case 'slideright':
      element.classList.add('slideinRight');
      break;
    case 'whiteout':
      document.body.classList.add('whiteout');
      setTimeout(() => {
        document.body.classList.remove('whiteout');
        if (callback) callback();
      }, 1000);
      return;
    case 'blackout':
      document.body.classList.add('blackout');
      setTimeout(() => {
        document.body.classList.remove('blackout');
        if (callback) callback();
      }, 1000);
      return;
    default:
      break;
  }

  // アニメーション終了後に callback 実行
  element.addEventListener('animationend', () => {
    if (callback) callback();
  }, { once: true });
}
