import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { BUILDINGS } from '../game/world'
import type { PlayerState } from '../game/types'

export function FollowCam({
  player,
  lookX,
  lookY,
  fov,
}: {
  player: PlayerState
  lookX: number
  lookY: number
  fov: number
}) {
  const { camera } = useThree()
  const current = useRef(new THREE.Vector3(0, 4, 8))
  useFrame(() => {
    const dist = 6.2
    const pitch = THREE.MathUtils.clamp(lookY, -0.7, 0.55)
    const yaw = lookX
    const offset = new THREE.Vector3(
      Math.sin(yaw) * Math.cos(pitch) * dist,
      1.55 + Math.sin(pitch) * dist * 0.85 + 1.4,
      Math.cos(yaw) * Math.cos(pitch) * dist,
    )
    const desired = new THREE.Vector3(player.x, player.y, player.z).add(offset)
    const origin = new THREE.Vector3(player.x, player.y + 1.4, player.z)
    const dir = desired.clone().sub(origin)
    const len = dir.length()
    dir.normalize()
    let allowed = len
    for (const b of BUILDINGS) {
      const box = new THREE.Box3(
        new THREE.Vector3(b.minX, 0, b.minZ),
        new THREE.Vector3(b.maxX, b.maxY ?? 3, b.maxZ),
      )
      const ray = new THREE.Ray(origin, dir)
      const hit = ray.intersectBox(box, new THREE.Vector3())
      if (hit) allowed = Math.min(allowed, origin.distanceTo(hit) - 0.35)
    }
    allowed = Math.max(1.6, allowed)
    const target = origin.clone().addScaledVector(dir, allowed)
    current.current.lerp(target, 0.14)
    camera.position.copy(current.current)
    camera.lookAt(player.x, player.y + 1.25, player.z)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = fov
      camera.updateProjectionMatrix()
    }
  })
  return null
}
