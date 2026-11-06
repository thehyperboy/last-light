import {
  DT,
  EXTRACT_HOLD,
  MATCH_SECONDS,
  type EnemyState,
  type GameState,
  type Inventory,
  type PlayerInput,
  type PlayerState,
} from './types'
import {
  AREAS,
  BEACON,
  CRAFTING,
  EXTRACT,
  GENERATOR,
  PATROLS,
  PICKUP_SPAWNS,
  SPAWNS,
  dist2,
  losBlocked,
  resolveCollision,
} from './world'

const WALK = 4.2
const SPRINT = 7.1
const STAM_DRAIN = 18
const STAM_REGEN = 14
const INTERACT_R = 2.35
const ATTACK_R = 1.85
const DETECT_R = 11
const PLAYER_R = 0.42
const ENEMY_R = 0.5

const emptyInv = (): Inventory => ({
  metal: 0,
  batteries: 0,
  meds: 0,
  repair: 0,
  kits: 0,
})

function clamp(n: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, n))
}

function hashSeed(seed: number, i: number): number {
  let x = Math.imul(seed ^ (i * 374761393), 1103515245)
  x = (x ^ (x >>> 13)) >>> 0
  return x / 4294967296
}

export function createPlayer(id: string, name: string, slot: number): PlayerState {
  const spawn = SPAWNS[slot % SPAWNS.length]
  return {
    id,
    name: name.slice(0, 18) || `Survivor ${slot + 1}`,
    x: spawn.x,
    y: 0,
    z: spawn.z,
    yaw: 0,
    hp: 100,
    stam: 100,
    downed: false,
    dead: false,
    bleed: 0,
    inv: emptyInv(),
    grounded: true,
    vy: 0,
    stats: { collected: 0, repairs: 0, damageTaken: 0, survived: 0 },
    connected: true,
  }
}

export function createMatch(sessionId: string, seed: number, players: { id: string; name: string }[]): GameState {
  const pickups = PICKUP_SPAWNS.map((p, i) => ({
    id: i,
    kind: p.kind,
    x: p.x + (hashSeed(seed, i) - 0.5) * 0.6,
    z: p.z + (hashSeed(seed, i + 9) - 0.5) * 0.6,
    taken: false,
  }))
  const enemies: EnemyState[] = PATROLS.map((path, i) => ({
    id: i,
    x: path[0].x,
    z: path[0].z,
    yaw: 0,
    hp: 70,
    ai: 'patrol',
    patrolIndex: 0,
    detect: 0,
    attackCd: 0,
    searchT: 0,
    lastX: path[0].x,
    lastZ: path[0].z,
  }))
  return {
    sessionId,
    seed,
    tick: 0,
    phase: 'drop',
    outcome: 'ongoing',
    timeLeft: MATCH_SECONDS,
    storm: 0,
    dropT: 3.2,
    generator: 0,
    generatorOn: false,
    beaconOn: false,
    extractHold: 0,
    foundGenerator: false,
    foundRepair: false,
    players: players.map((p, i) => createPlayer(p.id, p.name, i)),
    pickups,
    enemies,
    matchSeconds: 0,
  }
}

export function cloneState(state: GameState): GameState {
  return structuredClone(state)
}

function nearestLiving(state: GameState, x: number, z: number): PlayerState | null {
  let best: PlayerState | null = null
  let bestD = Infinity
  for (const p of state.players) {
    if (p.dead || p.downed || !p.connected) continue
    const d = dist2(x, z, p.x, p.z)
    if (d < bestD) {
      bestD = d
      best = p
    }
  }
  return best
}

function hurt(player: PlayerState, amount: number) {
  if (player.dead) return
  const dmg = Math.max(0, amount)
  player.hp = clamp(player.hp - dmg, 0, 100)
  player.stats.damageTaken += dmg
  if (player.hp <= 0) {
    player.hp = 0
    player.downed = true
    player.bleed = 28
  }
}

function tryInteract(state: GameState, player: PlayerState) {
  if (player.dead || player.downed) return
  for (const item of state.pickups) {
    if (item.taken) continue
    if (dist2(player.x, player.z, item.x, item.z) > INTERACT_R * INTERACT_R) continue
    const cap = 8
    if (player.inv[item.kind] >= cap) continue
    item.taken = true
    player.inv[item.kind] += 1
    player.stats.collected += 1
    if (item.kind === 'repair') state.foundRepair = true
    return
  }
  for (const other of state.players) {
    if (other.id === player.id || other.dead || !other.downed) continue
    if (dist2(player.x, player.z, other.x, other.z) > INTERACT_R * INTERACT_R) continue
    other.downed = false
    other.bleed = 0
    other.hp = 35
    return
  }
  if (dist2(player.x, player.z, GENERATOR.x, GENERATOR.z) <= INTERACT_R * INTERACT_R) {
    state.foundGenerator = true
    if (state.generatorOn) return
    if (player.inv.kits > 0) {
      player.inv.kits -= 1
      state.generator = 1
      state.generatorOn = true
      player.stats.repairs += 1
      return
    }
    if (player.inv.metal >= 2 && player.inv.repair >= 1) {
      player.inv.metal -= 2
      player.inv.repair -= 1
      state.generator = Math.min(1, state.generator + 0.5)
      if (state.generator >= 1) {
        state.generatorOn = true
        player.stats.repairs += 1
      }
    }
    return
  }
  if (dist2(player.x, player.z, BEACON.x, BEACON.z) <= INTERACT_R * INTERACT_R) {
    if (state.generatorOn && player.inv.batteries > 0 && !state.beaconOn) {
      player.inv.batteries -= 1
      state.beaconOn = true
    }
  }
}

function tryCraft(_: GameState, player: PlayerState) {
  if (player.dead || player.downed) return
  if (dist2(player.x, player.z, CRAFTING.x, CRAFTING.z) > INTERACT_R * INTERACT_R) return
  if (player.inv.metal < 1 || player.inv.repair < 1) return
  if (player.inv.kits >= 4) return
  player.inv.metal -= 1
  player.inv.repair -= 1
  player.inv.kits += 1
}

function stepPlayer(state: GameState, player: PlayerState, input: PlayerInput) {
  if (player.dead || !player.connected) return
  if (player.downed) {
    player.bleed -= DT
    if (player.bleed <= 0) {
      player.dead = true
      player.downed = false
    }
    return
  }
  const ax = clamp(input.ax, -1, 1)
  const az = clamp(input.az, -1, 1)
  const mag = Math.hypot(ax, az)
  const nx = mag > 1 ? ax / mag : ax
  const nz = mag > 1 ? az / mag : az
  const sprinting = input.sprint && player.stam > 2 && mag > 0.15
  const speed = (sprinting ? SPRINT : WALK) * (input.crouch ? 0.55 : 1)
  if (sprinting) player.stam = clamp(player.stam - STAM_DRAIN * DT, 0, 100)
  else player.stam = clamp(player.stam + STAM_REGEN * DT, 0, 100)
  const sin = Math.sin(input.yaw)
  const cos = Math.cos(input.yaw)
  const wx = nx * cos + nz * sin
  const wz = nz * cos - nx * sin
  let x = player.x + wx * speed * DT
  let z = player.z + wz * speed * DT
  const resolved = resolveCollision(x, z, PLAYER_R)
  player.x = resolved.x
  player.z = resolved.z
  player.yaw = input.yaw
  player.vy -= 22 * DT
  player.y += player.vy * DT
  if (player.y <= 0) {
    player.y = 0
    player.vy = 0
    player.grounded = true
  }
  if (input.jump && player.grounded) {
    player.vy = 7.4
    player.grounded = false
  }
  if (input.useMed && player.inv.meds > 0 && player.hp < 100) {
    player.inv.meds -= 1
    player.hp = clamp(player.hp + 40, 0, 100)
  }
  if (input.interact) tryInteract(state, player)
  if (input.craft) tryCraft(state, player)
  if (state.storm > 0.72 && state.tick % 40 === player.id.length % 7) {
    const edge = Math.hypot(player.x, player.z)
    if (edge > 36) hurt(player, 4)
  }
}

function stepEnemy(state: GameState, enemy: EnemyState) {
  if (enemy.ai === 'dead' || enemy.hp <= 0) {
    enemy.ai = 'dead'
    return
  }
  enemy.attackCd = Math.max(0, enemy.attackCd - DT)
  const path = PATROLS[enemy.id % PATROLS.length]
  const target = nearestLiving(state, enemy.x, enemy.z)
  const dist = target ? Math.hypot(target.x - enemy.x, target.z - enemy.z) : 999
  const sees =
    !!target &&
    dist < DETECT_R &&
    !losBlocked(enemy.x, enemy.z, target.x, target.z)

  if (sees && target) {
    enemy.detect = 1.6
    enemy.lastX = target.x
    enemy.lastZ = target.z
    enemy.ai = dist < ATTACK_R ? 'attack' : 'chase'
  } else if (enemy.detect > 0) {
    enemy.detect -= DT
    enemy.ai = 'search'
  } else if (enemy.ai !== 'patrol' && enemy.ai !== 'idle') {
    enemy.ai = 'return'
  }

  let tx = enemy.x
  let tz = enemy.z
  let spd = 2.6
  if (enemy.ai === 'patrol' || enemy.ai === 'idle') {
    enemy.ai = 'patrol'
    const node = path[enemy.patrolIndex % path.length]
    tx = node.x
    tz = node.z
    spd = 2.3
    if (dist2(enemy.x, enemy.z, tx, tz) < 1.1) enemy.patrolIndex += 1
  } else if (enemy.ai === 'chase' && target) {
    tx = target.x
    tz = target.z
    spd = 4.35
  } else if (enemy.ai === 'attack' && target) {
    tx = target.x
    tz = target.z
    spd = 1.4
    if (dist < ATTACK_R && enemy.attackCd <= 0 && !losBlocked(enemy.x, enemy.z, target.x, target.z)) {
      hurt(target, 16)
      enemy.attackCd = 1.15
    }
  } else if (enemy.ai === 'search') {
    tx = enemy.lastX
    tz = enemy.lastZ
    spd = 3.1
    enemy.searchT += DT
    if (dist2(enemy.x, enemy.z, tx, tz) < 1 || enemy.searchT > 4) {
      enemy.searchT = 0
      enemy.ai = 'return'
    }
  } else if (enemy.ai === 'return') {
    const node = path[enemy.patrolIndex % path.length]
    tx = node.x
    tz = node.z
    spd = 3.3
    if (dist2(enemy.x, enemy.z, tx, tz) < 1.2) enemy.ai = 'patrol'
  }

  const dx = tx - enemy.x
  const dz = tz - enemy.z
  const d = Math.hypot(dx, dz)
  if (d > 0.04) {
    enemy.yaw = Math.atan2(dx, dz)
    const step = Math.min(d, spd * DT)
    const nx = enemy.x + (dx / d) * step
    const nz = enemy.z + (dz / d) * step
    if (losBlocked(enemy.x, enemy.z, nx, nz)) {
      const side = resolveCollision(enemy.x + Math.cos(enemy.yaw) * step, enemy.z - Math.sin(enemy.yaw) * 0.7, ENEMY_R)
      enemy.x = side.x
      enemy.z = side.z
    } else {
      const pos = resolveCollision(nx, nz, ENEMY_R)
      enemy.x = pos.x
      enemy.z = pos.z
    }
  }
}

function livingCount(state: GameState): number {
  return state.players.filter((p) => !p.dead && p.connected).length
}

function inExtract(player: PlayerState): boolean {
  return dist2(player.x, player.z, EXTRACT.x, EXTRACT.z) < 4.6 * 4.6
}

function updateObjectives(state: GameState) {
  if (state.phase === 'drop') {
    state.dropT -= DT
    if (state.dropT <= 0) state.phase = 'play'
    return
  }
  if (state.phase === 'results') return
  state.timeLeft = Math.max(0, state.timeLeft - DT)
  state.matchSeconds += DT
  state.storm = clamp(1 - state.timeLeft / MATCH_SECONDS, 0, 1)
  const alive = livingCount(state)
  if (alive <= 0) {
    state.phase = 'results'
    state.outcome = 'defeat-wipe'
    return
  }
  if (state.timeLeft <= 0) {
    state.phase = 'results'
    state.outcome = 'defeat-time'
    return
  }
  if (state.beaconOn) {
    const holders = state.players.filter((p) => !p.dead && !p.downed && inExtract(p))
    if (holders.length > 0) {
      state.phase = 'extract'
      state.extractHold += DT
      if (state.extractHold >= EXTRACT_HOLD) {
        state.phase = 'results'
        state.outcome = 'victory'
        for (const p of holders) p.stats.survived = 1
      }
    } else if (state.phase === 'extract') {
      state.extractHold = Math.max(0, state.extractHold - DT * 0.35)
    }
  }
}

export function currentObjective(state: GameState): string {
  if (state.phase === 'drop') return 'Storm inbound. Get your bearings.'
  if (state.outcome === 'victory') return 'Rescue inbound. You made it.'
  if (state.outcome.startsWith('defeat')) return 'The island went dark.'
  if (!state.foundRepair) return 'Locate repair components.'
  if (!state.foundGenerator) return 'Find the maintenance generator.'
  if (!state.generatorOn) return 'Repair and activate the generator.'
  if (!state.beaconOn) return 'Restore the evacuation beacon.'
  if (state.phase !== 'extract') return 'Reach the extraction zone.'
  return `Hold the beacon until rescue (${Math.ceil(EXTRACT_HOLD - state.extractHold)}s).`
}

export function areaName(x: number, z: number): string {
  let best = 'Wilds'
  let bestD = Infinity
  for (const area of Object.values(AREAS)) {
    const d = dist2(x, z, area.x, area.z)
    if (d < bestD) {
      bestD = d
      best = area.label
    }
  }
  return best
}

export const ZERO_INPUT: PlayerInput = {
  ax: 0,
  az: 0,
  yaw: 0,
  jump: false,
  sprint: false,
  crouch: false,
  interact: false,
  craft: false,
  useMed: false,
}

export function sanitizeInput(raw: Partial<PlayerInput> | undefined, prevYaw: number): PlayerInput {
  const src = raw ?? {}
  return {
    ax: clamp(Number(src.ax) || 0, -1, 1),
    az: clamp(Number(src.az) || 0, -1, 1),
    yaw: Number.isFinite(src.yaw) ? Number(src.yaw) : prevYaw,
    jump: !!src.jump,
    sprint: !!src.sprint,
    crouch: !!src.crouch,
    interact: !!src.interact,
    craft: !!src.craft,
    useMed: !!src.useMed,
  }
}

export function stepMatch(state: GameState, inputs: Record<string, PlayerInput>): GameState {
  if (state.phase === 'results') return state
  state.tick += 1
  for (const player of state.players) {
    const input = sanitizeInput(inputs[player.id], player.yaw)
    if (!player.connected) {
      stepPlayer(state, player, { ...ZERO_INPUT, yaw: player.yaw })
      continue
    }
    stepPlayer(state, player, input)
  }
  if (state.phase !== 'drop') {
    for (const enemy of state.enemies) stepEnemy(state, enemy)
  }
  updateObjectives(state)
  return state
}

export function canCraft(player: PlayerState): boolean {
  return player.inv.metal >= 1 && player.inv.repair >= 1 && player.inv.kits < 4
}

export function inventoryTotal(inv: Inventory): number {
  return inv.metal + inv.batteries + inv.meds + inv.repair + inv.kits
}
