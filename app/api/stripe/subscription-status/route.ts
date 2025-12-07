import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { userId, email } = await request.json()

        if (!userId && !email) {
            return NextResponse.json({ error: 'User ID or email required' }, { status: 400 })
        }

        // Get user profile with subscription ID
        let query = supabaseAdmin
            .from('profiles')
            .select('stripe_subscription_id, subscription_tier, id')

        if (userId) {
            query = query.eq('id', userId)
        } else {
            query = query.eq('email', email)
        }

        const { data: profile, error: profileError } = await query.single()

        if (profileError || !profile) {
            console.error('Profile lookup error:', profileError)
            return NextResponse.json({
                error: 'Profile not found',
                details: profileError?.message
            }, { status: 404 })
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
        ) as any

        console.log('Stripe subscription data:', {
            id: subscription.id,
            status: subscription.status,
            current_period_end: subscription.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end,
        })

        if (!subscription.current_period_end) {
            console.error('No current_period_end in subscription')
            return NextResponse.json({
                error: 'Invalid subscription data',
                details: 'Missing current_period_end'
            }, { status: 500 })
        }

        const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
        const now = new Date()
        const daysRemaining = Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        return NextResponse.json({
            tier: profile.subscription_tier,
            hasSubscription: true,
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
            currentPeriodEnd: currentPeriodEnd.toISOString(),
            daysRemaining,
            cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        })
    } catch (error: any) {
        console.error('Subscription status error:', error)
        return NextResponse.json(
            {
                error: error.message,
                details: error.stack
            },
            { status: 500 }
        )
    }
}
