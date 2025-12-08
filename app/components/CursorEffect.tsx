'use client'

import { useEffect, useRef } from 'react'

export default function CursorEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const mouseRef = useRef({ x: -1000, y: -1000 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let dots: { x: number; y: number }[] = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight

            // Create grid of dots
            dots = []
            const spacing = 40
            for (let x = 0; x < canvas.width; x += spacing) {
                for (let y = 0; y < canvas.height; y += spacing) {
                    dots.push({ x, y })
                }
            }
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY }
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            const mouse = mouseRef.current

            dots.forEach(dot => {
                const dx = mouse.x - dot.x
                const dy = mouse.y - dot.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                // Simple fade based on distance
                let alpha = 0.1
                if (dist < 150) {
                    alpha = 0.1 + (1 - dist / 150) * 0.3
                }

                ctx.fillStyle = `rgba(100, 100, 100, ${alpha})`
                ctx.beginPath()
                ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2)
                ctx.fill()
            })

            requestAnimationFrame(draw)
        }

        resize()
        window.addEventListener('resize', resize)
        window.addEventListener('mousemove', handleMouseMove)
        draw()

        return () => {
            window.removeEventListener('resize', resize)
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}
