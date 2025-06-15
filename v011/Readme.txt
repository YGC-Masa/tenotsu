🧩 システム仕様（v011-01まで）
1. ファイル構成
pgsql
コピーする
編集する
project-root/
├ characterColors.js
├ assets2/                      ← すべてのアセットはこの中に格納
│   ├ bgev/bg011.jpg           ← 背景画像
│   ├ char/a03002.png など     ← キャラクター画像
│   └ bgm/main.mp3             ← BGM
└ v011/
    ├ index.html               ← ゲームのエントリーポイント
    ├ style.css                ← 全体スタイル
    ├ script.js                ← メインスクリプト
    └ scenario/
        └ 000start.json        ← シナリオデータ
2. シナリオファイル仕様（JSON）
fontSize: 全体の文字サイズ（例: "1.1em"）

speed: 文字表示速度（msごとの1文字あたり表示）

scenes: シーンの配列で物語を記述

bg: 背景画像

bgm: BGMファイル

name: セリフの発話者名

text: セリフテキスト（空文字で停止）

characters: 表示キャラ。sideとsrcで構成

choices: 分岐選択肢。label と jump または jumpToScenario 指定

👤 キャラクター仕様
キャラ表示：
characters は最大3人（left, center, right）まで配置可能

キャラ画像の src に "../assets2/char/xxx.png" を指定

"src": null で該当位置のキャラを退場

キャラ名は "name" フィールドに表示され、characterColors.js で色指定可能

characterColors.js（例）：
js
コピーする
編集する
export const characterColors = {
  "": "#C0C0C0",
  "緋奈": "#d3381c",
  "藍": "#0067C0",
  "翠": "#005931",
  "こがね": "#FFF450",
  "琥珀": "#F68B1F",
  "あかり": "#e91e63",
  "ゆうと": "#2196f3"
};
🎨 画面・レイアウト仕様
画面ベース
基準解像度：1920×1080 横画面

短辺基準のスケーリング対応（スマホ縦長画面などに対応）

セーフエリア（Safe Area）対応でスマホでも見切れない

スタイル詳細
キャラ画像 .char-image に max-width: 90% を指定 → モバイルでの見切れ防止

モバイル横画面時：

キャラ画像：80vh

テキストボックス：35vh

PCでは横幅や比率ベースで適切に表示（メディアクエリ適用済）

📚 演出・効果仕様
effect パラメータ（v010より統合済）
すべてのシーン要素（背景、キャラ）に effect 指定可

以下の効果が使用可能：

効果名	内容
dissolve	デフォルト・フェード
fade-in	フェードイン
fade-out	フェードアウト
slide-left-in	左からスライドイン
slide-right-in	右からスライドイン
slide-left-out	左へスライドアウト
slide-right-out	右へスライドアウト
black-in/out	黒フェード
white-in/out	白フェード

※ "effect" が未指定の場合は "dissolve" が自動適用

🔀 シナリオ分岐仕様
choices によって任意の jump 番号へ分岐

2×2の4分岐構造なども実装可能（例：選択肢→選択肢→4エンド）

エンド後に text: "" の空シーンを入れることで 停止を実現

別のファイルにジャンプする場合は "jumpToScenario": "xxx.json" を使用可能（v008〜）

✅ v011-01で登場済みキャラクター
名前	画像ファイル名	性格・特徴
翠	a03002.png	まじめで敬語のキャリアウーマン
こがね	a04002.png	フランクで人懐っこいギャル
琥珀	a05002.png	元気いっぱいアスリート
