import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { apiKey } = await request.json()

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is required' },
                { status: 400 }
            )
        }

        // Trim the API key to remove any whitespace
        const trimmedKey = apiKey.trim()

        // Test the API key by making a simple request to Hedra
        // Using a lightweight endpoint to just verify authentication
        const testResponse = await fetch('https://api.hedra.com/web-app/public/assets', {
            method: 'GET',
            headers: {
                'X-API-Key': trimmedKey,
                'Content-Type': 'application/json',
            },
        })

        console.log('Hedra API test response status:', testResponse.status)

        if (testResponse.status === 200 || testResponse.status === 201) {
            return NextResponse.json({
                success: true,
                message: 'API key is valid!'
            })
        } else if (testResponse.status === 401 || testResponse.status === 403) {
            const errorText = await testResponse.text()
            console.log('Hedra API error:', errorText)
            return NextResponse.json(
                { error: 'Invalid API key. Please check your key and try again.' },
                { status: 401 }
            )
        } else {
            return NextResponse.json(
                { error: `Unexpected response from Hedra API (status ${testResponse.status})` },
                { status: testResponse.status }
            )
        }
    } catch (error) {
        console.error('API test error:', error)
        return NextResponse.json(
            { error: 'Failed to connect to Hedra API. Please check your internet connection.' },
            { status: 500 }
        )
    }
}
