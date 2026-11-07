import { useMemo, useState } from 'react'
import { MenuButton, Shell } from './screens'

type HiddenChoice = 'ridge' | 'bunker' | 'shore'
type EventId = 'storm' | 'creature' | 'cache'

const ROUTES: Record<HiddenChoice, { label: string; risk: number; loot: number }> = {
  ridge: { label: 'Take the ridge', risk: 2, loot: 2 },
  bunker: { label: 'Cut through the bunker', risk: 3, loot: 3 },
  shore: { label: 'Follow the shore', risk: 1, loot: 1 },
}

export function PassAndPlay({ onBack }: { onBack: () => void }) {
  const [count, setCount] = useState(2)
  const [turn, setTurn] = useState(0)
  const [phase, setPhase] = useState<'setup' | 'hidden' | 'event' | 'reveal'>('setup')
  const [names, setNames] = useState(['Avery', 'Rowan', 'Kim', 'Moss'])
  const [choices, setChoices] = useState<HiddenChoice[]>([])
  const [gear, setGear] = useState<number[]>([])
  const [scores, setScores] = useState<number[]>([])
  const event = useMemo<EventId>(() => (['storm', 'creature', 'cache'] as const)[Math.floor(Math.random() * 3)], [phase === 'event'])

  const player = names[turn] ?? `Player ${turn + 1}`

  const commit = (route: HiddenChoice, medkit: boolean) => {
    const nextChoices = [...choices, route]
    const nextGear = [...gear, medkit ? 1 : 0]
    setChoices(nextChoices)
    setGear(nextGear)
    if (turn + 1 < count) {
      setTurn(turn + 1)
      setPhase('hidden')
    } else {
      setPhase('event')
    }
  }

  const resolve = () => {
    const next = choices.map((c, i) => {
      const route = ROUTES[c]
      let score = 8 + route.loot * 3 - route.risk * 2
      if (event === 'creature' && route.risk >= 3) score -= 4
      if (event === 'storm' && c === 'shore') score -= 2
      if (event === 'cache' && c === 'bunker') score += 5
      if (gear[i]) score += 3
      return score
    })
    setScores(next)
    setPhase('reveal')
  }

  return (
    <Shell>
      <button className="text-xs tracking-[0.2em] text-[#ff6a00] hover:text-white transition font-mono" onClick={onBack}>← BACK</button>
      <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-[#ff8800]/70 font-mono">Turn-based party · single device</p>
      <h2 className="mt-1 font-display text-3xl text-white">Pass-and-Play</h2>
      <p className="mt-2 text-sm text-[#f0e6d8]/75">Pass the device between operators. Choices stay hidden until the final storm encounter.</p>

      {phase === 'setup' ? (
        <div className="mt-6 max-w-md space-y-4">
          <div className="flex items-center justify-between font-mono text-sm">
            <span>Survivors:</span>
            <span className="text-[#ff6a00] font-bold text-base">{count}</span>
          </div>
          <input type="range" min={2} max={4} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full accent-[#ff6a00]" />
          <div className="space-y-2">
            {Array.from({ length: count }).map((_, i) => (
              <input
                key={i}
                className="w-full rounded-xl bg-[#0e0c0a]/90 border border-[#ff6a00]/20 px-3.5 py-2.5 text-sm font-mono text-white placeholder-white/30 focus:border-[#ff6a00] focus:outline-none"
                value={names[i]}
                onChange={(e) => setNames(names.map((n, j) => (j === i ? e.target.value : n)))}
              />
            ))}
          </div>
          <MenuButton primary label="Start First Turn" onClick={() => { setTurn(0); setChoices([]); setGear([]); setPhase('hidden') }} />
        </div>
      ) : null}

      {phase === 'hidden' ? (
        <div className="mt-6 max-w-md space-y-3">
          <div className="rounded-xl border border-[#ff6a00]/30 bg-[#ff6a00]/10 p-3 text-center">
            <p className="text-base font-black text-[#ff8800]">Hand device to {player}</p>
            <p className="text-xs text-[#f0e6d8]/60 mt-1">Other players look away.</p>
          </div>
          <p className="text-xs text-[#f0e6d8]/70 font-mono">Select route and tactical medkit allocation:</p>
          {(Object.keys(ROUTES) as HiddenChoice[]).map((k) => (
            <MenuButton key={k} label={ROUTES[k].label} note={`Risk: Level ${ROUTES[k].risk} · Loot: Level ${ROUTES[k].loot}`} onClick={() => commit(k, false)} />
          ))}
          <MenuButton primary label="Bunker + Spend Medkit (+3 Score Bonus)" onClick={() => commit('bunker', true)} />
        </div>
      ) : null}

      {phase === 'event' ? (
        <div className="mt-6 max-w-md space-y-4">
          <div className="rounded-xl border border-[#c41e1e]/40 bg-[#c41e1e]/15 p-4">
            <div className="text-xs font-mono uppercase text-[#ff8800] tracking-wider">CRITICAL INCIDENT REPORT</div>
            <p className="mt-1 text-base font-bold text-white">
              {event === 'storm'
                ? 'The squall strikes the shoreline with fierce lightning.'
                : event === 'creature'
                ? 'A biological stalker breaches the bunker entrance.'
                : 'An intact military cache is detected with reserve power.'}
            </p>
          </div>
          <MenuButton primary label="Reveal Survival Scores" onClick={resolve} />
        </div>
      ) : null}

      {phase === 'reveal' ? (
        <div className="mt-6 max-w-md space-y-3">
          {scores.map((s, i) => (
            <div key={i} className="rounded-xl border border-[#ff6a00]/20 bg-[#120f0d] p-3.5 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">{names[i]}</div>
                <div className="text-xs text-[#f0e6d8]/65 font-mono">{ROUTES[choices[i]].label}</div>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-[#ff6a00] font-mono">{s}</span>
                <span className="text-[10px] text-[#f0e6d8]/50 block">PTS</span>
              </div>
            </div>
          ))}
          <MenuButton primary label="Play Again" onClick={() => { setPhase('setup'); setTurn(0) }} />
        </div>
      ) : null}
    </Shell>
  )
}
