import { areaName, currentObjective } from '../game/simulation'
import type { GameState, PlayerState } from '../game/types'
import { CornerFlourish, ItemGlyph } from './FantasyIcons'

export function HUD({
  state,
  me,
  fps,
  showFps,
  net,
  onPause,
  onOpenInventory,
}: {
  state: GameState
  me: PlayerState
  fps: number
  showFps: boolean
  net: string
  onPause: () => void
  onOpenInventory?: () => void
}) {
  const mins = Math.floor(state.timeLeft / 60)
  const secs = Math.floor(state.timeLeft % 60)
  const healthPercent = Math.max(0, Math.min(100, me.hp))
  const staminaPercent = Math.max(0, Math.min(100, me.stam))

  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-3 sm:p-5 pt-[max(0.6rem,env(safe-area-inset-top))]">
      {/* Top Bar: Sector Intel & Match Timer */}
      <div className="flex items-start justify-between gap-3">
        {/* Sector Directive Banner */}
        <div className="df-panel rounded-xs px-3.5 py-2.5 relative max-w-xs sm:max-w-md">
          <CornerFlourish position="top-left" color="#C59B61" size={10} />
          <CornerFlourish position="bottom-right" color="#C59B61" size={10} />

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C59B61] animate-ping" />
            <span className="font-cinzel text-[10px] uppercase tracking-[0.24em] text-[#C59B61]">
              {areaName(me.x, me.z)}
            </span>
          </div>

          <div className="mt-0.5 text-xs sm:text-sm font-cinzel font-bold text-[#E8E4DC] tracking-wide">
            {currentObjective(state)}
          </div>
        </div>

        {/* Storm Timer & Extraction Gauge */}
        <div className="df-panel rounded-xs px-3.5 py-2 text-right relative">
          <CornerFlourish position="top-right" color="#C59B61" size={10} />
          <div className="font-cinzel text-xl sm:text-2xl font-black tabular-nums text-[#E8E4DC] tracking-wider">
            {mins}:{secs.toString().padStart(2, '0')}
          </div>
          <div className="font-cinzel text-[9px] uppercase tracking-[0.25em] text-[#C59B61]">
            {state.storm > 0.5 ? '⚡ SQUALL ACTIVE' : 'SQUALL COUNTDOWN'}
          </div>
          <div className="font-mono text-[9px] uppercase text-[#AAA69B]/60 tracking-wider">
            {net}
          </div>
          {showFps ? (
            <div className="font-mono text-[9px] text-[#AAA69B]/40">
              {Math.round(fps)} FPS
            </div>
          ) : null}
        </div>
      </div>

      {/* Vital Gauges: Health & Stamina */}
      <div className="mt-3 max-w-[200px] sm:max-w-[240px] space-y-1.5">
        {/* Health Meter */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-cinzel uppercase tracking-wider text-[#E8E4DC]/80 mb-0.5">
            <span className="text-[#853D3D] font-bold">VITALITY</span>
            <span className="font-mono">{Math.round(healthPercent)} / 100</span>
          </div>
          <div className="h-2 w-full bg-[#171819] border border-[#AAA69B]/30 rounded-xs overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6e2b2b] to-[#853D3D] transition-all duration-200"
              style={{ width: `${healthPercent}%` }}
            />
          </div>
        </div>

        {/* Stamina Meter */}
        <div>
          <div className="flex items-center justify-between text-[10px] font-cinzel uppercase tracking-wider text-[#E8E4DC]/80 mb-0.5">
            <span className="text-[#C59B61] font-bold">ENDURANCE</span>
            <span className="font-mono">{Math.round(staminaPercent)} / 100</span>
          </div>
          <div className="h-1.5 w-full bg-[#171819] border border-[#AAA69B]/30 rounded-xs overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#8E6B39] to-[#C59B61] transition-all duration-150"
              style={{ width: `${staminaPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Resource Satchel Bar */}
      <div className="mt-3 flex items-center gap-1.5 text-xs font-mono">
        <button
          onClick={onOpenInventory}
          className="pointer-events-auto df-panel px-2.5 py-1 flex items-center gap-1.5 hover:border-[#C59B61] cursor-pointer"
          title="Open Inventory [I]"
        >
          <span className="font-cinzel text-[10px] uppercase tracking-wider text-[#C59B61] font-bold">
            🎒 SATCHEL
          </span>
        </button>
        <Chip kind="metal" n={me.inv.metal} />
        <Chip kind="batteries" n={me.inv.batteries} />
        <Chip kind="meds" n={me.inv.meds} />
        <Chip kind="repair" n={me.inv.repair} />
        <Chip kind="kit" n={me.inv.kits} />
      </div>

      {/* Teammate Roster Status */}
      {state.players.length > 1 ? (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {state.players.map((p) => (
            <div
              key={p.id}
              className={`df-panel rounded-xs px-2.5 py-1 text-[10px] font-cinzel flex items-center gap-1.5 border ${
                p.downed
                  ? 'border-[#853D3D] bg-red-950/40 text-[#853D3D] animate-pulse'
                  : p.dead
                  ? 'opacity-40 border-black'
                  : 'border-[#AAA69B]/20 text-[#E8E4DC]'
              }`}
            >
              <span className="font-bold">{p.name.split(' ')[0]}</span>
              <span className="font-mono text-[#C59B61]">{Math.round(p.hp)} HP</span>
              {p.downed ? ' [DOWNED]' : ''}
              {p.dead ? ' [KIA]' : ''}
              {!p.connected ? ' …' : ''}
            </div>
          ))}
        </div>
      ) : null}

      {/* Bottom Pause Trigger Button */}
      <button
        onClick={onPause}
        className="pointer-events-auto absolute right-3 bottom-[max(0.8rem,env(safe-area-inset-bottom))] df-panel px-3.5 py-2 font-cinzel text-xs font-bold uppercase tracking-[0.2em] text-[#AAA69B] hover:text-[#E8E4DC] hover:border-[#C59B61] transition cursor-pointer"
      >
        [ESC] PAUSE
      </button>
    </div>
  )
}

function Chip({ kind, n }: { kind: 'metal' | 'batteries' | 'meds' | 'repair' | 'kit'; n: number }) {
  return (
    <div className="df-panel px-2 py-1 flex items-center gap-1 rounded-xs">
      <ItemGlyph kind={kind} className="h-3.5 w-3.5" />
      <span className="font-mono text-[10px] text-[#E8E4DC] font-bold">{n}</span>
    </div>
  )
}

export function DropOverlay({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#171819]/80 backdrop-blur-md text-center p-6 animate-fade-in select-none">
      <div className="df-panel p-8 sm:p-10 max-w-md relative">
        <CornerFlourish position="top-left" color="#C59B61" size={24} />
        <CornerFlourish position="top-right" color="#C59B61" size={24} />
        <CornerFlourish position="bottom-left" color="#C59B61" size={24} />
        <CornerFlourish position="bottom-right" color="#C59B61" size={24} />

        <p className="font-cinzel text-xs tracking-[0.35em] text-[#C59B61] uppercase">
          EXPEDITION COMMENCING
        </p>
        <h2 className="mt-2 font-cinzel text-3xl sm:text-4xl font-black tracking-widest text-[#E8E4DC]">
          STORMFALL ISLE
        </h2>
        <p className="mt-3 font-editorial text-sm sm:text-base italic text-[#AAA69B] leading-relaxed">
          "Power is severed across all sectors. The squall approaches at twilight. Repair the bunker generator, ignite the cliffside beacon, and survive until extraction."
        </p>

        <button
          onClick={onSkip}
          className="mt-6 df-btn-gold px-8 py-2.5 text-xs font-bold tracking-[0.25em] cursor-pointer"
        >
          ENTER SECTOR 04 →
        </button>
      </div>
    </div>
  )
}
