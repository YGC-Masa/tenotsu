    # ノベルゲーム v022-02

モバイル・PC対応のHTML5ベースノベルゲームエンジンです。  
JavaScriptによる完全同期演出、BGM/SE/ボイス再生、オートプレイ、選択肢分岐などに対応。  
特にモバイル縦画面では「最後に登場したキャラクターのみを全画面表示」する演出を実装済み。

---

## 📁 ディレクトリ構成
project-root/
├── assets2/
│ ├── bgev/ # 背景画像
│ ├── cg/ # キャラクター画像
│ ├── ev/ # キャラクターイベント画像
│ ├── char/ # キャラクター画像
│ ├── bgm/ # BGM音源
│ ├── se/ # 効果音
│ └── voice/ # ボイス
└── v033/
      ├── index.html # UIレイアウト
      ├── style.css # レスポンシブ＆キャラ演出スタイル
      ├── script.js # セリフ制御＆演出同期処理
      ├── config.js # アセットパス設定
      ├── chardispsetting.css # キャラクター表示のcss
      ├── characterStyles.js # キャラクターごとの表示スタイル（fontSize, speed,color）
      ├── randomShows.js # 画像・テキストのランダム表示用のスクリプト
      ├── utils.js # 表示関連スクリプト
      ├── menulist.js # メニュー・リスト表示スクリプト
      ├── effect.js # 背景＆キャラ表示演出
      ├── ramdom/ # ランダム用listファイル
      │     ├── imageset01.json #　画像リスト
      │     └── *.json # 各ファイル
      ├── listmenu/ # list・menu設定ファイル
      │     ├──menu01.json # 最初のmenu項目
      │     ├──list01.json # 最初のlist項目      
      │     └── *.json # 各ファイル
      └── scenario/
            ├── 000start.json # 最初のシナリオ
            └── *.json # 各シナリオファイル（選択肢分岐対応）

---

✅ 現在のディレクトリ構成チェック
pgsql
コピーする
編集する
project-root/
├── assets2/
│   ├── bgev/          ✅ 背景画像 → config.bgPath
│   ├── cg/            ✅ CG画像 → config.cgPath
│   ├── ev/            ✅ EV画像 → config.evPath
│   ├── char/          ✅ キャラクター画像 → config.charPath
│   ├── bgm/           ✅ BGM → config.bgmPath
│   ├── se/            ✅ 効果音 → config.sePath
│   └── voice/         ✅ ボイス → config.voicePath
├── v033/
│   ├── index.html     ✅ UI定義（すべてのJS/CSSを読み込み）
│   ├── style.css      ✅ 汎用レイアウト・ボタン・レイヤー構成
│   ├── chardispsetting.css ✅ キャラサイズ・レスポンシブ表示
│   ├── script.js      ✅ 本体処理：シナリオ読み込み、セリフ表示など
│   ├── config.js      ✅ アセットパス定義（上記 assets2 内にマッピング）
│   ├── characterStyles.js ✅ フォントサイズ、速度、色の定義（color統合済み）
│   ├── utils.js       ✅ setTextWithSpeed(), clearCharacters() など表示ユーティリティ
│   ├── menulist.js    ✅ メニュー表示制御、list/menuパネルUI
│   ├── effect.js      ✅ フェード/ホワイトインなどの演出処理
│   ├── randomShows.js ✅ ランダム画像表示（imageset対応・重複排除）
│   ├── ramdom/
│   │   └── imageset01.json ✅ 画像表示用の固定＋ランダム画像リスト（randomImages.jsが利用）
│   ├── listmenu/
│   │   ├── menu01.json ✅ メニュー表示用リスト
│   │   └── list01.json ✅ 選択肢リスト（右パネル）
│   └── scenario/
│       ├── 000start.json ✅ 初期シナリオ（JSON配列、"scenes"なし）
│       └── *.json ✅ 分岐シナリオ
✅ 機能連携チェック
ファイル	正しく動作するための条件	現状の確認
config.js	全ファイルに読み込まれ、config.bgPath 等で参照	✅ 問題なし（../assets2/...）
characterStyles.js	fontSize, speed, color を提供	✅ 色統合済みで反映済み
randomShows.js	imageset01.json 読み込み、セーフエリア3×2表示	✅ 機能正常（ただし重いときは制限OK）
menuList.js	menuPath, listPath からファイルを読み込む	✅ config.menuPath, config.listPath で読込対応済み
script.js	000start.jsonを初期に読み込み表示	✅ ただし loadScenarioFromFile("000start.json") が明示必要
effect.js	"effect": "whitein"などが使える	✅ エフェクト名と関数対応済み
click-layer	シーン切り替え or メニュー呼出（ダブルタップ）	✅ script.jsでイベント登録済み





## 🔧 機能仕様

### ✅ 対応機能
- モバイル／PC 両対応（縦・横でレイアウト最適化）
- 背景・キャラクター表示切替（同期型演出）
- BGM / SE / ボイス再生（初回クリックで許可）
- オートプレイ（ダブルタップでON/OFF）
- 選択肢によるジャンプ分岐
- キャラクターごとのセリフ速度・フォントサイズ指定
- シナリオファイル上で `fontSize`, `speed` を個別指定可能（優先される）






---

## 📱 モバイル縦表示専用仕様

- 最後に表示されたキャラクターのみ `.active` を付与し、画面中央に表示
- `style.css` により、その他のキャラを非表示に
- キャラクター画像は画面下端に揃い、大きく表示

---

## 📜 シナリオファイル構成（例：000start.json）

```json
{
  "scenes": [
    {
      "bg": "bg001.png",
      "bgEffect": "fadein",
      "bgm": "main.mp3",
      "characters": [
        { "side": "left", "src": "a01002.png", "effect": "fadein" }
      ],
      "name": "緋奈",
      "text": "お腹すいた〜！",
      "voice": "h01.mp3",
      "fontSize": "1.4em",         // ← 明示的指定があると最優先
      "speed": 30                  // ← 明示的指定があると最優先
    },
    {
      "choices": [
        { "text": "パンケーキを食べる", "jump": "branchA.json" },
        { "text": "ラーメンを食べる", "jump": "branchB.json" }
      ]
    }
  ]
}
 アセット一覧
キャラクター
名前	ファイル名	特徴	色コード
緋奈	a01002.png	明るく楽しい、食いしん坊	#d3381c
藍	a02002.png	控えめでおとなしい	#0279e0
翠	a03002.png	真面目で敬語キャラ	#02b308
こがね	a04002.png	ギャル風、フランク	#FFF450
琥珀	a05002.png	元気なアスリート	#F68B1F

背景画像例
bg001.png：事務所

bg011.jpg：オフィス（昼）

bg020.jpg：自宅（昼）

🎵 音声仕様
音声（BGM/SE/ボイス）は Audio オブジェクトで再生

初回クリックにより音声再生の許可を取得（iOS対応）

🚀 オートプレイ仕様
ダブルタップで isAuto モード切替

セリフ送りは 2000ms 後に自動遷移

script.js にて管理

💡 注意点
音声再生はブラウザ仕様により ユーザーの操作が必要（クリックで初回解除済み）

モバイル縦のキャラ拡大演出は、最後に指定されたキャラのみ有効（他は非表示）

分岐後の scene.characters を正しく上書きしないと表示不整合が出るので注意

🔄 バージョン
v021-last：PCとモバイル対応、同期型演出

v022-01：モバイル縦1キャラ表示、レスポンシブ、初回音声解除対応

v022-02：縦→横→縦切替時の表示保持バグ修正、制御改善

📌 今後の改善アイデア
音声再生を完全に切り替える「サイレントモード」

キャラごとのアニメーション（CSS追加）

シナリオ用エディタの実装（JSON補助）
