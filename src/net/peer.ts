import {
  LAN_RTC_CONFIG,
  STUN_RTC_CONFIG,
  hasUsableLanCandidate,
  type SignalBundle,
  waitForIce,
} from './signaling'
import { MAX_MSG } from '../game/types'
import { decodeMsg, encodeMsg, type NetMsg } from './protocol'

export type PeerRole = 'host' | 'guest'
export type PeerStatus =
  | 'idle'
  | 'gathering'
  | 'waiting-answer'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'failed'

type Handlers = {
  onStatus: (status: PeerStatus, detail: string) => void
  onMessage: (msg: NetMsg) => void
}

export class GamePeer {
  role: PeerRole
  status: PeerStatus = 'idle'
  detail = ''
  pc: RTCPeerConnection | null = null
  channel: RTCDataChannel | null = null
  private handlers: Handlers
  private useStun: boolean
  private lastActivity = Date.now()

  constructor(role: PeerRole, useStun: boolean, handlers: Handlers) {
    this.role = role
    this.useStun = useStun
    this.handlers = handlers
  }

  get lastSeen(): number {
    return this.lastActivity
  }

  private setStatus(status: PeerStatus, detail: string) {
    this.status = status
    this.detail = detail
    this.handlers.onStatus(status, detail)
  }

  private config(): RTCConfiguration {
    return this.useStun ? STUN_RTC_CONFIG : LAN_RTC_CONFIG
  }

  private wireChannel(channel: RTCDataChannel) {
    this.channel = channel
    channel.binaryType = 'arraybuffer'
    channel.bufferedAmountLowThreshold = 16_000
    channel.onopen = () => {
      this.lastActivity = Date.now()
      this.setStatus('connected', 'Data channel open')
    }
    channel.onclose = () => {
      if (this.status === 'connected') this.setStatus('disconnected', 'Data channel closed')
    }
    channel.onerror = () => {
      if (this.status !== 'idle') this.setStatus('failed', 'Data channel error')
    }
    channel.onmessage = (ev) => {
      this.lastActivity = Date.now()
      if (typeof ev.data !== 'string') return
      const msg = decodeMsg(ev.data)
      if (msg) this.handlers.onMessage(msg)
    }
  }

  private bindPc(pc: RTCPeerConnection) {
    this.pc = pc
    pc.onconnectionstatechange = () => {
      const s = pc.connectionState
      if (s === 'connected' && this.channel?.readyState !== 'open') {
        this.setStatus('connecting', 'ICE connected, waiting for data channel')
      }
      if (s === 'disconnected' && this.status === 'connected') {
        this.setStatus('disconnected', 'Peer disconnected')
      }
      if (s === 'failed') this.setStatus('failed', 'Peer connection failed — same Wi-Fi or hotspot required')
      if (s === 'connecting' && this.status !== 'connected') this.setStatus('connecting', 'ICE connecting')
    }
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') this.setStatus('failed', 'ICE failed — same Wi-Fi required, or enable STUN assist')
    }
  }

  private async localBundle(role: SignalBundle['role'], sessionId: string, name: string): Promise<SignalBundle> {
    const pc = this.pc
    if (!pc) throw new Error('Peer connection missing')
    const ice = await waitForIce(pc)
    const local = pc.localDescription
    if (!local?.sdp) throw new Error('No local SDP')
    const bundle: SignalBundle = {
      v: 1,
      role,
      sessionId,
      name,
      sdpType: local.type,
      sdp: local.sdp,
      ice,
    }
    if (!hasUsableLanCandidate(bundle)) {
      this.setStatus(
        'waiting-answer',
        'No LAN host candidate yet. Use a phone hotspot, or enable STUN assist in Settings (needs internet only to gather addresses).',
      )
    }
    return bundle
  }

  async createHostOffer(sessionId: string, name: string): Promise<SignalBundle> {
    this.close()
    const pc = new RTCPeerConnection(this.config())
    this.bindPc(pc)
    const channel = pc.createDataChannel('lastlight', { ordered: true })
    this.wireChannel(channel)
    this.setStatus('gathering', 'Gathering local ICE candidates')
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    const bundle = await this.localBundle('offer', sessionId, name)
    this.setStatus('waiting-answer', 'Share this offer, then paste the guest answer')
    return bundle
  }

  async acceptOfferMakeAnswer(bundle: SignalBundle, name: string): Promise<SignalBundle> {
    if (bundle.role !== 'offer') throw new Error('Expected a host offer code')
    this.close()
    const pc = new RTCPeerConnection(this.config())
    this.bindPc(pc)
    pc.ondatachannel = (ev) => this.wireChannel(ev.channel)
    this.setStatus('gathering', 'Applying host offer and gathering answer ICE')
    await pc.setRemoteDescription({ type: bundle.sdpType, sdp: bundle.sdp })
    const answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)
    await addIce(pc, bundle.ice)
    const local = await this.localBundle('answer', bundle.sessionId, name)
    this.setStatus('connecting', 'Share this answer with the host')
    return local
  }

  async acceptAnswer(bundle: SignalBundle): Promise<void> {
    const pc = this.pc
    if (!pc) throw new Error('Create an offer first')
    if (bundle.role !== 'answer') throw new Error('Expected an answer code')
    if (pc.signalingState !== 'have-local-offer') throw new Error('Host is not waiting for an answer')
    await pc.setRemoteDescription({ type: bundle.sdpType, sdp: bundle.sdp })
    await addIce(pc, bundle.ice)
    this.setStatus('connecting', 'Answer applied, waiting for channel')
  }

  send(msg: NetMsg): boolean {
    if (!this.channel || this.channel.readyState !== 'open') return false
    const payload = encodeMsg(msg)
    if (payload.length > MAX_MSG) return false
    try {
      this.channel.send(payload)
      return true
    } catch {
      return false
    }
  }

  close() {
    this.status = 'idle'
    const channel = this.channel
    const pc = this.pc
    this.channel = null
    this.pc = null
    if (channel) {
      channel.onopen = null
      channel.onclose = null
      channel.onerror = null
      channel.onmessage = null
      try {
        channel.close()
      } catch {
        /* already closed */
      }
    }
    if (pc) {
      pc.onconnectionstatechange = null
      pc.oniceconnectionstatechange = null
      pc.ondatachannel = null
      try {
        pc.close()
      } catch {
        /* already closed */
      }
    }
  }
}

async function addIce(pc: RTCPeerConnection, ice: RTCIceCandidateInit[]) {
  for (const c of ice) {
    try {
      await pc.addIceCandidate(c)
    } catch {
      /* ignore stale or malformed */
    }
  }
}
