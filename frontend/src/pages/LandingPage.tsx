import { useState, useEffect, useRef } from 'react'
import {
  Shield, Terminal, Cpu, Zap, Activity, Monitor, Download,
  ArrowRight, Play, StopCircle, Globe, Lock, WifiOff, FileCheck,
  Check, RotateCcw, AlertTriangle
} from 'lucide-react'
import { ThemeToggle } from '../components/ThemeToggle'

interface Props {
  onLaunchApp: () => void
}

// ---- Typewriter hook -------------------------------------------------------
const CYCLING_WORDS = ['At Scale', 'In Real-Time', 'Across Environments', 'Without Limits']

function useTypewriter(words: string[], speed = 60, pause = 1800) {
  const [displayed, setDisplayed] = useState('')
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[wordIdx]
    let timeout: any

    if (!deleting && charIdx < word.length) {
      timeout = setTimeout(() => setCharIdx((c) => c + 1), speed)
    } else if (!deleting && charIdx === word.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx((c) => c - 1), speed / 2)
    } else if (deleting && charIdx === 0) {
      setDeleting(false)
      setWordIdx((i) => (i + 1) % words.length)
    }

    setDisplayed(word.slice(0, charIdx))
    return () => clearTimeout(timeout)
  }, [charIdx, deleting, wordIdx, words, speed, pause])

  return displayed
}

// ---- Security score SVG dial ----------------------------------------------
function ScoreDial({ score }: { score: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ

  const color =
    score >= 75 ? '#10b981' :
    score >= 45 ? '#f59e0b' :
    '#ef4444'

  const label =
    score >= 75 ? 'Good' :
    score >= 45 ? 'Fair' :
    'At Risk'

  return (
    <div className="flex flex-col items-center">
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={r} fill="none" stroke="currentColor" strokeWidth={8} className="text-muted/40" />
        <circle
          cx={50} cy={50} r={r}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text x={50} y={46} textAnchor="middle" className="fill-current" fontSize={18} fontWeight="bold">{score}</text>
        <text x={50} y={61} textAnchor="middle" fontSize={10} fill={color} fontWeight="600">{label}</text>
      </svg>
      <span className="text-[10px] text-muted-foreground uppercase tracking-widest -mt-1">Security Score</span>
    </div>
  )
}

// ---- Main component -------------------------------------------------------
export default function LandingPage({ onLaunchApp }: Props) {
  const typewriterText = useTypewriter(CYCLING_WORDS)

  const [simRunning, setSimRunning] = useState(false)
  const [simDone, setSimDone] = useState(false)
  const [progress, setProgress] = useState(0)
  const [simLogs, setSimLogs] = useState<string[]>([])
  const [simStats, setSimStats] = useState({ sent: 0, success: 0, warnings: 0, errors: 0, avgLatency: 0 })
  const logContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [simLogs])

  const resetSimulation = () => {
    setSimDone(false)
    setProgress(0)
    setSimStats({ sent: 0, success: 0, warnings: 0, errors: 0, avgLatency: 0 })
    setSimLogs([])
  }

  const runSimulation = () => {
    if (simRunning) { setSimRunning(false); return }
    resetSimulation()
    setSimRunning(true)
    setSimLogs(['[SYSTEM] Initializing scan executor...', '[SYSTEM] Target URL set to: api.apytest.internal/v1'])
  }

  useEffect(() => {
    if (!simRunning) return

    let intervalId: any
    let currentStep = 0
    const totalSteps = 40

    const mockEndpoints = [
      { path: '/auth/login',      method: 'POST', weight: 'success' },
      { path: '/users/profile',   method: 'GET',  weight: 'success' },
      { path: '/admin/settings',  method: 'PUT',  weight: 'warning' },
      { path: '/v2/legacy-data',  method: 'GET',  weight: 'error'   },
      { path: '/transactions',    method: 'POST', weight: 'success' },
      { path: '/healthz',         method: 'GET',  weight: 'success' },
    ]

    const warningMessages = [
      '[SECURITY-WARN] Missing X-Content-Type-Options header',
      '[SECURITY-WARN] Weak TLS cipher suite detected on port 443',
      '[SECURITY-WARN] CORS policy permits wildcard (*) origins',
      '[Ratelimit-WARN] Request rate of 85 req/sec exceeded soft-limit of 50',
    ]

    const errorMessages = [
      '[VULN-CRITICAL] SQL Injection pattern match on path query param',
      '[SYSTEM-ERROR] Connection reset by peer: backend database timeout',
      '[VULN-HIGH] Unauthorized access check bypassed on private route',
    ]

    intervalId = setInterval(() => {
      currentStep++
      setProgress(Math.min(Math.round((currentStep / totalSteps) * 100), 100))

      const numBatch   = Math.floor(Math.random() * 5) + 3
      const mockEp     = mockEndpoints[Math.floor(Math.random() * mockEndpoints.length)]
      const latency    = Math.floor(Math.random() * 80) + 12
      const roll       = Math.random()

      let logType = 'success'
      let message = `[HTTP] ${mockEp.method} ${mockEp.path} -> `

      if (mockEp.weight === 'error' && roll > 0.4) {
        logType = 'error'; message += `500 Internal Error (${latency}ms)`
      } else if (mockEp.weight === 'warning' && roll > 0.5) {
        logType = 'warning'; message += `403 Forbidden (${latency}ms)`
      } else {
        message += `200 OK (${latency}ms)`
      }

      setSimStats((prev) => {
        const nextSent    = prev.sent + numBatch
        let nextSuccess   = prev.success
        let nextWarnings  = prev.warnings
        let nextErrors    = prev.errors

        if (logType === 'success') nextSuccess  += numBatch
        if (logType === 'warning') { nextSuccess += numBatch - 1; nextWarnings += 1 }
        if (logType === 'error')   { nextSuccess += numBatch - 2; nextErrors   += 2 }

        const nextAvg = Math.round((prev.avgLatency * prev.sent + latency * numBatch) / nextSent)
        return { sent: nextSent, success: nextSuccess, warnings: nextWarnings, errors: nextErrors, avgLatency: nextAvg }
      })

      const newLogs = [message]
      if (Math.random() > 0.8 && logType === 'warning') newLogs.push(warningMessages[Math.floor(Math.random() * warningMessages.length)])
      if (Math.random() > 0.9 && logType === 'error')   newLogs.push(errorMessages[Math.floor(Math.random() * errorMessages.length)])

      setSimLogs((prev) => [...prev, ...newLogs].slice(-100))

      if (currentStep >= totalSteps) {
        clearInterval(intervalId)
        setSimRunning(false)
        setSimDone(true)
        setSimLogs((prev) => [...prev, '[SYSTEM] Scan completed. Vulnerability report generated.'])
      }
    }, 250)

    return () => clearInterval(intervalId)
  }, [simRunning])

  // Security score: 100 - penalty for errors/warnings
  const securityScore = simDone
    ? Math.max(0, Math.min(100, Math.round(100 - simStats.errors * 8 - simStats.warnings * 3)))
    : 0

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 bg-grid-pattern relative">

      {/* Ambient glow blobs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-float" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-float" style={{ animationDelay: '-2s' }} />

      {/* Navigation */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-cyan-500/20">
              a
            </div>
            <span className="font-extrabold text-xl tracking-tight">apy<span className="text-cyan-500">test</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-muted-foreground">
            <a href="#features"     className="hover:text-foreground transition-colors">Features</a>
            <a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a>
            <a href="#desktop"      className="hover:text-foreground transition-colors">Desktop Client</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={onLaunchApp}
              className="bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all active:scale-[0.98]"
            >
              Launch Web App <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">

        {/* Announcement pill */}
        <div className="inline-flex items-center gap-2 bg-muted/80 border border-border px-3 py-1.5 rounded-full text-xs font-semibold mb-8 animate-pulse-signal">
          <span className="flex h-2 w-2 rounded-full bg-cyan-500" />
          <span className="text-muted-foreground">Now planning Desktop Native builds with Tauri</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-tight">
          Automated API Security Testing{' '}
          <span className="inline-block">
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-text-shine">
              {typewriterText}
            </span>
            <span className="inline-block w-0.5 h-[1em] ml-1 bg-cyan-500 align-middle animate-blink" />
          </span>
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mt-6 leading-relaxed">
          apytest is a hyper-parallel load tester and vulnerability scanner for developers. Create target environments, customize concurrency limits, and stream execution telemetry in real-time.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <button
            onClick={onLaunchApp}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-base group"
          >
            Launch Web Version
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <a
            href="#desktop"
            className="bg-card hover:bg-muted border border-border text-foreground font-bold px-8 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-base"
          >
            <Download className="h-5 w-5 text-cyan-500" />
            Get Desktop App
          </a>
        </div>

        {/* ---- Interactive Simulator ---- */}
        <div className="w-full max-w-5xl mt-16 border border-border bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl glow-cyan animate-float">

          {/* Window chrome */}
          <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-destructive/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="text-xs font-semibold text-muted-foreground ml-2">Scanner Simulator (apytest)</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 border border-border px-3 py-1 rounded-md text-xs font-mono">
              <span className="text-emerald-500 font-bold">● ONLINE</span>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">Workers: 16</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[380px]">

            {/* Control panel */}
            <div className="lg:col-span-4 border-r border-border p-5 flex flex-col justify-between bg-card/25">
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Target Endpoint</label>
                  <div className="bg-background border border-border px-3 py-2 rounded-lg font-mono text-xs text-left truncate">
                    api.apytest.internal/v1
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Concurrency</label>
                    <div className="bg-background border border-border px-3 py-1.5 rounded-lg text-sm font-bold text-center text-cyan-500">
                      16 Workers
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Request Delay</label>
                    <div className="bg-background border border-border px-3 py-1.5 rounded-lg text-sm font-bold text-center text-muted-foreground">
                      0 ms
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Security Tests</label>
                    <span className="text-[10px] text-cyan-500 font-mono">Active (3/3)</span>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { icon: Shield,   color: 'text-cyan-500',   label: 'CORS Header Auditing' },
                      { icon: Zap,      color: 'text-purple-500', label: 'SQL Injection & XSS Check' },
                      { icon: Cpu,      color: 'text-cyan-500',   label: 'Rate Limit Penetration' },
                    ].map(({ icon: Icon, color, label }) => (
                      <div key={label} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-background/50 p-1.5 rounded border border-border/50">
                        <Icon className={`h-3.5 w-3.5 ${color} shrink-0`} />
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                {simDone ? (
                  <button
                    onClick={() => { resetSimulation(); }}
                    className="w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 bg-muted border border-border hover:bg-muted/80 text-foreground transition-all active:scale-[0.98]"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Re-run Simulation
                  </button>
                ) : (
                  <button
                    onClick={runSimulation}
                    className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                      simRunning
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white shadow-md shadow-cyan-500/10'
                    }`}
                  >
                    {simRunning ? (
                      <><StopCircle className="h-4 w-4" /> Cancel Simulation</>
                    ) : (
                      <><Play className="h-4 w-4" /> Start Mock Security Scan</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Terminal + stats */}
            <div className="lg:col-span-8 flex flex-col bg-slate-950 text-slate-100 p-5 font-mono text-xs text-left">

              {/* Stats row — now includes Avg Latency */}
              <div className="grid grid-cols-5 gap-2 border-b border-slate-800 pb-3 mb-3">
                {[
                  { label: 'REQUESTS', value: simStats.sent,      color: 'text-slate-100' },
                  { label: 'SUCCESS',  value: simStats.success,   color: 'text-emerald-400' },
                  { label: 'WARNINGS', value: simStats.warnings,  color: 'text-yellow-400' },
                  { label: 'VULNS',    value: simStats.errors,    color: 'text-red-400' },
                  { label: 'AVG LAT.', value: simStats.avgLatency > 0 ? `${simStats.avgLatency}ms` : '—', color: 'text-cyan-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-slate-900/50 p-2 rounded border border-slate-800/80">
                    <span className={`text-[10px] block mb-0.5 ${color}`}>{label}</span>
                    <span className={`text-sm font-bold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Log stream */}
              <div
                ref={logContainerRef}
                className="flex-1 overflow-y-auto max-h-[200px] space-y-1.5 scrollbar-thin select-text"
              >
                {simLogs.length === 0 ? (
                  <div className="text-slate-500 italic flex items-center gap-2 justify-center h-full">
                    <Terminal className="h-4 w-4" />
                    Click "Start Mock Security Scan" to run the simulator.
                  </div>
                ) : (
                  simLogs.map((log, i) => {
                    let cls = 'text-slate-300'
                    if (log.includes('500'))              cls = 'text-red-400'
                    if (log.includes('403'))              cls = 'text-yellow-400'
                    if (log.startsWith('[SECURITY-WARN]')) cls = 'text-yellow-500 font-semibold'
                    if (log.startsWith('[Ratelimit-WARN]')) cls = 'text-amber-500 font-semibold'
                    if (log.startsWith('[VULN-'))          cls = 'text-red-500 font-bold border-l-2 border-red-500 pl-1.5'
                    if (log.startsWith('[SYSTEM]'))        cls = 'text-cyan-400'
                    return <div key={i} className={`leading-relaxed whitespace-pre-wrap ${cls}`}>{log}</div>
                  })
                )}
              </div>

              {/* Progress bar */}
              {simRunning && (
                <div className="mt-4 border-t border-slate-800 pt-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Vulnerability Audit Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ---- Post-scan Summary Card ---- */}
              {simDone && (
                <div className="mt-4 border-t border-slate-800 pt-4 animate-fade-in-up">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-400" />
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Scan Summary</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {/* Score dial */}
                    <div className="col-span-1 flex items-center justify-center bg-slate-900/60 rounded-xl border border-slate-800 p-2">
                      <ScoreDial score={securityScore} />
                    </div>
                    {/* Summary stats */}
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      {[
                        { label: 'Total Requests', value: simStats.sent,      color: 'text-slate-100' },
                        { label: 'Avg Latency',    value: `${simStats.avgLatency}ms`, color: 'text-cyan-400' },
                        { label: 'Vulnerabilities',value: simStats.errors,    color: simStats.errors > 0 ? 'text-red-400' : 'text-emerald-400' },
                        { label: 'Warnings',       value: simStats.warnings,  color: simStats.warnings > 0 ? 'text-yellow-400' : 'text-emerald-400' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="bg-slate-900/60 rounded-lg border border-slate-800 p-2">
                          <div className="text-[10px] text-slate-500 mb-0.5">{label}</div>
                          <div className={`font-bold text-sm ${color}`}>{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-border/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Everything you need to verify API Integrity</h2>
          <p className="text-muted-foreground mt-4 text-base">apytest simplifies endpoint load testing, automated response assertion, and API penetration diagnostics inside an interface that feels fluid.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap,      color: 'cyan',   title: 'Hyper-Parallel Testing',       desc: 'Launch dozens of simultaneous workers to stress-test your backend. Measure latency percentiles, error rate thresholds, and API concurrency degradation.' },
            { icon: Shield,   color: 'purple', title: 'Vulnerability Diagnostics',    desc: 'Automatically scan headers for security compliance (CORS origins, Content-Security-Policy, HSTS rules) and verify proper auth barriers on endpoints.' },
            { icon: Cpu,      color: 'cyan',   title: 'Environment Automation',       desc: 'Use Postman-style {{variables}}. Manage separate staging, production, and sandbox environments with simple key-value config sheets.' },
            { icon: Activity, color: 'purple', title: 'WebSocket Live Stream',        desc: 'FastAPI backend runs worker threads and pipes real-time text output, logs, and latency stats directly to the web client using a WebSocket connection.' },
            { icon: Terminal, color: 'cyan',   title: 'Postman Import/Export',        desc: 'Directly import project profiles or export test configs into standard JSON schemas. Easily share endpoints, test rules, and variables across teammates.' },
            { icon: Lock,     color: 'purple', title: 'Local Credential Vault',       desc: 'Environment secrets and auth tokens are saved locally and fully redacted when exporting configs, ensuring no credential leaks.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div
              key={title}
              className={`bg-card/40 border border-border p-6 rounded-2xl hover:border-${color}-500/50 hover:bg-card/75 transition-all group hover:shadow-lg`}
            >
              <div className={`h-10 w-10 bg-${color}-500/10 rounded-xl flex items-center justify-center text-${color}-500 mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20 px-6 max-w-7xl mx-auto border-t border-border/60 bg-muted/20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Decoupled Architecture: Web vs. Desktop wrapper</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              apytest separates concerns into a reactive front-end dashboard and a high-efficiency scanning backend written in Python (FastAPI).
            </p>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              When packaging with desktop installers like Tauri or Electron, the frontend bundle is compiled into static HTML/JS assets and embedded directly inside the desktop runner.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { color: 'cyan',   title: 'Lightweight footprint', desc: 'Desktop wrapper files stay under 20MB using system-native rendering engines.' },
                { color: 'purple', title: 'Native APIs access',    desc: "Read/write config files directly from disk or prompt OS notifications using Tauri's native command bindings." },
              ].map(({ color, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <div className={`h-6 w-6 rounded-full bg-${color}-500/15 flex items-center justify-center text-${color}-500 shrink-0 mt-0.5`}>
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-card p-6 rounded-2xl shadow-xl">
            <h3 className="font-bold text-base mb-4 border-b border-border pb-2 flex items-center gap-2">
              <Monitor className="h-4 w-4 text-cyan-500" /> Runtime Topology
            </h3>
            <div className="space-y-4 font-mono text-xs">
              {[
                { color: 'cyan',   title: 'Tauri Desktop Shell (Rust)',            desc: 'Bootstraps OS window environment & hooks native filesystems/network adapters.' },
                { sep: '↓ (Hosts WebView Core)' },
                { color: 'cyan',   title: 'Vite + React Dashboard (Frontend Bundle)', desc: 'Renders lists, KV environment editors, config overrides, and terminal monitor charts.' },
                { sep: '↓ (WebSocket IPC / HTTP)' },
                { color: 'purple', title: 'FastAPI Scanner Agent (Backend Runner)',    desc: 'Spawns async worker tasks to execute API packets, capture times, and report results.' },
              ].map((item, i) =>
                'sep' in item ? (
                  <div key={i} className="flex justify-center text-muted-foreground text-sm font-bold py-0.5">{item.sep}</div>
                ) : (
                  <div key={i} className="border border-border bg-muted/40 p-3 rounded-lg text-left">
                    <div className={`font-bold text-${item.color}-500 text-[10px] uppercase tracking-wider mb-1`}>{item.title}</div>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Desktop Section */}
      <section id="desktop" className="py-20 px-6 max-w-7xl mx-auto border-t border-border/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Unleash Full Potential with the Desktop App</h2>
          <p className="text-muted-foreground mt-4 text-base">Running security diagnostics directly inside standard web browsers comes with sandbox limitations. Desktop client bypasses boundaries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: WifiOff,   color: 'cyan',   title: 'Bypass Browser CORS',       desc: 'The desktop client operates via system sockets, letting you test ANY server regardless of CORS headers.' },
            { icon: Globe,     color: 'purple', title: 'Local / VPN Network Access', desc: 'Securely query endpoints on localhost, internal staging databases, or private subnets via VPN — without public proxies.' },
            { icon: FileCheck, color: 'cyan',   title: 'Direct Local Storage',      desc: 'Read and write project profiles directly from your desktop directories. No browser clearouts wiping your configs.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-card/30 border border-border p-6 rounded-2xl flex flex-col gap-3">
              <div className={`h-10 w-10 bg-${color}-500/10 rounded-xl flex items-center justify-center text-${color}-500 shrink-0`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-base mt-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="border border-border/80 bg-gradient-to-br from-card/30 to-muted/20 rounded-3xl p-8 max-w-4xl mx-auto glow-purple">
          <h3 className="text-xl md:text-2xl font-extrabold text-center mb-8">Get Desktop Installer (Pre-Release Roadmap)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { os: 'Windows', color: 'cyan',   name: 'apytest_Win_x64',     sub: 'Windows 10 / 11 Supported',  ext: '.msi' },
              { os: 'macOS',   color: 'purple', name: 'apytest_Mac_Apple',   sub: 'Universal DMG / Apple Silicon', ext: '.dmg' },
              { os: 'Linux',   color: 'cyan',   name: 'apytest_Linux_amd64', sub: 'Ubuntu / Debian / AppImage', ext: '.deb' },
            ].map(({ os, color, name, sub, ext }) => (
              <div key={os} className={`bg-card border border-border hover:border-${color}-500/40 p-5 rounded-2xl flex flex-col justify-between items-center text-center group transition-colors`}>
                <div className="space-y-3">
                  <span className={`text-xs font-bold text-${color}-500 uppercase tracking-widest`}>{os}</span>
                  <h4 className="font-bold text-base">{name}</h4>
                  <p className="text-[11px] text-muted-foreground">{sub}</p>
                  <div className="text-xs bg-muted px-2 py-1 rounded font-mono">v1.2.0-beta</div>
                </div>
                <button
                  onClick={onLaunchApp}
                  className="mt-6 w-full bg-muted border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-transparent py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Download className="h-3.5 w-3.5" /> Download {ext}
                </button>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-6 uppercase tracking-wider font-mono">
            Note: Clicking download templates triggers the Web App directly on current workspace.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-auto bg-card/10">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-semibold">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-foreground">apytest</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#features"     className="hover:text-foreground transition-colors">Features</a>
            <a href="#architecture" className="hover:text-foreground transition-colors">Architecture</a>
            <a href="#desktop"      className="hover:text-foreground transition-colors">Desktop App</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
