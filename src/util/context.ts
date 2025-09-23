import * as vscode from 'vscode';
import * as path from 'path';
import fg from 'fast-glob';

/**
 * Collect context from user input, processing @directives and workspace information
 */
export async function collectContext(rawPrompt: string): Promise<{ system: string; user: string }> {
  const editor = vscode.window.activeTextEditor;
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  
  let system = `You are a senior software engineer and coding assistant. You provide helpful, accurate, and concise responses.

Guidelines:
- Prefer minimal, safe changes that preserve existing functionality
- Follow the existing code style and conventions
- Provide clear explanations for your suggestions
- When suggesting code changes, use proper diff format
- Be specific and actionable in your recommendations`;

  let user = rawPrompt;
  
  // Process @selection directive
  if (rawPrompt.includes('@selection') && editor) {
    const selection = editor.document.getText(editor.selection);
    if (selection.trim()) {
      user = user.replace('@selection', '');
      user += `\n\n<selection>\n${selection}\n</selection>`;
      
      // Add file context for selection
      const fileName = path.basename(editor.document.fileName);
      const languageId = editor.document.languageId;
      system += `\n\nThe user has selected code from ${fileName} (${languageId}).`;
    } else {
      user = user.replace('@selection', '(no text selected)');
    }
  }
  
  // Process @file directive
  if (rawPrompt.includes('@file') && editor) {
    const fileContent = editor.document.getText();
    const fileName = path.basename(editor.document.fileName);
    const languageId = editor.document.languageId;
    const relativePath = vscode.workspace.asRelativePath(editor.document.fileName);
    
    user = user.replace('@file', '');
    user += `\n\n<file name="${fileName}" path="${relativePath}" language="${languageId}">\n${fileContent}\n</file>`;
    
    system += `\n\nThe user is working with ${fileName} (${languageId}).`;
  }
  
  // Process @workspace directive (basic implementation)
  if (rawPrompt.includes('@workspace') && workspaceFolder) {
    user = user.replace('@workspace', '');
    
    try {
      // Get workspace structure (limited to avoid overwhelming context)
      const files = await fg(['**/*.{ts,js,py,java,cpp,c,h,hpp,cs,go,rs,php,rb}'], {
        cwd: workspaceFolder.uri.fsPath,
        ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', 'out/**'],
        absolute: false
      });
      
      const limitedFiles = files.slice(0, 20); // Limit to first 20 files
      const workspaceName = path.basename(workspaceFolder.uri.fsPath);
      
      user += `\n\n<workspace name="${workspaceName}">\nKey files:\n${limitedFiles.map(f => `- ${f}`).join('\n')}\n</workspace>`;
      
      system += `\n\nThe user is working in the "${workspaceName}" workspace.`;
      
    } catch (error) {
      console.error('Error collecting workspace context:', error);
      user += '\n\n<workspace>(error collecting workspace information)</workspace>';
    }
  }
  
  // Add current file context if no specific directive but editor is active
  if (!rawPrompt.includes('@file') && !rawPrompt.includes('@selection') && !rawPrompt.includes('@workspace') && editor) {
    const fileName = path.basename(editor.document.fileName);
    const languageId = editor.document.languageId;
    system += `\n\nThe user is currently editing ${fileName} (${languageId}).`;
  }
  
  // Add workspace context
  if (workspaceFolder) {
    const workspaceName = path.basename(workspaceFolder.uri.fsPath);
    system += `\n\nWorkspace: ${workspaceName}`;
  }
  
  return { system: system.trim(), user: user.trim() };
}

/**
 * Get relevant files from workspace based on query (for future RAG implementation)
 */
export async function getRelevantFiles(query: string, maxFiles: number = 5): Promise<string[]> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    return [];
  }
  
  try {
    // Simple file matching based on extensions and common patterns
    const files = await fg(['**/*.{ts,js,py,java,cpp,c,h,hpp,cs,go,rs,php,rb,md,txt,json,yaml,yml}'], {
      cwd: workspaceFolder.uri.fsPath,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', 'out/**'],
      absolute: false
    });
    
    // TODO: Implement semantic search with embeddings
    // For now, return a simple subset
    return files.slice(0, maxFiles);
    
  } catch (error) {
    console.error('Error getting relevant files:', error);
    return [];
  }
}
