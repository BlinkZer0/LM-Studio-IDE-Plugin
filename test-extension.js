// Test the extension's client functionality
const path = require('path');

// Simulate VS Code workspace configuration
const mockVSCode = {
  workspace: {
    getConfiguration: (section) => {
      const configs = {
        'lms': {
          get: (key) => {
            const settings = {
              'baseUrl': 'http://10.5.0.2:11434/v1',
              'model': 'deepseek/deepseek-coder-6.7b-instruct-q4_0',
              'embeddingsModel': 'nomic-embed-text'
            };
            return settings[key];
          }
        }
      };
      return configs[section] || { get: () => undefined };
    }
  }
};

// Mock the VS Code module for our test
global.vscode = mockVSCode;

// Import our client after mocking vscode
const clientPath = path.join(__dirname, 'out', 'lib', 'client.js');
const { client, getModel } = require(clientPath);

async function testExtensionClient() {
  try {
    console.log('Testing VS Code extension client...');
    
    const model = getModel();
    console.log(`Using model: ${model}`);
    
    const openai = client();
    console.log('OpenAI client created successfully');
    
    // Test chat completion using the extension's client
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful coding assistant. Provide concise, accurate responses.'
        },
        {
          role: 'user',
          content: 'Write a simple JavaScript function to reverse a string.'
        }
      ],
      temperature: 0.3,
      max_tokens: 150
    });
    
    console.log('Extension client test successful!');
    const message = response.choices?.[0]?.message?.content;
    
    if (message) {
      console.log('\n=== Extension Response ===');
      console.log(message);
    } else {
      console.log('No message content received');
      console.log('Full response:', JSON.stringify(response, null, 2));
    }
    
  } catch (error) {
    console.error('Error testing extension client:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testExtensionClient();
