import { type ReactNode } from 'react'
import type { GameState, Settings } from '../game/types'
import type { SessionInfo } from '../net/session'
import { CornerFlourish, Insignia, MetallicDivider } from './FantasyIcons'

export function Shell({
  children,
  dim,
  bg = '/cinematic-bg.jpg',
}: {
  children: ReactNode
  dim?: boolean
  bg?: string
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#171819] text-[#E8E4DC] select-none font-sans">
      {/* 4K Cinematic Atmosphere Background */}
      <img
        src={bg}
        alt="Atmospheric Backdrop"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center brightness-45 contrast-110 filter"
      />
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(23,24,25,0.85)_100%]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171819] via-[#171819]/70 to-[#171819]/85" />

      <div
        className={`relative z-10 flex min-h-dvh flex-col px-4 sm:px-8 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.2rem,env(safe-area-inset-top))] ${
          dim ? 'bg-[#171819]/60 backdrop-blur-md' : ''
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export function Back({ onBack, label = '← RETURN TO CITADEL' }: { onBack: () => void; label?: string }) {
  return (
    <button
      onClick={onBack}
      className="df-btn-silver self-start px-3.5 py-1.5 text-xs font-cinzel font-bold tracking-[0.2em] cursor-pointer"
    >
      {label}
    </button>
  )
}

export function MenuButton({
  label,
  onClick,
  primary = false,
  note,
  disabled = false,
}: {
  label: string
  onClick: () => void
  primary?: boolean
  note?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full text-left py-3 px-4 rounded-xs transition cursor-pointer ${
        primary
          ? 'df-btn-gold text-center font-cinzel font-bold text-xs tracking-[0.2em]'
          : 'df-btn-silver font-cinzel text-xs tracking-wider'
      } ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div>{label}</div>
      {note ? <div className="text-[10px] text-white/50 font-mono tracking-normal mt-0.5">{note}</div> : null}
    </button>
  )
}

export function HowToPlay({ onBack }: { onBack: () => void }) {
  return (
    <Shell>
      <Back onBack={onBack} />
      <div className="df-panel mx-auto mt-6 w-full max-w-2xl p-6 sm:p-8 relative">
        <CornerFlourish position="top-left" color="#C59B61" size={20} />
        <CornerFlourish position="top-right" color="#C59B61" size={20} />
        <CornerFlourish position="bottom-left" color="#C59B61" size={20} />
        <CornerFlourish position="bottom-right" color="#C59B61" size={20} />

        <div className="flex items-center gap-3">
          <Insignia className="h-8 w-8" />
          <h2 className="font-cinzel text-2xl sm:text-3xl font-black tracking-widest text-[#E8E4DC]">
            SURVIVAL MANUAL
          </h2>
        </div>

        <MetallicDivider label="CORE EXPEDITION DIRECTIVES" className="my-4" />

        <div className="space-y-4 text-xs sm:text-sm text-[#E8E4DC]/90 leading-relaxed font-sans">
          <div className="flex items-start gap-3 p-3 rounded-xs border border-[#AAA69B]/15 bg-[#171819]/60">
            <span className="font-cinzel font-bold text-[#C59B61] text-sm">01.</span>
            <div>
              <span className="font-cinzel font-bold text-[#E8E4DC] block mb-0.5">TERRAIN TRAVERSAL</span>
              Left thumb stick commands movement. Swipe the right half of the display to orbit your perspective. Jump, sprint, crouch, and interact buttons flank the right thumb zone.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xs border border-[#AAA69B]/15 bg-[#171819]/60">
            <span className="font-cinzel font-bold text-[#C59B61] text-sm">02.</span>
            <div>
              <span className="font-cinzel font-bold text-[#E8E4DC] block mb-0.5">TECH SALVAGE & CRAFTING</span>
              Scour the clearing and facility perimeter for Alloy Salvage, Circuit Harnesses, Batteries, and Nano-Meds. Combine salvage at the bunker workbench to forge emergency Repair Kits.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xs border border-[#AAA69B]/15 bg-[#171819]/60">
            <span className="font-cinzel font-bold text-[#C59B61] text-sm">03.</span>
            <div>
              <span className="font-cinzel font-bold text-[#E8E4DC] block mb-0.5">GRID OVERHAUL & EVACUATION BEACON</span>
              Repair the maintenance bunker generator with a calibrated kit, ignite the cliffside beacon on the ridge, and defend the rescue zone until air extraction arrives.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xs border border-[#AAA69B]/15 bg-[#171819]/60">
            <span className="font-cinzel font-bold text-[#C59B61] text-sm">04.</span>
            <div>
              <span className="font-cinzel font-bold text-[#E8E4DC] block mb-0.5">BIOLOGICAL STALKERS</span>
              Stalkers respond to sprint footfalls and optical line of sight. They cannot breach reinforced bunker walls. Break line-of-sight and sprint into shelters.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xs border border-[#AAA69B]/15 bg-[#171819]/60">
            <span className="font-cinzel font-bold text-[#C59B61] text-sm">05.</span>
            <div>
              <span className="font-cinzel font-bold text-[#E8E4DC] block mb-0.5">LOCAL P2P MULTIPLAYER</span>
              Two devices on the same Wi-Fi/hotspot establish a direct WebRTC data connection via QR scanning or clipboard tokens—no remote game server required.
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}

export function Credits({ onBack }: { onBack: () => void }) {
  return (
    <Shell>
      <Back onBack={onBack} />
      <div className="df-panel mx-auto mt-8 w-full max-w-xl p-8 relative text-center">
        <CornerFlourish position="top-left" color="#C59B61" size={24} />
        <CornerFlourish position="top-right" color="#C59B61" size={24} />
        <CornerFlourish position="bottom-left" color="#C59B61" size={24} />
        <CornerFlourish position="bottom-right" color="#C59B61" size={24} />

        <Insignia className="h-16 w-16 mx-auto mb-4" spin />
        <h2 className="font-cinzel text-3xl font-black tracking-widest text-[#E8E4DC]">
          LAST LIGHT
        </h2>
        <p className="font-editorial text-sm italic text-[#C59B61] mt-1">
          Survive Together. Escape Before Dark.
        </p>

        <MetallicDivider className="my-5" />

        <div className="space-y-3 text-xs text-[#AAA69B] leading-relaxed font-sans">
          <p>
            LAST LIGHT is an original offline-first cinematic 3D survival game engineered with React Three Fiber, WebGL, Web Audio API, and host-authoritative WebRTC data architecture.
          </p>
          <p>
            Environment geometry, weather shaders, audio synthesis, and finite-state machine AI operate 100% locally on the device without mandatory cloud dependency.
          </p>
        </div>

        <div className="mt-8 pt-4 border-t border-[#AAA69B]/20 text-[10px] font-cinzel text-[#AAA69B]/60 uppercase tracking-[0.25em]">
          RESEARCH SECTOR 04 // PROTOCOL v2.0
        </div>
      </div>
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
      <div className="df-panel mx-auto mt-6 w-full max-w-xl p-6 sm:p-8 relative">
        <CornerFlourish position="top-left" color="#C59B61" size={20} />
        <CornerFlourish position="top-right" color="#C59B61" size={20} />
        <CornerFlourish position="bottom-left" color="#C59B61" size={20} />
        <CornerFlourish position="bottom-right" color="#C59B61" size={20} />

        <h2 className="font-cinzel text-2xl sm:text-3xl font-black tracking-widest text-[#E8E4DC]">
          CITADEL SETTINGS
        </h2>
        <p className="font-cinzel text-[10px] tracking-[0.28em] text-[#C59B61] uppercase mt-0.5">
          HARDWARE & CONTROL CONFIGURATION
        </p>

        <MetallicDivider className="my-4" />

        <div className="space-y-4 text-xs font-sans">
          {/* Sensitivity */}
          <div>
            <div className="flex justify-between font-cinzel text-[11px] uppercase tracking-wider text-[#E8E4DC] mb-1">
              <span>Camera Sensitivity</span>
              <span className="font-mono text-[#C59B61]">{settings.sensitivity.toFixed(1)}x</span>
            </div>
            <input
              className="w-full accent-[#C59B61]"
              type="range"
              min={0.4}
              max={2}
              step={0.1}
              value={settings.sensitivity}
              onChange={(e) => setSettings({ ...settings, sensitivity: Number(e.target.value) })}
            />
          </div>

          {/* Sound FX */}
          <div>
            <div className="flex justify-between font-cinzel text-[11px] uppercase tracking-wider text-[#E8E4DC] mb-1">
              <span>Sound Effects</span>
              <span className="font-mono text-[#C59B61]">{Math.round(settings.sfx * 100)}%</span>
            </div>
            <input
              className="w-full accent-[#C59B61]"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.sfx}
              onChange={(e) => setSettings({ ...settings, sfx: Number(e.target.value) })}
            />
          </div>

          {/* Ambience */}
          <div>
            <div className="flex justify-between font-cinzel text-[11px] uppercase tracking-wider text-[#E8E4DC] mb-1">
              <span>Atmospheric Ambience</span>
              <span className="font-mono text-[#C59B61]">{Math.round(settings.ambience * 100)}%</span>
            </div>
            <input
              className="w-full accent-[#C59B61]"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.ambience}
              onChange={(e) => setSettings({ ...settings, ambience: Number(e.target.value) })}
            />
          </div>

          {/* Graphics Quality */}
          <div>
            <span className="font-cinzel text-[11px] uppercase tracking-wider text-[#E8E4DC] block mb-2">
              Visual Fidelity
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setSettings({ ...settings, quality: q })}
                  className={`py-2 text-center font-cinzel text-[11px] font-bold uppercase tracking-wider border transition ${
                    settings.quality === q
                      ? 'border-[#C59B61] bg-[#C59B61]/25 text-white shadow-[0_0_12px_rgba(197,155,97,0.3)]'
                      : 'border-[#AAA69B]/20 bg-[#171819]/60 text-[#AAA69B]'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <MetallicDivider className="my-3" />

          {/* Toggles */}
          <div className="space-y-3">
            <Row label="Left-Handed Touch Layout">
              <Toggle on={settings.leftHanded} set={(v) => setSettings({ ...settings, leftHanded: v })} />
            </Row>
            <Row label="Tactile Haptic Feedback">
              <Toggle on={settings.vibration} set={(v) => setSettings({ ...settings, vibration: v })} />
            </Row>
            <Row label="Telemetry FPS Counter">
              <Toggle on={settings.showFps} set={(v) => setSettings({ ...settings, showFps: v })} />
            </Row>
            <Row label="STUN Assist (Internet only)">
              <Toggle on={settings.useStun} set={(v) => setSettings({ ...settings, useStun: v })} />
            </Row>
          </div>
        </div>
      </div>
    </Shell>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between font-cinzel text-xs text-[#E8E4DC]">
      <span>{label}</span>
      {children}
    </div>
  )
}

function Toggle({ on, set }: { on: boolean; set: (v: boolean) => void }) {
  return (
    <button
      className={`h-6 w-11 rounded-full border transition cursor-pointer ${
        on ? 'border-[#C59B61] bg-[#C59B61]/40' : 'border-[#AAA69B]/30 bg-[#171819]'
      }`}
      onClick={() => set(!on)}
    >
      <span
        className={`block h-4 w-4 rounded-full transition transform ${
          on ? 'translate-x-5 bg-[#C59B61]' : 'translate-x-1 bg-[#AAA69B]'
        }`}
      />
    </button>
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
      <div className="df-panel mx-auto mt-6 w-full max-w-xl p-6 sm:p-8 relative">
        <CornerFlourish position="top-left" color="#C59B61" size={20} />
        <CornerFlourish position="top-right" color="#C59B61" size={20} />
        <CornerFlourish position="bottom-left" color="#C59B61" size={20} />
        <CornerFlourish position="bottom-right" color="#C59B61" size={20} />

        <h2 className="font-cinzel text-2xl sm:text-3xl font-black tracking-widest text-[#E8E4DC]">
          EXPEDITION MODE
        </h2>
        <p className="font-cinzel text-[10px] tracking-[0.28em] text-[#C59B61] uppercase mt-0.5">
          DEPLOYMENT PROTOCOL
        </p>

        <MetallicDivider className="my-4" />

        <div className="space-y-3">
          <button
            onClick={onSolo}
            className="w-full df-panel df-panel-hover p-4 text-left border border-[#C59B61]/50 cursor-pointer transition relative"
          >
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-sm font-bold text-[#FFFFFF] tracking-wider">
                🛡️ SOLO SURVIVAL
              </span>
              <span className="font-cinzel text-[9px] uppercase tracking-widest text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5">
                AVAILABLE
              </span>
            </div>
            <p className="mt-1 text-xs text-[#AAA69B]">
              Full singleplayer campaign. Scavenge components, restart the bunker generator, ignite the beacon, and evade biological Stalkers.
            </p>
          </button>

          <button
            onClick={onHost}
            className="w-full df-panel df-panel-hover p-4 text-left border border-[#AAA69B]/30 cursor-pointer transition relative"
          >
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-sm font-bold text-[#E8E4DC] tracking-wider">
                📡 CREATE LOCAL SESSION (HOST)
              </span>
              <span className="font-cinzel text-[9px] uppercase tracking-widest text-[#C59B61] border border-[#C59B61]/30 px-1.5 py-0.5">
                2-PLAYER P2P
              </span>
            </div>
            <p className="mt-1 text-xs text-[#AAA69B]">
              Host a local WebRTC match on your Wi-Fi/hotspot. Generate a QR code or signaling token for a nearby survivor.
            </p>
          </button>

          <button
            onClick={onJoin}
            className="w-full df-panel df-panel-hover p-4 text-left border border-[#AAA69B]/30 cursor-pointer transition relative"
          >
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-sm font-bold text-[#E8E4DC] tracking-wider">
                📥 JOIN LOCAL SESSION
              </span>
              <span className="font-cinzel text-[9px] uppercase tracking-widest text-[#AAA69B]">
                GUEST
              </span>
            </div>
            <p className="mt-1 text-xs text-[#AAA69B]">
              Scan the host’s QR offer or paste the signaling token to connect across the local network.
            </p>
          </button>

          <button
            onClick={onPass}
            className="w-full df-panel df-panel-hover p-4 text-left border border-[#AAA69B]/30 cursor-pointer transition relative"
          >
            <div className="flex items-center justify-between">
              <span className="font-cinzel text-sm font-bold text-[#E8E4DC] tracking-wider">
                👥 PASS-AND-PLAY CHALLENGE
              </span>
              <span className="font-cinzel text-[9px] uppercase tracking-widest text-[#AAA69B]">
                1 DEVICE
              </span>
            </div>
            <p className="mt-1 text-xs text-[#AAA69B]">
              Turn-based local survival competition on a single shared mobile device.
            </p>
          </button>
        </div>
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
    <Shell bg="/bunker-bg.jpg">
      <div className="df-panel mx-auto my-auto w-full max-w-xl p-6 sm:p-8 relative">
        <CornerFlourish position="top-left" color="#C59B61" size={24} />
        <CornerFlourish position="top-right" color="#C59B61" size={24} />
        <CornerFlourish position="bottom-left" color="#C59B61" size={24} />
        <CornerFlourish position="bottom-right" color="#C59B61" size={24} />

        <div className="flex items-center justify-between border-b border-[#AAA69B]/20 pb-3">
          <div className="flex items-center gap-2.5">
            <Insignia className="h-7 w-7" />
            <span className="font-cinzel text-sm font-bold tracking-[0.22em] text-[#E8E4DC]">
              EXPEDITION BUNKER // LOBBY
            </span>
          </div>

          <span
            className={`font-cinzel text-[10px] uppercase tracking-widest px-2.5 py-1 border ${
              info.status === 'connected' || info.status === 'loopback'
                ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-400'
                : 'border-[#C59B61]/50 bg-[#C59B61]/10 text-[#C59B61]'
            }`}
          >
            {info.status.toUpperCase()}
          </span>
        </div>

        <div className="mt-3 text-xs text-[#AAA69B] font-mono">
          Session ID: <span className="text-[#C59B61]">{info.sessionId || 'Local-Host'}</span> · {info.role === 'host' ? 'Host Commander' : 'Assigned Specialist'}
        </div>

        <MetallicDivider label="SQUAD MANIFEST" className="my-4" />

        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => {
            const p = info.players[i]
            const locked = i >= 2
            return (
              <div
                key={i}
                className={`p-3 rounded-xs border flex items-center justify-between text-xs transition ${
                  p
                    ? 'border-[#C59B61]/40 bg-[#202223] text-[#E8E4DC]'
                    : locked
                    ? 'border-white/5 bg-[#171819]/40 opacity-40 text-[#AAA69B]/40'
                    : 'border-dashed border-[#AAA69B]/20 bg-[#171819]/50 text-[#AAA69B]/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-cinzel text-[10px] text-[#C59B61] font-bold">
                    0{i + 1}
                  </span>
                  <span className="font-cinzel font-bold tracking-wider">
                    {p ? p.name : locked ? 'Slot 3-4 (Phase 2 Expansion)' : 'Awaiting Local Specialist'}
                  </span>
                </div>

                <div className="font-mono text-[10px] uppercase tracking-wider">
                  {p ? (
                    <span className={p.ready ? 'text-emerald-400' : 'text-[#C59B61]'}>
                      {p.host ? '👑 Host · ' : ''}
                      {p.ready ? 'Ready' : 'Standby'}
                    </span>
                  ) : locked ? (
                    'Locked'
                  ) : (
                    'Open Slot'
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {info.reconnectUntil ? (
          <p className="mt-3 text-xs text-[#C59B61] font-mono">
            Reconnect opportunity active until {new Date(info.reconnectUntil).toLocaleTimeString()}
          </p>
        ) : null}

        <div className="mt-6 pt-4 border-t border-[#AAA69B]/20 flex gap-3">
          <button
            onClick={onReady}
            className={`flex-1 py-3 font-cinzel text-xs font-bold uppercase tracking-[0.2em] transition cursor-pointer border ${
              ready ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'df-btn-silver'
            }`}
          >
            {ready ? '✓ Standby (Ready)' : 'Mark Ready'}
          </button>

          {info.role === 'host' ? (
            <button
              onClick={onStart}
              disabled={!canStart}
              className={`flex-1 py-3 font-cinzel text-xs font-bold uppercase tracking-[0.2em] transition ${
                canStart ? 'df-btn-gold cursor-pointer' : 'opacity-40 border border-white/10 cursor-not-allowed'
              }`}
            >
              Start Expedition →
            </button>
          ) : null}

          <button
            onClick={onLeave}
            className="px-4 py-3 border border-red-500/30 bg-red-950/30 text-red-300 font-cinzel text-xs uppercase tracking-wider hover:border-red-500 cursor-pointer"
          >
            Leave
          </button>
        </div>

        {info.role === 'host' && !canStart ? (
          <p className="mt-2 text-[10px] text-[#AAA69B]/60 font-mono text-center">
            Host launch requires both players marked Ready on an active WebRTC DataChannel.
          </p>
        ) : null}
      </div>
    </Shell>
  )
}

export function Results({
  state,
  onRematch,
  onMenu,
}: {
  state: GameState
  onRematch: () => void
  onMenu: () => void
}) {
  const win = state.outcome === 'victory'
  return (
    <Shell dim>
      <div className="df-panel mx-auto my-auto w-full max-w-xl p-8 relative text-center">
        <CornerFlourish position="top-left" color={win ? '#C59B61' : '#853D3D'} size={24} />
        <CornerFlourish position="top-right" color={win ? '#C59B61' : '#853D3D'} size={24} />
        <CornerFlourish position="bottom-left" color={win ? '#C59B61' : '#853D3D'} size={24} />
        <CornerFlourish position="bottom-right" color={win ? '#C59B61' : '#853D3D'} size={24} />

        <p className="font-cinzel text-xs tracking-[0.35em] text-[#C59B61] uppercase">
          {win ? 'EXTRACTION CONFIRMED' : 'COMMUNICATIONS SEVERED'}
        </p>

        <h2 className="font-cinzel text-4xl sm:text-5xl font-black tracking-widest text-[#E8E4DC] mt-2">
          {win ? 'SURVIVORS RESCUED' : 'EXPEDITION OVERRUN'}
        </h2>

        <p className="font-editorial text-sm italic text-[#AAA69B] mt-2">
          {win
            ? 'The evacuation radio beacon successfully guided the extraction gunship before total squall blackout.'
            : 'The cold squall overtook the island. All biosignals lost in the darkness.'}
        </p>

        <MetallicDivider label="EXPEDITION METRICS" className="my-5" />

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 border border-[#AAA69B]/15 bg-[#171819]/70 rounded-xs">
            <span className="font-cinzel text-[10px] text-[#AAA69B]/60 uppercase tracking-widest block">
              Match Duration
            </span>
            <span className="font-mono text-xl font-bold text-[#C59B61]">
              {Math.floor(state.matchSeconds)}s
            </span>
          </div>

          <div className="p-3 border border-[#AAA69B]/15 bg-[#171819]/70 rounded-xs">
            <span className="font-cinzel text-[10px] text-[#AAA69B]/60 uppercase tracking-widest block">
              Mission Outcome
            </span>
            <span
              className={`font-cinzel text-lg font-black uppercase ${
                win ? 'text-emerald-400' : 'text-[#853D3D]'
              }`}
            >
              {state.outcome.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          {state.players.map((p) => (
            <div
              key={p.id}
              className="p-3 border border-[#AAA69B]/15 bg-[#171819]/60 rounded-xs flex items-center justify-between text-xs"
            >
              <div className="font-cinzel font-bold text-[#E8E4DC] tracking-wider text-left">
                {p.name}
              </div>
              <div className="font-mono text-[11px] text-[#AAA69B]">
                Salvaged: <span className="text-[#C59B61]">{p.stats.collected}</span> · Repairs: <span className="text-[#C59B61]">{p.stats.repairs}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRematch}
            className="df-btn-gold flex-1 py-3.5 text-xs font-bold tracking-[0.24em] cursor-pointer"
          >
            DEPLOY REMATCH →
          </button>
          <button
            onClick={onMenu}
            className="df-btn-silver flex-1 py-3.5 text-xs font-bold tracking-[0.24em] cursor-pointer"
          >
            RETURN TO CITADEL
          </button>
        </div>
      </div>
    </Shell>
  )
}

export function HostLost({ onMenu, onReconnect }: { onMenu: () => void; onReconnect?: () => void }) {
  return (
    <Shell bg="/bunker-bg.jpg">
      <div className="df-panel mx-auto my-auto w-full max-w-md p-8 relative text-center">
        <CornerFlourish position="top-left" color="#853D3D" size={24} />
        <CornerFlourish position="top-right" color="#853D3D" size={24} />
        <CornerFlourish position="bottom-left" color="#853D3D" size={24} />
        <CornerFlourish position="bottom-right" color="#853D3D" size={24} />

        <p className="font-cinzel text-xs tracking-[0.3em] text-[#853D3D]">
          AUTHORITY CHANNEL LOST
        </p>
        <h2 className="font-cinzel text-3xl font-black tracking-widest text-[#E8E4DC] mt-2">
          HOST DISCONNECTED
        </h2>
        <p className="font-sans text-xs text-[#AAA69B] leading-relaxed mt-3">
          The host owned simulation authority for enemy AI, health calculations, and objectives. If the host is still in the reconnect window, you can exchange a fresh signal bundle.
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          {onReconnect ? (
            <button
              onClick={onReconnect}
              className="df-btn-gold w-full py-3 text-xs tracking-[0.2em] cursor-pointer"
            >
              Reconnect with New Offer
            </button>
          ) : null}
          <button
            onClick={onMenu}
            className="df-btn-silver w-full py-3 text-xs tracking-[0.2em] cursor-pointer"
          >
            Return to Citadel
          </button>
        </div>
      </div>
    </Shell>
  )
}
