import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { decodeBundle, encodeBundle, candidateSummary, hasMdnsOnlyCandidates, type SignalBundle } from '../net/signaling'
import { Shell } from './screens'

type Props = {
  role: 'host' | 'guest'
  sessionId: string
  localName: string
  status: string
  detail: string
  onCreateOffer: () => Promise<SignalBundle>
  onAcceptOffer: (bundle: SignalBundle) => Promise<SignalBundle>
  onAcceptAnswer: (bundle: SignalBundle) => Promise<void>
  onCancel: () => void
}

export function Pairing({
  role,
  sessionId,
  localName,
  status,
  detail,
  onCreateOffer,
  onAcceptOffer,
  onAcceptAnswer,
  onCancel,
}: Props) {
  const [qr, setQr] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [paste, setPaste] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ips, setIps] = useState('')
  const [mdnsOnly, setMdnsOnly] = useState(false)
  const [copied, setCopied] = useState(false)
  const [scan, setScan] = useState(false)
  const [applying, setApplying] = useState(false)
  const video = useRef<HTMLVideoElement>(null)
  const raf = useRef(0)

  const showBundle = async (bundle: SignalBundle) => {
    const encoded = await encodeBundle(bundle)
    setCode(encoded)
    setIps(candidateSummary(bundle))
    setMdnsOnly(hasMdnsOnlyCandidates(bundle))
    try {
      setQr(await QRCode.toDataURL(encoded, { margin: 1, width: 280, errorCorrectionLevel: 'L' }))
    } catch {
      setQr(null)
      setError('Connection code is too large for a QR code. Copy the text instead.')
    }
  }

  const makeOffer = async () => {
    setError(null)
    try {
      const offer = await onCreateOffer()
      await showBundle(offer)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create offer')
    }
  }

  const processBundle = async (rawText: string) => {
    const trimmed = rawText.trim()
    if (!trimmed) {
      setError('Please paste or scan a connection code first')
      return
    }
    setError(null)
    setApplying(true)
    try {
      const bundle = await decodeBundle(trimmed)
      if (role === 'host') {
        if (bundle.role !== 'answer') {
          throw new Error('Expected a guest answer code, but got an offer')
        }
        await onAcceptAnswer(bundle)
      } else {
        if (bundle.role !== 'offer') {
          throw new Error('Expected a host offer code, but got an answer')
        }
        const answer = await onAcceptOffer(bundle)
        await showBundle(answer)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid connection code')
    } finally {
      setApplying(false)
    }
  }

  useEffect(() => {
    if (!scan || !video.current) return
    let stream: MediaStream | null = null
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    let active = true

    const loop = () => {
      if (!active) return
      const v = video.current
      if (v && ctx && v.readyState >= 2) {
        canvas.width = v.videoWidth
        canvas.height = v.videoHeight
        ctx.drawImage(v, 0, 0)
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const found = jsQR(img.data, img.width, img.height)
        if (found?.data && found.data.startsWith('LL1.')) {
          active = false
          setPaste(found.data)
          setScan(false)
          void processBundle(found.data)
          return
        }
      }
      raf.current = requestAnimationFrame(loop)
    }

    void (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Camera requires HTTPS or localhost')
        }
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (video.current && active) {
          video.current.srcObject = stream
          await video.current.play()
          loop()
        }
      } catch (err) {
        setError(err instanceof Error && err.message.includes('HTTPS') ? 'Camera requires HTTPS/localhost. Copy & paste the code instead.' : 'Camera unavailable. Paste the connection code instead.')
        setScan(false)
      }
    })()

    return () => {
      active = false
      cancelAnimationFrame(raf.current)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [scan])

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      el.remove()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const pasteClipboard = async () => {
    try {
      const clip = await navigator.clipboard?.readText()
      if (clip) {
        setPaste(clip.trim())
        if (clip.trim().startsWith('LL1.')) {
          void processBundle(clip.trim())
        }
      }
    } catch {
      setError('Clipboard read denied. Long-press the text box to paste.')
    }
  }

  return (
    <Shell>
      <button className="text-xs tracking-[0.2em] text-[#ff6a00] hover:text-white transition font-mono" onClick={onCancel}>← CANCEL</button>
      <h2 className="mt-3 font-display text-3xl text-white">{role === 'host' ? 'Host Pairing' : 'Join Pairing'}</h2>
      <p className="mt-2 text-sm text-[#f0e6d8]/75 leading-relaxed">
        WebRTC P2P handshake: direct SDP exchange plus ICE candidates. No cloud relay required. Both devices must share the same local Wi-Fi or phone hotspot.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="px-2 py-0.5 rounded bg-[#ff6a00]/20 text-[#ff8800] border border-[#ff6a00]/30">{status}</span>
        <span className="text-[#f0e6d8]/60">{detail}</span>
      </div>
      <p className="mt-1 text-xs text-[#f0e6d8]/50 font-mono">Operator: <span className="text-white font-bold">{localName}</span> · {sessionId || 'session pending'}</p>
      {ips ? <p className="mt-1 text-xs text-[#ff8800] font-mono">Host network candidates: {ips}</p> : null}
      {mdnsOnly ? (
        <p className="mt-2 rounded-lg bg-[#ff6a00]/15 p-2 text-xs text-[#ff8800] border border-[#ff6a00]/25">
          Notice: Browser advertised mDNS (.local) candidates. If devices cannot connect across your router, tap 'Scan QR' to allow camera (which unmasks real LAN IPs in Chrome/Safari) or connect both to a phone hotspot.
        </p>
      ) : null}
      {role === 'host' && !code ? (
        <button
          className="mt-4 rounded-xl bg-gradient-to-r from-[#c41e1e] via-[#e85d04] to-[#ff6a00] px-5 py-3 text-white font-black tracking-wider uppercase text-sm shadow-[0_0_20px_rgba(255,106,0,0.35)] hover:brightness-110 cursor-pointer"
          onClick={() => void makeOffer()}
        >
          Generate Connection Offer
        </button>
      ) : null}
      {qr ? (
        <div className="mt-4 flex flex-col items-center">
          <img src={qr} alt="Connection QR" className="w-56 rounded-xl bg-white p-2 shadow-[0_0_30px_rgba(255,106,0,0.3)] border-2 border-[#ff6a00]" />
          <p className="mt-1 text-[11px] font-mono text-[#f0e6d8]/60">Scan with secondary device camera</p>
        </div>
      ) : null}
      {code ? (
        <div className="mt-3">
          <textarea readOnly className="h-24 w-full rounded-xl bg-[#0a0a0a]/90 border border-[#ff6a00]/20 p-2.5 text-[10px] text-[#f0e6d8]/90 font-mono focus:outline-none" value={code} />
          <button
            className={`mt-2 rounded-xl border px-3 py-2 text-sm font-semibold transition cursor-pointer ${
              copied
                ? 'border-[#ff6a00] bg-[#ff6a00]/20 text-[#ff8800] shadow-[0_0_12px_rgba(255,106,0,0.3)]'
                : 'border-white/20 bg-[#15120f] text-white hover:border-[#ff6a00]/50'
            }`}
            onClick={() => void copyCode()}
          >
            {copied ? '✓ Copied to clipboard!' : 'Copy Connection Code'}
          </button>
        </div>
      ) : null}
      <div className="mt-5 border-t border-[#ff6a00]/20 pt-4">
        <p className="text-sm font-bold text-white">{role === 'host' ? 'Paste the Guest Answer Code' : 'Paste or Scan the Host Offer Code'}</p>
        <textarea
          className="mt-2 h-24 w-full rounded-xl bg-[#0a0a0a]/90 border border-[#ff6a00]/20 p-2.5 text-[10px] font-mono text-[#f0e6d8] placeholder-white/30 focus:border-[#ff6a00] focus:outline-none"
          placeholder="Paste LL1.... code here or tap Scan QR"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            disabled={applying}
            className="rounded-xl bg-gradient-to-r from-[#c41e1e] to-[#e85d04] px-5 py-2 text-sm font-black uppercase tracking-wider text-white disabled:opacity-50 shadow-[0_0_15px_rgba(255,106,0,0.3)] cursor-pointer"
            onClick={() => void processBundle(paste)}
          >
            {applying ? 'Applying…' : 'Apply Code'}
          </button>
          <button
            className="rounded-xl border border-white/20 bg-[#15120f] px-4 py-2 text-sm text-[#f0e6d8] hover:border-white/40 cursor-pointer"
            onClick={() => void pasteClipboard()}
          >
            Paste Clipboard
          </button>
          <button
            className="rounded-xl border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-4 py-2 text-sm text-[#ff8800] hover:bg-[#ff6a00]/20 cursor-pointer"
            onClick={() => setScan((s) => !s)}
          >
            {scan ? 'Stop Scan' : 'Scan QR'}
          </button>
        </div>
      </div>
      {scan ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-[#ff6a00]/50 shadow-[0_0_20px_rgba(255,106,0,0.25)]">
          <video ref={video} className="h-44 w-full object-cover" playsInline muted />
          <p className="bg-black/90 py-1.5 text-center text-xs font-mono text-[#ff8800]">Point camera at the other device's QR code</p>
        </div>
      ) : null}
      {status === 'connected' ? <p className="mt-3 text-sm text-[#ff8800] font-bold">✓ Data channel open. Waiting for lobby handshake…</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-[#c41e1e]/20 border border-[#c41e1e]/50 p-2.5 text-sm text-[#ffb4b4] font-mono">{error}</p> : null}
      <ol className="mt-6 list-decimal space-y-1.5 pl-5 text-xs text-[#f0e6d8]/60 font-mono">
        <li>Launch LAST LIGHT on both devices on the same Wi-Fi network.</li>
        <li>Host creates session and generates offer code.</li>
        <li>Guest scans or pastes the offer, producing an answer code.</li>
        <li>Host applies answer code to establish the WebRTC P2P data connection.</li>
      </ol>
    </Shell>
  )
}
