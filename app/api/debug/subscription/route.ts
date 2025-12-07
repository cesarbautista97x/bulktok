import { supabaseAdmin } from '@/lib/supabase'
import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email') || 'laurapd1@gmail.com'

        // Get user profile
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single()

        if (error || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        let stripeInfo = null
        if (profile.stripe_subscription_id) {
            try {
                const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id) as any
                stripeInfo = {
                    id: subscription.id,
                    status: subscription.status,
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: subscription.cancel_at_period_end,
                }
            } catch (e: any) {
                stripeInfo = { error: e.message }
            }
        }

        return NextResponse.json({
            profile: {
                email: profile.email,
                tier: profile.subscription_tier,
                stripe_customer_id: profile.stripe_customer_id,
                stripe_subscription_id: profile.stripe_subscription_id,
            },
            stripe: stripeInfo,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
