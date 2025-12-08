'use client'

import { useEffect, useRef } from 'react'

interface Dot {
    x: number
    y: number
}

export default function CursorEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dotsRef = useRef<Dot[]>([])
    const mouseRef = useRef({ x: -1000, y: -1000 })
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
            generateDots()
        }

        // Generate evenly distributed dots
        const generateDots = () => {
            dotsRef.current = []
            const spacing = 30 // Closer spacing for more dots
            const offsetX = (canvas.width % spacing) / 2 // Center the grid
            const offsetY = (canvas.height % spacing) / 2

            for (let x = offsetX; x < canvas.width; x += spacing) {
                for (let y = offsetY; y < canvas.height; y += spacing) {
                    dotsRef.current.push({ x, y })
                }
            }
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }

        // Animation loop
        const animate = () => {
            if (!ctx || !canvas) return

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const mouse = mouseRef.current
            const maxDistance = 120 // Distance at which dots start to glow

            // Draw all dots
            dotsRef.current.forEach(dot => {
                const dx = mouse.x - dot.x
                const dy = mouse.y - dot.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                // Calculate opacity based on distance to mouse
                let opacity = 0.08 // Very subtle base opacity
                let size = 1.5 // Small dot size

                if (distance < maxDistance) {
                    // Smooth falloff using quadratic easing
                    const proximity = 1 - (distance / maxDistance)
                    const easedProximity = proximity * proximity

                    opacity = 0.08 + (easedProximity * 0.4) // Max opacity 0.48
                    size = 1.5 + (easedProximity * 1) // Max size 2.5
                }

                // Draw dot with subtle blue color
                ctx.fillStyle = `rgba(96, 165, 250, ${opacity})` // Lighter blue
                ctx.beginPath()
                ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2)
                ctx.fill()
            })

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
        />
    )
}
