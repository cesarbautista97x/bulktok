import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    try {
        console.log('[API] Profile create endpoint called')

        // Get cookies
        const cookieStore = cookies()
        const allCookies = cookieStore.getAll()
        console.log('[API] Cookies count:', allCookies.length)

        // Find Supabase auth cookie
        const authCookie = allCookies.find(cookie =>
            cookie.name.includes('auth-token') || cookie.name.includes('sb-')
        )

        if (!authCookie) {
            console.log('[API] No auth cookie found')
            return NextResponse.json({ error: 'Not authenticated - no cookie' }, { status: 401 })
        }

        console.log('[API] Found auth cookie:', authCookie.name)

        // Parse the cookie value to get the access token
        let accessToken
        try {
            const cookieData = JSON.parse(authCookie.value)
            accessToken = cookieData.access_token
            console.log('[API] Extracted access token')
        } catch (e) {
            console.log('[API] Failed to parse cookie:', e)
            return NextResponse.json({ error: 'Invalid auth cookie' }, { status: 401 })
        }

        if (!accessToken) {
            console.log('[API] No access token in cookie')
            return NextResponse.json({ error: 'No access token' }, { status: 401 })
        }

        // Create Supabase client
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        // Get user from token
        const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken)

        if (userError || !user) {
            console.error('[API] Auth error:', userError)
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        console.log('[API] User authenticated:', user.email)

        // Check if profile already exists
        const { data: existingProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

        if (fetchError) {
            console.error('[API] Fetch error:', fetchError)
        }

        if (existingProfile) {
            console.log('[API] Profile already exists')
            return NextResponse.json({
                message: 'Profile already exists',
                profile: existingProfile,
            })
        }

        console.log('[API] Creating new profile...')

        // Create new profile using service role
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: newProfile, error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: user.id,
                email: user.email!,
                full_name: user.user_metadata?.full_name || null,
                avatar_url: user.user_metadata?.avatar_url || null,
            })
            .select()
            .single()

        if (insertError) {
            console.error('[API] Insert error:', insertError)
            return NextResponse.json({ error: insertError.message }, { status: 500 })
        }

        console.log('[API] Profile created successfully')

        return NextResponse.json({
            message: 'Profile created successfully',
            profile: newProfile,
        })
    } catch (error) {
        console.error('[API] Unexpected error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
