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

        // Get current API key and user email
        const { data: currentProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('hedra_api_key, email')
            .eq('id', userId)
            .single()

        if (fetchError) {
            console.error('Error fetching current profile:', fetchError)
            return NextResponse.json(
                { error: 'Failed to fetch current settings' },
                { status: 500 }
            )
        }

        const isChangingKey = currentProfile?.hedra_api_key && currentProfile.hedra_api_key !== hedraApiKey
        const userEmail = currentProfile?.email

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

        // If API key was changed (not first time setup), send notification
        if (isChangingKey && userEmail) {
            try {
                // Get IP address from request
                const forwarded = request.headers.get('x-forwarded-for')
                const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown'

                // Log the change
                console.log(`⚠️ API Key changed for user ${userEmail} from IP ${ip}`)

                // Send email notification (you can implement this with Resend, SendGrid, etc.)
                // For now, we'll just log it and return a warning flag
                await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-notification`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: userEmail,
                        type: 'api_key_changed',
                        ip,
                        timestamp: new Date().toISOString()
                    })
                }).catch(err => console.error('Failed to send notification:', err))

                return NextResponse.json({
                    success: true,
                    warning: 'API key updated successfully.'
                })
            } catch (notificationError) {
                console.error('Error sending notification:', notificationError)
                // Still return success since the key was saved
                return NextResponse.json({
                    success: true,
                    warning: 'API key changed successfully.'
                })
            }
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
