document.addEventListener('DOMContentLoaded', function() {
  const button = document.getElementById('actionButton');
  const messageDiv = document.getElementById('message');
  const audio = new Audio('assets/sounds/pico.mp3');
  
  let clickCount = 0;
  // 1～20の中からランダムに重複しない3つの数字を選ぶ
  let eventClicks = [];
  while (eventClicks.length < 3) {
    let num = Math.floor(Math.random() * 20) + 1;
    if (!eventClicks.includes(num)) eventClicks.push(num);
  }
  eventClicks.sort((a, b) => a - b);
  console.log("イベント発生クリック番号:", eventClicks);
  
  let currentEventIndex = 0;
  let recruitedAnimals = [];
  
  button.addEventListener('click', function() {
    clickCount++;
    // ボタンをクリックするたびに音を鳴らす
    audio.currentTime = 0;
    audio.play();
    
    // もしクリック回数がイベント発生番号と一致していれば、イベントを実行
    if (currentEventIndex < eventClicks.length && clickCount === eventClicks[currentEventIndex]) {
      triggerEvent(currentEventIndex + 1); // イベント番号は1, 2, 3
      currentEventIndex++;
    }
    
    // 3回のイベントが終了したら、桃太郎の仲間が揃ったと表示し、以降のクリックを無効化
    if (currentEventIndex === 3) {
      messageDiv.innerText = "全ての動物が仲間になりました！鬼ヶ島を目指そう！";
      button.disabled = true;
    }
  });
  
  function triggerEvent(eventNumber) {
    switch(eventNumber) {
      case 1:
        // イベント1: キビだんごを投げて動物を仲間にする（例：犬）
        messageDiv.innerText = "【イベント1】キビだんごを投げた！犬が仲間になった！";
        recruitedAnimals.push("犬");
        break;
      case 2:
        // イベント2: 会話を通して交渉で仲間にする（例：猿）
        messageDiv.innerText = "【イベント2】会話で交渉した！猿が仲間になった！";
        recruitedAnimals.push("猿");
        break;
      case 3:
        // イベント3: タイミングゲーム（例としてシンプルなメッセージ表示）
        messageDiv.innerText = "【イベント3】タイミングゲームで成功！キジが仲間になった！";
        recruitedAnimals.push("キジ");
        break;
      default:
        break;
    }
    console.log("仲間になった動物:", recruitedAnimals);
  }
});
