import * as vscode from 'vscode';
import { streamChat } from '../usecases/chat';

/**
 * Chat panel webview for interacting with LM Studio
 */
export class ChatPanel {
  private static panel: vscode.WebviewPanel | undefined;
  private static context: vscode.ExtensionContext;

  /**
   * Register the chat panel with the extension context
   */
  static register(ctx: vscode.ExtensionContext) {
    this.context = ctx;
  }

  /**
   * Show or reveal the chat panel
   */
  static reveal() {
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        'lmsChat',
        'LM Studio Chat',
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: []
        }
      );

      this.panel.webview.html = this.getWebviewContent();
      
      // Handle messages from webview
      this.panel.webview.onDidReceiveMessage(async (message) => {
        switch (message.type) {
          case 'ask':
            try {
              this.panel?.webview.postMessage({ 
                type: 'thinking', 
                content: 'Thinking...' 
              });
              
              const response = await streamChat(message.content);
              
              this.panel?.webview.postMessage({ 
                type: 'answer', 
                content: response 
              });
            } catch (error) {
              this.panel?.webview.postMessage({ 
                type: 'error', 
                content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` 
              });
            }
            break;
            
          case 'clear':
            // Clear chat history
            this.panel?.webview.postMessage({ type: 'cleared' });
            break;
        }
      });

      // Clean up when panel is disposed
      this.panel.onDidDispose(() => {
        this.panel = undefined;
      });
    }

    this.panel.reveal(vscode.ViewColumn.Beside);
  }

  /**
   * Generate the HTML content for the webview
   */
  private static getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LM Studio Chat</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        #chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        
        .message {
            padding: 12px;
            border-radius: 8px;
            max-width: 90%;
            word-wrap: break-word;
        }
        
        .user-message {
            background-color: var(--vscode-inputOption-activeBorder);
            color: var(--vscode-inputOption-activeForeground);
            align-self: flex-end;
            margin-left: auto;
        }
        
        .assistant-message {
            background-color: var(--vscode-editor-selectionBackground);
            align-self: flex-start;
        }
        
        .error-message {
            background-color: var(--vscode-errorForeground);
            color: var(--vscode-errorBackground);
            align-self: flex-start;
        }
        
        .thinking {
            font-style: italic;
            opacity: 0.7;
            align-self: flex-start;
        }
        
        #input-container {
            padding: 16px;
            border-top: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-panel-background);
        }
        
        #message-input {
            width: 100%;
            min-height: 80px;
            padding: 12px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            resize: vertical;
            font-family: inherit;
        }
        
        #message-input:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }
        
        .button-container {
            display: flex;
            gap: 8px;
            margin-top: 8px;
        }
        
        button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            cursor: pointer;
            font-family: inherit;
        }
        
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .help-text {
            font-size: 0.9em;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
        
        pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 8px;
            border-radius: 4px;
            overflow-x: auto;
            white-space: pre-wrap;
        }
        
        code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 2px;
        }
    </style>
</head>
<body>
    <div id="chat-container">
        <div class="message assistant-message">
            <strong>LM Studio Assistant</strong><br>
            Hello! I'm ready to help you with coding tasks. You can use:
            <ul>
                <li><code>@file</code> - Include current file content</li>
                <li><code>@selection</code> - Include selected text</li>
                <li>Ask questions, request explanations, or get code suggestions</li>
            </ul>
        </div>
    </div>
    
    <div id="input-container">
        <textarea 
            id="message-input" 
            placeholder="Ask me anything... Use @file to include current file, @selection for selected text"
            rows="3"
        ></textarea>
        <div class="button-container">
            <button id="send-button">Send</button>
            <button id="clear-button">Clear Chat</button>
        </div>
        <div class="help-text">
            Tip: Press Ctrl+Enter to send message
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chat-container');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const clearButton = document.getElementById('clear-button');
        
        let isThinking = false;

        function addMessage(content, type = 'assistant') {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${type}-message\`;
            
            if (type === 'user') {
                messageDiv.innerHTML = \`<strong>You:</strong><br>\${escapeHtml(content)}\`;
            } else if (type === 'error') {
                messageDiv.innerHTML = \`<strong>Error:</strong><br>\${escapeHtml(content)}\`;
            } else {
                messageDiv.innerHTML = formatMessage(content);
            }
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            return messageDiv;
        }
        
        function formatMessage(content) {
            // Simple markdown-like formatting
            let formatted = escapeHtml(content);
            
            // Code blocks
            formatted = formatted.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
            
            // Inline code
            formatted = formatted.replace(/\`([^\`]+)\`/g, '<code>$1</code>');
            
            // Bold
            formatted = formatted.replace(/\\*\\*([^\\*]+)\\*\\*/g, '<strong>$1</strong>');
            
            // Line breaks
            formatted = formatted.replace(/\\n/g, '<br>');
            
            return formatted;
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function sendMessage() {
            const content = messageInput.value.trim();
            if (!content || isThinking) return;
            
            addMessage(content, 'user');
            messageInput.value = '';
            isThinking = true;
            sendButton.disabled = true;
            
            vscode.postMessage({ type: 'ask', content });
        }
        
        function clearChat() {
            chatContainer.innerHTML = '';
            vscode.postMessage({ type: 'clear' });
            
            // Add welcome message back
            addMessage(\`<strong>LM Studio Assistant</strong><br>
                Hello! I'm ready to help you with coding tasks. You can use:
                <ul>
                    <li><code>@file</code> - Include current file content</li>
                    <li><code>@selection</code> - Include selected text</li>
                    <li>Ask questions, request explanations, or get code suggestions</li>
                </ul>\`);
        }
        
        sendButton.addEventListener('click', sendMessage);
        clearButton.addEventListener('click', clearChat);
        
        messageInput.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Handle messages from extension
        window.addEventListener('message', (event) => {
            const message = event.data;
            
            switch (message.type) {
                case 'answer':
                    isThinking = false;
                    sendButton.disabled = false;
                    addMessage(message.content);
                    break;
                    
                case 'error':
                    isThinking = false;
                    sendButton.disabled = false;
                    addMessage(message.content, 'error');
                    break;
                    
                case 'thinking':
                    const thinkingDiv = addMessage(message.content);
                    thinkingDiv.classList.add('thinking');
                    break;
                    
                case 'cleared':
                    // Chat already cleared
                    break;
            }
        });
        
        // Focus input on load
        messageInput.focus();
    </script>
</body>
</html>`;
  }
}
