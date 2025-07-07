// randomShows.js

// セーフエリアに2段表示でランダムテキスト表示
async function randomTextsOn() {
  const layer = document.getElementById('random-text-layer');
  if (!layer) return;

  layer.innerHTML = ''; // 既存の付箋をクリア
  layer.classList.remove('hidden');

  try {
    const response = await fetch('./random/textset01.json');
    const data = await response.json();

    // キャラ名とセリフのペアを抽出
    const pairs = [];
    for (let i = 0; i < data.length; i += 2) {
      pairs.push([data[i], data[i + 1]]);
    }

    // ランダムに1組選ぶ
    const selected = pairs[Math.floor(Math.random() * pairs.length)];
    const [charName, message] = selected;

    // キャラカラー取得
    const style = characterStyles[charName] || characterStyles[""];
    const mainColor = style.color || '#C0C0C0';

    // 明るい背景色を生成（明度補正）
    function brightenColor(hex, percent = 60) {
      const num = parseInt(hex.replace('#', ''), 16);
      const r = Math.min(255, (num >> 16) + percent);
      const g = Math.min(255, ((num >> 8) & 0x00FF) + percent);
      const b = Math.min(255, (num & 0x0000FF) + percent);
      return `rgb(${r},${g},${b})`;
    }

    const bgColor = brightenColor(mainColor, 80);

    // DOM生成
    const note = document.createElement('div');
    note.className = 'random-text-note';
    note.style.setProperty('--char-color', mainColor);
    note.style.backgroundColor = bgColor;

    // 上段：キャラ名（キャラカラー）、下段：黒
    const topLine = document.createElement('div');
    topLine.textContent = charName;
    topLine.style.color = mainColor;
    topLine.style.fontWeight = 'bold';

    const bottomLine = document.createElement('div');
    bottomLine.textContent = message;
    bottomLine.style.color = '#000';

    note.appendChild(topLine);
    note.appendChild(bottomLine);

    // 配置：画面下の中央に
    note.style.left = '50%';
    note.style.transform = 'translateX(-50%)';
    note.style.bottom = '0.5vh';

    layer.appendChild(note);
  } catch (e) {
    console.error('ランダムテキストJSONの読み込みに失敗しました', e);
  }
}

// テキスト非表示
function randomTextsOff() {
  const layer = document.getElementById('random-text-layer');
  if (layer) {
    layer.innerHTML = '';
    layer.classList.add('hidden');
  }
}
