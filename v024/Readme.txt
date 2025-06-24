📘 README（v022仕様概要）
■ バージョン
v022

■ 目的
Webベースのビジュアルノベルゲームエンジン。
スマートフォン・PC両対応、軽量かつ拡張性のある設計。

📁 ディレクトリ構成
arduino
コピーする
編集する
project-root/
├── assets2/
│   ├── bgev/         ← 背景画像（config.bgPath）
│   ├── bgm/          ← BGM音源（config.bgmPath）
│   ├── char/         ← キャラクター立ち絵画像（config.charPath）
│   ├── se/           ← 効果音ファイル（config.sePath）
│   └── voice/        ← ボイス音声ファイル（config.voicePath）
└── v022/
    ├── index.html                ← メインHTML
    ├── style.css                 ← レスポンシブCSS・画面レイアウト定義
    ├── script.js                 ← メインロジック（シナリオ再生・入力管理）
    ├── effect.js                 ← 効果演出処理（完全同期対応）
    ├── config.js                 ← パス定義などの基本設定
    ├── characterColors.js        ← キャラクターごとの発言色
    ├── characterStyles.js        ← キャラクターごとの表示スタイル（fontSize, speed）
    └── scenario/
        ├── 000start.json         ← 起動シナリオ
        └── その他分岐シナリオ
🛠 システム仕様
📌 レスポンシブレイアウトポリシー
画面種別	スロット幅	左右余白	キャラ重なり	備考
📱 モバイル縦	50%	0%	OK	中央キャラ最前面
📱 モバイル横	33.3%	0%	なし	セーフエリア3分割均等配置
💻 PC（デスクトップ）	33.3%	5%	なし	均等3分割、中央キャラ最前面

選択肢表示位置：画面縦方向の60%位置に表示

キャラ下端：画面ボトムに揃える（bottom: -3% 調整済み）

🎨 シナリオファイル仕様（JSON形式）
json
コピーする
編集する
{
  "scenes": [
    {
      "bg": "bg001.png",
      "bgEffect": "fadein",
      "characters": [
        { "side": "center", "src": "a01002.png", "effect": "fadein" }
      ],
      "name": "緋奈",
      "text": "こんにちは！元気に行こう！",
      "voice": "hina_001.mp3",
      "se": "ding.mp3",
      "fontsize": "1.2em",
      "speed": 30,
      "choices": [
        { "text": "はい！", "jump": "branchA.json" },
        { "text": "やだ", "jump": "branchB.json" },
        { "text": "サイトへ", "url": "https://example.com" },
        { "text": "最初に戻る", "jump": "000start.json" }
      ]
    }
  ]
}
📝 各項目の説明
キー名	内容
bg	背景画像ファイル名（assets2/bgev/以下）
bgEffect	背景切替時の演出（例: fadein, blackin）
characters	キャラ画像表示設定。side（left/center/right）・src・effect
name	発言者名（未指定時は無記名表示）
text	表示テキスト（タイプ表示）
voice	ボイス音声ファイル名（assets2/voice/以下）
se	効果音ファイル名（assets2/se/以下）
fontsize	テキスト表示のフォントサイズ（例: "1.2em"）
speed	テキストの表示スピード（ms単位、1文字あたり）
choices	分岐選択肢（textと jump または url）

🔄 処理の優先ポリシー
fontsize / speed はシナリオ内で明示指定されていれば、characterStyles.js より優先される

キャラ画像はシーン間で明示的に "src": "NULL" 指定がない限り維持される

選択肢選択後はキャラスロットとテキストバッファを自動でクリア

効果演出（effect.js）は完全同期対応済み（背景切替後に進行）

🔊 サウンド仕様
bgm（ループ）：ループ再生、シナリオごとに上書き可

voice：セリフごとの音声。前再生が終了しなくても次に進む

se：効果音（同様に非同期で再生）

再生失敗時はコンソールに警告ログを出力し、ゲーム進行は継続

👥 キャラクター設定
名前	ファイル名	性格・特徴	カラーコード
緋奈	a01002.png	明るく楽しい・食べるの大好き	#d3381c
藍	a02002.png	おとなしく控えめ・暗くはない	#0067C0
翠	a03002.png	まじめ・敬語・キャリアウーマン	#005931
こがね	a04002.png	フランク・ややけだるそう・ギャル	#FFF450
琥珀	a05002.png	元気いっぱい・アスリート	#F68B1F
（名無し）	なし	名前が指定されていないとき	#C0C0C0

※ キャラカラーは characterColors.js にて定義

📁 アセットファイル構成と内容
cpp
コピーする
編集する
assets2/
├── bgev/             ← 背景・イベント画像
│   ├── bg001.png     ← 事務所
│   ├── bg010.jpg     ← オフィス夕方
│   ├── bg011.jpg     ← オフィス昼間
│   ├── bg012.jpg     ← オフィス夜
│   ├── bg020.jpg     ← 自宅昼
│   ├── bg021.jpg     ← 自宅夕方
│   ├── bg022.jpg     ← 自宅夜
│   ├── bg_field.jpg  ← 公園
│   └── … 他背景多数
│
├── char/             ← キャラクター画像
│   ├── a01002.png    ← 緋奈
│   ├── a02002.png    ← 藍
│   ├── a03002.png    ← 翠
│   ├── a04002.png    ← こがね
│   ├── a05002.png    ← 琥珀
│   └── … 必要に応じ追加
│
├── bgm/              ← BGMファイル（ループ再生）
│   └── main.mp3
│
├── se/               ← 効果音（SE）
│   └── ding.mp3
│
└── voice/            ← セリフ用ボイス
    ├── hina_001.mp3
    ├── ai_001.mp3
    └── … キャラ別に追加
🔁 オートプレイ仕様
オン／オフ切替：背景画像ダブルクリック（<img id="background">）

状態：isAuto = true でオート再生

ウェイト時間：autoWait = 1750 ミリ秒（script.js 内で定義）

オート中挙動：

セリフ表示後に自動で次のシーンに進む

choices（選択肢）がある場合は待機し、自動進行停止

オート中でも音声・効果音は通常通り再生

📄 シナリオファイル（JSON）の要素タグ詳細
各 .json は次のような構成の scenes 配列で定義されます：

json
コピーする
編集する
{
  "scenes": [
    {
      "bg": "bg001.png",               ← 背景画像ファイル
      "bgEffect": "fadein",            ← 背景切替演出（省略可／既定は fadein）

      "characters": [                  ← 表示するキャラクター（省略時は変更なし）
        {
          "side": "left",              ← 表示位置（left / center / right）
          "src": "a01002.png",         ← 表示画像ファイル
          "effect": "fadein"           ← 表示時の演出（例: fadein, slideleft）
        },
        {
          "side": "right",
          "src": "a02002.png"
        }
      ],

      "name": "緋奈",                   ← 発言キャラ名（カラー設定に使用）
      "text": "こんにちは！",           ← セリフ

      "voice": "hina_001.mp3",         ← 音声ファイル（任意）
      "se": "ding.mp3",                ← 効果音ファイル（任意）

      "fontsize": "1.2em",             ← セリフのフォントサイズ（任意・上書き）
      "speed": 25,                     ← セリフのタイピングスピード（任意・上書き）

      "choices": [                     ← 選択肢がある場合
        { "text": "進む", "jump": "branchA.json" },
        { "text": "戻る", "jump": "000start.json" },
        { "text": "サイトへ", "url": "https://example.com" }
      ]
    }
  ]
}
🔸 各タグの解説
タグ名	必須	説明
bg	✕	背景画像を表示（省略時は前のまま）
bgEffect	✕	背景切替演出名（fadein / blackin など）
characters	✕	表示キャラ（side: left/center/right, src, effect）
name	✕	発言者の名前（色付きで表示）
text	✕	表示テキスト（speedに応じて表示）
voice	✕	セリフ音声ファイル（自動再生）
se	✕	効果音ファイル（自動再生）
fontsize	✕	テキストサイズ（例: "1.4em"）
speed	✕	テキストスピード（例: 30 → 30msごとに1文字）
choices	✕	選択肢。jump は別のJSONファイルへ遷移、url は外部リンクへ


