import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

// Temporary endpoint to manually sync Stripe subscription
// DELETE THIS FILE after fixing the subscription

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        console.log('Syncing subscription for:', email)

        // 1. Find customer in Stripe by email
        const customers = await stripe.customers.list({
            email: email,
            limit: 1
        })

        if (customers.data.length === 0) {
            return NextResponse.json({
                error: 'No Stripe customer found for this email'
            }, { status: 404 })
        }

        const customer = customers.data[0]
        console.log('Found customer:', customer.id)

        // 2. Get active subscriptions
        const subscriptions = await stripe.subscriptions.list({
            customer: customer.id,
            status: 'active',
            limit: 1
        })

        if (subscriptions.data.length === 0) {
            return NextResponse.json({
                error: 'No active subscription found',
                customerId: customer.id
            }, { status: 404 })
        }

        const subscription = subscriptions.data[0]
        console.log('Found subscription:', subscription.id)

        // 3. Determine tier from price
        const priceId = subscription.items.data[0].price.id
        let tier = 'pro' // default

        if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
            tier = 'pro'
        } else if (priceId === process.env.STRIPE_PRICE_ID_UNLIMITED) {
            tier = 'unlimited'
        }

        console.log('Determined tier:', tier)

        // 4. Update profile in database
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                subscription_tier: tier,
                stripe_customer_id: customer.id,
                stripe_subscription_id: subscription.id
            })
            .eq('email', email)
            .select()
            .single()

        if (profileError) {
            console.error('Error updating profile:', profileError)
            return NextResponse.json({
                error: 'Failed to update profile',
                details: profileError.message
            }, { status: 500 })
        }

        console.log('Profile updated successfully')

        return NextResponse.json({
            success: true,
            message: 'Subscription synced successfully',
            profile: {
                email: profile.email,
                tier: profile.subscription_tier,
                customerId: profile.stripe_customer_id,
                subscriptionId: profile.stripe_subscription_id
            }
        })

    } catch (error) {
        console.error('Sync error:', error)
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
}
