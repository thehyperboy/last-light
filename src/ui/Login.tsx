import { useState } from 'react'
import { loadProfile, saveProfile, type UserProfile } from '../game/storage'

type Props = {
  onLogin: (callsign: string) => void
  onPlaySound?: () => void
}

const DEFAULT_CALLSIGNS = [
  'Nomad-7',
  'Specter-4',
  'Echo-9',
  'Vanguard-2',
  'Raven-11',
  'Ghost-05',
  'Zero-Six',
  'Apex-3',
]

export function Login({ onLogin, onPlaySound }: Props) {
  const saved = loadProfile()
  const [callsign, setCallsign] = useState(() => saved?.callsign || `Survivor-${Math.floor(Math.random() * 90 + 10)}`)
  const [passcode, setPasscode] = useState(() => saved?.passcode || '')
  const [remember, setRemember] = useState(() => saved?.remember ?? true)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRollCallsign = () => {
    onPlaySound?.()
    const next = DEFAULT_CALLSIGNS[Math.floor(Math.random() * DEFAULT_CALLSIGNS.length)]
    setCallsign(`${next.split('-')[0]}-${Math.floor(Math.random() * 90 + 10)}`)
  }

  const handleAuth = (isGuest = false) => {
    onPlaySound?.()
    setError(null)
    const name = isGuest ? `Guest-${Math.floor(Math.random() * 90 + 10)}` : callsign.trim()
    if (!name) {
      setError('Please enter a survivor callsign')
      return
    }
    if (name.length < 2) {
      setError('Callsign must be at least 2 characters')
      return
    }
    if (name.length > 20) {
      setError('Callsign must be 20 characters or less')
      return
    }

    const profile: UserProfile = {
      callsign: name,
      passcode: isGuest ? '' : passcode,
      clearance: isGuest ? 'GUEST-UNVERIFIED' : 'OPERATOR-LVL3',
      remember: isGuest ? false : remember,
      lastLogin: Date.now(),
    }

    if (remember && !isGuest) {
      saveProfile(profile)
    }

    onLogin(name)
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#0f1923] text-[#ece8e1] select-none font-sans">
      {/* Background Graphic */}
      <img
        src="/valorant-bg.jpg"
        alt="Facility interior"
        className="absolute inset-0 h-full w-full object-cover object-center brightness-60 contrast-105 filter"
      />

      {/* Atmospheric Overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0f1923] via-[#0f1923]/70 to-[#0f1923]/85" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#ff4655]/15 blur-3xl" />

      {/* Main Container */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-8">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded bg-[#ff4655] px-3.5 py-0.5 text-[10px] font-black uppercase tracking-[0.3em] text-white val-cut-btn mb-2 shadow-lg shadow-[#ff4655]/30">
            SECURITY CLEARANCE // SECTOR-04
          </div>
          <h1 className="val-logo mt-1 text-5xl font-black tracking-[0.24em] text-white sm:text-6xl md:text-7xl drop-shadow-2xl">
            LAST LIGHT
          </h1>
          <p className="mt-1 text-xs tracking-[0.3em] text-[#00f0ff] font-mono uppercase">
            OPERATOR AUTHENTICATION TERMINAL
          </p>
        </div>

        {/* Login Panel (Valorant Glass Box with Cut Corners) */}
        <div className="val-panel val-cut-tr mt-7 w-full max-w-md p-6 shadow-2xl sm:p-8 relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 text-[10px] uppercase tracking-widest text-white/50 font-mono">
            <span>Terminal: #VAL-SEC-04</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Direct P2P Ready
            </span>
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              handleAuth(false)
            }}
          >
            {/* Callsign Input */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="callsign-input" className="text-xs font-bold uppercase tracking-wider text-white">
                  Survivor Callsign
                </label>
                <button
                  type="button"
                  onClick={handleRollCallsign}
                  className="text-[10px] font-mono uppercase tracking-wider text-[#00f0ff] hover:underline cursor-pointer"
                >
                  [Roll Random]
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="callsign-input"
                  type="text"
                  autoComplete="username"
                  maxLength={20}
                  className="w-full rounded-sm border border-white/15 bg-[#172430]/90 px-4 py-3 font-mono text-sm tracking-wide text-white placeholder-white/30 focus:border-[#ff4655] focus:outline-none val-cut-btn"
                  placeholder="e.g. Survivor-42"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                />
              </div>
            </div>

            {/* Passcode Input (Optional for offline) */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="passcode-input" className="text-xs font-bold uppercase tracking-wider text-white">
                  Clearance Passcode <span className="text-[10px] font-normal text-white/40">(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="text-[10px] uppercase tracking-wider text-white/50 hover:text-white cursor-pointer"
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="passcode-input"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full rounded-sm border border-white/15 bg-[#172430]/90 px-4 py-3 font-mono text-sm tracking-wide text-white placeholder-white/30 focus:border-[#ff4655] focus:outline-none val-cut-btn"
                  placeholder="•••••••• (or leave blank)"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
              </div>
              <p className="mt-1 text-[10px] text-white/40 font-mono">
                Encrypted locally. Zero remote cloud dependency.
              </p>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1 text-xs text-white/70">
              <label className="flex cursor-pointer select-none items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded-sm border-white/30 bg-black/50 accent-[#ff4655]"
                />
                <span className="text-xs font-mono uppercase">Remember this device</span>
              </label>
              {saved ? (
                <span className="text-[10px] text-emerald-400 font-mono">
                  Saved: {saved.callsign}
                </span>
              ) : null}
            </div>

            {/* Error Message */}
            {error ? (
              <div className="rounded-sm bg-red-900/40 border border-red-500/50 p-2 text-xs text-red-200 font-mono">
                {error}
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                className="val-cut-btn w-full bg-[#ff4655] py-3.5 text-center text-sm font-black uppercase tracking-[0.24em] text-white shadow-lg shadow-[#ff4655]/40 transition hover:bg-[#ff5865] active:scale-[0.99] cursor-pointer"
              >
                Access Terminal
              </button>

              <button
                type="button"
                onClick={() => handleAuth(true)}
                className="val-cut-btn w-full border border-white/20 bg-[#172430]/80 py-2.5 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#ece8e1]/80 transition hover:bg-[#172430] hover:text-white cursor-pointer"
              >
                Quick Deploy as Guest
              </button>
            </div>
          </form>

          {/* Security Telemetry Footer */}
          <div className="mt-6 border-t border-white/10 pt-4 text-center text-[10px] uppercase tracking-widest text-white/40 font-mono">
            <span>VALORANT ENGINE UI</span> · <span>STANDALONE CLIENT</span> · <span>100% OFFLINE</span>
          </div>
        </div>
      </div>
    </div>
  )
}

