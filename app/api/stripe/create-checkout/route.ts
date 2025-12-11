import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { tier, userId } = await request.json()

        if (!tier || !['pro', 'unlimited'].includes(tier)) {
            return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
        }

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        // Get user profile directly with userId
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('stripe_customer_id, email, id')
            .eq('id', userId)
            .single()

        if (profileError || !profile) {
            console.error('Profile error:', profileError)
            return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
        }

        let customerId = profile.stripe_customer_id

        // Create Stripe customer if doesn't exist
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: profile.email,
                metadata: {
                    supabase_uid: profile.id,
                },
            })
            customerId = customer.id

            // Save customer ID to profile
            await supabaseAdmin
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', profile.id)
        }

        // Get price ID based on tier
        const priceId = tier === 'pro'
            ? process.env.STRIPE_PRICE_ID_PRO
            : process.env.STRIPE_PRICE_ID_UNLIMITED

        // Debug logging
        console.log('=== STRIPE CHECKOUT DEBUG ===')
        console.log('Tier requested:', tier)
        console.log('STRIPE_PRICE_ID_PRO:', process.env.STRIPE_PRICE_ID_PRO)
        console.log('STRIPE_PRICE_ID_UNLIMITED:', process.env.STRIPE_PRICE_ID_UNLIMITED)
        console.log('Selected priceId:', priceId)
        console.log('STRIPE_SECRET_KEY (first 10 chars):', process.env.STRIPE_SECRET_KEY?.substring(0, 10))
        console.log('Is LIVE key?:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live'))
        console.log('============================')

        if (!priceId) {
            console.error('Price ID not configured for tier:', tier)
            return NextResponse.json({ error: 'Price ID not configured' }, { status: 500 })
        }

        // Get origin URL for redirects
        const origin = request.headers.get('origin') ||
            request.headers.get('referer')?.split('/').slice(0, 3).join('/') ||
            process.env.NEXT_PUBLIC_APP_URL ||
            'http://localhost:3000'

        console.log('Creating checkout session for tier:', tier, 'priceId:', priceId, 'origin:', origin)

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${origin}/account?success=true`,
            cancel_url: `${origin}/account?canceled=true`,
            metadata: {
                tier,
                user_id: profile.id,
            },
        })

        console.log('Checkout session created:', session.id)

        return NextResponse.json({ sessionId: session.id, url: session.url })
    } catch (error: any) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        )
    }
}
