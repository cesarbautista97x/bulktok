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
        )

        console.log('Full subscription object:', JSON.stringify(subscription, null, 2))

        // Access fields directly without type casting issues
        const subData: any = subscription

        if (!subData.current_period_end) {
            console.error('Missing current_period_end:', {
                hasField: 'current_period_end' in subData,
                value: subData.current_period_end,
                allKeys: Object.keys(subData),
            })
            return NextResponse.json({
                error: 'Invalid subscription data',
                details: 'Missing current_period_end',
                debug: {
                    hasField: 'current_period_end' in subData,
                    keys: Object.keys(subData).slice(0, 20),
                }
            }, { status: 500 })
        }

        const currentPeriodEnd = new Date(subData.current_period_end * 1000)
        const now = new Date()
        const daysRemaining = Math.ceil((currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        const result = {
            tier: profile.subscription_tier,
            hasSubscription: true,
            status: subData.status,
            cancelAtPeriodEnd: subData.cancel_at_period_end || false,
            currentPeriodEnd: currentPeriodEnd.toISOString(),
            daysRemaining,
            cancelAt: subData.cancel_at ? new Date(subData.cancel_at * 1000).toISOString() : null,
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
