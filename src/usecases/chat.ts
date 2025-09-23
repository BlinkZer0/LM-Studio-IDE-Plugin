import * as vscode from 'vscode';
import { fetch } from 'undici';
import { client, getModel } from '../lib/client';
import { collectContext } from '../util/context';
import { withTools } from '../util/tools';

/**
 * Main chat function that processes user input and returns AI response
 */
export async function streamChat(rawPrompt: string): Promise<string> {
  try {
    const model = getModel();
    const openai = client();
    
    // Collect context from @directives and workspace
    const { system, user } = await collectContext(rawPrompt);
    
    // Add MCP tools if available
    const { messages, toolDefs, serverUrl } = await withTools([
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]);
    
    // Create chat completion request
    const requestOptions: any = {
      model,
      messages,
      temperature: 0.3,
      max_tokens: 2000,
      stream: false
    };
    
    // Add tools if available
    if (toolDefs && toolDefs.length > 0) {
      requestOptions.tools = toolDefs;
      requestOptions.tool_choice = 'auto';
    }
    
    const response = await openai.chat.completions.create(requestOptions);
    
    // Handle tool calls if present
    const message = response.choices?.[0]?.message;
    if (message?.tool_calls && message.tool_calls.length > 0) {
      return await handleToolCalls(message, messages, serverUrl, openai, model);
    }
    
    return message?.content ?? 'No response received from the model.';
    
  } catch (error) {
    console.error('Chat error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
        return 'Error: Cannot connect to LM Studio. Please ensure LM Studio is running and accessible at the configured URL.';
      }
      return `Error: ${error.message}`;
    }
    
    return 'An unexpected error occurred while processing your request.';
  }
}

/**
 * Handle tool calls from the AI model
 */
async function handleToolCalls(
  message: any,
  messages: any[],
  serverUrl: string | undefined,
  openai: any,
  model: string
): Promise<string> {
  if (!serverUrl) {
    return 'Tool calls requested but no MCP server URL configured. Please set lms.mcp.serverUrl in settings.';
  }
  
  try {
    // Add the assistant's message with tool calls
    messages.push(message);
    
    // Execute each tool call
    for (const toolCall of message.tool_calls) {
      const toolResult = await executeToolCall(toolCall, serverUrl);
      
      // Add tool result to messages
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult)
      });
    }
    
    // Get final response from model
    const finalResponse = await openai.chat.completions.create({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 2000
    });
    
    return finalResponse.choices?.[0]?.message?.content ?? 'No response after tool execution.';
    
  } catch (error) {
    console.error('Tool execution error:', error);
    return `Error executing tools: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * Execute a single tool call via MCP server
 */
async function executeToolCall(toolCall: any, serverUrl: string): Promise<any> {
  try {
    const response = await fetch(`${serverUrl}/tools/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: toolCall.function.name,
        arguments: JSON.parse(toolCall.function.arguments || '{}')
      })
    });
    
    if (!response.ok) {
      throw new Error(`Tool execution failed: ${response.statusText}`);
    }
    
    return await response.json() as any;
    
  } catch (error) {
    console.error(`Error executing tool ${toolCall.function.name}:`, error);
    return {
      error: `Failed to execute tool: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
