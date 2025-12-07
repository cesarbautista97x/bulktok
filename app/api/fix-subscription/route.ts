import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        // Get user profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        if (!profile.stripe_customer_id) {
            return NextResponse.json({ error: 'No Stripe customer ID' }, { status: 400 })
        }

        // Get all subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
            customer: profile.stripe_customer_id,
            status: 'active',
            limit: 1,
        })

        if (subscriptions.data.length === 0) {
            return NextResponse.json({ error: 'No active subscriptions found' }, { status: 404 })
        }

        const subscription = subscriptions.data[0] as any

        // Determine tier from price ID
        const priceId = subscription.items.data[0].price.id
        let tier = 'free'

        if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
            tier = 'pro'
        } else if (priceId === process.env.STRIPE_PRICE_ID_UNLIMITED) {
            tier = 'unlimited'
        }

        // Update profile with subscription info
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                stripe_subscription_id: subscription.id,
                subscription_tier: tier,
            })
            .eq('id', profile.id)

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            subscription_id: subscription.id,
            tier,
            status: subscription.status,
        })
    } catch (error: any) {
        console.error('Fix subscription error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
