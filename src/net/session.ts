import { createMatch, sanitizeInput, stepMatch, ZERO_INPUT } from '../game/simulation'
import {
  DT,
  HEARTBEAT_MS,
  POC_PLAYERS,
  PROTOCOL,
  RECONNECT_MS,
  TIMEOUT_MS,
  TICK_HZ,
  type GameState,
  type PlayerInput,
} from '../game/types'
import { GamePeer, type PeerStatus } from './peer'
import { applySnap, isHelloValid, packSnap, type NetMsg } from './protocol'

export type LobbyPlayer = {
  id: string
  name: string
  ready: boolean
  host: boolean
  connected: boolean
}

export type SessionInfo = {
  role: 'solo' | 'host' | 'guest'
  status: PeerStatus | 'solo' | 'loopback'
  detail: string
  sessionId: string
  players: LobbyPlayer[]
  hostLost: boolean
  reconnectUntil: number | null
}

type SessionHandlers = {
  onLobby: () => void
  onState: (state: GameState) => void
  onInfo: () => void
  onHostLost: () => void
}

type Link = {
  send: (msg: NetMsg) => boolean
  status: () => PeerStatus | 'loopback'
  lastSeen: () => number
  close: () => void
}

export class MatchSession {
  role: SessionInfo['role'] = 'solo'
  peer: GamePeer | null = null
  sessionId = ''
  localId = ''
  localName = 'Survivor'
  players: LobbyPlayer[] = []
  match: GameState | null = null
  hostLost = false
  reconnectUntil: number | null = null
  detail = 'Offline solo'
  status: PeerStatus | 'solo' | 'loopback' = 'solo'
  private inputs = new Map<string, PlayerInput>()
  private edge = new Map<string, { interact: boolean; craft: boolean; useMed: boolean; jump: boolean }>()
  private tickTimer = 0
  private beatTimer = 0
  private lastSnap = 0
  private handlers: SessionHandlers
  private useStun: boolean
  private started = false
  private link: Link | null = null
  private seq = 0
  private guestId: string | null = null

  constructor(localId: string, localName: string, useStun: boolean, handlers: SessionHandlers) {
    this.localId = localId
    this.localName = localName
    this.useStun = useStun
    this.handlers = handlers
  }

  info(): SessionInfo {
    return {
      role: this.role,
      status: this.status,
      detail: this.detail,
      sessionId: this.sessionId,
      players: this.players,
      hostLost: this.hostLost,
      reconnectUntil: this.reconnectUntil,
    }
  }

  startSolo(seed: number) {
    this.stopNet()
    this.role = 'solo'
    this.status = 'solo'
    this.detail = 'Solo survival'
    this.sessionId = `solo-${seed}`
    this.players = [{ id: this.localId, name: this.localName, ready: true, host: true, connected: true }]
    this.match = createMatch(this.sessionId, seed, [{ id: this.localId, name: this.localName }])
    this.started = true
    this.hostLost = false
    this.inputs.clear()
    this.beginLoop()
    this.handlers.onState(this.match)
  }

  setUseStun(value: boolean) {
    this.useStun = value
  }

  prepareHost(sessionId: string) {
    this.stopNet()
    this.role = 'host'
    this.sessionId = sessionId
    this.started = false
    this.hostLost = false
    this.match = null
    this.guestId = null
    this.players = [{ id: this.localId, name: this.localName, ready: false, host: true, connected: true }]
    this.attachPeer('host')
  }

  prepareGuest() {
    this.stopNet()
    this.role = 'guest'
    this.started = false
    this.hostLost = false
    this.match = null
    this.players = []
    this.attachPeer('guest')
  }

  /** New WebRTC handshake without wiping an in-progress match. */
  beginReconnectHandshake() {
    this.hostLost = false
    this.attachPeer(this.role === 'host' ? 'host' : 'guest')
    this.detail = this.role === 'host' ? 'Generate a new offer for the guest' : 'Paste a new host offer to reconnect'
    this.handlers.onInfo()
  }

  attachLoopback(send: (msg: NetMsg) => void) {
    this.link = {
      send: (msg) => {
        send(msg)
        return true
      },
      status: () => 'loopback',
      lastSeen: () => Date.now(),
      close: () => undefined,
    }
    this.status = 'loopback'
    this.detail = 'Loopback test link'
    if (this.role === 'guest') this.sendHello()
    this.handlers.onInfo()
  }

  receive(msg: NetMsg) {
    if (this.role === 'host') this.onHostMsg(msg)
    else if (this.role === 'guest') this.onGuestMsg(msg)
  }

  private attachPeer(role: 'host' | 'guest') {
    this.peer?.close()
    this.peer = new GamePeer(role, this.useStun, {
      onStatus: (s, d) => {
        this.status = s
        this.detail = d
        if (s === 'disconnected' || s === 'failed') {
          if (this.role === 'host') this.onPeerDrop()
          else this.onGuestDrop()
        }
        if (s === 'connected' && this.role === 'guest') this.sendHello()
        this.handlers.onInfo()
      },
      onMessage: (m) => this.receive(m),
    })
    this.link = {
      send: (msg) => this.peer?.send(msg) ?? false,
      status: () => this.peer?.status ?? 'idle',
      lastSeen: () => this.peer?.lastSeen ?? 0,
      close: () => this.peer?.close(),
    }
    this.status = 'idle'
    this.detail = 'Waiting for connection codes'
    this.handlers.onInfo()
  }

  private send(msg: NetMsg): boolean {
    return this.link?.send(msg) ?? false
  }

  private sendHello() {
    this.send({
      t: 'hello',
      protocol: PROTOCOL,
      playerId: this.localId,
      name: this.localName,
      sessionId: this.sessionId || undefined,
      reconnect: !!this.sessionId && this.started,
    })
  }

  private broadcastLobby() {
    const lobby: NetMsg = { t: 'lobby', players: this.players, map: 'Stormfall Isle', cap: POC_PLAYERS }
    this.send(lobby)
    this.handlers.onLobby()
  }

  private emitSnap() {
    if (!this.match) return
    this.lastSnap = Date.now()
    this.send({ t: 'snap', s: packSnap(this.match) })
  }

  private onHostMsg(msg: NetMsg) {
    if (msg.t === 'ping') {
      this.send({ t: 'pong', t0: msg.t0 })
      return
    }
    if (msg.t === 'hello') {
      if (!isHelloValid(msg)) {
        this.send({ t: 'reject', reason: 'Invalid handshake' })
        return
      }
      if (this.started && msg.reconnect && msg.sessionId === this.sessionId) {
        const existing = this.players.find((p) => p.id === msg.playerId && !p.host)
        if (existing) {
          existing.connected = true
          existing.name = msg.name.slice(0, 18)
          this.guestId = existing.id
          if (this.match) {
            const pl = this.match.players.find((p) => p.id === msg.playerId)
            if (pl) pl.connected = true
          }
          this.reconnectUntil = null
          this.detail = `${existing.name} reconnected`
          this.send({ t: 'welcome', playerId: msg.playerId, sessionId: this.sessionId, slot: this.players.indexOf(existing), hostName: this.localName })
          this.broadcastLobby()
          this.emitSnap()
          return
        }
        this.send({ t: 'reject', reason: 'Unknown player for this session' })
        return
      }
      if (this.started) {
        this.send({ t: 'reject', reason: 'Match already in progress' })
        return
      }
      if (this.players.some((p) => p.id === msg.playerId)) {
        this.send({ t: 'reject', reason: 'Duplicate player id' })
        return
      }
      if (this.players.some((p) => p.name.toLowerCase() === msg.name.slice(0, 18).toLowerCase())) {
        this.send({ t: 'reject', reason: 'Duplicate player name' })
        return
      }
      if (this.players.length >= POC_PLAYERS) {
        this.send({ t: 'reject', reason: 'This build supports 2 devices. Four-player fan-out is not implemented.' })
        return
      }
      this.guestId = msg.playerId
      this.players.push({ id: msg.playerId, name: msg.name.slice(0, 18), ready: false, host: false, connected: true })
      this.send({ t: 'welcome', playerId: msg.playerId, sessionId: this.sessionId, slot: this.players.length - 1, hostName: this.localName })
      this.broadcastLobby()
      return
    }
    if (msg.t === 'ready') {
      const p = this.players.find((x) => x.id === msg.playerId && !x.host)
      if (p) p.ready = msg.ready
      this.broadcastLobby()
      return
    }
    if (msg.t === 'input') {
      if (!this.guestId || msg.playerId !== this.guestId) return
      const guest = this.match?.players.find((p) => p.id === this.guestId)
      this.inputs.set(this.guestId, sanitizeInput(msg.in, guest?.yaw ?? 0))
      return
    }
    if (msg.t === 'leave') this.onPeerDrop()
  }

  private onGuestMsg(msg: NetMsg) {
    if (msg.t === 'reject') {
      this.detail = msg.reason
      this.status = 'failed'
      this.handlers.onInfo()
      return
    }
    if (msg.t === 'welcome') {
      this.localId = msg.playerId
      this.sessionId = msg.sessionId
      this.hostLost = false
      this.detail = `Joined ${msg.hostName}`
      this.handlers.onInfo()
      return
    }
    if (msg.t === 'lobby') {
      this.players = msg.players
      this.handlers.onLobby()
      return
    }
    if (msg.t === 'start') {
      this.started = true
      this.hostLost = false
      this.match = createMatch(msg.sessionId, msg.seed, this.players.map((p) => ({ id: p.id, name: p.name })))
      this.sessionId = msg.sessionId
      this.beginLoop()
      this.handlers.onState(this.match)
      return
    }
    if (msg.t === 'snap') {
      if (!this.match) {
        this.match = createMatch(
          msg.s.sid,
          msg.s.seed,
          msg.s.players.map((p) => ({ id: p.id, name: p.name })),
        )
        this.started = true
        this.beginLoop()
      }
      applySnap(this.match, msg.s)
      this.handlers.onState(this.match)
      return
    }
    if (msg.t === 'host-lost' || msg.t === 'pause') {
      this.hostLost = true
      this.handlers.onHostLost()
    }
  }

  private onPeerDrop() {
    if (this.role !== 'host') return
    const guest = this.players.find((p) => !p.host)
    if (guest) guest.connected = false
    if (this.match) {
      const pl = this.match.players.find((p) => p.id === guest?.id)
      if (pl) pl.connected = false
    }
    this.reconnectUntil = Date.now() + RECONNECT_MS
    this.detail = 'Guest disconnected. Reconnect window open — generate a new offer.'
    this.handlers.onInfo()
  }

  private onGuestDrop() {
    this.hostLost = true
    this.detail = 'Host disconnected. Authority cannot migrate.'
    this.handlers.onHostLost()
  }

  setLocalReady(ready: boolean) {
    const me = this.players.find((p) => p.id === this.localId || (this.role === 'host' && p.host))
    if (me) me.ready = ready
    if (this.role === 'guest') this.send({ t: 'ready', ready, playerId: this.localId })
    if (this.role === 'host') this.broadcastLobby()
  }

  canStart(): boolean {
    if (this.role !== 'host' || this.started) return false
    if (this.status !== 'connected' && this.status !== 'loopback') return false
    if (this.players.length < 2) return false
    if (this.players.length > POC_PLAYERS) return false
    return this.players.every((p) => p.ready && p.connected)
  }

  startMatch(seed: number, force = false) {
    if (!force && !this.canStart()) return
    if (!this.sessionId) return
    if (this.role === 'host' && this.status !== 'connected' && this.status !== 'loopback') return
    this.started = true
    this.match = createMatch(
      this.sessionId,
      seed,
      this.players.map((p) => ({ id: p.id, name: p.name })),
    )
    this.send({ t: 'start', seed, sessionId: this.sessionId })
    this.emitSnap()
    this.beginLoop()
    this.handlers.onState(this.match)
  }

  rematch(seed: number) {
    if (this.role === 'solo') {
      this.startSolo(seed)
      return
    }
    if (this.role !== 'host') return
    if (this.status !== 'connected' && this.status !== 'loopback') return
    this.startMatch(seed, true)
  }

  skipDrop() {
    if (this.role === 'guest') return
    if (this.match && this.match.phase === 'drop') {
      this.match.dropT = 0
      this.match.phase = 'play'
      this.emitSnap()
      this.handlers.onState(this.match)
    }
  }

  setLocalInput(input: PlayerInput) {
    const prev = this.edge.get(this.localId)
    const rising: PlayerInput = {
      ...input,
      interact: input.interact && !prev?.interact,
      craft: input.craft && !prev?.craft,
      useMed: input.useMed && !prev?.useMed,
      jump: input.jump && !prev?.jump,
    }
    this.edge.set(this.localId, {
      interact: input.interact,
      craft: input.craft,
      useMed: input.useMed,
      jump: input.jump,
    })
    this.inputs.set(this.localId, rising)
    if (this.role === 'guest') {
      this.seq += 1
      this.send({ t: 'input', seq: this.seq, playerId: this.localId, in: rising })
    }
  }

  private beginLoop() {
    globalThis.clearInterval(this.tickTimer)
    globalThis.clearInterval(this.beatTimer)
    this.tickTimer = globalThis.setInterval(() => this.tick(), 1000 / TICK_HZ) as unknown as number
    this.beatTimer = globalThis.setInterval(() => this.heartbeat(), HEARTBEAT_MS) as unknown as number
  }

  private heartbeat() {
    if (this.role === 'guest') this.send({ t: 'ping', t0: Date.now() })
    if (this.role === 'solo' || this.status === 'loopback') return
    const peer = this.peer
    if (!peer) return
    if (peer.status === 'connected') {
      if (Date.now() - peer.lastSeen > TIMEOUT_MS) {
        if (this.role === 'host') this.onPeerDrop()
        else this.onGuestDrop()
      }
      return
    }
    if (this.role === 'guest' && this.started && Date.now() - peer.lastSeen > TIMEOUT_MS) {
      this.onGuestDrop()
    }
  }

  private tick() {
    if (!this.match) return
    if (this.role === 'guest') return
    const map: Record<string, PlayerInput> = {}
    for (const p of this.match.players) {
      map[p.id] = this.inputs.get(p.id) ?? { ...ZERO_INPUT, yaw: p.yaw }
    }
    stepMatch(this.match, map)
    for (const [id, inp] of this.inputs) {
      this.inputs.set(id, { ...inp, interact: false, craft: false, useMed: false, jump: false })
    }
    this.handlers.onState(this.match)
    if (this.role === 'host' && (this.status === 'connected' || this.status === 'loopback')) {
      const now = Date.now()
      if (now - this.lastSnap > DT * 1000 * 1.6) {
        this.lastSnap = now
        this.emitSnap()
      }
    }
  }

  leave() {
    this.send({ t: 'leave' })
    this.dispose()
  }

  dispose() {
    globalThis.clearInterval(this.tickTimer)
    globalThis.clearInterval(this.beatTimer)
    this.stopNet()
    this.match = null
    this.started = false
  }

  private stopNet() {
    this.link?.close()
    this.link = null
    this.peer = null
    this.status = this.role === 'solo' ? 'solo' : 'idle'
  }
}
