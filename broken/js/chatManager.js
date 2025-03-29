// chatManager.js
import { getLLMResponse } from './llmResponder.js';
import { speakText } from './speechSynthesizer.js';

export class ChatManager {
  constructor() {
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendButton');
    this.minimize = document.getElementById('minimize');
    this.chatContainer = document.getElementById('chatContainer');
    this.minimizedChat = document.getElementById('minimizedChat');
    
    this.currentGesture = 'palm';
    this.apiKey = localStorage.getItem('openai_api_key') || '';
    
    this.initEventListeners();
  }
  
  initEventListeners() {
    // チャットUIの管理
    this.minimize.addEventListener('click', () => {
      this.chatContainer.style.display = 'none';
      this.minimizedChat.style.display = 'flex';
    });
    
    this.minimizedChat.addEventListener('click', () => {
      this.chatContainer.style.display = 'flex';
      this.minimizedChat.style.display = 'none';
    });
    
    // テキスト入力の処理
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
  }
  
  sendMessage() {
    const message = this.chatInput.value.trim();
    if (message) {
      this.addMessage(message, 'user');
      this.processUserInput(message);
      this.chatInput.value = '';
    }
  }
  
  // メッセージの追加
  addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(sender + '-message');
    messageElement.textContent = text;
    this.chatMessages.appendChild(messageElement);
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
  
  // ユーザー入力の処理
  async processUserInput(text) {
    try {
      // 「考え中...」の表示
      const thinkingMsg = document.createElement('div');
      thinkingMsg.classList.add('message', 'bot-message');
      thinkingMsg.textContent = '考え中...';
      this.chatMessages.appendChild(thinkingMsg);
      this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
      
      const response = await getLLMResponse(text, this.currentGesture, this.apiKey);
      
      // 「考え中...」を削除
      this.chatMessages.removeChild(thinkingMsg);
      
      // 応答を表示
      this.addMessage(response, 'bot');

      // 音声出力を実行
      speakText(response);
    } catch (error) {
      console.error('Error processing input:', error);
      this.addMessage('エラー: ' + error.message, 'bot');
    }
  }
  
  // ジェスチャーの更新
  setGesture(gesture) {
    this.currentGesture = gesture;
  }
  
  // APIキーの更新
  setApiKey(key) {
    this.apiKey = key;
  }
  
  // 初期メッセージの表示
  showWelcomeMessage() {
    setTimeout(() => {
      this.addMessage('こんにちは！右手ミギーです。何か話しかけてみてください。マイクボタンを押すか、テキストで入力できます！', 'bot');
    }, 1000);
  }
}
