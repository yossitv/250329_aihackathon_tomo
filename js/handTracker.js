// handTracker.js

export class HandTracker {
  constructor(videoElement, onGestureDetected) {
    this.videoElement = videoElement;
    this.onGestureDetected = onGestureDetected;
    this.hands = new Hands({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });

    this.hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    this.hands.onResults(results => this.handleResults(results));
    this.lastGesture = null;
    this.gestureStabilityCounter = 0;
  }

  start() {
    const camera = new Camera(this.videoElement, {
      onFrame: async () => {
        await this.hands.send({ image: this.videoElement });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  }

  handleResults(results) {
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return;
    const landmarks = results.multiHandLandmarks[0];
    const gesture = this.detectGesture(landmarks);
    
    // ジェスチャーの安定性を確保するため、同じジェスチャーが数フレーム続いたら通知
    if (gesture) {
      if (gesture === this.lastGesture) {
        this.gestureStabilityCounter++;
        if (this.gestureStabilityCounter >= 5) { // 5フレーム同じジェスチャーが続いたら
          if (this.onGestureDetected && gesture !== this.lastNotifiedGesture) {
            this.onGestureDetected(gesture);
            this.lastNotifiedGesture = gesture;
          }
        }
      } else {
        this.lastGesture = gesture;
        this.gestureStabilityCounter = 0;
      }
    }
  }

  detectGesture(landmarks) {
    // 指が曲がっているかの判定
    const isFingerBent = (tip, pip, mcp) => {
      // Y座標を使用して指が曲がっているかを判定
      return landmarks[tip].y > landmarks[pip].y;
    };
    
    // 親指は特殊なので別の判定方法
    const isThumbBent = () => {
      // 親指が内側に曲がっているかどうか
      return landmarks[4].x > landmarks[3].x; // 右手の場合
    };
    
    // 各指が曲がっているか
    const thumbBent = isThumbBent();
    const indexBent = isFingerBent(8, 6, 5);
    const middleBent = isFingerBent(12, 10, 9);
    const ringBent = isFingerBent(16, 14, 13);
    const pinkyBent = isFingerBent(20, 18, 17);
    
    // ジェスチャーの判定
    if (!thumbBent && indexBent && middleBent && ringBent && pinkyBent) {
      return 'thumbs_up'; // 親指だけ立てている
    }
    
    if (thumbBent && !indexBent && middleBent && ringBent && pinkyBent) {
      return 'index'; // 人差し指だけ立てている
    }
    
    if (thumbBent && indexBent && !middleBent && ringBent && pinkyBent) {
      return 'middle_finger'; // 中指だけ立てている
    }
    
    if (thumbBent && indexBent && middleBent && ringBent && !pinkyBent) {
      return 'thumbs_down'; // 小指だけ立てている
    }
    
    if (thumbBent && indexBent && middleBent && ringBent && pinkyBent) {
      return 'fist'; // 全て曲げている = 拳
    }
    
    if (!thumbBent && !indexBent && !middleBent && !ringBent && !pinkyBent) {
      return 'palm'; // 全て開いている = 手のひら
    }
    
    return null; // 他のジェスチャー
  }
}