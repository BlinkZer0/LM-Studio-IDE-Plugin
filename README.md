# BlinkZeroLocalCompletion

A powerful VS Code extension that integrates Local LLM servers with Agent-Cascade MCP tools, providing AI-powered coding assistance directly in your editor with instant completions.

## Features

### ⚡ Instant Code Completions
- Lightning-fast ghost text suggestions as you type
- Context-aware completions using Local LLM models
- Works with any programming language
- Zero-latency experience with local inference

### 💬 AI Chat Panel
- Dedicated chat sidebar for coding assistance
- Support for `@file` and `@selection` directives
- Contextual workspace awareness
- Beautiful, VS Code-themed interface

### 🛠️ Command Palette Actions
- **BlinkZero: Explain Selection** - Get detailed explanations of selected code
- **BlinkZero: Write Tests** - Generate comprehensive unit tests
- **BlinkZero: Refactor Function** - Improve code quality and structure
- **BlinkZero: Apply Proposed Diff** - Apply code changes from diffs
- **BlinkZero: Run Shell Command** - Execute terminal commands
- **BlinkZero: Check Connection** - Test Local LLM connectivity

### 🔧 MCP Tools Integration
- Bridge to Agent-Cascade MCP server
- Execute file operations, shell commands, and more
- Configurable tool allowlist for security

## Screenshot

![BlinkZero Extension in Action](Screenshot%202025-09-23%20013019.png)

*BlinkZero extension providing AI-powered coding assistance with inline completions and chat panel integration*

## Prerequisites

1. **Node.js 20+** - Required for building and running the extension
2. **Local LLM Server** - Any OpenAI-compatible server (LM Studio, Ollama, etc.)
3. **Agent-Cascade MCP Server** (optional) - For advanced tool capabilities

## Installation

### Option 1: Install from VSIX (Recommended)

1. Download the latest `.vsix` file from releases
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X`)
4. Click the "..." menu and select "Install from VSIX..."
5. Select the downloaded `.vsix` file

### Option 2: Build from Source

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd vscode-windsurf-lms
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Package the extension:
   ```bash
   npm run package
   ```

5. Install the generated `.vsix` file in VS Code

## Configuration

Configure the extension through VS Code settings (`Ctrl+,`):

### Basic Settings

```json
{
  "blinkzero.baseUrl": "http://localhost:1234/v1",
  "blinkzero.model": "qwen2.5-coder",
  "blinkzero.embeddingsModel": "nomic-embed-text"
}
```

### MCP Integration Settings

```json
{
  "blinkzero.mcp.serverUrl": "http://localhost:7777",
  "blinkzero.mcp.allowedTools": [
    "mcp1_fs_read_text",
    "mcp1_fs_search", 
    "mcp1_proc_run",
    "mcp1_advanced_grep",
    "mcp1_file_ops"
  ]
}
```

### All Available Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `blinkzero.baseUrl` | `http://10.5.0.2:11434/v1` | Local LLM OpenAI-compatible base URL |
| `blinkzero.model` | `qwen2.5-coder` | Default chat/completions model |
| `blinkzero.embeddingsModel` | `nomic-embed-text` | Embeddings model for RAG |
| `blinkzero.maxContextFiles` | `6` | Maximum context files for RAG |
| `blinkzero.mcp.serverUrl` | `http://localhost:7777` | Agent-Cascade MCP server URL |
| `blinkzero.mcp.allowedTools` | `[...]` | Allowlist of MCP tool names |
| `blinkzero.localTools.enable` | `true` | Enable local VS Code tools |
| `blinkzero.localTools.allowedTools` | `[...]` | Allowlist of local tool names |

## Usage

### Getting Started

1. **Start your Local LLM server** (LM Studio, Ollama, etc.) and load your preferred model
2. **Configure the extension** with your server URL and model name
3. **Open a code file** and start coding with instant AI assistance!

### Inline Completions

- Simply start typing in any file
- Ghost text suggestions will appear automatically
- Press `Tab` to accept suggestions
- Press `Esc` to dismiss suggestions

### Chat Panel

1. Click the ⚡ BlinkZero icon in the Activity Bar, or
2. Use `Ctrl+Shift+P` → "BlinkZero: Open Chat"

#### Chat Directives

- `@file` - Include current file content in your message
- `@selection` - Include selected text in your message
- `@workspace` - Include workspace structure information

Example:
```
@file Can you explain what this function does and suggest improvements?
```

### Command Palette

Access AI-powered commands via `Ctrl+Shift+P`:

- **BlinkZero: Explain Selection** - Select code and get detailed explanations
- **BlinkZero: Write Tests** - Generate unit tests for your current file
- **BlinkZero: Refactor Function** - Select a function to get refactoring suggestions
- **BlinkZero: Apply Proposed Diff** - Apply code changes from unified diffs
- **BlinkZero: Run Shell Command** - Execute terminal commands
- **BlinkZero: Check Connection** - Test Local LLM connectivity

## MCP Tools Integration

This extension can integrate with Agent-Cascade MCP tools for enhanced capabilities:

### Setting up Agent-Cascade

1. Install and run the Agent-Cascade MCP server
2. Configure `blinkzero.mcp.serverUrl` to point to your server
3. Customize `blinkzero.mcp.allowedTools` for security

### Available MCP Tools

- `mcp1_fs_read_text` - Read file contents
- `mcp1_fs_search` - Search for files by pattern
- `mcp1_proc_run` - Execute shell commands
- `mcp1_advanced_grep` - Advanced text search
- `mcp1_file_ops` - File operations (copy, move, delete)
- And many more...

## Development

### Project Structure

```
src/
├── extension.ts          # Main extension entry point
├── lib/
│   └── client.ts        # LM Studio client wrapper
├── providers/
│   └── inline.ts        # Inline completion provider
├── ui/
│   └── chatPanel.ts     # Chat panel webview
├── usecases/
│   └── chat.ts          # Chat functionality
├── util/
│   ├── context.ts       # Context collection utilities
│   └── tools.ts         # MCP tools integration
└── tasks/
    └── commands.ts      # Command palette actions
```

### Building

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Watch for changes during development
npm run watch

# Package extension
npm run package

# Run linting
npm run lint
```

### Testing

```bash
# Run tests
npm test
```

## Troubleshooting

### Common Issues

**"Cannot connect to Local LLM server"**
- Ensure your Local LLM server is running and accessible
- Check that the `blinkzero.baseUrl` setting is correct
- Verify the model is loaded in your LLM server
- Test connection using "BlinkZero: Check Connection" command

**"No inline completions appearing"**
- Check that a model is loaded in your LLM server
- Verify the `blinkzero.model` setting matches your loaded model
- Try typing more context to trigger completions
- Ensure your server supports OpenAI-compatible completions

**"MCP tools not working"**
- Ensure Agent-Cascade MCP server is running
- Check `blinkzero.mcp.serverUrl` configuration
- Verify tools are in the `blinkzero.mcp.allowedTools` allowlist

### Debug Information

Enable VS Code Developer Tools (`Help` → `Toggle Developer Tools`) to see console logs and debug information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

### v0.1.0
- Initial BlinkZero release
- Lightning-fast inline code completions
- Chat panel with @directives
- Command palette actions
- MCP tools integration
- Local VS Code tools integration
- Shell command execution
- Connection testing utilities

## Support

For issues and feature requests, please use the GitHub issue tracker.

---

**Happy coding with BlinkZero! ⚡🚀**
