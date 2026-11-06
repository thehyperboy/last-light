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
      <button className="text-xs tracking-[0.2em] text-amber" onClick={onCancel}>← CANCEL</button>
      <h2 className="mt-3 font-display text-3xl">{role === 'host' ? 'Host pairing' : 'Join pairing'}</h2>
      <p className="mt-2 text-sm text-ivory/70">
        This is a genuine WebRTC handshake: session description plus ICE candidates. A room code is not a connection.
        Both devices must be on the same Wi-Fi or phone hotspot. No cloud signaling server is used.
      </p>
      <p className="mt-2 text-xs uppercase tracking-widest text-ivory/50">{status} · {detail}</p>
      <p className="mt-1 text-xs text-ivory/50">Playing as {localName} · {sessionId || 'session pending'}</p>
      {ips ? <p className="mt-1 text-xs text-amber">Advertised host candidates: {ips}</p> : null}
      {mdnsOnly ? (
        <p className="mt-2 rounded-lg bg-amber/15 p-2 text-xs text-amber">
          Notice: Browser advertised mDNS (.local) candidates. If devices cannot connect across your router, tap 'Scan QR' to allow camera (which unmasks real LAN IPs in Chrome/Safari) or connect both to a phone hotspot.
        </p>
      ) : null}
      {role === 'host' && !code ? (
        <button className="mt-4 rounded-2xl bg-amber px-4 py-3 text-charcoal font-semibold" onClick={() => void makeOffer()}>
          Generate connection offer
        </button>
      ) : null}
      {qr ? <img src={qr} alt="Connection QR" className="mx-auto mt-4 w-56 rounded-xl bg-ivory p-2 shadow-lg" /> : null}
      {code ? (
        <div className="mt-3">
          <textarea readOnly className="h-24 w-full rounded-xl bg-black/40 p-2 text-[10px] text-ivory/80 font-mono" value={code} />
          <button
            className={`mt-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${copied ? 'border-amber bg-amber/20 text-amber' : 'border-ivory/20'}`}
            onClick={() => void copyCode()}
          >
            {copied ? '✓ Copied to clipboard!' : 'Copy connection code'}
          </button>
        </div>
      ) : null}
      <div className="mt-5">
        <p className="text-sm font-semibold">{role === 'host' ? 'Paste the guest answer' : 'Paste or scan the host offer'}</p>
        <textarea
          className="mt-2 h-24 w-full rounded-xl bg-black/40 p-2 text-[10px] font-mono text-ivory"
          placeholder="Paste LL1.... code here or tap Scan QR"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            disabled={applying}
            className="rounded-xl bg-amber px-4 py-2 text-sm font-semibold text-charcoal disabled:opacity-50"
            onClick={() => void processBundle(paste)}
          >
            {applying ? 'Applying…' : 'Apply'}
          </button>
          <button
            className="rounded-xl border border-ivory/20 px-4 py-2 text-sm"
            onClick={() => void pasteClipboard()}
          >
            Paste from Clipboard
          </button>
          <button
            className="rounded-xl border border-ivory/20 px-4 py-2 text-sm"
            onClick={() => setScan((s) => !s)}
          >
            {scan ? 'Stop scan' : 'Scan QR'}
          </button>
        </div>
      </div>
      {scan ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-amber/40">
          <video ref={video} className="h-44 w-full object-cover" playsInline muted />
          <p className="bg-black/80 py-1 text-center text-xs text-amber">Point camera at the other phone's QR code</p>
        </div>
      ) : null}
      {status === 'connected' ? <p className="mt-3 text-sm text-amber font-semibold">Data channel open. Waiting for lobby handshake…</p> : null}
      {error ? <p className="mt-3 rounded-lg bg-red/20 p-2 text-sm text-red">{error}</p> : null}
      <ol className="mt-6 list-decimal space-y-1 pl-5 text-xs text-ivory/60">
        <li>Open LAST LIGHT on both devices (PWA or same LAN page). Internet is not required after the app is cached.</li>
        <li>Host creates a session and shows an offer QR / code.</li>
        <li>Guest scans or pastes the offer, which generates and displays an answer.</li>
        <li>Host pastes or scans the answer. When the data channel opens, both appear in the lobby.</li>
      </ol>
    </Shell>
  )
}
