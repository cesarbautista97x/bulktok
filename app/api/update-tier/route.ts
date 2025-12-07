import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email, tier } = await request.json()

        if (!email || !tier) {
            return NextResponse.json({ error: 'Email and tier required' }, { status: 400 })
        }

        // Update tier directly with admin client
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update({ subscription_tier: tier })
            .eq('email', email)
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, profile: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
