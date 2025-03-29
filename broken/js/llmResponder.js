// llmResponder.js

const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

const tonePrompts = {
  fist: '怒った口調で、短く返答してください。',
  palm: '明るく前向きな感じで返してください。',
  thumbs_up: 'すごく褒めた口調で返してください。',
  middle_finger: 'かなり攻撃的で毒舌な感じで返してください。',
  thumbs_down: '見下したような感じで返してください。'
};

export async function getLLMResponse(userText, gesture = 'palm', apiKey = '') {
  if (!apiKey) {
    throw new Error('APIキーが設定されていません。');
  }

  const systemPrompt = tonePrompts[gesture] || tonePrompts['palm'];

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('LLM fetch failed:', errorData);
      throw new Error(`API呼び出しエラー（ステータス: ${response.status}）`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error in getLLMResponse:', error);
    throw new Error('LLM応答の取得中にエラーが発生しました: ' + error.message);
  }
}