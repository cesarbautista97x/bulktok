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
            const maxDistance = 180 // Increased from 120 for larger glow area

            // Draw all dots
            dotsRef.current.forEach(dot => {
                const dx = mouse.x - dot.x
                const dy = mouse.y - dot.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                // Calculate opacity based on distance to mouse
                let opacity = 0.15 // Increased base opacity from 0.08
                let size = 2 // Slightly larger base size

                if (distance < maxDistance) {
                    // Smooth falloff using quadratic easing
                    const proximity = 1 - (distance / maxDistance)
                    const easedProximity = proximity * proximity

                    opacity = 0.15 + (easedProximity * 0.7) // Max opacity 0.85 (much more visible)
                    size = 2 + (easedProximity * 2.5) // Max size 4.5px
                }

                // Draw dot with more vibrant blue color
                ctx.fillStyle = `rgba(59, 130, 246, ${opacity})` // Darker, more vibrant blue
                ctx.beginPath()
                ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2)
                ctx.fill()
            })

            // Draw connections between nearby dots for extra effect
            if (mouse.x > -100) { // Only if mouse is on screen
                dotsRef.current.forEach((dot, i) => {
                    const dx = mouse.x - dot.x
                    const dy = mouse.y - dot.y
                    const distanceToMouse = Math.sqrt(dx * dx + dy * dy)

                    if (distanceToMouse < maxDistance) {
                        // Find nearby dots to connect
                        for (let j = i + 1; j < dotsRef.current.length; j++) {
                            const dot2 = dotsRef.current[j]
                            const dx2 = dot.x - dot2.x
                            const dy2 = dot.y - dot2.y
                            const distanceBetween = Math.sqrt(dx2 * dx2 + dy2 * dy2)

                            if (distanceBetween < 60) { // Connect dots within 60px
                                const proximity = 1 - (distanceToMouse / maxDistance)
                                const lineOpacity = proximity * 0.25 // Subtle connections

                                ctx.strokeStyle = `rgba(59, 130, 246, ${lineOpacity})`
                                ctx.lineWidth = 1
                                ctx.beginPath()
                                ctx.moveTo(dot.x, dot.y)
                                ctx.lineTo(dot2.x, dot2.y)
                                ctx.stroke()
                            }
                        }
                    }
                })
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
        />
    )
}
