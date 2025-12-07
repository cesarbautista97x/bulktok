import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email') || 'laurapd1@gmail.com'

        // Get profile directly
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ profile })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
