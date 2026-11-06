export type GamePhase = 'drop' | 'play' | 'extract' | 'results'
export type MatchOutcome =
  | 'ongoing'
  | 'victory'
  | 'defeat-time'
  | 'defeat-wipe'
  | 'defeat-impossible'

export type EnemyAiState =
  | 'idle'
  | 'patrol'
  | 'chase'
  | 'attack'
  | 'search'
  | 'return'
  | 'dead'

export type ResourceKind = 'metal' | 'batteries' | 'meds' | 'repair'

export type Inventory = {
  metal: number
  batteries: number
  meds: number
  repair: number
  kits: number
}

export type PlayerState = {
  id: string
  name: string
  x: number
  y: number
  z: number
  yaw: number
  hp: number
  stam: number
  downed: boolean
  dead: boolean
  bleed: number
  inv: Inventory
  grounded: boolean
  vy: number
  stats: {
    collected: number
    repairs: number
    damageTaken: number
    survived: number
  }
  connected: boolean
}

export type PickupState = {
  id: number
  kind: ResourceKind
  x: number
  z: number
  taken: boolean
}

export type EnemyState = {
  id: number
  x: number
  z: number
  yaw: number
  hp: number
  ai: EnemyAiState
  patrolIndex: number
  detect: number
  attackCd: number
  searchT: number
  lastX: number
  lastZ: number
}

export type GameState = {
  sessionId: string
  seed: number
  tick: number
  phase: GamePhase
  outcome: MatchOutcome
  timeLeft: number
  storm: number
  dropT: number
  generator: number
  generatorOn: boolean
  beaconOn: boolean
  extractHold: number
  foundGenerator: boolean
  foundRepair: boolean
  players: PlayerState[]
  pickups: PickupState[]
  enemies: EnemyState[]
  matchSeconds: number
}

export type PlayerInput = {
  ax: number
  az: number
  yaw: number
  jump: boolean
  sprint: boolean
  crouch: boolean
  interact: boolean
  craft: boolean
  useMed: boolean
}

export type Settings = {
  sensitivity: number
  leftHanded: boolean
  quality: 'low' | 'medium' | 'high'
  sfx: number
  ambience: number
  vibration: boolean
  fov: number
  showFps: boolean
  useStun: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  sensitivity: 1,
  leftHanded: false,
  quality: 'medium',
  sfx: 0.7,
  ambience: 0.45,
  vibration: true,
  fov: 58,
  showFps: false,
  useStun: false,
}

export const TICK_HZ = 20
export const DT = 1 / TICK_HZ
export const MATCH_SECONDS = 360
export const EXTRACT_HOLD = 16
export const MAX_PLAYERS = 4
/** Two-device WebRTC proof of concept. Extra slots wait on fan-out work. */
export const POC_PLAYERS = 2
export const PROTOCOL = 1
export const MAX_MSG = 12_000
export const HEARTBEAT_MS = 1000
export const TIMEOUT_MS = 15000
export const RECONNECT_MS = 45_000
