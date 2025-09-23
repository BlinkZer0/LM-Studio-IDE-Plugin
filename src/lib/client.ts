import * as vscode from 'vscode';
import OpenAI from 'openai';

/**
 * Creates and returns an OpenAI client configured for Local LLM
 */
export function client(): OpenAI {
  const config = vscode.workspace.getConfiguration('blinkzero');
  const baseURL = config.get<string>('baseUrl') || 'http://localhost:1234/v1';
  
  // Local LLM servers ignore the API key but OpenAI client requires it
  const apiKey = 'sk-local';
  
  return new OpenAI({ 
    apiKey, 
    baseURL,
    // Increase timeout for local models which can be slower
    timeout: 60000
  });
}

/**
 * Get the configured model name
 */
export function getModel(): string {
  const config = vscode.workspace.getConfiguration('blinkzero');
  return config.get<string>('model') || 'qwen2.5-coder';
}

/**
 * Get the configured embeddings model name
 */
export function getEmbeddingsModel(): string {
  const config = vscode.workspace.getConfiguration('blinkzero');
  return config.get<string>('embeddingsModel') || 'nomic-embed-text';
}

/**
 * Test connection to Local LLM server
 */
export async function testConnection(): Promise<boolean> {
  try {
    const openai = client();
    // Try to list models to test connection
    await openai.models.list();
    return true;
  } catch (error) {
    console.error('Failed to connect to Local LLM:', error);
    return false;
  }
}
