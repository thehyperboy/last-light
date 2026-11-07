import { useEffect, useRef } from 'react'

export function ValorantPortalFx() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId = 0
    let width = canvas.offsetWidth || window.innerWidth || 800
    let height = canvas.offsetHeight || window.innerHeight || 600
    canvas.width = width
    canvas.height = height

    const handleResize = () => {
      if (!canvas) return
      width = canvas.offsetWidth || window.innerWidth || 800
      height = canvas.offsetHeight || window.innerHeight || 600
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener('resize', handleResize)

    // Compute pixel-perfect coordinates of the portal based on object-cover projection
    const getPortalCenter = () => {
      const imgAspect = 1376 / 768
      const screenAspect = width / (height || 1)
      let renderW = width
      let renderH = height
      let offsetX = 0
      let offsetY = 0

      if (screenAspect > imgAspect) {
        renderW = width
        renderH = width / imgAspect
        offsetY = (height - renderH) / 2
      } else {
        renderH = height
        renderW = height * imgAspect
        offsetX = (width - renderW) / 2
      }

      return {
        cx: offsetX + renderW * 0.613,
        cy: offsetY + renderH * 0.674,
        scale: Math.max(0.6, renderH / 768),
      }
    }

    const { cx: initCx, cy: initCy } = getPortalCenter()

    // Particles: floating embers — orange/red/deep-red palette
    const particles = Array.from({ length: 48 }, () => ({
      x: initCx + (Math.random() - 0.5) * 120,
      y: initCy + (Math.random() - 0.2) * 50,
      vx: (Math.random() - 0.5) * 0.7,
      vy: -(Math.random() * 1.5 + 0.6),
      size: Math.random() * 3.2 + 1.2,
      color: Math.random() > 0.5
        ? 'rgba(255, 106, 0, '     // bright orange
        : Math.random() > 0.4
        ? 'rgba(232, 93, 4, '      // deep orange
        : 'rgba(196, 30, 30, ',    // crimson red
      alpha: Math.random() * 0.85 + 0.15,
      decay: Math.random() * 0.007 + 0.003,
    }))

    let time = 0

    const render = () => {
      try {
        time += 0.025
        if (width <= 0 || height <= 0) {
          handleResize()
        }
        ctx.clearRect(0, 0, width, height)

        const { cx, cy, scale } = getPortalCenter()

        // 1. Radiant portal core pulsating glow — orange → red → black fade
        const pulse = Math.sin(time * 2.2) * 0.1 + 1
        const r1 = Math.max(1, 12 * scale)
        const r2 = Math.max(1, 85 * scale * pulse)

        const grad = ctx.createRadialGradient(cx, cy, r1, cx, cy, r2)
        grad.addColorStop(0, 'rgba(255, 220, 140, 0.85)')
        grad.addColorStop(0.3, 'rgba(255, 106, 0, 0.7)')
        grad.addColorStop(0.6, 'rgba(196, 30, 30, 0.4)')
        grad.addColorStop(1, 'rgba(60, 10, 0, 0)')

        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.ellipse(
          cx,
          cy,
          Math.max(1, 75 * scale * pulse),
          Math.max(1, 80 * scale * pulse),
          0,
          0,
          Math.PI * 2,
        )
        ctx.fill()
        ctx.restore()

        // 2. Swirling portal ring energy rays — ember orange
        ctx.save()
        ctx.globalCompositeOperation = 'lighter'
        for (let i = 0; i < 4; i++) {
          const angle = time * (i % 2 === 0 ? 0.9 : -0.9) + (i * Math.PI) / 2
          const rayGrad = ctx.createRadialGradient(
            cx + Math.cos(angle) * 15 * scale,
            cy + Math.sin(angle) * 10 * scale,
            Math.max(1, 4 * scale),
            cx,
            cy,
            Math.max(1, 70 * scale * pulse),
          )
          rayGrad.addColorStop(0, 'rgba(255, 200, 100, 0.5)')
          rayGrad.addColorStop(0.5, 'rgba(255, 106, 0, 0.3)')
          rayGrad.addColorStop(0.8, 'rgba(196, 30, 30, 0.15)')
          rayGrad.addColorStop(1, 'rgba(60, 10, 0, 0)')
          ctx.fillStyle = rayGrad
          ctx.beginPath()
          ctx.ellipse(
            cx,
            cy,
            Math.max(1, 60 * scale * pulse),
            Math.max(1, 70 * scale * pulse),
            angle * 0.15,
            0,
            Math.PI * 2,
          )
          ctx.fill()
        }
        ctx.restore()

        // 3. Render and update floating ember particles
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        for (const p of particles) {
          p.x += p.vx * scale
          p.y += p.vy * scale
          p.alpha -= p.decay

          // Reset particle when it fades or rises out of frame
          if (p.alpha <= 0 || p.y < cy - 200 * scale) {
            p.x = cx + (Math.random() - 0.5) * 110 * scale
            p.y = cy + (Math.random() - 0.1) * 35 * scale
            p.vx = (Math.random() - 0.5) * 0.8
            p.vy = -(Math.random() * 1.6 + 0.6)
            p.alpha = Math.random() * 0.85 + 0.2
          }

          ctx.fillStyle = `${p.color}${Math.max(0, p.alpha).toFixed(2)})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, Math.max(0.5, p.size * scale), 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      } catch {
        /* Render safety catch */
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-90"
    />
  )
}
