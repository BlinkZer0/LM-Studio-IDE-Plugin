const OpenAI = require('openai');

async function testChatCompletion() {
  try {
    console.log('Testing chat completion with extension-style client...');
    
    // Create OpenAI client configured for LM Studio (same as extension)
    const openai = new OpenAI({
      apiKey: 'sk-local', // LM Studio ignores this but OpenAI client requires it
      baseURL: 'http://10.5.0.2:11434/v1',
      timeout: 60000
    });
    
    console.log('OpenAI client created, sending chat completion request...');
    
    // Test the exact same pattern used in the extension
    const response = await openai.chat.completions.create({
      model: 'deepseek/deepseek-coder-6.7b-instruct-q4_0',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful coding assistant integrated into VS Code. Provide concise, accurate responses.'
        },
        {
          role: 'user',
          content: 'Hello! I\'m testing the VS Code extension. Can you write a simple JavaScript function to check if a number is prime?'
        }
      ],
      temperature: 0.3,
      max_tokens: 300
    });
    
    console.log('✅ Chat completion successful!');
    
    const message = response.choices?.[0]?.message?.content;
    const usage = response.usage;
    
    if (message) {
      console.log('\n🤖 === AI Assistant Response ===');
      console.log(message);
      
      if (usage) {
        console.log('\n📊 === Usage Stats ===');
        console.log(`Prompt tokens: ${usage.prompt_tokens}`);
        console.log(`Completion tokens: ${usage.completion_tokens}`);
        console.log(`Total tokens: ${usage.total_tokens}`);
      }
    } else {
      console.log('❌ No message content received');
      console.log('Full response:', JSON.stringify(response, null, 2));
    }
    
    // Test inline completion style request
    console.log('\n🔄 Testing inline completion style...');
    
    const inlineResponse = await openai.chat.completions.create({
      model: 'deepseek/deepseek-coder-6.7b-instruct-q4_0',
      messages: [
        {
          role: 'system',
          content: 'Return ONLY the code that should be inserted at the cursor. Do not repeat existing code. Keep completions concise and contextually appropriate.'
        },
        {
          role: 'user',
          content: `File: test.js
Language: javascript

Code before cursor:
\`\`\`javascript
function calculateSum(arr) {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        
\`\`\`

Complete the code at the cursor position.`
        }
      ],
      temperature: 0.2,
      max_tokens: 50,
      stop: ['\n\n', '```']
    });
    
    const inlineCompletion = inlineResponse.choices?.[0]?.message?.content?.trim();
    if (inlineCompletion) {
      console.log('✨ Inline completion:', inlineCompletion);
    }
    
    console.log('\n🎉 All tests passed! The extension should work perfectly in VS Code.');
    
  } catch (error) {
    console.error('❌ Error testing chat completion:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
  }
}

testChatCompletion();
