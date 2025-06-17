✅ ディレクトリ構成
csharp
コピーする
編集する
project-root/
├ assets2/                   # 画像・音声などのアセット
│   ├ bgev/                  # 背景画像（例: bg011.jpg）
│   ├ char/                  # キャラ画像（例: a03002.png）
│   └ bgm/                   # BGMファイル（例: main.mp3）
└ v013/
    ├ index.html             # エントリーポイント
    ├ style.css              # スタイル定義（レイアウト、アニメーション含む）
    ├ script.js              # メイン処理（シナリオ再生・分岐・表示制御）
    ├ config.js              # アセット/シナリオパス設定
    ├ characterColors.js     # キャラごとの名前色
    ├ characterStyles.js     # キャラごとのフォントサイズ/速度
    └ scenario/
        ├ 000start.json      # シナリオ本編開始
        ├ choiceA.json       # 分岐A
        ├ choiceB.json       # 分岐B
        ├ end1.json          # 終端1
        ├ end2.json          # 終端2
        ├ end3.json          # 終端3
        └ end4.json          # 終端4
✅ HTMLレイアウト（index.html）
セーフエリア対応、縦横レスポンシブ

DOM構造：

#background：背景

#character-layer：キャラ表示用

#dialogue-box：セリフ＋名前表示エリア

#choices：選択肢ボタン

各DOMにIDを割り当てて JavaScript で制御

✅ CSS（style.css）
フルスクリーン対応

キャラサイズと位置はv012と同様

#character-layer img に対してエフェクトアニメーション用のクラスを追加

エフェクト定義：

css
コピーする
編集する
.fadein {
  animation: fadein 0.5s ease-in;
}
.slideinLeft {
  animation: slideinLeft 0.5s ease-out;
}
@keyframes fadein {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes slideinLeft {
  from { transform: translateX(-100%); opacity: 0; }
  to   { transform: translateX(0); opacity: 1; }
}
✅ config.js
js
コピーする
編集する
const config = {
  bgPath: "../assets2/bgev/",
  charPath: "../assets2/char/",
  bgmPath: "../assets2/bgm/",
  scenarioPath: "./scenario/"
};
✅ characterColors.js
js
コピーする
編集する
const characterColors = {
  "": "#C0C0C0",
  "緋奈": "#d3381c",
  "藍": "#0067C0",
  "翠": "#005931",
  "こがね": "#FFF450",
  "琥珀": "#F68B1F",
};
✅ characterStyles.js
js
コピーする
編集する
const characterStyles = {
  "":        { fontSize: "1em", speed: 40 },   // デフォルト
  "緋奈":    { fontSize: "1.2em", speed: 30 },
  "藍":      { fontSize: "1.1em", speed: 50 },
  "翠":      { fontSize: "1em",   speed: 35 },
  "こがね":  { fontSize: "1.3em", speed: 25 },
  "琥珀":    { fontSize: "1.2em", speed: 20 },
};
キャラごとに表示速度とフォントサイズを定義

セリフ中に "fontSize" や "speed" を一時的に上書き可能

✅ script.js の主な機能
シナリオJSONの読み込みと順次再生

キャラ画像の表示・退場（null指定で退場）

背景画像の切り替え

名前色／フォントサイズの反映

オートモード対応（セリフ自動送り）

選択肢表示と分岐処理（2x2対応）

BGM再生

画像エフェクト対応：キャラ画像の表示時に "effect" 指定可

エフェクト指定例（シナリオJSON内）：
json
コピーする
編集する
{
  "char": { "center": "a04002.png" },
  "effect": { "center": "fadein" },
  "name": "こがね",
  "text": "あたしの出番～？"
}
✅ シナリオ仕様（JSON形式）
各エントリには以下を指定可能：

キー	内容
bg	背景画像ファイル名（例：bg011.jpg）
bgm	BGMファイル名（例：main.mp3）
char	キャラ画像（left/center/right に指定）
effect	各キャラ位置に "fadein" などの効果
name	キャラ名（空文字でモブ）
text	セリフ本文
speed	1文字ごとの表示速度（ミリ秒）
fontSize	セリフのフォントサイズ（例："1.2em"）
choices	選択肢（表示テキストとジャンプ先ファイル名）
jumpTo	次にジャンプするファイル名（選択肢のあとなど）

✅ 仕様上の補足
"char": { "center": null } でその位置のキャラ退場

"name": "" のときはナレーションやモブ扱い（灰色表示）

"jumpTo" はファイル名を指定（例："choiceA.json"）

"choices" は最大4つまで表示可能（左右2x2レイアウト）

シナリオ切り替え時に "物語は続く" 表示は v013では廃止

✅ 未対応・今後の保留仕様
end1～end4に到達したときだけ別の終了演出 → 実装保留中

音声再生（SEやボイス）→ 現時点では未対応

