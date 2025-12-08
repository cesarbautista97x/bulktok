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
            .select('stripe_subscription_id, email, id')

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

        if (!profile.stripe_subscription_id) {
            return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
        }

        // Cancel subscription at period end (not immediately)
        let subscription
        try {
            subscription = await stripe.subscriptions.update(
                profile.stripe_subscription_id,
                {
                    cancel_at_period_end: true,
                }
            ) as any
        } catch (stripeError: any) {
            console.error('Stripe cancellation error:', stripeError)
            if (stripeError.code === 'resource_missing') {
                return NextResponse.json({
                    error: 'Subscription not found in Stripe',
                    details: 'The subscription may have already been canceled or deleted'
                }, { status: 404 })
            }
            throw stripeError
        }

        return NextResponse.json({
            success: true,
            message: 'Subscription will be canceled at the end of the billing period',
            cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000).toISOString() : null,
        })
    } catch (error: any) {
        console.error('Cancel subscription error:', error)
        return NextResponse.json(
            {
                error: error.message,
                details: error.stack
            },
            { status: 500 }
        )
    }
}
