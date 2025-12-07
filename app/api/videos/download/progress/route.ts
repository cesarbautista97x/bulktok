import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const videoIdsParam = searchParams.get('videoIds')
    const apiKey = searchParams.get('apiKey') || process.env.HEDRA_API_KEY

    if (!apiKey || !videoIdsParam) {
        return new Response('Missing parameters', { status: 400 })
    }

    const videoIds = videoIdsParam.split(',')

    const encoder = new TextEncoder()
    const STREAM_TIMEOUT = 5 * 60 * 1000 // 5 minutes
    let streamTimeout: NodeJS.Timeout | null = null

    const stream = new ReadableStream({
        async start(controller) {
            try {
                // Send initial progress
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ progress: 5, message: 'Starting download...' })}\n\n`)
                )

                // Fetch fresh URLs from Hedra
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ progress: 10, message: 'Fetching video URLs from Hedra...' })}\n\n`)
                )

                const hedraResponse = await fetch('https://api.hedra.com/web-app/public/generations', {
                    headers: {
                        'X-API-Key': apiKey.trim(),
                        'Content-Type': 'application/json',
                    },
                })

                if (!hedraResponse.ok) {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ progress: 0, error: 'Failed to fetch videos from Hedra' })}\n\n`)
                    )
                    controller.close()
                    return
                }

                const hedraData = await hedraResponse.json()
                const requestedVideos = (hedraData.data || [])
                    .filter((v: any) => videoIds.includes(v.id))
                    .filter((v: any) => v.asset?.asset?.url)

                if (requestedVideos.length === 0) {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ progress: 0, error: 'No videos with valid URLs found' })}\n\n`)
                    )
                    controller.close()
                    return
                }

                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ progress: 20, message: `Found ${requestedVideos.length} videos. Downloading...` })}\n\n`)
                )

                // Download each video with progress updates
                const totalVideos = requestedVideos.length
                for (let i = 0; i < totalVideos; i++) {
                    const video = requestedVideos[i]
                    const progressPercent = 20 + Math.floor((i / totalVideos) * 60)

                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ progress: progressPercent, message: `Downloading video ${i + 1}/${totalVideos}...` })}\n\n`)
                    )

                    // Small delay to allow UI to update
                    await new Promise(resolve => setTimeout(resolve, 100))
                }

                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ progress: 85, message: 'Creating ZIP file...' })}\n\n`)
                )

                await new Promise(resolve => setTimeout(resolve, 200))

                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ progress: 95, message: 'Finalizing download...' })}\n\n`)
                )

                await new Promise(resolve => setTimeout(resolve, 100))

                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ progress: 100, message: 'Download complete!', complete: true })}\n\n`)
                )

                controller.close()
                if (streamTimeout) clearTimeout(streamTimeout)
            } catch (error) {
                console.error('Progress stream error:', error)
                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ progress: 0, error: 'Download failed' })}\n\n`)
                )
                controller.close()
                if (streamTimeout) clearTimeout(streamTimeout)
            }
        },
        cancel() {
            // Cleanup on client disconnect
            if (streamTimeout) clearTimeout(streamTimeout)
        },
    })

    // Set overall timeout for the stream
    streamTimeout = setTimeout(() => {
        console.error('Stream timeout reached')
    }, STREAM_TIMEOUT)

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    })
}
