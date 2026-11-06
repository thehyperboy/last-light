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
      <button className="text-xs tracking-[0.2em] text-amber" onClick={onBack}>← BACK</button>
      <p className="mt-2 text-[11px] uppercase tracking-[0.25em] text-ivory/50">Turn-based party · one device</p>
      <h2 className="mt-1 font-display text-3xl">Pass-and-Play</h2>
      <p className="mt-2 text-sm text-ivory/70">Not simultaneous multiplayer. Pass the device. Choices stay hidden until the reveal.</p>

      {phase === 'setup' ? (
        <div className="mt-6 max-w-md space-y-3">
          <p>Players: {count}</p>
          <input type="range" min={2} max={4} value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full" />
          {Array.from({ length: count }).map((_, i) => (
            <input key={i} className="w-full rounded-xl bg-black/40 px-3 py-2" value={names[i]} onChange={(e) => setNames(names.map((n, j) => (j === i ? e.target.value : n)))} />
          ))}
          <MenuButton primary label="Start first turn" onClick={() => { setTurn(0); setChoices([]); setGear([]); setPhase('hidden') }} />
        </div>
      ) : null}

      {phase === 'hidden' ? (
        <div className="mt-6 max-w-md space-y-3">
          <p className="text-amber">Hand the device to {player}. Others look away.</p>
          <p className="text-sm text-ivory/70">Choose a route and whether to spend a medkit. This stays hidden.</p>
          {(Object.keys(ROUTES) as HiddenChoice[]).map((k) => (
            <MenuButton key={k} label={ROUTES[k].label} note={`Risk ${ROUTES[k].risk} · Loot ${ROUTES[k].loot}`} onClick={() => commit(k, false)} />
          ))}
          <MenuButton primary label="Bunker + spend medkit" onClick={() => commit('bunker', true)} />
        </div>
      ) : null}

      {phase === 'event' ? (
        <div className="mt-6 max-w-md space-y-3">
          <p>Shared event: {event === 'storm' ? 'The squall hits the shore.' : event === 'creature' ? 'A stalker hunts the bunker.' : 'A sealed cache still has power.'}</p>
          <MenuButton primary label="Reveal survival scores" onClick={resolve} />
        </div>
      ) : null}

      {phase === 'reveal' ? (
        <div className="mt-6 max-w-md space-y-3">
          {scores.map((s, i) => (
            <div key={i} className="rounded-xl border border-ivory/15 p-3">
              <div className="font-semibold">{names[i]}</div>
              <div className="text-sm text-ivory/70">Score {s} · {ROUTES[choices[i]].label}</div>
            </div>
          ))}
          <MenuButton primary label="Play again" onClick={() => { setPhase('setup'); setTurn(0) }} />
        </div>
      ) : null}
    </Shell>
  )
}
