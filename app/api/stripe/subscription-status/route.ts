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
        let subscription
        try {
            subscription = await stripe.subscriptions.retrieve(
                profile.stripe_subscription_id
            )
        } catch (stripeError: any) {
            console.error('Stripe subscription retrieval error:', stripeError)
            // If subscription not found in Stripe, return free tier
            if (stripeError.code === 'resource_missing') {
                return NextResponse.json({
                    tier: profile.subscription_tier,
                    hasSubscription: false,
                    error: 'Subscription not found in Stripe',
                })
            }
            throw stripeError
        }

        console.log('Stripe subscription retrieved:', {
            id: subscription.id,
            status: subscription.status,
            current_period_end: (subscription as any).current_period_end,
            cancel_at_period_end: (subscription as any).cancel_at_period_end,
            canceled_at: (subscription as any).canceled_at,
        })

        // Access fields with type safety
        const subData: any = subscription

        // Build result object based on available data
        const result: any = {
            tier: profile.subscription_tier,
            hasSubscription: true,
            status: subData.status,
            cancelAtPeriodEnd: subData.cancel_at_period_end || false,
        }

        // Add period end and days remaining if available
        if (subData.current_period_end) {
            try {
                const currentPeriodEnd = new Date(subData.current_period_end * 1000)
                const now = new Date()
                const daysRemaining = Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                result.currentPeriodEnd = currentPeriodEnd.toISOString()
                result.daysRemaining = Math.max(0, daysRemaining) // Don't show negative days
            } catch (dateError) {
                console.error('Error parsing current_period_end:', dateError)
            }
        }

        // Add cancellation info if available
        if (subData.cancel_at) {
            try {
                result.cancelAt = new Date(subData.cancel_at * 1000).toISOString()
            } catch (dateError) {
                console.error('Error parsing cancel_at:', dateError)
            }
        }

        if (subData.canceled_at) {
            try {
                result.canceledAt = new Date(subData.canceled_at * 1000).toISOString()
            } catch (dateError) {
                console.error('Error parsing canceled_at:', dateError)
            }
        }

        console.log('Returning subscription status:', result)

        return NextResponse.json(result)
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
