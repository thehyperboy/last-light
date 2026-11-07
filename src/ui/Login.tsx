import { useState } from 'react'
import {
  authenticateOperator,
  authenticateGuest,
  registerOperator,
  getRegisteredProfiles,
  removeRegisteredProfile,
  loadProfile,
  type UserProfile,
} from '../game/storage'

type Props = {
  onLogin: (callsign: string) => void
  onPlaySound?: () => void
  onPlayMulti?: () => void
  onOpenSettings?: () => void
  onOpenGuide?: () => void
  onExit?: () => void
}

const DEFAULT_CALLSIGNS = [
  'Nomad-7',
  'Specter-4',
  'Echo-9',
  'Vanguard-2',
  'Raven-11',
  'Ghost-05',
  'Apex-3',
  'Ignis-8',
  'Singe-02',
  'Viper-14',
]

export function Login({ onLogin, onPlaySound }: Props) {
  const savedActive = loadProfile()
  const registeredAccounts = getRegisteredProfiles()

  const [mode, setMode] = useState<'signin' | 'register'>(() => {
    return registeredAccounts.length > 0 ? 'signin' : 'register'
  })

  // Sign-in state
  const [signInCallsign, setSignInCallsign] = useState(() => savedActive?.callsign || registeredAccounts[0]?.callsign || '')
  const [signInPasscode, setSignInPasscode] = useState('')
  const [rememberMe, setRememberMe] = useState(true)

  // Registration state
  const [regCallsign, setRegCallsign] = useState(() => `Survivor-${Math.floor(Math.random() * 90 + 10)}`)
  const [regPasscode, setRegPasscode] = useState('')
  const [regConfirmPass, setRegConfirmPass] = useState('')
  const [regRemember, setRegRemember] = useState(true)

  // Shared UI state
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<UserProfile[]>(registeredAccounts)

  const handleRollCallsign = () => {
    onPlaySound?.()
    const next = DEFAULT_CALLSIGNS[Math.floor(Math.random() * DEFAULT_CALLSIGNS.length)]
    const newName = `${next.split('-')[0]}-${Math.floor(Math.random() * 90 + 10)}`
    setRegCallsign(newName)
  }

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault()
    onPlaySound?.()
    setError(null)

    const res = authenticateOperator(signInCallsign, signInPasscode, rememberMe)
    if (!res.success) {
      setError(res.error)
      return
    }

    setSuccessMsg(`CLEARANCE APPROVED // WELCOME OPERATOR ${res.profile.callsign}`)
    setTimeout(() => {
      onLogin(res.profile.callsign)
    }, 450)
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    onPlaySound?.()
    setError(null)

    if (regPasscode !== regConfirmPass) {
      setError('Clearance passcodes do not match. Verify and retype.')
      return
    }

    const res = registerOperator(regCallsign, regPasscode, regRemember)
    if (!res.success) {
      setError(res.error)
      return
    }

    setAccounts(getRegisteredProfiles())
    setSuccessMsg(`OPERATOR INITIALIZED // WELCOME TO SECTOR-04`)
    setTimeout(() => {
      onLogin(res.profile.callsign)
    }, 450)
  }

  const handleGuestLogin = () => {
    onPlaySound?.()
    setError(null)
    const guest = authenticateGuest()
    setSuccessMsg(`TEMPORARY CLEARANCE GRANTED // ${guest.callsign}`)
    setTimeout(() => {
      onLogin(guest.callsign)
    }, 350)
  }

  const handleDeleteAccount = (callsign: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onPlaySound?.()
    removeRegisteredProfile(callsign)
    const updated = getRegisteredProfiles()
    setAccounts(updated)
    if (signInCallsign.toLowerCase() === callsign.toLowerCase()) {
      setSignInCallsign(updated[0]?.callsign || '')
      setSignInPasscode('')
    }
    if (updated.length === 0) {
      setMode('register')
    }
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#070707] text-[#f0e6d8] select-none font-sans">
      {/* Background Graphic with Atmospheric Tone */}
      <img
        src="/valorant-bg.jpg"
        alt="Facility interior"
        className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.35] contrast-125 saturate-75 filter"
      />

      {/* Atmospheric Overlays — Deep Black, Lava Red, and Radiant Ember Glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#070707] via-[#090807]/80 to-[#070707]/90" />
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#ff6a00]/20 via-[#c41e1e]/10 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-[#c41e1e]/15 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-[#ff8800]/10 blur-3xl" />

      {/* Main Container */}
      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-8">
        {/* Header Branding */}
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded bg-gradient-to-r from-[#c41e1e] via-[#e85d04] to-[#ff6a00] px-4 py-1 text-[10px] font-black uppercase tracking-[0.32em] text-white val-cut-btn mb-2.5 shadow-lg shadow-[#ff6a00]/30">
            <span className="inline-block h-2 w-2 rounded-full bg-white animate-pulse" />
            SECURITY CLEARANCE // SECTOR-04
          </div>
          <h1 className="val-logo mt-1 text-5xl font-black tracking-[0.22em] text-white sm:text-6xl md:text-7xl drop-shadow-[0_4px_30px_rgba(255,106,0,0.5)]">
            LAST LIGHT
          </h1>
          <p className="mt-1 text-xs tracking-[0.35em] text-[#ff8800] font-mono uppercase">
            OPERATOR AUTHENTICATION TERMINAL
          </p>
        </div>

        {/* Central Terminal Panel (Angled Cuts + Fiery Orange-Red Border Glow) */}
        <div className="val-panel val-cut-tr mt-6 w-full max-w-lg p-6 sm:p-8 shadow-[0_10px_50px_rgba(0,0,0,0.85)] border border-[#ff6a00]/25 relative bg-[#0b0a09]/90 backdrop-blur-xl">
          {/* Top Telemetry Header */}
          <div className="flex items-center justify-between border-b border-[#ff6a00]/20 pb-3 text-[10px] uppercase tracking-widest text-[#f0e6d8]/60 font-mono">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ff6a00] shadow-[0_0_8px_#ff6a00]" />
              <span>TERMINAL: #VAL-SEC-04</span>
            </div>
            <span className="text-[#ff6a00] font-semibold tracking-wider">OFFLINE LAN ENCRYPTED</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-2 border-b border-[#ff6a00]/15 pb-4">
            <button
              type="button"
              onClick={() => {
                onPlaySound?.()
                setError(null)
                setMode('signin')
              }}
              className={`py-2 px-3 text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer val-cut-btn ${
                mode === 'signin'
                  ? 'bg-gradient-to-r from-[#c41e1e] to-[#e85d04] text-white shadow-[0_0_15px_rgba(255,106,0,0.35)]'
                  : 'bg-[#15120f]/80 text-[#f0e6d8]/60 hover:text-white hover:bg-[#1f1914]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                onPlaySound?.()
                setError(null)
                setMode('register')
              }}
              className={`py-2 px-3 text-xs font-black uppercase tracking-[0.2em] transition-all cursor-pointer val-cut-btn ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-[#c41e1e] to-[#e85d04] text-white shadow-[0_0_15px_rgba(255,106,0,0.35)]'
                  : 'bg-[#15120f]/80 text-[#f0e6d8]/60 hover:text-white hover:bg-[#1f1914]'
              }`}
            >
              New Operator
            </button>
          </div>

          {/* Quick Select from Saved Operators (if in sign-in mode and accounts exist) */}
          {mode === 'signin' && accounts.length > 0 ? (
            <div className="mt-4">
              <label className="text-[10px] font-mono uppercase tracking-widest text-[#f0e6d8]/50 block mb-1.5">
                Saved Terminal Operators:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                {accounts.map((acc) => {
                  const isSelected = signInCallsign.toLowerCase() === acc.callsign.toLowerCase()
                  return (
                    <div
                      key={acc.callsign}
                      onClick={() => {
                        onPlaySound?.()
                        setSignInCallsign(acc.callsign)
                        setError(null)
                      }}
                      className={`group flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition cursor-pointer border ${
                        isSelected
                          ? 'border-[#ff6a00] bg-[#ff6a00]/20 text-white shadow-[0_0_10px_rgba(255,106,0,0.3)]'
                          : 'border-white/10 bg-[#15120f] text-[#f0e6d8]/70 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#ff6a00]" />
                      <span className="font-bold">{acc.callsign}</span>
                      <button
                        type="button"
                        title="Forget this operator"
                        onClick={(e) => handleDeleteAccount(acc.callsign, e)}
                        className="ml-1 text-white/30 hover:text-[#c41e1e] font-sans text-xs px-1"
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : null}

          {/* ================= SIGN IN FORM ================= */}
          {mode === 'signin' ? (
            <form className="mt-4 space-y-4" onSubmit={handleSignIn}>
              {/* Callsign Input */}
              <div>
                <label htmlFor="signin-callsign" className="text-xs font-bold uppercase tracking-wider text-white">
                  Operator Callsign
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="signin-callsign"
                    type="text"
                    autoComplete="username"
                    maxLength={20}
                    className="w-full rounded-sm border border-[#ff6a00]/25 bg-[#120f0c] px-4 py-3 font-mono text-sm tracking-wide text-white placeholder-white/25 focus:border-[#ff6a00] focus:shadow-[0_0_15px_rgba(255,106,0,0.35)] focus:outline-none val-cut-btn transition"
                    placeholder="Enter survivor callsign (e.g. Apex-3)"
                    value={signInCallsign}
                    onChange={(e) => setSignInCallsign(e.target.value)}
                  />
                </div>
              </div>

              {/* Passcode Input */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="signin-passcode" className="text-xs font-bold uppercase tracking-wider text-white">
                    Clearance Passcode
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-[10px] uppercase font-mono tracking-wider text-[#ff8800] hover:text-white cursor-pointer"
                  >
                    {showPassword ? '[Hide]' : '[Show]'}
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="signin-passcode"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="w-full rounded-sm border border-[#ff6a00]/25 bg-[#120f0c] px-4 py-3 font-mono text-sm tracking-wide text-white placeholder-white/25 focus:border-[#ff6a00] focus:shadow-[0_0_15px_rgba(255,106,0,0.35)] focus:outline-none val-cut-btn transition"
                    placeholder="Enter clearance passcode"
                    value={signInPasscode}
                    onChange={(e) => setSignInPasscode(e.target.value)}
                  />
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1 text-xs text-[#f0e6d8]/70">
                <label className="flex cursor-pointer select-none items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-white/30 bg-black/60 accent-[#ff6a00]"
                  />
                  <span className="font-mono text-xs uppercase tracking-wider">Remember on this terminal</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register')
                    setRegCallsign(signInCallsign || `Survivor-${Math.floor(Math.random() * 90 + 10)}`)
                  }}
                  className="text-[10px] font-mono text-[#ff8800] hover:underline cursor-pointer"
                >
                  Need new account?
                </button>
              </div>

              {/* Error Box */}
              {error ? (
                <div className="rounded border border-[#c41e1e] bg-[#c41e1e]/20 p-3 text-xs text-[#ffb4b4] font-mono flex items-start gap-2 shadow-[0_0_15px_rgba(196,30,30,0.3)] animate-shake">
                  <span className="text-base leading-none">⚠️</span>
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
              ) : null}

              {/* Success Notification */}
              {successMsg ? (
                <div className="rounded border border-[#ff6a00] bg-[#ff6a00]/20 p-3 text-xs text-white font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(255,106,0,0.4)]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{successMsg}</span>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  className="val-cut-btn w-full bg-gradient-to-r from-[#c41e1e] via-[#e85d04] to-[#ff6a00] py-3.5 text-center text-sm font-black uppercase tracking-[0.24em] text-white shadow-[0_0_25px_rgba(255,106,0,0.4)] transition hover:brightness-110 hover:shadow-[0_0_35px_rgba(255,106,0,0.7)] active:scale-[0.99] cursor-pointer"
                >
                  Authenticate & Enter
                </button>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="val-cut-btn w-full border border-[#ff6a00]/30 bg-[#15120f]/80 py-2.5 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#f0e6d8]/80 transition hover:bg-[#201a14] hover:border-[#ff6a00]/60 hover:text-white cursor-pointer"
                >
                  Quick Deploy as Guest
                </button>
              </div>
            </form>
          ) : (
            /* ================= REGISTER FORM ================= */
            <form className="mt-4 space-y-4" onSubmit={handleRegister}>
              {/* Callsign Input */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="reg-callsign" className="text-xs font-bold uppercase tracking-wider text-white">
                    New Survivor Callsign
                  </label>
                  <button
                    type="button"
                    onClick={handleRollCallsign}
                    className="text-[10px] font-mono uppercase tracking-wider text-[#ff8800] hover:underline cursor-pointer"
                  >
                    [Roll Random]
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="reg-callsign"
                    type="text"
                    autoComplete="username"
                    maxLength={20}
                    className="w-full rounded-sm border border-[#ff6a00]/25 bg-[#120f0c] px-4 py-3 font-mono text-sm tracking-wide text-white placeholder-white/25 focus:border-[#ff6a00] focus:shadow-[0_0_15px_rgba(255,106,0,0.35)] focus:outline-none val-cut-btn transition"
                    placeholder="e.g. Specter-4"
                    value={regCallsign}
                    onChange={(e) => setRegCallsign(e.target.value)}
                  />
                </div>
                <p className="mt-1 text-[10px] text-[#f0e6d8]/40 font-mono">
                  3-20 characters. Letters, numbers, and dashes.
                </p>
              </div>

              {/* Passcode Input */}
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="reg-passcode" className="text-xs font-bold uppercase tracking-wider text-white">
                    Create Clearance Passcode
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-[10px] uppercase font-mono tracking-wider text-[#ff8800] hover:text-white cursor-pointer"
                  >
                    {showPassword ? '[Hide]' : '[Show]'}
                  </button>
                </div>
                <div className="relative mt-1.5">
                  <input
                    id="reg-passcode"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="w-full rounded-sm border border-[#ff6a00]/25 bg-[#120f0c] px-4 py-3 font-mono text-sm tracking-wide text-white placeholder-white/25 focus:border-[#ff6a00] focus:shadow-[0_0_15px_rgba(255,106,0,0.35)] focus:outline-none val-cut-btn transition"
                    placeholder="Min 4 characters"
                    value={regPasscode}
                    onChange={(e) => setRegPasscode(e.target.value)}
                  />
                </div>
              </div>

              {/* Confirm Passcode Input */}
              <div>
                <label htmlFor="reg-confirm" className="text-xs font-bold uppercase tracking-wider text-white">
                  Confirm Clearance Passcode
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className={`w-full rounded-sm border bg-[#120f0c] px-4 py-3 font-mono text-sm tracking-wide text-white placeholder-white/25 focus:outline-none val-cut-btn transition ${
                      regConfirmPass && regConfirmPass !== regPasscode
                        ? 'border-[#c41e1e] focus:border-[#c41e1e]'
                        : 'border-[#ff6a00]/25 focus:border-[#ff6a00]'
                    }`}
                    placeholder="Retype clearance passcode"
                    value={regConfirmPass}
                    onChange={(e) => setRegConfirmPass(e.target.value)}
                  />
                </div>
                {regConfirmPass && regConfirmPass !== regPasscode ? (
                  <p className="mt-1 text-[10px] text-[#ff8080] font-mono">
                    Passcodes do not match.
                  </p>
                ) : null}
              </div>

              {/* Remember on terminal */}
              <div className="flex items-center justify-between pt-1 text-xs text-[#f0e6d8]/70">
                <label className="flex cursor-pointer select-none items-center gap-2">
                  <input
                    type="checkbox"
                    checked={regRemember}
                    onChange={(e) => setRegRemember(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-white/30 bg-black/60 accent-[#ff6a00]"
                  />
                  <span className="font-mono text-xs uppercase tracking-wider">Save operator on this device</span>
                </label>
              </div>

              {/* Error Box */}
              {error ? (
                <div className="rounded border border-[#c41e1e] bg-[#c41e1e]/20 p-3 text-xs text-[#ffb4b4] font-mono flex items-start gap-2 shadow-[0_0_15px_rgba(196,30,30,0.3)]">
                  <span className="text-base leading-none">⚠️</span>
                  <div className="flex-1 leading-relaxed">{error}</div>
                </div>
              ) : null}

              {/* Success Notification */}
              {successMsg ? (
                <div className="rounded border border-[#ff6a00] bg-[#ff6a00]/20 p-3 text-xs text-white font-mono flex items-center gap-2 shadow-[0_0_20px_rgba(255,106,0,0.4)]">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{successMsg}</span>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="submit"
                  className="val-cut-btn w-full bg-gradient-to-r from-[#c41e1e] via-[#e85d04] to-[#ff6a00] py-3.5 text-center text-sm font-black uppercase tracking-[0.24em] text-white shadow-[0_0_25px_rgba(255,106,0,0.4)] transition hover:brightness-110 hover:shadow-[0_0_35px_rgba(255,106,0,0.7)] active:scale-[0.99] cursor-pointer"
                >
                  Initialize Operator Profile
                </button>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  className="val-cut-btn w-full border border-[#ff6a00]/30 bg-[#15120f]/80 py-2.5 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#f0e6d8]/80 transition hover:bg-[#201a14] hover:border-[#ff6a00]/60 hover:text-white cursor-pointer"
                >
                  Quick Deploy as Guest
                </button>
              </div>
            </form>
          )}

          {/* Security Telemetry Footer */}
          <div className="mt-6 border-t border-[#ff6a00]/20 pt-4 flex items-center justify-between text-[10px] uppercase tracking-widest text-[#f0e6d8]/40 font-mono">
            <span>LAST LIGHT EMBER ENGINE</span>
            <span>100% OFFLINE CAPABLE</span>
          </div>
        </div>
      </div>
    </div>
  )
}
