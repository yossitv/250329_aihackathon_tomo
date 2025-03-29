# 右手ミギーデモ（Right Hand "Miggy" Demo）

このプロジェクトは、MediaPipeとThree.jsを使用して、ユーザーの右手の動きを追跡し、「ミギー」のような3Dキャラクターとして表示するデモアプリケーションです。

## 機能

- **手の追跡**: MediaPipe Hands APIを使用して、ユーザーの右手の21個のランドマーク（特徴点）をリアルタイムで検出
- **3Dビジュアライゼーション**: Three.jsを使用して、手の動きに合わせた3Dオブジェクト（目と口）の表示
- **音声認識**: Web Speech APIを使用して、ユーザーの発言をテキストとして表示
- **音声レベル検出**: Web Audio APIを使用して、ユーザーの音声レベルに応じて口の大きさを変更

## 技術スタック

- **MediaPipe**: 手の検出と追跡
- **Three.js**: 3Dグラフィックスの描画
- **Web Speech API**: 音声認識
- **Web Audio API**: 音声レベルの検出

## ファイル構成

- `index.html`: メインのHTMLファイル
- `style.css`: スタイル定義
- `handDrawing.js`: MediaPipeとカメラ認識のコンポーネント

## 使用方法

1. このリポジトリをクローンまたはダウンロードします
2. ローカルのWebサーバーでホストするか、直接ブラウザで`index.html`を開きます
   - 注意: カメラとマイクへのアクセス許可が必要です
   - セキュリティ上の理由から、HTTPSまたはlocalhostでの実行を推奨します
3. ブラウザがカメラとマイクへのアクセス許可を求めるので、許可します
4. 右手を画面に向けると、手の動きに合わせて「ミギー」が動きます
5. 話すと、音声が認識されてテキストとして表示され、音量に応じて口の大きさが変わります

## 必要条件

- カメラとマイクを搭載したデバイス
- 最新のWebブラウザ（Google Chrome、Mozilla Firefox、Microsoft Edgeなど）
  - 注意: Safari では一部機能が制限される場合があります

## カスタマイズ

- `handDrawing.js`の設定オプションを変更することで、手の検出精度や感度を調整できます
- Three.jsのコードを修正することで、3Dオブジェクトの外観や動きをカスタマイズできます

## 参考資料

- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- [Three.js Documentation](https://threejs.org/docs/)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
