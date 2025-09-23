import * as vscode from 'vscode';
import { ChatPanel } from './ui/chatPanel';
import { InlineProvider } from './providers/inline';
import { ChatTreeProvider } from './providers/chatTreeProvider';
import { ToolsTreeProvider } from './providers/toolsTreeProvider';
import { explainSelection, writeTests, refactorFunction, applyDiff, runShellCommand, checkLMSConnection, showModelInfo } from './tasks/commands';

/**
 * Extension activation function - called when VS Code loads the extension
 */
export async function activate(ctx: vscode.ExtensionContext) {
  console.log('LM Studio IDE Plugin extension is now active!');

  // Register inline completion provider for all file types
  const inlineProvider = new InlineProvider();
  ctx.subscriptions.push(
    vscode.languages.registerInlineCompletionItemProvider(
      [{ scheme: 'file' }], 
      inlineProvider
    )
  );

  // Initialize chat panel
  ChatPanel.register(ctx);

  // Register sidebar view providers
  const chatTreeProvider = new ChatTreeProvider();
  const toolsTreeProvider = new ToolsTreeProvider();
  
  ctx.subscriptions.push(
    vscode.window.registerTreeDataProvider('lmstudio-chat', chatTreeProvider),
    vscode.window.registerTreeDataProvider('lmstudio-tools', toolsTreeProvider)
  );

  // Register command palette commands
  ctx.subscriptions.push(
    vscode.commands.registerCommand('lmstudio.chat.open', () => ChatPanel.reveal()),
    vscode.commands.registerCommand('lmstudio.applyDiff', () => applyDiff()),
    vscode.commands.registerCommand('lmstudio.explainSelection', () => explainSelection()),
    vscode.commands.registerCommand('lmstudio.writeTests', () => writeTests()),
    vscode.commands.registerCommand('lmstudio.refactorFunction', () => refactorFunction()),
    vscode.commands.registerCommand('lmstudio.runShellCommand', () => runShellCommand()),
    vscode.commands.registerCommand('lmstudio.tools.checkConnection', () => checkLMSConnection()),
    vscode.commands.registerCommand('lmstudio.tools.showModelInfo', () => showModelInfo())
  );

  // Show activation message
  vscode.window.showInformationMessage('LM Studio IDE Plugin activated! Configure your settings and start coding.');
}

/**
 * Extension deactivation function - called when VS Code unloads the extension
 */
export function deactivate() {
  console.log('LM Studio IDE Plugin extension is now deactivated.');
}
