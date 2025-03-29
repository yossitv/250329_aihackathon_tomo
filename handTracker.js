// handTracker.js

// 3点 (A, B, C) の角度を計算するヘルパー関数（ラジアンを返す）
function computeAngle(A, B, C) {
  const AB = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
  const BC = { x: C.x - B.x, y: C.y - B.y, z: C.z - B.z };
  const dot = AB.x * BC.x + AB.y * BC.y + AB.z * BC.z;
  const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y + AB.z * AB.z);
  const magBC = Math.sqrt(BC.x * BC.x + BC.y * BC.y + BC.z * BC.z);
  const cosine = dot / (magAB * magBC);
  return Math.acos(Math.min(Math.max(cosine, -1), 1)); // acos の値（ラジアン）
}

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
    this.lastNotifiedGesture = null;
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
        if (this.gestureStabilityCounter >= 5) { // 5フレーム連続なら通知
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
    // 閾値：1.7ラジアン（約97度）以上なら「曲がっている」と判断
    const threshold = 1.7;

    // 各指の角度を計算
    // 人差し指：landmarks[5] (MCP), landmarks[6] (PIP), landmarks[8] (TIP)
    const indexAngle = computeAngle(landmarks[5], landmarks[6], landmarks[8]);
    // 中指：landmarks[9] (MCP), landmarks[10] (PIP), landmarks[12] (TIP)
    const middleAngle = computeAngle(landmarks[9], landmarks[10], landmarks[12]);
    // 輪：landmarks[13] (MCP), landmarks[14] (PIP), landmarks[16] (TIP)
    const ringAngle = computeAngle(landmarks[13], landmarks[14], landmarks[16]);
    // 小指：landmarks[17] (MCP), landmarks[18] (PIP), landmarks[20] (TIP)
    const pinkyAngle = computeAngle(landmarks[17], landmarks[18], landmarks[20]);
    // 親指：landmarks[1] (MCP), landmarks[2] (IP), landmarks[4] (TIP)
    const thumbAngle = computeAngle(landmarks[1], landmarks[2], landmarks[4]);

    // 各指が曲がっているかどうかを判断
    const thumbBent = thumbAngle > threshold;
    const indexBent = indexAngle > threshold;
    const middleBent = middleAngle > threshold;
    const ringBent = ringAngle > threshold;
    const pinkyBent = pinkyAngle > threshold;

    // ジェスチャーの判定（例）
    // 全て曲げている → 拳 (fist)
    if (thumbBent && indexBent && middleBent && ringBent && pinkyBent) {
      return 'fist';
    }
    // 全て伸ばしている → 手のひら (palm)
    if (!thumbBent && !indexBent && !middleBent && !ringBent && !pinkyBent) {
      return 'palm';
    }
    // 親指だけ伸ばしている → thumbs_up
    if (!thumbBent && indexBent && middleBent && ringBent && pinkyBent) {
      return 'thumbs_up';
    }
    // 人差し指だけ伸ばしている → index
    if (thumbBent && !indexBent && middleBent && ringBent && pinkyBent) {
      return 'index';
    }
    // 中指だけ伸ばしている → middle_finger
    if (thumbBent && indexBent && !middleBent && ringBent && pinkyBent) {
      return 'middle_finger';
    }
    // 小指だけ伸ばしている → thumbs_down
    if (thumbBent && indexBent && middleBent && ringBent && !pinkyBent) {
      return 'thumbs_down';
    }
    
    return null; // 他のジェスチャー
  }
}
