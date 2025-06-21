1. 📁 ファイル構成
arduino
コピーする
編集する
project-root/
├── assets2/
│   ├── bgev/         ← 背景画像（config.bgPath）
│   ├── bgm/          ← BGM（config.bgmPath）
│   ├── char/         ← キャラクター画像（config.charPath）
│   ├── se/           ← 効果音（config.sePath）
│   └── voice/        ← ボイス（config.voicePath）
└── v017/
    ├── index.html
    ├── style.css
    ├── script.js
    ├── config.js
    ├── characterColors.js
    ├── characterStyles.js
    ├── effect.js
    └── scenario/
        ├── 000start.json
        ├── branchA.json
        └── branchB.json
2. 💬 シナリオ記述仕様（JSON）
json
コピーする
編集する
{
  "bg": "bg001.jpg",             // 背景画像（任意）
  "bgEffect": "fadein",          // 背景の表示エフェクト（任意）
  "characters": [                // 表示するキャラ（任意）
    { "side": "left", "src": "a01002.png", "effect": "slideleft" }
  ],
  "name": "緋奈",                // 表示名（省略可）
  "text": "こんにちは！",        // セリフ（省略不可）
  "se": "ding.mp3",              // 効果音（任意）
  "voice": "hina_001.mp3",       // ボイス（任意）
  "choices": [                   // 分岐（任意）
    { "text": "選択A", "jump": "branchA.json" },
    { "text": "選択B", "jump": "branchB.json" }
  ],
  "jump": "xxx.json"            // 遷移用（通常シーンでも使用可）
}
3. 🎭 キャラクター仕様
名前	ファイル	特徴	カラーコード
緋奈	a01002.png	明るく楽しい・食べるの大好き	#d3381c
藍	a02002.png	おとなしく控えめ	#0067C0
翠	a03002.png	まじめ・敬語・仕事熱心	#005931
こがね	a04002.png	フランク・ややギャル	#FFF450
琥珀	a05002.png	元気・スポーツ系	#F68B1F

4. 📱 レイアウト仕様
 仕様表（最新版）
画面種別	スロット幅	左右余白	キャラ重なり	備考
📱 モバイル縦	50%	5%	OK	中央キャラ最前面
📱 モバイル横	33.33%	0%	✕	セーフエリアを3分割で均等に表示
💻 PC	33.33%	0%	✕	画面を3分割で均等にキャラ表示
💬 選択肢	---	---	---	画面の 縦60%位置 に表示
キャラ画像と画面ボトムを合わせる

5. ✨ エフェクト仕様（effect.js）
fadein / fadeout

slideleft / slideright

whitein / blackin / whiteout / blackout

transition（デフォルト）

シーン内で bgEffect / effect を指定可能。未指定時は fadein

6. 🔀 分岐・ジャンプ仕様
choices: 複数選択肢ボタン表示し、jump 先のJSONを読み込む

jump: 通常シーン内でも使用可能（選択肢以外でも）

ジャンプ時に前のテキストバッファ混在を防ぐ対策済（textEl.innerHTML 初期化）

7. 🔊 サウンド仕様
bgm：ループ再生。シーンごとに切替可能

se：効果音。毎シーンで一度だけ再生

voice：ボイス音声。セリフと同期再生

ファイルが存在しない場合はエラー出力（進行は継続）

8. 🔄 オートモード・スキップ
背景画像ダブルクリックで ON/OFF 切り替え

autoWait：デフォルト2000ms。次のシーンへ自動遷移

スキップボタンは設置していない（将来的拡張可）

9. 🚧 既知の課題・仕様制限
一部環境でボイス音声が読み込みに失敗すると停止（要catch処理）

選択肢直後のセリフバッファが混在する場合がある（v017後半で軽減済）

効果音やボイスファイルのロードが重複する際の競合検討中

✅ 今後の展開
次バージョンは v018 として別スレッドにて以下の機能強化を検討：

🗣 ボイスのプリロードと非同期再生最適化

🧠 条件分岐とフラグ変数によるシナリオ拡張

✍️ storyeditor の拡張（バリデーション付き入力補助など）

🧪 ユーザーデバッグモード（音声・演出確認）

必要であれば、上記 README 全文を README.md としても出力できます。
以降の作業は v018 スレッド にて開始しましょう。準備ができたらお知らせください。
