import { areaName, currentObjective } from '../game/simulation'
import { AREAS } from '../game/world'
import type { GameState, PlayerState } from '../game/types'

export function HUD({
  state,
  me,
  fps,
  showFps,
  net,
  onPause,
}: {
  state: GameState
  me: PlayerState
  fps: number
  showFps: boolean
  net: string
  onPause: () => void
}) {
  const mins = Math.floor(state.timeLeft / 60)
  const secs = Math.floor(state.timeLeft % 60)

  // Tactical Distance Calculations
  const distToBunker = Math.round(Math.hypot(AREAS.bunker.x - me.x, AREAS.bunker.z - me.z))
  const distToBeacon = Math.round(Math.hypot(AREAS.extract.x - me.x, AREAS.extract.z - me.z))

  // Threat Detection
  let nearestThreatD = Infinity
  let nearestThreatChasing = false
  for (const e of state.enemies) {
    if (e.ai === 'dead') continue
    const d = Math.hypot(e.x - me.x, e.z - me.z)
    if (d < nearestThreatD) {
      nearestThreatD = d
      nearestThreatChasing = e.ai === 'chase' || e.ai === 'attack'
    }
  }

  const threatDistance = Math.round(nearestThreatD)
  const threatInProximity = nearestThreatD < 18
  const threatCritical = nearestThreatD < 9 || nearestThreatChasing
  const lowHealth = me.hp <= 35 && !me.dead

  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-3 pt-[max(0.6rem,env(safe-area-inset-top))]">
      {/* Low Health & Critical Damage Blood Vignette */}
      {lowHealth ? (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(196,30,30,0.45)_100%)] animate-pulse pointer-events-none" />
      ) : null}

      {/* Threat Alert Flash when stalker is chasing */}
      {threatCritical ? (
        <div className="absolute inset-x-0 top-16 z-30 flex justify-center animate-shake">
          <div className="flex items-center gap-2 rounded-md border border-[#c41e1e] bg-[#c41e1e]/40 px-4 py-1.5 shadow-[0_0_25px_rgba(220,47,2,0.8)] backdrop-blur-md">
            <span className="text-base animate-ping">⚠️</span>
            <span className="font-mono text-xs font-black uppercase tracking-widest text-white">
              STALKER ALERT // BREAK LINE OF SIGHT ({threatDistance}M)
            </span>
          </div>
        </div>
      ) : null}

      {/* Top Header: Objective Card + Waypoint Radar Tape + Match Timer */}
      <div className="relative z-10 flex items-start justify-between gap-2 sm:gap-4">
        {/* Left Objective & Sector Card */}
        <div className="rounded-xl border border-[#ff6a00]/25 bg-black/75 px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.6)] backdrop-blur-md max-w-[16rem]">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#ff8800] font-mono font-bold">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ff6a00] animate-pulse" />
            <span>{areaName(me.x, me.z)}</span>
          </div>
          <div className="mt-0.5 text-xs sm:text-sm font-bold text-white leading-snug">
            {currentObjective(state)}
          </div>
        </div>

        {/* Center: Tactical Waypoint Radar Bar */}
        <div className="hidden sm:flex items-center gap-3 rounded-xl border border-[#ff6a00]/25 bg-black/70 px-4 py-1.5 font-mono text-xs backdrop-blur-md shadow-md">
          <div className={`flex items-center gap-1.5 ${state.generatorOn ? 'text-white/40' : 'text-[#ff8800]'}`}>
            <span>⚡</span>
            <span className="text-[10px] font-bold">BUNKER:</span>
            <span className="text-white font-black">{distToBunker}m</span>
          </div>

          <span className="text-white/20">|</span>

          <div className={`flex items-center gap-1.5 ${state.beaconOn ? 'text-emerald-400 font-bold' : 'text-[#ff6a00]'}`}>
            <span>📡</span>
            <span className="text-[10px] font-bold">BEACON:</span>
            <span className="text-white font-black">{distToBeacon}m</span>
          </div>

          {threatInProximity ? (
            <>
              <span className="text-white/20">|</span>
              <div className="flex items-center gap-1 text-[#ff5050] font-black animate-pulse">
                <span>🚨</span>
                <span className="text-[10px]">{threatDistance}m</span>
              </div>
            </>
          ) : null}
        </div>

        {/* Right Timer & Net Info */}
        <div className="rounded-xl border border-white/10 bg-black/65 px-3.5 py-1.5 text-right backdrop-blur-md shadow-md">
          <div className="font-display text-2xl sm:text-3xl font-black tabular-nums tracking-wider text-white">
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
          <div className="text-[9px] uppercase tracking-widest text-[#ff8800] font-mono font-semibold">
            {net}
          </div>
          {showFps ? <div className="text-[9px] text-white/40 font-mono">{Math.round(fps)} FPS</div> : null}
        </div>
      </div>

      {/* Player Vitals (HP & Stamina Bars) */}
      <div className="relative z-10 mt-3 flex flex-col gap-1 w-44 sm:w-52">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold">
          <span className="text-white/80">INTEGRITY</span>
          <span className="text-white">{Math.round(me.hp)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/60 border border-white/10 p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#c41e1e] via-[#e85d04] to-[#ff6a00] transition-all duration-150"
            style={{ width: `${me.hp}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[9px] font-mono text-white/60 mt-0.5">
          <span>STAMINA</span>
          <span>{Math.round(me.stam)}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/60 border border-white/10">
          <div
            className="h-full rounded-full bg-[#ff8800] transition-all duration-75"
            style={{ width: `${me.stam}%` }}
          />
        </div>
      </div>

      {/* Scavenged Backpack Inventory */}
      <div className="relative z-10 mt-2.5 flex flex-wrap gap-1.5 text-[10px] uppercase font-mono tracking-wide">
        <Chip label="MTL" count={me.inv.metal} icon="⚙️" />
        <Chip label="BAT" count={me.inv.batteries} icon="🔋" />
        <Chip label="MED" count={me.inv.meds} icon="💉" />
        <Chip label="RPR" count={me.inv.repair} icon="🔧" />
        <Chip label="KIT" count={me.inv.kits} icon="🧰" highlight />
      </div>

      {/* Squad Status Chips */}
      <div className="relative z-10 mt-2 flex gap-1.5">
        {state.players.map((p) => (
          <div
            key={p.id}
            className={`rounded-lg px-2 py-1 text-[10px] font-mono flex items-center gap-1 border ${
              p.id === me.id
                ? 'border-[#ff6a00]/40 bg-black/65 text-white'
                : 'border-white/10 bg-black/45 text-white/70'
            }`}
          >
            <span>{p.name.split(' ')[0]}</span>
            <span className={p.hp < 30 ? 'text-[#ff6a00] font-bold' : 'text-emerald-400 font-bold'}>
              {Math.round(p.hp)}HP
            </span>
            {p.downed ? <span className="text-[#ff5050] font-bold">↓ DOWN</span> : null}
            {p.dead ? <span className="text-red-500 font-bold">✕ K.I.A</span> : null}
          </div>
        ))}
      </div>

      {/* Pause Button in Bottom Right */}
      <button
        className="pointer-events-auto absolute right-3 bottom-[max(0.8rem,env(safe-area-inset-bottom))] rounded-xl border border-[#ff6a00]/30 bg-[#120f0d]/85 px-4 py-2.5 text-xs font-mono font-bold tracking-wider text-white shadow-lg hover:border-[#ff6a00] hover:bg-[#ff6a00]/20 transition cursor-pointer val-cut-btn"
        onClick={onPause}
      >
        ⏸ PAUSE
      </button>
    </div>
  )
}

function Chip({ label, count, icon, highlight }: { label: string; count: number; icon: string; highlight?: boolean }) {
  return (
    <span
      className={`rounded-md px-2 py-1 border flex items-center gap-1 shadow-sm ${
        count > 0
          ? highlight
            ? 'border-[#ff6a00] bg-[#ff6a00]/25 text-white font-bold shadow-[0_0_8px_rgba(255,106,0,0.3)]'
            : 'border-[#ff6a00]/30 bg-black/65 text-white font-bold'
          : 'border-white/10 bg-black/40 text-white/40'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span className="font-bold">{count}</span>
    </span>
  )
}

export function DropOverlay({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm text-center p-4">
      <div className="val-panel val-cut-tr max-w-sm w-full p-6 text-center rounded border border-[#ff6a00]/40 shadow-[0_0_50px_rgba(255,106,0,0.3)]">
        <p className="text-xs tracking-[0.35em] text-[#ff8800] font-mono font-black uppercase">DROP PROTOCOL // INITIATED</p>
        <h2 className="mt-2 font-display text-4xl font-black text-white">Stormfall Isle</h2>
        <p className="mt-2 text-xs text-ivory/70 leading-relaxed font-sans">
          Main power is severed. Nightfall squall is descending. Scavenge components, craft a repair kit at the bunker, restore the ridge beacon, and hold until rescue.
        </p>
        <button
          className="mt-6 val-cut-btn w-full bg-gradient-to-r from-[#c41e1e] to-[#e85d04] py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:brightness-110 cursor-pointer"
          onClick={onSkip}
        >
          Skip Drop Sequence →
        </button>
      </div>
    </div>
  )
}
