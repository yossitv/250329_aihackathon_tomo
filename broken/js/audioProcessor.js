// audioProcessor.js

export class AudioProcessor {
  constructor(onAudioLevelUpdate) {
    this.onAudioLevelUpdate = onAudioLevelUpdate;
    this.audioLevel = 0;
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
  }
  
  setupAudioProcessing(stream) {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      source.connect(this.analyser);
      this.analyser.fftSize = 128;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      
      this.updateAudioLevel();
    } catch (error) {
      console.error('Failed to setup audio processing:', error);
    }
  }
  
  updateAudioLevel() {
    if (!this.analyser) return;
    
    this.analyser.getByteFrequencyData(this.dataArray);
    const sum = this.dataArray.reduce((a, b) => a + b, 0);
    this.audioLevel = sum / this.dataArray.length / 128;
    
    if (this.onAudioLevelUpdate) {
      this.onAudioLevelUpdate(this.audioLevel);
    }
    
    requestAnimationFrame(this.updateAudioLevel.bind(this));
  }
  
  getAudioLevel() {
    return this.audioLevel;
  }
}
