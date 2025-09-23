import * as vscode from 'vscode';
import { fetch } from 'undici';

/**
 * MCP tool definition for OpenAI format
 */
interface MCPTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
      additionalProperties?: boolean;
    };
  };
}

/**
 * Add MCP tools to messages if configured and available
 */
export async function withTools(messages: any[]): Promise<{
  messages: any[];
  toolDefs: MCPTool[] | undefined;
  serverUrl: string | undefined;
}> {
  const config = vscode.workspace.getConfiguration('lms');
  const allowedTools = config.get<string[]>('mcp.allowedTools') || [];
  const serverUrl = config.get<string>('mcp.serverUrl');
  
  if (!serverUrl || allowedTools.length === 0) {
    return { messages, toolDefs: undefined, serverUrl: undefined };
  }
  
  try {
    // Get available tools from MCP server
    const availableTools = await fetchAvailableTools(serverUrl);
    
    // Filter to allowed tools and convert to OpenAI format
    const toolDefs: MCPTool[] = availableTools
      .filter(tool => allowedTools.includes(tool.name))
      .map(tool => convertMCPToolToOpenAI(tool));
    
    return { messages, toolDefs, serverUrl };
    
  } catch (error) {
    console.error('Error fetching MCP tools:', error);
    // Return without tools if MCP server is unavailable
    return { messages, toolDefs: undefined, serverUrl: undefined };
  }
}

/**
 * Fetch available tools from MCP server
 */
async function fetchAvailableTools(serverUrl: string): Promise<any[]> {
  try {
    const response = await fetch(`${serverUrl}/tools/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tools: ${response.statusText}`);
    }
    
    const data = await response.json() as any;
    return data.tools || [];
    
  } catch (error) {
    console.error('Error fetching available tools:', error);
    return [];
  }
}

/**
 * Convert MCP tool definition to OpenAI tools format
 */
function convertMCPToolToOpenAI(mcpTool: any): MCPTool {
  // Map common MCP tools to better descriptions
  const toolDescriptions: Record<string, string> = {
    'mcp1_fs_read_text': 'Read the contents of a text file from the filesystem',
    'mcp1_fs_search': 'Search for files by name pattern in the filesystem',
    'mcp1_proc_run': 'Execute a command in the system shell',
    'mcp1_advanced_grep': 'Search for text patterns in files with advanced options',
    'mcp1_file_ops': 'Perform file operations like copy, move, delete, rename',
    'mcp1_fs_list': 'List files and directories in a given path',
    'mcp1_fs_write_text': 'Write text content to a file',
    'mcp1_grep': 'Search for text patterns in files',
    'mcp1_web_search': 'Search the web using various search engines',
    'mcp1_web_scraper': 'Extract content from web pages'
  };
  
  const description = toolDescriptions[mcpTool.name] || 
    mcpTool.description || 
    `MCP tool: ${mcpTool.name}`;
  
  // Create OpenAI-compatible tool definition
  const openAITool: MCPTool = {
    type: 'function',
    function: {
      name: mcpTool.name,
      description,
      parameters: {
        type: 'object',
        properties: mcpTool.inputSchema?.properties || {},
        additionalProperties: true
      }
    }
  };
  
  // Add required fields if available
  if (mcpTool.inputSchema?.required) {
    openAITool.function.parameters.required = mcpTool.inputSchema.required;
  }
  
  return openAITool;
}

/**
 * Get MCP server status
 */
export async function getMCPServerStatus(): Promise<{
  connected: boolean;
  url: string | undefined;
  availableTools: string[];
  error?: string;
}> {
  const config = vscode.workspace.getConfiguration('lms');
  const serverUrl = config.get<string>('mcp.serverUrl');
  
  if (!serverUrl) {
    return {
      connected: false,
      url: undefined,
      availableTools: [],
      error: 'No MCP server URL configured'
    };
  }
  
  try {
    const tools = await fetchAvailableTools(serverUrl);
    return {
      connected: true,
      url: serverUrl,
      availableTools: tools.map(t => t.name)
    };
  } catch (error) {
    return {
      connected: false,
      url: serverUrl,
      availableTools: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
