import { supabase } from '@/lib/supabase-client'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session) {
            return NextResponse.json({
                error: 'No active session',
                session: null,
                profile: null
            })
        }

        // Get profile from database
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

        if (profileError) {
            return NextResponse.json({
                error: profileError.message,
                session: {
                    user_id: session.user.id,
                    email: session.user.email
                },
                profile: null
            })
        }

        return NextResponse.json({
            success: true,
            session: {
                user_id: session.user.id,
                email: session.user.email
            },
            profile: {
                email: profile.email,
                subscription_tier: profile.subscription_tier,
                videos_generated_this_month: profile.videos_generated_this_month,
                stripe_customer_id: profile.stripe_customer_id
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
