# バーチャルアシスタントプロジェクト

## 概要
このプロジェクトは、ハンドトラッキングと音声合成を組み合わせたインタラクティブなバーチャルアシスタントを実装したものです。

## 主要コンポーネント

### 1. メインアプリケーション (main.js)
- `init()`: アプリケーションの初期化を行い、必要なコンポーネントを設定します
- `setupWebcam()`: ウェブカメラの設定と初期化を行います
- `animate()`: メインのアニメーションループを制御します
- `updateScene()`: シーンの更新とレンダリングを管理します

### 2. キャラクターレンダラー (characterRenderer.js)
- `CharacterRenderer`: 3Dキャラクターの表示と制御を担当するクラス
  - `init()`: Three.jsのシーン設定とキャラクターのロードを行います
  - `loadCharacter()`: VRMモデルをロードします
  - `updateCharacter()`: キャラクターのアニメーションを更新します
  - `setEmotion()`: キャラクターの表情を設定します
  - `lookAt()`: キャラクターの視線を制御します

### 3. ハンドトラッカー (handTracker.js)
- `HandTracker`: MediaPipeを使用してハンドトラッキングを実装するクラス
  - `init()`: ハンドトラッキングの初期化を行います
  - `processFrame()`: フレームごとの手の検出を行います
  - `getHandPosition()`: 検出された手の位置を返します

### 4. チャットマネージャー (chatManager.js)
- `ChatManager`: AIとのチャット機能を管理するクラス
  - `init()`: チャット機能の初期化を行います
  - `sendMessage()`: メッセージを送信し、応答を処理します
  - `processResponse()`: AIからの応答を処理します

### 5. 音声合成 (speechSynthesizer.js)
- `SpeechSynthesizer`: Web Speech APIを使用した音声合成を制御するクラス
  - `speak()`: テキストを音声に変換して再生します
  - `setVoice()`: 音声の設定を変更します
  - `stop()`: 音声再生を停止します

## 技術スタック
- Three.js: 3Dグラフィックスレンダリング
- MediaPipe: ハンドトラッキング
- Web Speech API: 音声合成
- VRM: 3Dアバターフォーマット

## 使用方法
1. Webカメラを有効にします
2. ブラウザでindex.htmlを開きます
3. 手の動きでキャラクターとインタラクションができます
4. テキスト入力または音声でキャラクターと会話できます

## 注意事項
- 最新のブラウザ（Chrome推奨）で実行してください
- WebGLとWebカメラの使用許可が必要です
- 十分なCPU/GPUリソースが必要です 