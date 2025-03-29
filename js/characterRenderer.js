// characterRenderer.js

export class CharacterRenderer {
  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.handGroup = new THREE.Group();
    this.scene.add(this.handGroup);

    this.setupEye();
    this.setupMouth();
    this.setupJoints();

    this.camera.position.z = 1;
    this.blinkTimer = 0;
    this.audioLevel = 0;

    // アニメーションループの開始
    this.animate();

    // ウィンドウサイズ変更時の処理
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupEye() {
    // キャラクターの目（白目）
    this.eyeGroup = new THREE.Group();
    const eyeGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    this.eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eye = new THREE.Mesh(eyeGeometry, this.eyeMaterial);
    
    // 瞳孔（黒目）
    const pupilGeometry = new THREE.SphereGeometry(0.025, 32, 32);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    this.pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    this.pupil.position.z = 0.035;
    eye.add(this.pupil);
    this.eyeGroup.add(eye);
    
    // まぶた
    const eyelidGeometry = new THREE.SphereGeometry(0.055, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const eyelidMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x333333, 
      side: THREE.DoubleSide 
    });
    this.eyelid = new THREE.Mesh(eyelidGeometry, eyelidMaterial);
    this.eyelid.rotation.x = Math.PI;
    this.eyelid.position.z = 0.01;
    this.eyelid.visible = false;  // 初期状態では非表示
    this.eyeGroup.add(this.eyelid);

    this.scene.add(this.eyeGroup);
  }

  setupMouth() {
    // 口
    this.mouthGroup = new THREE.Group();
    const mouthGeometry = new THREE.CircleGeometry(0.03, 32);
    const mouthMaterial = new THREE.MeshBasicMaterial({ color: 0xff3333 });
    this.mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    this.mouth.rotation.x = -Math.PI / 2;
    this.mouthGroup.add(this.mouth);
    
    this.scene.add(this.mouthGroup);
  }

  setupJoints() {
    // 手のジョイント（関節）表示用
    this.joints = [];
    for (let i = 0; i < 21; i++) {
      const jointGeo = new THREE.SphereGeometry(0.01, 16, 16);
      const jointMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
      const joint = new THREE.Mesh(jointGeo, jointMat);
      this.handGroup.add(joint);
      this.joints.push(joint);
    }
  }

  updateHandJoints(landmarks) {
    if (!landmarks) {
      // 手が検出されない場合はジョイントを非表示に
      for (let i = 0; i < this.joints.length; i++) {
        this.joints[i].visible = false;
      }
      return;
    }
    
    // 手のジョイントを表示
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      const x = (lm.x - 0.5) * 2;
      const y = -(lm.y - 0.5) * 2;
      const z = -lm.z;
      this.joints[i].position.set(x, y, z);
      this.joints[i].visible = true;
    }
    
    // 指の関節位置から目と口の位置を計算
    const middleFinger = landmarks[12]; // 中指の先端
    const palm = landmarks[0];          // 手のひらの中心
    
    // 目を中指の先端に配置
    this.eyeGroup.position.set(
      (middleFinger.x - 0.5) * 2, 
      -(middleFinger.y - 0.5) * 2, 
      -middleFinger.z
    );
    
    // 口を手のひらに配置
    this.mouthGroup.position.set(
      (palm.x - 0.5) * 1.7, 
      -(palm.y - 0.5) * 0.6, 
      -palm.z
    );
  }

  setEyeColor(gesture) {
    // ジェスチャーに応じて目の色を変更
    switch(gesture) {
      case 'fist':
        this.eyeMaterial.color.set(0xff0000); // 赤
        break;
      case 'palm':
        this.eyeMaterial.color.set(0xffffff); // 白
        break;
      case 'thumbs_up':
        this.eyeMaterial.color.set(0x00ff00); // 緑
        break;
      case 'index':
        this.eyeMaterial.color.set(0x00ffff); // 水色
        break;
      case 'middle_finger':
        this.eyeMaterial.color.set(0xff00ff); // マゼンタ
        break;
      case 'thumbs_down':
        this.eyeMaterial.color.set(0x0000ff); // 青
        break;
    }
  }

  setAudioLevel(level) {
    this.audioLevel = level;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    // 口の開閉をオーディオレベルに合わせて調整
    const scale = Math.min(2.5, 0.5 + this.audioLevel * 3);
    this.mouth.scale.y = scale;
    
    // ランダムに瞬き
    this.blinkTimer++;
    if (this.blinkTimer > 100) {
      if (Math.random() < 0.02) { // 2%の確率で瞬き
        this.eyelid.visible = true;
        setTimeout(() => {
          this.eyelid.visible = false;
        }, 200);
        this.blinkTimer = 0;
      }
    }
    
    // 瞳孔の動き（ランダムに少し揺らす）
    this.pupil.position.x = Math.sin(Date.now() * 0.001) * 0.01;
    this.pupil.position.y = Math.cos(Date.now() * 0.0013) * 0.01;
    
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
