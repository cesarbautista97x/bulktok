import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    try {
        // Get API key from header or environment
        const apiKey = request.headers.get('x-hedra-api-key') || process.env.HEDRA_API_KEY

        if (!apiKey) {
            return NextResponse.json(
                { error: 'Hedra API key not configured' },
                { status: 400 }
            )
        }

        // Fetch generations from Hedra API
        const hedraResponse = await fetch('https://api.hedra.com/web-app/public/generations', {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey.trim(),
                'Content-Type': 'application/json',
            },
        })

        if (!hedraResponse.ok) {
            const errorText = await hedraResponse.text()
            console.error('Hedra API error:', hedraResponse.status, errorText)
            return NextResponse.json(
                { error: 'Failed to fetch videos from Hedra', details: errorText },
                { status: hedraResponse.status }
            )
        }

        const hedraData = await hedraResponse.json()

        // Log for debugging
        console.log('Hedra API returned:', hedraData.data ? `${hedraData.data.length} videos` : 'no data field')

        // Transform Hedra response to our format
        const videos = (hedraData.data || []).map((gen: any) => {
            const video = {
                id: gen.id,
                status: gen.status,
                created_at: gen.created_at,
                // Hedra stores video URL in asset.asset.url and thumbnail in asset.thumbnail_url
                video_url: gen.asset?.asset?.url || null,
                thumbnail_url: gen.asset?.thumbnail_url || null,
                prompt: gen.input?.generated_video_inputs?.text_prompt || '',
                aspect_ratio: gen.input?.generated_video_inputs?.aspect_ratio || '',
                resolution: gen.input?.generated_video_inputs?.resolution || '',
                error: gen.error_message || null,
            }
            return video
        })

        console.log(`Returning ${videos.length} videos`)

        return NextResponse.json({ videos })
    } catch (error) {
        console.error('Hedra videos API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch videos', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}
