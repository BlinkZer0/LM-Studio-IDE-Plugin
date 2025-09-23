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
  console.log('BlinkZero Local Completion extension is now active!');

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
    vscode.window.registerTreeDataProvider('blinkzero-chat', chatTreeProvider),
    vscode.window.registerTreeDataProvider('blinkzero-tools', toolsTreeProvider)
  );

  // Register command palette commands
  ctx.subscriptions.push(
    vscode.commands.registerCommand('blinkzero.chat.open', () => ChatPanel.reveal()),
    vscode.commands.registerCommand('blinkzero.applyDiff', () => applyDiff()),
    vscode.commands.registerCommand('blinkzero.explainSelection', () => explainSelection()),
    vscode.commands.registerCommand('blinkzero.writeTests', () => writeTests()),
    vscode.commands.registerCommand('blinkzero.refactorFunction', () => refactorFunction()),
    vscode.commands.registerCommand('blinkzero.runShellCommand', () => runShellCommand()),
    vscode.commands.registerCommand('blinkzero.tools.checkConnection', () => checkLMSConnection()),
    vscode.commands.registerCommand('blinkzero.tools.showModelInfo', () => showModelInfo())
  );

  // Show activation message
  vscode.window.showInformationMessage('BlinkZero Local Completion extension activated! Configure your settings and start coding.');
}

/**
 * Extension deactivation function - called when VS Code unloads the extension
 */
export function deactivate() {
  console.log('BlinkZero Local Completion extension is now deactivated.');
}
