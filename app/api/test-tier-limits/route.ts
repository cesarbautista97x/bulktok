import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Test tier limits end-to-end
 * POST /api/test-tier-limits with { email }
 */
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        const results: any = {
            timestamp: new Date().toISOString(),
            email,
            tests: []
        }

        // Test 1: Get user profile
        const test1 = { name: 'Get User Profile', status: 'pending', data: null }
        try {
            const { data, error } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .ilike('email', `%${email}%`)
                .single()

            if (error || !data) {
                test1.status = 'failed'
                test1.data = { error: error?.message || 'Profile not found' }
            } else {
                test1.status = 'passed'
                test1.data = {
                    id: data.id,
                    email: data.email,
                    tier: data.subscription_tier,
                    videos_generated: data.videos_generated_this_month,
                    has_api_key: !!data.hedra_api_key
                }
            }
        } catch (error: any) {
            test1.status = 'failed'
            test1.data = { error: error.message }
        }
        results.tests.push(test1)

        // Test 2: Simulate tier check
        const test2 = { name: 'Tier Limit Check', status: 'pending', data: null }
        if (test1.status === 'passed' && test1.data) {
            const TIER_LIMITS = { free: 5, pro: 300, unlimited: 999999 } as const
            const userTier = test1.data.tier as keyof typeof TIER_LIMITS
            const userLimit = TIER_LIMITS[userTier] || 5
            const currentUsage = test1.data.videos_generated || 0
            const videosToGenerate = 1

            test2.status = 'passed'
            test2.data = {
                tier: userTier,
                limit: userLimit,
                current_usage: currentUsage,
                videos_to_generate: videosToGenerate,
                new_total: currentUsage + videosToGenerate,
                would_exceed: currentUsage + videosToGenerate > userLimit,
                remaining: Math.max(0, userLimit - currentUsage)
            }
        } else {
            test2.status = 'skipped'
            test2.data = { reason: 'Profile not found' }
        }
        results.tests.push(test2)

        // Test 3: Try to increment counter
        const test3 = { name: 'Increment Counter', status: 'pending', data: null }
        if (test1.status === 'passed' && test1.data && test2.data && !test2.data.would_exceed) {
            try {
                const newCount = test2.data.new_total
                const { data, error } = await supabaseAdmin
                    .from('profiles')
                    .update({ videos_generated_this_month: newCount })
                    .eq('id', test1.data.id)
                    .select()
                    .single()

                if (error) {
                    test3.status = 'failed'
                    test3.data = { error: error.message }
                } else {
                    test3.status = 'passed'
                    test3.data = {
                        old_count: test2.data.current_usage,
                        new_count: data.videos_generated_this_month,
                        updated: true
                    }
                }
            } catch (error: any) {
                test3.status = 'failed'
                test3.data = { error: error.message }
            }
        } else {
            test3.status = 'skipped'
            test3.data = {
                reason: test2.data?.would_exceed ? 'Would exceed limit' : 'Profile not found'
            }
        }
        results.tests.push(test3)

        // Test 4: Verify counter was updated
        const test4 = { name: 'Verify Counter Update', status: 'pending', data: null }
        if (test3.status === 'passed' && test1.data) {
            try {
                const { data, error } = await supabaseAdmin
                    .from('profiles')
                    .select('videos_generated_this_month')
                    .eq('id', test1.data.id)
                    .single()

                if (error) {
                    test4.status = 'failed'
                    test4.data = { error: error.message }
                } else {
                    test4.status = 'passed'
                    test4.data = {
                        current_count: data.videos_generated_this_month,
                        matches_expected: data.videos_generated_this_month === test3.data.new_count
                    }
                }
            } catch (error: any) {
                test4.status = 'failed'
                test4.data = { error: error.message }
            }
        } else {
            test4.status = 'skipped'
            test4.data = { reason: 'Counter not incremented' }
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
