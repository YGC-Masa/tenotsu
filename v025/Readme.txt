主な仕様内容（v025）
キャラ表示制御：

モバイル縦表示：lastActiveSide のみ .active 表示、それ以外非表示

モバイル横表示／PC：キャラスロットに子要素がある場合は全て表示

音声ミュート機能：

起動時は isMuted = true（初期ミュート状態）

メニューから mute / unmute 切替可能（BGM/SE/ボイス全てに反映）

背景クリック / ダブルタップでメニュー表示

全画面クリックで次へ進行

リサイズ対応：縦横切替に応じたキャラ表示更新

メニューUIは5秒で自動非表示、または任意クリックで閉じる

この状態を基準に、次の改修や調整を進めていきます。何か変更・追加があればいつでもどうぞ。







あなた:
ココからv025-01とします


ChatGPT:
保存されたメモリを更新しました
了解しました。ここからこの状態を v025-01 として記録し、今後の開発ベースとします。以降、v025-01 に関する修正・追加・確認はこの仕様を前提に対応しますので、安心してご指示ください。







あなた:
・具体的に


ChatGPT:
v025-01 の状態は以下の内容を明確に含んでいます：

✅ v025-01 の仕様要約
📁 基本構成
index.html: v024ベース、メニュー領域 (#menu-panel) を含む

style.css: レイアウト全体スタイル

chardispsetting.css: キャラスロット表示のレスポンシブ制御

script.js: メニュー機能＋音声ミュート制御＋キャラスロット制御付き

🔊 音声（Audio）制御仕様
✅ 起動時は すべての音声（BGM/SE/Voice）ミュート
js
コピーする
編集する
let isMuted = true; // ← 起動時はミュート状態
✅ script.js での各音声の再生時はこのフラグに従う：
BGM:

js
コピーする
編集する
bgm.muted = isMuted;
Voice:

js
コピーする
編集する
voice.muted = isMuted;
SE:

js
コピーする
編集する
se.muted = isMuted;
✅ メニュー項目によるON/OFF切替に対応：
json
コピーする
編集する
{
  "text": "音声ON",
  "action": "unmute"
},
{
  "text": "音声OFF",
  "action": "mute"
}
対応スクリプト（handleMenuAction）内での処理：

js
コピーする
編集する
if (item.action === "mute") {
  isMuted = true;
  ...
} else if (item.action === "unmute") {
  isMuted = false;
  ...
}
👥 キャラスロット制御仕様（モバイル対応）
✅ モバイル縦画面
.char-slot.active のみを表示

それ以外は .char-slot 非表示

✅ モバイル横 or PC
キャラスロットにキャラがいれば、全て .char-slot を display: flex にする

✅ 実装関数（updateCharacterDisplay()）：
js
コピーする
編集する
function updateCharacterDisplay() {
  const isPortrait = isMobilePortrait();
  for (const pos in charSlots) {
    const slot = charSlots[pos];
    const hasCharacter = slot.children.length > 0;

    if (isPortrait) {
      slot.classList.toggle("active", pos === lastActiveSide && hasCharacter);
    } else {
      if (hasCharacter) {
        slot.classList.add("active");
      } else {
        slot.classList.remove("active");
      }
    }
  }
}
window.resize イベントと showScene() の末尾で呼ばれ、画面状態に応じてキャラ表示更新

📋 その他仕様
メニューは背景ダブルタップ or ダブルクリックで表示

メニュー表示中に任意のクリックで自動非表示

シナリオ進行は画面全体クリックで可能（選択肢表示中は除外）

必要であれば、ファイル単位で再出力やテスト用シナリオの確認も可能です。何か他にチェック・実装したい仕様があればお知らせください。
