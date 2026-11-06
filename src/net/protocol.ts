import {
  MAX_MSG,
  PROTOCOL,
  type EnemyAiState,
  type GamePhase,
  type GameState,
  type MatchOutcome,
  type PlayerInput,
  type PlayerState,
} from '../game/types'

export type NetMsg =
  | { t: 'hello'; protocol: number; playerId: string; name: string; sessionId?: string; reconnect?: boolean }
  | { t: 'welcome'; playerId: string; sessionId: string; slot: number; hostName: string }
  | { t: 'reject'; reason: string }
  | { t: 'ready'; ready: boolean; playerId: string }
  | { t: 'lobby'; players: { id: string; name: string; ready: boolean; host: boolean; connected: boolean }[]; map: string; cap: number }
  | { t: 'start'; seed: number; sessionId: string }
  | { t: 'input'; seq: number; playerId: string; in: PlayerInput }
  | { t: 'snap'; s: CompactSnap }
  | { t: 'ping'; t0: number }
  | { t: 'pong'; t0: number }
  | { t: 'leave' }
  | { t: 'host-lost' }
  | { t: 'pause'; reason: string }

export type CompactSnap = {
  sid: string
  seed: number
  tick: number
  phase: GamePhase
  outcome: MatchOutcome
  timeLeft: number
  storm: number
  dropT: number
  generator: number
  extractHold: number
  matchSeconds: number
  flags: number
  players: CompactPlayer[]
  taken: number[]
  enemies: CompactEnemy[]
}

type CompactPlayer = {
  id: string
  name: string
  x: number
  y: number
  z: number
  yaw: number
  hp: number
  stam: number
  flags: number
  vy: number
  inv: [number, number, number, number, number]
  stats: [number, number, number, number]
}

type CompactEnemy = {
  id: number
  x: number
  z: number
  yaw: number
  hp: number
  ai: EnemyAiState
  pi: number
  detect: number
  ac: number
  st: number
  lx: number
  lz: number
}

const FLAG_GEN = 1
const FLAG_BEACON = 2
const FLAG_FOUND_GEN = 4
const FLAG_FOUND_REPAIR = 8
const P_DOWNED = 1
const P_DEAD = 2
const P_GROUNDED = 4
const P_CONNECTED = 8

function q(n: number, s = 100): number {
  return Math.round(n * s) / s
}

export function encodeMsg(msg: NetMsg): string {
  return JSON.stringify(msg)
}

export function decodeMsg(raw: string): NetMsg | null {
  if (raw.length > MAX_MSG) return null
  try {
    const msg = JSON.parse(raw) as NetMsg
    if (!msg || typeof msg !== 'object' || typeof msg.t !== 'string') return null
    return msg
  } catch {
    return null
  }
}

export function isHelloValid(msg: NetMsg): msg is Extract<NetMsg, { t: 'hello' }> {
  return (
    msg.t === 'hello' &&
    msg.protocol === PROTOCOL &&
    typeof msg.playerId === 'string' &&
    msg.playerId.length >= 8 &&
    msg.playerId.length <= 32 &&
    typeof msg.name === 'string' &&
    msg.name.length > 0 &&
    msg.name.length <= 24
  )
}

export function packSnap(state: GameState): CompactSnap {
  let flags = 0
  if (state.generatorOn) flags |= FLAG_GEN
  if (state.beaconOn) flags |= FLAG_BEACON
  if (state.foundGenerator) flags |= FLAG_FOUND_GEN
  if (state.foundRepair) flags |= FLAG_FOUND_REPAIR
  return {
    sid: state.sessionId,
    seed: state.seed,
    tick: state.tick,
    phase: state.phase,
    outcome: state.outcome,
    timeLeft: q(state.timeLeft, 10),
    storm: q(state.storm, 1000),
    dropT: q(state.dropT, 100),
    generator: q(state.generator, 100),
    extractHold: q(state.extractHold, 100),
    matchSeconds: q(state.matchSeconds, 10),
    flags,
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      x: q(p.x),
      y: q(p.y),
      z: q(p.z),
      yaw: q(p.yaw, 1000),
      hp: q(p.hp, 10),
      stam: q(p.stam, 10),
      flags:
        (p.downed ? P_DOWNED : 0) |
        (p.dead ? P_DEAD : 0) |
        (p.grounded ? P_GROUNDED : 0) |
        (p.connected ? P_CONNECTED : 0),
      vy: q(p.vy),
      inv: [p.inv.metal, p.inv.batteries, p.inv.meds, p.inv.repair, p.inv.kits],
      stats: [p.stats.collected, p.stats.repairs, q(p.stats.damageTaken, 10), p.stats.survived],
    })),
    taken: state.pickups.filter((p) => p.taken).map((p) => p.id),
    enemies: state.enemies.map((e) => ({
      id: e.id,
      x: q(e.x),
      z: q(e.z),
      yaw: q(e.yaw, 1000),
      hp: e.hp,
      ai: e.ai,
      pi: e.patrolIndex,
      detect: q(e.detect, 100),
      ac: q(e.attackCd, 100),
      st: q(e.searchT, 100),
      lx: q(e.lastX),
      lz: q(e.lastZ),
    })),
  }
}

export function applySnap(state: GameState, snap: CompactSnap): GameState {
  if (snap.sid && state.sessionId && snap.sid !== state.sessionId) return state
  state.tick = snap.tick
  state.phase = snap.phase
  state.outcome = snap.outcome
  state.timeLeft = snap.timeLeft
  state.storm = snap.storm
  state.dropT = snap.dropT
  state.generator = snap.generator
  state.extractHold = snap.extractHold
  state.matchSeconds = snap.matchSeconds
  state.generatorOn = (snap.flags & FLAG_GEN) !== 0
  state.beaconOn = (snap.flags & FLAG_BEACON) !== 0
  state.foundGenerator = (snap.flags & FLAG_FOUND_GEN) !== 0
  state.foundRepair = (snap.flags & FLAG_FOUND_REPAIR) !== 0
  const taken = new Set(snap.taken)
  for (const p of state.pickups) p.taken = taken.has(p.id)
  const byId = new Map(state.players.map((p) => [p.id, p]))
  for (const row of snap.players) {
    const p = byId.get(row.id)
    if (p) mergePlayer(p, row)
    else state.players.push(inflatePlayer(row))
  }
  const enemyBy = new Map(state.enemies.map((e) => [e.id, e]))
  for (const row of snap.enemies) {
    const e = enemyBy.get(row.id)
    if (!e) continue
    e.x = row.x
    e.z = row.z
    e.yaw = row.yaw
    e.hp = row.hp
    e.ai = row.ai
    e.patrolIndex = row.pi
    e.detect = row.detect
    e.attackCd = row.ac
    e.searchT = row.st
    e.lastX = row.lx
    e.lastZ = row.lz
  }
  return state
}

function mergePlayer(p: PlayerState, row: CompactPlayer) {
  p.name = row.name
  p.x = row.x
  p.y = row.y
  p.z = row.z
  p.yaw = row.yaw
  p.hp = row.hp
  p.stam = row.stam
  p.downed = (row.flags & P_DOWNED) !== 0
  p.dead = (row.flags & P_DEAD) !== 0
  p.grounded = (row.flags & P_GROUNDED) !== 0
  p.connected = (row.flags & P_CONNECTED) !== 0
  p.vy = row.vy
  p.inv = {
    metal: Math.max(0, row.inv[0] | 0),
    batteries: Math.max(0, row.inv[1] | 0),
    meds: Math.max(0, row.inv[2] | 0),
    repair: Math.max(0, row.inv[3] | 0),
    kits: Math.max(0, row.inv[4] | 0),
  }
  p.stats = {
    collected: row.stats[0],
    repairs: row.stats[1],
    damageTaken: row.stats[2],
    survived: row.stats[3],
  }
}

function inflatePlayer(row: CompactPlayer): PlayerState {
  const p = {
    id: row.id,
    name: row.name,
    x: 0,
    y: 0,
    z: 0,
    yaw: 0,
    hp: 100,
    stam: 100,
    downed: false,
    dead: false,
    bleed: 0,
    inv: { metal: 0, batteries: 0, meds: 0, repair: 0, kits: 0 },
    grounded: true,
    vy: 0,
    stats: { collected: 0, repairs: 0, damageTaken: 0, survived: 0 },
    connected: true,
  }
  mergePlayer(p, row)
  return p
}
