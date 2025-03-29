/**
 * handDrawing.js
 * MediaPipeとカメラ認識を使用して手の描画を行うコンポーネント
 */

class HandDrawing {
  constructor(options = {}) {
    this.options = {
      videoElement: null,
      errorMsgElement: null,
      onHandUpdate: null,
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
      cameraWidth: 640,
      cameraHeight: 480,
      ...options
    };

    this.videoElement = this.options.videoElement;
    this.errorMsgElement = this.options.errorMsgElement;
    this.onHandUpdate = this.options.onHandUpdate;
    this.hands = null;
    this.cameraUtils = null;
    this.stream = null;
    this.audioAnalyser = null;
    this.audioDataArray = null;
    this.audioLevel = 0;
    this.recognition = null;
  }

  /**
   * MediaPipe Handsの初期化
   */
  initMediaPipe() {
    this.hands = new Hands({ 
      locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` 
    });
    
    this.hands.setOptions({
      maxNumHands: this.options.maxNumHands,
      modelComplexity: this.options.modelComplexity,
      minDetectionConfidence: this.options.minDetectionConfidence,
      minTrackingConfidence: this.options.minTrackingConfidence,
    });

    this.hands.onResults(this._handleHandResults.bind(this));
  }

  /**
   * 手のランドマーク検出結果を処理するコールバック
   */
  _handleHandResults(results) {
    if (this.onHandUpdate && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      this.onHandUpdate(results.multiHandLandmarks[0]);
    }
  }

  /**
   * カメラの起動とMediaPipeの開始
   */
  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      this.videoElement.srcObject = this.stream;
      
      // 音声分析の初期化
      this._initAudioAnalysis();
      
      // 音声認識の初期化（オプション）
      if (this.options.speechTextElement) {
        this._initSpeechRecognition();
      }

      // MediaPipe Camera Utilsの初期化
      this.cameraUtils = new Camera(this.videoElement, {
        onFrame: async () => {
          await this.hands.send({ image: this.videoElement });
        },
        width: this.options.cameraWidth,
        height: this.options.cameraHeight,
      });
      
      this.cameraUtils.start();
      
      return true;
    } catch (err) {
      console.error('Failed to acquire camera/audio feed:', err);
      if (this.errorMsgElement) {
        this.errorMsgElement.textContent = 'カメラまたはマイクの使用が許可されていません。HTTPSでアクセスして、許可を確認してください。';
      }
      return false;
    }
  }

  /**
   * 音声分析の初期化
   */
  _initAudioAnalysis() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(this.stream);
    this.audioAnalyser = audioCtx.createAnalyser();
    source.connect(this.audioAnalyser);
    this.audioAnalyser.fftSize = 128;
    this.audioDataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);

    this._updateAudioLevel();
  }

  /**
   * 音声レベルの更新
   */
  _updateAudioLevel() {
    this.audioAnalyser.getByteFrequencyData(this.audioDataArray);
    const sum = this.audioDataArray.reduce((a, b) => a + b, 0);
    this.audioLevel = sum / this.audioDataArray.length / 128;
    requestAnimationFrame(this._updateAudioLevel.bind(this));
  }

  /**
   * 音声認識の初期化
   */
  _initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'ja-JP';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      
      this.recognition.onresult = (event) => {
        let text = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          text += event.results[i][0].transcript;
        }
        if (this.options.speechTextElement) {
          this.options.speechTextElement.textContent = text;
        }
        if (this.options.onSpeechResult) {
          this.options.onSpeechResult(text);
        }
      };
      
      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event);
      };
      
      this.recognition.start();
    } else if (this.options.speechTextElement) {
      this.options.speechTextElement.textContent = '音声認識はこのブラウザでサポートされていません。';
    }
  }

  /**
   * 現在の音声レベルを取得
   */
  getAudioLevel() {
    return this.audioLevel;
  }

  /**
   * リソースの解放
   */
  dispose() {
    if (this.cameraUtils) {
      this.cameraUtils.stop();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
