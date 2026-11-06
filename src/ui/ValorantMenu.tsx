import { useState } from 'react'
import { ValorantPortalFx } from './ValorantPortalFx'

type Tab = 'home' | 'collection' | 'play' | 'career' | 'store'
type GameMode = 'solo' | 'multi' | 'pass'

type Props = {
  callsign: string
  onPlaySolo: () => void
  onPlayMulti: () => void
  onPlayPass: () => void
  onOpenSettings: () => void
  onOpenGuide: () => void
  onExit: () => void
  onPlaySound?: () => void
}

export function ValorantMenu({
  callsign,
  onPlaySolo,
  onPlayMulti,
  onPlayPass,
  onOpenSettings,
  onOpenGuide,
  onExit,
  onPlaySound,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('play')
  const [socialOpen, setSocialOpen] = useState(false)
  const [mobileMissionsOpen, setMobileMissionsOpen] = useState(false)
  const [selectedMode, setSelectedMode] = useState<GameMode>('solo')

  const handleTab = (t: Tab) => {
    onPlaySound?.()
    setActiveTab(t)
  }

  const handleStartSelected = () => {
    onPlaySound?.()
    if (selectedMode === 'solo') onPlaySolo()
    else if (selectedMode === 'multi') onPlayMulti()
    else onPlayPass()
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0f1923] text-[#ece8e1] select-none font-sans">
      {/* 4K Background Scenery - Clean Art with NO baked-in UI or text */}
      <img
        src="/valorant-bg.jpg"
        alt="Floating Island"
        className="absolute inset-0 h-full w-full object-cover object-center contrast-105 brightness-95"
      />

      {/* Real-time Dynamic Canvas Portal Effect & Floating Embers */}
      <ValorantPortalFx />

      {/* Atmospheric Vignette & Contrast Gradients */}
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_40%,rgba(15,25,35,0.7)_100%]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0f1923]/90 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0f1923]/95 to-transparent" />

      {/* ======================= TOP NAVIGATION BAR ======================= */}
      <header className="relative z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b border-white/10 bg-[#0f1923]/85 px-3 sm:px-6 backdrop-blur-md">
        {/* Left Side: Logo & Level Badges */}
        <div className="flex items-center gap-2 sm:gap-5">
          <button
            onClick={() => handleTab('home')}
            className="group flex items-center gap-2 cursor-pointer focus:outline-none"
            title="Last Light Home"
          >
            <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center bg-[#ff4655] val-cut-btn transition-transform group-hover:scale-105 shadow-md shadow-[#ff4655]/40">
              <span className="font-mono text-xs sm:text-sm font-black text-white">LL</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-[#ece8e1]/50">
                PROTOCOL 01
              </span>
              <span className="font-black text-[11px] sm:text-xs uppercase tracking-widest text-white">
                SURVIVOR
              </span>
            </div>
          </button>

          {/* Level Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-sm border border-white/10 bg-[#1b2733]/70 px-2 py-0.5 text-xs font-mono text-[#ece8e1]/80">
              <span className="inline-block h-2 w-2 rounded-full bg-[#00f0ff]" />
              <span>0 / 2</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-sm border border-white/10 bg-[#1b2733]/70 px-2 py-0.5 text-xs font-mono text-[#ece8e1]/80">
              <span className="inline-block h-2 w-2 rounded-full bg-[#ff4655]" />
              <span>0 / 3</span>
            </div>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-4 md:gap-6 overflow-x-auto no-scrollbar py-1">
          {(
            [
              { id: 'home', label: 'HOME' },
              { id: 'play', label: 'PLAY' },
              { id: 'collection', label: 'COLLECTION' },
              { id: 'career', label: 'CAREER' },
              { id: 'store', label: 'STORE' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTab(tab.id)}
                className={`relative px-2 sm:px-3 py-2 sm:py-3.5 text-[11px] sm:text-xs md:text-sm font-black tracking-[0.18em] transition-all cursor-pointer shrink-0 focus:outline-none ${
                  isActive ? 'text-white' : 'text-[#ece8e1]/60 hover:text-white'
                }`}
              >
                {isActive ? (
                  <span className="absolute inset-x-0 top-0 h-[3px] bg-[#ff4655] shadow-[0_0_8px_#ff4655]" />
                ) : null}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right Side: Currencies, Social, Settings, Exit */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Radianite & Points Counters (Hidden on mobile) */}
          <div className="hidden xl:flex items-center gap-2 font-mono text-xs text-[#ece8e1]">
            <div className="flex items-center gap-1 rounded bg-[#1b2733]/70 px-2 py-1 border border-white/10">
              <span className="text-[#00f0ff] font-bold">R</span>
              <span>120</span>
            </div>
            <div className="flex items-center gap-1 rounded bg-[#1b2733]/70 px-2 py-1 border border-white/10">
              <span className="text-[#ff4655] font-bold">V</span>
              <span>1,450</span>
            </div>
          </div>

          {/* Social Panel Toggle */}
          <button
            onClick={() => {
              onPlaySound?.()
              setSocialOpen((s) => !s)
            }}
            className={`flex items-center gap-1.5 rounded border px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              socialOpen
                ? 'border-[#ff4655] bg-[#ff4655]/20 text-white shadow-[0_0_12px_rgba(255,70,85,0.4)]'
                : 'border-white/15 bg-[#1b2733]/70 text-[#ece8e1]/80 hover:text-white'
            }`}
          >
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">SOCIAL</span>
            <span className="sm:hidden">👥</span>
          </button>

          {/* Settings Gear */}
          <button
            onClick={() => {
              onPlaySound?.()
              onOpenSettings()
            }}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded border border-white/15 bg-[#1b2733]/70 text-[#ece8e1]/70 hover:border-white/40 hover:text-white transition cursor-pointer"
            title="Settings"
          >
            ⚙
          </button>

          {/* Exit / Logout */}
          <button
            onClick={() => {
              onPlaySound?.()
              onExit()
            }}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded border border-red-500/30 bg-red-950/40 text-red-300 hover:border-red-500 hover:text-white transition cursor-pointer"
            title="Exit / Logout"
          >
            ✕
          </button>
        </div>
      </header>

      {/* ======================= MAIN CONTENT WORKSPACE ======================= */}
      <div className="relative z-10 flex h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-4rem)] w-full overflow-hidden">
        {/* ================= PLAY TAB (MAIN DASHBOARD) ================= */}
        {activeTab === 'play' ? (
          <div className="relative flex h-full w-full justify-between p-3 sm:p-6 overflow-hidden">
            {/* DESKTOP LEFT COLUMN: Contract, Missions, Mode Selector */}
            <div className="hidden lg:flex z-20 w-80 xl:w-88 flex-col gap-3 overflow-y-auto pr-2 pb-10">
              {/* Panel 1: PLAY TO UNLOCK FREE SURVIVORS */}
              <div className="val-panel rounded-sm p-4 relative val-cut-tr">
                <div className="text-[11px] font-black tracking-[0.16em] uppercase text-white">
                  PLAY TO UNLOCK SURVIVORS
                </div>
                <div className="mt-0.5 text-[10px] font-mono text-[#00f0ff] uppercase">
                  500 XP TO GO
                </div>

                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  {[
                    { tier: 6, icon: '🛡️' },
                    { tier: 7, icon: '⚡' },
                    { tier: 8, icon: '🔥' },
                    { tier: 9, icon: '🎯' },
                    { tier: 10, icon: '👑' },
                  ].map((t) => (
                    <div
                      key={t.tier}
                      className="group flex flex-col items-center justify-center border border-white/15 bg-[#172430]/90 py-2.5 transition hover:border-[#ff4655]"
                    >
                      <span className="text-sm">{t.icon}</span>
                      <span className="mt-1 font-mono text-[9px] text-white/60">
                        {t.tier}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={onOpenGuide}
                  className="mt-2 text-left font-mono text-[10px] tracking-wider text-white/50 hover:text-[#00f0ff] transition cursor-pointer"
                >
                  VIEW DETAILS ↗
                </button>
              </div>

              {/* Panel 2: DAILY MISSIONS */}
              <div className="val-panel rounded-sm p-4 relative">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[11px] font-black tracking-[0.2em] uppercase text-white">
                    DAILY MISSIONS
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    ACTIVE
                  </span>
                </div>

                <div className="mt-3 space-y-2.5 text-xs">
                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/80">Use Survival Abilities</span>
                      <span className="font-mono text-[10px] text-emerald-400">
                        +8,250 XP
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00f0ff]" style={{ width: '22%' }} />
                      </div>
                      <span className="font-mono text-[9px] text-white/50">44/200</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/80">Deal Damage to Stalkers</span>
                      <span className="font-mono text-[10px] text-emerald-400">
                        +8,100 XP
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00f0ff]" style={{ width: '18%' }} />
                      </div>
                      <span className="font-mono text-[9px] text-white/50">
                        4.6k/25k
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/80">Repair Facility Generator</span>
                      <span className="font-mono text-[10px] text-emerald-400">
                        +12,000 XP
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                        <div className="h-full bg-[#ff4655]" style={{ width: '50%' }} />
                      </div>
                      <span className="font-mono text-[9px] text-white/50">1/2</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 border-t border-white/10 pt-2 font-mono text-[9px] uppercase tracking-wider text-white/40">
                  <span>⏱</span>
                  <span>DAILY EXPIRATION IN: 18:09:29</span>
                </div>
              </div>

              {/* Panel 3: MODE SELECTOR */}
              <div className="val-panel rounded-sm p-4 relative val-cut-bl">
                <div className="text-[11px] font-black tracking-[0.2em] uppercase text-white mb-2.5">
                  FEATURED MODES
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onPlaySound?.()
                      setSelectedMode('solo')
                    }}
                    className={`w-full flex items-center justify-between p-2.5 border text-left transition cursor-pointer val-cut-btn ${
                      selectedMode === 'solo'
                        ? 'border-[#ff4655] bg-[#ff4655]/20 text-white shadow-[0_0_15px_rgba(255,70,85,0.3)]'
                        : 'border-white/10 bg-[#172430]/70 text-[#ece8e1]/70 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">🛡️</span>
                      <div>
                        <div className="text-xs font-black tracking-wider uppercase">
                          SOLO SURVIVAL
                        </div>
                        <div className="text-[10px] text-white/50">
                          Story Campaign · Offline
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-white/60">
                      10-15 MINS
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onPlaySound?.()
                      setSelectedMode('multi')
                    }}
                    className={`w-full flex items-center justify-between p-2.5 border text-left transition cursor-pointer val-cut-btn ${
                      selectedMode === 'multi'
                        ? 'border-[#ff4655] bg-[#ff4655]/20 text-white shadow-[0_0_15px_rgba(255,70,85,0.3)]'
                        : 'border-white/10 bg-[#172430]/70 text-[#ece8e1]/70 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">📡</span>
                      <div>
                        <div className="text-xs font-black tracking-wider uppercase">
                          LOCAL MULTIPLAYER
                        </div>
                        <div className="text-[10px] text-white/50">
                          WebRTC P2P LAN · 2 Devices
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-white/60">
                      15-20 MINS
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onPlaySound?.()
                      setSelectedMode('pass')
                    }}
                    className={`w-full flex items-center justify-between p-2.5 border text-left transition cursor-pointer val-cut-btn ${
                      selectedMode === 'pass'
                        ? 'border-[#ff4655] bg-[#ff4655]/20 text-white shadow-[0_0_15px_rgba(255,70,85,0.3)]'
                        : 'border-white/10 bg-[#172430]/70 text-[#ece8e1]/70 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">👥</span>
                      <div>
                        <div className="text-xs font-black tracking-wider uppercase">
                          PASS-AND-PLAY
                        </div>
                        <div className="text-[10px] text-white/50">
                          Turn-based · 1 Device
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] text-white/60">
                      5-10 MINS
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* CENTER HERO STAGE: Title & Action Button (Responsive for Mobile & Desktop) */}
            <div className="relative flex flex-1 flex-col items-center justify-between py-4 sm:py-8 text-center z-10">
              {/* Massive Crisp Hero Title */}
              <div className="animate-fade-in flex flex-col items-center mt-2 sm:mt-6">
                <h1 className="val-logo text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-[0.2em] sm:tracking-[0.24em] drop-shadow-2xl text-white">
                  LAST LIGHT
                </h1>

                {/* Crimson Act 1 Pill */}
                <div className="mt-2 inline-flex items-center rounded-sm bg-[#ff4655] px-4 sm:px-6 py-0.5 sm:py-1 text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-white shadow-lg shadow-[#ff4655]/40 val-cut-btn">
                  IGNITION : ACT 1
                </div>

                {/* Subtitle Lore Callout */}
                <div className="mt-2 inline-block rounded-xs bg-black/60 px-3 py-0.5 border border-white/10 backdrop-blur-xs">
                  <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-[#00f0ff] drop-shadow-sm">
                    SURVIVE TOGETHER · ESCAPE BEFORE DARK
                  </p>
                </div>
              </div>

              {/* Mobile / Tablet Mode Selector Bar (Shown when < lg) */}
              <div className="flex lg:hidden flex-col items-center w-full max-w-sm px-2 gap-2 my-auto">
                <div className="grid grid-cols-3 gap-1.5 w-full">
                  {[
                    { id: 'solo' as const, label: 'SOLO', icon: '🛡️' },
                    { id: 'multi' as const, label: 'MULTIPLAYER', icon: '📡' },
                    { id: 'pass' as const, label: 'PASS & PLAY', icon: '👥' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        onPlaySound?.()
                        setSelectedMode(m.id)
                      }}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded border text-[10px] font-black tracking-wider transition ${
                        selectedMode === m.id
                          ? 'border-[#ff4655] bg-[#ff4655]/25 text-white shadow-[0_0_10px_rgba(255,70,85,0.4)]'
                          : 'border-white/15 bg-[#172430]/80 text-[#ece8e1]/70'
                      }`}
                    >
                      <span className="text-base">{m.icon}</span>
                      <span className="mt-0.5 truncate">{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Mobile Button to inspect missions */}
                <button
                  onClick={() => setMobileMissionsOpen(true)}
                  className="mt-1 text-[11px] font-mono text-[#00f0ff] underline tracking-widest uppercase cursor-pointer"
                >
                  View Daily Missions & Rewards ↗
                </button>
              </div>

              {/* Bottom Deploy CTA Button */}
              <div className="flex flex-col items-center pb-8 sm:pb-4 w-full max-w-md px-4">
                <button
                  onClick={handleStartSelected}
                  className="val-cut-btn group relative flex w-full sm:w-auto items-center justify-center overflow-hidden bg-[#ff4655] px-8 sm:px-14 py-3.5 sm:py-4 font-black uppercase tracking-[0.24em] text-white shadow-[0_0_30px_rgba(255,70,85,0.7)] transition-all duration-150 hover:bg-[#ff5865] hover:shadow-[0_0_50px_rgba(255,70,85,0.9)] active:scale-95 cursor-pointer"
                >
                  <span className="relative z-10 flex items-center gap-3 text-sm sm:text-base">
                    <span>DEPLOY TO ISLE</span>
                    <span className="transition-transform group-hover:translate-x-1.5 font-mono">→</span>
                  </span>
                  {/* Glowing shiny beam animation */}
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </button>

                <p className="mt-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-white/70">
                  {selectedMode === 'solo'
                    ? 'Mode: Solo Survival (Story Campaign)'
                    : selectedMode === 'multi'
                    ? 'Mode: Local Multiplayer (WebRTC P2P)'
                    : 'Mode: Turn-Based Party (Pass-and-Play)'}
                </p>
              </div>
            </div>

            {/* DESKTOP RIGHT COLUMN: SOCIAL SIDEBAR */}
            {socialOpen ? (
              <aside className="val-panel z-20 hidden lg:flex w-72 flex-col justify-between rounded-sm border-l border-white/10 p-4 val-cut-bl">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <span className="text-[11px] font-black tracking-widest uppercase text-white">
                      SOCIAL
                    </span>
                    <span className="font-mono text-[10px] text-white/50">
                      ONLINE
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                      CURRENT SQUAD
                    </div>

                    <div className="flex items-center gap-2.5 rounded bg-[#172430]/90 p-2 border border-white/10">
                      <div className="relative h-8 w-8 rounded bg-[#ff4655] flex items-center justify-center font-bold text-xs text-white">
                        {callsign.slice(0, 2).toUpperCase()}
                        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#172430]" />
                      </div>
                      <div className="overflow-hidden">
                        <div className="truncate text-xs font-bold text-white">
                          {callsign}
                        </div>
                        <div className="text-[9px] text-[#00f0ff] font-mono">
                          In Lobby · Ready
                        </div>
                      </div>
                    </div>

                    <div className="rounded border border-dashed border-white/15 p-2 text-center text-[10px] font-mono text-white/40">
                      <span>OPEN SLOT (LAN PEER)</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40">
                      <span>FRIENDS (0)</span>
                      <span>▾</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40">
                      <span>OFFLINE SURVIVORS (16)</span>
                      <span>▾</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center justify-between text-xs text-white/60">
                  <button
                    onClick={onPlayMulti}
                    className="flex items-center gap-1.5 hover:text-[#00f0ff] transition cursor-pointer"
                  >
                    <span>📡</span>
                    <span className="text-[10px] font-mono uppercase tracking-wider">
                      Pair LAN
                    </span>
                  </button>
                  <button
                    onClick={onOpenSettings}
                    className="hover:text-white transition cursor-pointer"
                    title="Party Settings"
                  >
                    ⚙
                  </button>
                </div>
              </aside>
            ) : null}

            {/* MOBILE SOCIAL SLIDE-OVER DRAWER (Shown on small screens when socialOpen is true) */}
            {socialOpen ? (
              <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="val-panel h-full w-72 max-w-[85vw] p-4 flex flex-col justify-between border-l border-white/15">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-xs font-black tracking-widest uppercase text-white">
                        SQUAD & SOCIAL
                      </span>
                      <button
                        onClick={() => setSocialOpen(false)}
                        className="text-white/60 hover:text-white text-base px-2 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                        CURRENT OPERATOR
                      </div>
                      <div className="flex items-center gap-2.5 rounded bg-[#172430]/90 p-2.5 border border-white/10">
                        <div className="relative h-8 w-8 rounded bg-[#ff4655] flex items-center justify-center font-bold text-xs text-white">
                          {callsign.slice(0, 2).toUpperCase()}
                          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-[#172430]" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="truncate text-xs font-bold text-white">
                            {callsign}
                          </div>
                          <div className="text-[9px] text-[#00f0ff] font-mono">
                            In Lobby · Ready
                          </div>
                        </div>
                      </div>

                      <div className="rounded border border-dashed border-white/15 p-2 text-center text-[10px] font-mono text-white/40">
                        <span>OPEN SLOT (LAN PEER)</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40">
                        <span>FRIENDS (0)</span>
                        <span>▾</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/40">
                        <span>OFFLINE SURVIVORS (16)</span>
                        <span>▾</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setSocialOpen(false)
                        onPlayMulti()
                      }}
                      className="val-cut-btn w-full bg-[#ff4655] py-2.5 text-center text-xs font-black uppercase tracking-wider text-white"
                    >
                      📡 Connect LAN Peer
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {/* MOBILE MISSIONS MODAL (Shown on mobile when tapped) */}
            {mobileMissionsOpen ? (
              <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
                <div className="val-panel w-full max-w-md max-h-[85vh] overflow-y-auto p-5 rounded border border-white/15 relative">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="text-xs font-black tracking-widest uppercase text-white">
                      MISSIONS & AGENT CONTRACTS
                    </span>
                    <button
                      onClick={() => setMobileMissionsOpen(false)}
                      className="text-white/60 hover:text-white text-base px-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="text-[10px] font-mono text-[#00f0ff] uppercase">
                      500 XP TO UNLOCK NEXT TIER
                    </div>
                    <div className="mt-2 grid grid-cols-5 gap-1.5">
                      {[
                        { tier: 6, icon: '🛡️' },
                        { tier: 7, icon: '⚡' },
                        { tier: 8, icon: '🔥' },
                        { tier: 9, icon: '🎯' },
                        { tier: 10, icon: '👑' },
                      ].map((t) => (
                        <div
                          key={t.tier}
                          className="flex flex-col items-center justify-center border border-white/15 bg-[#172430] py-2"
                        >
                          <span>{t.icon}</span>
                          <span className="mt-0.5 font-mono text-[9px] text-white/60">{t.tier}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="text-[11px] font-black uppercase tracking-wider text-white">
                      DAILY OBJECTIVES
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/80">Use Survival Abilities</span>
                        <span className="font-mono text-emerald-400">+8,250 XP</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00f0ff]" style={{ width: '22%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/80">Deal Damage to Stalkers</span>
                        <span className="font-mono text-emerald-400">+8,100 XP</span>
                      </div>
                      <div className="mt-1 h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00f0ff]" style={{ width: '18%' }} />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setMobileMissionsOpen(false)}
                    className="mt-6 val-cut-btn w-full bg-[#ff4655] py-2.5 text-center text-xs font-black uppercase text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ================= COLLECTION TAB ================= */}
        {activeTab === 'collection' ? (
          <div className="relative z-10 flex h-full w-full flex-col p-4 sm:p-8 overflow-y-auto">
            <h2 className="val-logo text-2xl sm:text-3xl font-black tracking-widest text-white mb-1">
              SURVIVOR ARSENAL & LOADOUT
            </h2>
            <p className="text-[10px] sm:text-xs text-white/60 font-mono uppercase tracking-widest mb-4 sm:mb-6">
              EQUIPMENT // BLUEPRINTS // SURVIVAL RIG
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl pb-12">
              {[
                { name: 'TACTICAL MACHETE', type: 'MELEE', stat: 'Damage: 45 · Cleave: 1.8m', skin: 'PRIME CARBON', icon: '🗡️' },
                { name: 'SIGNAL FLARE LAUNCHER', type: 'SECONDARY', stat: 'Beacon Range: 45m', skin: 'HAZMAT AMBER', icon: '🔦' },
                { name: 'FIELD GENERATOR RIG', type: 'UTILITY', stat: 'Efficiency: +35%', skin: 'PROTOTYPE V1', icon: '⚡' },
                { name: 'NANO-MEDICINE PACK', type: 'CONSUMABLE', stat: 'Heal: 40 HP over 2s', skin: 'STANDARD SPEC', icon: '💉' },
                { name: 'HARDENED COMPOSITE SUIT', type: 'ARMOR', stat: 'Damage Reduction: 20%', skin: 'STORMFALL RECON', icon: '🦺' },
                { name: 'EMERGENCY BEACON CORE', type: 'OBJECTIVE', stat: 'Extraction Hold: 16s', skin: 'QUANTUM MK-II', icon: '📡' },
              ].map((item) => (
                <div
                  key={item.name}
                  className="val-panel val-cut-btn p-4 sm:p-5 transition hover:border-[#ff4655] cursor-pointer"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-[#00f0ff]">
                    <span>{item.type}</span>
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <div className="mt-2 text-sm sm:text-base font-black tracking-wide text-white">
                    {item.name}
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-emerald-400">
                    SKIN: {item.skin}
                  </div>
                  <div className="mt-2.5 text-xs text-white/60 border-t border-white/10 pt-2 font-mono">
                    {item.stat}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ================= CAREER TAB ================= */}
        {activeTab === 'career' ? (
          <div className="relative z-10 flex h-full w-full flex-col p-4 sm:p-8 overflow-y-auto">
            <h2 className="val-logo text-2xl sm:text-3xl font-black tracking-widest text-white mb-1">
              CAREER & OPERATIONAL DOSSIER
            </h2>
            <p className="text-[10px] sm:text-xs text-white/60 font-mono uppercase tracking-widest mb-4 sm:mb-6">
              RECORD OF EVACUATIONS // STORMFALL ISLE CAMPAIGN
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mb-6">
              <div className="val-panel p-3 sm:p-4 text-center">
                <div className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase">
                  EVACUATION RATE
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-emerald-400">
                  78.4%
                </div>
              </div>
              <div className="val-panel p-3 sm:p-4 text-center">
                <div className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase">
                  MATCHES PLAYED
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-white">
                  34
                </div>
              </div>
              <div className="val-panel p-3 sm:p-4 text-center">
                <div className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase">
                  GENERATORS FIXED
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-[#00f0ff]">
                  28
                </div>
              </div>
              <div className="val-panel p-3 sm:p-4 text-center">
                <div className="text-[9px] sm:text-[10px] font-mono text-white/50 uppercase">
                  STALKERS EVADED
                </div>
                <div className="mt-1 text-2xl sm:text-3xl font-black text-[#ff4655]">
                  112
                </div>
              </div>
            </div>

            <div className="max-w-4xl space-y-2 pb-12">
              <div className="text-xs font-mono uppercase tracking-widest text-white/50 mb-2">
                RECENT MATCHES
              </div>
              {[
                { outcome: 'EVACUATED', map: 'Stormfall Isle', time: '5m 12s', date: 'TODAY', win: true },
                { outcome: 'OVERRUN', map: 'Research Facility', time: '4m 38s', date: 'YESTERDAY', win: false },
                { outcome: 'EVACUATED', map: 'Stormfall Isle', time: '6m 02s', date: '2 DAYS AGO', win: true },
              ].map((m, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 sm:p-3.5 border rounded-sm ${
                    m.win
                      ? 'border-emerald-500/30 bg-emerald-950/20 text-white'
                      : 'border-red-500/30 bg-red-950/20 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{m.win ? '🚁' : '💀'}</span>
                    <div>
                      <div className="text-xs font-bold tracking-wider">{m.outcome}</div>
                      <div className="text-[10px] text-white/50 font-mono">
                        {m.map} · {m.time}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-white/60">{m.date}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ================= HOME TAB ================= */}
        {activeTab === 'home' ? (
          <div className="relative z-10 flex h-full w-full flex-col p-4 sm:p-8 overflow-y-auto">
            <h2 className="val-logo text-2xl sm:text-3xl font-black tracking-widest text-white mb-1">
              STORMFALL INTEL & FIELD BRIEFING
            </h2>
            <p className="text-[10px] sm:text-xs text-white/60 font-mono uppercase tracking-widest mb-4 sm:mb-6">
              RESEARCH FACILITY 04 // EMERGENCY LOGS
            </p>

            <div className="max-w-3xl space-y-4 pb-12">
              <div className="val-panel p-4 sm:p-5 border-l-4 border-[#ff4655]">
                <div className="text-xs font-bold text-[#ff4655] uppercase tracking-wider font-mono">
                  PRIORITY ALERT // SQUALL INBOUND
                </div>
                <div className="mt-1 text-base sm:text-lg font-black text-white">
                  BLACKOUT PROTOCOL ACTIVATED ACROSS ALL SECTORS
                </div>
                <p className="mt-2 text-xs text-[#ece8e1]/80 leading-relaxed">
                  Power was severed at 0300 hours. Emergency backups failed. Survivors must scavenge components across the island, restart the auxiliary generator in the maintenance bunker, and restore the ridge evacuation beacon before nightfall.
                </p>
              </div>

              <div className="val-panel p-4 sm:p-5">
                <div className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider font-mono">
                  THREAT WARNING // BIOLOGICAL STALKERS
                </div>
                <p className="mt-2 text-xs text-[#ece8e1]/80 leading-relaxed">
                  Stalkers patrol the forest clearing and facility perimeter. They use optical line-of-sight and respond to sprint footfalls. Use buildings to break line of sight. They cannot penetrate reinforced walls.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* ================= STORE TAB ================= */}
        {activeTab === 'store' ? (
          <div className="relative z-10 flex h-full w-full flex-col p-4 sm:p-8 overflow-y-auto">
            <h2 className="val-logo text-2xl sm:text-3xl font-black tracking-widest text-white mb-1">
              BLACK MARKET RESEARCH DEPOT
            </h2>
            <p className="text-[10px] sm:text-xs text-white/60 font-mono uppercase tracking-widest mb-4 sm:mb-6">
              FEATURED TACTICAL BUNDLES & RADIANITE BLUEPRINTS
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl pb-12">
              <div className="val-panel p-5 sm:p-6 border border-[#ff4655]/40 val-cut-tr">
                <div className="inline-block bg-[#ff4655] px-2 py-0.5 text-[9px] font-black uppercase text-white mb-2">
                  FEATURED BUNDLE
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">PRIME EXCAVATOR BUNDLE</h3>
                <p className="mt-1 text-xs text-white/60">
                  Includes Prime Combat Knife, Heavy Rig, and Radiant Flame Beacon FX.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="font-mono text-sm font-bold text-[#ff4655]">2,175 VP</span>
                  <button className="val-cut-btn bg-[#ff4655] px-4 py-2 text-xs font-black text-white uppercase hover:brightness-110 cursor-pointer">
                    PURCHASE
                  </button>
                </div>
              </div>

              <div className="val-panel p-5 sm:p-6 border border-white/10 val-cut-bl">
                <div className="inline-block bg-[#00f0ff]/20 text-[#00f0ff] px-2 py-0.5 text-[9px] font-black uppercase mb-2">
                  RADIANITE UPGRADE
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">CUSTOM FINISHER FX</h3>
                <p className="mt-1 text-xs text-white/60">
                  Custom helicopter extraction cinematics and victory beam flares.
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="font-mono text-sm font-bold text-[#00f0ff]">30 RP</span>
                  <button className="val-cut-btn border border-white/20 bg-white/10 px-4 py-2 text-xs font-black text-white uppercase hover:bg-white/20 cursor-pointer">
                    UPGRADE
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* ======================= BOTTOM BAR HOTKEY FOOTER ======================= */}
      <footer className="pointer-events-none absolute bottom-0 inset-x-0 z-20 flex h-7 sm:h-8 items-center justify-between px-3 sm:px-6 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-white/40 bg-gradient-to-t from-black/80 to-transparent">
        <div>
          <span>LAST LIGHT // VALORANT ENGINE UI 4.0</span> · <span className="text-[#00f0ff]">READY</span>
        </div>
        <div className="pointer-events-auto hidden sm:flex items-center gap-4">
          <button onClick={onOpenSettings} className="hover:text-white transition cursor-pointer">
            [O] SETTINGS
          </button>
          <button onClick={onExit} className="hover:text-[#ff4655] transition cursor-pointer">
            [ESC] LOGOUT
          </button>
        </div>
      </footer>
    </div>
  )
}
