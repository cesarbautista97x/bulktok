import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
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

        let stripeData = null
        if (profile.stripe_subscription_id) {
            try {
                const subscription = await stripe.subscriptions.retrieve(profile.stripe_subscription_id)
                stripeData = {
                    id: subscription.id,
                    status: subscription.status,
                    current_period_start: subscription.current_period_start,
                    current_period_end: subscription.current_period_end,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    canceled_at: subscription.canceled_at,
                    ended_at: subscription.ended_at,
                    items: subscription.items.data.map(item => ({
                        price_id: item.price.id,
                        product: item.price.product,
                    })),
                }
            } catch (e: any) {
                stripeData = { error: e.message, raw: e }
            }
        }

        return NextResponse.json({
            profile: {
                id: profile.id,
                email: profile.email,
                tier: profile.subscription_tier,
                stripe_customer_id: profile.stripe_customer_id,
                stripe_subscription_id: profile.stripe_subscription_id,
            },
            stripe: stripeData,
        }, { status: 200 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
    }
}
