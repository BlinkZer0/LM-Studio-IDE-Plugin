# VS Code Extension Setup Guide

## Quick Start

### 1. Install the Extension

**Option A: Install from VSIX (Recommended)**
1. Open VS Code
2. Press `Ctrl+Shift+P` to open Command Palette
3. Type "Extensions: Install from VSIX..."
4. Select the `vscode-windsurf-lms-0.1.0.vsix` file
5. Restart VS Code when prompted

**Option B: Development Mode**
1. Open this folder in VS Code
2. Press `F5` to launch Extension Development Host
3. Test the extension in the new VS Code window

### 2. Configure LM Studio

1. **Start LM Studio**
   - Download and install LM Studio from https://lmstudio.ai/
   - Load your preferred model (e.g., `qwen2.5-coder`)
   - Start the local server (usually on port 1234)

2. **Configure Extension Settings**
   - Open VS Code Settings (`Ctrl+,`)
   - Search for "LM Studio"
   - Set the following:
     ```json
     {
       "lms.baseUrl": "http://localhost:1234/v1",
       "lms.model": "qwen2.5-coder"
     }
     ```

### 3. Optional: Setup Agent-Cascade MCP Server

1. **Install Agent-Cascade**
   - Follow Agent-Cascade installation instructions
   - Start the MCP server (usually on port 7777)

2. **Configure MCP Integration**
   ```json
   {
     "lms.mcp.serverUrl": "http://localhost:7777",
     "lms.mcp.allowedTools": [
       "mcp1_fs_read_text",
       "mcp1_fs_search",
       "mcp1_proc_run",
       "mcp1_advanced_grep",
       "mcp1_file_ops"
     ]
   }
   ```

## Features Overview

### 🤖 Inline Completions
- Automatic ghost text suggestions as you type
- Context-aware completions using your LM Studio model
- Works with any programming language

### 💬 AI Chat Panel
- Click the robot icon in Activity Bar or use `Ctrl+Shift+P` → "LMS: Open Chat"
- Use `@file` to include current file content
- Use `@selection` to include selected text
- Use `@workspace` to include workspace information

### 🛠️ Command Palette Actions
- **LMS: Explain Selection** - Get detailed code explanations
- **LMS: Write Tests** - Generate comprehensive unit tests
- **LMS: Refactor Function** - Get refactoring suggestions
- **LMS: Apply Proposed Diff** - Apply code changes from diffs

### 🔧 MCP Tools (Optional)
- Execute file operations, shell commands, and more
- Secure allowlist-based tool access
- Seamless integration with Agent-Cascade

## Troubleshooting

### Common Issues

**"Cannot connect to LM Studio"**
- Ensure LM Studio is running and the server is started
- Check that `lms.baseUrl` matches your LM Studio server URL
- Verify a model is loaded in LM Studio

**"No inline completions"**
- Check that `lms.model` matches your loaded model name
- Try typing more context to trigger completions
- Ensure LM Studio server is responding

**"MCP tools not working"**
- Verify Agent-Cascade MCP server is running
- Check `lms.mcp.serverUrl` configuration
- Ensure tools are in the `lms.mcp.allowedTools` allowlist

### Debug Information
- Open VS Code Developer Tools: `Help` → `Toggle Developer Tools`
- Check Console tab for error messages
- Look for extension logs prefixed with "Windsurf + LM Studio"

## Development

### Building from Source
```bash
# Install dependencies
npm install --legacy-peer-deps

# Build TypeScript
npm run build

# Package extension
npx @vscode/vsce package --allow-missing-repository --no-git-tag-version

# Run tests
npm test
```

### Project Structure
```
src/
├── extension.ts          # Main extension entry point
├── lib/client.ts        # LM Studio client wrapper
├── providers/inline.ts  # Inline completion provider
├── ui/chatPanel.ts      # Chat panel webview
├── usecases/chat.ts     # Chat functionality
├── util/
│   ├── context.ts       # Context collection
│   └── tools.ts         # MCP tools integration
└── tasks/commands.ts    # Command palette actions
```

## Next Steps

1. **Test the Extension**
   - Open a code file and start typing to see inline completions
   - Open the chat panel and try `@file` or `@selection` commands
   - Use command palette actions on selected code

2. **Customize Settings**
   - Adjust model names to match your LM Studio setup
   - Configure MCP tools if using Agent-Cascade
   - Set up workspace-specific settings if needed

3. **Provide Feedback**
   - Report issues or feature requests
   - Share your experience and suggestions
   - Contribute to the project if interested

---

**Happy coding with AI assistance! 🚀**
