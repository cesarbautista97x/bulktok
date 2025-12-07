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
            .select('stripe_subscription_id, email')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        if (!profile.stripe_subscription_id) {
            return NextResponse.json({ error: 'No active subscription' }, { status: 400 })
        }

        // Cancel subscription at period end (not immediately)
        const subscription = await stripe.subscriptions.update(
            profile.stripe_subscription_id,
            {
                cancel_at_period_end: true,
            }
        )

        return NextResponse.json({
            success: true,
            message: 'Subscription will be canceled at the end of the billing period',
            cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        })
    } catch (error: any) {
        console.error('Cancel subscription error:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
