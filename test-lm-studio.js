const { fetch } = require('undici');

async function testLMStudio() {
  try {
    console.log('Testing LM Studio connection...');
    
    // First, check available models
    const modelsResponse = await fetch('http://10.5.0.2:11434/v1/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!modelsResponse.ok) {
      throw new Error(`Models request failed: ${modelsResponse.statusText}`);
    }
    
    const models = await modelsResponse.json();
    console.log('Available models:', JSON.stringify(models, null, 2));
    
    // Get the first available model
    const modelId = models.data?.[0]?.id || 'qwen2.5-coder';
    console.log(`Using model: ${modelId}`);
    
    // Test chat completion
    const chatResponse = await fetch('http://10.5.0.2:11434/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-local'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: 'user',
            content: 'Hello! Can you write a simple Python function to calculate factorial?'
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });
    
    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      throw new Error(`Chat completion failed: ${chatResponse.statusText}\n${errorText}`);
    }
    
    const result = await chatResponse.json();
    console.log('Chat completion successful!');
    console.log('Response:', JSON.stringify(result, null, 2));
    
    const message = result.choices?.[0]?.message?.content;
    if (message) {
      console.log('\n=== AI Response ===');
      console.log(message);
    }
    
  } catch (error) {
    console.error('Error testing LM Studio:', error.message);
  }
}

testLMStudio();
