import { useState } from 'react'
import { CharacterPreview3D, SURVIVORS, type SurvivorArchetype } from './CharacterPreview3D'
import { ClassBadge, CornerFlourish, Insignia, MetallicDivider } from './FantasyIcons'

type Props = {
  selectedId: string
  onSelect: (archetype: SurvivorArchetype) => void
  onBack: () => void
  onPlaySound?: () => void
}

export function CharacterScreen({ selectedId, onSelect, onBack, onPlaySound }: Props) {
  const [activeArchetype, setActiveArchetype] = useState<SurvivorArchetype>(() => {
    return SURVIVORS.find((s) => s.id === selectedId) || SURVIVORS[0]
  })

  const isCurrentEquipped = activeArchetype.id === selectedId

  const handleChoose = (s: SurvivorArchetype) => {
    onPlaySound?.()
    setActiveArchetype(s)
  }

  const handleConfirm = () => {
    onPlaySound?.()
    onSelect(activeArchetype)
  }

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#171819] text-[#E8E4DC] select-none font-sans">
      {/* Cinematic Dark Background with vignette */}
      <img
        src="/cinematic-bg.jpg"
        alt="Dark Island"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center brightness-40 contrast-110 filter"
      />
      <div className="pointer-events-none absolute inset-0 bg-radial-[circle_at_center,transparent_30%,rgba(23,24,25,0.85)_100%]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#171819] via-[#171819]/60 to-[#171819]/80" />

      {/* Top Header */}
      <header className="relative z-20 flex h-16 w-full items-center justify-between border-b border-[#AAA69B]/20 bg-[#202223]/80 px-4 sm:px-8 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Insignia className="h-9 w-9" />
          <div className="flex flex-col">
            <span className="font-cinzel text-xs sm:text-sm font-bold tracking-[0.24em] text-[#E8E4DC]">
              EXPEDITION ROSTER
            </span>
            <span className="font-cinzel text-[9px] uppercase tracking-[0.3em] text-[#AAA69B]/70">
              SURVIVOR ARCHETYPES // PROTOCOL 01
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            onPlaySound?.()
            onBack()
          }}
          className="df-btn-silver px-4 py-1.5 text-xs tracking-[0.2em] cursor-pointer"
        >
          ← Return to Citadel
        </button>
      </header>

      {/* Main Responsive Grid */}
      <div className="relative z-10 flex flex-col lg:flex-row h-[calc(100dvh-4rem)] w-full overflow-hidden p-3 sm:p-6 gap-4">
        {/* LEFT COLUMN: Character Selector Cards */}
        <div className="w-full lg:w-80 flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto no-scrollbar shrink-0">
          <div className="hidden lg:block font-cinzel text-[11px] font-bold uppercase tracking-[0.25em] text-[#AAA69B] mb-1">
            SELECT SPECIALIST
          </div>
          {SURVIVORS.map((s) => {
            const isSelected = activeArchetype.id === s.id
            const isEquipped = selectedId === s.id
            return (
              <button
                key={s.id}
                onClick={() => handleChoose(s)}
                className={`group relative flex items-center justify-between p-3.5 text-left transition-all cursor-pointer border ${
                  isSelected
                    ? 'df-card-active'
                    : 'df-panel df-panel-hover'
                } shrink-0 w-64 lg:w-full`}
              >
                <CornerFlourish position="top-left" color={isSelected ? '#C59B61' : '#AAA69B'} size={14} />
                <CornerFlourish position="bottom-right" color={isSelected ? '#C59B61' : '#AAA69B'} size={14} />

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#171819] border border-[#AAA69B]/30 group-hover:border-[#C59B61]">
                    <ClassBadge archetype={s.role} className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-cinzel text-xs font-bold tracking-wider text-[#E8E4DC]">
                      {s.name}
                    </div>
                    <div className="text-[10px] uppercase font-cinzel text-[#C59B61]">
                      {s.title}
                    </div>
                  </div>
                </div>

                {isEquipped ? (
                  <span className="font-cinzel text-[9px] uppercase tracking-widest text-[#C59B61] border border-[#C59B61]/50 px-1.5 py-0.5 bg-[#C59B61]/10">
                    ACTIVE
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>

        {/* CENTER STAGE: Full-Body 3D Turntable */}
        <div className="relative flex-1 flex flex-col items-center justify-center min-h-[300px] lg:min-h-0">
          <CharacterPreview3D archetype={activeArchetype} className="h-full w-full" />
        </div>

        {/* RIGHT COLUMN: Detailed Survivor Dossier */}
        <aside className="w-full lg:w-96 df-panel p-5 sm:p-6 flex flex-col justify-between overflow-y-auto relative shrink-0">
          <CornerFlourish position="top-left" color="#C59B61" size={20} />
          <CornerFlourish position="top-right" color="#C59B61" size={20} />
          <CornerFlourish position="bottom-left" color="#C59B61" size={20} />
          <CornerFlourish position="bottom-right" color="#C59B61" size={20} />

          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between border-b border-[#AAA69B]/20 pb-3">
              <span className="font-cinzel text-[10px] tracking-[0.25em] text-[#C59B61] uppercase">
                DOSSIER // {activeArchetype.role}
              </span>
              <span className="flex items-center gap-1.5 font-cinzel text-[10px] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                DEPLOYABLE
              </span>
            </div>

            {/* Title & Name */}
            <div className="mt-4">
              <h2 className="font-cinzel text-2xl font-black tracking-widest text-[#E8E4DC]">
                {activeArchetype.name}
              </h2>
              <div className="font-cinzel text-xs font-bold uppercase tracking-[0.22em] text-[#C59B61] mt-0.5">
                {activeArchetype.title}
              </div>
            </div>

            <MetallicDivider label="SPECIALIZATION" className="my-3" />

            {/* Specialization & Lore */}
            <p className="text-xs text-[#E8E4DC]/90 leading-relaxed font-sans">
              {activeArchetype.spec}
            </p>
            <p className="mt-2 text-[11px] text-[#A5A4A0] leading-relaxed italic font-editorial">
              "{activeArchetype.lore}"
            </p>

            <MetallicDivider label="SURVIVAL TRAIT" className="my-3" />

            {/* Perk */}
            <div className="rounded border border-[#C59B61]/30 bg-[#C59B61]/10 p-2.5">
              <div className="font-cinzel text-[10px] font-bold uppercase tracking-wider text-[#C59B61]">
                CORE ADVANTAGE
              </div>
              <div className="mt-0.5 text-xs text-[#E8E4DC]">
                {activeArchetype.perk}
              </div>
            </div>

            <MetallicDivider label="EQUIPMENT" className="my-3" />

            {/* Gear List */}
            <div className="space-y-1.5">
              {activeArchetype.equipment.map((eq, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded border border-[#AAA69B]/15 bg-[#171819]/60 px-3 py-1.5 text-xs font-mono text-[#AAA69B]"
                >
                  <span className="text-[#C59B61] text-xs">◆</span>
                  <span>{eq}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 pt-3 border-t border-[#AAA69B]/20">
            <button
              onClick={handleConfirm}
              disabled={isCurrentEquipped}
              className={`w-full py-3.5 text-center font-cinzel text-xs font-bold uppercase tracking-[0.24em] transition ${
                isCurrentEquipped
                  ? 'border border-[#C59B61]/40 bg-[#C59B61]/15 text-[#C59B61] cursor-default'
                  : 'df-btn-gold cursor-pointer'
              }`}
            >
              {isCurrentEquipped ? '✓ OPERATOR ASSIGNED' : 'ASSIGN TO EXPEDITION'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
