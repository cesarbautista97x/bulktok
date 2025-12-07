import { supabase } from '@/lib/supabase-client'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { hedraApiKey, userId } = await request.json()

        if (!hedraApiKey || !userId) {
            return NextResponse.json(
                { error: 'Hedra API key and user ID are required' },
                { status: 400 }
            )
        }

        // Update profile with Hedra API key
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ hedra_api_key: hedraApiKey })
            .eq('id', userId)

        if (updateError) {
            console.error('Error updating profile:', updateError)
            return NextResponse.json(
                { error: 'Failed to save API key' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Settings API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            )
        }

        // Get profile with Hedra API key
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('hedra_api_key')
            .eq('id', userId)
            .single()

        if (profileError) {
            console.error('Error fetching profile:', profileError)
            return NextResponse.json(
                { error: 'Failed to load API key' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            hedraApiKey: profile?.hedra_api_key || '',
            hedra_api_key: profile?.hedra_api_key || '' // For compatibility
        })
    } catch (error) {
        console.error('Settings API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
