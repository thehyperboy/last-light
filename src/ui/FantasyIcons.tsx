
export function Insignia({ className = 'h-16 w-16', spin = false }: { className?: string; spin?: boolean }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Outer Rotating Runic Ring */}
      <svg
        viewBox="0 0 100 100"
        className={`absolute inset-0 h-full w-full ${spin ? 'animate-spin-slow' : ''}`}
        fill="none"
      >
        <circle cx="50" cy="50" r="47" stroke="#AAA69B" strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="50" cy="50" r="44" stroke="#C59B61" strokeWidth="1" strokeDasharray="3 4 1 4" strokeOpacity="0.75" />
        <circle cx="50" cy="50" r="39" stroke="#AAA69B" strokeWidth="0.6" strokeOpacity="0.3" />
        {/* Cardinal North/East/South/West compass markers */}
        <polygon points="50,4 52,10 48,10" fill="#C59B61" />
        <polygon points="96,50 90,52 90,48" fill="#C59B61" />
        <polygon points="50,96 52,90 48,90" fill="#C59B61" />
        <polygon points="4,50 10,52 10,48" fill="#C59B61" />
        {/* Subtle radial ticks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="12"
            x2="50"
            y2="15"
            stroke="#AAA69B"
            strokeWidth="0.8"
            strokeOpacity="0.6"
            transform={`rotate(${deg} 50 50)`}
          />
        ))}
      </svg>

      {/* Static Inner Emblem: The Eternal Beacon Flame & Monogram */}
      <svg viewBox="0 0 100 100" className="relative h-[72%] w-[72%]" fill="none">
        <polygon
          points="50,16 68,34 68,66 50,84 32,66 32,34"
          stroke="#C59B61"
          strokeWidth="1.2"
          strokeOpacity="0.85"
          fill="rgba(32, 34, 35, 0.75)"
        />
        {/* Flame of Last Light */}
        <path
          d="M50 26 C53 36, 62 42, 60 56 C58 68, 42 68, 40 56 C38 45, 46 38, 50 26 Z"
          fill="url(#goldGradient)"
          opacity="0.9"
        />
        <path
          d="M50 36 C52 42, 57 46, 56 54 C54 60, 46 60, 44 54 C43 48, 48 44, 50 36 Z"
          fill="#FFF9E6"
          opacity="0.95"
        />
        <defs>
          <linearGradient id="goldGradient" x1="50" y1="26" x2="50" y2="68" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF9E6" />
            <stop offset="0.4" stopColor="#C59B61" />
            <stop offset="1" stopColor="#853D3D" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export function CornerFlourish({
  position = 'top-left',
  color = '#AAA69B',
  size = 20,
}: {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  color?: string
  size?: number
}) {
  const transforms = {
    'top-left': '',
    'top-right': 'scale(-1, 1)',
    'bottom-left': 'scale(1, -1)',
    'bottom-right': 'scale(-1, -1)',
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="pointer-events-none absolute"
      style={{
        top: position.includes('top') ? 0 : 'auto',
        bottom: position.includes('bottom') ? 0 : 'auto',
        left: position.includes('left') ? 0 : 'auto',
        right: position.includes('right') ? 0 : 'auto',
        transform: transforms[position],
      }}
    >
      <path d="M1 23V1H23" stroke={color} strokeWidth="1.2" strokeOpacity="0.75" />
      <path d="M1 8C4 8 8 4 8 1" stroke={color} strokeWidth="0.8" strokeOpacity="0.5" />
      <circle cx="4" cy="4" r="1.5" fill={color} fillOpacity="0.9" />
    </svg>
  )
}

export function MetallicDivider({
  label,
  className = '',
}: {
  label?: string
  className?: string
}) {
  return (
    <div className={`relative flex items-center justify-center my-4 ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#AAA69B]/40 to-[#AAA69B]/10" />
      {label ? (
        <div className="flex items-center gap-2 px-3">
          <span className="inline-block h-1 w-1 rotate-45 bg-[#C59B61]" />
          <span className="font-cinzel text-[11px] uppercase tracking-[0.25em] text-[#AAA69B]">
            {label}
          </span>
          <span className="inline-block h-1 w-1 rotate-45 bg-[#C59B61]" />
        </div>
      ) : (
        <div className="flex items-center gap-1.5 px-2">
          <span className="inline-block h-1.5 w-1.5 rotate-45 border border-[#C59B61] bg-[#292A2B]" />
        </div>
      )}
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-[#AAA69B]/40 to-[#AAA69B]/10" />
    </div>
  )
}

export function ClassBadge({
  archetype,
  className = 'h-5 w-5',
}: {
  archetype: 'vanguard' | 'medic' | 'engineer' | 'recon'
  className?: string
}) {
  switch (archetype) {
    case 'vanguard':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor">
          <path
            d="M12 2L4 5V11C4 16.5 7.4 21.6 12 23C16.6 21.6 20 16.5 20 11V5L12 2Z"
            strokeWidth="1.5"
            stroke="#C59B61"
            fill="rgba(197, 155, 97, 0.15)"
          />
          <path d="M12 6V18M7 11H17" stroke="#AAA69B" strokeWidth="1.2" />
        </svg>
      )
    case 'medic':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke="#C59B61" strokeWidth="1.5" fill="rgba(197, 155, 97, 0.15)" />
          <path d="M12 7V17M7 12H17" stroke="#E8E4DC" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    case 'engineer':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor">
          <polygon
            points="12,2 15,8 21,9 17,14 18,20 12,17 6,20 7,14 3,9 9,8"
            stroke="#C59B61"
            strokeWidth="1.4"
            fill="rgba(197, 155, 97, 0.15)"
          />
          <circle cx="12" cy="12" r="3" stroke="#AAA69B" strokeWidth="1.2" />
        </svg>
      )
    case 'recon':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor">
          <circle cx="12" cy="12" r="9" stroke="#C59B61" strokeWidth="1.5" fill="rgba(197, 155, 97, 0.15)" />
          <path d="M12 3V7M12 17V21M3 12H7M17 12H21" stroke="#AAA69B" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="2.5" fill="#E8E4DC" />
        </svg>
      )
  }
}

export function ItemGlyph({
  kind,
  className = 'h-6 w-6',
}: {
  kind: 'metal' | 'batteries' | 'meds' | 'repair' | 'kit' | 'kits'
  className?: string
}) {
  switch (kind) {
    case 'metal':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <polygon points="12,3 21,8 21,16 12,21 3,16 3,8" stroke="#AAA69B" strokeWidth="1.5" fill="rgba(170, 166, 155, 0.15)" />
          <line x1="12" y1="3" x2="12" y2="21" stroke="#AAA69B" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="3" y1="8" x2="21" y2="16" stroke="#AAA69B" strokeWidth="1" strokeOpacity="0.4" />
        </svg>
      )
    case 'batteries':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="7" y="5" width="10" height="15" rx="1.5" stroke="#C59B61" strokeWidth="1.5" fill="rgba(197, 155, 97, 0.15)" />
          <line x1="10" y1="3" x2="14" y2="3" stroke="#C59B61" strokeWidth="2" strokeLinecap="round" />
          <polygon points="13,8 9,13 12,13 11,18 15,13 12,13" fill="#C59B61" />
        </svg>
      )
    case 'meds':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="4" y="6" width="16" height="14" rx="2" stroke="#853D3D" strokeWidth="1.5" fill="rgba(133, 61, 61, 0.2)" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#853D3D" strokeWidth="1.2" />
          <path d="M12 9v8m-4-4h8" stroke="#E8E4DC" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'repair':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
            stroke="#AAA69B"
            strokeWidth="1.4"
            fill="rgba(170, 166, 155, 0.15)"
          />
        </svg>
      )
    case 'kit':
    case 'kits':
      return (
        <svg viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="3" y="6" width="18" height="14" rx="2" stroke="#C59B61" strokeWidth="1.5" fill="rgba(197, 155, 97, 0.25)" />
          <path d="M7 6V4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" stroke="#C59B61" strokeWidth="1.2" />
          <circle cx="12" cy="13" r="3.5" stroke="#E8E4DC" strokeWidth="1.2" />
          <circle cx="12" cy="13" r="1.2" fill="#C59B61" />
        </svg>
      )
  }
}
