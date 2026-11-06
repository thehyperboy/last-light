import { useMemo } from 'react'
import { AREAS, BUILDINGS, ROCKS, TREES } from '../game/world'
import type { GameState } from '../game/types'

function Building({ box, color }: { box: (typeof BUILDINGS)[number]; color: string }) {
  const w = box.maxX - box.minX
  const d = box.maxZ - box.minZ
  const h = box.maxY ?? 3
  const x = (box.minX + box.maxX) / 2
  const z = (box.minZ + box.maxZ) / 2
  return (
    <mesh position={[x, h / 2, z]} castShadow={false}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={color} roughness={0.72} metalness={0.18} />
    </mesh>
  )
}

export function Island({ state, quality }: { state: GameState; quality: 'low' | 'medium' | 'high' }) {
  const treeCount = quality === 'low' ? 8 : quality === 'medium' ? 14 : TREES.length
  const trees = useMemo(() => TREES.slice(0, treeCount), [treeCount])
  const fog = 0.018 + state.storm * 0.03
  const sky = state.storm > 0.6 ? '#0d1210' : '#15201c'

  return (
    <>
      <color attach="background" args={[sky]} />
      <fog attach="fog" args={[sky, 12, quality === 'low' ? 42 : 62]} />
      <hemisphereLight args={['#9eb3a8', '#1a1814', 0.55]} />
      <directionalLight position={[18, 28, 8]} intensity={0.85 - state.storm * 0.35} color="#c9d6cf" />
      <pointLight position={[AREAS.extract.x, 6, AREAS.extract.z]} intensity={state.beaconOn ? 4 : 0.6} color="#ffb44a" distance={18} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <circleGeometry args={[48, 40]} />
        <meshStandardMaterial color="#243328" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[46.4, 48, 40]} />
        <meshStandardMaterial color="#1b2a34" roughness={0.8} />
      </mesh>
      {BUILDINGS.map((b, i) => (
        <Building key={i} box={b} color={i === 2 ? '#3a3f3c' : i === 0 ? '#4a524c' : '#3d4542'} />
      ))}
      {ROCKS.map((r, i) => (
        <mesh key={`r${i}`} position={[r.x, r.r * 0.55, r.z]}>
          <dodecahedronGeometry args={[r.r, 0]} />
          <meshStandardMaterial color="#5c5852" roughness={0.9} />
        </mesh>
      ))}
      {trees.map((t, i) => (
        <group key={`t${i}`} position={[t.x, 0, t.z]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.16, 0.22, 1.4, 5]} />
            <meshStandardMaterial color="#4a3728" />
          </mesh>
          <mesh position={[0, 2.1, 0]}>
            <coneGeometry args={[1.1, 2.4, 6]} />
            <meshStandardMaterial color="#1f3a2a" />
          </mesh>
        </group>
      ))}
      <mesh position={[AREAS.facility.x, 0.06, AREAS.facility.z - 4]}>
        <boxGeometry args={[8, 0.08, 3]} />
        <meshStandardMaterial color="#2b2f2c" />
      </mesh>
      <mesh position={[AREAS.bunker.x, 1.1, AREAS.bunker.z]} >
        <boxGeometry args={[1.2, 1.6, 1.2]} />
        <meshStandardMaterial color={state.generatorOn ? '#d7a441' : '#6a6258'} emissive={state.generatorOn ? '#c48a22' : '#000'} emissiveIntensity={state.generatorOn ? 0.8 : 0} />
      </mesh>
      <mesh position={[AREAS.extract.x, 3.4 + Math.sin(state.tick * 0.12) * 0.12, AREAS.extract.z]}>
        <cylinderGeometry args={[0.18, 0.22, 6.4, 6]} />
        <meshStandardMaterial color="#2f3431" metalness={0.4} />
      </mesh>
      <mesh position={[AREAS.extract.x, 6.6, AREAS.extract.z]}>
        <sphereGeometry args={[0.42, 10, 10]} />
        <meshStandardMaterial color={state.beaconOn ? '#ffce70' : '#6d5a3a'} emissive={state.beaconOn ? '#ffb347' : '#22180c'} emissiveIntensity={state.beaconOn ? 1.4 : 0.2} />
      </mesh>
      {state.pickups.filter((p) => !p.taken).map((p) => (
        <mesh key={p.id} position={[p.x, 0.45, p.z]}>
          <boxGeometry args={[0.42, 0.42, 0.42]} />
          <meshStandardMaterial
            color={p.kind === 'meds' ? '#c45d5d' : p.kind === 'batteries' ? '#d6b25a' : p.kind === 'repair' ? '#6ea0c8' : '#8a8f86'}
            emissive="#222"
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      {state.storm > 0.35 && quality !== 'low' ? <Rain storm={state.storm} /> : null}
      {fog > 0 ? null : null}
    </>
  )
}

function Rain({ storm }: { storm: number }) {
  const drops = useMemo(() => {
    const n = Math.floor(40 + storm * 50)
    return Array.from({ length: n }, (_, i) => ({
      x: ((i * 17) % 70) - 35,
      z: ((i * 29) % 70) - 35,
      y: (i % 12) * 0.8,
    }))
  }, [storm])
  return (
    <group>
      {drops.map((d, i) => (
        <mesh key={i} position={[d.x, 8 - ((d.y + storm * 20) % 10), d.z]}>
          <boxGeometry args={[0.03, 0.55, 0.03]} />
          <meshBasicMaterial color="#8aa0a8" transparent opacity={0.28} />
        </mesh>
      ))}
    </group>
  )
}
