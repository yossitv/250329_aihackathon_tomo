// app.js
import { HandTracker } from './handTracker.js';
import { SpeechRecognizer } from './speechRecognizer.js';
import { ChatManager } from './chatManager.js';
import { CharacterRenderer } from './characterRenderer.js';
import { AudioProcessor } from './audioProcessor.js';
import { speakText, isSpeechSynthesisAvailable } from './speechSynthesizer.js';

// アプリケーションのメインクラス
class MigeeApp {
  constructor() {
    // DOM要素
    this.videoElement = document.getElementById('videoElement');
    this.errorMsg = document.getElementById('errorMsg');
    this.speechText = document.getElementById('speechText');
    this.micButton = document.getElementById('micButton');
    this.gestureIndicator = document.getElementById('gestureIndicator');
    this.apiKeyInput = document.getElementById('apiKeyInput');
    this.saveApiKey = document.getElementById('saveApiKey');
    
    // APIキーの管理
    this.apiKey = localStorage.getItem('openai_api_key') || '';
    this.apiKeyInput.value = this.apiKey;
    
    this.saveApiKey.addEventListener('click', () => {
      this.apiKey = this.apiKeyInput.value.trim();
      localStorage.setItem('openai_api_key', this.apiKey);
      alert('APIキーが保存されました');
      document.getElementById('configPanel').style.display = 'none';
      
      // チャットマネージャーにAPIキーを設定
      if (this.chatManager) {
        this.chatManager.setApiKey(this.apiKey);
      }
    });
    
    // 音声認識
    this.speechRecognizer = null;
    
    // マイクボタンの処理
    this.micButton.addEventListener('click', () => this.toggleSpeechRecognition());
    
    // 各コンポーネントの初期化
    this.initComponents();
    
    // カメラ開始
    this.startCamera();
  }
  
  initComponents() {
    // 3Dキャラクターレンダラー
    this.characterRenderer = new CharacterRenderer();
    
    // チャットマネージャー
    this.chatManager = new ChatManager();
    this.chatManager.setApiKey(this.apiKey);
    
    // 音声合成が利用可能かチェック
    if (!isSpeechSynthesisAvailable()) {
      console.warn('Speech synthesis is not available in this browser');
      this.errorMsg.textContent += ' 音声合成はこのブラウザでサポートされていません。';
    }
  }
  
  toggleSpeechRecognition() {
    if (!this.speechRecognizer) {
      this.speechRecognizer = new SpeechRecognizer(
        (text) => {
          this.speechText.textContent = text || '音声認識中...';
        }
      );
      
      // 音声認識の開始
      this.speechRecognizer.start();
      this.micButton.classList.add('listening');
    } else {
      // 音声認識の停止
      this.speechRecognizer.stop();
      this.speechRecognizer = null;
      this.micButton.classList.remove('listening');
      
      // 認識したテキストがあれば処理
      const recognizedText = this.speechText.textContent;
      if (recognizedText && recognizedText !== '音声認識中...') {
        this.chatManager.addMessage(recognizedText, 'user');
        this.chatManager.processUserInput(recognizedText);
      }
    }
  }
  
  async startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.videoElement.srcObject = stream;
      
      // ハンドトラッカーの初期化
      this.handTracker = new HandTracker(this.videoElement, (gesture) => {
        console.log('Detected gesture:', gesture);
        
        // チャットマネージャーにジェスチャーを設定
        this.chatManager.setGesture(gesture);
        
        // キャラクターの目の色を変更
        this.characterRenderer.setEyeColor(gesture);
        
        // ジェスチャー表示を更新
        const gestureNames = {
          'fist': '✊ 怒り',
          'palm': '✋ 通常',
          'thumbs_up': '👍 褒める',
          'index': '☝️ 丁寧',
          'middle_finger': '🖕 毒舌',
          'thumbs_down': '👎 見下す'
        };
        
        this.gestureIndicator.textContent = 'ジェスチャー: ' + (gestureNames[gesture] || '不明');
      });
      
      // ハンドトラッカーを開始
      this.handTracker.start();
      
      // オーディオプロセッサーの初期化
      this.audioProcessor = new AudioProcessor((level) => {
        this.characterRenderer.setAudioLevel(level);
      });
      
      // オーディオ処理を開始
      this.audioProcessor.setupAudioProcessing(stream);
      
      // 初期メッセージを表示
      this.chatManager.showWelcomeMessage();
      
    } catch (err) {
      console.error('Failed to acquire camera/audio feed:', err);
      this.errorMsg.textContent = 'カメラまたはマイクの使用が許可されていません。HTTPSでアクセスして、許可を確認してください。';
    }
  }
}

// DOMが読み込まれたらアプリケーションを初期化
document.addEventListener('DOMContentLoaded', () => {
  new MigeeApp();
});
