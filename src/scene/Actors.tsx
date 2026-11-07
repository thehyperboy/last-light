import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import type { EnemyState, PlayerState } from '../game/types'

const SLOT_COLORS = ['#d46a24', '#c43a3a', '#e85d04', '#992222']

export function SurvivorMesh({
  player,
  local,
  slot,
}: {
  player: PlayerState
  local: boolean
  slot: number
}) {
  const ref = useRef<Group>(null)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    g.position.x += (player.x - g.position.x) * Math.min(1, dt * 14)
    g.position.z += (player.z - g.position.z) * Math.min(1, dt * 14)
    g.position.y += (player.y - g.position.y) * Math.min(1, dt * 18)
    g.rotation.y += Math.atan2(Math.sin(player.yaw - g.rotation.y), Math.cos(player.yaw - g.rotation.y)) * Math.min(1, dt * 10)
  })
  const color = SLOT_COLORS[slot % SLOT_COLORS.length]
  return (
    <group ref={ref} position={[player.x, player.y, player.z]} rotation={[0, player.yaw, 0]}>
      {/* Body capsule */}
      <mesh position={[0, player.downed ? 0.28 : 0.9, 0]} rotation={[player.downed ? 1.2 : 0, 0, 0]}>
        <capsuleGeometry args={[0.28, 0.72, 4, 8]} />
        <meshStandardMaterial color={player.dead ? '#241c18' : color} roughness={0.55} metalness={0.2} />
      </mesh>

      {/* Head */}
      <mesh position={[0, player.downed ? 0.5 : 1.52, 0.02]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color={player.dead ? '#55443c' : '#f0d9c4'} roughness={0.7} />
      </mesh>

      {/* Backpack Rig */}
      <mesh position={[0, 1.05, -0.28]}>
        <boxGeometry args={[0.46, 0.5, 0.22]} />
        <meshStandardMaterial color="#1a1410" roughness={0.8} />
      </mesh>

      {/* Tactical Flashlight Mounted on Rig */}
      {!player.dead ? (
        <pointLight position={[0, 1.4, 0.35]} intensity={local ? 2.4 : 0.9} distance={15} color="#fff1d6" />
      ) : null}

      {/* Overhead Teammate Indicator Marker */}
      {local ? null : (
        <mesh position={[0, 2.15, 0]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshBasicMaterial color="#ff6a00" />
        </mesh>
      )}
    </group>
  )
}

export function EnemyMesh({ enemy }: { enemy: EnemyState }) {
  const ref = useRef<Group>(null)
  useFrame((_, dt) => {
    const g = ref.current
    if (!g || enemy.ai === 'dead') return
    g.position.x += (enemy.x - g.position.x) * Math.min(1, dt * 12)
    g.position.z += (enemy.z - g.position.z) * Math.min(1, dt * 12)
    g.rotation.y += Math.atan2(Math.sin(enemy.yaw - g.rotation.y), Math.cos(enemy.yaw - g.rotation.y)) * Math.min(1, dt * 8)
  })
  if (enemy.ai === 'dead') return null
  const angry = enemy.ai === 'chase' || enemy.ai === 'attack'
  return (
    <group ref={ref} position={[enemy.x, 0, enemy.z]} rotation={[0, enemy.yaw, 0]}>
      {/* Torso */}
      <mesh position={[0, 0.85, 0]}>
        <capsuleGeometry args={[0.34, 0.7, 4, 7]} />
        <meshStandardMaterial color={angry ? '#521a18' : '#2d1816'} roughness={0.65} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.55, 0.16]}>
        <boxGeometry args={[0.5, 0.28, 0.36]} />
        <meshStandardMaterial
          color="#140a08"
          emissive={angry ? '#ff3300' : '#881100'}
          emissiveIntensity={angry ? 0.9 : 0.25}
        />
      </mesh>

      {/* Glowing Twin Stalker Eyes */}
      <mesh position={[-0.14, 1.62, 0.35]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshBasicMaterial color={angry ? '#ff2200' : '#ff7700'} />
      </mesh>
      <mesh position={[0.14, 1.62, 0.35]}>
        <sphereGeometry args={[0.045, 6, 6]} />
        <meshBasicMaterial color={angry ? '#ff2200' : '#ff7700'} />
      </mesh>

      {/* Menacing Threat Aura when Chasing */}
      {angry ? (
        <pointLight position={[0, 1.6, 0.4]} color="#ff3311" intensity={1.8} distance={7} />
      ) : null}
    </group>
  )
}
