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

export default function ParticleBackground() {
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

            // Create particles on mouse move
            for (let i = 0; i < 3; i++) {
                particlesRef.current.push({
                    x: e.clientX + (Math.random() - 0.5) * 20,
                    y: e.clientY + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 1,
                    maxLife: 60 + Math.random() * 40,
                })
            }

            // Limit particles
            if (particlesRef.current.length > 200) {
                particlesRef.current = particlesRef.current.slice(-200)
            }
        }

        window.addEventListener('mousemove', handleMouseMove)

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Update and draw particles
            particlesRef.current = particlesRef.current.filter(particle => {
                particle.x += particle.vx
                particle.y += particle.vy
                particle.life++

                const alpha = 1 - particle.life / particle.maxLife
                const size = 2 + (1 - particle.life / particle.maxLife) * 3

                // Draw particle with gradient
                const gradient = ctx.createRadialGradient(
                    particle.x, particle.y, 0,
                    particle.x, particle.y, size
                )
                gradient.addColorStop(0, `rgba(99, 102, 241, ${alpha * 0.8})`)
                gradient.addColorStop(1, `rgba(99, 102, 241, 0)`)

                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
                ctx.fill()

                return particle.life < particle.maxLife
            })

            animationFrameRef.current = requestAnimationFrame(animate)
        }

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
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    )
}
