'use client'

import { useEffect, useRef } from 'react'

interface Dot {
    x: number
    y: number
    baseX: number
    baseY: number
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

            // Regenerate dots on resize
            generateDots()
        }

        // Generate grid of dots
        const generateDots = () => {
            dotsRef.current = []
            const spacing = 40 // Distance between dots
            const cols = Math.ceil(canvas.width / spacing)
            const rows = Math.ceil(canvas.height / spacing)

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    dotsRef.current.push({
                        x: i * spacing,
                        y: j * spacing,
                        baseX: i * spacing,
                        baseY: j * spacing
                    })
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
            const interactionRadius = 150 // Distance at which dots react to mouse

            // Draw dots
            dotsRef.current.forEach(dot => {
                // Calculate distance to mouse
                const dx = mouse.x - dot.baseX
                const dy = mouse.y - dot.baseY
                const distance = Math.sqrt(dx * dx + dy * dy)

                // Calculate opacity based on distance
                let opacity = 0.15
                let size = 2

                if (distance < interactionRadius) {
                    // Closer to mouse = more visible
                    const proximity = 1 - (distance / interactionRadius)
                    opacity = 0.15 + (proximity * 0.6)
                    size = 2 + (proximity * 2)

                    // Move dot slightly toward mouse
                    const force = proximity * 0.1
                    dot.x = dot.baseX + (dx * force)
                    dot.y = dot.baseY + (dy * force)
                } else {
                    // Return to base position
                    dot.x += (dot.baseX - dot.x) * 0.1
                    dot.y += (dot.baseY - dot.y) * 0.1
                }

                // Draw dot
                ctx.fillStyle = `rgba(59, 130, 246, ${opacity})` // Blue color
                ctx.beginPath()
                ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2)
                ctx.fill()
            })

            // Draw connections between nearby dots
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)'
            ctx.lineWidth = 1

            for (let i = 0; i < dotsRef.current.length; i++) {
                const dot1 = dotsRef.current[i]

                // Only check nearby dots for performance
                for (let j = i + 1; j < dotsRef.current.length; j++) {
                    const dot2 = dotsRef.current[j]
                    const dx = dot1.x - dot2.x
                    const dy = dot1.y - dot2.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    // Only draw connection if dots are close
                    if (distance < 80) {
                        // Check if either dot is near mouse
                        const dist1ToMouse = Math.sqrt(
                            Math.pow(mouse.x - dot1.baseX, 2) +
                            Math.pow(mouse.y - dot1.baseY, 2)
                        )
                        const dist2ToMouse = Math.sqrt(
                            Math.pow(mouse.x - dot2.baseX, 2) +
                            Math.pow(mouse.y - dot2.baseY, 2)
                        )

                        const minDistToMouse = Math.min(dist1ToMouse, dist2ToMouse)

                        if (minDistToMouse < interactionRadius) {
                            const proximity = 1 - (minDistToMouse / interactionRadius)
                            const opacity = proximity * 0.3

                            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`
                            ctx.beginPath()
                            ctx.moveTo(dot1.x, dot1.y)
                            ctx.lineTo(dot2.x, dot2.y)
                            ctx.stroke()
                        }
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
            style={{ opacity: 0.6 }}
        />
    )
}
