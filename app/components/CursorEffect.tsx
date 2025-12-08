'use client'

import { useEffect, useRef } from 'react'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
}

export default function CursorEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const mouseRef = useRef({ x: 0, y: 0 })
    const animationFrameRef = useRef<number>()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }

            // Create new particles
            for (let i = 0; i < 2; i++) {
                particlesRef.current.push({
                    x: e.clientX,
                    y: e.clientY,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 0,
                    maxLife: 60 + Math.random() * 40
                })
            }
        }

        // Animation loop
        const animate = () => {
            if (!ctx || !canvas) return

            // Clear canvas with slight trail effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(particle => {
                particle.life++
                particle.x += particle.vx
                particle.y += particle.vy
                particle.vx *= 0.98
                particle.vy *= 0.98

                // Calculate opacity based on life
                const opacity = 1 - (particle.life / particle.maxLife)

                if (opacity > 0) {
                    // Draw particle
                    const size = 2 + (1 - particle.life / particle.maxLife) * 2

                    // Gradient for particle
                    const gradient = ctx.createRadialGradient(
                        particle.x, particle.y, 0,
                        particle.x, particle.y, size
                    )
                    gradient.addColorStop(0, `rgba(14, 165, 233, ${opacity * 0.8})`)
                    gradient.addColorStop(1, `rgba(14, 165, 233, 0)`)

                    ctx.fillStyle = gradient
                    ctx.beginPath()
                    ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
                    ctx.fill()

                    return true
                }
                return false
            })

            // Draw connections between nearby particles
            ctx.strokeStyle = 'rgba(14, 165, 233, 0.1)'
            ctx.lineWidth = 1

            for (let i = 0; i < particlesRef.current.length; i++) {
                for (let j = i + 1; j < particlesRef.current.length; j++) {
                    const dx = particlesRef.current[i].x - particlesRef.current[j].x
                    const dy = particlesRef.current[i].y - particlesRef.current[j].y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < 100) {
                        const opacity = (1 - distance / 100) * 0.3
                        ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`
                        ctx.beginPath()
                        ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y)
                        ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y)
                        ctx.stroke()
                    }
                }
            }

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        window.addEventListener('mousemove', handleMouseMove)
        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            window.removeEventListener('mousemove', handleMouseMove)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
            style={{ mixBlendMode: 'normal' }}
        />
    )
}
