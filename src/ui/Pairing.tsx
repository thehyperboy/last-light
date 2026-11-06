import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import { decodeBundle, encodeBundle, candidateSummary, hasMdnsOnlyCandidates, type SignalBundle } from '../net/signaling'
import { CornerFlourish, Insignia, MetallicDivider } from './FantasyIcons'
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
      setQr(await QRCode.toDataURL(encoded, { margin: 1, width: 260, errorCorrectionLevel: 'L' }))
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
      setError('Please paste or scan a connection token first')
      return
    }
    setError(null)
    setApplying(true)
    try {
      const bundle = await decodeBundle(trimmed)
      if (role === 'host') {
        if (bundle.role !== 'answer') {
          throw new Error('Expected a guest answer token, but got an offer')
        }
        await onAcceptAnswer(bundle)
      } else {
        if (bundle.role !== 'offer') {
          throw new Error('Expected a host offer token, but got an answer')
        }
        const answer = await onAcceptOffer(bundle)
        await showBundle(answer)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid connection token')
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
        setError(
          err instanceof Error && err.message.includes('HTTPS')
            ? 'Camera requires HTTPS/localhost. Copy & paste the code instead.'
            : 'Camera unavailable. Paste the connection code instead.',
        )
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
    <Shell bg="/bunker-bg.jpg">
      <div className="df-panel mx-auto my-auto w-full max-w-xl p-6 sm:p-8 relative">
        <CornerFlourish position="top-left" color="#C59B61" size={24} />
        <CornerFlourish position="top-right" color="#C59B61" size={24} />
        <CornerFlourish position="bottom-left" color="#C59B61" size={24} />
        <CornerFlourish position="bottom-right" color="#C59B61" size={24} />

        <div className="flex items-center justify-between border-b border-[#AAA69B]/20 pb-3">
          <div className="flex items-center gap-2.5">
            <Insignia className="h-7 w-7" />
            <h2 className="font-cinzel text-base sm:text-lg font-bold tracking-[0.22em] text-[#E8E4DC]">
              {role === 'host' ? 'TRANSMIT HOST OFFER' : 'JOIN EXPEDITION'}
            </h2>
          </div>

          <button
            onClick={onCancel}
            className="df-btn-silver px-3 py-1 text-xs tracking-wider cursor-pointer"
          >
            ← Cancel
          </button>
        </div>

        <p className="mt-3 text-xs text-[#AAA69B] leading-relaxed font-sans">
          This is a genuine WebRTC handshake: session description plus ICE network candidates. Both devices must be on the same local Wi-Fi or phone hotspot. No cloud server is used.
        </p>

        <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#AAA69B]/70">
          <span>Operative: <strong className="text-[#C59B61]">{localName}</strong></span>
          <span>Status: <strong className="text-[#E8E4DC]">{status}</strong></span>
        </div>
        {detail ? <p className="mt-1 text-[11px] font-mono text-[#AAA69B]">{detail}</p> : null}
        {sessionId ? <p className="mt-0.5 text-[10px] font-mono text-[#AAA69B]/50">Session ID: {sessionId}</p> : null}

        {ips ? <p className="mt-1 text-[11px] font-mono text-[#C59B61]">Advertised LAN candidates: {ips}</p> : null}
        {mdnsOnly ? (
          <p className="mt-2 rounded-xs border border-[#C59B61]/40 bg-[#C59B61]/10 p-2 text-xs text-[#C59B61]">
            Notice: Browser generated mDNS (.local) candidates. Tap 'Scan QR' to allow camera (which unmasks real LAN IPs in Chrome/Safari) or connect both devices to a phone hotspot.
          </p>
        ) : null}

        {role === 'host' && !code ? (
          <button
            className="mt-4 df-btn-gold w-full py-3.5 text-xs font-bold tracking-[0.22em] cursor-pointer"
            onClick={() => void makeOffer()}
          >
            Forge Host Signaling Bundle →
          </button>
        ) : null}

        {qr ? (
          <div className="mt-4 text-center">
            <img src={qr} alt="Connection QR" className="mx-auto w-52 rounded-xs border-2 border-[#C59B61] bg-[#E8E4DC] p-2 shadow-2xl" />
            <p className="mt-1 font-cinzel text-[10px] uppercase tracking-widest text-[#AAA69B]">
              Scan with Guest Device
            </p>
          </div>
        ) : null}

        {code ? (
          <div className="mt-3">
            <textarea
              readOnly
              className="h-20 w-full rounded-xs bg-[#171819] border border-[#AAA69B]/30 p-2 text-[10px] text-[#E8E4DC] font-mono"
              value={code}
            />
            <button
              className={`mt-1.5 w-full py-2.5 font-cinzel text-xs font-bold uppercase tracking-wider border transition cursor-pointer ${
                copied ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'df-btn-silver'
              }`}
              onClick={() => void copyCode()}
            >
              {copied ? '✓ Token Copied to Clipboard!' : 'Copy Connection Token'}
            </button>
          </div>
        ) : null}

        <MetallicDivider className="my-4" />

        <div>
          <p className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#E8E4DC]">
            {role === 'host' ? 'Paste Guest Answer Token' : 'Paste or Scan Host Offer Token'}
          </p>
          <textarea
            className="mt-1.5 h-20 w-full rounded-xs bg-[#171819] border border-[#AAA69B]/30 p-2 text-[10px] font-mono text-[#E8E4DC]"
            placeholder="Paste LL1.... token or tap Scan QR"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              disabled={applying}
              className="df-btn-gold px-4 py-2 text-xs font-bold tracking-wider cursor-pointer disabled:opacity-50"
              onClick={() => void processBundle(paste)}
            >
              {applying ? 'Applying…' : 'Apply Token'}
            </button>
            <button
              className="df-btn-silver px-3 py-2 text-xs cursor-pointer"
              onClick={() => void pasteClipboard()}
            >
              Paste Clipboard
            </button>
            <button
              className="df-btn-silver px-3 py-2 text-xs cursor-pointer"
              onClick={() => setScan((s) => !s)}
            >
              {scan ? 'Close Scanner' : '📷 Scan QR'}
            </button>
          </div>
        </div>

        {scan ? (
          <div className="mt-3 overflow-hidden rounded-xs border border-[#C59B61]">
            <video ref={video} className="h-44 w-full object-cover" playsInline muted />
            <p className="bg-[#171819] py-1 text-center font-cinzel text-[10px] text-[#C59B61] uppercase tracking-wider">
              Align camera with opposing screen's QR code
            </p>
          </div>
        ) : null}

        {status === 'connected' ? (
          <p className="mt-3 font-cinzel text-xs text-emerald-400 font-bold text-center">
            ✓ DataChannel Open. Entering Expedition Bunker…
          </p>
        ) : null}

        {error ? (
          <p className="mt-3 rounded-xs bg-[#853D3D]/30 border border-[#853D3D] p-2 text-xs text-red-200 font-mono">
            {error}
          </p>
        ) : null}
      </div>
    </Shell>
  )
}
