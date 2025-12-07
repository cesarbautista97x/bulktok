import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

/**
 * Test Stripe checkout endpoint
 * POST /api/test-stripe-checkout with { email, tier }
 */
export async function POST(request: NextRequest) {
    try {
        const { email, tier } = await request.json()

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 })
        }

        const results: any = {
            timestamp: new Date().toISOString(),
            email,
            tier: tier || 'pro',
            tests: []
        }

        // Test 1: Get user session
        const test1 = { name: 'Get User Session', status: 'pending', data: null }
        try {
            const { data: { user }, error } = await supabase.auth.signInWithPassword({
                email,
                password: 'test123' // You'll need to use actual password
            })

            if (error || !user) {
                test1.status = 'failed'
                test1.data = { error: error?.message || 'No user found' }
            } else {
                test1.status = 'passed'
                test1.data = {
                    user_id: user.id,
                    email: user.email,
                    has_session: true
                }
            }
        } catch (error: any) {
            test1.status = 'failed'
            test1.data = { error: error.message }
        }
        results.tests.push(test1)

        // Test 2: Get session token
        const test2 = { name: 'Get Session Token', status: 'pending', data: null }
        if (test1.status === 'passed') {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session?.access_token) {
                    test2.status = 'failed'
                    test2.data = { error: 'No access token' }
                } else {
                    test2.status = 'passed'
                    test2.data = {
                        has_token: true,
                        token_preview: session.access_token.substring(0, 20) + '...'
                    }
                }
            } catch (error: any) {
                test2.status = 'failed'
                test2.data = { error: error.message }
            }
        } else {
            test2.status = 'skipped'
            test2.data = { reason: 'No user session' }
        }
        results.tests.push(test2)

        // Test 3: Call checkout endpoint
        const test3 = { name: 'Call Checkout Endpoint', status: 'pending', data: null }
        if (test2.status === 'passed' && test2.data) {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                const response = await fetch(`${request.headers.get('origin')}/api/stripe/create-checkout`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ tier: tier || 'pro' })
                })

                const data = await response.json()

                if (!response.ok) {
                    test3.status = 'failed'
                    test3.data = {
                        status: response.status,
                        error: data.error || 'Unknown error',
                        response: data
                    }
                } else {
                    test3.status = 'passed'
                    test3.data = {
                        has_url: !!data.url,
                        has_session_id: !!data.sessionId,
                        url_preview: data.url ? data.url.substring(0, 50) + '...' : null
                    }
                }
            } catch (error: any) {
                test3.status = 'failed'
                test3.data = { error: error.message }
            }
        } else {
            test3.status = 'skipped'
            test3.data = { reason: 'No session token' }
        }
        results.tests.push(test3)

        // Test 4: Check Stripe configuration
        const test4 = { name: 'Check Stripe Config', status: 'pending', data: null }
        test4.status = 'passed'
        test4.data = {
            has_secret_key: !!process.env.STRIPE_SECRET_KEY,
            has_publishable_key: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
            has_pro_price: !!process.env.STRIPE_PRICE_ID_PRO,
            has_unlimited_price: !!process.env.STRIPE_PRICE_ID_UNLIMITED,
            secret_key_preview: process.env.STRIPE_SECRET_KEY?.substring(0, 15) + '...',
            pro_price_id: process.env.STRIPE_PRICE_ID_PRO,
            unlimited_price_id: process.env.STRIPE_PRICE_ID_UNLIMITED
        }
        results.tests.push(test4)

        return NextResponse.json(results, { status: 200 })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
