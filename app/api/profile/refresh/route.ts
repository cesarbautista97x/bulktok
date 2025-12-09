import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Force refresh profile - temporary endpoint
export async function POST(request: NextRequest) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        // Get fresh profile from database
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            profile
        })

    } catch (error) {
        console.error('Refresh profile error:', error)
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 })
    }
}
