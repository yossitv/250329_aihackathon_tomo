// speechRecognizer.js

export class SpeechRecognizer {
  constructor(onTextCallback) {
    this.onTextCallback = onTextCallback;
    this.recognition = null;
  }

  start() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.onTextCallback('音声認識はこのブラウザでサポートされていません。');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'ja-JP';
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      let text = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        text += event.results[i][0].transcript;
      }
      this.onTextCallback(text);
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event);
    };

    this.recognition.start();
  }

  stop() {
    if (this.recognition) this.recognition.stop();
  }
}
