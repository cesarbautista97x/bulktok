import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Test Stripe checkout with real user data
 * GET /api/test-stripe-simple?email=laurapd1
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email') || 'laurapd1'

        const results: any = {
            timestamp: new Date().toISOString(),
            email_search: email,
            tests: []
        }

        // Test 1: Find user profile
        const test1 = { name: 'Find User Profile', status: 'pending', data: null }
        try {
            const { data: profiles, error } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .ilike('email', `%${email}%`)

            if (error) {
                test1.status = 'failed'
                test1.data = { error: error.message }
            } else if (!profiles || profiles.length === 0) {
                test1.status = 'failed'
                test1.data = { error: 'No profiles found' }
            } else {
                test1.status = 'passed'
                test1.data = {
                    count: profiles.length,
                    profiles: profiles.map(p => ({
                        id: p.id,
                        email: p.email,
                        tier: p.subscription_tier,
                        stripe_customer_id: p.stripe_customer_id
                    }))
                }
            }
        } catch (error: any) {
            test1.status = 'failed'
            test1.data = { error: error.message }
        }
        results.tests.push(test1)

        // Test 2: Try to create checkout session
        const test2 = { name: 'Create Checkout Session', status: 'pending', data: null }
        if (test1.status === 'passed' && test1.data?.profiles?.[0]) {
            const userId = test1.data.profiles[0].id

            try {
                const response = await fetch(`${request.headers.get('origin')}/api/stripe/create-checkout`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tier: 'pro',
                        userId
                    })
                })

                const data = await response.json()

                if (!response.ok) {
                    test2.status = 'failed'
                    test2.data = {
                        status: response.status,
                        error: data.error,
                        userId_used: userId
                    }
                } else {
                    test2.status = 'passed'
                    test2.data = {
                        has_url: !!data.url,
                        has_session_id: !!data.sessionId,
                        url_preview: data.url?.substring(0, 60) + '...'
                    }
                }
            } catch (error: any) {
                test2.status = 'failed'
                test2.data = { error: error.message }
            }
        } else {
            test2.status = 'skipped'
            test2.data = { reason: 'No user profile found' }
        }
        results.tests.push(test2)

        return NextResponse.json(results, { status: 200 })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
