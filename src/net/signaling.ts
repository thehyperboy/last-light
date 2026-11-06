export type SignalBundle = {
  v: 1
  role: 'offer' | 'answer'
  sessionId: string
  name: string
  sdpType: RTCSdpType
  sdp: string
  ice: RTCIceCandidateInit[]
}

const PREFIX = 'LL1.'

function b64url(bytes: Uint8Array): string {
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

function fromB64url(text: string): Uint8Array {
  const pad = '='.repeat((4 - (text.length % 4)) % 4)
  const b64 = text.replaceAll('-', '+').replaceAll('_', '/') + pad
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function deflate(text: string): Promise<Uint8Array> {
  if (typeof CompressionStream === 'undefined') return new TextEncoder().encode(text)
  const cs = new CompressionStream('deflate-raw')
  const writer = cs.writable.getWriter()
  await writer.write(new TextEncoder().encode(text) as BufferSource)
  await writer.close()
  const buf = await new Response(cs.readable).arrayBuffer()
  return new Uint8Array(buf)
}

async function inflate(bytes: Uint8Array): Promise<string> {
  if (typeof DecompressionStream === 'undefined') return new TextDecoder().decode(bytes)
  try {
    const ds = new DecompressionStream('deflate-raw')
    const writer = ds.writable.getWriter()
    await writer.write(bytes as BufferSource)
    await writer.close()
    return await new Response(ds.readable).text()
  } catch {
    return new TextDecoder().decode(bytes)
  }
}

export function stripSdpCandidates(sdp: string): string {
  return sdp
    .split(/\r?\n/)
    .filter((line) => !line.startsWith('a=candidate:') && line !== 'a=end-of-candidates')
    .join('\r\n')
}

function candidateKey(c: RTCIceCandidateInit): string {
  return `${c.sdpMid ?? ''}|${c.sdpMLineIndex ?? 0}|${c.candidate ?? ''}`
}

export function uniqueCandidates(list: RTCIceCandidateInit[]): RTCIceCandidateInit[] {
  const seen = new Set<string>()
  const out: RTCIceCandidateInit[] = []
  for (const c of list) {
    if (!c.candidate) continue
    const k = candidateKey(c)
    if (seen.has(k)) continue
    seen.add(k)
    out.push({ candidate: c.candidate, sdpMid: c.sdpMid ?? '0', sdpMLineIndex: c.sdpMLineIndex ?? 0 })
  }
  return out
}

export function sdpHostCandidates(sdp: string): RTCIceCandidateInit[] {
  const out: RTCIceCandidateInit[] = []
  for (const line of sdp.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('a=candidate:')) continue
    out.push({ candidate: trimmed.slice('a='.length), sdpMid: '0', sdpMLineIndex: 0 })
  }
  return out
}

export function candidateSummary(bundle: SignalBundle): string {
  const hosts: string[] = []
  const all = `${bundle.sdp}\n${bundle.ice.map((c) => c.candidate ?? '').join('\n')}`
  for (const line of all.split('\n')) {
    const parts = line.replace(/^a=/, '').trim().split(' ')
    if (!parts[0]?.startsWith('candidate:')) continue
    const ip = parts[4]
    const typ = parts[7]
    if (ip) hosts.push(`${ip}${typ ? ` (${typ})` : ''}`)
  }
  const unique = [...new Set(hosts)].slice(0, 6)
  return unique.length ? unique.join(', ') : 'no host IPs advertised yet'
}

export function hasUsableLanCandidate(bundle: SignalBundle): boolean {
  const text = `${bundle.sdp} ${bundle.ice.map((c) => c.candidate ?? '').join(' ')}`
  return /\btyp host\b/.test(text) || /\btyp srflx\b/.test(text)
}

export function hasMdnsOnlyCandidates(bundle: SignalBundle): boolean {
  const all = `${bundle.sdp}\n${bundle.ice.map((c) => c.candidate ?? '').join('\n')}`
  const hosts = all.split('\n').filter((l) => l.includes('typ host'))
  if (hosts.length === 0) return false
  return hosts.every((l) => /\.local\b/.test(l))
}

export async function encodeBundle(bundle: SignalBundle): Promise<string> {
  const packedBundle: SignalBundle = {
    ...bundle,
    sdp: stripSdpCandidates(bundle.sdp),
    ice: uniqueCandidates([...sdpHostCandidates(bundle.sdp), ...bundle.ice]),
  }
  const json = JSON.stringify(packedBundle)
  const packed = await deflate(json)
  return PREFIX + b64url(packed)
}

export async function decodeBundle(text: string): Promise<SignalBundle> {
  const trimmed = text.trim()
  if (!trimmed.startsWith(PREFIX)) throw new Error('Not a LAST LIGHT connection code')
  const bytes = fromB64url(trimmed.slice(PREFIX.length))
  const json = await inflate(bytes)
  const parsed = JSON.parse(json) as SignalBundle
  if (parsed.v !== 1 || (parsed.role !== 'offer' && parsed.role !== 'answer') || !parsed.sdp) {
    throw new Error('Invalid connection description')
  }
  parsed.ice = uniqueCandidates(parsed.ice ?? [])
  return parsed
}

export const LAN_RTC_CONFIG: RTCConfiguration = {
  iceServers: [],
  iceCandidatePoolSize: 0,
  iceTransportPolicy: 'all',
}

export const STUN_RTC_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  iceCandidatePoolSize: 0,
  iceTransportPolicy: 'all',
}

export async function waitForIce(pc: RTCPeerConnection, timeoutMs = 8000): Promise<RTCIceCandidateInit[]> {
  const extra: RTCIceCandidateInit[] = []
  if (pc.iceGatheringState === 'complete') return extra
  await new Promise<void>((resolve) => {
    let settled = false
    const done = () => {
      if (settled) return
      settled = true
      pc.removeEventListener('icegatheringstatechange', onState)
      pc.removeEventListener('icecandidate', onCand)
      resolve()
    }
    const onState = () => {
      if (pc.iceGatheringState === 'complete') done()
    }
    const onCand = (ev: RTCPeerConnectionIceEvent) => {
      if (ev.candidate) {
        extra.push(ev.candidate.toJSON())
      } else {
        done()
      }
    }
    pc.addEventListener('icegatheringstatechange', onState)
    pc.addEventListener('icecandidate', onCand)
    window.setTimeout(done, timeoutMs)
  })
  return uniqueCandidates(extra)
}
