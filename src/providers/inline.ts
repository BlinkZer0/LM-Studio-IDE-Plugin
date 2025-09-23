import * as vscode from 'vscode';
import { client, getModel } from '../lib/client';

/**
 * Inline completion provider that shows ghost text suggestions
 */
export class InlineProvider implements vscode.InlineCompletionItemProvider {
  
  /**
   * Provide inline completion items (ghost text) at the cursor position
   */
  async provideInlineCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.InlineCompletionContext,
    token: vscode.CancellationToken
  ): Promise<vscode.InlineCompletionItem[] | vscode.InlineCompletionList | null> {
    
    // Skip if user is actively typing or if cancelled
    if (token.isCancellationRequested) {
      return null;
    }

    try {
      // Get context around cursor (up to 60 lines before)
      const startLine = Math.max(0, position.line - 60);
      const beforeRange = new vscode.Range(
        new vscode.Position(startLine, 0), 
        position
      );
      const prefix = document.getText(beforeRange);
      
      // Get some context after cursor too (up to 10 lines)
      const endLine = Math.min(document.lineCount - 1, position.line + 10);
      const afterRange = new vscode.Range(
        position,
        new vscode.Position(endLine, document.lineAt(endLine).text.length)
      );
      const suffix = document.getText(afterRange);
      
      const languageId = document.languageId;
      const fileName = document.fileName;
      
      // Create completion request
      const model = getModel();
      const openai = client();
      
      const systemPrompt = `You are a code completion assistant. Complete the code at the cursor position.
Rules:
- Return ONLY the code that should be inserted at the cursor
- Do not repeat existing code
- Keep completions concise and contextually appropriate
- Match the existing code style and indentation
- For ${languageId} files, follow language conventions`;

      const userPrompt = `File: ${fileName}
Language: ${languageId}

Code before cursor:
\`\`\`${languageId}
${prefix}
\`\`\`

Code after cursor:
\`\`\`${languageId}
${suffix}
\`\`\`

Complete the code at the cursor position (between before and after).`;

      const response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 200,
        stop: ['\n\n', '```']
      });

      const completion = response.choices?.[0]?.message?.content?.trim() ?? '';
      
      if (!completion) {
        return null;
      }

      // Create inline completion item
      const item = new vscode.InlineCompletionItem(completion);
      item.range = new vscode.Range(position, position);
      
      return [item];
      
    } catch (error) {
      console.error('Inline completion error:', error);
      return null;
    }
  }
}
