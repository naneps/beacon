import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
}

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let particles: Particle[] = []
    const particleCount = 65
    const connectionDistance = 135
    const mouse = { x: null as number | null, y: null as number | null, radius: 180 }

    const isDarkMode = () => document.documentElement.classList.contains('dark')

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      initParticles(rect.width, rect.height)
    }

    const initParticles = (width: number, height: number) => {
      particles = []
      const colors = ['#06b6d4', '#3b82f6', '#8b5cf6', '#a855f7'] // Cyan, Blue, Violet, Purple
      const lightColor = '#94a3b8' // Slate

      for (let i = 0; i < particleCount; i++) {
        const darkColor = colors[Math.floor(Math.random() * colors.length)]
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35, // Drift velocity
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.5 + 1.2,
          color: isDarkMode() ? darkColor : lightColor,
        })
      }
    }

    const updateAndDraw = () => {
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      // Detect theme change on each frame to update particle styling seamlessly
      const dark = isDarkMode()

      ctx.clearRect(0, 0, width, height)

      // Update positions
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Wrap around bounds
        if (p.x < 0) p.x = width
        else if (p.x > width) p.x = 0

        if (p.y < 0) p.y = height
        else if (p.y > height) p.y = 0

        // Subtle attraction to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius
            p.x += (dx / dist) * force * 0.15
            p.y += (dy / dist) * force * 0.15
          }
        }
      })

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        
        // Connect to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p1.x
          const dy = mouse.y - p1.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.18
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.strokeStyle = dark
              ? `rgba(6, 182, 212, ${alpha})` // Cyan glow towards cursor
              : `rgba(148, 163, 184, ${alpha})` // Subtle slate in light mode
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }

        // Connect to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.12
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)

            if (dark) {
              // Custom gradient for connections in dark mode
              const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
              grad.addColorStop(0, `rgba(6, 182, 212, ${alpha})`)
              grad.addColorStop(0.5, `rgba(139, 92, 246, ${alpha})`)
              grad.addColorStop(1, `rgba(168, 85, 247, ${alpha})`)
              ctx.strokeStyle = grad
            } else {
              ctx.strokeStyle = `rgba(148, 163, 184, ${alpha})`
            }

            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = dark ? p.color : '#94a3b8'
        ctx.shadowColor = dark ? p.color : 'transparent'
        ctx.shadowBlur = dark ? 4 : 0
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(updateAndDraw)
    }

    // Set up resize and mouse listeners
    window.addEventListener('resize', resizeCanvas)
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect()
        mouse.x = e.touches[0].clientX - rect.left
        mouse.y = e.touches[0].clientY - rect.top
      }
    }

    const container = canvas.parentElement || window
    container.addEventListener('mousemove', handleMouseMove as any)
    container.addEventListener('mouseleave', handleMouseLeave as any)
    container.addEventListener('touchmove', handleTouchMove as any)
    container.addEventListener('touchend', handleMouseLeave as any)

    // Visibility API support to pause loop when page is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId)
      } else {
        animationFrameId = requestAnimationFrame(updateAndDraw)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Initial setup
    resizeCanvas()
    updateAndDraw()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resizeCanvas)
      container.removeEventListener('mousemove', handleMouseMove as any)
      container.removeEventListener('mouseleave', handleMouseLeave as any)
      container.removeEventListener('touchmove', handleTouchMove as any)
      container.removeEventListener('touchend', handleMouseLeave as any)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 h-full w-full pointer-events-none transition-opacity duration-1000 opacity-60 dark:opacity-85"
    />
  )
}
