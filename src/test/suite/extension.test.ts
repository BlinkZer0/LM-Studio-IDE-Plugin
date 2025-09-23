import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * Basic extension tests
 */
suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('your-name.vscode-windsurf-lms'));
  });

  test('Extension should activate', async () => {
    const ext = vscode.extensions.getExtension('your-name.vscode-windsurf-lms');
    if (ext) {
      await ext.activate();
      assert.ok(ext.isActive);
    }
  });

  test('Commands should be registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    
    const expectedCommands = [
      'lms.chat.open',
      'lms.applyDiff',
      'lms.explainSelection',
      'lms.writeTests',
      'lms.refactorFunction'
    ];

    for (const command of expectedCommands) {
      assert.ok(commands.includes(command), `Command ${command} should be registered`);
    }
  });
});
