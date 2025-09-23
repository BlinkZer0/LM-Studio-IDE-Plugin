import * as vscode from 'vscode';
import { client, getModel } from '../lib/client';

/**
 * Explain the currently selected code or entire file
 */
export async function explainSelection() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found. Please open a file first.');
    return;
  }
  
  const selection = editor.document.getText(editor.selection);
  const text = selection.trim() || editor.document.getText();
  const fileName = editor.document.fileName;
  const languageId = editor.document.languageId;
  
  if (!text.trim()) {
    vscode.window.showWarningMessage('No code to explain. Please select some code or ensure the file has content.');
    return;
  }
  
  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Explaining code...",
      cancellable: false
    }, async () => {
      
      const openai = client();
      const model = getModel();
      
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a code explanation expert. Explain code clearly and concisely, covering:
- What the code does (high-level purpose)
- How it works (key logic and flow)
- Important details (algorithms, patterns, edge cases)
- Any potential issues or improvements

Keep explanations accessible but thorough.`
          },
          {
            role: 'user',
            content: `Please explain this ${languageId} code from ${fileName}:

\`\`\`${languageId}
${text}
\`\`\``
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });
      
      const explanation = response.choices?.[0]?.message?.content ?? 'No explanation generated.';
      
      // Show explanation in a new document
      const doc = await vscode.workspace.openTextDocument({
        content: `# Code Explanation\n\nFile: ${fileName}\nLanguage: ${languageId}\n\n## Code\n\n\`\`\`${languageId}\n${text}\n\`\`\`\n\n## Explanation\n\n${explanation}`,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    });
    
  } catch (error) {
    console.error('Error explaining code:', error);
    vscode.window.showErrorMessage(`Failed to explain code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate unit tests for the current file
 */
export async function writeTests() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found. Please open a file first.');
    return;
  }
  
  const fileContent = editor.document.getText();
  const fileName = editor.document.fileName;
  const languageId = editor.document.languageId;
  
  if (!fileContent.trim()) {
    vscode.window.showWarningMessage('File is empty. Please add some code first.');
    return;
  }
  
  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Generating tests...",
      cancellable: false
    }, async () => {
      
      const openai = client();
      const model = getModel();
      
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a test generation expert. Generate comprehensive unit tests that:
- Cover main functionality and edge cases
- Follow testing best practices for the language
- Include setup/teardown if needed
- Use appropriate testing framework conventions
- Are deterministic and reliable
- Include clear test descriptions

Generate complete, runnable test code.`
          },
          {
            role: 'user',
            content: `Generate unit tests for this ${languageId} code from ${fileName}:

\`\`\`${languageId}
${fileContent}
\`\`\``
          }
        ],
        temperature: 0.2,
        max_tokens: 2000
      });
      
      const tests = response.choices?.[0]?.message?.content ?? 'No tests generated.';
      
      // Determine test file name based on language conventions
      const testFileName = getTestFileName(fileName, languageId);
      
      // Create test file
      const testDoc = await vscode.workspace.openTextDocument({
        content: tests,
        language: languageId
      });
      
      await vscode.window.showTextDocument(testDoc, vscode.ViewColumn.Beside);
      
      // Offer to save the test file
      const saveChoice = await vscode.window.showInformationMessage(
        `Tests generated! Save as ${testFileName}?`,
        'Save',
        'Don\'t Save'
      );
      
      if (saveChoice === 'Save') {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
          const testPath = vscode.Uri.joinPath(workspaceFolder.uri, testFileName);
          await vscode.workspace.fs.writeFile(testPath, Buffer.from(tests, 'utf8'));
          vscode.window.showInformationMessage(`Tests saved to ${testFileName}`);
        }
      }
    });
    
  } catch (error) {
    console.error('Error generating tests:', error);
    vscode.window.showErrorMessage(`Failed to generate tests: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Refactor the selected function or code block
 */
export async function refactorFunction() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found. Please open a file first.');
    return;
  }
  
  const selection = editor.document.getText(editor.selection);
  if (!selection.trim()) {
    vscode.window.showWarningMessage('Please select the code you want to refactor.');
    return;
  }
  
  const languageId = editor.document.languageId;
  const fileName = editor.document.fileName;
  
  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Refactoring code...",
      cancellable: false
    }, async () => {
      
      const openai = client();
      const model = getModel();
      
      const response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'system',
            content: `You are a code refactoring expert. Refactor code to improve:
- Readability and maintainability
- Performance where applicable
- Code organization and structure
- Following language best practices
- Removing code smells

Preserve the original behavior exactly. Provide the refactored code and explain the changes made.`
          },
          {
            role: 'user',
            content: `Please refactor this ${languageId} code from ${fileName}:

\`\`\`${languageId}
${selection}
\`\`\`

Provide the refactored code and explain what improvements were made.`
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      });
      
      const refactoredCode = response.choices?.[0]?.message?.content ?? 'No refactoring suggestions generated.';
      
      // Show refactored code in a new document
      const doc = await vscode.workspace.openTextDocument({
        content: `# Refactored Code\n\nFile: ${fileName}\nLanguage: ${languageId}\n\n## Original Code\n\n\`\`\`${languageId}\n${selection}\n\`\`\`\n\n## Refactored Version\n\n${refactoredCode}`,
        language: 'markdown'
      });
      
      await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
      
      // Offer to apply the refactoring
      const applyChoice = await vscode.window.showInformationMessage(
        'Apply the refactoring to your code?',
        'Apply',
        'Don\'t Apply'
      );
      
      if (applyChoice === 'Apply') {
        // This is a simplified implementation - in production you'd want
        // to extract just the code part from the markdown response
        vscode.window.showInformationMessage('Please manually copy the refactored code. Automatic application will be improved in future versions.');
      }
    });
    
  } catch (error) {
    console.error('Error refactoring code:', error);
    vscode.window.showErrorMessage(`Failed to refactor code: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Apply a unified diff to the current file
 */
export async function applyDiff() {
  const diffText = await vscode.window.showInputBox({
    prompt: 'Paste the unified diff to apply',
    placeHolder: 'Paste unified diff here...',
    ignoreFocusOut: true
  });
  
  if (!diffText?.trim()) {
    return;
  }
  
  try {
    await applyUnifiedDiff(diffText);
  } catch (error) {
    console.error('Error applying diff:', error);
    vscode.window.showErrorMessage(`Failed to apply diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Apply a unified diff to the current file (simplified implementation)
 */
async function applyUnifiedDiff(diff: string) {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showWarningMessage('No active editor found. Please open a file first.');
    return;
  }
  
  // This is a very basic diff application - in production you'd want a proper diff parser
  vscode.window.showInformationMessage('Diff application is simplified in this MVP. Please apply changes manually. Future versions will include automatic diff application.');
  
  // Show the diff in a new document for manual application
  const doc = await vscode.workspace.openTextDocument({
    content: `# Diff to Apply\n\n\`\`\`diff\n${diff}\n\`\`\`\n\nPlease apply these changes manually to your code.`,
    language: 'markdown'
  });
  
  await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
}

/**
 * Run a shell/PowerShell command
 */
export async function runShellCommand() {
  const command = await vscode.window.showInputBox({
    prompt: 'Enter the command to run',
    placeHolder: 'e.g., npm install, git status, ls -la',
    ignoreFocusOut: true
  });
  
  if (!command?.trim()) {
    return;
  }
  
  try {
    const terminal = vscode.window.createTerminal('BlinkZero Command');
    terminal.sendText(command);
    terminal.show();
    
    vscode.window.showInformationMessage(`Running command: ${command}`);
  } catch (error) {
    console.error('Error running command:', error);
    vscode.window.showErrorMessage(`Failed to run command: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check Local LLM connection status
 */
export async function checkLMSConnection() {
  try {
    vscode.window.withProgress({
      location: vscode.ProgressLocation.Notification,
      title: "Checking Local LLM connection...",
      cancellable: false
    }, async () => {
      
      const openai = client();
      
      // Try to make a simple request to test connection
      const response = await openai.chat.completions.create({
        model: getModel(),
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5
      });
      
      if (response.choices?.[0]?.message?.content) {
        vscode.window.showInformationMessage('✅ Local LLM connection successful!');
      } else {
        vscode.window.showWarningMessage('⚠️ Local LLM responded but with unexpected format');
      }
    });
    
  } catch (error) {
    console.error('Error checking connection:', error);
    vscode.window.showErrorMessage(`❌ Local LLM connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Show current model information
 */
export async function showModelInfo() {
  try {
    const config = vscode.workspace.getConfiguration('blinkzero');
    const baseUrl = config.get<string>('baseUrl', 'http://localhost:1234/v1');
    const model = config.get<string>('model', 'default');
    const embeddingsModel = config.get<string>('embeddingsModel', 'default');
    
    const info = `# BlinkZero Local Completion - Model Information

## Configuration
- **Base URL**: ${baseUrl}
- **Chat Model**: ${model}
- **Embeddings Model**: ${embeddingsModel}

## MCP Integration
- **MCP Server**: ${config.get<string>('mcp.serverUrl', 'http://localhost:7777')}
- **Allowed Tools**: ${config.get<string[]>('mcp.allowedTools', []).join(', ')}

## Local Tools
- **Enabled**: ${config.get<boolean>('localTools.enable', true) ? 'Yes' : 'No'}
- **Allowed Tools**: ${config.get<string[]>('localTools.allowedTools', []).join(', ')}
`;
    
    const doc = await vscode.workspace.openTextDocument({
      content: info,
      language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    
  } catch (error) {
    console.error('Error showing model info:', error);
    vscode.window.showErrorMessage(`Failed to show model info: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get appropriate test file name based on language conventions
 */
function getTestFileName(originalFileName: string, languageId: string): string {
  const baseName = originalFileName.replace(/\.[^/.]+$/, '');
  const extension = originalFileName.split('.').pop();
  
  switch (languageId) {
    case 'javascript':
    case 'typescript':
      return `${baseName}.test.${extension}`;
    case 'python':
      return `test_${baseName.split('/').pop()}.py`;
    case 'java':
      return `${baseName}Test.java`;
    case 'csharp':
      return `${baseName}Tests.cs`;
    case 'go':
      return `${baseName}_test.go`;
    case 'rust':
      return `${baseName}_test.rs`;
    default:
      return `${baseName}_test.${extension}`;
  }
}
