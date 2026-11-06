import { describe, expect, it } from 'vitest'
import { createMatch, ZERO_INPUT, stepMatch } from '../game/simulation'
import { PROTOCOL } from '../game/types'
import { applySnap, decodeMsg, encodeMsg, isHelloValid, packSnap } from './protocol'
import { decodeBundle, encodeBundle, hasMdnsOnlyCandidates, sdpHostCandidates, stripSdpCandidates, type SignalBundle } from './signaling'

describe('network protocol', () => {
  it('rejects oversized and malformed messages', () => {
    expect(decodeMsg('{')).toBeNull()
    expect(decodeMsg('x'.repeat(20_000))).toBeNull()
    expect(decodeMsg(encodeMsg({ t: 'leave' }))?.t).toBe('leave')
  })

  it('validates hello handshakes', () => {
    expect(isHelloValid({ t: 'hello', protocol: PROTOCOL, playerId: '12345678', name: 'A' })).toBe(true)
    expect(isHelloValid({ t: 'hello', protocol: 0, playerId: '12345678', name: 'A' })).toBe(false)
    expect(isHelloValid({ t: 'leave' })).toBe(false)
  })

  it('packs compact snaps under the message cap and restores authority fields', () => {
    const state = createMatch('ll-1', 9, [
      { id: 'aaaaaaaa', name: 'Host' },
      { id: 'bbbbbbbb', name: 'Guest' },
    ])
    state.phase = 'play'
    state.pickups[0].taken = true
    state.players[1].hp = 42
    state.players[1].stam = 55
    state.players[1].downed = true
    state.players[1].bleed = 25
    state.generatorOn = true
    state.beaconOn = true
    state.generator = 1
    state.storm = 0.4
    state.extractHold = 5.2
    state.enemies[0].ai = 'chase'
    state.enemies[0].detect = 1.2
    stepMatch(state, { aaaaaaaa: { ...ZERO_INPUT, az: -1 }, bbbbbbbb: ZERO_INPUT })
    const packed = packSnap(state)
    const msg = encodeMsg({ t: 'snap', s: packed })
    expect(msg.length).toBeLessThan(12_000)
    const clone = createMatch('ll-1', 9, [
      { id: 'aaaaaaaa', name: 'Host' },
      { id: 'bbbbbbbb', name: 'Guest' },
    ])
    applySnap(clone, packed)
    expect(clone.players[1].hp).toBe(42)
    expect(clone.players[1].stam).toBe(55)
    expect(clone.players[1].downed).toBe(true)
    expect(clone.pickups[0].taken).toBe(true)
    expect(clone.generatorOn).toBe(true)
    expect(clone.beaconOn).toBe(true)
    expect(clone.extractHold).toBeCloseTo(5.2, 1)
    expect(clone.enemies[0].ai).toBe(state.enemies[0].ai)
    expect(clone.players[0].z).toBeCloseTo(state.players[0].z, 1)
  })
})

describe('offline signaling blobs', () => {
  it('round-trips SDP and ICE candidates', async () => {
    const bundle: SignalBundle = {
      v: 1,
      role: 'offer',
      sessionId: 'll-test',
      name: 'Host',
      sdpType: 'offer',
      sdp: 'v=0\r\no=- 1 1 IN IP4 192.168.1.8\r\na=candidate:1 1 UDP 1 192.168.1.8 4000 typ host\r\n',
      ice: [{ candidate: 'candidate:1 1 UDP 1 192.168.1.8 4000 typ host', sdpMid: '0' }],
    }
    const encoded = await encodeBundle(bundle)
    expect(encoded.startsWith('LL1.')).toBe(true)
    const back = await decodeBundle(encoded)
    expect(stripSdpCandidates(back.sdp)).not.toContain('a=candidate:')
    expect(back.ice.some((c) => c.candidate?.includes('192.168.1.8'))).toBe(true)
  })

  it('trims candidate lines safely from SDP containing carriage returns', () => {
    const sdp = 'v=0\r\na=candidate:1 1 UDP 1 192.168.1.50 5000 typ host\r\n'
    const cands = sdpHostCandidates(sdp)
    expect(cands).toHaveLength(1)
    expect(cands[0].candidate).toBe('candidate:1 1 UDP 1 192.168.1.50 5000 typ host')
    expect(cands[0].candidate?.endsWith('\r')).toBe(false)
  })

  it('detects mDNS only candidates versus LAN IP candidates', () => {
    const mdnsBundle: SignalBundle = {
      v: 1,
      role: 'offer',
      sessionId: 'test',
      name: 'Host',
      sdpType: 'offer',
      sdp: 'a=candidate:1 1 UDP 1 abc.local 5000 typ host\n',
      ice: [{ candidate: 'candidate:1 1 UDP 1 abc.local 5000 typ host' }],
    }
    expect(hasMdnsOnlyCandidates(mdnsBundle)).toBe(true)

    const ipBundle: SignalBundle = {
      v: 1,
      role: 'offer',
      sessionId: 'test',
      name: 'Host',
      sdpType: 'offer',
      sdp: 'a=candidate:1 1 UDP 1 192.168.1.10 5000 typ host\n',
      ice: [{ candidate: 'candidate:1 1 UDP 1 192.168.1.10 5000 typ host' }],
    }
    expect(hasMdnsOnlyCandidates(ipBundle)).toBe(false)
  })

  it('rejects non LAST LIGHT codes', async () => {
    await expect(decodeBundle('ROOM-1234')).rejects.toThrow()
  })
})
