import { useEffect, useState, type ReactNode } from 'react'
import type { GameState, Settings } from '../game/types'
import type { SessionInfo } from '../net/session'

export function Shell({ children, dim }: { children: ReactNode; dim?: boolean }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#0a0a0a] text-[#f0e6d8]">
      {/* Atmospheric Background */}
      <img
        src="/valorant-bg.jpg"
        alt="Valorant Floating Island"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center brightness-40 contrast-110 saturate-75 filter"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/80 to-[#0a0a0a]/65" />
      <div className={`relative z-10 flex min-h-dvh flex-col px-5 pb-[max(1.2rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] ${dim ? 'bg-[#0a0a0a]/60 backdrop-blur-md' : ''}`}>
        {children}
      </div>
    </div>
  )
}

export function Logo() {
  return (
    <div>
      <h1 className="distressed-logo text-5xl font-black tracking-[0.16em] text-white sm:text-6xl md:text-7xl">
        LAST LIGHT
      </h1>
      <p className="mt-1 text-[11px] font-mono tracking-[0.35em] text-[#ff6a00]/70 uppercase">
        SURVIVE TOGETHER · ESCAPE BEFORE DARK
      </p>
    </div>
  )
}

export function MenuButton({
  label,
  onClick,
  primary,
  note,
  disabled,
}: {
  label: string
  onClick: () => void
  primary?: boolean
  note?: string
  disabled?: boolean
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-full rounded-2xl border px-4 py-3 text-left transition ${primary ? 'border-[#e85d04] bg-gradient-to-r from-[#c41e1e] to-[#e85d04] text-white' : 'border-[#ff6a00]/15 bg-black/50 text-ivory hover:border-[#ff6a00]/40'} disabled:opacity-40`}
    >
      <div className="text-sm font-semibold tracking-wide">{label}</div>
      {note ? <div className="mt-1 text-[11px] opacity-70">{note}</div> : null}
    </button>
  )
}

export function MainMenu({
  callsign,
  onPlayStory,
  onMultiplayer,
  onHelpGuide,
  onSettings,
  onExit,
  onPlay,
  onSolo,
  onMulti,
  onHow,
}: {
  online?: boolean
  callsign?: string
  onPlay?: () => void
  onSolo?: () => void
  onMulti?: () => void
  onPass?: () => void
  onHow?: () => void
  onSettings: () => void
  onCredits?: () => void
  onPlayStory?: () => void
  onMultiplayer?: () => void
  onHelpGuide?: () => void
  onExit?: () => void
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const menuItems = [
    { label: 'PLAY STORY', action: onPlayStory ?? onSolo ?? onPlay },
    { label: 'MULTIPLAYER', action: onMultiplayer ?? onMulti },
    { label: 'HELP & GUIDE', action: onHelpGuide ?? onHow },
    { label: 'SETTINGS', action: onSettings },
    { label: 'EXIT', action: onExit ?? onSolo },
  ]

  const activeIndex = hoverIndex !== null ? hoverIndex : selectedIndex

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        menuItems[activeIndex]?.action?.()
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onExit?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeIndex, menuItems, onExit])

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#0a0a0a] text-ivory select-none">
      {/* Fullscreen Atmospheric Background Graphic */}
      <img
        src="/menu-bg.jpg"
        alt="Facility corridor"
        className="absolute inset-0 h-full w-full object-cover object-center brightness-50 contrast-110 saturate-75 filter"
      />

      {/* SVG filter for rough grunge stencil logo */}
      <svg className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <filter id="grunge-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.065" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* Left Smoky / Ink Shadow Vignette Overlay */}
      <div className="left-smoke-overlay pointer-events-none absolute inset-y-0 left-0 w-full sm:w-[55%] md:w-[48%] lg:w-[42%]" />

      {/* Subtle top/bottom edge gradients */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/95 to-transparent" />

      {/* Main Content Area */}
      <div className="relative z-10 flex min-h-dvh flex-col justify-between px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.8rem,env(safe-area-inset-top))] sm:px-12 md:px-16">
        {/* Top Bar Indicator */}
        <div className="flex items-center gap-3 text-[11px] font-mono tracking-widest text-ivory/50 uppercase">
          <span className="inline-block h-2 w-2 rounded-full bg-[#ff6a00] animate-pulse" />
          <span>Sector-04 Offline Facility</span>
          {callsign ? <span className="text-[#ff6a00]/90">· Operator: {callsign}</span> : null}
        </div>

        {/* Center-Left Brand & Menu */}
        <div className="my-auto max-w-lg py-8">
          {/* Weathered Stencil Title */}
          <div className="mb-7">
            <h1 className="distressed-logo text-5xl font-black tracking-[0.16em] text-white sm:text-6xl md:text-7xl">
              LAST LIGHT
            </h1>
          </div>

          {/* Vertical Menu Buttons */}
          <nav className="flex flex-col items-start gap-4" aria-label="Main menu">
            {menuItems.map((item, idx) => {
              const isPill = activeIndex === idx
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSelectedIndex(idx)
                    item.action?.()
                  }}
                  onMouseEnter={() => setHoverIndex(idx)}
                  onMouseLeave={() => setHoverIndex(null)}
                  className="group relative flex cursor-pointer items-center text-left transition-all duration-150 focus:outline-none"
                >
                  {isPill ? (
                    <span className="torn-paper-pill text-base sm:text-lg">
                      {item.label}
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-base sm:text-lg font-bold tracking-[0.2em] text-ivory/85 transition-colors duration-150 group-hover:text-white">
                      {item.label}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between text-xs font-mono tracking-widest text-ivory/50">
          <div className="text-[11px] uppercase tracking-wider text-ivory/40">
            Survival Engine v1.0 · P2P LAN Mode
          </div>
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-2 hover:text-[#ff6a00] transition font-mono cursor-pointer"
          >
            <span>[ESC]</span>
            <span>EXIT</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export function HowToPlay({ onBack }: { onBack: () => void }) {
  return (
    <Shell>
      <Back onBack={onBack} />
      <h2 className="mt-4 font-display text-3xl">How to Play</h2>
      <ul className="mt-4 max-w-lg space-y-3 text-sm text-ivory/80">
        <li>Move with the left stick. Drag the right side to look. Jump, sprint, and interact on the right.</li>
        <li>Collect metal, batteries, meds, and repair components. Craft a repair kit at the bunker.</li>
        <li>Repair the generator, restore the beacon, then hold the extraction zone until rescue.</li>
        <li>Creatures cannot attack through buildings. Break line of sight and run.</li>
        <li>Local multiplayer uses a QR / copy-paste WebRTC handshake. A room code alone does not connect devices.</li>
      </ul>
    </Shell>
  )
}

export function Credits({ onBack }: { onBack: () => void }) {
  return (
    <Shell>
      <Back onBack={onBack} />
      <h2 className="mt-4 font-display text-3xl">Credits</h2>
      <p className="mt-4 max-w-lg text-sm text-ivory/75">
        LAST LIGHT is an original offline-first prototype. Environment geometry is procedural. Audio is synthesized locally with the Web Audio API. No cloud accounts and no remote game server are required for solo play.
      </p>
    </Shell>
  )
}

export function SettingsScreen({
  settings,
  setSettings,
  onBack,
}: {
  settings: Settings
  setSettings: (s: Settings) => void
  onBack: () => void
}) {
  return (
    <Shell>
      <Back onBack={onBack} />
      <h2 className="mt-4 font-display text-3xl">Settings</h2>
      <div className="mt-5 max-w-lg space-y-4 text-sm">
        <label className="block">Camera sensitivity {settings.sensitivity.toFixed(1)}
          <input className="mt-2 w-full accent-[#ff6a00]" type="range" min={0.4} max={2} step={0.1} value={settings.sensitivity} onChange={(e) => setSettings({ ...settings, sensitivity: Number(e.target.value) })} />
        </label>
        <label className="block">Field of view {settings.fov}
          <input className="mt-2 w-full accent-[#ff6a00]" type="range" min={50} max={75} value={settings.fov} onChange={(e) => setSettings({ ...settings, fov: Number(e.target.value) })} />
        </label>
        <label className="block">Effects {Math.round(settings.sfx * 100)}%
          <input className="mt-2 w-full accent-[#ff6a00]" type="range" min={0} max={1} step={0.05} value={settings.sfx} onChange={(e) => setSettings({ ...settings, sfx: Number(e.target.value) })} />
        </label>
        <label className="block">Ambience {Math.round(settings.ambience * 100)}%
          <input className="mt-2 w-full accent-[#ff6a00]" type="range" min={0} max={1} step={0.05} value={settings.ambience} onChange={(e) => setSettings({ ...settings, ambience: Number(e.target.value) })} />
        </label>
        <Row label="Left-handed controls">
          <Toggle on={settings.leftHanded} set={(v) => setSettings({ ...settings, leftHanded: v })} />
        </Row>
        <Row label="Vibration">
          <Toggle on={settings.vibration} set={(v) => setSettings({ ...settings, vibration: v })} />
        </Row>
        <Row label="Show FPS">
          <Toggle on={settings.showFps} set={(v) => setSettings({ ...settings, showFps: v })} />
        </Row>
        <div>
          <p className="mb-2">Graphics</p>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((q) => (
              <button key={q} className={`rounded-xl border px-3 py-2 capitalize ${settings.quality === q ? 'border-[#ff6a00] text-[#ff6a00] shadow-[0_0_8px_rgba(255,106,0,0.3)]' : 'border-ivory/20'}`} onClick={() => setSettings({ ...settings, quality: q })}>{q}</button>
            ))}
          </div>
        </div>
        <Row label="STUN assist (pairing only, needs internet)">
          <Toggle on={settings.useStun} set={(v) => setSettings({ ...settings, useStun: v })} />
        </Row>
        <p className="text-xs text-ivory/50">STUN is off by default so pairing can stay on the LAN. Enable it only if host ICE candidates fail.</p>
      </div>
    </Shell>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      {children}
    </div>
  )
}

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button className={`h-7 w-12 rounded-full ${on ? 'bg-gradient-to-r from-[#c41e1e] to-[#e85d04]' : 'bg-ivory/20'}`} onClick={() => set(!on)}>
      <span className={`block h-6 w-6 rounded-full bg-charcoal transition ${on ? 'translate-x-5' : 'translate-x-1'}`} />
    </button>
  )
}

function Back({ onBack }: { onBack: () => void }) {
  return (
    <button className="text-xs tracking-[0.2em] text-[#ff6a00]" onClick={onBack}>← BACK</button>
  )
}

export function ModeSelect({
  onSolo,
  onHost,
  onJoin,
  onPass,
  onBack,
}: {
  onSolo: () => void
  onHost: () => void
  onJoin: () => void
  onPass: () => void
  onBack: () => void
}) {
  return (
    <Shell>
      <Back onBack={onBack} />
      <h2 className="mt-4 font-display text-3xl">Select Mode</h2>
      <div className="mx-auto mt-6 flex w-full max-w-md flex-col gap-3">
        <MenuButton primary label="Solo Survival" note="Implemented · AI, objectives, extraction" onClick={onSolo} />
        <MenuButton label="Create local session (Host)" note="Implemented · 2-player WebRTC proof of concept" onClick={onHost} />
        <MenuButton label="Join local session" note="Scan or paste the host offer, then return an answer" onClick={onJoin} />
        <MenuButton label="Pass-and-Play" note="Implemented · turn-based, one device" onClick={onPass} />
        <MenuButton label="8–12 player sessions" note="Not implemented · blocked until 4-player sync is tested" disabled onClick={() => undefined} />
      </div>
    </Shell>
  )
}

export function Lobby({
  info,
  onReady,
  ready,
  onStart,
  onLeave,
  canStart,
}: {
  info: SessionInfo
  onReady: () => void
  ready: boolean
  onStart: () => void
  onLeave: () => void
  canStart: boolean
}) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 top-[max(0.6rem,env(safe-area-inset-top))] z-30 mx-auto w-[min(100%,28rem)] px-4">
      <div className="rounded-2xl border border-[#ff6a00]/15 bg-black/75 p-4 backdrop-blur">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-ivory/60">
          <span>{info.role === 'host' ? 'Host' : 'Guest'}</span>
          <span>{info.status}</span>
        </div>
        <p className="mt-2 text-sm text-ivory/80">{info.detail}</p>
        <p className="mt-1 text-[11px] text-ivory/50">Session {info.sessionId || '—'} · 2-player WebRTC proof of concept</p>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => {
            const p = info.players[i]
            const locked = i >= 2
            return (
              <div key={i} className="flex items-center justify-between rounded-xl border border-[#ff6a00]/10 px-3 py-2 text-sm">
                <span>{p ? p.name : locked ? `Slot ${i + 1} (4-player not enabled)` : `Open slot ${i + 1}`}</span>
                <span className="text-[11px] uppercase text-ivory/50">{p ? `${p.host ? 'Host · ' : ''}${p.ready ? 'Ready' : 'Not ready'} · ${p.connected ? 'Live' : 'Lost'}` : locked ? 'Later' : 'Empty'}</span>
              </div>
            )
          })}
        </div>
        {info.reconnectUntil ? <p className="mt-2 text-xs text-[#ff6a00]">Reconnect window until {new Date(info.reconnectUntil).toLocaleTimeString()}</p> : null}
        <div className="mt-3 flex gap-2">
          <button className="flex-1 rounded-xl border border-ivory/20 py-2 text-sm" onClick={onReady}>{ready ? 'Unready' : 'Ready'}</button>
          {info.role === 'host' ? (
            <button className="flex-1 rounded-xl bg-gradient-to-r from-[#c41e1e] to-[#e85d04] py-2 text-sm text-white disabled:opacity-40" disabled={!canStart} onClick={onStart}>
              Start match
            </button>
          ) : null}
          <button className="rounded-xl border border-[#c41e1e]/40 px-3 py-2 text-sm text-[#c41e1e]" onClick={onLeave}>Leave</button>
        </div>
        {info.role === 'host' && !canStart ? (
          <p className="mt-2 text-[11px] text-ivory/50">Host start requires a live guest, both Ready, and an open data channel.</p>
        ) : null}
      </div>
    </div>
  )
}

export function Results({
  state,
  onRematch,
  onRestart,
  onMenu,
}: {
  state: GameState
  onRematch?: () => void
  onRestart?: () => void
  onMenu: () => void
}) {
  const win = state.outcome === 'victory'
  const handleRestart = onRestart ?? onRematch ?? onMenu

  const grade = win
    ? state.matchSeconds < 180
      ? { rank: 'S', title: 'APEX SURVIVOR', color: '#ffb703', note: 'Rapid Evacuation' }
      : { rank: 'A', title: 'VANGUARD SPECIALIST', color: '#ff6a00', note: 'Successful Extraction' }
    : state.beaconOn
    ? { rank: 'B', title: 'FALLEN AT EXTRACT', color: '#e85d04', note: 'Beacon Activated' }
    : state.generatorOn
    ? { rank: 'C', title: 'FACILITY OPERATOR', color: '#c41e1e', note: 'Generator Restored' }
    : { rank: 'D', title: 'MIA IN THE SQUALL', color: '#882222', note: 'Overrun Before Generator' }

  const mins = Math.floor(state.matchSeconds / 60)
  const secs = Math.floor(state.matchSeconds % 60)

  return (
    <Shell dim>
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between border-b border-[#ff6a00]/20 pb-3 text-[10px] font-mono tracking-widest uppercase text-ivory/60">
        <span>MISSION REPORT // SECTOR-04</span>
        <span className={win ? 'text-emerald-400 font-bold' : 'text-[#c41e1e] font-bold'}>
          {win ? 'STATUS: RESCUED' : 'STATUS: SIGNAL LOST'}
        </span>
      </div>

      {/* Main Outcome Callout & Performance Badge */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded text-[10px] font-mono tracking-[0.25em] uppercase font-black val-cut-btn" style={{ background: win ? '#ff6a00' : '#c41e1e', color: '#fff' }}>
            {win ? '★ EVACUATION COMPLETE' : '✕ DEFEAT // SURVIVOR DOWN'}
          </div>
          <h2 className="mt-2 font-display text-4xl sm:text-5xl font-black tracking-wide text-white">
            {win ? 'Island Evacuated' : 'The Dark Took The Island'}
          </h2>
          <p className="mt-1 text-xs text-ivory/70 font-mono">
            Elapsed Match Time: <span className="text-white font-bold">{mins}m {secs}s</span> · Reason: <span className="text-[#ff8800] uppercase">{state.outcome}</span>
          </p>
        </div>

        {/* Tactical Performance Rank Badge */}
        <div className="flex items-center gap-3 rounded-xl border border-[#ff6a00]/30 bg-black/60 p-3.5 shadow-[0_0_20px_rgba(255,106,0,0.2)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg font-black text-3xl font-display shadow-inner" style={{ background: grade.color, color: '#000' }}>
            {grade.rank}
          </div>
          <div className="text-left font-mono">
            <div className="text-xs font-bold text-white uppercase tracking-wider">{grade.title}</div>
            <div className="text-[10px] text-ivory/50">{grade.note}</div>
          </div>
        </div>
      </div>

      {/* Objective Progression Checklist */}
      <div className="mt-5 rounded-xl border border-[#ff6a00]/20 bg-black/50 p-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff6a00] font-bold mb-2.5">
          MISSION OBJECTIVES CHECKLIST
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className={`p-2 rounded border flex items-center gap-2 ${state.foundRepair ? 'border-[#ff6a00]/40 bg-[#ff6a00]/10 text-white' : 'border-white/10 text-white/40'}`}>
            <span>{state.foundRepair ? '✓' : '○'}</span>
            <span>Scavenge Parts</span>
          </div>
          <div className={`p-2 rounded border flex items-center gap-2 ${state.generatorOn ? 'border-[#ff6a00]/40 bg-[#ff6a00]/10 text-white' : 'border-white/10 text-white/40'}`}>
            <span>{state.generatorOn ? '✓' : '○'}</span>
            <span>Generator Fixed</span>
          </div>
          <div className={`p-2 rounded border flex items-center gap-2 ${state.beaconOn ? 'border-[#ff6a00]/40 bg-[#ff6a00]/10 text-white' : 'border-white/10 text-white/40'}`}>
            <span>{state.beaconOn ? '✓' : '○'}</span>
            <span>Ridge Beacon</span>
          </div>
          <div className={`p-2 rounded border flex items-center gap-2 ${win ? 'border-[#ff6a00]/40 bg-[#ff6a00]/10 text-white' : 'border-white/10 text-white/40'}`}>
            <span>{win ? '✓' : '○'}</span>
            <span>Helicopter Evac</span>
          </div>
        </div>
      </div>

      {/* Survivor Scorecards */}
      <div className="mt-4 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-ivory/50">OPERATOR DEBRIEF</div>
        {state.players.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/10 bg-black/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>👤 {p.name}</span>
                {p.dead ? <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-400 font-mono">K.I.A</span> : <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 font-mono">SURVIVED</span>}
              </div>
              <div className="text-xs text-ivory/60 font-mono mt-0.5">
                Items Scavenged: <span className="text-white font-bold">{p.stats.collected}</span> · Generator Repairs: <span className="text-white font-bold">{p.stats.repairs}</span>
              </div>
            </div>
            <div className="text-xs font-mono text-ivory/70 sm:text-right">
              Damage Sustained: <span className="text-[#ff8800] font-bold">{Math.round(p.stats.damageTaken)} HP</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Footer with PROMINENT RESTART BUTTON */}
      <div className="mt-auto flex flex-col sm:flex-row gap-3 pt-6 pb-2">
        <button
          className="flex-1 rounded-xl bg-gradient-to-r from-[#c41e1e] via-[#e85d04] to-[#ff6a00] py-4 text-center font-black uppercase tracking-[0.22em] text-white shadow-[0_0_30px_rgba(255,106,0,0.6)] hover:brightness-110 active:scale-[0.99] transition cursor-pointer flex items-center justify-center gap-2 text-sm sm:text-base val-cut-btn"
          onClick={handleRestart}
        >
          <span className="text-lg">🔄</span>
          <span>RESTART MISSION</span>
        </button>

        <button
          className="rounded-xl border border-white/20 bg-black/40 px-6 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ivory/80 hover:text-white hover:border-[#ff6a00]/50 transition cursor-pointer val-cut-btn"
          onClick={onMenu}
        >
          Return to Menu
        </button>
      </div>
    </Shell>
  )
}

export function HostLost({ onMenu, onReconnect }: { onMenu: () => void; onReconnect?: () => void }) {
  return (
    <Shell>
      <p className="text-xs tracking-[0.3em] text-[#c41e1e]">HOST DISCONNECTED</p>
      <h2 className="mt-3 font-display text-4xl">No host migration</h2>
      <p className="mt-3 max-w-md text-sm text-ivory/75">
        The host owned health, enemies, inventory, and objectives. Authority does not move to this device. If the host is still in the reconnect window, they must generate a new offer (SDP + ICE). A room code is not enough.
      </p>
      {onReconnect ? (
        <button className="mt-8 rounded-2xl bg-gradient-to-r from-[#c41e1e] to-[#e85d04] px-6 py-3 text-white" onClick={onReconnect}>
          Reconnect with a new offer
        </button>
      ) : null}
      <button className="mt-3 rounded-2xl border border-ivory/20 px-6 py-3" onClick={onMenu}>Return to Menu</button>
    </Shell>
  )
}
