import * as vscode from 'vscode';

/**
 * Tree data provider for the Tools sidebar view
 */
export class ToolsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | null | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

  private tools: vscode.TreeItem[] = [];

  constructor() {
    this.initializeTools();
  }

  private initializeTools(): void {
    this.tools = [
      this.createToolItem('MCP Tools', 'Agent-Cascade MCP integration tools', 'category'),
      this.createToolItem('  • File Operations', 'Read, write, and search files', 'tool'),
      this.createToolItem('  • Process Execution', 'Run system commands', 'tool'),
      this.createToolItem('  • Advanced Grep', 'Enhanced text search', 'tool'),
      this.createToolItem('  • File Management', 'Copy, move, delete files', 'tool'),
      
      this.createToolItem('Local LLM Status', '', 'category'),
      this.createToolItem('  • Connection', 'Check Local LLM connection', 'status'),
      this.createToolItem('  • Model Info', 'Current model information', 'status'),
      
      this.createToolItem('Extension Settings', '', 'category'),
      this.createToolItem('  • Configure Base URL', 'Set Local LLM server URL', 'setting', 'workbench.action.openSettings'),
      this.createToolItem('  • Select Model', 'Choose default model', 'setting', 'workbench.action.openSettings'),
      this.createToolItem('  • MCP Settings', 'Configure MCP tools', 'setting', 'workbench.action.openSettings'),
    ];
  }

  private createToolItem(label: string, description: string, type: 'category' | 'tool' | 'status' | 'setting', commandId?: string): vscode.TreeItem {
    const item = new vscode.TreeItem(label, type === 'category' ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None);
    
    item.description = description;
    item.tooltip = description;
    
    if (commandId && type === 'setting') {
      item.command = {
        command: commandId,
        title: label,
        arguments: ['blinkzero']
      };
    }

    // Set appropriate icons
    switch (type) {
      case 'category':
        item.iconPath = new vscode.ThemeIcon('folder');
        break;
      case 'tool':
        item.iconPath = new vscode.ThemeIcon('tools');
        break;
      case 'status':
        item.iconPath = new vscode.ThemeIcon('pulse');
        break;
      case 'setting':
        item.iconPath = new vscode.ThemeIcon('gear');
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
      return Promise.resolve(this.tools);
    }
    return Promise.resolve([]);
  }

  updateConnectionStatus(connected: boolean): void {
    const connectionItem = this.tools.find(item => 
      typeof item.label === 'string' && item.label.includes('Connection')
    );
    if (connectionItem) {
      connectionItem.description = connected ? 'Connected ✓' : 'Disconnected ✗';
      connectionItem.iconPath = new vscode.ThemeIcon(connected ? 'check' : 'error');
      this.refresh();
    }
  }

  updateModelInfo(modelName: string): void {
    const modelItem = this.tools.find(item => 
      typeof item.label === 'string' && item.label.includes('Model Info')
    );
    if (modelItem) {
      modelItem.description = modelName || 'No model loaded';
      this.refresh();
    }
  }
}
