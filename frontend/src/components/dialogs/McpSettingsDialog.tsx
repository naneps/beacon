import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Card } from '../ui/card'
import { Copy, Check } from 'lucide-react'
import { toast } from '../ui/toast'
import {
  getMcpStatus, getMcpServerPath, getMcpSkillPath,
  registerClaudeDesktop, unregisterClaudeDesktop,
  registerClaudeCode, unregisterClaudeCode,
  SUPPORTED_MCP_CLIENTS,
  type McpStatus, type ClientState,
} from '../../lib/mcp'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATE_LABEL: Record<ClientState, string> = {
  registered: 'Registered',
  not_registered: 'Not registered',
  config_not_found: 'Config not found',
  cli_missing: 'CLI not installed',
}

export default function McpSettingsDialog({ open, onOpenChange }: Props) {
  const [status, setStatus] = useState<McpStatus | null>(null)
  const [binaryPath, setBinaryPath] = useState('')
  const [skillPath, setSkillPath] = useState('')
  const [busy, setBusy] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setError(null)
    setLoadingStatus(true)
    try {
      const [s, p, sk] = await Promise.all([getMcpStatus(), getMcpServerPath(), getMcpSkillPath()])
      setStatus(s)
      setBinaryPath(p)
      setSkillPath(sk)
    } catch (e: any) {
      setError(String(e?.message ?? e))
    } finally {
      setLoadingStatus(false)
    }
  }

  useEffect(() => {
    if (open) refresh()
  }, [open])

  async function act(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
      await refresh()
    } catch (e: any) {
      setError(String(e?.message ?? e))
    } finally {
      setBusy(false)
    }
  }

  const snippet = JSON.stringify(
    { mcpServers: { beacon: { command: binaryPath, args: [] } } },
    null,
    2,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle>MCP Server</DialogTitle>
          <DialogDescription>
            The Beacon MCP server is a standard MCP server — works with <strong>any</strong> MCP client (Claude, Cursor, Windsurf, Cline, Continue, etc.).
            Use the one-click buttons for Claude, or copy the config snippet for everything else.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="text-xs text-red-500 border border-red-500/30 bg-red-500/5 rounded-lg p-2.5">
            {error}
          </div>
        )}

        <div className="space-y-4 py-1 max-w-full overflow-hidden">
          {/* Universal Binary - Hero */}
          <Card className="p-3 bg-muted/40 border max-w-full">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold flex items-center gap-2">
                MCP Server Binary <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">stdio</span>
              </div>
              <Badge variant="outline" className="text-[10px]">Universal</Badge>
            </div>
            <div className="max-w-full">
              <CopyRow text={binaryPath} placeholder="—" mono />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              This single path works with <strong>any</strong> MCP client.
            </p>
          </Card>

          {/* Agent Skill for Claude Code etc. */}
          <div className="space-y-1.5">
            <div className="text-xs font-medium">Agent Skill (Claude Code)</div>
            <CopyRow text={skillPath} placeholder="—" mono />
            <p className="text-[10px] text-muted-foreground">
              Copy to <code>~/.claude/skills/beacon/SKILL.md</code> (or your project).
            </p>
          </div>

          {/* Supported Clients Pills */}
          <div className="max-w-full">
            <div className="text-xs font-medium mb-1.5 text-muted-foreground">Works with</div>
            <div className="flex flex-wrap gap-1.5 max-w-full">
              {SUPPORTED_MCP_CLIENTS.map((c) => {
                const isSpecial = 'special' in c && (c as any).special;
                return (
                  <Badge key={c.name} variant={isSpecial ? 'default' : 'secondary'} className="text-[10px] font-normal">
                    {c.name}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Claude one-click (still the easiest for Claude users) */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">One-click for Claude</div>
            <ClientRow
              name="Claude Desktop"
              state={status?.claude_desktop}
              busy={busy || loadingStatus}
              loading={loadingStatus}
              onRegister={() => act(registerClaudeDesktop)}
              onUnregister={() => act(unregisterClaudeDesktop)}
            />
            <ClientRow
              name="Claude Code"
              state={status?.claude_code}
              busy={busy || loadingStatus}
              loading={loadingStatus}
              onRegister={() => act(registerClaudeCode)}
              onUnregister={() => act(unregisterClaudeCode)}
            />
          </div>

          {/* Generic config for everyone else */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">For Cursor, Windsurf, Cline, Continue, etc.</div>
            <p className="text-[10px] text-muted-foreground">
              Use the binary path above + this config:
            </p>
            <div className="flex gap-2 items-start max-w-full">
              <div className="flex-1 min-w-0 overflow-hidden">
                <pre className="text-[10px] bg-muted rounded-md px-2 py-1.5 overflow-x-auto whitespace-pre font-mono max-w-full">
                  {snippet}
                </pre>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 shrink-0"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(snippet)
                    toast.success('Config copied')
                  } catch {
                    toast.error('Failed to copy')
                  }
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Most clients have a "MCP Servers" or "Custom MCP" section in settings.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CopyRow({ text, placeholder, mono }: { text: string; placeholder: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  const doCopy = async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('Failed to copy')
    }
  }
  return (
    <div className="flex gap-2">
      <code className={`flex-1 text-[11px] bg-muted rounded-md px-2.5 py-1.5 truncate ${mono ? 'font-mono' : ''}`}>
        {text || placeholder}
      </code>
      <Button variant="outline" size="sm" className="h-8 shrink-0" onClick={doCopy} disabled={!text}>
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}

function ClientRow({
  name, state, busy, loading, onRegister, onUnregister,
}: {
  name: string
  state?: ClientState
  busy: boolean
  loading?: boolean
  onRegister: () => void
  onUnregister: () => void
}) {
  const registered = state === 'registered'
  // For Claude Code, always allow the register attempt even if our detection
  // says "cli_missing" (PATH differences between terminal and the app are common).
  // The actual command will give a clear error if it really can't run.
  const disabled = busy || (name !== "Claude Code" && state === 'cli_missing')
  return (
    <div className="flex items-center justify-between border border-border rounded-lg p-2.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{name}</span>
        <Badge variant={registered ? 'default' : 'secondary'} className={registered ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-transparent' : ''}>
          {loading ? 'Checking...' : (state ? STATE_LABEL[state] : '…')}
        </Badge>
      </div>
      <Button
        size="sm"
        variant={registered ? 'outline' : 'default'}
        disabled={disabled}
        onClick={registered ? onUnregister : onRegister}
      >
        {registered ? 'Unregister' : 'Register'}
      </Button>
    </div>
  )
}
