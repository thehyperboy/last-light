import { areaName, currentObjective } from '../game/simulation'
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
  return (
    <div className="pointer-events-none absolute inset-0 z-20 p-3 pt-[max(0.6rem,env(safe-area-inset-top))]">
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-2xl border border-ivory/10 bg-black/55 px-3 py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber">{areaName(me.x, me.z)}</div>
          <div className="max-w-[14rem] text-sm">{currentObjective(state)}</div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl tabular-nums">{mins}:{secs.toString().padStart(2, '0')}</div>
          <div className="text-[10px] uppercase tracking-widest text-ivory/50">{net}</div>
          {showFps ? <div className="text-[10px] text-ivory/40">{Math.round(fps)} fps</div> : null}
        </div>
      </div>
      <div className="mt-3 h-2 w-40 overflow-hidden rounded-full bg-black/50">
        <div className="h-full bg-red" style={{ width: `${me.hp}%` }} />
      </div>
      <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-black/50">
        <div className="h-full bg-amber" style={{ width: `${me.stam}%` }} />
      </div>
      <div className="mt-2 flex gap-1 text-[10px] uppercase tracking-wide text-ivory/80">
        <Chip k="MTL" n={me.inv.metal} />
        <Chip k="BAT" n={me.inv.batteries} />
        <Chip k="MED" n={me.inv.meds} />
        <Chip k="RPR" n={me.inv.repair} />
        <Chip k="KIT" n={me.inv.kits} />
      </div>
      <div className="mt-2 flex gap-2">
        {state.players.map((p) => (
          <div key={p.id} className="rounded-lg bg-black/40 px-2 py-1 text-[10px]">
            {p.name.split(' ')[0]} {Math.round(p.hp)}{p.downed ? ' ↓' : ''}{p.dead ? ' ✕' : ''}{p.connected ? '' : ' …'}
          </div>
        ))}
      </div>
      <button className="pointer-events-auto absolute right-3 top-[max(0.6rem,env(safe-area-inset-top))] hidden" onClick={onPause}>Pause</button>
      <button className="pointer-events-auto absolute right-3 bottom-[max(0.8rem,env(safe-area-inset-bottom))] rounded-xl border border-ivory/20 bg-black/40 px-3 py-2 text-xs" onClick={onPause}>PAUSE</button>
    </div>
  )
}

function Chip({ k, n }: { k: string; n: number }) {
  return <span className="rounded-md bg-black/45 px-2 py-1">{k} {n}</span>
}

export function DropOverlay({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/55 text-center">
      <p className="text-xs tracking-[0.35em] text-amber">DROP SEQUENCE</p>
      <h2 className="mt-2 font-display text-4xl">Stormfall Isle</h2>
      <p className="mt-2 max-w-xs text-sm text-ivory/70">Power is dead. The squall is coming. Repair the generator, light the beacon, get out.</p>
      <button className="mt-6 rounded-full border border-ivory/30 px-5 py-2 text-sm" onClick={onSkip}>Skip</button>
    </div>
  )
}
