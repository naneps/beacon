// Desktop-only wrappers around the Tauri MCP registration commands.
//
// NOTE: The actual Beacon MCP server is 100% client-agnostic (standard MCP protocol).
// We only have special one-click register/unregister for Claude (because it has nice CLI + config file).
// For all other clients → user copies the generic snippet using the server binary path.

import { isDesktop } from './platform'

// Centralized list of known MCP clients for easy maintenance and UI display.
// The first two have special one-click support in the desktop app.
export const SUPPORTED_MCP_CLIENTS = [
  { name: 'Claude Desktop', special: true as const },
  { name: 'Claude Code', special: true as const },
  { name: 'Cursor' },
  { name: 'Windsurf' },
  { name: 'Cline' },
  { name: 'Continue.dev' },
  { name: 'Zed' },
  { name: 'VS Code + Continue' },
  { name: 'Roo Code' },
] as const

export type SupportedMcpClient = (typeof SUPPORTED_MCP_CLIENTS)[number]['name']

export type ClientState =
  | 'registered'
  | 'not_registered'
  | 'config_not_found'
  | 'cli_missing'

export interface McpStatus {
  claude_desktop: ClientState
  claude_code: ClientState
}

async function invoker() {
  if (!isDesktop()) throw new Error('MCP registration is desktop-only')
  const { invoke } = await import('@tauri-apps/api/core')
  return invoke
}

export async function getMcpStatus(): Promise<McpStatus> {
  const invoke = await invoker()
  return invoke<McpStatus>('mcp_status')
}

export async function getMcpServerPath(): Promise<string> {
  const invoke = await invoker()
  return invoke<string>('mcp_server_path')
}

export async function getMcpSkillPath(): Promise<string> {
  const invoke = await invoker()
  return invoke<string>('mcp_skill_path')
}

export async function registerClaudeDesktop(): Promise<void> {
  const invoke = await invoker()
  await invoke('mcp_register_claude_desktop')
}

export async function unregisterClaudeDesktop(): Promise<void> {
  const invoke = await invoker()
  await invoke('mcp_unregister_claude_desktop')
}

export async function registerClaudeCode(): Promise<void> {
  const invoke = await invoker()
  await invoke('mcp_register_claude_code')
}

export async function unregisterClaudeCode(): Promise<void> {
  const invoke = await invoker()
  await invoke('mcp_unregister_claude_code')
}
