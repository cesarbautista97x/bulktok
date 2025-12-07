import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { userId } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        // Get user profile with subscription ID
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('stripe_subscription_id, subscription_tier')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // If no subscription, return free tier info
        if (!profile.stripe_subscription_id || profile.subscription_tier === 'free') {
            return NextResponse.json({
                tier: 'free',
                hasSubscription: false,
            })
        }

        // Fetch subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(
            profile.stripe_subscription_id
        )

        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
        const now = new Date()
        const daysRemaining = Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return NextResponse.json({
            tier: profile.subscription_tier,
            hasSubscription: true,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            currentPeriodEnd: currentPeriodEnd.toISOString(),
            daysRemaining,
            cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        })
    } catch (error: any) {
        console.error('Subscription status error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
