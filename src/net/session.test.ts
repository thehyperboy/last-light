import { afterEach, describe, expect, it, vi } from 'vitest'
import { pairLoopback } from './loopback'
import { MatchSession } from './session'

function makePair() {
  const events = { hostLobby: 0, guestLobby: 0, hostLost: 0 }
  const host = new MatchSession('aaaaaaaa', 'Host', false, {
    onLobby: () => {
      events.hostLobby += 1
    },
    onState: () => undefined,
    onInfo: () => undefined,
    onHostLost: () => {
      events.hostLost += 1
    },
  })
  const guest = new MatchSession('bbbbbbbb', 'Guest', false, {
    onLobby: () => {
      events.guestLobby += 1
    },
    onState: () => undefined,
    onInfo: () => undefined,
    onHostLost: () => {
      events.hostLost += 1
    },
  })
  host.prepareHost('ll-unit')
  guest.prepareGuest()
  const link = pairLoopback()
  link.attachA((m) => host.receive(m))
  link.attachB((m) => guest.receive(m))
  host.attachLoopback(link.sendA)
  guest.attachLoopback(link.sendB)
  return { host, guest, events }
}

describe('host-authoritative loopback session', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('handshakes two players, starts a match, and replicates movement and pickups', () => {
    vi.useFakeTimers()
    const { host, guest, events } = makePair()
    expect(events.guestLobby).toBeGreaterThan(0)
    expect(host.players).toHaveLength(2)
    expect(guest.players).toHaveLength(2)

    host.setLocalReady(true)
    guest.setLocalReady(true)
    expect(host.canStart()).toBe(true)
    host.startMatch(11)
    expect(host.match?.players).toHaveLength(2)
    expect(guest.match?.players).toHaveLength(2)

    const guestStartZ = host.match!.players[1].z
    guest.setLocalInput({
      ax: 0,
      az: -1,
      yaw: 0,
      jump: false,
      sprint: false,
      crouch: false,
      interact: false,
      craft: false,
      useMed: false,
    })
    vi.advanceTimersByTime(500)
    guest.setLocalInput({
      ax: 0,
      az: 0,
      yaw: 0,
      jump: false,
      sprint: false,
      crouch: false,
      interact: false,
      craft: false,
      useMed: false,
    })
    vi.advanceTimersByTime(200)
    expect(host.match!.players[1].z).not.toBeCloseTo(guestStartZ, 1)
    expect(guest.match!.players[1].z).toBeCloseTo(host.match!.players[1].z, 1)

    const item = host.match!.pickups[0]
    host.match!.players[0].x = item.x
    host.match!.players[0].z = item.z
    host.setLocalInput({
      ax: 0,
      az: 0,
      yaw: 0,
      jump: false,
      sprint: false,
      crouch: false,
      interact: true,
      craft: false,
      useMed: false,
    })
    vi.advanceTimersByTime(100)
    expect(host.match!.pickups[0].taken).toBe(true)
    expect(guest.match!.pickups[0].taken).toBe(true)

    host.dispose()
    guest.dispose()
  })

  it('rejects a third player in the two-device proof of concept', () => {
    const { host, guest } = makePair()
    host.receive({
      t: 'hello',
      protocol: 1,
      playerId: 'cccccccc',
      name: 'Intruder',
    })
    expect(host.players).toHaveLength(2)
    host.dispose()
    guest.dispose()
  })

  it('handles guest disconnect and successful match reconnection', () => {
    vi.useFakeTimers()
    const { host, guest } = makePair()
    host.setLocalReady(true)
    guest.setLocalReady(true)
    host.startMatch(42)

    expect(host.match).not.toBeNull()
    expect(guest.match).not.toBeNull()

    // Guest disconnects
    host.receive({ t: 'leave' })
    expect(host.players.find((p) => p.id === 'bbbbbbbb')?.connected).toBe(false)
    expect(host.reconnectUntil).not.toBeNull()

    // Guest reconnects to ongoing match
    host.receive({
      t: 'hello',
      protocol: 1,
      playerId: 'bbbbbbbb',
      name: 'Guest',
      sessionId: 'll-unit',
      reconnect: true,
    })

    expect(host.players.find((p) => p.id === 'bbbbbbbb')?.connected).toBe(true)
    expect(host.reconnectUntil).toBeNull()

    host.dispose()
    guest.dispose()
  })

  it('synchronizes generator progress and beacon state to guest', () => {
    vi.useFakeTimers()
    const { host, guest } = makePair()
    host.setLocalReady(true)
    guest.setLocalReady(true)
    host.startMatch(77)

    expect(guest.match?.generatorOn).toBe(false)
    expect(guest.match?.beaconOn).toBe(false)

    host.match!.generatorOn = true
    host.match!.generator = 1
    host.match!.beaconOn = true
    vi.advanceTimersByTime(200)

    expect(guest.match?.generatorOn).toBe(true)
    expect(guest.match?.beaconOn).toBe(true)

    host.dispose()
    guest.dispose()
  })

  it('notifies guest when host disconnects without migration', () => {
    const { host, guest, events } = makePair()
    guest.receive({ t: 'host-lost' })
    expect(guest.hostLost).toBe(true)
    expect(events.hostLost).toBe(1)
    host.dispose()
    guest.dispose()
  })
})
