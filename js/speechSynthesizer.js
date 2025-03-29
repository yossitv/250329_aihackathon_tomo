// speechSynthesizer.js

/**
 * テキストを音声で読み上げる関数
 * @param {string} text - 読み上げるテキスト
 */
export function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ja-JP'; // 日本語の場合
  window.speechSynthesis.speak(utterance);
}

/**
 * 音声合成を停止する関数
 */
export function stopSpeaking() {
  window.speechSynthesis.cancel();
}

/**
 * 音声合成が利用可能かチェックする関数
 * @returns {boolean} - 音声合成が利用可能かどうか
 */
export function isSpeechSynthesisAvailable() {
  return 'speechSynthesis' in window;
}
