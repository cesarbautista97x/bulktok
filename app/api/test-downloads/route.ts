import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Test endpoint to diagnose downloads page issues
 * Access at: http://localhost:3000/api/test-downloads
 */
export async function GET(request: NextRequest) {
    const results: any = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: { passed: 0, failed: 0 }
    }

    // Test 1: Check Supabase connection
    const test1 = { name: 'Supabase Connection', status: 'pending', details: {} }
    try {
        const { data, error } = await supabaseAdmin.from('videos').select('count').limit(1)
        if (error) {
            test1.status = 'failed'
            test1.details = { error: error.message }
            results.summary.failed++
        } else {
            test1.status = 'passed'
            test1.details = { message: 'Connected successfully' }
            results.summary.passed++
        }
    } catch (error: any) {
        test1.status = 'failed'
        test1.details = { error: error.message }
        results.summary.failed++
    }
    results.tests.push(test1)

    // Test 2: Count total videos in database
    const test2 = { name: 'Total Videos Count', status: 'pending', details: {} }
    try {
        const { count, error } = await supabaseAdmin
            .from('videos')
            .select('*', { count: 'exact', head: true })

        if (error) {
            test2.status = 'failed'
            test2.details = { error: error.message }
            results.summary.failed++
        } else {
            test2.status = 'passed'
            test2.details = { totalVideos: count }
            results.summary.passed++
        }
    } catch (error: any) {
        test2.status = 'failed'
        test2.details = { error: error.message }
        results.summary.failed++
    }
    results.tests.push(test2)

    // Test 3: Fetch all videos (no filter)
    const test3 = { name: 'Fetch All Videos', status: 'pending', details: {} }
    try {
        const { data, error } = await supabaseAdmin
            .from('videos')
            .select('id, user_id, status, created_at, image_name')
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            test3.status = 'failed'
            test3.details = { error: error.message }
            results.summary.failed++
        } else {
            test3.status = 'passed'
            test3.details = {
                count: data?.length || 0,
                videos: data?.map(v => ({
                    id: v.id,
                    user_id: v.user_id,
                    status: v.status,
                    image_name: v.image_name,
                    created_at: v.created_at
                }))
            }
            results.summary.passed++
        }
    } catch (error: any) {
        test3.status = 'failed'
        test3.details = { error: error.message }
        results.summary.failed++
    }
    results.tests.push(test3)

    // Test 4: Check for videos with null user_id
    const test4 = { name: 'Videos with NULL user_id', status: 'pending', details: {} }
    try {
        const { data, error } = await supabaseAdmin
            .from('videos')
            .select('id, status, created_at, image_name')
            .is('user_id', null)

        if (error) {
            test4.status = 'failed'
            test4.details = { error: error.message }
            results.summary.failed++
        } else {
            test4.status = 'passed'
            test4.details = {
                count: data?.length || 0,
                message: data?.length ? 'Found videos without user_id (generated while not logged in)' : 'No orphaned videos'
            }
            results.summary.passed++
        }
    } catch (error: any) {
        test4.status = 'failed'
        test4.details = { error: error.message }
        results.summary.failed++
    }
    results.tests.push(test4)

    // Test 5: Test /api/videos endpoint
    const test5 = { name: 'Videos API Endpoint', status: 'pending', details: {} }
    try {
        const baseUrl = request.url.replace('/api/test-downloads', '')
        const response = await fetch(`${baseUrl}/api/videos`)
        const data = await response.json()

        test5.status = response.ok ? 'passed' : 'failed'
        test5.details = {
            statusCode: response.status,
            response: data
        }

        if (response.ok) {
            results.summary.passed++
        } else {
            results.summary.failed++
        }
    } catch (error: any) {
        test5.status = 'failed'
        test5.details = { error: error.message }
        results.summary.failed++
    }
    results.tests.push(test5)

    // Test 6: Check profiles table
    const test6 = { name: 'User Profiles', status: 'pending', details: {} }
    try {
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .select('id, email, subscription_tier, videos_generated_this_month')
            .limit(5)

        if (error) {
            test6.status = 'failed'
            test6.details = { error: error.message }
            results.summary.failed++
        } else {
            test6.status = 'passed'
            test6.details = {
                profileCount: data?.length || 0,
                profiles: data?.map(p => ({
                    id: p.id,
                    email: p.email,
                    tier: p.subscription_tier,
                    videosGenerated: p.videos_generated_this_month
                }))
            }
            results.summary.passed++
        }
    } catch (error: any) {
        test6.status = 'failed'
        test6.details = { error: error.message }
        results.summary.failed++
    }
    results.tests.push(test6)

    return NextResponse.json(results, {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
