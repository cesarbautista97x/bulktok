import { NextRequest, NextResponse } from 'next/server'
import archiver from 'archiver'
import { Readable } from 'stream'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { videoIds } = body
        const apiKey = request.headers.get('x-hedra-api-key') || process.env.HEDRA_API_KEY

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Hedra API key not configured' },
                { status: 400 }
            )
        }

        if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
            return NextResponse.json(
                { error: 'No video IDs provided' },
                { status: 400 }
            )
        }

        console.log(`Fetching fresh URLs for ${videoIds.length} videos from Hedra...`)

        // Fetch all videos from Hedra to get fresh URLs
        const hedraResponse = await fetch('https://api.hedra.com/web-app/public/generations', {
            headers: {
                'X-API-Key': apiKey.trim(),
                'Content-Type': 'application/json',
            },
        })

        if (!hedraResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch videos from Hedra' },
                { status: hedraResponse.status }
            )
        }

        const hedraData = await hedraResponse.json()

        // Filter to only the requested video IDs
        const requestedVideos = (hedraData.data || [])
            .filter((v: any) => videoIds.includes(v.id))
            .map((v: any) => ({
                id: v.id,
                video_url: v.asset?.asset?.url,
                name: `video-${v.id}`,
            }))
            .filter((v: any) => v.video_url)

        if (requestedVideos.length === 0) {
            return NextResponse.json(
                { error: 'No videos with valid URLs found' },
                { status: 404 }
            )
        }

        console.log(`Creating ZIP with ${requestedVideos.length} videos using streaming...`)

        // Create ZIP archive with streaming
        const archive = archiver('zip', {
            zlib: { level: 6 } // Faster compression for better streaming
        })

        // Handle archive errors
        archive.on('error', (err) => {
            console.error('Archive error:', err)
            throw err
        })

        // Download and add videos to archive
        let videoCount = 0
        for (const video of requestedVideos) {
            try {
                console.log(`Downloading video ${video.id}...`)
                const videoResponse = await fetch(video.video_url)

                if (!videoResponse.ok) {
                    console.error(`Failed to fetch video ${video.id}: ${videoResponse.status}`)
                    continue
                }

                const videoBlob = await videoResponse.blob()
                const buffer = Buffer.from(await videoBlob.arrayBuffer())

                archive.append(buffer, {
                    name: `${video.name}.mp4`,
                })

                videoCount++
                console.log(`Added video ${videoCount}/${requestedVideos.length} to ZIP (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`)
            } catch (err) {
                console.error(`Failed to download video ${video.id}:`, err)
            }
        }

        // Finalize the archive
        archive.finalize()

        // Convert archive stream to Web Stream for Next.js
        const nodeStream = Readable.from(archive)
        const webStream = new ReadableStream({
            start(controller) {
                nodeStream.on('data', (chunk) => {
                    controller.enqueue(new Uint8Array(chunk))
                })
                nodeStream.on('end', () => {
                    console.log('ZIP streaming completed')
                    controller.close()
                })
                nodeStream.on('error', (err) => {
                    console.error('Stream error:', err)
                    controller.error(err)
                })
            },
        })

        console.log(`Streaming ZIP with ${videoCount} videos to browser...`)

        return new NextResponse(webStream, {
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="bulktok-videos-${Date.now()}.zip"`,
                'Transfer-Encoding': 'chunked',
            },
        })
    } catch (error) {
        console.error('Download API error:', error)
        return NextResponse.json(
            { error: 'Failed to download videos', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
