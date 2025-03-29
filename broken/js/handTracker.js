// handTracker.js

export class HandTracker {
  constructor(videoElement, onGestureDetected) {
    this.videoElement = videoElement;
    this.onGestureDetected = onGestureDetected;
    this.hands = new Hands({ locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });

    // Three.jsの初期化を追加
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);
    
    // マーカー用の配列を初期化
    this.joints = [];
    for (let i = 0; i < 21; i++) {
      const jointGeo = new THREE.SphereGeometry(0.01, 16, 16);
      const jointMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
      const joint = new THREE.Mesh(jointGeo, jointMat);
      this.scene.add(joint);
      this.joints.push(joint);
    }
    
    this.camera.position.z = 1;

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
    
    // マーカーの位置を更新
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      const x = (lm.x - 0.5) * 2;
      const y = -(lm.y - 0.5) * 2;
      const z = -lm.z;
      this.joints[i].position.set(x, y, z);
    }
    
    // ジェスチャー検出の処理
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
    
    // レンダリング
    this.renderer.render(this.scene, this.camera);
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