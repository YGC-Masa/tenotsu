import { config } from './config.js';
// 省略...

async function playScenario() {
  if (currentIndex >= scenario.length) {
    console.log('End of scenario');
    return;
  }

  isPlaying = true;
  const item = scenario[currentIndex];

  // 背景・キャラ・セリフ処理（省略）

  if (item.choices && item.choices.length > 0) {
    showChoices(item.choices);
  } else {
    // ✅ オートプレイ対応（クリック不要）
    const waitTime = config.autoPlay ? config.autoPlayInterval : (item.wait || 2000);
    await waitForUserInputOrTimeout(waitTime);
    currentIndex++;
    playScenario();
  }
}
