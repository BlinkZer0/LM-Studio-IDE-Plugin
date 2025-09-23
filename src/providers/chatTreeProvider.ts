import * as vscode from 'vscode';

/**
 * Tree data provider for the Chat sidebar view
 */
export class ChatTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private chatHistory: vscode.TreeItem[] = [];

  constructor() {
    // Initialize with welcome items
    this.chatHistory = [
      this.createChatItem('Welcome to BlinkZero Chat', 'Click to open chat panel', 'info', 'blinkzero.chat.open'),
      this.createChatItem('Quick Actions', '', 'folder'),
      this.createChatItem('  • Explain Selection', 'Explain selected code', 'action', 'blinkzero.explainSelection'),
      this.createChatItem('  • Write Tests', 'Generate tests for current file', 'action', 'blinkzero.writeTests'),
      this.createChatItem('  • Refactor Function', 'Refactor selected function', 'action', 'blinkzero.refactorFunction'),
    ];
  }

  private createChatItem(label: string, tooltip: string, type: 'info' | 'folder' | 'action' | 'user' | 'assistant', commandId?: string): vscode.TreeItem {
    const item = new vscode.TreeItem(label, type === 'folder' ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
    
    item.tooltip = tooltip;
    
    if (commandId) {
      item.command = {
        command: commandId,
        title: label,
        arguments: []
      };
    }

    // Set appropriate icons
    switch (type) {
      case 'info':
        item.iconPath = new vscode.ThemeIcon('info');
        break;
      case 'folder':
        item.iconPath = new vscode.ThemeIcon('folder');
        break;
      case 'action':
        item.iconPath = new vscode.ThemeIcon('play');
        break;
      case 'user':
        item.iconPath = new vscode.ThemeIcon('person');
        break;
      case 'assistant':
        item.iconPath = new vscode.ThemeIcon('robot');
        break;
    }

    return item;
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
    if (!element) {
      return Promise.resolve(this.chatHistory);
    }
    return Promise.resolve([]);
  }

  addChatMessage(message: string, type: 'user' | 'assistant' = 'user'): void {
    const timestamp = new Date().toLocaleTimeString();
    const item = this.createChatItem(
      `${type === 'user' ? 'You' : 'Assistant'} (${timestamp})`,
      message.length > 50 ? message.substring(0, 50) + '...' : message,
      type === 'user' ? 'user' : 'assistant'
    );
    
    // Keep only last 10 messages to avoid clutter
    if (this.chatHistory.length > 10) {
      this.chatHistory = this.chatHistory.slice(0, 5).concat(this.chatHistory.slice(-5));
    }
    
    this.chatHistory.push(item);
    this.refresh();
  }
}
