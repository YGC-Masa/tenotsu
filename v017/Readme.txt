1. 📁 ファイル構成

project-root/
├── assets2/
│   ├── bgev/         ← 背景画像（bgPath）
│   ├── bgm/          ← BGM（bgmPath）
│   ├── char/         ← キャラクター画像（charPath）
│   ├── se/           ← 効果音ファイル（sePath）
│   │   └── ding.mp3
│   └── voice/        ← ボイスファイル（voicePath）
│       ├── hina_001.mp3
│       └── ai_001.mp3
└── v016/
    ├── index.html                   ← HTML本体
    ├── style.css                    ← レイアウトと演出用スタイル
    ├── script.js                    ← メインシナリオエンジン
    ├── config.js                    ← パス設定などの基本設定
    ├── characterColors.js           ← キャラクターごとの色指定
    ├── characterStyles.js           ← 表示スピード・フォント指定
    ├── effect.js                    ← 演出効果定義集
    ├── scenario/
    　   ├── 000start.json            ← 初期シナリオ
    　   └── [その他の分岐シナリオ]



2. 📜 シナリオファイル仕様（JSON）
json
コピーする
編集する
{
  "scenes": [
    {
      "bg": "bg001.jpg",                 // 背景画像（省略可）
      "bgEffect": "fadein",              // 背景エフェクト（省略時 fadein）
      "characters": [
        { "side": "left", "src": "a01002.png", "effect": "slideleft" },
        { "side": "center", "src": "a03002.png" },
        { "side": "right", "src": "a05002.png", "effect": "fadein" }
      ],
      "bgm": "main.mp3",                 // BGM再生（"null"で停止）
      "name": "緋奈",                    // 発言者名（省略可）
      "text": "こんにちは、みんな！",     // 発言テキスト（必須）
      "choices": [
        { "text": "Aルートへ", "jump": "branchA.json" },
        { "text": "Bルートへ", "jump": "branchB.json" }
      ]
    }
  ]
}
"src": "NULL" → キャラ退場

"characters" 省略 → 表示変更なし

"bg" 省略 → 背景変更なし

"text" のみ → 前キャラのセリフ継続


3. 👤 キャラクター仕様
名前	ファイル名	性格・特徴	色コード	スタイル
緋奈	a01002.png	明るく楽しい／食べ物好き	#d3381c	fontSize: 1.2em, speed: 30
藍	a02002.png	おとなしく控えめ	#0067C0	fontSize: 1em, speed: 50
翠	a03002.png	まじめ／敬語	#005931	fontSize: 1.1em, speed: 40
こがね	a04002.png	ギャル／けだるい感じ	#FFF450	fontSize: 1.3em, speed: 25
琥珀	a05002.png	元気／スポーツ少女	#F68B1F	fontSize: 1.1em, speed: 35


4. 🖼 画面・レイアウト仕様
キャラ表示領域：左・中央・右の3スロット（char-left / char-center / char-right）

char-center は HTML構造上最後に記述 → 自動的に最前面に

ダイアログ領域：名前＋テキスト表示（#name, #text）

選択肢ボタン：#choices

レスポンシブ対応：縦画面ではキャラサイズ縮小

--fontSize でセリフごとに文字サイズ調整


5. 🎬 演出・効果仕様（effect.js）
js
コピーする
編集する
fadein / fadeout           // フェード表示・消去
whitein / whiteout         // 白画面→透明 or 透明→白画面
blackin / blackout         // 黒画面→透明 or 透明→黒画面
slideleft / slideright     // 左右からスライドイン
scene.bgEffect に指定、またはキャラの effect に指定

シナリオで未指定時、背景は fadein がデフォルト


6. 🔀 シナリオ分岐仕様
choices 配列を使って複数のボタンを表示

text: ボタンに表示する文字列

jump: 分岐先の .json ファイル名

選択後、currentScenario として読み込まれ冒頭から開始


7. ⚙ その他の仕様・機能
オートモード：背景画像ダブルクリックでON/OFF

自動進行待機時間：autoWait（ms）で調整可能（デフォルト: 2000）

背景画像は完全読み込み後に表示切替＆演出開始

セリフ表示中はクリック無効化／完了後のみ次へ

"NULL"指定でキャラを明示的に退場させる

"name"と"text"のどちらかが未定義でもエラーにならずスキップ


v016 として確定された内容
主な機能拡張は音関係

1. ファイル構成の拡張
script.js:

choice において se（効果音）、voice（ボイス）、jump（シナリオ分岐）を柔軟に処理可能に。

config.js:

sePath, voicePath の追加確認。

各種HTML構成：背景ダブルクリックによるオートモード切替、スマホ表示対応済み。

2. 機能
キャラ画像の最前面調整（center → 最下部記述で Z順対応）

オートモード待機時間制御（autoWait 変数）

SE／ボイス／BGMの同時再生対応（Audioインスタンス分離）

キャラクター表示の "NULL" 指定による明示的な退場

choice 選択肢での 複合動作（音声・分岐） 対応

3. シナリオ仕様
bg, bgEffect, characters, name, text, se, voice, bgm, choices などに対応

シーン省略時のスキップ保護実装済み

旧バージョンからの不具合（テキストバッファ混在、音声多重化など）解消済み