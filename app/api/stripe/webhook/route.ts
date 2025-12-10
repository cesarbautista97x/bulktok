import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature')

    if (!sig) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (err) {
        console.error('Webhook signature verification failed:', err)
        return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 }
        )
    }

    const supabase = createRouteHandlerClient({ cookies })

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session
                const customerId = session.customer as string
                const subscriptionId = session.subscription as string
                const tier = session.metadata?.tier || 'pro' // Get tier from metadata

                console.log('Checkout completed:', { customerId, subscriptionId, tier })

                // Update user profile with correct tier using admin client
                const { error } = await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_tier: tier,
                        stripe_subscription_id: subscriptionId,
                    })
                    .eq('stripe_customer_id', customerId)

                if (error) {
                    console.error('Error updating profile:', error)
                } else {
                    console.log('Profile updated successfully to tier:', tier)
                }
                break
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string
                const status = subscription.status
                const priceId = subscription.items.data[0]?.price.id

                console.log('Subscription updated:', { customerId, status, priceId })

                // Determine tier from price ID
                let tier = 'free'
                if (status === 'active' && priceId) {
                    if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
                        tier = 'pro'
                    } else if (priceId === process.env.STRIPE_PRICE_ID_UNLIMITED) {
                        tier = 'unlimited'
                    } else {
                        // Unknown price, default to pro
                        tier = 'pro'
                    }
                }

                console.log('Updating tier to:', tier)

                // Update subscription tier
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_tier: tier,
                        stripe_subscription_id: subscription.id
                    })
                    .eq('stripe_customer_id', customerId)

                break
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription
                const customerId = subscription.customer as string

                console.log('Subscription deleted:', { customerId })

                // Downgrade to free tier
                await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: 'free',
                        stripe_subscription_id: null,
                    })
                    .eq('stripe_customer_id', customerId)
                break
            }

            default:
                console.log(`Unhandled event type: ${event.type}`)
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook handler error:', error)
        return NextResponse.json(
            { error: 'Webhook handler failed' },
            { status: 500 }
        )
    }
}
